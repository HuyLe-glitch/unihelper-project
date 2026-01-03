const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// ==========================================
// SOCKET.IO CONFIGURATION
// ==========================================
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Client tham gia phòng KTX (JOIN_ROOM)
  socket.on('JOIN_ROOM', (roomId) => {
    if (roomId) {
      socket.join(roomId);
      console.log(`👤 Socket ${socket.id} joined room: ${roomId}`);
    }
  });

  // Client rời phòng (LEAVE_ROOM)
  socket.on('LEAVE_ROOM', (roomId) => {
    if (roomId) {
      socket.leave(roomId);
      console.log(`👤 Socket ${socket.id} left room: ${roomId}`);
    }
  });

  // Xử lý ngắt kết nối
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Gắn io vào app để sử dụng trong middleware
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO is ready for connections`);
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
