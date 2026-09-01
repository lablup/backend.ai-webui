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
    // A later occurrence is either the block again (a source) or an answer to
    // it (a reply) — and a GitHub "Quote reply" is both: the same words back,
    // plus whatever the answerer wrote underneath the quote.
    const isSameBlock = (occurrence: Occurrence) =>
      occurrence.normalized === primary.normalized;
    const answer = (occurrence: Occurrence, body: string): PinReply => ({
      author: occurrence.author,
      body,
      createdAt: occurrence.createdAt,
      url: occurrence.url,
    });
    const replies: PinReply[] = [
      ...primary.replies,
      ...sorted
        .slice(1)
        .flatMap((occurrence) =>
          isSameBlock(occurrence)
            ? occurrence.remainder
              ? [answer(occurrence, occurrence.remainder)]
              : []
            : [answer(occurrence, occurrence.text)],
        ),
    ].sort(byCreatedAt);

    const sources = [primary, ...sorted.slice(1).filter(isSameBlock)];
    const seenSource = new Set<string>();
    return {
      id,
      number: 0,
      anchorB64:
        list.find((occurrence) => occurrence.anchorB64)?.anchorB64 ?? null,
      anchor: null,
      text: primary.text,
      author: primary.author,
      createdAt: primary.createdAt,
      sources: sources
        .filter((occurrence) => {
          const key = `${occurrence.channel}:${occurrence.pr}`;
          if (seenSource.has(key)) return false;
          seenSource.add(key);
          return true;
        })
        .map((occurrence) => ({
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
 * blindly, and drop anything that fails the field check. One anchor at a time:
 * every payload is a comment anyone can write, and `decodeAnchor`'s size cap
 * bounds one inflate, not fifty of them at once.
 */
export async function attachAnchors(pins: ReviewPin[]): Promise<ReviewPin[]> {
  const out: ReviewPin[] = [];
  for (const pin of pins) {
    if (!pin.anchorB64) {
      out.push(pin);
      continue;
    }
    const anchor = await decodeAnchor(pin.anchorB64);
    out.push(
      isAnchorV3(anchor)
        ? { ...pin, anchor }
        : { ...pin, anchor: null, anchorB64: null },
    );
  }
  return out;
}
