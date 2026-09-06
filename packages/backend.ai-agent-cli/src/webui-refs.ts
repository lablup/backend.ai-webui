import type { GitRunner } from './checkout-sync.js';
import { DATA_REPO_URL, DEFAULT_SYNC_REF } from './checkout-sync.js';
import { compareVersions } from './version-order.js';

/** WebUI release tags look like `v26.8.1` / `v26.9.0-rc.3`. */
const TAG = /^v(\d+)\.(\d+)\.(.+)$/;

/** Every `v*` tag on the WebUI repository, via `git ls-remote` (no API quota). */
export function listWebUiTags(
  git: GitRunner,
  repo: string = DATA_REPO_URL,
): string[] {
  const output = git(['ls-remote', '--tags', '--refs', repo, 'refs/tags/v*']);
  const tags: string[] = [];
  for (const line of output.split('\n')) {
    const match = /refs\/tags\/(v\S+)$/.exec(line.trim());
    if (match) tags.push(match[1]);
  }
  return tags;
}

export interface RefChoice {
  ref: string;
  source: 'flag' | 'manager' | 'default';
  reason: string;
}

/**
 * The WebUI tag to sync for a manager: the highest tag sharing the manager's
 * `major.minor` (`26.8.1` → `v26.8.1`, `26.9.0rc1` → `v26.9.0-rc.3`). A
 * manager newer than every tag — or an unparsable one — gets `main`.
 */
export function pickRefForManager(
  managerVersion: string,
  tags: string[],
): RefChoice {
  const wanted = /^(\d+)\.(\d+)/.exec(managerVersion.trim());
  if (!wanted) {
    return {
      ref: DEFAULT_SYNC_REF,
      source: 'default',
      reason: `manager version "${managerVersion}" has no major.minor to match`,
    };
  }
  const [, major, minor] = wanted;
  const candidates = tags.filter((tag) => {
    const parts = TAG.exec(tag);
    return (
      parts !== null &&
      Number(parts[1]) === Number(major) &&
      Number(parts[2]) === Number(minor)
    );
  });
  if (candidates.length === 0) {
    return {
      ref: DEFAULT_SYNC_REF,
      source: 'default',
      reason: `no v${Number(major)}.${Number(minor)}.* tag for manager ${managerVersion}`,
    };
  }
  const best = candidates.reduce((top, tag) =>
    compareVersions(tag.slice(1), top.slice(1)) > 0 ? tag : top,
  );
  return {
    ref: best,
    source: 'manager',
    reason: `highest v${Number(major)}.${Number(minor)}.* tag for manager ${managerVersion}`,
  };
}
