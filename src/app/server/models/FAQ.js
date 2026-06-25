const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  answer: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['General', 'Events', 'Registration', 'Certificates', 'Technical', 'Account', 'Policies', 'Other'],
    required: true
  },
  department: {
    type: String,
    enum: ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics', 'All'],
    default: 'All'
  },
  tags: [String],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  published: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: {
      type: Boolean,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  relatedFAQs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQ'
  }],
  relatedLinks: [{
    title: String,
    url: String,
    description: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes for better query performance
faqSchema.index({ category: 1 });
faqSchema.index({ department: 1 });
faqSchema.index({ published: 1 });
faqSchema.index({ featured: 1 });
faqSchema.index({ order: 1 });
faqSchema.index({ views: -1 });
faqSchema.index({ question: 'text', answer: 'text' });

// Virtual for helpful count
faqSchema.virtual('helpfulCount').get(function() {
  return this.helpful.filter(h => h.helpful === true).length;
});

// Virtual for not helpful count
faqSchema.virtual('notHelpfulCount').get(function() {
  return this.helpful.filter(h => h.helpful === false).length;
});

// Virtual for helpfulness ratio
faqSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpful.length;
  if (total === 0) return 0;
  return this.helpfulCount / total;
});

// Method to increment view count
faqSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Method to mark as helpful/not helpful
faqSchema.methods.markHelpful = async function(userId, isHelpful) {
  const existingIndex = this.helpful.findIndex(h => h.user.toString() === userId.toString());
  
  if (existingIndex > -1) {
    this.helpful[existingIndex].helpful = isHelpful;
  } else {
    this.helpful.push({
      user: userId,
      helpful: isHelpful
    });
  }
  
  await this.save();
  return {
    helpful: this.helpfulCount,
    notHelpful: this.notHelpfulCount
  };
};

// Static method to get popular FAQs
faqSchema.statics.getPopular = function(limit = 10) {
  return this.find({ published: true })
    .sort({ views: -1 })
    .limit(limit)
    .populate('author', 'username');
};

// Static method to search FAQs
faqSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    published: true,
    $text: { $search: query },
    ...filters
  };
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .populate('author', 'username');
};

module.exports = mongoose.model('FAQ', faqSchema);