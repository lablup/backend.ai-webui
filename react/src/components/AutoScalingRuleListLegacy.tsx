/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AutoScalingRuleEditorModalLegacyFragment$key } from '../__generated__/AutoScalingRuleEditorModalLegacyFragment.graphql';
import { AutoScalingRuleListLegacyDeleteMutation } from '../__generated__/AutoScalingRuleListLegacyDeleteMutation.graphql';
import AutoScalingRuleEditorModalLegacy, {
  COMPARATOR_LABELS,
} from './AutoScalingRuleEditorModalLegacy';
import { DeleteFilled, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { App, Button, Tag, Tooltip, Typography, theme } from 'antd';
import {
  BAICard,
  BAIConfirmModalWithInput,
  BAIFlex,
  BAITable,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import { default as dayjs } from 'dayjs';
import * as _ from 'lodash-es';
import { CircleArrowDownIcon, CircleArrowUpIcon } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';

interface AutoScalingRuleListLegacyProps {
  endpoint_id: string;
  autoScalingRules: ReadonlyArray<
    | (AutoScalingRuleEditorModalLegacyFragment$key & Record<string, any>)
    | null
    | undefined
  >;
  isEndpointDestroying: boolean;
  isOwnedByCurrentUser: boolean;
  onRefetch: () => void;
}

const dayDiff = (a: any, b: any) => {
  const date1 = dayjs(a.created_at);
  const date2 = dayjs(b.created_at);
  return date1.diff(date2);
};

/**
 * Renders the condition column with normalized `<` direction:
 * - LESS_THAN: `[metric_name] < [threshold]`
 * - GREATER_THAN: `[threshold] < [metric_name]` (flipped)
 */
const renderCondition = (row: any) => {
  const metricName = row?.metric_name;
  const threshold = row?.threshold;
  const comparator = row?.comparator;
  const suffix = row?.metric_source === 'KERNEL' ? '%' : '';

  if (comparator === 'GREATER_THAN') {
    // Flip: threshold < metric_name
    return (
      <BAIFlex gap={'xs'}>
        {threshold}
        {suffix}
        <Tooltip title={comparator}>{'<'}</Tooltip>
        <Tag>{metricName}</Tag>
      </BAIFlex>
    );
  }

  // LESS_THAN or default: metric_name < threshold
  return (
    <BAIFlex gap={'xs'}>
      <Tag>{metricName}</Tag>
      {comparator ? (
        <Tooltip title={comparator}>
          {COMPARATOR_LABELS[comparator as keyof typeof COMPARATOR_LABELS] ||
            comparator}
        </Tooltip>
      ) : (
        '-'
      )}
      {threshold}
      {suffix}
    </BAIFlex>
  );
};

const AutoScalingRuleListLegacy: React.FC<AutoScalingRuleListLegacyProps> = ({
  endpoint_id,
  autoScalingRules,
  isEndpointDestroying,
  isOwnedByCurrentUser,
  onRefetch,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [_isPendingRefetch, startRefetchTransition] = useTransition();

  const [editingAutoScalingRule, setEditingAutoScalingRule] =
    useState<AutoScalingRuleEditorModalLegacyFragment$key | null>(null);
  const [isOpenAutoScalingRuleModal, setIsOpenAutoScalingRuleModal] =
    useState(false);
  const [deletingRule, setDeletingRule] = useState<Record<string, any> | null>(
    null,
  );

  const [
    commitDeleteAutoScalingRuleMutation,
    isInFlightDeleteAutoScalingRuleMutation,
  ] = useMutation<AutoScalingRuleListLegacyDeleteMutation>(graphql`
    mutation AutoScalingRuleListLegacyDeleteMutation($id: String!) {
      delete_endpoint_auto_scaling_rule_node(id: $id) {
        ok
        msg
      }
    }
  `);

  return (
    <>
      <BAICard
        title={t('modelService.AutoScalingRules')}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={isEndpointDestroying}
            onClick={() => {
              setIsOpenAutoScalingRuleModal(true);
            }}
          >
            {t('modelService.AddRules')}
          </Button>
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <BAITable
          scroll={{ x: 'max-content' }}
          rowKey={'id'}
          columns={[
            {
              title: t('autoScalingRule.ScalingType'),
              fixed: 'left',
              render: (_text, row) =>
                (row?.step_size || 0) > 0
                  ? t('autoScalingRule.ScaleOut')
                  : t('autoScalingRule.ScaleIn'),
            },
            {
              title: t('autoScalingRule.MetricSource'),
              dataIndex: 'metric_source',
            },
            {
              title: t('autoScalingRule.Condition'),
              dataIndex: 'metric_name',
              fixed: 'left',
              render: (_text, row) => renderCondition(row),
            },
            {
              title: t('modelService.Controls'),
              dataIndex: 'controls',
              key: 'controls',
              render: (_text, row) => (
                <BAIFlex direction="row" align="stretch">
                  <Button
                    type="text"
                    icon={<SettingOutlined />}
                    style={
                      isEndpointDestroying || !isOwnedByCurrentUser
                        ? {
                            color: token.colorTextDisabled,
                          }
                        : {
                            color: token.colorInfo,
                          }
                    }
                    disabled={isEndpointDestroying || !isOwnedByCurrentUser}
                    onClick={() => {
                      if (row) {
                        setEditingAutoScalingRule(row);
                        setIsOpenAutoScalingRuleModal(true);
                      }
                    }}
                  />
                  <Button
                    type="text"
                    icon={
                      <DeleteFilled
                        style={
                          isEndpointDestroying
                            ? undefined
                            : {
                                color: token.colorError,
                              }
                        }
                      />
                    }
                    disabled={isEndpointDestroying || !isOwnedByCurrentUser}
                    onClick={() => {
                      if (row) {
                        setDeletingRule(row);
                      }
                    }}
                  />
                </BAIFlex>
              ),
            },
            {
              title: t('autoScalingRule.StepSize'),
              dataIndex: 'step_size',
              render: (_text, row) => {
                if (row?.step_size) {
                  return (
                    <BAIFlex gap={'xs'}>
                      <Typography.Text>
                        {row?.step_size > 0 ? (
                          <CircleArrowUpIcon />
                        ) : (
                          <CircleArrowDownIcon />
                        )}
                      </Typography.Text>
                      <Typography.Text>
                        {Math.abs(row?.step_size)}
                      </Typography.Text>
                    </BAIFlex>
                  );
                } else {
                  return '-';
                }
              },
            },
            {
              title: t('autoScalingRule.MIN/MAXReplicas'),
              render: (_text, row) => (
                <span>
                  {row?.step_size
                    ? row?.step_size > 0
                      ? `Max: ${row?.max_replicas}`
                      : `Min: ${row?.min_replicas}`
                    : '-'}
                </span>
              ),
            },
            {
              title: t('autoScalingRule.CoolDownSeconds'),
              dataIndex: 'cooldown_seconds',
            },
            {
              title: t('autoScalingRule.LastTriggered'),
              render: (_text, row) => {
                return (
                  <span>
                    {row?.last_triggered_at
                      ? dayjs.utc(row?.last_triggered_at).tz().format('ll LTS')
                      : `-`}
                  </span>
                );
              },
              sorter: dayDiff,
            },
            {
              title: t('autoScalingRule.CreatedAt'),
              dataIndex: 'created_at',
              render: (_text, row) => (
                <span>{dayjs(row?.created_at).format('ll LT')}</span>
              ),
              sorter: dayDiff,
            },
          ]}
          pagination={false}
          showSorterTooltip={false}
          dataSource={autoScalingRules}
        ></BAITable>
      </BAICard>
      <BAIUnmountAfterClose>
        <AutoScalingRuleEditorModalLegacy
          open={isOpenAutoScalingRuleModal}
          endpoint_id={endpoint_id}
          autoScalingRuleFrgmt={editingAutoScalingRule}
          onRequestClose={(success) => {
            setIsOpenAutoScalingRuleModal(false);
            setEditingAutoScalingRule(null);
            if (success) {
              startRefetchTransition(() => {
                onRefetch();
              });
            }
          }}
        />
      </BAIUnmountAfterClose>
      <BAIConfirmModalWithInput
        open={!!deletingRule}
        title={t('autoScalingRule.ConfirmDeleteAutoScalingRule', {
          autoScalingRule: deletingRule?.metric_name ?? '',
        })}
        content={
          <Typography.Text type="danger">
            {t('dialog.warning.CannotBeUndone')}
          </Typography.Text>
        }
        confirmText={deletingRule?.metric_name ?? ''}
        inputLabel={t('autoScalingRule.TypeMetricNameToDelete', {
          metricName: deletingRule?.metric_name ?? '',
        })}
        okText={t('button.Delete')}
        okButtonProps={{ loading: isInFlightDeleteAutoScalingRuleMutation }}
        onOk={() => {
          if (deletingRule && autoScalingRules) {
            commitDeleteAutoScalingRuleMutation({
              variables: {
                id: deletingRule.id as string,
              },
              onCompleted: (res, errors) => {
                if (!res?.delete_endpoint_auto_scaling_rule_node?.ok) {
                  message.error(
                    res?.delete_endpoint_auto_scaling_rule_node?.msg,
                  );
                  setDeletingRule(null);
                } else if (errors && errors.length > 0) {
                  const errorMsgList = _.map(
                    errors,
                    (error) => error.message || t('dialog.ErrorOccurred'),
                  );
                  for (const error of errorMsgList) {
                    message.error(error);
                  }
                  setDeletingRule(null);
                } else {
                  setDeletingRule(null);
                  setEditingAutoScalingRule(null);
                  startRefetchTransition(() => {
                    onRefetch();
                  });
                  message.success({
                    key: 'autoscaling-rule-deleted',
                    content: t('autoScalingRule.SuccessfullyDeleted'),
                  });
                }
              },
              onError: (error) => {
                message.error(error?.message || t('dialog.ErrorOccurred'));
                setDeletingRule(null);
              },
            });
          }
        }}
        onCancel={() => setDeletingRule(null)}
      />
    </>
  );
};

export default AutoScalingRuleListLegacy;
