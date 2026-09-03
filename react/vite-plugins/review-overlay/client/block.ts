/**
 * The `#bai=v3` block — the overlay's only output, in two clipboard flavours.
 *
 * It has to survive being pasted into a GitHub PR comment (a plain textarea,
 * which takes `text/plain`) and into a Teams reply (a rich editor, which takes
 * `text/html` and would otherwise show the markdown raw), so `buildBlockText`
 * and `buildBlockHtml` render the same `blockLines` model. The reviewer's note
 * leads unquoted; the generated half is a quote; the link carries the whole
 * anchor payload so it resolves without any lookup.
 */
import { captureAnchorSignals, withNote } from './anchor.js';
import { encodeAnchor } from './codec.js';
import { readablePath } from './deeplink.js';
import { pinId } from './id.js';
import type { AnchorComponent, AnchorV3 } from './types.js';

/**
 * The app publishes the current route's ENGLISH i18n label on
 * `window.__BAI_REVIEW__` (dev only). Without it — a route with no `labelKey`,
 * or a page outside the router root — the decoded pathname is the label;
 * segments are NOT title-cased, because a guessed label reads like a real one.
 */
export function resolveRouteLabel(
  pathname: string,
  hostLabel?: string | null,
): string {
  const label = (hostLabel || '').trim();
  return label || readablePath(pathname);
}

/**
 * `<route label> › <testid landmark> › <tag "text">`, and for a box select
 * `… › region in <tag> "text"` — the element there is the frame the region was
 * measured in, so naming it as the pick would be a lie.
 */
export function landmarkLabel(routeLabel: string, anchor: AnchorV3): string {
  const parts = [routeLabel];
  if (anchor.tid) parts.push(anchor.tid);
  const tag = anchor.tag ?? 'element';
  const txt = anchor.txt ? ` "${anchor.txt.slice(0, 40)}"` : '';
  parts.push(anchor.sel ? `region in ${tag}${txt}` : `${tag}${txt}`);
  return parts.join(' › ');
}

export interface BlockInput {
  /** Output of `landmarkLabel`. */
  label: string;
  id: string;
  /** `getStackContext()` output, split into lines and quoted VERBATIM. */
  stack: string[];
  /** The reviewer's note. May be empty — the block still carries the pin. */
  text: string;
  url: string;
  pr: number;
  at: string;
  /**
   * Reserved image slot. Nothing produces one yet; when a screenshot pipeline
   * lands it drops in here without changing the block's shape.
   */
  imageUrl?: string;
}

/** The markdown flavour's link label. */
export const LINK_LABEL = 'Open on dev server';
/**
 * The HTML flavour's link text — and it MUST NOT occur in the markdown one.
 * GitHub's comment box runs `@github/paste-markdown`, whose HTML handler takes
 * `text/plain` as the base and rewrites each `text/html` anchor's text where it
 * finds it there into `[text](href)`. An identical label is found inside our
 * own `[Open on dev server](url)` and doubles it to `[[…](url)](url)`; an
 * unmatched one leaves the markdown alone, which is what we want.
 */
export const LINK_LABEL_HTML = `${LINK_LABEL} ↗`;

/**
 * One generated line. Both flavours render this same list, so a change to the
 * block's shape cannot land in one and miss the other.
 */
type BlockLine =
  | { kind: 'label'; label: string; id: string }
  | { kind: 'stack'; text: string; first: boolean }
  | { kind: 'image'; url: string }
  | { kind: 'link'; url: string };

function blockLines(input: BlockInput): BlockLine[] {
  const lines: BlockLine[] = [
    { kind: 'label', label: input.label, id: input.id },
  ];
  input.stack.forEach((line, i) =>
    lines.push({
      kind: 'stack',
      text: i === 0 ? line.trim() : line,
      first: i === 0,
    }),
  );
  if (input.imageUrl) lines.push({ kind: 'image', url: input.imageUrl });
  lines.push({ kind: 'link', url: input.url });
  return lines;
}

const marker = (input: BlockInput) =>
  `<!-- bai-review v3 id=${input.id} pr=${input.pr} at=${input.at} -->`;

/**
 * The reviewer's words lead, verbatim, unquoted and unstyled — they are the
 * comment's own prose. A blank line separates them from the generated half,
 * which is the quote. No note means no blank line, and the block starts at 📍.
 */
export function buildBlockText(input: BlockInput): string {
  const out: string[] = [];
  if (input.text) out.push(input.text, '');
  for (const line of blockLines(input)) {
    switch (line.kind) {
      case 'label':
        out.push(`> 📍 **${line.label}** · \`${line.id}\``);
        break;
      case 'stack':
        out.push(line.first ? `> ⚛️ ${line.text}` : `> ${line.text}`);
        break;
      case 'image':
        out.push(`> ![screenshot](${line.url})`);
        break;
      case 'link':
        out.push(`> [${LINK_LABEL}](${line.url})`);
        break;
    }
  }
  out.push(marker(input));
  return out.join('\n');
}

