const express = require('express');
const router = express.Router();
const { releaseGrades, modifyGradeAndFeedback, viewGrades } = require('../controllers/gradesController');

// Endpoint to release grades
router.put('/release-grades/:assignmentid', releaseGrades);


router.put('/edit-grades/:submissionId', modifyGradeAndFeedback);

router.get('/view-grades', viewGrades);

module.exports = router;