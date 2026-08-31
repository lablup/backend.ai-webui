/**
 * Shared shapes for the dev review overlay (FR-3811). Browser-side only —
 * every module under `client/` is transpiled per request and served from
 * `/__review/*.js`; nothing here reaches the app bundle.
 */

/** Fractional position of the picked element inside its testid landmark. */
export interface AnchorRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** React component identity for the picked element, from react-grab. */
export interface AnchorComponent {
  /** Component display name, e.g. `LoginView`. */
  name: string;
  /** Source location, e.g. `src/components/LoginView.tsx:120:8`. */
  src: string;
}

/**
 * `#bai=v3` anchor payload. Serialised as deflate-raw + base64url, so every
 * key is one or two characters: it travels inside a URL fragment that people
 * paste into PR comments and chat.
 */
export interface AnchorV3 {
  v: 3;
  /** CSS selector for the picked element. */
  s: string;
  /** `location.pathname` at pick time. */
  p: string;
  /** `location.search` without the leading `?`, when non-empty. */
  q?: string;
  /** Lowercased tag name. */
  tag?: string;
  /** First 64 chars of the element's normalised text. */
  txt?: string;
  /** Nearest `data-testid` ancestor (or the element's own). */
  tid?: string;
  /** Position within `tid` when the landmark is an ancestor. */
  rect?: AnchorRect;
  /** Extra signal — never used for resolution, only for the human reader. */
  c?: AnchorComponent;
}

declare global {
  interface Window {
    /** Set by `main.ts` so a second `/__review/*.js` entry is a no-op. */
    __baiReviewOverlay?: boolean;
    /**
     * Dev-only handoff from the app, which owns the router the overlay cannot
     * read. Written by `react/src/components/DevReviewRouteLabel.tsx`.
     */
    __BAI_REVIEW__?: {
      routeLabel?: string;
    };
  }
}

/** `/__review/state` — the write side needs only the PR number. */
export interface ReviewServerState {
  pr: number | null;
  repo: string | null;
  branch: string | null;
  source: 'boot-record' | 'gh' | 'none';
  error?: string | null;
}
