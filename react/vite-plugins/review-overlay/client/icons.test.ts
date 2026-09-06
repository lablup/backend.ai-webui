/**
 * `icons.ts` is a COPY of lucide's node data — the overlay client is served
 * unbundled and cannot import `lucide-react`. This is what stops the copy from
 * drifting: every entry is diffed against the module it was copied from, so a
 * catalog bump that redraws a glyph fails here instead of shipping two looks.
 */
import { ICON_NODES, icon, type IconName } from './icons.js';
import { __iconNode as check } from 'lucide-react/dist/esm/icons/check.mjs';
import { __iconNode as clipboard } from 'lucide-react/dist/esm/icons/clipboard.mjs';
import { __iconNode as copy } from 'lucide-react/dist/esm/icons/copy.mjs';
import { __iconNode as crosshair } from 'lucide-react/dist/esm/icons/crosshair.mjs';
import { __iconNode as externalLink } from 'lucide-react/dist/esm/icons/external-link.mjs';
import { __iconNode as eyeOff } from 'lucide-react/dist/esm/icons/eye-off.mjs';
import { __iconNode as eye } from 'lucide-react/dist/esm/icons/eye.mjs';
import { __iconNode as files } from 'lucide-react/dist/esm/icons/files.mjs';
import { __iconNode as gripVertical } from 'lucide-react/dist/esm/icons/grip-vertical.mjs';
import { __iconNode as mapPin } from 'lucide-react/dist/esm/icons/map-pin.mjs';
import { __iconNode as trash2 } from 'lucide-react/dist/esm/icons/trash-2.mjs';
import { __iconNode as x } from 'lucide-react/dist/esm/icons/x.mjs';
import { describe, expect, it } from 'vitest';

const UPSTREAM: Record<IconName, unknown> = {
  check,
  clipboard,
  copy,
  crosshair,
  'external-link': externalLink,
  eye,
  'eye-off': eyeOff,
  files,
  'grip-vertical': gripVertical,
  'map-pin': mapPin,
  'trash-2': trash2,
  x,
};

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
    expect(Object.keys(ICON_NODES).sort()).toEqual(
      Object.keys(UPSTREAM).sort(),
    );
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
