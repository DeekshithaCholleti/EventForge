const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const EventMember = require('../models/EventMember');
const { sendSuccess } = require('../utils/response');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const listAnnouncements = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    const items = await Announcement.find(filter).populate('event createdBy').sort({ createdAt: -1 });
    return sendSuccess(res, 'Announcements fetched', { items }, 200);
  } catch (error) { next(error); }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { event: eventId, title, message, content, targetAudience, status } = req.body;

    const event = await Event.findById(eventId);
    if (!event) throw new NotFoundError('Event not found');

    // Only organizer or platform admin may create announcements
    if (req.user.role !== 'PLATFORM_ADMIN') {
      const membership = await EventMember.findOne({
        event: eventId,
        user: req.user._id,
        status: 'ACTIVE',
        eventRole: 'ORGANIZER',
      });
      if (!membership) throw new ForbiddenError('Only the event organizer can create announcements');
    }

    // Support both 'message' (model field) and 'content' (legacy frontend field)
    const msgText = message || content;

    const item = await Announcement.create({
      event: eventId,
      title,
      message: msgText,
      targetAudience: targetAudience || 'ALL',
      status: status || 'PUBLISHED',
      publishedAt: new Date(),
      createdBy: req.user._id,
    });

    return sendSuccess(res, 'Announcement created and published', { item }, 201);
  } catch (error) { next(error); }
};

const getAnnouncementById = async (req, res, next) => {
  try {
    const item = await Announcement.findById(req.params.id).populate('event createdBy');
    if (!item) throw new NotFoundError('Announcement not found');
    return sendSuccess(res, 'Announcement fetched', { item }, 200);
  } catch (error) { next(error); }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) throw new NotFoundError('Announcement not found');

    if (req.user.role !== 'PLATFORM_ADMIN') {
      const membership = await EventMember.findOne({
        event: ann.event,
        user: req.user._id,
        status: 'ACTIVE',
        eventRole: 'ORGANIZER',
      });
      if (!membership) throw new ForbiddenError('Only the event organizer can update this announcement');
    }

    // Support content alias for message
    const updates = { ...req.body };
    if (updates.content && !updates.message) {
      updates.message = updates.content;
      delete updates.content;
    }

    const item = await Announcement.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    return sendSuccess(res, 'Announcement updated', { item }, 200);
  } catch (error) { next(error); }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) throw new NotFoundError('Announcement not found');

    if (req.user.role !== 'PLATFORM_ADMIN') {
      const membership = await EventMember.findOne({
        event: ann.event,
        user: req.user._id,
        status: 'ACTIVE',
        eventRole: 'ORGANIZER',
      });
      if (!membership) throw new ForbiddenError('Only the event organizer can delete this announcement');
    }

    await Announcement.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 'Announcement deleted', null, 200);
  } catch (error) { next(error); }
};

module.exports = { listAnnouncements, createAnnouncement, getAnnouncementById, updateAnnouncement, deleteAnnouncement };

