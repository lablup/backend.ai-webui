/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PALETTE_ACTIONS } from './actions';
import type { PaletteActionGroup } from './actions';
import { buildActionHits, buildHits } from './buildHits';
import type { MenuHitSource } from './buildHits';
import { RECENT_HIT_ID_PREFIX, warmRanker } from './rank';
import { getSearchIndex } from './searchIndex.types';
import type {
  HitTranslator,
  RecentSearchHit,
  SearchContext,
  SearchHit,
} from './types';
import { TAB_GATES, isHitVisible } from './visibility';
import type { TFunction, i18n as I18n } from 'i18next';
import * as _ from 'lodash-es';

/**
 * Everything the palette needs that React state does not own: the translator
 * pair, the hit list, and the bootstrap rows. Module-level so the cache
 * outlives the palette's unmount — a reopen, and the first open after the
 * header trigger's idle `warmGlobalSearch`, then pay nothing.
 */

export interface Translators {
  t: HitTranslator;
  tEn: HitTranslator;
}

/**
 * `postProcess: []` bypasses the dev-only `copyableI18nKey` processor, which
 * returns JSX; the ranker needs plain strings in every environment.
 */
export const toTranslator = (translate: TFunction): HitTranslator => {
  return (key: string) => {
    const value = translate(key, { postProcess: [] });
    return _.isString(value) ? value : key;
  };
};

/**
 * A key that resolves to itself is a miss — or a bundle the http backend has
 * not delivered yet — so it is never cached; anything else is resolved once
 * per language for the lifetime of the tab.
 */
const memoized = (resolve: HitTranslator): HitTranslator => {
  const resolved = new Map<string, string>();
  return (key: string) => {
    const cached = resolved.get(key);
    if (cached !== undefined) return cached;
    const text = resolve(key);
    if (text !== key) resolved.set(key, text);
    return text;
  };
};

const translatorsByInstance = new WeakMap<object, Map<string, Translators>>();

/**
 * The palette's translator pair, stable per (i18next instance, language) so
 * every cache below can key on identity. A language switch produces a new pair,
 * which is what invalidates the hits and the ranker's index.
 */
export const getTranslators = (i18n: I18n): Translators => {
  const language = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  let byLanguage = translatorsByInstance.get(i18n);
  if (!byLanguage) {
    byLanguage = new Map<string, Translators>();
    translatorsByInstance.set(i18n, byLanguage);
  }
  const cached = byLanguage.get(language);
  if (cached) return cached;

  const translators: Translators = {
    t: memoized(toTranslator(i18n.getFixedT(language))),
    tEn: memoized(toTranslator(i18n.getFixedT('en'))),
  };
  byLanguage.set(language, translators);
  return translators;
};

export interface SearchArtifactsParams {
  menuSources: ReadonlyArray<MenuHitSource>;
  projectName?: string | null;
  ctx: SearchContext;
  fallbackGroup: string;
  groupLabels: Record<PaletteActionGroup, string>;
}

export interface SearchArtifacts {
  hits: Array<SearchHit>;
  hitById: Record<string, SearchHit>;
}

interface ArtifactsCacheEntry extends SearchArtifacts {
  signature: string;
  menuSources: ReadonlyArray<MenuHitSource>;
  t: HitTranslator;
  tEn: HitTranslator;
}

let artifactsCache: ArtifactsCacheEntry | null = null;

/**
 * Everything `buildHits` and `isHitVisible` read apart from the menu rows. The
 * gates are evaluated rather than compared by identity because they close over
 * `supports()`, which is a fresh function on every render.
 */
const signatureOf = ({
  projectName,
  ctx,
  fallbackGroup,
  groupLabels,
}: SearchArtifactsParams): string =>
  JSON.stringify([
    projectName ?? '',
    fallbackGroup,
    groupLabels,
    ctx.isSuperAdmin,
    ctx.config.fasttrackEndpoint,
    _.sortBy([...ctx.visibleMenuKeys]),
    _.sortBy([...ctx.disabledMenuKeys]),
    _.map(_.sortBy(_.keys(TAB_GATES)), (key) => !!TAB_GATES[key]?.(ctx)),
    _.map(PALETTE_ACTIONS, (action) => action.gate?.(ctx) ?? null),
  ]);

const sameMenuSources = (
  a: ReadonlyArray<MenuHitSource>,
  b: ReadonlyArray<MenuHitSource>,
): boolean =>
  a.length === b.length &&
  _.every(a, (source, index) => {
    const other = b[index];
    return (
      !!other &&
      source.key === other.key &&
      source.labelText === other.labelText &&
      source.groupLabel === other.groupLabel &&
      source.disabled === other.disabled
    );
  });

/**
 * `useWebUIMenuItems` hands back fresh icon elements on most renders, and an
 * icon is neither ranked nor part of a hit's id — so it must not invalidate the
 * hit list. Refresh the cached hits in place instead.
 */
const syncIcons = (
  hits: ReadonlyArray<SearchHit>,
  menuSources: ReadonlyArray<MenuHitSource>,
): void => {
  const sourceByKey = _.keyBy(menuSources, 'key');
  _.forEach(hits, (hit) => {
    if (hit.kind === 'action' || !hit.menuKey) return;
    const icon = sourceByKey[hit.menuKey]?.icon;
    if (icon !== undefined && icon !== hit.icon) hit.icon = icon;
  });
};

