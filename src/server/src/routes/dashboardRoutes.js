const express = require('express');
const { getCourse, getAnnouncements, getAssignments } = require('../controllers/dashboardController');
const { authenticateToken } = require('./protectedRoutes');  // Import authenticateToken from protectedRoutes
const router = express.Router();

// Ensure all dashboard routes are protected by authentication
router.use(authenticateToken);

// Route to get course details
router.get('/course/:courseId', getCourse);

// Route to get announcements
router.get('/announcements-page', getAnnouncements);

// Route to get assignments
router.get('/assignments/:id', getAssignments);


module.exports = router;
