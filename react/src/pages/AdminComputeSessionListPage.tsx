/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  AdminComputeSessionListPageQuery,
  AdminComputeSessionListPageQuery$data,
  AdminComputeSessionListPageQuery$variables,
} from '../__generated__/AdminComputeSessionListPageQuery.graphql';
import { App } from '../app-shim';
import AutoUpdateFetchKeyButton from '../components/AutoUpdateFetchKeyButton';
import BAIRadioGroup from '../components/BAIRadioGroup';
import BAITabs from '../components/BAITabs';
import TerminateSessionModal from '../components/ComputeSessionNodeItems/TerminateSessionModal';
import SessionNodes, {
  availableSessionSorterValues,
} from '../components/SessionNodes';
import SessionResourceGrid from '../components/SessionResourceGrid';
import { handleRowSelectionChange } from '../helper';
import { ExtractResultValue } from '../helper/resultTypes';
import { useWebUINavigate } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCSVExport } from '../hooks/useCSVExport';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIAdminProjectSelectAstryx,
  BAICard,
  BAIFlex,
  BAIPropertyFilter,
  BAISelectionLabel,
  filterOutEmpty,
  filterOutNullAndUndefined,
  INITIAL_FETCH_KEY,
  mergeFilterValues,
  PRIMARY_TAG_VARIANT,
  useBAILogger,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { LayoutGridIcon, PowerOffIcon, TableIcon } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense, useDeferredValue, useEffect, useRef, useState } from 'react';
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
  AdminComputeSessionListPageQuery$data['computeSessionNodeResult']
>;

type SessionNode = NonNullableNodeOnEdges<ComputeSessionNodesData>;

