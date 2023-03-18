import React, { useEffect, useRef, useState, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { StyleProvider } from "@ant-design/cssinjs";
import reactToWebComponent from "../helper/react-to-webcomponent.js";
import root from "react-shadow";
import { Button, ConfigProvider } from "antd";
import PropTypes from "prop-types";

import { QueryClient, QueryClientProvider } from "react-query";
// Create a client
const queryClient = new QueryClient();

interface WebComponentContextType {
  shadowRoot?: ShadowRoot;
  props: ReactWebComponentProps;
}

// eslint-disable-next-line
const WebComponentContext = React.createContext<WebComponentContextType>(null!);

export function useWebComponentInfo() {
  return React.useContext(WebComponentContext);
}

export interface ReactWebComponentProps {
  value?: string;
  onEvent: (name: string, detail:any) => void;
}

export const reactToWebComponentWithDefault = (
  ReactComponent: React.FunctionComponent | React.Component
) => {
  const Root: React.FC<ReactWebComponentProps> = (props) => {
    const node = useRef<HTMLElement>(null);
    const [, setState] = useState(0);

    // to force re-render after shadowRoot is created
    useEffect(() => {
      setTimeout(() => {
        setState((x) => x + 1);
      }, 0);
    }, []);

    //@ts-ignore
    function getPopupContainer(triggerNode?: HTMLElement) {
      if (triggerNode) {
        return triggerNode.parentNode;
      }
      return node.current?.shadowRoot;
    }

    //@ts-ignore
    // window.__REACT_SHADOW_ROOT__ = node.current?.shadowRoot;

    const contextValue = useMemo<WebComponentContext>(() => {
      return {
        shadowRoot: node.current?.shadowRoot,
        props: props,
      };
    }, [node.current, props]);
    console.log(props,)
    return (
      <root.div className="react-component" ref={node}>
        {node.current?.shadowRoot ? (
          <WebComponentContext.Provider value={contextValue}>
            <QueryClientProvider client={queryClient}>
              <ConfigProvider
                // @ts-ignore
                getPopupContainer={getPopupContainer}
                theme={{
                  token: {
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
                <StyleProvider container={node.current?.shadowRoot}>
                  <React.StrictMode>
                    {/* @ts-ignore */}
                    <ReactComponent value={props.value} />
                    <Button onClick={(e)=>{
                      console.log('click')
                      e.stopPropagation();
                      props.onEvent('click', {value: 'hello'})
                    }}>Event</Button>
                    <slot name="hello">alsdkfjalksjf</slot>
                  </React.StrictMode>
                </StyleProvider>
              </ConfigProvider>
            </QueryClientProvider>
          </WebComponentContext.Provider>
        ) : null}
      </root.div>
    );
  };

  Root.propTypes = {
    value: PropTypes.string,
  };

  //@ts-ignore
  return reactToWebComponent(Root, React, ReactDOM, {
    dashStyleAttributes: true,
    shadow: null,
  }) as CustomElementConstructor;
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
