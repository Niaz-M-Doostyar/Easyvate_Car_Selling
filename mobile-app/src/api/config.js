import Constants from 'expo-constants';

const DEFAULT_WEB_BASE_URL = 'https://niazikhpalwak.com';

const extra = Constants.expoConfig?.extra || Constants.manifest2?.extra || {};

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const joinUrl = (base, path = '') => {
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export const WEB_BASE_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_WEB_BASE_URL || extra.webBaseUrl || DEFAULT_WEB_BASE_URL
);

export const PUBLIC_API_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_PUBLIC_API_URL || extra.publicApiUrl || `${WEB_BASE_URL}/api`
);

export const ADMIN_API_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_ADMIN_API_URL || extra.adminApiUrl || `${WEB_BASE_URL}/admin/api`
);

export const resolveAssetUrl = (value, fallback = null) => {
  if (!value) return fallback;
  return joinUrl(WEB_BASE_URL, value);
};

export const buildAdminUrl = (path = '') => joinUrl(ADMIN_API_URL, path);

export const buildPublicUrl = (path = '') => joinUrl(PUBLIC_API_URL, path);