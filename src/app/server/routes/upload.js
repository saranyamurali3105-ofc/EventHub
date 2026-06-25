const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'));
    }
  }
});

// Upload single file
router.post('/single', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { folder = 'eventshub' } = req.body;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `${folder}/${req.user._id}`,
          resource_type: 'auto',
          public_id: `${Date.now()}_${req.file.originalname.split('.')[0]}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    res.json({
      message: 'File uploaded successfully',
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname,
        size: result.bytes,
        format: result.format,
        resourceType: result.resource_type
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message.includes('File too large')) {
      return res.status(400).json({ error: 'File size too large. Maximum 10MB allowed.' });
    }
    
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload multiple files
router.post('/multiple', authenticate, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { folder = 'eventshub' } = req.body;
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `${folder}/${req.user._id}`,
            resource_type: 'auto',
            public_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.originalname.split('.')[0]}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({
              url: result.secure_url,
              publicId: result.public_id,
              originalName: file.originalname,
              size: result.bytes,
              format: result.format,
              resourceType: result.resource_type
            });
          }
        ).end(file.buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.json({
      message: 'Files uploaded successfully',
      files: uploadResults
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Upload avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No avatar file uploaded' });
    }

    // Validate it's an image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Avatar must be an image file' });
    }

    // Upload to Cloudinary with specific transformations for avatars
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `eventshub/avatars`,
          resource_type: 'image',
          public_id: `avatar_${req.user._id}_${Date.now()}`,
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Update user's avatar in database
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      'profile.avatar': result.secure_url
    });

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Admin: Upload document for requests
router.post('/document/:requestId', authenticate, requireAdmin, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }

    const Request = require('../models/Request');
    const request = await Request.findById(req.params.requestId)
      .populate('user', 'username email')
      .populate('event', 'title');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ 
        error: 'Can only upload documents for approved requests' 
      });
    }

    // Generate filename based on request type and details
    const filename = `${request.type}_${request.event.title.replace(/[^a-zA-Z0-9]/g, '_')}_${request.user.username}_${Date.now()}`;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `eventshub/documents/${request.type.toLowerCase()}`,
          resource_type: 'auto',
          public_id: filename,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Update request with document URL
    request.documentUrl = result.secure_url;
    
    // Set validity for OD letters (30 days)
    if (request.type === 'OD') {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      request.validUntil = validUntil;
    }

    await request.save();

    // Update user stats for certificates
    if (request.type === 'CERTIFICATE') {
      const User = require('../models/User');
      await User.findByIdAndUpdate(request.user._id, {
        $inc: { 'stats.certificatesEarned': 1 }
      });
    }

    // Create notification for user
    const Notification = require('../models/Notification');
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
      document: {
        url: result.secure_url,
        publicId: result.public_id,
        filename: req.file.originalname,
        validUntil: request.validUntil
      },
      request: {
        id: request._id,
        type: request.type,
        documentUrl: request.documentUrl
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Delete file from Cloudinary
router.delete('/file/:publicId', authenticate, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Decode the public ID (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(decodedPublicId);

    if (result.result === 'ok') {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found or already deleted' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get upload statistics (admin only)
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get Cloudinary usage stats
    const usage = await cloudinary.api.usage();

    // Get folder info
    const folders = await cloudinary.api.sub_folders('eventshub');

    res.json({
      usage: {
        storage: usage.storage,
        bandwidth: usage.bandwidth,
        requests: usage.requests,
        transformations: usage.transformations
      },
      folders: folders.folders
    });
  } catch (error) {
    console.error('Get upload stats error:', error);
    res.status(500).json({ error: 'Failed to get upload statistics' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 10MB allowed.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum 5 files allowed.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
  }
  
  res.status(500).json({ error: error.message || 'Upload error occurred' });
});

module.exports = router;