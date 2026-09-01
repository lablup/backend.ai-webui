import { deriveState, onCurrentPage } from './pins-state.js';
import type { AnchorV3, ReviewPin } from './types.js';
import { describe, expect, it } from 'vitest';

const pin = (over: Partial<ReviewPin> = {}): ReviewPin => ({
  id: 'c_zdv3rhz',
  number: 1,
  anchorB64: null,
  anchor: null,
  text: 'off by 8px',
  author: 'reviewer',
  createdAt: '2026-09-01T08:00:00Z',
  sources: [],
  sourcePr: 9354,
  quoted: true,
  resolved: false,
  resolvedBy: null,
  outdated: false,
  hint: false,
  replies: [],
  latestReply: null,
  replyCount: 0,
  ...over,
});

const anchor = (over: Partial<AnchorV3> = {}): AnchorV3 => ({
  v: 3,
  s: 'button',
  p: '/session',
  ...over,
});

describe('deriveState', () => {
  const located = { located: true, onPage: true };

  it('is open with no reply and no reaction', () => {
    expect(deriveState(pin(), located)).toBe('open');
  });

  it('is replied when someone answered — the "check and resolve" state', () => {
    expect(deriveState(pin({ replyCount: 1 }), located)).toBe('replied');
  });

  it('is a hint for a reaction alone', () => {
    expect(deriveState(pin({ hint: true }), located)).toBe('hint');
  });

  it('lets resolved win over every conversation state', () => {
    expect(
      deriveState(pin({ resolved: true, replyCount: 2, hint: true }), located),
    ).toBe('resolved');
  });

  it('ranks outdated above a reply but below resolved', () => {
    expect(deriveState(pin({ outdated: true, replyCount: 1 }), located)).toBe(
      'outdated',
    );
  });

  it('is orphan when the anchor belongs here but nothing matches it', () => {
    expect(deriveState(pin(), { located: false, onPage: true })).toBe('orphan');
  });

  it('is not orphan merely because the pin lives on another page', () => {
    expect(deriveState(pin(), { located: false, onPage: false })).toBe('open');
  });

  // Losing "somebody answered you" to "we cannot draw it here" would hide the
  // only state that asks the reader to do something.
  it('does not let orphan mask a reply', () => {
    expect(
      deriveState(pin({ replyCount: 1 }), { located: false, onPage: true }),
    ).toBe('replied');
  });
});

describe('onCurrentPage', () => {
  it('matches on pathname alone — a query change is not another page', () => {
    expect(
      onCurrentPage(anchor(), { pathname: '/session', search: '?x=1' }),
    ).toBe(true);
  });

  it('rejects another path', () => {
    expect(onCurrentPage(anchor(), { pathname: '/start', search: '' })).toBe(
      false,
    );
  });

  it('is false without an anchor — the short form has nowhere to be', () => {
    expect(onCurrentPage(null, { pathname: '/session', search: '' })).toBe(
      false,
    );
  });
});
