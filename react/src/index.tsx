import App from './App';
import BAIErrorBoundary from './components/BAIErrorBoundary';
import Flex from './components/Flex';
import FlexActivityIndicator from './components/FlexActivityIndicator';
import ResourceGroupSelect from './components/ResourceGroupSelect';
import { loadCustomThemeConfig } from './helper/customThemeConfig';
import reactToWebComponent from './helper/react-to-webcomponent';
import ModelStoreListPage from './pages/ModelStoreListPage';
import { Form } from 'antd';
import { t } from 'i18next';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
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
const SessionLauncherPage = React.lazy(
  () => import('./pages/SessionLauncherPage'),
);
const ContainerRegistryList = React.lazy(
  () => import('./components/ContainerRegistryList'),
);
const KeypairInfoModal = React.lazy(
  () => import('./components/KeypairInfoModal'),
);

const SignoutModal = React.lazy(() => import('./components/SignoutModal'));

const AnnouncementAlert = React.lazy(
  () => import('./components/AnnouncementAlert'),
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
        <Routes>
          <Route path="/session" element={<SessionList />} />
          <Route path="/session/start" element={<SessionLauncherPage />} />
        </Routes>
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

customElements.define(
  'backend-ai-react-resource-group-select',
  reactToWebComponent((props) => {
    const [value, setValue] = React.useState(props.value || '');

    React.useEffect(() => {
      if (props.value !== value) {
        setValue(props.value || '');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value]);

    return (
      <DefaultProviders {...props}>
        <Flex direction="column" align="stretch" style={{ minWidth: 200 }}>
          <Form layout="vertical">
            <Form.Item
              label={t('session.launcher.ResourceGroup')}
              style={{ margin: 0 }}
            >
              <ResourceGroupSelect
                size="large"
                value={value}
                loading={value !== props.value || value === ''}
                onChange={(value) => {
                  setValue(value);
                  props.dispatchEvent('change', value);
                }}
              />
            </Form.Item>
          </Form>
        </Flex>
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-container-registry-list',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <Suspense fallback={<FlexActivityIndicator />}>
          <ContainerRegistryList />
        </Suspense>
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-model-store-list',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <Suspense fallback={<FlexActivityIndicator />}>
          <ModelStoreListPage />
        </Suspense>
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-keypair-info-modal',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <KeypairInfoModal
          open={props.value === 'true'}
          onRequestClose={() => {
            props.dispatchEvent('close', null);
          }}
        />
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-signout-modal',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <SignoutModal
          open={props.value === 'true'}
          onRequestClose={() => {
            props.dispatchEvent('close', null);
          }}
        />
      </DefaultProviders>
    );
  }),
);

const root = ReactDOM.createRoot(
  document.getElementById('react-root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
