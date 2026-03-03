import { Alert, AlertProps } from 'antd';
import { toLocalId } from 'backend.ai-ui';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import type { UserResourceGroupAlertFragment$key } from 'src/__generated__/UserResourceGroupAlertFragment.graphql';
import type { UserResourceGroupAlertQuery } from 'src/__generated__/UserResourceGroupAlertQuery.graphql';

interface UserResourceGroupAlertProps extends AlertProps {
  userFairShareFrgmt: UserResourceGroupAlertFragment$key;
  isModalOpen?: boolean;
}

const UserResourceGroupAlert: React.FC<UserResourceGroupAlertProps> = ({
  userFairShareFrgmt,
  isModalOpen,
  ...alertProps
}) => {
  'use memo';

  const { t } = useTranslation();

  const { projectId, domainName, resourceGroupName, user } = useFragment(
    graphql`
      fragment UserResourceGroupAlertFragment on UserFairShare {
        projectId
        domainName
        resourceGroupName
        user {
          projects {
            edges {
              node {
                id
                basicInfo {
                  name
                }
              }
            }
          }
        }
      }
    `,
    userFairShareFrgmt,
  );

  const { domain, group } = useLazyLoadQuery<UserResourceGroupAlertQuery>(
    graphql`
      query UserResourceGroupAlertQuery(
        $projectId: UUID!
        $domainName: String
      ) {
        domain(name: $domainName) {
          scaling_groups
        }
        group(id: $projectId, domain_name: $domainName) {
          scaling_groups
        }
      }
    `,
    { projectId, domainName },
    {
      fetchPolicy: _.isUndefined(isModalOpen)
        ? 'network-only'
        : isModalOpen
          ? 'network-only'
          : 'store-only',
    },
  );

  const domainScalingGroups = domain?.scaling_groups ?? [];
  const projectScalingGroups = group?.scaling_groups ?? [];
  const selectedProjectNames = _.find(
    user?.projects?.edges,
    (edge) => toLocalId(edge?.node?.id) === projectId,
  )?.node?.basicInfo?.name;

  if (
    !resourceGroupName ||
    _.includes(domainScalingGroups, resourceGroupName) ||
    _.includes(projectScalingGroups, resourceGroupName)
  ) {
    return null;
  }

  return (
    <Alert
      type="warning"
      title={t('fairShare.UserNotAllowedInResourceGroup', {
        project: selectedProjectNames,
        resourceGroup: resourceGroupName,
      })}
      showIcon
      {...alertProps}
    />
  );
};

export default UserResourceGroupAlert;
