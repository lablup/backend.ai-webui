/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { presetPalettes } from '@ant-design/colors';
import { Empty, Tabs, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import {
  convertToBinaryUnit,
  INITIAL_FETCH_KEY,
  useResourceSlotsDetails,
  toFixedFloorWithoutTrailingZeros,
  BAIFlex,
} from 'backend.ai-ui';
import dayjs, { Dayjs } from 'dayjs';
import _ from 'lodash';
import { useDeferredValue } from 'react';
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
import {
  DomainV2Filter,
  ProjectV2Filter,
  UserV2Filter,
  UsageBucketChartContentQuery,
  UsageBucketChartContentQuery$variables,
} from 'src/__generated__/UsageBucketChartContentQuery.graphql';
import { UsageBucketChartContent_DomainFragment$key } from 'src/__generated__/UsageBucketChartContent_DomainFragment.graphql';
import { UsageBucketChartContent_ProjectFragment$key } from 'src/__generated__/UsageBucketChartContent_ProjectFragment.graphql';
import { UsageBucketChartContent_UserFragment$key } from 'src/__generated__/UsageBucketChartContent_UserFragment.graphql';

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
  const { styles } = useStyles();
  const { mergedResourceSlots } = useResourceSlotsDetails();

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
    return (
      <Empty
        description={t('fairShare.usageBucket.NoDataAvailable')}
        style={{ padding: token.paddingLG }}
      />
    );
  }

  const resourceTypes: string[] = Object.keys(chartDataMap);

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

  return (
    <Tabs
      items={resourceTypes.map((resourceType) => {
        const chartData = chartDataMap[resourceType];
        return {
          key: resourceType,
          label: getResourceDisplayName(resourceType),
          children: (
            <div className={styles.chart}>
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
                          convertToBinaryUnit(value, 'auto', 1)?.displayValue ||
                          ''
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
                          <Typography.Text
                            style={{
                              color: 'inherit',
                              marginBottom: token.marginSM,
                            }}
                          >
                            {`${label} - ${t('fairShare.usageBucket.AverageDailyUsage')}`}
                          </Typography.Text>
                          {capacityEntries.length > 0 && (
                            <BAIFlex
                              direction="column"
                              align="stretch"
                              style={{
                                marginBottom: token.marginXS,
                              }}
                            >
                              <Typography.Text style={{ color: 'inherit' }}>
                                {parentScopeLabel}
                              </Typography.Text>
                              <Typography.Text
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
                                <Typography.Text
                                  style={{
                                    fontSize: token.fontSizeSM,
                                    color: 'inherit',
                                  }}
                                >
                                  {` ${mergedResourceSlots[resourceType]?.display_unit}/${t('fairShare.Days')}`}
                                </Typography.Text>
                              </Typography.Text>
                            </BAIFlex>
                          )}
                          {entityEntries.length > 0 && (
                            <BAIFlex direction="column" align="stretch">
                              <Typography.Text style={{ color: 'inherit' }}>
                                {entityTypeLabel}
                              </Typography.Text>
                              {entityEntries.map((entry) => (
                                <Typography.Text
                                  key={entry.dataKey}
                                  style={{ color: entry.color || 'inherit' }}
                                >
                                  {entry.name} :
                                  {resourceType === 'mem'
                                    ? convertToBinaryUnit(
                                        Number(entry.value),
                                        'g',
                                        2,
                                      )?.numberFixed
                                    : toFixedFloorWithoutTrailingZeros(
                                        Number(entry.value),
                                        2,
                                      )}
                                  <Typography.Text
                                    style={{
                                      fontSize: token.fontSizeSM,
                                      color: 'inherit',
                                    }}
                                  >
                                    {` ${mergedResourceSlots[resourceType]?.display_unit}/${t('fairShare.Days')}`}
                                  </Typography.Text>
                                </Typography.Text>
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
          ),
        };
      })}
    />
  );
};

export default UsageBucketChartContent;

type EntityType = 'domain' | 'project' | 'user';

const CHART_COLORS = Object.values(presetPalettes).map((palette) => palette[2]);

const useStyles = createStyles(({ css, token }) => ({
  chart: css`
    .recharts-label {
      fill: ${token.colorTextDescription};
    }
    .recharts-cartesian-axis-line {
      stroke: ${token.colorBorder};
    }
    .recharts-cartesian-axis-tick-line {
      stroke: ${token.colorBorder};
    }
    .recharts-cartesian-axis-tick-value {
      fill: ${token.colorTextDescription};
    }
    .recharts-default-tooltip {
      background-color: ${token.colorBgSpotlight} !important;
      border: none !important;
      border-radius: ${token.borderRadius}px !important;
    }
    .recharts-tooltip-label {
      color: ${token.colorTextLightSolid} !important;
    }
    .recharts-tooltip-item {
      color: ${token.colorTextLightSolid} !important;
    }
  `,
}));

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
  UsageBucketChartContentQuery['response']['users']
>['edges'][number]['node']['usageBuckets']['edges'][number]['node'];

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
      node.averageDailyUsage.entries.forEach((entry) => {
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

    for (const entry of node.averageDailyUsage.entries) {
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
