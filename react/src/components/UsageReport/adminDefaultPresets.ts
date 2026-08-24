/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { adminDefaultPresetsListQuery } from '../../__generated__/adminDefaultPresetsListQuery.graphql';
import { adminDefaultPresetsMetadataQuery } from '../../__generated__/adminDefaultPresetsMetadataQuery.graphql';
import { fetchQuery, graphql } from 'react-relay';
import type { IEnvironment } from 'relay-runtime';

export interface UsageReportPresetLookup {
  /** Global relay id of a default container-utilization gauge preset. */
  presetId: string | null;
  /** Accelerator utilization metric name (e.g. cuda_util), if any exists. */
  gpuMetricName: string | null;
}

const listQuery = graphql`
  query adminDefaultPresetsListQuery {
    prometheusQueryPresets(limit: 100) {
      edges {
        node {
          id
          metricName
          queryTemplate
        }
      }
    }
  }
`;

const metadataQuery = graphql`
  query adminDefaultPresetsMetadataQuery {
    container_utilization_metric_metadata {
      metric_names
    }
  }
`;

/**
 * Pick a manager-seeded gauge preset over backendai_container_utilization
 * (alembic seeds "avg by"/"sum by" templates); rate/diff templates are not
 * usable for a utilization ratio. No presets are created by the WebUI.
 */
export const resolveUsageReportPresets = async (
  environment: IEnvironment,
): Promise<UsageReportPresetLookup> => {
  const [presets, metadata] = await Promise.all([
    fetchQuery<adminDefaultPresetsListQuery>(environment, listQuery, {})
      .toPromise()
      .catch(() => null),
    fetchQuery<adminDefaultPresetsMetadataQuery>(environment, metadataQuery, {})
      .toPromise()
      .catch(() => null),
  ]);
  const gaugePresets = (presets?.prometheusQueryPresets?.edges ?? [])
    .map((edge) => edge.node)
    .filter(
      (preset) =>
        preset.metricName === 'backendai_container_utilization' &&
        !preset.queryTemplate.includes('rate(') &&
        !preset.queryTemplate.includes('increase('),
    );
  const presetId =
    gaugePresets.find((preset) => preset.queryTemplate.startsWith('avg by'))
      ?.id ??
    gaugePresets.find((preset) => preset.queryTemplate.startsWith('sum by'))
      ?.id ??
    null;
  const metricNames =
    metadata?.container_utilization_metric_metadata?.metric_names ?? [];
  const gpuMetricName =
    metricNames.find(
      (name): name is string =>
        !!name && name.endsWith('_util') && !name.startsWith('cpu'),
    ) ?? null;
  return { presetId, gpuMetricName };
};
