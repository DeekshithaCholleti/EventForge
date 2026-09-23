import api from './client';

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.patch(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

export const sessionAPI = {
  getAll: (params) => api.get('/sessions', { params }),
  getById: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  update: (id, data) => api.patch(`/sessions/${id}`, data),
  delete: (id) => api.delete(`/sessions/${id}`),
};

export const venueAPI = {
  getAll: (params) => api.get('/venues', { params }),
  create: (data) => api.post('/venues', data),
};

export const roomAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  create: (data) => api.post('/rooms', data),
};

export const ticketTypeAPI = {
  getAll: (params) => api.get('/ticket-types', { params }),
  create: (data) => api.post('/ticket-types', data),
  update: (id, data) => api.patch(`/ticket-types/${id}`, data),
  delete: (id) => api.delete(`/ticket-types/${id}`),
};

export const couponAPI = {
  getAll: (params) => api.get('/coupons', { params }),
  create: (data) => api.post('/coupons', data),
};

export const registrationAPI = {
  getAll: (params) => api.get('/registrations', { params }),
  create: (data) => api.post('/registrations', data),
};

export const ticketAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
};

export const checkInAPI = {
  getAll: (params) => api.get('/checkins', { params }),
  create: (data) => api.post('/checkins', data),
};

export const sessionAttendanceAPI = {
  getAll: (params) => api.get('/session-attendance', { params }),
  create: (data) => api.post('/session-attendance', data),
};

export const announcementAPI = {
  getAll: (params) => api.get('/announcements', { params }),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.patch(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const feedbackAPI = {
  getAll: (params) => api.get('/feedback', { params }),
  create: (data) => api.post('/feedback', data),
};

export const analyticsAPI = {
  getEvent: (eventId) => api.get(`/analytics/event/${eventId}`),
  getSession: (eventId) => api.get(`/analytics/session/${eventId}`),
  getSponsor: (eventId) => api.get(`/analytics/sponsor/${eventId}`),
};

export const aiAPI = {
  eventDescription: (data) => api.post('/ai/event-description', data),
  speakerBio: (data) => api.post('/ai/speaker-bio', data),
  announcement: (data) => api.post('/ai/announcement', data),
  sessionSummary: (data) => api.post('/ai/session-summary', data),
};

export const recommendationAPI = {
  get: (eventId) => api.get(`/recommendations/${eventId}`),
  generate: (data) => api.post('/recommendations/generate', data),
};

export const sponsorAPI = {
  getAll: (params) => api.get('/sponsors', { params }),
  create: (data) => api.post('/sponsors', data),
  update: (id, data) => api.patch(`/sponsors/${id}`, data),
  delete: (id) => api.delete(`/sponsors/${id}`),
  getMySponsorships: () => api.get('/sponsors/my-sponsorships'),
};

export const sponsorshipPackageAPI = {
  getAll: (params) => api.get('/sponsorship-packages', { params }),
  create: (data) => api.post('/sponsorship-packages', data),
  update: (id, data) => api.patch(`/sponsorship-packages/${id}`, data),
};

export const sponsorAssignmentAPI = {
  getAll: (params) => api.get('/sponsor-assignments', { params }),
  create: (data) => api.post('/sponsor-assignments', data),
  update: (id, data) => api.patch(`/sponsor-assignments/${id}`, data),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  updateStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),
};

export const staffAssignmentAPI = {
  getAll: (params) => api.get('/staff-assignments', { params }),
  create: (data) => api.post('/staff-assignments', data),
  update: (id, data) => api.patch(`/staff-assignments/${id}`, data),
  delete: (id) => api.delete(`/staff-assignments/${id}`),
};

export const speakerAPI = {
  getAll: (params) => api.get('/speakers', { params }),
  assignToEvent: (data) => api.post('/speakers/assign-event', data),
  removeFromEvent: (params) => api.delete('/speakers/assign-event', { params }),
  getMyProfile: () => api.get('/speakers/my-profile'),
  updateMyProfile: (data) => api.patch('/speakers/my-profile', data),
  getMyEvents: () => api.get('/speakers/my-events'),
};

export const eventMemberAPI = {
  getAll: (params) => api.get('/event-members', { params }),
  create: (data) => api.post('/event-members', data),
  delete: (id) => api.delete(`/event-members/${id}`),
};

export const organizationAPI = {
  getAll: (params) => api.get('/organizations', { params }),
  getById: (id) => api.get(`/organizations/${id}`),
  create: (data) => api.post('/organizations', data),
  update: (id, data) => api.patch(`/organizations/${id}`, data),
};

