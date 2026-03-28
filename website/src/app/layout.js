import Script from 'next/script';
import { headers } from 'next/headers';
import './globals.css';
import RouteChangeHandler from '@/components/RouteChangeHandler';

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'en';
  const dir = locale === 'en' ? 'ltr' : 'rtl';

  // Common styles (always loaded)
  const commonStyles = [
    <link key="bootstrap" rel="stylesheet" href="/css/bootstrap.min.css" />,
    <link key="font-awesome" rel="stylesheet" href="/css/font-awesome.min.css" />,
    <link key="elegant-icons" rel="stylesheet" href="/css/elegant-icons.css" />,
    <link key="magnific-popup" rel="stylesheet" href="/css/magnific-popup.css" />,
    <link key="jquery-ui" rel="stylesheet" href="/css/jquery-ui.min.css" />,
    <link key="owl-carousel" rel="stylesheet" href="/css/owl.carousel.min.css" />,
    <link key="slicknav" rel="stylesheet" href="/css/slicknav.min.css" />,
    <link key="font-awesome-cdn" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  ];

  // Main theme styles – choose one based on locale
  const themeStyles = locale === 'en'
    ? <link key="style" rel="stylesheet" href="/css/style.css" />
    : <link key="rtl-style" rel="stylesheet" href="/css/rtl-style.css" />;

  // Combine all styles
  const allStyles = [...commonStyles, themeStyles];

  return (
    <html lang={locale} dir={dir}>
      <head>
        {allStyles}
      </head>
      <body>
        {children}
        <RouteChangeHandler />
        {/* Template JS files – unchanged */}
        <Script src="/js/jquery-3.3.1.min.js" strategy="beforeInteractive" />
        <Script src="/js/bootstrap.min.js" strategy="beforeInteractive" />
        <Script src="/js/jquery.nice-select.min.js" strategy="beforeInteractive" />
        <Script src="/js/jquery-ui.min.js" strategy="beforeInteractive" />
        <Script src="/js/jquery.magnific-popup.min.js" strategy="beforeInteractive" />
        <Script src="/js/mixitup.min.js" strategy="beforeInteractive" />
        <Script src="/js/jquery.slicknav.js" strategy="beforeInteractive" />
        <Script src="/js/owl.carousel.min.js" strategy="beforeInteractive" />
        <Script src="/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}