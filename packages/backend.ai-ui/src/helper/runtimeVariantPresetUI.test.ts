/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isValueTypeCompatibleWithUIType,
  READ_UI_TYPE_TO_FORM_UI_TYPE,
  type RuntimeVariantPresetUIType,
  type RuntimeVariantPresetValueType,
} from './runtimeVariantPresetUI';
import { describe, expect, it } from 'vitest';

const ALL: ReadonlyArray<RuntimeVariantPresetValueType> = [
  'STR',
  'INT',
  'FLOAT',
  'BOOL',
  'FLAG',
];

const accepted = (uiType: RuntimeVariantPresetUIType | undefined) =>
  ALL.filter((valueType) => isValueTypeCompatibleWithUIType(uiType, valueType));

describe('isValueTypeCompatibleWithUIType', () => {
  it('limits the number controls to numeric value types', () => {
    // A number control over a STR reaches the deployment form as
    // `Number('auto')` -> NaN and draws an empty box over a value that is set.
    expect(accepted('NUMBER_INPUT')).toEqual(['INT', 'FLOAT']);
    expect(accepted('SLIDER')).toEqual(['INT', 'FLOAT']);
  });

  it('limits the checkbox to boolean value types', () => {
    // The worst pairing of the set: a checkbox reads a non-empty string as
    // truthy and renders CHECKED, which reads as a deliberate setting rather
    // than as breakage.
    expect(accepted('CHECKBOX')).toEqual(['BOOL', 'FLAG']);
  });

  it('leaves the string-carrying controls unconstrained', () => {
    // Choices and free text travel as strings and are parsed per value type,
    // so every pairing is representable.
    expect(accepted('SELECT')).toEqual(ALL);
    expect(accepted('TEXT_INPUT')).toEqual(ALL);
  });

  it('constrains nothing when the control is absent or unrecognised', () => {
    // `undefined` covers both "no control set" and a control served by a
    // manager newer than this build. Neither licenses rejecting a value type
    // on behalf of a control we cannot render anyway.
    expect(accepted(undefined)).toEqual(ALL);
    expect(accepted(READ_UI_TYPE_TO_FORM_UI_TYPE['gauge'])).toEqual(ALL);
  });

  it('maps every control the read side can serve', () => {
    // The read side is an open `String!`; these five lowercase spellings are
    // the ones this build claims to understand.
    expect(Object.keys(READ_UI_TYPE_TO_FORM_UI_TYPE).sort()).toEqual([
      'checkbox',
      'number_input',
      'select',
      'slider',
      'text_input',
    ]);
  });
});
