import Constants from 'expo-constants';

const DEFAULT_WEB_BASE_URL = 'https://niazikhpalwak.com';

const extra = Constants.expoConfig?.extra || Constants.manifest2?.extra || {};

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const joinUrl = (base, path = '') => {
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  // API payloads can contain a URL-like object on some endpoints. Normalize
  // before calling string methods so a malformed optional asset cannot crash
  // the native bundle during initial render.
  const normalizedPath = String(path);
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;
  return `${base}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
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
