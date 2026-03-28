'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { i18n } = useTranslation();

  const changeLanguage = (newLocale) => {
    // Replace the current locale in the URL with the new one
    const newPathname = pathname.replace(/^\/[^\/]+/, `/${newLocale}`);
    router.push(newPathname);
    // The I18nProvider will detect the locale change automatically
  };

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('fa')}>Dari</button>
      <button onClick={() => changeLanguage('ps')}>Pashto</button>
    </div>
  );
}