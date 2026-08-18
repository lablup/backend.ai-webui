/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Top-layer contract: the header button opens the palette, rows render as
 * title + breadcrumb (or "found in" for a body match), an empty result set
 * shows the no-results copy, and selecting a row records a recent, navigates
 * to the hit's target, and closes. Opening runs in a transition, so a
 * suspending subtree holds the previous UI instead of flashing an empty frame.
 */
import GlobalSearchPaletteButton from './GlobalSearchPaletteButton';
import type { SearchHit } from './types';
import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Lets a test suspend the palette subtree the way `useSuspendedBackendaiClient`
// does on a cold client, so the transition contract is observable.
const suspension = vi.hoisted(() => {
  let gate: { promise: Promise<void>; resolve: () => void } | null = null;
  return {
    hold: () => {
      let resolve!: () => void;
      const promise = new Promise<void>((r) => (resolve = r));
      gate = { promise, resolve };
    },
    release: () => {
      const held = gate;
      gate = null;
      held?.resolve();
    },
    throwIfHeld: () => {
      if (gate) throw gate.promise;
    },
  };
});

const navigate = vi.fn();
const pushRecent = vi.fn();

const makeHit = (hit: Partial<SearchHit> & Pick<SearchHit, 'id'>): SearchHit =>
  ({
    kind: 'page',
    label: hit.id,
    menuKey: null,
    scope: null,
    labelKey: '',
    breadcrumbKeys: [],
    group: 'Workload',
    target: { path: `/${hit.id}` },
    keywords: [],
    bodyKeys: [],
    auxiliaryData: { group: hit.auxiliaryData?.group ?? 'Workload' },
    ...hit,
  }) as SearchHit;

const sessionsHit = makeHit({
  id: 'page:/session',
  label: 'Sessions',
  target: { path: '/project/p/session' },
});
const settingHit = makeHit({
  id: 'setting:/usersettings#userSettings.AutoLogout',
  kind: 'settingItem',
  label: 'Auto logout',
  breadcrumbKeys: ['webui.menu.Settings', 'userSettings.Preferences'],
  target: {
    path: '/usersettings',
    search: { tab: 'general', setting: 'userSettings.AutoLogout' },
  },
  auxiliaryData: { group: 'System' },
});
const bodyHit = makeHit({
  id: 'page:/summary#found=summary.Announcement',
  label: 'Summary',
  matchedIn: { key: 'summary.Announcement', kind: 'body' },
  target: { path: '/summary' },
});

const hits = [sessionsHit, settingHit, bodyHit];

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: Record<string, unknown>) =>
        key === 'webui.search.FoundIn' ? `Found in ${options?.text}` : key,
    }),
  };
});

vi.mock('../../hooks', () => ({
  useWebUINavigate: () => navigate,
}));

vi.mock('../../hooks/useThemeMode', () => ({
  useThemeMode: () => ({ isDarkMode: false }),
}));

vi.mock('./useRecentSearchHits', () => ({
  useRecentSearchHits: () => [[], { push: pushRecent, clear: vi.fn() }],
}));

vi.mock('./useGlobalSearchSource', () => ({
  toTranslator: () => (key: string) => key,
  useGlobalSearchSource: () => {
    suspension.throwIfHeld();
    return {
      search: (query: string) =>
        hits.filter((hit) =>
          hit.label.toLowerCase().includes(query.toLowerCase()),
        ),
      bootstrap: () => hits,
      getHit: (id: string) => hits.find((hit) => hit.id === id),
    };
  },
}));

const openPalette = async () => {
  const user = userEvent.setup();
  render(<GlobalSearchPaletteButton />);
  await user.click(screen.getByRole('button', { name: 'webui.menu.Search' }));
  await waitFor(() => expect(screen.getByText('Sessions')).toBeInTheDocument());
  return user;
};

describe('GlobalSearchPalette', () => {
  beforeEach(() => {
    navigate.mockClear();
    pushRecent.mockClear();
    suspension.release();
  });

  it('holds the header while the palette subtree suspends, then mounts it whole', async () => {
    const user = userEvent.setup();
    // Mirrors MainLayout: the header's only boundary is an ancestor one, so an
    // urgent open would swap the whole header for this fallback.
    render(
      <Suspense fallback={<span>header-blanked</span>}>
        <GlobalSearchPaletteButton />
      </Suspense>,
    );
    const trigger = screen.getByRole('button', { name: 'webui.menu.Search' });

    suspension.hold();
    await user.click(trigger);

    // The transition holds the commit, so neither an empty dialog nor a
    // blanked header is ever painted.
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByText('header-blanked')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Sessions')).not.toBeInTheDocument();

    await act(async () => {
      suspension.release();
    });

    await waitFor(() =>
      expect(screen.getByText('Sessions')).toBeInTheDocument(),
    );
  });

  it('lists the bootstrap rows grouped by the hit group', async () => {
    await openPalette();

    expect(screen.getByText('Auto logout')).toBeInTheDocument();
    expect(screen.getByText('Workload')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('renders the scope breadcrumb and the "found in" line', async () => {
    await openPalette();

    expect(
      screen.getByText('webui.menu.Settings › userSettings.Preferences'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Found in summary.Announcement'),
    ).toBeInTheDocument();
  });

  it('keeps the row icon in a slot of its own, beside the text column', async () => {
    await openPalette();

    const textColumn = screen.getByText('Sessions')
      .parentElement as HTMLElement;
    const iconSlot = textColumn.previousElementSibling as HTMLElement;
    expect(iconSlot).toBeTruthy();
    expect(iconSlot.querySelector('svg')).toBeTruthy();
  });

  it('shows the no-results copy for a query that matches nothing', async () => {
    const user = await openPalette();

    await user.keyboard('zzzznope');

    await waitFor(() =>
      expect(screen.getByText('webui.search.NoResults')).toBeInTheDocument(),
    );
  });

  it('records a recent, navigates to the hit target, and closes', async () => {
    const user = await openPalette();

    await user.click(screen.getByText('Auto logout'));

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        pathname: '/usersettings',
        search: 'tab=general&setting=userSettings.AutoLogout',
      }),
    );
    expect(pushRecent).toHaveBeenCalledWith(settingHit);
    await waitFor(() =>
      expect(screen.queryByText('Auto logout')).not.toBeInTheDocument(),
    );
  });
});
