/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { FairSharePanelQuery } from '../../../__generated__/FairSharePanelQuery.graphql';
import ResourceGroupFairShareTableFragment, {
  type ResourceGroupFairShareTableFragment$key,
} from '../../../__generated__/ResourceGroupFairShareTableFragment.graphql';
import ScopedCard from '../cards/ScopedCard';
import { readPrimary } from '../panelPermission';
import type { PanelComponentProps } from '../types';
import { MetadataList, MetadataListItem } from '@lablup/ui-common/MetadataList';
import { Text } from '@lablup/ui-common/Text';
import { BAIBadge, BAIFlex, ResourceTypeIcon } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

/** The Fair Share page's resource-group row, read through that page's own fragment. */
const ResourceGroupFairShareSpec: React.FC<{
  resourceGroupFrgmt: ResourceGroupFairShareTableFragment$key;
}> = ({ resourceGroupFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  const [resourceGroup] = useFragment(
    ResourceGroupFairShareTableFragment,
    resourceGroupFrgmt,
  );
  const spec = resourceGroup?.fairShareSpec;
  const days = (value: number | null | undefined) =>
    _.isNil(value) ? '-' : t('general.Days', { num: value });
  return (
    <MetadataList>
      <MetadataListItem label={t('fairShare.ResourceWeights')}>
        {_.isEmpty(spec?.resourceWeights) ? (
          '-'
        ) : (
          <BAIFlex gap="sm" wrap="wrap">
            {_.map(spec?.resourceWeights, (weight) => (
              <BAIFlex key={weight.resourceType} gap="xxs">
                <ResourceTypeIcon type={weight.resourceType} />
                <Text>{weight.weight}</Text>
                {weight.usesDefault ? (
                  <Text type="supporting" size="sm">
                    ({t('fairShare.UsingDefault')})
                  </Text>
                ) : null}
              </BAIFlex>
            ))}
          </BAIFlex>
        )}
      </MetadataListItem>
      <MetadataListItem label={t('fairShare.DefaultWeight')}>
        {spec?.defaultWeight ?? '-'}
      </MetadataListItem>
      <MetadataListItem label={t('fairShare.DecayUnitDays')}>
        {days(spec?.decayUnitDays)}
      </MetadataListItem>
      <MetadataListItem label={t('fairShare.HalfLifeDays')}>
        {days(spec?.halfLifeDays)}
      </MetadataListItem>
      <MetadataListItem label={t('fairShare.LookbackDays')}>
        {days(spec?.lookbackDays)}
      </MetadataListItem>
      <MetadataListItem label={t('general.Status')}>
        <BAIBadge
          color={resourceGroup?.status?.isActive ? 'success' : 'default'}
          text={
            resourceGroup?.status?.isActive
              ? t('general.Active')
              : t('general.Inactive')
          }
        />
      </MetadataListItem>
    </MetadataList>
  );
};

const ResourceGroupFairShare: React.FC<{
  resourceGroupName: string;
  fetchKey: string;
}> = ({ resourceGroupName, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const data = useLazyLoadQuery<FairSharePanelQuery>(
    graphql`
      query FairSharePanelQuery($filter: ResourceGroupFilter!) {
        resourceGroups: adminResourceGroups(filter: $filter, limit: 1)
          @catch(to: RESULT) {
          edges {
            node {
              ...ResourceGroupFairShareTableFragment
            }
          }
        }
      }
    `,
    { filter: { name: { equals: resourceGroupName } } },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const node = readPrimary(data.resourceGroups)?.edges[0]?.node;
  return node ? (
    <ResourceGroupFairShareSpec resourceGroupFrgmt={[node]} />
  ) : (
    <Text type="supporting">{t('dashboard.card.NoResourceGroup')}</Text>
  );
};

/** The card's resource group's fair-share configuration, as the Fair Share page's resource-group step shows it. */
const FairSharePanel: React.FC<PanelComponentProps> = ({
  scope,
  vars,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const heading = {
    title: t('webui.menu.FairShare'),
    tooltip: t('dashboard.card.FairShareTooltip'),
  };
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{ project: heading, domain: heading }}
    >
      {(cardScope, key) =>
        cardScope.kind !== 'domain' ? null : !vars.resourceGroup ? (
          <Text type="supporting">{t('dashboard.card.NoResourceGroup')}</Text>
        ) : (
          <ResourceGroupFairShare
            resourceGroupName={vars.resourceGroup}
            fetchKey={key}
          />
        )
      }
    </ScopedCard>
  );
};

export default FairSharePanel;
