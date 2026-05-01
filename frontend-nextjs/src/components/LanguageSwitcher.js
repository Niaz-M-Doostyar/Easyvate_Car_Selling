'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

const languageNames = {
  en: 'English',
  ps: 'پښتو',
  prs: 'دری'
};

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchLocale = (newLocale) => {
    // Remove current locale prefix and add new one
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <div>
      {Object.entries(languageNames).map(([code, name]) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          disabled={code === currentLocale}
        >
          {name}
        </button>
      ))}
    </div>
  );
}