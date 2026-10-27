/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionListMineQuery } from '../../../__generated__/SessionListMineQuery.graphql';
import type {
  SessionListProjectQuery,
  SessionListProjectQuery$data,
  SessionV2Filter,
  SessionV2OrderBy,
} from '../../../__generated__/SessionListProjectQuery.graphql';
import type { CardScope } from '../cardScope';
import { filterOutNullAndUndefined } from 'backend.ai-ui';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type SessionRow = NonNullable<
  NonNullable<
    NonNullable<SessionListProjectQuery$data['sessions']>['edges'][number]
  >['node']
>;

export interface SessionPage {
  count: number;
  rows: ReadonlyArray<SessionRow>;
}

interface SessionQueryArgs {
  filter: SessionV2Filter;
  orderBy: ReadonlyArray<SessionV2OrderBy>;
  limit: number;
  offset: number;
  fetchKey: string;
}

export interface SessionListProps extends SessionQueryArgs {
  scope: CardScope;
  children: (page: SessionPage) => React.ReactNode;
}

type Connection = {
  readonly count: number;
  readonly edges: ReadonlyArray<
    { readonly node: SessionRow | null | undefined } | null | undefined
  >;
} | null;

const toPage = (connection: Connection | undefined): SessionPage => ({
  count: connection?.count ?? 0,
  rows: filterOutNullAndUndefined(connection?.edges.map((edge) => edge?.node)),
});

const MineSessions: React.FC<
  SessionQueryArgs & {
    projectId: string;
    children: (page: SessionPage) => React.ReactNode;
  }
> = ({ projectId, filter, orderBy, limit, offset, fetchKey, children }) => {
  'use memo';
  const data = useLazyLoadQuery<SessionListMineQuery>(
    graphql`
      query SessionListMineQuery(
        $filter: SessionV2Filter!
        $orderBy: [SessionV2OrderBy!]!
        $limit: Int!
        $offset: Int!
      ) {
        sessions: mySessionsV2(
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              entityId
              ...BAISessionNodesV2Fragment
            }
          }
        }
      }
    `,
    {
      filter: { ...filter, projectId: { equals: projectId } },
      orderBy: [...orderBy],
      limit,
      offset,
    },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return children(toPage(data.sessions));
};

const ProjectSessions: React.FC<
  SessionQueryArgs & {
    projectId: string;
    children: (page: SessionPage) => React.ReactNode;
  }
> = ({ projectId, filter, orderBy, limit, offset, fetchKey, children }) => {
  'use memo';
  const data = useLazyLoadQuery<SessionListProjectQuery>(
    graphql`
      query SessionListProjectQuery(
        $projectId: UUID!
        $filter: SessionV2Filter!
        $orderBy: [SessionV2OrderBy!]!
        $limit: Int!
        $offset: Int!
      ) {
        sessions: projectSessionsV2(
          scope: { projectId: $projectId }
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              entityId
              ...BAISessionNodesV2Fragment
            }
          }
        }
      }
    `,
    { projectId, filter, orderBy: [...orderBy], limit, offset },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return children(toPage(data.sessions));
};

/** One page of sessions in the card's scope, for the session list cards. */
const SessionList: React.FC<SessionListProps> = ({ scope, ...props }) => {
  'use memo';
  switch (scope.kind) {
    case 'mine':
      return <MineSessions projectId={scope.projectId} {...props} />;
    case 'project':
      return <ProjectSessions projectId={scope.projectId} {...props} />;
  }
};

export default SessionList;
