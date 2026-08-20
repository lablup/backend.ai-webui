/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SUMMARY_MAX_LENGTH,
  isAnnouncementCollapsible,
  summarizeAnnouncement,
} from './announcementSummary';
import { describe, expect, it } from 'vitest';

describe('summarizeAnnouncement', () => {
  it('returns a short single line unchanged', () => {
    expect(summarizeAnnouncement('Maintenance tonight at 10pm UTC.')).toBe(
      'Maintenance tonight at 10pm UTC.',
    );
  });

  it('strips heading markers and emphasis pairs from the first line', () => {
    expect(summarizeAnnouncement('## **Scheduled** _maintenance_')).toBe(
      'Scheduled _maintenance_',
    );
  });

  it('keeps lone underscores in identifiers', () => {
    expect(summarizeAnnouncement('Set `max_session_count` to 10')).toBe(
      'Set max_session_count to 10',
    );
  });

  it('flattens link syntax to the link text', () => {
    expect(summarizeAnnouncement('See [the docs](https://example.com)')).toBe(
      'See the docs',
    );
  });

  it('skips past a leading fenced code block to the first prose line', () => {
    expect(summarizeAnnouncement('```\nsome code\n```\nReal notice')).toBe(
      'Real notice',
    );
  });

  it('swallows an unclosed fence instead of leaking backticks', () => {
    expect(summarizeAnnouncement('```\nsome code\nnever closed')).toBe('');
  });

  it('handles tilde fences', () => {
    expect(summarizeAnnouncement('~~~\ncode\n~~~\nReal notice')).toBe(
      'Real notice',
    );
  });

  it('keeps literal markers that are not paired markdown', () => {
    expect(summarizeAnnouncement('Maintenance will take ~2 hours')).toBe(
      'Maintenance will take ~2 hours',
    );
    expect(summarizeAnnouncement('Rate limit raised to 2**10 requests')).toBe(
      'Rate limit raised to 2**10 requests',
    );
  });

  it('strips HTML tags and comments', () => {
    expect(summarizeAnnouncement('<p>Notice</p>')).toBe('Notice');
    expect(summarizeAnnouncement('<!-- internal -->\nActual notice')).toBe(
      'Actual notice',
    );
  });

  it('keeps plain-text angle brackets and autolink URLs', () => {
    expect(summarizeAnnouncement('Versions 1 < 2 and 3 > 2')).toBe(
      'Versions 1 < 2 and 3 > 2',
    );
    expect(summarizeAnnouncement('See <https://example.com/notice>')).toBe(
      'See https://example.com/notice',
    );
  });

  it('truncates on code points so an emoji at the cutoff is not split', () => {
    const long = `${'a'.repeat(SUMMARY_MAX_LENGTH - 1)}🎉tail`;
    const summary = summarizeAnnouncement(long);
    expect(summary).toBe(`${'a'.repeat(SUMMARY_MAX_LENGTH - 1)}🎉…`);
    expect(summary.includes('�')).toBe(false);
  });

  it('strips list markers of every flavor', () => {
    expect(summarizeAnnouncement('* Maintenance window')).toBe(
      'Maintenance window',
    );
    expect(summarizeAnnouncement('+ Maintenance window')).toBe(
      'Maintenance window',
    );
    expect(summarizeAnnouncement('1. Maintenance window')).toBe(
      'Maintenance window',
    );
  });

  it('strips tags that reassemble across a removal pass', () => {
    expect(
      summarizeAnnouncement('<scr<b>ipt>alert</scr</b>ipt> Notice'),
    ).not.toContain('<script');
  });

  it('skips table rows and setext underlines', () => {
    expect(summarizeAnnouncement('| a | b |\n|---|---|\nProse here')).toBe(
      'Prose here',
    );
    expect(summarizeAnnouncement('Big news\n=====')).toBe('Big news');
  });

  it('truncates over-length lines with an ellipsis', () => {
    const long = 'a'.repeat(SUMMARY_MAX_LENGTH + 20);
    const summary = summarizeAnnouncement(long);
    expect(summary.endsWith('…')).toBe(true);
    expect(summary.length).toBeLessThanOrEqual(SUMMARY_MAX_LENGTH + 1);
  });
});

describe('isAnnouncementCollapsible', () => {
  it('is false for a short single-line message', () => {
    expect(isAnnouncementCollapsible('Short notice.')).toBe(false);
  });

  it('is true for a multi-line message', () => {
    expect(isAnnouncementCollapsible('Title line\n\nDetails below.')).toBe(
      true,
    );
  });

  it('is true for an over-length single line', () => {
    expect(isAnnouncementCollapsible('a'.repeat(SUMMARY_MAX_LENGTH + 1))).toBe(
      true,
    );
  });

  it('is false when no usable summary can be derived', () => {
    expect(isAnnouncementCollapsible('```\ncode only\n```')).toBe(false);
    expect(isAnnouncementCollapsible('```\nunclosed fence\nmore')).toBe(false);
    expect(isAnnouncementCollapsible('| a | b |\n|---|---|')).toBe(false);
  });

  it('is not fooled by a message that itself ends in an ellipsis', () => {
    expect(isAnnouncementCollapsible('Details to follow…')).toBe(false);
  });
});
