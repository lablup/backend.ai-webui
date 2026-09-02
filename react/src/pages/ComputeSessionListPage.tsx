/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ComputeSessionListPageQuery,
  ComputeSessionListPageQuery$data,
  ComputeSessionListPageQuery$variables,
} from '../__generated__/ComputeSessionListPageQuery.graphql';
import { App } from '../app-shim';
import ActionItemContent from '../components/ActionItemContent';
import AutoUpdateFetchKeyButton from '../components/AutoUpdateFetchKeyButton';
import BAIRadioGroup from '../components/BAIRadioGroup';
import BAITabs from '../components/BAITabs';
import TerminateSessionModal from '../components/ComputeSessionNodeItems/TerminateSessionModal';
import ConfigurableResourceCard from '../components/ConfigurableResourceCard';
import SessionNodes, {
  availableSessionSorterValues,
} from '../components/SessionNodes';
import SessionResourceGrid from '../components/SessionResourceGrid';
import { handleRowSelectionChange } from '../helper';
import { ExtractResultValue } from '../helper/resultTypes';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserInfo, useCurrentUserRole } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCSVExport } from '../hooks/useCSVExport';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useProjectPath } from '../hooks/useRouteScope';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Grid, GridSpan } from '@astryxdesign/core/Grid';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import * as stylex from '@stylexjs/stylex';
import {
  BAIAlertIconWithTooltip,
  BAICard,
  BAIFlex,
  BAILink,
  BAIPropertyFilter,
  BAIResourceUnitGridSkeleton,
  BAISelectionLabel,
  BAISessionsIcon,
  BAITabCountBadge,
  filterOutNullAndUndefined,
  INITIAL_FETCH_KEY,
  mergeFilterValues,
  useBAILogger,
  useFetchKey,
  useBAIBreakpoint,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { LayoutGridIcon, PowerOffIcon, TableIcon } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense, useDeferredValue, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useLocation } from 'react-router-dom';

const typeFilterValues = [
  'all',
  'interactive',
  'batch',
  'inference',
  'system',
] as const;
type TypeFilterType = (typeof typeFilterValues)[number];

// Extract the success value type from Result
type ComputeSessionNodesData = ExtractResultValue<
  ComputeSessionListPageQuery$data['computeSessionNodeResult']
>;

type SessionNode = NonNullableNodeOnEdges<ComputeSessionNodesData>;

const CARD_MIN_HEIGHT = 200;

const NOT_FINISHED_STATUS_FILTER =
  'status != "TERMINATED" & status != "CANCELLED"';

const styles = stylex.create({
  // The title only renders on >=lg, where maxWidth was always 120.
  actionCardTitle: {
    maxWidth: 120,
  },
});

