const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool - supports large numbers of users
      maxPoolSize: 50,
      minPoolSize: 5,
      // Auto-reconnect settings
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // Retry writes for reliability
      retryWrites: true,
      // Ensure Atlas TLS/SSL connection for secure traffic
      tls: true,
      family: 4,
      // Disable auto-indexing in production for performance
      autoIndex: process.env.NODE_ENV !== 'production',
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

    if (error.message.toLowerCase().includes('whitelist') ||
        error.message.toLowerCase().includes('ip') ||
        error.message.toLowerCase().includes('could not connect')) {
      console.error('   Hint: MongoDB Atlas rejects the connection because your current IP is not allowed.');
      console.error('   Add your IP address in Atlas Network Access or use 0.0.0.0/0 temporarily.');
      console.error('   Atlas docs: https://www.mongodb.com/docs/atlas/security-whitelist/');
    }

    // Retry after 5 seconds instead of exiting
    console.log('   Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
