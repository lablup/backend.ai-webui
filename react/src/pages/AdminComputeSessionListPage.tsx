/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AdminComputeSessionListPageQuery,
  AdminComputeSessionListPageQuery$data,
  SessionV2Filter,
  SessionV2OrderBy,
} from '../__generated__/AdminComputeSessionListPageQuery.graphql';
import { App } from '../app-shim';
import AutoUpdateFetchKeyButton from '../components/AutoUpdateFetchKeyButton';
import BAIRadioGroup from '../components/BAIRadioGroup';
import TerminateSessionModalV2 from '../components/TerminateSessionModalV2';
import { convertToOrderBy, handleRowSelectionChange } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCSVExport } from '../hooks/useCSVExport';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  BAIAdminProjectSelectAstryx,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAISelectionLabel,
  BAISessionNodesV2,
  INITIAL_FETCH_KEY,
  availableSessionV2SorterValues,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
  useBAILogger,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PowerOffIcon } from 'lucide-react';
import {
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
  useQueryStates,
} from 'nuqs';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const statusCategoryValues = ['running', 'finished'] as const;

const FINISHED_STATUSES = ['TERMINATED', 'CANCELLED'] as const;

// The query-level session node. It carries the masked fragment refs for both
// the table (`BAISessionNodesV2Fragment`) and the terminate modal
// (`TerminateSessionModalV2Fragment`), so row selection / the terminate target
// list pass these nodes straight to the modal.
type AdminSessionNode = NonNullableNodeOnEdges<
  AdminComputeSessionListPageQuery$data['adminSessionsV2']
>;

