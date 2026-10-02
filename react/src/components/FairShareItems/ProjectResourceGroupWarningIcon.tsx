import type { ProjectResourceGroupWarningIconFragment$key } from '../../__generated__/ProjectResourceGroupWarningIconFragment.graphql';
import type { ProjectResourceGroupWarningIconQuery } from '../../__generated__/ProjectResourceGroupWarningIconQuery.graphql';
import { useTheme } from '@astryxdesign/core/theme';
import { BAIIconWithTooltip } from 'backend.ai-ui';
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

  const { projectV2, domainV2 } =
    useLazyLoadQuery<ProjectResourceGroupWarningIconQuery>(
      graphql`
        query ProjectResourceGroupWarningIconQuery(
          $projectId: UUID!
          $domainName: String!
          $resourceGroupName: String!
        ) {
          projectV2(projectId: $projectId) {
            resourceGroups(filter: { name: { equals: $resourceGroupName } })
              @since(version: "26.9.0a1") {
              count
            }
          }
          domainV2(domainName: $domainName) {
            resourceGroups(filter: { name: { equals: $resourceGroupName } })
              @since(version: "26.9.0a1") {
              count
            }
          }
        }
      `,
      { projectId, domainName, resourceGroupName },
    );

  // `resourceGroups` is stripped before 26.9.0a1; an unknown answer raises no warning.
  const isProjectAllowed = (projectV2?.resourceGroups?.count ?? 1) > 0;
  const isDomainAllowed = (domainV2?.resourceGroups?.count ?? 1) > 0;

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
