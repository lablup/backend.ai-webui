import React from "react";
import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactWebComponentProps } from "../helper/react-to-webcomponent";

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

const DefaultProviders: React.FC<DefaultProvidersProps> = ({
  children,
  ...props
}) => {
  return (
    <>
      {/* <style>{props.styles}</style> */}
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
            <StyleProvider container={props.shadowRoot}>
              <React.StrictMode>{children}</React.StrictMode>
            </StyleProvider>
          </ConfigProvider>
        </QueryClientProvider>
      </WebComponentContext.Provider>
    </>
  );
};

export default DefaultProviders;
