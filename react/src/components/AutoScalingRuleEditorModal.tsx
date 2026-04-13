/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AutoScalingRuleEditorModalCreateMutation } from '../__generated__/AutoScalingRuleEditorModalCreateMutation.graphql';
import {
  AutoScalingRuleEditorModalFragment$data,
  AutoScalingRuleEditorModalFragment$key,
} from '../__generated__/AutoScalingRuleEditorModalFragment.graphql';
import { AutoScalingRuleEditorModalPresetsQuery } from '../__generated__/AutoScalingRuleEditorModalPresetsQuery.graphql';
import { AutoScalingRuleEditorModalUpdateMutation } from '../__generated__/AutoScalingRuleEditorModalUpdateMutation.graphql';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import {
  App,
  AutoComplete,
  Form,
  FormInstance,
  InputNumber,
  Segmented,
  Select,
  Typography,
} from 'antd';
import {
  BAIModal,
  BAIModalProps,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

type ConditionMode = 'single' | 'range';
type ThresholdDirection = 'upper' | 'lower';

interface AutoScalingRuleEditorModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onClose' | 'onCancel'
> {
  modelDeploymentId: string; // raw UUID for create mutation
  autoScalingRuleFrgmt?: AutoScalingRuleEditorModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
  onComplete?: () => void;
}

type AutoScalingRuleFormValues = {
  metricSource: 'KERNEL' | 'INFERENCE_FRAMEWORK' | 'PROMETHEUS';
  metricName: string;
  prometheusQueryPresetId?: string;
  conditionMode: ConditionMode;
  direction: ThresholdDirection;
  threshold?: number;
  minThreshold?: number;
  maxThreshold?: number;
  stepSize: number;
  timeWindow: number;
  minReplicas?: number;
  maxReplicas?: number;
};

const METRIC_NAMES_MAP: Partial<
  Record<'KERNEL' | 'INFERENCE_FRAMEWORK', Array<string>>
> = {
  KERNEL: ['cpu_util', 'mem', 'net_rx', 'net_tx'],
  INFERENCE_FRAMEWORK: [],
};

/**
 * Determines initial condition mode and direction from existing rule data.
 */
const getInitialConditionState = (
  rule: AutoScalingRuleEditorModalFragment$data | null | undefined,
): { mode: ConditionMode; direction: ThresholdDirection } => {
  if (!rule) {
    return { mode: 'single', direction: 'upper' };
  }
  if (rule.minThreshold != null && rule.maxThreshold != null) {
    return { mode: 'range', direction: 'upper' };
  }
  if (rule.minThreshold != null) {
    return { mode: 'single', direction: 'lower' };
  }
  return { mode: 'single', direction: 'upper' };
};

const AutoScalingRuleEditorModal: React.FC<AutoScalingRuleEditorModalProps> = ({
  onRequestClose,
  onComplete,
  modelDeploymentId,
  autoScalingRuleFrgmt,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();

  const autoScalingRule = useFragment(
    graphql`
      fragment AutoScalingRuleEditorModalFragment on AutoScalingRule {
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
      }
    `,
    autoScalingRuleFrgmt ?? null,
  );

  const { prometheusQueryPresets } =
    useLazyLoadQuery<AutoScalingRuleEditorModalPresetsQuery>(
      graphql`
        query AutoScalingRuleEditorModalPresetsQuery {
          prometheusQueryPresets {
            edges {
              node {
                id
                name
                metricName
                queryTemplate
                timeWindow
              }
            }
          }
        }
      `,
      {},
    );

  const presetNodes = React.useMemo(
    () => _.compact(_.map(prometheusQueryPresets?.edges, (edge) => edge?.node)),
    [prometheusQueryPresets],
  );

  const initialCondition = getInitialConditionState(autoScalingRule);
  const [conditionMode, setConditionMode] = useState<ConditionMode>(
    initialCondition.mode,
  );
  const [selectedMetricSource, setSelectedMetricSource] = useState<string>(
    autoScalingRule?.metricSource || 'KERNEL',
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(
    // Match existing rule's prometheusQueryPresetId to a preset's Relay global ID
    autoScalingRule?.prometheusQueryPresetId
      ? presetNodes.find(
          (p) => toLocalId(p.id) === autoScalingRule.prometheusQueryPresetId,
        )?.id
      : undefined,
  );
  const [nameOptions, setNameOptions] = useState<Array<string>>(
    METRIC_NAMES_MAP[
      (autoScalingRule?.metricSource as keyof typeof METRIC_NAMES_MAP) ||
        'KERNEL'
    ] || [],
  );

  const selectedPreset = React.useMemo(
    () => presetNodes.find((p) => p.id === selectedPresetId),
    [presetNodes, selectedPresetId],
  );

  const formRef = useRef<FormInstance<AutoScalingRuleFormValues>>(null);

  const [commitCreateMutation, isInflightCreate] =
    useMutation<AutoScalingRuleEditorModalCreateMutation>(graphql`
      mutation AutoScalingRuleEditorModalCreateMutation(
        $input: CreateAutoScalingRuleInput!
      ) {
        createAutoScalingRule(input: $input) {
          rule {
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
          }
        }
      }
    `);

  const [commitUpdateMutation, isInflightUpdate] =
    useMutation<AutoScalingRuleEditorModalUpdateMutation>(graphql`
      mutation AutoScalingRuleEditorModalUpdateMutation(
        $input: UpdateAutoScalingRuleInput!
      ) {
        updateAutoScalingRule(input: $input) {
          rule {
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
          }
        }
      }
    `);

  const handleOk = () => {
    return formRef.current
      ?.validateFields()
      .then((values) => {
        // Compute minThreshold / maxThreshold based on condition mode
        let minThreshold: number | null = null;
        let maxThreshold: number | null = null;

        if (values.conditionMode === 'range') {
          minThreshold = values.minThreshold ?? null;
          maxThreshold = values.maxThreshold ?? null;
        } else {
          // Single mode
          if (values.direction === 'upper') {
            maxThreshold = values.threshold ?? null;
          } else {
            minThreshold = values.threshold ?? null;
          }
        }

        // Determine metricName: from preset or from form input
        const metricName =
          values.metricSource === 'PROMETHEUS' && selectedPreset
            ? selectedPreset.metricName
            : values.metricName;

        // Determine prometheusQueryPresetId
        const prometheusQueryPresetId =
          values.metricSource === 'PROMETHEUS' && selectedPresetId
            ? toLocalId(selectedPresetId)
            : null;

        if (autoScalingRule) {
          // Update existing rule
          commitUpdateMutation({
            variables: {
              input: {
                id: autoScalingRule.id,
                metricSource: values.metricSource,
                metricName,
                minThreshold:
                  minThreshold != null ? String(minThreshold) : null,
                maxThreshold:
                  maxThreshold != null ? String(maxThreshold) : null,
                stepSize: values.stepSize,
                timeWindow: values.timeWindow,
                minReplicas: values.minReplicas,
                maxReplicas: values.maxReplicas,
                // Note: null means "no change" (UNSET) for update
                prometheusQueryPresetId: prometheusQueryPresetId ?? undefined,
              },
            },
            onCompleted: (_res, errors) => {
              if (errors && errors.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
                onRequestClose(false);
                return;
              }
              message.success(t('autoScalingRule.SuccessfullyUpdated'));
              onComplete?.();
              onRequestClose(true);
            },
            onError: (error) => {
              message.error(error.message);
              onRequestClose(false);
            },
          });
        } else {
          // Create new rule
          commitCreateMutation({
            variables: {
              input: {
                modelDeploymentId,
                metricSource: values.metricSource,
                metricName,
                minThreshold:
                  minThreshold != null ? String(minThreshold) : undefined,
                maxThreshold:
                  maxThreshold != null ? String(maxThreshold) : undefined,
                stepSize: values.stepSize,
                timeWindow: values.timeWindow,
                minReplicas: values.minReplicas,
                maxReplicas: values.maxReplicas,
                prometheusQueryPresetId: prometheusQueryPresetId ?? undefined,
              },
            },
            onCompleted: (_res, errors) => {
              if (errors && errors.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
                onRequestClose(false);
                return;
              }
              message.success(t('autoScalingRule.SuccessfullyCreated'));
              onComplete?.();
              onRequestClose(true);
            },
            onError: (error) => {
              message.error(error.message);
              onRequestClose(false);
            },
          });
        }
      })
      .catch((err) => {
        logger.error(err);
      });
  };

  const handleCancel = () => {
    onRequestClose(false);
  };

  // Build initial form values from existing rule data
  const getInitialValues = (): Partial<AutoScalingRuleFormValues> => {
    if (autoScalingRule) {
      const condition = getInitialConditionState(autoScalingRule);
      let threshold: number | undefined;
      if (condition.mode === 'single') {
        threshold =
          condition.direction === 'upper'
            ? autoScalingRule.maxThreshold != null
              ? Number(autoScalingRule.maxThreshold)
              : undefined
            : autoScalingRule.minThreshold != null
              ? Number(autoScalingRule.minThreshold)
              : undefined;
      }
      return {
        metricSource:
          autoScalingRule.metricSource as AutoScalingRuleFormValues['metricSource'],
        metricName: autoScalingRule.metricName,
        conditionMode: condition.mode,
        direction: condition.direction,
        threshold,
        minThreshold:
          autoScalingRule.minThreshold != null
            ? Number(autoScalingRule.minThreshold)
            : undefined,
        maxThreshold:
          autoScalingRule.maxThreshold != null
            ? Number(autoScalingRule.maxThreshold)
            : undefined,
        stepSize: Math.abs(autoScalingRule.stepSize),
        timeWindow: autoScalingRule.timeWindow,
        minReplicas: autoScalingRule.minReplicas ?? undefined,
        maxReplicas: autoScalingRule.maxReplicas ?? undefined,
      };
    }
    return {
      metricSource: 'KERNEL',
      conditionMode: 'single',
      direction: 'upper',
      stepSize: 1,
      timeWindow: 300,
      minReplicas: 0,
      maxReplicas: 5,
    };
  };

  const isPrometheus = selectedMetricSource === 'PROMETHEUS';

  return (
    <BAIModal
      {...baiModalProps}
      destroyOnHidden
      onOk={handleOk}
      onCancel={handleCancel}
      centered
      title={
        autoScalingRule
          ? t('autoScalingRule.EditAutoScalingRule')
          : t('autoScalingRule.AddAutoScalingRule')
      }
      confirmLoading={isInflightCreate || isInflightUpdate}
    >
      <Form
        ref={formRef}
        layout={'vertical'}
        initialValues={getInitialValues()}
      >
        {/* Metric Source */}
        <Form.Item
          label={t('autoScalingRule.MetricSource')}
          name={'metricSource'}
          rules={[{ required: true }]}
        >
          <Select
            onChange={(value) => {
              setSelectedMetricSource(value);
              if (value !== 'PROMETHEUS') {
                setNameOptions(
                  METRIC_NAMES_MAP[value as keyof typeof METRIC_NAMES_MAP] ||
                    [],
                );
                setSelectedPresetId(undefined);
              }
            }}
            options={[
              { label: 'Kernel', value: 'KERNEL' },
              {
                label: 'Inference Framework',
                value: 'INFERENCE_FRAMEWORK',
              },
              { label: 'Prometheus', value: 'PROMETHEUS' },
            ]}
          />
        </Form.Item>

        {/* Metric Name (KERNEL / INFERENCE_FRAMEWORK) */}
        {!isPrometheus && (
          <Form.Item
            label={t('autoScalingRule.MetricName')}
            name={'metricName'}
            rules={[{ required: true }]}
          >
            <AutoComplete
              placeholder={t('autoScalingRule.MetricName')}
              options={_.map(nameOptions, (name) => ({
                label: name,
                value: name,
              }))}
              onSearch={(text) => {
                const source = (formRef.current?.getFieldValue(
                  'metricSource',
                ) || 'KERNEL') as keyof typeof METRIC_NAMES_MAP;
                setNameOptions(
                  _.filter(METRIC_NAMES_MAP[source] || [], (name) =>
                    name.includes(text),
                  ),
                );
              }}
              allowClear
              popupMatchSelectWidth={false}
            />
          </Form.Item>
        )}

        {/* Prometheus Preset (PROMETHEUS only) */}
        {isPrometheus && (
          <>
            <Form.Item
              label={t('autoScalingRule.PrometheusPreset')}
              required
              rules={[
                {
                  validator: () => {
                    if (!selectedPresetId) {
                      return Promise.reject(
                        new Error(
                          t('autoScalingRule.PrometheusPresetRequired'),
                        ),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                value={selectedPresetId}
                onChange={(value) => {
                  setSelectedPresetId(value);
                  const preset = presetNodes.find((p) => p.id === value);
                  if (preset) {
                    // Auto-fill metricName
                    formRef.current?.setFieldsValue({
                      metricName: preset.metricName,
                    });
                    // Auto-apply timeWindow from preset; always update to avoid
                    // stale values when switching between presets
                    const tw =
                      preset.timeWindow != null
                        ? Number(preset.timeWindow)
                        : undefined;
                    formRef.current?.setFieldsValue({
                      timeWindow: tw != null && !isNaN(tw) ? tw : undefined,
                    });
                  }
                }}
                placeholder={t('autoScalingRule.SelectPrometheusPreset')}
                options={_.map(presetNodes, (preset) => ({
                  label: preset.name,
                  value: preset.id,
                }))}
                allowClear
                onClear={() => setSelectedPresetId(undefined)}
              />
            </Form.Item>
            {selectedPreset && (
              <Form.Item label={t('autoScalingRule.QueryTemplate')}>
                <Typography.Text
                  code
                  style={{
                    display: 'block',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedPreset.queryTemplate}
                </Typography.Text>
              </Form.Item>
            )}
          </>
        )}

        {/* Condition Mode (Single / Range) */}
        <Form.Item
          label={t('autoScalingRule.Condition')}
          required
          tooltip={t('autoScalingRule.ConditionTooltip')}
        >
          <Form.Item name={'conditionMode'} noStyle>
            <Segmented
              options={[
                {
                  label: t('autoScalingRule.Single'),
                  value: 'single',
                },
                {
                  label: t('autoScalingRule.Range'),
                  value: 'range',
                },
              ]}
              onChange={(value) => {
                setConditionMode(value as ConditionMode);
              }}
              style={{ marginBottom: 12 }}
            />
          </Form.Item>

          {conditionMode === 'single' ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
              <Form.Item
                name={'direction'}
                noStyle
                rules={[{ required: true }]}
              >
                <Select
                  style={{ width: 120 }}
                  options={[
                    {
                      label: t('autoScalingRule.Upper'),
                      value: 'upper',
                    },
                    {
                      label: t('autoScalingRule.Lower'),
                      value: 'lower',
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name={'threshold'}
                noStyle
                rules={[
                  {
                    required: true,
                    message: t('autoScalingRule.ThresholdRequired'),
                  },
                  {
                    type: 'number',
                    min: 0,
                    message: t('autoScalingRule.ThresholdMustBePositive'),
                  },
                ]}
              >
                <InputNumber
                  placeholder={t('autoScalingRule.Threshold')}
                  style={{ flex: 1, width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
              <Form.Item
                name={'minThreshold'}
                noStyle
                rules={[
                  {
                    required: true,
                    message: t('autoScalingRule.MinThresholdRequired'),
                  },
                  {
                    type: 'number',
                    min: 0,
                    message: t('autoScalingRule.ThresholdMustBePositive'),
                  },
                ]}
              >
                <InputNumber
                  placeholder={t('autoScalingRule.MinThreshold')}
                  style={{ flex: 1, width: '100%' }}
                  min={0}
                />
              </Form.Item>
              <Typography.Text style={{ lineHeight: '32px', flexShrink: 0 }}>
                {'<'} metric {'<'}
              </Typography.Text>
              <Form.Item
                name={'maxThreshold'}
                noStyle
                dependencies={['minThreshold']}
                rules={[
                  {
                    required: true,
                    message: t('autoScalingRule.MaxThresholdRequired'),
                  },
                  {
                    type: 'number',
                    min: 0,
                    message: t('autoScalingRule.ThresholdMustBePositive'),
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const min = getFieldValue('minThreshold');
                      if (min != null && value != null && min >= value) {
                        return Promise.reject(
                          new Error(t('autoScalingRule.MinMustBeLessThanMax')),
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber
                  placeholder={t('autoScalingRule.MaxThreshold')}
                  style={{ flex: 1, width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </div>
          )}
        </Form.Item>

        {/* Step Size */}
        <Form.Item
          label={t('autoScalingRule.StepSize')}
          name={'stepSize'}
          rules={[
            { required: true },
            {
              type: 'number',
              min: 1,
              max: SIGNED_32BIT_MAX_INT,
            },
            {
              validator: (_, value) => {
                if (value % 1 !== 0) {
                  return Promise.reject(
                    new Error(t('error.OnlyPositiveIntegersAreAllowed')),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber min={1} step={1} style={{ width: '100%' }} />
        </Form.Item>

        {/* Time Window (seconds) */}
        <Form.Item
          label={t('autoScalingRule.TimeWindow')}
          name={'timeWindow'}
          rules={[
            { required: true },
            {
              type: 'number',
              min: 1,
            },
            {
              validator: (_, value) => {
                if (value % 1 !== 0) {
                  return Promise.reject(
                    new Error(t('error.OnlyPositiveIntegersAreAllowed')),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          tooltip={t('autoScalingRule.TimeWindowTooltip')}
        >
          <InputNumber
            min={1}
            step={1}
            style={{ width: '100%' }}
            addonAfter="s"
          />
        </Form.Item>

        {/* Min Replicas */}
        <Form.Item
          label={t('autoScalingRule.MinReplicas')}
          name={'minReplicas'}
          rules={[
            {
              min: 0,
              max: SIGNED_32BIT_MAX_INT,
              type: 'number',
            },
            {
              validator: (_, value) => {
                if (value != null && value % 1 !== 0) {
                  return Promise.reject(
                    new Error(t('error.OnlyPositiveIntegersAreAllowed')),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            min={0}
            max={SIGNED_32BIT_MAX_INT}
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* Max Replicas */}
        <Form.Item
          label={t('autoScalingRule.MaxReplicas')}
          name={'maxReplicas'}
          rules={[
            {
              min: 0,
              max: SIGNED_32BIT_MAX_INT,
              type: 'number',
            },
            {
              validator: (_, value) => {
                if (value != null && value % 1 !== 0) {
                  return Promise.reject(
                    new Error(t('error.OnlyPositiveIntegersAreAllowed')),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            min={0}
            max={SIGNED_32BIT_MAX_INT}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default AutoScalingRuleEditorModal;
