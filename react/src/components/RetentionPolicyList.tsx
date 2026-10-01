/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RetentionPolicyListDeleteMutation } from '../__generated__/RetentionPolicyListDeleteMutation.graphql';
import {
  RetentionPolicyListQuery,
  RetentionPolicyOrderBy,
} from '../__generated__/RetentionPolicyListQuery.graphql';
import { RetentionPolicyListToggleMutation } from '../__generated__/RetentionPolicyListToggleMutation.graphql';
import { App } from '../app-shim';
import { convertToOrderBy } from '../helper';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import RetentionPolicySettingModal, {
  useRetentionCategoryLabel,
} from './RetentionPolicySettingModal';
import { Switch } from '@astryxdesign/core/Switch';
import {
  BAIButton,
  BAIColumnsType,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAINameActionCell,
  BAITable,
  BAIText,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  filterOutNullAndUndefined,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { PlusIcon, SquarePenIcon, Trash2 } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type RetentionPolicyNode = NonNullable<
  NonNullable<
    RetentionPolicyListQuery['response']['adminRetentionPolicies']
  >['edges'][number]['node']
>;

const sortableKeys = ['category', 'createdAt', 'lastSweptAt'];

const RetentionPolicyList = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const getCategoryLabel = useRetentionCategoryLabel();

  const [order, setOrder] = useState<string | null>('category');
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 10 });
  const [fetchKey, updateFetchKey] = useFetchKey();

  const queryVariables = {
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    orderBy: convertToOrderBy<RetentionPolicyOrderBy>(order),
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const isPending =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  const { adminRetentionPolicies } = useLazyLoadQuery<RetentionPolicyListQuery>(
    graphql`
      query RetentionPolicyListQuery(
        $limit: Int
        $offset: Int
        $orderBy: [RetentionPolicyOrderBy!]
      ) {
        adminRetentionPolicies(
          limit: $limit
          offset: $offset
          orderBy: $orderBy
        ) {
          count
          edges {
            node {
              id
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
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: deferredFetchKey,
    },
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

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [editingPolicy, setEditingPolicy] =
    useState<RetentionPolicyNode | null>(null);
  const [deletingPolicy, setDeletingPolicy] =
    useState<RetentionPolicyNode | null>(null);

  const policies = filterOutNullAndUndefined(
    _.map(adminRetentionPolicies?.edges, (edge) => edge?.node),
  );

  const toggleEnabled = (policy: RetentionPolicyNode, enabled: boolean) => {
    setTogglingId(policy.id);
    commitToggle({
      variables: { input: { id: toLocalId(policy.id), enabled } },
      onCompleted: (_res, errors) => {
        setTogglingId(null);
        if (errors && errors.length > 0) {
          _.forEach(errors, (err) => message.error(err.message));
          return;
        }
        message.success(t('retentionPolicy.SuccessfullyUpdated'));
      },
      onError: (error) => {
        setTogglingId(null);
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
          isLoading={togglingId === row.id}
          isDisabled={togglingId === row.id}
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
      <BAIFlex justify="between" align="center" wrap="wrap" gap="sm">
        <BAIText type="secondary">{t('retentionPolicy.Description')}</BAIText>
        <BAIFlex gap="xs">
          <BAIFetchKeyButton
            loading={isPending}
            value={fetchKey}
            onChange={() => updateFetchKey()}
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
      <BAITable
        scroll={{ x: 'max-content' }}
        size="small"
        rowKey="id"
        dataSource={policies}
        columns={columns}
        loading={isPending}
        order={order}
        onChangeOrder={(nextOrder) => {
          setOrder(
            nextOrder && _.includes(sortableKeys, nextOrder.replace(/^-/, ''))
              ? nextOrder
              : null,
          );
          setTablePaginationOption({ current: 1 });
        }}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: adminRetentionPolicies?.count ?? 0,
          onChange(current, pageSize) {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({ current, pageSize });
            }
          },
        }}
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
              updateFetchKey();
            }
            setEditingPolicy(null);
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
            variables: { id: toLocalId(deletingPolicy.id) },
            onCompleted: (_res, errors) => {
              setDeletingPolicy(null);
              if (errors && errors.length > 0) {
                _.forEach(errors, (err) => message.error(err.message));
                return;
              }
              message.success(t('retentionPolicy.SuccessfullyDeleted'));
              updateFetchKey();
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
