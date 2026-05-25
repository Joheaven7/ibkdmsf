const AuditLog = require('../models/AuditLog');

exports.logAction = (action, targetModel) => async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = async (body) => {
    if (res.statusCode < 400 && req.user) {
      try {
        await AuditLog.create({
          action,
          performedBy:     req.user._id,
          performedByName: req.user.name,
          targetModel,
          targetId:        body?.data?._id ?? req.params?.id,
          previousStatus:  req.body?.previousStatus ?? body?.data?.previousStatus ?? '',
          newStatus:       body?.data?.status ?? req.body?.status ?? '',
          description:     body?.data?.description ?? `${action} on ${targetModel}`,
          ip:              req.ip,
        });
      } catch (e) {
        console.error('Audit log error:', e.message);
      }
    }
    return originalJson(body);
  };
  next();
};