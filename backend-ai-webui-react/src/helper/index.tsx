import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { StyleProvider } from "@ant-design/cssinjs";
import reactToWebComponent from "react-to-webcomponent";
import root from "react-shadow";
import { ConfigProvider } from "antd";
import PropTypes from "prop-types";

interface WebComponentContextType {
  shadowRoot?: ShadowRoot;
}

// eslint-disable-next-line
const WebComponentContext = React.createContext<WebComponentContextType>(null!);

export function useWebComponentInfo() {
  return React.useContext(WebComponentContext);
}

export const reactToWebComponentWithDefault = (
  ReactComponent: React.FunctionComponent | React.Component
) => {
  const Root: React.FC<{
    value?: string;
  }> = ({ value }) => {
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

    return (
      <root.div className="react-component" ref={node}>
        {node.current?.shadowRoot ? (
          <WebComponentContext.Provider
            value={{
              shadowRoot: node.current?.shadowRoot,
            }}
          >
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
                  <ReactComponent value={value} />
                </React.StrictMode>
              </StyleProvider>
            </ConfigProvider>
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
