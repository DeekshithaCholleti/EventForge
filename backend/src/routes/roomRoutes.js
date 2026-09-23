const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listRooms, createRoom, getRoomById, updateRoom, deleteRoom } = require('../controllers/roomController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listRooms);
router.post('/', [body('venue').isMongoId(), body('name').trim().notEmpty(), body('capacity').isInt({ min: 1 })], handleValidationErrors, createRoom);
router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getRoomById);
router.patch('/:id', [param('id').isMongoId()], handleValidationErrors, updateRoom);
router.delete('/:id', [param('id').isMongoId()], handleValidationErrors, deleteRoom);
module.exports = router;
