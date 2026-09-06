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
// the schema happily stores a pairing no control can render. What a control
// can honestly show follows from the type `toNativeValue` hydrates into the
// deployment form — number for INT/FLOAT, boolean for BOOL/FLAG, string for
// STR — and from what that control does when handed something else:
//
//   SLIDER / NUMBER_INPUT  `Number('auto')` is NaN, so a STR draws an empty
//                          box over a value that is set; a boolean silently
//                          becomes 1 / 0.
//   CHECKBOX               any non-empty string is truthy, so a STR renders
//                          CHECKED — the worst case, since it reads as a
//                          deliberate setting rather than as breakage.
//   SELECT                 its options carry `choices.items[].value`, which is
//                          a string. A hydrated number or boolean never
//                          matches one, so nothing shows selected. STR only.
//   TEXT_INPUT             stringifies on the way in and on the way out, so
//                          numbers round-trip; a boolean would render "true"
//                          and invite the operator to type "yes" instead.
//
// FR-3689.
export const UI_TYPE_TO_ALLOWED_VALUE_TYPES: Record<
  RuntimeVariantPresetUIType,
  ReadonlyArray<RuntimeVariantPresetValueType>
> = {
  SLIDER: ['INT', 'FLOAT'],
  NUMBER_INPUT: ['INT', 'FLOAT'],
  CHECKBOX: ['BOOL', 'FLAG'],
  SELECT: ['STR'],
  TEXT_INPUT: ['STR', 'INT', 'FLOAT'],
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
