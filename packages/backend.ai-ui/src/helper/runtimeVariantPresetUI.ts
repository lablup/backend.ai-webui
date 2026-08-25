/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/** Control types this build can render. Mirrors the `RuntimeVariantPresetUIType` write enum. */
export type RuntimeVariantPresetUIType =
  'SLIDER' | 'NUMBER_INPUT' | 'SELECT' | 'CHECKBOX' | 'TEXT_INPUT';

/** Mirrors the `PresetValueType` enum. */
export type RuntimeVariantPresetValueType =
  'STR' | 'INT' | 'FLOAT' | 'BOOL' | 'FLAG';

const ALL_VALUE_TYPES: ReadonlyArray<RuntimeVariantPresetValueType> = [
  'STR',
  'INT',
  'FLOAT',
  'BOOL',
  'FLAG',
];

// `Partial<>` because the read side types `UIOption.uiType` as an open
// `String!`, so a newer manager can serve a control type this build predates.
export const READ_UI_TYPE_TO_FORM_UI_TYPE: Partial<
  Record<string, RuntimeVariantPresetUIType>
> = {
  slider: 'SLIDER',
  number_input: 'NUMBER_INPUT',
  select: 'SELECT',
  checkbox: 'CHECKBOX',
  text_input: 'TEXT_INPUT',
};

// `PresetValueType` and `RuntimeVariantPresetUIType` are independent enums, so
// the schema happily stores a pairing no control can render: a `number_input`
// over a `STR` reaches the deployment form as `Number('auto')` -> NaN and
// draws an empty box over a value that is actually set, and a `checkbox` reads
// that same string as truthy and renders CHECKED (FR-3689).
export const UI_TYPE_TO_ALLOWED_VALUE_TYPES: Record<
  RuntimeVariantPresetUIType,
  ReadonlyArray<RuntimeVariantPresetValueType>
> = {
  SLIDER: ['INT', 'FLOAT'],
  NUMBER_INPUT: ['INT', 'FLOAT'],
  CHECKBOX: ['BOOL', 'FLAG'],
  // Choices and free text are strings on the wire, parsed per value type.
  SELECT: ALL_VALUE_TYPES,
  TEXT_INPUT: ALL_VALUE_TYPES,
};

/**
 * Whether `valueType` is one the chosen control can render. An `undefined`
 * control constrains nothing — either none is set, or the manager serves one
 * this build predates, and neither case licenses a guess.
 *
 * The admin modal uses this to stop a mismatch being authored; the deployment
 * form uses it to degrade a control it cannot honestly render. Both must agree,
 * hence one matrix.
 */
export function isValueTypeCompatibleWithUIType(
  uiType: RuntimeVariantPresetUIType | undefined,
  valueType: RuntimeVariantPresetValueType,
): boolean {
  const allowed = uiType ? UI_TYPE_TO_ALLOWED_VALUE_TYPES[uiType] : undefined;
  return !allowed || allowed.includes(valueType);
}
