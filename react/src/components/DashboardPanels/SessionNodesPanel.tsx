/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { resourceRegistrySessionQuery } from '../../__generated__/resourceRegistrySessionQuery.graphql';
import { useWebUINavigate } from '../../hooks';
import { useBAIPaginationOptionState } from '../../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import SessionNodes from '../SessionNodes';
import { resourceRegistry } from './resourceRegistry';
import type { PanelDescriptor } from './types';
import { filterOutNullAndUndefined } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { useLocation } from 'react-router-dom';

/**
 * Session panel content = the sessions page's own {@link SessionNodes} table
 * over the same legacy connection, so name click (detail drawer via the shared
 * `sessionDetail` query param), badges, column settings, and pagination behave
 * exactly like the page. Column settings persist across all session panels
 * under one `table_column_overrides` key.
 */
export const SessionNodesPanelContent: React.FC<{
  descriptor: PanelDescriptor;
  fetchKey?: string;
  onChangeOrder?: (nextOrder?: string) => void;
  /** Modal preview: keep rows inert (no detail-drawer navigation). */
  disableSessionDetail?: boolean;
}> = ({ descriptor, fetchKey, onChangeOrder, disableSessionDetail }) => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  const webUINavigate = useWebUINavigate();
  const location = useLocation();
  const config = resourceRegistry.session;
  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.DashboardSessionPanel',
  );
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 10 });

  const order = descriptor.order ?? config.defaultOrder;
  const variables = config.buildVariables({
    filter: descriptor.filter ?? undefined,
    order,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    projectId: currentProject.id ?? '',
  });
  const deferredVariables = useDeferredValue(variables);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const data = useLazyLoadQuery<resourceRegistrySessionQuery>(
    config.query,
    deferredVariables,
    {
      fetchPolicy: 'store-and-network',
      fetchKey: deferredFetchKey,
    },
  );
  const connection = data.compute_session_nodes;
  const sessions = filterOutNullAndUndefined(
    connection?.edges.map((e) => e?.node),
  );

  return (
    <SessionNodes
      sessionsFrgmt={sessions}
      order={order}
      disableSorter={!onChangeOrder}
      onChangeOrder={
        onChangeOrder ? (next) => onChangeOrder(next ?? undefined) : undefined
      }
      loading={deferredVariables !== variables || deferredFetchKey !== fetchKey}
      onClickSessionName={
        disableSessionDetail
          ? undefined
          : (session) => {
              // Same mechanism as the sessions page: the shared `sessionDetail`
              // query param opens the dashboard's session-detail drawer, and
              // the fragment rides along in history state to avoid a refetch.
              const newSearchParams = new URLSearchParams(location.search);
              newSearchParams.set('sessionDetail', session.row_id);
              webUINavigate(
                {
                  pathname: location.pathname,
                  hash: location.hash,
                  search: newSearchParams.toString(),
                },
                {
                  state: {
                    sessionDetailDrawerFrgmt: session,
                    createdAt: new Date().toISOString(),
                  },
                },
              );
            }
      }
      pagination={{
        pageSize: tablePaginationOption.pageSize,
        current: tablePaginationOption.current,
        total: connection?.count ?? 0,
        onChange: (current, pageSize) => {
          setTablePaginationOption({ current, pageSize });
        },
      }}
      tableSettings={{
        columnOverrides,
        onColumnOverridesChange: setColumnOverrides,
      }}
    />
  );
};

export default SessionNodesPanelContent;
