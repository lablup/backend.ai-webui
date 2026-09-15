/**
 * The commit this dev server is serving, for `/__review/state.head` (FR-3950).
 *
 * Split out of `index.ts` so the cache rule is unit-testable without importing
 * `vite`. The rule matters: the PR a server belongs to is fixed for its whole
 * life, but its HEAD moves under it — a rebase, a `gh stack sync`, a checkout —
 * and the walkthrough banner compares against it, so an answer cached with the
 * PR would keep claiming a commit the server left hours ago.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const pexecFile = promisify(execFile);
const SHA_RE = /^[0-9a-f]{40}$/;

/** Long enough that a burst of boots costs one `git`, short enough to be true. */
export const HEAD_TTL_MS = 5_000;

/** Total: anything that is not a 40-hex sha is "no head", never a throw. */
export async function readHeadSha(): Promise<string | null> {
  try {
    const { stdout } = await pexecFile('git', ['rev-parse', 'HEAD']);
    const sha = stdout.trim();
    return SHA_RE.test(sha) ? sha : null;
  } catch {
    return null;
  }
}

export interface HeadCacheOptions {
  read?: () => Promise<string | null>;
  ttlMs?: number;
  now?: () => number;
}

/**
 * A reader that answers from cache inside `ttlMs` and re-reads after it.
 * Concurrent misses share one read — a page load asks once, not once per
 * module it pulls.
 */
export function createHeadCache({
  read = readHeadSha,
  ttlMs = HEAD_TTL_MS,
  now = Date.now,
}: HeadCacheOptions = {}): () => Promise<string | null> {
  let held: { value: string | null; at: number } | null = null;
  let inFlight: Promise<string | null> | null = null;
  return () => {
    if (held && now() - held.at < ttlMs) return Promise.resolve(held.value);
    inFlight ??= read()
      .catch(() => null)
      .then((value) => {
        held = { value, at: now() };
        inFlight = null;
        return value;
      });
    return inFlight;
  };
}
