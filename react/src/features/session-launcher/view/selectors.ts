/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Stubs with the ADR 0013 signatures; the resource slice fills them in.
import type { LauncherInputs, LauncherValues } from '../model';

export type FieldLimits = Readonly<
  Record<string, { min?: number | string; max?: number | string }>
>;
export type FieldRemaining = Readonly<Record<string, number | string>>;
export type FieldDisabled = Readonly<Record<string, boolean>>;

export const selectLimits = (
  _values: LauncherValues,
  _inputs: LauncherInputs,
): FieldLimits => ({});

export const selectRemaining = (
  _values: LauncherValues,
  _inputs: LauncherInputs,
): FieldRemaining => ({});

export const selectDisabled = (
  _values: LauncherValues,
  _inputs: LauncherInputs,
): FieldDisabled => ({});
