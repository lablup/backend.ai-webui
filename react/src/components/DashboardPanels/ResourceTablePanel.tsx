/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAIPaginationOptionState } from '../../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { theme } from '../../theme-shim';
import { DeploymentNodesPanelContent } from './DeploymentNodesPanel';
import PanelEditControls from './PanelEditControls';
import { SessionNodesPanelContent } from './SessionNodesPanel';
import { resolvePanelTitle, resourceRegistry } from './resourceRegistry';
import type { PanelDescriptor } from './types';
import {
  BAIBoardItemTitle,
  BAIFetchKeyButton,
  BAIFlex,
  BAISkeleton,
  BAITable,
  useFetchKey,
} from 'backend.ai-ui';
import React, { Suspense, useDeferredValue, useTransition } from 'react';
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
}

/**
 * The generic executor for every table panel: title + table, in the SAME shell
 * as the built-in board items (paddingInline XL, title row with a refresh
 * button, scrollable content). The condition lives in the descriptor and is
 * expressed through the TITLE; it is edited only via the panel modal (edit
 * mode), never inline — so a locked board can be explored (pagination) without
 * ever mutating panel config.
 */
const ResourceTablePanel: React.FC<ResourceTablePanelProps> = ({
  descriptor,
  fetchKey,
  onEdit,
  onRemove,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const title = resolvePanelTitle(descriptor, t);
  const [localFetchKey, updateLocalFetchKey] = useFetchKey();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{ paddingInline: token.paddingXL, height: '100%' }}
    >
      <BAIBoardItemTitle
        title={title}
        extra={
          <BAIFlex align="center" gap="xxs">
            <BAIFetchKeyButton
              size="small"
              loading={isPendingRefetch}
              value=""
              onChange={() => {
                startRefetchTransition(() => {
                  updateLocalFetchKey();
                });
              }}
              type="text"
              style={{ backgroundColor: 'transparent' }}
            />
            <PanelEditControls
              title={title}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          </BAIFlex>
        }
      />
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          marginBottom: token.margin,
        }}
      >
        <Suspense fallback={<BAISkeleton />}>
          {/* Keyed by the query-shaping config so a descriptor edit (filter/order)
              resets pagination AND retries out of a stuck error state. */}
          {resourceRegistry[descriptor.resourceType]?.kind ===
          'deploymentNodes' ? (
            <DeploymentNodesPanelContent
              key={`${descriptor.resourceType}:${JSON.stringify(descriptor.filter ?? null)}:${descriptor.order ?? ''}`}
              descriptor={descriptor}
              fetchKey={`${fetchKey ?? ''}:${localFetchKey}`}
            />
          ) : resourceRegistry[descriptor.resourceType]?.kind ===
            'sessionNodes' ? (
            <SessionNodesPanelContent
              key={`${descriptor.resourceType}:${JSON.stringify(descriptor.filter ?? null)}:${descriptor.order ?? ''}`}
              descriptor={descriptor}
              fetchKey={`${fetchKey ?? ''}:${localFetchKey}`}
            />
          ) : (
            <ResourceTableContent
              key={`${descriptor.resourceType}:${JSON.stringify(descriptor.filter ?? null)}:${descriptor.order ?? ''}`}
              descriptor={descriptor}
              fetchKey={`${fetchKey ?? ''}:${localFetchKey}`}
            />
          )}
        </Suspense>
      </BAIFlex>
    </BAIFlex>
  );
};

/**
 * Suspending inner half: runs the per-resource query and renders the table.
 * Reused by the panel modal as the live results preview — there the modal owns
 * `order` interactively via `onChangeOrder`; in a panel the order is fixed by
 * the descriptor and the sort headers are inert (stripped), matching the
 * locked-board read-only contract.
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

  const order = descriptor.order ?? config.defaultOrder;
  const variables = config.buildVariables({
    filter: descriptor.filter ?? undefined,
    order,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    projectId: currentProject.id ?? '',
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
      order={order}
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
