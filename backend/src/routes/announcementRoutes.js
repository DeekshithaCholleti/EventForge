const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listAnnouncements, createAnnouncement, getAnnouncementById, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listAnnouncements);
router.post('/', [body('event').isMongoId(), body('title').trim().notEmpty(), body('message').optional().trim(), body('content').optional().trim()], handleValidationErrors, createAnnouncement);
router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getAnnouncementById);
router.patch('/:id', [param('id').isMongoId()], handleValidationErrors, updateAnnouncement);
router.delete('/:id', [param('id').isMongoId()], handleValidationErrors, deleteAnnouncement);
module.exports = router;

