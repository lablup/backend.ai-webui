// Resolves the Portless app name that becomes the dev URL's subdomain
// (`https://<name>.localhost:<port>`).
//
// The name is three parts, in this order, and any of them may be missing:
//
//   fr-3665 - pr9049 - statusline
//   \_____/   \____/   \_______/
//   issue     PR       what it is
//
// Identifiers come first because they are what you scan for and what stays the
// same length; the descriptive part goes last so truncation eats the least
// important characters. The descriptive part prefers a human-supplied name
// (PORTLESS_APP_NAME, which the dev-server skill fills from `/rename`) over
// anything derived from a PR title — titles are sentences, and slugifying one
// lands somewhere between good ("drop-portless-placeholder") and useless
// ("normalize-fr-fr"), with no way for a person to fix it.
//
// This lives outside dev.mjs so it can be unit tested: dev.mjs starts the
// Portless daemon at import time, so a test cannot import it.

// A DNS label may be 63 chars. Staying well under leaves room for the worktree
// prefix Portless adds in its auto-derived mode.
const MAX_LEN = 50;
const MAX_TITLE_WORDS = 3;

/** `fr` immediately followed by digits, at a slug boundary, is an issue key. */
const ISSUE_TOKEN = /(^|-)fr(\d+)(?=-|$)/g;

/** The FR-#### anywhere in a branch name (`fix/FR-1234-thing`, `fr1234`, …). */
const BRANCH_ISSUE = /(?:^|[-_/])(fr-?\d+)/i;

/** `fix(FR-1234):` / `docs:` — the conventional-commit prefix, which says nothing. */
const COMMIT_PREFIX = /^\s*\w+\s*(\([^)]*\))?\s*:\s*/;

/** Words that survive slugification but carry no meaning in a hostname. */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'for', 'of', 'in', 'on', 'at', 'by', 'with',
  'is', 'are', 'be', 'so', 'that', 'it', 'its', 'as', 'from', 'into', 'too', 'not',
  'when', 'where', 'while', 'then', 'than', 'but', 'up', 'out', 'off', 'no',
]);

/**
 * Lowercase, strip anything a hostname label cannot carry, and collapse the result.
 * Callers pass arbitrary strings — a Claude Code session name, a PR title — so this
 * has to be total, returning null when nothing usable survives.
 */
export function sanitizeAppName(raw) {
  if (!raw) return null;
  const slug = raw
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_LEN)
    .replace(/-+$/, '') // the slice can land mid-word and leave a trailing dash
    // `fr1234` and `fr-1234` name the same issue, so they must produce the same
    // hostname whichever source supplied the name. Anchoring on a slug boundary
    // keeps words that merely start with "fr" (frame123) intact.
    .replace(ISSUE_TOKEN, '$1fr-$2');
  return slug || null;
}

/** The FR-#### issue key in a branch name, as an app name, or null if it has none. */
export function branchAppName(branch) {
  const match = (branch || '').match(BRANCH_ISSUE);
  return match ? sanitizeAppName(match[1]) : null;
}

/** A few meaningful words from a PR title, for when nobody named the server. */
export function titleWord(title, maxWords = MAX_TITLE_WORDS) {
  if (!title) return null;
  const words = title
    .replace(COMMIT_PREFIX, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w))
    // Stripping punctuation can leave the same word twice in a row — "FR#### to
    // fr-####" collapses to "fr fr" — and a doubled word reads as a typo.
    .filter((w, i, all) => w !== all[i - 1])
    .slice(0, maxWords);
  return words.length ? sanitizeAppName(words.join('-')) : null;
}

/** Drop identifier tokens the composed name already carries, so they appear once. */
function withoutTokens(slug, tokens) {
  if (!slug) return null;
  let out = slug;
  for (const token of tokens.filter(Boolean)) {
    out = out.replace(new RegExp(`(^|-)${token}(?=-|$)`, 'g'), '$1');
  }
  out = out.replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');
  return out || null;
}

/**
 * Join issue / PR / description into one label, capped without mangling the
 * identifiers: only the descriptive tail is truncated, because that is the part
 * a reader can still guess at when it is short.
 */
export function composeAppName({ issue, prNumber, word } = {}) {
  const prToken = prNumber ? `pr${prNumber}` : null;
  const head = [issue, prToken].filter(Boolean).join('-');
  const tail = withoutTokens(word, [issue, prToken]);
  if (!head) return tail || null;
  if (!tail) return head;
  const room = MAX_LEN - head.length - 1;
  if (room <= 0) return head;
  return `${head}-${tail.slice(0, room).replace(/-+$/, '')}`;
}

/**
 * The app name for this dev server, or null to let `portless run` auto-derive one.
 *
 * `pr` is `{ number, title }` when the branch has one — dev.mjs looks it up; it is
 * injected rather than fetched here so this module stays pure and testable.
 * `exact` returns the caller's name verbatim, for a caller that owns the whole
 * hostname (PORTLESS_APP_NAME_EXACT=1).
 */
export function resolveAppName({ envName, branch, pr, exact } = {}) {
  const human = sanitizeAppName(envName);
  if (exact) return human;
  const issue = branchAppName(branch);
  const word = human ?? titleWord(pr?.title);
  return composeAppName({ issue, prNumber: pr?.number, word });
}
