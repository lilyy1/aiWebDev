const express = require('express');
const fileUpload = require('express-fileupload');
const { createAssignment , getAssignmentById , submitAssignment, getRubricFile, getAnswerKeyFile} = require('../controllers/assignmentController');
const router = express.Router();

router.use(fileUpload());

router.post('/create-assignments', createAssignment);
router.get('/:assignmentId', getAssignmentById);
router.post('/:assignmentId/submit', submitAssignment);
router.get('/:assignmentId/rubric', getRubricFile);
router.get('/:assignmentId/answerkey', getAnswerKeyFile);

module.exports = router;
