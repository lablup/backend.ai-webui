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
import { useFormatSlotAmount } from '../memberCards/ResourceUsageBars';
import { toLimitUsageRows } from '../memberCards/memberCardData';
import {
  isPermissionDenied,
  readPrimary,
  type CaughtValue,
} from '../panelPermission';
import type { PanelComponentProps } from '../types';
import { useResetPageOn } from '../useResetPageOn';
import { ProgressBar } from '@lablup/ui-common/ProgressBar';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAISkeleton,
  BAITable,
  filterOutNullAndUndefined,
  useBAIResourceSlots,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense, useDeferredValue } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
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

/** A cell whose read failed; "-" stays for a read the viewer may not make. */
const CellError: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  return <Text type="supporting">{t('dashboard.card.Error')}</Text>;
};

/** One slot of one project: used against the limit, and what is left. */
const AllocationCell: React.FC<{
  projectId: string;
  resourceType: string;
  fetchKey: string;
}> = ({ projectId, resourceType, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const { mergedResourceSlots } = useBAIResourceSlots();
  const formatAmount = useFormatSlotAmount();
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
  const result = data.projectResourceAllocationV2;
  if (result && !result.ok) {
    return isPermissionDenied(result.errors) ? (
      <Text type="supporting">-</Text>
    ) : (
      <CellError />
    );
  }
  const usage = result?.value?.project;
  if (!usage) return <Text type="supporting">-</Text>;
  // `toLimitUsageRows` drops an idle zero limit; a slot with no limit entry is unlimited.
  const zeroLimit = usage.limits.some(
    (entry) =>
      entry.resourceType === resourceType &&
      !entry.unlimited &&
      entry.quantity != null,
  );
  const row = toLimitUsageRows(usage).find(
    (entry) => entry.resourceType === resourceType,
  ) ?? { resourceType, used: 0, limit: zeroLimit ? 0 : null };
  const name =
    mergedResourceSlots[resourceType]?.human_readable_name ?? resourceType;
  const limitText =
    row.limit === null
      ? t('dashboard.card.Unlimited')
      : formatAmount(resourceType, row.limit);
  const isOverLimit =
    row.limit !== null && row.used > 0 && row.used >= row.limit;
  return (
    <BAIFlex direction="column" align="stretch" gap="xxs">
      <Text type="supporting">
        {`${formatAmount(resourceType, row.used)} / ${limitText}`}
      </Text>
      {row.limit === null ? null : (
        <>
          <ProgressBar
            label={name}
            isLabelHidden
            value={
              row.limit > 0
                ? Math.min(row.used, row.limit)
                : isOverLimit
                  ? 1
                  : 0
            }
            max={row.limit > 0 ? row.limit : 1}
            variant={isOverLimit ? 'warning' : 'accent'}
          />
          <Text type="supporting">
            {t('dashboard.card.RemainingAmount', {
              amount: formatAmount(
                resourceType,
                Math.max(0, row.limit - row.used),
              ),
            })}
          </Text>
        </>
      )}
    </BAIFlex>
  );
};

const ProjectList: React.FC<{ domainId: string; fetchKey: string }> = ({
  domainId,
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
  useResetPageOn([domainId], setTablePaginationOption);
  const variables = {
    domainId,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<ProjectAllocationsPanelQuery>(
    graphql`
      query ProjectAllocationsPanelQuery(
        $domainId: UUID!
        $limit: Int!
        $offset: Int!
      ) {
        projects: scopedProjectsV2(
          scope: { domain: [{ value: $domainId }] }
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
          width: 180,
          render: (_value: unknown, row: ProjectRow) => (
            <ErrorBoundary fallback={<CellError />} resetKeys={[fetchKey]}>
              <Suspense fallback={<BAISkeleton rows={1} hasTitle={false} />}>
                <AllocationCell
                  projectId={row.entityId}
                  resourceType={slot}
                  fetchKey={fetchKey}
                />
              </Suspense>
            </ErrorBoundary>
          ),
        })),
      ]}
      pagination={{
        pageSize: tablePaginationOption.pageSize,
        current: tablePaginationOption.current,
        // Each row is one allocation request per refresh, so pages stay small.
        pageSizeOptions: [5, 10],
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
          <ProjectList domainId={cardScope.domainId} fetchKey={key} />
        ) : null
      }
    </ScopedCard>
  );
};

export default ProjectAllocationsPanel;
