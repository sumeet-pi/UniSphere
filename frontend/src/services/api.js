/**
 * UniSphere Centralized API Client
 * Interfaces with FastAPI backend at VITE_API_URL
 * Conforms to API_SPECIFICATION.md
 */

import { notify } from './notification';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

class ApiError extends Error {
  constructor(message, status, code = null, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Core HTTP request handler with centralized error processing
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('unisphere_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    const errorMsg = 'Unable to connect to the server. Please ensure the backend is running.';
    if (options.showToast !== false) {
      notify.error(errorMsg);
    }
    throw new ApiError(errorMsg, 0, 'NETWORK_ERROR');
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred.';
    let errorCode = 'SERVER_ERROR';

    if (data) {
      if (data.message) {
        errorMessage = data.message;
      } else if (data.detail) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (typeof data.detail === 'object') {
          if (Array.isArray(data.detail)) {
            errorMessage = data.detail.map(d => d.msg || `${d.loc?.join('.')}: invalid`).join(', ');
            errorCode = 'VALIDATION_ERROR';
          } else {
            errorMessage = data.detail.message || JSON.stringify(data.detail);
            errorCode = data.detail.code || 'API_ERROR';
          }
        }
      }
      if (data.error) {
        errorCode = data.error;
      }
      if (data.fieldErrors && Array.isArray(data.fieldErrors)) {
        errorMessage = data.fieldErrors.map(f => `${f.field}: ${f.message}`).join(', ');
      }
    }

    const shouldToast = options.showToast !== false && options.skipToast !== true;
    if (shouldToast) {
      if (response.status === 401) {
        // Do not toast for silent session restoration checks
        if (!options.isRestoring) {
          notify.error(errorMessage || 'Your session has expired. Please sign in again.');
        }
      } else if (response.status === 403) {
        notify.error(errorMessage || 'You do not have permission to perform this action.');
      } else if (response.status === 404) {
        // Opt-in or opt-out: if fallback route checking, might want to skip
        if (!endpoint.includes('/api/v1/auth/login')) {
          notify.error(errorMessage || 'Requested resource not found.');
        }
      } else if (response.status === 409) {
        notify.error(errorMessage || 'Resource conflict encountered.');
      } else if (response.status === 422 || errorCode === 'VALIDATION_ERROR') {
        notify.error(errorMessage || 'Validation error. Please verify the provided details.');
      } else if (response.status >= 500) {
        notify.error('A server error occurred. Please try again later.');
      } else {
        notify.error(errorMessage);
      }
    }

    throw new ApiError(errorMessage, response.status, errorCode, data);
  }

  // Gracefully adapt unified envelope: { success: true, statusCode: 200, data: ... }
  if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
    // If login response, alias access_token for older frontend callers
    if (data.data && data.data.token) {
      data.access_token = data.data.token;
      data.user = data.data.user;
    }
    return data.data;
  }

  return data;
}

export function normalizeApiError(err) {
  if (err instanceof ApiError) {
    return err.message;
  }
  if (err?.message) {
    return err.message;
  }
  return 'An unexpected error occurred.';
}

