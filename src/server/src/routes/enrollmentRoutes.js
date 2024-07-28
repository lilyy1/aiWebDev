const express = require('express');
const { deleteEnrollment, addEnrollment } = require('../controllers/enrollmentController'); 

const router = express.Router();

router.delete('/:userid', deleteEnrollment);
router.post('/', addEnrollment);  // new POST route for adding enrollments

module.exports = router;


