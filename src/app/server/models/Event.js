const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  endTime: String,
  location: {
    type: String,
    required: true,
    maxlength: 200
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics', 'All']
  },
  category: {
    type: String,
    enum: ['Workshop', 'Seminar', 'Competition', 'Cultural', 'Sports', 'Technical', 'Other'],
    default: 'Other'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactInfo: {
    email: String,
    phone: String,
    name: String
  },
  capacity: {
    type: Number,
    min: 1
  },
  registrationDeadline: Date,
  requirements: [String],
  agenda: [{
    time: String,
    activity: String,
    speaker: String
  }],
  speakers: [{
    name: String,
    designation: String,
    organization: String,
    bio: String,
    image: String
  }],
  images: [String],
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published'
  },
  registrationCount: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    registrations: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
eventSchema.index({ date: 1 });
eventSchema.index({ department: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ title: 'text', description: 'text' });

// Update registration count
eventSchema.methods.updateRegistrationCount = async function() {
  const Registration = mongoose.model('Registration');
  this.registrationCount = await Registration.countDocuments({ 
    event: this._id, 
    status: { $in: ['approved', 'pending'] }
  });
  await this.save();
};

// Calculate average rating
eventSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  }
};

eventSchema.pre('save', function(next) {
  this.calculateAverageRating();
  next();
});

module.exports = mongoose.model('Event', eventSchema);