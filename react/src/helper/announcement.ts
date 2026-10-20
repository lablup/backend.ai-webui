/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/** `domainConfig` sub-key holding the domain's system announcement (FR-3877). */
export const DOMAIN_ANNOUNCEMENT_CONFIG_KEY = 'announcement';

/**
 * The announcement as stored in the domain app config: a plain-text title the
 * banner shows in every state, and an optional markdown body it reveals on
 * expand. `updatedAt` keys per-session dismissal, so a re-published
 * announcement resurfaces the banner.
 */
export interface DomainAnnouncement {
  enabled: boolean;
  title: string;
  body?: string;
  updatedAt?: string;
}

/**
 * A long title collapses to one line; the cutoff keeps the banner a single row
 * on a 1280px viewport with the expand/dismiss controls.
 */
export const TITLE_MAX_LENGTH = 120;

/**
 * The title cut to one line for the collapsed banner. Truncation counts
 * Unicode code points (`Array.from`), not UTF-16 units, so an emoji at the
 * cutoff is dropped whole rather than split into a replacement character.
 */
export const summarizeAnnouncementTitle = (title: string): string => {
  const codePoints = Array.from(title.trim());
  return codePoints.length > TITLE_MAX_LENGTH
    ? `${codePoints.slice(0, TITLE_MAX_LENGTH).join('').trimEnd()}…`
    : codePoints.join('');
};

/**
 * True when expanding would reveal something the collapsed title does not
 * already show — a body, or the part of a long title the cutoff cropped.
 */
export const isAnnouncementCollapsible = (
  announcement: Pick<DomainAnnouncement, 'title' | 'body'>,
): boolean =>
  (announcement.body ?? '').trim().length > 0 ||
  Array.from(announcement.title.trim()).length > TITLE_MAX_LENGTH;

/** Something to show: enabled with a non-blank title. */
export const isAnnouncementVisible = (
  announcement: DomainAnnouncement | undefined,
): announcement is DomainAnnouncement =>
  !!announcement?.enabled && announcement.title.trim().length > 0;
