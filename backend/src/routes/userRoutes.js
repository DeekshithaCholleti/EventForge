const express = require('express');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const { listUsers, getUserById, updateUserRole, updateUserStatus } = require('../controllers/userController');

const router = express.Router();

router.use(verifyToken);
router.get('/', listUsers);
router.get('/:id', getUserById);
router.patch('/:id/role', authorizeRole('PLATFORM_ADMIN'), updateUserRole);
router.patch('/:id/status', authorizeRole('PLATFORM_ADMIN'), updateUserStatus);

module.exports = router;

