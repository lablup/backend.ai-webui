/**
 * The overlay's one HTML escape. Everything it is handed is page text, a
 * reviewer's words, or a stop's prose off a pasted link — the block renderer,
 * the navigator and the popover all build markup by hand, and three copies of
 * this is three places for one of them to be forgotten.
 */
export const esc = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
