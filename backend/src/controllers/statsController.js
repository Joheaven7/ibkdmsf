const Resident = require('../models/Resident');
const Request = require('../models/Request');
const Marriage = require('../models/Marriage');
const Divorce = require('../models/Divorce');
const Migration = require('../models/Migration');
const VitalEvent = require('../models/VitalEvent');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

exports.getStats = async (req, res) => {
  try {
    const { kebele, startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const kebeleFilter = kebele ? { kebele } : {};

    // Run all counts in parallel for performance
    const [
      totalResidents,
      totalUsers,
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalMarriages,
      pendingMarriages,
      totalDivorces,
      pendingDivorces,
      totalMigrations,
      pendingMigrations,
      totalVitalEvents,
      totalCertificates,
      // Weekly comparison data
      lastWeekResidents,
      lastWeekPending,
      lastWeekApproved,
    ] = await Promise.all([
      Resident.countDocuments({ ...kebeleFilter, isDeleted: false, ...dateFilter }),
      User.countDocuments({ role: { $in: ['clerk', 'admin'] }, isDeleted: false }),
      Request.countDocuments({ ...kebeleFilter, isDeleted: false, ...dateFilter }),
      Request.countDocuments({ ...kebeleFilter, status: 'pending', isDeleted: false }),
      Request.countDocuments({ ...kebeleFilter, status: 'approved', isDeleted: false, ...dateFilter }),
      Request.countDocuments({ ...kebeleFilter, status: 'rejected', isDeleted: false, ...dateFilter }),
      Marriage.countDocuments({ ...kebeleFilter, isDeleted: false, ...dateFilter }),
      Marriage.countDocuments({ ...kebeleFilter, status: 'pending', isDeleted: false }),
      Divorce.countDocuments({ ...kebeleFilter, isDeleted: false, ...dateFilter }),
      Divorce.countDocuments({ ...kebeleFilter, status: 'pending', isDeleted: false }),
      Migration.countDocuments({ ...kebeleFilter, isDeleted: false, ...dateFilter }),
      Migration.countDocuments({ ...kebeleFilter, status: 'pending', isDeleted: false }),
      VitalEvent.countDocuments({ ...kebeleFilter, isDeleted: false, ...dateFilter }),
      Certificate.countDocuments({ ...kebeleFilter, isDeleted: false, ...dateFilter }),
      // Last week comparison
      Resident.countDocuments({
        ...kebeleFilter,
        isDeleted: false,
        createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      Request.countDocuments({
        ...kebeleFilter,
        status: 'pending',
        isDeleted: false,
        createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      Request.countDocuments({
        ...kebeleFilter,
        status: 'approved',
        isDeleted: false,
        createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
    ]);

    // Get request type distribution
    const requestTypes = await Request.aggregate([
      { $match: { ...kebeleFilter, isDeleted: false, ...dateFilter } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Request.aggregate([
      { $match: { ...kebeleFilter, isDeleted: false, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Clerk performance
    const clerkPerformance = await Request.aggregate([
      { $match: { ...kebeleFilter, isDeleted: false, status: { $in: ['approved', 'rejected'] } } },
      {
        $group: {
          _id: '$processedBy',
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalResidents,
        totalUsers,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalMarriages,
        pendingMarriages,
        totalDivorces,
        pendingDivorces,
        totalMigrations,
        pendingMigrations,
        totalVitalEvents,
        totalCertificates,
        lastWeekResidents,
        lastWeekPending,
        lastWeekApproved,
        requestTypes: requestTypes.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        monthlyTrend,
        clerkPerformance,
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to load statistics' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const { kebele } = req.query;
    const kebeleFilter = kebele ? { kebele } : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    const [
      todayResidents,
      todayRequests,
      todayVitalEvents,
      weekResidents,
      weekRequests,
      monthResidents,
      monthRequests,
    ] = await Promise.all([
      Resident.countDocuments({ ...kebeleFilter, isDeleted: false, createdAt: { $gte: today } }),
      Request.countDocuments({ ...kebeleFilter, isDeleted: false, createdAt: { $gte: today } }),
      VitalEvent.countDocuments({ ...kebeleFilter, isDeleted: false, createdAt: { $gte: today } }),
      Resident.countDocuments({ ...kebeleFilter, isDeleted: false, createdAt: { $gte: thisWeek } }),
      Request.countDocuments({ ...kebeleFilter, isDeleted: false, createdAt: { $gte: thisWeek } }),
      Resident.countDocuments({ ...kebeleFilter, isDeleted: false, createdAt: { $gte: thisMonth } }),
      Request.countDocuments({ ...kebeleFilter, isDeleted: false, createdAt: { $gte: thisMonth } }),
    ]);

    res.json({
      success: true,
      data: {
        today: { residents: todayResidents, requests: todayRequests, vitalEvents: todayVitalEvents },
        thisWeek: { residents: weekResidents, requests: weekRequests },
        thisMonth: { residents: monthResidents, requests: monthRequests },
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard statistics' });
  }
};