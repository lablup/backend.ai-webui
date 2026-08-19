/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PALETTE_ACTIONS } from './actions';
import type { PaletteAction, PaletteActionGroup } from './actions';
import { getSearchIndex } from './searchIndex.types';
import type {
  SearchIndex,
  SearchIndexEntry,
  SearchIndexSetting,
  SearchIndexTab,
} from './searchIndex.types';
import type { HitTranslator, SearchHit } from './types';
import { ALWAYS_VISIBLE_MENU_KEYS } from './visibility';
import * as _ from 'lodash-es';
import { createElement } from 'react';
import type { ReactNode } from 'react';

/** A menu row flattened out of `useWebUIMenuItems()`'s grouped output. */
export interface MenuHitSource {
  key: string;
  labelText: string;
  icon?: ReactNode;
  /** Sidebar group label; admin groups already prefixed "Administration › ". */
  groupLabel: string;
  disabled?: boolean;
}

/** The subset of the grouped menu shape `toMenuSources` reads. */
export interface GroupedMenuNode {
  type?: 'group';
  key?: string;
  labelText?: string;
  icon?: ReactNode;
  disabled?: boolean;
  children?: Array<GroupedMenuNode>;
}

export interface ToMenuSourcesOptions {
  /** Prepended to every group label, e.g. "Administration". */
  scopeLabel?: string;
  /** Heading for entries the sidebar shows outside any group (Start, Dashboard). */
  ungroupedLabel?: string;
}

/**
 * Flattens `groupedGeneralMenu` / `groupedAdminMenu` into rows that carry their
 * group's label, preserving sidebar order.
 */
export const toMenuSources = (
  nodes: ReadonlyArray<GroupedMenuNode> | undefined,
  options: ToMenuSourcesOptions = {},
): Array<MenuHitSource> => {
  const { scopeLabel, ungroupedLabel } = options;
  const sources: Array<MenuHitSource> = [];

  const pushItem = (node: GroupedMenuNode, groupLabel: string) => {
    if (!node?.key) return;
    sources.push({
      key: node.key,
      labelText: node.labelText ?? '',
      icon: node.icon,
      groupLabel,
      disabled: node.disabled,
    });
  };

  _.forEach(nodes, (node) => {
    if (node?.type === 'group') {
      const groupLabel = _.compact([scopeLabel, node.labelText]).join(' › ');
      _.forEach(node.children, (child) => pushItem(child, groupLabel));
    } else {
      // An empty heading makes `CommandPalette` render the row ungrouped, and
      // ungrouped rows sort last — so ungrouped entries need a heading too.
      pushItem(node, ungroupedLabel ?? scopeLabel ?? '');
    }
  });

  return sources;
};

/** `buildPath`'s own encoding, applied to the index's scope param. */
export const fillProjectName = (
  path: string,
  projectName?: string | null,
): string =>
  path.replace(':projectName', encodeURIComponent(projectName ?? ''));

export interface BuildHitsParams {
  index?: SearchIndex;
  menuSources: ReadonlyArray<MenuHitSource>;
  projectName?: string | null;
  t: HitTranslator;
  /** Heading for whitelisted pages the sidebar never lists (user settings). */
  fallbackGroup?: string;
}

const tabLabelKeyOf = (
  entry: SearchIndexEntry,
  tabKey: string | undefined,
): string | undefined =>
  tabKey
    ? _.find(entry.tabs, (tab) => tab.param === 'tab' && tab.key === tabKey)
        ?.labelKey
    : undefined;

const makeTabHit = (
  entry: SearchIndexEntry,
  tab: SearchIndexTab,
  base: Pick<SearchHit, 'menuKey' | 'scope' | 'group' | 'icon'>,
  path: string,
  t: HitTranslator,
): SearchHit | null => {
  // Params the extractor found without a `label:` sibling (`type`,
  // `statusCategory`, `mode`) have no text to show or search.
  if (!tab.labelKey) return null;
  return {
    ...base,
    id: `tab:${entry.path}?${tab.param}=${tab.key}`,
    kind: 'tab',
    label: t(tab.labelKey),
    labelKey: tab.labelKey,
    breadcrumbKeys: _.compact([entry.labelKey]),
    target: { path, search: { [tab.param]: tab.key } },
    keywords: _.compact([tab.key]),
    bodyKeys: [],
    tab: { param: tab.param, key: tab.key },
    auxiliaryData: { group: base.group },
  };
};

