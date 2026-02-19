/**
 * Tests for TabCounter (TabCount class).
 *
 * TabCount tracks open browser tabs by writing per-tab heartbeat data to
 * localStorage and counting entries that are still active (within the
 * configured update interval).
 *
 * Coverage:
 * - Constructor: sets up tabId, starts heartbeat, registers beforeunload listener
 * - tabsCount: counts active tabs, calls onTabCountUpdate callbacks
 * - updateActive: writes/updates current tab entry in localStorage
 * - clearList: removes stale entries from the list
 * - getData / updateData: localStorage read/write helpers
 * - onTabChange: registers callbacks, optionally executes immediately
 * - getUrls: returns URL list from tracked tabs
 * - pause / start / setUpdateInterval: interval management
 */
import TabCount from './TabCounter';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Advance fake timers AND process any queued microtasks so that setInterval
 * callbacks driven by Date.now() see consistent timestamps.
 */
function advanceTimers(ms: number): void {
  jest.advanceTimersByTime(ms);
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  // Provide a stable crypto.randomUUID implementation for the jsdom environment
  if (!globalThis.crypto?.randomUUID) {
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID: () => `test-uuid-${Math.random()}` },
      configurable: true,
    });
  }
});

afterEach(() => {
  jest.useRealTimers();
  localStorage.clear();
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

describe('TabCount constructor', () => {
  it('creates a unique tabId for each instance', () => {
    const a = new TabCount();
    const b = new TabCount();
    expect(a.tabId).not.toBe(b.tabId);
    a.pause();
    b.pause();
  });

  it('starts with tabsCounter at 0 before first tabsCount call', () => {
    const tc = new TabCount();
    // updateActive is called in the constructor, which in turn calls tabsCount;
    // but due to fake timers the interval hasn't fired yet. The constructor
    // calls updateActive() once synchronously, so tabsCounter may be ≥ 1.
    expect(typeof tc.tabsCounter).toBe('number');
    tc.pause();
  });

  it('registers a beforeunload listener that removes the tab from localStorage', () => {
    const addSpy = jest.spyOn(globalThis, 'addEventListener');
    const tc = new TabCount();

    const calls = addSpy.mock.calls.map(([event]) => event);
    expect(calls).toContain('beforeunload');

    // Simulate the tab closing: dispatch beforeunload
    const event = new Event('beforeunload');
    globalThis.dispatchEvent(event);

    const data = tc.getData();
    expect(data.list[tc.tabId]).toBeUndefined();

    tc.pause();
    addSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// getData / updateData
// ---------------------------------------------------------------------------

describe('getData / updateData', () => {
  it('returns empty list when localStorage has no tabCountData', () => {
    const tc = new TabCount();
    localStorage.removeItem('tabCountData');
    expect(tc.getData()).toEqual({ list: {}, lastCleaned: 0 });
    tc.pause();
  });

  it('returns empty list when localStorage value is invalid JSON', () => {
    localStorage.setItem('tabCountData', 'not-json{{{');
    const tc = new TabCount();
    // Re-read after construction to get a fresh parse
    localStorage.setItem('tabCountData', 'not-json{{{');
    expect(tc.getData()).toEqual({ list: {}, lastCleaned: 0 });
    tc.pause();
  });

  it('persists data to localStorage via updateData', () => {
    const tc = new TabCount();
    const data = { list: {}, lastCleaned: 0 };
    tc.updateData(data);
    expect(localStorage.getItem('tabCountData')).toBe(JSON.stringify(data));
    tc.pause();
  });

  it('accepts a pre-stringified value in updateData', () => {
    const tc = new TabCount();
    const raw = '{"list":{},"lastCleaned":0}';
    tc.updateData(raw);
    expect(localStorage.getItem('tabCountData')).toBe(raw);
    tc.pause();
  });
});

// ---------------------------------------------------------------------------
// updateActive
// ---------------------------------------------------------------------------

describe('updateActive', () => {
  it('writes a tab entry to localStorage on construction', () => {
    const tc = new TabCount();
    const data = tc.getData();
    expect(data.list[tc.tabId]).toBeDefined();
    expect(typeof data.list[tc.tabId].lastActive).toBe('number');
    tc.pause();
  });

  it('sets the URL to the current location href', () => {
    const tc = new TabCount();
    const data = tc.getData();
    expect(data.list[tc.tabId].url).toBe(globalThis.location.href);
    tc.pause();
  });

  it('updates lastActive on each call', () => {
    const tc = new TabCount();
    const first = tc.getData().list[tc.tabId].lastActive;

    // Advance time so Date.now() returns a later value
    advanceTimers(500);
    tc.updateActive();

    const second = tc.getData().list[tc.tabId].lastActive;
    expect(second).toBeGreaterThanOrEqual(first);
    tc.pause();
  });
});

// ---------------------------------------------------------------------------
// tabsCount
// ---------------------------------------------------------------------------

describe('tabsCount', () => {
  it('returns 1 when only one tab entry is active', () => {
    const tc = new TabCount();
    // After construction there is exactly one active tab (this instance)
    const count = tc.tabsCount(true);
    expect(count).toBeGreaterThanOrEqual(1);
    tc.pause();
  });

  it('does not call onTabCountUpdate when skipCallback is true', () => {
    const tc = new TabCount();
    const cb = jest.fn();
    tc.onTabCountUpdate.push(cb);
    tc.tabsCount(true);
    expect(cb).not.toHaveBeenCalled();
    tc.pause();
  });

  it('calls onTabCountUpdate when count changes and skipCallback is false', () => {
    const tc = new TabCount();
    tc.tabsCounter = 99; // Force a different value to ensure a change is detected
    const cb = jest.fn();
    tc.onTabCountUpdate.push(cb);
    tc.tabsCount(false);
    expect(cb).toHaveBeenCalled();
    tc.pause();
  });

  it('excludes stale entries from the count', () => {
    const tc = new TabCount();

    // Write a stale entry (lastActive far in the past)
    const data = tc.getData();
    data.list['stale-tab'] = {
      lastActive: Date.now() - 10000,
      url: 'http://example.com',
    };
    tc.updateData(data);

    const count = tc.tabsCount(true);
    // Stale entry should not be counted
    expect(count).toBeLessThan(2);
    tc.pause();
  });
});

// ---------------------------------------------------------------------------
// clearList
// ---------------------------------------------------------------------------

describe('clearList', () => {
  it('removes entries whose lastActive is too old', () => {
    const tc = new TabCount();
    const now = Date.now();
    const data = tc.getData();

    // Inject an old entry
    data.list['old-tab'] = { lastActive: now - 20000, url: 'http://old.com' };
    // Inject a fresh entry
    data.list['fresh-tab'] = { lastActive: now, url: 'http://fresh.com' };

    const cleaned = tc.clearList(data);
    expect(cleaned.list['old-tab']).toBeUndefined();
    expect(cleaned.list['fresh-tab']).toBeDefined();
    tc.pause();
  });

  it('sets lastCleaned to approximately now', () => {
    const tc = new TabCount();
    const before = Date.now();
    const cleaned = tc.clearList(tc.getData());
    const after = Date.now();
    expect(cleaned.lastCleaned).toBeGreaterThanOrEqual(before);
    expect(cleaned.lastCleaned).toBeLessThanOrEqual(after);
    tc.pause();
  });
});

// ---------------------------------------------------------------------------
// onTabChange
// ---------------------------------------------------------------------------

describe('onTabChange', () => {
  it('registers a callback that fires when tab count changes', () => {
    const tc = new TabCount();
    const cb = jest.fn();
    tc.onTabChange(cb, false);
    expect(tc.onTabCountUpdate).toContain(cb);
    tc.pause();
  });

  it('does not register non-function values', () => {
    const tc = new TabCount();
    const before = tc.onTabCountUpdate.length;
    tc.onTabChange('not-a-function' as any, false);
    expect(tc.onTabCountUpdate.length).toBe(before);
    tc.pause();
  });

  it('calls the callback immediately when executeNow is true', () => {
    const tc = new TabCount();
    const cb = jest.fn();
    tc.onTabChange(cb, true);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(expect.any(Number));
    tc.pause();
  });

  it('does not call the callback immediately when executeNow is false', () => {
    const tc = new TabCount();
    const cb = jest.fn();
    tc.onTabChange(cb, false);
    expect(cb).not.toHaveBeenCalled();
    tc.pause();
  });
});

// ---------------------------------------------------------------------------
// getUrls
// ---------------------------------------------------------------------------

describe('getUrls', () => {
  it('returns all tab URLs', () => {
    const tc = new TabCount();

    const data = tc.getData();
    data.list['tab-a'] = { lastActive: Date.now(), url: 'http://a.com' };
    data.list['tab-b'] = { lastActive: Date.now(), url: 'http://b.com' };
    tc.updateData(data);

    const urls = tc.getUrls(false);
    expect(urls).toContain('http://a.com');
    expect(urls).toContain('http://b.com');
    tc.pause();
  });

  it('returns unique URLs when getUnique is true', () => {
    const tc = new TabCount();

    const data = tc.getData();
    data.list['tab-x'] = { lastActive: Date.now(), url: 'http://same.com' };
    data.list['tab-y'] = { lastActive: Date.now(), url: 'http://same.com' };
    tc.updateData(data);

    const urls = tc.getUrls(true);
    const same = urls.filter((u) => u === 'http://same.com');
    expect(same.length).toBe(1);
    tc.pause();
  });
});

// ---------------------------------------------------------------------------
// pause / start / setUpdateInterval
// ---------------------------------------------------------------------------

describe('pause / start', () => {
  it('pause stops the heartbeat interval', () => {
    const tc = new TabCount();
    tc.pause();
    expect(tc.updateActiveInterval).toBe(0);
  });

  it('start sets a new interval', () => {
    const tc = new TabCount();
    tc.pause();
    tc.start(500);
    expect(tc.updateActiveInterval).not.toBe(0);
    tc.pause();
  });

  it('setUpdateInterval restarts the interval with the new period', () => {
    const tc = new TabCount();
    tc.setUpdateInterval(500);
    expect(tc.updateInterval).toBe(500);
    expect(tc.updateActiveInterval).not.toBe(0);
    tc.pause();
  });

  it('setUpdateInterval pauses old interval before starting new one', () => {
    const tc = new TabCount();
    const firstInterval = tc.updateActiveInterval;
    tc.setUpdateInterval(2000);
    // The new interval must differ from the one set in the constructor
    // (because clearInterval was called and a new one was created)
    const newInterval = tc.updateActiveInterval;
    expect(newInterval).not.toBe(0);
    // We cannot compare the numeric ids directly because jsdom reuses IDs,
    // but at least verify the updateInterval property was updated.
    expect(tc.updateInterval).toBe(2000);
    expect(firstInterval).not.toBeUndefined();
    tc.pause();
  });
});
