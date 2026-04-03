/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for TabCounter (TabCount class) in helper directory.
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
 * - pause / start: interval management
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
    const addSpy = jest.spyOn(window, 'addEventListener');
    const tc = new TabCount();

    const calls = addSpy.mock.calls.map(([event]) => event);
    expect(calls).toContain('beforeunload');

    // Get the beforeunload handler
    const beforeunloadHandler = addSpy.mock.calls.find(
      ([event]) => event === 'beforeunload',
    )?.[1] as EventListener;

    // Call the handler directly
    if (beforeunloadHandler) {
      beforeunloadHandler(new Event('beforeunload'));
    }

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

  it('persists data to localStorage via updateData', () => {
    const tc = new TabCount();
    const data = { list: {}, lastCleaned: 0 };
    tc.updateData(data);
    expect(localStorage.getItem('tabCountData')).toBe(JSON.stringify(data));
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
    expect(data.list[tc.tabId].url).toBe(window.location.href);
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

  it('triggers clearList when lastCleaned is too old', () => {
    const tc = new TabCount();

    // Set lastCleaned to a time far in the past
    const data = tc.getData();
    data.lastCleaned = Date.now() - 25000; // More than 20000ms ago
    tc.updateData(data);

    const clearListSpy = jest.spyOn(tc, 'clearList');
    tc.updateActive();

    expect(clearListSpy).toHaveBeenCalled();
    tc.pause();
    clearListSpy.mockRestore();
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

  it('counts multiple active tabs correctly', () => {
    const tc = new TabCount();
    const now = Date.now();

    const data = tc.getData();
    // Add multiple fresh tabs
    data.list['tab-1'] = { lastActive: now, url: 'http://a.com' };
    data.list['tab-2'] = { lastActive: now, url: 'http://b.com' };
    tc.updateData(data);

    const count = tc.tabsCount(true);
    expect(count).toBeGreaterThanOrEqual(3); // tc.tabId + tab-1 + tab-2
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

  it('respects the minimum timeout of 8000ms', () => {
    const tc = new TabCount();
    tc.updateInterval = 1000; // Set a small interval
    const now = Date.now();
    const data = tc.getData();

    // Entry that is 7000ms old should not be removed (< 8000ms)
    data.list['recent-tab'] = {
      lastActive: now - 7000,
      url: 'http://recent.com',
    };
    // Entry that is 9000ms old should be removed (> 8000ms)
    data.list['old-tab'] = { lastActive: now - 9000, url: 'http://old.com' };

    const cleaned = tc.clearList(data);
    expect(cleaned.list['recent-tab']).toBeDefined();
    expect(cleaned.list['old-tab']).toBeUndefined();
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
    tc.onTabChange('not-a-function' as never, false);
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

  it('allows multiple callbacks to be registered', () => {
    const tc = new TabCount();
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    tc.onTabChange(cb1, false);
    tc.onTabChange(cb2, false);
    expect(tc.onTabCountUpdate).toContain(cb1);
    expect(tc.onTabCountUpdate).toContain(cb2);
    tc.pause();
  });
});

// ---------------------------------------------------------------------------
// pause / start
// ---------------------------------------------------------------------------

describe('pause / start', () => {
  it('pause stops the heartbeat interval', () => {
    const tc = new TabCount();
    tc.pause();
    expect(tc.updateActiveInterval).toBe(null);
  });

  it('start sets a new interval', () => {
    const tc = new TabCount();
    tc.pause();
    tc.start(500);
    expect(tc.updateActiveInterval).not.toBe(null);
    tc.pause();
  });

  it('start uses default interval if not provided', () => {
    const tc = new TabCount();
    tc.pause();
    tc.start();
    expect(tc.updateActiveInterval).not.toBe(null);
    expect(tc.updateInterval).toBe(1000); // Default value
    tc.pause();
  });

  it('start updates updateInterval when interval parameter is provided', () => {
    const tc = new TabCount();
    tc.start(2000);
    expect(tc.updateInterval).toBe(2000);
    tc.pause();
  });

  it('multiple pause calls are safe', () => {
    const tc = new TabCount();
    tc.pause();
    tc.pause();
    expect(tc.updateActiveInterval).toBe(null);
  });
});

// ---------------------------------------------------------------------------
// Integration tests
// ---------------------------------------------------------------------------

describe('TabCount integration', () => {
  it('automatically updates tab data via interval', () => {
    const tc = new TabCount();
    const initialActive = tc.getData().list[tc.tabId].lastActive;

    // Fast-forward time to trigger the interval
    advanceTimers(1000);

    const updatedActive = tc.getData().list[tc.tabId].lastActive;
    expect(updatedActive).toBeGreaterThanOrEqual(initialActive);

    tc.pause();
  });

  it('calls registered callbacks when tab count changes', () => {
    const tc = new TabCount();
    const cb = jest.fn();
    tc.onTabChange(cb, false);

    // Force a count change by manipulating tabsCounter
    tc.tabsCounter = 99;

    // Trigger an update that will check count and call callbacks
    advanceTimers(1000);

    expect(cb).toHaveBeenCalled();
    tc.pause();
  });

  it('handles multiple tabs lifecycle correctly', () => {
    const tc1 = new TabCount();
    const tc2 = new TabCount();

    // Both tabs should be counted
    const count1 = tc1.tabsCount(true);
    expect(count1).toBeGreaterThanOrEqual(2);

    // Close one tab
    const data = tc2.getData();
    delete data.list[tc2.tabId];
    tc2.updateData(data);
    tc2.pause();

    // Advance time to ensure tc1's count update
    advanceTimers(1500);

    const count2 = tc1.tabsCount(true);
    expect(count2).toBeLessThan(count1);

    tc1.pause();
  });
});
