import { VALID_MENU_KEYS } from '../../hooks/useWebUIMenuItems';
import { getSearchIndex } from './searchIndex.types';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const REACT_DIR = path.resolve(__dirname, '../../..');
const SCRIPT = 'scripts/build-search-index.mjs';

const runExtractor = (args: Array<string>) =>
  execFileSync('node', [SCRIPT, ...args], {
    cwd: REACT_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

/** Counts from the deep-linkable-surfaces inventory; the index must not regress below them. */
const INVENTORY = {
  tabPages: 8,
  tabKeys: 24,
  labelledTabs: 40,
  settingPages: 4,
  settingItems: 54,
};

/**
 * Menu keys that deliberately have no entry of their own:
 * - `summary` / `job` are backward-compatibility aliases of `dashboard` /
 *   `session`, which are indexed under those names.
 * - `pipeline` is rendered by the FastTrack plugin, not by `routes.tsx`.
 * (`/logs` is likewise route-less, but it is not a menu key.)
 */
const MENU_KEYS_WITHOUT_ROUTE = ['summary', 'job', 'pipeline'];

describe('generated search index', () => {
  const index = getSearchIndex();
  const entriesWithKey = (key: string) =>
    index.entries.filter((e) => e.keys.includes(key)).map((e) => e.path);

  it('indexes every menu key that has a React route', () => {
    const indexed = new Set(index.entries.map((e) => e.menuKey));
    const missing = VALID_MENU_KEYS.filter(
      (k) => !MENU_KEYS_WITHOUT_ROUTE.includes(k) && !indexed.has(k),
    );
    expect(missing).toEqual([]);

    // The exclusion list must stay honest: anything on it that IS indexed is
    // a stale exclusion hiding real coverage.
    expect(MENU_KEYS_WITHOUT_ROUTE.filter((k) => indexed.has(k))).toEqual([]);

    // `chat/:id?` is reachable without the optional param, so it is a page.
    expect(index.entries.map((e) => e.path)).toContain(
      '/project/:projectName/chat',
    );
    expect(index.version).toBe(1);
    expect(index.generatedFrom).toBe('react/src/routes.tsx');
  });

  it('skips only routes that cannot be addressed', () => {
    const routes: Array<{ path: string; skipReason: string | null }> =
      JSON.parse(runExtractor(['--routes']));
    const KNOWN = [
      'duplicate-path',
      'no-component',
      'parametrised',
      'redirect-shim',
      'splat',
    ];
    const reasons = [
      ...new Set(routes.filter((r) => r.skipReason).map((r) => r.skipReason)),
    ].sort();
    expect(reasons.filter((r) => !KNOWN.includes(r!))).toEqual([]);
    // No skipped route keeps an optional param — those are indexed bare now.
    expect(routes.filter((r) => r.path.includes('?') && !r.skipReason)).toEqual(
      [],
    );
    expect(routes.some((r) => r.path.includes(':id?'))).toBe(false);
  });

  it('finds at least the inventoried tabs and setting items', () => {
    const tabPages = index.entries.filter((e) =>
      e.tabs.some((t) => t.param === 'tab'),
    );
    const tabKeys = index.entries.reduce(
      (a, e) => a + e.tabs.filter((t) => t.param === 'tab').length,
      0,
    );
    const allTabs = index.entries.flatMap((e) => e.tabs);
    const settingPages = index.entries.filter((e) => e.settings.length > 0);
    const settingItems = index.entries.reduce(
      (a, e) => a + e.settings.length,
      0,
    );
    console.log(
      `?tab=: ${tabPages.length} pages / ${tabKeys} keys; ` +
        `tabs labelled: ${allTabs.filter((t) => t.labelKey).length}/${allTabs.length}; ` +
        `settings: ${settingPages.length} pages / ${settingItems} items`,
    );
    expect(tabPages.length).toBeGreaterThanOrEqual(INVENTORY.tabPages);
    expect(tabKeys).toBeGreaterThanOrEqual(INVENTORY.tabKeys);
    expect(allTabs.filter((t) => t.labelKey).length).toBeGreaterThanOrEqual(
      INVENTORY.labelledTabs,
    );
    expect(settingPages.length).toBeGreaterThanOrEqual(INVENTORY.settingPages);
    expect(settingItems).toBeGreaterThanOrEqual(INVENTORY.settingItems);
  });

  it('keeps page-owned vocabulary on the pages that own it', () => {
    // Each of these reaches >= 10 entries through transitive imports, so a
    // count-only noise filter deletes it from its own page.
    const owned: Array<[string, string]> = [
      ['session.launcher.SharedMemory', '/project/:projectName/session/start'],
      ['session.launcher.ClusterMode', '/project/:projectName/session/start'],
      ['data.Foldername', '/project/:projectName/data'],
      ['data.UsageMode', '/project/:projectName/data'],
      ['data.Host', '/project/:projectName/data'],
      ['session.SessionName', '/project/:projectName/session'],
      ['session.SessionName', '/project/:projectName/admin/session'],
    ];
    for (const [key, page] of owned)
      expect({ key, on: entriesWithKey(key) }).toMatchObject({
        key,
        on: expect.arrayContaining([page]),
      });
  });

  it('drops chrome from every page', () => {
    for (const key of [
      'button.Cancel',
      'button.Save',
      'button.Refresh',
      'errorBoundary.Title',
      'time.Day',
      'general.ExtendLoginSession',
    ])
      expect({ key, on: entriesWithKey(key) }).toEqual({ key, on: [] });
  });

  it('rebuilds byte-identically', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'search-index-'));
    try {
      const a = path.join(dir, 'a.json');
      const b = path.join(dir, 'b.json');
      runExtractor(['--out', a]);
      runExtractor(['--out', b]);
      expect(fs.readFileSync(a, 'utf8')).toBe(fs.readFileSync(b, 'utf8'));
      // …and the committed artifact is that same build.
      expect(fs.readFileSync(a, 'utf8')).toBe(
        fs.readFileSync(
          path.join(REACT_DIR, 'src/generated/searchIndex.json'),
          'utf8',
        ),
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }, 30_000);
});
