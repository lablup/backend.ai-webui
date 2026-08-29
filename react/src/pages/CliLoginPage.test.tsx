/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * `/cli-login` hands the live browser session to a CLI listening on loopback
 * (FR-3763), so the two things worth pinning are the consent gate — Confirm
 * stays disabled until the attestation box is ticked — and that the hand-off
 * goes to the port and state named in the URL, not to anything remembered.
 */
import { CliLoginConsent, CliLoginGate } from './CliLoginPage';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SESSION_ID = 'abcdefghijklmnopqrstuvwxyz012345';
const ENDPOINT = 'http://manager.example.com:8090';

const mocks = vi.hoisted(() => ({ enableCliLogin: true }));

vi.mock('../hooks', () => ({
  useSuspendedBackendaiClient: () => ({
    _loginSessionId: SESSION_ID,
    _config: { endpoint: ENDPOINT, enableCliLogin: mocks.enableCliLogin },
  }),
}));

vi.mock('../hooks/backendai', () => ({
  useCurrentUserInfo: () => [{ email: 'admin@lablup.com' }],
}));

vi.mock('../components/WebUINavigate', () => ({
  default: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
}));

// BUI's locale module needs the real `initReactI18next`; only `t` is stubbed,
// so assertions read as translation keys instead of English copy.
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const renderConsent = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/cli-login${search}`]}>
      <CliLoginConsent />
    </MemoryRouter>,
  );

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mocks.enableCliLogin = true;
  fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ ok: true, message: 'signed in' }), {
        status: 200,
      }),
  );
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CliLoginGate', () => {
  it('behaves like an unknown route when enableCliLogin is off', () => {
    mocks.enableCliLogin = false;

    render(
      <MemoryRouter initialEntries={['/cli-login?port=1234&state=abc']}>
        <CliLoginGate />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent('/error');
    expect(screen.queryByText('cliLogin.Attestation')).not.toBeInTheDocument();
  });

  it('renders the consent page when the flag is on', () => {
    render(
      <MemoryRouter initialEntries={['/cli-login?port=1234&state=abc']}>
        <CliLoginGate />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    expect(screen.getByText('cliLogin.ConsentTitle')).toBeInTheDocument();
  });
});

describe('CliLoginConsent', () => {
  it('keeps Confirm disabled until the attestation box is ticked', async () => {
    renderConsent('?port=1234&state=abc');

    const confirm = screen.getByRole('button', { name: 'cliLogin.Confirm' });
    expect(confirm).toBeDisabled();

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'cliLogin.Attestation' }),
    );

    expect(confirm).toBeEnabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the session to the port and state named in the URL', async () => {
    renderConsent('?port=1234&state=abc');

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'cliLogin.Attestation' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'cliLogin.Confirm' }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://127.0.0.1:1234/callback');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      sessionId: SESSION_ID,
      endpoint: ENDPOINT,
      state: 'abc',
      email: 'admin@lablup.com',
    });
    await screen.findByText('cliLogin.DoneTitle');
  });

  it('offers the paste fallback when no listener answers', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Failed to fetch'));
    renderConsent('?port=1234&state=abc');

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'cliLogin.Attestation' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'cliLogin.Confirm' }),
    );

    await screen.findByText('cliLogin.HandOffUnreachable');
    // The raw id stays hidden behind the reveal button.
    expect(screen.queryByText(SESSION_ID)).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'cliLogin.RevealSessionId' }),
    );
    expect(await screen.findByText(SESSION_ID)).toBeInTheDocument();
  });

  it('falls straight to the paste fallback without a listener port', () => {
    renderConsent('');

    expect(screen.getByText('cliLogin.NoListenerPort')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'cliLogin.Confirm' }),
    ).not.toBeInTheDocument();
  });
});
