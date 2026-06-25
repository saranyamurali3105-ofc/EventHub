const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'event', 'registration', 'request', 'system'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['event_reminder', 'registration_update', 'request_update', 'system_update', 'achievement', 'general'],
    default: 'general'
  },
  relatedId: mongoose.Schema.Types.ObjectId, // Can reference Event, Registration, Request, etc.
  relatedModel: {
    type: String,
    enum: ['Event', 'Registration', 'Request', 'User']
  },
  data: mongoose.Schema.Types.Mixed, // Additional data for the notification
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: String,
  actionText: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  expiresAt: Date // For notifications that should auto-expire
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  
  // TODO: Add real-time notification via WebSocket/Socket.io
  // socketService.sendNotification(data.recipient, notification);
  
  // TODO: Send email if required
  // if (data.channels?.email) {
  //   emailService.sendNotificationEmail(notification);
  // }
  
  return notification;
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function(userId, notificationIds) {
  const result = await this.updateMany(
    { 
      recipient: userId, 
      _id: { $in: notificationIds }
    },
    { 
      read: true, 
      readAt: new Date() 
    }
  );
  return result;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ recipient: userId, read: false });
};

module.exports = mongoose.model('Notification', notificationSchema);