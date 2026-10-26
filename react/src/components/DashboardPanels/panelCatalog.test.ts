/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { catalogFor, seedBoard } from './boardModel';
import { PANEL_CATALOG } from './panelCatalog';
import { resourceKeys } from './resourceRegistry';
import type { PanelCatalogContext, PanelPage } from './types';

const keysFor = (context: PanelCatalogContext) =>
  catalogFor(PANEL_CATALOG, context).map((entry) => entry.definition.key);

describe('PANEL_CATALOG', () => {
  it.each<['admin' | 'user', PanelPage]>([
    ['admin', 'project'],
    ['admin', 'projectAdmin'],
    ['user', 'project'],
    ['user', 'projectAdmin'],
  ])('offers a %s no superadmin-only card on the %s page', (role, page) => {
    catalogFor(PANEL_CATALOG, { page, role, config: {} }).forEach(
      ({ definition }) =>
        expect(definition.requires?.role).not.toBe('superadmin'),
    );
  });

  it.each<PanelPage>(['project', 'projectAdmin'])(
    'offers a superadmin on the %s page only the cards placed on it',
    (page) => {
      catalogFor(PANEL_CATALOG, {
        page,
        role: 'superadmin',
        config: {},
      }).forEach(({ definition }) => expect(definition.page).toContain(page));
    },
  );

  it('has unique keys', () => {
    const keys = PANEL_CATALOG.map((definition) => definition.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('gives every dedicated card a component and every preset a source', () => {
    PANEL_CATALOG.forEach((definition) => {
      if (definition.kind === 'custom') {
        expect(definition.Component).toBeDefined();
      } else {
        expect(definition.source).toBeDefined();
      }
    });
  });

  it('keeps every default size at or above its minimum', () => {
    PANEL_CATALOG.forEach(({ defaultSize, minSize }) => {
      expect(defaultSize.columnSpan).toBeGreaterThanOrEqual(minSize.columnSpan);
      expect(defaultSize.rowSpan).toBeGreaterThanOrEqual(minSize.rowSpan);
    });
  });

  it('offers one preset per data source', () => {
    const presets = PANEL_CATALOG.filter(
      (definition) => definition.kind === 'preset',
    );
    expect(presets.map((definition) => definition.source)).toEqual(
      resourceKeys,
    );
  });

  it.each<[PanelPage, Array<string>]>([
    [
      'project',
      [
        'start.session',
        'start.batchSession',
        'start.folder',
        'start.deployment',
        'start.url',
        'mySession',
        'myRecentSessions',
        'myResource',
        'resourcePresets',
        'totalResourceWithinResourceGroup',
        'folderStatus',
        'quotaPerStorageVolume',
        'myDeployments',
        'myActivity',
      ],
    ],
    ['projectAdmin', ['activeSessions']],
    [
      'admin',
      [
        'activeSessions',
        'totalResourceWithinResourceGroup',
        'agentStats',
        'activeAgents',
        'recentlyCreatedSession',
      ],
    ],
  ])('seeds the %s board with its default cards', (page, keys) => {
    expect(
      seedBoard(PANEL_CATALOG, page).panels.map((panel) => panel.id),
    ).toEqual(keys);
  });
});

describe('catalogFor on the real catalog', () => {
  it('hides superadmin-only cards and the vfolder preset from a regular user', () => {
    const keys = keysFor({ page: 'project', role: 'user', config: {} });
    expect(keys).not.toContain('agentStats');
    expect(keys).not.toContain('activeAgents');
    expect(keys).not.toContain('resource.vfolder');
    expect(keys).toEqual(
      expect.arrayContaining(['mySession', 'resource.session']),
    );
  });

  it('shows them to a superadmin on the superadmin page', () => {
    expect(keysFor({ page: 'admin', role: 'superadmin', config: {} })).toEqual(
      expect.arrayContaining([
        'agentStats',
        'activeAgents',
        'resource.vfolder',
      ]),
    );
  });

  it('keeps cluster and project-wide cards off the member dashboard, even for a superadmin', () => {
    const keys = keysFor({ page: 'project', role: 'superadmin', config: {} });
    expect(keys).not.toContain('agentStats');
    expect(keys).not.toContain('activeAgents');
    expect(keys).not.toContain('activeSessions');
  });

  it('drops a Start item whose menu is blocked and locks the deployment one without model folders', () => {
    const entries = catalogFor(PANEL_CATALOG, {
      page: 'project',
      role: 'user',
      config: { blockList: ['import'], inactiveList: ['job'] },
    });
    const keys = entries.map(({ definition }) => definition.key);
    expect(keys).not.toContain('start.url');
    expect(keys).not.toContain('start.session');
    expect(keys).not.toContain('start.batchSession');
    expect(keys).toContain('start.folder');
    expect(
      entries.find(({ definition }) => definition.key === 'start.deployment')
        ?.locked,
    ).toBe(true);
  });

  it('locks the resource group total for a non-superadmin when agents are hidden', () => {
    const entry = (role: 'user' | 'superadmin') =>
      catalogFor(PANEL_CATALOG, {
        page: 'project',
        role,
        config: { hideAgents: true },
      }).find(
        ({ definition }) =>
          definition.key === 'totalResourceWithinResourceGroup',
      );
    expect(entry('user')?.locked).toBe(true);
    expect(entry('superadmin')?.locked).toBe(false);
  });
});
