/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { createPanel } from './defaults';
import type { PanelInput } from './types';

const input: PanelInput = {
  panelType: 'resourceTable',
  resourceType: 'session',
  title: 'Running sessions',
  filter: null,
  order: '-created_at',
};

describe('createPanel', () => {
  it('survives a JSON round-trip unchanged (localStorage persistence)', () => {
    const panel = createPanel(input);
    expect(JSON.parse(JSON.stringify(panel))).toEqual(panel);
  });

  it('generates distinct ids for two calls with identical input', () => {
    const first = createPanel(input);
    const second = createPanel(input);
    expect(first.id).not.toBe(second.id);
    // Identity aside, both carry the same descriptor.
    expect(first.descriptor).toEqual(second.descriptor);
  });
});
