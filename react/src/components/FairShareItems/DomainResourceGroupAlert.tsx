import type { DomainResourceGroupAlertFragment$key } from '../../__generated__/DomainResourceGroupAlertFragment.graphql';
import type { DomainResourceGroupAlertQuery } from '../../__generated__/DomainResourceGroupAlertQuery.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { Banner } from '@astryxdesign/core/Banner';
import * as _ from 'lodash-es';
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
  const baiClient = useSuspendedBackendaiClient();
  const supportsAllowedResourceGroupsV2 = baiClient.supports(
    'allowed-resource-groups-v2',
  );

  const { domainName, resourceGroupName } = useFragment(
    graphql`
      fragment DomainResourceGroupAlertFragment on DomainFairShare {
        domainName
        resourceGroupName
      }
    `,
    domainFairShareFrgmt,
  );

  const { adminAllowedResourceGroupsForDomainV2, domain } =
    useLazyLoadQuery<DomainResourceGroupAlertQuery>(
      graphql`
        query DomainResourceGroupAlertQuery(
          $domainName: String!
          $supportsAllowedResourceGroupsV2: Boolean!
        ) {
          adminAllowedResourceGroupsForDomainV2(domainName: $domainName)
            @since(version: "26.4.2")
            @include(if: $supportsAllowedResourceGroupsV2) {
            items
          }
          domain(name: $domainName)
            @deprecatedSince(version: "26.4.2")
            @skip(if: $supportsAllowedResourceGroupsV2) {
            scaling_groups
          }
        }
      `,
      { domainName, supportsAllowedResourceGroupsV2 },
      {
        fetchPolicy: isModalOpen ? 'network-only' : 'store-only',
      },
    );

  const allowedResourceGroups =
    adminAllowedResourceGroupsForDomainV2?.items ??
    domain?.scaling_groups ??
    [];

  if (
    !resourceGroupName ||
    _.includes(allowedResourceGroups, resourceGroupName)
  ) {
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
