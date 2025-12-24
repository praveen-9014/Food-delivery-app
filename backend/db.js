const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://praveen901471:praveen901471@cluster1.5monlg3.mongodb.net/food_delivery?retryWrites=true&w=majority';

async function connectDB() {
  try {
    // Set mongoose options to prevent buffering issues
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    console.log('[DB] Connected to MongoDB Atlas successfully');
    return true;
  } catch (err) {
    console.error('[DB] MongoDB Atlas connection failed:', err.message);
    throw err;
  }
}

module.exports = connectDB;


