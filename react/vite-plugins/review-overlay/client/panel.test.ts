import { createPinPanel, type PinPanel } from './panel.js';
import type { ReviewPin, ReviewPinsPayload } from './types.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const pin = (over: Partial<ReviewPin> = {}): ReviewPin => ({
  id: 'c_zdv3rhz',
  number: 1,
  anchorB64: 'QUJDREVGR0g',
  anchor: { v: 3, s: 'button', p: '/', tag: 'button', txt: 'Login' },
  text: 'off by 8px',
  author: 'reviewer',
  createdAt: new Date().toISOString(),
  sources: [
    {
      channel: 'github',
      pr: 9354,
      kind: 'comment',
      url: 'https://github.com/l/r/pull/9354#issuecomment-1',
      author: 'reviewer',
    },
  ],
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

const payload = (pins: ReviewPin[]): ReviewPinsPayload => ({
  pins,
  served: [{ pr: 9354, state: 'OPEN' }],
  sources: { github: { ok: true, count: pins.length } },
  fetchedAt: new Date().toISOString(),
});

let panel: PinPanel;
let root: ShadowRoot;
let counts: number[] = [];

beforeEach(() => {
  document.body.innerHTML = '<button>Login</button>';
  const host = document.createElement('div');
  host.setAttribute('data-bai-review-overlay', '');
  document.body.appendChild(host);
  root = host.attachShadow({ mode: 'open' });
  counts = [];
  panel = createPinPanel({
    root,
    host,
    showToast: vi.fn(),
    copyText: vi.fn().mockReturnValue(true),
    onCountChange: (count) => counts.push(count),
    onOpenChange: vi.fn(),
    onStartPick: vi.fn(),
    onRefresh: vi.fn(),
  });
});

const items = () => [...root.querySelectorAll('.item')];

describe('pin panel', () => {
  it('renders one flat list in payload number order', () => {
    panel.applyPayload(
      payload([
        pin({ id: 'c_bbbbbbb', number: 2, author: 'second' }),
        pin({ id: 'c_aaaaaaa', number: 1, author: 'first' }),
      ]),
    );
    expect(items().map((item) => (item as HTMLElement).dataset.pinId)).toEqual([
      'c_aaaaaaa',
      'c_bbbbbbb',
    ]);
    expect(items()[0].querySelector('.author')?.textContent).toBe('#1 first');
  });

  it('badges the PR the block was found on and links it', () => {
    panel.applyPayload(payload([pin()]));
    const badge = items()[0].querySelector('a.badge') as HTMLAnchorElement;
    expect(badge.textContent).toBe('🐙 #9354');
    expect(badge.href).toContain('/pull/9354');
  });

  // Pin text is a stranger's comment on a public PR.
  it('renders comment text as text, never as markup', () => {
    panel.applyPayload(
      payload([
        pin({
          text: '<img src=x onerror="alert(1)">',
          author: '<script>evil</script>',
          latestReply: {
            author: '<b>bold</b>',
            body: '<iframe src="http://evil"></iframe>',
            createdAt: null,
            url: null,
          },
          replyCount: 1,
        }),
      ]),
    );
    expect(root.querySelector('img')).toBeNull();
    expect(root.querySelector('iframe')).toBeNull();
    expect(root.querySelector('script')).toBeNull();
    expect(items()[0].querySelector('.body')?.textContent).toBe(
      '<img src=x onerror="alert(1)">',
    );
  });

  it('shows the reply state and the extra-reply count', () => {
    panel.applyPayload(
      payload([
        pin({
          replyCount: 3,
          latestReply: {
            author: 'claude',
            body: 'Fixed in abc1234',
            createdAt: null,
            url: null,
          },
        }),
      ]),
    );
    const item = items()[0];
    expect(item.querySelector('.badge.replied')?.textContent).toContain(
      'replied',
    );
    expect(item.querySelector('.lastreply')?.textContent).toContain('(+2)');
  });

  it('dims a resolved pin and names who resolved it', () => {
    panel.applyPayload(payload([pin({ resolved: true, resolvedBy: 'owner' })]));
    expect(items()[0].classList.contains('resolved')).toBe(true);
    expect(items()[0].textContent).toContain('by owner');
  });

  it('draws a numbered pin for an anchor that resolves on this page', () => {
    panel.applyPayload(payload([pin()]));
    const marker = root.querySelector('.pin');
    expect(marker?.textContent).toBe('1');
    expect(counts.at(-1)).toBe(1);
  });

  it('keeps an unlocatable pin out of the page but in the list', () => {
    document.body.innerHTML = '<p>nothing here</p>';
    panel.applyPayload(payload([pin()]));
    expect(root.querySelector('.pin')?.classList.contains('orphan')).toBe(true);
    expect(items()[0].textContent).toContain('not found on this page');
  });

  it('badges a pin that lives on another page and never draws it', () => {
    panel.applyPayload(
      payload([pin({ anchor: { v: 3, s: 'button', p: '/session' } })]),
    );
    expect(root.querySelector('.pin')).toBeNull();
    expect(items()[0].textContent).toContain('other page');
  });

  // The panel is rebuilt on every poll, so the highlight has to be state.
  it('keeps the highlighted item highlighted across a rebuild', () => {
    panel.applyPayload(payload([pin()]));
    panel.revealItem('c_zdv3rhz');
    expect(items()[0].classList.contains('hl')).toBe(true);
    panel.applyPayload(payload([pin({ text: 'off by 9px' })]));
    expect(items()[0].classList.contains('hl')).toBe(true);
  });

  it('reports the served PRs and the per-channel source status', () => {
    panel.applyPayload({
      pins: [],
      served: [{ pr: 9354, state: 'OPEN' }],
      sources: { github: { ok: false, error: 'upstream' } },
      fetchedAt: new Date().toISOString(),
    });
    const line = root.querySelector('.srcline')?.textContent ?? '';
    expect(line).toContain('serves #9354');
    expect(line).toContain('GitHub ✗ upstream');
  });

  it('holds a deep-link pin until the channel catches up, then replaces it', () => {
    panel.ensureProvisional(
      'c_zdv3rhz',
      { v: 3, s: 'button', p: '/' },
      'QUJDREVGR0g',
    );
    expect(items()[0].textContent).toContain('looking for this pin');
    panel.applyPayload(payload([pin()]));
    expect(items()).toHaveLength(1);
    expect(items()[0].textContent).toContain('off by 8px');
  });

  it('drops a pin that is gone from the payload', () => {
    panel.applyPayload(payload([pin()]));
    panel.applyPayload(payload([]));
    expect(items()).toHaveLength(0);
    expect(root.querySelector('.pin')).toBeNull();
  });
});
