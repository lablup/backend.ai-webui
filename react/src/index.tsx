import reactToWebComponent from "./helper/react-to-webcomponent";
import React, { Suspense } from "react";
import { loadCustomThemeConfig } from "./helper/customThemeConfig";
import { Route, Routes } from "react-router-dom";

// Load custom theme config once in react/index.tsx
loadCustomThemeConfig();

const DefaultProviders = React.lazy(
  () => import("./components/DefaultProviders")
);
const Information = React.lazy(() => import("./components/Information"));
const SessionList = React.lazy(() => import("./pages/SessionListPage"));
const ServingList = React.lazy(() => import("./pages/ServingListPage"));
const RoutingList = React.lazy(() => import("./pages/RoutingListPage"));
const ResetPasswordRequired = React.lazy(
  () => import("./components/ResetPasswordRequired")
);
const StorageHostSettingPage = React.lazy(
  () => import("./pages/StorageHostSettingPage")
);
const StorageStatusPanel = React.lazy(
  () => import("./components/StorageStatusPanel")
);
const StorageStatusPanelFallback = React.lazy(() =>
  import("./components/StorageStatusPanel").then((m) => ({
    default: m.StorageStatusPanelFallback,
  }))
);
const CopyableCodeText = React.lazy(
  () => import("./components/CopyableCodeText")
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
  "backend-ai-react-session-list",
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <SessionList>{props.children}</SessionList>
      </DefaultProviders>
    );
  })
);

customElements.define(
  "backend-ai-react-serving-list",
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <Routes>
          <Route path="/serving" element={<ServingList />} />
          <Route path="/serving/:serviceId" element={<RoutingList />} />
        </Routes>
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
        <Suspense fallback={<StorageStatusPanelFallback />}>
          <StorageStatusPanel fetchKey={props.value || ""} />
        </Suspense>
      </DefaultProviders>
    );
  })
);

customElements.define(
  "backend-ai-react-copyable-code-text",
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <CopyableCodeText text={props.value || ""} />
      </DefaultProviders>
    );
  })
);
