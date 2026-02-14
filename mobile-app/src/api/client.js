import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to reach host machine localhost
// iOS simulator uses localhost directly
// For physical device, use your machine's local IP
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3001/api',
  ios: 'http://localhost:3001/api',
  default: 'http://localhost:3001/api',
});

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
