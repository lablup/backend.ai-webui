/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../form-engine';
import { theme } from '../theme-shim';
import type { ResourceSlotTypeInfo } from './AdminDeploymentPresetFormTypes';
import BAIFormItem from './BAIFormItem';
import {
  AstryxFormNumberInput,
  AstryxFormSelector,
  AstryxFormTextInput,
  type AstryxFormNumberInputProps,
} from './astryxFormControls';
import { TextInput } from '@astryxdesign/core/TextInput';
import { BAIDynamicUnitInputNumber, BAIFlex } from 'backend.ai-ui';
import { CircleMinus } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

// ---------------------------------------------------------------------------
// InputNumberWithUnit — NumberInput with a trailing unit.
// Form.Item injects value/onChange into this component directly.
//
// PILOT-DECISION: the antd `Space.Compact` + `Space.Addon` composition is
// gone — Astryx `NumberInput` renders unit text natively via `units`, so the
// former `unit` prop maps straight onto it. antd's `precision` (decimal-place
// rounding) has no Astryx equivalent: `precision === 0` becomes
// `isIntegerOnly`; fractional precisions are dropped (the `step` increment
// still guides fractional entry).
// ---------------------------------------------------------------------------

export interface InputNumberWithUnitProps extends Omit<
  AstryxFormNumberInputProps,
  'units' | 'isIntegerOnly'
> {
  unit?: string;
  /** antd `InputNumber precision`. Only `0` (integer-only) survives. */
  precision?: number;
}

export const InputNumberWithUnit: React.FC<InputNumberWithUnitProps> = ({
  unit,
  precision,
  ...props
}) => {
  'use memo';
  return (
    <AstryxFormNumberInput
      units={unit}
      isIntegerOnly={precision === 0}
      {...props}
    />
  );
};

// ---------------------------------------------------------------------------
// ResourceSlotRow — one row in the resourceSlots Form.List
// Selects slot type from a dropdown and renders quantity input dynamically.
// ---------------------------------------------------------------------------

export const ResourceSlotRow: React.FC<{
  listItemName: number;
  restField: object;
  resourceSlotTypes: ReadonlyArray<ResourceSlotTypeInfo>;
  onRemove: () => void;
}> = ({ listItemName, restField, resourceSlotTypes, onRemove }) => {
  'use memo';
  const { t } = useTranslation();

  const selectedSlotName = Form.useWatch([
    'resourceSlots',
    listItemName,
    'resourceType',
  ]);
  const slotType = resourceSlotTypes.find(
    (s) => s.slotName === selectedSlotName,
  );

  const slotOptions = resourceSlotTypes
    .filter((s) => s.slotName !== 'cpu' && s.slotName !== 'mem')
    .map((s) => ({
      value: s.slotName,
      label: s.displayName,
    }));

  const isNumericType =
    slotType?.slotType === 'count' ||
    slotType?.slotType === 'unique-count' ||
    slotType?.slotType === 'bytes';
  const precision = slotType?.numberFormat?.roundLength ?? 0;

  const quantityLabel =
    slotType?.displayName ?? t('session.launcher.EnvironmentVariableValue');

  return (
    <BAIFlex direction="row" align="baseline" gap="xs">
      <BAIFormItem
        {...restField}
        name={[listItemName, 'resourceType']}
        style={{ marginBottom: 0, flex: 1 }}
        rules={[{ required: true, message: '' }]}
      >
        {/* PILOT-DECISION: antd's custom `showSearch.filterOption` dropped —
            Astryx Selector's built-in `hasSearch` filtering covers it. */}
        <AstryxFormSelector
          label={t('adminDeploymentPreset.ResourceSlots')}
          options={slotOptions}
          hasSearch
        />
      </BAIFormItem>
      <BAIFormItem
        {...restField}
        name={[listItemName, 'quantity']}
        style={{ marginBottom: 0, flex: 1 }}
        rules={[{ required: true, message: '' }]}
        getValueFromEvent={(v: number | null) => (v != null ? String(v) : '')}
        getValueProps={(v: string) => ({
          value: v !== '' && v != null ? Number(v) : undefined,
        })}
      >
        {isNumericType ? (
          <InputNumberWithUnit
            label={quantityLabel}
            min={0}
            precision={precision}
            step={precision > 0 ? Math.pow(10, -precision) : 1}
            unit={slotType?.displayUnit || undefined}
          />
        ) : (
          <AstryxFormTextInput label={quantityLabel} />
        )}
      </BAIFormItem>
      <CircleMinus onClick={onRemove} size="1em" />
    </BAIFlex>
  );
};

// ---------------------------------------------------------------------------
// FixedResourceSlotField — non-removable required resource slot (cpu / mem)
// ---------------------------------------------------------------------------

export const FixedResourceSlotField: React.FC<{
  slotName: 'cpu' | 'mem';
  resourceSlotTypes: ReadonlyArray<ResourceSlotTypeInfo>;
  required?: boolean;
}> = ({ slotName, resourceSlotTypes, required = true }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const slotType = resourceSlotTypes.find((s) => s.slotName === slotName);
  const precision = slotType?.numberFormat?.roundLength ?? 0;

  return (
    <BAIFlex direction="row" align="baseline" gap="xs">
      <BAIFormItem style={{ marginBottom: 0, flex: 1 }}>
        {/* PILOT-DECISION: antd `Input readOnly` with a dashed border showed
            the fixed slot name as an uneditable input. Astryx TextInput has no
            readOnly mode, so `isDisabled` carries the "not editable" state;
            the dashed-border decoration is dropped (defaults-first). */}
        <TextInput
          label={t('adminDeploymentPreset.ResourceSlots')}
          isLabelHidden
          value={slotName.toUpperCase()}
          isDisabled
          width="100%"
        />
      </BAIFormItem>
      {slotName === 'mem' ? (
        <BAIFormItem
          name={slotName}
          style={{ marginBottom: 0, flex: 1 }}
          required={required}
          rules={[{ required, message: '' }]}
        >
          <BAIDynamicUnitInputNumber
            defaultUnit="g"
            style={{ width: '100%' }}
          />
        </BAIFormItem>
      ) : (
        <BAIFormItem
          name={slotName}
          style={{ marginBottom: 0, flex: 1 }}
          required={required}
          rules={[{ required, message: '' }]}
          getValueFromEvent={(v: number | null) => (v != null ? String(v) : '')}
          getValueProps={(v: string) => ({
            value: v !== '' && v != null ? Number(v) : undefined,
          })}
        >
          <InputNumberWithUnit
            label={slotType?.displayName ?? slotName.toUpperCase()}
            min={0}
            precision={precision}
            step={precision > 0 ? Math.pow(10, -precision) : 1}
            unit={slotType?.displayUnit || undefined}
          />
        </BAIFormItem>
      )}
      {/* Spacer matching the CircleMinus delete icon in ResourceSlotRow */}
      <span style={{ visibility: 'hidden', fontSize: token.fontSize }}>
        <CircleMinus size="1em" />
      </span>
    </BAIFlex>
  );
};
