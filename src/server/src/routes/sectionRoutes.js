const express = require('express');
const { createSection } = require('../controllers/sectionController');
const router = express.Router();

router.post('/create-section', createSection);


module.exports = router;