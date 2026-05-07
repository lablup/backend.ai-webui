/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import DeploymentRevisionDetail from './DeploymentRevisionDetail';
import { Drawer, Skeleton } from 'antd';
import { DrawerProps } from 'antd/lib';
import React from 'react';
import { useTranslation } from 'react-i18next';

type RevisionStatus = 'current' | 'deploying' | 'none';

interface DeploymentRevisionDetailDrawerProps extends DrawerProps {
  revisionFrgmt?: DeploymentRevisionDetail_revision$key | null;
  status?: RevisionStatus;
}

const DeploymentRevisionDetailDrawer: React.FC<
  DeploymentRevisionDetailDrawerProps
> = ({ revisionFrgmt, status, ...drawerProps }) => {
  'use memo';
  const { t } = useTranslation();

  return (
    <Drawer
      title={t('deployment.RevisionDetail')}
      size="large"
      {...drawerProps}
    >
      {revisionFrgmt ? (
        <DeploymentRevisionDetail
          revisionFrgmt={revisionFrgmt}
          status={status}
        />
      ) : (
        <Skeleton active />
      )}
    </Drawer>
  );
};

export default DeploymentRevisionDetailDrawer;
