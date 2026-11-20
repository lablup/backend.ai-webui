/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CHART_GROUPINGS } from './chartSources';
import type { PanelSourceSpec } from './panelFromRequest';
import { availablePanelTypes } from './panelRegistry';
import { resourceRegistry } from './resourceRegistry';
import type { ResourceKey } from './types';
import type { TFunction } from 'i18next';

/** What each data source the viewer may query offers a described panel. */
export const panelSourceSpecs = (
  resources: ReadonlyArray<ResourceKey>,
  { gridEnabled, t }: { gridEnabled: boolean; t: TFunction },
): Array<PanelSourceSpec> =>
  resources.map((key) => {
    const source = resourceRegistry[key];
    return {
      key,
      label: t(source.labelKey),
      panelTypes: availablePanelTypes(key, { gridEnabled }),
      filter:
        source.kind === 'sessionNodes'
          ? {
              kind: 'minilang',
              properties: source.getStringFilterProperties?.(t) ?? [],
            }
          : {
              kind: 'graphql',
              properties: source.getFilterProperties?.(t) ?? [],
            },
      groupings: CHART_GROUPINGS[key].map((grouping) => ({
        key: grouping.key,
        label: t(grouping.labelKey),
      })),
    };
  });
