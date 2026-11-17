/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { resourceRegistryAuditLogQuery } from '../../__generated__/resourceRegistryAuditLogQuery.graphql';
import { rbacTypeLabel } from '../../helper/rbacElementTypes';
import { useBAIPaginationOptionState } from '../../hooks/reactPaginationQueryOptions';
import { isClusterAuditScope } from './cards/AuditLogPanel';
import { chartTableFilter } from './chartSources';
import { readPrimary } from './panelPermission';
import { auditLogClusterQuery, resourceRegistry } from './resourceRegistry';
import type { PanelDescriptor } from './types';
import { useAuditLogQueryScope } from './useAuditLogQueryScope';
import { useDashboardQueryScope } from './useDashboardFilters';
import { useResetPageOn } from './useResetPageOn';
import { BAIAuditLogNodes, filterOutNullAndUndefined } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

const PANEL_COLUMN_KEYS = [
  'createdAt',
  'actionName',
  'status',
  'description',
  'triggeredBy',
  'entityType',
];

/** Audit log panel content: the detail pages' {@link BAIAuditLogNodes} table over the page's audit log scope. */
export const AuditLogNodesPanelContent: React.FC<{
  descriptor: PanelDescriptor;
  fetchKey?: string;
  onChangeOrder?: (nextOrder?: string) => void;
}> = ({ descriptor, fetchKey, onChangeOrder }) => {
  'use memo';
  const { t } = useTranslation();
  const queryScope = useDashboardQueryScope();
  const auditScope = useAuditLogQueryScope('auditLog');
  const config = resourceRegistry.auditLog;
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 10 });
  useResetPageOn(
    [descriptor.filter, descriptor.range, queryScope],
    setTablePaginationOption,
  );

  const variables = config.buildVariables({
    filter:
      chartTableFilter(
        descriptor.resourceType,
        descriptor.filter,
        descriptor.tableWindow ?? null,
      ) ?? undefined,
    order: descriptor.order ?? config.defaultOrder,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    ...queryScope,
    auditScope,
  });
  const deferredVariables = useDeferredValue(variables);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const data = useLazyLoadQuery<resourceRegistryAuditLogQuery>(
    isClusterAuditScope(auditScope) ? auditLogClusterQuery : config.query,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey: deferredFetchKey },
  );
  const connection = readPrimary(data.scopedAuditLogsV2);
  const logs = filterOutNullAndUndefined(connection?.edges.map((e) => e?.node));

  return (
    <BAIAuditLogNodes
      auditLogFrgmt={logs}
      size="small"
      order={descriptor.order ?? undefined}
      disableSorter={!onChangeOrder}
      onChangeOrder={
        onChangeOrder ? (next) => onChangeOrder(next ?? undefined) : undefined
      }
      loading={deferredVariables !== variables || deferredFetchKey !== fetchKey}
      // Entity types read as the built-in audit log card shows them.
      customizeColumns={(base) =>
        base
          .filter((column) => PANEL_COLUMN_KEYS.includes(String(column.key)))
          .map((column) =>
            column.key === 'entityType'
              ? {
                  ...column,
                  defaultHidden: false,
                  render: (
                    _value: unknown,
                    record: { entityType?: string | null },
                  ) =>
                    record.entityType
                      ? rbacTypeLabel(t, record.entityType)
                      : '-',
                }
              : { ...column, defaultHidden: false },
          )
      }
      pagination={{
        pageSize: tablePaginationOption.pageSize,
        current: tablePaginationOption.current,
        total: connection?.count ?? 0,
        onChange: (current: number, pageSize: number) => {
          setTablePaginationOption({ current, pageSize });
        },
      }}
    />
  );
};

export default AuditLogNodesPanelContent;
