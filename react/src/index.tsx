import reactToWebComponent from "./helper/react-to-webcomponent";
import { ThemeConfig } from "antd/lib/config-provider";
import React from "react";
import { loadCustomThemeConfig } from "./helper/customeThemeConfig";

// Load custom theme config once in react/index.tsx
loadCustomThemeConfig();

const DefaultProviders = React.lazy(
  () => import("./components/DefaultProviders")
);
const Information = React.lazy(() => import("./components/Information"));

customElements.define(
  "backend-ai-react-information",
  reactToWebComponent((props) => (
    <DefaultProviders {...props}>
      <Information />
    </DefaultProviders>
  ))
);
