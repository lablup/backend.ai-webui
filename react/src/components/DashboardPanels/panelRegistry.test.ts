/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { availablePanelTypes, effectivePanelType } from './panelRegistry';
import type { PersistedPanel, ResourceKey } from './types';

describe('availablePanelTypes', () => {
  it('offers all three kinds for session when the grid flag is on', () => {
    expect(availablePanelTypes('session', { gridEnabled: true })).toEqual([
      'resourceTable',
      'resourceCount',
      'sessionResourceGrid',
    ]);
  });

  it('offers only table+count for session when the grid flag is off', () => {
    expect(availablePanelTypes('session', { gridEnabled: false })).toEqual([
      'resourceTable',
      'resourceCount',
    ]);
  });

  it.each<ResourceKey>(['deployment', 'vfolder'])(
    'never offers the grid kind for %s, regardless of the flag',
    (resourceType) => {
      expect(availablePanelTypes(resourceType, { gridEnabled: true })).toEqual([
        'resourceTable',
        'resourceCount',
      ]);
      expect(availablePanelTypes(resourceType, { gridEnabled: false })).toEqual(
        ['resourceTable', 'resourceCount'],
      );
    },
  );

  it('forcePanelType offers the grid for session even with the flag off', () => {
    expect(
      availablePanelTypes('session', {
        gridEnabled: false,
        forcePanelType: 'sessionResourceGrid',
      }),
    ).toEqual(['resourceTable', 'resourceCount', 'sessionResourceGrid']);
  });

  it.each<ResourceKey>(['deployment', 'vfolder'])(
    'forcePanelType does not offer the grid for %s',
    (resourceType) => {
      expect(
        availablePanelTypes(resourceType, {
          gridEnabled: false,
          forcePanelType: 'sessionResourceGrid',
        }),
      ).toEqual(['resourceTable', 'resourceCount']);
    },
  );

  it('always includes table+count in stable order, for every resource/flag combo', () => {
    const resourceTypes: Array<ResourceKey> = [
      'session',
      'deployment',
      'vfolder',
    ];
    for (const resourceType of resourceTypes) {
      for (const gridEnabled of [true, false]) {
        const types = availablePanelTypes(resourceType, { gridEnabled });
        expect(types.slice(0, 2)).toEqual(['resourceTable', 'resourceCount']);
      }
    }
  });
});

describe('effectivePanelType', () => {
  it('falls back a grid panel to the table when the flag is off', () => {
    const panel: Pick<PersistedPanel, 'panelType'> = {
      panelType: 'sessionResourceGrid',
    };
    expect(effectivePanelType(panel, { gridEnabled: false })).toBe(
      'resourceTable',
    );
  });

  it('renders a grid panel as the grid when the flag is on', () => {
    const panel: Pick<PersistedPanel, 'panelType'> = {
      panelType: 'sessionResourceGrid',
    };
    expect(effectivePanelType(panel, { gridEnabled: true })).toBe(
      'sessionResourceGrid',
    );
  });

  it.each<Pick<PersistedPanel, 'panelType'>['panelType']>([
    'resourceTable',
    'resourceCount',
  ])('returns %s unchanged regardless of the flag', (panelType) => {
    expect(effectivePanelType({ panelType }, { gridEnabled: false })).toBe(
      panelType,
    );
    expect(effectivePanelType({ panelType }, { gridEnabled: true })).toBe(
      panelType,
    );
  });

  it('does not mutate the input panel object', () => {
    const panel: Pick<PersistedPanel, 'panelType'> = {
      panelType: 'sessionResourceGrid',
    };
    const frozen = Object.freeze({ ...panel });
    effectivePanelType(frozen, { gridEnabled: false });
    expect(frozen.panelType).toBe('sessionResourceGrid');
  });
});
