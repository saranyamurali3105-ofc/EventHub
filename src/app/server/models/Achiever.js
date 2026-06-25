const mongoose = require('mongoose');

const achieverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['Academic', 'Sports', 'Cultural', 'Technical', 'Research', 'Competition', 'Leadership', 'Community Service', 'Other'],
    required: true
  },
  achievementType: {
    type: String,
    enum: ['Award', 'Competition Win', 'Publication', 'Project', 'Recognition', 'Certification', 'Other'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  organization: {
    name: String,
    website: String,
    location: String
  },
  level: {
    type: String,
    enum: ['College', 'University', 'State', 'National', 'International'],
    default: 'College'
  },
  position: {
    type: String,
    enum: ['Winner', '1st', '2nd', '3rd', 'Finalist', 'Participant', 'Other']
  },
  images: [String],
  documents: [{
    name: String,
    url: String,
    type: String
  }],
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'department', 'private'],
    default: 'public'
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
achieverSchema.index({ user: 1 });
achieverSchema.index({ category: 1 });
achieverSchema.index({ level: 1 });
achieverSchema.index({ featured: 1 });
achieverSchema.index({ verified: 1 });
achieverSchema.index({ date: -1 });
achieverSchema.index({ title: 'text', description: 'text' });

// Virtual for like count
achieverSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
achieverSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to check if user liked this achievement
achieverSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to toggle like
achieverSchema.methods.toggleLike = async function(userId) {
  const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push({ user: userId });
  }
  
  await this.save();
  return this.likes.length;
};

// Method to add comment
achieverSchema.methods.addComment = async function(userId, comment) {
  this.comments.push({
    user: userId,
    comment: comment
  });
  
  await this.save();
  return this.comments[this.comments.length - 1];
};

module.exports = mongoose.model('Achiever', achieverSchema);