/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/** Control types this build can render. Mirrors the `RuntimeVariantPresetUIType` write enum. */
export type RuntimeVariantPresetUIType = 'SLIDER' | 'NUMBER_INPUT' | 'SELECT' | 'CHECKBOX' | 'TEXT_INPUT';
/** Mirrors the `PresetValueType` enum. */
export type RuntimeVariantPresetValueType = 'STR' | 'INT' | 'FLOAT' | 'BOOL' | 'FLAG';
export declare const READ_UI_TYPE_TO_FORM_UI_TYPE: Partial<Record<string, RuntimeVariantPresetUIType>>;
export declare const UI_TYPE_TO_ALLOWED_VALUE_TYPES: Record<RuntimeVariantPresetUIType, ReadonlyArray<RuntimeVariantPresetValueType>>;
/**
 * Whether `valueType` is one the chosen control can render. An `undefined`
 * control constrains nothing — either none is set, or the manager serves one
 * this build predates, and neither case licenses a guess.
 *
 * The admin modal uses this to stop a mismatch being authored; the deployment
 * form uses it to degrade a control it cannot honestly render. Both must agree,
 * hence one matrix.
 */
export declare function isValueTypeCompatibleWithUIType(uiType: RuntimeVariantPresetUIType | undefined, valueType: RuntimeVariantPresetValueType): boolean;
