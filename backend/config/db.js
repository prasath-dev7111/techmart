// ============================================================
// config/db.js – MongoDB Connection
// Uses Mongoose to connect. Called once at server startup.
// ============================================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Stop server if DB can't connect
  }
};

module.exports = connectDB;
