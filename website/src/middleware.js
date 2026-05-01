// src/middleware.js
import { NextResponse } from 'next/server';

const supportedLocales = ['en', 'fa', 'ps'];
const defaultLocale = 'en';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  console.log('Middleware running for:', pathname);

  // Check if the pathname already has a valid locale
  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect to the same path but with default locale prefixed
    const newUrl = new URL(`/${defaultLocale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  // Extract locale from path and set header
  const locale = pathname.split('/')[1];
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|css|js|img|fonts).*)'],
};