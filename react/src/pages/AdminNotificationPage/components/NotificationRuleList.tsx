/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { NotificationRuleListEnabledMutation } from '../../../__generated__/NotificationRuleListEnabledMutation.graphql';
import { NotificationRuleListPurgeMutation } from '../../../__generated__/NotificationRuleListPurgeMutation.graphql';
import {
  NotificationRuleFilter,
  NotificationRuleListQuery,
  NotificationRuleListQuery$data,
  NotificationRuleOrderBy,
} from '../../../__generated__/NotificationRuleListQuery.graphql';
import { NotificationRuleSettingModalFragment$key } from '../../../__generated__/NotificationRuleSettingModalFragment.graphql';
import { App } from '../../../app-shim';
import { convertToOrderBy } from '../../../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../../../hooks/reactPaginationQueryOptions';
import { NOTIFICATION_RULE_TYPES } from '../helper/notificationRuleTemplate';
import NotificationRuleSettingModal, {
  useRuleTypeLabel,
} from './NotificationRuleSettingModal';
import NotificationRuleTestModal, {
  TestRule,
} from './NotificationRuleTestModal';
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

type NotificationRuleNode = NonNullable<
  NonNullable<
    NotificationRuleListQuery$data['adminNotificationRules']
  >['edges'][number]['node']
>;

const FILTER_KEYS = ['name', 'ruleType', 'enabled'] as const;
const SORTER_KEYS = ['name', 'created_at'] as const;
const SORTER_VALUES = [
  ...SORTER_KEYS,
  ...SORTER_KEYS.map((key) => `-${key}` as const),
] as const;

const filterParser = parseAsJson<NotificationRuleFilter>((value) =>
  _.pick(value as NotificationRuleFilter, FILTER_KEYS),
);

const NotificationRuleList: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const ruleTypeLabel = useRuleTypeLabel();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [editingRule, setEditingRule] =
    useState<NotificationRuleSettingModalFragment$key | null>(null);
  const [testingRule, setTestingRule] = useState<TestRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<NotificationRuleNode | null>(
    null,
  );
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
    orderBy: convertToOrderBy<NotificationRuleOrderBy>(
      queryParams.order ?? '-created_at',
    ),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  const { adminNotificationRules } =
    useLazyLoadQuery<NotificationRuleListQuery>(
      graphql`
        query NotificationRuleListQuery(
          $filter: NotificationRuleFilter
          $orderBy: [NotificationRuleOrderBy!]
          $limit: Int
          $offset: Int
        ) {
          adminNotificationRules(
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
                ruleType
                enabled
                createdAt
                channel {
                  id
                  name
                  channelType
                  enabled
                }
                ...NotificationRuleSettingModalFragment
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

  const [commitEnabled] = useMutation<NotificationRuleListEnabledMutation>(
    graphql`
      mutation NotificationRuleListEnabledMutation(
        $input: UpdateNotificationRuleInput!
      ) {
        updateNotificationRule(input: $input) {
          rule {
            id
            enabled
          }
        }
      }
    `,
  );

  const [commitPurge, isInFlightPurge] =
    useMutation<NotificationRuleListPurgeMutation>(graphql`
      mutation NotificationRuleListPurgeMutation($id: UUID!) {
        purgeNotificationRule(id: $id) {
          purgedId
          entityId
        }
      }
    `);

  const refetch = () => updateFetchKey();

  const rules = filterOutNullAndUndefined(
    _.map(adminNotificationRules?.edges, (edge) => edge?.node),
  );

  const setEnabled = (rule: NotificationRuleNode, enabled: boolean) =>
    new Promise<void>((resolve, reject) => {
      commitEnabled({
        variables: { input: { id: rule.entityId, enabled } },
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

  const purgeRule = (rule: NotificationRuleNode) => {
    commitPurge({
      variables: { id: rule.entityId },
      onCompleted: (_res, errors) => {
        if (errors && errors.length > 0) {
          _.forEach(errors, (err) => message.error(err.message));
          return;
        }
        setDeletingRule(null);
        message.success(t('externalNotification.RuleDeleted'));
        refetch();
      },
      onError: (error) => {
        message.error(error.message);
      },
    });
  };

  const columns: Array<BAIColumnType<NotificationRuleNode>> = [
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
                setEditingRule(row);
                setIsOpenSettingModal(true);
              },
            },
            {
              key: 'test',
              title: t('externalNotification.SendTestNotification'),
              icon: <SendIcon />,
              onClick: () =>
                setTestingRule({
                  entityId: row.entityId,
                  name: row.name,
                  ruleType: row.ruleType,
                  channelName: row.channel.name,
                }),
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <Trash2 size="1em" />,
              type: 'danger',
              onClick: () => setDeletingRule(row),
            },
          ]}
        />
      ),
    },
    {
      title: t('externalNotification.Event'),
      dataIndex: 'ruleType',
      key: 'ruleType',
      render: (__, row) => <Token label={ruleTypeLabel(row.ruleType)} />,
    },
    {
      title: t('externalNotification.Channel'),
      key: 'channel',
      render: (__, row) => (
        <BAIFlex gap="xxs" align="center" wrap="nowrap">
          <BAIText>{row.channel.name}</BAIText>
          {row.channel.enabled ? null : (
            <Token
              size="sm"
              color="gray"
              label={t('externalNotification.ChannelDisabled')}
            />
          )}
        </BAIFlex>
      ),
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
        description={t('externalNotification.RulesDescription')}
      />
      <BAIFlex justify="between" align="start" wrap="wrap" gap="sm">
        <BAIGraphQLPropertyFilter<GraphQLFilter>
          style={{ flex: 1 }}
          singleCondition
          value={filter ?? undefined}
          onChange={(next) => {
            const nextFilter: NotificationRuleFilter = next?.AND
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
              key: 'ruleType',
              propertyLabel: t('externalNotification.Event'),
              type: 'enum',
              fixedOperator: 'equals',
              strictSelection: true,
              options: _.map(NOTIFICATION_RULE_TYPES, (ruleType) => ({
                label: ruleTypeLabel(ruleType),
                value: ruleType,
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
              setEditingRule(null);
              setIsOpenSettingModal(true);
            }}
          >
            {t('externalNotification.CreateRule')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      <BAITable<NotificationRuleNode>
        scroll={{ x: 'max-content' }}
        size="small"
        rowKey="id"
        loading={isLoading}
        dataSource={rules}
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
          total: adminNotificationRules?.count ?? 0,
          showSizeChanger: true,
          onChange: (current, pageSize) =>
            setTablePaginationOption({ current, pageSize }),
        }}
      />
      <NotificationRuleSettingModal
        open={isOpenSettingModal}
        ruleFrgmt={editingRule}
        onRequestClose={(success) => {
          setIsOpenSettingModal(false);
          if (success && editingRule === null) {
            refetch();
          }
        }}
      />
      <NotificationRuleTestModal
        rule={testingRule}
        onRequestClose={() => setTestingRule(null)}
      />
      <BAIDeleteConfirmModal
        open={!!deletingRule}
        title={t('externalNotification.DeleteRule')}
        items={
          deletingRule
            ? [{ key: deletingRule.entityId, label: deletingRule.name }]
            : []
        }
        confirmText={deletingRule?.name ?? ''}
        requireConfirmInput
        confirmLoading={isInFlightPurge}
        onOk={() => {
          if (deletingRule) purgeRule(deletingRule);
        }}
        onCancel={() => setDeletingRule(null)}
      />
    </BAIFlex>
  );
};

export default NotificationRuleList;
