import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ADMIN_API_URL } from './config';

const BASE_URL = ADMIN_API_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Response interceptor — handle 401
let logoutCallback = null;
export const setLogoutCallback = (cb) => { logoutCallback = cb; };

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && logoutCallback) {
      await AsyncStorage.multiRemove(['token', 'user']);
      logoutCallback();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { BASE_URL };
