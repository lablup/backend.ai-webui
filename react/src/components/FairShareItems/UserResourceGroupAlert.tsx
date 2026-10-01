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

  const {
    adminAllowedResourceGroupsForDomainV2,
    adminAllowedResourceGroupsForProjectV2,
    projectV2,
  } = useLazyLoadQuery<UserResourceGroupAlertQuery>(
    graphql`
      query UserResourceGroupAlertQuery(
        $projectId: UUID!
        $domainName: String!
      ) {
        adminAllowedResourceGroupsForDomainV2(domainName: $domainName) {
          items
        }
        adminAllowedResourceGroupsForProjectV2(projectId: $projectId) {
          items
        }
        projectV2(projectId: $projectId) {
          basicInfo {
            name
          }
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

  const domainResourceGroups =
    adminAllowedResourceGroupsForDomainV2?.items ?? [];
  const projectResourceGroups =
    adminAllowedResourceGroupsForProjectV2?.items ?? [];

  if (
    !resourceGroupName ||
    _.includes(domainResourceGroups, resourceGroupName) ||
    _.includes(projectResourceGroups, resourceGroupName)
  ) {
    return null;
  }

  return (
    <Banner
      status="warning"
      title={t('fairShare.UserNotAllowedInResourceGroup', {
        project: projectV2?.basicInfo?.name,
        resourceGroup: resourceGroupName,
      })}
      {...bannerProps}
    />
  );
};

export default UserResourceGroupAlert;
