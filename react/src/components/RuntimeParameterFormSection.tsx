/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RuntimeParameterDef,
  RuntimeParameterCategory,
} from '../constants/runtimeParameterFallbacks';
import { reverseMapExtraArgs } from '../helper/runtimeExtraArgsParser';
import {
  RuntimeParameterGroup,
  useRuntimeParameterSchema,
  buildDefaultsMap,
  buildSchemaKeySet,
} from '../hooks/useRuntimeParameterSchema';
import InputNumberWithSlider from './InputNumberWithSlider';
import { Checkbox, Form, InputNumber, Select, Input, theme } from 'antd';
import { BAIAlert, BAICard, BAIFlex } from 'backend.ai-ui';
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
  /** Called when the set of touched parameter keys changes */
  onTouchedKeysChange?: (touchedKeys: Set<string>) => void;
  /** Existing extra args string for edit mode reverse-mapping */
  initialExtraArgs?: string;
}

/**
 * Dynamic form section for runtime parameters (vLLM/SGLang).
 * Renders slider/input/select/checkbox controls based on parameter schema.
 */
const RuntimeParameterFormSection: React.FC<
  RuntimeParameterFormSectionProps
> = ({ runtimeVariant, onChange, onTouchedKeysChange, initialExtraArgs }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const groups = useRuntimeParameterSchema(runtimeVariant);

  const [internalValues, setInternalValues] = useState<RuntimeParameterValues>(
    {},
  );
  const values = internalValues;

  // Track which parameter keys the user has explicitly interacted with.
  // In edit mode, keys already present in the endpoint's env vars are pre-marked.
  const [touchedKeys, setTouchedKeys] = useState<Set<string>>(new Set());

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
      // Pre-mark keys from existing env vars as touched
      const initialTouched = new Set(Object.keys(mappedArgs));
      setTouchedKeys(initialTouched);
      onTouchedKeysChange?.(initialTouched);
    } else {
      setValues(defaults);
      setTouchedKeys(new Set());
      onTouchedKeysChange?.(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeVariant, initialExtraArgs]);

  const handleParamChange = useCallback(
    (key: string, newValue: string) => {
      setInternalValues((prev) => {
        const updated = { ...prev, [key]: newValue };
        // Notify parent outside updater to keep it pure
        queueMicrotask(() => onChange?.(updated));
        return updated;
      });
      setTouchedKeys((prev) => {
        if (prev.has(key)) return prev;
        const next = new Set(prev);
        next.add(key);
        // Notify parent outside updater to keep it pure
        queueMicrotask(() => onTouchedKeysChange?.(next));
        return next;
      });
    },
    [onChange, onTouchedKeysChange],
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
        <BAIAlert
          type="info"
          showIcon
          title={t('modelService.RuntimeParamUnchangedHint')}
          style={{ marginBottom: token.marginSM }}
        />
        {activeGroup && (
          <ParameterGroupContent
            group={activeGroup}
            values={values}
            touchedKeys={touchedKeys}
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
  touchedKeys: Set<string>;
  onParamChange: (key: string, value: string) => void;
}

const ParameterGroupContent: React.FC<ParameterGroupContentProps> = ({
  group,
  values,
  touchedKeys,
  onParamChange,
}) => {
  return (
    <BAIFlex direction="column" gap="xxs" align="stretch">
      {group.params.map((param) => (
        <ParameterControl
          key={param.key}
          param={param}
          value={values[param.key] ?? param.defaultValue}
          touched={touchedKeys.has(param.key)}
          onChange={(val) => onParamChange(param.key, val)}
        />
      ))}
    </BAIFlex>
  );
};

interface ParameterControlProps {
  param: RuntimeParameterDef;
  value: string;
  touched: boolean;
  onChange: (value: string) => void;
}

const ParameterControl: React.FC<ParameterControlProps> = ({
  param,
  value,
  touched,
  onChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const label = t(param.name);
  const tooltip = t(param.description);
  const formItemStyle = {
    marginBottom: token.marginXS,
  };
  const controlOpacity = touched ? undefined : 0.45;
  const controlTransition = 'opacity 0.2s';

  switch (param.uiType) {
    case 'slider':
      return (
        <Form.Item
          label={label}
          tooltip={tooltip}
          style={formItemStyle}
          required
        >
          <InputNumberWithSlider
            min={param.min}
            max={param.max}
            step={param.step}
            value={parseFloat(value)}
            onChange={(v) => onChange(String(v))}
            inputContainerMinWidth={190}
            style={{ opacity: controlOpacity, transition: controlTransition }}
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
          style={formItemStyle}
          required
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
            style={{
              width: '100%',
              opacity: controlOpacity,
              transition: controlTransition,
            }}
          />
        </Form.Item>
      );

    case 'select':
      return (
        <Form.Item
          label={label}
          tooltip={tooltip}
          style={formItemStyle}
          required
        >
          <Select
            value={value}
            onChange={onChange}
            style={{ opacity: controlOpacity, transition: controlTransition }}
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
          style={formItemStyle}
          required
        >
          <Checkbox
            checked={value === 'true'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            aria-label={label}
            style={{ opacity: controlOpacity, transition: controlTransition }}
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
          style={formItemStyle}
          required
        >
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ opacity: controlOpacity, transition: controlTransition }}
          />
        </Form.Item>
      );
  }
};

export default RuntimeParameterFormSection;
