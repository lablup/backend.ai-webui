import App from './App';
import BAIIntervalText from './components/BAIIntervalText';
import { jotaiStore, useWebComponentInfo } from './components/DefaultProviders';
import Flex from './components/Flex';
import FlexActivityIndicator from './components/FlexActivityIndicator';
import ResourceGroupSelectForCurrentProject from './components/ResourceGroupSelectForCurrentProject';
import SourceCodeViewer from './components/SourceCodeViewer';
import { loadCustomThemeConfig } from './helper/customThemeConfig';
import reactToWebComponent, {
  ReactWebComponentProps,
} from './helper/react-to-webcomponent';
import { useSuspendedBackendaiClient } from './hooks';
import { useCurrentResourceGroupValue } from './hooks/useCurrentProject';
import { ThemeModeProvider } from './hooks/useThemeMode';
import { Tag, theme } from 'antd';
import dayjs from 'dayjs';
import { Provider as JotaiProvider } from 'jotai';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';

// Load custom theme config once in react/index.tsx
loadCustomThemeConfig();

const DefaultProviders = React.lazy(
  () => import('./components/DefaultProviders'),
);
const SessionList = React.lazy(() => import('./pages/SessionListPage'));
const ResetPasswordRequired = React.lazy(
  () => import('./components/ResetPasswordRequired'),
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
const ManageImageResourceLimitModal = React.lazy(
  () => import('./components/ManageImageResourceLimitModal'),
);
const UserDropdownMenu = React.lazy(
  () => import('./components/UserDropdownMenu'),
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

const ErrorLogList = React.lazy(() => import('./components/ErrorLogList'));

const BatchSessionScheduledTimeSetting = React.lazy(
  () => import('./components/BatchSessionScheduledTimeSetting'),
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
  'backend-ai-react-reset-password-required-modal',
  reactToWebComponent((props) => (
    <DefaultProviders {...props}>
      <ResetPasswordRequired />
    </DefaultProviders>
  )),
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
        <UserInfoModal draggable />
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-user-setting-dialog',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <UserSettingsModal draggable />
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
  'backend-ai-react-manage-resource-dialog',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <ManageImageResourceLimitModal />
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
  'backend-ai-react-source-code-viewer',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <SourceCodeViewerInWebComponent {...props} />
      </DefaultProviders>
    );
  }),
);

const SourceCodeViewerInWebComponent = (props: ReactWebComponentProps) => {
  const {
    parsedValue: { children, language, wordWrap } = {
      children: '',
      language: '',
    },
  } = useWebComponentInfo<{
    children: string;
    language: string;
    wordWrap?: boolean;
  }>();
  return (
    <SourceCodeViewer language={language} wordWrap={wordWrap ? true : false}>
      {children}
    </SourceCodeViewer>
  );
};

customElements.define(
  'backend-ai-react-resource-group-select',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <ResourceGroupSelectInWebComponent {...props} />
      </DefaultProviders>
    );
  }),
);

const ResourceGroupSelectInWebComponent = (props: ReactWebComponentProps) => {
  const { t } = useTranslation();

  useSuspendedBackendaiClient();

  const currentResourceGroupByProject = useCurrentResourceGroupValue();

  React.useEffect(() => {
    if (
      // @ts-ignore
      currentResourceGroupByProject !== globalThis.resourceBroker.scaling_group
    ) {
      props.dispatchEvent('change', currentResourceGroupByProject);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentResourceGroupByProject,
    // @ts-ignore
    globalThis.resourceBroker.scaling_group,
  ]);
  return (
    <Flex
      direction="column"
      gap="sm"
      align="stretch"
      style={{ minWidth: 200, maxWidth: 310 }}
    >
      {t('session.launcher.ResourceGroup')}
      <ResourceGroupSelectForCurrentProject
        size="large"
        showSearch
        disabled={currentResourceGroupByProject !== props.value}
        loading={currentResourceGroupByProject !== props.value}
        onChange={(value) => {
          // setValue(value);
          props.dispatchEvent('change', value);
        }}
        popupMatchSelectWidth={false}
      />
    </Flex>
  );
};

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
    <JotaiProvider store={jotaiStore}>
      <ThemeModeProvider>
        <App />
      </ThemeModeProvider>
    </JotaiProvider>
  </React.StrictMode>,
);

customElements.define(
  'backend-ai-react-error-log-list',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <ErrorLogList />
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-batch-session-scheduled-time-setting',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <BatchSessionScheduledTimeSetting
          onChange={(value) => {
            props.dispatchEvent('change', value);
          }}
        />
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-session-reservation-timer',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <ReservationTimeCounter {...props} />
      </DefaultProviders>
    );
  }),
);

const ReservationTimeCounter = (props: ReactWebComponentProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const { parsedValue } = useWebComponentInfo<{
    starts_at: string;
    terminated_at: string;
  }>();

  const baiClient = useSuspendedBackendaiClient();

  if (dayjs(parsedValue.starts_at).isAfter(dayjs())) return null;

  return (
    <Flex>
      <Tag
        color={token.colorTextDisabled}
        style={{
          margin: 0,
          borderTopLeftRadius: token.borderRadiusSM,
          borderBottomLeftRadius: token.borderRadiusSM,
        }}
      >
        {t('session.ElapsedTime')}
      </Tag>
      <Tag
        color={token['green-7']}
        style={{
          borderTopRightRadius: token.borderRadiusSM,
          borderBottomRightRadius: token.borderRadiusSM,
        }}
      >
        <BAIIntervalText
          callback={() => {
            return baiClient.utils.elapsedTime(
              parsedValue.starts_at,
              parsedValue.terminated_at || null,
            );
          }}
          delay={1000}
        />
      </Tag>
    </Flex>
  );
};