/** Everything reaching the HTML flavour is page text or reviewer text. */
const esc = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** HTML collapses leading spaces; the stack frames only read as a tree with them. */
const escIndented = (value: string) => {
  const lead = value.length - value.trimStart().length;
  return '&nbsp;'.repeat(lead) + esc(value.slice(lead));
};

/**
 * The same block for a rich editor. Only tags Teams keeps — `<b>`, `<a>`,
 * `<br>`, `<blockquote>`, `<code>`, `<p>` — so the link stays clickable there;
 * the marker is decoration Teams strips and a markdown paste target keeps.
 */
export function buildBlockHtml(input: BlockInput): string {
  const out: string[] = [];
  if (input.text) {
    out.push(`<p>${input.text.split('\n').map(esc).join('<br>')}</p>`);
  }
  const quoted = blockLines(input).map((line) => {
    switch (line.kind) {
      case 'label':
        return `📍 <b>${esc(line.label)}</b> · <code>${esc(line.id)}</code>`;
      case 'stack':
        return line.first ? `⚛️ ${esc(line.text)}` : escIndented(line.text);
      case 'image':
        return `<img src="${esc(line.url)}" alt="screenshot">`;
      case 'link':
        return `<a href="${esc(line.url)}">${LINK_LABEL_HTML}</a>`;
    }
  });
  out.push(`<blockquote>${quoted.join('<br>')}</blockquote>`);
  out.push(marker(input));
  return out.join('\n');
}

/**
 * Everything about the picked element that does not depend on the note.
 * Captured at PICK time so the copy gesture stays synchronous — see
 * `buildBlockFromCapture`.
 */
export interface AnchorCapture {
  anchor: AnchorV3;
  anchorB64: string;
  /** `getStackContext()` output, already split into lines. */
  stack: string[];
}

/**
 * The async half of building a block. `encodeAnchor` is a `CompressionStream`
 * round-trip, and the caller's `stack` / `component` come from react-grab's
 * fiber walk — none of it may run inside the copy gesture, because
 * `execCommand('copy')` (the only clipboard on the plain-http gateway origin)
 * needs the user activation still to be live.
 */
export async function captureForBlock(
  anchor: AnchorV3,
  stack: string[],
  component?: AnchorComponent,
): Promise<AnchorCapture> {
  const withComponent = component ? { ...anchor, c: component } : anchor;
  return {
    anchor: withComponent,
    anchorB64: await encodeAnchor(withComponent),
    stack,
  };
}

export interface BlockRenderOptions {
  /** The reviewer's note. May be empty — the block still carries the pin. */
  text: string;
  pr: number;
  routeLabel: string;
  /** Injected in tests; defaults to now, truncated to whole seconds. */
  at?: string;
  origin?: string;
}

export interface BuiltBlock {
  block: string;
  /** The same block for a rich paste target; see `buildBlockHtml`. */
  html: string;
  id: string;
  url: string;
  anchor: AnchorV3;
  anchorB64: string;
  at: string;
}

/** The sync half: safe to call inside the keydown/click that copies. */
export function buildBlockFromCapture(
  capture: AnchorCapture,
  options: BlockRenderOptions,
): BuiltBlock {
  const { anchor, anchorB64 } = capture;
  const at = options.at ?? new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const id = pinId(options.pr, anchorB64, at);
  const q = anchor.q ? `?${anchor.q}` : '';
  const origin = options.origin ?? location.origin;
  const url = `${origin}${anchor.p}${q}#bai=v3.${id}.${anchorB64}`;
  const input = {
    label: landmarkLabel(options.routeLabel, anchor),
    id,
    stack: capture.stack,
    text: options.text,
    url,
    pr: options.pr,
    at,
  };
  return {
    block: buildBlockText(input),
    html: buildBlockHtml(input),
    id,
    url,
    anchor,
    anchorB64,
    at,
  };
}

export interface BuildBlockOptions extends BlockRenderOptions {
  /** Skip the capture step — the overlay precomputes this at pick time. */
  capture?: AnchorCapture;
  /** Carry the note in the anchor too; the overlay does this on every edit. */
  noteInAnchor?: boolean;
  /** Required unless `capture` is given. */
  target?: Element;
  stack?: string[];
  component?: AnchorComponent;
}

/** Capture + render in one call. Tests and one-shot callers; the overlay splits them. */
export async function buildBlock(
  options: BuildBlockOptions,
): Promise<BuiltBlock> {
  let capture = options.capture;
  if (!capture) {
    if (!options.target) {
      throw new Error('buildBlock needs either `target` or `capture`');
    }
    const anchor = captureAnchorSignals(options.target);
    capture = await captureForBlock(
      options.noteInAnchor ? withNote(anchor, options.text) : anchor,
      options.stack ?? [],
      options.component,
    );
  }
  return buildBlockFromCapture(capture, options);
}
