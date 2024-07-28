const express = require('express');
const { getAllRoles } = require('../controllers/roleController');

const router = express.Router();

router.get('/', getAllRoles);

module.exports = router;
