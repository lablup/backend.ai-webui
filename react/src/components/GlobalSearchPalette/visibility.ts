/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SearchContext, SearchHit } from './types';

/** Route-only pages that are always reachable but never in the menu. */
export const ALWAYS_VISIBLE_MENU_KEYS: ReadonlySet<string> = new Set([
  'usersettings',
]);

export type TabGate = (ctx: SearchContext) => boolean;

export const tabGateKey = (
  menuKey: string,
  param: string,
  key: string,
): string => `${menuKey}:${param}=${key}`;

/**
 * The one hand-maintained table in the search core: tabs whose strip is built
 * behind a runtime guard the extractor cannot see. Verified against the pages
 * themselves (`StatisticsPage`, `EnvironmentPage`, `AdminDeploymentPage`).
 */
export const TAB_GATES: Readonly<Record<string, TabGate>> = {
  [tabGateKey('statistics', 'tab', 'user-session-history')]: (ctx) =>
    ctx.supports('user-metrics'),
  [tabGateKey('environment', 'tab', 'registry')]: (ctx) => ctx.isSuperAdmin,
  [tabGateKey('admin-deployments', 'tab', 'prometheus-preset')]: (ctx) =>
    ctx.supports('prometheus-query-preset'),
  [tabGateKey('admin-deployments', 'tab', 'deployment-presets')]: (ctx) =>
    ctx.supports('deployment-preset'),
};

/** Whether the menu still offers the page, i.e. neither blocked nor inactive. */
const isMenuKeyOffered = (menuKey: string, ctx: SearchContext): boolean =>
  !ctx.disabledMenuKeys.has(menuKey) &&
  (ctx.visibleMenuKeys.has(menuKey) || ALWAYS_VISIBLE_MENU_KEYS.has(menuKey));

/**
 * The single visibility predicate: pages are visible iff their menu key
 * survived `useWebUIMenuItems()`, `inactiveList` entries are hidden, tabs and
 * setting items inherit the page gate, and actions inherit the gate of the page
 * they act on before their own runs.
 */
export const isHitVisible = (hit: SearchHit, ctx: SearchContext): boolean => {
  const menuKey = hit.menuKey;

  if (hit.kind === 'action') {
    if (menuKey && !isMenuKeyOffered(menuKey, ctx)) return false;
    return hit.gate ? hit.gate(ctx) : true;
  }

  if (!menuKey) return false;
  if (!isMenuKeyOffered(menuKey, ctx)) return false;

  if (hit.tab) {
    const gate = TAB_GATES[tabGateKey(menuKey, hit.tab.param, hit.tab.key)];
    if (gate && !gate(ctx)) return false;
  }

  return true;
};
