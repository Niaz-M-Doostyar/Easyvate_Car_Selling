// src/middleware.js
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  // A list of all supported locales
  locales,
  // The default locale if none matches
  defaultLocale,
  // Optional: use locale prefix (e.g., /en/about)
  localePrefix: 'always'
});

export const config = {
  // Match all pathnames except for:
  // - files inside /_next, api, static, favicon, etc.
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)']
};