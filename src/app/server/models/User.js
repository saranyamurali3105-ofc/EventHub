const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    department: {
      type: String,
      enum: ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics']
    },
    year: {
      type: String,
      enum: ['1st', '2nd', '3rd', '4th']
    },
    registerNumber: String,
    bio: String,
    avatar: String,
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String
    }
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    eventReminders: {
      type: Boolean,
      default: true
    },
    newsletter: {
      type: Boolean,
      default: false
    }
  },
  stats: {
    eventsAttended: {
      type: Number,
      default: 0
    },
    eventsCreated: {
      type: Number,
      default: 0
    },
    certificatesEarned: {
      type: Number,
      default: 0
    }
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Create default admin user
userSchema.statics.createDefaultAdmin = async function() {
  const adminExists = await this.findOne({ email: 'admin.123.@gmail.com' });
  if (!adminExists) {
    await this.create({
      username: 'admin',
      email: 'admin.123.@gmail.com',
      password: 'admin@123',
      isAdmin: true,
      profile: {
        firstName: 'System',
        lastName: 'Administrator'
      }
    });
    console.log('Default admin user created');
  }
};

module.exports = mongoose.model('User', userSchema);