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

/**
 * The single visibility predicate: pages are visible iff their menu key
 * survived `useWebUIMenuItems()`, `inactiveList` entries are hidden, tabs and
 * setting items inherit the page gate, and actions bring their own.
 */
export const isHitVisible = (hit: SearchHit, ctx: SearchContext): boolean => {
  if (hit.kind === 'action') {
    return hit.gate ? hit.gate(ctx) : true;
  }

  const menuKey = hit.menuKey;
  if (!menuKey) return false;
  if (ctx.disabledMenuKeys.has(menuKey)) return false;
  if (
    !ctx.visibleMenuKeys.has(menuKey) &&
    !ALWAYS_VISIBLE_MENU_KEYS.has(menuKey)
  ) {
    return false;
  }

  if (hit.tab) {
    const gate = TAB_GATES[tabGateKey(menuKey, hit.tab.param, hit.tab.key)];
    if (gate && !gate(ctx)) return false;
  }

  return true;
};
