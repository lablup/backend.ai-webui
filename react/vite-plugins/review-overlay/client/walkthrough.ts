/**
 * Guided mode's data (FR-3950): the WALKTHROUGH SET a link of stops opens, and
 * the reviewer's progress over it.
 *
 * The set is read-only and lives beside the draft set in its own key — it never
 * merges into it and never leaves through the dock's copy-all, so a reviewer's
 * own pins survive walking a walkthrough. Progress is keyed by the head the
 * stops were minted for, so a re-minted walkthrough starts clean.
 */
import { isAnchorV3 } from './anchor-guard.js';
import { withNote } from './anchor.js';
import { buildSetHtml, buildSetText } from './block.js';
import { encodeAnchor, PIN_BODY_SRC } from './codec.js';
import { pinId, sha256Bytes } from './id.js';
import { isStop, stripStopFields } from './stop-guard.js';
import type {
  AnchorCodeRef,
  AnchorV3,
  AnchorVia,
  CopyPayload,
  ReviewServerState,
  SetPin,
} from './types.js';

/** The walkthrough set a tab is walking, as `sessionStorage` holds it. */
export const WALKTHROUGH_KEY = 'bai-review:walkthrough';
/** The stop a full-reload navigation asked for, handed to the next document. */
export const WALKTHROUGH_FOCUS_KEY = 'bai-review:walkthrough-focus';
/** Progress outlives the tab, so it is `localStorage` and keyed by `sha`. */
export const WALKTHROUGH_STATE_PREFIX = 'bai-review:walkthrough-state:';
/** Where a stop's code links point when the server names no repository. */
export const DEFAULT_REPO_URL = 'https://github.com/lablup/backend.ai-webui';

/** One stop of a walkthrough, as the set holds it. */
export interface WalkthroughStop {
  id: string;
  anchor: AnchorV3;
  anchorB64: string;
  /** `landmarkLabel(...)` output — its first segment is the page. */
  label: string;
  /** The app's own fragment the stop was minted with. */
  appHash: string;
}

export interface WalkthroughSet {
  v: 1;
  stops: WalkthroughStop[];
  /**
   * Parts of the link that no decoder could read. A link pasted through chat
   * arrives truncated often enough that silence about it reads as "the
   * walkthrough was only ever this long".
   */
  unreadable?: number;
}

const PIN_BODY_RE = new RegExp(`^${PIN_BODY_SRC}$`);

/** Storage is ours, but a half-written value is not a walkthrough. */
export function isWalkthroughStop(value: unknown): value is WalkthroughStop {
  if (!value || typeof value !== 'object') return false;
  const stop = value as Record<string, unknown>;
  if (typeof stop.id !== 'string' || typeof stop.anchorB64 !== 'string')
    return false;
  if (!PIN_BODY_RE.test(`${stop.id}.${stop.anchorB64}`)) return false;
  if (typeof stop.label !== 'string' || typeof stop.appHash !== 'string')
    return false;
  return isAnchorV3(stop.anchor) && isStop(stop.anchor);
}

export function parseWalkthrough(raw: string | null): WalkthroughSet {
  const empty: WalkthroughSet = { v: 1, stops: [] };
  if (!raw) return empty;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (!value || value.v !== 1 || !Array.isArray(value.stops)) return empty;
    const unreadable =
      typeof value.unreadable === 'number' && value.unreadable > 0
        ? Math.floor(value.unreadable)
        : 0;
    return { v: 1, stops: value.stops.filter(isWalkthroughStop), unreadable };
  } catch {
    return empty;
  }
}

const safeSession = (): Storage | null => {
  try {
    return sessionStorage;
  } catch {
    return null;
  }
};

const safeLocal = (): Storage | null => {
  try {
    return localStorage;
  } catch {
    return null;
  }
};

export interface WalkthroughStore {
  stops(): WalkthroughStop[];
  /** How many parts of the link that opened this set could not be read. */
  unreadable(): number;
  save(stops: WalkthroughStop[], unreadable?: number): void;
  clear(): void;
  /**
   * The stop the reader was sent to, read once. A full reload cannot carry the
   * index in the URL — the set link lists every stop in set order — so the id
   * travels beside the set and the next document consumes it.
   */
  takeFocus(): string | null;
  setFocus(id: string): void;
}

