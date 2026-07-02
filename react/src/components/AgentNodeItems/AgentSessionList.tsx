/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentSessionListQuery } from '../../__generated__/AgentSessionListQuery.graphql';
import { useWebUINavigate } from '../../hooks';
import { useBAIPaginationOptionState } from '../../hooks/reactPaginationQueryOptions';
import SessionNodes from '../SessionNodes';
import { filterOutNullAndUndefined, mergeFilterValues } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useDeferredValue } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface AgentSessionListProps {
  // The agent's row id (matches the values stored in a session's `agent_ids`).
  agentId: string;
}

const AgentSessionList: React.FC<AgentSessionListProps> = ({ agentId }) => {
  'use memo';
  const webUINavigate = useWebUINavigate();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });

  // Sessions currently assigned to (running on) this agent. `agent_ids` is a
  // list column and the manager supports the `ilike` operator on it (the same
  // operator the admin session list uses for its agent filter). Note that
  // `ilike` is a substring match, so an agent id that is a prefix of another
  // (e.g. "i-agent1" vs "i-agent10") could over-match; the manager exposes no
  // exact list-containment operator for this column today. Only
  // non-terminated sessions actually consume the agent's resources.
  const queryVariables = {
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.first,
    filter: mergeFilterValues([
      `agent_ids ilike "%${agentId}%"`,
      'status != "TERMINATED" & status != "CANCELLED"',
    ]),
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const { compute_session_nodes } = useLazyLoadQuery<AgentSessionListQuery>(
    graphql`
      query AgentSessionListQuery($offset: Int, $first: Int, $filter: String) {
        compute_session_nodes(
          offset: $offset
          first: $first
          filter: $filter
          order: "-created_at"
        ) {
          edges {
            node {
              id
              ...SessionNodesFragment
            }
          }
          count
        }
      }
    `,
    deferredQueryVariables,
  );

  const sessions = filterOutNullAndUndefined(
    compute_session_nodes?.edges?.map((e) => e?.node),
  );

  return (
    <SessionNodes
      disableSorter
      sessionsFrgmt={sessions}
      loading={deferredQueryVariables !== queryVariables}
      onClickSessionName={(session) => {
        // The `sessionDetail` opener is mounted on the session pages (not on
        // the agent page), so navigate there to open the detail drawer.
        webUINavigate({
          pathname: '/session',
          search: new URLSearchParams({
            sessionDetail: session.row_id,
          }).toString(),
        });
      }}
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
    />
  );
};

export default AgentSessionList;
