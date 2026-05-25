const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { setAuthCookies, clearAuthCookies, getRefreshToken, USE_COOKIE_AUTH } = require('../lib/cookies');

// ── Password validation ──
const validatePassword = (password) => {
  const errors = [];
  const minLength = 8;

  if (!password || password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long.`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number.');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*).');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ── Generate tokens ──
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// ── POST /api/auth/register ──
exports.register = async (req, res) => {
  try {
    const { name, username, email, password, role = 'resident' } = req.body;

    // Validate inputs
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Password does not meet requirements.',
        errors: validation.errors,
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email or username already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
    });

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Store refresh token in DB
    user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    user.lastLogin = new Date();
    await user.save();

    const userObj = user.toJSON();

    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      accessToken: USE_COOKIE_AUTH ? undefined : accessToken,
      refreshToken: USE_COOKIE_AUTH ? undefined : refreshToken,
      user: userObj,
      cookieAuth: USE_COOKIE_AUTH,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// ── POST /api/auth/login ──
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/username and password are required.' });
    }

    // Find by email OR username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { username: identifier.toLowerCase().trim() },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check account lock
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(429).json({ message: 'Account temporarily locked. Try again later.' });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact your administrator.' });
    }

    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Store refresh token
    user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    await user.save();

    const userObj = user.toJSON();

    setAuthCookies(res, accessToken, refreshToken);
    res.json({
      success: true,
      accessToken: USE_COOKIE_AUTH ? undefined : accessToken,
      refreshToken: USE_COOKIE_AUTH ? undefined : refreshToken,
      user: userObj,
      cookieAuth: USE_COOKIE_AUTH,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// ── POST /api/auth/refresh ──
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = getRefreshToken(req);

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Check if refresh token exists in DB
    const tokenExists = user.refreshTokens.some((rt) => rt.token === refreshToken && rt.expiresAt > new Date());

    if (!tokenExists) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    setAuthCookies(res, accessToken, refreshToken);
    res.json({ success: true, accessToken: USE_COOKIE_AUTH ? undefined : accessToken, cookieAuth: USE_COOKIE_AUTH });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
};

// ── POST /api/auth/logout ──
exports.logout = async (req, res) => {
  try {
    const refreshToken = getRefreshToken(req);

    if (refreshToken && req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: { token: refreshToken } },
      });
    }

    clearAuthCookies(res);
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed.' });
  }
};

// ── GET /api/auth/me ──
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── POST /api/auth/change-password ──
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from current password.' });
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'New password does not meet requirements.',
        errors: validation.errors,
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Password change failed.' });
  }
};
