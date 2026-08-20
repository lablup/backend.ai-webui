/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * A long announcement collapses to a one-line summary; the cutoff keeps the
 * banner a single row on a 1280px viewport with the expand/dismiss controls.
 */
export const SUMMARY_MAX_LENGTH = 120;

/**
 * First "prose" line of the announcement as plain text. Markdown syntax is
 * stripped only where it can be done safely (paired constructs); markers used
 * literally (`my_var`, `~2 hours`, `2**10`) survive. Lines that are pure
 * syntax residue (table rows, setext underlines, a lone backtick) are skipped
 * by the requires-a-letter-or-digit filter.
 */
const announcementFirstLine = (message: string): string => {
  let plain = message
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // Paired code fences first; an UNCLOSED opening fence swallows the rest
    // (better no summary than leaking code into the title).
    .replace(/(```|~~~)[\s\S]*?\1/g, ' ')
    .replace(/(```|~~~)[\s\S]*$/, ' ')
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
    previous = plain;
    plain = plain.replace(/<\/?[a-zA-Z][a-zA-Z0-9-]*(\s[^>\n]*)?\/?>/g, '');
  } while (plain !== previous);
  plain = plain
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1');
  return (
    plain
      .split(/\r?\n/)
      .map((line) =>
        line
          // Block markers: headings, quotes, and `-`/`*`/`+` bullets…
          .replace(/^[\s#>*+-]+/, '')
          // …numbered-list markers…
          .replace(/^\d+[.)]\s+/, '')
          // …and task-list checkboxes.
          .replace(/^\[[ xX]\]\s*/, '')
          .trim(),
      )
      .find((line) => /[\p{L}\p{N}]/u.test(line) && !/^\|.*\|$/.test(line)) ??
    ''
  );
};

/**
 * One-line summary for the collapsed banner title. Truncation counts Unicode
 * code points (`Array.from`), not UTF-16 units, so an emoji at the cutoff is
 * dropped whole rather than split into a replacement character.
 */
export const summarizeAnnouncement = (message: string): string => {
  const codePoints = Array.from(announcementFirstLine(message));
  return codePoints.length > SUMMARY_MAX_LENGTH
    ? `${codePoints.slice(0, SUMMARY_MAX_LENGTH).join('').trimEnd()}…`
    : codePoints.join('');
};

/**
 * True when the summary alone loses content (multi-line or over-length) AND a
 * usable summary exists — a message whose first line strips to nothing (e.g.
 * it opens with a code block) renders in full instead of behind an empty
 * title.
 */
export const isAnnouncementCollapsible = (message: string): boolean => {
  const firstLine = announcementFirstLine(message);
  if (firstLine.length === 0) {
    return false;
  }
  return (
    /\r?\n\s*\S/.test(message.trim()) ||
    Array.from(firstLine).length > SUMMARY_MAX_LENGTH
  );
};