const AdminComputeSessionListPage = () => {
  'use memo';

  const userRole = useCurrentUserRole();
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  // AND/OR/NOT sub-filters only exist on managers with the `sub-filter`
  // capability (26.7.0+). On older managers, restrict the property filter to
  // a single condition so it emits a flat filter the backend accepts.
  const supportsSubFilter = baiClient.supports('sub-filter');
  const { message } = App.useApp();
  const { logger } = useBAILogger();

  const [selectedSessionList, setSelectedSessionList] = useState<
    Array<AdminSessionNode>
  >([]);
  const [terminateTargets, setTerminateTargets] = useState<
    Array<AdminSessionNode>
  >([]);
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  // Opens the legacy session detail drawer mounted at `AdminSessionPage`
  // (`SessionDetailAndContainerLogOpenerLegacy`). Superadmin has access to the
  // v1 `compute_session_node` query the drawer relies on, so name-click detail
  // keeps working until a v2 detail flow exists (FR-2944).
  const [, setSessionDetailId] = useQueryState(
    'sessionDetail',
    parseAsString.withOptions({ history: 'replace' }),
  );

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
      statusCategory:
        parseAsStringLiteral(statusCategoryValues).withDefault('running'),
      order: parseAsStringLiteral(availableSessionV2SorterValues),
      filter: parseAsJson<SessionV2Filter>((value) => value as SessionV2Filter),
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  // Mirrors the v1 filter semantics (`status != "TERMINATED" & status !=
  // "CANCELLED"`): `notIn` keeps every non-final status in the running
  // category without enumerating the full status list.
  const statusFilter =
    queryParams.statusCategory === 'running'
      ? { notIn: [...FINISHED_STATUSES] }
      : { in: [...FINISHED_STATUSES] };

  const isNotRunningCategory = (status?: string | null) => {
    return status === 'TERMINATED' || status === 'CANCELLED';
  };

  // scope is intentionally absent (`adminSessionsV2`) so superadmin sees all
  // sessions across all projects/domains.
  const queryVariables = {
    filter: {
      ...(queryParams.filter ?? {}),
      status: statusFilter,
    },
    orderBy: convertToOrderBy<Required<SessionV2OrderBy>>(
      queryParams.order,
    ) ?? [
      { field: 'CREATED_AT', direction: 'DESC' } as Required<SessionV2OrderBy>,
    ],
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const data = useLazyLoadQuery<AdminComputeSessionListPageQuery>(
    graphql`
      query AdminComputeSessionListPageQuery(
        $filter: SessionV2Filter
        $orderBy: [SessionV2OrderBy!]
        $limit: Int
        $offset: Int
      ) {
        adminSessionsV2(
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              metadata {
                name
              }
              ...BAISessionNodesV2Fragment
              ...TerminateSessionModalV2Fragment
            }
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

  const sessionNodes = filterOutNullAndUndefined(
    data.adminSessionsV2?.edges?.map((edge) => edge?.node),
  );
  const total = data.adminSessionsV2?.count ?? 0;

  const openTerminateModal = (targets: Array<AdminSessionNode>) => {
    setTerminateTargets(targets);
    setIsTerminateOpen(true);
  };

  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="between" wrap="wrap" gap="sm">
        <BAIFlex gap="sm" align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIRadioGroup
            optionType="button"
            value={queryParams.statusCategory}
            onChange={(e) => {
              setQueryParams({ statusCategory: e.target.value });
              setTablePaginationOption({ current: 1 });
              setSelectedSessionList([]);
            }}
            options={[
              { label: t('session.Running'), value: 'running' },
              { label: t('session.Finished'), value: 'finished' },
            ]}
          />
          <BAIGraphQLPropertyFilter<SessionV2Filter>
            singleCondition={!supportsSubFilter}
            filterProperties={[
              {
                key: 'id',
                propertyLabel: 'ID',
                type: 'uuid',
              },
              {
                key: 'name',
                propertyLabel: t('session.SessionName'),
                type: 'string',
              },
              {
                key: 'projectId',
                propertyLabel: t('data.Project'),
                type: 'uuid',
                renderInput: ({ onAddCondition }) => (
                  <BAIAdminProjectSelectAstryx
                    // The filter row already prints the property label.
                    label={t('data.Project')}
                    isLabelHidden
                    value={null}
                    width={200}
                    onChange={(value, option) => {
                      // The picker emits the project UUID; forward the option
                      // label (project name) so the condition tag stays
                      // readable while the UUID serializes into the filter.
                      onAddCondition(
                        value as string | undefined,
                        _.castArray(option ?? [])[0]?.label,
                      );
                    }}
                  />
                ),
              },
              {
                key: 'userUuid',
                propertyLabel: t('session.OwnerUUID'),
                type: 'uuid',
              },
              {
                key: 'domainName',
                propertyLabel: t('credential.Domain'),
                type: 'string',
              },
            ]}
            value={queryParams.filter ?? undefined}
            onChange={(value) => {
              setQueryParams({ filter: value ?? null });
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
                onClick={() => openTerminateModal(selectedSessionList)}
              />
            </>
          )}
          <AutoUpdateFetchKeyButton
            settingId="admin-session-list"
            defaultAutoUpdateDelay={15_000}
            loading={isLoading}
            value={fetchKey}
            onChange={(newFetchKey) => {
              updateFetchKey(newFetchKey);
            }}
          />
        </BAIFlex>
      </BAIFlex>
      <BAISessionNodesV2
        sessionsFrgmt={sessionNodes}
        loading={isLoading}
        order={queryParams.order}
        onChangeOrder={(order) => {
          setQueryParams({ order });
        }}
        rowSelection={{
          type: 'checkbox',
          preserveSelectedRowKeys: true,
          getCheckboxProps(record) {
            return {
              disabled: isNotRunningCategory(record.lifecycle?.status),
            };
          },
          onChange: (selectedRowKeys) => {
            handleRowSelectionChange(
              selectedRowKeys,
              sessionNodes,
              setSelectedSessionList,
            );
          },
          selectedRowKeys: selectedSessionList.map((session) => session.id),
        }}
        customizeColumns={(cols) =>
          cols.map((col) => {
            if (col.key !== 'name') return col;
            return {
              ...col,
              render: (_value, session) => {
                const status = session.lifecycle?.status;
                const isTerminated =
                  !!status &&
                  ['TERMINATED', 'CANCELLED', 'TERMINATING'].includes(status);
                // Recover the query-level node (which carries the terminate
                // modal's fragment ref) from the masked table row by id.
                const targetNode = sessionNodes.find(
                  (node) => node.id === session.id,
                );
                return (
                  <BAINameActionCell
                    title={session.metadata?.name ?? '-'}
                    onTitleClick={() => {
                      setSessionDetailId(toLocalId(session.id));
                    }}
                    showActions="always"
                    actions={filterOutEmpty([
                      {
                        key: 'terminate',
                        title: t('session.TerminateSession'),
                        icon: <PowerOffIcon />,
                        type: 'danger' as const,
                        disabled: isTerminated || !targetNode,
                        onClick: () =>
                          targetNode && openTerminateModal([targetNode]),
                      },
                    ])}
                  />
                );
              },
            };
          })
        }
        pagination={{
          current: tablePaginationOption.current,
          pageSize: tablePaginationOption.pageSize,
          total,
          onChange: (current, pageSize) => {
            setTablePaginationOption({ current, pageSize });
          },
        }}
        tableSettings={{
          columnOverrides: columnOverrides,
          // BAISessionNodesV2 hides these columns by default
          // (defaultHidden: true) to keep the shared component compact.
          // Override them to visible so the admin list keeps the
          // default-visible columns of the v1 admin session list.
          defaultColumnOverrides: {
            environment: { hidden: false },
            resourceGroup: { hidden: false },
            sessionType: { hidden: false },
            clusterMode: { hidden: false },
            createdAt: { hidden: false },
            project: { hidden: false },
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
                    csvFilter.status = [...FINISHED_STATUSES];
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
      <TerminateSessionModalV2
        open={isTerminateOpen}
        sessionsFrgmt={terminateTargets}
        onRequestClose={(success) => {
          setIsTerminateOpen(false);
          if (success) {
            setSelectedSessionList([]);
            updateFetchKey();
          }
        }}
      />
    </BAIFlex>
  );
};

export default AdminComputeSessionListPage;
