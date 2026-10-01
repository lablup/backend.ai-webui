import type { UserResourceGroupAlertQuery } from '../../__generated__/UserResourceGroupAlertQuery.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
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
  const baiClient = useSuspendedBackendaiClient();
  // The V2 lists are superadmin-only; a domain admin reads the legacy fields
  // (FR-4117 role probe). `projectV2` answers both roles.
  const isSuperAdmin = !!baiClient.is_superadmin;

  // `adminAllowedResourceGroupsForProjectV2` answers the caller's reachable
  // set, not the project's association (BA-7921); the association is only
  // exposed from the resource group's side.
  const {
    adminAllowedResourceGroupsForDomainV2,
    adminAllowedProjectsForResourceGroupV2,
    domain,
    group,
    projectV2,
  } = useLazyLoadQuery<UserResourceGroupAlertQuery>(
    graphql`
      query UserResourceGroupAlertQuery(
        $projectId: UUID!
        $domainName: String!
        $resourceGroupName: String!
        $isSuperAdmin: Boolean!
      ) {
        adminAllowedResourceGroupsForDomainV2(domainName: $domainName)
          @include(if: $isSuperAdmin) {
          items
        }
        adminAllowedProjectsForResourceGroupV2(
          resourceGroupName: $resourceGroupName
        ) @include(if: $isSuperAdmin) {
          items
        }
        domain(name: $domainName) @skip(if: $isSuperAdmin) {
          scaling_groups
        }
        group(id: $projectId, domain_name: $domainName)
          @skip(if: $isSuperAdmin) {
          scaling_groups
        }
        projectV2(projectId: $projectId) {
          basicInfo {
            name
          }
        }
      }
    `,
    { projectId, domainName, resourceGroupName, isSuperAdmin },
    {
      fetchPolicy: _.isUndefined(isModalOpen)
        ? 'network-only'
        : isModalOpen
          ? 'network-only'
          : 'store-only',
    },
  );

  const isDomainAllowed = _.includes(
    adminAllowedResourceGroupsForDomainV2?.items ?? domain?.scaling_groups,
    resourceGroupName,
  );
  const isProjectAllowed = isSuperAdmin
    ? _.includes(adminAllowedProjectsForResourceGroupV2?.items, projectId)
    : _.includes(group?.scaling_groups, resourceGroupName);

  if (!resourceGroupName || isDomainAllowed || isProjectAllowed) {
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
