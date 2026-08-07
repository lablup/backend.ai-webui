/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import DeploymentRevisionDetail from './DeploymentRevisionDetail';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Drawer } from '@astryxdesign/lab';
import React from 'react';
import { useTranslation } from 'react-i18next';

type RevisionStatus = 'current' | 'deploying' | 'none';

// PILOT-DECISION: props no longer extend antd `DrawerProps`. The explicit
// interface below covers exactly what the repo's consumers pass (grepped:
// DeploymentListPage, ProjectAdminDeploymentsPage, DeploymentDetailPage,
// DeploymentCurrentRevisionTab, DeploymentReplicasCard, AdminDeployment,
// DeploymentRevisionHistoryTab, DeploymentsAstryxProbe → `open`, `onClose`,
// `revisionFrgmt`, `status`, plus `title` and `extra`). The antd names are
// kept on the public surface and mapped to the lab Drawer internally
// (`open`→`isOpen`; antd `size="large"` ≈ 736px → `size={736}`).
interface DeploymentRevisionDetailDrawerProps {
  /** Whether the drawer is open. antd Drawer's `open`. */
  open?: boolean;
  /** Close request handler (Escape, scrim click, close button). */
  onClose?: () => void;
  revisionFrgmt?: DeploymentRevisionDetail_revision$key | null;
  status?: RevisionStatus;
  /** Heading text; defaults to the shared "Revision detail" string. */
  title?: string;
  /** Header actions rendered beside the heading. antd Drawer's `extra`. */
  extra?: React.ReactNode;
}

const DeploymentRevisionDetailDrawer: React.FC<
  DeploymentRevisionDetailDrawerProps
> = ({ open = false, onClose, revisionFrgmt, status, title, extra }) => {
  'use memo';
  const { t } = useTranslation();

  const heading = title ?? t('deployment.RevisionDetail');

  return (
    <Drawer
      isOpen={open}
      onClose={() => onClose?.()}
      side="end"
      size={736}
      label={heading}
    >
      {/* lab Drawer renders its content flush to the panel edges; reproduce
          the antd Drawer's 24px body padding with the spacing-6 token. */}
      <VStack gap={4} align="stretch" style={{ padding: 'var(--spacing-6)' }}>
        {/* lab Drawer has no title bar (only its built-in close button in the
            top-trailing corner), so render the visible heading — and the
            former antd `extra` actions — as the first content row. */}
        <HStack gap={2} align="center" justify="between">
          <Heading level={5}>{heading}</Heading>
          {extra}
        </HStack>
        {revisionFrgmt ? (
          <DeploymentRevisionDetail
            revisionFrgmt={revisionFrgmt}
            status={status}
          />
        ) : (
          <BAISkeletonAstryx />
        )}
      </VStack>
    </Drawer>
  );
};

export default DeploymentRevisionDetailDrawer;
