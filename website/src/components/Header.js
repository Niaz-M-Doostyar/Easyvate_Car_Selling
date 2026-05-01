'use client';

import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n'; // your i18n instance

// Helper to ensure URLs have a protocol
const normalizeUrl = (url) => {
  if (!url || url === '#') return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale; // e.g., 'en', 'fa', 'ps'
  const { t } = useTranslation('common'); // use your common namespace

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    fetch('/api/header')
      .then(res => res.json())
      .then(data => {
        setContact(data.contact);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch header data', err);
        setLoading(false);
      });
  }, []);

  // Fallback values (your original static data)
  const weekdayHours = contact?.weekdays || '08:00 am to 05:00 pm';
  const email = contact?.email || 'Info@niazaykhpalwak.com';
  const phone = contact?.phone || '(+93) 700 000 000';
  const facebook = normalizeUrl(contact?.facebook);
  const twitter = normalizeUrl(contact?.x);
  const instagram = normalizeUrl(contact?.instagram);
  const youtube = normalizeUrl(contact?.youtube);

  // Helper to get the current path without the locale
  const getCurrentPath = () => {
    if (!pathname) return '';
    const segments = pathname.split('/');
    if (segments.length < 2) return '';
    // Remove the first segment (locale) and join the rest
    return '/' + segments.slice(2).join('/');
  };
  const currentPath = getCurrentPath();

  const isActive = (path) => currentPath === path;

  const changeLanguage = (newLocale) => {
  const newPathname = pathname.replace(/^\/[^\/]+/, `/${newLocale}`);
  const search = window.location.search;
  window.location.href = `${newPathname}${search}`;
  setShowLangDropdown(false);
};

  return (
    <>
      {/* Offcanvas Menu Overlay */}
      <div className="offcanvas-menu-overlay"></div>
      <div className="offcanvas-menu-wrapper">
        <div className="offcanvas__widget">
          <div className="language-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
            <button
              className="primary-btn"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              aria-expanded={showLangDropdown}
            >
              {t('language')}
            </button>
            {showLangDropdown && (
              <ul className="dropdown-menu" style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: '#fff',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                listStyle: 'none',
                padding: '0.5rem 0',
                margin: 0,
                zIndex: 1000,
                minWidth: '120px',
                display: 'block'
              }}>
                <li style={{ padding: '0.25rem 1rem', cursor: 'pointer' }} onClick={() => changeLanguage('en')}>
                  English
                </li>
                <li style={{ padding: '0.25rem 1rem', cursor: 'pointer' }} onClick={() => changeLanguage('ps')}>
                  پښتو
                </li>
                <li style={{ padding: '0.25rem 1rem', cursor: 'pointer' }} onClick={() => changeLanguage('fa')}>
                  دری
                </li>
              </ul>
            )}
          </div>
          <Link href="http://localhost:3000/admin/login" locale={false} className="primary-btn">{t('login')}</Link>
        </div>
        <div className="offcanvas__logo">
          <Link href={`/${locale}`}><img src="/img/header-logo.png" alt="logo" /></Link>
        </div>
        <div id="mobile-menu-wrap"></div>
        <ul className="offcanvas__widget__add">
          <li><i className="fa fa-clock-o"></i> {t('working_hours')} {weekdayHours}</li>
          <li><i className="fa fa-envelope-o"></i> {email}</li>
        </ul>
        <div className="offcanvas__phone__num">
          <i className="fa fa-phone"></i>
          <span>{phone}</span>
        </div>
        <div className="offcanvas__social">
          <a href={facebook} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook"></i></a>
          <a href={twitter} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-x-twitter"></i></a>
          <a href={instagram} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram"></i></a>
          <a href={youtube} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube"></i></a>
        </div>
      </div>
      {/* Offcanvas Menu End */}

      {/* Header Section Begin */}
      <header className="header">
        <div className="header__top">
          <div className="container">
            <div className="row">
              <div className="col-lg-7">
                <ul className="header__top__widget">
                  <li><i className="fa fa-clock-o"></i> {t('working')} {weekdayHours}</li>
                  <li><i className="fa fa-envelope-o"></i><a href={`mailto:${email}`}>{email}</a></li>
                </ul>
              </div>
              <div className="col-lg-5">
                <div className="header__top__right">
                  <div className="header__top__phone">
                    <i className="fa fa-phone"></i>
                    <span><a href={`tel:${phone}`}>{phone}</a></span>
                  </div>
                  <div className="header__top__social">
                    <a href={facebook} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook"></i></a>
                    <a href={twitter} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-x-twitter"></i></a>
                    <a href={instagram} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram"></i></a>
                    <a href={youtube} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <div className="header__logo">
                <Link href={`/${locale}`}><img src="/img/header-logo.png" style={{height:'100px', width:'210px', objectFit: 'cover'}} alt="logo" /></Link>
              </div>
            </div>
            <div className="col-lg-9">
              <div className="header__nav">
                <nav className="header__menu">
                  <ul>
                    <li className={isActive('/') ? 'active' : ''}>
                      <Link href={`/${locale}`}>{t('home')}</Link>
                    </li>
                    <li className={isActive('/about') ? 'active' : ''}>
                      <Link href={`/${locale}/about`}>{t('about')}</Link>
                    </li>
                    <li className={isActive('/car') ? 'active' : ''}>
                      <Link href={`/${locale}/car`}>{t('cars')}</Link>
                    </li>
                    <li className={isActive('/team') ? 'active' : ''}>
                      <Link href={`/${locale}/team`}>{t('team')}</Link>
                    </li>
                    <li className={isActive('/contact') ? 'active' : ''}>
                      <Link href={`/${locale}/contact`}>{t('contact')}</Link>
                    </li>
                  </ul>
                </nav>
                <div className="header__nav__widget">
                  {/* Language Dropdown */}
                  <div className="language-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                      className="primary-btn"
                      onClick={() => setShowLangDropdown(!showLangDropdown)}
                      aria-expanded={showLangDropdown}
                    >
                      {t('language')}
                    </button>
                    {showLangDropdown && (
                      <ul className="dropdown-menu" style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: '#fff',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        listStyle: 'none',
                        padding: '0.5rem 0',
                        margin: 0,
                        zIndex: 1000,
                        minWidth: '120px',
                        display: 'block'
                      }}>
                        <li style={{ padding: '0.25rem 1rem', cursor: 'pointer' }} onClick={() => changeLanguage('en')}>
                          English
                        </li>
                        <li style={{ padding: '0.25rem 1rem', cursor: 'pointer' }} onClick={() => changeLanguage('ps')}>
                          پښتو
                        </li>
                        <li style={{ padding: '0.25rem 1rem', cursor: 'pointer' }} onClick={() => changeLanguage('fa')}>
                          دری
                        </li>
                      </ul>
                    )}
                  </div>
                  <Link href="http://localhost:3000/admin/login" className="primary-btn" target="_blank" rel="noopener noreferrer">{t('login')}</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="canvas__open">
            <span className="fa fa-bars"></span>
          </div>
        </div>
      </header>
      {/* Header Section End */}
    </>
  );
}