import BAIInteractiveLoginButton from './BAIInteractiveLoginButton';
import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Partial mock: `locale/index.ts` consumes `initReactI18next` at import time,
// so only `useTranslation` is overridden (see BAIBulkErrorModal.test.tsx).
vi.mock('react-i18next', async () => {
  const actual =
    await vi.importActual<typeof import('react-i18next')>('react-i18next');
  const translations: Record<string, string> = {
    'comp:BAIInteractiveLoginButton.SignInWithBackendAI':
      'Sign in with Backend.AI',
    'comp:BAIInteractiveLoginButton.CheckingSession': 'Checking session',
    'comp:BAIInteractiveLoginButton.failure.Title': 'Could not sign in',
    'comp:BAIInteractiveLoginButton.failure.NoEndpoint': 'No endpoint',
    'comp:BAIInteractiveLoginButton.failure.InvalidCallback':
      'Bad return address for {{appName}}',
    'comp:BAIInteractiveLoginButton.failure.CorsOrMixed': 'Blocked by browser',
    'comp:BAIInteractiveLoginButton.failure.Timeout': 'Timed out',
    'comp:BAIInteractiveLoginButton.failure.HttpError':
      'Webserver error {{status}}',
    'comp:BAIInteractiveLoginButton.failure.InvalidResponse':
      'Unexpected response',
    'comp:BAIInteractiveLoginButton.failure.NoSessionOverHttp':
      'Not signed in; {{appName}} is served over HTTP',
    'comp:BAIInteractiveLoginButton.failure.NoSessionOverHttps':
      'Not signed in; {{appName}} may be a different site',
    'comp:BAIInteractiveLoginButton.failure.NoSessionId': 'No session ID',
    'comp:BAIInteractiveLoginButton.failure.RelayFailed':
      '{{appName}} could not complete',
  };
  return {
    ...actual,
    useTranslation: () => ({
      // Interpolate, so a locale string that drops a placeholder is caught.
      t: (key: string, options?: Record<string, unknown>) =>
        Object.entries(options ?? {}).reduce(
          (acc, [name, value]) => acc.replaceAll(`{{${name}}}`, String(value)),
          translations[key] ?? key,
        ),
    }),
  };
});

const WEBSERVER_URL = 'https://webserver.example.com';
const CALLBACK_URL = 'https://app.example.com/auth/callback';

const stubLocation = (protocol: 'http:' | 'https:' = 'https:') => {
  const location = {
    href: `${protocol}//app.example.com/workflows`,
    protocol,
  };
  vi.stubGlobal('location', location);
  return location;
};

const stubFetchWith = (body: unknown) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200, json: async () => body })),
  );
};

const renderSubject = (
  props: Partial<React.ComponentProps<typeof BAIInteractiveLoginButton>> = {},
) =>
  render(
    <BAIInteractiveLoginButton
      webserverUrl={WEBSERVER_URL}
      appName="FastTrack"
      callbackUrl={CALLBACK_URL}
      onSessionVerified={() => {}}
      {...props}
    />,
  );

