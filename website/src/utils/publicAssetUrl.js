const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

/**
 * Keep uploaded assets on the current website origin in production.
 * Older database rows may contain absolute localhost URLs from development;
 * those are converted back to their public path so Nginx can proxy /uploads.
 */
export function publicAssetUrl(value, fallback) {
  const path = String(value || '').trim();
  if (!path) return fallback;

  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      if (LOCAL_HOSTS.has(url.hostname)) {
        return `${url.pathname}${url.search}${url.hash}`;
      }
    } catch {
      return fallback;
    }
    return path;
  }

  return path.startsWith('/') ? path : `/${path}`;
}
