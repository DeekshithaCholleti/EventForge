const StaffAssignment = require('../models/StaffAssignment');
const EventMember = require('../models/EventMember');
const { sendSuccess } = require('../utils/response');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const listStaffAssignments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    if (req.query.staff) filter.staff = req.query.staff;
    const items = await StaffAssignment.find(filter).populate('event staff assignedRoom');
    return sendSuccess(res, 'Staff assignments fetched', { items }, 200);
  } catch (error) { next(error); }
};

const createStaffAssignment = async (req, res, next) => {
  try {
    const { event: eventId } = req.body;

    // Only the event organizer (or platform admin) can assign staff
    if (req.user.role !== 'PLATFORM_ADMIN') {
      const membership = await EventMember.findOne({
        event: eventId,
        user: req.user._id,
        status: 'ACTIVE',
        eventRole: 'ORGANIZER',
      });
      if (!membership) {
        throw new ForbiddenError('Only the event organizer can assign staff to this event');
      }
    }

    const item = await StaffAssignment.create({ ...req.body, assignedBy: req.user._id });

    // Upsert EventMember so the staff member can access this event
    await EventMember.findOneAndUpdate(
      { event: eventId, user: req.body.staff },
      { eventRole: 'STAFF', status: 'ACTIVE' },
      { upsert: true, new: true }
    );

    return sendSuccess(res, 'Staff assignment created', { item }, 201);
  } catch (error) { next(error); }
};

const updateStaffAssignment = async (req, res, next) => {
  try {
    const assignment = await StaffAssignment.findById(req.params.id);
    if (!assignment) throw new NotFoundError('Staff assignment not found');

    if (req.user.role !== 'PLATFORM_ADMIN') {
      const membership = await EventMember.findOne({
        event: assignment.event,
        user: req.user._id,
        status: 'ACTIVE',
        eventRole: 'ORGANIZER',
      });
      if (!membership) throw new ForbiddenError('Only the event organizer can update staff assignments');
    }

    const item = await StaffAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return sendSuccess(res, 'Staff assignment updated', { item }, 200);
  } catch (error) { next(error); }
};

const deleteStaffAssignment = async (req, res, next) => {
  try {
    const assignment = await StaffAssignment.findById(req.params.id);
    if (!assignment) throw new NotFoundError('Staff assignment not found');

    if (req.user.role !== 'PLATFORM_ADMIN') {
      const membership = await EventMember.findOne({
        event: assignment.event,
        user: req.user._id,
        status: 'ACTIVE',
        eventRole: 'ORGANIZER',
      });
      if (!membership) throw new ForbiddenError('Only the event organizer can remove staff assignments');
    }

    await StaffAssignment.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 'Staff assignment removed', null, 200);
  } catch (error) { next(error); }
};

module.exports = { listStaffAssignments, createStaffAssignment, updateStaffAssignment, deleteStaffAssignment };

