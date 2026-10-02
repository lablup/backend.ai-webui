import type { UserResourceGroupAlertQuery } from '../../__generated__/UserResourceGroupAlertQuery.graphql';
import { Banner } from '@astryxdesign/core/Banner';
import * as _ from 'lodash-es';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// `style` is the only key any call site passes (`FairShareWeightSettingModal`;
// `FairShareList` passes none) — see the note in DomainResourceGroupAlert.tsx.
interface UserResourceGroupAlertProps {
  isModalOpen?: boolean;
  resourceGroupName: string;
  domainName: string;
  projectId: string;
  style?: CSSProperties;
}

const UserResourceGroupAlert: React.FC<UserResourceGroupAlertProps> = ({
  isModalOpen,
  resourceGroupName,
  domainName,
  projectId,
  ...bannerProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { domainV2, projectV2 } = useLazyLoadQuery<UserResourceGroupAlertQuery>(
    graphql`
      query UserResourceGroupAlertQuery(
        $projectId: UUID!
        $domainName: String!
        $resourceGroupName: String!
      ) {
        domainV2(domainName: $domainName) {
          resourceGroups(filter: { name: { equals: $resourceGroupName } })
            @since(version: "26.9.0a1") {
            count
          }
        }
        projectV2(projectId: $projectId) {
          basicInfo {
            name
          }
          resourceGroups(filter: { name: { equals: $resourceGroupName } })
            @since(version: "26.9.0a1") {
            count
          }
        }
      }
    `,
    { projectId, domainName, resourceGroupName },
    {
      fetchPolicy: _.isUndefined(isModalOpen)
        ? 'network-only'
        : isModalOpen
          ? 'network-only'
          : 'store-only',
    },
  );

  // `resourceGroups` is stripped before 26.9.0a1; an unknown answer raises no warning.
  const isDomainAllowed = (domainV2?.resourceGroups?.count ?? 1) > 0;
  const isProjectAllowed = (projectV2?.resourceGroups?.count ?? 1) > 0;

  if (!resourceGroupName || isDomainAllowed || isProjectAllowed) {
    return null;
  }

  return (
    <Banner
      status="warning"
      title={t('fairShare.UserNotAllowedInResourceGroup', {
        project: projectV2?.basicInfo?.name,
        resourceGroup: resourceGroupName,
      })}
      {...bannerProps}
    />
  );
};

export default UserResourceGroupAlert;
