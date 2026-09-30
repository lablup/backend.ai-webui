import type { ProjectResourceGroupAlertFragment$key } from '../../__generated__/ProjectResourceGroupAlertFragment.graphql';
import type { ProjectResourceGroupAlertQuery } from '../../__generated__/ProjectResourceGroupAlertQuery.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { Banner } from '@astryxdesign/core/Banner';
import * as _ from 'lodash-es';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

// `style` is the only key any call site passes — see the note in
// DomainResourceGroupAlert.tsx for why `AlertProps` is not re-exported here.
interface ProjectResourceGroupAlertProps {
  projectFairShareFrgmt: ProjectResourceGroupAlertFragment$key;
  isModalOpen: boolean;
  style?: CSSProperties;
}

const ProjectResourceGroupAlert: React.FC<ProjectResourceGroupAlertProps> = ({
  projectFairShareFrgmt,
  isModalOpen,
  ...bannerProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const supportsAllowedResourceGroupsV2 = baiClient.supports(
    'allowed-resource-groups-v2',
  );

  const { projectId, domainName, resourceGroupName } = useFragment(
    graphql`
      fragment ProjectResourceGroupAlertFragment on ProjectFairShare {
        projectId
        domainName
        resourceGroupName
      }
    `,
    projectFairShareFrgmt,
  );

  const { adminAllowedResourceGroupsForProjectV2, group } =
    useLazyLoadQuery<ProjectResourceGroupAlertQuery>(
      graphql`
        query ProjectResourceGroupAlertQuery(
          $projectId: UUID!
          $domainName: String!
          $supportsAllowedResourceGroupsV2: Boolean!
        ) {
          adminAllowedResourceGroupsForProjectV2(projectId: $projectId)
            @since(version: "26.4.2")
            @include(if: $supportsAllowedResourceGroupsV2) {
            items
          }
          group(id: $projectId, domain_name: $domainName)
            @deprecatedSince(version: "26.4.2")
            @skip(if: $supportsAllowedResourceGroupsV2) {
            scaling_groups
          }
        }
      `,
      { projectId, domainName, supportsAllowedResourceGroupsV2 },
      {
        fetchPolicy: isModalOpen ? 'network-only' : 'store-only',
      },
    );

  const allowedResourceGroups =
    adminAllowedResourceGroupsForProjectV2?.items ??
    group?.scaling_groups ??
    [];

  if (
    !resourceGroupName ||
    _.includes(allowedResourceGroups, resourceGroupName)
  ) {
    return null;
  }

  return (
    <Banner
      status="warning"
      title={t('fairShare.ProjectNotAllowedInResourceGroup', {
        resourceGroup: resourceGroupName,
      })}
      {...bannerProps}
    />
  );
};

export default ProjectResourceGroupAlert;
