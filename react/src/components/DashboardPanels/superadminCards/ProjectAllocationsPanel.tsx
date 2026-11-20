/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ProjectAllocationsPanelAllocationQuery } from '../../../__generated__/ProjectAllocationsPanelAllocationQuery.graphql';
import type {
  ProjectAllocationsPanelQuery,
  ProjectAllocationsPanelQuery$data,
} from '../../../__generated__/ProjectAllocationsPanelQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import { useDashboardResourceGroups } from '../DashboardResourceGroups';
import ScopedCard from '../cards/ScopedCard';
import { toStatistic } from '../memberCards/ResourceUsageStatistics';
import { toLimitUsageRows } from '../memberCards/memberCardData';
import {
  readPrimary,
  readSecondary,
  type CaughtValue,
} from '../panelPermission';
import type { PanelComponentProps } from '../types';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAIProgressWithLabel,
  BAISkeleton,
  BAITable,
  filterOutNullAndUndefined,
  toFixedFloorWithoutTrailingZeros,
  useBAIResourceSlots,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type ProjectRow = NonNullable<
  NonNullable<
    NonNullable<
      CaughtValue<ProjectAllocationsPanelQuery$data['projects']>
    >['edges'][number]
  >['node']
>;

const SLOT_ORDER = ['cpu', 'mem'];

const formatAmount = (value: number) =>
  toFixedFloorWithoutTrailingZeros(value, 2);

/** One slot of one project: used against the limit, and what is left. */
const AllocationCell: React.FC<{
  projectId: string;
  resourceType: string;
  fetchKey: string;
}> = ({ projectId, resourceType, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const { mergedResourceSlots } = useBAIResourceSlots();
  // Every cell of a row shares this request: same query, variables and fetchKey.
  const data = useLazyLoadQuery<ProjectAllocationsPanelAllocationQuery>(
    graphql`
      query ProjectAllocationsPanelAllocationQuery($projectId: UUID!) {
        projectResourceAllocationV2(projectId: $projectId) @catch(to: RESULT) {
          project {
            limits {
              resourceType
              quantity
              unlimited
            }
            used {
              resourceType
              quantity
            }
          }
        }
      }
    `,
    { projectId },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const usage = readSecondary(data.projectResourceAllocationV2).value?.project;
  const row = toLimitUsageRows(usage).find(
    (entry) => entry.resourceType === resourceType,
  );
  if (!row) return <Text type="supporting">-</Text>;
  const { used, free, metadata } = toStatistic(
    row,
    mergedResourceSlots[resourceType],
  );
  const total = used.total ?? Number.POSITIVE_INFINITY;
  const unit = metadata.displayUnit ? ` ${metadata.displayUnit}` : '';
  const isUnlimited = !Number.isFinite(total);
  return (
    <BAIFlex direction="column" align="stretch" gap="xxs">
      <BAIProgressWithLabel
        width={140}
        percent={isUnlimited || total === 0 ? 0 : (used.current / total) * 100}
        valueLabel={`${formatAmount(used.current)} / ${
          isUnlimited ? '∞' : formatAmount(total)
        }${unit}`}
      />
      <Text type="supporting">
        {isUnlimited
          ? t('dashboard.card.Unlimited')
          : t('dashboard.card.RemainingAmount', {
              amount: `${formatAmount(free.current)}${unit}`,
            })}
      </Text>
    </BAIFlex>
  );
};

const ProjectList: React.FC<{ domainName: string; fetchKey: string }> = ({
  domainName,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { mergedResourceSlots } = useBAIResourceSlots();
  const offeredSlots = useDashboardResourceGroups()?.offeredSlots;
  const slots = _.sortBy(
    offeredSlots ? [...offeredSlots] : SLOT_ORDER,
    (slot) => {
      const index = SLOT_ORDER.indexOf(slot);
      return index === -1 ? SLOT_ORDER.length : index;
    },
    (slot) => slot,
  );
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });
  const variables = {
    domainName,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<ProjectAllocationsPanelQuery>(
    graphql`
      query ProjectAllocationsPanelQuery(
        $domainName: String!
        $limit: Int!
        $offset: Int!
      ) {
        projects: domainProjectsV2(
          scope: { domainName: $domainName }
          filter: { isActive: true }
          orderBy: [{ field: NAME, direction: ASC }]
          limit: $limit
          offset: $offset
        ) @catch(to: RESULT) {
          count
          edges {
            node {
              id
              entityId
              basicInfo {
                name
              }
            }
          }
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const projects = readPrimary(data.projects);
  return (
    <BAITable<ProjectRow>
      size="small"
      rowKey="id"
      dataSource={filterOutNullAndUndefined(
        projects?.edges.map((edge) => edge?.node),
      )}
      loading={deferredVariables !== variables}
      scroll={{ x: 'max-content' }}
      columns={[
        {
          key: 'name',
          title: t('general.Project'),
          render: (_value, row) => row.basicInfo.name,
        },
        ...slots.map((slot) => ({
          key: slot,
          title: mergedResourceSlots[slot]?.human_readable_name ?? slot,
          render: (_value: unknown, row: ProjectRow) => (
            <Suspense fallback={<BAISkeleton rows={1} hasTitle={false} />}>
              <AllocationCell
                projectId={row.entityId}
                resourceType={slot}
                fetchKey={fetchKey}
              />
            </Suspense>
          ),
        })),
      ]}
      pagination={{
        pageSize: tablePaginationOption.pageSize,
        current: tablePaginationOption.current,
        total: projects?.count ?? 0,
        onChange: (current, pageSize) =>
          setTablePaginationOption({ current, pageSize }),
      }}
    />
  );
};

/** The current domain's active projects, each slot used against the project's own limit. */
const ProjectAllocationsPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const heading = {
    title: t('dashboard.card.ResourceAllocationByProject'),
    tooltip: t('dashboard.card.ResourceAllocationByProjectTooltip'),
  };
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{ project: heading, domain: heading }}
    >
      {(cardScope, key) =>
        cardScope.kind === 'domain' ? (
          <ProjectList domainName={cardScope.domainName} fetchKey={key} />
        ) : null
      }
    </ScopedCard>
  );
};

export default ProjectAllocationsPanel;
