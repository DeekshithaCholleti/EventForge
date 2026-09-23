const { generateRecommendations } = require('../services/recommendationService');
const { sendSuccess } = require('../utils/response');

const listRecommendations = async (req, res, next) => {
  try {
    const data = await generateRecommendations({
      attendeeId: req.user._id,
      eventId: req.query.eventId,
      interests: req.query.interests ? String(req.query.interests).split(',') : [],
    });
    return sendSuccess(res, 'Session recommendations generated', { recommendations: data }, 200);
  } catch (error) { next(error); }
};

module.exports = { listRecommendations };
