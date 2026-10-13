import type { ProjectResourceGroupAlertFragment$key } from '../../__generated__/ProjectResourceGroupAlertFragment.graphql';
import type { ProjectResourceGroupAlertQuery } from '../../__generated__/ProjectResourceGroupAlertQuery.graphql';
import { Banner } from '@lablup/ui-common/Banner';
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
  const { projectId, resourceGroupName } = useFragment(
    graphql`
      fragment ProjectResourceGroupAlertFragment on ProjectFairShare {
        projectId
        resourceGroupName
      }
    `,
    projectFairShareFrgmt,
  );

  const { projectV2 } = useLazyLoadQuery<ProjectResourceGroupAlertQuery>(
    graphql`
      query ProjectResourceGroupAlertQuery(
        $projectId: UUID!
        $resourceGroupName: String!
      ) {
        projectV2(projectId: $projectId) {
          resourceGroups(filter: { name: { equals: $resourceGroupName } })
            @since(version: "26.9.0a1") {
            count
          }
        }
      }
    `,
    { projectId, resourceGroupName },
    {
      fetchPolicy: isModalOpen ? 'network-only' : 'store-only',
    },
  );

  // `resourceGroups` is stripped before 26.9.0a1; an unknown answer raises no warning.
  const isAllowed = (projectV2?.resourceGroups?.count ?? 1) > 0;

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
