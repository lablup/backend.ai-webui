/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AutoScalingRuleListDeleteMutation } from '../__generated__/AutoScalingRuleListDeleteMutation.graphql';
import { AutoScalingRuleListPresetsQuery } from '../__generated__/AutoScalingRuleListPresetsQuery.graphql';
import { AutoScalingRuleListQuery } from '../__generated__/AutoScalingRuleListQuery.graphql';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import AutoScalingRuleEditorModal from './AutoScalingRuleEditorModal';
import {
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Tag, Tooltip, Typography, theme } from 'antd';
import {
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAITable,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import type { GraphQLFilter } from 'backend.ai-ui';
import { default as dayjs } from 'dayjs';
import * as _ from 'lodash-es';
import { CircleArrowDownIcon, CircleArrowUpIcon } from 'lucide-react';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { useDeferredValue, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type DateTimeFilter = { before?: string | null; after?: string | null };

interface AutoScalingRuleListProps {
  deploymentId: string; // Relay global ID (e.g., toGlobalId('ModelDeployment', uuid))
  isEndpointDestroying: boolean;
  isOwnedByCurrentUser: boolean;
}

type AutoScalingRuleNode = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<AutoScalingRuleListQuery['response']>['deployment']
    >['autoScalingRules']
  >['edges']
>[number]['node'];

/**
 * Renders the condition column with normalized `<` direction:
 * - maxThreshold only → `[metric_name] < [maxThreshold]`
 * - minThreshold only → `[minThreshold] < [metric_name]`
 * - Both set → `[minThreshold] < [metric_name] < [maxThreshold]`
 */
const renderCondition = (
  rule: AutoScalingRuleNode,
  t: (key: string) => string,
) => {
  const metricName = rule.metricName;
  const minThreshold = rule.minThreshold;
  const maxThreshold = rule.maxThreshold;
  const suffix = rule.metricSource === 'KERNEL' ? '%' : '';

  if (minThreshold != null && maxThreshold != null) {
    return (
      <BAIFlex gap={'xs'}>
        {minThreshold}
        {suffix}
        <Tooltip title={t('autoScalingRule.MinThreshold')}>{'<'}</Tooltip>
        <Tag>{metricName}</Tag>
        <Tooltip title={t('autoScalingRule.MaxThreshold')}>{'<'}</Tooltip>
        {maxThreshold}
        {suffix}
      </BAIFlex>
    );
  }

  if (maxThreshold != null) {
    return (
      <BAIFlex gap={'xs'}>
        <Tag>{metricName}</Tag>
        <Tooltip title={t('autoScalingRule.MaxThreshold')}>{'<'}</Tooltip>
        {maxThreshold}
        {suffix}
      </BAIFlex>
    );
  }

  if (minThreshold != null) {
    return (
      <BAIFlex gap={'xs'}>
        {minThreshold}
        {suffix}
        <Tooltip title={t('autoScalingRule.MinThreshold')}>{'<'}</Tooltip>
        <Tag>{metricName}</Tag>
      </BAIFlex>
    );
  }

  return '-';
};

type AutoScalingRuleFilterInput = {
  createdAt?: DateTimeFilter | null;
  lastTriggeredAt?: DateTimeFilter | null;
  AND?: AutoScalingRuleFilterInput[];
  OR?: AutoScalingRuleFilterInput[];
  NOT?: AutoScalingRuleFilterInput[];
};

/** Maps BAIGraphQLPropertyFilter output → AutoScalingRuleFilter, preserving AND/OR/NOT. */
const toAutoScalingRuleFilter = (
  filter: GraphQLFilter,
): AutoScalingRuleFilterInput => {
  const result: AutoScalingRuleFilterInput = {};
  if (filter.createdAt) result.createdAt = filter.createdAt as DateTimeFilter;
  if (filter.lastTriggeredAt)
    result.lastTriggeredAt = filter.lastTriggeredAt as DateTimeFilter;
  if (Array.isArray(filter.AND))
    result.AND = filter.AND.map(toAutoScalingRuleFilter);
  if (Array.isArray(filter.OR))
    result.OR = filter.OR.map(toAutoScalingRuleFilter);
  if (Array.isArray(filter.NOT))
    result.NOT = filter.NOT.map(toAutoScalingRuleFilter);
  return result;
};

const AutoScalingRuleList: React.FC<AutoScalingRuleListProps> = ({
  deploymentId,
  isEndpointDestroying,
  isOwnedByCurrentUser,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [isOpenEditorModal, setIsOpenEditorModal] = useState(false);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AutoScalingRuleList',
  );

  // BAITable order string: "createdAt" (ASC) | "-createdAt" (DESC)
  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral([
        'createdAt',
        '-createdAt',
      ] as const).withDefault('-createdAt'),
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    { history: 'replace' },
  );

  const orderString = queryParams.order;
  const graphQLFilter = queryParams.filter ?? undefined;

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({ current: 1, pageSize: 10 });

  const filterInput = React.useMemo(() => {
    if (!graphQLFilter) return null;
    return toAutoScalingRuleFilter(graphQLFilter);
  }, [graphQLFilter]);

  const deferredOrderString = useDeferredValue(orderString);
  const deferredFilterInput = useDeferredValue(filterInput);
  const deferredBaiPaginationOption = useDeferredValue(baiPaginationOption);

  const data = useLazyLoadQuery<AutoScalingRuleListQuery>(
    graphql`
      query AutoScalingRuleListQuery(
        $deploymentId: ID!
        $offset: Int
        $limit: Int
        $orderBy: [AutoScalingRuleOrderBy!]
        $filter: AutoScalingRuleFilter
      ) {
        deployment(id: $deploymentId) {
          autoScalingRules(
            offset: $offset
            limit: $limit
            orderBy: $orderBy
            filter: $filter
          ) {
            count
            edges {
              node {
                id
                metricSource
                metricName
                minThreshold
                maxThreshold
                stepSize
                timeWindow
                minReplicas
                maxReplicas
                prometheusQueryPresetId
                createdAt
                lastTriggeredAt
                ...AutoScalingRuleEditorModalFragment
              }
            }
          }
        }
      }
    `,
    {
      deploymentId,
      offset: deferredBaiPaginationOption.offset,
      limit: deferredBaiPaginationOption.limit,
      orderBy: [
        {
          field: 'CREATED_AT',
          direction: deferredOrderString.startsWith('-') ? 'DESC' : 'ASC',
        },
      ],
      filter: deferredFilterInput,
    },
    {
      fetchPolicy: 'store-and-network',
      fetchKey,
    },
  );

  const { prometheusQueryPresets } =
    useLazyLoadQuery<AutoScalingRuleListPresetsQuery>(
      graphql`
        query AutoScalingRuleListPresetsQuery {
          prometheusQueryPresets {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      `,
      {},
    );

  const presetMap = React.useMemo(() => {
    const map = new Map<string, string>();
    if (prometheusQueryPresets?.edges) {
      for (const edge of prometheusQueryPresets.edges) {
        if (edge?.node) {
          map.set(toLocalId(edge.node.id), edge.node.name);
        }
      }
    }
    return map;
  }, [prometheusQueryPresets]);

  const autoScalingRules = React.useMemo(
    () => _.map(data?.deployment?.autoScalingRules?.edges, (edge) => edge.node),
    [data?.deployment?.autoScalingRules?.edges],
  );

  const totalCount = data?.deployment?.autoScalingRules?.count ?? 0;

  const [commitDeleteMutation, isInFlightDeleteMutation] =
    useMutation<AutoScalingRuleListDeleteMutation>(graphql`
      mutation AutoScalingRuleListDeleteMutation(
        $input: DeleteAutoScalingRuleInput!
      ) {
        deleteAutoScalingRule(input: $input) {
          id
        }
      }
    `);

  const handleRefetch = () => {
    startRefetchTransition(() => {
      updateFetchKey();
    });
  };

  return (
    <>
      <Card
        title={t('modelService.AutoScalingRules')}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={isEndpointDestroying || !isOwnedByCurrentUser}
            onClick={() => {
              setEditingRuleId(null);
              setIsOpenEditorModal(true);
            }}
          >
            {t('modelService.AddRules')}
          </Button>
        }
      >
        <BAIGraphQLPropertyFilter
          style={{ marginBottom: token.marginMD }}
          filterProperties={[
            {
              key: 'createdAt',
              propertyLabel: t('autoScalingRule.CreatedAt'),
              type: 'datetime',
              operators: ['after', 'before'],
              defaultOperator: 'after',
            },
            {
              key: 'lastTriggeredAt',
              propertyLabel: t('autoScalingRule.LastTriggered'),
              type: 'datetime',
              operators: ['after', 'before'],
              defaultOperator: 'after',
            },
          ]}
          value={graphQLFilter}
          onChange={(filter) => {
            startRefetchTransition(() => {
              setQueryParams({ filter: filter ?? null });
              setTablePaginationOption({ current: 1 });
            });
          }}
        />
        <BAITable<AutoScalingRuleNode>
          scroll={{ x: 'max-content' }}
          rowKey={'id'}
          order={orderString}
          loading={
            isPendingRefetch ||
            deferredOrderString !== orderString ||
            deferredFilterInput !== filterInput ||
            deferredBaiPaginationOption !== baiPaginationOption
          }
          tableSettings={{
            columnOverrides: columnOverrides,
            onColumnOverridesChange: setColumnOverrides,
          }}
          onChangeOrder={(order) => {
            startRefetchTransition(() => {
              setQueryParams({
                order: order ? (order as 'createdAt' | '-createdAt') : null,
              });
            });
          }}
          columns={[
            {
              key: 'metricSource',
              title: t('autoScalingRule.MetricSource'),
              dataIndex: 'metricSource',
              fixed: 'left',
            },
            {
              key: 'condition',
              title: t('autoScalingRule.Condition'),
              fixed: 'left',
              render: (_text, row) => {
                if (!row) return '-';
                return (
                  <BAINameActionCell
                    title={renderCondition(row, t)}
                    showActions="always"
                    actions={[
                      {
                        key: 'edit',
                        title: t('button.Edit'),
                        icon: <SettingOutlined />,
                        disabled: isEndpointDestroying || !isOwnedByCurrentUser,
                        onClick: () => {
                          setEditingRuleId(row.id);
                          setIsOpenEditorModal(true);
                        },
                      },
                      {
                        key: 'delete',
                        title: t('button.Delete'),
                        icon: <DeleteOutlined />,
                        type: 'danger',
                        disabled:
                          isInFlightDeleteMutation ||
                          isEndpointDestroying ||
                          !isOwnedByCurrentUser,
                        onClick: () => {
                          modal.confirm({
                            title: t('dialog.warning.CannotBeUndone'),
                            okText: t('button.Delete'),
                            okButtonProps: { danger: true },
                            onOk: () => {
                              commitDeleteMutation({
                                variables: { input: { id: toLocalId(row.id) } },
                                onCompleted: (_res, errors) => {
                                  if (errors && errors.length > 0) {
                                    for (const error of errors) {
                                      message.error(
                                        error.message ||
                                          t('dialog.ErrorOccurred'),
                                      );
                                    }
                                  } else {
                                    setEditingRuleId(null);
                                    handleRefetch();
                                    message.success({
                                      key: 'autoscaling-rule-deleted',
                                      content: t(
                                        'autoScalingRule.SuccessfullyDeleted',
                                      ),
                                    });
                                  }
                                },
                                onError: (error) => {
                                  message.error(
                                    error?.message || t('dialog.ErrorOccurred'),
                                  );
                                },
                              });
                            },
                          });
                        },
                      },
                    ]}
                  />
                );
              },
            },
            {
              key: 'prometheusPreset',
              title: t('autoScalingRule.PrometheusPreset'),
              render: (_text, row) => {
                if (
                  row?.metricSource !== 'PROMETHEUS' ||
                  !row?.prometheusQueryPresetId
                ) {
                  return '-';
                }
                return (
                  presetMap.get(row.prometheusQueryPresetId) ||
                  row.prometheusQueryPresetId
                );
              },
            },
            {
              key: 'timeWindow',
              title: t('autoScalingRule.TimeWindow'),
              dataIndex: 'timeWindow',
              render: (value: number) =>
                value != null
                  ? t('autoScalingRule.TimeWindowSeconds', { value })
                  : '-',
            },
            {
              key: 'stepSize',
              title: t('autoScalingRule.StepSize'),
              dataIndex: 'stepSize',
              render: (_text, row) => {
                if (row?.stepSize) {
                  return (
                    <BAIFlex gap={'xs'}>
                      <Typography.Text>
                        {row.stepSize > 0 ? (
                          <CircleArrowUpIcon />
                        ) : (
                          <CircleArrowDownIcon />
                        )}
                      </Typography.Text>
                      <Typography.Text>
                        {Math.abs(row.stepSize)}
                      </Typography.Text>
                    </BAIFlex>
                  );
                } else {
                  return '-';
                }
              },
            },
            {
              key: 'minMaxReplicas',
              title: t('autoScalingRule.MIN/MAXReplicas'),
              render: (_text, row) => (
                <span>
                  {row?.stepSize
                    ? row.stepSize > 0
                      ? t('autoScalingRule.MaxReplicasValue', {
                          value: row?.maxReplicas,
                        })
                      : t('autoScalingRule.MinReplicasValue', {
                          value: row?.minReplicas,
                        })
                    : '-'}
                </span>
              ),
            },
            {
              key: 'createdAt',
              title: t('autoScalingRule.CreatedAt'),
              dataIndex: 'createdAt',
              sorter: true,
              sortDirections: ['descend', 'ascend'],
              render: (_text, row) => (
                <span>
                  {row?.createdAt ? dayjs(row.createdAt).format('ll LT') : '-'}
                </span>
              ),
            },
            {
              key: 'lastTriggeredAt',
              title: t('autoScalingRule.LastTriggered'),
              render: (_text, row) => (
                <span>
                  {row?.lastTriggeredAt
                    ? dayjs.utc(row.lastTriggeredAt).tz().format('ll LTS')
                    : '-'}
                </span>
              ),
            },
          ]}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: totalCount,
            onChange: (current, pageSize) => {
              setTablePaginationOption({ current, pageSize });
            },
          }}
          showSorterTooltip={false}
          dataSource={autoScalingRules}
        />
      </Card>
      <AutoScalingRuleEditorModal
        key={editingRuleId ?? 'create'}
        open={isOpenEditorModal}
        modelDeploymentId={toLocalId(deploymentId)}
        autoScalingRuleFrgmt={
          editingRuleId
            ? (autoScalingRules.find((r) => r.id === editingRuleId) ?? null)
            : null
        }
        onRequestClose={(success) => {
          setIsOpenEditorModal(false);
          setEditingRuleId(null);
          if (success) {
            handleRefetch();
          }
        }}
      />
    </>
  );
};

export default AutoScalingRuleList;
