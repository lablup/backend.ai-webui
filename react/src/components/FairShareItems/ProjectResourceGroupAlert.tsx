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
  // The V2 project list is superadmin-only; a domain admin reads the legacy
  // field (FR-4117 role probe).
  const isSuperAdmin = !!baiClient.is_superadmin;

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

  // `adminAllowedResourceGroupsForProjectV2` answers the caller's reachable
  // set, not the project's association (BA-7921); the association is only
  // exposed from the resource group's side.
  const { adminAllowedProjectsForResourceGroupV2, group } =
    useLazyLoadQuery<ProjectResourceGroupAlertQuery>(
      graphql`
        query ProjectResourceGroupAlertQuery(
          $projectId: UUID!
          $domainName: String!
          $resourceGroupName: String!
          $isSuperAdmin: Boolean!
        ) {
          adminAllowedProjectsForResourceGroupV2(
            resourceGroupName: $resourceGroupName
          ) @include(if: $isSuperAdmin) {
            items
          }
          group(id: $projectId, domain_name: $domainName)
            @skip(if: $isSuperAdmin) {
            scaling_groups
          }
        }
      `,
      { projectId, domainName, resourceGroupName, isSuperAdmin },
      {
        fetchPolicy: isModalOpen ? 'network-only' : 'store-only',
      },
    );

  const isAllowed = isSuperAdmin
    ? _.includes(adminAllowedProjectsForResourceGroupV2?.items, projectId)
    : _.includes(group?.scaling_groups, resourceGroupName);

  if (!resourceGroupName || isAllowed) {
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
