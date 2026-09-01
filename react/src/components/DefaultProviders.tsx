/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RelayEnvironment } from '../RelayEnvironment';
// antd `App.useApp()` drop-in backed by Astryx (to-astryx ticket 04). It used
// to sit INSIDE antd's own <App> so a partially-migrated tree kept working;
// with the final switch it is the ONLY message/modal/notification host left.
import { BAIAppProvider } from '../app-shim';
import AstryxBrandTheme from '../astryx-theme/AstryxBrandTheme';
import { FormConfigProvider } from '../form-engine';
import { backendaiOptions } from '../global-stores';
import { buiLanguages } from '../helper/bui-language';
import { pickSeed } from '../helper/customThemeConfig';
import { resolveInitialLanguage } from '../helper/resolveInitialLanguage';
import {
  backendaiClientPromise,
  createAnonymousBackendaiClient,
  useWebUINavigate,
} from '../hooks';
import { useDeviceMetaData, useImageMetaData } from '../hooks/backendai';
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { useThemeMode } from '../hooks/useThemeMode';
import '../index.css';
// antd `theme.useToken()` drop-in backed by Astryx tokens (to-astryx ticket
// 03). Renders no DOM and touches no document attributes — mounting it is
// visually inert; only files that import `theme` from '../theme-shim'
// (rewritten by scripts/codemods/antd-theme-to-shim.mjs) consume it.
import { ThemeShimProvider, theme } from '../theme-shim';
import NotificationHost from './NotificationHost';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BAIConfigProvider,
  BAIMetaDataProvider,
  BAIText,
  useUpdateEffect,
} from 'backend.ai-ui';
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

// Stored-language candidates for `resolveInitialLanguage`, in precedence
// order. `BackendAISettingsStore` seeds its in-memory options with
// `'general.language': 'en'`, so `get('language', …, 'general')` alone cannot
// tell "a language was persisted on a previous visit" apart from "fresh store
// default" — and treating the seed as an explicit choice would disable
// browser-language detection entirely (the FR-2981 bug). So:
//   1. `user.selected_language` — the user's explicit settings-page choice.
//      Unseeded; `get()` returns null when the user never chose.
//   2. `general.language` — the last resolved language, but only when the
//      localStorage key actually exists (i.e. it was persisted, not seeded).
const getStoredLanguageCandidates = (): Array<string | null | undefined> => [
  backendaiOptions?.get('selected_language'),
  typeof localStorage !== 'undefined' &&
  localStorage.getItem('backendaiwebui.settings.general.language') !== null
    ? backendaiOptions?.get('language', undefined, 'general')
    : undefined,
];

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
    // Resolve the initial language so first-paint screens (notably the login
    // page) render in the user's browser language even when nothing has been
    // persisted yet (e.g. private / incognito browsing). See
    // `helper/resolveInitialLanguage.ts` for the supported-language list.
    lng: resolveInitialLanguage(...getStoredLanguageCandidates()),
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
  const [lang, _setLang] = useState(
    resolveInitialLanguage(...getStoredLanguageCandidates()),
  );
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

