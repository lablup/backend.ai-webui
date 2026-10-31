/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { buildPath } from '../../helper/pathBuilder';
import { resolveDetailLink } from './detailLink';
import { PANEL_CATALOG } from './panelCatalog';
import type { PanelPage, PanelSettings } from './types';

const hrefOf = (
  key: string,
  page: PanelPage,
  settings?: PanelSettings,
): string | null => {
  const definition = PANEL_CATALOG.find((entry) => entry.key === key);
  const link = definition && resolveDetailLink(definition, { page, settings });
  return link ? buildPath(link.scope, link.feature, 'p') + link.search : null;
};

describe('card detail links', () => {
  it('opens the session list of the page scope with running sessions', () => {
    expect(hrefOf('mySession', 'project')).toBe(
      '/project/p/session?statusCategory=running',
    );
    expect(hrefOf('projectSessionStatus', 'projectAdmin')).toBe(
      '/project/p/admin/session?statusCategory=running',
    );
    expect(hrefOf('projectSessionStatus', 'admin')).toBe(
      '/admin/session?statusCategory=running',
    );
  });

  it('opens the pending tab with the card resource group on the superadmin page only', () => {
    expect(
      hrefOf('pendingSessions', 'admin', { resourceGroups: ['rg-a'] }),
    ).toBe('/admin/session?tab=pending-sessions&resourceGroup=rg-a');
    expect(hrefOf('pendingSessions', 'admin')).toBe(
      '/admin/session?tab=pending-sessions',
    );
    expect(hrefOf('pendingSessions', 'projectAdmin')).toBeNull();
  });

  it('leaves cards without a list page without a link', () => {
    [
      'failuresByEntityType',
      'topProjectsUsage',
      'projectAuditLog',
      'myActivity',
      'schedulingFailures',
      'start.session',
    ].forEach((key) => expect(hrefOf(key, 'admin')).toBeNull());
  });

  it('names a destination for every page a linked card is placed on', () => {
    PANEL_CATALOG.filter((definition) => definition.detailLink).forEach(
      (definition) =>
        definition.page.forEach((page) => {
          const link = definition.detailLink?.({ page, settings: undefined });
          if (link) expect(link.labelKey).toMatch(/\./);
        }),
    );
  });
});
