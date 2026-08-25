// Resolves the Portless app name that becomes the dev URL's subdomain
// (`https://<name>.localhost:<port>`).
//
// This lives outside dev.mjs so it can be unit tested: dev.mjs starts the Portless
// daemon at import time, so a test cannot import it.

const MAX_LEN = 40;

/** `fr` immediately followed by digits, at a slug boundary, is an issue key. */
const ISSUE_TOKEN = /(^|-)fr(\d+)(?=-|$)/g;

/** The FR-#### anywhere in a branch name (`fix/FR-1234-thing`, `fr1234`, …). */
const BRANCH_ISSUE = /(?:^|[-_/])(fr-?\d+)/i;

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

/**
 * The app name for this dev server, or null to let `portless run` auto-derive one.
 * An explicit name beats the branch, because the caller knows something we do not —
 * but it is normalized the same way, which is the bug FR-3665 fixed.
 */
export function resolveAppName({ envName, branch } = {}) {
  return sanitizeAppName(envName) ?? branchAppName(branch);
}
