/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import helpAnchorsData from './helpAnchors.json';
import type { RouteScope } from './pathBuilder';

/**
 * Route → user-manual mapping behind the header's help ("?") button.
 *
 * The manual is a flat, versioned static site (FR-2729) served as
 * `https://webui.docs.backend.ai/{version}/{lang}/{docPage}#{anchor}`, so
 * `docPage` is a `*.html` page slug and `anchor` an in-page heading id.
 * The data lives in `helpAnchors.json` so `scripts/check-help-anchors.mjs`
 * can resolve every target against the published manual sources without a
 * TypeScript toolchain (FR-3773).
 *
 * Keep `path` in sync with the route menu keys in `routes.tsx` and `tab` with
 * each page's `?tab=` values; unmapped routes fall back to the index page.
 */

export interface HelpAnchorEntry {
  /** Route menu key (`useCurrentMenuKey()`); `''` is the root route. */
  path: string;
  /** Route scope this entry overrides, for a menu key shared across scopes. */
  scope?: RouteScope;
  /** `?tab=` value this entry overrides; absent means the page default. */
  tab?: string;
  /** Manual page slug, e.g. `admin_menu.html`. */
  docPage: string;
  /** In-page anchor id, without the leading `#`. */
  anchor?: string;
}

export const helpAnchors: ReadonlyArray<HelpAnchorEntry> =
  helpAnchorsData.entries as ReadonlyArray<HelpAnchorEntry>;

/** `docPage` plus its `#anchor`, the form appended to the manual base URL. */
export const helpAnchorTarget = (entry: HelpAnchorEntry): string =>
  entry.anchor ? `${entry.docPage}#${entry.anchor}` : entry.docPage;

// A scoped entry is keyed `<scope> <menuKey>`; a space never occurs in a menu key.
const lookupKey = (menuKey: string, scope?: RouteScope) =>
  scope ? `${scope} ${menuKey}` : menuKey;

const pageTargets = new Map<string, string>();
/** Lookup key -> (`?tab=` value -> target); nested so keys cannot collide. */
const tabTargets = new Map<string, Map<string, string>>();
for (const entry of helpAnchors) {
  const target = helpAnchorTarget(entry);
  const key = lookupKey(entry.path, entry.scope);
  if (entry.tab === undefined) {
    pageTargets.set(key, target);
  } else {
    const byTab = tabTargets.get(key) ?? new Map<string, string>();
    byTab.set(entry.tab, target);
    tabTargets.set(key, byTab);
  }
}

/**
 * Manual path for a route, preferring a tab-specific section when the active
 * tab has one and an entry for the route's scope over the unscoped one.
 * Unmapped routes resolve to `''` (the per-language index page).
 */
export const resolveHelpDocPath = (
  menuKey: string,
  activeTab?: string | null,
  scope?: RouteScope,
): string => {
  const keys = scope ? [lookupKey(menuKey, scope), menuKey] : [menuKey];
  for (const key of keys) {
    const tabTarget = activeTab
      ? tabTargets.get(key)?.get(activeTab)
      : undefined;
    const target = tabTarget ?? pageTargets.get(key);
    if (target !== undefined) return target;
  }
  return '';
};
