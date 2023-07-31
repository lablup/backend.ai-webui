import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { StyleProvider, createCache } from "@ant-design/cssinjs";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactWebComponentProps } from "../helper/react-to-webcomponent";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

import en_US from "antd/locale/en_US";
import ko_KR from "antd/locale/ko_KR";
import { RelayEnvironment } from "../RelayEnvironment";
import { useCustomThemeConfig } from "../helper/customThemeConfig";

// @ts-ignore
import rawFixAntCss from "../fix_antd.css?raw";
import { BrowserRouter, useNavigate } from "react-router-dom";

interface WebComponentContextType {
  value?: ReactWebComponentProps["value"];
  dispatchEvent: ReactWebComponentProps["dispatchEvent"];
  moveTo: (path: string) => void;
}

const WebComponentContext = React.createContext<WebComponentContextType>(null!);
const ShadowRootContext = React.createContext<ShadowRoot>(null!);
export const useShadowRoot = () => React.useContext(ShadowRootContext);
export const useWebComponentInfo = () => React.useContext(WebComponentContext);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export interface DefaultProvidersProps extends ReactWebComponentProps {
  children?: React.ReactNode;
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(Backend)
  .init({
    backend: {
      loadPath: "/resources/i18n/{{lng}}.json",
    },
    //@ts-ignore
    lng: globalThis?.backendaioptions?.get("current_language") || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

const useCurrentLanguage = () => {
  const [lang, _setLang] = useState(
    //@ts-ignore
    globalThis?.backendaioptions?.get("current_language")
  );
  const { i18n } = useTranslation();

  useEffect(() => {
    // TODO: remove this hack to initialize i18next
    setTimeout(() => i18n?.changeLanguage(lang), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      //@ts-ignore
      _setLang(e?.detail?.lang);
      //@ts-ignore
      const lang: string = e?.detail?.lang || "en";
      i18n?.changeLanguage(lang);
    };
    window.addEventListener("langChanged", handler);
    return () => window.removeEventListener("langChanged", handler);
  }, [i18n]);

  return [lang] as const;
};

const DefaultProviders: React.FC<DefaultProvidersProps> = ({
  children,
  value,
  styles,
  shadowRoot,
  dispatchEvent,
}) => {
  const cache = useMemo(() => createCache(), []);
  const [lang] = useCurrentLanguage();
  const themeConfig = useCustomThemeConfig();

  const componentValues = useMemo(() => {
    return {
      value,
      dispatchEvent,
      moveTo: (path: string) => {
        dispatchEvent("moveTo", { path });
      },
    };
  }, [value, dispatchEvent]);
  return (
    <>
      {RelayEnvironment && (
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <React.StrictMode>
            <style>
              {styles}
              {rawFixAntCss}
            </style>
            <QueryClientProvider client={queryClient}>
              <ShadowRootContext.Provider value={shadowRoot}>
                <WebComponentContext.Provider value={componentValues}>
                  <ConfigProvider
                    // @ts-ignore
                    getPopupContainer={(triggerNode) => {
                      if (triggerNode?.parentNode) {
                        return triggerNode.parentNode;
                      }
                      return shadowRoot;
                    }}
                    //TODO: apply other supported locales
                    locale={"ko" === lang ? ko_KR : en_US}
                    theme={themeConfig}
                  >
                    <StyleProvider container={shadowRoot} cache={cache}>
                      <Suspense fallback="">
                        <BrowserRouter>
                          <RoutingEventHandler />
                          {children}
                        </BrowserRouter>
                      </Suspense>
                    </StyleProvider>
                  </ConfigProvider>
                </WebComponentContext.Provider>
              </ShadowRootContext.Provider>
            </QueryClientProvider>
          </React.StrictMode>
        </RelayEnvironmentProvider>
      )}
    </>
  );
};

const RoutingEventHandler = () => {
  const navigate = useNavigate();
  useLayoutEffect(() => {
    const handleNavigate = (e: any) => {
      const { detail } = e;
      navigate(detail, {
        // we don't want to add duplicated one to history.
        // On lit component side, it adds to history already.
        replace: true,
      });
    };
    document.addEventListener("react-navigate", handleNavigate);

    return () => {
      document.removeEventListener("react-navigate", handleNavigate);
    };
  }, [navigate]);

  return null;
};

export default DefaultProviders;
