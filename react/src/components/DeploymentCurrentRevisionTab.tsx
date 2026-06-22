/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentCurrentRevisionTab_deployment$key } from '../__generated__/DeploymentCurrentRevisionTab_deployment.graphql';
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import DeploymentRevisionDetail from './DeploymentRevisionDetail';
import DeploymentRevisionDetailDrawer from './DeploymentRevisionDetailDrawer';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Empty, theme } from 'antd';
import { BAIUnmountAfterClose, toLocalId, useInterval } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface DeploymentCurrentRevisionTabProps {
  deploymentFrgmt:
    | DeploymentCurrentRevisionTab_deployment$key
    | null
    | undefined;
  onRefetch: () => void;
}

/**
 * DeploymentCurrentRevisionTab — content of the "Current revision" tab inside
 * `DeploymentRevisionCard`. Shows the active revision detail, the "applying"
 * banner while a different revision is rolling out, and polls the page query
 * until the rollout settles.
 */
const DeploymentCurrentRevisionTab: React.FC<
  DeploymentCurrentRevisionTabProps
> = ({ deploymentFrgmt, onRefetch }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const deployment = useFragment(
    graphql`
      fragment DeploymentCurrentRevisionTab_deployment on ModelDeployment {
        id
        currentRevision @since(version: "26.4.3") {
          id
          revisionNumber
          ...DeploymentRevisionDetail_revision
        }
        deployingRevision @since(version: "26.4.3") {
          id
          revisionNumber
          ...DeploymentRevisionDetail_revision
        }
      }
    `,
    deploymentFrgmt,
  );

  const [drawerState, setDrawerState] = useState<{
    revisionFrgmt: DeploymentRevisionDetail_revision$key;
    status?: 'current' | 'deploying' | 'none';
    title?: string;
  } | null>(null);

  const handleShowRevisionDrawer = (
    frgmt: DeploymentRevisionDetail_revision$key,
    status?: 'current' | 'deploying' | 'none',
    title?: string,
  ) => {
    setDrawerState({ revisionFrgmt: frgmt, status, title });
  };

  const currentRevision = deployment?.currentRevision;
  const deployingRevision = deployment?.deployingRevision;
  const isDeployingDifferentRevision =
    !!deployingRevision && deployingRevision.id !== currentRevision?.id;

  // While a different revision is being applied, poll so the UI moves off the
  // "applying" state once the deployment finishes rolling out. We don't know
  // up-front how long the rollout takes, so we keep refetching until the
  // deploying revision matches the current revision.
  useInterval(onRefetch, isDeployingDifferentRevision ? 5000 : null);

  return (
    <>
      {isDeployingDifferentRevision && (
        <Alert
          type="info"
          icon={<LoadingOutlined spin />}
          showIcon
          style={{ marginBottom: token.marginMD }}
          title={t('deployment.ApplyingRevision', {
            revisionNumber:
              deployingRevision.revisionNumber != null
                ? `#${deployingRevision.revisionNumber}`
                : (toLocalId(deployingRevision.id) ?? ''),
          })}
          action={
            <Button
              onClick={() =>
                handleShowRevisionDrawer(
                  deployingRevision,
                  'deploying',
                  t('deployment.ApplyingRevisionDetail'),
                )
              }
            >
              {t('deployment.ViewRevision')}
            </Button>
          }
        />
      )}
      {currentRevision ? (
        <DeploymentRevisionDetail
          revisionFrgmt={currentRevision}
          status="current"
        />
      ) : !isDeployingDifferentRevision ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('deployment.NoCurrentRevisionDeployed')}
        />
      ) : null}
      <BAIUnmountAfterClose>
        <DeploymentRevisionDetailDrawer
          revisionFrgmt={drawerState?.revisionFrgmt}
          status={drawerState?.status}
          title={drawerState?.title}
          open={!!drawerState}
          onClose={() => setDrawerState(null)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default DeploymentCurrentRevisionTab;
