const HTML_RESPONSE_RE = /<!doctype html|<html/i;

export const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const asObject = (value) => (isPlainObject(value) ? value : {});

export const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};

export const isHtmlPayload = (value) => typeof value === 'string' && HTML_RESPONSE_RE.test(value);

export const extractApiErrorMessage = (error, fallback = 'Something went wrong.') => {
  const payload = error?.response?.data;

  if (isHtmlPayload(payload)) {
    return 'The server returned a web page instead of API data.';
  }

  return (
    payload?.error?.message ||
    payload?.error ||
    payload?.message ||
    error?.message ||
    fallback
  );
};