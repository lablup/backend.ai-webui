/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { PersistedPanel } from './types';
import { sanitizePanels } from './useCustomPanels';

const validPanel = (id: string): PersistedPanel => ({
  id,
  panelType: 'resourceTable',
  descriptor: {
    resourceType: 'session',
    title: 'Running sessions',
    filter: null,
    order: null,
  },
});

describe('sanitizePanels', () => {
  it('returns [] for non-array values', () => {
    expect(sanitizePanels(undefined)).toEqual([]);
    expect(sanitizePanels(null)).toEqual([]);
    expect(sanitizePanels('[]')).toEqual([]);
    expect(sanitizePanels(42)).toEqual([]);
    expect(sanitizePanels({ id: 'session-1' })).toEqual([]);
  });

  it('keeps valid entries verbatim, in order', () => {
    const panels = [validPanel('session-1'), validPanel('session-2')];
    expect(sanitizePanels(panels)).toEqual(panels);
  });

  it('drops entries missing id', () => {
    const { id: _id, ...withoutId } = validPanel('session-1');
    expect(sanitizePanels([withoutId, validPanel('session-2')])).toEqual([
      validPanel('session-2'),
    ]);
  });

  it('drops entries missing panelType', () => {
    const { panelType: _panelType, ...withoutType } = validPanel('session-1');
    expect(sanitizePanels([withoutType])).toEqual([]);
  });

  it('drops entries missing descriptor.resourceType', () => {
    const noDescriptor = { id: 'session-1', panelType: 'resourceTable' };
    const emptyDescriptor = { ...validPanel('session-2'), descriptor: {} };
    expect(sanitizePanels([noDescriptor, emptyDescriptor])).toEqual([]);
  });

  it('drops null and non-object entries while keeping valid siblings', () => {
    expect(
      sanitizePanels([null, 'legacy', 7, validPanel('session-1')]),
    ).toEqual([validPanel('session-1')]);
  });
});
