import type { DomainResourceGroupWarningIconFragment$key } from '../../__generated__/DomainResourceGroupWarningIconFragment.graphql';
import type { DomainResourceGroupWarningIconQuery } from '../../__generated__/DomainResourceGroupWarningIconQuery.graphql';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIIconWithTooltip } from 'backend.ai-ui';
import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface DomainResourceGroupWarningIconProps {
  domainFairShareFrgmt: DomainResourceGroupWarningIconFragment$key;
}

const DomainResourceGroupWarningIcon: React.FC<
  DomainResourceGroupWarningIconProps
> = ({ domainFairShareFrgmt }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = useTheme();

  const { domainName, resourceGroupName } = useFragment(
    graphql`
      fragment DomainResourceGroupWarningIconFragment on DomainFairShare {
        domainName
        resourceGroupName
      }
    `,
    domainFairShareFrgmt,
  );

  const { domainV2 } = useLazyLoadQuery<DomainResourceGroupWarningIconQuery>(
    graphql`
      query DomainResourceGroupWarningIconQuery(
        $domainName: String!
        $resourceGroupName: String!
      ) {
        domainV2(domainName: $domainName) {
          resourceGroups(filter: { name: { equals: $resourceGroupName } })
            @since(version: "26.9.0a1") {
            count
          }
        }
      }
    `,
    { domainName, resourceGroupName },
    {
      fetchPolicy: 'store-and-network',
    },
  );

  // `resourceGroups` is stripped before 26.9.0a1; an unknown answer raises no warning.
  if (!resourceGroupName || (domainV2?.resourceGroups?.count ?? 1) > 0) {
    return null;
  }

  return (
    <BAIIconWithTooltip
      content={t('fairShare.DomainNotAllowedInResourceGroup', {
        resourceGroup: resourceGroupName,
      })}
      icon={<TriangleAlert style={{ color: token('--color-warning') }} />}
    />
  );
};

export default DomainResourceGroupWarningIcon;
