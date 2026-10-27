/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  FairSharePanelQuery,
  FairSharePanelQuery$data,
} from '../../../__generated__/FairSharePanelQuery.graphql';
import ScopedCard from '../cards/ScopedCard';
import type { PanelComponentProps } from '../types';
import { Divider } from '@lablup/ui-common/Divider';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAITable,
  filterOutNullAndUndefined,
  toFixedFloorWithoutTrailingZeros,
} from 'backend.ai-ui';
import React, { Fragment, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type FairShareRow = NonNullable<
  NonNullable<
    NonNullable<FairSharePanelQuery$data['projects']>['edges'][number]
  >['node']
>;

const PAGE_SIZE = 5;

// The Fair Share page's number format.
const fixed = (value: unknown, digits: number) =>
  value === null || value === undefined
    ? '-'
    : toFixedFloorWithoutTrailingZeros(Number(value), digits);

const ResourceGroupFairShares: React.FC<{
  resourceGroupName: string;
  domainName: string;
  fetchKey: string;
}> = ({ resourceGroupName, domainName, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const variables = useDeferredValue({ resourceGroupName, domainName });
  const data = useLazyLoadQuery<FairSharePanelQuery>(
    graphql`
      query FairSharePanelQuery(
        $resourceGroupName: String!
        $domainName: String!
      ) {
        projects: rgProjectFairShares(
          scope: {
            resourceGroupName: $resourceGroupName
            domainName: $domainName
          }
          orderBy: [{ field: FAIR_SHARE_FACTOR, direction: ASC }]
          limit: 50
        ) {
          count
          edges {
            node {
              id
              spec {
                weight
                usesDefault
              }
              calculationSnapshot {
                fairShareFactor
                normalizedUsage
              }
              project {
                basicInfo {
                  name
                }
              }
            }
          }
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return (
    <BAITable<FairShareRow>
      size="small"
      rowKey="id"
      dataSource={filterOutNullAndUndefined(
        data.projects?.edges.map((edge) => edge?.node),
      )}
      scroll={{ x: 'max-content' }}
      columns={[
        {
          key: 'project',
          title: t('general.Project'),
          render: (_value, row) => row.project?.basicInfo.name ?? '-',
        },
        {
          key: 'factor',
          title: t('fairShare.FairShareFactor'),
          render: (_value, row) =>
            fixed(row.calculationSnapshot.fairShareFactor, 2),
        },
        {
          key: 'usage',
          title: t('dashboard.card.NormalizedUsage'),
          render: (_value, row) =>
            fixed(row.calculationSnapshot.normalizedUsage, 2),
        },
        {
          key: 'weight',
          title: t('fairShare.Weight'),
          render: (_value, row) => (
            <BAIFlex gap="xxs">
              <Text>{fixed(row.spec.weight, 1)}</Text>
              {row.spec.usesDefault ? (
                <Text type="supporting" size="sm">
                  ({t('fairShare.UsingDefault')})
                </Text>
              ) : null}
            </BAIFlex>
          ),
        },
      ]}
      pagination={{ pageSize: PAGE_SIZE, showSizeChanger: false }}
    />
  );
};

/** Each project's fair share in the card's resource groups, the lowest factor (heaviest use) first. */
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
        cardScope.kind !== 'domain' ? null : vars.resourceGroups.length ===
          0 ? (
          <Text type="supporting">{t('dashboard.card.NoResourceGroup')}</Text>
        ) : (
          <BAIFlex direction="column" align="stretch" gap="sm">
            {vars.resourceGroups.map((resourceGroupName, index) => (
              <Fragment key={resourceGroupName}>
                {index > 0 ? <Divider /> : null}
                <BAIFlex direction="row" align="baseline" gap="xs">
                  <Text type="supporting">{`${t('general.ResourceGroup')}:`}</Text>
                  <Text weight="semibold">{resourceGroupName}</Text>
                </BAIFlex>
                <ResourceGroupFairShares
                  resourceGroupName={resourceGroupName}
                  domainName={cardScope.domainName}
                  fetchKey={key}
                />
              </Fragment>
            ))}
          </BAIFlex>
        )
      }
    </ScopedCard>
  );
};

export default FairSharePanel;
