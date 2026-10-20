/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { clusterSizeIssues, computeClusterCapacity } from './cluster';

const GiB = 1024 ** 3;

describe('computeClusterCapacity (R-42)', () => {
  it.each([
    {
      name: 'the tightest slot bounds the size',
      remaining: { cpu: 8, mem: 10 * GiB, accelerators: { 'cuda.device': 3 } },
      resource: {
        cpu: 2,
        mem: '4g',
        accelerator: 1,
        acceleratorType: 'cuda.device',
      },
      maxContainers: undefined,
      expected: { maxImmediateClusterSize: 2, remainingMarkValue: 2 },
    },
    {
      name: 'the mark is clamped to max_containers_per_session',
      remaining: { cpu: 16, mem: undefined, accelerators: {} },
      resource: { cpu: 1, mem: '0g' },
      maxContainers: 4,
      expected: { maxImmediateClusterSize: 16, remainingMarkValue: 4 },
    },
    {
      name: 'nothing known remaining: no bound',
      remaining: { cpu: undefined, mem: undefined, accelerators: {} },
      resource: { cpu: 1, mem: '1g' },
      maxContainers: 4,
      expected: {
        maxImmediateClusterSize: undefined,
        remainingMarkValue: undefined,
      },
    },
    {
      name: 'zero fits: size 0 and no mark',
      remaining: { cpu: 1, mem: undefined, accelerators: {} },
      resource: { cpu: 2, mem: '1g' },
      maxContainers: undefined,
      expected: { maxImmediateClusterSize: 0, remainingMarkValue: undefined },
    },
    {
      name: 'accelerator 0 does not bound the size',
      remaining: { cpu: 4, mem: undefined, accelerators: { 'cuda.device': 0 } },
      resource: { cpu: 1, accelerator: 0, acceleratorType: 'cuda.device' },
      maxContainers: undefined,
      expected: { maxImmediateClusterSize: 4, remainingMarkValue: 4 },
    },
  ])('$name', ({ remaining, resource, maxContainers, expected }) => {
    expect(
      computeClusterCapacity({
        remaining,
        resource,
        maxContainersPerSession: maxContainers,
      }),
    ).toEqual(expected);
  });
});

describe('clusterSizeIssues (R-43)', () => {
  it.each([
    {
      mode: 'multi-node',
      size: 1,
      max: 4,
      warn: true,
      expected: { multiNodeSizeOne: true, exceedsImmediateCapacity: false },
    },
    {
      mode: 'single-node',
      size: 1,
      max: 4,
      warn: true,
      expected: { multiNodeSizeOne: false, exceedsImmediateCapacity: false },
    },
    {
      mode: 'multi-node',
      size: 5,
      max: 4,
      warn: true,
      expected: { multiNodeSizeOne: false, exceedsImmediateCapacity: true },
    },
    {
      mode: 'multi-node',
      size: 5,
      max: 4,
      warn: false,
      expected: { multiNodeSizeOne: false, exceedsImmediateCapacity: false },
    },
    {
      mode: 'single-node',
      size: 5,
      max: 0,
      warn: true,
      expected: { multiNodeSizeOne: false, exceedsImmediateCapacity: false },
    },
    {
      mode: 'single-node',
      size: 5,
      max: undefined,
      warn: true,
      expected: { multiNodeSizeOne: false, exceedsImmediateCapacity: false },
    },
  ])(
    '$mode x$size (max $max, warn $warn)',
    ({ mode, size, max, warn, expected }) => {
      expect(
        clusterSizeIssues({
          clusterMode: mode,
          clusterSize: size,
          maxImmediateClusterSize: max,
          showRemainingWarning: warn,
        }),
      ).toEqual(expected);
    },
  );
});
