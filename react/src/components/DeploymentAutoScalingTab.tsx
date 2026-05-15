/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentAutoScalingTab_deployment$key } from '../__generated__/DeploymentAutoScalingTab_deployment.graphql';
import { useCurrentUserInfo } from '../hooks/backendai';
import AutoScalingRuleList, {
  type AutoScalingRuleListRef,
} from './AutoScalingRuleList';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Skeleton, Tooltip, theme } from 'antd';
import { BAIButton, BAICard, BAIFetchKeyButton, BAIFlex } from 'backend.ai-ui';
import { PlusIcon } from 'lucide-react';
import React, { Suspense, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface DeploymentAutoScalingTabProps {
  deploymentFrgmt: DeploymentAutoScalingTab_deployment$key | null | undefined;
}

/**
 * DeploymentAutoScalingTab — section card on the Deployment detail page that
 * hosts the Auto-Scaling Rules management UI.
 *
 * The card owns the section title, the refresh button, and the primary "Add
 * rules" button — all rendered in the BAICard `extra` slot per project
 * convention. The actual rule list (`AutoScalingRuleList`) still owns the
 * editor modal; we drive it via an imperative `ref` so the trigger can live
 * in the card header while the modal stays co-located with the data it
 * mutates.
 */
const DeploymentAutoScalingTab: React.FC<DeploymentAutoScalingTabProps> = ({
  deploymentFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [currentUser] = useCurrentUserInfo();
  const autoScalingRef = useRef<AutoScalingRuleListRef>(null);

  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, setFetchKey] = useState(0);

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
  // DeploymentStatus has no explicit DESTROYED state; STOPPING / STOPPED are
  // the terminal lifecycle states that should disable mutations, mirroring
  // `isEndpointInDestroyingCategory` from the legacy Endpoint API.
  const isEndpointDestroying = status === 'STOPPING' || status === 'STOPPED';

  const creatorEmail = deployment.creator?.basicInfo?.email ?? null;
  // When the creator is unknown (e.g. on manager versions < 26.4.3 where the
  // `creator` field is not yet resolvable), fall back to "owned" so the UI
  // does not over-restrict.
  const isOwnedByCurrentUser =
    !creatorEmail || creatorEmail === currentUser.email;

  const isAddDisabled = isEndpointDestroying || !isOwnedByCurrentUser;

  const handleRefetch = () => {
    startRefetchTransition(() => {
      setFetchKey((k) => k + 1);
    });
  };

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
      extra={
        <BAIFlex gap="xs" align="center">
          <BAIFetchKeyButton
            loading={isPendingRefetch}
            value=""
            onChange={handleRefetch}
          />
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            disabled={isAddDisabled}
            onClick={() => autoScalingRef.current?.openAddModal()}
          >
            {t('modelService.AddRules')}
          </BAIButton>
        </BAIFlex>
      }
      styles={{ body: { paddingTop: 0 } }}
    >
      <Suspense fallback={<Skeleton active />}>
        <AutoScalingRuleList
          ref={autoScalingRef}
          deploymentId={deployment.id}
          isEndpointDestroying={isEndpointDestroying}
          isOwnedByCurrentUser={isOwnedByCurrentUser}
          fetchKey={String(fetchKey)}
          hideInlineAddButton
          hideInlineRefreshButton
        />
      </Suspense>
    </BAICard>
  );
};

export default DeploymentAutoScalingTab;
