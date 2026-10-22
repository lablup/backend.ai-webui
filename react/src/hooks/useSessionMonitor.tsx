/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomainValue } from '.';
import type { useSessionMonitorQuery } from '../__generated__/useSessionMonitorQuery.graphql';
import type { IdleChecks } from '../components/ComputeSessionNodeItems/SessionIdleChecks';
import {
  buildSessionMonitorDefaultCondition,
  sessionMonitorOwnerFilter,
  joinSessionMonitorFilters,
  SESSION_MONITOR_ERROR_FILTER,
  SESSION_MONITOR_FETCH_LIMIT,
  SESSION_MONITOR_RUNNING_FILTER,
  SESSION_MONITOR_STARTING_FILTER,
  sumOccupiedSlots,
  toSessionMonitorEntry,
  type SessionMonitorEntry,
  type SessionMonitorSummary,
} from '../helper/sessionMonitor';
import { useCurrentUserInfo } from './backendai';
import { hasStoredUserSetting, useBAISettingUserState } from './useBAISetting';
import { useCurrentUserProjectRoles } from './useCurrentUserProjectRoles';
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
 * What the monitor watches, the same on every page: `scopeId` is the widest
 * scope the viewer may read (the domain for domain admins, else the user) and
 * `filter` narrows it to the user's condition.
 */
export type SessionMonitorScope = {
  scopeId: string;
  /** The condition: what the chip counts and the list shows. */
  filter: string;
  /** Only the viewer's own sessions: the default, and what alerts need. */
  onlyMine: boolean;
  /** The viewer may read other users' sessions (domain admin and above). */
  isDomainAdmin: boolean;
};
/** Written by `SessionMonitorWatcher`; null hides the chip. */
export const sessionMonitorScopeAtom = atom<SessionMonitorScope | null>(null);

/**
 * The watched condition: the stored one, or the role's default while never
 * set. Cleared reads back as null from the store, so stored-ness tells it apart.
 */
export const useSessionMonitorCondition = () => {
  'use memo';
  const { isSuperAdmin, domainAdminDomains } = useCurrentUserProjectRoles();
  const [currentUser] = useCurrentUserInfo();
  const [condition] = useBAISettingUserState('session_monitor_condition');
  const isDomainAdmin = isSuperAdmin || domainAdminDomains.length > 0;
  const userId = currentUser.uuid ?? '';
  return {
    condition: hasStoredUserSetting('session_monitor_condition')
      ? (condition ?? '')
      : buildSessionMonitorDefaultCondition({ userId, isDomainAdmin }),
    isDomainAdmin,
    userId,
  };
};

/**
 * Resolves the scope from the viewer's permission and monitor settings, never
 * from the page or the current project.
 */
export const useSessionMonitorScope = (): SessionMonitorScope => {
  'use memo';
  const domainName = useCurrentDomainValue();
  const { condition, isDomainAdmin, userId } = useSessionMonitorCondition();
  return {
    scopeId: isDomainAdmin ? `domain:${domainName}` : `user:${userId}`,
    filter: condition,
    // Below domain admin the user scope already holds only their sessions.
    onlyMine:
      !isDomainAdmin || condition.includes(sessionMonitorOwnerFilter(userId)),
    isDomainAdmin,
  };
};

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

type SessionMonitorDataOptions = {
  /** The session page: needed for the idle countdown, alerts and rows. */
  withEntries?: boolean;
  /** `occupied_slots` on the page, for the allocated-resources segment. */
  withSlots?: boolean;
  /** The row fragment with per-kernel live stats: the open popover only. */
  withRows?: boolean;
  /** Running and starting counts for the popover header. */
  withBreakdown?: boolean;
  /** The starting count alone, for the chip. */
  withStarting?: boolean;
  /** The count of sessions in ERROR, for the chip. */
  withErrors?: boolean;
};

/**
 * The watched sessions of `scope`. Without options this is one `count`, which
 * is all the default chip needs; each option adds only what it reads.
 */
export const useSessionMonitorData = (
  fetchKey: string,
  scope: SessionMonitorScope,
  {
    withEntries = false,
    withSlots = false,
    withRows = false,
    withBreakdown = false,
    withStarting = false,
    withErrors = false,
  }: SessionMonitorDataOptions = {},
) => {
  'use memo';

  const data = useLazyLoadQuery<useSessionMonitorQuery>(
    graphql`
      query useSessionMonitorQuery(
        $scopeId: ScopeField
        $filter: String
        $runningFilter: String
        $startingFilter: String
        $errorFilter: String
        $first: Int
        $withEntries: Boolean!
        $withSlots: Boolean!
        $withRows: Boolean!
        $withBreakdown: Boolean!
        $withStarting: Boolean!
        $withErrors: Boolean!
      ) {
        matching: compute_session_nodes(
          scope_id: $scopeId
          filter: $filter
          first: 0
        ) {
          count
        }
        runningCount: compute_session_nodes(
          scope_id: $scopeId
          filter: $runningFilter
          first: 0
        ) @include(if: $withBreakdown) {
          count
        }
        startingCount: compute_session_nodes(
          scope_id: $scopeId
          filter: $startingFilter
          first: 0
        ) @include(if: $withStarting) {
          count
        }
        errorCount: compute_session_nodes(
          scope_id: $scopeId
          filter: $errorFilter
          first: 0
        ) @include(if: $withErrors) {
          count
        }
        compute_session_nodes(
          scope_id: $scopeId
          filter: $filter
          order: "-created_at"
          first: $first
        ) @include(if: $withEntries) {
          edges {
            node {
              id
              name
              status
              created_at
              user_id
              idle_checks
              occupied_slots @include(if: $withSlots)
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
      runningFilter: joinSessionMonitorFilters([
        scope.filter,
        SESSION_MONITOR_RUNNING_FILTER,
      ]),
      startingFilter: joinSessionMonitorFilters([
        scope.filter,
        SESSION_MONITOR_STARTING_FILTER,
      ]),
      errorFilter: joinSessionMonitorFilters([
        scope.filter,
        SESSION_MONITOR_ERROR_FILTER,
      ]),
      first: SESSION_MONITOR_FETCH_LIMIT,
      withEntries: withEntries || withSlots || withRows,
      withSlots,
      withRows,
      withBreakdown,
      withStarting: withBreakdown || withStarting,
      withErrors,
    },
    { fetchPolicy: 'store-and-network', fetchKey },
  );

  const { entries, nodesById, fetchedAt } = buildEntries(
    data.compute_session_nodes?.edges,
  );

  return {
    entries,
    nodesById,
    total: data.matching?.count ?? entries.length,
    counts: {
      running: data.runningCount?.count ?? 0,
      starting: data.startingCount?.count ?? 0,
      errors: data.errorCount?.count ?? 0,
    },
    allocated: withSlots
      ? sumOccupiedSlots(
          Array.from(nodesById.values(), (node) => node.occupied_slots),
        )
      : null,
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
