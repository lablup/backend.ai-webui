/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { NotificationChannelListEnabledMutation } from '../../../__generated__/NotificationChannelListEnabledMutation.graphql';
import { NotificationChannelListPurgeMutation } from '../../../__generated__/NotificationChannelListPurgeMutation.graphql';
import {
  NotificationChannelFilter,
  NotificationChannelListQuery,
  NotificationChannelListQuery$data,
  NotificationChannelOrderBy,
} from '../../../__generated__/NotificationChannelListQuery.graphql';
import { NotificationChannelSettingModalFragment$key } from '../../../__generated__/NotificationChannelSettingModalFragment.graphql';
import { App } from '../../../app-shim';
import { convertToOrderBy } from '../../../helper';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import { NOTIFICATION_CHANNEL_TYPES } from '../helper/notificationChannelSpec';
import NotificationChannelSettingModal from './NotificationChannelSettingModal';
import NotificationChannelTestModal from './NotificationChannelTestModal';
import { Token } from '@lablup/ui-common/Token';
import {
  BAIAlert,
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAISwitch,
  BAITable,
  BAIText,
  filterOutNullAndUndefined,
  useUpdatableState,
  type BAIColumnType,
  type GraphQLFilter,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { PlusIcon, SendIcon, SquarePenIcon, Trash2 } from 'lucide-react';
import { parseAsJson, useQueryState } from 'nuqs';
import React, { useDeferredValue, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type NotificationChannelNode = NonNullable<
  NonNullable<
    NotificationChannelListQuery$data['adminNotificationChannels']
  >['edges'][number]['node']
>;

const FILTER_KEYS = ['name', 'channelType', 'enabled'] as const;
const filterParser = parseAsJson<NotificationChannelFilter>((value) =>
  _.pick(value as NotificationChannelFilter, FILTER_KEYS),
);

const NotificationChannelList: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [editingChannel, setEditingChannel] =
    useState<NotificationChannelSettingModalFragment$key | null>(null);
  const [testingChannel, setTestingChannel] =
    useState<NotificationChannelNode | null>(null);
  const [deletingChannel, setDeletingChannel] =
    useState<NotificationChannelNode | null>(null);
  const [order, setOrder] = useState<string | null>('-created_at');
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 10 });

  const [filterParam, setFilterParam] = useQueryState(
    'filter',
    filterParser.withOptions({ history: 'replace' }),
  );
  const filter = _.isEmpty(filterParam) ? null : filterParam;
  const deferredFilter = useDeferredValue(filter);
  const isFilterPending = !_.isEqual(deferredFilter, filter);

  const { adminNotificationChannels } =
    useLazyLoadQuery<NotificationChannelListQuery>(
      graphql`
        query NotificationChannelListQuery(
          $filter: NotificationChannelFilter
          $orderBy: [NotificationChannelOrderBy!]
          $limit: Int
          $offset: Int
        ) {
          adminNotificationChannels(
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
                name
                description
                channelType
                enabled
                createdAt
                ...NotificationChannelSettingModalFragment
              }
            }
          }
        }
      `,
      {
        filter: deferredFilter,
        orderBy: convertToOrderBy<NotificationChannelOrderBy>(order),
        limit: baiPaginationOption.limit,
        offset: baiPaginationOption.offset,
      },
      {
        fetchPolicy:
          fetchKey === 'initial-fetch' ? 'store-and-network' : 'network-only',
        fetchKey,
      },
    );

  const [commitEnabled] = useMutation<NotificationChannelListEnabledMutation>(
    graphql`
      mutation NotificationChannelListEnabledMutation(
        $input: UpdateNotificationChannelInput!
      ) {
        updateNotificationChannel(input: $input) {
          channel {
            id
            enabled
          }
        }
      }
    `,
  );

  const [commitPurge, isInFlightPurge] =
    useMutation<NotificationChannelListPurgeMutation>(graphql`
      mutation NotificationChannelListPurgeMutation($id: UUID!) {
        purgeNotificationChannel(id: $id) {
          purgedId
          entityId
        }
      }
    `);

  const refetch = () => {
    startRefetchTransition(() => {
      updateFetchKey();
    });
  };

  const channels = filterOutNullAndUndefined(
    _.map(adminNotificationChannels?.edges, (edge) => edge?.node),
  );

  const typeLabel = (channelType: string) =>
    t(`externalNotification.channelTypes.${channelType}`, {
      defaultValue: channelType,
    });

  const setEnabled = (channel: NotificationChannelNode, enabled: boolean) =>
    new Promise<void>((resolve, reject) => {
      commitEnabled({
        variables: { input: { id: channel.entityId, enabled } },
        onCompleted: (_res, errors) => {
          if (errors && errors.length > 0) {
            message.error(errors[0]?.message || t('general.ErrorOccurred'));
            reject(errors[0]);
            return;
          }
          resolve();
        },
        onError: (error) => {
          message.error(error?.message || t('general.ErrorOccurred'));
          reject(error);
        },
      });
    });

  const purgeChannel = (channel: NotificationChannelNode) => {
    commitPurge({
      variables: { id: channel.entityId },
      onCompleted: (_res, errors) => {
        if (errors && errors.length > 0) {
          _.forEach(errors, (err) => message.error(err.message));
          return;
        }
        setDeletingChannel(null);
        message.success(t('externalNotification.ChannelDeleted'));
        refetch();
      },
      onError: (error) => {
        message.error(error.message);
      },
    });
  };

  const columns: Array<BAIColumnType<NotificationChannelNode>> = [
    {
      title: t('externalNotification.Name'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      required: true,
      sorter: true,
      render: (__, row) => (
        <BAINameActionCell
          title={row.name}
          showActions="always"
          actions={[
            {
              key: 'edit',
              title: t('button.Edit'),
              icon: <SquarePenIcon />,
              onClick: () => {
                setEditingChannel(row);
                setIsOpenSettingModal(true);
              },
            },
            {
              key: 'test',
              title: t('externalNotification.SendTestMessage'),
              icon: <SendIcon />,
              onClick: () => setTestingChannel(row),
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <Trash2 size="1em" />,
              type: 'danger',
              onClick: () => setDeletingChannel(row),
            },
          ]}
        />
      ),
    },
    {
      title: t('externalNotification.ChannelType'),
      dataIndex: 'channelType',
      key: 'channelType',
      render: (__, row) => <Token label={typeLabel(row.channelType)} />,
    },
    {
      title: t('externalNotification.Enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
      render: (__, row) => (
        <BAISwitch
          aria-label={t('externalNotification.EnabledFor', { name: row.name })}
          value={row.enabled}
          changeAction={(checked) => setEnabled(row, checked)}
        />
      ),
    },
    {
      title: t('externalNotification.Description'),
      dataIndex: 'description',
      key: 'description',
      render: (__, row) =>
        row.description ? (
          <BAIText ellipsis={{ tooltip: row.description }}>
            {row.description}
          </BAIText>
        ) : (
          <BAIText type="secondary">-</BAIText>
        ),
    },
    {
      title: t('general.CreatedAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      render: (__, row) => dayjs(row.createdAt).format('lll'),
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIAlert
        type="info"
        description={t('externalNotification.ChannelsDescription')}
      />
      <BAIFlex justify="between" align="start" wrap="wrap" gap="sm">
        <BAIGraphQLPropertyFilter<GraphQLFilter>
          style={{ flex: 1 }}
          singleCondition
          value={filter ?? undefined}
          onChange={(next) => {
            const nextFilter: NotificationChannelFilter = next?.AND
              ? _.assign({}, ..._.castArray(next.AND))
              : (next ?? {});
            setFilterParam(_.isEmpty(nextFilter) ? null : nextFilter);
            setTablePaginationOption({ current: 1 });
          }}
          filterProperties={[
            {
              key: 'name',
              propertyLabel: t('externalNotification.Name'),
              type: 'string',
              fixedOperator: 'contains',
            },
            {
              key: 'channelType',
              propertyLabel: t('externalNotification.ChannelType'),
              type: 'enum',
              fixedOperator: 'equals',
              strictSelection: true,
              options: _.map(NOTIFICATION_CHANNEL_TYPES, (channelType) => ({
                label: typeLabel(channelType),
                value: channelType,
              })),
            },
            {
              key: 'enabled',
              propertyLabel: t('externalNotification.Enabled'),
              type: 'boolean',
            },
          ]}
        />
        <BAIFlex gap="xs">
          <BAIFetchKeyButton
            loading={isRefetchPending}
            value={fetchKey}
            onChange={refetch}
          />
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            onClick={() => {
              setEditingChannel(null);
              setIsOpenSettingModal(true);
            }}
          >
            {t('externalNotification.CreateChannel')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      <BAITable<NotificationChannelNode>
        scroll={{ x: 'max-content' }}
        size="small"
        rowKey="id"
        loading={isRefetchPending || isFilterPending}
        dataSource={channels}
        columns={columns}
        order={order ?? undefined}
        onChangeOrder={(nextOrder) => setOrder(nextOrder ?? null)}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: adminNotificationChannels?.count ?? 0,
          showSizeChanger: true,
          onChange: (current, pageSize) =>
            setTablePaginationOption({ current, pageSize }),
        }}
      />
      <NotificationChannelSettingModal
        open={isOpenSettingModal}
        channelFrgmt={editingChannel}
        onRequestClose={(success) => {
          setIsOpenSettingModal(false);
          if (success && editingChannel === null) {
            refetch();
          }
        }}
      />
      <NotificationChannelTestModal
        channel={testingChannel}
        onRequestClose={() => setTestingChannel(null)}
      />
      <BAIDeleteConfirmModal
        open={!!deletingChannel}
        title={t('externalNotification.DeleteChannel')}
        description={t('externalNotification.DeleteChannelDescription')}
        items={
          deletingChannel
            ? [{ key: deletingChannel.entityId, label: deletingChannel.name }]
            : []
        }
        confirmText={deletingChannel?.name ?? ''}
        requireConfirmInput
        confirmLoading={isInFlightPurge}
        onOk={() => {
          if (deletingChannel) purgeChannel(deletingChannel);
        }}
        onCancel={() => setDeletingChannel(null)}
      />
    </BAIFlex>
  );
};

export default NotificationChannelList;
