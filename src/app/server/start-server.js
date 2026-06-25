#!/usr/bin/env node

const dns = require('dns');

// Force Node to use Google's DNS
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const { execSync } = require('child_process');

console.log('🚀 Starting EventsHub Server with MongoDB Atlas...\n');

// MongoDB Atlas connection string
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('📋 Configuration:');
console.log('  - Database: eventshubDB');
console.log('  - User: sandhiya');
console.log('  - Port: 3000');
console.log('  - Environment: development\n');

// Test MongoDB connection first
console.log('🔍 Testing MongoDB Atlas connection...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log('✅ MongoDB Atlas connection successful!\n');
  
  // Close test connection
  mongoose.connection.close();
  
  // Start the server
  console.log('🌟 Starting server...\n');
  execSync('node server.js', { stdio: 'inherit' });
})
.catch(error => {
  console.error('❌ MongoDB Atlas connection failed:');
  console.error('   Error:', error.message);
  console.error('\n💡 Troubleshooting tips:');
  console.error('   1. Check your internet connection');
  console.error('   2. Verify your MongoDB Atlas cluster is running');
  console.error('   3. Check if your IP address is whitelisted in MongoDB Atlas');
  console.error('   4. Verify the connection string credentials');
  console.error('   5. Check if the database user has proper permissions\n');
  
  process.exit(1);
});