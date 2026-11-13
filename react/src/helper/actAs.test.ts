/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ACT_AS_HANDOFF_PARAM,
  adoptActAsHandoff,
  applyActAsTitle,
  exitActAs,
  getActAsTarget,
  isActAsDebugMode,
  openActAsTab,
} from './actAs';

const TARGET = {
  userId: 'f38dea23-50fa-42a0-b5ae-338f5f4693f4',
  email: 'user@lablup.com',
  name: 'User',
};

const handoffUrl = () => {
  const openSpy = vi.mocked(window.open);
  const [url] = openSpy.mock.calls.at(-1) ?? [];
  return new URL(String(url));
};

const visit = (url: URL) => {
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
};

describe('act-as hand-off', () => {
  let openedTab: { opener: unknown };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState(null, '', '/');
    openedTab = { opener: window };
    vi.spyOn(window, 'open').mockReturnValue(openedTab as unknown as Window);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('opens a new tab whose URL carries only a nonce', () => {
    expect(openActAsTab(TARGET)).toBe(true);
    const url = handoffUrl();
    expect(url.pathname).toBe('/');
    expect(url.searchParams.get(ACT_AS_HANDOFF_PARAM)).toBeTruthy();
    expect(url.href).not.toContain(TARGET.email);
    expect(openedTab.opener).toBeNull();
  });

  it('opens the Electron entry page instead of the root', () => {
    const g = globalThis as Record<string, unknown>;
    g.isElectron = true;
    const entry = `${window.location.origin}/app/index.html`;
    g.electronInitialHref = entry;
    try {
      openActAsTab(TARGET);
      const url = handoffUrl();
      expect(url.pathname).toBe('/app/index.html');
      visit(url);
      adoptActAsHandoff();
      expect(getActAsTarget()).toEqual(TARGET);
      expect(g.electronInitialHref).toBe(entry);
    } finally {
      delete g.isElectron;
      delete g.electronInitialHref;
    }
  });

  it('reports a blocked popup and drops its hand-off', () => {
    vi.mocked(window.open).mockReturnValue(null);
    expect(openActAsTab(TARGET)).toBe(false);
    expect(localStorage.length).toBe(0);
  });

  it('moves the hand-off into sessionStorage once and strips the nonce', () => {
    openActAsTab(TARGET);
    const url = handoffUrl();
    visit(url);

    adoptActAsHandoff();

    expect(getActAsTarget()).toEqual(TARGET);
    expect(window.location.search).toBe('');
    expect(localStorage.length).toBe(0);

    // Reusing the same link in another tab does nothing.
    sessionStorage.clear();
    visit(url);
    adoptActAsHandoff();
    expect(getActAsTarget()).toBeNull();
  });

  it('ignores a crafted link without a matching hand-off', () => {
    visit(new URL(`http://localhost/?${ACT_AS_HANDOFF_PARAM}=forged`));
    adoptActAsHandoff();
    expect(getActAsTarget()).toBeNull();
  });

  it('ignores an expired hand-off', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    openActAsTab(TARGET);
    const url = handoffUrl();
    vi.setSystemTime(Date.now() + 61_000);
    visit(url);
    adoptActAsHandoff();
    expect(getActAsTarget()).toBeNull();
  });

  it('turns debug mode on only in an act-as tab opened with it', () => {
    expect(isActAsDebugMode()).toBe(false);

    openActAsTab(TARGET);
    visit(handoffUrl());
    adoptActAsHandoff();
    expect(isActAsDebugMode()).toBe(false);

    sessionStorage.clear();
    openActAsTab({ ...TARGET, debug: true });
    visit(handoffUrl());
    adoptActAsHandoff();
    expect(getActAsTarget()).toEqual({ ...TARGET, debug: true });
    expect(isActAsDebugMode()).toBe(true);
    // The flag lives in this tab only; nothing is left for other tabs.
    expect(localStorage.length).toBe(0);
  });

  it('turns debug mode off when the act-as tab exits', () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'close').mockImplementation(() => {});
    openActAsTab({ ...TARGET, debug: true });
    visit(handoffUrl());
    adoptActAsHandoff();
    expect(isActAsDebugMode()).toBe(true);

    exitActAs();
    expect(isActAsDebugMode()).toBe(false);
  });

  it('rejects a stored target whose debug flag is not a boolean', () => {
    sessionStorage.setItem(
      'backendaiwebui.actAs',
      JSON.stringify({ ...TARGET, debug: 'yes' }),
    );
    expect(getActAsTarget()).toBeNull();
    expect(isActAsDebugMode()).toBe(false);
  });

  it('prefixes the tab title once', () => {
    document.title = 'Backend.AI';
    applyActAsTitle(TARGET);
    applyActAsTitle(TARGET);
    expect(document.title).toBe('[User] Backend.AI');
  });
});
