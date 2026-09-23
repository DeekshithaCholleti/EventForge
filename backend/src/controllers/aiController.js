const AIService = require('../services/aiService');
const { sendSuccess } = require('../utils/response');

const generateEventDescription = async (req, res, next) => {
  try {
    const output = await AIService.generateEventDescription(req.body);
    return sendSuccess(res, 'Event description draft generated', { result: output }, 200);
  } catch (error) { next(error); }
};

const generateSpeakerBio = async (req, res, next) => {
  try {
    const output = await AIService.generateSpeakerBio(req.body);
    return sendSuccess(res, 'Speaker bio draft generated', { result: output }, 200);
  } catch (error) { next(error); }
};

const generateAnnouncement = async (req, res, next) => {
  try {
    const output = await AIService.generateAnnouncement(req.body);
    return sendSuccess(res, 'Announcement draft generated', { result: output }, 200);
  } catch (error) { next(error); }
};

const generateSessionSummary = async (req, res, next) => {
  try {
    const output = await AIService.generateSessionSummary(req.body);
    return sendSuccess(res, 'Session summary draft generated', { result: output }, 200);
  } catch (error) { next(error); }
};

module.exports = { generateEventDescription, generateSpeakerBio, generateAnnouncement, generateSessionSummary };
