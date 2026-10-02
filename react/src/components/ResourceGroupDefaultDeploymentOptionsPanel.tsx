/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupDefaultDeploymentOptionsPanelFragment$key } from '../__generated__/ResourceGroupDefaultDeploymentOptionsPanelFragment.graphql';
import { ResourceGroupDefaultDeploymentOptionsPanel_options$key } from '../__generated__/ResourceGroupDefaultDeploymentOptionsPanel_options.graphql';
import ResourceGroupDefaultDeploymentOptionsModal from './ResourceGroupDefaultDeploymentOptionsModal';
import { HandlerOptionsDescription } from './ResourceGroupHandlerOptionsFields';
import { BAIButton, BAICard, BAIUnmountAfterClose } from 'backend.ai-ui';
import { SquarePenIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface ResourceGroupDefaultDeploymentOptionsPanelProps {
  resourceGroupFrgmt: ResourceGroupDefaultDeploymentOptionsPanelFragment$key;
}

const ResourceGroupDefaultDeploymentOptionsPanel: React.FC<
  ResourceGroupDefaultDeploymentOptionsPanelProps
> = ({ resourceGroupFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupDefaultDeploymentOptionsPanelFragment on ResourceGroup {
        defaultDeploymentOptions @since(version: "26.4.4rc1") {
          ...ResourceGroupDefaultDeploymentOptionsPanel_options
        }
        ...ResourceGroupDefaultDeploymentOptionsModalFragment
      }
    `,
    resourceGroupFrgmt,
  );
  const options =
    useFragment<ResourceGroupDefaultDeploymentOptionsPanel_options$key>(
      graphql`
        fragment ResourceGroupDefaultDeploymentOptionsPanel_options on DeploymentOptionsInfo {
          handlerOptions {
            default {
              timeoutSec
              maxRetryCount
            }
            byHandler {
              handlerName
              timeoutSec
              maxRetryCount
            }
          }
        }
      `,
      resourceGroup.defaultDeploymentOptions ?? null,
    );

  return (
    <BAICard
      extra={
        <BAIButton
          icon={<SquarePenIcon />}
          onClick={() => setIsEditModalOpen(true)}
        >
          {t('button.Edit')}
        </BAIButton>
      }
    >
      <HandlerOptionsDescription handlerOptions={options?.handlerOptions} />
      <BAIUnmountAfterClose>
        <ResourceGroupDefaultDeploymentOptionsModal
          open={isEditModalOpen}
          resourceGroupFrgmt={resourceGroup}
          onRequestClose={() => setIsEditModalOpen(false)}
        />
      </BAIUnmountAfterClose>
    </BAICard>
  );
};

export default ResourceGroupDefaultDeploymentOptionsPanel;
