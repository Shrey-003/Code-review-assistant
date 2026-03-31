const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  };

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    let errorMessage = `Request failed (${res.status})`;
    
    // Parse nested errors object from backend validation (e.g. { errors: { email: "..." } })
    if (data.errors && typeof data.errors === 'object') {
      const errMsgs = Object.values(data.errors).filter(msg => msg);
      if (errMsgs.length > 0) errorMessage = errMsgs[0];
    } else if (data.message) {
      errorMessage = data.message;
    } else if (data.error) {
      errorMessage = data.error;
    }
    
    throw new Error(errorMessage);
  }
  return data;
}

export const api = {
  // Auth
  signup: (body) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/auth/logout'),
  getMe: () => request('/api/auth/me'),

  // Problems
  getProblems: () => request('/api/problems'),
  getProblem: (id) => request(`/api/problems/${id}`),
  submitProblem: (id, body) => request(`/api/problems/${id}/submit`, { method: 'POST', body: JSON.stringify(body) }),
  runProblem: (id, body) => request(`/api/problems/${id}/run`, { method: 'POST', body: JSON.stringify(body) }),

  // Admin 
  createProblem: (body) => request('/api/problems', { method: 'POST', body: JSON.stringify(body) }),
  editProblem: (id, body) => request(`/api/problems/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProblem: (id) => request(`/api/problems/${id}`, { method: 'DELETE' }),

  // Submissions
  getSubmissions: () => request('/api/submissions/mine'),
  getLeaderboard: () => request('/api/submissions/leaderboard'),

  // Dashboard
  getDashboard: () => request('/api/dashboard'),

  // Templates
  getTemplates: () => request('/api/templates'),

  // AI Assistant
  reviewCode: (body) => request('/api/ai/review', { method: 'POST', body: JSON.stringify(body) }),
};
