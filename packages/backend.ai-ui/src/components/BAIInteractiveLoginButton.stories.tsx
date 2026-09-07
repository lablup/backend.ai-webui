import type { BAIInteractiveLoginFailureReason } from '../hooks/useBAIInteractiveLogin';
import BAIInteractiveLoginButton, {
  type BAIInteractiveLoginButtonProps,
} from './BAIInteractiveLoginButton';
import type { Meta, StoryObj } from '@storybook/react-vite';

type Outcome = 'authenticated' | BAIInteractiveLoginFailureReason;

type StoryProps = BAIInteractiveLoginButtonProps & { outcome: Outcome };

const WEBSERVER_URL = 'https://webserver.example.com';

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

## Deployment constraint
The webserver's session cookie carries no \`SameSite\` attribute, which browsers treat as \`Lax\`. The zero-click probe therefore only succeeds when the consuming app and the webserver are same-site; a cross-site deployment always lands on \`no_session\` and uses the redirect.

The stories below mock \`fetch\`; nothing contacts a live webserver. Use the **outcome** control to see every failure reason.
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
      return <Story />;
    },
  ],
  render: ({ outcome, ...props }) => (
    <BAIInteractiveLoginButton
      key={outcome}
      {...props}
      webserverUrl={outcome === 'no_endpoint' ? '' : WEBSERVER_URL}
      onSessionVerified={
        outcome === 'relay_failed'
          ? () => Promise.reject(new Error('token exchange failed'))
          : props.onSessionVerified
      }
    />
  ),
};

export default meta;
type Story = StoryObj<StoryProps>;

export const Default: Story = {
  name: 'No session yet',
  args: { outcome: 'no_session' },
};

export const Authenticated: Story = {
  args: { outcome: 'authenticated' },
};

export const FailureReason: Story = {
  name: 'Failure reasons',
  args: { outcome: 'timeout' },
};

export const WithoutFailureAlert: Story = {
  args: { outcome: 'cors_or_mixed', showFailureAlert: false },
};
