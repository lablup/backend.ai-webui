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
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import PrometheusQueryTemplatePreview from './PrometheusQueryTemplatePreview';
import {
  AstryxFormNumberInput,
  AstryxFormSegmented,
  AstryxFormSelector,
  AstryxFormTextInput,
  type AstryxFormSelectorOptions,
} from './astryxFormControls';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAISkeleton,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { RefObject, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

type ConditionMode = 'scale_in' | 'scale_out' | 'scale_in_out';

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
 * Determines the initial condition mode from existing rule data.
 *
 *   maxThreshold only set → 'scale_out' (trigger when maxThreshold < metric)
 *   minThreshold only set → 'scale_in'  (trigger when metric < minThreshold)
 *   both set              → 'scale_in_out'
 */
const getInitialConditionMode = (
  rule: AutoScalingRuleEditorModalFragment$data | null | undefined,
): ConditionMode => {
  if (!rule) {
    return 'scale_out';
  }
  if (rule.minThreshold != null && rule.maxThreshold != null) {
    return 'scale_in_out';
  }
  if (rule.maxThreshold != null) {
    return 'scale_out';
  }
  return 'scale_in';
};

/**
 * Inner form content — contains the presetsQuery (which may suspend on first load)
 * and all form UI. Wrapped in a Suspense boundary by the outer modal component
 * so Suspense does not bubble up to the page-level boundary.
 */
const AutoScalingRuleEditorModalContent: React.FC<{
  autoScalingRule: AutoScalingRuleEditorModalFragment$data | null;
  formRef: RefObject<FormInstance<AutoScalingRuleFormValues>>;
}> = ({ autoScalingRule, formRef }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const baiClient = useSuspendedBackendaiClient();
  const currentUserRole = useCurrentUserRole();
  const isSupportPrometheusAutoScalingRule = baiClient.supports(
    'prometheus-auto-scaling-rule',
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
                description
                rank
                categoryId
                metricName
                queryTemplate
                timeWindow
                category @since(version: "26.4.3") {
                  id
                  name
                }
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

  const [conditionMode, setConditionMode] = useState<ConditionMode>(
    getInitialConditionMode(autoScalingRule),
  );
  const [selectedMetricSource, setSelectedMetricSource] = useState<string>(
    autoScalingRule?.metricSource || 'KERNEL',
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(
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

  type PresetOption = {
    label: string;
    value: string;
  };

  // Group presets by category name for optgroup display.
  // Presets without a category are shown in a flat list at the end.
  // antd `DefaultOptionType` (a type-only antd import, §6) -> Astryx's own
  // `SelectorOptionType` union, reached through the adapter's
  // `AstryxFormSelectorOptions`. antd's `<OptGroup>`-shaped `{label, options}`
  // becomes Astryx's `{type: 'section', title, options}`.
  const presetOptions: AstryxFormSelectorOptions = React.useMemo(() => {
    const sorted = _.orderBy(presetNodes, ['rank'], ['asc']);
    const withCategory = sorted.filter((p) => p.category?.name);
    const withoutCategory = sorted.filter((p) => !p.category?.name);

    const toOption = (preset: (typeof sorted)[number]): PresetOption => ({
      label: preset.name,
      value: preset.id,
    });

    const grouped = _.groupBy(withCategory, (p) => p.category!.name);
    const groupOptions = Object.entries(grouped).map(([catName, presets]) => ({
      type: 'section' as const,
      title: catName,
      options: presets.map(toOption),
    }));

    return withoutCategory.length > 0
      ? [...groupOptions, ...withoutCategory.map(toOption)]
      : groupOptions;
  }, [presetNodes]);

  // Build initial form values from existing rule data
  const getInitialValues = (): Partial<AutoScalingRuleFormValues> => {
    if (autoScalingRule) {
      const mode = getInitialConditionMode(autoScalingRule);
      // In scale_in/scale_out modes, the single `threshold` field is bound to the
      // corresponding min/max threshold from the rule.
      let threshold: number | undefined;
      if (mode === 'scale_in' && autoScalingRule.minThreshold != null) {
        threshold = Number(autoScalingRule.minThreshold);
      } else if (mode === 'scale_out' && autoScalingRule.maxThreshold != null) {
        threshold = Number(autoScalingRule.maxThreshold);
      }
      return {
        metricSource:
          autoScalingRule.metricSource as AutoScalingRuleFormValues['metricSource'],
        metricName: autoScalingRule.metricName,
        prometheusQueryPresetId: selectedPresetId,
        conditionMode: mode,
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
      conditionMode: 'scale_out',
      stepSize: 1,
      timeWindow: 300,
      minReplicas: 0,
      maxReplicas: 5,
    };
  };

  const isPrometheus = selectedMetricSource === 'PROMETHEUS';

  return (
    <Form ref={formRef} layout={'vertical'} initialValues={getInitialValues()}>
      {/* Metric Source */}
      <Form.Item
        label={t('autoScalingRule.MetricSource')}
        name={'metricSource'}
        tooltip={t('autoScalingRule.MetricSourceTooltip')}
        rules={[{ required: true }]}
      >
        <AstryxFormSelector
          label={t('autoScalingRule.MetricSource')}
          onChange={(value) => {
            if (!value) return;
            setSelectedMetricSource(value);
            // Clear metricName whenever source changes (issue: stale name from previous source)
            formRef.current?.setFieldsValue({ metricName: undefined });
            if (value !== 'PROMETHEUS') {
              setNameOptions(
                METRIC_NAMES_MAP[value as keyof typeof METRIC_NAMES_MAP] || [],
              );
              setSelectedPresetId(undefined);
            } else {
              // Restore selectedPresetId state from form value when switching back to PROMETHEUS,
              // otherwise the preview won't appear even after a preset was previously chosen.
              const existingPresetId = formRef.current?.getFieldValue(
                'prometheusQueryPresetId',
              );
              if (existingPresetId) {
                setSelectedPresetId(existingPresetId);
              }
            }
          }}
          options={[
            {
              label: t('autoScalingRule.MetricSourceKernel'),
              value: 'KERNEL',
            },
            ...(!isSupportPrometheusAutoScalingRule
              ? [
                  {
                    label: t('autoScalingRule.MetricSourceInferenceFramework'),
                    value: 'INFERENCE_FRAMEWORK',
                  },
                ]
              : []),
            {
              label: t('autoScalingRule.MetricSourcePrometheus'),
              value: 'PROMETHEUS',
            },
          ]}
        />
      </Form.Item>

      {/* Metric Name (KERNEL / INFERENCE_FRAMEWORK) — always mounted so validateFields includes it.
          PILOT-DECISION: antd `AutoComplete` -> `AstryxFormTextInput`.
          MAPPING §3.15 is explicit that free-text AutoComplete does NOT map to
          `Typeahead` (which commits `T | null` and cannot keep a typed
          string), and free text is REQUIRED here: `METRIC_NAMES_MAP` has an
          EMPTY list for `INFERENCE_FRAMEWORK`, so a `Selector` would leave that
          source unfillable. The suggestion dropdown is therefore dropped; the
          known names are surfaced in the placeholder instead of being rebuilt
          as `TextInput` + `Popover`, so nothing is lost from view and no new
          i18n string is introduced. The `onSearch` client-side filter goes with
          it. */}
      <Form.Item
        label={t('autoScalingRule.MetricName')}
        name={'metricName'}
        hidden={isPrometheus}
        tooltip={t('autoScalingRule.MetricNameTooltip')}
        rules={[{ required: !isPrometheus }]}
      >
        <AstryxFormTextInput
          label={t('autoScalingRule.MetricName')}
          placeholder={
            nameOptions.length > 0
              ? nameOptions.join(', ')
              : t('autoScalingRule.MetricName')
          }
          allowClear
        />
      </Form.Item>

      {/* Prometheus Preset (PROMETHEUS only) */}
      {isPrometheus && (
        <>
          {/* antd `showSearch.filterOption` -> `hasSearch`: Astryx `Selector`
              filters on the option label itself, which is exactly what the
              predicate did.
              PILOT-DECISION: the per-option `description` line under each
              preset name is DROPPED (P26-3 / MAPPING §3.1 — Astryx option data
              carries `value`/`label`/`icon` only, and rich option rows need the
              ComplexSelector track this static list does not warrant). The
              category grouping survives as a Selector `section`. */}
          <Form.Item
            label={`${t('autoScalingRule.MetricName')} (${t('autoScalingRule.PrometheusPreset')})`}
            name="prometheusQueryPresetId"
            tooltip={t('autoScalingRule.PrometheusPresetTooltip')}
            rules={[
              {
                required: true,
                message: t('autoScalingRule.PrometheusPresetRequired'),
              },
            ]}
            extra={
              currentUserRole === 'superadmin' && selectedPreset ? (
                <PrometheusQueryTemplatePreview
                  key={selectedPreset.id}
                  queryTemplate={selectedPreset.queryTemplate}
                />
              ) : undefined
            }
          >
            <AstryxFormSelector
              label={t('autoScalingRule.PrometheusPreset')}
              onChange={(value) => {
                setSelectedPresetId(value ?? undefined);
                const preset = presetNodes.find((p) => p.id === value);
                if (preset) {
                  // Auto-fill metricName
                  formRef.current?.setFieldsValue({
                    metricName: preset.metricName,
                  });
                  // Auto-apply timeWindow from preset only when the preset
                  // provides a valid value; otherwise keep the existing value
                  // (e.g. the default 300) to avoid unexpected clearing.
                  const tw =
                    preset.timeWindow != null
                      ? Number(preset.timeWindow)
                      : undefined;
                  if (tw != null && !isNaN(tw)) {
                    formRef.current?.setFieldsValue({ timeWindow: tw });
                  }
                }
              }}
              placeholder={t('autoScalingRule.SelectPrometheusPreset')}
              hasSearch
              options={presetOptions}
              hasClear
            />
          </Form.Item>
        </>
      )}

      {/* Condition Mode (Scale In / Scale Out / Scale In & Out) */}
      <Form.Item
        label={t('autoScalingRule.Condition')}
        required
        tooltip={t('autoScalingRule.ConditionTooltip')}
      >
        {/* antd `Radio.Group optionType="button"` -> `SegmentedControl` via
            the form adapter (MAPPING §3.10). `onChange` takes the VALUE, not
            the event (P3), and the `marginBottom` moves to a wrapper because
            Astryx controls take no `style` escape hatch for layout. */}
        <div style={{ marginBottom: token('--spacing-3') }}>
          <Form.Item name={'conditionMode'} noStyle>
            <AstryxFormSegmented
              label={t('autoScalingRule.Condition')}
              onChange={(value) => {
                setConditionMode(value as ConditionMode);
              }}
              options={[
                {
                  label: t('autoScalingRule.ScaleIn'),
                  value: 'scale_in',
                },
                {
                  label: t('autoScalingRule.ScaleOut'),
                  value: 'scale_out',
                },
                {
                  label: t('autoScalingRule.ScaleInAndOut'),
                  value: 'scale_in_out',
                },
              ]}
            />
          </Form.Item>
        </div>

        {conditionMode === 'scale_in' && (
          <BAIFlex align="center" gap="xs">
            <Text style={{ flexShrink: 0 }}>
              {t('autoScalingRule.Metric')} {'<'}
            </Text>
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
                  message: t('autoScalingRule.ThresholdMustBeNonNegative'),
                },
              ]}
            >
              <AstryxFormNumberInput
                label={t('autoScalingRule.MinThreshold')}
                placeholder={t('autoScalingRule.MinThreshold')}
                min={0}
              />
            </Form.Item>
          </BAIFlex>
        )}

        {conditionMode === 'scale_out' && (
          <BAIFlex align="center" gap="xs">
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
                  message: t('autoScalingRule.ThresholdMustBeNonNegative'),
                },
              ]}
            >
              <AstryxFormNumberInput
                label={t('autoScalingRule.MaxThreshold')}
                placeholder={t('autoScalingRule.MaxThreshold')}
                min={0}
              />
            </Form.Item>
            <Text style={{ flexShrink: 0 }}>
              {'<'} {t('autoScalingRule.Metric')}
            </Text>
          </BAIFlex>
        )}

        {conditionMode === 'scale_in_out' && (
          <BAIFlex direction="column" gap={'xs'} align="stretch">
            <BAIFlex align="center" gap="xs">
              <Text style={{ flexShrink: 0 }}>
                {t('autoScalingRule.Metric')} {'<'}
              </Text>
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
                    message: t('autoScalingRule.ThresholdMustBeNonNegative'),
                  },
                ]}
              >
                <AstryxFormNumberInput
                  label={t('autoScalingRule.MinThreshold')}
                  placeholder={t('autoScalingRule.MinThreshold')}
                  min={0}
                />
              </Form.Item>
            </BAIFlex>
            <BAIFlex align="center" gap="xs">
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
                    message: t('autoScalingRule.ThresholdMustBeNonNegative'),
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
                <AstryxFormNumberInput
                  label={t('autoScalingRule.MaxThreshold')}
                  placeholder={t('autoScalingRule.MaxThreshold')}
                  min={0}
                />
              </Form.Item>
              <Text style={{ flexShrink: 0 }}>
                {'<'} {t('autoScalingRule.Metric')}
              </Text>
            </BAIFlex>
          </BAIFlex>
        )}
      </Form.Item>

      {/* Step Size */}
      {/* PILOT-DECISION: antd `InputNumber prefix` (the ±/+/− sign) has no
          `NumberInput` destination — `startIcon` takes an icon COMPONENT, not
          text (MAPPING §3.17). The sign moves next to the field as its own
          `Text`, the same shape the threshold rows above already use, so the
          information stays on screen without a per-component CSS block. The
          field's `name`/`rules` move to a `noStyle` inner item (antd's own
          pattern for a decorated control, already used by Condition above);
          errors still surface on the outer item through `NoStyleItemContext`. */}
      <Form.Item
        label={t('autoScalingRule.StepSize')}
        required
        tooltip={t('autoScalingRule.StepSizeTooltip')}
      >
        <BAIFlex align="center" gap="xs">
          <Text color="secondary" style={{ flexShrink: 0 }}>
            {conditionMode === 'scale_in_out'
              ? '±'
              : conditionMode === 'scale_out'
                ? '+'
                : '−'}
          </Text>
          <Form.Item
            name={'stepSize'}
            noStyle
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
            <AstryxFormNumberInput
              label={t('autoScalingRule.StepSize')}
              min={1}
              step={1}
            />
          </Form.Item>
        </BAIFlex>
      </Form.Item>

      {/* Cooldown Sec. */}
      <Form.Item
        label={t('autoScalingRule.CoolDownSeconds')}
        name={'timeWindow'}
        tooltip={t('autoScalingRule.CoolDownTooltip')}
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
      >
        {/* antd `InputNumber suffix` (a unit string) -> `NumberInput units`
            (MAPPING §3.17 — the one place Astryx is better than antd here). */}
        <AstryxFormNumberInput
          label={t('autoScalingRule.CoolDownSeconds')}
          min={1}
          step={1}
          units={t('autoScalingRule.Seconds')}
        />
      </Form.Item>

      {/* Min Replicas */}
      <Form.Item
        label={t('autoScalingRule.MinReplicas')}
        name={'minReplicas'}
        tooltip={t('autoScalingRule.MinReplicasTooltip')}
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
        <AstryxFormNumberInput
          label={t('autoScalingRule.MinReplicas')}
          min={0}
          max={SIGNED_32BIT_MAX_INT}
        />
      </Form.Item>

      {/* Max Replicas */}
      <Form.Item
        label={t('autoScalingRule.MaxReplicas')}
        name={'maxReplicas'}
        tooltip={t('autoScalingRule.MaxReplicasTooltip')}
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
        <AstryxFormNumberInput
          label={t('autoScalingRule.MaxReplicas')}
          min={0}
          max={SIGNED_32BIT_MAX_INT}
        />
      </Form.Item>
    </Form>
  );
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

        if (values.conditionMode === 'scale_in_out') {
          minThreshold = values.minThreshold ?? null;
          maxThreshold = values.maxThreshold ?? null;
        } else if (values.conditionMode === 'scale_in') {
          // Metric < minThreshold
          minThreshold = values.threshold ?? null;
        } else {
          // 'scale_out': maxThreshold < Metric
          maxThreshold = values.threshold ?? null;
        }

        // metricName is always set in the form (auto-filled for PROMETHEUS presets)
        const metricName = values.metricName;

        // Determine prometheusQueryPresetId
        const prometheusQueryPresetId =
          values.metricSource === 'PROMETHEUS' && values.prometheusQueryPresetId
            ? toLocalId(values.prometheusQueryPresetId)
            : null;

        if (autoScalingRule) {
          // Update existing rule
          commitUpdateMutation({
            variables: {
              input: {
                id: toLocalId(autoScalingRule.id),
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
                // Keep modal open so the user can correct the input and retry
                return;
              }
              message.success(t('autoScalingRule.SuccessfullyUpdated'));
              onComplete?.();
              onRequestClose(true);
            },
            onError: (error) => {
              message.error(error.message);
              // Keep modal open so the user can correct the input and retry
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
                  minThreshold != null ? String(minThreshold) : null,
                maxThreshold:
                  maxThreshold != null ? String(maxThreshold) : null,
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
                // Keep modal open so the user can correct the input and retry
                return;
              }
              message.success(t('autoScalingRule.SuccessfullyCreated'));
              onComplete?.();
              onRequestClose(true);
            },
            onError: (error) => {
              message.error(error.message);
              // Keep modal open so the user can correct the input and retry
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

  return (
    <BAIModal
      {...baiModalProps}
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
      <ErrorBoundaryWithNullFallback>
        <React.Suspense fallback={<BAISkeleton rows={6} />}>
          <AutoScalingRuleEditorModalContent
            autoScalingRule={autoScalingRule ?? null}
            formRef={
              formRef as RefObject<FormInstance<AutoScalingRuleFormValues>>
            }
          />
        </React.Suspense>
      </ErrorBoundaryWithNullFallback>
    </BAIModal>
  );
};

export default AutoScalingRuleEditorModal;
