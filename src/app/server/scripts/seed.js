const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const FAQ = require('../models/FAQ');
const Video = require('../models/Video');
const Achiever = require('../models/Achiever');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventshub');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('Starting database seed...');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await FAQ.deleteMany({});
    await Video.deleteMany({});
    await Achiever.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin.123.@gmail.com',
      password: 'admin@123',
      isAdmin: true,
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
        department: 'CSE',
        bio: 'System administrator for EventsHub'
      }
    });

    // Create sample users
    const sampleUsers = await User.create([
      {
        username: 'saranya',
        email: 'saranya@gmail.com',
        password: 'password',
        profile: {
          firstName: 'Saranya',
          lastName: 'K',
          department: 'CSE',
          year: '3rd',
          registerNumber: '20CSE001',
          bio: 'Computer Science student passionate about web development'
        }
      },
      {
        username: 'rajesh',
        email: 'rajesh@gmail.com',
        password: 'password',
        profile: {
          firstName: 'Rajesh',
          lastName: 'M',
          department: 'IT',
          year: '2nd',
          registerNumber: '21IT015'
        }
      },
      {
        username: 'priya',
        email: 'priya@gmail.com',
        password: 'password',
        profile: {
          firstName: 'Priya',
          lastName: 'S',
          department: 'ECE',
          year: '4th',
          registerNumber: '19ECE010'
        }
      }
    ]);

    console.log('Users created successfully');

    // Create sample events
    const sampleEvents = await Event.create([
      {
        title: 'Web Development Workshop',
        description: 'Learn modern web development with React and Node.js. This comprehensive workshop covers frontend and backend development.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        time: '10:00 AM',
        endTime: '4:00 PM',
        location: 'Computer Lab 1',
        department: 'CSE',
        category: 'Workshop',
        organizer: adminUser._id,
        contactInfo: {
          email: 'admin@eventshub.com',
          phone: '+91-9876543210',
          name: 'Admin Team'
        },
        capacity: 50,
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        agenda: [
          { time: '10:00 AM', activity: 'Introduction to Web Development', speaker: 'John Doe' },
          { time: '11:30 AM', activity: 'React Fundamentals', speaker: 'Jane Smith' },
          { time: '1:00 PM', activity: 'Lunch Break' },
          { time: '2:00 PM', activity: 'Backend with Node.js', speaker: 'John Doe' },
          { time: '3:30 PM', activity: 'Project Demo & Q&A', speaker: 'Both Speakers' }
        ],
        speakers: [
          {
            name: 'John Doe',
            designation: 'Senior Full Stack Developer',
            organization: 'Tech Corp',
            bio: 'Experienced developer with 8+ years in web technologies'
          }
        ],
        tags: ['web', 'react', 'nodejs', 'workshop']
      },
      {
        title: 'AI/ML Seminar Series',
        description: 'Explore the latest trends in Artificial Intelligence and Machine Learning.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        time: '2:00 PM',
        endTime: '5:00 PM',
        location: 'Auditorium',
        department: 'AIML',
        category: 'Seminar',
        organizer: sampleUsers[0]._id,
        capacity: 200,
        tags: ['ai', 'ml', 'seminar', 'research']
      },
      {
        title: 'Coding Competition 2024',
        description: 'Annual coding competition for all departments. Prizes worth ₹50,000!',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        time: '9:00 AM',
        endTime: '6:00 PM',
        location: 'Main Computer Lab',
        department: 'All',
        category: 'Competition',
        organizer: adminUser._id,
        capacity: 100,
        tags: ['coding', 'competition', 'programming']
      },
      {
        title: 'Cultural Fest - Dance Competition',
        description: 'Showcase your dancing skills in our annual cultural fest.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        time: '6:00 PM',
        endTime: '9:00 PM',
        location: 'Main Stage',
        department: 'All',
        category: 'Cultural',
        organizer: sampleUsers[1]._id,
        capacity: 500,
        tags: ['cultural', 'dance', 'fest', 'entertainment']
      }
    ]);

    console.log('Events created successfully');

    // Create sample FAQs
    const sampleFAQs = await FAQ.create([
      {
        question: 'How do I register for an event?',
        answer: 'To register for an event, navigate to the event details page and click the "Register" button. Fill out the registration form with your details and submit. You will receive a confirmation email once your registration is processed.',
        category: 'Registration',
        department: 'All',
        author: adminUser._id,
        featured: true,
        order: 1,
        tags: ['registration', 'events', 'how-to']
      },
      {
        question: 'Can I cancel my event registration?',
        answer: 'Yes, you can cancel your registration before the event date. Go to your dashboard, find the registered event, and click cancel. Note that cancellation might not be possible within 24 hours of the event.',
        category: 'Registration',
        department: 'All',
        author: adminUser._id,
        order: 2,
        tags: ['cancel', 'registration']
      },
      {
        question: 'How do I request a certificate?',
        answer: 'After attending an event, you can request a certificate from the event details page. Click on "Certificate/OD" and fill out the request form. Your request will be reviewed by administrators.',
        category: 'Certificates',
        department: 'All',
        author: adminUser._id,
        featured: true,
        order: 3,
        tags: ['certificate', 'documents']
      },
      {
        question: 'What is an OD letter?',
        answer: 'An OD (On Duty) letter is an official document that justifies your absence from regular classes to attend an event. You can request this for official events and seminars.',
        category: 'Certificates',
        department: 'All',
        author: adminUser._id,
        order: 4,
        tags: ['od', 'documents', 'attendance']
      },
      {
        question: 'How do I reset my password?',
        answer: 'Currently, password reset is handled by administrators. Please contact the admin team with your email address to reset your password.',
        category: 'Account',
        department: 'All',
        author: adminUser._id,
        order: 5,
        tags: ['password', 'account', 'reset']
      }
    ]);

    console.log('FAQs created successfully');

    // Create sample videos
    const sampleVideos = await Video.create([
      {
        title: 'Introduction to React - Workshop Highlights',
        description: 'Highlights from our recent React workshop covering components, hooks, and state management.',
        url: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        platform: 'youtube',
        category: 'Educational',
        department: 'CSE',
        uploader: adminUser._id,
        relatedEvent: sampleEvents[0]._id,
        featured: true,
        tags: ['react', 'javascript', 'workshop'],
        duration: '15:30'
      },
      {
        title: 'Machine Learning Basics - Seminar Recording',
        description: 'Complete recording of the ML basics seminar by industry expert Dr. Smith.',
        url: 'https://www.youtube.com/watch?v=aircArOvAeE',
        platform: 'youtube',
        category: 'Seminars',
        department: 'AIML',
        uploader: sampleUsers[0]._id,
        tags: ['machine-learning', 'ai', 'seminar'],
        duration: '45:20'
      },
      {
        title: 'Coding Competition 2023 - Final Round',
        description: 'Watch the exciting final round of last year\'s coding competition.',
        url: 'https://www.youtube.com/watch?v=example',
        platform: 'youtube',
        category: 'Event Highlights',
        department: 'All',
        uploader: adminUser._id,
        featured: true,
        tags: ['competition', 'coding', 'highlights'],
        duration: '25:15'
      }
    ]);

    console.log('Videos created successfully');

    // Create sample achievements
    const sampleAchievements = await Achiever.create([
      {
        user: sampleUsers[0]._id,
        title: 'First Prize in State Level Coding Competition',
        description: 'Won first prize in the Tamil Nadu State Level Programming Contest 2024. Competed against 500+ participants from various colleges.',
        category: 'Technical',
        achievementType: 'Competition Win',
        date: new Date('2024-01-15'),
        organization: {
          name: 'Tamil Nadu Technical Education Board',
          location: 'Chennai'
        },
        level: 'State',
        position: '1st',
        featured: true,
        verified: true,
        verifiedBy: adminUser._id,
        verifiedAt: new Date(),
        tags: ['coding', 'programming', 'state-level', 'competition']
      },
      {
        user: sampleUsers[1]._id,
        title: 'Research Paper Published in IEEE Conference',
        description: 'Published research paper on "IoT-based Smart Campus Management System" in IEEE International Conference on Smart Technologies.',
        category: 'Research',
        achievementType: 'Publication',
        date: new Date('2024-02-10'),
        organization: {
          name: 'IEEE',
          website: 'https://ieee.org'
        },
        level: 'International',
        verified: true,
        verifiedBy: adminUser._id,
        verifiedAt: new Date(),
        tags: ['research', 'iot', 'ieee', 'publication']
      },
      {
        user: sampleUsers[2]._id,
        title: 'Best Project Award - Final Year',
        description: 'Received the Best Project Award for developing an AI-powered student performance prediction system.',
        category: 'Academic',
        achievementType: 'Award',
        date: new Date('2024-03-20'),
        organization: {
          name: 'Department of ECE',
          location: 'College'
        },
        level: 'College',
        position: 'Winner',
        tags: ['project', 'ai', 'academic', 'award']
      }
    ]);

    console.log('Achievements created successfully');

    console.log('Database seeded successfully!');
    console.log('\n=== Sample Credentials ===');
    console.log('Admin: admin.123.@gmail.com / admin@123');
    console.log('User 1: saranya@gmail.com / password');
    console.log('User 2: rajesh@gmail.com / password');
    console.log('User 3: priya@gmail.com / password');
    console.log('==========================\n');

  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

// Run if called directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedData, connectDB };