const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Achiever = require('../models/Achiever');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const achieverValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description is required (10-2000 characters)'),
  body('category').isIn(['Academic', 'Sports', 'Cultural', 'Technical', 'Research', 'Competition', 'Leadership', 'Community Service', 'Other']).withMessage('Valid category is required'),
  body('achievementType').isIn(['Award', 'Competition Win', 'Publication', 'Project', 'Recognition', 'Certification', 'Other']).withMessage('Valid achievement type is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('level').optional().isIn(['College', 'University', 'State', 'National', 'International']),
  body('position').optional().isIn(['Winner', '1st', '2nd', '3rd', 'Finalist', 'Participant', 'Other'])
];

// Get all achievements with filtering and pagination
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isIn(['Academic', 'Sports', 'Cultural', 'Technical', 'Research', 'Competition', 'Leadership', 'Community Service', 'Other']),
  query('level').optional().isIn(['College', 'University', 'State', 'National', 'International']),
  query('search').optional().trim(),
  query('featured').optional().isBoolean(),
  query('verified').optional().isBoolean()
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
      limit = 12,
      category,
      level,
      search,
      featured,
      verified,
      userId
    } = req.query;

    // Build query
    let query = { visibility: 'public' };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (featured !== undefined) query.featured = featured === 'true';
    if (verified !== undefined) query.verified = verified === 'true';
    if (userId) query.user = userId;

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const achievements = await Achiever.find(query)
      .populate('user', 'username profile.firstName profile.lastName profile.avatar profile.department')
      .populate('verifiedBy', 'username')
      .sort(search ? { score: { $meta: 'textScore' }, date: -1 } : { featured: -1, date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Achiever.countDocuments(query);

    // Add like status for authenticated users
    if (req.user) {
      achievements.forEach(achievement => {
        achievement.isLikedByUser = achievement.likes.some(
          like => like.user.toString() === req.user._id.toString()
        );
      });
    }

    res.json({
      achievements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Get single achievement by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const achievement = await Achiever.findById(req.params.id)
      .populate('user', 'username profile.firstName profile.lastName profile.avatar profile.department profile.year')
      .populate('verifiedBy', 'username')
      .populate('comments.user', 'username profile.firstName profile.lastName profile.avatar')
      .populate('likes.user', 'username profile.firstName profile.lastName');

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Check visibility
    if (achievement.visibility === 'private' && 
        (!req.user || (achievement.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Increment view count
    achievement.analytics.views += 1;
    await achievement.save();

    // Add user interaction status
    if (req.user) {
      achievement.isLikedByUser = achievement.isLikedBy(req.user._id);
    }

    res.json({ achievement });
  } catch (error) {
    console.error('Get achievement error:', error);
    res.status(500).json({ error: 'Failed to fetch achievement' });
  }
});

// Create new achievement
router.post('/', authenticate, achieverValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const achievementData = {
      ...req.body,
      user: req.user._id
    };

    const achievement = new Achiever(achievementData);
    await achievement.save();
    
    await achievement.populate('user', 'username profile.firstName profile.lastName profile.avatar');

    res.status(201).json({
      message: 'Achievement created successfully',
      achievement
    });
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({ error: 'Failed to create achievement' });
  }
});

// Update achievement
router.put('/:id', authenticate, achieverValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const achievement = await Achiever.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Check ownership or admin
    if (achievement.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to update this achievement' });
    }

    Object.assign(achievement, req.body);
    await achievement.save();
    
    await achievement.populate('user', 'username profile.firstName profile.lastName profile.avatar');

    res.json({
      message: 'Achievement updated successfully',
      achievement
    });
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({ error: 'Failed to update achievement' });
  }
});

// Delete achievement
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const achievement = await Achiever.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Check ownership or admin
    if (achievement.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this achievement' });
    }

    await Achiever.findByIdAndDelete(req.params.id);

    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
});

