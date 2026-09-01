/**
 * Merge rules (R3.6). One id is one pin however many times the block was
 * pasted: the same words again are a second SOURCE, different words later are
 * a REPLY, and resolved / outdated / hint are ORed across every occurrence.
 */
import { decodeAnchor } from '../client/codec.js';
import type { PinReply, ReviewPin } from '../client/types.js';
import { isAnchorV3 } from './extract.js';
import type { Occurrence } from './github.js';

const byCreatedAt = (
  a: { createdAt: string | null },
  b: { createdAt: string | null },
) => String(a.createdAt ?? '9999').localeCompare(String(b.createdAt ?? '9999'));

/**
 * A review thread knows its own resolution, so it is the record to believe
 * when the same block also exists as an issue comment (GitHub's "Quote reply"
 * makes copies); otherwise the earliest occurrence is the original.
 */
const primaryFirst = (a: Occurrence, b: Occurrence) =>
  a.native !== b.native ? (a.native ? -1 : 1) : byCreatedAt(a, b);

export function mergePins(occurrences: Occurrence[]): ReviewPin[] {
  const byId = new Map<string, Occurrence[]>();
  for (const occurrence of occurrences) {
    byId.set(occurrence.id, [...(byId.get(occurrence.id) ?? []), occurrence]);
  }

  const pins = [...byId.entries()].map(([id, list]) => {
    const sorted = [...list].sort(primaryFirst);
    const primary = sorted[0];
    const replies: PinReply[] = [
      ...primary.replies,
      ...sorted
        .slice(1)
        .filter((occurrence) => occurrence.normalized !== primary.normalized)
        .map((occurrence) => ({
          author: occurrence.author,
          body: occurrence.text,
          createdAt: occurrence.createdAt,
          url: occurrence.url,
        })),
    ].sort(byCreatedAt);
    return {
      id,
      number: 0,
      anchorB64:
        list.find((occurrence) => occurrence.anchorB64)?.anchorB64 ?? null,
      anchor: null,
      text: primary.text,
      author: primary.author,
      createdAt: primary.createdAt,
      sources: sorted.map((occurrence) => ({
        channel: occurrence.channel,
        pr: occurrence.pr,
        kind: occurrence.kind,
        url: occurrence.url,
        author: occurrence.author,
      })),
      sourcePr: primary.pr,
      quoted: list.some((occurrence) => occurrence.quoted),
      resolved: list.some((occurrence) => occurrence.resolved),
      resolvedBy:
        list.find((occurrence) => occurrence.resolvedBy)?.resolvedBy ?? null,
      outdated: list.some((occurrence) => occurrence.outdated),
      hint: list.some((occurrence) => occurrence.hint),
      replies,
      latestReply: replies.length ? replies[replies.length - 1] : null,
      replyCount: replies.length,
    } satisfies ReviewPin;
  });

  // Numbering is assigned here, once per payload, so a pin keeps its number
  // across renders and a late-resolving anchor never renumbers the panel.
  return pins
    .sort(byCreatedAt)
    .map((pin, index) => ({ ...pin, number: index + 1 }));
}

/**
 * Decode on the server so a browser never inflates a stranger's payload
 * blindly, and drop anything that fails the field check — the client then
 * only ever sees an anchor whose `s`, `p`, `q` and `rect` are the shapes it
 * feeds to `querySelector` and `location`.
 */
export async function attachAnchors(pins: ReviewPin[]): Promise<ReviewPin[]> {
  return Promise.all(
    pins.map(async (pin) => {
      if (!pin.anchorB64) return pin;
      const anchor = await decodeAnchor(pin.anchorB64);
      if (!isAnchorV3(anchor)) return { ...pin, anchor: null, anchorB64: null };
      return { ...pin, anchor };
    }),
  );
}
