/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ScopedAuditLogQuery as ScopedAuditLogQueryType } from '../__generated__/ScopedAuditLogQuery.graphql';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import BAIErrorBoundary from './BAIErrorBoundary';
import ScopedAuditLog, { ScopedAuditLogQuery } from './ScopedAuditLog';
import { Skeleton } from 'antd';
import { safeDecodeUuid } from 'backend.ai-ui';
import React, { Suspense, useEffect, useEffectEvent } from 'react';
import { useQueryLoader } from 'react-relay';

interface DeploymentAuditLogTabProps {
  deploymentId: string;
}

/**
 * DeploymentAuditLogTab — content of the "Audit log" tab inside
 * `DeploymentRevisionCard`. Lazily loads the deployment-scoped audit log when
 * the tab is mounted (i.e. activated) and renders the shared `ScopedAuditLog`.
 */
const DeploymentAuditLogTab: React.FC<DeploymentAuditLogTabProps> = ({
  deploymentId,
}) => {
  'use memo';
  const [auditLogQueryRef, loadAuditLogQuery] =
    useQueryLoader<ScopedAuditLogQueryType>(ScopedAuditLogQuery);

  const { baiPaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionState({ current: 1, pageSize: 10 });

  const reloadAuditLogQuery: React.ComponentProps<
    typeof ScopedAuditLog
  >['onReload'] = (variables, options) => {
    const limit = variables.limit ?? 10;
    setTablePaginationOption({
      pageSize: limit,
      current: variables.offset ? Math.floor(variables.offset / limit) + 1 : 1,
    });
    loadAuditLogQuery(variables, options);
  };

  const loadAuditLog = () => {
    loadAuditLogQuery(
      {
        scope: {
          entity: [
            {
              entityType: 'MODEL_DEPLOYMENT',
              entityId: safeDecodeUuid(deploymentId) ?? deploymentId,
            },
          ],
        },
        orderBy: [{ field: 'CREATED_AT', direction: 'DESC' }],
        limit: baiPaginationOption.limit,
        offset: baiPaginationOption.offset,
      },
      { fetchPolicy: 'store-and-network' },
    );
  };

  // Render-as-you-fetch: this component mounts when the audit-log tab becomes
  // active, so kick off the query immediately. Re-run on `deploymentId` change
  // as well — React Router can reuse this component instance across different
  // deployment detail URLs, and an empty-dependency effect would otherwise keep
  // showing the previous deployment's audit log. `loadAuditLog` reads the latest
  // pagination via the effect event.
  const loadForCurrentDeployment = useEffectEvent(() => {
    loadAuditLog();
  });
  useEffect(() => {
    loadForCurrentDeployment();
  }, [deploymentId]);

  return (
    <BAIErrorBoundary>
      {auditLogQueryRef ? (
        <Suspense fallback={<Skeleton active paragraph={{ rows: 4 }} />}>
          <ScopedAuditLog
            queryRef={auditLogQueryRef}
            onReload={reloadAuditLogQuery}
            tableSettings={{}}
          />
        </Suspense>
      ) : (
        <Skeleton active paragraph={{ rows: 4 }} />
      )}
    </BAIErrorBoundary>
  );
};

export default DeploymentAuditLogTab;
