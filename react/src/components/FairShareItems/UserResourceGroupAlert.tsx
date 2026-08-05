import type { UserResourceGroupAlertQuery } from '../../__generated__/UserResourceGroupAlertQuery.graphql';
import { Alert, AlertProps } from 'antd';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface UserResourceGroupAlertProps extends AlertProps {
  isModalOpen?: boolean;
  resourceGroupName: string;
  domainName: string;
  projectId: string;
}

const UserResourceGroupAlert: React.FC<UserResourceGroupAlertProps> = ({
  isModalOpen,
  resourceGroupName,
  domainName,
  projectId,
  ...alertProps
}) => {
  'use memo';

  const { t } = useTranslation();

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
          name
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
        project: group?.name,
        resourceGroup: resourceGroupName,
      })}
      showIcon
      {...alertProps}
    />
  );
};

export default UserResourceGroupAlert;
