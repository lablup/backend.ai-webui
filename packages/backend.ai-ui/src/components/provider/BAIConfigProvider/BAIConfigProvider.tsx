import { BAILocale, i18n } from '../../../locale';
import { type BAIClient, BAIClientProvider } from '../BAIClientProvider';
import {
  InternationalizationProvider,
  getLocaleDirection,
} from '@astryxdesign/core/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import { useEffect, type ReactNode } from 'react';

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

/**
 * to-astryx final switch: this used to `extend Omit<ConfigProviderProps,
 * 'locale'>`, which is how the host passed `csp`, `theme`, `modal`, `drawer`
 * and `tag` straight through to the antd `ConfigProvider` this component
 * wrapped. With that provider gone the pass-through has no destination —
 * every one of those props configured antd components that no longer exist,
 * and Astryx's `Theme` / `InternationalizationProvider` take their
 * configuration from `react/src/astryx-theme/` instead. So the interface is
 * now standalone (the one case `component-props-extension.md` does not
 * cover: there is no underlying component left to extend).
 */
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
  // Sync BUI's i18n + dayjs locale to the prop. BUI components access
  // `buiI18n` *explicitly* via `useBAIi18n()` (which calls
  // `useTranslation(undefined, { i18n: buiI18n })`), so we do NOT wrap
  // children with `<I18nextProvider i18n={buiI18n}>` — that would shadow
  // the host's i18n React Context and break host components' translations
  // (FR-2987). Explicit instance binding is enough to keep BUI translations
  // working without leaking into the host's Context.
  useEffect(() => {
    if (locale?.lang) {
      i18n.changeLanguage(locale.lang);
      dayjs.locale(locale.lang);
    }
  }, [locale?.lang]);

  // P13 (ticket 30): the THIRD translation runtime — Astryx's own resolver —
  // gets its locale from the same source as the other two instead of sitting
  // on its `'en'` context default. This is not only about strings: the locale
  // is what Astryx passes to `IntlMessageFormat`, so plurals, numbers and
  // dates inside Astryx components were being formatted as English in a
  // Korean session. The chrome-string catalog rides on the host-passed
  // `BAILocale.astryxLocale` (`backend.ai-ui/dist/locale/*`), the same flow
  // that used to carry `antdLocale`.
  //
  // `dir` is passed explicitly (rather than left to Astryx's own derivation)
  // only to keep it in one place; `getLocaleDirection` is the same helper the
  // provider would call. NOTE the upstream caveat: this sets the direction
  // Astryx reads from context, it does NOT set the DOM `dir` attribute — the
  // host still owns `<html dir>`. No RTL locale ships in `resources/i18n`
  // today, so the two cannot currently disagree.
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
