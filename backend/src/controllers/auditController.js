const AuditLog = require('../models/AuditLog');
const { parsePagination, sendList } = require('../lib/pagination');

// GET /api/audit
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, targetModel, search, from, to } = req.query;
    const { hasPage, page, limit, skip } = parsePagination(req.query, { defaultLimit: 50, maxLimit: 200 });

    const filter = {};
    if (action) filter.action = action;
    if (targetModel) filter.targetModel = targetModel;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    if (search) {
      filter.$or = [
        { performedByName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { targetModel: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await AuditLog.countDocuments(filter);
    let query = AuditLog.find(filter)
      .populate('performedBy', 'name role email')
      .sort({ createdAt: -1 });

    if (hasPage) query = query.skip(skip).limit(limit);

    const data = await query.lean();
    return sendList(res, { data, total, page, limit, hasPage: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/audit/summary — action counts for dashboard
exports.getAuditSummary = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [byAction, byModel, recentCount] = await Promise.all([
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: '$targetModel', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AuditLog.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    res.json({ success: true, data: { byAction, byModel, recentCount } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
