/**
 * Which dev server serves a PR — the on-demand half of `mint.mjs`.
 *
 * A session minting for the branch it implemented knows its app name; a
 * session asked to mint for "PR #N" does not, and the name `dev-server`
 * claimed may carry a `/rename` word the PR title cannot predict. The boot
 * records under `~/.local/state/fw/dev-servers/` are the only place that
 * says which live server serves which PR, so the lookup reads them all.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

/** Every parseable boot record in `dir`, unreadable ones skipped. */
export function readRecords(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".json")) continue;
    const file = resolve(dir, name);
    try {
      out.push({ file, record: JSON.parse(readFileSync(file, "utf8")) });
    } catch {
      // A record mid-write, or one another tool left half-formed.
    }
  }
  return out;
}

/** `kill -0`: true for a live pid, including one owned by another user. */
export function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}

/**
 * The newest live record whose `served[]` names `pr`, or null.
 *
 * Live means never stopped and, when the record carries a pid, that the pid
 * still answers — a server killed without `advertise.sh stop` leaves a
 * record that says nothing was stopped. `repo` is matched when both sides
 * name one, so a box serving two checkouts of different repos cannot hand
 * one PR number to the other's server.
 */
export function recordServingPr(
  records,
  pr,
  { isAlive = pidAlive, repo = "" } = {},
) {
  const wanted = Number(pr);
  const candidates = records.filter(({ record }) => {
    if (!record || record.stoppedAt) return false;
    if (repo && record.repo && record.repo !== repo) return false;
    if (record.pid && !isAlive(record.pid)) return false;
    const served = Array.isArray(record.served) ? record.served : [];
    return served.some((entry) => Number(entry?.pr) === wanted);
  });
  candidates.sort((a, b) =>
    String(b.record.startedAt ?? "").localeCompare(
      String(a.record.startedAt ?? ""),
    ),
  );
  return candidates[0] ?? null;
}
