/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentRevisionCard_deployment$key } from '../__generated__/DeploymentRevisionCard_deployment.graphql';
import DeploymentAuditLogTab from './DeploymentAuditLogTab';
import DeploymentCurrentRevisionTab from './DeploymentCurrentRevisionTab';
import DeploymentRevisionHistoryTab from './DeploymentRevisionHistoryTab';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import useResizeObserver from '@react-hook/resize-observer';
import { Skeleton } from 'antd';
import { BAIButton, BAICard } from 'backend.ai-ui';
import { PlusIcon } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import React, { Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

/**
 * Narrowest card width that still fits the three tab labels and the
 * "Add Revision" button on one row. Below it the tab bar starts clipping tab
 * labels behind the overflow menu, so the button moves to its own line above
 * the tabs instead of competing with them for the same row.
 */
const INLINE_TAB_ACTION_MIN_WIDTH = 560;

interface DeploymentRevisionCardProps {
  deploymentFrgmt: DeploymentRevisionCard_deployment$key | null;
  revisionFetchKey: string;
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

  // The card width — not the viewport — decides whether the action fits next
  // to the tabs: the side navigation collapses at its own breakpoint, so the
  // same viewport can leave very different room here.
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isTabActionInline, setIsTabActionInline] = useState(true);
  useResizeObserver(cardRef, ({ contentRect }) => {
    setIsTabActionInline(contentRect.width >= INLINE_TAB_ACTION_MIN_WIDTH);
  });

  const attachCardRef = (node: HTMLDivElement | null) => {
    cardRef.current = node;
    if (revisionCardRef) {
      revisionCardRef.current = node;
    }
  };

  const addRevisionButton = (
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
      ref={attachCardRef}
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
      // Wide enough: the action sits in the tab bar. Too narrow: it moves up
      // into the card header (`extra`) so the tab labels keep the full row,
      // and a tighter gutter keeps all three labels on that row rather than
      // half-clipping the last one behind the overflow menu.
      tabBarExtraContent={isTabActionInline ? addRevisionButton : undefined}
      extra={isTabActionInline ? undefined : addRevisionButton}
      tabProps={isTabActionInline ? undefined : { tabBarGutter: 16 }}
    >
      {activeRevisionTab === 'currentRevision' && (
        <DeploymentCurrentRevisionTab deploymentFrgmt={deployment} />
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
