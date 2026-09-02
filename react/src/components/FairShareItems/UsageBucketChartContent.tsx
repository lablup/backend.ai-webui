/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DomainV2Filter,
  ProjectV2Filter,
  UserV2Filter,
  UsageBucketChartContentQuery,
  UsageBucketChartContentQuery$variables,
} from '../../__generated__/UsageBucketChartContentQuery.graphql';
import { UsageBucketChartContent_DomainFragment$key } from '../../__generated__/UsageBucketChartContent_DomainFragment.graphql';
import { UsageBucketChartContent_ProjectFragment$key } from '../../__generated__/UsageBucketChartContent_ProjectFragment.graphql';
import { UsageBucketChartContent_UserFragment$key } from '../../__generated__/UsageBucketChartContent_UserFragment.graphql';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import { presetPalettes, theme } from '../../theme-shim';
import './UsageBucketChartContent.css';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import {
  convertToBinaryUnit,
  INITIAL_FETCH_KEY,
  toFixedFloorWithoutTrailingZeros,
  BAIFlex,
  BAIText,
} from 'backend.ai-ui';
import dayjs, { Dayjs } from 'dayjs';
import * as _ from 'lodash-es';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface UsageBucketChartContentProps {
  domainFairShareFrgmt?: UsageBucketChartContent_DomainFragment$key | null;
  projectFairShareFrgmt?: UsageBucketChartContent_ProjectFragment$key | null;
  userFairShareFrgmt?: UsageBucketChartContent_UserFragment$key | null;
  dateRange: [Dayjs, Dayjs];
  fetchKey: string;
}

