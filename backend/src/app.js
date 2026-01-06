// Entry point for the backend application
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const globalErrorHandler = require('./middleware/errorHandler');
const { AppError } = require('./utils/appError');
const { attachSocketIO } = require('./middleware/socketMiddleware');


// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// --- CORS setup (Local + Production) ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, health checks)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Middleware setup ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Socket.IO Middleware (Dependency Injection) ---
// Gắn io vào mọi request để Controller có thể emit event
app.use(attachSocketIO);

// --- Import routes ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const certificateRequestRoutes = require('./routes/certificateRequestRoutes');
const dormitoryRoutes = require('./routes/dormitoryRoutes');
const reportRoutes = require('./routes/reportRoutes');

const staffRoutes = require('./routes/staffRoutes');
// staffRoleRoutes và departmentRoutes đã được xóa - hệ thống chỉ có 2 staff cố định

const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const majorRoutes = require('./routes/majorRoutes');

const semesterRoutes = require('./routes/semesterRoutes');
const semesterTemplateRoutes = require('./routes/semesterTemplateRoutes');
const roomRoutes = require('./routes/roomRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const fileRoutes = require('./routes/fileRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const studentNotificationRoutes = require('./routes/studentNotificationRoutes');


// --- Mount routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/certificate-requests', certificateRequestRoutes);
app.use('/api/dormitory', dormitoryRoutes);
app.use('/api/reports', reportRoutes);

app.use('/api/staff', staffRoutes);
// Đã xóa routes: /api/staff-roles và /api/departments (không cần thiết)

app.use('/api/students', studentRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/majors', majorRoutes);

app.use('/api/semesters', semesterRoutes);
app.use('/api/semester-templates', semesterTemplateRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/student-notifications', studentNotificationRoutes);


// --- Health check endpoint (Required for Cloud Run) ---
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'unihelper-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});


// --- Health check route ---
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '✅ UniHelper Backend Running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// --- Handle undefined routes ---
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// --- Global error handling middleware ---
app.use(globalErrorHandler);

module.exports = app;
