import { BAILocale, i18n } from '../locale';
import { ConfigProvider, ConfigProviderProps } from 'antd';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

export interface BAIConfigProviderProps
  extends Omit<ConfigProviderProps, 'locale'> {
  locale?: BAILocale;
}

const BAIConfigProvider = ({
  children,
  locale,
  ...props
}: BAIConfigProviderProps) => {
  useEffect(() => {
    if (locale?.lang) {
      i18n.changeLanguage(locale.lang);
    }
  }, [locale?.lang]);
  return (
    <I18nextProvider i18n={i18n}>
      <ConfigProvider locale={locale?.antdLocale} {...props}>
        {children}
      </ConfigProvider>
    </I18nextProvider>
  );
};

export default BAIConfigProvider;
