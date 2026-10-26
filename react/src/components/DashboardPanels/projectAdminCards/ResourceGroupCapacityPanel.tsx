/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ResourceGroupCapacityPanelQuery } from '../../../__generated__/ResourceGroupCapacityPanelQuery.graphql';
import MemberCard from '../memberCards/MemberCard';
import ResourceUsageBars from '../memberCards/ResourceUsageBars';
import { toLimitUsageRows } from '../memberCards/memberCardData';
import type { PanelComponentProps } from '../types';
import { Divider } from '@lablup/ui-common/Divider';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex } from 'backend.ai-ui';
import React, { Fragment, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ResourceGroupCapacity: React.FC<{
  resourceGroupName: string;
  fetchKey: string;
}> = ({ resourceGroupName, fetchKey }) => {
  'use memo';
  const variables = useDeferredValue({ resourceGroupName });
  const data = useLazyLoadQuery<ResourceGroupCapacityPanelQuery>(
    graphql`
      query ResourceGroupCapacityPanelQuery($resourceGroupName: String!) {
        resourceGroupResourceAllocationV2(
          resourceGroupName: $resourceGroupName
        ) {
          resourceGroup {
            capacity {
              resourceType
              quantity
            }
            used {
              resourceType
              quantity
            }
          }
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const usage = data.resourceGroupResourceAllocationV2?.resourceGroup;
  return (
    <ResourceUsageBars
      rows={toLimitUsageRows(
        usage && {
          used: usage.used,
          limits: usage.capacity.map((entry) => ({
            ...entry,
            unlimited: false,
          })),
        },
      )}
    />
  );
};

/** Used against capacity in each of the card's resource groups (the header's group by default). */
const ResourceGroupCapacityPanel: React.FC<PanelComponentProps> = ({
  vars,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <MemberCard
      title={t('dashboard.card.ResourceGroupCapacity')}
      tooltip={t('dashboard.card.ResourceGroupCapacityTooltip')}
      fetchKey={fetchKey}
    >
      {(key) =>
        vars.resourceGroups.length === 0 ? (
          <Text type="supporting">{t('dashboard.card.NoResourceGroup')}</Text>
        ) : (
          <BAIFlex direction="column" align="stretch" gap="sm">
            {vars.resourceGroups.map((resourceGroupName, index) => (
              <Fragment key={resourceGroupName}>
                {index > 0 ? <Divider /> : null}
                <Text weight="semibold">{resourceGroupName}</Text>
                <ResourceGroupCapacity
                  resourceGroupName={resourceGroupName}
                  fetchKey={key}
                />
              </Fragment>
            ))}
          </BAIFlex>
        )
      }
    </MemberCard>
  );
};

export default ResourceGroupCapacityPanel;
