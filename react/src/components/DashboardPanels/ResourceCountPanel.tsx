/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import PanelFrame from './PanelFrame';
import type { ResourceTablePanelProps } from './ResourceTablePanel';
import { resolvePanelTitle, resourceRegistry } from './resourceRegistry';
import type { PanelDescriptor } from './types';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAIFlex,
  BAIRowWrapWithDividers,
  BAISkeleton,
  BAIStatistic,
} from 'backend.ai-ui';
import React, { Suspense, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

/**
 * Count stat panel in the same shell and stat layout as the built-in count
 * items (SessionCountDashboardItem): paddingInline XL, title row with a
 * refresh button, left-aligned BAIStatistic rows. Same descriptor, registry and
 * query as the table panel — only the rendered selection differs.
 */
const ResourceCountPanel: React.FC<ResourceTablePanelProps> = ({
  descriptor,
  fetchKey,
  onEdit,
  onRemove,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const title = resolvePanelTitle(descriptor, t);

  return (
    <PanelFrame title={title} onEdit={onEdit} onRemove={onRemove}>
      {(localFetchKey) => (
        <BAIFlex direction="row" wrap="wrap" gap="lg">
          <BAIRowWrapWithDividers
            style={{ paddingBlock: token('--spacing-4') }}
          >
            <Suspense fallback={<BAISkeleton />}>
              <ResourceCountContent
                key={`${descriptor.resourceType}:${JSON.stringify(descriptor.filter ?? null)}`}
                descriptor={descriptor}
                fetchKey={`${fetchKey ?? ''}:${localFetchKey}`}
              />
            </Suspense>
          </BAIRowWrapWithDividers>
        </BAIFlex>
      )}
    </PanelFrame>
  );
};

/** Suspending inner half — also the panel modal's live count preview. */
export const ResourceCountContent: React.FC<{
  descriptor: PanelDescriptor;
  fetchKey?: string;
}> = ({ descriptor, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();
  const config = resourceRegistry[descriptor.resourceType];

  // Offset mode with the minimum page — only `count` is consumed.
  const variables = config.buildVariables({
    filter: descriptor.filter ?? undefined,
    order: descriptor.order ?? config.defaultOrder,
    limit: 1,
    offset: 0,
    projectId: currentProject.id ?? '',
  });
  const deferredVariables = useDeferredValue(variables);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const data = useLazyLoadQuery(config.query, deferredVariables, {
    fetchPolicy: 'store-and-network',
    fetchKey: deferredFetchKey,
  });
  const connection = config.selectConnection(data);

  // Sub-label = resource label, like the built-in count rows
  // (Interactive/Batch/... under the panel title).
  return (
    <BAIStatistic
      title={t(config.labelKey)}
      current={connection?.count ?? 0}
      progressMode="hidden"
    />
  );
};

export default ResourceCountPanel;