const ComputeSessionListPage = () => {
  'use memo';
  const currentProject = useCurrentProjectValue();

  const userRole = useCurrentUserRole();
  const [currentUser] = useCurrentUserInfo();
  const baiClient = useSuspendedBackendaiClient();

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const webUINavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  const location = useLocation();
  const [selectedSessionList, setSelectedSessionList] = useState<
    Array<SessionNode>
  >([]);
  const [isOpenTerminateModal, setOpenTerminateModal] = useState(false);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.ComputeSessionListPage',
  );

  const { supportedFields, exportCSV } = useCSVExport('sessions');

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableSessionSorterValues),
      filter: parseAsString.withDefault(''),
      type: parseAsStringLiteral(typeFilterValues).withDefault('all'),
      statusCategory: parseAsStringLiteral(['running', 'finished']).withDefault(
        'running',
      ),
      view: parseAsStringLiteral(['table', 'grid']).withDefault('table'),
    },
    {
      history: 'replace',
    },
  );

  const [experimentalSessionResourceGrid] = useBAISettingUserState(
    'experimental_session_resource_grid',
  );
  // Grid view is gated behind an experimental opt-in (FR-3570); when off, the
  // effective view is always 'table' regardless of the `view` URL param, but
  // the param itself is left untouched so the stored choice comes back if the
  // flag is re-enabled.
  const effectiveView = experimentalSessionResourceGrid
    ? queryParams.view
    : 'table';

  // `view` is page-level state, not per-tab: keep it out of the snapshots so
  // restoring a tab never flips the table/grid toggle.
  const queryMapRef = useRef({
    [queryParams.type]: {
      queryParams: _.omit(queryParams, ['view']),
      tablePaginationOption,
    },
  });

  useEffect(() => {
    queryMapRef.current[queryParams.type] = {
      queryParams: _.omit(queryParams, ['view']),
      tablePaginationOption,
    };
  }, [queryParams, tablePaginationOption]);

  const typeFilter =
    queryParams.type === 'all' || queryParams.type === undefined
      ? undefined
      : `type == "${queryParams.type}"`;

  const statusFilter =
    queryParams.statusCategory === 'running' ||
    queryParams.statusCategory === undefined
      ? NOT_FINISHED_STATUS_FILTER
      : 'status == "TERMINATED" | status == "CANCELLED"';

  const isNotRunningCategory = (status?: string | null) => {
    return status === 'TERMINATED' || status === 'CANCELLED';
  };

  const [fetchKey, updateFetchKey] = useFetchKey();

  // This page is strictly personal: even admins/monitors (who hold read
  // permission on all project sessions) should only see their own sessions.
  const currentUserFilter = `user_id == "${currentUser.uuid}"`;

  const queryVariables: ComputeSessionListPageQuery$variables = {
    scopeId: `project:${currentProject.id}`,
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.first,
    filter: mergeFilterValues([
      statusFilter,
      queryParams.filter,
      typeFilter,
      currentUserFilter,
    ]),
    order: queryParams.order || '-created_at',
    allFilter: mergeFilterValues([
      NOT_FINISHED_STATUS_FILTER,
      currentUserFilter,
    ]),
    interactiveFilter: mergeFilterValues([
      NOT_FINISHED_STATUS_FILTER,
      'type == "interactive"',
      currentUserFilter,
    ]),
    inferenceFilter: mergeFilterValues([
      NOT_FINISHED_STATUS_FILTER,
      'type == "inference"',
      currentUserFilter,
    ]),
    batchFilter: mergeFilterValues([
      NOT_FINISHED_STATUS_FILTER,
      'type == "batch"',
      currentUserFilter,
    ]),
    systemFilter: mergeFilterValues([
      NOT_FINISHED_STATUS_FILTER,
      'type == "system"',
      currentUserFilter,
    ]),
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryRef = useLazyLoadQuery<ComputeSessionListPageQuery>(
    graphql`
      query ComputeSessionListPageQuery(
        $scopeId: ScopeField
        $first: Int = 20
        $offset: Int = 0
        $filter: String
        $order: String
        $allFilter: String
        $interactiveFilter: String
        $inferenceFilter: String
        $batchFilter: String
        $systemFilter: String
      ) {
        computeSessionNodeResult: compute_session_nodes(
          scope_id: $scopeId
          first: $first
          offset: $offset
          filter: $filter
          order: $order
        ) @catch(to: RESULT) {
          edges @required(action: THROW) {
            node @required(action: THROW) {
              id @required(action: THROW)
              name @required(action: THROW)
              ...SessionNodesFragment
              ...TerminateSessionModalFragment
            }
          }
          count
        }
        all: compute_session_nodes(
          scope_id: $scopeId
          first: 0
          offset: 0
          filter: $allFilter
        ) {
          count
        }
        interactive: compute_session_nodes(
          scope_id: $scopeId
          first: 0
          offset: 0
          filter: $interactiveFilter
        ) {
          count
        }
        inference: compute_session_nodes(
          scope_id: $scopeId
          first: 0
          offset: 0
          filter: $inferenceFilter
        ) {
          count
        }
        batch: compute_session_nodes(
          scope_id: $scopeId
          first: 0
          offset: 0
          filter: $batchFilter
        ) {
          count
        }
        system: compute_session_nodes(
          scope_id: $scopeId
          first: 0
          offset: 0
          filter: $systemFilter
        ) {
          count
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: deferredFetchKey,
    },
  );

  const { computeSessionNodeResult, ...sessionCounts } = queryRef;
  const compute_session_nodes = computeSessionNodeResult.ok
    ? computeSessionNodeResult.value
    : null;
  // Responsive policy R3 (ticket 14): the render tree branches on `lg`
  // (the action card is unmounted below lg), so the JS hook stays; the antd
  // Row/Col track layout becomes an Astryx 24-column Grid whose spans are
  // picked from the same booleans (asymmetric split — the uniform minWidth
  // model does not apply here).
  const { lg, xl } = useBAIBreakpoint();

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      <Grid columns={24} gap={4}>
        {lg && (
          <GridSpan columns={xl ? 4 : 8}>
            <BAICard
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              <ActionItemContent
                title={
                  <Text xstyle={styles.actionCardTitle}>
                    {t('start.CreateASession')}
                  </Text>
                }
                buttonText={t('start.button.StartSession')}
                icon={<BAISessionsIcon />}
                type="simple"
                to={buildProjectPath('session/start')}
                style={{
                  height: '100%',
                }}
              />
            </BAICard>
          </GridSpan>
        )}

        <GridSpan columns={lg ? (xl ? 20 : 16) : 24}>
          <ErrorBoundary
            fallbackRender={() => {
              return (
                <BAICard
                  style={{
                    width: '100%',
                  }}
                  status="error"
                  extra={
                    <BAIAlertIconWithTooltip
                      title={t('error.UnexpectedError')}
                    />
                  }
                />
              );
            }}
          >
            <Suspense
              fallback={
                <BAICard
                  style={{
                    width: '100%',
                  }}
                  loading
                />
              }
            >
              <ConfigurableResourceCard
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: lg ? CARD_MIN_HEIGHT : undefined,
                }}
                fetchKey={deferredFetchKey}
              />
            </Suspense>
          </ErrorBoundary>
        </GridSpan>
      </Grid>
      <BAICard
        variant="borderless"
        title={t('webui.menu.Sessions')}
        extra={
          <BAILink to={buildProjectPath('session/start')}>
            <Button variant="primary" label={t('start.button.StartSession')} />
          </BAILink>
        }
        styles={{
          header: {
            borderBottom: 'none',
          },
          body: {
            paddingTop: 0,
          },
        }}
      >
        <BAITabs
          activeKey={queryParams.type}
          onChange={(key) => {
            const storedQuery = queryMapRef.current[key] || {
              queryParams: {
                statusCategory: 'running',
              },
            };
            // Set to null first to reset to default values
            setQueryParams(null);
            setQueryParams({
              ...storedQuery.queryParams,
              type: key as TypeFilterType,
              view: queryParams.view,
            });
            setTablePaginationOption(
              storedQuery.tablePaginationOption || { current: 1 },
            );
            setSelectedSessionList([]);
          }}
          items={_.map(
            {
              all: t('general.All'),
              interactive: t('session.Interactive'),
              batch: t('session.Batch'),
              inference: t('session.Inference'),
              system: t('session.System'),
            },
            (label, key) => ({
              key,
              label,
              endContent: (
                <BAITabCountBadge
                  // @ts-ignore
                  count={sessionCounts[key]?.count}
                  selected={queryParams.type === key}
                />
              ),
            }),
          )}
        />
        <BAIFlex direction="column" align="stretch" gap={'sm'}>
          <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
            <BAIFlex
              gap={'sm'}
              align="start"
              style={{
                flexShrink: 1,
              }}
              wrap="wrap"
            >
              <BAIRadioGroup
                optionType="button"
                value={queryParams.statusCategory}
                onChange={(e) => {
                  setQueryParams({ statusCategory: e.target.value });
                  setTablePaginationOption({ current: 1 });
                  setSelectedSessionList([]);
                }}
                options={[
                  {
                    label: t('session.Running'),
                    value: 'running',
                  },
                  {
                    label: t('session.Finished'),
                    value: 'finished',
                  },
                ]}
              />
              <BAIPropertyFilter
                filterProperties={[
                  {
                    key: 'name',
                    propertyLabel: t('session.SessionName'),
                    type: 'string',
                  },
                  {
                    key: 'scaling_group',
                    propertyLabel: t('session.ResourceGroup'),
                    type: 'string',
                  },
                  {
                    key: 'agent_ids',
                    propertyLabel: t('session.Agent'),
                    type: 'string',
                  },
                ]}
                value={queryParams.filter || undefined}
                onChange={(value) => {
                  setQueryParams({ filter: value || '' });
                  setTablePaginationOption({ current: 1 });
                  setSelectedSessionList([]);
                }}
              />
            </BAIFlex>
            <BAIFlex gap={'xs'}>
              {selectedSessionList.length > 0 && (
                <>
                  <BAISelectionLabel
                    count={selectedSessionList.length}
                    onClearSelection={() => setSelectedSessionList([])}
                  />
                  <IconButton
                    label={t('session.TerminateSession')}
                    tooltip={t('session.TerminateSession')}
                    icon={<PowerOffIcon color="var(--color-error)" />}
                    onClick={() => {
                      setOpenTerminateModal(true);
                    }}
                  />
                </>
              )}
              {experimentalSessionResourceGrid && (
                <SegmentedControl
                  label={t('session.resourceGrid.ViewMode')}
                  value={queryParams.view}
                  onChange={(value) =>
                    setQueryParams({ view: value as 'table' | 'grid' })
                  }
                >
                  <Tooltip content={t('session.resourceGrid.TableView')}>
                    <SegmentedControlItem
                      value="table"
                      label={t('session.resourceGrid.TableView')}
                      isLabelHidden
                      icon={<TableIcon size="1em" />}
                    />
                  </Tooltip>
                  <Tooltip content={t('session.resourceGrid.GridView')}>
                    <SegmentedControlItem
                      value="grid"
                      label={t('session.resourceGrid.GridView')}
                      isLabelHidden
                      icon={<LayoutGridIcon size="1em" />}
                    />
                  </Tooltip>
                </SegmentedControl>
              )}
              <AutoUpdateFetchKeyButton
                settingId="session-list"
                defaultAutoUpdateDelay={15_000}
                loading={
                  deferredQueryVariables !== queryVariables ||
                  deferredFetchKey !== fetchKey
                }
                // showLastLoadTime
                value={fetchKey}
                onChange={(newFetchKey) => {
                  updateFetchKey(newFetchKey);
                }}
              />
            </BAIFlex>
          </BAIFlex>
          {effectiveView === 'grid' ? (
            // Keyed by the UNdeferred filter/order: a change remounts the
            // boundary so its fallback shows immediately, instead of the
            // refetch being held hidden until the next poll commit. The
            // fetchKey stays deferred so poll refreshes never flash.
            <Suspense
              key={`${queryVariables.filter ?? ''}:${queryVariables.order ?? ''}`}
              fallback={<BAIResourceUnitGridSkeleton />}
            >
              <SessionResourceGrid
                filter={queryVariables.filter}
                order={queryVariables.order ?? undefined}
                projectId={currentProject.id}
                fetchKey={deferredFetchKey}
                onClickSession={(sessionId) => {
                  const newSearchParams = new URLSearchParams(location.search);
                  newSearchParams.set('sessionDetail', sessionId);
                  webUINavigate({
                    pathname: location.pathname,
                    hash: location.hash,
                    search: newSearchParams.toString(),
                  });
                }}
              />
            </Suspense>
          ) : computeSessionNodeResult.ok ? (
            <SessionNodes
              order={queryParams.order}
              onClickSessionName={(session) => {
                // Set sessionDetailDrawerFrgmt in location state via webUINavigate
                // instead of directly setting sessionDetailId query param
                // to avoid additional fetch in SessionDetailDrawer
                const newSearchParams = new URLSearchParams(location.search);
                newSearchParams.set('sessionDetail', session.row_id);
                webUINavigate(
                  {
                    pathname: location.pathname,
                    hash: location.hash,
                    search: newSearchParams.toString(),
                  },
                  {
                    state: {
                      sessionDetailDrawerFrgmt: session,
                      createdAt: new Date().toISOString(),
                    },
                  },
                );
              }}
              loading={deferredQueryVariables !== queryVariables}
              rowSelection={{
                type: 'checkbox',
                // Preserve selected rows between pages, but clear when filter changes
                preserveSelectedRowKeys: true,
                getCheckboxProps(record) {
                  return {
                    disabled: isNotRunningCategory(record.status),
                  };
                },
                onChange: (selectedRowKeys) => {
                  // Using selectedRowKeys to retrieve selected rows since selectedRows lack nested fragment types
                  handleRowSelectionChange(
                    selectedRowKeys,
                    filterOutNullAndUndefined(
                      compute_session_nodes?.edges.map((e) => e?.node),
                    ),
                    setSelectedSessionList,
                  );
                },
                selectedRowKeys: _.map(selectedSessionList, (i) => i.id),
              }}
              sessionsFrgmt={filterOutNullAndUndefined(
                compute_session_nodes?.edges.map((e) => e?.node),
              )}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                current: tablePaginationOption.current,
                total: compute_session_nodes?.count ?? 0,
                onChange: (current, pageSize) => {
                  if (_.isNumber(current) && _.isNumber(pageSize)) {
                    setTablePaginationOption({ current, pageSize });
                  }
                },
              }}
              onChangeOrder={(order) => {
                setQueryParams({ order });
              }}
              tableSettings={{
                columnOverrides: columnOverrides,
                onColumnOverridesChange: setColumnOverrides,
              }}
              exportSettings={
                !_.isEmpty(supportedFields) &&
                (userRole === 'superadmin' || userRole === 'admin')
                  ? {
                      supportedFields,
                      onExport: async (selectedExportKeys) => {
                        const csvFilter: Record<string, unknown> = {};
                        if (queryParams.statusCategory === 'finished') {
                          csvFilter.status = ['TERMINATED', 'CANCELLED'];
                        } else {
                          csvFilter.status = [
                            'PENDING',
                            'SCHEDULED',
                            'PREPARING',
                            'PREPARED',
                            'CREATING',
                            'PULLING',
                            'RESTARTING',
                            'RUNNING',
                            'TERMINATING',
                            'ERROR',
                          ];
                        }
                        if (queryParams.type && queryParams.type !== 'all') {
                          csvFilter.session_type = [queryParams.type];
                        }
                        // This page is strictly personal (see currentUserFilter
                        // above), so the CSV export must be scoped to the current
                        // user too — otherwise an admin exports every user's
                        // sessions. Mirrors the table's user_id filter via the
                        // session export `user.email` filter (BA-6480).
                        if (
                          baiClient.supports('session-export-user-filter') &&
                          currentUser.email
                        ) {
                          csvFilter.user = {
                            email: { equals: currentUser.email },
                          };
                        }
                        await exportCSV(selectedExportKeys, csvFilter).catch(
                          (err) => {
                            message.error(t('general.ErrorOccurred'));
                            logger.error(err);
                          },
                        );
                      },
                    }
                  : undefined
              }
            />
          ) : (
            <Banner status="error" title={t('error.FailedToLoadTableData')} />
          )}
        </BAIFlex>
      </BAICard>
      <TerminateSessionModal
        open={isOpenTerminateModal}
        sessionFrgmts={selectedSessionList}
        onRequestClose={(success) => {
          setOpenTerminateModal(false);
          if (success) {
            setSelectedSessionList([]);
          }
        }}
      />
    </BAIFlex>
  );
};

export default ComputeSessionListPage;
