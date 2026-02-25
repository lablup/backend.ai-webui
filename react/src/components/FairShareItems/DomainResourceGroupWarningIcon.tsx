import { Tooltip, theme } from 'antd';
import _ from 'lodash';
import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import type { DomainResourceGroupWarningIconFragment$key } from 'src/__generated__/DomainResourceGroupWarningIconFragment.graphql';
import type { DomainResourceGroupWarningIconQuery } from 'src/__generated__/DomainResourceGroupWarningIconQuery.graphql';

interface DomainResourceGroupWarningIconProps {
  domainFairShareFrgmt: DomainResourceGroupWarningIconFragment$key;
}

const DomainResourceGroupWarningIcon: React.FC<
  DomainResourceGroupWarningIconProps
> = ({ domainFairShareFrgmt }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const { domainName, resourceGroupName } = useFragment(
    graphql`
      fragment DomainResourceGroupWarningIconFragment on DomainFairShare {
        domainName
        resourceGroupName
      }
    `,
    domainFairShareFrgmt,
  );

  const { domain } = useLazyLoadQuery<DomainResourceGroupWarningIconQuery>(
    graphql`
      query DomainResourceGroupWarningIconQuery($domainName: String) {
        domain(name: $domainName) {
          scaling_groups
        }
      }
    `,
    { domainName },
    {
      fetchPolicy: 'store-and-network',
    },
  );

  const scalingGroups = domain?.scaling_groups ?? [];

  if (!resourceGroupName || _.includes(scalingGroups, resourceGroupName)) {
    return null;
  }

  return (
    <Tooltip
      title={t('fairShare.DomainNotAllowedInResourceGroup', {
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

export default DomainResourceGroupWarningIcon;
