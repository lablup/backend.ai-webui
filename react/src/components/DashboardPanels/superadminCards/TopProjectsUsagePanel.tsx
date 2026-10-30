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
import _ from 'lodash';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type BucketRow = NonNullable<
  NonNullable<
    NonNullable<TopProjectsUsagePanelQuery$data['buckets']>['edges'][number]
  >['node']
>;

const PAGE_SIZE = 200;
// The most buckets of one day read before ranking; past it the card says so.
const ROW_LIMIT = 5000;

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
      <ProjectUsagePage
        filter={{ ...filter, periodStart: { equals: day } }}
        fetchKey={fetchKey}
        offset={0}
        collected={[]}
      />
    </BAIFlex>
  );
};

/**
 * One page of the day's buckets. The manager orders them by period start
 * only, so every bucket of the day is read, page by page, before ranking.
 */
const ProjectUsagePage: React.FC<{
  filter: UsageFilter;
  fetchKey: string;
  offset: number;
  collected: ReadonlyArray<BucketRow>;
}> = ({ filter, fetchKey, offset, collected }) => {
  'use memo';
  const variables = useDeferredValue<TopProjectsUsagePanelQuery['variables']>({
    filter,
    limit: PAGE_SIZE,
    offset,
  });
  const data = useLazyLoadQuery<TopProjectsUsagePanelQuery>(
    graphql`
      query TopProjectsUsagePanelQuery(
        $filter: ProjectUsageBucketFilter!
        $limit: Int!
        $offset: Int!
      ) {
        buckets: adminProjectUsageBuckets(
          filter: $filter
          orderBy: [{ field: PERIOD_START, direction: DESC }]
          limit: $limit
          offset: $offset
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
  const page = filterOutNullAndUndefined(
    data.buckets?.edges.map((edge) => edge?.node),
  );
  // Rows tied on period start can repeat across offset pages.
  const rows = _.uniqBy([...collected, ...page], 'id');
  const total = data.buckets?.count ?? 0;
  const nextOffset = offset + PAGE_SIZE;
  if (page.length === PAGE_SIZE && nextOffset < Math.min(total, ROW_LIMIT)) {
    return (
      <ProjectUsagePage
        filter={filter}
        fetchKey={fetchKey}
        offset={nextOffset}
        collected={rows}
      />
    );
  }
  return <ProjectUsageTable rows={byCpuUsage(rows)} total={total} />;
};

const ProjectUsageTable: React.FC<{
  rows: ReadonlyArray<BucketRow>;
  total: number;
}> = ({ rows, total }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <BAITable<BucketRow>
        size="small"
        rowKey="id"
        dataSource={[...rows]}
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
  scope,
  vars,
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
            resourceGroups={
              vars.resourceGroup ? [vars.resourceGroup] : undefined
            }
            fetchKey={key}
          />
        ) : null
      }
    </ScopedCard>
  );
};

export default TopProjectsUsagePanel;
