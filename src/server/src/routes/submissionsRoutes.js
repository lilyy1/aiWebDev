const express = require('express');
const { getSubmissions, getSubmission, getSubmissionFile, getSubmissionId } = require('../controllers/submissionsController');

const router = express.Router();

router.get('/:id', getSubmissions);

router.get('/get/:id', getSubmission);

router.get('/file/:id', getSubmissionFile);

router.get('/:assignmentid/:userid', getSubmissionId);

module.exports = router;