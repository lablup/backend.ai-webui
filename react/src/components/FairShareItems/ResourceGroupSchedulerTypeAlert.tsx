/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupSchedulerTypeAlertFragment$key } from '../../__generated__/ResourceGroupSchedulerTypeAlertFragment.graphql';
import { Alert, AlertProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface ResourceGroupSchedulerTypeAlertProps extends AlertProps {
  resourceGroupFrgmt?: ResourceGroupSchedulerTypeAlertFragment$key | null;
}

const ResourceGroupSchedulerTypeAlert: React.FC<
  ResourceGroupSchedulerTypeAlertProps
> = ({ resourceGroupFrgmt, ...alertProps }) => {
  'use memo';

  const { t } = useTranslation();

  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupSchedulerTypeAlertFragment on ResourceGroup {
        name
        scheduler {
          type
        }
      }
    `,
    resourceGroupFrgmt,
  );

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
