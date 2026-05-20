/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RelayEnvironment } from '../RelayEnvironment';
import { backendaiOptions } from '../global-stores';
import { buiLanguages } from '../helper/bui-language';
import {
  backendaiClientPromise,
  createAnonymousBackendaiClient,
  useWebUINavigate,
} from '../hooks';
import { useDeviceMetaData } from '../hooks/backendai';
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { useThemeMode } from '../hooks/useThemeMode';
// @ts-ignore
import indexCss from '../index.css?raw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateEffect } from 'ahooks';
import { App, type AppProps, theme } from 'antd';
import { BAIConfigProvider, BAIText, BAIMetaDataProvider } from 'backend.ai-ui';
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
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { createStore } from 'jotai';
import { GlobeIcon } from 'lucide-react';
import React, {
  ReactNode,
  Suspense,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useTranslation, initReactI18next } from 'react-i18next';
import { RelayEnvironmentProvider } from 'react-relay/hooks';
import { useLocation } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

export const jotaiStore = createStore();
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

if (typeof window !== 'undefined') {
  window.switchLanguage = (lang: string) => {
    window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
  };
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(Backend)
  .use({
    type: 'postProcessor',
    name: 'copyableI18nKey',
    process: function (value: any, key: any, _options: any, _translator: any) {
      const isDebugByUrlParam =
        process.env.NODE_ENV === 'development' &&
        new URLSearchParams(window.location.search).get('debug') === 'true';
      // @ts-ignore
      if (globalThis?.backendaiwebui?.debug === true || isDebugByUrlParam) {
        // key can be an array in i18next, convert to string for copy functionality
        const keyString = Array.isArray(key) ? key[0] : String(key);
        return (
          <>
            {value}
            <BAIText
              style={{ marginLeft: 4 }}
              copyable={{
                text: keyString,
                tooltips: [keyString, keyString],
                icon: <GlobeIcon />,
              }}
            />
          </>
        );
      } else {
        return value;
      }
    },
  })
  .init({
    backend: {
      loadPath: '/resources/i18n/{{lng}}.json',
      // In dev, bypass HTTP cache so `i18n.reloadResources(lng)` issued by
      // the HMR listener below always sees the freshly-saved JSON. The
      // option is forwarded by `i18next-http-backend` to `fetch`.
      requestOptions:
        process.env.NODE_ENV === 'development'
          ? { cache: 'no-store' }
          : undefined,
    },
    postProcess:
      process.env.NODE_ENV === 'development' ? ['copyableI18nKey'] : [],
    lng: backendaiOptions?.get('language', 'default', 'general') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
    react: {
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'span', 'code', 'p'],
    },
  });

// Dev-only: react to host i18n JSON edits without a full page reload.
// `vite.config.ts:devAssetsReloadPlugin` watches `resources/i18n/*.json` and
// emits `bai:host-i18n-changed` instead of a full reload. Here we re-fetch
// the affected language and trigger a re-render via `changeLanguage`.
//
// `import.meta.hot` is dev-only — Vite tree-shakes the whole branch out of
// production builds. BUI's locale instance is updated separately by its
// own HMR boundary in `packages/backend.ai-ui/src/locale/index.ts`.
if (import.meta.hot) {
  import.meta.hot.on(
    'bai:host-i18n-changed',
    async ({ lng }: { lng: string }) => {
      try {
        await i18n.reloadResources(lng);
        // `loaded` is not in react-i18next's default `bindI18n` set, so we
        // bounce the language through `changeLanguage` to trigger
        // `languageChanged`, which IS bound and re-renders subscribers.
        if (i18n.language === lng) {
          await i18n.changeLanguage(lng);
        }
      } catch (e) {
        // Last-resort fallback so the dev never gets stuck on a stale view.
        // useBAILogger is a hook and unavailable here (top-level module
        // body); plain console.warn is the right tool for a dev-only HMR
        // diagnostic.
        // eslint-disable-next-line no-console
        console.warn(
          '[bai] host i18n hot-reload failed; falling back to full reload',
          e,
        );
        location.reload();
      }
    },
  );
}