const UsageBucketChartContent: React.FC<UsageBucketChartContentProps> = ({
  domainFairShareFrgmt,
  projectFairShareFrgmt,
  userFairShareFrgmt,
  dateRange,
  fetchKey,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { mergedResourceSlots } = useResourceSlotsDetails();
  // antd `Tabs items` rendered the active panel itself; Astryx `TabList` is
  // navigation only (MAPPING §4), so the selected key becomes local state and
  // the panel is rendered below the rail. Declared with the other hooks so the
  // "no data" early return below cannot change the hook order.
  const [activeResourceType, setActiveResourceType] = useState<string>();

  const domainFairShares = useFragment(
    graphql`
      fragment UsageBucketChartContent_DomainFragment on DomainFairShare
      @relay(plural: true) {
        id
        domainName
        resourceGroup {
          name
        }
      }
    `,
    domainFairShareFrgmt,
  );

  const projectFairShares = useFragment(
    graphql`
      fragment UsageBucketChartContent_ProjectFragment on ProjectFairShare
      @relay(plural: true) {
        id
        domainName
        projectId
        resourceGroup {
          name
        }
      }
    `,
    projectFairShareFrgmt,
  );

  const userFairShares = useFragment(
    graphql`
      fragment UsageBucketChartContent_UserFragment on UserFairShare
      @relay(plural: true) {
        id
        domainName
        projectId
        userUuid
        resourceGroup {
          name
        }
      }
    `,
    userFairShareFrgmt,
  );

  const selectedResourceGroupName =
    domainFairShares?.[0]?.resourceGroup?.name ||
    projectFairShares?.[0]?.resourceGroup?.name ||
    userFairShares?.[0]?.resourceGroup?.name ||
    '';
  const selectedDomainNames: string[] = (() => {
    if (domainFairShares && domainFairShares.length > 0) {
      return domainFairShares
        .map((d) => d.domainName)
        .filter((name): name is string => Boolean(name));
    }
    if (projectFairShares && projectFairShares.length > 0) {
      return projectFairShares
        .map((p) => p.domainName)
        .filter((name): name is string => Boolean(name));
    }
    if (userFairShares && userFairShares.length > 0) {
      return userFairShares
        .map((u) => u.domainName)
        .filter((name): name is string => Boolean(name));
    }
    return [];
  })();
  const selectedProjectIds: string[] = (() => {
    if (projectFairShares && projectFairShares.length > 0) {
      return projectFairShares
        .map((p) => p.projectId)
        .filter((id): id is string => Boolean(id));
    }
    if (userFairShares && userFairShares.length > 0) {
      return _.uniq(
        userFairShares
          .map((u) => u.projectId)
          .filter((id): id is string => Boolean(id)),
      );
    }
    return [];
  })();
  const selectedUserUuids: string[] =
    userFairShares
      ?.map((u) => u.userUuid)
      .filter((uuid): uuid is string => Boolean(uuid)) ?? [];

  const rangeFilter = {
    periodStart: {
      after: dateRange[0].format('YYYY-MM-DD'),
    },
    periodEnd: {
      before: dateRange[1].format('YYYY-MM-DD'),
    },
  };

  const queryVariables: UsageBucketChartContentQuery$variables = {
    periodStart: { after: rangeFilter.periodStart.after },
    periodEnd: { before: rangeFilter.periodEnd.before },
    selectedResourceGroupName: selectedResourceGroupName,
    selectedProjectId: userFairShares?.[0]?.projectId || '',
    skipDomain: _.isEmpty(domainFairShares) && _.isEmpty(projectFairShares),
    skipProject: _.isEmpty(projectFairShares) && _.isEmpty(userFairShares),
    skipUser: _.isEmpty(userFairShares),
    domainFilter: {
      OR: selectedDomainNames.map((name) => ({
        name: { equals: name },
      })),
    } satisfies DomainV2Filter,
    projectFilter: {
      OR: selectedProjectIds.map((id) => ({
        id: { equals: id },
      })),
    } satisfies ProjectV2Filter,
    userFilter: {
      OR: selectedUserUuids.map((uuid) => ({
        uuid: { equals: uuid },
      })),
    } satisfies UserV2Filter,
    limit: dateRange[1].diff(dateRange[0], 'day'),
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const { resourceGroups, domains, projects, users } =
    useLazyLoadQuery<UsageBucketChartContentQuery>(
      graphql`
        query UsageBucketChartContentQuery(
          $domainFilter: DomainV2Filter
          $projectFilter: ProjectV2Filter
          $userFilter: UserV2Filter
          $skipDomain: Boolean!
          $skipProject: Boolean!
          $skipUser: Boolean!
          $periodStart: DateFilter
          $periodEnd: DateFilter
          $selectedResourceGroupName: String!
          $selectedProjectId: UUID!
          $limit: Int
        ) {
          resourceGroups: adminResourceGroups(
            filter: { name: { equals: $selectedResourceGroupName } }
          ) {
            edges {
              node {
                name
                resourceInfo {
                  capacity {
                    entries {
                      quantity
                      resourceType
                    }
                  }
                }
              }
            }
          }
          domains: adminDomainsV2(filter: $domainFilter)
            @skip(if: $skipDomain) {
            count
            edges {
              node {
                id
                usageBuckets(
                  scope: { resourceGroupName: $selectedResourceGroupName }
                  filter: { periodStart: $periodStart, periodEnd: $periodEnd }
                  orderBy: [{ field: PERIOD_START, direction: ASC }]
                  limit: $limit
                ) {
                  count
                  edges {
                    node {
                      domainName
                      metadata {
                        periodStart
                      }
                      averageDailyUsage {
                        entries {
                          resourceType
                          quantity
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          projects: adminProjectsV2(filter: $projectFilter)
            @skip(if: $skipProject) {
            count
            edges {
              node {
                id
                basicInfo {
                  name
                }
                usageBuckets(
                  scope: { resourceGroupName: $selectedResourceGroupName }
                  filter: { periodStart: $periodStart, periodEnd: $periodEnd }
                  orderBy: [{ field: PERIOD_START, direction: ASC }]
                  limit: $limit
                ) {
                  count
                  edges {
                    node {
                      domainName
                      projectId
                      metadata {
                        periodStart
                      }
                      averageDailyUsage {
                        entries {
                          quantity
                          resourceType
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          users: adminUsersV2(filter: $userFilter) @skip(if: $skipUser) {
            count
            edges {
              node {
                id
                basicInfo {
                  email
                }
                usageBuckets(
                  scope: {
                    resourceGroupName: $selectedResourceGroupName
                    projectId: $selectedProjectId
                  }
                  filter: { periodStart: $periodStart, periodEnd: $periodEnd }
                  orderBy: [{ field: PERIOD_START, direction: ASC }]
                  limit: $limit
                ) {
                  count
                  edges {
                    node {
                      domainName
                      projectId
                      userUuid
                      metadata {
                        periodStart
                      }
                      averageDailyUsage {
                        entries {
                          resourceType
                          quantity
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      deferredQueryVariables,
      {
        fetchKey,
        fetchPolicy:
          fetchKey === INITIAL_FETCH_KEY ? 'store-and-network' : 'network-only',
      },
    );

  const entityType: EntityType = !_.isEmpty(domainFairShares)
    ? 'domain'
    : !_.isEmpty(projectFairShares)
      ? 'project'
      : 'user';

  // Target entity buckets
  const targetEdges =
    entityType === 'domain'
      ? domains?.edges
      : entityType === 'project'
        ? projects?.edges
        : users?.edges;
  const buckets = _.flatMap(
    targetEdges || [],
    (edge) => edge?.node?.usageBuckets?.edges || [],
  );

  // Build entity ID → display name mapping
  const entityNameMap: Record<string, string> = (() => {
    if (entityType === 'project') {
      return _.fromPairs(
        _.compact(
          projects?.edges?.map((edge) => {
            const projectId =
              edge?.node?.usageBuckets?.edges?.[0]?.node?.projectId;
            const name = edge?.node?.basicInfo?.name;
            return projectId && name ? [projectId, name] : null;
          }),
        ),
      );
    }
    if (entityType === 'user') {
      return _.fromPairs(
        _.compact(
          users?.edges?.map((edge) => {
            const userUuid =
              edge?.node?.usageBuckets?.edges?.[0]?.node?.userUuid;
            const email = edge?.node?.basicInfo?.email;
            return userUuid && email ? [userUuid, email] : null;
          }),
        ),
      );
    }
    return {};
  })();

  // Parent scope capacity per period per resourceType
  const parentCapacityMap = buildParentCapacityMap(
    entityType,
    resourceGroups,
    domains,
    projects,
  );

  const chartDataMap = transformToChartData(
    buckets || [],
    entityType,
    parentCapacityMap,
    entityNameMap,
  );

  if (!buckets || buckets.length === 0) {
    // antd `Empty description` → `EmptyState title` (a required string, MAPPING
    // §4). The default antd illustration has no destination and is dropped.
    return (
      <EmptyState
        title={t('fairShare.usageBucket.NoDataAvailable')}
        style={{ padding: token.paddingLG }}
      />
    );
  }

  const resourceTypes: string[] = Object.keys(chartDataMap);
  const activeKey =
    activeResourceType && resourceTypes.includes(activeResourceType)
      ? activeResourceType
      : resourceTypes[0];

  const getResourceDisplayName = (resourceType: string): string => {
    const slotInfo = mergedResourceSlots[resourceType];
    return slotInfo?.human_readable_name || resourceType;
  };

  const capacityName =
    entityType === 'domain'
      ? selectedResourceGroupName
      : entityType === 'project'
        ? _.uniq(selectedDomainNames.filter(Boolean)).join(', ')
        : _.uniq(
            projects?.edges
              ?.map((e) => e?.node?.basicInfo?.name)
              .filter(Boolean),
          ).join(', ') || '';

  const parentScopeLabel =
    entityType === 'domain'
      ? t('fairShare.ResourceGroup')
      : entityType === 'project'
        ? t('fairShare.Domain')
        : t('fairShare.Project');

  const entityTypeLabel =
    entityType === 'domain'
      ? t('fairShare.Domain')
      : entityType === 'project'
        ? t('fairShare.Project')
        : t('fairShare.User');

  const renderChart = (resourceType: string) => {
    const chartData = chartDataMap[resourceType];
    return (
      <div className="usage-bucket-chart">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData.data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={token.colorBorderSecondary}
            />
            <XAxis dataKey="periodStart" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const slotInfo = mergedResourceSlots[resourceType];
                if (slotInfo?.number_format?.binary) {
                  return (
                    convertToBinaryUnit(value, 'auto', 1)?.displayValue || ''
                  );
                }
                return toFixedFloorWithoutTrailingZeros(value, 1);
              }}
            />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const capacityEntries = payload.filter(
                  (p) => p.dataKey === CAPACITY_KEY,
                );
                const entityEntries = payload.filter(
                  (p) => p.dataKey !== CAPACITY_KEY,
                );
                return (
                  <BAIFlex
                    direction="column"
                    align="stretch"
                    style={{
                      backgroundColor: token.colorBgBase,
                      borderRadius: token.borderRadius,
                      padding: token.paddingSM,
                    }}
                  >
                    <BAIText
                      style={{
                        color: 'inherit',
                        marginBottom: token.marginSM,
                      }}
                    >
                      {`${label} - ${t('fairShare.usageBucket.AverageDailyUsage')}`}
                    </BAIText>
                    {capacityEntries.length > 0 && (
                      <BAIFlex
                        direction="column"
                        align="stretch"
                        style={{
                          marginBottom: token.marginXS,
                        }}
                      >
                        <BAIText style={{ color: 'inherit' }}>
                          {parentScopeLabel}
                        </BAIText>
                        <BAIText
                          style={{
                            color: token.colorTextTertiary,
                          }}
                        >
                          {capacityName} :
                          {resourceType === 'mem'
                            ? convertToBinaryUnit(
                                Number(capacityEntries[0].value),
                                'g',
                                2,
                              )?.numberFixed
                            : toFixedFloorWithoutTrailingZeros(
                                Number(capacityEntries[0].value),
                                2,
                              )}
                          <BAIText
                            style={{
                              fontSize: token.fontSizeSM,
                              color: 'inherit',
                            }}
                          >
                            {` ${mergedResourceSlots[resourceType]?.display_unit}/${t('fairShare.Days')}`}
                          </BAIText>
                        </BAIText>
                      </BAIFlex>
                    )}
                    {entityEntries.length > 0 && (
                      <BAIFlex direction="column" align="stretch">
                        <BAIText style={{ color: 'inherit' }}>
                          {entityTypeLabel}
                        </BAIText>
                        {entityEntries.map((entry) => (
                          <BAIText
                            key={entry.dataKey}
                            style={{ color: entry.color || 'inherit' }}
                          >
                            {entry.name} :
                            {resourceType === 'mem'
                              ? convertToBinaryUnit(Number(entry.value), 'g', 2)
                                  ?.numberFixed
                              : toFixedFloorWithoutTrailingZeros(
                                  Number(entry.value),
                                  2,
                                )}
                            <BAIText
                              style={{
                                fontSize: token.fontSizeSM,
                                color: 'inherit',
                              }}
                            >
                              {` ${mergedResourceSlots[resourceType]?.display_unit}/${t('fairShare.Days')}`}
                            </BAIText>
                          </BAIText>
                        ))}
                      </BAIFlex>
                    )}
                  </BAIFlex>
                );
              }}
            />
            <Legend />
            {chartData.hasCapacity && (
              <Area
                type="monotone"
                dataKey={CAPACITY_KEY}
                name={`${parentScopeLabel} (${capacityName})`}
                stroke={token.colorFill}
                fill={token.colorFill}
                fillOpacity={0.75}
                legendType="square"
              />
            )}
            {chartData.entities.map((entity, idx) => (
              <Area
                key={entity}
                type="monotone"
                dataKey={entity}
                name={entity}
                stackId="1"
                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <TabList value={activeKey} onChange={setActiveResourceType}>
        {resourceTypes.map((resourceType) => (
          <Tab
            key={resourceType}
            value={resourceType}
            label={getResourceDisplayName(resourceType)}
          />
        ))}
      </TabList>
      {activeKey ? renderChart(activeKey) : null}
    </BAIFlex>
  );
};

export default UsageBucketChartContent;

type EntityType = 'domain' | 'project' | 'user';

const CHART_COLORS = Object.values(presetPalettes).map((palette) => palette[2]);

interface ChartDataPoint {
  periodStart: string;
  periodEnd: string;
  [entityKey: string]: number | string;
}

interface ResourceChartData {
  resourceType: string;
  displayName: string;
  data: ChartDataPoint[];
  entities: string[];
  hasCapacity: boolean;
}

const CAPACITY_KEY = '_capacity';

type _UsageBucketNode = NonNullable<
  NonNullable<
    UsageBucketChartContentQuery['response']['users']
  >['edges'][number]['node']['usageBuckets']
>['edges'][number]['node'];

type UsageBucketNode = Omit<_UsageBucketNode, 'projectId' | 'userUuid'> &
  Partial<Pick<_UsageBucketNode, 'projectId' | 'userUuid'>>;

const getEntityIdFromNode = (
  node: UsageBucketNode,
  entityType: EntityType,
): string => {
  switch (entityType) {
    case 'domain':
      return node.domainName || '';
    case 'project':
      return node.projectId || '';
    case 'user':
      return node.userUuid || '';
    default:
      return '';
  }
};

// parentCapacityMap: { [resourceType]: { [periodStart]: capacity } }
// For 'domain' entity type, capacity is static from resourceGroup (period key = '*')
// For 'project'/'user', capacity comes from parent scope's averageDailyUsage per period
type ParentCapacityMap = Record<string, Record<string, number>>;

const buildParentCapacityMap = (
  entityType: EntityType,
  resourceGroups: UsageBucketChartContentQuery['response']['resourceGroups'],
  domains: UsageBucketChartContentQuery['response']['domains'],
  projects: UsageBucketChartContentQuery['response']['projects'],
): ParentCapacityMap => {
  if (entityType === 'domain') {
    const entries =
      resourceGroups?.edges?.[0]?.node?.resourceInfo?.capacity?.entries ?? [];
    return _.fromPairs(
      entries.map((entry) => [
        entry.resourceType,
        { '*': parseFloat(entry.quantity) },
      ]),
    );
  }

  // Project → parent is domain; User → parent is project
  const parentEdges =
    entityType === 'project' ? domains?.edges : projects?.edges;
  const bucketNodes = _.compact(
    _.flatMap(parentEdges ?? [], (edge) =>
      edge?.node?.usageBuckets?.edges?.map((e) => e?.node),
    ),
  );

  return _.reduce(
    bucketNodes,
    (acc, node) => {
      const periodKey = node.metadata.periodStart;
      node.averageDailyUsage?.entries.forEach((entry) => {
        const rt = entry.resourceType;
        if (!acc[rt]) acc[rt] = {};
        acc[rt][periodKey] =
          (acc[rt][periodKey] ?? 0) + parseFloat(entry.quantity);
      });
      return acc;
    },
    {} as ParentCapacityMap,
  );
};

const transformToChartData = (
  buckets: ReadonlyArray<{ readonly node: UsageBucketNode | null } | null>,
  entityType: EntityType,
  parentCapacityMap: ParentCapacityMap,
  entityNameMap: Record<string, string>,
): Record<string, ResourceChartData> => {
  if (!buckets || buckets.length === 0) return {};

  const getDisplayName = (entityId: string) =>
    entityNameMap[entityId] || entityId;

  // Single pass: collect metadata and build nested lookup
  // { [resourceType]: { [period]: { [entity]: value } } }
  const allPeriods = new Set<string>();
  const allResourceTypes = new Set<string>();
  const allEntities = new Set<string>();
  const resourcePeriodMap: Record<
    string,
    Record<string, Record<string, number>>
  > = {};

  for (const edge of buckets) {
    const node = edge?.node;
    if (!node) continue;

    const periodKey = node.metadata.periodStart;
    const displayName = getDisplayName(getEntityIdFromNode(node, entityType));
    allPeriods.add(periodKey);
    allEntities.add(displayName);

    for (const entry of node.averageDailyUsage?.entries ?? []) {
      const rt = entry.resourceType;
      allResourceTypes.add(rt);

      if (!resourcePeriodMap[rt]) resourcePeriodMap[rt] = {};
      if (!resourcePeriodMap[rt][periodKey])
        resourcePeriodMap[rt][periodKey] = {};
      resourcePeriodMap[rt][periodKey][displayName] = parseFloat(
        entry.quantity,
      );
    }
  }

  const entities = Array.from(allEntities);
  const sortedPeriods = Array.from(allPeriods).sort();

  return _.fromPairs(
    Array.from(allResourceTypes).map((resourceType) => {
      const periodsForResource = resourcePeriodMap[resourceType] ?? {};
      const capacityForResource = parentCapacityMap[resourceType];
      const hasCapacity = !_.isEmpty(capacityForResource);

      const data: ChartDataPoint[] = sortedPeriods.map((period) => {
        const entityValues = periodsForResource[period] ?? {};
        const dataPoint: ChartDataPoint = {
          periodStart: dayjs(period).format('MM/DD'),
          periodEnd: '',
          ..._.fromPairs(entities.map((e) => [e, entityValues[e] ?? 0])),
        };

        if (hasCapacity) {
          dataPoint[CAPACITY_KEY] =
            capacityForResource[period] ?? capacityForResource['*'] ?? 0;
        }

        return dataPoint;
      });

      return [
        resourceType,
        {
          resourceType,
          displayName: resourceType,
          data,
          entities,
          hasCapacity,
        } satisfies ResourceChartData,
      ];
    }),
  );
};
