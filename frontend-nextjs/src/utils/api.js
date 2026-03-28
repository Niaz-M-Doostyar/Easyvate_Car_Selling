import axios from 'axios';

// ============================================================
// DEPLOYMENT PRESETS – controlled by NEXT_PUBLIC_DEPLOY_TARGET
// in frontend-nextjs/.env.local
//   local  →  your Mac (localhost:3001)
//   vps    →  remote VPS (194.163.170.240) – no port, served via Nginx
// ============================================================
const API_URLS = {
  local: 'http://localhost:3001/api',
  vps:   'http://194.163.170.240/api',
};

const DEPLOY_TARGET = process.env.NEXT_PUBLIC_DEPLOY_TARGET || 'local';
const API_URL = process.env.NEXT_PUBLIC_API_URL || API_URLS[DEPLOY_TARGET] || API_URLS.local;

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
