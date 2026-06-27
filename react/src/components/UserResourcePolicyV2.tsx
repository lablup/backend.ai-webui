/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserResourcePolicyV2Mutation } from '../__generated__/UserResourcePolicyV2Mutation.graphql';
import type {
  UserResourcePolicyV2OrderBy,
  UserResourcePolicyV2Query as UserResourcePolicyV2QueryType,
} from '../__generated__/UserResourcePolicyV2Query.graphql';
import { convertToOrderBy } from '../helper';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import UserResourcePolicyV2SettingModal from './UserResourcePolicyV2SettingModal';
import UserResourcePolicyV2Table, {
  type UserResourcePolicyV2TableProps,
} from './UserResourcePolicyV2Table';
import { DeleteFilled, SettingOutlined } from '@ant-design/icons';
import { App } from 'antd';
import {
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  filterOutNullAndUndefined,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
  useMutation,
} from 'react-relay';

export const UserResourcePolicyV2Query = graphql`
  query UserResourcePolicyV2Query(
    $filter: UserResourcePolicyV2Filter
    $orderBy: [UserResourcePolicyV2OrderBy!]
    $limit: Int
    $offset: Int
  ) {
    adminUserResourcePoliciesV2(
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
          ...UserResourcePolicyV2TableFragment
          ...UserResourcePolicyV2SettingModalFragment
        }
      }
    }
  }
`;

type UserResourcePolicyV2Node = NonNullable<
  NonNullable<
    NonNullable<
      UserResourcePolicyV2QueryType['response']['adminUserResourcePoliciesV2']
    >['edges'][number]
  >['node']
>;

export interface UserResourcePolicyV2Props extends Omit<
  UserResourcePolicyV2TableProps,
  | 'userResourcePoliciesFrgmt'
  | 'loading'
  | 'order'
  | 'onChangeOrder'
  | 'dataSource'
  | 'pagination'
  | 'customizeColumns'
> {
  queryRef: PreloadedQuery<UserResourcePolicyV2QueryType>;
  onReload: (
    variables: UserResourcePolicyV2QueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
}

const UserResourcePolicyV2 = ({
  queryRef,
  onReload,
  ...tableProps
}: UserResourcePolicyV2Props) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [fetchKey, updateFetchKey] = useFetchKey();

  const [isCreatingPolicySetting, setIsCreatingPolicySetting] = useState(false);
  const [editingUserResourcePolicy, setEditingUserResourcePolicy] =
    useState<UserResourcePolicyV2Node | null>(null);
  const [deletingPolicyName, setDeletingPolicyName] = useState<string | null>(
    null,
  );

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.UserResourcePolicyV2',
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

  const data = usePreloadedQuery<UserResourcePolicyV2QueryType>(
    UserResourcePolicyV2Query,
    deferredQueryRef,
  );

  const [commitDelete] = useMutation<UserResourcePolicyV2Mutation>(graphql`
    mutation UserResourcePolicyV2Mutation($name: String!) {
      adminDeleteUserResourcePolicyV2(name: $name) {
        name
      }
    }
  `);

  const userResourcePolicies = filterOutNullAndUndefined(
    (data.adminUserResourcePoliciesV2?.edges ?? []).map((edge) => edge?.node),
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
              key: 'maxVfolderCount',
              propertyLabel: t('resourcePolicy.MaxVFolderCount'),
              type: 'number',
              defaultOperator: 'greaterThanOrEqual',
            },
            {
              key: 'maxConcurrentLogins',
              propertyLabel: t('resourcePolicy.MaxConcurrentLogins'),
              type: 'number',
              defaultOperator: 'greaterThanOrEqual',
            },
            {
              key: 'maxSessionCountPerModelSession',
              propertyLabel: t('resourcePolicy.MaxSessionCountPerModelSession'),
              type: 'number',
              defaultOperator: 'greaterThanOrEqual',
            },
            {
              key: 'maxCustomizedImageCount',
              propertyLabel: t('resourcePolicy.MaxCustomizedImageCount'),
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
      <UserResourcePolicyV2Table
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
              orderBy: convertToOrderBy<UserResourcePolicyV2OrderBy>(nextOrder),
              offset: 0,
            },
            { fetchPolicy: 'network-only' },
          );
        }}
        pagination={{
          pageSize,
          current,
          total: data.adminUserResourcePoliciesV2?.count ?? 0,
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
                          key: 'settings',
                          title: t('button.Settings'),
                          icon: <SettingOutlined />,
                          onClick: () => {
                            setEditingUserResourcePolicy(
                              _.find(userResourcePolicies, {
                                id: record.id,
                              }) ?? null,
                            );
                          },
                        },
                        {
                          key: 'delete',
                          title: t('button.Delete'),
                          icon: <DeleteFilled />,
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
        userResourcePoliciesFrgmt={userResourcePolicies}
        {...tableProps}
      />
      <UserResourcePolicyV2SettingModal
        open={!!editingUserResourcePolicy || isCreatingPolicySetting}
        userResourcePolicyFrgmt={editingUserResourcePolicy}
        onOk={() => {
          // A create adds a new row the offset query can't know about, so it
          // needs a refetch. An update returns every field, so Relay merges the
          // record by id into the store and the list reflects it without one.
          if (isCreatingPolicySetting) {
            onReload(queryRef.variables, { fetchPolicy: 'network-only' });
          }
          setEditingUserResourcePolicy(null);
          setIsCreatingPolicySetting(false);
        }}
        onCancel={() => {
          setEditingUserResourcePolicy(null);
          setIsCreatingPolicySetting(false);
        }}
      />
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

export default UserResourcePolicyV2;
