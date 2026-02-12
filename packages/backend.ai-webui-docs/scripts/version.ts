import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_PKG_PATH = path.resolve(__dirname, '..', '..', '..', 'package.json');

function getGitShortHash(): string | null {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

/**
 * Resolve the document version from the monorepo root package.json.
 *
 * - Release version (`26.2.0`) → `v26.2.0`
 * - Pre-release version (`26.2.0-alpha.0`) → `v26.2.0-alpha.0 (abc1234)`
 *
 * The git short hash is appended for pre-release builds so that
 * PDFs generated from different commits are distinguishable even
 * when the package version has not been bumped.
 */
export function getDocVersion(): { display: string; filename: string } {
  const pkgJson = JSON.parse(fs.readFileSync(ROOT_PKG_PATH, 'utf-8'));
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
