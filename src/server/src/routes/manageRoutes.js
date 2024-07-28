const express = require('express');
const fileUpload = require('express-fileupload');
const { uploadCsv, getAccessCode, getStudentsFile, checkAccessCodeAndEmail } = require('../controllers/manageController');
const router = express.Router();

router.use(fileUpload());

router.get('/upload-csv/:courseid', (req, res) => {
    res.send('upload-csv');
});
router.post('/upload-csv/:courseid', uploadCsv);

router.get('/access-code/:courseid', getAccessCode);

router.get('/download-students/:courseid', getStudentsFile);

router.post('/check-access-code-and-email', checkAccessCodeAndEmail); 

module.exports = router;