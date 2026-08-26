/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AgentSessionsQuery as AgentSessionsQueryType,
  SessionV2OrderBy,
  SessionV2Status,
} from '../../__generated__/AgentSessionsQuery.graphql';
import { convertToOrderBy } from '../../helper';
import { useWebUINavigate } from '../../hooks';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useProjectPath } from '../../hooks/useRouteScope';
import { useSessionV2StatusBuckets } from '../../hooks/useSessionV2StatusBuckets';
import AutoUpdateFetchKeyButton from '../AutoUpdateFetchKeyButton';
import BAIRadioGroup from '../BAIRadioGroup';
import {
  BAIFlex,
  BAILink,
  BAISessionNodesV2,
  availableSessionV2SorterValues,
  filterOutNullAndUndefined,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

// TODO(FR-3251): `AgentDetailDrawer` still runs on the legacy `AgentNode`
// query because AgentV2 has no `live_stat` / `gpu_alloc_map` equivalents
// yet. Once those land and the drawer migrates to `agentsV2`, drop this
// standalone lookup query and read `AgentV2.sessions` as a fragment spread
// on the drawer's agent node instead.
export const AgentSessionsQuery = graphql`
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
`;

interface AgentSessionsProps {
  queryRef: PreloadedQuery<AgentSessionsQueryType>;
  onReload: (
    variables: AgentSessionsQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
}

/**
 * The drawer owns `useQueryLoader` and loads the query when the sessions tab
 * is activated; this view reads the *deferred* `queryRef` so previous rows
 * stay visible while the next result loads. Render inside a `Suspense`
 * boundary.
 */
const AgentSessions = ({ queryRef, onReload }: AgentSessionsProps) => {
  'use memo';
  const { t } = useTranslation();
  const webUINavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();

  const [fetchKey, updateFetchKey] = useFetchKey();
  const statusBuckets = useSessionV2StatusBuckets();

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AgentSessions',
  );

  const statusCategory = _.includes(
    queryRef.variables.sessionFilter?.status?.in,
    'TERMINATED',
  )
    ? 'finished'
    : 'running';

  const orderBy = queryRef.variables.orderBy?.[0];
  const order = orderBy
    ? (`${orderBy.direction === 'DESC' ? '-' : ''}${_.camelCase(orderBy.field)}` as (typeof availableSessionV2SorterValues)[number])
    : null;

  const pageSize = queryRef.variables.limit ?? 10;
  const offset = queryRef.variables.offset ?? 0;
  const current = pageSize ? Math.floor(offset / pageSize) + 1 : 1;

  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetching = deferredQueryRef !== queryRef;

  const data = usePreloadedQuery<AgentSessionsQueryType>(
    AgentSessionsQuery,
    deferredQueryRef,
  );

  const sessionConnection = data.agentsV2?.edges?.[0]?.node?.sessions;
  const sessionNodes = filterOutNullAndUndefined(
    sessionConnection?.edges?.map((edge) => edge?.node),
  );
  const total = sessionConnection?.count ?? 0;

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="between" wrap="wrap" gap="sm">
        <BAIRadioGroup
          optionType="button"
          value={statusCategory}
          onChange={(e) => {
            const next = e.target.value as 'running' | 'finished';
            onReload(
              {
                ...queryRef.variables,
                sessionFilter: {
                  status: {
                    in: statusBuckets[next] as readonly SessionV2Status[],
                  },
                },
                offset: 0,
              },
              { fetchPolicy: 'network-only' },
            );
          }}
          options={[
            { label: t('session.Running'), value: 'running' },
            { label: t('session.Finished'), value: 'finished' },
          ]}
        />
        <AutoUpdateFetchKeyButton
          settingId="agent-detail-sessions"
          defaultAutoUpdateDelay={15_000}
          loading={isRefetching}
          value={fetchKey}
          onChange={(next) => {
            updateFetchKey(next);
            onReload(queryRef.variables, { fetchPolicy: 'network-only' });
          }}
        />
      </BAIFlex>
      <BAISessionNodesV2
        sessionsFrgmt={sessionNodes}
        loading={isRefetching}
        order={order}
        onChangeOrder={(nextOrder) => {
          onReload(
            {
              ...queryRef.variables,
              orderBy: convertToOrderBy<Required<SessionV2OrderBy>>(
                nextOrder,
              ) ?? [
                {
                  field: 'CREATED_AT',
                  direction: 'DESC',
                } as Required<SessionV2OrderBy>,
              ],
            },
            { fetchPolicy: 'network-only' },
          );
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
          current,
          pageSize,
          total,
          onChange: (nextCurrent, nextPageSize) => {
            onReload(
              {
                ...queryRef.variables,
                limit: nextPageSize,
                offset: nextCurrent > 1 ? (nextCurrent - 1) * nextPageSize : 0,
              },
              { fetchPolicy: 'network-only' },
            );
          },
        }}
        tableSettings={{
          columnOverrides: columnOverrides,
          // `BAISessionNodesV2` hides `createdAt` by default; the linked
          // issue (FR-3252) lists created time as a key column, so make it
          // visible by default while keeping it user-hidable.
          defaultColumnOverrides: {
            createdAt: { hidden: false },
          },
          onColumnOverridesChange: setColumnOverrides,
        }}
      />
    </BAIFlex>
  );
};

export default AgentSessions;
