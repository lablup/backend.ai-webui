/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RuntimeParameterDef,
  RuntimeParameterCategory,
} from '../constants/runtimeParameterFallbacks';
import {
  mergeExtraArgs,
  reverseMapExtraArgs,
} from '../helper/runtimeExtraArgsParser';
import {
  RuntimeParameterGroup,
  useRuntimeParameterSchema,
  buildDefaultsMap,
  buildSchemaKeySet,
} from '../hooks/useRuntimeParameterSchema';
import InputNumberWithSlider from './InputNumberWithSlider';
import { Alert, Checkbox, Form, InputNumber, Select, Input, theme } from 'antd';
import { BAICard, BAIFlex } from 'backend.ai-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const CATEGORY_LABELS: Record<RuntimeParameterCategory, string> = {
  sampling: 'modelService.RuntimeParamCategorySampling',
  context: 'modelService.RuntimeParamCategoryContext',
  advanced: 'modelService.RuntimeParamCategoryAdvanced',
};

const ALL_CATEGORIES: RuntimeParameterCategory[] = [
  'sampling',
  'context',
  'advanced',
];

export interface RuntimeParameterValues {
  [key: string]: string;
}

interface RuntimeParameterFormSectionProps {
  runtimeVariant: string;
  onChange?: (values: RuntimeParameterValues) => void;
  /** Existing extra args string for edit mode reverse-mapping */
  initialExtraArgs?: string;
}

/**
 * Dynamic form section for runtime parameters (vLLM/SGLang).
 * Renders slider/input/select/checkbox controls based on parameter schema.
 */
const RuntimeParameterFormSection: React.FC<
  RuntimeParameterFormSectionProps
> = ({ runtimeVariant, onChange, initialExtraArgs }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const groups = useRuntimeParameterSchema(runtimeVariant);

  const [internalValues, setInternalValues] = useState<RuntimeParameterValues>(
    {},
  );
  const values = internalValues;

  const [activeTab, setActiveTab] =
    useState<RuntimeParameterCategory>('sampling');

  const setValues = useCallback(
    (newValues: RuntimeParameterValues) => {
      setInternalValues(newValues);
      onChange?.(newValues);
    },
    [onChange],
  );

  // Initialize from defaults or reverse-map from existing extra args
  useEffect(() => {
    if (!groups) return;

    const defaults = buildDefaultsMap(groups);

    if (initialExtraArgs) {
      const schemaKeys = buildSchemaKeySet(groups);
      const { mappedArgs } = reverseMapExtraArgs(initialExtraArgs, schemaKeys);
      setValues({ ...defaults, ...mappedArgs });
    } else {
      setValues(defaults);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeVariant, initialExtraArgs]);

  const handleParamChange = useCallback(
    (key: string, newValue: string) => {
      const updated = { ...values, [key]: newValue };
      setValues(updated);
    },
    [values, setValues],
  );

  if (!groups) return null;

  // Build tab list from available categories
  const availableCategories = ALL_CATEGORIES.filter((cat) =>
    groups.some((g) => g.category === cat),
  );
  const tabList = availableCategories.map((cat) => ({
    key: cat,
    label: t(CATEGORY_LABELS[cat]),
  }));

  // Fall back to first available tab if current tab doesn't exist for this variant
  const effectiveActiveTab = availableCategories.includes(activeTab)
    ? activeTab
    : (availableCategories[0] ?? 'sampling');
  const activeGroup = groups.find((g) => g.category === effectiveActiveTab);

  return (
    <Form.Item label={t('modelService.RuntimeParamTitle')}>
      <BAICard
        size="small"
        tabList={tabList}
        activeTabKey={effectiveActiveTab}
        onTabChange={(key) => setActiveTab(key as RuntimeParameterCategory)}
      >
        <Alert
          type="info"
          showIcon
          title={t('modelService.RuntimeParamUnchangedHint')}
          style={{ marginBottom: token.marginSM }}
        />
        {activeGroup && (
          <ParameterGroupContent
            group={activeGroup}
            values={values}
            onParamChange={handleParamChange}
          />
        )}
      </BAICard>
    </Form.Item>
  );
};

interface ParameterGroupContentProps {
  group: RuntimeParameterGroup;
  values: RuntimeParameterValues;
  onParamChange: (key: string, value: string) => void;
}

const ParameterGroupContent: React.FC<ParameterGroupContentProps> = ({
  group,
  values,
  onParamChange,
}) => {
  return (
    <BAIFlex direction="column" gap="xxs" align="stretch">
      {group.params.map((param) => (
        <ParameterControl
          key={param.key}
          param={param}
          value={values[param.key] ?? param.defaultValue}
          onChange={(val) => onParamChange(param.key, val)}
        />
      ))}
    </BAIFlex>
  );
};

interface ParameterControlProps {
  param: RuntimeParameterDef;
  value: string;
  onChange: (value: string) => void;
}

const ParameterControl: React.FC<ParameterControlProps> = ({
  param,
  value,
  onChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const label = t(param.name);
  const tooltip = t(param.description);

  switch (param.uiType) {
    case 'slider':
      return (
        <Form.Item
          label={label}
          tooltip={tooltip}
          style={{ marginBottom: token.marginXS }}
        >
          <InputNumberWithSlider
            min={param.min}
            max={param.max}
            step={param.step}
            value={parseFloat(value)}
            onChange={(v) => onChange(String(v))}
            inputContainerMinWidth={190}
            sliderProps={{
              marks: {
                ...(param.min !== undefined ? { [param.min]: param.min } : {}),
                ...(param.max !== undefined
                  ? {
                      [param.max]: {
                        style: { color: token.colorTextSecondary },
                        label: param.max,
                      },
                    }
                  : {}),
              },
            }}
          />
        </Form.Item>
      );

    case 'number_input':
      return (
        <Form.Item
          label={label}
          tooltip={tooltip}
          style={{ marginBottom: token.marginXS }}
        >
          <InputNumber
            min={param.min}
            max={param.max}
            step={param.step}
            value={
              param.valueType === 'int'
                ? parseInt(value, 10)
                : parseFloat(value)
            }
            onChange={(v) => {
              if (v !== null) onChange(String(v));
            }}
            style={{ width: '100%' }}
          />
        </Form.Item>
      );

    case 'select':
      return (
        <Form.Item
          label={label}
          tooltip={tooltip}
          style={{ marginBottom: token.marginXS }}
        >
          <Select
            value={value}
            onChange={onChange}
            options={param.options?.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </Form.Item>
      );

    case 'checkbox':
      return (
        <Form.Item
          label={label}
          tooltip={tooltip}
          style={{ marginBottom: token.marginXS }}
        >
          <Checkbox
            checked={value === 'true'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            aria-label={label}
          >
            {t('general.Enable')}
          </Checkbox>
        </Form.Item>
      );

    case 'text_input':
    default:
      return (
        <Form.Item
          label={label}
          tooltip={tooltip}
          style={{ marginBottom: token.marginXS }}
        >
          <Input value={value} onChange={(e) => onChange(e.target.value)} />
        </Form.Item>
      );
  }
};

export default RuntimeParameterFormSection;

/**
 * Helper to generate the final EXTRA_ARGS string from runtime parameter values.
 * This is used by the parent form when submitting.
 */
export function buildExtraArgsString(
  paramValues: RuntimeParameterValues,
  manualExtraArgs: string,
  groups: RuntimeParameterGroup[],
): string {
  const defaults = buildDefaultsMap(groups);
  return mergeExtraArgs(paramValues, manualExtraArgs, defaults);
}
