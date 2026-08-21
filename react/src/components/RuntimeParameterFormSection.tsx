/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import {
  RuntimeVariantPresetDef,
  RuntimeParameterGroup,
  RuntimeVariantPresetValueEntry,
  useRuntimeParameterSchema,
} from '../hooks/useRuntimeParameterSchema';
import { theme } from '../theme-shim';
import InputNumberWithSlider from './InputNumberWithSlider';
import {
  AstryxFormCheckbox,
  AstryxFormNumberInput,
  AstryxFormSelector,
  AstryxFormTextInput,
} from './astryxFormControls';
import './collapsible-section.css';
import { Banner } from '@astryxdesign/core/Banner';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Text } from '@astryxdesign/core/Text';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { BAIFlex, toLocalId } from 'backend.ai-ui';
import { Undo2 } from 'lucide-react';
import React, { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

const styles = stylex.create({
  // The tab strip is a bare sibling of the Banner and the first field, so its
  // breathing room has to come from the strip itself. FR-3529.
  categoryTabs: {
    marginBlockStart: spacingVars['--spacing-4'],
    marginBlockEnd: spacingVars['--spacing-4'],
  },
});

/** Convert category slug to a display-friendly label. */
function formatCategoryLabel(category: string): string {
  // Convert snake_case to Title Case (e.g., 'model_loading' → 'Model Loading')
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Native value type stored in antd form state for a runtime parameter. */
export type RuntimeParameterFormValue = string | number | boolean | undefined;

/**
 * Runtime parameter values keyed by the preset key (e.g. '--dtype', 'HF_TOKEN').
 * Lives in the enclosing antd form under the `runtimeParams` namespace.
 */
export interface RuntimeParameterValues {
  [key: string]: RuntimeParameterFormValue;
}

/** antd form name path for the runtime parameter namespace. */
export const RUNTIME_PARAMS_NAMESPACE = 'runtimeParams';

/**
 * Convert the API's string-encoded value into the native type stored in
 * form state (numbers for INT/FLOAT, booleans for BOOL/FLAG).
 */
function toNativeValue(
  param: RuntimeVariantPresetDef,
  raw: string,
): RuntimeParameterFormValue {
  switch (param.valueType) {
    case 'INT': {
      const n = parseInt(raw, 10);
      return Number.isNaN(n) ? undefined : n;
    }
    case 'FLOAT': {
      const n = parseFloat(raw);
      return Number.isNaN(n) ? undefined : n;
    }
    case 'BOOL':
    case 'FLAG':
      return raw === 'true';
    default:
      return raw;
  }
}

interface RuntimeParameterFormSectionProps {
  runtimeVariant: string;
  /** Called when the set of touched parameter keys changes */
  onTouchedKeysChange?: (touchedKeys: Set<string>) => void;
  /** Called when preset groups are loaded from the API */
  onGroupsLoaded?: (groups: RuntimeParameterGroup[] | null) => void;
  /**
   * Existing preset values for edit mode, keyed by preset id
   * (`{ presetId, value }`). Replaces the former EXTRA_ARGS / env-var
   * reverse-mapping: preset values are now their own query field
   * (`runtimeVariantPresetValues`), so controls hydrate directly from these
   * entries instead of being parsed out of environment variables.
   */
  initialPresetValues?: ReadonlyArray<RuntimeVariantPresetValueEntry>;
}

/**
 * Dynamic form section for runtime parameters.
 * Renders slider/input/select/checkbox controls based on API-provided preset
 * schema. Values are registered as fields of the **enclosing antd form** under
 * the `runtimeParams` namespace, so required presets participate in normal
 * form validation (`validateFields` / `onFinish`).
 */
const RuntimeParameterFormSection: React.FC<
  RuntimeParameterFormSectionProps
> = ({
  runtimeVariant,
  onTouchedKeysChange,
  onGroupsLoaded,
  initialPresetValues,
}) => {
  'use memo';
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const baiClient = useSuspendedBackendaiClient();
  const supportsRequiredField = baiClient.supports(
    'runtime-variant-preset-required',
  );
  const groups = useRuntimeParameterSchema(runtimeVariant);

  // Notify parent when groups change (for serialization at submit time)
  // Cleanup on unmount to prevent parent from using stale groups
  const onGroupsChanged = useEffectEvent(() => {
    onGroupsLoaded?.(groups);
  });
  const onGroupsCleanup = useEffectEvent(() => {
    onGroupsLoaded?.(null);
  });

  useEffect(() => {
    onGroupsChanged();
    return () => {
      onGroupsCleanup();
    };
  }, [groups]);

  // Track which parameter keys the user has explicitly interacted with.
  // In edit mode, keys hydrated from existing preset values are pre-marked.
  const [touchedKeys, setTouchedKeys] = useState<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<string>('');

  // Initialize form values. Defaults are deliberately NOT seeded — they are
  // surfaced as control placeholders instead, so untouched fields stay empty
  // (the runtime applies its own defaults) and required presets fail
  // validation until the user supplies an explicit value. In edit mode,
  // values hydrated from existing preset values (keyed by preset id) are
  // seeded.
  const initializeValues = useEffectEvent(() => {
    if (!groups) return;

    if (initialPresetValues && initialPresetValues.length > 0) {
      // Map preset id → preset definition so queried `{ presetId, value }`
      // entries can hydrate the controls. Accept either the local UUID or the
      // Relay global id, since the source of the id can vary across call sites.
      const idToParam = new Map<string, RuntimeVariantPresetDef>();
      for (const group of groups) {
        for (const param of group.params) {
          idToParam.set(param.id, param);
          const localId = toLocalId(param.id);
          if (localId) idToParam.set(localId, param);
        }
      }

      const nativeMapped: RuntimeParameterValues = {};
      for (const { presetId, value } of initialPresetValues) {
        const param = idToParam.get(presetId);
        if (param) nativeMapped[param.key] = toNativeValue(param, value);
      }

      // Replace the whole namespace so values from a previously selected
      // variant don't leak into this one.
      form.setFieldValue(RUNTIME_PARAMS_NAMESPACE, nativeMapped);
      // Pre-mark keys hydrated from existing preset values as touched.
      const initialTouched = new Set(Object.keys(nativeMapped));
      setTouchedKeys(initialTouched);
      onTouchedKeysChange?.(initialTouched);
    } else {
      form.setFieldValue(RUNTIME_PARAMS_NAMESPACE, {});
      setTouchedKeys(new Set());
      onTouchedKeysChange?.(new Set());
    }
  });

  // Initialize only when runtimeVariant or groups change — NOT when
  // initialPresetValues changes (e.g., due to Relay store updates after a
  // mutation). The initial* prop is read inside initializeValues via
  // useEffectEvent, so it always reflects the latest closure.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- form hydration must run post-mount
    initializeValues();
  }, [runtimeVariant, groups]);

  const markTouched = (key: string) => {
    setTouchedKeys((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      // Notify parent outside updater to keep it pure
      queueMicrotask(() => onTouchedKeysChange?.(next));
      return next;
    });
  };

  const handleReset = () => {
    if (!groups) return;
    // Empty form = every parameter falls back to the runtime's own default
    // (untouched/empty keys are excluded from serialization).
    form.setFieldValue(RUNTIME_PARAMS_NAMESPACE, {});
    setTouchedKeys(new Set());
    onTouchedKeysChange?.(new Set());
  };

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

  return (
    // MAPPING 4: antd `Collapse items=[...]` -> `Collapsible`; the panel
    // header becomes `trigger` and `defaultActiveKey` becomes `defaultIsOpen`.
    // `size="small"` is dropped -- Collapsible has no density axis (MAPPING 4
    // lists `ghost`/`bordered`/`size` as collapsing to `density`, which this
    // build does not expose).
    <Collapsible
      className="bai-collapsible-section"
      defaultIsOpen
      trigger={
        <BAIFlex justify="between" align="center" style={{ flex: 1 }}>
          <span>
            {t('modelService.RuntimeParamTitle')}{' '}
            {!supportsRequiredField && (
              <Text color="secondary">({t('general.Optional')})</Text>
            )}
          </span>
          {/* MAPPING 3.3: an icon-only button whose accessible name was an
              ad-hoc `aria-label` is an `IconButton`, which requires `label`
              and renders the tooltip itself -- so the Tooltip wrapper goes.
              The `type="link"` styling collapses to `variant="ghost"`. */}
          <IconButton
            variant="ghost"
            size="sm"
            icon={<Undo2 size="1em" />}
            label={t('button.Reset')}
            tooltip={t('button.Reset')}
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            isDisabled={touchedKeys.size === 0}
          />
        </BAIFlex>
      }
    >
      {/* `type` -> `status`; `showIcon` dropped (Banner always shows it). */}
      <Banner
        status="warning"
        title={t('modelService.RuntimeParamUnchangedHint')}
      />
      {/* MAPPING 4: antd `Tabs` -> `TabList` + `Tab` -- navigation only, the
          panels are rendered here. antd's `forceRender` mounted every pane so
          required rules in unvisited tabs registered with the form; that
          requirement survives, so every group stays mounted and only the
          inactive ones are hidden with `display:none` rather than unmounted.
          `Tab.label` is a required STRING (P2), which every tab label here
          already is. */}
      <TabList
        size="sm"
        hasDivider
        xstyle={styles.categoryTabs}
        value={effectiveActiveTab}
        onChange={(key) => setActiveTab(key)}
      >
        {tabList.map((tab) => (
          <Tab key={tab.key} value={tab.key} label={tab.label} />
        ))}
      </TabList>
      {tabList.map((tab) => {
        const group = groups.find((g) => g.category === tab.key);
        return group ? (
          <div
            key={tab.key}
            style={{
              display: effectiveActiveTab === tab.key ? 'block' : 'none',
            }}
          >
            <ParameterGroupContent
              group={group}
              touchedKeys={touchedKeys}
              onParamTouch={markTouched}
            />
          </div>
        ) : null;
      })}
    </Collapsible>
  );
};

