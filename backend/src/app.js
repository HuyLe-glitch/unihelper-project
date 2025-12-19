// Entry point for the backend application
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const globalErrorHandler = require('./middleware/errorHandler');
const { AppError } = require('./utils/appError');


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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
