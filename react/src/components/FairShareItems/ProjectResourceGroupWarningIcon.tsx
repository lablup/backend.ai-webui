import type { ProjectResourceGroupWarningIconFragment$key } from '../../__generated__/ProjectResourceGroupWarningIconFragment.graphql';
import type { ProjectResourceGroupWarningIconQuery } from '../../__generated__/ProjectResourceGroupWarningIconQuery.graphql';
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
  } = useLazyLoadQuery<ProjectResourceGroupWarningIconQuery>(
    graphql`
      query ProjectResourceGroupWarningIconQuery(
        $projectId: UUID!
        $domainName: String!
      ) {
        adminAllowedResourceGroupsForProjectV2(projectId: $projectId) {
          items
        }
        adminAllowedResourceGroupsForDomainV2(domainName: $domainName) {
          items
        }
      }
    `,
    { projectId, domainName },
  );

  const projectResourceGroups =
    adminAllowedResourceGroupsForProjectV2?.items ?? [];
  const domainResourceGroups =
    adminAllowedResourceGroupsForDomainV2?.items ?? [];

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
