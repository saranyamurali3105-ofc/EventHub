const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 2000
  },
  url: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['youtube', 'vimeo', 'direct', 'other'],
    default: 'youtube'
  },
  thumbnail: String,
  duration: String, // In format like "10:30"
  category: {
    type: String,
    enum: ['Educational', 'Event Highlights', 'Tutorials', 'Seminars', 'Workshops', 'Cultural', 'Sports', 'Technical', 'Other'],
    required: true
  },
  department: {
    type: String,
    enum: ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics', 'All'],
    default: 'All'
  },
  tags: [String],
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  speakers: [{
    name: String,
    designation: String,
    organization: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: true
  },
  publishedAt: Date,
  views: {
    type: Number,
    default: 0
  },
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
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reply: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  playlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist'
  },
  quality: {
    type: String,
    enum: ['360p', '480p', '720p', '1080p', '4K'],
    default: '720p'
  },
  subtitles: [{
    language: String,
    url: String
  }],
  downloadable: {
    type: Boolean,
    default: false
  },
  downloadUrl: String,
  analytics: {
    watchTime: {
      type: Number,
      default: 0
    },
    completionRate: {
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
videoSchema.index({ category: 1 });
videoSchema.index({ department: 1 });
videoSchema.index({ featured: 1 });
videoSchema.index({ published: 1 });
videoSchema.index({ views: -1 });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ title: 'text', description: 'text' });

// Virtual for like count
videoSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
videoSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to increment view count
videoSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Method to check if user liked this video
videoSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to toggle like
videoSchema.methods.toggleLike = async function(userId) {
  const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push({ user: userId });
  }
  
  await this.save();
  return this.likes.length;
};

// Extract video ID from URL
videoSchema.methods.getVideoId = function() {
  if (this.platform === 'youtube') {
    const match = this.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  }
  return null;
};

// Get thumbnail URL
videoSchema.methods.getThumbnailUrl = function() {
  if (this.thumbnail) return this.thumbnail;
  
  if (this.platform === 'youtube') {
    const videoId = this.getVideoId();
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  }
  
  return null;
};

module.exports = mongoose.model('Video', videoSchema);