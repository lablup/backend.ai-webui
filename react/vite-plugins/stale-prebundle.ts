/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * `<name>` and `<version>` of a pnpm global-virtual-store path, or null.
 * Unscoped packages sit in an `@` bucket: `…/links/@/react/<version>/…`.
 */
export const storePackageOf = (
  path: string,
): { name: string; version: string } | null => {
  const match = path
    .replaceAll('\\', '/')
    .match(
      /\/links\/(?:@\/)?((?:@[^/]+\/)?[^/]+)\/([^/]+)\/[^/]+\/node_modules\/\1\//,
    );
  return match ? { name: match[1], version: match[2] } : null;
};

export interface StalePrebundle {
  name: string;
  cached: string;
  installed: string;
}

/**
 * The first package the Vite pre-bundle in `cacheDir` names at a version other
 * than the installed one, or null. Vite keys that cache on the lockfile hash
 * alone, so a dev server alive across `pnpm install` can stamp old chunks with
 * the new hash (#10341).
 */
export const findStalePrebundle = (
  cacheDir: string,
  installedVersion: (name: string) => string | undefined,
): StalePrebundle | null => {
  let optimized: Record<string, { src: string }>;
  try {
    optimized =
      JSON.parse(readFileSync(join(cacheDir, 'deps', '_metadata.json'), 'utf8'))
        .optimized ?? {};
  } catch {
    return null;
  }
  for (const { src } of Object.values(optimized)) {
    const pkg = storePackageOf(src);
    if (!pkg) continue;
    const installed = installedVersion(pkg.name);
    if (installed && installed !== pkg.version) {
      return { name: pkg.name, cached: pkg.version, installed };
    }
  }
  return null;
};