export function createWalkthroughStore(
  storage: Storage | null = safeSession(),
): WalkthroughStore {
  return {
    stops() {
      try {
        return parseWalkthrough(storage?.getItem(WALKTHROUGH_KEY) ?? null)
          .stops;
      } catch {
        return [];
      }
    },
    unreadable() {
      try {
        return (
          parseWalkthrough(storage?.getItem(WALKTHROUGH_KEY) ?? null)
            .unreadable ?? 0
        );
      } catch {
        return 0;
      }
    },
    save(stops, unreadable = 0) {
      try {
        storage?.setItem(
          WALKTHROUGH_KEY,
          JSON.stringify({ v: 1, stops, unreadable }),
        );
      } catch {
        // A tab with storage off still walks; only a reload forgets.
      }
    },
    clear() {
      try {
        storage?.removeItem(WALKTHROUGH_KEY);
        storage?.removeItem(WALKTHROUGH_FOCUS_KEY);
      } catch {
        return;
      }
    },
    takeFocus() {
      try {
        const id = storage?.getItem(WALKTHROUGH_FOCUS_KEY) ?? null;
        storage?.removeItem(WALKTHROUGH_FOCUS_KEY);
        return id;
      } catch {
        return null;
      }
    },
    setFocus(id) {
      try {
        storage?.setItem(WALKTHROUGH_FOCUS_KEY, id);
      } catch {
        // The reload still lands on the right page; only the stop moves.
        return;
      }
    },
  };
}

/** The head every stop was minted for, or `nosha` when none says. */
export const walkthroughSha = (stops: WalkthroughStop[]): string =>
  stops.find((stop) => stop.anchor.sha)?.anchor.sha ?? 'nosha';

/** A comment is typed; a tick is one gesture. Only the typing is debounced. */
export const COMMENT_WRITE_MS = 400;

export interface WalkthroughProgress {
  isViewed(id: string): boolean;
  setViewed(id: string, viewed: boolean): void;
  comment(id: string): string;
  setComment(id: string, text: string): void;
  /** Every stop with a non-empty comment, in the order given. */
  commented(ids: string[]): string[];
  viewedCount(ids: string[]): number;
  /** Write a debounced comment out now — the page is going away. */
  flush(): void;
}

interface StoredProgress {
  viewed?: string[];
  comments?: Record<string, string>;
}

/** Viewed set + comments for one walkthrough; every access is guarded. */
export function createWalkthroughProgress(
  sha: string,
  storage: Storage | null = safeLocal(),
): WalkthroughProgress {
  const key = `${WALKTHROUGH_STATE_PREFIX}${sha}`;
  const read = (): StoredProgress => {
    try {
      const raw = storage?.getItem(key);
      const value = raw ? (JSON.parse(raw) as StoredProgress) : null;
      return value && typeof value === 'object' ? value : {};
    } catch {
      return {};
    }
  };
  const held = read();
  const viewed = new Set(
    Array.isArray(held.viewed)
      ? held.viewed.filter((id) => typeof id === 'string')
      : [],
  );
  const comments: Record<string, string> = {};
  for (const [id, text] of Object.entries(held.comments ?? {}))
    if (typeof text === 'string') comments[id] = text;
  const write = () => {
    try {
      storage?.setItem(key, JSON.stringify({ viewed: [...viewed], comments }));
    } catch {
      // Progress stays in memory for this page; the walkthrough still works.
    }
  };
  // The maps above are the truth; storage is a mirror, so a typist can write
  // to it once per pause instead of once per keystroke.
  let pending = 0;
  const writeSoon = () => {
    if (pending) return;
    pending = setTimeout(() => {
      pending = 0;
      write();
    }, COMMENT_WRITE_MS) as unknown as number;
  };
  const flush = () => {
    if (!pending) return;
    clearTimeout(pending);
    pending = 0;
    write();
  };
  return {
    isViewed: (id) => viewed.has(id),
    setViewed(id, on) {
      if (on) viewed.add(id);
      else viewed.delete(id);
      flush();
      write();
    },
    comment: (id) => comments[id] ?? '',
    setComment(id, text) {
      if (text) comments[id] = text;
      else delete comments[id];
      writeSoon();
    },
    flush,
    commented: (ids) => ids.filter((id) => (comments[id] ?? '').trim()),
    viewedCount: (ids) => ids.filter((id) => viewed.has(id)).length,
  };
}

// ------------------------------------------------------------------ prose

/** A waiting stop's `via`, as the sentence the reader follows. */
export function viaSentence(via: AnchorVia[] | undefined): string {
  const steps = (via ?? [])
    .map(({ click }) => click.text ?? click.tid ?? '')
    .filter(Boolean)
    .map((what) => `Click “${what}”`);
  return steps.join(', then ');
}

/** The page half of a stop's label — what the navigator groups by. */
export const stopPage = (stop: WalkthroughStop): string =>
  stop.label.split(' › ')[0]?.trim() || stop.anchor.p;

