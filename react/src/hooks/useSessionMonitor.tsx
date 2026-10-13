/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { useSessionMonitorQuery } from '../__generated__/useSessionMonitorQuery.graphql';
import type { IdleChecks } from '../components/ComputeSessionNodeItems/SessionIdleChecks';
import {
  SESSION_MONITOR_FETCH_LIMIT,
  SESSION_MONITOR_RUNNING_FILTER,
  SESSION_MONITOR_STARTING_FILTER,
  toSessionMonitorEntry,
  type SessionMonitorEntry,
  type SessionMonitorSummary,
} from '../helper/sessionMonitor';
import { INITIAL_FETCH_KEY } from 'backend.ai-ui';
import { atom } from 'jotai';
import { graphql, useLazyLoadQuery } from 'react-relay';

/** Bumping this refetches every mounted session-monitor query. */
export const sessionMonitorFetchKeyAtom = atom<string>(INITIAL_FETCH_KEY);
/** Written by `SessionMonitorWatcher`, read by the header button. */
export const sessionMonitorSummaryAtom = atom<SessionMonitorSummary | null>(
  null,
);

/**
 * `my`: the user's sessions in the current project; `project`: every session
 * of the project (project-admin pages); `domain`: every session of the domain
 * (admin pages, domain admins).
 */
export type SessionMonitorMode = 'my' | 'project' | 'domain';
export type SessionMonitorScope = {
  mode: SessionMonitorMode;
  scopeId: string;
  filter: string;
};
/** Resolved by `SessionMonitorWatcher` for the route; null hides the chip. */
export const sessionMonitorScopeAtom = atom<SessionMonitorScope | null>(null);

const parseIdleChecks = (raw: string | null | undefined): IdleChecks | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IdleChecks;
  } catch {
    return null;
  }
};

export type SessionMonitorNode = NonNullable<
  NonNullable<
    NonNullable<
      useSessionMonitorQuery['response']['compute_session_nodes']
    >['edges'][number]
  >['node']
>;

/**
 * The unfinished sessions of `scope`, newest first. Shared by the watcher and
 * the popover so both see one answer.
 */
export const useSessionMonitorData = (
  fetchKey: string,
  scope: SessionMonitorScope,
  // The row fragment carries per-kernel live stats; only the open popover
  // needs it, so the minute-by-minute watcher leaves it out.
  { withRows = false }: { withRows?: boolean } = {},
) => {
  'use memo';

  const data = useLazyLoadQuery<useSessionMonitorQuery>(
    graphql`
      query useSessionMonitorQuery(
        $scopeId: ScopeField
        $filter: String
        $runningFilter: String
        $startingFilter: String
        $first: Int
        $withRows: Boolean!
      ) {
        runningCount: compute_session_nodes(
          scope_id: $scopeId
          filter: $runningFilter
          first: 0
        ) {
          count
        }
        startingCount: compute_session_nodes(
          scope_id: $scopeId
          filter: $startingFilter
          first: 0
        ) {
          count
        }
        compute_session_nodes(
          scope_id: $scopeId
          filter: $filter
          order: "-created_at"
          first: $first
        ) {
          count
          edges {
            node {
              id
              name
              status
              created_at
              idle_checks
              ...SessionMonitorItemFragment
                @include(if: $withRows)
                @alias(as: "row")
            }
          }
        }
      }
    `,
    {
      scopeId: scope.scopeId,
      filter: scope.filter,
      runningFilter: `${scope.filter} & ${SESSION_MONITOR_RUNNING_FILTER}`,
      startingFilter: `${scope.filter} & ${SESSION_MONITOR_STARTING_FILTER}`,
      first: SESSION_MONITOR_FETCH_LIMIT,
      withRows,
    },
    { fetchPolicy: 'store-and-network', fetchKey },
  );

  const { entries, nodesById, fetchedAt } = buildEntries(
    data.compute_session_nodes?.edges,
  );

  return {
    entries,
    nodesById,
    total: data.compute_session_nodes?.count ?? entries.length,
    counts: {
      running: data.runningCount?.count ?? 0,
      starting: data.startingCount?.count ?? 0,
    },
    fetchedAt,
  };
};

// `idle_checks` carries seconds relative to fetch time, so the deadline is
// anchored once per response (the call is memoized on `edges`).
const buildEntries = (
  edges: NonNullable<
    useSessionMonitorQuery['response']['compute_session_nodes']
  >['edges'] = [],
) => {
  const fetchedAt = Date.now();
  const nodes: SessionMonitorNode[] = edges.flatMap((edge) =>
    edge?.node ? [edge.node] : [],
  );
  const entries: SessionMonitorEntry[] = nodes.map((node) =>
    toSessionMonitorEntry(node, parseIdleChecks(node.idle_checks), fetchedAt),
  );
  return {
    entries,
    nodesById: new Map(nodes.map((node) => [node.id, node])),
    fetchedAt,
  };
};
