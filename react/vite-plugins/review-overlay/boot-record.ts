/**
 * The dev-server boot record: `BAI_REVIEW_BOOT_RECORD` names a JSON file the
 * tooling that started this server wrote. Split out of `index.ts` so the
 * layer-selection rule below is unit-testable without importing `vite`.
 */
import { readFile } from 'node:fs/promises';

export interface BootRecord {
  schemaVersion?: number;
  app?: string;
  url?: string;
  repo?: string;
  branch?: string;
  served?: Array<{
    pr?: number;
    branch?: string;
    teamsThread?: string;
    commentId?: string;
  }>;
}

export async function readBootRecord(): Promise<BootRecord | null> {
  const path = process.env.BAI_REVIEW_BOOT_RECORD;
  if (!path) return null;
  try {
    const record = JSON.parse(await readFile(path, 'utf-8')) as BootRecord;
    return record.schemaVersion === 1 ? record : null;
  } catch {
    return null;
  }
}

/**
 * `served[]` is written BOTTOM-FIRST: the dev-server skill's `advertise.sh`
 * slices `gh stack view`'s bottom-first branch list up to and including the
 * checked-out branch, so the layer actually running here is the LAST entry
 * (its own `running_pr()` reads `jq last`).
 *
 * The branch decides. Once we know which branch to look for, a record whose
 * served set does not name it was written by a different checkout, and its
 * last PR is somebody else's: return nothing so `discoverState()` falls
 * through to `gh pr list`, which does know this branch. The bottom-first rule
 * applies only when there is no branch to match at all — a detached HEAD with
 * a record that names none either.
 */
export function servedEntry(record: BootRecord | null, branch: string | null) {
  const served = (record?.served ?? []).filter((entry) => entry.pr);
  if (!served.length) return undefined;
  const target = branch || record?.branch || null;
  if (target) return served.find((entry) => entry.branch === target);
  return served[served.length - 1];
}
