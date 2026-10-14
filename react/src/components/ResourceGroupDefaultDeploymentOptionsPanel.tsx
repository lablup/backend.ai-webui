/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupDefaultDeploymentOptionsModal_schedulingHandlers$key } from '../__generated__/ResourceGroupDefaultDeploymentOptionsModal_schedulingHandlers.graphql';
import { ResourceGroupDefaultDeploymentOptionsPanelFragment$key } from '../__generated__/ResourceGroupDefaultDeploymentOptionsPanelFragment.graphql';
import { ResourceGroupDefaultDeploymentOptionsPanelQuery } from '../__generated__/ResourceGroupDefaultDeploymentOptionsPanelQuery.graphql';
import { ResourceGroupDefaultDeploymentOptionsPanel_options$key } from '../__generated__/ResourceGroupDefaultDeploymentOptionsPanel_options.graphql';
import ResourceGroupDefaultDeploymentOptionsModal from './ResourceGroupDefaultDeploymentOptionsModal';
import { HandlerOptionsDescription } from './ResourceGroupHandlerOptionsFields';
import ResourceGroupOptionsSection from './ResourceGroupOptionsSection';
import { EmptyState } from '@lablup/ui-common/EmptyState';
import { BAIFlex, BAIUnmountAfterClose } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface ResourceGroupDefaultDeploymentOptionsPanelContentProps {
  queryRef: ResourceGroupDefaultDeploymentOptionsModal_schedulingHandlers$key;
  resourceGroupFrgmt: ResourceGroupDefaultDeploymentOptionsPanelFragment$key;
}

const ResourceGroupDefaultDeploymentOptionsPanelContent: React.FC<
  ResourceGroupDefaultDeploymentOptionsPanelContentProps
> = ({ queryRef, resourceGroupFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupDefaultDeploymentOptionsPanelFragment on ResourceGroup {
        defaultDeploymentOptions {
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
    <BAIFlex direction="column" align="stretch" gap="sm">
      <ResourceGroupOptionsSection
        title={t('resourceGroup.HandlerOptions')}
        onEdit={() => setIsEditModalOpen(true)}
      >
        <HandlerOptionsDescription handlerOptions={options?.handlerOptions} />
      </ResourceGroupOptionsSection>
      <BAIUnmountAfterClose>
        <ResourceGroupDefaultDeploymentOptionsModal
          open={isEditModalOpen}
          queryRef={queryRef}
          resourceGroupFrgmt={resourceGroup}
          onRequestClose={() => setIsEditModalOpen(false)}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

const ResourceGroupDefaultDeploymentOptionsPanel: React.FC<{
  resourceGroupName: string;
  fetchKey: string;
}> = ({ resourceGroupName, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  // Its own query and its own pagination args (so its own store record): a
  // manager error inside the options nulls this node, not the drawer's.
  const queryData =
    useLazyLoadQuery<ResourceGroupDefaultDeploymentOptionsPanelQuery>(
      graphql`
        query ResourceGroupDefaultDeploymentOptionsPanelQuery(
          $filter: ResourceGroupFilter
        ) {
          adminResourceGroups(filter: $filter, last: 1) {
            edges {
              node {
                ...ResourceGroupDefaultDeploymentOptionsPanelFragment
              }
            }
          }
          ...ResourceGroupDefaultDeploymentOptionsModal_schedulingHandlers
        }
      `,
      { filter: { name: { equals: resourceGroupName } } },
      { fetchPolicy: 'store-and-network', fetchKey },
    );
  const node = queryData.adminResourceGroups?.edges[0]?.node;

  return node ? (
    <ResourceGroupDefaultDeploymentOptionsPanelContent
      queryRef={queryData}
      resourceGroupFrgmt={node}
    />
  ) : (
    <EmptyState
      title={t('resourceGroup.FailedToLoadDefaultOptions')}
      isCompact
    />
  );
};

export default ResourceGroupDefaultDeploymentOptionsPanel;
