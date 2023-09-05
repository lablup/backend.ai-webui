import BAIErrorBoundary from './components/BAIErrorBoundary';
import { loadCustomThemeConfig } from './helper/customThemeConfig';
import reactToWebComponent from './helper/react-to-webcomponent';
import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

// Load custom theme config once in react/index.tsx
loadCustomThemeConfig();

const DefaultProviders = React.lazy(
  () => import('./components/DefaultProviders'),
);
const Information = React.lazy(() => import('./components/Information'));
const SessionList = React.lazy(() => import('./pages/SessionListPage'));
const ServingList = React.lazy(() => import('./pages/ServingListPage'));
const RoutingList = React.lazy(() => import('./pages/RoutingListPage'));
const ResetPasswordRequired = React.lazy(
  () => import('./components/ResetPasswordRequired'),
);
const StorageHostSettingPage = React.lazy(
  () => import('./pages/StorageHostSettingPage'),
);
const StorageStatusPanel = React.lazy(
  () => import('./components/StorageStatusPanel'),
);
const StorageStatusPanelFallback = React.lazy(() =>
  import('./components/StorageStatusPanel').then((m) => ({
    default: m.StorageStatusPanelFallback,
  })),
);
const CopyableCodeText = React.lazy(
  () => import('./components/CopyableCodeText'),
);
const UserInfoModal = React.lazy(() => import('./components/UserInfoModal'));
const UserSettingsModal = React.lazy(
  () => import('./components/UserSettingModal'),
);

const ManageAppsModal = React.lazy(
  () => import('./components/ManageAppsModal'),
);
const UserDropdownMenu = React.lazy(
  () => import('./components/UserDropdownMenu'),
);
const UserProfileSettingModal = React.lazy(
  () => import('./components/UserProfileSettingModal'),
);

customElements.define(
  'backend-ai-react-information',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <BAIErrorBoundary>
          <Information />
        </BAIErrorBoundary>
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-session-list',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <SessionList>{props.children}</SessionList>
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-serving-list',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <BAIErrorBoundary>
          <Routes>
            <Route path="/serving" element={<ServingList />} />
            <Route path="/serving/:serviceId" element={<RoutingList />} />
          </Routes>
        </BAIErrorBoundary>
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-reset-password-required-modal',
  reactToWebComponent((props) => (
    <DefaultProviders {...props}>
      <ResetPasswordRequired />
    </DefaultProviders>
  )),
);

customElements.define(
  'backend-ai-react-storage-host-settings',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <BAIErrorBoundary>
          <StorageHostSettingPage
            key={props.value}
            storageHostId={props.value || ''}
          />
        </BAIErrorBoundary>
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-storage-status-panel',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <Suspense fallback={<StorageStatusPanelFallback />}>
          <StorageStatusPanel fetchKey={props.value || ''} />
        </Suspense>
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-copyable-code-text',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <CopyableCodeText text={props.value || ''} />
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-user-info-dialog',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <UserInfoModal />
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-user-setting-dialog',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <UserSettingsModal />
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-manage-app-dialog',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <ManageAppsModal />
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-user-dropdown-menu',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <UserDropdownMenu />
      </DefaultProviders>
    );
  }),
);
customElements.define(
  'backend-ai-react-user-profile-setting-dialog',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <UserProfileSettingModal
          open={props.value === 'true'}
          onRequestClose={() => {
            props.dispatchEvent('close', null);
          }}
        />
      </DefaultProviders>
    );
  }),
);
