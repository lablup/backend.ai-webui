/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { KeypairResourcePolicyV2Mutation } from '../__generated__/KeypairResourcePolicyV2Mutation.graphql';
import type {
  KeypairResourcePolicyV2OrderBy,
  KeypairResourcePolicyV2Query as KeypairResourcePolicyV2QueryType,
} from '../__generated__/KeypairResourcePolicyV2Query.graphql';
import { App } from '../app-shim';
import { convertToOrderBy } from '../helper';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import KeypairResourcePolicyV2SettingModal from './KeypairResourcePolicyV2SettingModal';
import {
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIKeypairResourcePolicyV2Table,
  type BAIKeypairResourcePolicyV2TableProps,
  BAINameActionCell,
  filterOutNullAndUndefined,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Trash2, PlusIcon, SquarePenIcon } from 'lucide-react';
import { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
  useMutation,
} from 'react-relay';

export const KeypairResourcePolicyV2Query = graphql`
  query KeypairResourcePolicyV2Query(
    $filter: KeypairResourcePolicyV2Filter
    $orderBy: [KeypairResourcePolicyV2OrderBy!]
    $limit: Int
    $offset: Int
  ) {
    adminKeypairResourcePoliciesV2(
      filter: $filter
      orderBy: $orderBy
      limit: $limit
      offset: $offset
    ) {
      count
      edges {
        node {
          id
          name
          ...BAIKeypairResourcePolicyV2TableFragment
          ...KeypairResourcePolicyV2SettingModalFragment
        }
      }
    }
  }
`;

type KeypairResourcePolicyV2Node = NonNullable<
  NonNullable<
    NonNullable<
      KeypairResourcePolicyV2QueryType['response']['adminKeypairResourcePoliciesV2']
    >['edges'][number]
  >['node']
>;

export interface KeypairResourcePolicyV2Props extends Omit<
  BAIKeypairResourcePolicyV2TableProps,
  | 'keypairResourcePoliciesFrgmt'
  | 'loading'
  | 'order'
  | 'onChangeOrder'
  | 'dataSource'
  | 'pagination'
  | 'customizeColumns'
