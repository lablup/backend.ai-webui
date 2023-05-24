import React, { useEffect, useMemo, useState } from "react";
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
import { BackendaiClientProvider } from "./BackendaiClientProvider";
import { useCustomThemeConfig } from "../helper/customeThemeConfig";
import { RelayEnvironment } from "../RelayEnvironment";

// @ts-ignore
import rawFixAntCss from "../fix_antd.css?raw";

interface WebComponentContextType {
  value?: ReactWebComponentProps["value"];
  dispatchEvent?: ReactWebComponentProps["dispatchEvent"];
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
    globalThis.backendaioptions.get("current_language")
  );
  const { i18n } = useTranslation();

  useEffect(() => {
    // TODO: remove this hack to initialize i18next
    setTimeout(() => i18n.changeLanguage(lang), 0);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      //@ts-ignore
      _setLang(e.detail.lang);
      //@ts-ignore
      const lang: string = e.detail?.lang || "en";
      i18n.changeLanguage(lang);
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
    };
  }, [value, dispatchEvent]);
  return (
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <React.StrictMode>
        <style>
          {styles}
          {rawFixAntCss}
        </style>
        <QueryClientProvider client={queryClient}>
          <ShadowRootContext.Provider value={shadowRoot}>
            <BackendaiClientProvider>
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
                    {children}
                  </StyleProvider>
                </ConfigProvider>
              </WebComponentContext.Provider>
            </BackendaiClientProvider>
          </ShadowRootContext.Provider>
        </QueryClientProvider>
      </React.StrictMode>
    </RelayEnvironmentProvider>
  );
};

export default DefaultProviders;
