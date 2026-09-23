const Sponsor = require('../models/Sponsor');
const EventMember = require('../models/EventMember');
const { sendSuccess } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const listSponsors = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    const sponsors = await Sponsor.find(filter).populate('event user');
    return sendSuccess(res, 'Sponsors fetched', { sponsors }, 200);
  } catch (error) { next(error); }
};

const createSponsor = async (req, res, next) => {
  try {
    const sponsor = await Sponsor.create(req.body);

    // Upsert EventMember so the sponsor user can access this event
    if (sponsor.user && sponsor.event) {
      await EventMember.findOneAndUpdate(
        { event: sponsor.event, user: sponsor.user },
        { eventRole: 'SPONSOR', status: 'ACTIVE' },
        { upsert: true, new: true }
      );
    }

    return sendSuccess(res, 'Sponsor created successfully', { sponsor }, 201);
  } catch (error) { next(error); }
};

const getSponsorById = async (req, res, next) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id).populate('event user');
    if (!sponsor) throw new NotFoundError('Sponsor not found');
    return sendSuccess(res, 'Sponsor fetched', { sponsor }, 200);
  } catch (error) { next(error); }
};

const updateSponsor = async (req, res, next) => {
  try {
    const sponsor = await Sponsor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sponsor) throw new NotFoundError('Sponsor not found');
    return sendSuccess(res, 'Sponsor updated successfully', { sponsor }, 200);
  } catch (error) { next(error); }
};

const deleteSponsor = async (req, res, next) => {
  try {
    const sponsor = await Sponsor.findByIdAndDelete(req.params.id);
    if (!sponsor) throw new NotFoundError('Sponsor not found');
    // Remove the EventMember entry too
    if (sponsor.user && sponsor.event) {
      await EventMember.findOneAndDelete({ event: sponsor.event, user: sponsor.user, eventRole: 'SPONSOR' });
    }
    return sendSuccess(res, 'Sponsor removed', null, 200);
  } catch (error) { next(error); }
};

const getMySponsorships = async (req, res, next) => {
  try {
    const sponsorships = await Sponsor.find({ user: req.user._id }).populate('event');
    return sendSuccess(res, 'Sponsorships fetched', { sponsorships }, 200);
  } catch (error) { next(error); }
};

module.exports = { listSponsors, createSponsor, getSponsorById, updateSponsor, deleteSponsor, getMySponsorships };