// Like/Unlike achievement
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const achievement = await Achiever.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const likeCount = await achievement.toggleLike(req.user._id);

    res.json({
      message: 'Like status updated',
      likeCount,
      isLiked: achievement.isLikedBy(req.user._id)
    });
  } catch (error) {
    console.error('Like achievement error:', error);
    res.status(500).json({ error: 'Failed to update like status' });
  }
});

// Add comment to achievement
router.post('/:id/comment', authenticate, [
  body('comment').trim().isLength({ min: 1, max: 500 }).withMessage('Comment is required (max 500 characters)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { comment } = req.body;
    const achievement = await Achiever.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const newComment = await achievement.addComment(req.user._id, comment);
    await achievement.populate('comments.user', 'username profile.firstName profile.lastName profile.avatar');

    res.json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete comment
router.delete('/:id/comment/:commentId', authenticate, async (req, res) => {
  try {
    const achievement = await Achiever.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const comment = achievement.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check ownership or admin
    if (comment.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    achievement.comments.pull(req.params.commentId);
    await achievement.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Admin: Feature/Unfeature achievement
router.put('/:id/feature', authenticate, requireAdmin, [
  body('featured').isBoolean().withMessage('Featured status must be boolean')
], async (req, res) => {
  try {
    const { featured } = req.body;
    
    const achievement = await Achiever.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    achievement.featured = featured;
    await achievement.save();

    // Create notification for user
    const Notification = require('../models/Notification');
    if (featured) {
      await Notification.createNotification({
        recipient: achievement.user,
        title: 'Achievement Featured!',
        message: `Your achievement "${achievement.title}" has been featured on the achievements page.`,
        type: 'success',
        category: 'achievement',
        relatedId: achievement._id,
        relatedModel: 'Achiever'
      });
    }

    res.json({
      message: `Achievement ${featured ? 'featured' : 'unfeatured'} successfully`,
      achievement
    });
  } catch (error) {
    console.error('Feature achievement error:', error);
    res.status(500).json({ error: 'Failed to update featured status' });
  }
});

// Admin: Verify/Unverify achievement
router.put('/:id/verify', authenticate, requireAdmin, [
  body('verified').isBoolean().withMessage('Verified status must be boolean')
], async (req, res) => {
  try {
    const { verified } = req.body;
    
    const achievement = await Achiever.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    achievement.verified = verified;
    
    if (verified) {
      achievement.verifiedBy = req.user._id;
      achievement.verifiedAt = new Date();
    } else {
      achievement.verifiedBy = undefined;
      achievement.verifiedAt = undefined;
    }
    
    await achievement.save();

    // Create notification for user
    const Notification = require('../models/Notification');
    await Notification.createNotification({
      recipient: achievement.user,
      title: `Achievement ${verified ? 'Verified' : 'Unverified'}`,
      message: `Your achievement "${achievement.title}" has been ${verified ? 'verified' : 'unverified'}.`,
      type: verified ? 'success' : 'info',
      category: 'achievement',
      relatedId: achievement._id,
      relatedModel: 'Achiever'
    });

    res.json({
      message: `Achievement ${verified ? 'verified' : 'unverified'} successfully`,
      achievement
    });
  } catch (error) {
    console.error('Verify achievement error:', error);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
});

// Get achievement statistics
router.get('/stats/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await Achiever.aggregate([
      {
        $group: {
          _id: { category: '$category', level: '$level' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          levels: {
            $push: {
              level: '$_id.level',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      }
    ]);

    const topAchievers = await Achiever.aggregate([
      {
        $group: {
          _id: '$user',
          achievementCount: { $sum: 1 },
          totalLikes: { $sum: { $size: '$likes' } },
          totalViews: { $sum: '$analytics.views' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $sort: { achievementCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const monthlyTrend = await Achiever.aggregate([
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
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      categoryStats: stats,
      topAchievers,
      monthlyTrend
    });
  } catch (error) {
    console.error('Get achievement stats error:', error);
    res.status(500).json({ error: 'Failed to get achievement statistics' });
  }
});

module.exports = router;