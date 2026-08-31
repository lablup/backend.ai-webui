/**
 * The FR-3758 score table. Scores are tiers, not a continuum: everything that
 * matched the same way scores the same, and ties break on evidence outside the
 * table (body coverage, then heading depth, then id) so ordering is stable.
 */
export const SCORE = {
  exactTitle: 100,
  exactField: 85,
  phrase: 80,
  tokensFloor: 40,
  tokensCeiling: 75,
  bodyFloor: 10,
  bodyCeiling: 35,
  /** The whole query as a phrase in the prose earns its own, higher band. */
  bodyPhraseFloor: 45,
  /** A hit carried only by body text never outranks a strong heading hit. */
  bodyCap: 60,
  /** Phrase occurrences that reach the top of the body band. */
  bodyPhraseSaturation: 3,
  /** Below this a hit cannot claim a reserved slot. */
  reserved: 40,
} as const;

/** Fixed vocabulary; every `reason` is one of these, each ≤ 60 chars. */
export const REASONS = [
  'exact-title',
  'alias',
  'page-title',
  'heading-phrase',
  'heading-tokens',
  'body-tokens',
] as const;

export type Reason = (typeof REASONS)[number];

/** Reserved slots per domain, so a strong hit is never crowded out. */
export const RESERVED_SLOTS_PER_DOMAIN = 2;

export function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 0);
}

const fold = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, ' ');

export interface Candidate {
  /** The record's own name — a section heading, or a term. */
  title: string;
  /** Secondary exact-matchable fields: the page title, or other spellings. */
  fields: string[];
  /** The reason an exact `fields` match reports. */
  fieldReason: Reason;
  /** Prose searched for tokens: section body, or a term description. */
  body: string;
}

export interface Evidence {
  score: number;
  reason: Reason;
  /** Fraction of query tokens found in the body; a tie-break only. */
  bodyCoverage: number;
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let from = haystack.indexOf(needle);
  while (from >= 0) {
    count += 1;
    from = haystack.indexOf(needle, from + needle.length);
  }
  return count;
}

function coverage(tokens: string[], haystack: string): number {
  if (tokens.length === 0) return 0;
  const hit = tokens.filter((token) => haystack.includes(token)).length;
  return hit / tokens.length;
}

function scoreVariant(candidate: Candidate, variant: string): Evidence | null {
  const query = fold(variant);
  if (!query) return null;
  const title = fold(candidate.title);
  const body = candidate.body.toLowerCase();
  const tokens = tokenize(variant);
  const bodyCoverage = coverage(tokens, body);

  if (title === query) {
    return { score: SCORE.exactTitle, reason: 'exact-title', bodyCoverage };
  }
  if (candidate.fields.some((field) => fold(field) === query)) {
    return {
      score: SCORE.exactField,
      reason: candidate.fieldReason,
      bodyCoverage,
    };
  }
  if (title.includes(query)) {
    return { score: SCORE.phrase, reason: 'heading-phrase', bodyCoverage };
  }

  // Every query token has to be in the heading; the 40-75 span then says how
  // much of the heading the query accounts for.
  if (tokens.length > 0 && coverage(tokens, title) === 1) {
    const titleTokens = tokenize(candidate.title).length || tokens.length;
    const share = Math.min(1, tokens.length / titleTokens);
    const span = SCORE.tokensCeiling - SCORE.tokensFloor;
    return {
      score: Math.round(SCORE.tokensFloor + span * share),
      reason: 'heading-tokens',
      bodyCoverage,
    };
  }

  const occurrences = countOccurrences(body, query);
  if (occurrences > 0) {
    const span = SCORE.bodyCap - SCORE.bodyPhraseFloor;
    const density = Math.min(1, occurrences / SCORE.bodyPhraseSaturation);
    return {
      score: Math.round(SCORE.bodyPhraseFloor + span * density),
      reason: 'body-tokens',
      bodyCoverage,
    };
  }
  if (bodyCoverage > 0) {
    const span = SCORE.bodyCeiling - SCORE.bodyFloor;
    return {
      score: Math.round(SCORE.bodyFloor + span * bodyCoverage),
      reason: 'body-tokens',
      bodyCoverage,
    };
  }
  return null;
}

/** Best evidence across the query and every canonical term it expanded to. */
export function scoreCandidate(
  candidate: Candidate,
  variants: string[],
): Evidence | null {
  let best: Evidence | null = null;
  for (const variant of variants) {
    const evidence = scoreVariant(candidate, variant);
    if (!evidence) continue;
    const better =
      !best ||
      evidence.score > best.score ||
      (evidence.score === best.score &&
        evidence.bodyCoverage > best.bodyCoverage);
    if (better) best = evidence;
  }
  return best;
}

export interface Ranked {
  id: string;
  domain: string;
  score: number;
  reason: Reason;
  bodyCoverage: number;
  /** Title length; a shorter title spends more of itself on the query. */
  titleLength: number;
  /** Heading level for docs, 0 for domains without one. Shallower wins ties. */
  depth: number;
}

export function compareRanked(a: Ranked, b: Ranked): number {
  if (a.score !== b.score) return b.score - a.score;
  if (a.bodyCoverage !== b.bodyCoverage) return b.bodyCoverage - a.bodyCoverage;
  if (a.titleLength !== b.titleLength) return a.titleLength - b.titleLength;
  if (a.depth !== b.depth) return a.depth - b.depth;
  return a.id.localeCompare(b.id);
}

/**
 * Global ranking first, then a guarantee: each domain keeps up to
 * `RESERVED_SLOTS_PER_DOMAIN` of its qualifying hits, evicting the weakest
 * unreserved hit to make room. Docs volume cannot bury a terminology hit, and
 * the reservation never displaces a hit that is itself reserved.
 */
export function selectWithReservedSlots<T extends Ranked>(
  ranked: T[],
  domains: string[],
  limit: number,
): T[] {
  const sorted = [...ranked].sort(compareRanked);
  const reserved = domains.flatMap((domain) =>
    sorted
      .filter((hit) => hit.domain === domain && hit.score >= SCORE.reserved)
      .slice(0, RESERVED_SLOTS_PER_DOMAIN),
  );
  const selected = new Set(sorted.slice(0, limit));

  for (const hit of [...reserved].sort(compareRanked)) {
    if (selected.has(hit)) continue;
    if (selected.size < limit) {
      selected.add(hit);
      continue;
    }
    const evictable = [...selected]
      .filter((candidate) => !reserved.includes(candidate))
      .sort(compareRanked)
      .pop();
    if (!evictable) break;
    selected.delete(evictable);
    selected.add(hit);
  }
  return [...selected].sort(compareRanked);
}
