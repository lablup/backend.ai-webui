import { BAILocale, i18n } from '../../../locale';
import { BAIClient, BAIClientProvider } from '../BAIClientProvider';
import { ConfigProvider, ConfigProviderProps } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import 'dayjs/locale/el';
import 'dayjs/locale/es';
import 'dayjs/locale/fi';
import 'dayjs/locale/fr';
import 'dayjs/locale/id';
import 'dayjs/locale/it';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/mn';
import 'dayjs/locale/ms';
import 'dayjs/locale/pl';
import 'dayjs/locale/pt';
import 'dayjs/locale/pt-br';
import 'dayjs/locale/ru';
import 'dayjs/locale/th';
import 'dayjs/locale/tr';
import 'dayjs/locale/vi';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';
import duration from 'dayjs/plugin/duration';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

export interface BAIConfigProviderProps
  extends Omit<ConfigProviderProps, 'locale'> {
  locale?: BAILocale;
  clientPromise: Promise<BAIClient>;
  anonymousClientFactory: (api_endpoint: string) => BAIClient;
}

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

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
          {children}
        </BAIClientProvider>
      </ConfigProvider>
    </I18nextProvider>
  );
};

export default BAIConfigProvider;
