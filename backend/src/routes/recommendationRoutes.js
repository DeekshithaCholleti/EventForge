const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { listRecommendations } = require('../controllers/recommendationController');

const router = express.Router();
router.use(verifyToken);
router.get('/', listRecommendations);
module.exports = router;
