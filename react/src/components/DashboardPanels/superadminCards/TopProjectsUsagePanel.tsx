/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { TopProjectsUsagePanelLatestDayQuery } from '../../../__generated__/TopProjectsUsagePanelLatestDayQuery.graphql';
import type {
  TopProjectsUsagePanelQuery,
  TopProjectsUsagePanelQuery$data,
} from '../../../__generated__/TopProjectsUsagePanelQuery.graphql';
import ScopedCard from '../cards/ScopedCard';
import type { PanelComponentProps } from '../types';
import {
  byCpuUsage,
  coreHours,
  formatAmount,
  gibHours,
  slotQuantity,
} from './superadminCardData';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex, BAITable, filterOutNullAndUndefined } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type BucketRow = NonNullable<
  NonNullable<
    NonNullable<TopProjectsUsagePanelQuery$data['buckets']>['edges'][number]
  >['node']
>;

// Projects × resource groups of one day stay well under this on 26.10.
const ROW_LIMIT = 200;

type UsageFilter = TopProjectsUsagePanelQuery['variables']['filter'];

const scopeFilter = (
  domainName: string,
  resourceGroups: ReadonlyArray<string> | undefined,
): UsageFilter => ({
  domainName: { equals: domainName },
  ...(resourceGroups?.length
    ? { resourceGroup: { in: [...resourceGroups] } }
    : {}),
});

/**
 * The manager keeps one bucket per project, resource group and day and sums
 * none of them, so the card shows the latest recorded day: one row per project
 * and resource group.
 */
const LatestUsageDay: React.FC<{
  domainName: string;
  resourceGroups: ReadonlyArray<string> | undefined;
  fetchKey: string;
}> = ({ domainName, resourceGroups, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const filter = scopeFilter(domainName, resourceGroups);
  const data = useLazyLoadQuery<TopProjectsUsagePanelLatestDayQuery>(
    graphql`
      query TopProjectsUsagePanelLatestDayQuery(
        $filter: ProjectUsageBucketFilter!
      ) {
        latest: adminProjectUsageBuckets(
          filter: $filter
          orderBy: [{ field: PERIOD_START, direction: DESC }]
          limit: 1
        ) {
          edges {
            node {
              metadata {
                periodStart
              }
            }
          }
        }
      }
    `,
    useDeferredValue({ filter }),
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const day = data.latest?.edges[0]?.node.metadata.periodStart;
  if (!day) {
    return <Text type="supporting">{t('dashboard.card.NoUsageRecorded')}</Text>;
  }
  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <Text type="supporting">{t('dashboard.card.UsageOnDay', { day })}</Text>
      <ProjectUsageTable
        filter={{ ...filter, periodStart: { equals: day } }}
        fetchKey={fetchKey}
      />
    </BAIFlex>
  );
};

const ProjectUsageTable: React.FC<{
  filter: UsageFilter;
  fetchKey: string;
}> = ({ filter, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const variables = useDeferredValue<TopProjectsUsagePanelQuery['variables']>({
    filter,
    limit: ROW_LIMIT,
  });
  const data = useLazyLoadQuery<TopProjectsUsagePanelQuery>(
    graphql`
      query TopProjectsUsagePanelQuery(
        $filter: ProjectUsageBucketFilter!
        $limit: Int!
      ) {
        buckets: adminProjectUsageBuckets(
          filter: $filter
          orderBy: [{ field: PERIOD_START, direction: DESC }]
          limit: $limit
        ) {
          count
          edges {
            node {
              id
              resourceGroupName
              resourceUsage {
                entries {
                  resourceType
                  quantity
                }
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
  const rows = byCpuUsage(
    filterOutNullAndUndefined(data.buckets?.edges.map((edge) => edge?.node)),
  );
  const total = data.buckets?.count ?? 0;

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <BAITable<BucketRow>
        size="small"
        rowKey="id"
        dataSource={rows}
        scroll={{ x: 'max-content' }}
        columns={[
          {
            key: 'project',
            title: t('general.Project'),
            render: (_value, row) => row.project?.basicInfo.name ?? '-',
          },
          {
            key: 'resourceGroup',
            title: t('general.ResourceGroup'),
            render: (_value, row) => row.resourceGroupName,
          },
          {
            key: 'cpu',
            title: t('dashboard.card.CpuCoreHours'),
            align: 'right',
            render: (_value, row) =>
              formatAmount(
                coreHours(slotQuantity(row.resourceUsage.entries, 'cpu')),
              ),
          },
          {
            key: 'mem',
            title: t('dashboard.card.MemoryGiBHours'),
            align: 'right',
            render: (_value, row) =>
              formatAmount(
                gibHours(slotQuantity(row.resourceUsage.entries, 'mem')),
              ),
          },
        ]}
        pagination={{ pageSize: 5, showSizeChanger: false }}
      />
      {total > rows.length ? (
        <Text type="supporting">
          {t('dashboard.card.UsageRowsCapped', { shown: rows.length, total })}
        </Text>
      ) : null}
    </BAIFlex>
  );
};

/** The domain's projects by their usage on the latest recorded day, the heaviest first. */
const TopProjectsUsagePanel: React.FC<PanelComponentProps> = ({
  panel,
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const heading = {
    title: t('dashboard.card.TopProjectsByUsage'),
    tooltip: t('dashboard.card.TopProjectsByUsageTooltip'),
  };
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{ project: heading, domain: heading }}
    >
      {(cardScope, key) =>
        cardScope.kind === 'domain' ? (
          <LatestUsageDay
            domainName={cardScope.domainName}
            resourceGroups={panel.settings?.resourceGroups}
            fetchKey={key}
          />
        ) : null
      }
    </ScopedCard>
  );
};

export default TopProjectsUsagePanel;
