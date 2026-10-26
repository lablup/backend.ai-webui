/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  ProjectSessionListQuery,
  ProjectSessionListQuery$data,
  SessionV2Filter,
  SessionV2OrderBy,
} from '../../../__generated__/ProjectSessionListQuery.graphql';
import { filterOutNullAndUndefined } from 'backend.ai-ui';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type ProjectSessionRow = NonNullable<
  NonNullable<
    NonNullable<ProjectSessionListQuery$data['sessions']>['edges'][number]
  >['node']
>;

export interface ProjectSessionListProps {
  projectId: string;
  filter: SessionV2Filter;
  orderBy: ReadonlyArray<SessionV2OrderBy>;
  limit: number;
  offset: number;
  fetchKey: string;
  children: (page: {
    count: number;
    rows: ReadonlyArray<ProjectSessionRow>;
  }) => React.ReactNode;
}

/** One page of the project's sessions from `projectSessionsV2`, for the session list cards. */
const ProjectSessionList: React.FC<ProjectSessionListProps> = ({
  projectId,
  filter,
  orderBy,
  limit,
  offset,
  fetchKey,
  children,
}) => {
  'use memo';
  const data = useLazyLoadQuery<ProjectSessionListQuery>(
    graphql`
      query ProjectSessionListQuery(
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
  return children({
    count: data.sessions?.count ?? 0,
    rows: filterOutNullAndUndefined(
      data.sessions?.edges.map((edge) => edge?.node),
    ),
  });
};

export default ProjectSessionList;
