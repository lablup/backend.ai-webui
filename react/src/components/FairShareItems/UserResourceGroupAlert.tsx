import type { UserResourceGroupAlertQuery } from '../../__generated__/UserResourceGroupAlertQuery.graphql';
import { Banner } from '@astryxdesign/core/Banner';
import * as _ from 'lodash-es';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// `style` is the only key any call site passes (`FairShareWeightSettingModal`;
// `FairShareList` passes none) — see the note in DomainResourceGroupAlert.tsx.
interface UserResourceGroupAlertProps {
  isModalOpen?: boolean;
  resourceGroupName: string;
  domainName: string;
  projectId: string;
  style?: CSSProperties;
}

const UserResourceGroupAlert: React.FC<UserResourceGroupAlertProps> = ({
  isModalOpen,
  resourceGroupName,
  domainName,
  projectId,
  ...bannerProps
}) => {
  'use memo';

  const { t } = useTranslation();

  const { domain, group } = useLazyLoadQuery<UserResourceGroupAlertQuery>(
    graphql`
      query UserResourceGroupAlertQuery(
        $projectId: UUID!
        $domainName: String
      ) {
        domain(name: $domainName) {
          scaling_groups
        }
        group(id: $projectId, domain_name: $domainName) {
          name
          scaling_groups
        }
      }
    `,
    { projectId, domainName },
    {
      fetchPolicy: _.isUndefined(isModalOpen)
        ? 'network-only'
        : isModalOpen
          ? 'network-only'
          : 'store-only',
    },
  );

  const domainScalingGroups = domain?.scaling_groups ?? [];
  const projectScalingGroups = group?.scaling_groups ?? [];

  if (
    !resourceGroupName ||
    _.includes(domainScalingGroups, resourceGroupName) ||
    _.includes(projectScalingGroups, resourceGroupName)
  ) {
    return null;
  }

  return (
    <Banner
      status="warning"
      title={t('fairShare.UserNotAllowedInResourceGroup', {
        project: group?.name,
        resourceGroup: resourceGroupName,
      })}
      {...bannerProps}
    />
  );
};

export default UserResourceGroupAlert;
