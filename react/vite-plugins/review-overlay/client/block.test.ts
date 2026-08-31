import {
  buildBlock,
  buildBlockText,
  landmarkLabel,
  resolveRouteLabel,
} from './block.js';
import { decodeAnchor } from './codec.js';
import type { AnchorV3 } from './types.js';
import { describe, expect, it } from 'vitest';

const anchor: AnchorV3 = {
  v: 3,
  s: '[data-testid="login-button"]',
  p: '/session/start',
  tag: 'button',
  txt: 'Login',
  tid: 'login-button',
};

describe('resolveRouteLabel', () => {
  it('uses the app-published English label when present', () => {
    expect(resolveRouteLabel('/session/start', 'Sessions › Start')).toBe(
      'Sessions › Start',
    );
  });

  it('falls back to the raw pathname, with no capitalisation', () => {
    expect(resolveRouteLabel('/session/start')).toBe('/session/start');
    expect(resolveRouteLabel('/session/start', '')).toBe('/session/start');
    expect(resolveRouteLabel('/session/start', '   ')).toBe('/session/start');
    expect(resolveRouteLabel('/session/start', null)).toBe('/session/start');
    expect(resolveRouteLabel('/')).toBe('/');
  });
});

describe('landmarkLabel', () => {
  it('joins route › testid landmark › tag "text"', () => {
    expect(landmarkLabel('Sessions', anchor)).toBe(
      'Sessions › login-button › button "Login"',
    );
  });

  it('drops the landmark when the element has no testid ancestor', () => {
    expect(landmarkLabel('Sessions', { ...anchor, tid: undefined })).toBe(
      'Sessions › button "Login"',
    );
  });

  it('drops the quoted text when the element has none', () => {
    expect(landmarkLabel('Sessions', { ...anchor, txt: undefined })).toBe(
      'Sessions › login-button › button',
    );
  });
});

describe('buildBlockText', () => {
  const base = {
    label: 'Sessions › login-button › button "Login"',
    id: 'c_abcdefg',
    stack: ['in LoginButton (at LoginView.tsx:12)', '  in LoginView'],
    text: 'The label is cut off\non narrow screens.',
    url: 'https://fr-3811.localhost:1355/session/start#bai=v3.c_abcdefg.PAYLOAD',
    pr: 9330,
    at: '2026-08-31T09:00:00Z',
  };

  it('emits the quote block, the verbatim stack, the note, the link and the marker', () => {
    expect(buildBlockText(base)).toBe(
      [
        '> 📍 **Sessions › login-button › button "Login"** · `c_abcdefg`',
        '> ⚛️ in LoginButton (at LoginView.tsx:12)',
        '>   in LoginView',
        '> The label is cut off',
        '> on narrow screens.',
        '> [Open on dev server](https://fr-3811.localhost:1355/session/start#bai=v3.c_abcdefg.PAYLOAD)',
        '<!-- bai-review v3 id=c_abcdefg pr=9330 at=2026-08-31T09:00:00Z -->',
      ].join('\n'),
    );
  });

  it('still produces a complete block when the note is empty', () => {
    const block = buildBlockText({ ...base, text: '', stack: [] });
    expect(block).toBe(
      [
        '> 📍 **Sessions › login-button › button "Login"** · `c_abcdefg`',
        '> [Open on dev server](https://fr-3811.localhost:1355/session/start#bai=v3.c_abcdefg.PAYLOAD)',
        '<!-- bai-review v3 id=c_abcdefg pr=9330 at=2026-08-31T09:00:00Z -->',
      ].join('\n'),
    );
  });

  it('renders the reserved image slot only when one is supplied', () => {
    expect(buildBlockText(base)).not.toContain('![screenshot]');
    expect(
      buildBlockText({ ...base, imageUrl: 'https://example.test/a.png' }),
    ).toContain('> ![screenshot](https://example.test/a.png)');
  });
});

describe('buildBlock', () => {
  it('links a URL whose anchor decodes back to the captured payload', async () => {
    document.body.innerHTML =
      '<div data-testid="login-card"><button id="go">Login</button></div>';
    const target = document.querySelector('#go') as Element;

    const built = await buildBlock({
      target,
      text: 'note',
      pr: 9330,
      routeLabel: 'Sessions',
      stack: [],
      component: {
        name: 'LoginView',
        src: 'src/components/LoginView.tsx:12:4',
      },
      at: '2026-08-31T09:00:00Z',
      origin: 'https://fr-3811.localhost:1355',
    });

    const hash = new URL(built.url).hash;
    expect(hash).toBe(`#bai=v3.${built.id}.${built.anchorB64}`);

    const decoded = await decodeAnchor(built.anchorB64);
    expect(decoded).toMatchObject({
      v: 3,
      s: '#go',
      tag: 'button',
      txt: 'Login',
      tid: 'login-card',
      c: { name: 'LoginView', src: 'src/components/LoginView.tsx:12:4' },
    });
    expect(built.block).toContain(`\`${built.id}\``);
    expect(built.block).toContain(
      `<!-- bai-review v3 id=${built.id} pr=9330 at=2026-08-31T09:00:00Z -->`,
    );
  });
});
