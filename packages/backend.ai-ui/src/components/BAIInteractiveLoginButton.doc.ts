import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIInteractiveLoginButton',
  displayName: 'BAI Interactive Login Button',
  category: 'Action',
  keywords: [
    'login',
    'sign in',
    'sso',
    'session',
    'webserver',
    'interactive',
    'cookie',
  ],
  usage: {
    description:
      'Sign-in entry point for an application that delegates authentication to a Backend.AI webserver. It runs in two phases. On mount it probes `POST <webserverUrl>/server/login-check` with `credentials: \'include\'`; if the browser already holds a webserver session, the probe returns a session id and `onSessionVerified` fires with no click at all. Otherwise the button renders, and clicking it navigates to `<webserverUrl>/interactive-login?name=<appName>&callback=<absolute callback>`, where the user signs in and is sent back to the callback. The component never stores the session id — it hands it to `onSessionVerified` and forgets it; the host is responsible for exchanging that id for its own credentials on its own backend. Every outcome is reported as one of eight reasons (`no_endpoint`, `cors_or_mixed`, `timeout`, `http_error`, `invalid_response`, `no_session`, `no_session_id`, `relay_failed`) through `onFailure`. Unless `showFailureAlert` is false, a real failure is rendered inline as a `BAIAlert type="error"`; `no_session` is not — it is the ordinary "not signed in yet" state of a first-time visitor, so it renders as a neutral hint under the button instead. DEPLOYMENT CONSTRAINT: the webserver sets its session cookie without a `SameSite` attribute (backend.ai `src/ai/backend/web/server.py:864-867` passes no `samesite=`; `src/ai/backend/common/web/session/redis_storage.py:32` defaults it to `None`; `src/ai/backend/common/web/session/__init__.py:274/285/358` forwards that into `response.set_cookie`), and browsers treat an absent `SameSite` as `Lax`. The zero-click probe therefore only succeeds when the consuming application and the webserver are same-site; a genuinely cross-site deployment always lands on `no_session` and uses the redirect. The `session_id` field the probe reads is annotated upstream as a temporary wsproxy interop patch (`server.py:346`), so treat it as provisional.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Point `webserverUrl` at the Backend.AI webserver origin — the host that serves the WebUI — not at the manager API endpoint. A path prefix (`https://host/bai`) is preserved.',
      },
      {
        guidance: true,
        description:
          'Exchange the session id for your own credential inside `onSessionVerified`, on your backend. Rejecting or throwing from that callback is reported as `relay_failed`, which is what you want when the exchange fails.',
      },
      {
        guidance: true,
        description:
          'Pass a `callbackUrl` that your application actually serves. It is resolved to an absolute URL before being handed to the provider page, which reads it with `new URL(callback).origin`.',
      },
      {
        guidance: true,
        description:
          'Serve the consuming application over HTTPS. Over plain HTTP the browser rejects the webserver’s session cookie whenever the webserver marks it `Secure`, which is the default (`cookie_secure`), so the probe can only report `no_session`.',
      },
      {
        guidance: false,
        description:
          'Store the session id in `localStorage`, a cookie, or application state. It is a webserver session identifier, not a token your application owns.',
      },
      {
        guidance: false,
        description:
          'Treat `no_session` as an error condition. It is the ordinary "not signed in yet" outcome, and the button is the remedy.',
      },
    ],
  },
  props: [
    {
      name: 'webserverUrl',
      type: 'string',
      description:
        'Absolute URL of the Backend.AI webserver. A trailing slash is optional and a path prefix is kept when the probe and provider URLs are built. An empty value, or one that is not an absolute `http:` / `https:` URL (`localhost:8090` included), is reported as `no_endpoint`.',
      required: true,
    },
    {
      name: 'appName',
      type: 'string',
      description:
        'Name of the consuming application. Shown on the provider page as the requesting service and interpolated into the failure copy.',
      required: true,
    },
    {
      name: 'callbackUrl',
      type: 'string',
      description:
        'URL the provider page returns to after a successful sign-in. Relative values are resolved against the current document URL; defaults to the current document URL.',
    },
    {
      name: 'timeoutMs',
      type: 'number',
      description:
        'Deadline for the login-check probe, applied with `AbortSignal.timeout`. Exceeding it is reported as `timeout`.',
      default: '10000',
    },
    {
      name: 'onSessionVerified',
      type: '(sessionId: string) => void | Promise<void>',
      description:
        'Called with the webserver session id once the probe finds an authenticated session. Throwing or rejecting is reported as `relay_failed`.',
      required: true,
    },
    {
      name: 'onFailure',
      type: '(reason: BAIInteractiveLoginFailureReason) => void',
      description:
        'Called with the reason whenever a probe or relay attempt fails, including the ordinary `no_session` outcome.',
    },
    {
      name: 'showFailureAlert',
      type: 'boolean',
      description:
        'Render the outcome inline: a real failure as a `BAIAlert type="error"` above the button, the ordinary `no_session` outcome as a neutral hint below it. Set false to present the outcome yourself from `onFailure`.',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Overrides the translated button label. While the probe is in flight the label is the translated "checking session" string regardless.',
    },
  ],
  examples: [
    {
      label: 'Delegating sign-in to a Backend.AI webserver',
      code: `<BAIInteractiveLoginButton
  webserverUrl={config.backendAIWebserverUrl}
  appName="FastTrack"
  callbackUrl={\`\${window.location.origin}/auth/callback\`}
  onSessionVerified={(sessionId) => exchangeForAppToken(sessionId)}
/>`,
    },
    {
      label: 'Presenting failures in the host’s own notification surface',
      code: `<BAIInteractiveLoginButton
  webserverUrl={webserverUrl}
  appName="FastTrack"
  showFailureAlert={false}
  onFailure={(reason) => notify(reason)}
  onSessionVerified={handleSession}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
