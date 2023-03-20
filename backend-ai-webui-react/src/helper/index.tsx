import React from "react";
import ReactDOM from "react-dom/client";
import { StyleProvider } from "@ant-design/cssinjs";
import reactToWebComponent from "../helper/react-to-webcomponent";
import { ConfigProvider } from "antd";

import { QueryClient, QueryClientProvider } from "react-query";
// Create a client
const queryClient = new QueryClient();

interface WebComponentContextType {
  props: ReactWebComponentProps;
}
const WebComponentContext = React.createContext<WebComponentContextType>(null!);
export function useWebComponentInfo() {
  return React.useContext(WebComponentContext);
}

export interface ReactWebComponentProps {
  value?: string;
  styles?: string;
  dispatchEvent?: (name: string, detail: any) => void;
  shadowRoot: ShadowRoot;
}

export const reactToWebComponentWithDefault = (
  ReactComponent: React.FunctionComponent<ReactWebComponentProps>
) => {
  const Root: React.FC<ReactWebComponentProps> = (props) => {
    console.log(props.styles);
    return (
      <>
        <style>{props.styles}</style>
        <WebComponentContext.Provider
          value={{
            props,
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
                <React.StrictMode>
                  {/* @ts-ignore */}
                  <ReactComponent
                    value={props.value}
                    dispatchEvent={props.dispatchEvent}
                  />
                </React.StrictMode>
              </StyleProvider>
            </ConfigProvider>
          </QueryClientProvider>
        </WebComponentContext.Provider>
      </>
    );
  };

  return reactToWebComponent(Root, React, ReactDOM);
};

// Another way to do it:
// class WebUIReactElement extends HTMLElement {
//   connectedCallback() {
//     const mountPoint = document.createElement("div");
//     this.attachShadow({ mode: "open" }).appendChild(mountPoint);
//     //@ts-ignore
//     window.__REACT_SHADOW_ROOT__ = this.shadowRoot;
//     const name = this.getAttribute("name");
//     const root = ReactDOM.createRoot(mountPoint);
//     root.render(
//       <ConfigProvider
//         // @ts-ignore
//         getPopupContainer={(triggerNode?: HTMLElement) => {
//           if (triggerNode) {
//             return triggerNode.parentNode;
//           }
//           return this.shadowRoot;
//         }}
//       >
//         {/* @ts-ignore */}
//         <StyleProvider container={this.shadowRoot}>
//           <React.StrictMode>
//             <App />
//           </React.StrictMode>
//         </StyleProvider>
//       </ConfigProvider>
//     );
//   }
// }

// customElements.define("backend-ai-webui-react", WebUIReactElement);
