const express = require('express');
const majorController = require('../controllers/majorController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', majorController.getMajors);
router.get('/:id', majorController.getMajorById);

router.use(restrictTo('ADMIN'));
router.post('/', majorController.createMajor);
router.patch('/:id', majorController.updateMajor);
router.delete('/:id', majorController.deleteMajor);

module.exports = router;
