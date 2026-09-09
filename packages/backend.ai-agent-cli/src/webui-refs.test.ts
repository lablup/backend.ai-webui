import type { GitRunner } from './checkout-sync.js';
import { DATA_REPO_URL, DEFAULT_SYNC_REF } from './checkout-sync.js';
import { listWebUiTags, pickRefForManager } from './webui-refs.js';
import { describe, expect, it } from 'vitest';

const TAGS = [
  'v26.7.3',
  'v26.8.0',
  'v26.8.0-rc.0',
  'v26.8.1',
  'v26.9.0-rc.0',
  'v26.9.0-rc.3',
  'v26.9.0-rc.1',
];

describe('pickRefForManager', () => {
  it('takes the highest tag sharing the manager major.minor', () => {
    expect(pickRefForManager('26.8.1', TAGS)).toMatchObject({
      ref: 'v26.8.1',
      source: 'manager',
    });
    expect(pickRefForManager('26.8.0', TAGS).ref).toBe('v26.8.1');
    expect(pickRefForManager('26.7.0', TAGS).ref).toBe('v26.7.3');
  });

  it('ranks release candidates so a pre-release manager gets the latest rc', () => {
    expect(pickRefForManager('26.9.0rc1', TAGS).ref).toBe('v26.9.0-rc.3');
  });

  it('falls back to main when nothing matches, saying why', () => {
    const choice = pickRefForManager('27.1.0', TAGS);
    expect(choice.ref).toBe(DEFAULT_SYNC_REF);
    expect(choice.source).toBe('default');
    expect(choice.reason).toContain('v27.1.*');
    expect(pickRefForManager('garbage', TAGS).source).toBe('default');
  });

  it('matches numerically, so 24.09 and 24.9 are the same minor', () => {
    expect(pickRefForManager('24.09.1', ['v24.9.0', 'v24.9.2']).ref).toBe(
      'v24.9.2',
    );
  });
});

describe('listWebUiTags', () => {
  it('reads tag names out of git ls-remote', () => {
    const calls: string[][] = [];
    const git: GitRunner = (args) => {
      calls.push(args);
      return ['abc\trefs/tags/v26.8.1', 'def\trefs/tags/v26.9.0-rc.3', ''].join(
        '\n',
      );
    };
    expect(listWebUiTags(git)).toEqual(['v26.8.1', 'v26.9.0-rc.3']);
    expect(calls[0]).toEqual([
      'ls-remote',
      '--tags',
      '--refs',
      DATA_REPO_URL,
      'refs/tags/v*',
    ]);
  });
});
