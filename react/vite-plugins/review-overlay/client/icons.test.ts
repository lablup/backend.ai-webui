/**
 * `icons.ts` is a COPY of lucide's node data — the overlay client is served
 * unbundled and cannot import `lucide-react`. This is what stops the copy from
 * drifting: every entry is diffed against the module it was copied from, so a
 * catalog bump that redraws a glyph fails here instead of shipping two looks.
 */
import { ICON_NODES, icon, type IconName } from './icons.js';
import { beforeAll, describe, expect, it } from 'vitest';

// lucide 1.70 types its per-icon modules as a default export only, so the
// node data (`__iconData.node`) is read through a dynamic import.
// trash-2 became an alias of trash, whose module holds the data.
const MODULE_OF: Partial<Record<IconName, string>> = { 'trash-2': 'trash' };
// The names the overlay draws, listed by hand so the coverage test below means something.
const DRAWN: ReadonlyArray<string> = [
  'check',
  'chevron-down',
  'chevron-up',
  'clipboard',
  'copy',
  'crosshair',
  'external-link',
  'eye',
  'eye-off',
  'files',
  'grip-vertical',
  'map-pin',
  'pencil',
  'trash-2',
  'user',
  'user-x',
  'x',
];
const UPSTREAM = {} as Record<IconName, unknown>;
beforeAll(async () => {
  for (const name of DRAWN as IconName[]) {
    const mod = (await import(
      `lucide-react/dist/esm/icons/${MODULE_OF[name] ?? name}.mjs`
    )) as unknown as { __iconData: { node: unknown } };
    UPSTREAM[name] = mod.__iconData.node;
  }
});

describe('the inlined icon data', () => {
  it.each(Object.keys(ICON_NODES) as IconName[])(
    'is lucide’s own for %s',
    (name) => {
      expect(ICON_NODES[name]).toEqual(UPSTREAM[name]);
    },
  );

  // A name the overlay stopped drawing is dead weight the parity test still
  // pays for; a name it draws without a copy would throw at render time.
  it('covers exactly the names the overlay draws', () => {
    expect(Object.keys(ICON_NODES).sort()).toEqual([...DRAWN].sort());
  });
});

describe('icon()', () => {
  it('draws one 14px stroked svg, hidden from the accessibility tree', () => {
    const svg = icon('trash-2');

    expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(svg.getAttribute('width')).toBe('14');
    expect(svg.getAttribute('height')).toBe('14');
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('stroke-width')).toBe('2');
    expect(svg.getAttribute('stroke-linecap')).toBe('round');
    expect(svg.getAttribute('stroke-linejoin')).toBe('round');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.children).toHaveLength(ICON_NODES['trash-2'].length);
  });

  it('writes lucide’s attributes and drops its react key', () => {
    const svg = icon('check');
    const path = svg.firstElementChild as SVGPathElement;

    expect(path.tagName).toBe('path');
    expect(path.getAttribute('d')).toBe('M20 6 9 17l-5-5');
    expect(path.hasAttribute('key')).toBe(false);
  });

  it('takes a size, for the marker’s smaller glyph', () => {
    expect(icon('map-pin', 12).getAttribute('width')).toBe('12');
  });
});
