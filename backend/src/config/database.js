const mongoose = require('mongoose');
const { mongoUri, nodeEnv } = require('./env');

const connectDB = async () => {
  try {
    const dbUri = mongoUri;
    await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 5000,
    });

    if (nodeEnv !== 'test') {
      console.log('MongoDB connected');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
