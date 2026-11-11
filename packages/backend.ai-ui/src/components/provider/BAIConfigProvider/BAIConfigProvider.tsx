import { BAILocale, i18n, loadBAILanguage } from '../../../locale';
import { type BAIClient, BAIClientProvider } from '../BAIClientProvider';
import {
  InternationalizationProvider,
  getLocaleDirection,
} from '@lablup/ui-common/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import { use, useEffect, type ReactNode } from 'react';

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

// Standalone props: there is no underlying component left to extend.
export interface BAIConfigProviderBaseProps {
  children?: ReactNode;
  locale?: BAILocale;
}

export type BAIConfigProviderProps = BAIConfigProviderBaseProps &
  (
    | {
        clientPromise: Promise<BAIClient>;
        anonymousClientFactory: (api_endpoint: string) => BAIClient;
      }
    | {
        clientPromise?: never;
        anonymousClientFactory?: never;
      }
  );

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
}: BAIConfigProviderProps) => {
  'use memo';
  // No `<I18nextProvider i18n={buiI18n}>` here: it would shadow the host's
  // i18n Context (FR-2987). BUI binds explicitly through `useBAIi18n()`.
  useEffect(() => {
    if (locale?.lang) {
      i18n.changeLanguage(locale.lang);
      dayjs.locale(locale.lang);
    }
  }, [locale?.lang]);

  // Only `en` is bundled; suspend until this language's catalog is in.
  if (locale?.lang && !i18n.hasResourceBundle(locale.lang, 'backend.ai-ui')) {
    use(loadBAILanguage(locale.lang));
  }

  // Astryx's resolver also follows `lang` (strings and IntlMessageFormat
  // plurals/numbers/dates). `dir` reaches Astryx's context only; the host owns `<html dir>`.
  const astryxLang = locale?.lang ?? 'en';
  const astryxOverrides = locale?.astryxLocale
    ? { [astryxLang]: locale.astryxLocale }
    : undefined;

  return (
    <QueryClientProvider client={queryClient}>
      <InternationalizationProvider
        locale={astryxLang}
        overrides={astryxOverrides}
        dir={getLocaleDirection(astryxLang)}
      >
        {clientPromise && anonymousClientFactory ? (
          <BAIClientProvider
            clientPromise={clientPromise}
            anonymousClientFactory={anonymousClientFactory}
          >
            {children}
          </BAIClientProvider>
        ) : (
          children
        )}
      </InternationalizationProvider>
    </QueryClientProvider>
  );
};

export default BAIConfigProvider;
