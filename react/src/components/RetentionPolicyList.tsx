/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RetentionPolicyListDeleteMutation } from '../__generated__/RetentionPolicyListDeleteMutation.graphql';
import {
  RetentionPolicyFilter,
  RetentionPolicyListQuery as RetentionPolicyListQueryType,
  RetentionPolicyOrderBy,
} from '../__generated__/RetentionPolicyListQuery.graphql';
import { RetentionPolicyListToggleMutation } from '../__generated__/RetentionPolicyListToggleMutation.graphql';
import { App } from '../app-shim';
import { convertFirstOrderByToString, convertToOrderBy } from '../helper';
import RetentionPolicySettingModal, {
  RETENTION_CATEGORIES,
  useRetentionCategoryLabel,
} from './RetentionPolicySettingModal';
import { Switch } from '@lablup/ui-common/Switch';
import {
  BAIAdminRetentionPolicyTable,
  BAIAlert,
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  type GraphQLFilter,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon, SquarePenIcon, Trash2 } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useMutation,
  usePreloadedQuery,
  type PreloadedQuery,
  type UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

export const RetentionPolicyListQuery = graphql`
  query RetentionPolicyListQuery(
    $filter: RetentionPolicyFilter
    $orderBy: [RetentionPolicyOrderBy!]
    $limit: Int
    $offset: Int
  ) {
    adminRetentionPolicies(
      filter: $filter
      orderBy: $orderBy
      limit: $limit
      offset: $offset
    ) {
      count
      edges {
        node {
          id
          entityId
          category
          ...RetentionPolicySettingModalFragment
          ...BAIAdminRetentionPolicyTableFragment
        }
      }
    }
  }
`;

export const RETENTION_POLICY_LIST_DEFAULT_PAGE_SIZE = 10;

type RetentionPolicyNode = NonNullable<
  NonNullable<
    RetentionPolicyListQueryType['response']['adminRetentionPolicies']
  >['edges'][number]['node']
>;

