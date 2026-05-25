// Add to existing seed.js or create seedNotifications.js
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.seedNotifications = async () => {
  const users = await User.find({ isDeleted: false }).limit(5);

  const sampleNotifications = [
    {
      userId: users[0]?._id,
      type: 'request_update',
      title: 'Request Approved',
      message: 'Your birth certificate request has been approved.',
      priority: 'high',
      read: false,
    },
    {
      userId: users[1]?._id,
      type: 'approval_needed',
      title: 'New Request Pending',
      message: 'New marriage registration requires your review.',
      priority: 'normal',
      read: false,
    },
    {
      userId: users[0]?._id,
      type: 'system_alert',
      title: 'System Maintenance',
      message: 'Scheduled maintenance tonight at 2:00 AM.',
      priority: 'low',
      read: true,
      readAt: new Date(),
    },
  ];

  await Notification.insertMany(sampleNotifications);
  console.log('✅ Sample notifications seeded');
};