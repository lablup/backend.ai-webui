import { RelayEnvironment } from '../RelayEnvironment';
// @ts-ignore
import rawFixAntCss from '../fix_antd.css?raw';
import { useCustomThemeConfig } from '../helper/customThemeConfig';
import { ReactWebComponentProps } from '../helper/react-to-webcomponent';
import { ThemeModeProvider, useThemeMode } from '../hooks/useThemeMode';
// @ts-ignore
import indexCss from '../index.css?raw';
import { StyleProvider, createCache } from '@ant-design/cssinjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateEffect } from 'ahooks';
import { App, AppProps, ConfigProvider, theme, Typography } from 'antd';
import en_US from 'antd/locale/en_US';
import ko_KR from 'antd/locale/ko_KR';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import duration from 'dayjs/plugin/duration';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { GlobeIcon } from 'lucide-react';
import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation, initReactI18next } from 'react-i18next';
import { RelayEnvironmentProvider } from 'react-relay';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
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

interface WebComponentContextType {
  value?: ReactWebComponentProps['value'];
  parsedValue?: any;
  dispatchEvent: ReactWebComponentProps['dispatchEvent'];
  moveTo: (
    path: string,
    params?: {
      [key in string]?: boolean | string | number;
    },
  ) => void;
}

const WebComponentContext = React.createContext<WebComponentContextType>(null!);
const ShadowRootContext = React.createContext<ShadowRoot>(null!);
export const useShadowRoot = () => React.useContext(ShadowRootContext);
export const useWebComponentInfo = <ParsedType extends any>() => {
  const context = React.useContext(WebComponentContext);
  return {
    ...context,
    parsedValue: context.parsedValue as ParsedType,
  };
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export interface DefaultProvidersProps extends ReactWebComponentProps {
  children?: React.ReactNode;
}

let isDebugModeByParam = false;
if (process.env.NODE_ENV === 'development') {
  const urlParams = new URLSearchParams(window.location.search);
  isDebugModeByParam = urlParams.get('debug') === 'true';
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(Backend)
  .use({
    type: 'postProcessor',
    name: 'copyableI18nKey',
    process: function (value: any, key: any, options: any, translator: any) {
      // @ts-ignore
      if (globalThis?.backendaiwebui?.debug || isDebugModeByParam) {
        return (
          <Typography.Text
            copyable={{
              text: key,
              tooltips: key,
              icon: <GlobeIcon />,
            }}
          >
            {value}
          </Typography.Text>
        );
      } else {
        return value;
      }
    },
  })
  .init({
    backend: {
      loadPath: '/resources/i18n/{{lng}}.json',
    },
    postProcess:
      process.env.NODE_ENV === 'development' ? ['copyableI18nKey'] : [],
    lng:
      //@ts-ignore
      globalThis?.backendaioptions?.get('language', 'default', 'general') ||
      'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
    react: {
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'span', 'code', 'p'],
    },
  });

export const useCurrentLanguage = () => {
  const [lang, _setLang] = useState(
    //@ts-ignore
    globalThis?.backendaioptions?.get('language', 'default', 'general') || 'en',
  );
  const { i18n } = useTranslation();

  useEffect(() => {
    // TODO: remove this hack to initialize i18next
    setTimeout(() => i18n?.changeLanguage(lang), 0);
    // For changing locale globally, use dayjs.locale instead of dayjs().locale
    dayjs.locale(lang);
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

const DefaultProvidersForWebComponent: React.FC<DefaultProvidersProps> = ({
  children,
  value,
  styles,
  shadowRoot,
  dispatchEvent,
}) => {
  const cache = useMemo(() => createCache(), []);
  const [lang] = useCurrentLanguage();
  const themeConfig = useCustomThemeConfig();
  const { isDarkMode } = useThemeMode();

  const componentValues = useMemo(() => {
    let parsedValue: any;
    try {
      parsedValue = JSON.parse(value || '');
    } catch (error) {
      parsedValue = {};
    }
    return {
      value,
      parsedValue,
      dispatchEvent,
      moveTo: (path, params) => {
        dispatchEvent('moveTo', { path, params: params });
      },
    } as WebComponentContextType;
  }, [value, dispatchEvent]);
  return (
    <JotaiProvider store={jotaiStore}>
      {RelayEnvironment && (
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <React.StrictMode>
            <style>
              {styles}
              {rawFixAntCss}
              {indexCss}
            </style>
            <QueryClientProvider client={queryClient}>
              <ShadowRootContext.Provider value={shadowRoot}>
                <ThemeModeProvider>
                  <WebComponentContext.Provider value={componentValues}>
                    <ConfigProvider
                      // @ts-ignore
                      getPopupContainer={(triggerNode) => {
                        return triggerNode?.parentNode || shadowRoot;
                      }}
                      //TODO: apply other supported locales
                      locale={'ko' === lang ? ko_KR : en_US}
                      theme={{
                        ...(isDarkMode
                          ? { ...themeConfig?.dark }
                          : { ...themeConfig?.light }),
                        algorithm: isDarkMode
                          ? theme.darkAlgorithm
                          : theme.defaultAlgorithm,
                        cssVar: true,
                      }}
                    >
                      <App {...commonAppProps}>
                        <StyleProvider container={shadowRoot} cache={cache}>
                          <Suspense fallback="">
                            <BrowserRouter>
                              <QueryParamProvider
                                adapter={ReactRouter6Adapter}
                                options={
                                  {
                                    // searchStringToObject: queryString.parse,
                                    // objectToSearchString: queryString.stringify,
                                  }
                                }
                              >
                                <RoutingEventHandler />
                                {children}
                              </QueryParamProvider>
                            </BrowserRouter>
                          </Suspense>
                        </StyleProvider>
                      </App>
                    </ConfigProvider>
                  </WebComponentContext.Provider>
                </ThemeModeProvider>
              </ShadowRootContext.Provider>
            </QueryClientProvider>
          </React.StrictMode>
        </RelayEnvironmentProvider>
      )}
    </JotaiProvider>
  );
};

export const RoutingEventHandler = () => {
  const navigate = useNavigate();
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

const DefaultProviders: React.FC<DefaultProvidersProps> = (props) => {
  return (
    <ThemeModeProvider>
      <DefaultProvidersForWebComponent {...props} />
    </ThemeModeProvider>
  );
};

export default DefaultProviders;

export const DefaultProvidersForReactRoot: React.FC<
  Partial<DefaultProvidersProps>
> = ({ children, value, styles }) => {
  const [lang] = useCurrentLanguage();
  const themeConfig = useCustomThemeConfig();
  const { isDarkMode } = useThemeMode();

  return (
    <>
      <style>{indexCss}</style>
      {RelayEnvironment && (
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <QueryClientProvider client={queryClient}>
            <ConfigProvider
              // @ts-ignore
              // getPopupContainer={(triggerNode) => {
              //   return triggerNode?.parentNode || shadowRoot;
              // }}
              //TODO: apply other supported locales
              locale={'ko' === lang ? ko_KR : en_US}
              theme={{
                ...(isDarkMode
                  ? { ...themeConfig?.dark }
                  : { ...themeConfig?.light }),
                algorithm: isDarkMode
                  ? theme.darkAlgorithm
                  : theme.defaultAlgorithm,
              }}
            >
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
            </ConfigProvider>
          </QueryClientProvider>
        </RelayEnvironmentProvider>
      )}
    </>
  );
};
