const express = require('express');
const { body, validationResult } = require('express-validator');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registrationValidation = [
  body('personalInfo.fullName').trim().isLength({ min: 1, max: 100 }).withMessage('Full name is required'),
  body('personalInfo.email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('personalInfo.phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('personalInfo.department').isIn(['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics']).withMessage('Valid department is required'),
  body('eventDetails.reasonForRegistration').trim().isLength({ min: 10, max: 1000 }).withMessage('Reason for registration is required (10-1000 characters)')
];

// Get user's registrations
router.get('/my', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const registrations = await Registration.find(query)
      .populate('event', 'title date time location department status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Registration.countDocuments(query);

    res.json({
      registrations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Register for event
router.post('/register/:eventId', authenticate, registrationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ error: 'Event is not available for registration' });
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    // Check if event is full
    if (event.capacity && event.registrationCount >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if user already registered
    const existingRegistration = await Registration.findOne({
      user: req.user._id,
      event: eventId
    });

    if (existingRegistration) {
      return res.status(400).json({ 
        error: 'You have already registered for this event',
        registration: existingRegistration
      });
    }

    // Create registration
    const registration = new Registration({
      event: eventId,
      user: req.user._id,
      personalInfo: req.body.personalInfo,
      eventDetails: req.body.eventDetails
    });

    await registration.save();
    await registration.populate('event', 'title date time location');

    // Update event registration count
    await event.updateRegistrationCount();

    // Create notification for user
    await Notification.createNotification({
      recipient: req.user._id,
      title: 'Registration Submitted',
      message: `Your registration for "${event.title}" has been submitted and is pending approval.`,
      type: 'registration',
      category: 'registration_update',
      relatedId: registration._id,
      relatedModel: 'Registration',
      actionUrl: `/registrations/${registration._id}`
    });

    // Notify event organizer
    await Notification.createNotification({
      recipient: event.organizer,
      title: 'New Registration',
      message: `${req.body.personalInfo.fullName} registered for your event "${event.title}".`,
      type: 'registration',
      category: 'registration_update',
      relatedId: registration._id,
      relatedModel: 'Registration',
      actionRequired: true,
      actionUrl: `/admin/registrations/${registration._id}`
    });

    res.status(201).json({
      message: 'Registration submitted successfully',
      registration
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// Get registration by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'title date time location department organizer')
      .populate('user', 'username email profile');

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Check access rights
    if (registration.user._id.toString() !== req.user._id.toString() && 
        !req.user.isAdmin && 
        registration.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ registration });
  } catch (error) {
    console.error('Get registration error:', error);
    res.status(500).json({ error: 'Failed to fetch registration' });
  }
});

// Update registration (user can only update before approval)
router.put('/:id', authenticate, registrationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const registration = await Registration.findById(req.params.id)
      .populate('event', 'title');

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Check ownership
    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can only update pending registrations
    if (registration.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Cannot update registration after it has been processed' 
      });
    }

    // Update registration
    registration.personalInfo = req.body.personalInfo;
    registration.eventDetails = req.body.eventDetails;
    await registration.save();

    res.json({
      message: 'Registration updated successfully',
      registration
    });
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ error: 'Failed to update registration' });
  }
});

// Cancel registration
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'title');

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Check ownership
    if (registration.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can only cancel pending or approved registrations
    if (!['pending', 'approved'].includes(registration.status)) {
      return res.status(400).json({ 
        error: 'Cannot cancel this registration' 
      });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Update event registration count
    const event = await Event.findById(registration.event._id);
    if (event) {
      await event.updateRegistrationCount();
    }

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
});

// Admin: Get all registrations with filtering
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { 
      eventId, 
      status, 
      department,
      page = 1, 
      limit = 20 
    } = req.query;

    let query = {};
    
    if (eventId) query.event = eventId;
    if (status) query.status = status;
    if (department) query['personalInfo.department'] = department;

    const registrations = await Registration.find(query)
      .populate('event', 'title date time location department')
      .populate('user', 'username email profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Registration.countDocuments(query);

    res.json({
      registrations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Admin: Update registration status
router.put('/:id/status', authenticate, requireAdmin, [
  body('status').isIn(['pending', 'approved', 'rejected', 'attended']).withMessage('Valid status is required'),
  body('rejectionReason').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { status, rejectionReason } = req.body;
    
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'title')
      .populate('user', 'username email');

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const oldStatus = registration.status;
    registration.status = status;
    
    if (status === 'rejected' && rejectionReason) {
      registration.rejectionReason = rejectionReason;
    }

    await registration.save();

    // Update event registration count if needed
    if (oldStatus !== status) {
      const event = await Event.findById(registration.event._id);
      if (event) {
        await event.updateRegistrationCount();
      }
    }

    // Create notification for user
    let notificationMessage;
    let notificationType = 'info';

    switch (status) {
      case 'approved':
        notificationMessage = `Your registration for "${registration.event.title}" has been approved!`;
        notificationType = 'success';
        break;
      case 'rejected':
        notificationMessage = `Your registration for "${registration.event.title}" has been rejected.`;
        notificationType = 'error';
        break;
      case 'attended':
        notificationMessage = `Your attendance for "${registration.event.title}" has been marked.`;
        notificationType = 'success';
        // Update user stats
        const user = await require('../models/User').findById(registration.user._id);
        user.stats.eventsAttended += 1;
        await user.save();
        break;
    }

    if (notificationMessage) {
      await Notification.createNotification({
        recipient: registration.user._id,
        title: 'Registration Status Update',
        message: notificationMessage,
        type: notificationType,
        category: 'registration_update',
        relatedId: registration._id,
        relatedModel: 'Registration'
      });
    }

    res.json({
      message: 'Registration status updated successfully',
      registration
    });
  } catch (error) {
    console.error('Update registration status error:', error);
    res.status(500).json({ error: 'Failed to update registration status' });
  }
});

// Submit feedback for attended event
router.post('/:id/feedback', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comments').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { rating, comments } = req.body;
    
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'title');

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Check ownership
    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can only submit feedback for attended events
    if (registration.status !== 'attended') {
      return res.status(400).json({ 
        error: 'You can only submit feedback for attended events' 
      });
    }

    // Check if feedback already submitted
    if (registration.feedback.submitted) {
      return res.status(400).json({ error: 'Feedback already submitted' });
    }

    // Update registration feedback
    registration.feedback = {
      rating,
      comments,
      submitted: true
    };
    await registration.save();

    // Add rating to event
    const event = await Event.findById(registration.event._id);
    if (event) {
      const existingRatingIndex = event.ratings.findIndex(
        r => r.user.toString() === req.user._id.toString()
      );

      if (existingRatingIndex > -1) {
        event.ratings[existingRatingIndex] = {
          user: req.user._id,
          rating,
          review: comments
        };
      } else {
        event.ratings.push({
          user: req.user._id,
          rating,
          review: comments
        });
      }

      await event.save();
    }

    res.json({
      message: 'Feedback submitted successfully',
      feedback: registration.feedback
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;