const express = require('express');
const { body, validationResult, query } = require('express-validator');
const FAQ = require('../models/FAQ');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const faqValidation = [
  body('question').trim().isLength({ min: 5, max: 500 }).withMessage('Question is required (5-500 characters)'),
  body('answer').trim().isLength({ min: 10, max: 2000 }).withMessage('Answer is required (10-2000 characters)'),
  body('category').isIn(['General', 'Events', 'Registration', 'Certificates', 'Technical', 'Account', 'Policies', 'Other']).withMessage('Valid category is required'),
  body('department').optional().isIn(['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics', 'All'])
];

// Get all FAQs with filtering and pagination
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isIn(['General', 'Events', 'Registration', 'Certificates', 'Technical', 'Account', 'Policies', 'Other']),
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
      limit = 20,
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
    const faqs = await FAQ.find(query)
      .populate('author', 'username profile.firstName profile.lastName')
      .populate('relatedFAQs', 'question')
      .sort(search ? { score: { $meta: 'textScore' }, featured: -1, order: 1 } : { featured: -1, order: 1, views: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await FAQ.countDocuments(query);

    // Add helpfulness data
    faqs.forEach(faq => {
      const helpful = faq.helpful || [];
      faq.helpfulCount = helpful.filter(h => h.helpful === true).length;
      faq.notHelpfulCount = helpful.filter(h => h.helpful === false).length;
      faq.helpfulnessRatio = helpful.length > 0 ? faq.helpfulCount / helpful.length : 0;
      
      // Check if user has rated this FAQ
      if (req.user) {
        const userRating = helpful.find(h => h.user.toString() === req.user._id.toString());
        faq.userRating = userRating ? userRating.helpful : null;
      }
    });

    res.json({
      faqs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

// Get single FAQ by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('relatedFAQs', 'question category')
      .populate('helpful.user', 'username profile.firstName profile.lastName');

    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    if (!faq.published && (!req.user || !req.user.isAdmin)) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    // Increment view count
    await faq.incrementViews();

    // Add user rating status
    if (req.user) {
      const userRating = faq.helpful.find(h => h.user._id.toString() === req.user._id.toString());
      faq.userRating = userRating ? userRating.helpful : null;
    }

    res.json({ faq });
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({ error: 'Failed to fetch FAQ' });
  }
});

// Search FAQs
router.get('/search/:query', optionalAuth, async (req, res) => {
  try {
    const { query } = req.params;
    const { department, category, limit = 10 } = req.query;

    let filters = {};
    if (department && department !== 'All') {
      filters.department = { $in: [department, 'All'] };
    }
    if (category) {
      filters.category = category;
    }

    const faqs = await FAQ.search(query, filters)
      .limit(parseInt(limit))
      .populate('author', 'username');

    res.json({ 
      faqs,
      searchQuery: query,
      resultCount: faqs.length
    });
  } catch (error) {
    console.error('Search FAQs error:', error);
    res.status(500).json({ error: 'Failed to search FAQs' });
  }
});

// Get popular FAQs
router.get('/popular/list', optionalAuth, async (req, res) => {
  try {
    const { limit = 10, department } = req.query;

    let query = { published: true };
    if (department && department !== 'All') {
      query.department = { $in: [department, 'All'] };
    }

    const faqs = await FAQ.find(query)
      .populate('author', 'username')
      .sort({ views: -1, helpful: -1 })
      .limit(parseInt(limit));

    res.json({ faqs });
  } catch (error) {
    console.error('Get popular FAQs error:', error);
    res.status(500).json({ error: 'Failed to fetch popular FAQs' });
  }
});

// Create new FAQ (admin only)
router.post('/', authenticate, requireAdmin, faqValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const faqData = {
      ...req.body,
      author: req.user._id,
      lastUpdated: new Date()
    };

    const faq = new FAQ(faqData);
    await faq.save();
    
    await faq.populate('author', 'username profile.firstName profile.lastName');

    res.status(201).json({
      message: 'FAQ created successfully',
      faq
    });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

// Update FAQ (admin only)
router.put('/:id', authenticate, requireAdmin, faqValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    // Update FAQ and increment version
    Object.assign(faq, req.body);
    faq.lastUpdated = new Date();
    faq.version += 1;
    
    await faq.save();
    await faq.populate('author', 'username profile.firstName profile.lastName');

    res.json({
      message: 'FAQ updated successfully',
      faq
    });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

// Delete FAQ (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    await FAQ.findByIdAndDelete(req.params.id);

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

// Mark FAQ as helpful/not helpful
router.post('/:id/helpful', authenticate, [
  body('helpful').isBoolean().withMessage('Helpful status must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { helpful } = req.body;
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    const result = await faq.markHelpful(req.user._id, helpful);

    res.json({
      message: 'Rating submitted successfully',
      ...result,
      userRating: helpful
    });
  } catch (error) {
    console.error('Rate FAQ error:', error);
    res.status(500).json({ error: 'Failed to rate FAQ' });
  }
});

// Admin: Feature/Unfeature FAQ
router.put('/:id/feature', authenticate, requireAdmin, [
  body('featured').isBoolean().withMessage('Featured status must be boolean')
], async (req, res) => {
  try {
    const { featured } = req.body;
    
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    faq.featured = featured;
    await faq.save();

    res.json({
      message: `FAQ ${featured ? 'featured' : 'unfeatured'} successfully`,
      faq
    });
  } catch (error) {
    console.error('Feature FAQ error:', error);
    res.status(500).json({ error: 'Failed to update featured status' });
  }
});

// Admin: Publish/Unpublish FAQ
router.put('/:id/publish', authenticate, requireAdmin, [
  body('published').isBoolean().withMessage('Published status must be boolean')
], async (req, res) => {
  try {
    const { published } = req.body;
    
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    faq.published = published;
    await faq.save();

    res.json({
      message: `FAQ ${published ? 'published' : 'unpublished'} successfully`,
      faq
    });
  } catch (error) {
    console.error('Publish FAQ error:', error);
    res.status(500).json({ error: 'Failed to update published status' });
  }
});

// Admin: Update FAQ order
router.put('/:id/order', authenticate, requireAdmin, [
  body('order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
], async (req, res) => {
  try {
    const { order } = req.body;
    
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    faq.order = order;
    await faq.save();

    res.json({
      message: 'FAQ order updated successfully',
      faq
    });
  } catch (error) {
    console.error('Update FAQ order error:', error);
    res.status(500).json({ error: 'Failed to update FAQ order' });
  }
});

// Get FAQ categories with counts
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await FAQ.aggregate([
      { $match: { published: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageViews: { $avg: '$views' },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ categories });
  } catch (error) {
    console.error('Get FAQ categories error:', error);
    res.status(500).json({ error: 'Failed to fetch FAQ categories' });
  }
});

// Get FAQ statistics (admin only)
router.get('/stats/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await FAQ.aggregate([
      {
        $group: {
          _id: { category: '$category', department: '$department' },
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          averageHelpfulness: { $avg: '$helpfulnessRatio' }
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
              helpfulness: '$averageHelpfulness'
            }
          },
          total: { $sum: '$count' },
          totalViews: { $sum: '$totalViews' }
        }
      }
    ]);

    const topFAQs = await FAQ.find({ published: true })
      .populate('author', 'username')
      .sort({ views: -1 })
      .limit(10)
      .select('question views helpful author category createdAt');

    const helpfulnessStats = await FAQ.aggregate([
      { $match: { published: true } },
      {
        $project: {
          question: 1,
          category: 1,
          helpfulCount: { $size: { $filter: { input: '$helpful', cond: { $eq: ['$$this.helpful', true] } } } },
          notHelpfulCount: { $size: { $filter: { input: '$helpful', cond: { $eq: ['$$this.helpful', false] } } } },
          totalRatings: { $size: '$helpful' }
        }
      },
      {
        $project: {
          question: 1,
          category: 1,
          helpfulCount: 1,
          notHelpfulCount: 1,
          totalRatings: 1,
          helpfulnessRatio: {
            $cond: [
              { $eq: ['$totalRatings', 0] },
              0,
              { $divide: ['$helpfulCount', '$totalRatings'] }
            ]
          }
        }
      },
      { $sort: { helpfulnessRatio: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      categoryStats: stats,
      topFAQs,
      helpfulnessStats
    });
  } catch (error) {
    console.error('Get FAQ stats error:', error);
    res.status(500).json({ error: 'Failed to get FAQ statistics' });
  }
});

module.exports = router;