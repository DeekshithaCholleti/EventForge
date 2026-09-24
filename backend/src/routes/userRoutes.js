const express = require('express');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const { listUsers, getUserById, updateUserRole, updateUserStatus } = require('../controllers/userController');

const router = express.Router();

router.use(verifyToken);
router.get('/', authorizeRole('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), listUsers);
router.get('/:id', authorizeRole('PLATFORM_ADMIN'), getUserById);
router.patch('/:id/role', authorizeRole('PLATFORM_ADMIN'), updateUserRole);
router.patch('/:id/status', authorizeRole('PLATFORM_ADMIN'), updateUserStatus);

module.exports = router;

