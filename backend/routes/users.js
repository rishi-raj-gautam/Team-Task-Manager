const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deactivateUser, getTeamMembers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

router.get('/', protect, getUsers);
router.get('/team', protect, getTeamMembers);
router.patch('/:id/role', protect, checkPermission('MANAGE_ROLES'), updateUserRole);
router.patch('/:id/deactivate', protect, checkPermission('DEACTIVATE_USERS'), deactivateUser);

module.exports = router;
