import type { BAIInteractiveLoginFailureReason } from '../hooks/useBAIInteractiveLogin';
import BAIFlex from './BAIFlex';
import BAIInteractiveLoginButton, {
  type BAIInteractiveLoginButtonProps,
} from './BAIInteractiveLoginButton';
import BAIText from './BAIText';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState, type ReactNode } from 'react';

type Outcome = 'authenticated' | BAIInteractiveLoginFailureReason;

type StoryProps = BAIInteractiveLoginButtonProps & { outcome: Outcome };

const WEBSERVER_URL = 'https://webserver.example.com';

/** Captured at import time, before any story installs its stub. */
const originalFetch = globalThis.fetch;

const installFetchMock = (outcome: Outcome) => {
  globalThis.fetch = (async () => {
    switch (outcome) {
      case 'cors_or_mixed':
        throw new TypeError('Failed to fetch');
      case 'timeout':
        throw new DOMException('timed out', 'TimeoutError');
      case 'http_error':
        return { ok: false, status: 502, json: async () => ({}) };
      case 'invalid_response':
        return {
          ok: true,
          status: 200,
          json: async () => ({ hello: 'world' }),
        };
      case 'no_session_id':
        return {
          ok: true,
          status: 200,
          json: async () => ({ authenticated: true, session_id: '' }),
        };
      case 'no_session':
        return {
          ok: true,
          status: 200,
          json: async () => ({ authenticated: false, data: null }),
        };
      default:
        return {
          ok: true,
          status: 200,
          json: async () => ({
            authenticated: true,
            data: { access_key: 'AKIA', role: 'user', status: 'active' },
            session_id: 'sess-storybook',
          }),
        };
    }
  }) as unknown as typeof fetch;
};

/** Keeps the stub from outliving the story that installed it. */
const RestoreFetchOnUnmount = ({ children }: { children: ReactNode }) => {
  useEffect(
    () => () => {
      globalThis.fetch = originalFetch;
    },
    [],
  );
  return <>{children}</>;
};

const InteractiveLoginStory = ({ outcome, ...props }: StoryProps) => {
  const [verifiedSessionId, setVerifiedSessionId] = useState<string | null>(
    null,
  );
  const [failureReason, setFailureReason] =
    useState<BAIInteractiveLoginFailureReason | null>(null);

  return (
    <BAIFlex direction="column" gap="sm" align="stretch">
      <BAIInteractiveLoginButton
        key={outcome}
        {...props}
        webserverUrl={outcome === 'no_endpoint' ? '' : WEBSERVER_URL}
        onSessionVerified={async (sessionId) => {
          if (outcome === 'relay_failed') {
            throw new Error('token exchange failed');
          }
          // The host's token exchange is a round-trip of its own; the button
          // stays in its loading state until it settles.
          await new Promise((resolve) => setTimeout(resolve, 800));
          setVerifiedSessionId(sessionId);
        }}
        onFailure={setFailureReason}
      />
      {verifiedSessionId ? (
        <BAIText type="success">Session verified: {verifiedSessionId}</BAIText>
      ) : null}
      {failureReason ? (
        <BAIText type="secondary" size="sm">
          onFailure: {failureReason}
        </BAIText>
      ) : null}
    </BAIFlex>
  );
};

const meta: Meta<StoryProps> = {
  title: 'Button/BAIInteractiveLoginButton',
  component: BAIInteractiveLoginButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIInteractiveLoginButton** delegates sign-in to a Backend.AI webserver.

## Mechanism
1. On mount it probes \`POST <webserverUrl>/server/login-check\` with \`credentials: 'include'\`.
2. If the browser already holds a webserver session, \`onSessionVerified\` fires with the session id and no click is needed.
3. Otherwise the button renders and navigates to \`<webserverUrl>/interactive-login?name=…&callback=…\`.

The host exchanges the session id for its own credential inside \`onSessionVerified\`; the component never stores it.

## Hard requirement: same-site deployment
The consuming app and the webserver must be same-site. The webserver's session cookie carries no \`SameSite\` attribute, which browsers treat as \`Lax\`, so a cross-site probe never carries it — and the redirect does not recover from that: the provider page returns to the callback with nothing attached, and the probe that follows is refused the cookie again. Cross-site, the component loops on \`no_session\` and can never sign in.

## Outcomes
\`no_session\` is the ordinary "not signed in yet" state, so it renders as a neutral hint under the button — never as an error. Only a genuine failure (\`no_endpoint\`, \`invalid_callback\`, \`cors_or_mixed\`, \`timeout\`, \`http_error\`, \`invalid_response\`, \`no_session_id\`, \`relay_failed\`) gets the error alert. \`invalid_callback\` is a redirect-time outcome (a \`callbackUrl\` that is not an http(s) URL), so it is not one of the mocked probe outcomes below.

The stories below mock \`fetch\` for the lifetime of the story and restore it on unmount; nothing contacts a live webserver. Use the **outcome** control to see every failure reason. The line under the component is story-only instrumentation showing what \`onSessionVerified\` / \`onFailure\` received.
        `,
      },
    },
  },
  argTypes: {
    outcome: {
      control: { type: 'select' },
      options: [
        'authenticated',
        'no_endpoint',
        'cors_or_mixed',
        'timeout',
        'http_error',
        'invalid_response',
        'no_session',
        'no_session_id',
        'relay_failed',
      ],
      description: 'Story-only control: what the mocked probe should produce.',
    },
    webserverUrl: { control: false },
    onSessionVerified: { control: false },
    onFailure: { control: false },
  },
  args: {
    outcome: 'no_session',
    appName: 'FastTrack',
    callbackUrl: 'https://app.example.com/auth/callback',
    showFailureAlert: true,
    onSessionVerified: () => {},
  },
  decorators: [
    (Story, context) => {
      installFetchMock((context.args as StoryProps).outcome);
      return (
        <RestoreFetchOnUnmount>
          <Story />
        </RestoreFetchOnUnmount>
      );
    },
  ],
  render: (args) => <InteractiveLoginStory {...args} />,
};

export default meta;
type Story = StoryObj<StoryProps>;

export const Default: Story = {
  name: 'No session yet',
  args: { outcome: 'no_session' },
  parameters: {
    docs: {
      description: {
        story:
          'The first-time visitor: the probe finds no webserver session, so the button appears with a neutral hint underneath. This is not an error state and is deliberately not rendered as one.',
      },
    },
  },
};

export const Authenticated: Story = {
  args: { outcome: 'authenticated' },
  parameters: {
    docs: {
      description: {
        story:
          'The probe finds a session, so `onSessionVerified` fires with no click. This story simulates a slow token exchange: the button stays in its loading state until the host settles, then disappears and the verified session id is shown.',
      },
    },
  },
};

export const FailureReason: Story = {
  name: 'Failure reasons',
  args: { outcome: 'timeout' },
};

export const WithoutFailureAlert: Story = {
  args: { outcome: 'cors_or_mixed', showFailureAlert: false },
};
