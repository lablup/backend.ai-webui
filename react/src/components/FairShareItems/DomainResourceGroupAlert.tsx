import type { DomainResourceGroupAlertFragment$key } from '../../__generated__/DomainResourceGroupAlertFragment.graphql';
import type { DomainResourceGroupAlertQuery } from '../../__generated__/DomainResourceGroupAlertQuery.graphql';
import { Banner } from '@astryxdesign/core/Banner';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

// The pass-through prop bag was `AlertProps` so the modal could space the
// banner with `style`. `style` is the only key any call site passes
// (`FairShareWeightSettingModal`, measured), so it is restated here instead of
// re-exporting a whole component's props — which is what kept this file in the
// antd import graph (P15).
interface DomainResourceGroupAlertProps {
  domainFairShareFrgmt: DomainResourceGroupAlertFragment$key;
  isModalOpen: boolean;
  style?: CSSProperties;
}

const DomainResourceGroupAlert: React.FC<DomainResourceGroupAlertProps> = ({
  domainFairShareFrgmt,
  isModalOpen,
  ...bannerProps
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

  const { domainV2 } = useLazyLoadQuery<DomainResourceGroupAlertQuery>(
    graphql`
      query DomainResourceGroupAlertQuery(
        $domainName: String!
        $resourceGroupName: String!
      ) {
        domainV2(domainName: $domainName) {
          resourceGroups(filter: { name: { equals: $resourceGroupName } }) {
            count
          }
        }
      }
    `,
    { domainName, resourceGroupName },
    {
      fetchPolicy: isModalOpen ? 'network-only' : 'store-only',
    },
  );

  if (!resourceGroupName || (domainV2?.resourceGroups?.count ?? 0) > 0) {
    return null;
  }

  return (
    <Banner
      status="warning"
      title={t('fairShare.DomainNotAllowedInResourceGroup', {
        resourceGroup: resourceGroupName,
      })}
      {...bannerProps}
    />
  );
};

export default DomainResourceGroupAlert;
