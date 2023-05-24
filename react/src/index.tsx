import reactToWebComponent from "./helper/react-to-webcomponent";
import React from "react";
import { loadCustomThemeConfig } from "./helper/customeThemeConfig";

// Load custom theme config once in react/index.tsx
loadCustomThemeConfig();

const DefaultProviders = React.lazy(
  () => import("./components/DefaultProviders")
);
const Information = React.lazy(() => import("./components/Information"));
const ResetPasswordRequired = React.lazy(
  () => import("./components/ResetPasswordRequired")
);

customElements.define(
  "backend-ai-react-information",
  reactToWebComponent((props) => (
    <DefaultProviders {...props}>
      <Information />
    </DefaultProviders>
  ))
);

customElements.define(
  "backend-ai-react-reset-password-required-modal",
  reactToWebComponent((props) => (
    <DefaultProviders {...props}>
      <ResetPasswordRequired />
    </DefaultProviders>
  ))
);
