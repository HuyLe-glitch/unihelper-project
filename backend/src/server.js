const app = require('./app');
const http = require('http');
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/**
 * Graceful shutdown function
 * - Closes server connections
 * - Allows existing requests to complete
 * - Closes database connections
 */
function gracefulShutdown() {
  console.log('🛑 Received shutdown signal, closing server...');
  
  server.close(() => {
    console.log('✅ Server closed');
    
    // Close database connections if any
    // If you're using mongoose, you can add:
    // mongoose.connection.close(false, () => {
    //   console.log('MongoDB connection closed');
    //   process.exit(0);
    // });
    
    process.exit(0);
  });
  
  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}
