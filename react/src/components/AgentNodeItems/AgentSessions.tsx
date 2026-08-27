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
import {
  DEFAULT_SESSION_GRID_VIEW,
  type SessionGridViewParams,
} from '../../helper/sessionResourceGridData';
import { useWebUINavigate } from '../../hooks';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useProjectPath } from '../../hooks/useRouteScope';
import AutoUpdateFetchKeyButton from '../AutoUpdateFetchKeyButton';
import BAIRadioGroup from '../BAIRadioGroup';
import SessionResourceGrid from '../SessionResourceGrid';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIFlex,
  BAILink,
  BAIResourceUnitGridSkeleton,
  BAISessionNodesV2,
  availableSessionV2SorterValues,
  filterOutNullAndUndefined,
  mergeFilterValues,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { LayoutGridIcon, TableIcon } from 'lucide-react';
import { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

// Same status buckets as ProjectAdminSessionPage — sessions still occupying
// (or about to occupy) agent resources vs. finished ones kept for history.
export const RUNNING_STATUSES: ReadonlyArray<SessionV2Status> = [
  'PENDING',
  'SCHEDULED',
  'PREPARING',
  'PREPARED',
  'CREATING',
  'RUNNING',
  'DEPRIORITIZING',
  'PREEMPTED',
  'RESCHEDULING',
  'TERMINATING',
];

const FINISHED_STATUSES: ReadonlyArray<SessionV2Status> = [
  'TERMINATED',
  'CANCELLED',
];

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
  /**
   * The agent's raw id (`AgentNode.row_id`, e.g. `i-node01`) — the value stored
   * in `sessions.agent_ids`, used to scope the grid view's legacy query.
   */
  agentId: string;
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
const AgentSessions = ({ agentId, queryRef, onReload }: AgentSessionsProps) => {
  'use memo';
  const { t } = useTranslation();
  const webUINavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();

  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AgentSessions',
  );

  const [experimentalSessionResourceGrid] = useBAISettingUserState(
    'experimental_session_resource_grid',
  );
  // Grid view is gated behind the same experimental opt-in as the session list
  // pages (FR-3570). The flag is global state and can flip while the drawer is
  // open, so gate the rendered view too, not only the toggle.
  const [view, setView] = useState<'table' | 'grid'>('table');
  const effectiveView = experimentalSessionResourceGrid ? view : 'table';
  // Kept in local state, not the URL: the drawer holds no URL state today, and
  // `AgentList` is mounted on three pages whose URLs would outlive the drawer.
  const [gridViewParams, setGridViewParams] = useState<SessionGridViewParams>(
    DEFAULT_SESSION_GRID_VIEW,
  );

  const statusCategory = _.includes(
    queryRef.variables.sessionFilter?.status?.in,
    'TERMINATED',
  )
    ? 'finished'
    : 'running';

  // The grid reads the legacy `compute_session_list`, whose queryfilter maps
  // `agent_ids` onto an array column — any kernel on this agent matches.
  // Backslash before quote: the reverse order would re-escape what it just
  // wrote, and a lone trailing backslash breaks the minilang lexer outright.
  const quotedAgentId = agentId.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const gridFilter = mergeFilterValues([
    `agent_ids == "${quotedAgentId}"`,
    statusCategory === 'running'
      ? 'status != "TERMINATED" & status != "CANCELLED"'
      : 'status == "TERMINATED" | status == "CANCELLED"',
  ]);

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
                    in: (next === 'running'
                      ? RUNNING_STATUSES
                      : FINISHED_STATUSES) as readonly SessionV2Status[],
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
        <BAIFlex gap="xs" align="center">
          {experimentalSessionResourceGrid && (
            <SegmentedControl
              label={t('session.resourceGrid.ViewMode')}
              value={view}
              onChange={(value) => {
                const next = value as 'table' | 'grid';
                setView(next);
                // The table query does not poll while the grid is shown, so
                // refresh it on the way back instead of showing stale rows.
                if (next === 'table') {
                  onReload(queryRef.variables, { fetchPolicy: 'network-only' });
                }
              }}
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
            settingId="agent-detail-sessions"
            defaultAutoUpdateDelay={15_000}
            loading={
              effectiveView === 'grid'
                ? deferredFetchKey !== fetchKey
                : isRefetching
            }
            value={fetchKey}
            onChange={(next) => {
              updateFetchKey(next);
              // Only one of the two queries is mounted; reloading the table's
              // preloaded query from grid view would poll it invisibly.
              if (effectiveView === 'table') {
                onReload(queryRef.variables, { fetchPolicy: 'network-only' });
              }
            }}
          />
        </BAIFlex>
      </BAIFlex>
      {effectiveView === 'grid' ? (
        // Keyed by the filter so a status-bucket change remounts the boundary
        // and shows the skeleton immediately; the deferred fetch key keeps
        // poll refreshes from flashing it.
        <Suspense
          key={gridFilter ?? ''}
          fallback={<BAIResourceUnitGridSkeleton />}
        >
          <SessionResourceGrid
            filter={gridFilter}
            order="-created_at"
            // An agent hosts sessions across arbitrary projects, and the grid's
            // `projectId` is the query's `group_id` scope.
            projectId={null}
            fetchKey={deferredFetchKey}
            // Controlled: an uncontrolled grid keeps its settings in app-global
            // URL query-state, which a drawer instance would share with (and
            // overwrite for) a session list page already in grid view.
            viewParams={gridViewParams}
            onChangeViewParams={setGridViewParams}
            onClickSession={(sessionId) => {
              webUINavigate(
                `${buildProjectPath('session', { scope: 'admin' })}?${new URLSearchParams(
                  {
                    sessionDetail: sessionId,
                  },
                ).toString()}`,
              );
            }}
          />
        </Suspense>
      ) : (
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
                  offset:
                    nextCurrent > 1 ? (nextCurrent - 1) * nextPageSize : 0,
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
      )}
    </BAIFlex>
  );
};

export default AgentSessions;
