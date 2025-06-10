import { BUILocale, i18n } from '../locale';
import { ConfigProvider } from 'antd';
import { I18nextProvider } from 'react-i18next';

export interface BAIConfigProviderProps {
  children: React.ReactNode;
  locale?: BUILocale;
}

const BAIConfigProvider = ({ children, locale }: BAIConfigProviderProps) => {
  if (locale) {
    i18n.changeLanguage(locale.lng);
  }
  return (
    <I18nextProvider i18n={i18n}>
      <ConfigProvider locale={locale?.antdLocale}>{children}</ConfigProvider>
    </I18nextProvider>
  );
};

export default BAIConfigProvider;
