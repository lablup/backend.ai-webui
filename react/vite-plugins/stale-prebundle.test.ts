/**
 * A pre-bundle whose chunks name a package version other than the installed
 * one is stale even when its lockfile hash matches (#10341).
 */
import { findStalePrebundle, storePackageOf } from './stale-prebundle.js';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const STORE = '../../../../.local/share/pnpm/store/v11/links';
// pnpm files an unscoped package under an `@` bucket: `links/@/react/…`.
const src = (name: string, version: string, file: string) =>
  `${STORE}/${name.startsWith('@') ? '' : '@/'}${name}/${version}/0123abcd/node_modules/${name}/dist/${file}`;

const cacheWith = (optimized: Record<string, { src: string }>) => {
  const dir = mkdtempSync(join(tmpdir(), 'prebundle-'));
  mkdirSync(join(dir, 'deps'));
  writeFileSync(
    join(dir, 'deps', '_metadata.json'),
    JSON.stringify({ lockfileHash: 'x', optimized }),
  );
  return dir;
};

const installed: Record<string, string> = {
  '@lablup/ui-common': '0.2.0-alpha.19',
  react: '19.2.0',
};

describe('storePackageOf', () => {
  it('reads a scoped and an unscoped package out of a store path', () => {
    expect(
      storePackageOf(src('@lablup/ui-common', '0.2.0-alpha.15', 'Button.js')),
    ).toEqual({ name: '@lablup/ui-common', version: '0.2.0-alpha.15' });
    expect(storePackageOf(src('react', '19.2.0', 'index.js'))).toEqual({
      name: 'react',
      version: '19.2.0',
    });
  });

  it('ignores a path outside the store', () => {
    expect(storePackageOf('../../src/index.tsx')).toBeNull();
  });
});

describe('findStalePrebundle', () => {
  it('names a package cached at an older version than installed', () => {
    const dir = cacheWith({
      react: { src: src('react', '19.2.0', 'index.js') },
      '@lablup/ui-common/Button': {
        src: src('@lablup/ui-common', '0.2.0-alpha.15', 'Button.js'),
      },
    });
    expect(findStalePrebundle(dir, (name) => installed[name])).toEqual({
      name: '@lablup/ui-common',
      cached: '0.2.0-alpha.15',
      installed: '0.2.0-alpha.19',
    });
  });

  it('accepts a cache that matches, or names a package not installed here', () => {
    const dir = cacheWith({
      '@lablup/ui-common/Button': {
        src: src('@lablup/ui-common', '0.2.0-alpha.19', 'Button.js'),
      },
      'some-transitive': { src: src('some-transitive', '1.0.0', 'i.js') },
    });
    expect(findStalePrebundle(dir, (name) => installed[name])).toBeNull();
  });

  it('treats a missing cache as fresh', () => {
    expect(
      findStalePrebundle(join(tmpdir(), 'no-such-cache'), () => '1'),
    ).toBeNull();
  });
});
