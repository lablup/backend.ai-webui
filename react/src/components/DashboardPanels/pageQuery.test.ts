/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { removePanel, renderedPanelKeys, seedBoard } from './boardModel';
import {
  PAGE_QUERY_PANELS,
  pageQueryFragments,
  pageQueryRefresh,
} from './pageQuery';
import { PANEL_CATALOG } from './panelCatalog';
import * as _ from 'lodash-es';

describe('PAGE_QUERY_PANELS', () => {
  it('names only catalog cards', () => {
    const keys = new Set(PANEL_CATALOG.map((definition) => definition.key));
    _.flatMap(PAGE_QUERY_PANELS).forEach((key) =>
      expect(keys.has(key)).toBe(true),
    );
  });
});

describe('renderedPanelKeys', () => {
  it('drops cards the page does not offer the viewer', () => {
    const board = seedBoard(PANEL_CATALOG, 'projectAdmin');
    const keys = renderedPanelKeys(board, PANEL_CATALOG, {
      page: 'projectAdmin',
      role: 'superadmin',
      config: {},
    });
    expect(pageQueryFragments(keys)).toEqual(['sessionCount']);
  });

  it('drops a locked card', () => {
    const board = seedBoard(PANEL_CATALOG, 'project');
    const keys = renderedPanelKeys(board, PANEL_CATALOG, {
      page: 'project',
      role: 'user',
      config: { hideAgents: true },
    });
    expect(keys.has('totalResourceWithinResourceGroup')).toBe(false);
    expect(keys.has('mySession')).toBe(true);
  });
});

describe('pageQueryFragments', () => {
  it('lists the fragments of the cards on the board', () => {
    expect(
      pageQueryFragments(new Set(['recentlyCreatedSession', 'agentStats'])),
    ).toEqual(['recentSessions', 'agentStats']);
    expect(pageQueryFragments(new Set(['folderStatus']))).toEqual([]);
  });
});

describe('pageQueryRefresh', () => {
  it('follows the fastest reader, never faster than the floor', () => {
    const board = seedBoard(PANEL_CATALOG, 'project');
    const keys = new Set(board.panels.map((panel) => panel.key));
    expect(pageQueryRefresh(keys, PANEL_CATALOG, '15s')).toBe('15s');
    expect(pageQueryRefresh(keys, PANEL_CATALOG, '30s')).toBe('30s');
    const withoutSessions = new Set(
      removePanel(board, 'mySession').panels.map((panel) => panel.key),
    );
    expect(pageQueryRefresh(withoutSessions, PANEL_CATALOG, '15s')).toBe('30s');
  });

  it('is null when no card reads the page query', () => {
    expect(
      pageQueryRefresh(new Set(['folderStatus']), PANEL_CATALOG, '15s'),
    ).toBeNull();
  });
});
