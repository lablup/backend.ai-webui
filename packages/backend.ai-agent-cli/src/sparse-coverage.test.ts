import { SPARSE_PATTERNS } from './checkout-sync.js';
import { REQUIRED_SOURCES } from './repo-context.js';
import { SCHEMA_META_FILE } from './schema-meta.js';
import { HOST_COMPONENT_DIR } from './search/i18n-index.js';
import { describe, expect, it } from 'vitest';

/**
 * Every repository path a command reads, beyond the three required sources.
 * Add here when a module starts reading a new path — the assertion below is
 * what keeps `sync` from silently returning empty results on a synced
 * machine while every in-checkout test still passes.
 */
const EXTRA_READS = [
  'package.json',
  SCHEMA_META_FILE,
  'data/client-directives.graphql',
  `${HOST_COMPONENT_DIR}/components/Foo.tsx`,
  'packages/backend.ai-webui-docs/terminology.json',
  'packages/backend.ai-webui-docs/docs-toolkit.config.yaml',
  'packages/backend.ai-webui-docs/src/book.config.yaml',
  'packages/backend.ai-webui-docs/src/en/admin_menu.md',
];

// gitignore-style matching for the patterns `sync` uses: a positive pattern
// includes, a `!` pattern excludes, the last match wins. Enough of the grammar
// for our own patterns: a directory (`/dir/`), a file, a double-star glob
// with an extension, and a double-star directory exclusion.
function matches(pattern: string, path: string): boolean {
  const body = pattern.replace(/^!/, '').replace(/^\//, '');
  // `**/` becomes "any directories" and a lone `*` "anything but /"; the
  // placeholder keeps the second replacement from touching the first.
  const escaped = body
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '§')
    .replace(/\*/g, '[^/]*')
    .replace(/§/g, '(?:.*/)?');
  const re = body.endsWith('/')
    ? new RegExp(`^${escaped}`)
    : new RegExp(`^${escaped}$`);
  return re.test(path);
}

export const covered = (path: string): boolean => {
  let included = false;
  for (const pattern of SPARSE_PATTERNS) {
    if (matches(pattern, path)) included = !pattern.startsWith('!');
  }
  return included;
};

describe('SPARSE_PATTERNS', () => {
  it('cover every required source', () => {
    for (const source of REQUIRED_SOURCES) {
      expect(
        covered(`${source.path}/x`) || covered(source.path),
        source.path,
      ).toBe(true);
    }
  });

  it('cover every other path the commands read', () => {
    for (const path of EXTRA_READS) {
      expect(covered(path), path).toBe(true);
    }
  });

  it('exclude the manual images and non-tsx host sources', () => {
    expect(covered('packages/backend.ai-webui-docs/src/en/images/a.png')).toBe(
      false,
    );
    expect(
      covered('packages/backend.ai-webui-docs/src/ko/images/x/b.png'),
    ).toBe(false);
    expect(covered('react/src/foo.ts')).toBe(false);
    expect(covered('react/src/hooks/useFoo.ts')).toBe(false);
    expect(covered('react/package.json')).toBe(false);
    expect(covered('config.toml')).toBe(false);
    expect(covered('react/src/components/Foo.tsx')).toBe(true);
    expect(covered('packages/backend.ai-webui-docs/src/en/a.md')).toBe(true);
  });
});
