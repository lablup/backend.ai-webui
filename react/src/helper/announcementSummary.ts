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
  const plain = message
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
    .replace(/<[^>\n]*>/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1');
  return (
    plain
      .split(/\r?\n/)
      .map((line) =>
        line
          .replace(/^[\s#>-]+/, '')
          .replace(/^\[[ xX]\]\s*/, '')
          .trim(),
      )
      .find((line) => /[\p{L}\p{N}]/u.test(line) && !/^\|.*\|$/.test(line)) ??
    ''
  );
};

/** One-line summary for the collapsed banner title. */
export const summarizeAnnouncement = (message: string): string => {
  const firstLine = announcementFirstLine(message);
  return firstLine.length > SUMMARY_MAX_LENGTH
    ? `${firstLine.slice(0, SUMMARY_MAX_LENGTH).trimEnd()}…`
    : firstLine;
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
    /\r?\n\s*\S/.test(message.trim()) || firstLine.length > SUMMARY_MAX_LENGTH
  );
};
