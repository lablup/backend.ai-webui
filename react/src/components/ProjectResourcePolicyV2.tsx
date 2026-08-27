/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProjectResourcePolicyV2Mutation } from '../__generated__/ProjectResourcePolicyV2Mutation.graphql';
import type {
  ProjectResourcePolicyV2OrderBy,
  ProjectResourcePolicyV2Query as ProjectResourcePolicyV2QueryType,
} from '../__generated__/ProjectResourcePolicyV2Query.graphql';
import { App } from '../app-shim';
import { convertToOrderBy } from '../helper';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import ProjectResourcePolicyV2SettingModal from './ProjectResourcePolicyV2SettingModal';
import {
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAIProjectResourcePolicyV2Table,
  type BAIProjectResourcePolicyV2TableProps,
  filterOutNullAndUndefined,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Trash2, PlusIcon, SquarePenIcon } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
  useMutation,
} from 'react-relay';

export const ProjectResourcePolicyV2Query = graphql`
  query ProjectResourcePolicyV2Query(
    $filter: ProjectResourcePolicyV2Filter
    $orderBy: [ProjectResourcePolicyV2OrderBy!]
    $limit: Int
    $offset: Int
  ) {
    adminProjectResourcePoliciesV2(
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
          ...BAIProjectResourcePolicyV2TableFragment
          ...ProjectResourcePolicyV2SettingModalFragment
        }
      }
    }
  }
`;

type ProjectResourcePolicyV2Node = NonNullable<
  NonNullable<
    NonNullable<
      ProjectResourcePolicyV2QueryType['response']['adminProjectResourcePoliciesV2']
    >['edges'][number]
  >['node']
>;

export interface ProjectResourcePolicyV2Props extends Omit<
  BAIProjectResourcePolicyV2TableProps,
  | 'projectResourcePoliciesFrgmt'
  | 'loading'
  | 'order'
  | 'onChangeOrder'
  | 'dataSource'
  | 'pagination'
  | 'customizeColumns'
> {
  queryRef: PreloadedQuery<ProjectResourcePolicyV2QueryType>;
  onReload: (
    variables: ProjectResourcePolicyV2QueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
}

const ProjectResourcePolicyV2 = ({
  queryRef,
  onReload,
  ...tableProps
}: ProjectResourcePolicyV2Props) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [fetchKey, updateFetchKey] = useFetchKey();

  const [isCreatingPolicySetting, setIsCreatingPolicySetting] = useState(false);
  const [editingProjectResourcePolicy, setEditingProjectResourcePolicy] =
    useState<ProjectResourcePolicyV2Node | null>(null);
  const [deletingPolicyName, setDeletingPolicyName] = useState<string | null>(
    null,
  );

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.ProjectResourcePolicyV2',
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

  const data = usePreloadedQuery<ProjectResourcePolicyV2QueryType>(
    ProjectResourcePolicyV2Query,
    deferredQueryRef,
  );

  const [commitDelete] = useMutation<ProjectResourcePolicyV2Mutation>(graphql`
    mutation ProjectResourcePolicyV2Mutation($name: String!) {
      adminDeleteProjectResourcePolicyV2(name: $name) {
        name
      }
    }
  `);

  const projectResourcePolicies = filterOutNullAndUndefined(
    (data.adminProjectResourcePoliciesV2?.edges ?? []).map(
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
              key: 'maxVfolderCount',
              propertyLabel: t('resourcePolicy.MaxVFolderCount'),
              type: 'number',
              defaultOperator: 'greaterThanOrEqual',
            },
            {
              // The node field is a BinarySizeInfo, but the filter input is a
              // plain IntFilter — the typed value is a raw byte count.
              key: 'maxQuotaScopeSize',
              propertyLabel: t('storageHost.MaxFolderSize'),
              type: 'number',
              defaultOperator: 'greaterThanOrEqual',
            },
            {
              key: 'maxNetworkCount',
              propertyLabel: t('resourcePolicy.MaxNetworkCount'),
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
      <BAIProjectResourcePolicyV2Table
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
                convertToOrderBy<ProjectResourcePolicyV2OrderBy>(nextOrder),
              offset: 0,
            },
            { fetchPolicy: 'network-only' },
          );
        }}
        pagination={{
          pageSize,
          current,
          total: data.adminProjectResourcePoliciesV2?.count ?? 0,
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
                            setEditingProjectResourcePolicy(
                              _.find(projectResourcePolicies, {
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
        projectResourcePoliciesFrgmt={projectResourcePolicies}
        {...tableProps}
      />
      <ProjectResourcePolicyV2SettingModal
        open={!!editingProjectResourcePolicy || isCreatingPolicySetting}
        projectResourcePolicyFrgmt={editingProjectResourcePolicy}
        onOk={() => {
          // A create adds a new row the offset query can't know about, so it
          // needs a refetch. An update returns every field, so Relay merges the
          // record by id into the store and the list reflects it without one.
          if (isCreatingPolicySetting) {
            onReload(queryRef.variables, { fetchPolicy: 'network-only' });
          }
          setEditingProjectResourcePolicy(null);
          setIsCreatingPolicySetting(false);
        }}
        onCancel={() => {
          setEditingProjectResourcePolicy(null);
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

export default ProjectResourcePolicyV2;
