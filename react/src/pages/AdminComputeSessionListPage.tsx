/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  AdminComputeSessionListPageQuery,
  AdminComputeSessionListPageQuery$data,
  AdminComputeSessionListPageQuery$variables,
} from '../__generated__/AdminComputeSessionListPageQuery.graphql';
import BAIRadioGroup from '../components/BAIRadioGroup';
import BAITabs from '../components/BAITabs';
import TerminateSessionModal from '../components/ComputeSessionNodeItems/TerminateSessionModal';
import SessionNodes, {
  availableSessionSorterValues,
} from '../components/SessionNodes';
import { handleRowSelectionChange } from '../helper';
import { ExtractResultValue } from '../helper/resultTypes';
import { useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useEffectiveAdminRole } from '../hooks/useCurrentUserProjectRoles';
import { Alert, App, Badge, Button, theme, Tooltip } from 'antd';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIPropertyFilter,
  BAISelectionLabel,
  filterOutEmpty,
  filterOutNullAndUndefined,
  INITIAL_FETCH_KEY,
  mergeFilterValues,
  useBAILogger,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PowerOffIcon } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useLocation } from 'react-router-dom';
import { useCurrentUserRole } from 'src/hooks/backendai';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';
import { useCSVExport } from 'src/hooks/useCSVExport';

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

const AdminComputeSessionListPage = () => {
  'use memo';

  const userRole = useCurrentUserRole();
  const effectiveAdminRole = useEffectiveAdminRole();
  const currentProject = useCurrentProjectValue();

  // Scope the admin session list by the user's effective admin role.
  // - superadmin: no scope → global view across all projects/domains (unchanged)
  // - domainAdmin: no scope as interim (see TODO below); backend support tracked in FR-2313
  // - projectAdmin: scope to the currently selected project
  // - none: defensive fallback; admin page should not be reachable in this case
  // TODO(needs-backend): FR-2313 — domain scope for compute_session_nodes
  const scopeId: string | undefined =
    effectiveAdminRole === 'projectAdmin' && currentProject.id
      ? `project:${currentProject.id}`
      : undefined;

  const { t } = useTranslation();
  const { token } = theme.useToken();
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

  // scopeId is derived from the user's effective admin role:
  // - superadmin → undefined (global view across all projects/domains)
  // - projectAdmin → `project:<uuid>` (scoped to current project)
  // - domainAdmin → undefined (interim; domain scope tracked in FR-2313)
  const queryVariables: AdminComputeSessionListPageQuery$variables = {
    scopeId,
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.first,
    filter: mergeFilterValues([statusFilter, queryParams.filter, typeFilter]),
    order: queryParams.order || '-created_at',
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryRef = useLazyLoadQuery<AdminComputeSessionListPageQuery>(
    graphql`
        query AdminComputeSessionListPageQuery(
          $scopeId: ScopeField
          $first: Int = 20
          $offset: Int = 0
          $filter: String
          $order: String
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
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\""
          ) {
            count
          }
          interactive: compute_session_nodes(
            scope_id: $scopeId
            first: 0
            offset: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"interactive\""
          ) {
            count
          }
          inference: compute_session_nodes(
            scope_id: $scopeId
            first: 0
            offset: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"inference\""
          ) {
            count
          }
          batch: compute_session_nodes(
            scope_id: $scopeId
            first: 0
            offset: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"batch\""
          ) {
            count
          }
          system: compute_session_nodes(
            scope_id: $scopeId
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
                      // @ts-ignore
                      count={sessionCounts[key].count}
                      color={
                        queryParams.type === key
                          ? token.colorPrimary
                          : token.colorTextDisabled
                      }
                      size="small"
                      showZero
                      style={{
                        paddingRight: token.paddingXS,
                        paddingLeft: token.paddingXS,
                        fontSize: 10,
                      }}
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
          <BAIFlex gap={'sm'}>
            {selectedSessionList.length > 0 && (
              <>
                <BAISelectionLabel
                  count={selectedSessionList.length}
                  onClearSelection={() => setSelectedSessionList([])}
                />
                <Tooltip
                  title={t('session.TerminateSession')}
                  placement="topLeft"
                >
                  <Button
                    icon={<PowerOffIcon color={token.colorError} />}
                    onClick={() => {
                      setOpenTerminateModal(true);
                    }}
                  />
                </Tooltip>
              </>
            )}
            <BAIFetchKeyButton
              loading={
                deferredQueryVariables !== queryVariables ||
                deferredFetchKey !== fetchKey
              }
              autoUpdateDelay={15_000}
              value={fetchKey}
              onChange={(newFetchKey) => {
                updateFetchKey(newFetchKey);
              }}
            />
          </BAIFlex>
        </BAIFlex>
        {computeSessionNodeResult.ok ? (
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
          <Alert
            type="error"
            showIcon
            message={t('error.FailedToLoadTableData')}
          />
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
