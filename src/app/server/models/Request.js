const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  type: {
    type: String,
    enum: ['OD', 'CERTIFICATE'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: 1000
  },
  additionalInfo: {
    type: String,
    maxlength: 500
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing'],
    default: 'pending'
  },
  adminNotes: String,
  rejectionReason: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  processedAt: Date,
  documentUrl: String, // Final generated document URL
  validUntil: Date, // For OD letters
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloadedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
requestSchema.index({ user: 1, event: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ type: 1 });
requestSchema.index({ createdAt: -1 });

// Method to check if request is downloadable
requestSchema.methods.isDownloadable = function() {
  return this.status === 'approved' && this.documentUrl;
};

// Method to increment download count
requestSchema.methods.recordDownload = async function() {
  this.downloadCount += 1;
  this.lastDownloadedAt = new Date();
  await this.save();
};

module.exports = mongoose.model('Request', requestSchema);