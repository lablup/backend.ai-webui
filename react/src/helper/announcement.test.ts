/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  TITLE_MAX_LENGTH,
  isAnnouncementCollapsible,
  isAnnouncementVisible,
  summarizeAnnouncementTitle,
  readDomainAnnouncement,
  withAnnouncement,
} from './announcement';
import { describe, expect, it } from 'vitest';

describe('summarizeAnnouncementTitle', () => {
  it('returns a short title unchanged', () => {
    expect(summarizeAnnouncementTitle('Maintenance tonight at 10pm UTC.')).toBe(
      'Maintenance tonight at 10pm UTC.',
    );
  });

  it('trims surrounding whitespace', () => {
    expect(summarizeAnnouncementTitle('  Notice \n')).toBe('Notice');
  });

  it('truncates on code points so an emoji at the cutoff is not split', () => {
    const long = `${'a'.repeat(TITLE_MAX_LENGTH - 1)}🎉tail`;
    const summary = summarizeAnnouncementTitle(long);
    expect(summary).toBe(`${'a'.repeat(TITLE_MAX_LENGTH - 1)}🎉…`);
    expect(summary).not.toContain('�');
  });

  it('drops trailing whitespace before the ellipsis', () => {
    const long = `${'a'.repeat(TITLE_MAX_LENGTH - 1)} b c`;
    expect(summarizeAnnouncementTitle(long)).toBe(
      `${'a'.repeat(TITLE_MAX_LENGTH - 1)}…`,
    );
  });
});

describe('isAnnouncementCollapsible', () => {
  it('is false for a short title with no body', () => {
    expect(isAnnouncementCollapsible({ title: 'Notice' })).toBe(false);
    expect(isAnnouncementCollapsible({ title: 'Notice', body: '  \n' })).toBe(
      false,
    );
  });

  it('is true when there is a body to reveal', () => {
    expect(
      isAnnouncementCollapsible({ title: 'Notice', body: 'Details **here**' }),
    ).toBe(true);
  });

  it('is true when the title alone exceeds the cutoff', () => {
    expect(
      isAnnouncementCollapsible({ title: 'a'.repeat(TITLE_MAX_LENGTH + 1) }),
    ).toBe(true);
  });
});

describe('isAnnouncementVisible', () => {
  it('requires the announcement to be enabled with a non-blank title', () => {
    expect(isAnnouncementVisible(undefined)).toBe(false);
    expect(isAnnouncementVisible({ enabled: false, title: 'Notice' })).toBe(
      false,
    );
    expect(isAnnouncementVisible({ enabled: true, title: '   ' })).toBe(false);
    expect(isAnnouncementVisible({ enabled: true, title: 'Notice' })).toBe(
      true,
    );
  });
});

describe('readDomainAnnouncement', () => {
  const announcement = { enabled: true, title: 'hi' };
  it('reads the announcement of a settings document', () => {
    expect(readDomainAnnouncement({ announcement, hideAgents: true })).toEqual(
      announcement,
    );
  });
  it('is undefined for a missing or malformed value', () => {
    expect(readDomainAnnouncement(undefined)).toBeUndefined();
    expect(readDomainAnnouncement({ announcement: 'x' })).toBeUndefined();
    expect(readDomainAnnouncement({ announcement: [] })).toBeUndefined();
  });
});

describe('withAnnouncement', () => {
  const announcement = { enabled: true, title: 'hi' };
  it('sets the announcement and keeps the other keys', () => {
    expect(withAnnouncement({ hideAgents: true }, announcement)).toEqual({
      hideAgents: true,
      announcement,
    });
  });
  it('removes the sub-key when the announcement was the only key', () => {
    expect(withAnnouncement({ announcement }, undefined)).toBeUndefined();
    expect(withAnnouncement(undefined, undefined)).toBeUndefined();
    expect(
      withAnnouncement({ announcement, hideAgents: true }, undefined),
    ).toEqual({ hideAgents: true });
  });
});
