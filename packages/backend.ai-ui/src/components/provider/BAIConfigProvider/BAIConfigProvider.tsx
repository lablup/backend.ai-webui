import { BAILocale, i18n } from '../../../locale';
import { BAIClient, BAIClientProvider } from '../BAIClientProvider';
import { ConfigProvider, ConfigProviderProps } from 'antd';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

export interface BAIConfigProviderProps
  extends Omit<ConfigProviderProps, 'locale'> {
  locale?: BAILocale;
  clientPromise: Promise<BAIClient>;
  anonymousClientFactory: (api_endpoint: string) => BAIClient;
}

const BAIConfigProvider = ({
  children,
  locale,
  clientPromise,
  anonymousClientFactory,
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
        <BAIClientProvider
          clientPromise={clientPromise}
          anonymousClientFactory={anonymousClientFactory}
        >
          {children}
        </BAIClientProvider>
      </ConfigProvider>
    </I18nextProvider>
  );
};

export default BAIConfigProvider;
