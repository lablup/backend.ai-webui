import { Alert, AlertProps } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import type { ProjectResourceGroupAlertFragment$key } from 'src/__generated__/ProjectResourceGroupAlertFragment.graphql';
import type { ProjectResourceGroupAlertQuery } from 'src/__generated__/ProjectResourceGroupAlertQuery.graphql';

interface ProjectResourceGroupAlertProps extends AlertProps {
  projectFairShareFrgmt: ProjectResourceGroupAlertFragment$key;
  isModalOpen: boolean;
}

const ProjectResourceGroupAlert: React.FC<ProjectResourceGroupAlertProps> = ({
  projectFairShareFrgmt,
  isModalOpen,
  ...alertProps
}) => {
  'use memo';

  const { t } = useTranslation();

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

  const { group } = useLazyLoadQuery<ProjectResourceGroupAlertQuery>(
    graphql`
      query ProjectResourceGroupAlertQuery(
        $projectId: UUID!
        $domainName: String
      ) {
        group(id: $projectId, domain_name: $domainName) {
          scaling_groups
        }
      }
    `,
    { projectId, domainName },
    {
      fetchPolicy: isModalOpen ? 'network-only' : 'store-only',
    },
  );

  const scalingGroups = group?.scaling_groups ?? [];

  if (!resourceGroupName || _.includes(scalingGroups, resourceGroupName)) {
    return null;
  }

  return (
    <Alert
      type="warning"
      title={t('fairShare.ProjectNotAllowedInResourceGroup', {
        resourceGroup: resourceGroupName,
      })}
      showIcon
      {...alertProps}
    />
  );
};

export default ProjectResourceGroupAlert;
