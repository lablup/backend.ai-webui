/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AdminDeploymentPresetQuery as AdminDeploymentPresetQueryType,
  DeploymentRevisionPresetOrderBy,
} from '../__generated__/AdminDeploymentPresetQuery.graphql';
import type {
  AdminDeploymentQuery as AdminDeploymentQueryType,
  DeploymentFilter,
  DeploymentOrderBy,
} from '../__generated__/AdminDeploymentQuery.graphql';
import type {
  AdminModelCardTableQuery as AdminModelCardTableQueryType,
  ModelCardV2OrderBy,
} from '../__generated__/AdminModelCardTableQuery.graphql';
import type {
  AdminPrometheusPresetQuery as AdminPrometheusPresetQueryType,
  QueryDefinitionOrderBy,
} from '../__generated__/AdminPrometheusPresetQuery.graphql';
import type {
  AdminRuntimeVariantPresetQuery as AdminRuntimeVariantPresetQueryType,
  RuntimeVariantPresetFilter,
  RuntimeVariantPresetOrderBy,
} from '../__generated__/AdminRuntimeVariantPresetQuery.graphql';
import AdminDeployment, {
  AdminDeploymentQuery,
} from '../components/AdminDeployment';
import AdminDeploymentPreset, {
  AdminDeploymentPresetQuery,
} from '../components/AdminDeploymentPreset';
import AdminModelCardTable, {
  AdminModelCardTableQuery,
} from '../components/AdminModelCardTable';
import AdminPrometheusPreset, {
  AdminPrometheusPresetQuery,
} from '../components/AdminPrometheusPreset';
import AdminRuntimeVariantPreset, {
  AdminRuntimeVariantPresetQuery,
} from '../components/AdminRuntimeVariantPreset';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import { convertOrderByToString, convertToOrderBy } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { Skeleton } from 'antd';
import type { CardTabListType } from 'antd/es/card';
import { BAICard, filterOutEmpty } from 'backend.ai-ui';
import {
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import React, { Suspense, useEffect, useEffectEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UseQueryLoaderLoadQueryOptions, useQueryLoader } from 'react-relay';

const TAB_KEYS = [
  'deployments',
  'model-store-management',
  'prometheus-preset',
  'deployment-presets',
  'runtime-variant-presets',
] as const;

type TabKey = (typeof TAB_KEYS)[number];

const tabParser = parseAsStringLiteral(TAB_KEYS).withDefault('deployments');

// Default status scope for the deployments tab: hide terminated deployments.
// `status` is never a user-settable filter property, so the deployments tab
// owns it entirely via its running/finished toggle. On first load (no
// persisted filter) we fall back to "running".
const DEPLOYMENT_RUNNING_FILTER: DeploymentFilter = {
  status: { notIn: ['STOPPED'] },
};

// Per-tab default order. Tabs not listed default to no sort; the presets tabs
// default to newest-first. Because all tabs now share a single `order` URL key
// (see below), these defaults are applied explicitly on tab switch and on the
// initial load of each tab (in `loadTab`).
const DEFAULT_ORDER_BY_TAB: Record<TabKey, string | null> = {
  deployments: null,
  'model-store-management': null,
  'prometheus-preset': null,
  'deployment-presets': '-createdAt',
  'runtime-variant-presets': '-createdAt',
};

type DeploymentTabQueryParams = {
  filter: unknown;
  order: string | null;
};

const AdminDeploymentPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();
  const isPrometheusPresetSupported = baiClient.supports(
    'prometheus-query-preset',
  );
  const isDeploymentPresetSupported = baiClient.supports('deployment-preset');

  // A single `{ tab, filter, order }` URL state is shared by every tab, plus a
  // single pagination state. Only the active tab's values are ever present in
  // the URL; on a tab switch we snapshot the current tab's values into
  // `queryMapRef` and restore the target tab's (or its defaults). This is the
  // `AdminComputeSessionListPage` idiom. Prefixed / per-tab URL keys are
  // deliberately avoided: with one shared key set, an inactive tab can never
  // leak its `filter`/`order` into another tab (the previous per-tab
  // `useQueryStates` design leaked because every mounted tab read the same
  // unprefixed `filter`/`order` keys simultaneously).
  const [queryParams, setQueryParams] = useQueryStates(
    {
      tab: tabParser,
      order: parseAsString,
      filter: parseAsJson<unknown>((value) => value),
    },
    { history: 'replace' },
  );
  const currentTab = queryParams.tab;
  const { tablePaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionStateOnSearchParam({ current: 1, pageSize: 10 });

  // Snapshot of each tab's `{ filter, order }` + pagination, so switching away
  // and back restores what the user had without persisting every tab's state
  // in the URL at once.
  const queryMapRef = useRef<
    Record<
      string,
      {
        queryParams: DeploymentTabQueryParams;
        tablePaginationOption: { pageSize: number; current: number };
      }
    >
  >({
    [currentTab]: {
      queryParams: { filter: queryParams.filter, order: queryParams.order },
      tablePaginationOption,
    },
  });
  useEffect(() => {
    queryMapRef.current[currentTab] = {
      queryParams: { filter: queryParams.filter, order: queryParams.order },
      tablePaginationOption,
    };
  }, [
    currentTab,
    queryParams.filter,
    queryParams.order,
    tablePaginationOption,
  ]);

  // Every tab's query ref is owned here (not inside the tab component) so the
  // ref — and its already-fetched rows — survive the tab unmounting on a tab
  // switch; only a full page reload resets it.

  // --- Deployments tab ---
  const [deploymentQueryRef, loadDeploymentQuery] =
    useQueryLoader<AdminDeploymentQueryType>(AdminDeploymentQuery);
  const [deploymentColumnOverrides, setDeploymentColumnOverrides] =
    useBAISettingUserState('table_column_overrides.AdminDeployment');

  const reloadDeployments = (
    variables: AdminDeploymentQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => {
    const nextLimit = variables.limit ?? 10;
    const nextOffset = variables.offset ?? 0;
    setQueryParams({
      filter: variables.filter ?? null,
      order: convertOrderByToString(variables.orderBy),
    });
    setTablePaginationOption({
      pageSize: nextLimit,
      current: nextOffset > 0 ? Math.floor(nextOffset / nextLimit) + 1 : 1,
    });
    loadDeploymentQuery(variables, options);
  };

  // --- Model store management tab ---
  const [modelCardQueryRef, loadModelCardQuery] =
    useQueryLoader<AdminModelCardTableQueryType>(AdminModelCardTableQuery);
  const [modelCardColumnOverrides, setModelCardColumnOverrides] =
    useBAISettingUserState('table_column_overrides.AdminModelCardTable');

  const reloadModelCards = (
    variables: AdminModelCardTableQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => {
    const nextLimit = variables.limit ?? 10;
    const nextOffset = variables.offset ?? 0;
    setQueryParams({
      filter: variables.filter ?? null,
      order: convertOrderByToString(variables.orderBy),
    });
    setTablePaginationOption({
      pageSize: nextLimit,
      current: nextOffset > 0 ? Math.floor(nextOffset / nextLimit) + 1 : 1,
    });
    loadModelCardQuery(variables, options);
  };

  // --- Prometheus preset tab ---
  const [prometheusQueryRef, loadPrometheusQuery] =
    useQueryLoader<AdminPrometheusPresetQueryType>(AdminPrometheusPresetQuery);
  const [prometheusColumnOverrides, setPrometheusColumnOverrides] =
    useBAISettingUserState('table_column_overrides.AdminPrometheusPreset');

  const reloadPrometheusPresets = (
    variables: AdminPrometheusPresetQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => {
    const nextLimit = variables.limit ?? 10;
    const nextOffset = variables.offset ?? 0;
    setQueryParams({
      filter: variables.filter ?? null,
      order: convertOrderByToString(variables.orderBy),
    });
    setTablePaginationOption({
      pageSize: nextLimit,
      current: nextOffset > 0 ? Math.floor(nextOffset / nextLimit) + 1 : 1,
    });
    loadPrometheusQuery(variables, options);
  };

  // --- Deployment presets tab ---
  const [deploymentPresetQueryRef, loadDeploymentPresetQuery] =
    useQueryLoader<AdminDeploymentPresetQueryType>(AdminDeploymentPresetQuery);
  const [deploymentPresetColumnOverrides, setDeploymentPresetColumnOverrides] =
    useBAISettingUserState('table_column_overrides.AdminDeploymentPreset');

  const reloadDeploymentPresets = (
    variables: AdminDeploymentPresetQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => {
    const nextLimit = variables.limit ?? 10;
    const nextOffset = variables.offset ?? 0;
    setQueryParams({
      filter: variables.filter ?? null,
      order: convertOrderByToString(variables.orderBy),
    });
    setTablePaginationOption({
      pageSize: nextLimit,
      current: nextOffset > 0 ? Math.floor(nextOffset / nextLimit) + 1 : 1,
    });
    loadDeploymentPresetQuery(variables, options);
  };

  // --- Runtime variant presets tab ---
  const [presetQueryRef, loadPresetQuery] =
    useQueryLoader<AdminRuntimeVariantPresetQueryType>(
      AdminRuntimeVariantPresetQuery,
    );
  const [presetColumnOverrides, setPresetColumnOverrides] =
    useBAISettingUserState('table_column_overrides.AdminRuntimeVariantPreset');

  const reloadRuntimeVariantPresets = (
    variables: AdminRuntimeVariantPresetQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => {
    const nextLimit = variables.limit ?? 10;
    const nextOffset = variables.offset ?? 0;
    setQueryParams({
      filter: variables.filter ?? null,
      order: convertOrderByToString(variables.orderBy),
    });
    setTablePaginationOption({
      pageSize: nextLimit,
      current: nextOffset > 0 ? Math.floor(nextOffset / nextLimit) + 1 : 1,
    });
    loadPresetQuery(variables, options);
  };

  // Single entry point that lazily loads a tab's query when it becomes active
  // and isn't already loaded (guarded per-tab by its ref), so a query never
  // runs while its tab is hidden and returning to a loaded tab shows the same
  // rows without refetching. `store-and-network` shows cached rows immediately
  // while revalidating. Derives `limit`/`offset` from the passed pagination so
  // callers can load with exact values in hand (render-as-you-fetch).
  const loadTab = (
    tab: TabKey,
    params: DeploymentTabQueryParams,
    pagination: { current: number; pageSize: number },
  ) => {
    const limit = pagination.pageSize;
    const offset =
      pagination.current > 1
        ? (pagination.current - 1) * pagination.pageSize
        : 0;
    switch (tab) {
      case 'deployments':
        if (!deploymentQueryRef) {
          loadDeploymentQuery(
            {
              filter:
                (params.filter as DeploymentFilter | null) ??
                DEPLOYMENT_RUNNING_FILTER,
              orderBy: convertToOrderBy<DeploymentOrderBy>(params.order),
              limit,
              offset,
            },
            { fetchPolicy: 'store-and-network' },
          );
        }
        break;
      case 'model-store-management': {
        const currentProjectId = currentProject.id;
        // Reload when nothing is loaded yet or the active project changed (the
        // query is scoped to `currentProjectId`).
        if (
          currentProjectId &&
          (!modelCardQueryRef ||
            modelCardQueryRef.variables.currentProjectId !== currentProjectId)
        ) {
          loadModelCardQuery(
            {
              filter:
                (params.filter as AdminModelCardTableQueryType['variables']['filter']) ??
                undefined,
              orderBy: convertToOrderBy<ModelCardV2OrderBy>(params.order),
              limit,
              offset,
              currentProjectId,
            },
            { fetchPolicy: 'store-and-network' },
          );
        }
        break;
      }
      case 'prometheus-preset':
        if (isPrometheusPresetSupported && !prometheusQueryRef) {
          loadPrometheusQuery(
            {
              filter:
                (params.filter as AdminPrometheusPresetQueryType['variables']['filter']) ??
                undefined,
              orderBy: convertToOrderBy<QueryDefinitionOrderBy>(params.order),
              limit,
              offset,
            },
            { fetchPolicy: 'store-and-network' },
          );
        }
        break;
      case 'deployment-presets':
        if (isDeploymentPresetSupported && !deploymentPresetQueryRef) {
          loadDeploymentPresetQuery(
            {
              filter:
                (params.filter as AdminDeploymentPresetQueryType['variables']['filter']) ??
                undefined,
              orderBy: convertToOrderBy<DeploymentRevisionPresetOrderBy>(
                params.order ?? DEFAULT_ORDER_BY_TAB['deployment-presets'],
              ),
              limit,
              offset,
            },
            { fetchPolicy: 'store-and-network' },
          );
        }
        break;
      case 'runtime-variant-presets':
        if (!presetQueryRef) {
          loadPresetQuery(
            {
              filter:
                (params.filter as RuntimeVariantPresetFilter | null) ??
                undefined,
              orderBy: convertToOrderBy<RuntimeVariantPresetOrderBy>(
                params.order ?? DEFAULT_ORDER_BY_TAB['runtime-variant-presets'],
              ),
              limit,
              offset,
            },
            { fetchPolicy: 'store-and-network' },
          );
        }
        break;
    }
  };

  // Render-as-you-fetch: start the target tab's fetch in the click handler,
  // before the re-render, rather than reacting to the tab change in an effect.
  const onTabChange = (key: string) => {
    const tab = key as TabKey;
    const stored = queryMapRef.current[key] ?? {
      queryParams: {
        filter: null,
        order: DEFAULT_ORDER_BY_TAB[tab] ?? null,
      },
      tablePaginationOption: undefined,
    };
    const nextPagination = stored.tablePaginationOption ?? {
      current: 1,
      pageSize: 10,
    };
    // Reset to defaults first, then apply the target tab's snapshot, so no
    // stale `filter`/`order` from the previous tab bleeds through. Pagination is
    // shared across tabs, so a tab with no snapshot must reset both `current`
    // and `pageSize` (a partial nuqs update would leave the previous tab's
    // `pageSize` untouched).
    setQueryParams(null);
    setQueryParams({
      tab,
      filter: stored.queryParams.filter,
      order: stored.queryParams.order,
    });
    setTablePaginationOption(nextPagination);
    loadTab(tab, stored.queryParams, nextPagination);
  };

  // For entries that don't go through `onTabChange` — the initial mount, a full
  // reload, or a direct `?tab=...` URL — load the active tab. Keyed on the
  // project id so the project-scoped model-store tab reloads when the active
  // project changes; a plain tab switch is already handled by `onTabChange`
  // (render-as-you-fetch), so `currentTab` is intentionally not a dependency.
  const loadActiveTab = useEffectEvent(() => {
    loadTab(
      currentTab,
      { filter: queryParams.filter, order: queryParams.order },
      tablePaginationOption,
    );
  });
  useEffect(() => {
    loadActiveTab();
  }, [currentProject.id]);

  const tabItems: CardTabListType[] = filterOutEmpty([
    {
      key: 'deployments',
      label: t('webui.menu.Deployments'),
    },
    {
      key: 'model-store-management',
      label: t('adminModelCard.ModelStoreManagement'),
    },
    isPrometheusPresetSupported && {
      key: 'prometheus-preset',
      label: t('webui.menu.PrometheusPreset'),
    },
    isDeploymentPresetSupported && {
      key: 'deployment-presets',
      label: t('adminDeploymentPreset.TabTitle'),
    },
    {
      key: 'runtime-variant-presets',
      label: t('adminRuntimeVariantPreset.TabTitle'),
    },
  ]);

  return (
    <BAICard
      variant="borderless"
      activeTabKey={currentTab}
      onTabChange={onTabChange}
      tabList={tabItems}
    >
      <Suspense fallback={<Skeleton active />}>
        {currentTab === 'deployments' && (
          <BAIErrorBoundary>
            {deploymentQueryRef ? (
              <AdminDeployment
                queryRef={deploymentQueryRef}
                onReload={reloadDeployments}
                tableSettings={{
                  columnOverrides: deploymentColumnOverrides,
                  onColumnOverridesChange: setDeploymentColumnOverrides,
                }}
              />
            ) : (
              <Skeleton active />
            )}
          </BAIErrorBoundary>
        )}
        {currentTab === 'model-store-management' && (
          <BAIErrorBoundary>
            {modelCardQueryRef ? (
              <AdminModelCardTable
                queryRef={modelCardQueryRef}
                onReload={reloadModelCards}
                tableSettings={{
                  columnOverrides: modelCardColumnOverrides,
                  onColumnOverridesChange: setModelCardColumnOverrides,
                }}
              />
            ) : (
              <Skeleton active />
            )}
          </BAIErrorBoundary>
        )}
        {currentTab === 'prometheus-preset' && isPrometheusPresetSupported && (
          <BAIErrorBoundary>
            {prometheusQueryRef ? (
              <AdminPrometheusPreset
                queryRef={prometheusQueryRef}
                onReload={reloadPrometheusPresets}
                tableSettings={{
                  columnOverrides: prometheusColumnOverrides,
                  onColumnOverridesChange: setPrometheusColumnOverrides,
                }}
              />
            ) : (
              <Skeleton active />
            )}
          </BAIErrorBoundary>
        )}
        {currentTab === 'deployment-presets' && isDeploymentPresetSupported && (
          <BAIErrorBoundary>
            {deploymentPresetQueryRef ? (
              <AdminDeploymentPreset
                queryRef={deploymentPresetQueryRef}
                onReload={reloadDeploymentPresets}
                tableSettings={{
                  columnOverrides: deploymentPresetColumnOverrides,
                  onColumnOverridesChange: setDeploymentPresetColumnOverrides,
                }}
              />
            ) : (
              <Skeleton active />
            )}
          </BAIErrorBoundary>
        )}
        {currentTab === 'runtime-variant-presets' && (
          <BAIErrorBoundary>
            {presetQueryRef ? (
              <AdminRuntimeVariantPreset
                queryRef={presetQueryRef}
                onReload={reloadRuntimeVariantPresets}
                tableSettings={{
                  columnOverrides: presetColumnOverrides,
                  onColumnOverridesChange: setPresetColumnOverrides,
                }}
              />
            ) : (
              <Skeleton active />
            )}
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default AdminDeploymentPage;
