const USE_COOKIE_AUTH = process.env.USE_COOKIE_AUTH === 'true';
const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  path: '/',
};

function setAuthCookies(res, accessToken, refreshToken) {
  if (!USE_COOKIE_AUTH) return;
  res.cookie('ibkdms_access', accessToken, {
    ...COOKIE_OPTS,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('ibkdms_refresh', refreshToken, {
    ...COOKIE_OPTS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res) {
  if (!USE_COOKIE_AUTH) return;
  res.clearCookie('ibkdms_access', { path: '/' });
  res.clearCookie('ibkdms_refresh', { path: '/' });
}

function getAccessToken(req) {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (USE_COOKIE_AUTH && req.cookies?.ibkdms_access) {
    return req.cookies.ibkdms_access;
  }
  return null;
}

function getRefreshToken(req) {
  if (req.body?.refreshToken) return req.body.refreshToken;
  if (USE_COOKIE_AUTH && req.cookies?.ibkdms_refresh) {
    return req.cookies.ibkdms_refresh;
  }
  return null;
}

module.exports = {
  USE_COOKIE_AUTH,
  setAuthCookies,
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
};
