/**
 * FR-3880 — what the build-mode overlay puts into a built `index.html`, kept
 * out of `index.ts` so it can be tested without importing `vite` (and, with
 * it, esbuild, which will not load under jsdom).
 */
import type { ReviewServerState } from './client/types.js';
import type { HtmlTagDescriptor } from 'vite';

/** Fixed, so the injected tag needs no lookup in the emitted bundle. */
export const BUILD_CHUNK_FILE = 'review-overlay.js';
/** Must match `client/state.ts`'s `STATE_ELEMENT_ID`. */
export const STATE_ELEMENT_ID = 'bai-review-state';

/**
 * Opt-in, and only these two spellings — `routes.tsx` folds its own gate on
 * the same pair, so the overlay and the route-label handoff can never
 * disagree about whether they shipped.
 */
export function isReviewOverlayBuildEnabled(): boolean {
  const flag = (process.env.VITE_REVIEW_OVERLAY_BUILD ?? '').toLowerCase();
  return flag === '1' || flag === 'true';
}

/**
 * A build is not a PR and a bundle keeps no source paths, so both halves of
 * the dev server's answer are structurally absent rather than merely unknown.
 * `AWS_BRANCH` is Amplify's; elsewhere the branch is simply not recorded.
 */
export function staticReviewState(): ReviewServerState {
  return {
    pr: null,
    repo: null,
    branch: process.env.AWS_BRANCH || null,
    source: 'none',
    root: null,
    host: 'static',
  };
}

/** A `<` inside a data block would end the script element early. */
export const jsonForHtml = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c');

/** The state first: the client reads it as the entry module evaluates. */
export function reviewOverlayTags(): HtmlTagDescriptor[] {
  return [
    {
      tag: 'script',
      attrs: { type: 'application/json', id: STATE_ELEMENT_ID },
      children: jsonForHtml(staticReviewState()),
      injectTo: 'body',
    },
    {
      // `{{nonce}}` as on the app's own entry: the backend's CSP middleware
      // substitutes it, and a static host has no CSP to satisfy at all.
      tag: 'script',
      attrs: {
        type: 'module',
        nonce: '{{nonce}}',
        src: `/${BUILD_CHUNK_FILE}`,
      },
      injectTo: 'body',
    },
  ];
}
