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

/** `/__review/state` — the running layer, plus the whole served set (R3.7). */
export interface ReviewServerState {
  pr: number | null;
  repo: string | null;
  branch: string | null;
  source: 'boot-record' | 'gh' | 'none';
  /** Every PR this server serves; the running layer is `pr`. */
  served: Array<{ pr: number; branch: string | null }>;
  /** A private repository disables both endpoints (R3.4). */
  isPrivate: boolean;
  error?: string | null;
}

// --------------------------------------------------- read side (FR-3813)

/** Teams (FR-3816) folds in as a second channel without reshaping a pin. */
export type PinChannel = 'github' | 'teams';

/** One place the same block was found. Several = the block was pasted twice. */
export interface PinSource {
  channel: PinChannel;
  /** The PR the occurrence was found on — a stack's layer badge (R3.7). */
  pr: number;
  kind: string;
  url: string | null;
  author: string | null;
}

export interface PinReply {
  author: string | null;
  body: string;
  createdAt: string | null;
  url: string | null;
}

/** Every occurrence of one `#bai=v3` id, merged (R3.6). */
export interface ReviewPin {
  id: string;
  /** `createdAt` rank, fixed per payload so numbers never shift on a poll. */
  number: number;
  anchorB64: string | null;
  /** Decoded and field-checked on the server; `null` for the short form. */
  anchor: AnchorV3 | null;
  text: string;
  author: string | null;
  createdAt: string | null;
  sources: PinSource[];
  /** The PR the primary occurrence was found on. */
  sourcePr: number | null;
  /** A pin pasted outside a quote block is accepted and flagged (R3.4). */
  quoted: boolean;
  resolved: boolean;
  resolvedBy: string | null;
  outdated: boolean;
  hint: boolean;
  replies: PinReply[];
  latestReply: PinReply | null;
  replyCount: number;
}

export type PinState =
  'open' | 'replied' | 'hint' | 'resolved' | 'outdated' | 'orphan';

export interface PinSourceStatus {
  ok: boolean;
  count?: number;
  error?: string;
  /** More comments than one page holds — surfaced, never paginated (R3.4). */
  truncated?: boolean;
}

/** `/__review/pins` — a whitelisted shape; no upstream output is echoed. */
export interface ReviewPinsPayload {
  pins: ReviewPin[];
  served: Array<{ pr: number; state: string | null }>;
  sources: Partial<Record<PinChannel, PinSourceStatus>>;
  fetchedAt: string;
  error?: string;
}