> {
  queryRef: PreloadedQuery<KeypairResourcePolicyV2QueryType>;
  onReload: (
    variables: KeypairResourcePolicyV2QueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
}

const KeypairResourcePolicyV2 = ({
  queryRef,
  onReload,
  ...tableProps
}: KeypairResourcePolicyV2Props) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [fetchKey, updateFetchKey] = useFetchKey();

  const [isCreatingPolicySetting, setIsCreatingPolicySetting] = useState(false);
  const [editingKeypairResourcePolicy, setEditingKeypairResourcePolicy] =
    useState<KeypairResourcePolicyV2Node | null>(null);
  const [deletingPolicyName, setDeletingPolicyName] = useState<string | null>(
    null,
  );

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.KeypairResourcePolicyV2',
  );

  const filter = queryRef.variables.filter ?? undefined;
  const orderBy = queryRef.variables.orderBy?.[0];
  const order = orderBy
    ? `${orderBy.direction === 'DESC' ? '-' : ''}${_.camelCase(orderBy.field)}`
    : null;
  const pageSize = queryRef.variables.limit ?? 10;
  const offset = queryRef.variables.offset ?? 0;
  const current = pageSize ? Math.floor(offset / pageSize) + 1 : 1;

  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetching = deferredQueryRef !== queryRef;

  const data = usePreloadedQuery<KeypairResourcePolicyV2QueryType>(
    KeypairResourcePolicyV2Query,
    deferredQueryRef,
  );

  const [commitDelete] = useMutation<KeypairResourcePolicyV2Mutation>(graphql`
    mutation KeypairResourcePolicyV2Mutation($name: String!) {
      adminDeleteKeypairResourcePolicyV2(name: $name) {
        name
      }
    }
  `);

  const keypairResourcePolicies = filterOutNullAndUndefined(
    (data.adminKeypairResourcePoliciesV2?.edges ?? []).map(
      (edge) => edge?.node,
    ),
  );

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify={'between'} wrap="wrap" gap="sm">
        <BAIGraphQLPropertyFilter
          value={filter}
          onChange={(next) => {
            onReload(
              {
                ...queryRef.variables,
                filter: next,
                offset: 0,
              },
              { fetchPolicy: 'network-only' },
            );
          }}
          filterProperties={[
            {
              key: 'name',
              propertyLabel: t('resourcePolicy.Name'),
              type: 'string',
              fixedOperator: 'contains',
            },
            {
              key: 'createdAt',
              propertyLabel: t('resourcePolicy.CreatedAt'),
              type: 'datetime',
              defaultOperator: 'after',
            },
            {
              key: 'maxSessionLifetime',
              propertyLabel: t('session.MaxSessionLifetime'),
              type: 'number',
              defaultOperator: 'greaterThanOrEqual',
            },
            {
              key: 'maxConcurrentSessions',
              propertyLabel: t('resourcePolicy.Concurrency'),
              type: 'number',
              defaultOperator: 'greaterThanOrEqual',
            },
            {
              key: 'maxContainersPerSession',
              propertyLabel: t('resourcePolicy.ClusterSize'),
              type: 'number',
              defaultOperator: 'greaterThanOrEqual',
            },
            {
              key: 'idleTimeout',
              propertyLabel: t('resourcePolicy.IdleTimeout'),
              type: 'number',
              defaultOperator: 'greaterThanOrEqual',
            },
            {
              key: 'maxConcurrentSftpSessions',
              propertyLabel: t('resourcePolicy.MaxConcurrentSFTPSessions'),
              type: 'number',
              defaultOperator: 'greaterThanOrEqual',
            },
            {
              key: 'maxPendingSessionCount',
              propertyLabel: t('resourcePolicy.MaxPendingSessionCount'),
              type: 'number',
              defaultOperator: 'greaterThanOrEqual',
            },
          ]}
        />
        <BAIFlex gap="xs">
          <BAIFetchKeyButton
            value={fetchKey}
            onChange={(key) => {
              updateFetchKey(key);
              onReload(queryRef.variables, { fetchPolicy: 'network-only' });
            }}
            loading={isRefetching}
          />
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            onClick={() => {
              setIsCreatingPolicySetting(true);
            }}
          >
            {t('button.Create')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      <BAIKeypairResourcePolicyV2Table
        loading={isRefetching}
        tableSettings={{
          columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        order={order}
        onChangeOrder={(nextOrder) => {
          onReload(
            {
              ...queryRef.variables,
              orderBy:
                convertToOrderBy<KeypairResourcePolicyV2OrderBy>(nextOrder),
              offset: 0,
            },
            { fetchPolicy: 'network-only' },
          );
        }}
        pagination={{
          pageSize,
          current,
          total: data.adminKeypairResourcePoliciesV2?.count ?? 0,
          onChange: (nextCurrent, nextPageSize) => {
            onReload(
              {
                ...queryRef.variables,
                limit: nextPageSize,
                offset: nextCurrent > 1 ? (nextCurrent - 1) * nextPageSize : 0,
              },
              { fetchPolicy: 'network-only' },
            );
          },
        }}
        customizeColumns={(columns) =>
          _.map(columns, (column) =>
            column.key === 'name'
              ? {
                  ...column,
                  render: (name: string, record) => (
                    <BAINameActionCell
                      title={name}
                      showActions="always"
                      actions={[
                        {
                          key: 'edit',
                          title: t('button.Edit'),
                          icon: <SquarePenIcon />,
                          onClick: () => {
                            setEditingKeypairResourcePolicy(
                              _.find(keypairResourcePolicies, {
                                id: record.id,
                              }) ?? null,
                            );
                          },
                        },
                        {
                          key: 'delete',
                          title: t('button.Delete'),
                          icon: <Trash2 size="1em" />,
                          type: 'danger',
                          onClick: () => {
                            setDeletingPolicyName(record.name);
                          },
                        },
                      ]}
                    />
                  ),
                }
              : column,
          )
        }
        keypairResourcePoliciesFrgmt={keypairResourcePolicies}
        {...tableProps}
      />
      <Suspense>
        <KeypairResourcePolicyV2SettingModal
          open={!!editingKeypairResourcePolicy || isCreatingPolicySetting}
          keypairResourcePolicyFrgmt={editingKeypairResourcePolicy}
          onOk={() => {
            // A create adds a new row the offset query can't know about, so it
            // needs a refetch. An update returns every field, so Relay merges the
            // record by id into the store and the list reflects it without one.
            if (isCreatingPolicySetting) {
              onReload(queryRef.variables, { fetchPolicy: 'network-only' });
            }
            setEditingKeypairResourcePolicy(null);
            setIsCreatingPolicySetting(false);
          }}
          onCancel={() => {
            setEditingKeypairResourcePolicy(null);
            setIsCreatingPolicySetting(false);
          }}
        />
      </Suspense>
      <BAIDeleteConfirmModal
        open={!!deletingPolicyName}
        items={
          deletingPolicyName
            ? [{ key: deletingPolicyName, label: deletingPolicyName }]
            : []
        }
        title={t('resourcePolicy.DeletePolicy')}
        target={t('resourcePolicy.ResourcePolicy')}
        confirmText={deletingPolicyName ?? ''}
        requireConfirmInput
        onOk={() => {
          if (deletingPolicyName) {
            return new Promise<void>((resolve) => {
              commitDelete({
                variables: { name: deletingPolicyName },
                onCompleted: (_res, errors) => {
                  if (errors && errors.length > 0) {
                    for (const error of errors) {
                      message.error(error.message);
                    }
                  } else {
                    onReload(queryRef.variables, {
                      fetchPolicy: 'network-only',
                    });
                    message.success(t('resourcePolicy.ResourcePolicyDeleted'));
                  }
                  setDeletingPolicyName(null);
                  resolve();
                },
                onError(err) {
                  message.error(err?.message);
                  setDeletingPolicyName(null);
                  resolve();
                },
              });
            });
          }
        }}
        onCancel={() => setDeletingPolicyName(null)}
      />
    </BAIFlex>
  );
};

export default KeypairResourcePolicyV2;
