/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import { useEffectiveAdminRole } from '../../hooks/useCurrentUserProjectRoles';
import { useActiveProjectName } from '../../hooks/useRouteScope';
import { useWebUIMenuItems } from '../../hooks/useWebUIMenuItems';
import { buildActionHits, buildHits, toMenuSources } from './buildHits';
import type { GroupedMenuNode } from './buildHits';
import { RECENT_HIT_ID_PREFIX, baseHitId, rankHits } from './rank';
import type { HitTranslator, SearchContext, SearchHit } from './types';
import { useRecentSearchHits } from './useRecentSearchHits';
import { isHitVisible } from './visibility';
import type { SearchSource } from '@astryxdesign/core/Typeahead';
import { useBAILogger } from 'backend.ai-ui';
import type { TFunction } from 'i18next';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

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

export interface GlobalSearchSource extends SearchSource<SearchHit> {
  /** Astryx signals selection by id only; ids may carry `recent:` / `#found=`. */
  getHit: (id: string) => SearchHit | undefined;
}

/**
 * The palette's `SearchSource`: every visible page / tab / setting hit, ranked
 * against the current locale and English. Empty query shows recents plus the
 * full page list, grouped the way the sidebar is.
 */
export const useGlobalSearchSource = (): GlobalSearchSource => {
  'use memo';

  const { t, i18n } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const currentUserRole = useCurrentUserRole();
  const effectiveAdminRole = useEffectiveAdminRole();
  const projectName = useActiveProjectName();
  const { generalMenu, adminMenu, groupedGeneralMenu, groupedAdminMenu } =
    useWebUIMenuItems();
  const [recentSearchHits] = useRecentSearchHits();
  const { logger } = useBAILogger();

  const translate = toTranslator(t);
  const translateEn = toTranslator(i18n.getFixedT('en'));

  const menuSources = [
    ...toMenuSources(groupedGeneralMenu as Array<GroupedMenuNode>, {
      ungroupedLabel: translate('webui.menu.groupName.General'),
    }),
    ...toMenuSources(groupedAdminMenu as Array<GroupedMenuNode>, {
      scopeLabel: translate('webui.menu.Administration'),
    }),
  ];

  const ctx: SearchContext = {
    projectName: projectName ?? null,
    isSuperAdmin: currentUserRole === 'superadmin',
    isAdmin: effectiveAdminRole !== 'none',
    supports: (feature: string) => !!baiClient?.supports?.(feature),
    config: {
      hideAgents: baiClient?._config?.hideAgents ?? true,
      enableReservoir: !!baiClient?._config?.enableReservoir,
      fasttrackEndpoint: baiClient?._config?.fasttrackEndpoint ?? null,
      allowThemeMode: !!baiClient?._config?.allowThemeMode,
    },
    visibleMenuKeys: new Set(
      _.map([...generalMenu, ...adminMenu], (item) => item.key as string),
    ),
    disabledMenuKeys: new Set(
      _.map(
        _.filter([...generalMenu, ...adminMenu], 'disabled'),
        (item) => item.key as string,
      ),
    ),
    t: translate,
    tEn: translateEn,
  };

  const hits = _.filter(
    [
      ...buildHits({
        menuSources,
        projectName,
        t: translate,
        fallbackGroup: translate('webui.menu.groupName.General'),
      }),
      // Actions come last so their groups trail the sidebar's in the empty
      // state, which is the order `CommandPalette` renders headings in.
      ...buildActionHits({
        t: translate,
        groupLabels: {
          create: translate('webui.search.group.Create'),
          appearance: translate('webui.search.group.Appearance'),
          panels: translate('webui.search.group.PanelsAndHelp'),
        },
      }),
    ],
    (hit) => isHitVisible(hit, ctx),
  );
  const hitById = _.keyBy(hits, 'id');
  const recentIds = _.map(recentSearchHits, 'id');

  const recentRows = _.compact(
    _.map(recentSearchHits, (recent): SearchHit | null => {
      const hit = hitById[recent.id];
      if (!hit) return null;
      const group = translate('webui.search.Recent');
      return {
        ...hit,
        id: `${RECENT_HIT_ID_PREFIX}${hit.id}`,
        group,
        auxiliaryData: { group },
      };
    }),
  );
  const pageRows = _.filter(hits, (hit) => hit.kind === 'page');
  const actionRows = _.filter(hits, (hit) => hit.kind === 'action');

  // Index drift is silent otherwise: a menu page with no indexed entry simply
  // never appears in the palette.
  const reportDrift = useEffectEvent((missing: Array<string>) => {
    logger.debug(
      `[global-search] ${missing.length} menu key(s) have no search-index entry: ${missing.join(', ')}`,
    );
  });
  const indexedMenuKeys = new Set(_.compact(_.map(hits, 'menuKey')));
  const missingMenuKeys = _.filter(
    [...ctx.visibleMenuKeys],
    (key) => !indexedMenuKeys.has(key),
  );
  const missingMenuKeysSignature = missingMenuKeys.join(',');
  useEffect(() => {
    if (missingMenuKeysSignature) {
      reportDrift(missingMenuKeysSignature.split(','));
    }
  }, [missingMenuKeysSignature]);

  return {
    search: (query: string) =>
      rankHits(query, hits, {
        t: translate,
        tEn: translateEn,
        recentIds,
      }),
    bootstrap: () => [...recentRows, ...pageRows, ...actionRows],
    getHit: (id: string) => hitById[baseHitId(id)],
  };
};
