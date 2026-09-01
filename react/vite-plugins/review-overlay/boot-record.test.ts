import { servedEntry } from './boot-record.js';
import { describe, expect, it } from 'vitest';

/**
 * `advertise.sh` writes `served[]` BOTTOM-FIRST — `served_from_stack` slices
 * `gh stack view`'s bottom-first branch list up to and including the current
 * branch, and its own `running_pr()` reads `jq last`. Picking `served[0]`
 * therefore names the bottom of the stack, not the layer being served.
 */
describe('servedEntry', () => {
  const stack = {
    schemaVersion: 1,
    branch: 'feat/FR-3811-top',
    served: [
      { pr: 9320, branch: 'feat/FR-3803-bottom' },
      { pr: 9321, branch: 'feat/FR-3804-middle' },
      { pr: 9337, branch: 'feat/FR-3811-top' },
    ],
  };

  it('matches the checked-out branch', () => {
    expect(servedEntry(stack, 'feat/FR-3804-middle')?.pr).toBe(9321);
  });

  it('falls back to the LAST entry when no branch is known at all', () => {
    // No git branch and no `branch` on the record: nothing to match, so the
    // bottom-first rule stands and the last entry is the running layer.
    const { branch: _unused, ...headless } = stack;
    expect(servedEntry(headless, null)?.pr).toBe(9337);
  });

  it('claims nothing when the record does not name the branch we are on', () => {
    // A record from another checkout: attributing blocks to its last PR would
    // be worse than none. `discoverState()` falls through to `gh pr list`.
    expect(servedEntry(stack, 'some-other-branch')).toBeUndefined();
  });

  it('uses the record’s own branch when git could not answer', () => {
    expect(
      servedEntry({ ...stack, branch: 'feat/FR-3803-bottom' }, null)?.pr,
    ).toBe(9320);
  });

  it('ignores entries without a pr', () => {
    expect(
      servedEntry(
        { schemaVersion: 1, served: [{ branch: 'b' }, { pr: 1, branch: 'b' }] },
        'b',
      )?.pr,
    ).toBe(1);
  });

  it('returns undefined for a missing or empty record', () => {
    expect(servedEntry(null, 'a')).toBeUndefined();
    expect(servedEntry({ schemaVersion: 1, served: [] }, 'a')).toBeUndefined();
    expect(servedEntry({ schemaVersion: 1 }, 'a')).toBeUndefined();
  });
});
