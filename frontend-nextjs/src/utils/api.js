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
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
      } catch { /* SSR */ }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * Returns the correct URL for a backend upload file path.
 * Works on both local dev (through Next.js rewrite proxy) and VPS.
 * - Local: /admin/api/uploads/... → Next.js rewrites → http://localhost:3001/uploads/...
 * - VPS:   /admin/api/uploads/... → Next.js rewrites → http://localhost:3001/uploads/...
 * @param {string} filePath  e.g. '/uploads/vehicle-images/file.jpg'
 */
export function getUploadUrl(filePath) {
  if (!filePath) return '';
  return `/admin/api${filePath}`;
}
