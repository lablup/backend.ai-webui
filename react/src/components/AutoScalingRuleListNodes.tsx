/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  AutoScalingRuleListNodesFragment$data,
  AutoScalingRuleListNodesFragment$key,
} from '../__generated__/AutoScalingRuleListNodesFragment.graphql';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIQuestionIconWithTooltip,
  BAIFlex,
  BAINameActionCell,
  BAITableAstryx,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import type { BAITableProps } from 'backend.ai-ui';
import { default as dayjs } from 'dayjs';
import { Trash2, SquarePenIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type AutoScalingRuleNode = NonNullable<
  AutoScalingRuleListNodesFragment$data[number]
>;

/**
 * Renders the condition column showing when scaling triggers.
 * Comparator is always `<` — orientation of the metric tag indicates the direction.
 * - maxThreshold only → `[maxThreshold] < [metric_name]` (scale out)
 * - minThreshold only → `[metric_name] < [minThreshold]` (scale in)
 * - Both set → stacked rows, one for scale in and one for scale out
 *
 * For PROMETHEUS rules, the tag shows the preset name (from presetMap) instead of
 * the raw metricName, since users select a preset — not the metric directly.
 */
const renderCondition = (
  rule: AutoScalingRuleNode,
  t: (key: string) => string,
  presetMap?: Map<string, string>,
) => {
  const tagLabel =
    rule.metricSource === 'PROMETHEUS' && rule.prometheusQueryPresetId
      ? (presetMap?.get(rule.prometheusQueryPresetId) ?? rule.metricName)
      : rule.metricName;
  const minThreshold = rule.minThreshold;
  const maxThreshold = rule.maxThreshold;

  if (minThreshold != null && maxThreshold != null) {
    return (
      <BAIFlex direction="column" gap={'xxs'}>
        <BAIFlex gap={'xs'}>
          <Badge label={tagLabel} />
          {' < '}
          {minThreshold}
        </BAIFlex>
        <BAIFlex gap={'xs'}>
          {maxThreshold}
          {' < '}
          <Badge label={tagLabel} />
        </BAIFlex>
      </BAIFlex>
    );
  }

  if (maxThreshold != null) {
    return (
      <BAIFlex gap={'xs'}>
        {maxThreshold}
        <Tooltip content={t('autoScalingRule.MaxThreshold')}>
          <span>{'<'}</span>
        </Tooltip>
        <Badge label={tagLabel} />
      </BAIFlex>
    );
  }

  if (minThreshold != null) {
    return (
      <BAIFlex gap={'xs'}>
        <Badge label={tagLabel} />
        <Tooltip content={t('autoScalingRule.MinThreshold')}>
          <span>{'<'}</span>
        </Tooltip>
        {minThreshold}
      </BAIFlex>
    );
  }

  return '-';
};

interface AutoScalingRuleListNodesProps extends Omit<
  BAITableProps<AutoScalingRuleNode>,
  'dataSource' | 'columns'
> {
  autoScalingRulesFrgmt: AutoScalingRuleListNodesFragment$key;
  presetMap: Map<string, string>;
  isEndpointDestroying: boolean;
  isOwnedByCurrentUser: boolean;
  onEditRule: (id: string) => void;
  onDeleteRule: (id: string, metricName: string) => void;
}

/**
 * Presentational auto-scaling rules table. Reads the rule nodes from a plural
 * fragment and renders them; the Prometheus preset names are resolved by the
 * parent card and passed down via `presetMap`, so this component owns no data
 * fetching of its own.
 */
const AutoScalingRuleListNodes: React.FC<AutoScalingRuleListNodesProps> = ({
  autoScalingRulesFrgmt,
  presetMap,
  isEndpointDestroying,
  isOwnedByCurrentUser,
  onEditRule,
  onDeleteRule,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();

  const autoScalingRules = filterOutNullAndUndefined(
    useFragment(
      graphql`
        fragment AutoScalingRuleListNodesFragment on AutoScalingRule
        @relay(plural: true) {
          id @required(action: NONE)
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
      `,
      autoScalingRulesFrgmt,
    ),
  );

  return (
    <BAITableAstryx<AutoScalingRuleNode>
      rowKey="id"
      columns={[
        {
          key: 'metricSource',
          title: (
            <BAIFlex gap="xxs" align="center">
              {t('autoScalingRule.MetricSource')}
              <BAIQuestionIconWithTooltip
                title={t('autoScalingRule.MetricSourceTooltip')}
              />
            </BAIFlex>
          ),
          dataIndex: 'metricSource',
          fixed: 'left',
        },
        {
          key: 'condition',
          title: (
            <BAIFlex gap="xxs" align="center">
              {t('autoScalingRule.Condition')}
              <BAIQuestionIconWithTooltip
                title={t('autoScalingRule.ConditionTooltip')}
              />
            </BAIFlex>
          ),
          fixed: 'left',
          render: (_text, row) => {
            if (!row) return '-';
            return (
              <BAINameActionCell
                title={renderCondition(row, t, presetMap)}
                showActions="always"
                actions={[
                  {
                    key: 'edit',
                    title: t('button.Edit'),
                    icon: <SquarePenIcon />,
                    disabled: isEndpointDestroying || !isOwnedByCurrentUser,
                    onClick: () => onEditRule(row.id),
                  },
                  {
                    key: 'delete',
                    title: t('button.Delete'),
                    icon: <Trash2 size="1em" />,
                    type: 'danger',
                    disabled: isEndpointDestroying || !isOwnedByCurrentUser,
                    onClick: () => onDeleteRule(row.id, row.metricName ?? ''),
                  },
                ]}
              />
            );
          },
        },
        {
          key: 'timeWindow',
          title: (
            <BAIFlex gap="xxs" align="center">
              {t('autoScalingRule.CoolDownSeconds')}
              <BAIQuestionIconWithTooltip
                title={t('autoScalingRule.CoolDownTooltip')}
              />
            </BAIFlex>
          ),
          dataIndex: 'timeWindow',
          render: (value: number) =>
            value != null
              ? t('autoScalingRule.CoolDownSecondsValue', { value })
              : '-',
        },
        {
          key: 'stepSize',
          title: (
            <BAIFlex gap="xxs" align="center">
              {t('autoScalingRule.StepSize')}
              <BAIQuestionIconWithTooltip
                title={t('autoScalingRule.StepSizeTooltip')}
              />
            </BAIFlex>
          ),
          dataIndex: 'stepSize',
          render: (_text, row) => {
            if (!row?.stepSize) return '-';
            const hasMin = row.minThreshold != null;
            const hasMax = row.maxThreshold != null;
            if (!hasMin && !hasMax) return '-';
            const sign = hasMin && hasMax ? '±' : hasMax ? '+' : '−';
            return (
              <BAIFlex gap={'xs'}>
                <Text>{sign}</Text>
                <Text>{Math.abs(row.stepSize)}</Text>
              </BAIFlex>
            );
          },
        },
        {
          key: 'minMaxReplicas',
          title: (
            <BAIFlex gap="xxs" align="center">
              {t('autoScalingRule.MIN/MAXReplicas')}
              <BAIQuestionIconWithTooltip
                title={t('autoScalingRule.MinMaxReplicasTooltip')}
              />
            </BAIFlex>
          ),
          render: (_text, row) => {
            if (!row?.stepSize) return '-';
            const hasMin = row.minThreshold != null;
            const hasMax = row.maxThreshold != null;
            if (hasMin && hasMax) {
              return (
                <span>
                  {t('autoScalingRule.MinReplicasValue', {
                    value: row?.minReplicas,
                  })}
                  {' / '}
                  {t('autoScalingRule.MaxReplicasValue', {
                    value: row?.maxReplicas,
                  })}
                </span>
              );
            }
            if (hasMax) {
              return (
                <span>
                  {t('autoScalingRule.MaxReplicasValue', {
                    value: row?.maxReplicas,
                  })}
                </span>
              );
            }
            return (
              <span>
                {t('autoScalingRule.MinReplicasValue', {
                  value: row?.minReplicas,
                })}
              </span>
            );
          },
        },
        {
          key: 'createdAt',
          title: t('autoScalingRule.CreatedAt'),
          dataIndex: 'createdAt',
          sorter: true,
          render: (_text, row) => (
            <span>
              {row?.createdAt ? dayjs(row.createdAt).format('ll LT') : '-'}
            </span>
          ),
        },
        {
          key: 'lastTriggeredAt',
          title: (
            <BAIFlex gap="xxs" align="center">
              {t('autoScalingRule.LastTriggered')}
              <BAIQuestionIconWithTooltip
                title={t('autoScalingRule.LastTriggeredTooltip')}
              />
            </BAIFlex>
          ),
          render: (_text, row) => (
            <span>
              {row?.lastTriggeredAt
                ? dayjs.utc(row.lastTriggeredAt).tz().format('ll LTS')
                : '-'}
            </span>
          ),
        },
      ]}
      dataSource={autoScalingRules}
      {...tableProps}
    />
  );
};

export default AutoScalingRuleListNodes;
