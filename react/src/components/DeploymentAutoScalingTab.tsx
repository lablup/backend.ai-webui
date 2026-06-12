/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentAutoScalingTab_deployment$key } from '../__generated__/DeploymentAutoScalingTab_deployment.graphql';
import { useCurrentUserInfo } from '../hooks/backendai';
import AutoScalingRuleList from './AutoScalingRuleList';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Skeleton, Tooltip, theme } from 'antd';
import { BAICard, BAIFlex, isDeploymentInStoppedCategory } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface DeploymentAutoScalingTabProps {
  deploymentFrgmt: DeploymentAutoScalingTab_deployment$key | null | undefined;
}

/**
 * DeploymentAutoScalingTab — section card on the Deployment detail page that
 * hosts the Auto-Scaling Rules management UI.
 *
 * The card owns the section title only. Both the refresh button
 * (`BAIFetchKeyButton`) and the primary "Add rules" button live inside
 * `AutoScalingRuleList`'s toolbar next to the property filter, so the table
 * controls stay grouped together (per Jongeun's feedback).
 */
const DeploymentAutoScalingTab: React.FC<DeploymentAutoScalingTabProps> = ({
  deploymentFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [currentUser] = useCurrentUserInfo();

  const deployment = useFragment(
    graphql`
      fragment DeploymentAutoScalingTab_deployment on ModelDeployment {
        id
        metadata {
          status
        }
        creator @since(version: "26.4.3") {
          basicInfo {
            email
          }
        }
      }
    `,
    deploymentFrgmt,
  );

  if (!deployment?.id) {
    return null;
  }

  const status = deployment.metadata?.status;

  const creatorEmail = deployment.creator?.basicInfo?.email ?? null;
  const isOwnedByCurrentUser =
    !creatorEmail || creatorEmail === currentUser.email;

  return (
    <BAICard
      title={
        <BAIFlex gap="xs" align="center">
          {t('deployment.tab.AutoScaling')}
          <Tooltip title={t('deployment.tab.description.AutoScaling')}>
            <QuestionCircleOutlined
              style={{ color: token.colorTextDescription }}
            />
          </Tooltip>
        </BAIFlex>
      }
      styles={{ body: { paddingTop: 0 } }}
    >
      <Suspense fallback={<Skeleton active />}>
        <AutoScalingRuleList
          deploymentId={deployment.id}
          isEndpointDestroying={isDeploymentInStoppedCategory(status)}
          isOwnedByCurrentUser={isOwnedByCurrentUser}
        />
      </Suspense>
    </BAICard>
  );
};

export default DeploymentAutoScalingTab;
