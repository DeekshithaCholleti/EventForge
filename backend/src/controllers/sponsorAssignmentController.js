const SponsorAssignment = require('../models/SponsorAssignment');
const EventMember = require('../models/EventMember');
const { sendSuccess } = require('../utils/response');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const checkOrganizer = async (eventId, userId, role) => {
  if (role === 'PLATFORM_ADMIN') return;
  const membership = await EventMember.findOne({
    event: eventId,
    user: userId,
    status: 'ACTIVE',
    eventRole: 'ORGANIZER',
  });
  if (!membership) throw new ForbiddenError('Only the event organizer can manage sponsor assignments');
};

const listAssignments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    if (req.query.sponsor) filter.sponsor = req.query.sponsor;
    const items = await SponsorAssignment.find(filter).populate('event sponsor sponsorshipPackage');
    return sendSuccess(res, 'Sponsor assignments fetched', { items }, 200);
  } catch (error) { next(error); }
};

const createAssignment = async (req, res, next) => {
  try {
    await checkOrganizer(req.body.event, req.user._id, req.user.role);
    const item = await SponsorAssignment.create(req.body);
    return sendSuccess(res, 'Sponsor assignment created successfully', { item }, 201);
  } catch (error) { next(error); }
};

const getAssignmentById = async (req, res, next) => {
  try {
    const item = await SponsorAssignment.findById(req.params.id).populate('event sponsor sponsorshipPackage');
    if (!item) throw new NotFoundError('Sponsor assignment not found');
    return sendSuccess(res, 'Sponsor assignment fetched', { item }, 200);
  } catch (error) { next(error); }
};

const updateAssignment = async (req, res, next) => {
  try {
    const existing = await SponsorAssignment.findById(req.params.id);
    if (!existing) throw new NotFoundError('Sponsor assignment not found');
    
    let isSponsor = false;
    let isOrganizer = false;

    if (req.user.role === 'PLATFORM_ADMIN') {
      isOrganizer = true;
    } else {
      const membership = await EventMember.findOne({ event: existing.event, user: req.user._id, status: 'ACTIVE', eventRole: 'ORGANIZER' });
      if (membership) {
        isOrganizer = true;
      } else {
        const Sponsor = require('../models/Sponsor');
        const sponsorRec = await Sponsor.findOne({ _id: existing.sponsor, user: req.user._id });
        if (sponsorRec) {
          isSponsor = true;
        }
      }
    }

    if (!isOrganizer && !isSponsor) {
      throw new ForbiddenError('Only the event organizer or assigned sponsor can manage this assignment');
    }

    let updateData = req.body;
    if (isSponsor && !isOrganizer) {
      // Sponsor can only update deliverables (e.g. status)
      updateData = {};
      if (req.body.deliverables) {
        updateData.deliverables = req.body.deliverables;
      }
    }

    const item = await SponsorAssignment.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    return sendSuccess(res, 'Sponsor assignment updated successfully', { item }, 200);
  } catch (error) { next(error); }
};

module.exports = { listAssignments, createAssignment, getAssignmentById, updateAssignment };