/** Path and query together: two tabs of one route are two pages here. */
export const stopPageKey = (stop: WalkthroughStop): string =>
  `${stop.anchor.p}${stop.anchor.q ? `?${stop.anchor.q}` : ''}`;

export const pageCount = (stops: WalkthroughStop[]): number =>
  new Set(stops.map(stopPageKey)).size;

export const codeText = (ref: AnchorCodeRef): string =>
  `${ref.path}:${ref.line}${ref.to ? `-${ref.to}` : ''}`;

const HEX = '0123456789abcdef';

/** GitHub keys a "Files changed" anchor by the sha256 of the file's path. */
export function sha256Hex(text: string): string {
  const bytes = sha256Bytes(new TextEncoder().encode(text));
  let out = '';
  for (const byte of bytes) out += HEX[byte >> 4] + HEX[byte & 15];
  return out;
}

/** `owner/name`, a full URL, or nothing — all three reach one repository URL. */
export function repoUrl(state: ReviewServerState | null): string {
  const repo = (state?.repo ?? '').trim();
  if (!repo) return DEFAULT_REPO_URL;
  if (/^https?:\/\//.test(repo)) return repo.replace(/\/+$/, '');
  return `https://github.com/${repo.replace(/^\/+|\/+$/g, '')}`;
}

/** The GitHub line link a stop's `code` entry points at. */
export const codeHref = (
  base: string,
  pr: number,
  ref: AnchorCodeRef,
): string =>
  `${base}/pull/${pr}/files#diff-${sha256Hex(ref.path)}R${ref.line}${
    ref.to ? `-R${ref.to}` : ''
  }`;

/** The ☰ panel's clipboard text: one checklist line per stop. */
export const pageSummaryText = (
  stops: WalkthroughStop[],
  progress: WalkthroughProgress,
): string =>
  stops
    .map(
      (stop, index) =>
        `- [${progress.isViewed(stop.id) ? 'x' : ' '}] ${index + 1}. ${
          stop.label
        } — ${stop.anchor.ck ?? ''}`,
    )
    .join('\n');

// ------------------------------------------------------------------ export

/** The line that ties a reviewer's block back to the stop it answers. */
export const reLine = (stop: WalkthroughStop, index: number): string =>
  `re: stop ${index + 1} · ${stop.id}`;

/**
 * A stop's anchor as an ORDINARY pin would carry it: stop fields stripped, the
 * reviewer's comment in `n`, re-encoded. Async by nature (`encodeAnchor` is a
 * `CompressionStream` round-trip), so guided mode prepares it ahead of the
 * copy gesture — `execCommand('copy')` needs the user activation still live.
 */
export async function prepareComment(
  stop: WalkthroughStop,
  comment: string,
): Promise<PreparedComment> {
  const note = comment.trim();
  const anchor = withNote(stripStopFields(stop.anchor), note);
  return { note, anchor, anchorB64: await encodeAnchor(anchor) };
}

/** What `prepareComment` leaves ready for the next copy of that stop. */
export interface PreparedComment {
  /** The comment as typed, trimmed; `anchor.n` is the capped copy. */
  note: string;
  anchor: AnchorV3;
  anchorB64: string;
}

/**
 * One reviewer pin per comment. The pin is the reviewer's OWN — the stop
 * fields are gone, so `review-pins parse` counts it among the findings it
 * answers rather than skipping it as a walkthrough stop. The `re:` line in the
 * block is what still names the stop it answers.
 */
export function commentPin(
  stop: WalkthroughStop,
  index: number,
  prepared: PreparedComment,
  pr: number,
  at: string,
): SetPin {
  return {
    id: pinId(pr, prepared.anchorB64, at),
    origin: 'pick',
    anchor: prepared.anchor,
    anchorB64: prepared.anchorB64,
    label: stop.label,
    appHash: stop.appHash,
    stack: [],
    note: [prepared.note, reLine(stop, index)].filter(Boolean).join('\n'),
    at,
    pr,
  };
}

/**
 * The blocks `✎ Copy N comments` writes, one per commented stop and separated
 * by a blank line — no set link: these are N separate remarks, not one set.
 */
export function buildCommentCopy(pins: SetPin[]): CopyPayload {
  return {
    text: pins.map((pin) => buildSetText([pin])).join('\n\n'),
    html: pins.map((pin) => buildSetHtml([pin])).join('\n<p></p>\n'),
    toast:
      pins.length === 1
        ? 'Copied 1 comment — paste it into the PR'
        : `Copied ${pins.length} comments — paste them into the PR`,
  };
}
