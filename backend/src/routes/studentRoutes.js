const express = require('express');
const studentController = require('../controllers/studentController');
const { createStudent, updateStudent, idValidation } = require('../validators/studentValidation');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// protect all student routes
router.use(protect);

// only ADMIN can create/update/delete students
router.post('/', restrictTo('ADMIN'), createStudent, studentController.createStudent);
router.get('/', restrictTo('ADMIN'), studentController.listStudents);
router.get('/:id', restrictTo('ADMIN'), idValidation, studentController.getStudentById);
router.patch('/:id', restrictTo('ADMIN'), updateStudent, studentController.updateStudent);
router.delete('/:id', restrictTo('ADMIN'), idValidation, studentController.deleteStudent);

module.exports = router;