/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { tEn } from '../../../__test__/i18nBundles';
import { buildHits, fillProjectName, toMenuSources } from './buildHits';
import type { MenuHitSource } from './buildHits';
import { getSearchIndex } from './searchIndex.types';
import * as _ from 'lodash-es';
import { describe, expect, it } from 'vitest';

const index = getSearchIndex();
const indexedEntries = _.filter(
  index.entries,
  (entry) => !!entry.menuKey && !!entry.labelKey,
);

/**
 * Production puts `admin-data` and `project-data` in the same admin group, so
 * the twin Data pages really do share a heading. A per-key group label would
 * hand the fixture a uniqueness the app does not have.
 */
const SHARED_ADMIN_GROUP = 'Administration › Operations';
const SHARED_GROUP_KEYS = ['admin-data', 'project-data', 'admin-session'];

/** A menu that shows every indexed page, so buildHits is the only filter. */
const fullMenu: Array<MenuHitSource> = _.map(
  _.uniq(_.compact(_.map(indexedEntries, 'menuKey'))),
  (key) => ({
    key,
    labelText: key,
    groupLabel: _.includes(SHARED_GROUP_KEYS, key)
      ? SHARED_ADMIN_GROUP
      : `group:${key}`,
  }),
);

const build = (menuSources: Array<MenuHitSource> = fullMenu) =>
  buildHits({ menuSources, projectName: 'my project', t: tEn });

describe('buildHits', () => {
  it('emits one page hit per indexed entry whose menu key is shown', () => {
    const pages = _.filter(build(), (hit) => hit.kind === 'page');
    expect(pages).toHaveLength(indexedEntries.length);
    expect(_.uniq(_.map(pages, 'id'))).toHaveLength(pages.length);
  });

  it('emits a tab hit only for tabs the extractor could label', () => {
    const tabs = _.filter(build(), (hit) => hit.kind === 'tab');
    const labelledTabs = _.sumBy(
      indexedEntries,
      (entry) => _.filter(entry.tabs, (tab) => !!tab.labelKey).length,
    );
    expect(tabs).toHaveLength(labelledTabs);
    expect(labelledTabs).toBeGreaterThanOrEqual(24);
  });

  it('emits one setting hit per indexed setting item', () => {
    const settings = _.filter(build(), (hit) => hit.kind === 'settingItem');
    expect(settings).toHaveLength(
      _.sumBy(indexedEntries, (e) => e.settings.length),
    );
    expect(settings.length).toBeGreaterThanOrEqual(54);
  });

  it('drops pages the menu does not show, but keeps whitelisted /usersettings', () => {
    const hits = build([]);
    expect(_.uniq(_.map(hits, 'menuKey'))).toEqual(['usersettings']);
    expect(_.find(hits, { kind: 'page' })?.target?.path).toBe('/usersettings');
  });

  it('keeps twin pages apart by scope, not by their sidebar group', () => {
    const dataPages = _.filter(
      build(),
      (hit) => hit.kind === 'page' && hit.labelKey === 'webui.menu.Data',
    );
    expect(_.map(dataPages, 'menuKey').sort()).toEqual([
      'admin-data',
      'data',
      'project-data',
    ]);
    expect(_.uniq(_.map(dataPages, 'scope')).sort()).toEqual([
      'admin',
      'project',
      'projectAdmin',
    ]);
    expect(_.uniq(_.map(dataPages, 'id'))).toHaveLength(3);
    // Two of the three share a heading, so the group cannot be the difference …
    expect(_.uniq(_.map(dataPages, 'group'))).toHaveLength(2);
    // … the secondary line the palette renders is. Every row reads differently.
    expect(_.map(dataPages, 'breadcrumbKeys')).toEqual([[], [], []]);
    expect(_.uniq(_.map(dataPages, 'scopeText')).sort()).toEqual([
      'Administration',
      'Project administration',
      'Project: my project',
    ]);
  });

  it('names the active project on a project-scoped row, the label without one', () => {
    const withProject = _.find(build(), {
      id: 'page:/project/:projectName/session',
    });
    expect(withProject?.scopeText).toBe('Project: my project');
    const withoutProject = buildHits({ menuSources: fullMenu, t: tEn });
    const sessions = _.find(withoutProject, {
      id: 'page:/project/:projectName/session',
    });
    expect(sessions?.scopeText).toBe('Project');
  });

  it('fills :projectName into project-scoped targets', () => {
    const sessions = _.find(build(), {
      id: 'page:/project/:projectName/session',
    });
    expect(sessions?.target?.path).toBe('/project/my%20project/session');
    expect(fillProjectName('/project/:projectName/data', null)).toBe(
      '/project//data',
    );
  });

  it('targets a tab through its own query param', () => {
    const hit = _.find(build(), {
      id: 'tab:/project/:projectName/statistics?tab=user-session-history',
    });
    expect(hit?.target?.search).toEqual({ tab: 'user-session-history' });
    expect(hit?.tab).toEqual({ param: 'tab', key: 'user-session-history' });
    expect(hit?.breadcrumbKeys).toEqual(['webui.menu.Statistics']);
    expect(hit?.label).toBe('User Session History');
  });

  it('targets a setting item through ?tab=&setting=', () => {
    const hit = _.find(build(), {
      id: 'setting:/usersettings#userSettings.AutoLogout',
    });
    expect(hit?.target).toEqual({
      path: '/usersettings',
      search: { tab: 'general', setting: 'userSettings.AutoLogout' },
    });
    expect(hit?.breadcrumbKeys).toEqual([
      'webui.menu.Settings&Logs',
      'userSettings.General',
      'userSettings.Preferences',
    ]);
    expect(hit?.bodyKeys).toContain('userSettings.DescAutoLogout');
  });

  it('carries the group on auxiliaryData so Astryx can auto-group', () => {
    const hits = build();
    expect(_.every(hits, (hit) => hit.auxiliaryData?.group === hit.group)).toBe(
      true,
    );
  });
});

describe('toMenuSources', () => {
  const grouped = [
    { key: 'start', labelText: 'Start' },
    {
      type: 'group' as const,
      labelText: 'Workload',
      children: [{ key: 'session', labelText: 'Sessions', disabled: true }],
    },
  ];

  it('flattens grouped menus in sidebar order and keeps the group label', () => {
    expect(toMenuSources(grouped)).toEqual([
      {
        key: 'start',
        labelText: 'Start',
        icon: undefined,
        groupLabel: '',
        disabled: undefined,
      },
      {
        key: 'session',
        labelText: 'Sessions',
        icon: undefined,
        groupLabel: 'Workload',
        disabled: true,
      },
    ]);
  });

  it('prefixes admin groups with the scope label', () => {
    expect(
      _.map(
        toMenuSources(grouped, { scopeLabel: 'Administration' }),
        'groupLabel',
      ),
    ).toEqual(['Administration', 'Administration › Workload']);
  });
});
