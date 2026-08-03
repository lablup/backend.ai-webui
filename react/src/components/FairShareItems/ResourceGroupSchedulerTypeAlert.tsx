/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupSchedulerTypeAlertQuery } from '../../__generated__/ResourceGroupSchedulerTypeAlertQuery.graphql';
import { Alert, AlertProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface ResourceGroupSchedulerTypeAlertProps extends AlertProps {
  resourceGroupName: string;
}

const ResourceGroupSchedulerTypeAlert: React.FC<
  ResourceGroupSchedulerTypeAlertProps
> = ({ resourceGroupName, ...alertProps }) => {
  'use memo';

  const { t } = useTranslation();

  const { resourceGroups } =
    useLazyLoadQuery<ResourceGroupSchedulerTypeAlertQuery>(
      graphql`
        query ResourceGroupSchedulerTypeAlertQuery(
          $resourceGroupName: String!
        ) {
          resourceGroups: adminResourceGroups(
            filter: { name: { equals: $resourceGroupName } }
            limit: 1
          ) {
            edges {
              node {
                name
                scheduler {
                  type
                }
              }
            }
          }
        }
      `,
      { resourceGroupName },
      { fetchPolicy: 'store-and-network' },
    );

  const resourceGroup = resourceGroups?.edges?.[0]?.node;
  if (!resourceGroup || resourceGroup.scheduler?.type === 'FAIR_SHARE') {
    return null;
  }

  return (
    <Alert
      type="warning"
      title={t('fairShare.SchedulerDoesNotAppliedToResourceGroup', {
        resourceGroup: resourceGroup.name,
      })}
      showIcon
      {...alertProps}
    />
  );
};

export default ResourceGroupSchedulerTypeAlert;
