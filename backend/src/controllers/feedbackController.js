const Feedback = require('../models/Feedback');
const { sendSuccess } = require('../utils/response');
const { ValidationError, ConflictError, NotFoundError } = require('../utils/errors');

const listFeedback = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    if (req.query.session) filter.session = req.query.session;
    if (req.query.attendee) filter.attendee = req.query.attendee;

    const items = await Feedback.find(filter).populate('session attendee event');
    return sendSuccess(res, 'Feedback fetched successfully', { items }, 200);
  } catch (error) {
    next(error);
  }
};

const createFeedback = async (req, res, next) => {
  try {
    const { event, session, rating, comment } = req.body;
    const attendee = req.user._id;

    if (rating === undefined || rating < 1 || rating > 5) {
      throw new ValidationError('Rating must be an integer between 1 and 5');
    }

    const existing = await Feedback.findOne({ session, attendee });
    if (existing) {
      // Update existing feedback
      existing.rating = rating;
      if (comment !== undefined) existing.comment = comment;
      await existing.save();
      return sendSuccess(res, 'Feedback updated successfully', { item: existing }, 200);
    }

    const item = await Feedback.create({
      event,
      session,
      attendee,
      rating,
      comment: comment || '',
    });

    return sendSuccess(res, 'Feedback submitted successfully', { item }, 201);
  } catch (error) {
    if (error.code === 11000) {
      return next(new ConflictError('Feedback already submitted for this session'));
    }
    next(error);
  }
};

module.exports = { listFeedback, createFeedback };
