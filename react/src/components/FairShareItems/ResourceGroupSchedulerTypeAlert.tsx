/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupSchedulerTypeAlertFragment$key } from '../../__generated__/ResourceGroupSchedulerTypeAlertFragment.graphql';
import { Banner } from '@astryxdesign/core/Banner';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

// `style` is the only pass-through key any call site would use — the antd-era
// `extends AlertProps` surface is gone with antd; see the matching note in
// DomainResourceGroupAlert.tsx.
interface ResourceGroupSchedulerTypeAlertProps {
  resourceGroupFrgmt?: ResourceGroupSchedulerTypeAlertFragment$key | null;
  style?: CSSProperties;
}

const ResourceGroupSchedulerTypeAlert: React.FC<
  ResourceGroupSchedulerTypeAlertProps
> = ({ resourceGroupFrgmt, ...bannerProps }) => {
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
    <Banner
      status="warning"
      title={t('fairShare.SchedulerDoesNotAppliedToResourceGroup', {
        resourceGroup: resourceGroup.name,
      })}
      {...bannerProps}
    />
  );
};

export default ResourceGroupSchedulerTypeAlert;
