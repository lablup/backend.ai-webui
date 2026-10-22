/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// A two-slice model for engine tests; no real launcher rules.
import { compose } from '../compose';
import { getIn } from '../path';
import { defineSlice } from '../slice';
import type { Loadable, PatchWrite, Rule } from '../types';

export const WRITE: PatchWrite = { method: 'setFieldsValue' };

export const CPU = ['size', 'cpu'];
export const MEM = ['size', 'mem'];
export const SHMEM = ['size', 'shmem'];
export const KIND = ['mode', 'kind'];

export const sizeSlice = defineSlice({
  name: 'size',
  fields: [CPU, MEM, SHMEM],
  inputs: { limits: 'required' },
  intents: {
    cpuEdited: (_values, value: number) => [
      { path: CPU, value, policy: 'force', reason: '', write: WRITE },
    ],
    memEdited: (_values, value: string) => [
      { path: MEM, value, policy: 'force', reason: '', write: WRITE },
    ],
  },
  rules: [
    {
      id: 'S-01',
      reads: [CPU],
      writes: [CPU],
      needs: ['limits'],
      run: ({ values, inputs }) =>
        Number(getIn(values, CPU)) > inputs.limits.maxCpu
          ? [
              {
                path: CPU,
                value: inputs.limits.maxCpu,
                policy: 'force',
                reason: 'test.CpuCapped',
                write: { method: 'setFieldValue', validateAfter: [CPU] },
              },
            ]
          : [],
    } satisfies Rule<{ limits: { maxCpu: number } }>,
    {
      id: 'S-02',
      reads: [MEM],
      writes: [SHMEM],
      run: ({ values }) => [
        {
          path: SHMEM,
          value: getIn(values, MEM) === '8g' ? '1g' : '64m',
          policy: 'force',
          reason: 'test.ShmemFollowsMem',
          write: WRITE,
        },
      ],
    },
  ],
});

export const modeSlice = defineSlice({
  name: 'mode',
  fields: [KIND],
  inputs: { hint: 'optional' },
  intents: {
    kindSelected: (_values, value: string) => [
      { path: KIND, value, policy: 'force', reason: '', write: WRITE },
    ],
  },
  rules: [
    {
      id: 'M-01',
      reads: [],
      writes: [KIND],
      needs: ['hint'],
      run: ({ inputs }) => [
        {
          path: KIND,
          value: inputs.hint,
          policy: 'unless-user-set',
          reason: 'test.KindFromHint',
          write: WRITE,
        },
      ],
    } satisfies Rule<{ hint: string }>,
  ],
});

/** X-01: a `big` kind raises cpu to at least 4. */
export const bigKindRaisesCpu: Rule = {
  id: 'X-01',
  reads: [KIND, CPU],
  writes: [CPU],
  run: ({ values }) =>
    getIn(values, KIND) === 'big'
      ? [
          {
            path: CPU,
            value: 4,
            policy: 'raise-only',
            reason: 'test.BigKindNeedsCpu',
            write: WRITE,
          },
        ]
      : [],
};

export const syntheticModel = compose([sizeSlice, modeSlice], {
  crossRules: [bigKindRaisesCpu],
});

export const ready = <T>(value: T): Loadable<T> => ({ status: 'ready', value });
export const loading: Loadable<never> = { status: 'loading' };
