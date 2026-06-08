/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { dashboardEditModeAtom } from '../dashboardEditModeAtom';
import { resourceRegistry } from './resourceRegistry';
import type { PanelDescriptor } from './types';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Empty, Skeleton } from 'antd';
import {
  BAIBoardItemTitle,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAITable,
} from 'backend.ai-ui';
import { useAtomValue } from 'jotai';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

export interface ResourceTablePanelProps {
  descriptor: PanelDescriptor;
  /** Called when the user edits the panel's filter or sort order. */
  onChange?: (next: PanelDescriptor) => void;
  /** Called when the user removes the panel from the board. */
  onRemove?: () => void;
}

/**
 * The single generic executor for every table panel. It reads the resource's
 * config from {@link resourceRegistry}, uses `BAIBoardItemTitle` for the header
 * (the board-panel convention that clears the drag handle), keeps the property
 * filter always visible, and suspends only the data table — so changing the
 * filter or paging never hides the controls (the deferred-variables pattern keeps
 * stale rows on screen while the next page loads).
 */
const ResourceTablePanel: React.FC<ResourceTablePanelProps> = ({
  descriptor,
  onChange,
  onRemove,
}) => {
  'use memo';
  const { t } = useTranslation();
  const editMode = useAtomValue(dashboardEditModeAtom);
  const config = resourceRegistry[descriptor.resourceType];
  const title =
    descriptor.title ?? (config ? t(config.labelKey) : descriptor.resourceType);
  // Per-panel edit affordances (the remove X) appear only while the board is in
  // edit mode; when locked the panel shows no controls.
  const removeButton =
    editMode && onRemove ? (
      <Button
        type="text"
        size="small"
        icon={<CloseOutlined />}
        onClick={onRemove}
        aria-label={t('button.Close')}
      />
    ) : null;

  if (!config) {
    return (
      <BAIFlex direction="column" align="stretch" style={{ height: '100%' }}>
        <BAIBoardItemTitle title={title} extra={removeButton} />
        <Empty description={t('error.UnknownError')} />
      </BAIFlex>
    );
  }

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="sm"
      style={{ height: '100%' }}
    >
      <BAIBoardItemTitle title={title} extra={removeButton} />
      <BAIGraphQLPropertyFilter
        style={{ flex: 1 }}
        filterProperties={[...config.getFilterProperties(t)]}
        value={descriptor.filter ?? undefined}
        onChange={(value) => {
          onChange?.({ ...descriptor, filter: value ?? null });
        }}
      />
      <Suspense fallback={<Skeleton active />}>
        <ResourceTableContent descriptor={descriptor} onChange={onChange} />
      </Suspense>
    </BAIFlex>
  );
};

/**
 * Suspending inner half: runs the per-resource query and renders the table.
 * Exported so the "Add panel" modal can reuse it as a live results preview.
 */
export const ResourceTableContent: React.FC<{
  descriptor: PanelDescriptor;
  onChange?: (next: PanelDescriptor) => void;
}> = ({ descriptor, onChange }) => {
  'use memo';
  const { t } = useTranslation();
  const config = resourceRegistry[descriptor.resourceType];
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const order = descriptor.order ?? config.defaultOrder;
  const variables = config.buildVariables({
    filter: descriptor.filter ?? undefined,
    order,
    limit: pagination.pageSize,
    offset: (pagination.current - 1) * pagination.pageSize,
  });
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery(config.query, deferredVariables, {
    fetchPolicy: 'store-and-network',
  });
  const connection = config.selectConnection(data);
  const isLoading = deferredVariables !== variables;

  return (
    <BAITable
      rowKey="id"
      columns={config.getColumns(t)}
      dataSource={[...(connection?.nodes ?? [])]}
      loading={isLoading}
      order={order}
      onChangeOrder={(nextOrder) => {
        onChange?.({ ...descriptor, order: nextOrder ?? null });
      }}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: connection?.count ?? 0,
        onChange: (current, pageSize) => setPagination({ current, pageSize }),
      }}
    />
  );
};

export default ResourceTablePanel;
