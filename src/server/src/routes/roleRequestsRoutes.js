const express = require('express');
const { getRoleRequests, updateRoleRequest , createRoleRequest} = require('../controllers/roleRequestsController');

const router = express.Router();

router.get('/', getRoleRequests);
router.post('/', createRoleRequest);
router.put('/:id', updateRoleRequest);

module.exports = router;
