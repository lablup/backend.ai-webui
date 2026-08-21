/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// App-seeded PromQL presets for the admin usage report (spec §5): the report
// defines its cluster-wide queries in code and creates them idempotently.
import { adminPresetSeedCreateMutation } from '../../__generated__/adminPresetSeedCreateMutation.graphql';
import { adminPresetSeedListQuery } from '../../__generated__/adminPresetSeedListQuery.graphql';
import { commitMutation, fetchQuery, graphql } from 'react-relay';
import type { IEnvironment } from 'relay-runtime';

/** Reserved name prefix; presets under it belong to the usage report. */
export const USAGE_REPORT_PRESET_PREFIX = 'webui-usage-report/';

const UTILIZATION_GAUGE = 'backendai_container_utilization';

const CPU_MATCHER = 'container_metric_name="cpu_util"';
const GPU_MATCHER =
  'container_metric_name=~".+_util",container_metric_name!="cpu_util"';
const MEM_MATCHER = 'container_metric_name="mem"';

// The manager fills `{labels}` / `{window}` str.format-style, so literal
// PromQL braces are doubled (see the backend's own `container_gauge` seed).
const utilizationRatioTemplate = (matcher: string) =>
  `100 * sum(${UTILIZATION_GAUGE}{{${matcher},value_type="current",{labels}}})` +
  ` / sum(${UTILIZATION_GAUGE}{{${matcher},value_type="capacity",{labels}}})`;

const utilizationAvgTemplate = (matcher: string) =>
  `avg_over_time((${utilizationRatioTemplate(matcher)})[{window}:1h])`;

const PRESET_DESCRIPTION =
  'Seeded by the Backend.AI WebUI usage report; recreated automatically if missing. Do not repurpose.';

const EXECUTION_FILTER_LABEL_KEYS = ['agent_id', 'project_id', 'user_id'];

export type UsageReportPresetKey =
  | 'cpuUtilSeries'
  | 'gpuUtilSeries'
  | 'memUtilSeries'
  | 'cpuUtilAvg'
  | 'gpuUtilAvg'
  | 'memUtilAvg';

export interface UsageReportPresetDefinition {
  key: UsageReportPresetKey;
  name: string;
  queryTemplate: string;
  /** Default window for the `{window}` placeholder; null for series presets. */
  timeWindow: string | null;
}

export const USAGE_REPORT_PRESET_DEFINITIONS: UsageReportPresetDefinition[] = [
  {
    key: 'cpuUtilSeries',
    name: `${USAGE_REPORT_PRESET_PREFIX}cpu-util`,
    queryTemplate: utilizationRatioTemplate(CPU_MATCHER),
    timeWindow: null,
  },
  {
    key: 'gpuUtilSeries',
    name: `${USAGE_REPORT_PRESET_PREFIX}gpu-util`,
    queryTemplate: utilizationRatioTemplate(GPU_MATCHER),
    timeWindow: null,
  },
  {
    key: 'memUtilSeries',
    name: `${USAGE_REPORT_PRESET_PREFIX}mem-util`,
    queryTemplate: utilizationRatioTemplate(MEM_MATCHER),
    timeWindow: null,
  },
  {
    key: 'cpuUtilAvg',
    name: `${USAGE_REPORT_PRESET_PREFIX}cpu-util-avg`,
    queryTemplate: utilizationAvgTemplate(CPU_MATCHER),
    timeWindow: '7d',
  },
  {
    key: 'gpuUtilAvg',
    name: `${USAGE_REPORT_PRESET_PREFIX}gpu-util-avg`,
    queryTemplate: utilizationAvgTemplate(GPU_MATCHER),
    timeWindow: '7d',
  },
  {
    key: 'memUtilAvg',
    name: `${USAGE_REPORT_PRESET_PREFIX}mem-util-avg`,
    queryTemplate: utilizationAvgTemplate(MEM_MATCHER),
    timeWindow: '7d',
  },
];

export type UsageReportPresetIds = Record<UsageReportPresetKey, string>;

const listQuery = graphql`
  query adminPresetSeedListQuery($nameFilter: StringFilter) {
    prometheusQueryPresets(
      filter: { name: $nameFilter }
      limit: 100
      offset: 0
    ) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

const createMutation = graphql`
  mutation adminPresetSeedCreateMutation($input: CreateQueryDefinitionInput!) {
    adminCreatePrometheusQueryPreset(input: $input) {
      preset {
        id
        name
      }
    }
  }
`;

const fetchExistingPresetIdsByName = async (
  environment: IEnvironment,
): Promise<Map<string, string>> => {
  const data = await fetchQuery<adminPresetSeedListQuery>(
    environment,
    listQuery,
    { nameFilter: { startsWith: USAGE_REPORT_PRESET_PREFIX } },
    { fetchPolicy: 'network-only' },
  ).toPromise();
  const byName = new Map<string, string>();
  data?.prometheusQueryPresets?.edges?.forEach((edge) => {
    byName.set(edge.node.name, edge.node.id);
  });
  return byName;
};

const createPreset = (
  environment: IEnvironment,
  definition: UsageReportPresetDefinition,
): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    commitMutation<adminPresetSeedCreateMutation>(environment, {
      mutation: createMutation,
      variables: {
        input: {
          name: definition.name,
          description: PRESET_DESCRIPTION,
          metricName: UTILIZATION_GAUGE,
          queryTemplate: definition.queryTemplate,
          timeWindow: definition.timeWindow,
          options: {
            filterLabels: EXECUTION_FILTER_LABEL_KEYS,
            groupLabels: [],
          },
        },
      },
      onCompleted: (response, errors) => {
        const id = response.adminCreatePrometheusQueryPreset?.preset?.id;
        if (errors?.length || !id) {
          reject(new Error(errors?.[0]?.message ?? 'Preset creation failed'));
        } else {
          resolve(id);
        }
      },
      onError: reject,
    });
  });

/**
 * Query existing report presets by name and create the missing ones.
 * A create that races another session may fail; the trailing re-query
 * resolves the winner's IDs, so the flow stays idempotent.
 */
export const ensureUsageReportPresets = async (
  environment: IEnvironment,
): Promise<UsageReportPresetIds> => {
  let byName = await fetchExistingPresetIdsByName(environment);
  for (const definition of USAGE_REPORT_PRESET_DEFINITIONS) {
    if (byName.has(definition.name)) {
      continue;
    }
    try {
      byName.set(definition.name, await createPreset(environment, definition));
    } catch {
      // Resolved by the re-query below when a concurrent seeding won the race.
    }
  }
  if (USAGE_REPORT_PRESET_DEFINITIONS.some((d) => !byName.has(d.name))) {
    byName = await fetchExistingPresetIdsByName(environment);
  }
  const ids = {} as UsageReportPresetIds;
  for (const definition of USAGE_REPORT_PRESET_DEFINITIONS) {
    const id = byName.get(definition.name);
    if (!id) {
      throw new Error(
        `Usage-report preset "${definition.name}" could not be created`,
      );
    }
    ids[definition.key] = id;
  }
  return ids;
};
