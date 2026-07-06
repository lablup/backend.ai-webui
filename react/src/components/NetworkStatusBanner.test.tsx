/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for NetworkStatusBanner (FR-3237).
 *
 * The point of the PR is that `navigator.onLine` is only a heuristic and
 * frequently a false positive (VPNs, captive portals, virtualized networks).
 * So the offline banner must appear ONLY when the browser reports offline
 * AND a `/health` probe confirms the endpoint is actually unreachable.
 *
 * These tests exercise that gating contract at the component level — the
 * behavior a pure `isEndpointUnreachable` helper test could never cover:
 *   - online              → no banner, no probe
 *   - offline + reachable → no banner (the false-positive suppression)
 *   - offline + unreachable (non-OK / thrown) → banner
 *   - reconnect           → banner clears, no stale flash
 */
import NetworkStatusBanner from './NetworkStatusBanner';
import { render, screen, waitFor } from '@testing-library/react';
import { useNetwork } from 'ahooks';
import { Provider as JotaiProvider, createStore } from 'jotai';
import {
  type MockedFunction,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// The banner only reads `_config.endpoint` off the client.
vi.mock('../hooks', () => ({
  useSuspendedBackendaiClient: () => ({
    _config: { endpoint: 'https://api.test' },
  }),
}));

// Keep the rest of ahooks (useDebounce) real; only `useNetwork` is driven.
vi.mock('ahooks', async () => {
  const actual = await vi.importActual<typeof import('ahooks')>('ahooks');
  return { ...actual, useNetwork: vi.fn() };
});

// Deterministic translations: assert on the raw key.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockedUseNetwork = useNetwork as unknown as MockedFunction<
  () => { online: boolean }
>;

const setBrowserOnline = (online: boolean) => {
  mockedUseNetwork.mockReturnValue({ online });
};

const mockProbe = (result: Response | Error) => {
  if (result instanceof Error) {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(result);
  } else {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(result);
  }
};

const renderBanner = () =>
  render(
    <JotaiProvider store={createStore()}>
      <NetworkStatusBanner />
    </JotaiProvider>,
  );

const OFFLINE_TEXT = 'webui.YouAreOffline';

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('NetworkStatusBanner offline gating', () => {
  it('shows nothing and never probes while the browser is online', async () => {
    setBrowserOnline(true);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderBanner();

    expect(screen.queryByText(OFFLINE_TEXT)).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows the offline banner when the browser is offline AND the probe is non-OK', async () => {
    setBrowserOnline(false);
    mockProbe(new Response(null, { status: 503 }));
    renderBanner();

    await waitFor(() => {
      expect(screen.getByText(OFFLINE_TEXT)).toBeInTheDocument();
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.test/health',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('shows the offline banner when the probe throws (network / CORS / timeout)', async () => {
    setBrowserOnline(false);
    mockProbe(new TypeError('Failed to fetch'));
    renderBanner();

    await waitFor(() => {
      expect(screen.getByText(OFFLINE_TEXT)).toBeInTheDocument();
    });
  });

  it('suppresses the banner when the browser is offline but the endpoint is actually reachable (false positive)', async () => {
    setBrowserOnline(false);
    mockProbe(new Response(null, { status: 200 }));
    renderBanner();

    // Give the probe time to resolve; the banner must stay hidden.
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled();
    });
    expect(screen.queryByText(OFFLINE_TEXT)).not.toBeInTheDocument();
  });

  it('clears the banner and resets probe state when connectivity returns', async () => {
    setBrowserOnline(false);
    mockProbe(new Response(null, { status: 503 }));
    const { rerender } = renderBanner();

    await waitFor(() => {
      expect(screen.getByText(OFFLINE_TEXT)).toBeInTheDocument();
    });

    setBrowserOnline(true);
    rerender(
      <JotaiProvider store={createStore()}>
        <NetworkStatusBanner />
      </JotaiProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByText(OFFLINE_TEXT)).not.toBeInTheDocument();
    });
  });
});
