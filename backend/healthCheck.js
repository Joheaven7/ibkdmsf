// Add to server.js or create separate route
const mongoose = require('mongoose');

exports.healthCheck = async (req, res) => {
  const checks = {
    database: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
    api: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  const status = checks.database === 'healthy' ? 200 : 503;
  res.status(status).json({
    status: checks.database === 'healthy' ? 'healthy' : 'degraded',
    checks,
    version: process.env.npm_package_version || '1.0.0',
  });
};