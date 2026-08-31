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

/** Directory prefix a positive, non-glob sparse pattern covers. */
const prefixes = SPARSE_PATTERNS.filter((p) => !p.startsWith('!')).map((p) =>
  p.replace(/^\//, '').replace(/\*\*.*$/, ''),
);

const covered = (path: string): boolean =>
  prefixes.some((prefix) =>
    prefix.endsWith('/') ? path.startsWith(prefix) : path === prefix,
  ) &&
  (!/\.tsx$/.test(path) ||
    SPARSE_PATTERNS.some(
      (p) =>
        p.endsWith('*.tsx') &&
        path.startsWith(p.replace(/^\//, '').replace(/\*\*.*$/, '')),
    ));

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
    expect(SPARSE_PATTERNS).toContain(
      '!/packages/backend.ai-webui-docs/**/images/',
    );
    expect(
      SPARSE_PATTERNS.some((p) => p === '/react/src/' || p === '/react/'),
    ).toBe(false);
  });
});