const makeSettingHit = (
  entry: SearchIndexEntry,
  setting: SearchIndexSetting,
  base: Pick<SearchHit, 'menuKey' | 'scope' | 'group' | 'icon'>,
  path: string,
  t: HitTranslator,
): SearchHit => ({
  ...base,
  id: `setting:${entry.path}#${setting.key}`,
  kind: 'settingItem',
  label: t(setting.key),
  labelKey: setting.key,
  breadcrumbKeys: _.compact([
    entry.labelKey,
    tabLabelKeyOf(entry, setting.tab),
    setting.groupKey,
  ]),
  target: {
    path,
    search: {
      ...(setting.tab ? { tab: setting.tab } : {}),
      setting: setting.key,
    },
  },
  keywords: _.compact([setting.testId, setting.groupId]),
  bodyKeys: setting.descriptionKeys,
  auxiliaryData: { group: base.group },
});

/**
 * Second line of a page row. Twin pages (`/admin/data`, `/project/x/admin/data`,
 * `/project/x/data`) carry the same label and no breadcrumb, so without this
 * they render as byte-identical rows.
 */
const scopeTextOf = (
  scope: string | null,
  projectName: string | null | undefined,
  t: HitTranslator,
): string | undefined => {
  switch (scope) {
    case 'project':
      return projectName || t('webui.search.scope.Project');
    case 'projectAdmin':
      return t('webui.search.scope.ProjectAdministration');
    case 'admin':
      return t('webui.menu.Administration');
    default:
      return undefined;
  }
};

/**
 * Turns the generated index plus the live menu into hits. A page contributes
 * hits only when its menu key survived `useWebUIMenuItems()`'s gating (or is
 * whitelisted), because the menu is where the icon and the group label live.
 */
export const buildHits = ({
  index = getSearchIndex(),
  menuSources,
  projectName,
  t,
  fallbackGroup = '',
}: BuildHitsParams): Array<SearchHit> => {
  const entriesByMenuKey = _.groupBy(
    _.filter(index.entries, (entry) => !!entry.menuKey && !!entry.labelKey),
    'menuKey',
  );
  const sourceByKey = _.keyBy(menuSources, 'key');
  const orderedKeys = _.uniq([
    ..._.map(menuSources, 'key'),
    ...ALWAYS_VISIBLE_MENU_KEYS,
  ]);

  const hits: Array<SearchHit> = [];
  _.forEach(orderedKeys, (menuKey) => {
    const source = sourceByKey[menuKey];
    _.forEach(entriesByMenuKey[menuKey], (entry) => {
      const path = fillProjectName(entry.path, projectName);
      const base = {
        menuKey,
        scope: entry.scope,
        group: source?.groupLabel || fallbackGroup,
        icon: source?.icon,
      };
      const labelKey = entry.labelKey as string;

      hits.push({
        ...base,
        id: `page:${entry.path}`,
        kind: 'page',
        label: t(labelKey),
        labelKey,
        breadcrumbKeys: [],
        scopeText: scopeTextOf(entry.scope, projectName, t),
        target: { path },
        keywords: [menuKey],
        bodyKeys: entry.keys,
        auxiliaryData: { group: base.group },
      });

      _.forEach(entry.tabs, (tab) => {
        const hit = makeTabHit(entry, tab, base, path, t);
        if (hit) hits.push(hit);
      });
      _.forEach(entry.settings, (setting) => {
        hits.push(makeSettingHit(entry, setting, base, path, t));
      });
    });
  });

  return hits;
};

export interface BuildActionHitsParams {
  actions?: ReadonlyArray<PaletteAction>;
  /** Translated heading per group, in `CommandPalette` insertion order. */
  groupLabels: Record<PaletteActionGroup, string>;
  t: HitTranslator;
}

/**
 * Turns the static registry into trailing hits. Gates are carried, not applied:
 * `isHitVisible` is the single place that decides what the user may see.
 */
export const buildActionHits = ({
  actions = PALETTE_ACTIONS,
  groupLabels,
  t,
}: BuildActionHitsParams): Array<SearchHit> =>
  _.map(actions, (action) => {
    const group = groupLabels[action.group];
    return {
      id: action.id,
      kind: 'action' as const,
      label: t(action.labelKey),
      labelKey: action.labelKey,
      menuKey: action.menuKey ?? null,
      scope: null,
      breadcrumbKeys: [],
      icon: createElement(action.icon, { size: '1em' }),
      group,
      keywords: action.keywords ?? [],
      bodyKeys: [],
      gate: action.gate,
      run: action.run,
      auxiliaryData: { group },
    };
  });
