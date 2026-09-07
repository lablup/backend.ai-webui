/**
 * The overlay's icon set: lucide's node data, inlined. The client is served
 * unbundled, so it cannot import `lucide-react` (a React package) — the data
 * below is copied verbatim from `lucide-react@1.37.0`'s
 * `dist/esm/icons/<name>.mjs`, and `icons.test.ts` diffs every entry against
 * that module so a bump cannot leave a stale glyph behind.
 *
 * lucide-react is ISC-licensed (Copyright (c) 2020, Lucide Contributors);
 * lucide's icons are ISC too, derived from Feather (MIT).
 */

/** `[tag, attributes]`, lucide's own shape — copied, not re-derived. */
export type IconNode = [string, Record<string, string>];

export const ICON_NODES = {
  check: [['path', { d: 'M20 6 9 17l-5-5', key: '1gmf2c' }]],
  clipboard: [
    [
      'rect',
      {
        width: '8',
        height: '4',
        x: '8',
        y: '2',
        rx: '1',
        ry: '1',
        key: 'tgr4d6',
      },
    ],
    [
      'path',
      {
        d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2',
        key: '116196',
      },
    ],
  ],
  copy: [
    [
      'rect',
      {
        width: '14',
        height: '14',
        x: '8',
        y: '8',
        rx: '2',
        ry: '2',
        key: '17jyea',
      },
    ],
    [
      'path',
      {
        d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2',
        key: 'zix9uf',
      },
    ],
  ],
  crosshair: [
    ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
    ['line', { x1: '22', x2: '18', y1: '12', y2: '12', key: 'l9bcsi' }],
    ['line', { x1: '6', x2: '2', y1: '12', y2: '12', key: '13hhkx' }],
    ['line', { x1: '12', x2: '12', y1: '6', y2: '2', key: '10w3f3' }],
    ['line', { x1: '12', x2: '12', y1: '22', y2: '18', key: '15g9kq' }],
  ],
  'external-link': [
    ['path', { d: 'M15 3h6v6', key: '1q9fwt' }],
    ['path', { d: 'M10 14 21 3', key: 'gplh6r' }],
    [
      'path',
      {
        d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
        key: 'a6xqqp',
      },
    ],
  ],
  eye: [
    [
      'path',
      {
        d: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0',
        key: '1nclc0',
      },
    ],
    ['circle', { cx: '12', cy: '12', r: '3', key: '1v7zrd' }],
  ],
  'eye-off': [
    [
      'path',
      {
        d: 'M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49',
        key: 'ct8e1f',
      },
    ],
    ['path', { d: 'M14.084 14.158a3 3 0 0 1-4.242-4.242', key: '151rxh' }],
    [
      'path',
      {
        d: 'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143',
        key: '13bj9a',
      },
    ],
    ['path', { d: 'm2 2 20 20', key: '1ooewy' }],
  ],
  files: [
    [
      'path',
      {
        d: 'M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8',
        key: '14sh0y',
      },
    ],
    [
      'path',
      {
        d: 'M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z',
        key: '1970lx',
      },
    ],
    [
      'path',
      {
        d: 'M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1',
        key: 'l4dndm',
      },
    ],
  ],
  'grip-vertical': [
    ['circle', { cx: '9', cy: '12', r: '1', key: '1vctgf' }],
    ['circle', { cx: '9', cy: '5', r: '1', key: 'hp0tcf' }],
    ['circle', { cx: '9', cy: '19', r: '1', key: 'fkjjf6' }],
    ['circle', { cx: '15', cy: '12', r: '1', key: '1tmaij' }],
    ['circle', { cx: '15', cy: '5', r: '1', key: '19l28e' }],
    ['circle', { cx: '15', cy: '19', r: '1', key: 'f4zoj3' }],
  ],
  'map-pin': [
    [
      'path',
      {
        d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0',
        key: '1r0f0z',
      },
    ],
    ['circle', { cx: '12', cy: '10', r: '3', key: 'ilqhr7' }],
  ],
  'trash-2': [
    ['path', { d: 'M10 11v6', key: 'nco0om' }],
    ['path', { d: 'M14 11v6', key: 'outv1u' }],
    ['path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', key: 'miytrc' }],
    ['path', { d: 'M3 6h18', key: 'd0wm0j' }],
    ['path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', key: 'e791ji' }],
  ],
  x: [
    ['path', { d: 'M18 6 6 18', key: '1bl5f8' }],
    ['path', { d: 'm6 6 12 12', key: 'd8bk6v' }],
  ],
} as const satisfies Record<string, readonly IconNode[]>;

export type IconName = keyof typeof ICON_NODES;

/** One size for the whole chrome, so the buttons stop varying in height. */
export const ICON_SIZE = 14;

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * `aria-hidden` on purpose: every button carrying an icon already has the
 * `title`/`aria-label` that names its action, and a second name reads twice.
 */
export function icon(name: IconName, size: number = ICON_SIZE): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  for (const [tag, attrs] of ICON_NODES[name] as readonly IconNode[]) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [attr, value] of Object.entries(attrs))
      if (attr !== 'key') node.setAttribute(attr, value);
    svg.append(node);
  }
  return svg;
}

/** Shared by every shadow root that draws icons. */
export const ICON_STYLE = `
  .icon { flex: none; vertical-align: -2px; }
`;
