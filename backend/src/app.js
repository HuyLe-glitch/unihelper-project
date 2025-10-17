// Entry point for the backend application
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// --- CORS setup ---
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Frontend dev ports
    credentials: true, // allow cookies/auth headers
  })
);

// --- Middleware setup ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Import routes ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

// --- Mount routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/certificates', certificateRoutes);

// --- Health check route ---
app.get('/', (req, res) => {
  res.send('✅ UniHelper Backend Running');
});

// --- Global error handler (optional but good practice) ---
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
