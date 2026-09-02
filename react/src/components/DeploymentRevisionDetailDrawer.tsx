/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import DeploymentRevisionDetail from './DeploymentRevisionDetail';
import { BAIDrawer, BAISkeleton } from 'backend.ai-ui';
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
    <BAIDrawer
      open={open}
      onClose={onClose}
      side="end"
      size={736}
      title={heading}
      extra={extra}
    >
      {revisionFrgmt ? (
        <DeploymentRevisionDetail
          revisionFrgmt={revisionFrgmt}
          status={status}
        />
      ) : (
        <BAISkeleton />
      )}
    </BAIDrawer>
  );
};

export default DeploymentRevisionDetailDrawer;
