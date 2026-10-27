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
import { formatAmount } from './superadminCardData';
import { Divider } from '@lablup/ui-common/Divider';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex, BAITable, filterOutNullAndUndefined } from 'backend.ai-ui';
import React, { Fragment, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type FairShareRow = NonNullable<
  NonNullable<
    NonNullable<FairSharePanelQuery$data['projects']>['edges'][number]
  >['node']
>;

const PAGE_SIZE = 5;

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
          title: t('dashboard.card.FairShareFactor'),
          align: 'right',
          render: (_value, row) =>
            formatAmount(Number(row.calculationSnapshot.fairShareFactor), 3),
        },
        {
          key: 'usage',
          title: t('dashboard.card.NormalizedUsage'),
          align: 'right',
          render: (_value, row) =>
            formatAmount(Number(row.calculationSnapshot.normalizedUsage), 3),
        },
        {
          key: 'weight',
          title: t('dashboard.card.Weight'),
          align: 'right',
          render: (_value, row) => formatAmount(Number(row.spec.weight), 2),
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
    title: t('dashboard.card.FairShare'),
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
                <Text weight="semibold">{resourceGroupName}</Text>
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
