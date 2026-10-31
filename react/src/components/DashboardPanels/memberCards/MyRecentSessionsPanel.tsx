/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MyRecentSessionsPanelQuery } from '../../../__generated__/MyRecentSessionsPanelQuery.graphql';
import { useWebUINavigate } from '../../../hooks';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../../../hooks/useBAISetting';
import type { PanelComponentProps } from '../types';
import MemberCard, { NoProjectText, mineProjectId } from './MemberCard';
import {
  BAILink,
  BAISessionNodesV2,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useLocation } from 'react-router-dom';

const PAGE_SIZE = 5;

const MyRecentSessionsTable: React.FC<{
  projectId: string;
  fetchKey: string;
}> = ({ projectId, fetchKey }) => {
  'use memo';
  const location = useLocation();
  const webuiNavigate = useWebUINavigate();
  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.DashboardMyRecentSessions',
  );
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: PAGE_SIZE });

  const variables = {
    filter: { projectId: { equals: projectId } },
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<MyRecentSessionsPanelQuery>(
    graphql`
      query MyRecentSessionsPanelQuery(
        $filter: SessionV2Filter!
        $limit: Int!
        $offset: Int!
      ) {
        mySessionsV2(
          filter: $filter
          orderBy: [{ field: CREATED_AT, direction: DESC }]
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              ...BAISessionNodesV2Fragment
            }
          }
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );

  // The page's session-detail opener reads `sessionDetail`, as on the session list.
  const openSessionDetail = (sessionId: string) => {
    const params = new URLSearchParams(location.search);
    params.set('sessionDetail', sessionId);
    webuiNavigate({
      pathname: location.pathname,
      hash: location.hash,
      search: params.toString(),
    });
  };

  return (
    <BAISessionNodesV2
      sessionsFrgmt={filterOutNullAndUndefined(
        data.mySessionsV2?.edges.map((edge) => edge?.node),
      )}
      disableSorter
      loading={deferredVariables !== variables}
      customizeColumns={(columns) =>
        columns.map((column) =>
          column.key === 'name'
            ? {
                ...column,
                render: (_value, session) => (
                  <BAILink
                    type="hover"
                    onClick={() => openSessionDetail(session.entityId)}
                  >
                    {session.metadata?.name ?? '-'}
                  </BAILink>
                ),
              }
            : column,
        )
      }
      pagination={{
        pageSize: tablePaginationOption.pageSize,
        current: tablePaginationOption.current,
        total: data.mySessionsV2?.count ?? 0,
        onChange: (current, pageSize) =>
          setTablePaginationOption({ current, pageSize }),
      }}
      tableSettings={{
        columnOverrides,
        onColumnOverridesChange: setColumnOverrides,
        defaultColumnOverrides: {
          sessionType: { hidden: false },
          createdAt: { hidden: false },
          accelerator: { hidden: true },
          cpu: { hidden: true },
          mem: { hidden: true },
          owner: { hidden: true },
        },
      }}
    />
  );
};

/** The viewer's newest sessions in the page's project; a name opens the session drawer. */
const MyRecentSessionsPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = mineProjectId(scope);
  return (
    <MemberCard
      title={t('dashboard.card.MyRecentSessions')}
      fetchKey={fetchKey}
    >
      {(key) =>
        projectId ? (
          <MyRecentSessionsTable projectId={projectId} fetchKey={key} />
        ) : (
          <NoProjectText />
        )
      }
    </MemberCard>
  );
};

export default MyRecentSessionsPanel;
