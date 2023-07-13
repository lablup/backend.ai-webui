import reactToWebComponent from "./helper/react-to-webcomponent";
import React from "react";
import { loadCustomThemeConfig } from "./helper/customThemeConfig";

// Load custom theme config once in react/index.tsx
loadCustomThemeConfig();

const DefaultProviders = React.lazy(
  () => import("./components/DefaultProviders")
);
const Information = React.lazy(() => import("./components/Information"));
const ResetPasswordRequired = React.lazy(
  () => import("./components/ResetPasswordRequired")
);
const StorageHostSettingPage = React.lazy(
  () => import("./pages/StorageHostSettingPage")
);
const StorageStatusPanel = React.lazy(
  () => import("./components/StorageStatusPanel")
);

customElements.define(
  "backend-ai-react-information",
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <Information />
      </DefaultProviders>
    );
  })
);

customElements.define(
  "backend-ai-react-reset-password-required-modal",
  reactToWebComponent((props) => (
    <DefaultProviders {...props}>
      <ResetPasswordRequired />
    </DefaultProviders>
  ))
);

customElements.define(
  "backend-ai-react-storage-host-settings",
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <StorageHostSettingPage
          key={props.value}
          storageHostId={props.value || ""}
        />
      </DefaultProviders>
    );
  })
);

customElements.define(
  "backend-ai-react-storage-status-panel",
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <StorageStatusPanel fetchKey={props.value || ""} />
      </DefaultProviders>
    );
  })
);
