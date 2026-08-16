/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SearchableItem } from '@astryxdesign/core/Typeahead';
import type { ReactNode } from 'react';

/** The four things v1 can honestly deep-link to. */
export type SearchHitKind = 'page' | 'tab' | 'settingItem' | 'action';

/** Resolves an i18n key in one locale. Never stores strings in the index. */
export type HitTranslator = (key: string) => string;

export interface SearchHitTarget {
  /** Router path with `:projectName` already filled in. */
  path: string;
  /** Query params the arrival contract needs (`tab`, `setting`, …). */
  search?: Record<string, string>;
}

export interface SearchHitAuxiliaryData {
  /** Astryx `CommandPalette` auto-groups rows by this string. */
  group: string;
}

/**
 * One row of the palette. Extends Astryx `SearchableItem` so the hit array can
 * be handed to a `SearchSource` unchanged; `label` is the current-locale text,
 * every other text is a KEY resolved at query time.
 */
export interface SearchHit extends SearchableItem<SearchHitAuxiliaryData> {
  id: string;
  label: string;
  kind: SearchHitKind;
  menuKey: string | null;
  scope: string | null;
  labelKey: string;
  /** Ancestor label keys, outermost first (page › tab › group). */
  breadcrumbKeys: Array<string>;
  icon?: ReactNode;
  /** Sidebar group label; admin groups are prefixed "Administration › ". */
  group: string;
  target: SearchHitTarget;
  /** Set on a body-key match: the page hit gains a "found in" line. */
  matchedIn?: { key: string; kind: 'body' };
  /** Literal terms (menu key, tab key, testid) matched verbatim. */
  keywords: Array<string>;
  /** Page/item body keys — resolved only while ranking, never displayed. */
  bodyKeys: Array<string>;
  /** The tab this hit addresses, for the `TAB_GATES` override map. */
  tab?: { param: string; key: string };
  /** Actions declare their own runtime gate (registry lands in PR ⑤). */
  gate?: (ctx: SearchContext) => boolean;
}

export interface SearchConfigFlags {
  hideAgents: boolean;
  enableReservoir: boolean;
  fasttrackEndpoint: string | null;
}

/** Everything `isHitVisible` and the ranker need that is not in the index. */
export interface SearchContext {
  projectName: string | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  supports: (feature: string) => boolean;
  config: SearchConfigFlags;
  /** Menu keys `useWebUIMenuItems()` emitted. */
  visibleMenuKeys: ReadonlySet<string>;
  /** Subset disabled by `_config.inactiveList` — hidden from search. */
  disabledMenuKeys: ReadonlySet<string>;
  t: HitTranslator;
  tEn: HitTranslator;
}

/** Persisted shape of a recently selected hit (`UserSettings`). */
export interface RecentSearchHit {
  id: string;
  kind: SearchHitKind;
  labelKey: string;
  selectedAt: string;
}