export const DefaultProvidersForReactRoot: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [lang] = useCurrentLanguage();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();

  const { appearance, activeThemeFamily } = useCustomThemeConfig();
  // Shim seeds for the active family, per scheme. The shim still speaks
  // antd seed names; the v2 document's tuple seeds are resolved here.
  const activeFamilyConfig = appearance?.theme?.families?.[activeThemeFamily];
  const shimMode = isDarkMode ? 'dark' : ('light' as const);
  const shimSeeds = {
    colorPrimary: pickSeed(activeFamilyConfig?.seeds?.accent, shimMode),
    colorLink: pickSeed(activeFamilyConfig?.seeds?.link, shimMode),
    colorInfo: pickSeed(activeFamilyConfig?.seeds?.info, shimMode),
    colorError: pickSeed(activeFamilyConfig?.seeds?.error, shimMode),
    colorSuccess: pickSeed(activeFamilyConfig?.seeds?.success, shimMode),
    colorWarning: pickSeed(activeFamilyConfig?.seeds?.warning, shimMode),
    fontFamily: appearance?.theme?.fontFamily,
    components: {
      Layout: { headerBg: pickSeed(activeFamilyConfig?.headerBg, shimMode) },
    } as never,
  };

  const currentLocale =
    buiLanguages[lang as keyof typeof buiLanguages] ?? buiLanguages['en'];

  return (
    <>
      {RelayEnvironment && (
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <QueryClientProvider client={queryClient}>
            {/* to-astryx ticket 24 — the app-wide Astryx `<Theme>`, and
                since the final switch the app's ONLY theme provider.

                It was introduced wrapping an antd `ConfigProvider` because
                the two libraries' dark switches were independent (MAPPING §5:
                antd's `algorithm` vs Astryx's `data-astryx-theme` /
                `data-theme`), so both had to be driven from one source of
                truth or converted regions painted light inside a dark page.
                The antd half is now gone — `ConfigProvider`'s `theme`,
                `algorithm`, `csp`, `modal`, `drawer` and `tag` props all
                configured antd components that no longer exist. `mode` still
                comes from `useThemeMode`, which remains the source of truth
                and is what `<Theme>` syncs onto `<html>`. */}
            <AstryxBrandTheme>
              <ThemeShimProvider
                mode={isDarkMode ? 'dark' : 'light'}
                seeds={shimSeeds}
              >
                {/* Now a pure locale + client provider: Astryx's
                    `InternationalizationProvider`, BUI's i18next instance,
                    dayjs's locale and the Backend.AI client context. Its antd
                    `ConfigProvider` leg — and with it the `theme`, `csp`,
                    `modal`, `drawer` and `tag` props this call site used to
                    pass through — went away with the final switch. */}
                <BAIConfigProvider
                  locale={currentLocale}
                  clientPromise={backendaiClientPromise}
                  anonymousClientFactory={createAnonymousBackendaiClient}
                >
                  {/* to-astryx tickets 34 + 35 — form configuration lives on
                      the self-hosted engine's own provider, which is now the
                      only form runtime in the tree.

                      - `validateMessages` is NOT passed. FormConfigProvider
                        defaults it to BUI's own localized table, read from
                        `form.validateMessages` in the BUI locale catalogs via
                        BUI's i18next instance — the same strings antd shipped
                        (ported, MIT), now with no antd locale bundle in the
                        path. It re-resolves on language change like the antd
                        `locale` prop used to.
                      - `requiredMark` as a FUNCTION suppresses the asterisk
                        entirely (antd's rule, reproduced in the engine) and
                        appends "(Optional)" to non-required labels instead.
                        That inversion is deliberate product behaviour, not a
                        default — dropping it would put an asterisk on every
                        required field across the app. */}
                  <FormConfigProvider
                    requiredMark={(label, { required }) => (
                      <>
                        {label}
                        {!required && (
                          <BAIText
                            type="secondary"
                            style={{ marginLeft: token.marginXXS }}
                          >
                            ({t('general.Optional')})
                          </BAIText>
                        )}
                      </>
                    )}
                  >
                    {/*
                     * No <I18nextProvider> wrap needed here. BUI components
                     * resolve their translations via `useBAIi18n()` which calls
                     * `useTranslation(undefined, { i18n: buiI18n })` — explicit
                     * instance binding bypasses React Context entirely, so the
                     * host's i18n Context flows through to host components
                     * unchanged. See FR-2986 / packages/backend.ai-ui/src/hooks/
                     * useBAIi18n.ts.
                     */}
                    <BAIAppProvider message={messageConfig} toast={toastConfig}>
                      <BAIMetaDataProviderWrapper>
                        {/* Single app-wide notification renderer. Lives outside
                            the Suspense below so toasts work on every route and
                            in both anonymous and authenticated states. */}
                        <NotificationHost />
                        {/*
                         * to-astryx ticket 33 removed the emotion plumbing that
                         * used to wrap this Suspense: an @emotion/react
                         * <CacheProvider> (nonce for `createGlobalStyle`) inside
                         * antd-style's <StyleProvider nonce> (nonce for
                         * `createStyles`). With the last antd-style call site
                         * gone, no style engine injects <style> at runtime on
                         * our behalf — the replacement rules ship as bundled
                         * same-origin stylesheets, which `style-src 'self'`
                         * already covers.
                         *
                         * The final switch closed the last gap in that story:
                         * antd's cssinjs — the one runtime style injector left,
                         * fed the nonce via `<ConfigProvider csp>` — is gone
                         * too, so NOTHING injects <style> at runtime any more
                         * and `globalThis.baiNonce` has no remaining consumer
                         * in the React tree.
                         */}
                        <Suspense>
                          {/* <BrowserRouter> */}
                          {/* <RoutingEventHandler /> */}
                          {children}
                          {/* </BrowserRouter> */}
                        </Suspense>
                      </BAIMetaDataProviderWrapper>
                    </BAIAppProvider>
                  </FormConfigProvider>
                </BAIConfigProvider>
              </ThemeShimProvider>
            </AstryxBrandTheme>
          </QueryClientProvider>
        </RelayEnvironmentProvider>
      )}
    </>
  );
};
