/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { useSessionMonitorQuery } from '../__generated__/useSessionMonitorQuery.graphql';
import type { IdleChecks } from '../components/ComputeSessionNodeItems/SessionIdleChecks';
import {
  SESSION_MONITOR_FETCH_LIMIT,
  SESSION_MONITOR_NOT_FINISHED_FILTER,
  toSessionMonitorEntry,
  type SessionMonitorEntry,
  type SessionMonitorSummary,
} from '../helper/sessionMonitor';
import { useCurrentUserInfo } from './backendai';
import { useCurrentProjectValue } from './useCurrentProject';
import { INITIAL_FETCH_KEY } from 'backend.ai-ui';
import { atom } from 'jotai';
import { graphql, useLazyLoadQuery } from 'react-relay';

/** Bumping this refetches every mounted session-monitor query. */
export const sessionMonitorFetchKeyAtom = atom<string>(INITIAL_FETCH_KEY);
/** Written by `SessionMonitorWatcher`, read by the header button. */
export const sessionMonitorSummaryAtom = atom<SessionMonitorSummary | null>(
  null,
);

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
 * The user's unfinished sessions in the current project (the session list
 * page's scope). Shared by the watcher and the popover so both see one answer.
 */
export const useSessionMonitorData = (fetchKey: string) => {
  'use memo';
  const [currentUser] = useCurrentUserInfo();
  const currentProject = useCurrentProjectValue();

  const data = useLazyLoadQuery<useSessionMonitorQuery>(
    graphql`
      query useSessionMonitorQuery(
        $scopeId: ScopeField
        $filter: String
        $first: Int
      ) {
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
            }
          }
        }
      }
    `,
    {
      scopeId: `project:${currentProject.id}`,
      filter: `${SESSION_MONITOR_NOT_FINISHED_FILTER} & user_id == "${currentUser.uuid}"`,
      first: SESSION_MONITOR_FETCH_LIMIT,
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
