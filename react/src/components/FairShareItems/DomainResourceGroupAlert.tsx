import { Alert, AlertProps } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import type { DomainResourceGroupAlertFragment$key } from 'src/__generated__/DomainResourceGroupAlertFragment.graphql';
import type { DomainResourceGroupAlertQuery } from 'src/__generated__/DomainResourceGroupAlertQuery.graphql';

interface DomainResourceGroupAlertProps extends AlertProps {
  domainFairShareFrgmt: DomainResourceGroupAlertFragment$key;
  isModalOpen: boolean;
}

const DomainResourceGroupAlert: React.FC<DomainResourceGroupAlertProps> = ({
  domainFairShareFrgmt,
  isModalOpen,
  ...alertProps
}) => {
  'use memo';

  const { t } = useTranslation();

  const { domainName, resourceGroupName } = useFragment(
    graphql`
      fragment DomainResourceGroupAlertFragment on DomainFairShare {
        domainName
        resourceGroupName
      }
    `,
    domainFairShareFrgmt,
  );

  const { domain } = useLazyLoadQuery<DomainResourceGroupAlertQuery>(
    graphql`
      query DomainResourceGroupAlertQuery($domainName: String) {
        domain(name: $domainName) {
          scaling_groups
        }
      }
    `,
    { domainName },
    {
      fetchPolicy: isModalOpen ? 'network-only' : 'store-only',
    },
  );

  if (
    !resourceGroupName ||
    _.includes(domain?.scaling_groups ?? [], resourceGroupName)
  ) {
    return null;
  }

  return (
    <Alert
      type="warning"
      title={t('fairShare.DomainNotAllowedInResourceGroup', {
        resourceGroup: resourceGroupName,
      })}
      showIcon
      {...alertProps}
    />
  );
};

export default DomainResourceGroupAlert;
