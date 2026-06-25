const express = require('express');
const { body, validationResult } = require('express-validator');
const Request = require('../models/Request');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const requestValidation = [
  body('type').isIn(['OD', 'CERTIFICATE']).withMessage('Valid request type is required'),
  body('reason').trim().isLength({ min: 10, max: 1000 }).withMessage('Reason is required (10-1000 characters)'),
  body('additionalInfo').optional().trim().isLength({ max: 500 })
];

// Get user's requests
router.get('/my', authenticate, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user._id };
    if (type) query.type = type;
    if (status) query.status = status;

    const requests = await Request.find(query)
      .populate('event', 'title date time location department')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Request.countDocuments(query);

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Create new request
router.post('/', authenticate, requestValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { eventId, type, reason, additionalInfo } = req.body;

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // For certificate requests, check if user attended the event
    if (type === 'CERTIFICATE') {
      const registration = await Registration.findOne({
        user: req.user._id,
        event: eventId,
        status: 'attended'
      });

      if (!registration) {
        return res.status(400).json({ 
          error: 'You can only request certificates for events you have attended' 
        });
      }
    }

    // Check if user already has a pending/approved request for this event and type
    const existingRequest = await Request.findOne({
      user: req.user._id,
      event: eventId,
      type,
      status: { $in: ['pending', 'approved', 'processing'] }
    });

    if (existingRequest) {
      return res.status(400).json({ 
        error: `You already have a ${existingRequest.status} ${type} request for this event` 
      });
    }

    // Create request
    const request = new Request({
      user: req.user._id,
      event: eventId,
      type,
      reason,
      additionalInfo
    });

    await request.save();
    await request.populate('event', 'title date location organizer');

    // Create notification for user
    await Notification.createNotification({
      recipient: req.user._id,
      title: 'Request Submitted',
      message: `Your ${type} request for "${event.title}" has been submitted and is pending approval.`,
      type: 'request',
      category: 'request_update',
      relatedId: request._id,
      relatedModel: 'Request'
    });

    // Notify event organizer and admins
    const admins = await require('../models/User').find({ isAdmin: true });
    const recipients = [event.organizer, ...admins.map(admin => admin._id)];

    for (const recipient of recipients) {
      await Notification.createNotification({
        recipient,
        title: 'New Document Request',
        message: `${req.user.username} requested a ${type} for "${event.title}".`,
        type: 'request',
        category: 'request_update',
        relatedId: request._id,
        relatedModel: 'Request',
        actionRequired: true,
        actionUrl: `/admin/requests/${request._id}`
      });
    }

    res.status(201).json({
      message: 'Request submitted successfully',
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Get request by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('event', 'title date time location department organizer')
      .populate('user', 'username email profile')
      .populate('approvedBy', 'username');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check access rights
    if (request.user._id.toString() !== req.user._id.toString() && 
        !req.user.isAdmin && 
        request.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Update request (user can only update pending requests)
router.put('/:id', authenticate, requestValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check ownership
    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can only update pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Cannot update request after it has been processed' 
      });
    }

    // Update request
    request.reason = req.body.reason;
    request.additionalInfo = req.body.additionalInfo;
    await request.save();

    res.json({
      message: 'Request updated successfully',
      request
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Cancel request
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check ownership
    if (request.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can only cancel pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Cannot cancel this request' 
      });
    }

    await Request.findByIdAndDelete(req.params.id);

    res.json({ message: 'Request cancelled successfully' });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ error: 'Failed to cancel request' });
  }
});

