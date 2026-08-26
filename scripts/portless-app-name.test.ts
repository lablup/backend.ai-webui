// @ts-nocheck
import {
  branchAppName,
  composeAppName,
  resolveAppName,
  sanitizeAppName,
  titleWord,
} from './portless-app-name.mjs';

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
      const name = sanitizeAppName('a'.repeat(49) + ' tail');
      expect(name).toHaveLength(49);
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

    it('does not touch words that merely start with fr', () => {
      expect(sanitizeAppName('frame123')).toBe('frame123');
      expect(sanitizeAppName('french75')).toBe('french75');
    });
  });

  describe('branchAppName', () => {
    it.each([
      ['FR-1234', 'fr-1234'],
      ['FR1234', 'fr-1234'],
      ['fix/FR-1234-statusline', 'fr-1234'],
      ['jongeun/FR-1234-x', 'fr-1234'],
      ['topic/fr1234-x', 'fr-1234'],
    ])('derives %s -> %s', (branch, expected) => {
      expect(branchAppName(branch)).toBe(expected);
    });

    it('returns null for a branch with no issue key', () => {
      expect(branchAppName('main')).toBeNull();
      expect(branchAppName('')).toBeNull();
    });
  });

  describe('titleWord', () => {
    it('drops the conventional-commit prefix and stop words', () => {
      expect(titleWord('fix(FR-3666): drop the Portless placeholder when no dev server belongs here'))
        .toBe('drop-portless-placeholder');
      expect(titleWord('docs: update statistics docs (2026-08-24)')).toBe('update-statistics-docs');
      expect(titleWord('feat(FR-3668): redesign scheduling-history sub-steps as a compact inline row'))
        .toBe('redesign-scheduling-history');
    });

    it('normalizes an issue key that survives into the words', () => {
      expect(titleWord('fix: bump FR1234 handling')).toBe('bump-fr-1234-handling');
    });

    it('collapses a word that punctuation-stripping doubled', () => {
      expect(titleWord('fix: normalize FR#### to fr-#### everywhere')).toBe('normalize-fr-everywhere');
    });

    it('returns null when there is no title', () => {
      expect(titleWord('')).toBeNull();
      expect(titleWord(null)).toBeNull();
      expect(titleWord('fix(FR-1): the a an of')).toBeNull();
    });
  });

  describe('composeAppName', () => {
    it('orders identifiers before the description', () => {
      expect(composeAppName({ issue: 'fr-3665', prNumber: 9049, word: 'statusline' }))
        .toBe('fr-3665-pr9049-statusline');
    });

    it('drops each part that is missing', () => {
      expect(composeAppName({ issue: 'fr-3665', word: 'statusline' })).toBe('fr-3665-statusline');
      expect(composeAppName({ prNumber: 9049, word: 'statusline' })).toBe('pr9049-statusline');
      expect(composeAppName({ issue: 'fr-3665' })).toBe('fr-3665');
      expect(composeAppName({ word: 'statusline' })).toBe('statusline');
      expect(composeAppName({})).toBeNull();
    });

    it('does not repeat an identifier the description already carries', () => {
      expect(composeAppName({ issue: 'fr-3665', prNumber: 9049, word: 'fr-3665' }))
        .toBe('fr-3665-pr9049');
      expect(composeAppName({ issue: 'fr-3665', prNumber: 9049, word: 'fr-3665-statusline' }))
        .toBe('fr-3665-pr9049-statusline');
      expect(composeAppName({ issue: 'fr-3665', prNumber: 9049, word: 'pr9049' }))
        .toBe('fr-3665-pr9049');
    });

    it('truncates only the description, never the identifiers', () => {
      const name = composeAppName({ issue: 'fr-3665', prNumber: 9049, word: 'x'.repeat(80) });
      expect(name.startsWith('fr-3665-pr9049-')).toBe(true);
      expect(name.length).toBeLessThanOrEqual(50);
    });
  });

  describe('resolveAppName', () => {
    const pr = { number: 9049, title: 'fix(FR-3665): normalize FR#### to fr-#### everywhere' };

    it('prefers a human word over the PR title', () => {
      expect(resolveAppName({ envName: 'statusline', branch: 'fix/FR-3665-x', pr }))
        .toBe('fr-3665-pr9049-statusline');
    });

    it('falls back to the PR title when nobody named it', () => {
      expect(resolveAppName({ branch: 'fix/FR-3665-x', pr }))
        .toBe('fr-3665-pr9049-normalize-fr-everywhere');
    });

    it('omits the PR part before a PR exists', () => {
      expect(resolveAppName({ envName: 'statusline', branch: 'fix/FR-3665-x' }))
        .toBe('fr-3665-statusline');
    });

    it('still normalizes an issue key on the human path (FR-3665)', () => {
      expect(resolveAppName({ envName: 'FR1234', branch: 'main' })).toBe('fr-1234');
      expect(resolveAppName({ branch: 'FR1234' })).toBe('fr-1234');
    });

    it('does not duplicate identifiers a caller passed in', () => {
      expect(resolveAppName({ envName: 'fr-3665', branch: 'fix/FR-3665-x', pr }))
        .toBe('fr-3665-pr9049');
    });

    it('returns the name verbatim when the caller owns the hostname', () => {
      expect(resolveAppName({ envName: 'v26-4-8-rc-3', branch: 'fix/FR-3665-x', pr, exact: true }))
        .toBe('v26-4-8-rc-3');
    });

    it('returns null so the caller can let portless auto-derive', () => {
      expect(resolveAppName({ envName: '', branch: 'main' })).toBeNull();
      expect(resolveAppName()).toBeNull();
    });
  });
});
