import { spotlightMatchScore } from './spotlightMatch';
import { describe, expect, it } from 'vitest';

describe('spotlightMatchScore', () => {
  it('returns a positive constant for the empty query (bootstrap passthrough)', () => {
    expect(spotlightMatchScore('', 'Sessions')).toBeGreaterThan(0);
  });

  it('ranks exact > prefix > substring > subsequence on the label', () => {
    const exact = spotlightMatchScore('sessions', 'Sessions');
    const prefix = spotlightMatchScore('sess', 'Sessions');
    const substring = spotlightMatchScore('ssion', 'Sessions');
    const subsequence = spotlightMatchScore('sns', 'Sessions');
    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(substring);
    expect(substring).toBeGreaterThan(subsequence);
    expect(subsequence).toBeGreaterThan(0);
  });

  it('matches case-insensitively and trims whitespace', () => {
    expect(spotlightMatchScore('  SESS ', 'sessions')).toBeGreaterThan(0);
  });

  it('matches English keywords when the label is localized', () => {
    expect(
      spotlightMatchScore('jupyter', '새 세션 시작', ['jupyter', 'launch']),
    ).toBeGreaterThan(0);
    expect(
      spotlightMatchScore('세션', '새 세션 시작', ['jupyter']),
    ).toBeGreaterThan(0);
  });

  it('ranks a label hit above the same hit via keyword', () => {
    const viaLabel = spotlightMatchScore('data', 'Data', []);
    const viaKeyword = spotlightMatchScore('data', 'Storage', ['data']);
    expect(viaLabel).toBeGreaterThan(viaKeyword);
  });

  it('matches multi-token queries across label and keywords', () => {
    expect(
      spotlightMatchScore('session start', 'Start new session', ['launch']),
    ).toBeGreaterThan(0);
  });

  it('returns 0 for unrelated queries', () => {
    expect(spotlightMatchScore('zzz', 'Sessions', ['compute'])).toBe(0);
  });
});
