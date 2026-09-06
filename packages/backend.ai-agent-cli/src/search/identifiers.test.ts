import {
  identifierTokens,
  normaliseIdentifier,
  normaliseIdentifierQuery,
  reduceIdentifier,
} from './identifiers.js';
import { describe, expect, it } from 'vitest';

describe('identifierTokens', () => {
  it.each([
    ['ComputeSessionNode', ['compute', 'session', 'node']],
    ['scaling_group', ['scaling', 'group']],
    [
      'maxPendingSessionResourceSlots',
      ['max', 'pending', 'session', 'resource', 'slots'],
    ],
    ['KeypairResourcePolicyV2', ['keypair', 'resource', 'policy', 'v2']],
    ['KeyPairResourcePolicy', ['key', 'pair', 'resource', 'policy']],
    ['GPUAlloc', ['gpu', 'alloc']],
    ['RUNNING', ['running']],
  ])('splits %s', (name, tokens) => {
    expect(identifierTokens(name)).toEqual(tokens);
  });
});

describe('spelling-independent keys', () => {
  it('folds camel, Pascal and snake onto one key', () => {
    const key = 'scaling group';
    expect(normaliseIdentifier('ScalingGroup')).toBe(key);
    expect(normaliseIdentifier('scalingGroup')).toBe(key);
    expect(normaliseIdentifier('scaling_group')).toBe(key);
    expect(normaliseIdentifierQuery('Scaling Group')).toBe(key);
    expect(normaliseIdentifierQuery('scaling_group')).toBe(key);
    expect(normaliseIdentifierQuery('ComputeSessionNode.status')).toBe(
      'compute session node status',
    );
  });
});

describe('reduceIdentifier', () => {
  it('keeps short identifiers whole', () => {
    expect(reduceIdentifier('ComputeSessionNode')).toEqual([
      'compute',
      'session',
      'node',
    ]);
  });

  it('matches a long identifier on its last two tokens', () => {
    expect(reduceIdentifier('admin_keypair_resource_policies_v2')).toEqual([
      'resource',
      'policies',
      'v2',
    ]);
    expect(reduceIdentifier('KeypairResourcePolicyV2Filter')).toEqual([
      'v2',
      'filter',
    ]);
  });

  it('does not count a trailing version token towards the length', () => {
    expect(reduceIdentifier('KeypairResourcePolicyV2')).toEqual([
      'keypair',
      'resource',
      'policy',
      'v2',
    ]);
  });
});
