/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AgentSessionsQuery,
  SessionV2Filter,
  SessionV2OrderBy,
  SessionV2Status,
} from '../../__generated__/AgentSessionsQuery.graphql';
import { convertToOrderBy } from '../../helper';
import { useWebUINavigate } from '../../hooks';
import { useBAIPaginationOptionState } from '../../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useProjectPath } from '../../hooks/useRouteScope';
import AutoUpdateFetchKeyButton from '../AutoUpdateFetchKeyButton';
import BAIRadioGroup from '../BAIRadioGroup';
import {
  BAIFlex,
  BAILink,
  BAISessionNodesV2,
  INITIAL_FETCH_KEY,
  availableSessionV2SorterValues,
  filterOutNullAndUndefined,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// Same status buckets as ProjectAdminSessionPage — sessions still occupying
// (or about to occupy) agent resources vs. finished ones kept for history.
const RUNNING_STATUSES: ReadonlyArray<SessionV2Status> = [
  'PENDING',
  'SCHEDULED',
  'PREPARING',
  'PREPARED',
  'CREATING',
  'RUNNING',
  'DEPRIORITIZING',
  'TERMINATING',
];

const FINISHED_STATUSES: ReadonlyArray<SessionV2Status> = [
  'TERMINATED',
  'CANCELLED',
];

interface AgentSessionsProps {
  agentId: string;
}

const AgentSessions: React.FC<AgentSessionsProps> = ({ agentId }) => {
  'use memo';
  const { t } = useTranslation();
  const webUINavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();

  const [statusCategory, setStatusCategory] = useState<'running' | 'finished'>(
    'running',
  );
  const [order, setOrder] = useState<
    (typeof availableSessionV2SorterValues)[number] | null
  >(null);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });

  const [fetchKey, updateFetchKey] = useFetchKey();

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AgentSessions',
  );

  const statusFilter: SessionV2Filter['status'] =
    statusCategory === 'running'
      ? { in: RUNNING_STATUSES as readonly SessionV2Status[] }
      : { in: FINISHED_STATUSES as readonly SessionV2Status[] };

  const queryVariables = {
    agentFilter: { id: { equals: agentId } },
    sessionFilter: { status: statusFilter },
    orderBy: convertToOrderBy<Required<SessionV2OrderBy>>(order) ?? [
      { field: 'CREATED_AT', direction: 'DESC' } as Required<SessionV2OrderBy>,
    ],
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  // TODO(FR-3251): `AgentDetailDrawer` still runs on the legacy `AgentNode`
  // query because AgentV2 has no `live_stat` / `gpu_alloc_map` equivalents
  // yet. Once those land and the drawer migrates to `agentsV2`, drop this
  // standalone lookup query and read `AgentV2.sessions` as a fragment spread
  // on the drawer's agent node instead.
  const data = useLazyLoadQuery<AgentSessionsQuery>(
    graphql`
      query AgentSessionsQuery(
        $agentFilter: AgentFilter
        $sessionFilter: SessionV2Filter
        $orderBy: [SessionV2OrderBy!]
        $limit: Int
        $offset: Int
      ) {
        agentsV2(filter: $agentFilter, limit: 1) {
          edges {
            node {
              id
              sessions(
                filter: $sessionFilter
                orderBy: $orderBy
                limit: $limit
                offset: $offset
              ) {
                count
                edges {
                  node {
                    id
                    ...BAISessionNodesV2Fragment
                  }
                }
              }
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

  const sessionConnection = data.agentsV2?.edges?.[0]?.node?.sessions;
  const sessionNodes = filterOutNullAndUndefined(
    sessionConnection?.edges?.map((edge) => edge?.node),
  );
  const total = sessionConnection?.count ?? 0;

  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="between" wrap="wrap" gap="sm">
        <BAIRadioGroup
          optionType="button"
          value={statusCategory}
          onChange={(e) => {
            setStatusCategory(e.target.value);
            setTablePaginationOption({ current: 1 });
          }}
          options={[
            { label: t('session.Running'), value: 'running' },
            { label: t('session.Finished'), value: 'finished' },
          ]}
        />
        <AutoUpdateFetchKeyButton
          settingId="agent-detail-sessions"
          defaultAutoUpdateDelay={15_000}
          loading={isLoading}
          value={fetchKey}
          onChange={(next) => updateFetchKey(next)}
        />
      </BAIFlex>
      <BAISessionNodesV2
        sessionsFrgmt={sessionNodes}
        loading={isLoading}
        order={order}
        onChangeOrder={(nextOrder) => {
          setOrder(nextOrder);
        }}
        customizeColumns={(cols) =>
          cols.map((col) => {
            if (col.key !== 'name') return col;
            return {
              ...col,
              render: (_value, session) => (
                <BAILink
                  type="hover"
                  onClick={() => {
                    webUINavigate(
                      `${buildProjectPath('session', { scope: 'admin' })}?${new URLSearchParams(
                        {
                          sessionDetail: toLocalId(session.id),
                        },
                      ).toString()}`,
                    );
                  }}
                >
                  {session.metadata?.name ?? '-'}
                </BAILink>
              ),
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
          onColumnOverridesChange: setColumnOverrides,
        }}
      />
    </BAIFlex>
  );
};

export default AgentSessions;
