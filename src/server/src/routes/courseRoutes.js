const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/:courseid', courseController.getCourseDetails);
router.get('/', courseController.getAllCourses);

module.exports = router;