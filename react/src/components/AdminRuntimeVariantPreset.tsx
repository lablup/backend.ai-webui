/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminRuntimeVariantPresetDeleteMutation } from '../__generated__/AdminRuntimeVariantPresetDeleteMutation.graphql';
import type {
  AdminRuntimeVariantPresetQuery as AdminRuntimeVariantPresetQueryType,
  RuntimeVariantPresetFilter,
  RuntimeVariantPresetOrderBy,
} from '../__generated__/AdminRuntimeVariantPresetQuery.graphql';
import { convertOrderByToString, convertToOrderBy } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { DeleteFilled, SettingOutlined } from '@ant-design/icons';
import { App } from 'antd';
import {
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAIRuntimeVariantPresetTable,
  BAIRuntimeVariantPresetSettingModal,
  type RuntimeVariantPresetNodeInList,
  type BAITableSettings,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  isValidUUID,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

export const AdminRuntimeVariantPresetQuery = graphql`
  query AdminRuntimeVariantPresetQuery(
    $filter: RuntimeVariantPresetFilter
    $orderBy: [RuntimeVariantPresetOrderBy!]
    $limit: Int
    $offset: Int
  ) {
    runtimeVariantPresets(
      filter: $filter
      orderBy: $orderBy
      limit: $limit
      offset: $offset
    ) {
      count
      edges {
        node {
          id
          ...BAIRuntimeVariantPresetTableFragment
          ...BAIRuntimeVariantPresetSettingModalFragment
        }
      }
    }
  }
`;

// Host preset node — carries both fragment refs. It is a valid
// `BAIRuntimeVariantPresetSettingModalFragment$key`, so it can be passed
// straight to the edit modal.
type RuntimeVariantPresetHostNode = NonNullable<
  AdminRuntimeVariantPresetQueryType['response']['runtimeVariantPresets']
>['edges'][number]['node'];

export interface AdminRuntimeVariantPresetProps {
  /** Preloaded query reference produced by the opener via `useQueryLoader`. */
  queryRef: PreloadedQuery<AdminRuntimeVariantPresetQueryType>;
  /**
   * Re-runs the query with new variables. The opener owns
   * `useQueryLoader`'s `loadQuery`, so the opener can pass it directly.
   */
  onReload: (
    variables: AdminRuntimeVariantPresetQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
  tableSettings: BAITableSettings;
}

/**
 * Reads a preloaded `runtimeVariantPresets` query (the
 * `DeploymentSchedulingHistoryModal`/`UserResourcePolicyV2` idiom). The opener
 * (`AdminDeploymentPage`) owns `useQueryLoader` / `loadQuery` plus the
 * URL-persisted filter/order/pagination state, so the query ref — and the
 * already-fetched rows — survive this tab unmounting on a tab switch; only a
 * full page reload resets it. This view reads the *deferred* `queryRef` via
 * `usePreloadedQuery` and re-runs filter / sort / refresh / paging through
 * `onReload`.
 */
const AdminRuntimeVariantPreset = ({
  queryRef,
  onReload,
  tableSettings,
}: AdminRuntimeVariantPresetProps) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const baiClient = useSuspendedBackendaiClient();
  // AND/OR/NOT sub-filters only exist on managers with the `sub-filter`
  // capability (Strawberry V2). On older managers, restrict the property
  // filter to a single condition so it emits a flat filter the backend accepts.
  const supportsSubFilter = baiClient.supports('sub-filter');

  const [deletingPreset, setDeletingPreset] =
    useState<RuntimeVariantPresetNodeInList | null>(null);
  const [editingPreset, setEditingPreset] =
    useState<RuntimeVariantPresetHostNode | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filter = queryRef.variables.filter ?? undefined;
  const order = convertOrderByToString(queryRef.variables.orderBy);
  const pageSize = queryRef.variables.limit ?? 10;
  const offset = queryRef.variables.offset ?? 0;
  const current = pageSize ? Math.floor(offset / pageSize) + 1 : 1;

  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetching = deferredQueryRef !== queryRef;

  const { runtimeVariantPresets } =
    usePreloadedQuery<AdminRuntimeVariantPresetQueryType>(
      AdminRuntimeVariantPresetQuery,
      deferredQueryRef,
    );

  const presetHostNodes = filterOutNullAndUndefined(
    _.map(runtimeVariantPresets?.edges, 'node'),
  );

  const [commitDeletePreset] =
    useMutation<AdminRuntimeVariantPresetDeleteMutation>(graphql`
      mutation AdminRuntimeVariantPresetDeleteMutation($id: UUID!) {
        adminDeleteRuntimeVariantPreset(id: $id) {
          id
        }
      }
    `);

  const uuidRule = {
    message: t('general.InvalidUUID'),
    validate: (value: string) => isValidUUID(value.toLowerCase()),
  };

  return (
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
      <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
        <BAIFlex gap={'sm'} align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIGraphQLPropertyFilter<RuntimeVariantPresetFilter>
            singleCondition={!supportsSubFilter}
            filterProperties={[
              {
                key: 'name',
                propertyLabel: t('adminRuntimeVariantPreset.Name'),
                type: 'string',
              },
              {
                key: 'runtimeVariantId',
                propertyLabel: t('adminRuntimeVariantPreset.RuntimeVariantId'),
                type: 'uuid',
                fixedOperator: 'equals',
                rule: uuidRule,
              },
            ]}
            value={filter}
            onChange={(next) => {
              onReload(
                { ...queryRef.variables, filter: next ?? undefined, offset: 0 },
                { fetchPolicy: 'network-only' },
              );
            }}
          />
        </BAIFlex>
        <BAIFlex gap={'xs'} align="center">
          <BAIFetchKeyButton
            loading={isRefetching}
            onChange={() =>
              onReload(queryRef.variables, { fetchPolicy: 'network-only' })
            }
          />
          <BAIButton
            type="primary"
            onClick={() => setIsCreating(true)}
            icon={<PlusIcon />}
          >
            {t('adminRuntimeVariantPreset.CreatePreset')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      <BAIRuntimeVariantPresetTable
        presetsFrgmt={presetHostNodes}
        loading={isRefetching}
        order={order}
        tableSettings={tableSettings}
        pagination={{
          pageSize,
          current,
          total: runtimeVariantPresets?.count ?? 0,
          onChange: (nextCurrent, nextPageSize) =>
            onReload(
              {
                ...queryRef.variables,
                limit: nextPageSize,
                offset: nextCurrent > 1 ? (nextCurrent - 1) * nextPageSize : 0,
              },
              { fetchPolicy: 'network-only' },
            ),
        }}
        onChangeOrder={(nextOrder) => {
          onReload(
            {
              ...queryRef.variables,
              orderBy: convertToOrderBy<RuntimeVariantPresetOrderBy>(
                nextOrder ?? undefined,
              ),
              offset: 0,
            },
            { fetchPolicy: 'network-only' },
          );
        }}
        customizeColumns={(base) =>
          base.map((column) =>
            column.key === 'name'
              ? {
                  ...column,
                  render: (
                    name: string,
                    record: RuntimeVariantPresetNodeInList,
                  ) => (
                    <BAINameActionCell
                      title={name}
                      showActions="always"
                      actions={[
                        {
                          key: 'edit',
                          title: t('button.Edit'),
                          icon: <SettingOutlined />,
                          onClick: () => {
                            const host = presetHostNodes.find(
                              (node) => node.id === record.id,
                            );
                            if (host) {
                              setEditingPreset(host);
                            }
                          },
                        },
                        {
                          key: 'delete',
                          title: t('button.Delete'),
                          icon: <DeleteFilled />,
                          type: 'danger',
                          onClick: () => setDeletingPreset(record),
                        },
                      ]}
                    />
                  ),
                }
              : column,
          )
        }
      />
      <BAIDeleteConfirmModal
        open={!!deletingPreset}
        target={t('adminRuntimeVariantPreset.RuntimeVariantPreset')}
        requireConfirmInput
        items={
          deletingPreset
            ? [{ key: deletingPreset.id, label: deletingPreset.name }]
            : []
        }
        onOk={() => {
          if (!deletingPreset) return;
          commitDeletePreset({
            variables: { id: toLocalId(deletingPreset.id) },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                logger.error(errors[0]);
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                return;
              }
              message.success(t('adminRuntimeVariantPreset.PresetDeleted'));
              setDeletingPreset(null);
              onReload(queryRef.variables, { fetchPolicy: 'network-only' });
            },
            onError: (error) => {
              logger.error(error);
              message.error(error?.message || t('general.ErrorOccurred'));
            },
          });
        }}
        onCancel={() => setDeletingPreset(null)}
      />
      <BAIUnmountAfterClose>
        <BAIRuntimeVariantPresetSettingModal
          open={isCreating || !!editingPreset}
          presetFrgmt={editingPreset}
          onRequestClose={(success) => {
            setIsCreating(false);
            setEditingPreset(null);
            if (success) {
              onReload(queryRef.variables, { fetchPolicy: 'network-only' });
            }
          }}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default AdminRuntimeVariantPreset;