// Splits a queryfilter string on top-level `&` only (never inside quotes or
// parentheses), so `(a)&(b | c)` stays two segments.
const splitTopLevelAnd = (filter: string): string[] => {
  const segments: string[] = [];
  let depth = 0;
  let inQuote = false;
  let current = '';
  for (const ch of filter) {
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (!inQuote && ch === '(') {
      depth += 1;
    } else if (!inQuote && ch === ')') {
      depth -= 1;
    }
    if (ch === '&' && depth === 0 && !inQuote) {
      segments.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  segments.push(current);
  return segments.map((s) => s.trim()).filter(Boolean);
};

const AdminComputeSessionListPage = () => {
  'use memo';

  const userRole = useCurrentUserRole();

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const webUINavigate = useWebUINavigate();
  const location = useLocation();
  const [selectedSessionList, setSelectedSessionList] = useState<
    Array<SessionNode>
  >([]);
  const [isOpenTerminateModal, setOpenTerminateModal] = useState(false);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AdminComputeSessionListPage',
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

  const queryMapRef = useRef({
    [queryParams.type]: {
      queryParams,
      tablePaginationOption,
    },
  });

  useEffect(() => {
    queryMapRef.current[queryParams.type] = {
      queryParams,
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
      ? 'status != "TERMINATED" & status != "CANCELLED"'
      : 'status == "TERMINATED" | status == "CANCELLED"';

  const isNotRunningCategory = (status?: string | null) => {
    return status === 'TERMINATED' || status === 'CANCELLED';
  };

  const [fetchKey, updateFetchKey] = useFetchKey();

  // scopeId is intentionally omitted so superadmin sees all sessions across all projects/domains
  const queryVariables: AdminComputeSessionListPageQuery$variables = {
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.first,
    filter: mergeFilterValues([statusFilter, queryParams.filter, typeFilter]),
    order: queryParams.order || '-created_at',
  };

  // The grid's legacy compute_session_list has no `project_id` queryfilter
  // field — lift the filter UI's project condition to the query's group_id
  // argument. Only a segment that IS a bare project predicate is lifted and
  // stripped; a compound segment mentioning project_id is passed through
  // untouched (the grid then surfaces the backend error) rather than
  // silently narrowing the result set. The UUID comes from the project
  // select, so an `ilike "%uuid%"` predicate is equality in practice.
  let gridProjectId: string | undefined;
  const keptSegments: string[] = [];
  for (const seg of splitTopLevelAnd(queryParams.filter ?? '')) {
    const m = /^\(*\s*project_id\s+(?:==|ilike)\s+"%?([^"%]+)%?"\s*\)*$/.exec(
      seg,
    );
    if (m) {
      gridProjectId ??= m[1];
    } else {
      keptSegments.push(seg);
    }
  }
  const gridFilter = mergeFilterValues([
    statusFilter,
    keptSegments.join('&') || undefined,
    typeFilter,
  ]);

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryRef = useLazyLoadQuery<AdminComputeSessionListPageQuery>(
    graphql`
        query AdminComputeSessionListPageQuery(
          $first: Int = 20
          $offset: Int = 0
          $filter: String
          $order: String
        ) {
          computeSessionNodeResult: compute_session_nodes(
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
            first: 0
            offset: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\""
          ) {
            count
          }
          interactive: compute_session_nodes(
            first: 0
            offset: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"interactive\""
          ) {
            count
          }
          inference: compute_session_nodes(
            first: 0
            offset: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"inference\""
          ) {
            count
          }
          batch: compute_session_nodes(
            first: 0
            offset: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"batch\""
          ) {
            count
          }
          system: compute_session_nodes(
            first: 0
            offset: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"system\""
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

  return (
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
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
            label: (
              <BAIFlex justify="center" gap={10}>
                {label}
                {
                  // display badge only if count is greater than 0
                  // @ts-ignore
                  (sessionCounts[key]?.count || 0) > 0 && (
                    <Badge
                      // PILOT-DECISION: antd count Badge (brand color when the
                      // tab is active, gray otherwise) -> Astryx Badge pill.
                      // Arbitrary token colors are inexpressible (P5); the
                      // active state maps to PRIMARY_TAG_VARIANT (policy
                      // class 4) and the inactive state to `neutral`. The
                      // 10px font-size / paddingXS tweaks are dropped
                      // (defaults-first).
                      variant={
                        queryParams.type === key
                          ? PRIMARY_TAG_VARIANT
                          : 'neutral'
                      }
                      label={
                        // @ts-ignore
                        sessionCounts[key].count
                      }
                    />
                  )
                }
              </BAIFlex>
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
              filterProperties={filterOutEmpty([
                {
                  // `project_id` is the compute_session queryfilter field
                  // mapped to the session's group (project) UUID.
                  key: 'project_id',
                  propertyLabel: t('data.Project'),
                  type: 'string',
                  defaultOperator: '==',
                  renderInput: ({ onAddCondition }) => (
                    <BAIAdminProjectSelectAstryx
                      // The filter row already prints the property label.
                      label={t('data.Project')}
                      isLabelHidden
                      value={null}
                      width={200}
                      onChange={(value, option) => {
                        // P3C-1: the second argument survives on this wrapper so
                        // the condition tag stays human-readable (project name)
                        // while the UUID serializes into the filter.
                        onAddCondition(
                          value as string | undefined,
                          _.castArray(option ?? [])[0]?.label,
                        );
                      }}
                    />
                  ),
                },
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
                {
                  key: 'user_email',
                  propertyLabel: t('session.launcher.OwnerEmail'),
                  type: 'string',
                },
              ])}
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
            <AutoUpdateFetchKeyButton
              settingId="admin-session-list"
              defaultAutoUpdateDelay={15_000}
              loading={
                deferredQueryVariables !== queryVariables ||
                deferredFetchKey !== fetchKey
              }
              value={fetchKey}
              onChange={(newFetchKey) => {
                updateFetchKey(newFetchKey);
              }}
            />
          </BAIFlex>
        </BAIFlex>
        {queryParams.view === 'grid' ? (
          // Keyed by the UNdeferred filter/order: a change remounts the
          // boundary so its fallback shows immediately, instead of the
          // refetch being held hidden until the next poll commit. The
          // fetchKey stays deferred so poll refreshes never flash.
          <Suspense
            key={`${gridFilter ?? ''}:${gridProjectId ?? ''}:${queryVariables.order ?? ''}`}
            fallback={
              <BAICard style={{ width: '100%' }} loading variant="borderless" />
            }
          >
            <SessionResourceGrid
              filter={gridFilter}
              projectId={gridProjectId}
              order={queryVariables.order ?? undefined}
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
              preserveSelectedRowKeys: true,
              getCheckboxProps(record) {
                return {
                  disabled: isNotRunningCategory(record.status),
                };
              },
              onChange: (selectedRowKeys) => {
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
              defaultColumnOverrides: {
                environment: { hidden: false },
                resourceGroup: { hidden: false },
                type: { hidden: false },
                cluster_mode: { hidden: false },
                created_at: { hidden: false },
                project_id: { hidden: false },
              },
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

export default AdminComputeSessionListPage;
