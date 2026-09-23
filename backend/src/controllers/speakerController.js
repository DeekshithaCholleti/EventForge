const SpeakerProfile = require('../models/SpeakerProfile');
const EventMember = require('../models/EventMember');
const Event = require('../models/Event');
const { sendSuccess } = require('../utils/response');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const listSpeakerProfiles = async (req, res, next) => {
  try {
    if (req.query.event) {
      // Return speakers assigned to a specific event via EventMember
      const members = await EventMember.find({ event: req.query.event, eventRole: 'SPEAKER', status: 'ACTIVE' }).populate('user');
      const profiles = await Promise.all(
        members.map(async (m) => {
          const profile = await SpeakerProfile.findOne({ user: m.user?._id });
          return { member: m, profile, user: m.user };
        })
      );
      return sendSuccess(res, 'Event speakers fetched', { profiles }, 200);
    }
    const profiles = await SpeakerProfile.find().populate('user');
    return sendSuccess(res, 'Speaker profiles fetched', { profiles }, 200);
  } catch (error) { next(error); }
};

const createSpeakerProfile = async (req, res, next) => {
  try {
    const profile = await SpeakerProfile.create({ ...req.body, user: req.user._id });
    return sendSuccess(res, 'Speaker profile created', { profile }, 201);
  } catch (error) { next(error); }
};

const getSpeakerProfileById = async (req, res, next) => {
  try {
    const profile = await SpeakerProfile.findById(req.params.id).populate('user');
    if (!profile) throw new NotFoundError('Speaker profile not found');
    return sendSuccess(res, 'Speaker profile fetched', { profile }, 200);
  } catch (error) { next(error); }
};

const updateSpeakerProfile = async (req, res, next) => {
  try {
    const profile = await SpeakerProfile.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!profile) throw new NotFoundError('Speaker profile not found');
    return sendSuccess(res, 'Speaker profile updated', { profile }, 200);
  } catch (error) { next(error); }
};

// GET /api/v1/speakers/my-profile — get logged-in speaker's own profile (upsert if none)
const getMyProfile = async (req, res, next) => {
  try {
    let profile = await SpeakerProfile.findOne({ user: req.user._id }).populate('user');
    if (!profile) {
      profile = await SpeakerProfile.create({ user: req.user._id });
      profile = await SpeakerProfile.findOne({ user: req.user._id }).populate('user');
    }
    return sendSuccess(res, 'Speaker profile fetched', { profile }, 200);
  } catch (error) { next(error); }
};

// PATCH /api/v1/speakers/my-profile — update logged-in speaker's own profile
const updateMyProfile = async (req, res, next) => {
  try {
    const allowed = ['bio', 'designation', 'company', 'expertise', 'availability', 'presentationMaterials', 'socialLinks'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const profile = await SpeakerProfile.findOneAndUpdate(
      { user: req.user._id },
      update,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('user');
    return sendSuccess(res, 'Profile updated successfully', { profile }, 200);
  } catch (error) { next(error); }
};

// GET /api/v1/speakers/my-events — events the logged-in speaker is assigned to
const getMyEvents = async (req, res, next) => {
  try {
    const memberships = await EventMember.find({ user: req.user._id, eventRole: 'SPEAKER', status: 'ACTIVE' });
    const eventIds = memberships.map(m => m.event);
    const events = await Event.find({ _id: { $in: eventIds } }).populate('organization createdBy').sort({ startDate: 1 });
    return sendSuccess(res, 'Speaker events fetched', { events }, 200);
  } catch (error) { next(error); }
};

// POST /api/v1/speakers/assign-event
// body: { event, user, bio, designation, company, expertise[] }
const assignSpeakerToEvent = async (req, res, next) => {
  try {
    const { event: eventId, user: userId, ...profileData } = req.body;
    if (!eventId || !userId) {
      return res.status(400).json({ success: false, message: 'event and user are required' });
    }

    // Organizer/admin guard
    if (req.user.role !== 'PLATFORM_ADMIN') {
      const membership = await EventMember.findOne({ event: eventId, user: req.user._id, status: 'ACTIVE', eventRole: 'ORGANIZER' });
      if (!membership) throw new ForbiddenError('Only the event organizer can assign speakers');
    }

    // Upsert SpeakerProfile for the user
    await SpeakerProfile.findOneAndUpdate(
      { user: userId },
      profileData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Upsert EventMember with SPEAKER role
    const member = await EventMember.findOneAndUpdate(
      { event: eventId, user: userId },
      { eventRole: 'SPEAKER', status: 'ACTIVE' },
      { upsert: true, new: true }
    );

    return sendSuccess(res, 'Speaker assigned to event', { member }, 201);
  } catch (error) { next(error); }
};

// DELETE /api/v1/speakers/assign-event — remove speaker from event
const removeSpeakerFromEvent = async (req, res, next) => {
  try {
    const { event: eventId, user: userId } = req.query;
    if (req.user.role !== 'PLATFORM_ADMIN') {
      const membership = await EventMember.findOne({ event: eventId, user: req.user._id, status: 'ACTIVE', eventRole: 'ORGANIZER' });
      if (!membership) throw new ForbiddenError('Only the event organizer can remove speakers');
    }
    await EventMember.findOneAndDelete({ event: eventId, user: userId, eventRole: 'SPEAKER' });
    return sendSuccess(res, 'Speaker removed from event', null, 200);
  } catch (error) { next(error); }
};

module.exports = {
  listSpeakerProfiles,
  createSpeakerProfile,
  getSpeakerProfileById,
  updateSpeakerProfile,
  getMyProfile,
  updateMyProfile,
  getMyEvents,
  assignSpeakerToEvent,
  removeSpeakerFromEvent,
};
