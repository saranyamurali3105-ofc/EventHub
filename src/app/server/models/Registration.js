const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    registerNumber: String,
    department: {
      type: String,
      required: true,
      enum: ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics']
    },
    year: {
      type: String,
      enum: ['1st', '2nd', '3rd', '4th']
    }
  },
  eventDetails: {
    slot: String,
    reasonForRegistration: {
      type: String,
      required: true
    },
    priorExperience: String,
    expectations: String,
    dietaryRestrictions: String,
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'attended'],
    default: 'pending'
  },
  rejectionReason: String,
  paymentStatus: {
    type: String,
    enum: ['not_required', 'pending', 'completed', 'failed'],
    default: 'not_required'
  },
  paymentId: String,
  attendanceMarked: {
    type: Boolean,
    default: false
  },
  attendanceTime: Date,
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    submitted: {
      type: Boolean,
      default: false
    }
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: String,
  qrCode: String,
  notes: String
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

// Indexes for queries
registrationSchema.index({ status: 1 });
registrationSchema.index({ 'personalInfo.email': 1 });

// Update event registration count after status change
registrationSchema.post('save', async function() {
  const Event = mongoose.model('Event');
  const event = await Event.findById(this.event);
  if (event) {
    await event.updateRegistrationCount();
  }
});

registrationSchema.post('remove', async function() {
  const Event = mongoose.model('Event');
  const event = await Event.findById(this.event);
  if (event) {
    await event.updateRegistrationCount();
  }
});

module.exports = mongoose.model('Registration', registrationSchema);