/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * Security + accessibility helpers for user-supplied theme colors.
 *
 * Ported (dependency-free) from backend.ai-dol's `color-sanitizer`. The original
 * double-checks with the `colord` library; webui does not depend on `colord`,
 * and the regex validation below already guarantees a canonical `#rrggbb`
 * string, so the extra library pass is unnecessary.
 */

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/**
 * Validates and normalizes a 6-digit hex color, returning `fallback` when the
 * input is missing or not a safe hex value. Any character outside
 * `#0-9a-fA-F` is stripped first, so injected markup / CSS cannot survive into
 * the returned value.
 *
 * @param color - untrusted color value (e.g. from a color picker or storage)
 * @param fallback - safe color to use when validation fails
 * @returns a lower-cased `#rrggbb` string
 */
export function sanitizeHexColor(
  color: string | null | undefined,
  fallback: string,
): string {
  if (!color) {
    return fallback;
  }
  const cleaned = color.replace(/[^#0-9a-fA-F]/g, '');
  if (!HEX_COLOR_PATTERN.test(cleaned)) {
    return fallback;
  }
  return cleaned.toLowerCase();
}

/**
 * Relative luminance of a 6-digit hex color per WCAG 2.1, in the range [0, 1].
 * Assumes a sanitized `#rrggbb` input.
 */
export function relativeLuminance(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * WCAG contrast ratio between two hex colors, in the range [1, 21].
 */
export function contrastRatio(foreground: string, background: string): number {
  const lum1 = relativeLuminance(foreground);
  const lum2 = relativeLuminance(background);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Whether `foreground` on `background` meets WCAG AA for normal-size text
 * (contrast ratio >= 4.5:1).
 */
export function meetsWcagAA(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= 4.5;
}
