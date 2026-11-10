/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { buildManualBaseURL, HOSTED_MANUAL_ROOT } from './useHelpURL';
import { describe, expect, it } from 'vitest';

describe('buildManualBaseURL', () => {
  it('opens the hosted manual when no manual URL is set', () => {
    expect(buildManualBaseURL('', '26.10.1', 'ko')).toBe(
      `${HOSTED_MANUAL_ROOT}/26.10/ko/`,
    );
  });

  it('uses the next channel for a prerelease and English for other languages', () => {
    expect(buildManualBaseURL('', '26.11.0-alpha.1', 'de')).toBe(
      `${HOSTED_MANUAL_ROOT}/next/en/`,
    );
  });

  it('replaces the root with the configured mirror', () => {
    expect(
      buildManualBaseURL(' https://docs.example.com/manual/ ', '26.10.1', 'ja'),
    ).toBe('https://docs.example.com/manual/26.10/ja/');
  });

  it('ignores a value that is not an http(s) URL', () => {
    expect(buildManualBaseURL('docs.example.com', '26.10.1', 'en')).toBe(
      `${HOSTED_MANUAL_ROOT}/26.10/en/`,
    );
    expect(buildManualBaseURL('javascript:alert(1)', '26.10.1', 'en')).toBe(
      `${HOSTED_MANUAL_ROOT}/26.10/en/`,
    );
  });
});
