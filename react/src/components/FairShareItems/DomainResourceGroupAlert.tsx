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
  // `adminAllowedResourceGroups*V2` is superadmin-only; a domain admin reads
  // the legacy field (FR-4117 role probe).
  const isSuperAdmin = !!baiClient.is_superadmin;

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
          $isSuperAdmin: Boolean!
        ) {
          adminAllowedResourceGroupsForDomainV2(domainName: $domainName)
            @include(if: $isSuperAdmin) {
            items
          }
          domain(name: $domainName) @skip(if: $isSuperAdmin) {
            scaling_groups
          }
        }
      `,
      { domainName, isSuperAdmin },
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
