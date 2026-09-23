const { aiApiKey } = require('../config/env');

// ─── Gemini REST helper ───────────────────────────────────────────────────────
const callGemini = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${aiApiKey}`;
  const https = require('https');
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.8, maxOutputTokens: 512 },
  });
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          resolve(text.trim());
        } catch (e) { reject(new Error('Invalid Gemini response')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

// ─── Rich template fallback ───────────────────────────────────────────────────
const templateEventDescription = (input) => {
  const { name = 'the event', theme = 'innovation and leadership', targetAudience = 'industry professionals', keyTopics = 'emerging trends and best practices' } = input || {};
  return `${name} is a premier corporate event designed to bring together ${targetAudience} for an immersive experience centered around ${theme}. This carefully curated gathering offers a unique platform for meaningful connections, knowledge exchange, and professional growth in today's rapidly evolving landscape.\n\nAttendees can look forward to an action-packed agenda covering ${keyTopics}. Each session has been thoughtfully designed to deliver maximum value—whether through expert-led keynotes, interactive workshops, or collaborative panel discussions that challenge conventional thinking and spark new ideas.\n\nDon't miss this opportunity to position yourself at the forefront of your industry. ${name} promises to be an unforgettable experience that equips every participant with actionable insights, a powerful network of peers, and the inspiration to drive meaningful change in their organizations.`;
};

const templateSpeakerBio = (input) => {
  const { name = 'the speaker', background = 'a distinguished career in the industry', expertise = 'leadership and strategy', designation = 'Industry Expert', company = 'a leading organization' } = input || {};
  const firstName = name.split(' ')[0];
  return `${name} is a seasoned ${designation} at ${company}, bringing ${background} to every stage. With deep expertise in ${expertise}, ${firstName} has spent years at the intersection of innovation and execution—helping organizations navigate complex challenges and unlock new growth opportunities.\n\nA sought-after thought leader, ${firstName} has spoken at conferences across the globe and is recognized for translating complex ideas into clear, compelling narratives. Their passion for sharing knowledge makes every session an engaging and transformative experience.`;
};

const templateAnnouncement = (input) => {
  const { eventName = 'the event', type = 'UPDATE', details = 'important updates regarding the event schedule' } = input || {};
  const typeLabels = { REMINDER: 'a friendly reminder', UPDATE: 'an important update', CANCELLATION: 'a critical notice', GENERAL: 'an announcement' };
  const label = typeLabels[type] || 'an announcement';
  return `We would like to share ${label} regarding ${eventName}. Please take a moment to read the following carefully, as it contains information that may affect your participation and planning.\n\n${details}\n\nWe appreciate your continued support and enthusiasm for ${eventName}. Should you have any questions or require further clarification, please do not hesitate to reach out to our event coordination team. We look forward to an exceptional experience together.`;
};

const templateSessionSummary = (input) => {
  const { title = 'the session', description = 'key topics were discussed by industry experts' } = input || {};
  return `The session "${title}" delivered an engaging and insightful exploration of its core subject matter. ${description} Participants came away with a clear understanding of the topic's current state and future trajectory.\n\nKey takeaways included actionable strategies, thought-provoking perspectives, and practical frameworks that attendees can immediately apply in their professional contexts. The lively Q&A further enriched the discussion, surfacing nuanced points that will continue to resonate with participants well beyond the event.`;
};

// ─── AIService ────────────────────────────────────────────────────────────────
const AIService = {
  isConfigured: Boolean(aiApiKey),

  async generateEventDescription(input) {
    if (this.isConfigured) {
      const { name, theme, targetAudience, keyTopics } = input || {};
      const prompt = `Write a compelling 3-paragraph corporate event description for an event named "${name || 'Corporate Summit'}", themed around "${theme || 'innovation'}", targeting "${targetAudience || 'professionals'}", covering topics like "${keyTopics || 'leadership and technology'}". Be professional, engaging, and specific. Do not use placeholders.`;
      const content = await callGemini(prompt);
      return { content, draft: false };
    }
    return { content: templateEventDescription(input), draft: true };
  },

  async generateSpeakerBio(input) {
    if (this.isConfigured) {
      const { name, background, expertise, designation, company } = input || {};
      const prompt = `Write a professional 2-paragraph speaker biography for ${name || 'the speaker'}, a ${designation || 'professional'} at ${company || 'a leading firm'}, with background in "${background || 'technology leadership'}" and expertise in "${expertise || 'innovation'}". Be specific and compelling.`;
      const content = await callGemini(prompt);
      return { content, draft: false };
    }
    return { content: templateSpeakerBio(input), draft: true };
  },

  async generateAnnouncement(input) {
    if (this.isConfigured) {
      const { eventName, type, details } = input || {};
      const prompt = `Write a professional 2-paragraph event announcement for "${eventName || 'the event'}". Announcement type: ${type || 'GENERAL'}. Key details: "${details || 'important update'}". Be clear, warm, and professional.`;
      const content = await callGemini(prompt);
      return { content, draft: false };
    }
    return { content: templateAnnouncement(input), draft: true };
  },

  async generateSessionSummary(input) {
    if (this.isConfigured) {
      const { title, description } = input || {};
      const prompt = `Write a professional 2-paragraph summary of a conference session titled "${title || 'the session'}" with the following description: "${description || 'key topics were discussed'}". Be insightful and concise.`;
      const content = await callGemini(prompt);
      return { content, draft: false };
    }
    return { content: templateSessionSummary(input), draft: true };
  },
};

module.exports = AIService;

