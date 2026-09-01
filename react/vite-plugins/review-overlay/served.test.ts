import { dropClosed, servedPrs } from './served.js';
import { describe, expect, it } from 'vitest';

const stack = {
  schemaVersion: 1,
  branch: 'feat/FR-3813-top',
  served: [
    { pr: 9320, branch: 'feat/FR-3803-bottom' },
    { pr: 9321, branch: 'feat/FR-3804-middle' },
    { pr: 9354, branch: 'feat/FR-3813-top' },
  ],
};

describe('servedPrs', () => {
  it('serves the whole stack, bottom-first, when the record names our branch', () => {
    expect(servedPrs(stack, 'feat/FR-3813-top')).toEqual([
      { pr: 9320, branch: 'feat/FR-3803-bottom' },
      { pr: 9321, branch: 'feat/FR-3804-middle' },
      { pr: 9354, branch: 'feat/FR-3813-top' },
    ]);
  });

  it('serves a middle layer’s record the same way — the file already sliced it', () => {
    expect(servedPrs(stack, 'feat/FR-3804-middle').map((e) => e.pr)).toEqual([
      9320, 9321, 9354,
    ]);
  });

  // Same rule as `servedEntry`: a record from another checkout claims nothing,
  // and the caller falls back to `gh pr list --head`.
  it('claims nothing when the record does not name the branch we are on', () => {
    expect(servedPrs(stack, 'some-other-branch')).toEqual([]);
  });

  it('claims nothing without a record', () => {
    expect(servedPrs(null, 'feat/FR-3813-top')).toEqual([]);
  });

  it('falls back to the record’s own branch when git could not answer', () => {
    expect(servedPrs(stack, null).map((e) => e.pr)).toEqual([9320, 9321, 9354]);
  });

  it('ignores entries with no PR', () => {
    expect(
      servedPrs(
        { schemaVersion: 1, served: [{ branch: 'b' }, { pr: 7, branch: 'b' }] },
        'b',
      ),
    ).toEqual([{ pr: 7, branch: 'b' }]);
  });
});

describe('dropClosed', () => {
  const served = [
    { pr: 9320, branch: 'bottom' },
    { pr: 9354, branch: 'top' },
  ];

  it('drops a layer that merged while the server was running', () => {
    expect(
      dropClosed(served, [
        { pr: 9320, state: 'MERGED' },
        { pr: 9354, state: 'OPEN' },
      ]),
    ).toEqual([{ pr: 9354, branch: 'top' }]);
  });

  it('drops a closed layer too', () => {
    expect(
      dropClosed(served, [{ pr: 9320, state: 'CLOSED' }]).map((e) => e.pr),
    ).toEqual([9354]);
  });

  it('keeps a PR the poll could not read — a failed fetch is not a merge', () => {
    expect(dropClosed(served, [{ pr: 9320, state: null }])).toEqual(served);
  });
});
