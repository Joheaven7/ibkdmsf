const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { parsePagination, sendList } = require('../lib/pagination');

// GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const { hasPage, page, limit, skip } = parsePagination(req.query, { defaultLimit: 25, maxLimit: 100 });
    const filter = {};
    if (req.user.role === 'admin') filter.role = { $ne: 'superadmin' };
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    let query = User.find(filter).sort({ createdAt: -1 });
    if (hasPage) query = query.skip(skip).limit(limit);

    const data = await query;
    return sendList(res, { data, total, page, limit, hasPage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, username, email, password, role, phone, kebele } = req.body;

    // Admin cannot create superadmin
    if (req.user.role === 'admin' && role === 'superadmin') {
      return res.status(403).json({ message: 'Admins cannot create superadmin accounts.' });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({ message: 'Email or username already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash(password, salt);

    const user = await User.create({
      name, username, email, password: hashedPw, role,
      phone: phone || '', kebele: kebele || '03', status: 'active',
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, kebele, role, status } = req.body;

    // Admin cannot promote to superadmin
    if (req.user.role === 'admin' && role === 'superadmin') {
      return res.status(403).json({ message: 'Admins cannot assign superadmin role.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, kebele, role, status },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/:id/status
exports.toggleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/:id/role
exports.changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (req.user.role === 'admin' && role === 'superadmin') {
      return res.status(403).json({ message: 'Admins cannot assign superadmin role.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, { role }, { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    // Cannot delete yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/:id/permissions
exports.setPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, { permissions }, { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/me
exports.updateMe = async (req, res) => {
  try {
    const { name, email, phone, kebele } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id, { name, email, phone, kebele }, { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/:id/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    const user = await User.findByIdAndUpdate(
      req.params.id, { password: hashed }, { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};