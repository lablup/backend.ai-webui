/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useProjectPath } from '../../../hooks/useRouteScope';
import { Badge } from '@lablup/ui-common/Badge';
import {
  BAIModelDeploymentNodes,
  BAINameActionCell,
  toLocalId,
  type BAITableColumnOverrideRecord,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** A deployment row with the counts the health column reads. */
export type DeploymentHealthNode = React.ComponentProps<
  typeof BAIModelDeploymentNodes
>['deploymentsFrgmt'][number] & {
  readonly id: string;
  readonly replicaState?: { readonly desiredReplicaCount: number } | null;
  readonly healthyReplicas?: { readonly count: number } | null;
};

export interface DeploymentHealthTableProps {
  nodes: ReadonlyArray<DeploymentHealthNode>;
  total: number;
  loading: boolean;
  pagination: {
    pageSize: number;
    current: number;
    onChange: (current: number, pageSize: number) => void;
  };
  /** The card's column picks; the table's settings button edits them. */
  columnOverrides?: BAITableColumnOverrideRecord;
  onColumnOverridesChange?: (overrides: BAITableColumnOverrideRecord) => void;
}

/** Shown on a new card; every other deployment column starts hidden in the column settings. */
const DEFAULT_COLUMN_KEYS = ['name', 'status', 'replicaSummary', 'health'];

/** Columns that read the fields `BAIModelDeploymentNodesFragment` fetches only `withDetails`. */
export const DETAIL_COLUMN_KEYS = [
  'currentRevisionNumber',
  'model',
  'projectId',
  'openToPublic',
  'endpointUrl',
  'preferredDomainName',
  'strategyType',
  'owner',
  'labels',
];

/** True when a column that needs the deployment details is shown. */
export const needsDeploymentDetails = (
  overrides: BAITableColumnOverrideRecord | undefined,
) => DETAIL_COLUMN_KEYS.some((key) => overrides?.[key]?.hidden === false);

/** Deployments with their status, replica summary and a healthy-replica badge; names open the deployment. */
const DeploymentHealthTable: React.FC<DeploymentHealthTableProps> = ({
  nodes,
  total,
  loading,
  pagination,
  columnOverrides,
  onColumnOverridesChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const buildProjectPath = useProjectPath();
  const healthById = new Map(
    nodes.map((node) => [
      node.id,
      {
        healthy: node.healthyReplicas?.count ?? 0,
        desired: node.replicaState?.desiredReplicaCount ?? 0,
      },
    ]),
  );
  return (
    <BAIModelDeploymentNodes
      deploymentsFrgmt={nodes}
      disableSorter
      loading={loading}
      customizeColumns={(base) => {
        const columns = base.map((column) => ({
          ...column,
          defaultHidden: !DEFAULT_COLUMN_KEYS.includes(String(column.key)),
          ...(column.key === 'name'
            ? {
                render: (
                  _value: unknown,
                  record: {
                    id: string;
                    metadata?: { name?: string | null } | null;
                  },
                ) => (
                  <BAINameActionCell
                    title={record.metadata?.name ?? '-'}
                    to={`${buildProjectPath('deployments')}/${toLocalId(record.id)}`}
                  />
                ),
              }
            : {}),
        }));
        const healthColumn = {
          key: 'health',
          title: t('dashboard.card.ReplicaHealth'),
          render: (_value: unknown, record: { id: string }) => {
            const health = healthById.get(record.id);
            if (!health || health.desired === 0) return '-';
            const isHealthy = health.healthy >= health.desired;
            return (
              <Badge
                variant={isHealthy ? 'success' : 'warning'}
                label={
                  isHealthy
                    ? t('dashboard.card.Healthy')
                    : t('dashboard.card.Unhealthy')
                }
              />
            );
          },
        };
        // Health sits right after the replica summary it qualifies.
        const summaryIndex = columns.findIndex(
          (column) => column.key === 'replicaSummary',
        );
        return [
          ...columns.slice(0, summaryIndex + 1),
          healthColumn,
          ...columns.slice(summaryIndex + 1),
        ];
      }}
      tableSettings={
        onColumnOverridesChange
          ? {
              columnOverrides: columnOverrides ?? {},
              onColumnOverridesChange,
            }
          : undefined
      }
      pagination={{ ...pagination, total }}
    />
  );
};

export default DeploymentHealthTable;
