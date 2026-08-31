/**
 * The `#bai=v3` markdown block — the overlay's only output.
 *
 * It has to survive being pasted into a GitHub PR comment, a Teams reply and a
 * Claude prompt, so it is a plain quote block: a human reads the label and the
 * note, a tool reads the trailing HTML comment, and the link carries the whole
 * anchor payload so it resolves without any lookup.
 */
import { captureAnchorSignals } from './anchor.js';
import { encodeAnchor } from './codec.js';
import { pinId } from './id.js';
import type { AnchorComponent, AnchorV3 } from './types.js';

/**
 * The app publishes the current route's ENGLISH i18n label on
 * `window.__BAI_REVIEW__` (dev only). Without it — a route with no `labelKey`,
 * or a page outside the router root — the raw pathname is the label; segments
 * are NOT title-cased, because a guessed label reads like a real one.
 */
export function resolveRouteLabel(
  pathname: string,
  hostLabel?: string | null,
): string {
  const label = (hostLabel || '').trim();
  return label || pathname;
}

/** `<route label> › <testid landmark> › <tag "text">` */
export function landmarkLabel(routeLabel: string, anchor: AnchorV3): string {
  const parts = [routeLabel];
  if (anchor.tid) parts.push(anchor.tid);
  const txt = anchor.txt ? ` "${anchor.txt.slice(0, 40)}"` : '';
  parts.push(`${anchor.tag ?? 'element'}${txt}`);
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

export function buildBlockText(input: BlockInput): string {
  const lines = [`> 📍 **${input.label}** · \`${input.id}\``];
  input.stack.forEach((line, i) => {
    lines.push(i === 0 ? `> ⚛️ ${line.trim()}` : `> ${line}`);
  });
  if (input.text) {
    for (const line of input.text.split('\n')) lines.push(`> ${line}`);
  }
  if (input.imageUrl) lines.push(`> ![screenshot](${input.imageUrl})`);
  lines.push(`> [Open on dev server](${input.url})`);
  lines.push(
    `<!-- bai-review v3 id=${input.id} pr=${input.pr} at=${input.at} -->`,
  );
  return lines.join('\n');
}

export interface BuildBlockOptions {
  target: Element;
  text: string;
  pr: number;
  routeLabel: string;
  stack: string[];
  component?: AnchorComponent;
  /** Injected in tests; defaults to now, truncated to whole seconds. */
  at?: string;
  origin?: string;
}

export interface BuiltBlock {
  block: string;
  id: string;
  url: string;
  anchor: AnchorV3;
  anchorB64: string;
  at: string;
}

export async function buildBlock(
  options: BuildBlockOptions,
): Promise<BuiltBlock> {
  const anchor = captureAnchorSignals(options.target, options.component);
  const anchorB64 = await encodeAnchor(anchor);
  const at = options.at ?? new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const id = pinId(options.pr, anchorB64, at);
  const q = anchor.q ? `?${anchor.q}` : '';
  const origin = options.origin ?? location.origin;
  const url = `${origin}${anchor.p}${q}#bai=v3.${id}.${anchorB64}`;
  const block = buildBlockText({
    label: landmarkLabel(options.routeLabel, anchor),
    id,
    stack: options.stack,
    text: options.text,
    url,
    pr: options.pr,
    at,
  });
  return { block, id, url, anchor, anchorB64, at };
}
