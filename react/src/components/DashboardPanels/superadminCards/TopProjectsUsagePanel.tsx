/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  TopProjectsUsagePanelQuery,
  TopProjectsUsagePanelQuery$data,
} from '../../../__generated__/TopProjectsUsagePanelQuery.graphql';
import ScopedCard from '../cards/ScopedCard';
import { readPrimary, type CaughtValue } from '../panelPermission';
import type { DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import {
  coreHours,
  formatAmount,
  gibHours,
  sumUsageByProject,
  usageDays,
  usageDaysFilter,
  type ProjectUsageTotal,
} from './superadminCardData';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex, BAITable, filterOutNullAndUndefined } from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type BucketRow = NonNullable<
  NonNullable<
    NonNullable<
      CaughtValue<TopProjectsUsagePanelQuery$data['buckets']>
    >['edges'][number]
  >['node']
>;

const PAGE_SIZE = 200;
// The most buckets read before ranking; past it the card says so.
const ROW_LIMIT = 5000;

type UsageFilter = TopProjectsUsagePanelQuery['variables']['filter'];

const usageFilter = (
  domainName: string,
  resourceGroups: ReadonlyArray<string> | undefined,
  days: { first: string; last: string },
): UsageFilter => ({
  domainName: { equals: domainName },
  ...(resourceGroups?.length
    ? { resourceGroup: { in: [...resourceGroups] } }
    : {}),
  ...usageDaysFilter(days),
});

const formatDays = ({ first, last }: { first: string; last: string }) =>
  first === last
    ? dayjs(first).format('ll')
    : `${dayjs(first).format('ll')} - ${dayjs(last).format('ll')}`;

/**
 * The manager keeps one bucket per project, resource group and day, so the
 * card reads every bucket of the days the range touches and adds them up per
 * project.
 */
const RangeUsage: React.FC<{
  domainName: string;
  resourceGroups: ReadonlyArray<string> | undefined;
  timeRange: DateTimeWindow;
  fetchKey: string;
}> = ({ domainName, resourceGroups, timeRange, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const days = usageDays(timeRange);
  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <Text type="supporting" size="sm" data-testid="panel-period">
        {t('dashboard.card.UsageOverDays', { days: formatDays(days) })}
      </Text>
      <ProjectUsagePage
        filter={usageFilter(domainName, resourceGroups, days)}
        fetchKey={fetchKey}
        offset={0}
        collected={[]}
      />
    </BAIFlex>
  );
};

/**
 * One page of the range's buckets. The manager orders them by period start
 * only, so every bucket is read, page by page, before ranking.
 */
const ProjectUsagePage: React.FC<{
  filter: UsageFilter;
  fetchKey: string;
  offset: number;
  collected: ReadonlyArray<BucketRow>;
}> = ({ filter, fetchKey, offset, collected }) => {
  'use memo';
  const { t } = useTranslation();
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
        ) @catch(to: RESULT) {
          count
          edges {
            node {
              id
              projectId
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
  const buckets = readPrimary(data.buckets);
  const page = filterOutNullAndUndefined(
    buckets?.edges.map((edge) => edge?.node),
  );
  // Rows tied on period start can repeat across offset pages.
  const rows = _.uniqBy([...collected, ...page], 'id');
  const total = buckets?.count ?? 0;
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
  if (rows.length === 0) {
    return <Text type="supporting">{t('dashboard.card.NoUsageRecorded')}</Text>;
  }
  return (
    <ProjectUsageTable
      totals={sumUsageByProject(rows)}
      read={rows.length}
      total={total}
    />
  );
};

const ProjectUsageTable: React.FC<{
  totals: ReadonlyArray<ProjectUsageTotal>;
  /** Buckets added up, and how many the range holds. */
  read: number;
  total: number;
}> = ({ totals, read, total }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <BAITable<ProjectUsageTotal>
        size="small"
        rowKey="projectId"
        dataSource={[...totals]}
        scroll={{ x: 'max-content' }}
        columns={[
          {
            key: 'project',
            title: t('general.Project'),
            render: (_value, row) => row.projectName ?? '-',
          },
          {
            key: 'resourceGroup',
            title: t('general.ResourceGroup'),
            render: (_value, row) => row.resourceGroups.join(', '),
          },
          {
            key: 'cpu',
            title: t('dashboard.card.CpuCoreHours'),
            align: 'right',
            render: (_value, row) => formatAmount(coreHours(row.cpu)),
          },
          {
            key: 'mem',
            title: t('dashboard.card.MemoryGiBHours'),
            align: 'right',
            render: (_value, row) => formatAmount(gibHours(row.mem)),
          },
        ]}
        pagination={{ pageSize: 5, showSizeChanger: false }}
      />
      {total > read ? (
        <Text type="supporting">
          {t('dashboard.card.UsageRowsCapped', { shown: read, total })}
        </Text>
      ) : null}
    </BAIFlex>
  );
};

/** The domain's projects by their usage summed over the card's range, the heaviest first. */
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
          <RangeUsage
            domainName={cardScope.domainName}
            resourceGroups={
              vars.resourceGroup ? [vars.resourceGroup] : undefined
            }
            timeRange={vars.timeRange}
            fetchKey={key}
          />
        ) : null
      }
    </ScopedCard>
  );
};

export default TopProjectsUsagePanel;
