/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RetentionPolicyListDeleteMutation } from '../__generated__/RetentionPolicyListDeleteMutation.graphql';
import {
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
  BAIAlert,
  BAIButton,
  BAIColumnsType,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAINameActionCell,
  BAITable,
  BAIText,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
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

// `configuredPolicies` is unpaged: one policy per category caps it at
// `$categoryLimit`, and the create modal needs every taken category.
export const RetentionPolicyListQuery = graphql`
  query RetentionPolicyListQuery(
    $orderBy: [RetentionPolicyOrderBy!]
    $limit: Int
    $offset: Int
    $categoryLimit: Int!
  ) {
    adminRetentionPolicies(orderBy: $orderBy, limit: $limit, offset: $offset) {
      count
      edges {
        node {
          id
          entityId
          category
          retentionPeriodDays
          enabled
          lastSweptAt
          createdAt
          updatedAt
          ...RetentionPolicySettingModalFragment
        }
      }
    }
    configuredPolicies: adminRetentionPolicies(limit: $categoryLimit) {
      edges {
        node {
          id
          category
        }
      }
    }
  }
`;

export const RETENTION_POLICY_LIST_DEFAULT_PAGE_SIZE = 10;
export const RETENTION_POLICY_SORTER_KEYS = [
  'category',
  'createdAt',
  'lastSweptAt',
] as const;

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

  const { adminRetentionPolicies, configuredPolicies } =
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
  const configuredCategories = _.compact(
    _.map(configuredPolicies?.edges, (edge) => edge?.node?.category),
  );
  const unconfiguredCategories = _.difference(
    RETENTION_CATEGORIES,
    configuredCategories,
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

  const columns: BAIColumnsType<RetentionPolicyNode> = [
    {
      title: t('retentionPolicy.Category'),
      dataIndex: 'category',
      key: 'category',
      fixed: 'left',
      required: true,
      sorter: true,
      render: (_value, row) => (
        <BAINameActionCell
          title={getCategoryLabel(row.category)}
          showActions="always"
          actions={[
            {
              key: 'edit',
              title: t('button.Edit'),
              icon: <SquarePenIcon />,
              onClick: () => {
                setEditingPolicy(row);
                setIsOpenSettingModal(true);
              },
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <Trash2 size="1em" />,
              type: 'danger',
              onClick: () => setDeletingPolicy(row),
            },
          ]}
        />
      ),
    },
    {
      title: t('retentionPolicy.RetentionPeriodDays'),
      dataIndex: 'retentionPeriodDays',
      key: 'retentionPeriodDays',
    },
    {
      title: t('general.Enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
      render: (_value, row) => (
        <Switch
          label={t('general.Enabled')}
          isLabelHidden
          size="sm"
          value={row.enabled}
          isLoading={_.includes(togglingIds, row.id)}
          isDisabled={_.includes(togglingIds, row.id)}
          onChange={(next) => toggleEnabled(row, next)}
        />
      ),
    },
    {
      title: t('retentionPolicy.LastSweptAt'),
      dataIndex: 'lastSweptAt',
      key: 'lastSweptAt',
      sorter: true,
      render: (value: string | null | undefined) =>
        value ? (
          dayjs(value).format('lll')
        ) : (
          <BAIText type="secondary">{t('retentionPolicy.NotSweptYet')}</BAIText>
        ),
    },
    {
      title: t('general.CreatedAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      defaultHidden: true,
      render: (value: string) => dayjs(value).format('lll'),
    },
    {
      title: t('general.UpdatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      defaultHidden: true,
      render: (value: string) => dayjs(value).format('lll'),
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIAlert type="info" description={t('retentionPolicy.Description')} />
      <BAIFlex justify="end" align="center" wrap="wrap" gap="sm">
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
            disabled={unconfiguredCategories.length === 0}
            onClick={() => {
              setEditingPolicy(null);
              setIsOpenSettingModal(true);
            }}
          >
            {t('retentionPolicy.CreatePolicy')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      <BAITable
        scroll={{ x: 'max-content' }}
        size="small"
        rowKey="id"
        dataSource={policies}
        columns={columns}
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
      />
      <BAIUnmountAfterClose>
        <RetentionPolicySettingModal
          open={isOpenSettingModal}
          policyFrgmt={editingPolicy}
          configuredCategories={configuredCategories}
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
