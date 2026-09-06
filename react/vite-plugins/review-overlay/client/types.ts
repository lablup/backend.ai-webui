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
  /** `getSource`'s owner component, e.g. `LoginView`. */
  name: string;
  /**
   * Source location, e.g. `src/components/LoginView.tsx:120:8`. Absent when
   * the server named no root: an absolute path is the driver's own directory.
   */
  src?: string;
  /** `getDisplayName` at pick time — the only name `resolve.ts` compares. */
  dn?: string;
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
  /**
   * A box select's region, as a fraction of THIS element's own box. Present
   * only for a multi-element pick, where the element is the frame the region
   * is measured in rather than the thing being pointed at.
   */
  sel?: AnchorRect;
  /** Shown to the reader, and a resolution rank (`dn` also a veto). */
  c?: AnchorComponent;
  /**
   * The reviewer's note, capped at `NOTE_MAX`. Absent on every link copied
   * before the note travelled in the anchor, and on a pick with no note.
   */
  n?: string;
  /** The note was longer than the cap, so `n` ends in an ellipsis. */
  nt?: 1;
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

/** One copy, two flavours: a markdown textarea and a rich editor. */
export interface CopyPayload {
  text: string;
  html: string;
}

/** `/__review/state` — the write side needs the PR number and the repo root. */
export interface ReviewServerState {
  pr: number | null;
  repo: string | null;
  branch: string | null;
  source: 'boot-record' | 'gh' | 'none';
  /** Absolute repository root, so the client can relativize source paths. */
  root?: string | null;
  error?: string | null;
}
