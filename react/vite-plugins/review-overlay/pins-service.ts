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
  let boot: Promise<{ repo: RepoInfo; served: ServedPr[] }> | null = null;
  let served: ServedPr[] | null = null;
  let cached: { payload: ReviewPinsPayload; at: number } | null = null;
  let inFlight: Promise<ReviewPinsPayload> | null = null;

  const empty = (error: string): ReviewPinsPayload => ({
    pins: [],
    served: [],
    sources: { github: { ok: false, error } },
    fetchedAt: new Date(now()).toISOString(),
    error,
  });

  async function bootOnce() {
    boot ??= (async () => {
      const [repo, initial] = await Promise.all([
        deps.repoInfo(),
        deps.servedSet(),
      ]);
      served = initial;
      return { repo, served: initial };
    })();
    return boot;
  }

  async function build(): Promise<ReviewPinsPayload> {
    const { repo } = await bootOnce();
    // Fail closed: an unreadable repository is treated as a private one, so a
    // broken `gh` never turns into an open read surface.
    if (repo.error || repo.isPrivate || !repo.nameWithOwner) {
      return empty(repo.error ?? 'private repository');
    }
    const set = served ?? [];
    if (!set.length) {
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
    if (!okResults.length) return empty('upstream');

    const occurrences: Occurrence[] = okResults.flatMap((r) => r.occurrences);
    const pins = await attachAnchors(mergePins(occurrences));
    const states = okResults.map((r) => ({ pr: r.pr, state: r.state }));
    served = dropClosed(set, states);

    const github: PinSourceStatus = { ok: true, count: pins.length };
    if (okResults.some((r) => r.truncated)) github.truncated = true;
    if (okResults.length < set.length) github.error = 'upstream';
    return {
      pins,
      served: states,
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