interface RetentionPolicyListProps {
  queryRef: PreloadedQuery<RetentionPolicyListQueryType>;
  onReload: (
    variables: RetentionPolicyListQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
}

const RetentionPolicyList: React.FC<RetentionPolicyListProps> = ({
  queryRef,
  onReload,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const getCategoryLabel = useRetentionCategoryLabel();

  const variables = queryRef.variables;
  const orderValue = convertFirstOrderByToString(variables.orderBy);
  const pageSize = variables.limit ?? RETENTION_POLICY_LIST_DEFAULT_PAGE_SIZE;
  const current = Math.floor((variables.offset ?? 0) / pageSize) + 1;

  const deferredQueryRef = useDeferredValue(queryRef);
  const isPending = deferredQueryRef !== queryRef;

  const { adminRetentionPolicies } =
    usePreloadedQuery<RetentionPolicyListQueryType>(
      RetentionPolicyListQuery,
      deferredQueryRef,
    );

  const [commitToggle] = useMutation<RetentionPolicyListToggleMutation>(graphql`
    mutation RetentionPolicyListToggleMutation(
      $input: UpdateRetentionPolicyInput!
    ) {
      adminUpdateRetentionPolicy(input: $input) {
        policy {
          id
          enabled
          updatedAt
        }
      }
    }
  `);
  const [commitDelete, isInflightDelete] =
    useMutation<RetentionPolicyListDeleteMutation>(graphql`
      mutation RetentionPolicyListDeleteMutation($id: UUID!) {
        adminDeleteRetentionPolicy(id: $id) {
          id
        }
      }
    `);

  const [togglingIds, setTogglingIds] = useState<ReadonlyArray<string>>([]);
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [editingPolicy, setEditingPolicy] =
    useState<RetentionPolicyNode | null>(null);
  const [deletingPolicy, setDeletingPolicy] =
    useState<RetentionPolicyNode | null>(null);

  const policies = filterOutNullAndUndefined(
    _.map(adminRetentionPolicies?.edges, (edge) => edge?.node),
  );

  const toggleEnabled = (policy: RetentionPolicyNode, enabled: boolean) => {
    setTogglingIds((ids) => [...ids, policy.id]);
    const clearToggling = () =>
      setTogglingIds((ids) => _.without(ids, policy.id));
    commitToggle({
      variables: { input: { id: policy.entityId, enabled } },
      onCompleted: (_res, errors) => {
        clearToggling();
        if (errors && errors.length > 0) {
          _.forEach(errors, (err) => message.error(err.message));
          return;
        }
        message.success(t('retentionPolicy.SuccessfullyUpdated'));
      },
      onError: (error) => {
        clearToggling();
        message.error(error.message);
      },
    });
  };

  const findPolicy = (id: string) => _.find(policies, { id }) ?? null;

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIAlert type="info" description={t('retentionPolicy.Description')} />
      <BAIFlex justify="between" align="start" wrap="wrap" gap="sm">
        <BAIGraphQLPropertyFilter<GraphQLFilter>
          style={{ flex: 1 }}
          singleCondition
          value={variables.filter ?? undefined}
          onChange={(next) => {
            // RetentionPolicyFilter has no AND; one condition per field merges losslessly.
            const filter: RetentionPolicyFilter = next?.AND
              ? _.assign({}, ..._.castArray(next.AND))
              : (next ?? {});
            onReload({
              ...variables,
              filter: _.isEmpty(filter) ? null : filter,
              offset: 0,
            });
          }}
          filterProperties={[
            {
              key: 'category',
              propertyLabel: t('retentionPolicy.Category'),
              type: 'enum',
              valueMode: 'scalar',
              fixedOperator: 'equals',
              strictSelection: true,
              options: _.map(RETENTION_CATEGORIES, (category) => ({
                label: getCategoryLabel(category),
                value: category,
              })),
            },
            {
              key: 'enabled',
              propertyLabel: t('general.Enabled'),
              type: 'boolean',
            },
          ]}
        />
        <BAIFlex gap="xs">
          <BAIFetchKeyButton
            loading={isPending}
            onChange={() => {
              onReload(variables, { fetchPolicy: 'network-only' });
            }}
          />
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            onClick={() => {
              setEditingPolicy(null);
              setIsOpenSettingModal(true);
            }}
          >
            {t('retentionPolicy.CreatePolicy')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      <BAIAdminRetentionPolicyTable
        retentionPoliciesFrgmt={policies}
        loading={isPending}
        order={orderValue}
        onChangeOrder={(nextOrder) => {
          onReload({
            ...variables,
            orderBy: convertToOrderBy<RetentionPolicyOrderBy>(nextOrder),
          });
        }}
        pagination={{
          pageSize,
          total: adminRetentionPolicies?.count || 0,
          current,
          onChange: (nextCurrent, nextPageSize) => {
            if (_.isNumber(nextCurrent) && _.isNumber(nextPageSize)) {
              onReload({
                ...variables,
                limit: nextPageSize,
                offset: (nextCurrent - 1) * nextPageSize,
              });
            }
          },
        }}
        customizeColumns={(columns) =>
          _.map(columns, (column) => {
            if (column.key === 'category') {
              return {
                ...column,
                render: (value, row, index) => (
                  <BAINameActionCell
                    title={column.render?.(value, row, index)}
                    showActions="always"
                    actions={[
                      {
                        key: 'edit',
                        title: t('button.Edit'),
                        icon: <SquarePenIcon />,
                        onClick: () => {
                          setEditingPolicy(findPolicy(row.id));
                          setIsOpenSettingModal(true);
                        },
                      },
                      {
                        key: 'delete',
                        title: t('button.Delete'),
                        icon: <Trash2 size="1em" />,
                        type: 'danger',
                        onClick: () => setDeletingPolicy(findPolicy(row.id)),
                      },
                    ]}
                  />
                ),
              };
            }
            if (column.key === 'enabled') {
              return {
                ...column,
                render: (_value, row) => {
                  const policy = findPolicy(row.id);
                  const isToggling = _.includes(togglingIds, row.id);
                  return (
                    <Switch
                      label={t('general.Enabled')}
                      isLabelHidden
                      size="sm"
                      value={row.enabled}
                      isLoading={isToggling}
                      isDisabled={isToggling || !policy}
                      onChange={(next) => policy && toggleEnabled(policy, next)}
                    />
                  );
                },
              };
            }
            return column;
          })
        }
      />
      <BAIUnmountAfterClose>
        <RetentionPolicySettingModal
          open={isOpenSettingModal}
          policyFrgmt={editingPolicy}
          onRequestClose={(success) => {
            setIsOpenSettingModal(false);
            // An update returns its fields and Relay patches the row in
            // place; only a create changes which rows the list holds.
            if (success && editingPolicy === null) {
              onReload(variables, { fetchPolicy: 'network-only' });
            }
          }}
        />
      </BAIUnmountAfterClose>
      <BAIDeleteConfirmModal
        open={!!deletingPolicy}
        title={t('retentionPolicy.DeletePolicy')}
        target={t('retentionPolicy.RetentionPolicy')}
        items={
          deletingPolicy
            ? [
                {
                  key: deletingPolicy.id,
                  label: getCategoryLabel(deletingPolicy.category),
                },
              ]
            : []
        }
        confirmText={
          deletingPolicy ? getCategoryLabel(deletingPolicy.category) : ''
        }
        requireConfirmInput
        confirmLoading={isInflightDelete}
        onOk={() => {
          if (!deletingPolicy) return;
          commitDelete({
            variables: { id: deletingPolicy.entityId },
            onCompleted: (_res, errors) => {
              if (errors && errors.length > 0) {
                _.forEach(errors, (err) => message.error(err.message));
                return;
              }
              setDeletingPolicy(null);
              message.success(t('retentionPolicy.SuccessfullyDeleted'));
              // Deleting a page's last row steps back so the table is not left empty.
              onReload(
                policies.length === 1 && current > 1
                  ? { ...variables, offset: (current - 2) * pageSize }
                  : variables,
                { fetchPolicy: 'network-only' },
              );
            },
            onError: (error) => {
              message.error(error.message);
            },
          });
        }}
        onCancel={() => setDeletingPolicy(null)}
      />
    </BAIFlex>
  );
};

export default RetentionPolicyList;
