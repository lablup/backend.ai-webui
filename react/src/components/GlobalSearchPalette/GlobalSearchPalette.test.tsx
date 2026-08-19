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
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

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

// The rollout gate. The real hook drags in `DefaultProviders`; the flag is all
// the button reads. Defaults to on so the contracts below exercise the palette.
const experimentalGlobalSearch = vi.hoisted(() => ({
  value: true as boolean | null,
}));

vi.mock('../../hooks/useBAISetting', () => ({
  useBAISettingUserState: (name: string) => {
    if (name === 'experimental_global_search') {
      return [experimentalGlobalSearch.value, vi.fn()];
    }
    throw new Error(`Unexpected setting key in test: ${name}`);
  },
}));

vi.mock('./useRecentSearchHits', () => ({
  useRecentSearchHits: () => [[], { push: pushRecent, clear: vi.fn() }],
}));

// Production's source answers the empty query synchronously; a generic Astryx
// source does not. Flip this to cover the async fallback.
let hasSyncBootstrap = true;

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
      ...(hasSyncBootstrap ? { bootstrapSync: () => hits } : {}),
      getHit: (id: string) => hits.find((hit) => hit.id === id),
    };
  },
}));

/**
 * Presses ⌘K and reports whether a hotkey claimed it. `useHotkeys` calls
 * `preventDefault()` before its handler, so `defaultPrevented` is the only
 * observable trace of the registration — the render gate hides the dialog
 * either way, which is why asserting on the dialog proves nothing.
 */
const pressModK = () => {
  const event = new KeyboardEvent('keydown', {
    key: 'k',
    metaKey: true,
    cancelable: true,
    bubbles: true,
  });
  act(() => {
    window.dispatchEvent(event);
  });
  return event.defaultPrevented;
};

const openPalette = async () => {
  const user = userEvent.setup();
  render(<GlobalSearchPaletteButton />);
  await user.click(screen.getByRole('button', { name: 'webui.menu.Search' }));
  await waitFor(() => expect(screen.getByText('Sessions')).toBeInTheDocument());
  return user;
};

describe('GlobalSearchPalette', () => {
  const realPlatform = Object.getOwnPropertyDescriptor(
    window.navigator,
    'platform',
  );

  // The palette is `React.lazy`; under vitest the first dynamic import pays the
  // whole transform cost, which is a test-env artifact, not a product delay.
  beforeAll(async () => {
    // `useHotkeys` resolves `mod` once, at mount, from `navigator.platform`,
    // and jsdom reports none — pin Apple so `mod+k` is the ⌘K users press.
    Object.defineProperty(window.navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });
    await import('./GlobalSearchPalette');
  });

  afterAll(() => {
    if (realPlatform) {
      Object.defineProperty(window.navigator, 'platform', realPlatform);
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    suspension.release();
    bootstrapGate.release(hits);
    hasSyncBootstrap = true;
    experimentalGlobalSearch.value = true;
  });

  it('renders the trigger while the experimental setting is on', () => {
    render(<GlobalSearchPaletteButton />);

    expect(
      screen.getByRole('button', { name: 'webui.menu.Search' }),
    ).toBeInTheDocument();
  });

  it('renders no trigger and leaves mod+k to the browser while the experimental setting is off', () => {
    experimentalGlobalSearch.value = null;
    render(<GlobalSearchPaletteButton />);

    expect(
      screen.queryByRole('button', { name: 'webui.menu.Search' }),
    ).not.toBeInTheDocument();
    // Unclaimed, so the browser's own ⌘K (the address bar) still runs.
    expect(pressModK()).toBe(false);
  });

  it('closes the palette and forgets it was open when the setting is toggled off', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<GlobalSearchPaletteButton />);
    await user.click(screen.getByRole('button', { name: 'webui.menu.Search' }));
    await waitFor(() =>
      expect(screen.getByText('Sessions')).toBeInTheDocument(),
    );

    experimentalGlobalSearch.value = null;
    rerender(<GlobalSearchPaletteButton />);
    expect(screen.queryByText('Sessions')).not.toBeInTheDocument();

    experimentalGlobalSearch.value = true;
    rerender(<GlobalSearchPaletteButton />);
    // Give a surviving `isOpen` the chance to remount the palette — the lazy
    // chunk is already resolved, so one flush is all it would need.
    await act(async () => {});

    expect(
      screen.getByRole('button', { name: 'webui.menu.Search' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Sessions')).not.toBeInTheDocument();
  });

  it('fills the list with skeleton rows while bootstrap is pending, never the default copy', async () => {
    const user = userEvent.setup();
    // Only a source without `bootstrapSync` can ever have a pending bootstrap.
    hasSyncBootstrap = false;
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

  it('claims mod+k and opens on it, not only on the trigger', async () => {
    render(<GlobalSearchPaletteButton />);
    expect(screen.queryByText('Sessions')).not.toBeInTheDocument();

    expect(pressModK()).toBe(true);

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

  it("commits the whole bootstrap list with the palette's first render", async () => {
    const user = userEvent.setup();
    let sawPlaceholder = false;
    const scan = (records: Array<MutationRecord>) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (
            node instanceof HTMLElement &&
            (node.matches('.astryx-skeleton') ||
              node.querySelector('.astryx-skeleton') !== null)
          ) {
            sawPlaceholder = true;
          }
        }
      }
    };
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });

    render(<GlobalSearchPaletteButton />);
    await user.click(screen.getByRole('button', { name: 'webui.menu.Search' }));

    // Deliberately no `waitFor`: every row has to be in the same commit that
    // mounted the dialog, which is the commit the browser paints.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Auto logout')).toBeInTheDocument();
    expect(screen.getByText('Toggle sidebar')).toBeInTheDocument();

    scan(observer.takeRecords());
    observer.disconnect();
    expect(sawPlaceholder).toBe(false);
  });

  it('falls back to the async bootstrap for a source without bootstrapSync', async () => {
    hasSyncBootstrap = false;
    const user = userEvent.setup();

    render(<GlobalSearchPaletteButton />);
    await user.click(screen.getByRole('button', { name: 'webui.menu.Search' }));

    await waitFor(() =>
      expect(screen.getByText('Sessions')).toBeInTheDocument(),
    );
    expect(screen.getByText('Toggle sidebar')).toBeInTheDocument();
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
