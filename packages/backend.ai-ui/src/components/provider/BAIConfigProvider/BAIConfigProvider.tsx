import { BAILocale, i18n } from '../../../locale';
import { BAIClient, BAIClientProvider } from '../BAIClientProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, ConfigProviderProps } from 'antd';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

export interface BAIConfigProviderProps
  extends Omit<ConfigProviderProps, 'locale'> {
  locale?: BAILocale;
  clientPromise: Promise<BAIClient>;
  anonymousClientFactory: (api_endpoint: string) => BAIClient;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

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
      dayjs.locale(locale.lang);
    }
  }, [locale?.lang]);

  return (
    <I18nextProvider i18n={i18n}>
      <ConfigProvider locale={locale?.antdLocale} {...props}>
        <BAIClientProvider
          clientPromise={clientPromise}
          anonymousClientFactory={anonymousClientFactory}
        >
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </BAIClientProvider>
      </ConfigProvider>
    </I18nextProvider>
  );
};

export default BAIConfigProvider;
