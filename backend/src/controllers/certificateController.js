const Notification = require('../models/Notification');
const { paginate } = require('../lib/pagination');

const getIo = () => {
  const app = require('../../server');
  return app.get('io');
};

exports.createNotification = async ({ userId, type, title, message, data = {}, priority = 'normal', sentVia = ['in_app'] }) => {
  try {
    const notification = await Notification.create({
      userId, type, title, message, data, priority, sentVia,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    const io = getIo();
    if (io) {
      io.to(`user_${userId}`).emit('notification', {
        _id: notification._id, type, title, message, priority, createdAt: notification.createdAt,
      });
    }
    return notification;
  } catch (err) {
    console.error('Create notification error:', err);
    return null;
  }
};

exports.bulkCreateNotifications = async (userIds, { type, title, message, data = {}, priority = 'normal' }) => {
  try {
    const notifications = userIds.map(userId => ({ userId, type, title, message, data, priority, createdAt: new Date() }));
    const created = await Notification.insertMany(notifications);
    const io = getIo();
    if (io) {
      created.forEach(n => io.to(`user_${n.userId}`).emit('notification', { _id: n._id, type, title, message, priority, createdAt: n.createdAt }));
    }
    return true;
  } catch (err) {
    console.error('Bulk create error:', err);
    return false;
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read, type } = req.query;
    const filter = { userId: req.user._id };
    if (read !== undefined) filter.read = read === 'true';
    if (type) filter.type = type;
    const { data, pagination } = await paginate(Notification, filter, { page: parseInt(page), limit: parseInt(limit), sort: '-createdAt' });
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false, isDeleted: false });
    res.json({ success: true, data, unreadCount, pagination });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isDeleted: false },
      { read: true, readAt: new Date() }, { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false, isDeleted: false }, { read: true, readAt: new Date() });
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id }, { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, read: false, isDeleted: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed' });
  }
};