/**
 * FR-3880 — what the build-mode overlay puts into a built `index.html`: the
 * opt-in switch, the state it embeds, and the escaping that keeps that state
 * inside its own `<script>` element.
 */
import {
  isReviewOverlayBuildEnabled,
  jsonForHtml,
  reviewOverlayTags,
  staticReviewState,
  STATE_ELEMENT_ID,
} from './build-inject.js';
import { afterEach, describe, expect, it } from 'vitest';

const FLAG = 'VITE_REVIEW_OVERLAY_BUILD';
const BRANCH = 'AWS_BRANCH';

afterEach(() => {
  delete process.env[FLAG];
  delete process.env[BRANCH];
});

describe('isReviewOverlayBuildEnabled', () => {
  it('is off when nothing set it — every release build', () => {
    expect(isReviewOverlayBuildEnabled()).toBe(false);
  });

  it.each(['1', 'true'])('opts in on %s', (value) => {
    process.env[FLAG] = value;
    expect(isReviewOverlayBuildEnabled()).toBe(true);
  });

  it.each(['0', 'false', 'on', 'yes', '', 'TRUE', 'True'])(
    'stays off on %s',
    (value) => {
      // Exactly the spellings `routes.tsx` folds on, case and all, so the
      // overlay and the route-label handoff cannot disagree about whether
      // they shipped. `TRUE` is here because that gate cannot lowercase.
      process.env[FLAG] = value;
      expect(isReviewOverlayBuildEnabled()).toBe(false);
    },
  );
});

describe('staticReviewState', () => {
  it('claims no PR and no root — a build has neither', () => {
    expect(staticReviewState()).toEqual({
      pr: null,
      repo: null,
      branch: null,
      source: 'none',
      root: null,
      host: 'static',
    });
  });

  it('carries the branch Amplify names', () => {
    process.env[BRANCH] = 'main';
    expect(staticReviewState().branch).toBe('main');
  });
});

describe('jsonForHtml', () => {
  it('escapes a `<` so a value cannot end the data block', () => {
    expect(jsonForHtml({ branch: '</script><script>x()</script>' })).toBe(
      '{"branch":"\\u003c/script>\\u003cscript>x()\\u003c/script>"}',
    );
  });

  it('is still JSON the browser parses back', () => {
    const value = { branch: 'a<b', host: 'static' };
    expect(JSON.parse(jsonForHtml(value))).toEqual(value);
  });
});

describe('reviewOverlayTags', () => {
  it('injects the state block, then the chunk', () => {
    expect(reviewOverlayTags()).toEqual([
      {
        tag: 'script',
        attrs: { type: 'application/json', id: STATE_ELEMENT_ID },
        children: jsonForHtml(staticReviewState()),
        injectTo: 'body',
      },
      {
        tag: 'script',
        attrs: {
          type: 'module',
          nonce: '{{nonce}}',
          src: '/review-overlay.js',
        },
        injectTo: 'body',
      },
    ]);
  });

  it('names the id `client/state.ts` looks the block up by', async () => {
    // The two constants are declared separately — one is Node's, one is the
    // browser's — so nothing but this catches them drifting apart.
    const client = await import('./client/state.js');
    expect(client.STATE_ELEMENT_ID).toBe(STATE_ELEMENT_ID);
  });
});
