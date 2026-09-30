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
  const supportsAllowedResourceGroupsV2 = baiClient.supports(
    'allowed-resource-groups-v2',
  );

  const {
    adminAllowedResourceGroupsForDomainV2,
    adminAllowedResourceGroupsForProjectV2,
    projectV2,
    domain,
    group,
  } = useLazyLoadQuery<UserResourceGroupAlertQuery>(
    graphql`
      query UserResourceGroupAlertQuery(
        $projectId: UUID!
        $domainName: String!
        $supportsAllowedResourceGroupsV2: Boolean!
      ) {
        adminAllowedResourceGroupsForDomainV2(domainName: $domainName)
          @since(version: "26.4.2")
          @include(if: $supportsAllowedResourceGroupsV2) {
          items
        }
        adminAllowedResourceGroupsForProjectV2(projectId: $projectId)
          @since(version: "26.4.2")
          @include(if: $supportsAllowedResourceGroupsV2) {
          items
        }
        projectV2(projectId: $projectId)
          @since(version: "26.2.0")
          @include(if: $supportsAllowedResourceGroupsV2) {
          basicInfo {
            name
          }
        }
        domain(name: $domainName)
          @deprecatedSince(version: "26.4.2")
          @skip(if: $supportsAllowedResourceGroupsV2) {
          scaling_groups
        }
        group(id: $projectId, domain_name: $domainName)
          @deprecatedSince(version: "26.4.2")
          @skip(if: $supportsAllowedResourceGroupsV2) {
          name
          scaling_groups
        }
      }
    `,
    { projectId, domainName, supportsAllowedResourceGroupsV2 },
    {
      fetchPolicy: _.isUndefined(isModalOpen)
        ? 'network-only'
        : isModalOpen
          ? 'network-only'
          : 'store-only',
    },
  );

  const domainResourceGroups =
    adminAllowedResourceGroupsForDomainV2?.items ??
    domain?.scaling_groups ??
    [];
  const projectResourceGroups =
    adminAllowedResourceGroupsForProjectV2?.items ??
    group?.scaling_groups ??
    [];
  const projectName = projectV2?.basicInfo?.name ?? group?.name;

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
        project: projectName,
        resourceGroup: resourceGroupName,
      })}
      {...bannerProps}
    />
  );
};

export default UserResourceGroupAlert;
