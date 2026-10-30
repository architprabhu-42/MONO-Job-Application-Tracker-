// All HTTP calls to the Express API live here.
import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send the HTTP-only auth cookie
});

// Every API response looks like { success, message, data }; callers only need data.
const unwrap = (request) => request.then((res) => res.data.data);

// ---------- helpers ----------
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.request && !error.response) return 'Cannot reach the server. Please check that the API is running.';
  return fallback;
}

// Copies field errors from the API ({ errors: { field: msg } }) onto a React Hook Form.
export function applyServerErrors(error, setError) {
  const errors = error?.response?.data?.errors;
  if (!errors) return false;
  Object.entries(errors).forEach(([field, message]) => setError(field, { type: 'server', message }));
  return true;
}

export const resumeFileUrl = (id, { download = false } = {}) =>
  `${API_BASE_URL}/resumes/${id}/download${download ? '?download=1' : ''}`;

// ---------- endpoints ----------
export const authApi = {
  me: () => unwrap(api.get('/auth/me')),
  login: (body) => unwrap(api.post('/auth/login', body)),
  register: (body) => unwrap(api.post('/auth/register', body)),
  logout: () => unwrap(api.post('/auth/logout')),
  updateProfile: (body) => unwrap(api.put('/auth/me', body)),
};

export const applicationsApi = {
  list: (params) => unwrap(api.get('/applications', { params })),
  get: (id) => unwrap(api.get(`/applications/${id}`)),
  create: (body) => unwrap(api.post('/applications', body)),
  update: (id, body) => unwrap(api.put(`/applications/${id}`, body)),
  updateStatus: (id, status) => unwrap(api.patch(`/applications/${id}/status`, { status })),
  remove: (id) => unwrap(api.delete(`/applications/${id}`)),
};

export const resumesApi = {
  list: () => unwrap(api.get('/resumes')),
  get: (id) => unwrap(api.get(`/resumes/${id}`)),
  create: (formData) => unwrap(api.post('/resumes', formData)),
  update: (id, formData) => unwrap(api.put(`/resumes/${id}`, formData)),
  remove: (id) => unwrap(api.delete(`/resumes/${id}`)),
};

export const interviewsApi = {
  list: (params) => unwrap(api.get('/interviews', { params })),
  create: (body) => unwrap(api.post('/interviews', body)),
  update: (id, body) => unwrap(api.put(`/interviews/${id}`, body)),
  remove: (id) => unwrap(api.delete(`/interviews/${id}`)),
};

export const dashboardApi = {
  stats: () => unwrap(api.get('/dashboard/stats')),
};

export default api;
