/**
 * The served set (R3.7): the branch this server runs on plus every layer
 * below it. `advertise.sh` already sliced the stack when it wrote the boot
 * record, so the file's `served[]` IS the set — the only question is whether
 * the record describes this checkout at all.
 */
import type { BootRecord } from './boot-record.js';

export interface ServedPr {
  pr: number;
  branch: string | null;
}

/** GitHub PR states that stop a layer from being polled again (R3.7.5). */
const GONE = new Set(['MERGED', 'CLOSED']);

/**
 * Empty means "this record is not about us" — the caller falls back to
 * `gh pr list --head <branch>`, which is a served set of one. Same rule as
 * `servedEntry`: a record whose served set does not name our branch was
 * written by another checkout, and its PRs are somebody else's.
 */
export function servedPrs(
  record: BootRecord | null,
  branch: string | null,
): ServedPr[] {
  const served = (record?.served ?? []).filter(
    (entry): entry is { pr: number; branch?: string } => !!entry.pr,
  );
  if (!served.length) return [];
  const target = branch || record?.branch || null;
  if (target && !served.some((entry) => entry.branch === target)) return [];
  return served.map((entry) => ({
    pr: entry.pr,
    branch: entry.branch ?? null,
  }));
}

/**
 * A layer that merged or closed since boot stops being polled; its pins
 * freeze at the last payload rather than disappearing mid-review. An
 * unreadable state is not a merge — keep polling it.
 */
export function dropClosed(
  served: ServedPr[],
  states: Array<{ pr: number; state: string | null }>,
): ServedPr[] {
  const gone = new Set(
    states.filter((s) => s.state && GONE.has(s.state)).map((s) => s.pr),
  );
  return served.filter((entry) => !gone.has(entry.pr));
}