/**
 * The visible hit list plus its id lookup. Rebuilt only when the menu, the
 * scope, the gates or the language actually changed — the palette re-renders
 * several times per open, and every rebuild would otherwise also throw away the
 * ranker's Fuse index, which is keyed on the hit array's identity.
 */
export const getSearchArtifacts = (
  params: SearchArtifactsParams,
): SearchArtifacts => {
  const { menuSources, projectName, ctx, fallbackGroup, groupLabels } = params;
  const signature = signatureOf(params);

  if (
    artifactsCache &&
    artifactsCache.signature === signature &&
    artifactsCache.t === ctx.t &&
    artifactsCache.tEn === ctx.tEn &&
    sameMenuSources(artifactsCache.menuSources, menuSources)
  ) {
    syncIcons(artifactsCache.hits, menuSources);
    return artifactsCache;
  }

  const hits = _.filter(
    [
      ...buildHits({ menuSources, projectName, t: ctx.t, fallbackGroup }),
      // Actions come last so their groups trail the sidebar's in the empty
      // state, which is the order `CommandPalette` renders headings in.
      ...buildActionHits({ t: ctx.t, groupLabels }),
    ],
    (hit) => isHitVisible(hit, ctx),
  );

  artifactsCache = {
    signature,
    menuSources,
    t: ctx.t,
    tEn: ctx.tEn,
    hits,
    hitById: _.keyBy(hits, 'id'),
  };
  return artifactsCache;
};

interface BootstrapCacheEntry {
  hits: ReadonlyArray<SearchHit>;
  recentSignature: string;
  t: HitTranslator;
  rows: Array<SearchHit>;
}

let bootstrapCache: BootstrapCacheEntry | null = null;

/**
 * The empty-query rows, as ONE array built ahead of the open. Astryx calls
 * `bootstrap()` more than once per open (React re-mounts the effect under
 * StrictMode, and again whenever the palette re-suspends); returning the same
 * array identity makes every call after the first a `setState` bail-out instead
 * of a second full commit of the list.
 */
export const getBootstrapRows = (
  artifacts: SearchArtifacts,
  recentSearchHits: ReadonlyArray<RecentSearchHit>,
  t: HitTranslator,
): Array<SearchHit> => {
  const recentSignature = _.map(recentSearchHits, 'id').join(',');
  if (
    bootstrapCache &&
    bootstrapCache.hits === artifacts.hits &&
    bootstrapCache.recentSignature === recentSignature &&
    bootstrapCache.t === t
  ) {
    return bootstrapCache.rows;
  }

  const group = t('webui.search.Recent');
  const recentRows = _.compact(
    _.map(recentSearchHits, (recent): SearchHit | null => {
      const hit = artifacts.hitById[recent.id];
      if (!hit) return null;
      return {
        ...hit,
        id: `${RECENT_HIT_ID_PREFIX}${hit.id}`,
        group,
        auxiliaryData: { group },
      };
    }),
  );

  // Recents repeat below in the full list on purpose, the way VS Code does.
  const rows = [
    ...recentRows,
    ..._.filter(artifacts.hits, (hit) => hit.kind === 'page'),
    ..._.filter(artifacts.hits, (hit) => hit.kind === 'action'),
  ];
  bootstrapCache = { hits: artifacts.hits, recentSignature, t, rows };
  return rows;
};

/** Chrome the palette resolves itself, i.e. keys the index does not carry. */
const PALETTE_CHROME_KEYS: ReadonlyArray<string> = [
  'webui.menu.groupName.General',
  'webui.menu.Administration',
  'webui.menu.Search',
  'webui.search.group.Create',
  'webui.search.group.Appearance',
  'webui.search.group.PanelsAndHelp',
  'webui.search.Recent',
  'webui.search.NoResults',
  'webui.search.Placeholder',
  'webui.search.FoundIn',
  'webui.search.scope.Project',
  'webui.search.scope.ProjectAdministration',
];

let warmableKeys: Array<string> | null = null;

/** Every i18n key the palette and the ranker ever resolve, collected once. */
const getWarmableKeys = (): Array<string> => {
  if (warmableKeys) return warmableKeys;
  const keys: Array<string> = [...PALETTE_CHROME_KEYS];
  _.forEach(getSearchIndex().entries, (entry) => {
    if (entry.labelKey) keys.push(entry.labelKey);
    _.forEach(entry.tabs, (tab) => {
      if (tab.labelKey) keys.push(tab.labelKey);
    });
    _.forEach(entry.settings, (setting) => {
      keys.push(setting.key);
      if (setting.groupKey) keys.push(setting.groupKey);
      keys.push(...setting.descriptionKeys);
    });
    keys.push(...entry.keys);
  });
  keys.push(..._.map(PALETTE_ACTIONS, 'labelKey'));
  warmableKeys = _.uniq(keys);
  return warmableKeys;
};

/**
 * Idle warm-up for the header trigger. Resolves the whole index against the
 * current locale and English — the ranker's dominant cost — and re-primes the
 * Fuse index when a previous open already built the hits. Idempotent.
 */
export const warmGlobalSearch = (i18n: I18n): void => {
  const { t, tEn } = getTranslators(i18n);
  _.forEach(getWarmableKeys(), (key) => {
    t(key);
    tEn(key);
  });
  if (artifactsCache && artifactsCache.t === t && artifactsCache.tEn === tEn) {
    warmRanker(artifactsCache.hits, t, tEn);
  }
};

/** Test-only: drop every module-level cache. */
export const resetSearchArtifacts = (): void => {
  artifactsCache = null;
  bootstrapCache = null;
  warmableKeys = null;
};