export const useCurrentLanguage = () => {
  const [lang, _setLang] = useState(
    backendaiOptions?.get('language', 'default', 'general') || 'en',
  );
  const { i18n } = useTranslation();

  useEffect(() => {
    // TODO: remove this hack to initialize i18next
    setTimeout(() => i18n?.changeLanguage(lang), 0);
    // For changing locale globally, use dayjs.locale instead of dayjs().locale
    dayjs.locale(lang);
    document.documentElement.lang = lang;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      //@ts-ignore
      _setLang(e?.detail?.lang);
      //@ts-ignore
      const lang: string = e?.detail?.lang || 'en';
      i18n?.changeLanguage(lang);
      // For changing locale globally, use dayjs.locale instead of dayjs().locale
      dayjs.locale(lang);
      document.documentElement.lang = lang;
    };
    window.addEventListener('langChanged', handler);
    return () => window.removeEventListener('langChanged', handler);
  }, [i18n]);

  return [lang] as const;
};

const commonAppProps: AppProps = {
  message: {
    duration: 4,
  },
};

const BAIMetaDataWrapper = ({ children }: { children: ReactNode }) => {
  const { data } = useDeviceMetaData();

  return (
    <BAIMetaDataProvider deviceMetaData={data}>{children}</BAIMetaDataProvider>
  );
};

export const RoutingEventHandler = () => {
  const navigate = useWebUINavigate();
  const location = useLocation();
  useLayoutEffect(() => {
    const handleNavigate = (e: any) => {
      const { detail } = e;
      navigate(detail, {
        // we don't want to add duplicated one to history.
        // On lit component side, it adds to history already.
        replace: true,
      });
    };
    document.addEventListener('react-navigate', handleNavigate);

    return () => {
      document.removeEventListener('react-navigate', handleNavigate);
    };
  }, [navigate]);

  useUpdateEffect(() => {
    document.dispatchEvent(new CustomEvent('locationPath:changed'));
  }, [location.pathname]);

  return null;
};

export const DefaultProvidersForReactRoot: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [lang] = useCurrentLanguage();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();

  const themeConfig = useCustomThemeConfig();

  const currentLocale =
    buiLanguages[lang as keyof typeof buiLanguages] ?? buiLanguages['en'];

  return (
    <>
      <style>{indexCss}</style>
      {RelayEnvironment && (
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <QueryClientProvider client={queryClient}>
            <BAIConfigProvider
              locale={currentLocale}
              theme={{
                ...(isDarkMode
                  ? { ...themeConfig?.dark }
                  : { ...themeConfig?.light }),
                algorithm: isDarkMode
                  ? theme.darkAlgorithm
                  : theme.defaultAlgorithm,
              }}
              // @ts-ignore
              csp={{ nonce: globalThis.baiNonce }}
              clientPromise={backendaiClientPromise}
              anonymousClientFactory={createAnonymousBackendaiClient}
              modal={{
                mask: {
                  blur: false,
                },
              }}
              drawer={{
                mask: {
                  blur: false,
                },
              }}
              form={{
                // Explicitly set validateMessages from the antd locale so form
                // validation errors always appear in the user's selected language
                // (antd's built-in default falls back to English otherwise).
                validateMessages:
                  currentLocale.antdLocale?.Form?.defaultValidateMessages,
                requiredMark: (label, { required }) => (
                  <>
                    {label}
                    {!required && (
                      <BAIText
                        type="secondary"
                        style={{
                          marginLeft: token.marginXXS,
                          wordBreak: 'keep-all',
                        }}
                      >
                        ({t('general.Optional')})
                      </BAIText>
                    )}
                  </>
                ),
              }}
              tag={{
                variant: 'outlined',
              }}
            >
              <BAIMetaDataWrapper>
                <QueryParamProvider adapter={ReactRouter6Adapter}>
                  <App {...commonAppProps}>
                    {/* <StyleProvider container={shadowRoot} cache={cache}> */}
                    <Suspense>
                      {/* <BrowserRouter> */}
                      {/* <RoutingEventHandler /> */}
                      {children}
                      {/* </BrowserRouter> */}
                    </Suspense>
                    {/* </StyleProvider> */}
                  </App>
                </QueryParamProvider>
              </BAIMetaDataWrapper>
            </BAIConfigProvider>
          </QueryClientProvider>
        </RelayEnvironmentProvider>
      )}
    </>
  );
};
