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
  settingPages: 4,
  settingItems: 54,
};

describe('generated search index', () => {
  const index = getSearchIndex();

  it('covers every indexable route in routes.tsx', () => {
    const routes: Array<{
      path: string;
      labelKey: string | null;
      skipReason: string | null;
    }> = JSON.parse(runExtractor(['--routes']));

    const indexed = new Set(index.entries.map((e) => e.path));
    const expected = routes.filter((r) => !r.skipReason && r.labelKey);
    const missing = expected
      .filter((r) => !indexed.has(r.path))
      .map((r) => r.path);
    console.log(
      `routes: ${routes.length} parsed, ${expected.length} indexable, ` +
        `${index.entries.length} entries`,
    );
    expect(missing).toEqual([]);
    expect(index.entries.length).toBeGreaterThanOrEqual(30);
    expect(index.version).toBe(1);
    expect(index.generatedFrom).toBe('react/src/routes.tsx');
  });

  it('finds at least the inventoried tabs and setting items', () => {
    const tabPages = index.entries.filter((e) =>
      e.tabs.some((t) => t.param === 'tab'),
    );
    const tabKeys = index.entries.reduce(
      (a, e) => a + e.tabs.filter((t) => t.param === 'tab').length,
      0,
    );
    const settingPages = index.entries.filter((e) => e.settings.length > 0);
    const settingItems = index.entries.reduce(
      (a, e) => a + e.settings.length,
      0,
    );
    console.log(
      `?tab=: ${tabPages.length} pages / ${tabKeys} keys; ` +
        `settings: ${settingPages.length} pages / ${settingItems} items`,
    );
    expect(tabPages.length).toBeGreaterThanOrEqual(INVENTORY.tabPages);
    expect(tabKeys).toBeGreaterThanOrEqual(INVENTORY.tabKeys);
    expect(settingPages.length).toBeGreaterThanOrEqual(INVENTORY.settingPages);
    expect(settingItems).toBeGreaterThanOrEqual(INVENTORY.settingItems);
  });

  it('drops keys that are on every page', () => {
    const counts = new Map<string, number>();
    for (const e of index.entries)
      for (const k of e.keys) counts.set(k, (counts.get(k) ?? 0) + 1);
    const onEveryPage = [...counts.entries()]
      .filter(([, c]) => c === index.entries.length)
      .map(([k]) => k);

    const max = Math.max(...counts.values());
    console.log(
      `body keys: ${counts.size} distinct, most-shared appears on ${max}/${index.entries.length} entries`,
    );
    expect(onEveryPage).toEqual([]);
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
