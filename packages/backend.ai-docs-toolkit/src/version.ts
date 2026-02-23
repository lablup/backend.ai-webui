import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function getGitShortHash(): string | null {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

/**
 * Resolve the document version from a package.json file.
 *
 * @param versionSource - Path to the package.json file
 * @param explicitVersion - Explicit version string to use instead
 */
export function getDocVersion(
  versionSource: string,
  explicitVersion?: string | null,
): { display: string; filename: string } {
  if (explicitVersion) {
    return { display: explicitVersion, filename: explicitVersion };
  }

  const resolvedPath = path.resolve(versionSource);
  if (!fs.existsSync(resolvedPath)) {
    return { display: 'v0.0.0', filename: 'v0.0.0' };
  }

  const pkgJson = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
  const raw: string = pkgJson.version || '0.0.0';
  const isPreRelease = raw.includes('-');

  if (!isPreRelease) {
    const v = `v${raw}`;
    return { display: v, filename: v };
  }

  const hash = getGitShortHash();
  const base = `v${raw}`;

  return {
    display: hash ? `${base} (${hash})` : base,
    filename: hash ? `v${raw}+${hash}` : base,
  };
}
