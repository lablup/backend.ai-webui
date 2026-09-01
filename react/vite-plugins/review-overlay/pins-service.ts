/**
 * `/__review/pins` behind a 15 s cache with a single shared upstream fetch
 * (R3.4): a dev server is read by everyone on the VPN, and one poll per
 * viewer would be a rate-limit and a privacy problem both.
 *
 * No vite import here on purpose — the whole endpoint's behaviour is testable
 * by injecting `repoInfo` / `servedSet` / `fetchPr`.
 */
import type { ReviewPinsPayload, PinSourceStatus } from './client/types.js';
import type { Occurrence, PrOccurrences } from './pins/github.js';
import { attachAnchors, mergePins } from './pins/merge.js';
import { dropClosed, type ServedPr } from './served.js';

export const PINS_CACHE_MS = 15_000;

export interface RepoInfo {
  nameWithOwner: string | null;
  isPrivate: boolean;
  /** Set when the check itself failed — treated exactly like a private repo. */
  error?: string;
}

export interface PinsServiceDeps {
  repoInfo: () => Promise<RepoInfo>;
  servedSet: () => Promise<ServedPr[]>;
  fetchPr: (repo: string, pr: number) => Promise<PrOccurrences>;
  now?: () => number;
}

export function createPinsService(deps: PinsServiceDeps) {
  const now = deps.now ?? Date.now;
  let boot: Promise<RepoInfo> | null = null;
  let served: ServedPr[] | null = null;
  let cached: { payload: ReviewPinsPayload; at: number } | null = null;
  let inFlight: Promise<ReviewPinsPayload> | null = null;
  /** The last read of a layer that has since merged or closed (R3.7.5). */
  const frozen = new Map<number, PrOccurrences>();
  /** Merged or closed once: never polled again, whatever discovery says. */
  const gone = new Set<number>();

  const empty = (error: string): ReviewPinsPayload => ({
    pins: [],
    served: [],
    sources: { github: { ok: false, error } },
    fetchedAt: new Date(now()).toISOString(),
    error,
  });

  async function repoOnce(): Promise<RepoInfo> {
    boot ??= deps.repoInfo();
    return boot;
  }

  /**
   * Asked again whenever the set is empty: `pnpm dev` before `gh pr create`
   * must not freeze the endpoint at "no open PR" for the life of the process.
   * Discovery upstream is what rate-limits the question.
   */
  async function currentSet(): Promise<ServedPr[]> {
    if (served?.length) return served;
    served = (await deps.servedSet()).filter((entry) => !gone.has(entry.pr));
    return served;
  }

  async function build(): Promise<ReviewPinsPayload> {
    const repo = await repoOnce();
    // Fail closed: an unreadable repository is treated as a private one, so a
    // broken `gh` never turns into an open read surface.
    if (repo.error || repo.isPrivate || !repo.nameWithOwner) {
      return empty(repo.error ?? 'private repository');
    }
    const set = await currentSet();
    if (!set.length && !frozen.size) {
      return {
        pins: [],
        served: [],
        sources: { github: { ok: false, error: 'no open PR' } },
        fetchedAt: new Date(now()).toISOString(),
      };
    }

    const results = await Promise.all(
      set.map((entry) =>
        deps.fetchPr(repo.nameWithOwner as string, entry.pr).then(
          (result) => ({ ok: true as const, result }),
          // The upstream message can carry a token or a URL — it never
          // reaches the response, only the generic marker does.
          () => ({ ok: false as const, pr: entry.pr }),
        ),
      ),
    );

    const okResults = results.flatMap((r) => (r.ok ? [r.result] : []));
    if (!okResults.length && !frozen.size) return empty('upstream');

    const states = okResults.map((r) => ({ pr: r.pr, state: r.state }));
    const stillServed = dropClosed(set, states);
    for (const result of okResults) {
      if (stillServed.some((entry) => entry.pr === result.pr)) continue;
      // Last read of a layer that just merged: kept so its pins freeze there
      // rather than vanishing from the panel mid-review (R3.7.5).
      frozen.set(result.pr, result);
      gone.add(result.pr);
    }
    served = stillServed;

    const fresh = new Set(okResults.map((r) => r.pr));
    const kept = [...frozen.values()].filter((r) => !fresh.has(r.pr));
    const occurrences: Occurrence[] = [...okResults, ...kept].flatMap(
      (r) => r.occurrences,
    );
    const pins = await attachAnchors(mergePins(occurrences));

    const github: PinSourceStatus = { ok: true, count: pins.length };
    if ([...okResults, ...kept].some((r) => r.truncated))
      github.truncated = true;
    if (okResults.length < set.length) github.error = 'upstream';
    return {
      pins,
      served: [...states, ...kept.map((r) => ({ pr: r.pr, state: r.state }))],
      sources: { github },
      fetchedAt: new Date(now()).toISOString(),
    };
  }

  /** One in-flight build, shared; the result — success or failure — is cached. */
  function getPins(): Promise<ReviewPinsPayload> {
    if (cached && now() - cached.at < PINS_CACHE_MS) {
      return Promise.resolve(cached.payload);
    }
    inFlight ??= build()
      .catch(() => empty('upstream'))
      .then((payload) => {
        cached = { payload, at: now() };
        inFlight = null;
        return payload;
      });
    return inFlight;
  }

  return { getPins };
}

export type PinsService = ReturnType<typeof createPinsService>;
