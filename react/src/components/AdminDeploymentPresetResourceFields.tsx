/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ResourceSlotTypeInfo } from './AdminDeploymentPresetFormTypes';
import { MinusCircleOutlined } from '@ant-design/icons';
import { Form, Input, InputNumber, Select, Space, theme } from 'antd';
import { BAIDynamicUnitInputNumber, BAIFlex } from 'backend.ai-ui';
import React from 'react';

// ---------------------------------------------------------------------------
// InputNumberWithUnit — InputNumber in Space.Compact with an addon unit.
// Form.Item injects value/onChange into this component directly.
// ---------------------------------------------------------------------------

export const InputNumberWithUnit: React.FC<
  React.ComponentProps<typeof InputNumber> & { unit?: string }
> = ({ unit, ...props }) => {
  'use memo';
  if (!unit) return <InputNumber {...props} />;
  return (
    <Space.Compact block style={{ display: 'flex' }}>
      <InputNumber {...props} style={{ width: '100%', ...props.style }} />
      <Space.Addon>{unit}</Space.Addon>
    </Space.Compact>
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

  return (
    <BAIFlex direction="row" align="baseline" gap="xs">
      <Form.Item
        {...restField}
        name={[listItemName, 'resourceType']}
        style={{ marginBottom: 0, flex: 1 }}
        rules={[{ required: true, message: '' }]}
      >
        <Select
          options={slotOptions}
          showSearch={{
            filterOption: (input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase()),
          }}
        />
      </Form.Item>
      <Form.Item
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
            min={0}
            precision={precision}
            step={precision > 0 ? Math.pow(10, -precision) : 1}
            unit={slotType?.displayUnit || undefined}
          />
        ) : (
          <Input />
        )}
      </Form.Item>
      <MinusCircleOutlined onClick={onRemove} />
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
  const { token } = theme.useToken();
  const slotType = resourceSlotTypes.find((s) => s.slotName === slotName);
  const precision = slotType?.numberFormat?.roundLength ?? 0;

  return (
    <BAIFlex direction="row" align="baseline" gap="xs">
      <Form.Item style={{ marginBottom: 0, flex: 1 }}>
        <Input
          readOnly
          value={slotName.toUpperCase()}
          style={{ borderStyle: 'dashed', cursor: 'default' }}
        />
      </Form.Item>
      {slotName === 'mem' ? (
        <Form.Item
          name={slotName}
          style={{ marginBottom: 0, flex: 1 }}
          required={required}
          rules={[{ required, message: '' }]}
        >
          <BAIDynamicUnitInputNumber style={{ width: '100%' }} />
        </Form.Item>
      ) : (
        <Form.Item
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
            min={0}
            precision={precision}
            step={precision > 0 ? Math.pow(10, -precision) : 1}
            unit={slotType?.displayUnit || undefined}
          />
        </Form.Item>
      )}
      {/* Spacer matching the MinusCircleOutlined delete icon in ResourceSlotRow */}
      <span style={{ visibility: 'hidden', fontSize: token.fontSize }}>
        <MinusCircleOutlined />
      </span>
    </BAIFlex>
  );
};
