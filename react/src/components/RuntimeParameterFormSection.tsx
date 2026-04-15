/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { reverseMapExtraArgs } from '../helper/runtimeExtraArgsParser';
import {
  RuntimeVariantPresetDef,
  RuntimeParameterGroup,
  useRuntimeParameterSchema,
  buildDefaultsMap,
  buildArgsSchemaKeySet,
  buildEnvPresetKeySet,
} from '../hooks/useRuntimeParameterSchema';
import InputNumberWithSlider from './InputNumberWithSlider';
import { Checkbox, Form, InputNumber, Select, Input, theme, Alert } from 'antd';
import { BAICard, BAIFlex } from 'backend.ai-ui';
import React, { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

/** Convert category slug to a display-friendly label. */
function formatCategoryLabel(category: string): string {
  // Convert snake_case to Title Case (e.g., 'model_loading' → 'Model Loading')
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface RuntimeParameterValues {
  [key: string]: string;
}

interface RuntimeParameterFormSectionProps {
  runtimeVariant: string;
  onChange?: (values: RuntimeParameterValues) => void;
  /** Called when the set of touched parameter keys changes */
  onTouchedKeysChange?: (touchedKeys: Set<string>) => void;
  /** Called when preset groups are loaded from the API */
  onGroupsLoaded?: (groups: RuntimeParameterGroup[] | null) => void;
  /** Existing extra args string for edit mode reverse-mapping (ARGS-type presets) */
  initialExtraArgs?: string;
  /** Existing environ for edit mode reverse-mapping (ENV-type presets) */
  initialEnvVars?: Record<string, string>;
}

/**
 * Dynamic form section for runtime parameters.
 * Renders slider/input/select/checkbox controls based on API-provided preset schema.
 */
const RuntimeParameterFormSection: React.FC<
  RuntimeParameterFormSectionProps
> = ({
  runtimeVariant,
  onChange,
  onTouchedKeysChange,
  onGroupsLoaded,
  initialExtraArgs,
  initialEnvVars,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const groups = useRuntimeParameterSchema(runtimeVariant);

  // Notify parent when groups change (for serialization at submit time)
  const onGroupsChanged = useEffectEvent(() => {
    onGroupsLoaded?.(groups);
  });

  useEffect(() => {
    onGroupsChanged();
  }, [groups]);

  const [internalValues, setInternalValues] = useState<RuntimeParameterValues>(
    {},
  );
  const values = internalValues;

  // Track which parameter keys the user has explicitly interacted with.
  // In edit mode, keys already present in the endpoint's env vars are pre-marked.
  const [touchedKeys, setTouchedKeys] = useState<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<string>('');

  const setValues = useCallback(
    (newValues: RuntimeParameterValues) => {
      setInternalValues(newValues);
      onChange?.(newValues);
    },
    [onChange],
  );

  // Initialize from defaults or reverse-map from existing extra args / env vars
  const initializeValues = useEffectEvent(() => {
    if (!groups) return;

    const defaults = buildDefaultsMap(groups);
    const hasInitialData = !!initialExtraArgs || !!initialEnvVars;

    if (hasInitialData) {
      let mappedFromArgs: Record<string, string> = {};
      let mappedFromEnv: Record<string, string> = {};

      // Reverse-map ARGS-type presets from EXTRA_ARGS string
      if (initialExtraArgs) {
        const argsSchemaKeys = buildArgsSchemaKeySet(groups);
        const { mappedArgs } = reverseMapExtraArgs(
          initialExtraArgs,
          argsSchemaKeys,
        );
        mappedFromArgs = mappedArgs;
      }

      // Reverse-map ENV-type presets from individual env vars
      if (initialEnvVars) {
        const envPresetKeys = buildEnvPresetKeySet(groups);
        for (const envKey of envPresetKeys) {
          if (initialEnvVars[envKey] !== undefined) {
            mappedFromEnv[envKey] = initialEnvVars[envKey];
          }
        }
      }

      const allMapped = { ...mappedFromArgs, ...mappedFromEnv };
      setValues({ ...defaults, ...allMapped });
      // Pre-mark keys from existing env vars as touched
      const initialTouched = new Set(Object.keys(allMapped));
      setTouchedKeys(initialTouched);
      onTouchedKeysChange?.(initialTouched);
    } else {
      setValues(defaults);
      setTouchedKeys(new Set());
      onTouchedKeysChange?.(new Set());
    }
  });

  useEffect(() => {
    initializeValues();
  }, [runtimeVariant, initialExtraArgs, initialEnvVars]);

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

  // Build tab list from available categories (dynamically from API)
  const availableCategories = groups.map((g) => g.category);
  const tabList = availableCategories.map((cat) => ({
    key: cat,
    label: formatCategoryLabel(cat),
  }));

  // Fall back to first available tab if current tab doesn't exist for this variant
  const effectiveActiveTab = availableCategories.includes(activeTab)
    ? activeTab
    : (availableCategories[0] ?? '');
  const activeGroup = groups.find((g) => g.category === effectiveActiveTab);

  return (
    <Form.Item label={t('modelService.RuntimeParamTitle')}>
      <BAICard
        size="small"
        tabList={tabList}
        activeTabKey={effectiveActiveTab}
        onTabChange={(key) => setActiveTab(key)}
      >
        <Alert
          type="warning"
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
  'use memo';
  return (
    <BAIFlex direction="column" gap="xxs" align="stretch">
      {group.params.map((param) => (
        <ParameterControl
          key={param.key}
          param={param}
          value={values[param.key] ?? param.defaultValue ?? ''}
          touched={touchedKeys.has(param.key)}
          onChange={(val) => onParamChange(param.key, val)}
        />
      ))}
    </BAIFlex>
  );
};

interface ParameterControlProps {
  param: RuntimeVariantPresetDef;
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

  const label = param.displayName ?? param.name;
  const tooltip = param.description ?? undefined;
  const formItemStyle = {
    marginBottom: token.marginXS,
  };
  const controlOpacity = touched ? undefined : 0.45;
  const controlTransition = 'opacity 0.2s';

  const uiType = param.uiType;

  switch (uiType) {
    case 'slider': {
      const min = param.slider?.min ?? 0;
      const max = param.slider?.max ?? 100;
      const step = param.slider?.step ?? 1;
      return (
        <Form.Item
          label={label}
          tooltip={tooltip}
          style={formItemStyle}
          required
        >
          <InputNumberWithSlider
            min={min}
            max={max}
            step={step}
            value={parseFloat(value)}
            onChange={(v) => onChange(String(v))}
            inputContainerMinWidth={190}
            style={{ opacity: controlOpacity, transition: controlTransition }}
            sliderProps={{
              marks: {
                [min]: min,
                [max]: {
                  style: { color: token.colorTextSecondary },
                  label: max,
                },
              },
            }}
          />
        </Form.Item>
      );
    }

    case 'number_input': {
      const min = param.number?.min ?? undefined;
      const max = param.number?.max ?? undefined;
      const isInt = param.valueType === 'INT';
      return (
        <Form.Item
          label={label}
          tooltip={tooltip}
          style={formItemStyle}
          required
        >
          <InputNumber
            min={min}
            max={max}
            step={isInt ? 1 : 0.1}
            value={isInt ? parseInt(value, 10) : parseFloat(value)}
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
    }

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
            options={param.choices?.items.map((opt) => ({
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
            placeholder={param.text?.placeholder ?? undefined}
            style={{ opacity: controlOpacity, transition: controlTransition }}
          />
        </Form.Item>
      );
  }
};

export default RuntimeParameterFormSection;
