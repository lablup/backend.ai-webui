import { Tooltip, theme } from 'antd';
import _ from 'lodash';
import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import type { ProjectResourceGroupWarningIconFragment$key } from 'src/__generated__/ProjectResourceGroupWarningIconFragment.graphql';
import type { ProjectResourceGroupWarningIconQuery } from 'src/__generated__/ProjectResourceGroupWarningIconQuery.graphql';

interface ProjectResourceGroupWarningIconProps {
  projectFairShareFrgmt: ProjectResourceGroupWarningIconFragment$key;
}

const ProjectResourceGroupWarningIcon: React.FC<
  ProjectResourceGroupWarningIconProps
> = ({ projectFairShareFrgmt }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

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

  const { group, domain } =
    useLazyLoadQuery<ProjectResourceGroupWarningIconQuery>(
      graphql`
        query ProjectResourceGroupWarningIconQuery(
          $projectId: UUID!
          $domainName: String
        ) {
          group(id: $projectId, domain_name: $domainName) {
            scaling_groups
          }
          domain(name: $domainName) {
            scaling_groups
          }
        }
      `,
      { projectId, domainName },
    );

  const projectScalingGroups = group?.scaling_groups ?? [];
  const domainScalingGroups = domain?.scaling_groups ?? [];

  if (
    !resourceGroupName ||
    _.includes(projectScalingGroups, resourceGroupName) ||
    _.includes(domainScalingGroups, resourceGroupName)
  ) {
    return null;
  }

  return (
    <Tooltip
      title={t('fairShare.ProjectNotAllowedInResourceGroup', {
        resourceGroup: resourceGroupName,
      })}
    >
      <TriangleAlert
        style={{
          color: token.colorWarning,
        }}
      />
    </Tooltip>
  );
};

export default ProjectResourceGroupWarningIcon;
