/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  contrastRatio,
  meetsWcagAA,
  relativeLuminance,
  sanitizeHexColor,
} from './colorSanitizer';

describe('colorSanitizer', () => {
  describe('sanitizeHexColor', () => {
    it('returns the fallback for null/undefined/empty input', () => {
      expect(sanitizeHexColor(null, '#ff7a00')).toBe('#ff7a00');
      expect(sanitizeHexColor(undefined, '#ff7a00')).toBe('#ff7a00');
      expect(sanitizeHexColor('', '#ff7a00')).toBe('#ff7a00');
    });

    it('accepts and lower-cases a valid 6-digit hex', () => {
      expect(sanitizeHexColor('#8B5CF6', '#ff7a00')).toBe('#8b5cf6');
      expect(sanitizeHexColor('#007aff', '#ff7a00')).toBe('#007aff');
    });

    it('rejects 3-digit shorthand and falls back', () => {
      expect(sanitizeHexColor('#fff', '#ff7a00')).toBe('#ff7a00');
    });

    it('strips dangerous characters and falls back when the result is not hex', () => {
      // Stripping non-hex chars from injection attempts leaves no valid color.
      expect(sanitizeHexColor('#8b5cf6"><script>', '#ff7a00')).toBe('#ff7a00');
      expect(sanitizeHexColor('url(javascript:alert(1))', '#ff7a00')).toBe(
        '#ff7a00',
      );
    });

    it('falls back when extra hex-like characters change the length', () => {
      // 'extra' contributes the hex chars e,a -> 8 digits -> not /{6}/.
      expect(sanitizeHexColor('#ff0000extra', '#ff7a00')).toBe('#ff7a00');
    });
  });

  describe('relativeLuminance', () => {
    it('returns 0 for black and ~1 for white', () => {
      expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
      expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
    });
  });

  describe('contrastRatio', () => {
    it('is 21:1 for black on white', () => {
      expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    });

    it('is symmetric in its arguments', () => {
      expect(contrastRatio('#ffffff', '#007aff')).toBeCloseTo(
        contrastRatio('#007aff', '#ffffff'),
        5,
      );
    });
  });

  describe('meetsWcagAA', () => {
    it('passes white text on a dark orange header', () => {
      expect(meetsWcagAA('#ffffff', '#141414')).toBe(true);
    });

    it('fails white text on a light glass header', () => {
      // The glass-light header is a near-white translucent surface, where white
      // text would be illegible -- this is exactly the case headerScheme guards.
      expect(meetsWcagAA('#ffffff', '#e6f0ff')).toBe(false);
    });
  });
});
