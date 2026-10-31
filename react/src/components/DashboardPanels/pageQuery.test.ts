/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { renderedPanelKeys, seedBoard } from './boardModel';
import { PAGE_QUERY_PANELS, pageQueryFragments } from './pageQuery';
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
