const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Video = require('../models/Video');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const videoValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('url').isURL().withMessage('Valid URL is required'),
  body('category').isIn(['Educational', 'Event Highlights', 'Tutorials', 'Seminars', 'Workshops', 'Cultural', 'Sports', 'Technical', 'Other']).withMessage('Valid category is required'),
  body('department').optional().isIn(['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics', 'All']),
  body('platform').optional().isIn(['youtube', 'vimeo', 'direct', 'other'])
];

// Get all videos with filtering and pagination
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isIn(['Educational', 'Event Highlights', 'Tutorials', 'Seminars', 'Workshops', 'Cultural', 'Sports', 'Technical', 'Other']),
  query('department').optional().isIn(['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics', 'All']),
  query('search').optional().trim(),
  query('featured').optional().isBoolean()
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
      department,
      search,
      featured
    } = req.query;

    // Build query
    let query = { published: true };
    
    if (category) query.category = category;
    if (department && department !== 'All') {
      query.department = { $in: [department, 'All'] };
    }
    if (featured !== undefined) query.featured = featured === 'true';

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const videos = await Video.find(query)
      .populate('uploader', 'username profile.firstName profile.lastName profile.avatar')
      .populate('relatedEvent', 'title date')
      .sort(search ? { score: { $meta: 'textScore' }, views: -1 } : { featured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Video.countDocuments(query);

    // Add like status and enhance video data
    videos.forEach(video => {
      // Add thumbnail URL
      video.thumbnailUrl = video.thumbnail || getThumbnailUrl(video.url, video.platform);
      
      // Add like status for authenticated users
      if (req.user) {
        video.isLikedByUser = video.likes.some(
          like => like.user.toString() === req.user._id.toString()
        );
      }
    });

    res.json({
      videos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get single video by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('uploader', 'username profile.firstName profile.lastName profile.avatar profile.department')
      .populate('relatedEvent', 'title date time location')
      .populate('comments.user', 'username profile.firstName profile.lastName profile.avatar')
      .populate('comments.replies.user', 'username profile.firstName profile.lastName profile.avatar')
      .populate('likes.user', 'username profile.firstName profile.lastName');

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (!video.published && (!req.user || !req.user.isAdmin)) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Increment view count
    await video.incrementViews();

    // Add user interaction status
    if (req.user) {
      video.isLikedByUser = video.isLikedBy(req.user._id);
    }

    // Add enhanced data
    video.thumbnailUrl = video.getThumbnailUrl();
    video.videoId = video.getVideoId();

    res.json({ video });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Create new video
router.post('/', authenticate, videoValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Detect platform from URL
    const platform = detectPlatform(req.body.url);
    
    const videoData = {
      ...req.body,
      uploader: req.user._id,
      platform,
      publishedAt: new Date()
    };

    const video = new Video(videoData);
    await video.save();
    
    await video.populate('uploader', 'username profile.firstName profile.lastName profile.avatar');

    res.status(201).json({
      message: 'Video created successfully',
      video
    });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ error: 'Failed to create video' });
  }
});

// Update video
router.put('/:id', authenticate, videoValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check ownership or admin
    if (video.uploader.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to update this video' });
    }

    // Update platform if URL changed
    if (req.body.url && req.body.url !== video.url) {
      req.body.platform = detectPlatform(req.body.url);
    }

    Object.assign(video, req.body);
    await video.save();
    
    await video.populate('uploader', 'username profile.firstName profile.lastName profile.avatar');

    res.json({
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete video
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check ownership or admin
    if (video.uploader.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this video' });
    }

    await Video.findByIdAndDelete(req.params.id);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Like/Unlike video
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const likeCount = await video.toggleLike(req.user._id);

    res.json({
      message: 'Like status updated',
      likeCount,
      isLiked: video.isLikedBy(req.user._id)
    });
  } catch (error) {
    console.error('Like video error:', error);
    res.status(500).json({ error: 'Failed to update like status' });
  }
});

// Add comment to video
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
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    video.comments.push({
      user: req.user._id,
      comment
    });

    await video.save();
    await video.populate('comments.user', 'username profile.firstName profile.lastName profile.avatar');

    const newComment = video.comments[video.comments.length - 1];

    res.json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Reply to comment
router.post('/:id/comment/:commentId/reply', authenticate, [
  body('reply').trim().isLength({ min: 1, max: 500 }).withMessage('Reply is required (max 500 characters)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { reply } = req.body;
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const comment = video.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.replies.push({
      user: req.user._id,
      reply
    });

    await video.save();
    await video.populate('comments.replies.user', 'username profile.firstName profile.lastName profile.avatar');

    const newReply = comment.replies[comment.replies.length - 1];

    res.json({
      message: 'Reply added successfully',
      reply: newReply
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Admin: Feature/Unfeature video
router.put('/:id/feature', authenticate, requireAdmin, [
  body('featured').isBoolean().withMessage('Featured status must be boolean')
], async (req, res) => {
  try {
    const { featured } = req.body;
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    video.featured = featured;
    await video.save();

    res.json({
      message: `Video ${featured ? 'featured' : 'unfeatured'} successfully`,
      video
    });
  } catch (error) {
    console.error('Feature video error:', error);
    res.status(500).json({ error: 'Failed to update featured status' });
  }
});

// Admin: Publish/Unpublish video
router.put('/:id/publish', authenticate, requireAdmin, [
  body('published').isBoolean().withMessage('Published status must be boolean')
], async (req, res) => {
  try {
    const { published } = req.body;
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    video.published = published;
    if (published && !video.publishedAt) {
      video.publishedAt = new Date();
    }
    
    await video.save();

    res.json({
      message: `Video ${published ? 'published' : 'unpublished'} successfully`,
      video
    });
  } catch (error) {
    console.error('Publish video error:', error);
    res.status(500).json({ error: 'Failed to update published status' });
  }
});

// Get video statistics
router.get('/stats/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await Video.aggregate([
      {
        $group: {
          _id: { category: '$category', department: '$department' },
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          departments: {
            $push: {
              department: '$_id.department',
              count: '$count',
              views: '$totalViews',
              likes: '$totalLikes'
            }
          },
          total: { $sum: '$count' },
          totalViews: { $sum: '$totalViews' },
          totalLikes: { $sum: '$totalLikes' }
        }
      }
    ]);

    const topVideos = await Video.find({ published: true })
      .populate('uploader', 'username')
      .sort({ views: -1 })
      .limit(10)
      .select('title views likes uploader createdAt');

    const monthlyUploadTrend = await Video.aggregate([
      {
        $match: {
          publishedAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$publishedAt' },
            month: { $month: '$publishedAt' }
          },
          count: { $sum: 1 },
          views: { $sum: '$views' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      categoryStats: stats,
      topVideos,
      monthlyUploadTrend
    });
  } catch (error) {
    console.error('Get video stats error:', error);
    res.status(500).json({ error: 'Failed to get video statistics' });
  }
});

// Helper functions
function detectPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  return 'other';
}

function getThumbnailUrl(url, platform) {
  if (platform === 'youtube') {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
  }
  return null;
}

module.exports = router;