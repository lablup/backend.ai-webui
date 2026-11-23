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
import { useBAIPaginationOptionStateOnSearchParam } from '../../../hooks/reactPaginationQueryOptions';
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
  INITIAL_FETCH_KEY,
  useFetchKey,
  useMutationWithPromise,
  type BAIColumnType,
  type GraphQLFilter,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { PlusIcon, SendIcon, SquarePenIcon, Trash2 } from 'lucide-react';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type NotificationChannelNode = NonNullable<
  NonNullable<
    NotificationChannelListQuery$data['adminNotificationChannels']
  >['edges'][number]['node']
>;

const FILTER_KEYS = ['name', 'channelType', 'enabled'] as const;
const SORTER_KEYS = ['name', 'created_at'] as const;
const SORTER_VALUES = [
  ...SORTER_KEYS,
  ...SORTER_KEYS.map((key) => `-${key}` as const),
] as const;

const filterParser = parseAsJson<NotificationChannelFilter>((value) =>
  _.pick(value as NotificationChannelFilter, FILTER_KEYS),
);

const NotificationChannelList: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [editingChannel, setEditingChannel] =
    useState<NotificationChannelSettingModalFragment$key | null>(null);
  const [testingChannel, setTestingChannel] =
    useState<NotificationChannelNode | null>(null);
  const [deletingChannel, setDeletingChannel] =
    useState<NotificationChannelNode | null>(null);
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({ current: 1, pageSize: 10 });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(SORTER_VALUES),
      filter: filterParser,
    },
    { history: 'replace' },
  );
  const filter = _.isEmpty(queryParams.filter) ? null : queryParams.filter;

  // Deferred so a sort, page or filter change keeps the current rows on screen
  // (marked loading) instead of suspending the tab.
  const queryVariables = {
    filter,
    orderBy: convertToOrderBy<NotificationChannelOrderBy>(
      queryParams.order ?? '-created_at',
    ),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

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
      deferredQueryVariables,
      {
        fetchKey: deferredFetchKey,
        fetchPolicy:
          deferredFetchKey === INITIAL_FETCH_KEY
            ? 'store-and-network'
            : 'network-only',
      },
    );

  const commitEnabled =
    useMutationWithPromise<NotificationChannelListEnabledMutation>(graphql`
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
    `);

  const [commitPurge, isInFlightPurge] =
    useMutation<NotificationChannelListPurgeMutation>(graphql`
      mutation NotificationChannelListPurgeMutation($id: UUID!) {
        purgeNotificationChannel(id: $id) {
          purgedId
          entityId
        }
      }
    `);

  const refetch = () => updateFetchKey();

  const channels = filterOutNullAndUndefined(
    _.map(adminNotificationChannels?.edges, (edge) => edge?.node),
  );

  const typeLabel = (channelType: string) =>
    t(`externalNotification.channelTypes.${channelType}`, {
      defaultValue: channelType,
    });

  // Never rejects: the Switch runs this in a transition without a catch, so a rejection
  // would reach the page's error boundary. Its optimistic value reverts on its own.
  const setEnabled = async (
    channel: NotificationChannelNode,
    enabled: boolean,
  ) => {
    try {
      await commitEnabled({ input: { id: channel.entityId, enabled } });
      // Under an `enabled` filter the row no longer matches; reload the list.
      if (_.isBoolean(filter?.enabled)) refetch();
    } catch (error) {
      message.error((error as Error)?.message || t('general.ErrorOccurred'));
    }
  };

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
            setQueryParams({
              filter: _.isEmpty(nextFilter) ? null : nextFilter,
            });
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
            loading={isLoading}
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
        loading={isLoading}
        dataSource={channels}
        columns={columns}
        order={queryParams.order ?? undefined}
        onChangeOrder={(nextOrder) =>
          setQueryParams({
            order: (nextOrder as (typeof SORTER_VALUES)[number]) ?? null,
          })
        }
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
