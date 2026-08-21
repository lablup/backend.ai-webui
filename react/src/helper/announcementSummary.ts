/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * A long announcement collapses to a one-line summary; the cutoff keeps the
 * banner a single row on a 1280px viewport with the expand/dismiss controls.
 */
export const SUMMARY_MAX_LENGTH = 120;

/** Replaces a match with blank lines, so source line indices survive masking. */
const blankOut = (match: string): string => match.replace(/[^\n]/g, '');

/**
 * The source split into lines with comments and fenced code blanked out. An
 * UNCLOSED opening fence swallows the rest: better no headline than one lifted
 * out of a code block.
 */
const maskedLines = (message: string): Array<string> =>
  message
    .replace(/<!--[\s\S]*?-->/g, blankOut)
    .replace(/(```|~~~)[\s\S]*?\1/g, blankOut)
    .replace(/(```|~~~)[\s\S]*$/, blankOut)
    .split(/\r?\n/);

/**
 * One source line as plain text. Markdown is stripped only where it can be
 * done safely (paired constructs); markers used literally (`my_var`,
 * `~2 hours`, `2**10`) survive.
 */
const toProse = (line: string): string => {
  let text = line
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
    .replace(/\[\^[^\]]*\]/g, '')
    // Markdown autolinks keep their URL text; only real HTML tags (a tag name,
    // then either `>` or whitespace-separated attributes) are dropped, so
    // plain-text `1 < 2 and 3 > 2` survives. The output is rendered as a React
    // text node (Banner title) — this is display cleanup, not an HTML
    // sanitizer.
    .replace(/<(https?:\/\/[^>\s]+)>/g, '$1');
  // Strip tags to a fixpoint so text reassembled by a removal (`<scr<b>ipt>`)
  // cannot survive a single pass (CodeQL
  // js/incomplete-multi-character-sanitization).
  let previous;
  do {
    previous = text;
    text = text.replace(/<\/?[a-zA-Z][a-zA-Z0-9-]*(\s[^>\n]*)?\/?>/g, '');
  } while (text !== previous);
  return (
    text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      // Block markers: headings, quotes, `-`/`*`/`+` bullets, numbered-list
      // markers and task-list checkboxes.
      .replace(/^[\s#>*+-]+/, '')
      .replace(/^\d+[.)]\s+/, '')
      .replace(/^\[[ xX]\]\s*/, '')
      .trim()
  );
};

/** Lines that are pure syntax residue (table rows, setext rules) are not prose. */
const isProse = (text: string): boolean =>
  /[\p{L}\p{N}]/u.test(text) && !/^\|.*\|$/.test(text);

/** Index of the source line the headline comes from, or -1. */
const findHeadlineIndex = (message: string): number =>
  maskedLines(message).findIndex((line) => isProse(toProse(line)));

export interface AnnouncementParts {
  /**
   * The announcement's first prose line as plain text, NOT truncated — the
   * banner uses it as the title.
   */
  headline: string;
  /**
   * The source markdown with the headline's own line removed, so expanding
   * adds only what the title does not already show. Empty when the headline
   * was the whole announcement.
   */
  body: string;
}

/**
 * Splits an announcement into its title line and the rest of the source.
 *
 * The body is the ORIGINAL markdown minus exactly one line, located by index
 * rather than by matching the stripped text back onto the source — so
 * headings, list items and links keep rendering the way the author wrote
 * them, and nothing but the title line can go missing.
 */
export const splitAnnouncement = (message: string): AnnouncementParts => {
  const index = findHeadlineIndex(message);
  if (index < 0) {
    return { headline: '', body: message };
  }
  const rest = message.split(/\r?\n/);
  const headline = toProse(maskedLines(message)[index]);
  rest.splice(index, 1);
  return {
    headline,
    body: rest
      .join('\n')
      .replace(/^\s*\n/, '')
      .trimEnd(),
  };
};

/**
 * The headline, cut to one line for the collapsed banner title. Truncation
 * counts Unicode code points (`Array.from`), not UTF-16 units, so an emoji at
 * the cutoff is dropped whole rather than split into a replacement character.
 */
export const summarizeAnnouncement = (message: string): string => {
  const codePoints = Array.from(splitAnnouncement(message).headline);
  return codePoints.length > SUMMARY_MAX_LENGTH
    ? `${codePoints.slice(0, SUMMARY_MAX_LENGTH).join('').trimEnd()}…`
    : codePoints.join('');
};

/**
 * True when expanding would reveal something the collapsed title does not
 * already show — either more content below it, or the part of a long headline
 * the cutoff cropped. An announcement with no usable headline (it opens with
 * a code block, say) renders in full instead of behind an empty title.
 */
export const isAnnouncementCollapsible = (message: string): boolean => {
  const { headline, body } = splitAnnouncement(message);
  if (headline.length === 0) {
    return false;
  }
  return (
    body.trim().length > 0 || Array.from(headline).length > SUMMARY_MAX_LENGTH
  );
};
