const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listSessions, createSession, getSessionById, updateSession, deleteSession } = require('../controllers/sessionController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listSessions);
router.post('/', [
  body('event').isMongoId(),
  body('title').trim().notEmpty(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
], handleValidationErrors, createSession);
router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getSessionById);
router.patch('/:id', [param('id').isMongoId()], handleValidationErrors, updateSession);
router.delete('/:id', [param('id').isMongoId()], handleValidationErrors, deleteSession);
module.exports = router;
