import { isAnchorV3 } from './anchor-guard.js';
import { describe, expect, it } from 'vitest';

const anchor = (over: Record<string, unknown> = {}): unknown => ({
  v: 3,
  s: 'button:nth-of-type(1)',
  p: '/session',
  ...over,
});

describe('isAnchorV3', () => {
  it('accepts a full anchor the encoder produces', () => {
    expect(
      isAnchorV3(
        anchor({
          q: 'status=RUNNING',
          tag: 'button',
          txt: 'Create',
          tid: 'page-start',
          rect: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 },
          c: { name: 'StartPage', src: 'src/pages/StartPage.tsx:1:1' },
        }),
      ),
    ).toBe(true);
  });

  it('accepts the minimum the resolver needs', () => {
    expect(isAnchorV3(anchor())).toBe(true);
  });

  it.each([
    ['another version', anchor({ v: 2 })],
    ['no selector', { v: 3, p: '/' }],
    ['an empty selector', anchor({ s: '' })],
    ['a selector longer than any real one', anchor({ s: 'a'.repeat(1025) })],
    ['an off-origin path', anchor({ p: '//evil.example' })],
    ['a query carrying a second fragment', anchor({ q: 'a=1#b' })],
    ['a tag that is not a tag', anchor({ tag: 'button[onclick]' })],
    ['a rect missing a side', anchor({ rect: { x: 0, y: 0, w: 1 } })],
    ['a non-finite rect', anchor({ rect: { x: NaN, y: 0, w: 1, h: 1 } })],
    ['a component that is not an object', anchor({ c: 'StartPage' })],
    ['nothing at all', null],
    ['a bare string', 'v3'],
  ])('refuses %s', (_label, value) => {
    expect(isAnchorV3(value)).toBe(false);
  });
});
