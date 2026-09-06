/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Lifts a project condition out of the admin session filter for the grid's
 legacy `compute_session_list` query, which has no `project_id` queryfilter
 field but does take a `group_id` argument (FR-3571).
 */

/** Splits on top-level `&` only (never inside quotes or parentheses). */
export const splitTopLevelAnd = (filter: string): string[] => {
  const segments: string[] = [];
  let depth = 0;
  let inQuote = false;
  let current = '';
  for (const ch of filter) {
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (!inQuote && ch === '(') {
      depth += 1;
    } else if (!inQuote && ch === ')') {
      depth -= 1;
    }
    if (ch === '&' && depth === 0 && !inQuote) {
      segments.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  segments.push(current);
  return segments.map((s) => s.trim()).filter(Boolean);
};

const hasTopLevelOr = (filter: string): boolean => {
  let depth = 0;
  let inQuote = false;
  for (const ch of filter) {
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (!inQuote && ch === '(') {
      depth += 1;
    } else if (!inQuote && ch === ')') {
      depth -= 1;
    } else if (ch === '|' && depth === 0 && !inQuote) {
      return true;
    }
  }
  return false;
};

// A segment that IS a bare project predicate (optionally parenthesized).
// `ilike` counts as equality: the value always comes from the project
// select, so it is a full UUID.
const BARE_PROJECT_PREDICATE =
  /^\(*\s*project_id\s*(?:==|ilike)\s*"%?([^"%]+)%?"\s*\)*$/;

/**
 * Lift the filter's project condition to a `group_id` value — but only when
 * that is provably semantics-preserving: no top-level `|` (removing a
 * conjunct would change the result set) and exactly one bare project
 * predicate. Anything else passes through unchanged; a filter the legacy
 * list rejects then surfaces as the grid's error banner instead of
 * silently showing the wrong sessions.
 */
export const liftProjectPredicate = (
  filter: string,
): { projectId: string | undefined; remainder: string | undefined } => {
  const passthrough = { projectId: undefined, remainder: filter || undefined };
  if (!filter || hasTopLevelOr(filter)) return passthrough;
  const segments = splitTopLevelAnd(filter);
  const bare = segments.filter((seg) => BARE_PROJECT_PREDICATE.test(seg));
  if (bare.length !== 1) return passthrough;
  const kept = segments.filter((seg) => !BARE_PROJECT_PREDICATE.test(seg));
  return {
    projectId: BARE_PROJECT_PREDICATE.exec(bare[0])?.[1],
    remainder: kept.join('&') || undefined,
  };
};
