/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Top-layer contract: the header button opens the palette, rows render as
 * title + breadcrumb (or "found in" for a body match), an empty result set
 * shows the no-results copy, and selecting a row records a recent, navigates
 * to the hit's target, and closes. Opening is urgent, and the palette's own
 * Suspense boundary absorbs the suspend instead of blanking the header.
 */
import GlobalSearchPaletteButton from './GlobalSearchPaletteButton';
import type { SearchHit } from './types';
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Lets a test suspend the palette subtree the way `useSuspendedBackendaiClient`
// does on a cold client, so the boundary's containment is observable.
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

// Holds `bootstrap()` unresolved — the state every open starts in, since Astryx
// commits bootstrap in a transition after the dialog has already painted.
const bootstrapGate = vi.hoisted(() => {
  let pending: {
    promise: Promise<unknown>;
    resolve: (items: unknown) => void;
  } | null = null;
  return {
    hold: () => {
      let resolve!: (items: unknown) => void;
      const promise = new Promise<unknown>((r) => (resolve = r));
      pending = { promise, resolve };
    },
    result: (items: unknown) => pending?.promise ?? items,
    release: (items: unknown) => {
      const held = pending;
      pending = null;
      held?.resolve(items);
    },
  };
});

const navigate = vi.fn();
const pushRecent = vi.fn();
const runAction = vi.fn();
const setThemeMode = vi.fn();
const openNotifications = vi.fn();
const toggleSider = vi.fn();
const openHelp = vi.fn();

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

const actionHit = makeHit({
  id: 'action:toggle-sidebar',
  kind: 'action',
  label: 'Toggle sidebar',
  target: undefined,
  run: runAction,
  group: 'Panels & help',
  auxiliaryData: { group: 'Panels & help' },
});

const hits = [sessionsHit, settingHit, bodyHit, actionHit];

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: Record<string, unknown>) =>
        key === 'webui.search.FoundIn' ? `Found in ${options?.text}` : key,
      // The trigger hands this to `warmGlobalSearch` from its idle preload.
      i18n: {
        language: 'en',
        resolvedLanguage: 'en',
        getFixedT: () => (key: string) => key,
      },
    }),
  };
});

vi.mock('../../hooks', () => ({
  useWebUINavigate: () => navigate,
  useSuspendedBackendaiClient: () => ({ _config: {} }),
}));

vi.mock('../../hooks/useRouteScope', () => ({
  useActiveProjectName: () => 'my project',
}));

vi.mock('../../hooks/useHelpURL', () => ({
  useOpenHelp: () => openHelp,
}));

vi.mock('../../hooks/useShellPanels', () => ({
  useNotificationDrawerState: () => [false, openNotifications],
  useSiderCollapsedState: () => [false, toggleSider],
}));

vi.mock('../../hooks/useThemeMode', () => ({
  useThemeMode: () => ({ isDarkMode: false, setThemeMode }),
}));

vi.mock('./useRecentSearchHits', () => ({
  useRecentSearchHits: () => [[], { push: pushRecent, clear: vi.fn() }],
}));

vi.mock('./useGlobalSearchSource', () => ({
  toTranslator: () => (key: string) => key,
  toSearchConfigFlags: () => ({ fasttrackEndpoint: null }),
  useGlobalSearchSource: () => {
    suspension.throwIfHeld();
    return {
      search: (query: string) =>
        hits.filter((hit) =>
          hit.label.toLowerCase().includes(query.toLowerCase()),
        ),
      bootstrap: () => bootstrapGate.result(hits),
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
  // The palette is `React.lazy`; under vitest the first dynamic import pays the
  // whole transform cost, which is a test-env artifact, not a product delay.
  beforeAll(async () => {
    await import('./GlobalSearchPalette');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    suspension.release();
    bootstrapGate.release(hits);
  });

  it('fills the list with skeleton rows while bootstrap is pending, never the default copy', async () => {
    const user = userEvent.setup();
    bootstrapGate.hold();
    render(<GlobalSearchPaletteButton />);
    await user.click(screen.getByRole('button', { name: 'webui.menu.Search' }));

    await waitFor(() =>
      expect(
        document.querySelectorAll('.astryx-skeleton').length,
      ).toBeGreaterThan(0),
    );
    // Astryx's `emptyBootstrapText` default, which reads as an empty result set.
    expect(screen.queryByText('Type to search')).not.toBeInTheDocument();
    expect(screen.queryByText('Sessions')).not.toBeInTheDocument();

    await act(async () => {
      bootstrapGate.release(hits);
    });

    await waitFor(() =>
      expect(screen.getByText('Sessions')).toBeInTheDocument(),
    );
    expect(document.querySelectorAll('.astryx-skeleton')).toHaveLength(0);
  });

  it('keeps the header mounted while the palette subtree suspends, then mounts it whole', async () => {
    const user = userEvent.setup();
    // Mirrors MainLayout: the header's only outer boundary is an ancestor one,
    // so a suspend that escaped the palette would swap the whole header for
    // this fallback.
    render(
      <Suspense fallback={<span>header-blanked</span>}>
        <GlobalSearchPaletteButton />
      </Suspense>,
    );
    const trigger = screen.getByRole('button', { name: 'webui.menu.Search' });

    suspension.hold();
    await user.click(trigger);

    // The palette's own boundary contains the suspend: the header stays
    // painted and no half-built dialog is shown.
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

  it('opens on the mod+k hotkey, not only on the trigger', async () => {
    // `mod` is ⌘ only on Apple platforms, and jsdom reports none.
    const platform = Object.getOwnPropertyDescriptor(
      window.navigator,
      'platform',
    );
    Object.defineProperty(window.navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });
    render(<GlobalSearchPaletteButton />);
    expect(screen.queryByText('Sessions')).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    await waitFor(() =>
      expect(screen.getByText('Sessions')).toBeInTheDocument(),
    );
    if (platform) {
      Object.defineProperty(window.navigator, 'platform', platform);
    }
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

  it('runs an action hit with the assembled context instead of navigating', async () => {
    const user = await openPalette();

    await user.click(screen.getByText('Toggle sidebar'));

    await waitFor(() => expect(runAction).toHaveBeenCalledTimes(1));
    expect(navigate).not.toHaveBeenCalled();
    expect(pushRecent).toHaveBeenCalledWith(actionHit);

    const ctx = runAction.mock.calls[0][0];
    expect(ctx.projectName).toBe('my project');
    ctx.openNotifications();
    ctx.toggleSider();
    ctx.openHelp();
    ctx.setThemeMode('dark');
    expect(openNotifications).toHaveBeenCalledWith(true);
    expect(toggleSider).toHaveBeenCalledTimes(1);
    expect(openHelp).toHaveBeenCalledTimes(1);
    expect(setThemeMode).toHaveBeenCalledWith('dark');
  });
});
