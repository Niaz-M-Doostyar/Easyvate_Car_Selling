'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

i18next
  .use(initReactI18next)
  .use(resourcesToBackend((language, namespace) => 
    import(`@/locales/${language}/${namespace}.json`)
  ))
  .init({
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    supportedLngs: ['en', 'fa', 'ps'],
  });

export default i18next;