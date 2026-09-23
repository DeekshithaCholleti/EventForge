const Session = require('../models/Session');
const SessionRecommendation = require('../models/SessionRecommendation');

const generateRecommendations = async ({ attendeeId, eventId, interests = [] }) => {
  const sessions = await Session.find({ event: eventId, status: 'PUBLISHED' }).lean();

  const recommendations = await Promise.all(
    sessions.map(async (session) => {
      let score = 30;
      const tagSet = new Set((session.tags || []).map((tag) => tag.toLowerCase()));
      const interestSet = (interests || []).map((item) => item.toLowerCase());

      const matchCount = interestSet.filter((item) => tagSet.has(item)).length;
      score += matchCount * 20;

      if (session.capacity && session.capacity > 40) score += 10;

      const reasonParts = [];
      if (matchCount > 0) reasonParts.push(`matches your interests (${matchCount})`);
      if (session.tags && session.tags.length) reasonParts.push(`tags: ${session.tags.slice(0, 2).join(', ')}`);

      const scoreValue = Math.min(95, Math.max(35, score));
      const reason = reasonParts.length ? reasonParts.join('; ') : 'popular session in this event';

      return {
        event: eventId,
        attendee: attendeeId,
        session: session._id,
        score: Math.round(scoreValue),
        reason,
      };
    })
  );

  const results = recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  await Promise.all(
    results.map(async (entry) => {
      await SessionRecommendation.findOneAndUpdate(
        { event: entry.event, attendee: entry.attendee, session: entry.session },
        { ...entry, generatedAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    })
  );

  return results;
};

module.exports = { generateRecommendations };
