import type { ProjectResourceGroupAlertFragment$key } from '../../__generated__/ProjectResourceGroupAlertFragment.graphql';
import type { ProjectResourceGroupAlertQuery } from '../../__generated__/ProjectResourceGroupAlertQuery.graphql';
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
