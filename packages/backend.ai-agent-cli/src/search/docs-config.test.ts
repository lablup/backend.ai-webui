import type { RepoContext } from '../repo-context.js';
import { resolveRepoContext } from '../repo-context.js';
import {
  latestDocsVersion,
  loadBookConfig,
  loadToolkitVersions,
} from './docs-config.js';
import { loadDocsPages, publishedMarkdownFiles } from './docs-corpus.js';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const context = resolveRepoContext(import.meta.dirname);

/** A throwaway docs package with just the two config files. */
function docsFixture(book: string, toolkit = ''): RepoContext {
  const docsDir = mkdtempSync(join(tmpdir(), 'bai-agent-docs-'));
  mkdirSync(join(docsDir, 'src'));
  writeFileSync(join(docsDir, 'src', 'book.config.yaml'), book);
  writeFileSync(join(docsDir, 'docs-toolkit.config.yaml'), toolkit);
  return { ...context, docsDir, repoRoot: docsDir };
}

describe('loadBookConfig', () => {
  it('reads the languages and the published pages of the real manual', () => {
    const config = loadBookConfig(context);
    expect([...config.languages].sort()).toEqual(['en', 'ja', 'ko', 'th']);
    for (const lang of config.languages) {
      expect(config.navigation[lang]).toEqual(config.navigation.en);
    }
    expect(config.navigation.en).toContain('admin_menu/admin_menu.md');
    // Files under src/en that the site never publishes.
    expect(config.navigation.en).not.toContain('index.md');
    expect(config.navigation.en).not.toContain(
      'deployment/deployment_presets.md',
    );
  });

  it('accepts the legacy flat form and flow-mapped items', () => {
    const fixture = docsFixture(`
title: Fixture
languages:
  - "en"
  - ko
navigation:
  en:
    - { title: Quickstart, path: quickstart.md }
    - path: "overview/overview.md"   # trailing comment
  ko:
    - category: 시작하기
      items:
        - title: 빠른 시작
          path: quickstart.md
`);
    const config = loadBookConfig(fixture);
    expect(config.languages).toEqual(['en', 'ko']);
    expect(config.navigation).toEqual({
      en: ['quickstart.md', 'overview/overview.md'],
      ko: ['quickstart.md'],
    });
  });
});

describe('publishedMarkdownFiles', () => {
  it('indexes the navigation, not every markdown file on disk', () => {
    const slugs = loadDocsPages(context, 'en').map((page) => page.slug);
    expect(slugs).toContain('admin_menu');
    expect(slugs).toContain('quickstart');
    expect(slugs).not.toContain('index');
    expect(slugs).not.toContain('deployment_presets');
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('keeps sidebar order and skips entries with no file', () => {
    const fixture = docsFixture(`
languages:
  - en
navigation:
  en:
    - path: b.md
    - path: a.md
    - path: missing.md
    - path: b.md
`);
    writeFileSync(join(fixture.docsDir, 'src', 'a.md'), '# A');
    mkdirSync(join(fixture.docsDir, 'src', 'en'));
    writeFileSync(join(fixture.docsDir, 'src', 'en', 'a.md'), '# A');
    writeFileSync(join(fixture.docsDir, 'src', 'en', 'b.md'), '# B');
    expect(publishedMarkdownFiles(fixture, 'en')).toEqual([
      join(fixture.docsDir, 'src', 'en', 'b.md'),
      join(fixture.docsDir, 'src', 'en', 'a.md'),
    ]);
    expect(publishedMarkdownFiles(fixture, 'ko')).toEqual([]);
  });
});

describe('loadToolkitVersions', () => {
  it('names exactly one latest channel in the real config', () => {
    const versions = loadToolkitVersions(context);
    expect(versions[0].label).toBe('next');
    expect(versions.filter((one) => one.latest)).toHaveLength(1);
    expect(latestDocsVersion(context)).toMatch(/^\d+\.\d+$/);
  });

  it('returns null when no entry carries latest: true', () => {
    const fixture = docsFixture(
      'languages:\n  - en\n',
      `
versions:
  - label: "next"
    source:
      kind: workspace
  - label: "26.8"
    latest: false
`,
    );
    expect(loadToolkitVersions(fixture)).toEqual([
      { label: 'next', latest: false },
      { label: '26.8', latest: false },
    ]);
    expect(latestDocsVersion(fixture)).toBeNull();
  });
});
