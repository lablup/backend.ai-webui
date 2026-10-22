/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { compose } from './compose';
import { getIn } from './path';
import { defineSlice } from './slice';
import { syntheticModel, WRITE } from './testing/syntheticModel';
import { transition } from './transition';
import type { LauncherEvent, Rule } from './types';
import { describe, expect, it } from 'vitest';

const VALUE = ['chain', 'value'];

const chainModel = (rules: Rule[]) =>
  compose([
    defineSlice({
      name: 'chain',
      fields: [VALUE],
      inputs: {},
      intents: { poked: () => [] },
      rules,
    }),
  ]);

const empty = { values: {}, provenance: {} };

describe('rule order', () => {
  it('runs slice rules in slice order, then cross rules', () => {
    expect(syntheticModel.rules.map((rule) => rule.id)).toEqual([
      'S-01',
      'S-02',
      'M-01',
      'X-01',
    ]);
  });

  it('lets a later rule see an earlier rule’s write within one pass', () => {
    const seen: string[] = [];
    const step = (id: string, from: unknown, to: string): Rule => ({
      id,
      reads: [VALUE],
      writes: [VALUE],
      run: ({ values }) => {
        seen.push(`${id}:${String(getIn(values, VALUE))}`);
        return getIn(values, VALUE) === from
          ? [
              {
                path: VALUE,
                value: to,
                policy: 'force',
                reason: '',
                write: WRITE,
              },
            ]
          : [];
      },
    });
    const { state, patches } = transition(
      chainModel([step('C-01', undefined, 'a'), step('C-02', 'a', 'b')]),
      empty,
      { type: 'dataArrived', keys: [] },
      {},
    );

    expect(getIn(state.values, VALUE)).toBe('b');
    expect(patches.map((p) => p.provenance)).toEqual([
      'rule:C-01',
      'rule:C-02',
    ]);
    // Pass 1 applies two patches, pass 2 applies none and ends the loop.
    expect(seen).toEqual(['C-01:undefined', 'C-02:a', 'C-01:b', 'C-02:b']);
  });

  it('runs every rule on every event and hands it the event', () => {
    const events: LauncherEvent[] = [];
    const model = chainModel([
      {
        id: 'E-01',
        reads: [],
        writes: [VALUE],
        run: ({ event }) => {
          events.push(event);
          return [];
        },
      },
    ]);
    const sent: LauncherEvent[] = [
      { type: 'poked', payload: 1 },
      { type: 'dataArrived', keys: ['unrelated'] },
      { type: 'restored', from: 'reset', values: {} },
    ];
    for (const event of sent) transition(model, empty, event, {});
    expect(events).toEqual(sent);
  });
});
