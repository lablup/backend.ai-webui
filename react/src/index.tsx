import reactToWebComponent from "./helper/react-to-webcomponent";
import React from "react";
import { loadCustomThemeConfig } from "./helper/customThemeConfig";
import { Routes, Route } from "react-router-dom";

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
  reactToWebComponent((props) => (
    <DefaultProviders {...props}>
      <Routes>
        <Route path="storage-settings" element={<StorageHostSettingPage />} />
        <Route
          path="storage-settings/:storageHostId"
          element={<StorageHostSettingPage />}
        />
      </Routes>
    </DefaultProviders>
  ))
);