// Admin: Get all requests with filtering
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { 
      eventId, 
      type,
      status, 
      priority,
      page = 1, 
      limit = 20 
    } = req.query;

    let query = {};
    
    if (eventId) query.event = eventId;
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const requests = await Request.find(query)
      .populate('event', 'title date time location department')
      .populate('user', 'username email profile')
      .populate('approvedBy', 'username')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Request.countDocuments(query);

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Admin: Update request status
router.put('/:id/status', authenticate, requireAdmin, [
  body('status').isIn(['pending', 'approved', 'rejected', 'processing']).withMessage('Valid status is required'),
  body('adminNotes').optional().trim().isLength({ max: 500 }),
  body('rejectionReason').optional().trim().isLength({ max: 500 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { status, adminNotes, rejectionReason, priority } = req.body;
    
    const request = await Request.findById(req.params.id)
      .populate('event', 'title')
      .populate('user', 'username email');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = status;
    request.processedAt = new Date();
    
    if (adminNotes) request.adminNotes = adminNotes;
    if (priority) request.priority = priority;
    
    if (status === 'approved') {
      request.approvedBy = req.user._id;
      request.approvedAt = new Date();
    } else if (status === 'rejected' && rejectionReason) {
      request.rejectionReason = rejectionReason;
    }

    await request.save();

    // Create notification for user
    let notificationMessage;
    let notificationType = 'info';

    switch (status) {
      case 'approved':
        notificationMessage = `Your ${request.type} request for "${request.event.title}" has been approved!`;
        notificationType = 'success';
        break;
      case 'rejected':
        notificationMessage = `Your ${request.type} request for "${request.event.title}" has been rejected.`;
        notificationType = 'error';
        break;
      case 'processing':
        notificationMessage = `Your ${request.type} request for "${request.event.title}" is being processed.`;
        notificationType = 'info';
        break;
    }

    if (notificationMessage) {
      await Notification.createNotification({
        recipient: request.user._id,
        title: 'Request Status Update',
        message: notificationMessage,
        type: notificationType,
        category: 'request_update',
        relatedId: request._id,
        relatedModel: 'Request'
      });
    }

    res.json({
      message: 'Request status updated successfully',
      request
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

// Admin: Upload document for approved request
router.post('/:id/upload-document', authenticate, requireAdmin, async (req, res) => {
  try {
    const { documentUrl } = req.body;

    if (!documentUrl) {
      return res.status(400).json({ error: 'Document URL is required' });
    }

    const request = await Request.findById(req.params.id)
      .populate('event', 'title')
      .populate('user', 'username email');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ 
        error: 'Can only upload documents for approved requests' 
      });
    }

    request.documentUrl = documentUrl;
    
    // Set validity for OD letters (typically 30 days)
    if (request.type === 'OD') {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      request.validUntil = validUntil;
    }

    await request.save();

    // Update user stats for certificates
    if (request.type === 'CERTIFICATE') {
      const user = await require('../models/User').findById(request.user._id);
      user.stats.certificatesEarned += 1;
      await user.save();
    }

    // Create notification for user
    await Notification.createNotification({
      recipient: request.user._id,
      title: 'Document Ready',
      message: `Your ${request.type} for "${request.event.title}" is ready for download!`,
      type: 'success',
      category: 'request_update',
      relatedId: request._id,
      relatedModel: 'Request',
      actionUrl: `/requests/${request._id}`,
      actionText: 'Download Document'
    });

    res.json({
      message: 'Document uploaded successfully',
      request
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Download document (track downloads)
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check ownership
    if (request.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!request.isDownloadable()) {
      return res.status(400).json({ 
        error: 'Document is not available for download' 
      });
    }

    // Check validity for OD letters
    if (request.type === 'OD' && request.validUntil && new Date() > request.validUntil) {
      return res.status(400).json({ error: 'OD letter has expired' });
    }

    // Record download
    await request.recordDownload();

    res.json({
      downloadUrl: request.documentUrl,
      filename: `${request.type}_${request._id}.pdf`,
      validUntil: request.validUntil
    });
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Get request statistics (admin only)
router.get('/stats/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await Request.aggregate([
      {
        $group: {
          _id: { type: '$type', status: '$status' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      }
    ]);

    const monthlyTrend = await Request.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$type'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      overview: stats,
      monthlyTrend
    });
  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({ error: 'Failed to get request statistics' });
  }
});

module.exports = router;