/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import DeploymentRevisionDetail from './DeploymentRevisionDetail';
import { BAIDrawer, type BAIDrawerProps, BAISkeleton } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type RevisionStatus = 'current' | 'deploying' | 'none';

interface DeploymentRevisionDetailDrawerProps extends Omit<
  BAIDrawerProps,
  'title' | 'children'
> {
  revisionFrgmt?: DeploymentRevisionDetail_revision$key | null;
  status?: RevisionStatus;
  /** Heading text; defaults to the shared "Revision detail" string. */
  title?: string;
}

const DeploymentRevisionDetailDrawer: React.FC<
  DeploymentRevisionDetailDrawerProps
> = ({ revisionFrgmt, status, title, ...drawerProps }) => {
  'use memo';
  const { t } = useTranslation();

  const heading = title ?? t('deployment.RevisionDetail');

  return (
    <BAIDrawer {...drawerProps} side="end" size={736} title={heading}>
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