export const api = {
  // Base URL
  baseUrl: API_BASE_URL,

  // 1. Auth Endpoints
  login: async (credentials) => {
    // Attempt standard API v1 first, fallback if needed
    try {
      const res = await request('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        skipToast: true, // Let caller handle login toast specifically
      });
      // Normalize token format
      const token = res.token || res.access_token;
      const user = res.user;
      return { access_token: token, token, user };
    } catch (e) {
      // Fallback to legacy route if v1 fails on 404
      if (e.status === 404) {
        return request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
          skipToast: true,
        });
      }
      throw e;
    }
  },

  signup: (userData) => {
    return request('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  registerStudent: (userData) => {
    return request('/api/auth/register/student', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  registerCoordinator: (coordinatorData) => {
    return request('/api/auth/register/coordinator', {
      method: 'POST',
      body: JSON.stringify(coordinatorData),
    });
  },

  getMe: async (options = {}) => {
    try {
      const res = await request('/api/v1/auth/me', { method: 'GET', ...options });
      return res.user || res;
    } catch (e) {
      if (e.status === 404) {
        return request('/api/auth/me', { method: 'GET', ...options });
      }
      throw e;
    }
  },

  updateMe: async (userData) => {
    try {
      const res = await request('/api/v1/auth/me', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return res.user || res;
    } catch (e) {
      if (e.status === 404) {
        return request('/api/auth/me', {
          method: 'PUT',
          body: JSON.stringify(userData),
        });
      }
      throw e;
    }
  },


  // 2. Student Profile & Search
  getStudentProfile: () => request('/api/v1/students/me', { method: 'GET' }),
  updateStudentProfile: (profileData) => request('/api/v1/students/me', { method: 'PUT', body: JSON.stringify(profileData) }),
  getStudentIdCard: () => request('/api/v1/students/me/id-card', { method: 'GET' }),
  searchStudents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/v1/students/search${q ? `?${q}` : ''}`, { method: 'GET' });
  },

  // 3. Clubs Catalog & Profiles
  getClubs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/v1/clubs${q ? `?${q}` : ''}`, { method: 'GET' });
  },
  getClubById: (clubId) => request(`/api/v1/clubs/${clubId}`, { method: 'GET' }),
  updateClub: (clubId, clubData) => request(`/api/v1/clubs/${clubId}`, { method: 'PUT', body: JSON.stringify(clubData) }),
  registerClub: (clubData) => request('/api/v1/clubs', { method: 'POST', body: JSON.stringify(clubData) }),
  getClubMembers: (clubId) => request(`/api/v1/clubs/${clubId}/members`, { method: 'GET' }),
  addClubMember: (clubId, memberData) => request(`/api/v1/clubs/${clubId}/members`, { method: 'POST', body: JSON.stringify(memberData) }),
  removeClubMember: (clubId, userId) => request(`/api/v1/clubs/${clubId}/members/${userId}`, { method: 'DELETE' }),
  joinClub: (clubId) => request(`/api/v1/clubs/${clubId}/join`, { method: 'POST' }),
  leaveClub: (clubId) => request(`/api/v1/clubs/${clubId}/leave`, { method: 'DELETE' }),
  updateMemberRole: (clubId, userId, payload) => request(`/api/v1/clubs/${clubId}/members/${userId}/role`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // 4. Tasks
  getClubTasks: (clubId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/v1/clubs/${clubId}/tasks${q ? `?${q}` : ''}`, { method: 'GET' });
  },
  createTask: (clubId, taskData) => request(`/api/v1/clubs/${clubId}/tasks`, { method: 'POST', body: JSON.stringify(taskData) }),
  toggleTaskStatus: (clubId, taskId, payload) => request(`/api/v1/clubs/${clubId}/tasks/${taskId}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // 5. Events & Lifecycle
  getEvents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/v1/events${q ? `?${q}` : ''}`, { method: 'GET' });
  },
  getEventById: (eventId) => request(`/api/v1/events/${eventId}`, { method: 'GET' }),
  createEvent: (clubId, eventData) => request(`/api/v1/clubs/${clubId}/events`, { method: 'POST', body: JSON.stringify(eventData) }),
  transitionEventStage: (eventId, stageData) => request(`/api/v1/events/${eventId}/stage`, { method: 'PATCH', body: JSON.stringify(stageData) }),

  // 6. RSVP, Passes & Check-in
  rsvpEvent: (eventId) => request(`/api/v1/events/${eventId}/rsvp`, { method: 'POST' }),
  teamRsvpEvent: (eventId, teamData) => request(`/api/v1/events/${eventId}/team-rsvp`, { method: 'POST', body: JSON.stringify(teamData) }),
  cancelRsvp: (eventId) => request(`/api/v1/events/${eventId}/rsvp`, { method: 'DELETE' }),
  getStudentRegistrations: () => request('/api/v1/student/registrations', { method: 'GET' }),
  checkInPass: (eventId, passCode) => request(`/api/v1/events/${eventId}/registrations/${passCode}/check-in`, { method: 'PATCH' }),

  // 7. Winners & Certificates
  getEventWinners: (eventId) => request(`/api/v1/events/${eventId}/winners`, { method: 'GET' }),
  declareEventWinners: (eventId, winnersData) => request(`/api/v1/events/${eventId}/winners`, { method: 'POST', body: JSON.stringify(winnersData) }),
  getCertificate: (credentialId) => request(`/api/v1/certificates/${credentialId}`, { method: 'GET' }),
  getCertificatePdfUrl: (credentialId) => `${API_BASE_URL}/api/v1/certificates/${credentialId}/pdf`,

  // 8. Campus Bulletins & Announcements
  getAnnouncements: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/v1/announcements${q ? `?${q}` : ''}`, { method: 'GET' });
  },
  broadcastAnnouncement: (clubId, data) => request(`/api/v1/clubs/${clubId}/announcements`, { method: 'POST', body: JSON.stringify(data) }),

  // 9. Club Analytics & NAAC
  getClubAnalyticsSummary: (clubId, horizon = 'spring2026') => request(`/api/v1/clubs/${clubId}/analytics/summary?horizon=${horizon}`, { method: 'GET' }),
  getNaacAuditReport: (clubId) => request(`/api/v1/clubs/${clubId}/analytics/naac-audit`, { method: 'GET' }),
  getNaacExportUrl: (clubId, format = 'csv') => `${API_BASE_URL}/api/v1/clubs/${clubId}/analytics/naac-audit/export?format=${format}`,

  // 10. Admin Governance
  getPendingClubs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/v1/admin/clubs/pending${q ? `?${q}` : ''}`, { method: 'GET' });
  },
  approveClub: (clubId) => request(`/api/v1/admin/clubs/${clubId}/approve`, { method: 'PATCH' }),
  rejectClub: (clubId, payload) => request(`/api/v1/admin/clubs/${clubId}/reject`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Health checks
  checkHealth: () => request('/health', { method: 'GET' }),
  checkDbHealth: () => request('/health/ready', { method: 'GET' }),
};

export { ApiError };
