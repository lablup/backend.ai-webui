import type { BAIInteractiveLoginFailureReason } from '../hooks/useBAIInteractiveLogin';
import BAIFlex from './BAIFlex';
import BAIInteractiveLoginButton, {
  type BAIInteractiveLoginButtonProps,
} from './BAIInteractiveLoginButton';
import BAIText from './BAIText';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

type Outcome = 'authenticated' | BAIInteractiveLoginFailureReason;

type StoryProps = BAIInteractiveLoginButtonProps & { outcome: Outcome };

/**
 * Every story talks to `https://<outcome>.webserver.example.com`; one shared
 * interceptor (installed by `beforeEach` below, only while a story from this
 * file is mounted) answers those hosts and delegates everything else to the
 * real `fetch`. Several stories can therefore be mounted at once (the autodocs
 * page) without overwriting each other's stub.
 */
const MOCK_WEBSERVER_SUFFIX = '.webserver.example.com';

const webserverUrlFor = (outcome: Outcome): string =>
  outcome === 'no_endpoint' ? '' : `https://${outcome}${MOCK_WEBSERVER_SUFFIX}`;

const outcomeFromRequest = (input: RequestInfo | URL): Outcome | null => {
  const href =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  let host: string;
  try {
    host = new URL(href).hostname;
  } catch {
    return null;
  }
  return host.endsWith(MOCK_WEBSERVER_SUFFIX)
    ? (host.slice(0, -MOCK_WEBSERVER_SUFFIX.length) as Outcome)
    : null;
};

const respondFor = (outcome: Outcome): Response => {
  switch (outcome) {
    case 'cors_or_mixed':
      throw new TypeError('Failed to fetch');
    case 'timeout':
      throw new DOMException('timed out', 'TimeoutError');
    case 'http_error':
      return Response.json({}, { status: 502 });
    case 'invalid_response':
      return Response.json({ hello: 'world' });
    case 'no_session_id':
      return Response.json({ authenticated: true, session_id: '' });
    case 'no_session':
      return Response.json({ authenticated: false, data: null });
    default:
      return Response.json({
        authenticated: true,
        data: { access_key: 'AKIA', role: 'user', status: 'active' },
        session_id: 'sess-storybook',
      });
  }
};

/**
 * The interceptor lives only while a story from this file is mounted:
 * `beforeEach` installs it (ref-counted, so stories mounted together on the
 * autodocs page share one) and its cleanup restores the real `fetch` when the
 * last one unmounts. The real `fetch` is kept on the interceptor itself so a
 * hot reload finds and reuses it instead of wrapping it again.
 */
const REAL_FETCH = Symbol.for('backend.ai-ui/BAIInteractiveLoginButton/fetch');
type InterceptingFetch = typeof fetch & { [REAL_FETCH]?: typeof fetch };

let mountedStories = 0;

const installFetchInterceptor = (): (() => void) => {
  mountedStories += 1;
  if (mountedStories === 1) {
    const current = globalThis.fetch as InterceptingFetch;
    const realFetch = current[REAL_FETCH] ?? current;
    const intercepting: InterceptingFetch = async (input, init) => {
      const outcome = outcomeFromRequest(input);
      return outcome ? respondFor(outcome) : realFetch(input, init);
    };
    intercepting[REAL_FETCH] = realFetch;
    globalThis.fetch = intercepting;
  }
  return () => {
    mountedStories -= 1;
    if (mountedStories === 0) {
      const current = globalThis.fetch as InterceptingFetch;
      globalThis.fetch = current[REAL_FETCH] ?? current;
    }
  };
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
        webserverUrl={webserverUrlFor(outcome)}
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
  beforeEach: () => installFetchInterceptor(),
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

The stories below route \`https://<outcome>.webserver.example.com\` through a \`fetch\` interceptor that is installed while a story from this file is mounted and delegates every other host to the real \`fetch\`; nothing contacts a live webserver. Use the **outcome** control to see every failure reason. The line under the component is story-only instrumentation showing what \`onSessionVerified\` / \`onFailure\` received.
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
