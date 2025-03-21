import App from './App';
import BAIIntervalView from './components/BAIIntervalView';
import { jotaiStore, useWebComponentInfo } from './components/DefaultProviders';
import Flex from './components/Flex';
import ResourceGroupSelectForCurrentProject from './components/ResourceGroupSelectForCurrentProject';
import SourceCodeViewer from './components/SourceCodeViewer';
import { loadCustomThemeConfig } from './helper/customThemeConfig';
import reactToWebComponent, {
  ReactWebComponentProps,
} from './helper/react-to-webcomponent';
import { useSuspendedBackendaiClient } from './hooks';
import { useCurrentResourceGroupValue } from './hooks/useCurrentProject';
import { ThemeModeProvider } from './hooks/useThemeMode';
import '@ant-design/v5-patch-for-react-19';
import { Tag, theme } from 'antd';
import dayjs from 'dayjs';
import { Provider as JotaiProvider } from 'jotai';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { useTranslation } from 'react-i18next';

// To maintain compatibility with various manager versions, the WebUI client uses directives to manipulate GraphQL queries.
// This can cause Relay to show "Warning: RelayResponseNormalizer: Payload did not contain a value for field" in the browser console during development.
// It's advisable to ignore these frequent logs in development mode.
if (process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  console.error = function (message, ...args) {
    if (
      typeof message === 'string' &&
      message.includes(
        'Warning: RelayResponseNormalizer: Payload did not contain a value for field',
      )
    ) {
      return;
    }
    originalConsoleError.apply(console, [message, ...args]);
  };
}

// Load custom theme config once in react/index.tsx
loadCustomThemeConfig();

const DefaultProviders = React.lazy(
  () => import('./components/DefaultProviders'),
);
const ResetPasswordRequired = React.lazy(
  () => import('./components/ResetPasswordRequired'),
);
const CopyableCodeText = React.lazy(
  () => import('./components/CopyableCodeText'),
);
const SignoutModal = React.lazy(() => import('./components/SignoutModal'));

const BatchSessionScheduledTimeSetting = React.lazy(
  () => import('./components/BatchSessionScheduledTimeSetting'),
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
        loading={
          !_.isEmpty(currentResourceGroupByProject) &&
          currentResourceGroupByProject !== props.value
        }
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
        <BAIIntervalView
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
