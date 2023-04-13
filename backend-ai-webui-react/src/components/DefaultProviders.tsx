import React, { useEffect, useMemo, useState } from "react";
import { StyleProvider, createCache } from "@ant-design/cssinjs";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactWebComponentProps } from "../helper/react-to-webcomponent";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import Backend from 'i18next-http-backend';

import en_US from 'antd/locale/en_US';
import ko_KR from 'antd/locale/ko_KR';

interface WebComponentContextType {
  props: ReactWebComponentProps;
  // @ts-ignore
  resourceBroker?: any;
}
const WebComponentContext = React.createContext<WebComponentContextType>(null!);

export function useWebComponentInfo() {
  return React.useContext(WebComponentContext);
}

// Create a client
const queryClient = new QueryClient();

export interface DefaultProvidersProps extends ReactWebComponentProps {
  children?: React.ReactNode;
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(Backend)
  .init({
    backend: {
      loadPath: '/resources/i18n/{{lng}}.json',
    },
    //@ts-ignore
    lng: globalThis?.backendaioptions?.get('current_language') || "en", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    }
  });
  

const useCurrentLanguage = () => {
  //@ts-ignore
  const [lang, _setLang] = useState(globalThis.backendaioptions.get('current_language'));
  const {i18n}= useTranslation();

  useEffect(()=>{
    // TODO: remove this hack to initialize i18next
    setTimeout(()=> i18n.changeLanguage(lang), 0);
  },[]);

  useEffect(()=>{
    const handler = (e:Event) => {
      //@ts-ignore
      _setLang(e.detail.lang)
      //@ts-ignore
      const lang:string = e.detail?.lang || "en";
      i18n.changeLanguage(lang);
    }
    window.addEventListener('langChanged',handler);
    return ()=> window.removeEventListener('langChanged',handler);
  },[i18n]);

  return [lang] as const;
}

const DefaultProviders: React.FC<DefaultProvidersProps> = ({
  children,
  ...props
}) => {
  const cache = useMemo(() => createCache(), []);
  const [lang] = useCurrentLanguage();

  return (
    <React.StrictMode>
      <style>{props.styles}</style>
      <WebComponentContext.Provider
        value={{
          props,
          //@ts-ignore
          resourceBroker: globalThis?.resourceBroker,
        }}
      >
        <QueryClientProvider client={queryClient}>
          <ConfigProvider
            // @ts-ignore
            getPopupContainer={(triggerNode) => {
              if (triggerNode?.parentNode) {
                return triggerNode.parentNode;
              }
              return props.shadowRoot;
            }}
            locale={"ko" === lang ? ko_KR : en_US}
            theme={{
              token: {
                fontFamily: `'Ubuntu', Roboto, sans-serif`,
                colorPrimary: "#37B076",
                colorLink: "#37B076",
                colorLinkHover: "#71b98c",
                colorSuccess: "#37B076",
              },
              components: {
                Tag: {
                  borderRadiusSM: 1,
                },
                Collapse: {
                  colorFillAlter: "#FAFAFA",
                  borderRadiusLG: 0,
                },
                Menu: {
                  colorItemBgSelected: "transparent",
                  colorItemTextSelected: "rgb(114,235,81)", //"#37B076",
                  radiusItem: 0,
                },
              },
            }}
          >
            <StyleProvider container={props.shadowRoot} cache={cache}>
              {children}
            </StyleProvider>
          </ConfigProvider>
        </QueryClientProvider>
      </WebComponentContext.Provider>
    </React.StrictMode>
  );
};

export default DefaultProviders;
