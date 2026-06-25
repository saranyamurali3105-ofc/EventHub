const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Achiever = require('../models/Achiever');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get user profile by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's public achievements
    const achievements = await Achiever.find({ 
      user: user._id, 
      visibility: { $in: ['public', 'department'] }
    })
    .sort({ featured: -1, date: -1 })
    .limit(6)
    .select('title category level date featured verified');

    // Get user's created events (if admin or own profile)
    let createdEvents = [];
    if (req.user.isAdmin || req.user._id.toString() === user._id.toString()) {
      createdEvents = await Event.find({ organizer: user._id })
        .sort({ date: -1 })
        .limit(5)
        .select('title date status registrationCount');
    }

    // Get user's registrations (if admin or own profile)
    let registrations = [];
    if (req.user.isAdmin || req.user._id.toString() === user._id.toString()) {
      registrations = await Registration.find({ user: user._id })
        .populate('event', 'title date status')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('event status createdAt');
    }

    res.json({
      user: {
        ...user,
        achievements,
        createdEvents,
        registrations
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get users list (admin only)
router.get('/', authenticate, requireAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('department').optional().isIn(['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics']),
  query('isAdmin').optional().isBoolean(),
  query('isActive').optional().isBoolean()
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
      page = 1,
      limit = 20,
      search,
      department,
      isAdmin,
      isActive
    } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) query['profile.department'] = department;
    if (isAdmin !== undefined) query.isAdmin = isAdmin === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user profile (own profile or admin)
router.put('/:id/profile', authenticate, [
  body('profile.firstName').optional().trim().isLength({ max: 50 }),
  body('profile.lastName').optional().trim().isLength({ max: 50 }),
  body('profile.phone').optional().trim().isMobilePhone(),
  body('profile.department').optional().isIn(['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics']),
  body('profile.year').optional().isIn(['1st', '2nd', '3rd', '4th']),
  body('profile.bio').optional().trim().isLength({ max: 500 }),
  body('profile.registerNumber').optional().trim().isLength({ max: 20 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.params.id;
    
    // Check if user can update this profile
    if (userId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update profile
    if (req.body.profile) {
      user.profile = { ...user.profile, ...req.body.profile };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update user avatar
router.put('/:id/avatar', authenticate, [
  body('avatar').isURL().withMessage('Valid avatar URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.params.id;
    
    // Check if user can update this avatar
    if (userId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.profile.avatar = req.body.avatar;
    await user.save();

    res.json({
      message: 'Avatar updated successfully',
      avatar: user.profile.avatar
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// Get user's dashboard data
router.get('/:id/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user can access this dashboard
    if (userId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent registrations
    const recentRegistrations = await Registration.find({ user: userId })
      .populate('event', 'title date time location status')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get created events (if any)
    const createdEvents = await Event.find({ organizer: userId })
      .sort({ date: -1 })
      .limit(5)
      .select('title date status registrationCount');

    // Get recent achievements
    const recentAchievements = await Achiever.find({ user: userId })
      .sort({ date: -1 })
      .limit(3)
      .select('title category level date verified featured');

    // Calculate upcoming events user is registered for
    const upcomingEvents = await Registration.find({
      user: userId,
      status: 'approved'
    })
    .populate({
      path: 'event',
      match: { date: { $gte: new Date() } },
      select: 'title date time location'
    })
    .sort({ 'event.date': 1 })
    .limit(5);

    // Filter out null events (past events)
    const filteredUpcomingEvents = upcomingEvents.filter(reg => reg.event);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        stats: user.stats,
        preferences: user.preferences
      },
      recentRegistrations,
      createdEvents,
      recentAchievements,
      upcomingEvents: filteredUpcomingEvents
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Admin: Update user status
router.put('/:id/status', authenticate, requireAdmin, [
  body('isActive').isBoolean().withMessage('Active status must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { isActive } = req.body;
    const userId = req.params.id;

    // Prevent deactivating own account
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    // Create notification for user
    const Notification = require('../models/Notification');
    await Notification.createNotification({
      recipient: userId,
      title: `Account ${isActive ? 'Activated' : 'Deactivated'}`,
      message: `Your account has been ${isActive ? 'activated' : 'deactivated'} by an administrator.`,
      type: isActive ? 'success' : 'warning',
      category: 'system_update',
      priority: 'high'
    });

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Admin: Promote/Demote user
router.put('/:id/admin', authenticate, requireAdmin, [
  body('isAdmin').isBoolean().withMessage('Admin status must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { isAdmin } = req.body;
    const userId = req.params.id;

    // Prevent removing own admin status
    if (userId === req.user._id.toString() && !isAdmin) {
      return res.status(400).json({ error: 'Cannot remove your own admin privileges' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isAdmin = isAdmin;
    await user.save();

    // Create notification for user
    const Notification = require('../models/Notification');
    await Notification.createNotification({
      recipient: userId,
      title: `Admin Status ${isAdmin ? 'Granted' : 'Removed'}`,
      message: `You have been ${isAdmin ? 'granted' : 'removed from'} admin privileges.`,
      type: isAdmin ? 'success' : 'info',
      category: 'system_update',
      priority: 'high'
    });

    res.json({
      message: `User ${isAdmin ? 'promoted to' : 'demoted from'} admin successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({ error: 'Failed to update admin status' });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ isAdmin: true });

    const departmentStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$profile.department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const registrationTrend = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const topActiveUsers = await User.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          totalActivity: {
            $add: [
              '$stats.eventsAttended',
              '$stats.eventsCreated',
              '$stats.certificatesEarned'
            ]
          }
        }
      },
      { $sort: { totalActivity: -1 } },
      { $limit: 10 },
      {
        $project: {
          username: 1,
          'profile.firstName': 1,
          'profile.lastName': 1,
          'profile.department': 1,
          stats: 1,
          totalActivity: 1
        }
      }
    ]);

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        adminUsers,
        inactiveUsers: totalUsers - activeUsers
      },
      departmentStats,
      registrationTrend,
      topActiveUsers
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user statistics' });
  }
});

// Delete user account (admin only or own account)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check permissions
    if (userId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Prevent admin from deleting own account
    if (userId === req.user._id.toString() && req.user.isAdmin) {
      return res.status(400).json({ error: 'Admin cannot delete own account' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has any active events
    const activeEvents = await Event.countDocuments({ 
      organizer: userId, 
      status: { $in: ['published', 'draft'] }
    });

    if (activeEvents > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with active events. Please transfer or cancel events first.' 
      });
    }

    // Soft delete: deactivate instead of deleting
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.username = `deleted_${Date.now()}_${user.username}`;
    await user.save();

    res.json({ message: 'User account deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user account' });
  }
});

module.exports = router;