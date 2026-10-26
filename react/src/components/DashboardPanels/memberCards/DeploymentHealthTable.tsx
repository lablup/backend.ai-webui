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
}

const COLUMN_KEYS = ['name', 'status', 'replicaSummary'];

/** Deployments with their status, replica summary and a healthy-replica badge; names open the deployment. */
const DeploymentHealthTable: React.FC<DeploymentHealthTableProps> = ({
  nodes,
  total,
  loading,
  pagination,
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
      customizeColumns={(base) => [
        ...base
          .filter((column) => COLUMN_KEYS.includes(String(column.key)))
          .map((column) =>
            column.key === 'name'
              ? {
                  ...column,
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
              : column,
          ),
        {
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
        },
      ]}
      pagination={{ ...pagination, total }}
    />
  );
};

export default DeploymentHealthTable;
