'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';

// Helper to ensure URLs have a protocol
const normalizeUrl = (url) => {
  if (!url || url === '#') return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

export default function Footer() {
  const { t } = useTranslation('common');
  const { locale } = useParams(); // ensures re-render on locale change

  const currentYear = new Date().getFullYear();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/footer?locale=${locale}`)
      .then(res => res.json())
      .then(data => {
        setContact(data.contact);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch footer data', err);
        setLoading(false);
      });
  }, []);

  // Fallback values (your original static data)
  const facebook = normalizeUrl(contact?.facebook);
  const twitter = normalizeUrl(contact?.x);
  const instagram = normalizeUrl(contact?.instagram);
  const youtube = normalizeUrl(contact?.youtube);
  const phone = contact?.phone || '+93 700 000 000';
  const email = contact?.email || 'info@niazi.com';
  const address = contact?.address || 'Kandahar, Afghanistan';
  const hours = contact?.weekdays || '8AM - 5PM';
  const description = contact?.description || t('footerDesc');

  return (
    <>
      {/* Footer Section Begin */}
      <footer className="footer" style={{backgroundImage: 'url(/img/footer-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="container">
          <div className="row">

            {/* Company Info */}
            <div className="col-lg-4 col-md-6">
              <div className="footer__about">
                <div className="footer__logo">
                  <img
                    src="/img/Niazi1.png"
                    alt="logo"
                  />
                </div>

                <p>{description}</p>

                <div className="footer__social">
                  <a href={facebook} className="facebook" target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-facebook"></i>
                  </a>
                  <a href={twitter} className="x" target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-x-twitter"></i>
                  </a>
                  <a href={instagram} className="instagram" target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-instagram"></i>
                  </a>
                  <a href={youtube} className="youtube" target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-youtube"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div className="col-lg-2 col-md-6">
              <div className="footer__widget">
                <h5>{t('quick')}</h5>
                <ul>
                  <li><a href={`/${locale}`}><i className="fa fa-angle-right"></i> {t('home')}</a></li>
                  <li><a href={`/${locale}/car`}><i className="fa fa-angle-right"></i> {t('cars')}</a></li>
                  <li><a href={`/${locale}/about`}><i className="fa fa-angle-right"></i> {t('about')}</a></li>
                  <li><a href={`/${locale}/contact`}><i className="fa fa-angle-right"></i> {t('contact')}</a></li>
                </ul>
              </div>
            </div>

            {/* Top Brands */}
            <div className="col-lg-3 col-md-6">
              <div className="footer__brand">
                <h5>{t('topBrand')}</h5>
                <ul>
                  <li><a><i className="fa fa-angle-right"></i> {t('toyota')}</a></li>
                  <li><a><i className="fa fa-angle-right"></i> {t('luxus')}</a></li>
                  <li><a><i className="fa fa-angle-right"></i> {t('mercedes')}</a></li>
                  <li><a><i className="fa fa-angle-right"></i> {t('bmw')}</a></li>
                </ul>
              </div>
            </div>

            {/* Address */}
            <div className="col-lg-3 col-md-6">
              <div className="footer__widget">
                <h5>{t('address')}</h5>
                <ul>
                  <li><i className="fa fa-map-marker"></i> {address}</li>
                  <li><i className="fa fa-phone"></i> <a href={`tel:${phone}`}>{phone}</a></li>
                  <li><i className="fa fa-envelope"></i> <a href={`mailto:${email}`}>{email}</a></li>
                  <li><i className="fa fa-clock-o"></i> {hours}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright Centered */}
          <div 
            className="footer__copyright"
            style={{
              textAlign:"center",
              marginTop:"40px",
              borderTop:"1px solid rgba(255,255,255,0.2)",
              paddingTop:"20px"
            }}
          >
            <p>
              {t('footer_rights')}
            </p>
          </div>

        </div>
      </footer>
      {/* Footer Section End */}
    </>
  );
}