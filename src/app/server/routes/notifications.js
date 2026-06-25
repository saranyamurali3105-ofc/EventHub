const express = require('express');
const { body, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get user's notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      read, 
      type, 
      category 
    } = req.query;

    let query = { recipient: req.user._id };
    
    if (read !== undefined) {
      query.read = read === 'true';
    }
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('relatedId');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark notifications as read
router.put('/mark-read', authenticate, [
  body('notificationIds').isArray().withMessage('Notification IDs must be an array'),
  body('notificationIds.*').isMongoId().withMessage('Each notification ID must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { notificationIds } = req.body;

    const result = await Notification.markAsRead(req.user._id, notificationIds);

    res.json({
      message: 'Notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticate, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check ownership
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Clear old notifications (older than 30 days)
router.delete('/clear-old', authenticate, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      recipient: req.user._id,
      read: true,
      createdAt: { $lt: thirtyDaysAgo }
    });

    res.json({
      message: 'Old notifications cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear old notifications error:', error);
    res.status(500).json({ error: 'Failed to clear old notifications' });
  }
});

// Admin: Create notification for users
router.post('/broadcast', authenticate, requireAdmin, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message is required'),
  body('type').optional().isIn(['info', 'success', 'warning', 'error', 'event', 'registration', 'request', 'system']),
  body('category').optional().isIn(['event_reminder', 'registration_update', 'request_update', 'system_update', 'achievement', 'general']),
  body('recipients').optional().isArray().withMessage('Recipients must be an array'),
  body('department').optional().isIn(['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics', 'All']),
  body('priority').optional().isIn(['low', 'medium', 'high'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      title,
      message,
      type = 'info',
      category = 'general',
      recipients,
      department,
      priority = 'medium',
      actionUrl,
      actionText,
      channels
    } = req.body;

    let targetUsers = [];

    if (recipients && recipients.length > 0) {
      // Send to specific users
      targetUsers = recipients;
    } else if (department && department !== 'All') {
      // Send to users in specific department
      const User = require('../models/User');
      const users = await User.find({ 
        'profile.department': department,
        isActive: true 
      }).select('_id');
      targetUsers = users.map(user => user._id);
    } else {
      // Send to all active users
      const User = require('../models/User');
      const users = await User.find({ isActive: true }).select('_id');
      targetUsers = users.map(user => user._id);
    }

    // Create notifications for all target users
    const notifications = targetUsers.map(userId => ({
      recipient: userId,
      title,
      message,
      type,
      category,
      priority,
      actionUrl,
      actionText,
      channels: channels || { inApp: true }
    }));

    await Notification.insertMany(notifications);

    res.json({
      message: 'Broadcast notification sent successfully',
      recipientCount: targetUsers.length
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ error: 'Failed to send broadcast notification' });
  }
});

// Admin: Get notification statistics
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: { type: '$type', read: '$read' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          total: { $sum: '$count' },
          read: {
            $sum: {
              $cond: [{ $eq: ['$_id.read', true] }, '$count', 0]
            }
          },
          unread: {
            $sum: {
              $cond: [{ $eq: ['$_id.read', false] }, '$count', 0]
            }
          }
        }
      }
    ]);

    const dailyTrend = await Notification.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    const categoryBreakdown = await Notification.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      typeStats: stats,
      dailyTrend,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Failed to get notification statistics' });
  }
});

// Get notification preferences
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).select('preferences');
    
    res.json({
      preferences: user.preferences || {
        emailNotifications: true,
        eventReminders: true,
        newsletter: false
      }
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Failed to get notification preferences' });
  }
});

// Update notification preferences
router.put('/preferences', authenticate, [
  body('emailNotifications').optional().isBoolean(),
  body('eventReminders').optional().isBoolean(),
  body('newsletter').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    user.preferences = {
      ...user.preferences,
      ...req.body
    };
    
    await user.save();

    res.json({
      message: 'Notification preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

module.exports = router;