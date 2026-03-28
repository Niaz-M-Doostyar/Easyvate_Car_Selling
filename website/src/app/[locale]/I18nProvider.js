'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n'; // adjust the import path to your i18n.js file
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function I18nProvider({ children }) {
  const params = useParams();
  const locale = params.locale; // e.g., 'en', 'fa', 'ps'
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Change the i18n language when the locale changes
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale).then(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [locale]);

  if (!ready) {
    // Optionally show a loading spinner or nothing
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}