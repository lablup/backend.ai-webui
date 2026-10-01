import type { ProjectResourceGroupWarningIconFragment$key } from '../../__generated__/ProjectResourceGroupWarningIconFragment.graphql';
import type { ProjectResourceGroupWarningIconQuery } from '../../__generated__/ProjectResourceGroupWarningIconQuery.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useTheme } from '@astryxdesign/core/theme';
import { BAIIconWithTooltip } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface ProjectResourceGroupWarningIconProps {
  projectFairShareFrgmt: ProjectResourceGroupWarningIconFragment$key;
}

const ProjectResourceGroupWarningIcon: React.FC<
  ProjectResourceGroupWarningIconProps
> = ({ projectFairShareFrgmt }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = useTheme();
  const baiClient = useSuspendedBackendaiClient();
  // The V2 lists are superadmin-only; a domain admin reads the legacy fields
  // (FR-4117 role probe).
  const isSuperAdmin = !!baiClient.is_superadmin;

  const { projectId, domainName, resourceGroupName } = useFragment(
    graphql`
      fragment ProjectResourceGroupWarningIconFragment on ProjectFairShare {
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
  const {
    adminAllowedProjectsForResourceGroupV2,
    adminAllowedResourceGroupsForDomainV2,
    group,
    domain,
  } = useLazyLoadQuery<ProjectResourceGroupWarningIconQuery>(
    graphql`
      query ProjectResourceGroupWarningIconQuery(
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
        adminAllowedResourceGroupsForDomainV2(domainName: $domainName)
          @include(if: $isSuperAdmin) {
          items
        }
        group(id: $projectId, domain_name: $domainName)
          @skip(if: $isSuperAdmin) {
          scaling_groups
        }
        domain(name: $domainName) @skip(if: $isSuperAdmin) {
          scaling_groups
        }
      }
    `,
    { projectId, domainName, resourceGroupName, isSuperAdmin },
  );

  const isProjectAllowed = isSuperAdmin
    ? _.includes(adminAllowedProjectsForResourceGroupV2?.items, projectId)
    : _.includes(group?.scaling_groups, resourceGroupName);
  const isDomainAllowed = _.includes(
    adminAllowedResourceGroupsForDomainV2?.items ?? domain?.scaling_groups,
    resourceGroupName,
  );

  if (!resourceGroupName || isProjectAllowed || isDomainAllowed) {
    return null;
  }

  return (
    <BAIIconWithTooltip
      content={t('fairShare.ProjectNotAllowedInResourceGroup', {
        resourceGroup: resourceGroupName,
      })}
      icon={<TriangleAlert style={{ color: token('--color-warning') }} />}
    />
  );
};

export default ProjectResourceGroupWarningIcon;
