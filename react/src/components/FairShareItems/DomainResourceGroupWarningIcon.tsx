import type { DomainResourceGroupWarningIconFragment$key } from '../../__generated__/DomainResourceGroupWarningIconFragment.graphql';
import type { DomainResourceGroupWarningIconQuery } from '../../__generated__/DomainResourceGroupWarningIconQuery.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useTheme } from '@astryxdesign/core/theme';
import { BAIIconWithTooltip } from 'backend.ai-ui';
import * as _ from 'lodash-es';
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
  const baiClient = useSuspendedBackendaiClient();
  // `adminAllowedResourceGroups*V2` is superadmin-only; a domain admin reads
  // the legacy field (FR-4117 role probe).
  const isSuperAdmin = !!baiClient.is_superadmin;

  const { domainName, resourceGroupName } = useFragment(
    graphql`
      fragment DomainResourceGroupWarningIconFragment on DomainFairShare {
        domainName
        resourceGroupName
      }
    `,
    domainFairShareFrgmt,
  );

  const { adminAllowedResourceGroupsForDomainV2, domain } =
    useLazyLoadQuery<DomainResourceGroupWarningIconQuery>(
      graphql`
        query DomainResourceGroupWarningIconQuery(
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
        fetchPolicy: 'store-and-network',
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
    <BAIIconWithTooltip
      content={t('fairShare.DomainNotAllowedInResourceGroup', {
        resourceGroup: resourceGroupName,
      })}
      icon={<TriangleAlert style={{ color: token('--color-warning') }} />}
    />
  );
};

export default DomainResourceGroupWarningIcon;