describe('BAIInteractiveLoginButton', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Authenticated probe', () => {
    it('hands the session id to onSessionVerified without a click', async () => {
      stubLocation();
      stubFetchWith({ authenticated: true, session_id: 'sess-1' });
      const onSessionVerified = vi.fn();

      renderSubject({ onSessionVerified });

      await waitFor(() =>
        expect(onSessionVerified).toHaveBeenCalledWith('sess-1'),
      );
    });

    it('removes the button once the session is verified', async () => {
      stubLocation();
      stubFetchWith({ authenticated: true, session_id: 'sess-1' });

      renderSubject();

      await waitFor(() =>
        expect(screen.queryByRole('button')).not.toBeInTheDocument(),
      );
      expect(screen.queryByText('Could not sign in')).not.toBeInTheDocument();
    });

    it('reports relay_failed when onSessionVerified rejects', async () => {
      stubLocation();
      stubFetchWith({ authenticated: true, session_id: 'sess-1' });
      const onFailure = vi.fn();

      renderSubject({
        onSessionVerified: () => Promise.reject(new Error('exchange failed')),
        onFailure,
      });

      await waitFor(() =>
        expect(onFailure).toHaveBeenCalledWith('relay_failed'),
      );
      expect(
        await screen.findByText('FastTrack could not complete'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('No session', () => {
    it('presents the ordinary not-signed-in state as a hint, not an error', async () => {
      stubLocation();
      stubFetchWith({ authenticated: false, data: null });

      renderSubject();

      expect(
        await screen.findByRole('button', { name: /Sign in with Backend.AI/ }),
      ).toBeInTheDocument();
      expect(screen.queryByText('Could not sign in')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows the HTTP-specific hint when the app is served over HTTP', async () => {
      stubLocation('http:');
      stubFetchWith({ authenticated: false, data: null });

      renderSubject();

      expect(
        await screen.findByText('Not signed in; FastTrack is served over HTTP'),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Not signed in; FastTrack may be a different site'),
      ).not.toBeInTheDocument();
    });

    it('shows the cross-site hint when the app is served over HTTPS', async () => {
      stubLocation('https:');
      stubFetchWith({ authenticated: false, data: null });

      renderSubject();

      expect(
        await screen.findByText(
          'Not signed in; FastTrack may be a different site',
        ),
      ).toBeInTheDocument();
    });

    it('reports the reason through onFailure', async () => {
      stubLocation();
      stubFetchWith({ authenticated: false, data: null });
      const onFailure = vi.fn();

      renderSubject({ onFailure });

      await waitFor(() => expect(onFailure).toHaveBeenCalledWith('no_session'));
    });

    it('navigates to the interactive-login URL when the button is clicked', async () => {
      const location = stubLocation();
      stubFetchWith({ authenticated: false, data: null });
      const user = userEvent.setup();

      renderSubject();

      const button = await screen.findByRole('button', {
        name: /Sign in with Backend.AI/,
      });
      await user.click(button);

      await waitFor(() =>
        expect(location.href).toBe(
          `${WEBSERVER_URL}/interactive-login?name=FastTrack&callback=${encodeURIComponent(CALLBACK_URL)}`,
        ),
      );
    });

    it('refuses to navigate to a callback that is not an http(s) URL', async () => {
      const location = stubLocation();
      const documentUrl = location.href;
      stubFetchWith({ authenticated: false, data: null });
      const onFailure = vi.fn();
      const user = userEvent.setup();

      renderSubject({ callbackUrl: 'javascript:alert(1)', onFailure });

      const button = await screen.findByRole('button', {
        name: /Sign in with Backend.AI/,
      });
      await user.click(button);

      expect(
        await screen.findByText('Bad return address for FastTrack'),
      ).toBeInTheDocument();
      expect(onFailure).toHaveBeenCalledWith('invalid_callback');
      expect(location.href).toBe(documentUrl);
    });
  });

  describe('Unmount', () => {
    it('drops a probe that settles after unmount', async () => {
      stubLocation();
      let settleFetch!: (value: unknown) => void;
      vi.stubGlobal(
        'fetch',
        vi.fn(
          () =>
            new Promise((resolve) => {
              settleFetch = resolve;
            }),
        ),
      );
      const onSessionVerified = vi.fn();
      const onFailure = vi.fn();

      const { unmount } = renderSubject({ onSessionVerified, onFailure });
      await waitFor(() => expect(fetch).toHaveBeenCalled());
      unmount();

      settleFetch({
        ok: true,
        status: 200,
        json: async () => ({ authenticated: true, session_id: 'sess-late' }),
      });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(onSessionVerified).not.toHaveBeenCalled();
      expect(onFailure).not.toHaveBeenCalled();
    });

    it('drops a relay that fails after unmount', async () => {
      stubLocation();
      stubFetchWith({ authenticated: true, session_id: 'sess-1' });
      let failRelay!: (error: Error) => void;
      const onSessionVerified = vi.fn(
        () =>
          new Promise<void>((_resolve, reject) => {
            failRelay = reject;
          }),
      );
      const onFailure = vi.fn();

      const { unmount } = renderSubject({ onSessionVerified, onFailure });
      await waitFor(() =>
        expect(onSessionVerified).toHaveBeenCalledWith('sess-1'),
      );
      unmount();

      failRelay(new Error('exchange failed'));
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(onFailure).not.toHaveBeenCalled();
    });
  });

  describe('Probe failures', () => {
    it('renders the copy for an HTTP error from the webserver', async () => {
      stubLocation();
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({ ok: false, status: 502, json: async () => ({}) })),
      );
      const onFailure = vi.fn();

      renderSubject({ onFailure });

      expect(
        await screen.findByText('Webserver error 502'),
      ).toBeInTheDocument();
      expect(onFailure).toHaveBeenCalledWith('http_error');
    });

    it('renders the copy for a probe that outruns its deadline', async () => {
      stubLocation();
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new DOMException('timed out', 'TimeoutError');
        }),
      );
      const onFailure = vi.fn();

      renderSubject({ onFailure });

      expect(await screen.findByText('Timed out')).toBeInTheDocument();
      expect(onFailure).toHaveBeenCalledWith('timeout');
    });

    it('renders the copy for a body that is not a login-check answer', async () => {
      stubLocation();
      stubFetchWith({ hello: 'world' });
      const onFailure = vi.fn();

      renderSubject({ onFailure });

      expect(
        await screen.findByText('Unexpected response'),
      ).toBeInTheDocument();
      expect(onFailure).toHaveBeenCalledWith('invalid_response');
    });

    it('renders the copy for an authenticated answer with no session id', async () => {
      stubLocation();
      stubFetchWith({ authenticated: true, session_id: '' });
      const onFailure = vi.fn();

      renderSubject({ onFailure });

      expect(await screen.findByText('No session ID')).toBeInTheDocument();
      expect(onFailure).toHaveBeenCalledWith('no_session_id');
    });

    it('renders the copy for a browser-blocked request', async () => {
      stubLocation();
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new TypeError('Failed to fetch');
        }),
      );

      renderSubject();

      expect(await screen.findByText('Blocked by browser')).toBeInTheDocument();
    });

    it('reports no_endpoint without probing when the webserver URL is empty', async () => {
      stubLocation();
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
      const onFailure = vi.fn();

      renderSubject({ webserverUrl: '', onFailure });

      await waitFor(() =>
        expect(onFailure).toHaveBeenCalledWith('no_endpoint'),
      );
      expect(fetchMock).not.toHaveBeenCalled();
      expect(await screen.findByText('No endpoint')).toBeInTheDocument();
    });
  });

  describe('showFailureAlert', () => {
    it('suppresses the no-session hint while still reporting the outcome', async () => {
      stubLocation();
      stubFetchWith({ authenticated: false, data: null });
      const onFailure = vi.fn();

      renderSubject({ showFailureAlert: false, onFailure });

      await waitFor(() => expect(onFailure).toHaveBeenCalledWith('no_session'));
      expect(
        screen.queryByText('Not signed in; FastTrack may be a different site'),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('suppresses the inline error alert while still reporting the failure', async () => {
      stubLocation();
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({ ok: false, status: 502, json: async () => ({}) })),
      );
      const onFailure = vi.fn();

      renderSubject({ showFailureAlert: false, onFailure });

      await waitFor(() => expect(onFailure).toHaveBeenCalledWith('http_error'));
      expect(screen.queryByText('Could not sign in')).not.toBeInTheDocument();
      expect(screen.queryByText('Webserver error 502')).not.toBeInTheDocument();
    });
  });
});
