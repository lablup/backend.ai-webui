// @ts-nocheck
import { branchAppName, resolveAppName, sanitizeAppName } from './portless-app-name.mjs';

describe('portless app name', () => {
  describe('sanitizeAppName', () => {
    it('lowercases and slugifies', () => {
      expect(sanitizeAppName('My Feature')).toBe('my-feature');
    });

    it('collapses runs and trims separators', () => {
      expect(sanitizeAppName('  --a///b--  ')).toBe('a-b');
    });

    it('returns null when nothing usable survives', () => {
      expect(sanitizeAppName('상태바')).toBeNull();
      expect(sanitizeAppName('')).toBeNull();
      expect(sanitizeAppName(null)).toBeNull();
      expect(sanitizeAppName(undefined)).toBeNull();
    });

    it('caps the length without leaving a trailing dash', () => {
      const name = sanitizeAppName('a'.repeat(39) + ' tail');
      expect(name).toHaveLength(39);
      expect(name.endsWith('-')).toBe(false);
    });

    // FR-3665: this path skipped the normalization, so a name that reached it
    // without the dash produced fr1234.localhost instead of fr-1234.localhost.
    it('normalizes an issue key that arrives without its dash', () => {
      expect(sanitizeAppName('FR1234')).toBe('fr-1234');
      expect(sanitizeAppName('fr1234')).toBe('fr-1234');
    });

    it('leaves an issue key that already has its dash alone', () => {
      expect(sanitizeAppName('FR-1234')).toBe('fr-1234');
    });

    it('normalizes an issue key embedded in a longer name', () => {
      expect(sanitizeAppName('FR1234 statusline')).toBe('fr-1234-statusline');
      expect(sanitizeAppName('review fr1234')).toBe('review-fr-1234');
    });

    it('does not touch words that merely start with fr', () => {
      expect(sanitizeAppName('frame123')).toBe('frame123');
      expect(sanitizeAppName('french75')).toBe('french75');
    });
  });

  describe('branchAppName', () => {
    it.each([
      ['FR-1234', 'fr-1234'],
      ['fr-1234', 'fr-1234'],
      ['FR1234', 'fr-1234'],
      ['fix/FR-1234-statusline', 'fr-1234'],
      ['feat/FR-1234', 'fr-1234'],
      ['jongeun/FR-1234-x', 'fr-1234'],
      ['FR-1234_x', 'fr-1234'],
      ['topic/fr1234-x', 'fr-1234'],
    ])('derives %s -> %s', (branch, expected) => {
      expect(branchAppName(branch)).toBe(expected);
    });

    it('returns null for a branch with no issue key', () => {
      expect(branchAppName('main')).toBeNull();
      expect(branchAppName('')).toBeNull();
    });
  });

  describe('resolveAppName', () => {
    it('prefers an explicit name over the branch', () => {
      expect(resolveAppName({ envName: 'my-preview', branch: 'fix/FR-1234-x' })).toBe('my-preview');
    });

    it('normalizes the explicit name the same way as the branch one', () => {
      const branch = resolveAppName({ branch: 'FR1234' });
      const explicit = resolveAppName({ envName: 'FR1234', branch: 'main' });
      expect(explicit).toBe(branch);
      expect(explicit).toBe('fr-1234');
    });

    it('falls back to the branch when the explicit name slugifies away', () => {
      expect(resolveAppName({ envName: '상태바 개선', branch: 'fix/FR-1234-x' })).toBe('fr-1234');
    });

    it('returns null so the caller can let portless auto-derive', () => {
      expect(resolveAppName({ envName: '', branch: 'main' })).toBeNull();
      expect(resolveAppName()).toBeNull();
    });
  });
});
