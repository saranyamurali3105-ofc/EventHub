const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const eventValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location').trim().isLength({ min: 1, max: 200 }).withMessage('Location is required'),
  body('department').isIn(['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics', 'All']).withMessage('Valid department is required'),
  body('category').optional().isIn(['Workshop', 'Seminar', 'Competition', 'Cultural', 'Sports', 'Technical', 'Other']),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive number')
];

// Get all events with filtering and pagination
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('department').optional().isIn(['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics', 'All']),
  query('category').optional().isIn(['Workshop', 'Seminar', 'Competition', 'Cultural', 'Sports', 'Technical', 'Other']),
  query('status').optional().isIn(['draft', 'published', 'cancelled', 'completed']),
  query('search').optional().trim()
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
      limit = 10,
      department,
      category,
      status = 'published',
      search,
      upcoming,
      past
    } = req.query;

    // Build query
    let query = { status };
    
    if (department && department !== 'All') {
      query.department = { $in: [department, 'All'] };
    }
    
    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Date filters
    const now = new Date();
    if (upcoming === 'true') {
      query.date = { $gte: now };
    } else if (past === 'true') {
      query.date = { $lt: now };
    }

    // Execute query with pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: search ? { score: { $meta: 'textScore' }, date: 1 } : { date: 1 },
      populate: [
        { path: 'organizer', select: 'username profile.firstName profile.lastName' },
        { path: 'ratings.user', select: 'username' }
      ]
    };

    const events = await Event.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .lean();

    const total = await Event.countDocuments(query);

    // Add user registration status if authenticated
    if (req.user) {
      const eventIds = events.map(event => event._id);
      const userRegistrations = await Registration.find({
        user: req.user._id,
        event: { $in: eventIds }
      }).select('event status');

      const registrationMap = {};
      userRegistrations.forEach(reg => {
        registrationMap[reg.event.toString()] = reg.status;
      });

      events.forEach(event => {
        event.userRegistrationStatus = registrationMap[event._id.toString()] || null;
      });
    }

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'username profile.firstName profile.lastName profile.avatar')
      .populate('ratings.user', 'username profile.firstName profile.lastName');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Increment view count
    event.analytics.views += 1;
    await event.save();

    // Add user registration status if authenticated
    if (req.user) {
      const registration = await Registration.findOne({
        user: req.user._id,
        event: event._id
      });
      event.userRegistrationStatus = registration ? registration.status : null;
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event
router.post('/', authenticate, eventValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const eventData = {
      ...req.body,
      organizer: req.user._id
    };

    const event = new Event(eventData);
    await event.save();
    
    await event.populate('organizer', 'username profile.firstName profile.lastName');

    // Update user stats
    req.user.stats.eventsCreated += 1;
    await req.user.save();

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', authenticate, eventValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership or admin
    if (event.organizer.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    Object.assign(event, req.body);
    await event.save();
    
    await event.populate('organizer', 'username profile.firstName profile.lastName');

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership or admin
    if (event.organizer.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    // Check if there are registrations
    const registrationCount = await Registration.countDocuments({ event: event._id });
    if (registrationCount > 0 && !req.user.isAdmin) {
      return res.status(400).json({ 
        error: 'Cannot delete event with existing registrations' 
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Rate event
router.post('/:id/rate', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 500 }).withMessage('Review must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { rating, review } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user attended the event
    const registration = await Registration.findOne({
      user: req.user._id,
      event: event._id,
      status: 'attended'
    });

    if (!registration) {
      return res.status(400).json({ 
        error: 'You can only rate events you have attended' 
      });
    }

    // Check if user already rated
    const existingRatingIndex = event.ratings.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingRatingIndex > -1) {
      // Update existing rating
      event.ratings[existingRatingIndex] = {
        user: req.user._id,
        rating,
        review
      };
    } else {
      // Add new rating
      event.ratings.push({
        user: req.user._id,
        rating,
        review
      });
    }

    await event.save();

    res.json({
      message: 'Rating submitted successfully',
      averageRating: event.averageRating
    });
  } catch (error) {
    console.error('Rate event error:', error);
    res.status(500).json({ error: 'Failed to rate event' });
  }
});

// Get event statistics (admin only)
router.get('/:id/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const registrations = await Registration.find({ event: event._id });
    
    const stats = {
      totalRegistrations: registrations.length,
      pendingRegistrations: registrations.filter(r => r.status === 'pending').length,
      approvedRegistrations: registrations.filter(r => r.status === 'approved').length,
      rejectedRegistrations: registrations.filter(r => r.status === 'rejected').length,
      attendedRegistrations: registrations.filter(r => r.status === 'attended').length,
      departmentBreakdown: {},
      registrationTrend: []
    };

    // Department breakdown
    registrations.forEach(reg => {
      const dept = reg.personalInfo.department;
      stats.departmentBreakdown[dept] = (stats.departmentBreakdown[dept] || 0) + 1;
    });

    res.json({ stats });
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({ error: 'Failed to get event statistics' });
  }
});

module.exports = router;