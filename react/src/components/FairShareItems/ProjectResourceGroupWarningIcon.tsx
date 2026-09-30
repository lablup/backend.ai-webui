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
  const supportsAllowedResourceGroupsV2 = baiClient.supports(
    'allowed-resource-groups-v2',
  );

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

  const {
    adminAllowedResourceGroupsForProjectV2,
    adminAllowedResourceGroupsForDomainV2,
    group,
    domain,
  } = useLazyLoadQuery<ProjectResourceGroupWarningIconQuery>(
    graphql`
      query ProjectResourceGroupWarningIconQuery(
        $projectId: UUID!
        $domainName: String!
        $supportsAllowedResourceGroupsV2: Boolean!
      ) {
        adminAllowedResourceGroupsForProjectV2(projectId: $projectId)
          @since(version: "26.4.2")
          @include(if: $supportsAllowedResourceGroupsV2) {
          items
        }
        adminAllowedResourceGroupsForDomainV2(domainName: $domainName)
          @since(version: "26.4.2")
          @include(if: $supportsAllowedResourceGroupsV2) {
          items
        }
        group(id: $projectId, domain_name: $domainName)
          @deprecatedSince(version: "26.4.2")
          @skip(if: $supportsAllowedResourceGroupsV2) {
          scaling_groups
        }
        domain(name: $domainName)
          @deprecatedSince(version: "26.4.2")
          @skip(if: $supportsAllowedResourceGroupsV2) {
          scaling_groups
        }
      }
    `,
    { projectId, domainName, supportsAllowedResourceGroupsV2 },
  );

  const projectResourceGroups =
    adminAllowedResourceGroupsForProjectV2?.items ??
    group?.scaling_groups ??
    [];
  const domainResourceGroups =
    adminAllowedResourceGroupsForDomainV2?.items ??
    domain?.scaling_groups ??
    [];

  if (
    !resourceGroupName ||
    _.includes(projectResourceGroups, resourceGroupName) ||
    _.includes(domainResourceGroups, resourceGroupName)
  ) {
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