interface ParameterGroupContentProps {
  group: RuntimeParameterGroup;
  touchedKeys: Set<string>;
  onParamTouch: (key: string) => void;
}

const ParameterGroupContent: React.FC<ParameterGroupContentProps> = ({
  group,
  touchedKeys,
  onParamTouch,
}) => {
  'use memo';
  return (
    <BAIFlex direction="column" gap="xxs" align="stretch">
      {group.params.map((param) => (
        <ParameterControl
          key={param.key}
          param={param}
          touched={touchedKeys.has(param.key)}
          onTouch={() => onParamTouch(param.key)}
        />
      ))}
    </BAIFlex>
  );
};

interface ParameterControlProps {
  param: RuntimeVariantPresetDef;
  touched: boolean;
  onTouch: () => void;
}

const ParameterControl: React.FC<ParameterControlProps> = ({
  param,
  touched,
  onTouch,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const supportsRequired = baiClient.supports(
    'runtime-variant-preset-required',
  );

  const label = param.displayName ?? param.name;
  const tooltip = param.description ?? undefined;
  const formItemStyle = {
    marginBottom: token.marginXS,
  };
  const controlOpacity = touched ? undefined : 0.45;
  const controlTransition = 'opacity 0.2s';

  // Defaults are shown as placeholders (not seeded into form state), so a
  // required preset always demands an explicit user value before submit.
  const isRequired = supportsRequired && param.required;
  const requiredRules = isRequired
    ? [{ required: true, message: t('general.ValueRequired', { name: label }) }]
    : undefined;
  const defaultPlaceholder = param.defaultValue ?? undefined;

  // The "user has touched this field" hook.
  //
  // Under antd the mark rode on each control's own `onChange`. The Astryx
  // form-control ADAPTERS own that slot (they normalise `onChange` to receive
  // the value), and only two of them expose an `onValueChange` escape hatch.
  // Rather than fork the shared adapters, the mark moves one level up to the
  // `Form.Item` itself: `getValueFromEvent` runs on exactly the same events,
  // passes the value through untouched, and works uniformly for every control
  // type -- including the ones with an escape hatch.
  const touchOnChange = <T,>(value: T): T => {
    onTouch();
    return value;
  };

  const uiType = param.uiType;

  switch (uiType) {
    case 'slider': {
      const min = param.slider?.min ?? 0;
      const max = param.slider?.max ?? 100;
      const step = param.slider?.step ?? 1;
      return (
        <Form.Item
          name={[RUNTIME_PARAMS_NAMESPACE, param.key]}
          label={label}
          tooltip={tooltip}
          style={formItemStyle}
          required={isRequired}
          rules={requiredRules}
          getValueFromEvent={touchOnChange}
        >
          <InputNumberWithSlider
            min={min}
            max={max}
            step={step}
            onChange={onTouch}
            inputContainerMinWidth={190}
            inputNumberProps={{ placeholder: defaultPlaceholder }}
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
      // Surface out-of-range values as a validation error instead of
      // clamping/blocking input via the number input's `min`/`max` props — the
      // user can see and correct what they typed rather than have the
      // control silently refuse it. The message comes from the form engine's
      // global `validateMessages` template, already localized.
      // Only attach it when there is a bound to enforce AND the stored value
      // is actually numeric: `toNativeValue` hydrates STR as a string and
      // BOOL/FLAG as a boolean, and `type: 'number'` would reject those on a
      // field the user never touched, blocking submit.
      const isNumericValueType = isInt || param.valueType === 'FLOAT';
      const rangeRules =
        isNumericValueType && (min !== undefined || max !== undefined)
          ? [{ type: 'number' as const, min, max }]
          : [];
      return (
        <Form.Item
          name={[RUNTIME_PARAMS_NAMESPACE, param.key]}
          label={label}
          tooltip={tooltip}
          style={formItemStyle}
          required={isRequired}
          rules={[...(requiredRules ?? []), ...rangeRules]}
          getValueFromEvent={touchOnChange}
        >
          {/* MAPPING 3.17: `InputNumber` -> `NumberInput`; `style.width:
              '100%'` becomes the adapter's `width` (its default). `min`/`max`
              are deliberately NOT passed to the adapter — it clamps, and the
              point of `rangeRules` is validation feedback instead of
              clamping. The adapter still repairs a typed decimal on blur when
              `isIntegerOnly`, which does not depend on the bounds. */}
          <AstryxFormNumberInput
            label={label}
            step={isInt ? 1 : 0.1}
            isIntegerOnly={isInt}
            placeholder={defaultPlaceholder}
          />
        </Form.Item>
      );
    }

    case 'select':
      return (
        <Form.Item
          name={[RUNTIME_PARAMS_NAMESPACE, param.key]}
          label={label}
          tooltip={tooltip}
          style={formItemStyle}
          required={isRequired}
          rules={requiredRules}
          getValueFromEvent={touchOnChange}
        >
          {/* MAPPING 3.1: a small static option list -> `Selector`;
              `allowClear` -> `hasClear`. */}
          <AstryxFormSelector
            label={label}
            hasClear
            placeholder={
              param.choices?.items.find(
                (opt) => opt.value === param.defaultValue,
              )?.label ?? defaultPlaceholder
            }
            options={(param.choices?.items ?? []).map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </Form.Item>
      );

    case 'checkbox':
      return (
        <Form.Item
          name={[RUNTIME_PARAMS_NAMESPACE, param.key]}
          valuePropName="checked"
          label={label}
          tooltip={tooltip}
          style={formItemStyle}
          required={isRequired}
          rules={requiredRules}
          getValueFromEvent={touchOnChange}
        >
          {/* MAPPING 4: children -> the required `label` string. */}
          <AstryxFormCheckbox label={t('general.Enable')} />
        </Form.Item>
      );

    case 'text_input':
    default:
      return (
        <Form.Item
          name={[RUNTIME_PARAMS_NAMESPACE, param.key]}
          label={label}
          tooltip={tooltip}
          style={formItemStyle}
          required={isRequired}
          rules={requiredRules}
          getValueFromEvent={touchOnChange}
        >
          <AstryxFormTextInput
            label={label}
            placeholder={
              defaultPlaceholder ?? param.text?.placeholder ?? undefined
            }
          />
        </Form.Item>
      );
  }
};

export default RuntimeParameterFormSection;
