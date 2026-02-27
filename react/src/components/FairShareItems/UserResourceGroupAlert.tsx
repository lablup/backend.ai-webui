import { Alert, AlertProps } from 'antd';
import _ from 'lodash';
import { parseAsString, useQueryStates } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import type { UserResourceGroupAlertQuery } from 'src/__generated__/UserResourceGroupAlertQuery.graphql';

interface UserResourceGroupAlertProps extends AlertProps {
  isModalOpen?: boolean;
}

const UserResourceGroupAlert: React.FC<UserResourceGroupAlertProps> = ({
  isModalOpen,
  ...alertProps
}) => {
  'use memo';

  const { t } = useTranslation();

  const [stepQueryParams] = useQueryStates({
    resourceGroup: parseAsString.withDefault(''),
    domain: parseAsString.withDefault(''),
    project: parseAsString.withDefault(''),
  });

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
    { projectId: stepQueryParams.project, domainName: stepQueryParams.domain },
    {
      fetchPolicy: _.isUndefined(isModalOpen)
        ? 'network-only'
        : isModalOpen
          ? 'network-only'
          : 'store-only',
    },
  );

  const resourceGroupName = stepQueryParams.resourceGroup;
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
