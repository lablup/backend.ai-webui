/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAIPaginationOptionState } from '../../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { DeploymentNodesPanelContent } from './DeploymentNodesPanel';
import PanelFrame from './PanelFrame';
import { SessionNodesPanelContent } from './SessionNodesPanel';
import { resolvePanelTitle, resourceRegistry } from './resourceRegistry';
import type { PanelDescriptor } from './types';
import { BAISkeleton, BAITable } from 'backend.ai-ui';
import { atom, useAtom } from 'jotai';
import React, { Suspense, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

export interface ResourceTablePanelProps {
  descriptor: PanelDescriptor;
  /** Page refetch key — custom panels join the dashboard's refresh cycle. */
  fetchKey?: string;
  /** Opens the panel modal pre-filled with this panel (edit mode only). */
  onEdit?: () => void;
  /** Removes the panel from the board (edit mode only). */
  onRemove?: () => void;
  /** The board panel's id; keys its temporary header sort. */
  panelId?: string;
}

// Temporary header sorts per board panel, in memory: a refresh keeps them; leaving
// or reloading the page returns to the order set in edit mode.
export const boardSortsAtom = atom<
  Record<string, { saved: string | null | undefined; order: string | null }>
>({});

/**
 * The generic executor for every table panel: title + table, in the SAME shell
 * as the built-in board items (paddingInline XL, title row with a refresh
 * button, scrollable content). The condition lives in the descriptor and is
 * expressed through the TITLE; it is edited only via the panel modal (edit
 * mode); a header sort on the board is temporary and never saved.
 */
const ResourceTablePanel: React.FC<ResourceTablePanelProps> = ({
  descriptor,
  fetchKey,
  onEdit,
  onRemove,
  panelId,
}) => {
  'use memo';
  const { t } = useTranslation();
  const title = resolvePanelTitle(descriptor, t);
  const [boardSorts, setBoardSorts] = useAtom(boardSortsAtom);
  const sortKey = panelId ?? descriptor.resourceType;
  const boardSort = boardSorts[sortKey];
  // A sort chosen before the saved order changed is dropped.
  const viewDescriptor: PanelDescriptor =
    boardSort && boardSort.saved === descriptor.order
      ? { ...descriptor, order: boardSort.order }
      : descriptor;
  const onChangeOrder = (next?: string) =>
    setBoardSorts((prev) => ({
      ...prev,
      [sortKey]: { saved: descriptor.order, order: next ?? null },
    }));

  return (
    <PanelFrame title={title} onEdit={onEdit} onRemove={onRemove}>
      <Suspense fallback={<BAISkeleton />}>
        {/* Keyed by the query-shaping config so a descriptor edit (filter/order)
              resets pagination AND retries out of a stuck error state. */}
        {resourceRegistry[viewDescriptor.resourceType]?.kind ===
        'deploymentNodes' ? (
          <DeploymentNodesPanelContent
            key={`${viewDescriptor.resourceType}:${JSON.stringify(viewDescriptor.filter ?? null)}:${viewDescriptor.order ?? ''}`}
            descriptor={viewDescriptor}
            onChangeOrder={onChangeOrder}
            fetchKey={fetchKey}
          />
        ) : resourceRegistry[viewDescriptor.resourceType]?.kind ===
          'sessionNodes' ? (
          <SessionNodesPanelContent
            key={`${viewDescriptor.resourceType}:${JSON.stringify(viewDescriptor.filter ?? null)}:${viewDescriptor.order ?? ''}`}
            descriptor={viewDescriptor}
            onChangeOrder={onChangeOrder}
            fetchKey={fetchKey}
          />
        ) : (
          <ResourceTableContent
            key={`${viewDescriptor.resourceType}:${JSON.stringify(viewDescriptor.filter ?? null)}:${viewDescriptor.order ?? ''}`}
            descriptor={viewDescriptor}
            onChangeOrder={onChangeOrder}
            fetchKey={fetchKey}
          />
        )}
      </Suspense>
    </PanelFrame>
  );
};

/**
 * Suspending inner half: runs the per-resource query and renders the table.
 * Reused by the panel modal as the live results preview — there the modal owns
 * `order` via `onChangeOrder` and saves it; on the board the sort is temporary.
 */
export const ResourceTableContent: React.FC<{
  descriptor: PanelDescriptor;
  fetchKey?: string;
  onChangeOrder?: (nextOrder?: string) => void;
}> = ({ descriptor, fetchKey, onChangeOrder }) => {
  'use memo';
  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();
  const config = resourceRegistry[descriptor.resourceType];
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 10 });

  // The query falls back to the default order; the table shows only a chosen one,
  // so its sort cycle can reach ascending instead of snapping back to the default.
  const order = descriptor.order ?? config.defaultOrder;
  const variables = config.buildVariables({
    filter: descriptor.filter ?? undefined,
    order,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    projectId: currentProject.id ?? '',
    resourceGroups: descriptor.resourceGroups,
  });
  const deferredVariables = useDeferredValue(variables);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const data = useLazyLoadQuery(config.query, deferredVariables, {
    fetchPolicy: 'store-and-network',
    fetchKey: deferredFetchKey,
  });
  const connection = config.selectConnection(data);
  const isLoading =
    deferredVariables !== variables || deferredFetchKey !== fetchKey;

  const columns = config.getColumns?.(t) ?? [];
  return (
    <BAITable
      rowKey="id"
      columns={
        onChangeOrder
          ? [...columns]
          : columns.map((column) => ({ ...column, sorter: false }))
      }
      dataSource={[...(connection?.nodes ?? [])]}
      loading={isLoading}
      order={descriptor.order ?? undefined}
      onChangeOrder={onChangeOrder}
      pagination={{
        current: tablePaginationOption.current,
        pageSize: tablePaginationOption.pageSize,
        total: connection?.count ?? 0,
        onChange: (current: number, pageSize: number) =>
          setTablePaginationOption({ current, pageSize }),
      }}
    />
  );
};

export default ResourceTablePanel;
