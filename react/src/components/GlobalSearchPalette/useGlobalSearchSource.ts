/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import { useActiveProjectName } from '../../hooks/useRouteScope';
import { useWebUIMenuItems } from '../../hooks/useWebUIMenuItems';
import { toMenuSources } from './buildHits';
import type { GroupedMenuNode } from './buildHits';
import { baseHitId, rankHits, warmRanker } from './rank';
import {
  getBootstrapRows,
  getSearchArtifacts,
  getTranslators,
} from './searchArtifacts';
import type { SearchConfigFlags, SearchContext, SearchHit } from './types';
import { useRecentSearchHits } from './useRecentSearchHits';
import type { SearchSource } from '@astryxdesign/core/Typeahead';
import { useBAILogger } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

export { toTranslator } from './searchArtifacts';

/** The one place the palette reads deployment config off the client. */
export const toSearchConfigFlags = (baiClient: {
  _config?: { fasttrackEndpoint?: string | null };
}): SearchConfigFlags => ({
  fasttrackEndpoint: baiClient?._config?.fasttrackEndpoint ?? null,
});

export interface GlobalSearchSource extends SearchSource<SearchHit> {
  /** Astryx signals selection by id only; ids may carry `recent:` / `#found=`. */
  getHit: (id: string) => SearchHit | undefined;
  /** Read by the swizzled `CommandPalette` to seed its first render commit. */
  bootstrapSync: () => Array<SearchHit>;
}

/**
 * The palette's `SearchSource`: every visible page / tab / setting hit, ranked
 * against the current locale and English. Empty query shows recents plus the
 * full page list, grouped the way the sidebar is. The hits themselves and the
 * bootstrap rows come from `searchArtifacts`, whose cache outlives this hook.
 */
export const useGlobalSearchSource = (): GlobalSearchSource => {
  'use memo';

  const { i18n } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const currentUserRole = useCurrentUserRole();
  const projectName = useActiveProjectName();
  const { generalMenu, adminMenu, groupedGeneralMenu, groupedAdminMenu } =
    useWebUIMenuItems();
  const [recentSearchHits] = useRecentSearchHits();
  const { logger } = useBAILogger();

  const { t: translate, tEn: translateEn } = getTranslators(i18n);

  const menuSources = [
    ...toMenuSources(groupedGeneralMenu as Array<GroupedMenuNode>, {
      ungroupedLabel: translate('webui.menu.groupName.General'),
    }),
    ...toMenuSources(groupedAdminMenu as Array<GroupedMenuNode>, {
      scopeLabel: translate('webui.menu.Administration'),
    }),
  ];

  const ctx: SearchContext = {
    isSuperAdmin: currentUserRole === 'superadmin',
    supports: (feature: string) => !!baiClient?.supports?.(feature),
    config: toSearchConfigFlags(baiClient),
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

  const artifacts = getSearchArtifacts({
    menuSources,
    projectName,
    ctx,
    fallbackGroup: translate('webui.menu.groupName.General'),
    groupLabels: {
      create: translate('webui.search.group.Create'),
      appearance: translate('webui.search.group.Appearance'),
      panels: translate('webui.search.group.PanelsAndHelp'),
    },
  });
  const { hits, hitById } = artifacts;
  const bootstrapRows = getBootstrapRows(
    artifacts,
    recentSearchHits,
    translate,
  );
  const recentIds = _.map(recentSearchHits, 'id');

  // Index drift is silent otherwise: a menu page with no indexed entry simply
  // never appears in the palette.
  const reportDrift = useEffectEvent((missing: Array<string>) => {
    logger.debug(
      `[global-search] ${missing.length} menu key(s) have no search-index entry: ${missing.join(', ')}`,
    );
  });
  const indexedMenuKeys = new Set(
    _.compact(_.map(_.reject(hits, { kind: 'action' }), 'menuKey')),
  );
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

  // The ranker's index is the first keystroke's whole cost. Build it while the
  // user is still reading the bootstrap list; the header's idle warm-up cannot,
  // because on a genuine first open the hits do not exist yet.
  useEffect(() => {
    const warm = () => warmRanker(hits, translate, translateEn);
    if (typeof requestIdleCallback === 'function') {
      const handle = requestIdleCallback(warm);
      return () => cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(warm, 0);
    return () => window.clearTimeout(handle);
  }, [hits, translate, translateEn]);

  return {
    search: (query: string) =>
      rankHits(query, hits, {
        t: translate,
        tEn: translateEn,
        recentIds,
      }),
    bootstrap: () => bootstrapRows,
    // The same rows `bootstrap()` returns — `getSearchArtifacts` already built
    // them during this render — declared sync so the palette can commit them
    // with its first render instead of awaiting a transition.
    bootstrapSync: () => bootstrapRows,
    getHit: (id: string) => hitById[baseHitId(id)],
  };
};
