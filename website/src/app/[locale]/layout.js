import I18nProvider from './I18nProvider';

export default function LocaleLayout({ children }) {
  return <I18nProvider>{children}</I18nProvider>;
}