const express = require('express');
const facultyController = require('../controllers/facultyController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', facultyController.getAllFaculties);
router.get('/:id', facultyController.getFacultyById);
router.get('/:id/majors', facultyController.getMajorsByFaculty);

router.use(restrictTo('ADMIN'));
router.post('/', facultyController.createFaculty);
router.patch('/:id', facultyController.updateFaculty);
router.delete('/:id', facultyController.deleteFaculty);

module.exports = router;
