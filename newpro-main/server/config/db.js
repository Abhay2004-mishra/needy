const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool - handles thousands of concurrent queries
      maxPoolSize: 50,
      minPoolSize: 5,
      // Auto-reconnect settings
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Retry writes for reliability
      retryWrites: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Pool Size: 50 connections`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Retry after 5 seconds instead of exiting
    console.log('   Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
