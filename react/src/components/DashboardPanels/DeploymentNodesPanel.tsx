/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { resourceRegistryDeploymentQuery } from '../../__generated__/resourceRegistryDeploymentQuery.graphql';
import { useWebUINavigate } from '../../hooks';
import { useBAIPaginationOptionState } from '../../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { useProjectPath } from '../../hooks/useRouteScope';
import { resourceRegistry } from './resourceRegistry';
import type { PanelDescriptor } from './types';
import {
  BAIModelDeploymentNodes,
  filterOutNullAndUndefined,
  toLocalId,
} from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useLazyLoadQuery } from 'react-relay';

/** Compact column set — the deployments page's default-visible keys. */
const PANEL_COLUMN_KEYS = [
  'name',
  'status',
  'replicaSummary',
  'model',
  'createdAt',
];

/**
 * Deployment panel content = the deployments page's own
 * {@link BAIModelDeploymentNodes} table over the same connection, so badges,
 * columns and column settings behave like the page. Read-only: the panel
 * injects only the name navigation, never the page's edit/delete row actions.
 */
export const DeploymentNodesPanelContent: React.FC<{
  descriptor: PanelDescriptor;
  fetchKey?: string;
  onChangeOrder?: (nextOrder?: string) => void;
  /** Modal preview: keep rows inert (no navigation). */
  disableNavigation?: boolean;
}> = ({ descriptor, fetchKey, onChangeOrder, disableNavigation }) => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  const webUINavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  const config = resourceRegistry.deployment;
  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.DashboardDeploymentPanel',
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
  const data = useLazyLoadQuery<resourceRegistryDeploymentQuery>(
    config.query,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey: deferredFetchKey },
  );
  const connection = data.myDeployments;
  const deployments = filterOutNullAndUndefined(
    connection?.edges.map((e) => e?.node),
  );

  return (
    <BAIModelDeploymentNodes
      deploymentsFrgmt={deployments}
      order={order}
      disableSorter={!onChangeOrder}
      onChangeOrder={
        onChangeOrder ? (next) => onChangeOrder(next ?? undefined) : undefined
      }
      loading={deferredVariables !== variables || deferredFetchKey !== fetchKey}
      customizeColumns={(base) =>
        base
          .filter((column) => PANEL_COLUMN_KEYS.includes(String(column.key)))
          .map((column) =>
            column.key === 'name' && !disableNavigation
              ? {
                  ...column,
                  onTitleClick: (record: { id: string }) => {
                    webUINavigate(
                      `${buildProjectPath('deployments')}/${toLocalId(record.id)}`,
                    );
                  },
                }
              : column,
          )
      }
      pagination={{
        pageSize: tablePaginationOption.pageSize,
        current: tablePaginationOption.current,
        total: connection?.count ?? 0,
        onChange: (current: number, pageSize: number) => {
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

export default DeploymentNodesPanelContent;
