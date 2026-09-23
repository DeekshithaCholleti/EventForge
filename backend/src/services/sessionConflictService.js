const Session = require('../models/Session');

const getSessionOverlapQuery = (startTime, endTime, sessionId = null) => ({
  _id: { $ne: sessionId },
  startTime: { $lt: endTime },
  endTime: { $gt: startTime },
});

const checkRoomConflict = async ({ eventId, roomId, startTime, endTime, sessionId = null }) => {
  if (!eventId || !roomId || !startTime || !endTime) return null;

  const conflict = await Session.findOne({
    event: eventId,
    room: roomId,
    ...getSessionOverlapQuery(startTime, endTime, sessionId),
  });

  return conflict;
};

const checkSpeakerConflict = async ({ eventId, speakers = [], startTime, endTime, sessionId = null }) => {
  if (!eventId || !speakers.length || !startTime || !endTime) return null;

  const conflicts = await Session.find({
    event: eventId,
    speakers: { $in: speakers },
    ...getSessionOverlapQuery(startTime, endTime, sessionId),
  }).populate('speakers');

  return conflicts.length ? conflicts[0] : null;
};

module.exports = {
  checkRoomConflict,
  checkSpeakerConflict,
};
