// src/i18n/request.js
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});