/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RelayEnvironment } from '../RelayEnvironment';
// The app's only message/modal/notification host (`App.useApp()`).
import { BAIAppProvider } from '../app-shim';
import AstryxBrandTheme from '../astryx-theme/AstryxBrandTheme';
import { FormConfigProvider } from '../form-engine';
import { isActAsDebugMode } from '../helper/actAs';
import {
  getLoadedBuiLocale,
  loadBuiLocale,
  preloadBuiLocale,
} from '../helper/bui-language';
import { resolveStoredLanguage } from '../helper/storedLanguage';
import {
  backendaiClientPromise,
  createAnonymousBackendaiClient,
  useWebUINavigate,
} from '../hooks';
import { useDeviceMetaData, useImageMetaData } from '../hooks/backendai';
import { useRouteScope } from '../hooks/useRouteScope';
import { useLoginConfig } from '../hooks/useWebUIConfig';
import '../index.css';
import I18nKeyMarkers, { appendI18nKeyMarker } from './I18nKeyMarkers';
import NotificationHost from './NotificationHost';
import { useTheme } from '@lablup/ui-common/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BAIConfigProvider,
  BAIMetaDataProvider,
  BAIText,
  BAIWebMCPProvider,
  useUpdateEffect,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
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
import React, {
  ReactNode,
  Suspense,
  startTransition,
  use,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useTranslation, initReactI18next } from 'react-i18next';
import { RelayEnvironmentProvider } from 'react-relay/hooks';
import { useLocation } from 'react-router-dom';

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
      if (isActAsDebugMode() || isDebugByUrlParam) {
        // Must stay a string: `t()` also feeds placeholders, tooltips and aria labels.
        // `I18nKeyMarkers` turns the invisible marker into the copy icon.
        if (typeof value !== 'string') return value;
        const keyString = Array.isArray(key) ? key[0] : String(key);
        return appendI18nKeyMarker(value, keyString);
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
    // Resolve the initial language so first-paint screens (notably the login
    // page) render in the user's browser language even when nothing has been
    // persisted yet (e.g. private / incognito browsing). See
    // `helper/resolveInitialLanguage.ts` for the supported-language list.
    lng: resolveStoredLanguage(),
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
  // Resolve through the same helper as the i18n init above. On first visit
  // the stored value is absent (legacy code may also have persisted the
  // 'default' sentinel), and the mount effect below re-applies `lang` via
  // `changeLanguage`. Without this resolution the effect would bounce i18n
  // back to 'default' right after init — undoing the browser-language
  // detection on the login screen — and set `dayjs.locale('default')` /
  // `<html lang="default">` along the way.
  const [lang, _setLang] = useState<string>(resolveStoredLanguage);
  const { i18n } = useTranslation();

  useEffect(() => {
    // TODO: remove this hack to initialize i18next
    const timeoutId = setTimeout(() => i18n?.changeLanguage(lang), 0);
    // For changing locale globally, use dayjs.locale instead of dayjs().locale
    dayjs.locale(lang);
    document.documentElement.lang = lang;
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      //@ts-ignore
      const lang: string = e?.detail?.lang || 'en';
      preloadBuiLocale(lang);
      // A transition keeps the current UI on screen while the new BUI locale
      // chunk loads, instead of falling back to the root Suspense boundary.
      startTransition(() => _setLang(lang));
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

/**
 * Global message config for the app-shim's toast leg. `duration` is in
 * SECONDS, matching antd's semantics, which `app-shim/bridge.ts` reproduces.
 */
const messageConfig = { duration: 4 };

/**
 * antd's `message` rendered top-center, and the bottom-right corner belongs to
 * `.bai-notification-stack` — co-anchoring there let the toast viewport (browser
 * top layer) paint over the notification cards (FR-3554). Astryx offers no
 * centered anchor, so `topStart` is the base and `astryxBui.css` centers it.
 */
const toastConfig = { position: 'topStart' } as const;

const BAIMetaDataProviderWrapper = ({ children }: { children: ReactNode }) => {
  const { data: deviceMetaData } = useDeviceMetaData();
  const { data: imageMetaData } = useImageMetaData();

  return (
    <BAIMetaDataProvider
      deviceMetaData={deviceMetaData}
      imageMetaData={imageMetaData}
      imagePath="resources/icons"
    >
      {children}
    </BAIMetaDataProvider>
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

/**
 * The app providers. Mounted once, by the root layout route in `routes.tsx`
 * (ADR 0043), so every route renders under them.
 */
export const DefaultProviders: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [lang] = useCurrentLanguage();
  const { t } = useTranslation();
  const { token } = useTheme();
  const enableWebMCP = useLoginConfig()?.enableWebMCP ?? false;
  // The system admin pages take the admin accent for the whole app (ADR 0043).
  const themeRole = useRouteScope() === 'admin' ? 'admin' : 'brand';

  // Non-`en` locales are lazy chunks; `loadBuiLocale` caches one promise per
  // language, so `use` suspends on the same object across renders.
  const currentLocale = getLoadedBuiLocale(lang) ?? use(loadBuiLocale(lang));

  return (
    <>
      {RelayEnvironment && (
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <QueryClientProvider client={queryClient}>
            {/* The app's only app-level `<Theme>`. `mode` comes from
                `useThemeMode`, which `<Theme>` syncs onto `<html>`. */}
            <AstryxBrandTheme role={themeRole}>
              {/* Locale + client: Astryx's `InternationalizationProvider`, BUI's
                    i18next instance, dayjs's locale, the Backend.AI client. */}
              <BAIConfigProvider
                locale={currentLocale}
                clientPromise={backendaiClientPromise}
                anonymousClientFactory={createAnonymousBackendaiClient}
              >
                {/* `validateMessages` is left to the provider's localized default.
                      `requiredMark` as a function drops the asterisk and marks
                      non-required labels "(Optional)": deliberate product behaviour. */}
                <FormConfigProvider
                  requiredMark={(label, { required }) => (
                    <>
                      {label}
                      {!required && (
                        <BAIText
                          type="secondary"
                          style={{ marginLeft: token('--spacing-1') }}
                        >
                          ({t('general.Optional')})
                        </BAIText>
                      )}
                    </>
                  )}
                >
                  {/* No <I18nextProvider>: BUI binds its own i18next instance
                        through `useBAIi18n()` (FR-2986). */}
                  <BAIAppProvider message={messageConfig} toast={toastConfig}>
                    <BAIMetaDataProviderWrapper>
                      {/* Single app-wide notification renderer. Lives outside
                            the Suspense below so toasts work on every route and
                            in both anonymous and authenticated states. */}
                      <NotificationHost />
                      {process.env.NODE_ENV === 'development' && (
                        <I18nKeyMarkers />
                      )}
                      <Suspense>
                        {/* WebMCP tool gate, ADR 0025. */}
                        <BAIWebMCPProvider enabled={enableWebMCP}>
                          {children}
                        </BAIWebMCPProvider>
                      </Suspense>
                    </BAIMetaDataProviderWrapper>
                  </BAIAppProvider>
                </FormConfigProvider>
              </BAIConfigProvider>
            </AstryxBrandTheme>
          </QueryClientProvider>
        </RelayEnvironmentProvider>
      )}
    </>
  );
};
