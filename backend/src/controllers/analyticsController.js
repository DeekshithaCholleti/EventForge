const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const CheckIn = require('../models/CheckIn');
const Session = require('../models/Session');
const Feedback = require('../models/Feedback');
const SponsorAssignment = require('../models/SponsorAssignment');
const { sendSuccess } = require('../utils/response');

const getEventAnalytics = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.query.eventId;
    const stats = await Registration.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: '$registrationStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRegistrations = await Registration.countDocuments({ event: eventId });
    const confirmed = await Registration.countDocuments({ event: eventId, registrationStatus: 'CONFIRMED' });
    const pending = await Registration.countDocuments({ event: eventId, registrationStatus: 'PENDING' });
    const cancelled = await Registration.countDocuments({ event: eventId, registrationStatus: 'CANCELLED' });
    const waitlisted = await Registration.countDocuments({ event: eventId, registrationStatus: 'WAITLISTED' });
    const checkIns = await CheckIn.countDocuments({ event: eventId });
    const attendanceRate = totalRegistrations ? ((checkIns / totalRegistrations) * 100).toFixed(2) : 0;

    return sendSuccess(res, 'Event analytics fetched', { eventId, totals: { totalRegistrations, confirmed, pending, cancelled, waitlisted, checkIns, attendanceRate } }, 200);
  } catch (error) { next(error); }
};

const getSessionAnalytics = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.query.eventId;
    const sessions = await Session.find({ event: eventId }).lean();
    const results = await Promise.all(sessions.map(async (session) => {
      const selectionCount = await Registration.countDocuments({ event: eventId, ticketType: { $exists: true } });
      const attendanceCount = await Registration.countDocuments({ event: eventId, registrationStatus: 'CONFIRMED' });
      const ratingAvg = await Feedback.aggregate([
        { $match: { session: session._id } },
        { $group: { _id: null, average: { $avg: '$rating' }, total: { $sum: 1 } } },
      ]);

      return {
        session: session._id,
        title: session.title,
        selections: selectionCount,
        attendance: attendanceCount,
        popularity: Math.min(100, selectionCount * 10),
        averageRating: ratingAvg[0]?.average || 0,
      };
    }));

    return sendSuccess(res, 'Session analytics fetched', { results }, 200);
  } catch (error) { next(error); }
};

const getSponsorAnalytics = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.query.eventId;
    const items = await SponsorAssignment.find({ event: eventId }).populate('sponsor sponsorshipPackage');
    const summary = items.map((item) => ({
      sponsor: item.sponsor?.companyName || item.sponsor,
      package: item.sponsorshipPackage?.name || 'Package',
      status: item.status,
      completion: item.deliverables?.length ? (item.deliverables.filter((d) => d.status === 'COMPLETED').length / item.deliverables.length) * 100 : 0,
    }));
    return sendSuccess(res, 'Sponsor analytics fetched', { summary }, 200);
  } catch (error) { next(error); }
};

module.exports = { getEventAnalytics, getSessionAnalytics, getSponsorAnalytics };
