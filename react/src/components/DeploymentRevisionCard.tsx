/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentRevisionCard_deployment$key } from '../__generated__/DeploymentRevisionCard_deployment.graphql';
import DeploymentAuditLogTab from './DeploymentAuditLogTab';
import DeploymentCurrentRevisionTab from './DeploymentCurrentRevisionTab';
import DeploymentRevisionHistoryTab from './DeploymentRevisionHistoryTab';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import { Skeleton } from 'antd';
import { BAIButton, BAICard, BAIFlex } from 'backend.ai-ui';
import { PlusIcon } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface DeploymentRevisionCardProps {
  deploymentFrgmt: DeploymentRevisionCard_deployment$key | null;
  revisionFetchKey: string;
  onRefetch: () => void;
  onAddRevision: () => void;
  revisionCardRef?: React.RefObject<HTMLDivElement | null>;
  isAddRevisionDisabled?: boolean;
}

/**
 * DeploymentRevisionCard — top-level revision card on the Deployment detail
 * page. A thin tabbed container: it owns the `BAICard`, the tab state, and the
 * "Add Revision" action only. Each tab's content lives in its own component
 * (current revision / revision history / audit log).
 */
const DeploymentRevisionCard: React.FC<DeploymentRevisionCardProps> = ({
  deploymentFrgmt,
  revisionFetchKey,
  onRefetch,
  onAddRevision,
  revisionCardRef,
  isAddRevisionDisabled = false,
}) => {
  'use memo';
  const { t } = useTranslation();

  const deployment = useFragment(
    graphql`
      fragment DeploymentRevisionCard_deployment on ModelDeployment {
        id
        ...DeploymentCurrentRevisionTab_deployment
        ...DeploymentRevisionHistoryTab_deployment
      }
    `,
    deploymentFrgmt,
  );

  const [activeRevisionTab, setActiveRevisionTab] = useQueryState(
    'revisionTab',
    {
      ...parseAsStringLiteral([
        'currentRevision',
        'revisionHistory',
        'auditLog',
      ] as const).withDefault('currentRevision'),
      history: 'replace' as const,
      scroll: false,
    },
  );

  return (
    <BAICard
      ref={revisionCardRef}
      activeTabKey={activeRevisionTab}
      onTabChange={(key) => {
        if (
          key === 'currentRevision' ||
          key === 'revisionHistory' ||
          key === 'auditLog'
        ) {
          void setActiveRevisionTab(key);
        }
      }}
      tabList={[
        {
          key: 'currentRevision',
          label: t('deployment.CurrentRevision'),
        },
        {
          key: 'revisionHistory',
          label: t('deployment.RevisionHistory'),
        },
        {
          key: 'auditLog',
          label: t('auditLog.AuditLog'),
        },
      ]}
      tabBarExtraContent={
        <BAIFlex gap="xs" align="center">
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            disabled={isAddRevisionDisabled}
            // `action` (not `onClick`) wraps the open state update in
            // `startTransition` so the page stays interactive while the
            // modal mounts.
            action={async () => {
              onAddRevision();
            }}
          >
            {t('deployment.AddRevision')}
          </BAIButton>
        </BAIFlex>
      }
    >
      {activeRevisionTab === 'currentRevision' && (
        <DeploymentCurrentRevisionTab
          deploymentFrgmt={deployment}
          onRefetch={onRefetch}
        />
      )}
      {activeRevisionTab === 'revisionHistory' && deployment && (
        <ErrorBoundaryWithNullFallback>
          <Suspense fallback={<Skeleton active paragraph={{ rows: 4 }} />}>
            <DeploymentRevisionHistoryTab
              deploymentFrgmt={deployment}
              deploymentId={deployment.id}
              fetchKey={revisionFetchKey}
            />
          </Suspense>
        </ErrorBoundaryWithNullFallback>
      )}
      {activeRevisionTab === 'auditLog' && deployment && (
        <DeploymentAuditLogTab deploymentId={deployment.id} />
      )}
    </BAICard>
  );
};

export default DeploymentRevisionCard;
