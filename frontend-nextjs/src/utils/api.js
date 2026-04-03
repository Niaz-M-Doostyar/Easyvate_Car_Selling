import axios from 'axios';

// ============================================================
// Production should use the same origin and let Nginx proxy /api.
// Local development still talks directly to the backend on port 3001.
// ============================================================
const API_URLS = {
  local: 'http://localhost:3001/api',
  vps: '/admin/api',
};

function getDefaultApiUrl() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return API_URLS.local;
    }
    return API_URLS.vps;
  }

  return process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'local'
    ? API_URLS.local
    : API_URLS.vps;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || getDefaultApiUrl();

// debug: show which base URL is being used
if (typeof window !== 'undefined') {
  console.log('[api] using API_URL =', API_URL);
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch { /* SSR or localStorage unavailable */ }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } catch { /* SSR */ }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
