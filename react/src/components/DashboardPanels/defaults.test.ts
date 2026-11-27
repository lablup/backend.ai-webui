/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DEFAULT_SESSION_GRID_VIEW } from '../../helper/sessionResourceGridData';
import { DEFAULT_PANEL_LAYOUTS, createPanel } from './defaults';
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
    const { id: _first, ...firstConfig } = first;
    const { id: _second, ...secondConfig } = second;
    expect(firstConfig).toEqual(secondConfig);
  });

  it('keys the panel by its data source preset', () => {
    expect(createPanel(input).key).toBe('resource.session');
    expect(createPanel({ ...input, resourceType: 'deployment' }).key).toBe(
      'resource.deployment',
    );
  });

  it('maps the panel kind to a viz', () => {
    expect(createPanel(input).viz).toBe('table');
    expect(createPanel({ ...input, panelType: 'resourceCount' }).viz).toBe(
      'stat',
    );
    expect(
      createPanel({ ...input, panelType: 'sessionResourceGrid' }).viz,
    ).toBe('grid');
  });

  it('seeds the size from the kind', () => {
    const table = createPanel(input);
    expect([table.columnSpan, table.rowSpan]).toEqual([2, 3]);
    const count = createPanel({ ...input, panelType: 'resourceCount' });
    expect([count.columnSpan, count.rowSpan]).toEqual([1, 2]);
  });

  it('populates gridView with the default only for sessionResourceGrid panels', () => {
    const grid = createPanel({ ...input, panelType: 'sessionResourceGrid' });
    expect(grid.gridView).toEqual(DEFAULT_SESSION_GRID_VIEW);

    const table = createPanel({ ...input, panelType: 'resourceTable' });
    expect(table.gridView).toBeNull();

    const count = createPanel({ ...input, panelType: 'resourceCount' });
    expect(count.gridView).toBeNull();
  });

  it('survives a JSON round-trip with a grid view set', () => {
    const panel = createPanel({ ...input, panelType: 'sessionResourceGrid' });
    expect(JSON.parse(JSON.stringify(panel))).toEqual(panel);
  });
});

describe('DEFAULT_PANEL_LAYOUTS', () => {
  it('seeds the sessionResourceGrid panel at 4x4 with a 2x2 minimum', () => {
    const layout = DEFAULT_PANEL_LAYOUTS.sessionResourceGrid;
    expect(layout.rowSpan).toBe(4);
    expect(layout.columnSpan).toBe(4);
    expect(layout.definition).toEqual({ minRowSpan: 2, minColumnSpan: 2 });
  });
});
