import { Empty, Tabs, theme } from 'antd';
import { createStyles } from 'antd-style';
import {
  convertToBinaryUnit,
  INITIAL_FETCH_KEY,
  useResourceSlotsDetails,
  toFixedFloorWithoutTrailingZeros,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { UsageBucketChartContentQuery } from 'src/__generated__/UsageBucketChartContentQuery.graphql';
import { UsageBucketChartContent_DomainFragment$key } from 'src/__generated__/UsageBucketChartContent_DomainFragment.graphql';
import { UsageBucketChartContent_ProjectFragment$key } from 'src/__generated__/UsageBucketChartContent_ProjectFragment.graphql';
import { UsageBucketChartContent_UserFragment$key } from 'src/__generated__/UsageBucketChartContent_UserFragment.graphql';

interface UsageBucketChartContentProps {
  domainFairShareFrgmt?: UsageBucketChartContent_DomainFragment$key | null;
  projectFairShareFrgmt?: UsageBucketChartContent_ProjectFragment$key | null;
  userFairShareFrgmt?: UsageBucketChartContent_UserFragment$key | null;
  // TODO: Uncomment when server supports date range filter for usage buckets
  // dateRange: [Dayjs, Dayjs];
  fetchKey: string;
}

const UsageBucketChartContent: React.FC<UsageBucketChartContentProps> = ({
  domainFairShareFrgmt,
  projectFairShareFrgmt,
  userFairShareFrgmt,
  // TODO: Uncomment when server supports date range filter for usage buckets
  // dateRange,
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
        resourceGroup
        domainName
      }
    `,
    domainFairShareFrgmt,
  );

  const projectFairShares = useFragment(
    graphql`
      fragment UsageBucketChartContent_ProjectFragment on ProjectFairShare
      @relay(plural: true) {
        id
        resourceGroup
        domainName
        projectId
      }
    `,
    projectFairShareFrgmt,
  );

  const userFairShares = useFragment(
    graphql`
      fragment UsageBucketChartContent_UserFragment on UserFairShare
      @relay(plural: true) {
        id
        resourceGroup
        domainName
        projectId
        userUuid
      }
    `,
    userFairShareFrgmt,
  );

  const entityType: EntityType = !_.isEmpty(domainFairShares)
    ? 'domain'
    : !_.isEmpty(projectFairShares)
      ? 'project'
      : 'user';

  const resourceGroup =
    domainFairShares?.[0]?.resourceGroup ||
    projectFairShares?.[0]?.resourceGroup ||
    userFairShares?.[0]?.resourceGroup ||
    '';

  const domainFilter = (() => {
    if (entityType !== 'domain' || !domainFairShares) return null;
    const domainNames = domainFairShares.map((d) => d.domainName);
    if (domainNames.length === 1) {
      return {
        resourceGroup: { equals: resourceGroup },
        domainName: { equals: domainNames[0] },
      };
    }
    return {
      resourceGroup: { equals: resourceGroup },
      OR: domainNames.map((name) => ({ domainName: { equals: name } })),
    };
  })();

  const projectFilter = (() => {
    if (entityType !== 'project' || !projectFairShares) return null;
    const projectIds = projectFairShares.map((p) => p.projectId);
    return {
      resourceGroup: { equals: resourceGroup },
      projectId: { in: projectIds },
    };
  })();

  const userFilter = (() => {
    if (entityType !== 'user' || !userFairShares) return null;
    const userUuids = userFairShares.map((u) => u.userUuid);
    return {
      resourceGroup: { equals: resourceGroup },
      userUuid: { in: userUuids },
    };
  })();

  const queryData = useLazyLoadQuery<UsageBucketChartContentQuery>(
    graphql`
      query UsageBucketChartContentQuery(
        $domainFilter: DomainUsageBucketFilter
        $projectFilter: ProjectUsageBucketFilter
        $userFilter: UserUsageBucketFilter
        $domainOrderBy: [DomainUsageBucketOrderBy!]
        $projectOrderBy: [ProjectUsageBucketOrderBy!]
        $userOrderBy: [UserUsageBucketOrderBy!]
        $limit: Int
        $skipDomain: Boolean!
        $skipProject: Boolean!
        $skipUser: Boolean!
      ) {
        domainUsageBuckets(
          filter: $domainFilter
          orderBy: $domainOrderBy
          limit: $limit
        ) @skip(if: $skipDomain) {
          edges {
            node {
              id
              domainName
              resourceGroup
              metadata {
                periodStart
                periodEnd
                decayUnitDays
              }
              resourceUsage {
                entries {
                  resourceType
                  quantity
                }
              }
              capacitySnapshot {
                entries {
                  resourceType
                  quantity
                }
              }
            }
          }
        }
        projectUsageBuckets(
          filter: $projectFilter
          orderBy: $projectOrderBy
          limit: $limit
        ) @skip(if: $skipProject) {
          edges {
            node {
              id
              projectId
              domainName
              resourceGroup
              metadata {
                periodStart
                periodEnd
                decayUnitDays
              }
              resourceUsage {
                entries {
                  resourceType
                  quantity
                }
              }
              capacitySnapshot {
                entries {
                  resourceType
                  quantity
                }
              }
            }
          }
        }
        userUsageBuckets(
          filter: $userFilter
          orderBy: $userOrderBy
          limit: $limit
        ) @skip(if: $skipUser) {
          edges {
            node {
              id
              userUuid
              projectId
              domainName
              resourceGroup
              metadata {
                periodStart
                periodEnd
                decayUnitDays
              }
              resourceUsage {
                entries {
                  resourceType
                  quantity
                }
              }
              capacitySnapshot {
                entries {
                  resourceType
                  quantity
                }
              }
            }
          }
        }
      }
    `,
    {
      domainFilter: domainFilter,
      projectFilter: projectFilter,
      userFilter: userFilter,
      domainOrderBy:
        entityType === 'domain'
          ? [{ field: 'PERIOD_START', direction: 'ASC' }]
          : null,
      projectOrderBy:
        entityType === 'project'
          ? [{ field: 'PERIOD_START', direction: 'ASC' }]
          : null,
      userOrderBy:
        entityType === 'user'
          ? [{ field: 'PERIOD_START', direction: 'ASC' }]
          : null,
      limit: 100,
      skipDomain: entityType !== 'domain',
      skipProject: entityType !== 'project',
      skipUser: entityType !== 'user',
    },
    {
      fetchPolicy:
        fetchKey === INITIAL_FETCH_KEY ? 'store-and-network' : 'network-only',
      fetchKey,
    },
  );

  const buckets =
    queryData.domainUsageBuckets?.edges ||
    queryData.projectUsageBuckets?.edges ||
    queryData.userUsageBuckets?.edges;

  const chartDataMap = transformToChartData(buckets || [], entityType);

  if (!buckets || buckets.length === 0) {
    return (
      <Empty
        description={t('fairShare.usageBucket.NoDataAvailable')}
        style={{ padding: token.paddingLG }}
      />
    );
  }

  const resourceTypes: string[] = Array.from(chartDataMap.keys());

  const getResourceDisplayName = (resourceType: string): string => {
    const slotInfo = mergedResourceSlots[resourceType];
    return slotInfo?.human_readable_name || resourceType;
  };

  const formatValue = (value: number, resourceType: string): string => {
    const slotInfo = mergedResourceSlots[resourceType];
    if (slotInfo?.number_format?.binary) {
      return convertToBinaryUnit(value, 'auto', 2)?.displayValue || '';
    }
    const displayUnit = slotInfo?.display_unit || '';
    return `${toFixedFloorWithoutTrailingZeros(value, 2)}${displayUnit ? ` ${displayUnit}` : ''}`;
  };

  return (
    <Tabs
      items={resourceTypes.map((resourceType) => {
        const chartData = chartDataMap.get(resourceType)!;
        return {
          key: resourceType,
          label: getResourceDisplayName(resourceType),
          children: (
            <div className={styles.chart}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.data}>
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
                    formatter={(value: number) =>
                      formatValue(value, resourceType)
                    }
                    labelStyle={{ color: token.colorTextLightSolid }}
                    contentStyle={{
                      backgroundColor: token.colorBgSpotlight,
                      border: 'none',
                      borderRadius: token.borderRadius,
                    }}
                  />
                  <Legend />
                  {chartData.entities.map((entity, idx) => (
                    <Line
                      key={entity}
                      type="monotone"
                      dataKey={entity}
                      name={entity}
                      stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
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

const CHART_COLORS = [
  '#1677ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa8c16',
];

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
}

type UsageBucketNode = {
  readonly id: string;
  readonly domainName?: string;
  readonly projectId?: string;
  readonly userUuid?: string;
  readonly resourceGroup: string;
  readonly metadata: {
    readonly periodStart: string;
    readonly periodEnd: string;
    readonly decayUnitDays: number;
  };
  readonly resourceUsage: {
    readonly entries: ReadonlyArray<{
      readonly resourceType: string;
      readonly quantity: string;
    }>;
  };
  readonly capacitySnapshot: {
    readonly entries: ReadonlyArray<{
      readonly resourceType: string;
      readonly quantity: string;
    }>;
  };
};

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

const transformToChartData = (
  buckets: ReadonlyArray<{ readonly node: UsageBucketNode | null } | null>,
  entityType: EntityType,
): Map<string, ResourceChartData> => {
  const resourceMap = new Map<string, ResourceChartData>();

  if (!buckets || buckets.length === 0) {
    return resourceMap;
  }

  const periodMap = new Map<
    string,
    Map<string, Map<string, { usage: number; capacity: number }>>
  >();

  buckets.forEach((edge) => {
    const node = edge?.node;
    if (!node) return;

    const periodKey = node.metadata.periodStart;
    const entityId = getEntityIdFromNode(node, entityType);

    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, new Map());
    }
    const periodData = periodMap.get(periodKey)!;

    node.resourceUsage.entries.forEach((entry) => {
      if (!periodData.has(entry.resourceType)) {
        periodData.set(entry.resourceType, new Map());
      }
      const resourceData = periodData.get(entry.resourceType)!;

      const capacity =
        node.capacitySnapshot.entries.find(
          (c) => c.resourceType === entry.resourceType,
        )?.quantity || '0';

      resourceData.set(entityId, {
        usage: parseFloat(entry.quantity),
        capacity: parseFloat(capacity),
      });
    });
  });

  const allResourceTypes = new Set<string>();
  const allEntities = new Set<string>();

  buckets.forEach((edge) => {
    const node = edge?.node;
    if (!node) return;

    const entityId = getEntityIdFromNode(node, entityType);
    allEntities.add(entityId);

    node.resourceUsage.entries.forEach((entry) => {
      allResourceTypes.add(entry.resourceType);
    });
  });

  allResourceTypes.forEach((resourceType) => {
    const chartData: ChartDataPoint[] = [];

    const sortedPeriods = Array.from(periodMap.keys()).sort();

    sortedPeriods.forEach((period) => {
      const periodData = periodMap.get(period)!;
      const resourceData = periodData.get(resourceType);

      const dataPoint: ChartDataPoint = {
        periodStart: dayjs(period).format('MM/DD'),
        periodEnd: '',
      };

      allEntities.forEach((entityId) => {
        const entityData = resourceData?.get(entityId);
        dataPoint[entityId] = entityData?.usage || 0;
      });

      chartData.push(dataPoint);
    });

    resourceMap.set(resourceType, {
      resourceType,
      displayName: resourceType,
      data: chartData,
      entities: Array.from(allEntities),
    });
  });

  return resourceMap;
};
