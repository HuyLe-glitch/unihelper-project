const mongoose = require('mongoose');

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Maximum retry attempts
const MAX_RETRIES = 3;
let retryCount = 0;

/**
 * Connect to MongoDB with retry mechanism
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ MongoDB connected successfully');
    
    // Reset retry count on successful connection
    retryCount = 0;
    
    // Handle connection events
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB connection error:', err);
      retryConnection();
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
      retryConnection();
    });
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    retryConnection();
  }
};

/**
 * Retry connection with exponential backoff
 */
const retryConnection = () => {
  if (retryCount >= MAX_RETRIES) {
    console.error(`❌ Failed to connect to MongoDB after ${MAX_RETRIES} attempts`);
    process.exit(1);
  }
  
  // Calculate backoff time: 2^retryCount * 1000ms
  const backoffTime = Math.pow(2, retryCount) * 1000;
  retryCount++;
  
  console.log(`⏱️ Retrying connection (${retryCount}/${MAX_RETRIES}) in ${backoffTime}ms...`);
  
  setTimeout(connectDB, backoffTime);
};

// Export the connection function
module.exports = connectDB;