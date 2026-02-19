import App from './App';
import { jotaiStore, useWebComponentInfo } from './components/DefaultProviders';
import SourceCodeView from './components/SourceCodeView';
import { loadCustomThemeConfig } from './helper/customThemeConfig';
import reactToWebComponent, {
  ReactWebComponentProps,
} from './helper/react-to-webcomponent';
import { ThemeModeProvider } from './hooks/useThemeMode';
import { ConfigProvider } from 'antd';
import { Provider as JotaiProvider } from 'jotai';
import React from 'react';
import ReactDOM from 'react-dom/client';

// To maintain compatibility with various manager versions, the WebUI client uses directives to manipulate GraphQL queries.
// This can cause Relay to show "Warning: RelayResponseNormalizer: Payload did not contain a value for field" in the browser console during development.
// It's advisable to ignore these frequent logs in development mode.
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  const originalConsoleError = console.error;
  // eslint-disable-next-line no-console
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

const TOTPActivateModalWithToken = React.lazy(
  () => import('./components/TOTPActivateModalWithToken'),
);

const SignupModal = React.lazy(() => import('./components/SignupModal'));
const SplashModal = React.lazy(() => import('./components/SplashModal'));
const EmailVerificationViewLazy = React.lazy(
  () => import('./components/EmailVerificationView'),
);

customElements.define(
  'backend-ai-react-signup-modal',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <SignupModalInWebComponent {...props} />
      </DefaultProviders>
    );
  }),
);

customElements.define(
  'backend-ai-react-totp-registration-modal-before-login',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <TOTPActivateModalWithToken />
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
        {/* FIXME: When rendered inside a Shadow DOM, Tooltip may affect layout flow.
                   Force portal to shadowRoot to prevent layout shift.*/}
        {/* @ts-ignore */}
        <ConfigProvider getPopupContainer={() => props.shadowRoot}>
          <CopyableCodeText text={props.value || ''} />
        </ConfigProvider>
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

const SignupModalInWebComponent: React.FC<ReactWebComponentProps> = (props) => {
  const {
    parsedValue: {
      open = false,
      endpoint = '',
      allowSignupWithoutConfirmation = false,
      preloadedToken,
    } = {},
  } = useWebComponentInfo<{
    open: boolean;
    endpoint: string;
    allowSignupWithoutConfirmation: boolean;
    preloadedToken?: string;
  }>();

  return (
    <SignupModal
      open={open}
      endpoint={endpoint}
      allowSignupWithoutConfirmation={allowSignupWithoutConfirmation}
      preloadedToken={preloadedToken}
      onRequestClose={() => {
        props.dispatchEvent('close', null);
      }}
    />
  );
};

const SourceCodeViewerInWebComponent: React.FC<ReactWebComponentProps> = () => {
  const {
    parsedValue: { children, language } = {
      children: '',
      language: '',
    },
  } = useWebComponentInfo<{
    children: string;
    language: string;
  }>();
  return <SourceCodeView language={language}>{children}</SourceCodeView>;
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

customElements.define(
  'backend-ai-react-splash-modal',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <SplashModalInWebComponent {...props} />
      </DefaultProviders>
    );
  }),
);

const SplashModalInWebComponent: React.FC<ReactWebComponentProps> = (props) => {
  const { parsedValue: { open = false } = {} } = useWebComponentInfo<{
    open: boolean;
  }>();

  return (
    <SplashModal
      open={open}
      onRequestClose={() => {
        props.dispatchEvent('close', null);
      }}
    />
  );
};

const EmailVerificationViewInWebComponent: React.FC = () => {
  const { parsedValue: { apiEndpoint = '', active = false } = {} } =
    useWebComponentInfo<{
      apiEndpoint: string;
      active: boolean;
    }>();

  return (
    <React.Suspense fallback={null}>
      <EmailVerificationViewLazy apiEndpoint={apiEndpoint} active={active} />
    </React.Suspense>
  );
};

customElements.define(
  'backend-ai-react-email-verification-view',
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <EmailVerificationViewInWebComponent />
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
