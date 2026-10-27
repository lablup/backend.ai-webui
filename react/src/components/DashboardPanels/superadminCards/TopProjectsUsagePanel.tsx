/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  TopProjectsUsagePanelQuery,
  TopProjectsUsagePanelQuery$data,
} from '../../../__generated__/TopProjectsUsagePanelQuery.graphql';
import ScopedCard from '../cards/ScopedCard';
import type { DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import {
  bucketDayAfter,
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

// Days × projects × resource groups in a 7-day range stay well under this on 26.10.
const ROW_LIMIT = 200;

const ProjectUsageTable: React.FC<{
  domainName: string;
  timeRange: DateTimeWindow;
  resourceGroups: ReadonlyArray<string> | undefined;
  fetchKey: string;
}> = ({ domainName, timeRange, resourceGroups, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const variables = useDeferredValue<TopProjectsUsagePanelQuery['variables']>({
    filter: {
      domainName: { equals: domainName },
      periodStart: { after: bucketDayAfter(timeRange) },
      ...(resourceGroups?.length
        ? { resourceGroup: { in: [...resourceGroups] } }
        : {}),
    },
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
              metadata {
                periodStart
              }
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
            key: 'day',
            title: t('dashboard.card.Day'),
            render: (_value, row) => row.metadata.periodStart,
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

/** The domain's daily project usage buckets in the card's range, the heaviest first. */
const TopProjectsUsagePanel: React.FC<PanelComponentProps> = ({
  panel,
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
          <ProjectUsageTable
            domainName={cardScope.domainName}
            timeRange={vars.timeRange}
            resourceGroups={panel.settings?.resourceGroups}
            fetchKey={key}
          />
        ) : null
      }
    </ScopedCard>
  );
};

export default TopProjectsUsagePanel;
