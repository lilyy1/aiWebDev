const express = require('express');
const router = express.Router();
const { getAssignmentListByCourseId, getAssignmentListByCourseIdStudent, deleteAssignment , updateAssignmentPrompt} = require('../controllers/assignmentController');

// Middleware to log the courseId from query parameters
router.use((req, res, next) => {
    if (req.query.courseid) {
        console.log(`Incoming request for courseId: ${req.query.courseid}`);
    }
    next(); // Proceed to the next middleware or route handler
});

// Updated route to use query parameter for courseId
router.get('/', (req, res) => {
    if (req.query.courseid) {
        getAssignmentListByCourseId(req, res);
    } else {
        res.status(400).send('courseId query parameter is required');
    }
});
router.get('/student', (req, res) => {
    if (req.query.courseid) {
        getAssignmentListByCourseIdStudent(req, res);
    } else {
        res.status(400).send('courseId query parameter is required');
    }
});

router.delete('/:id', deleteAssignment);

router.put('/:assignmentId/prompt', updateAssignmentPrompt);


module.exports = router;