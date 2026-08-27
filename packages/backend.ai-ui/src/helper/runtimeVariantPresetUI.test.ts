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

const ALL_VALUE_TYPES: ReadonlyArray<RuntimeVariantPresetValueType> = [
  'STR',
  'INT',
  'FLOAT',
  'BOOL',
  'FLAG',
];

const ALL_UI_TYPES: ReadonlyArray<RuntimeVariantPresetUIType> = [
  'SLIDER',
  'NUMBER_INPUT',
  'SELECT',
  'CHECKBOX',
  'TEXT_INPUT',
];

/** Value types the given control can render. */
const valueTypesFor = (uiType: RuntimeVariantPresetUIType | undefined) =>
  ALL_VALUE_TYPES.filter((valueType) =>
    isValueTypeCompatibleWithUIType(uiType, valueType),
  );

/** Controls that can render the given value type — the transpose. */
const controlsFor = (valueType: RuntimeVariantPresetValueType) =>
  ALL_UI_TYPES.filter((uiType) =>
    isValueTypeCompatibleWithUIType(uiType, valueType),
  );

describe('isValueTypeCompatibleWithUIType — by control', () => {
  it('limits the number controls to numeric value types', () => {
    // `Number('auto')` is NaN, so a STR would draw an empty box over a value
    // that is set; a boolean would silently become 1 / 0.
    expect(valueTypesFor('NUMBER_INPUT')).toEqual(['INT', 'FLOAT']);
    expect(valueTypesFor('SLIDER')).toEqual(['INT', 'FLOAT']);
  });

  it('limits the checkbox to boolean value types', () => {
    // Any non-empty string is truthy, so a STR renders CHECKED — which reads
    // as a deliberate setting rather than as breakage.
    expect(valueTypesFor('CHECKBOX')).toEqual(['BOOL', 'FLAG']);
  });

  it('limits the select to strings', () => {
    // Its options carry `choices.items[].value`, a string. A hydrated number
    // or boolean never matches one, so nothing shows as selected.
    expect(valueTypesFor('SELECT')).toEqual(['STR']);
  });

  it('lets the text input carry anything that stringifies unambiguously', () => {
    // Numbers round-trip through `String(value)`. A boolean would render
    // "true" and invite the operator to type "yes" instead.
    expect(valueTypesFor('TEXT_INPUT')).toEqual(['STR', 'INT', 'FLOAT']);
  });

  it('constrains nothing when the control is absent or unrecognised', () => {
    // `undefined` covers both "no control set" and a control served by a
    // manager newer than this build. Neither licenses rejecting a value type
    // on behalf of a control we cannot render anyway.
    expect(valueTypesFor(undefined)).toEqual(ALL_VALUE_TYPES);
    expect(valueTypesFor(READ_UI_TYPE_TO_FORM_UI_TYPE['gauge'])).toEqual(
      ALL_VALUE_TYPES,
    );
  });
});

describe('isValueTypeCompatibleWithUIType — by value type', () => {
  it('offers strings the two string-carrying controls', () => {
    expect(controlsFor('STR')).toEqual(['SELECT', 'TEXT_INPUT']);
  });

  it('offers numbers the numeric controls plus free text', () => {
    expect(controlsFor('INT')).toEqual([
      'SLIDER',
      'NUMBER_INPUT',
      'TEXT_INPUT',
    ]);
    expect(controlsFor('FLOAT')).toEqual([
      'SLIDER',
      'NUMBER_INPUT',
      'TEXT_INPUT',
    ]);
  });

  it('offers booleans the checkbox alone', () => {
    // Two possible values, one control that represents exactly two values.
    expect(controlsFor('BOOL')).toEqual(['CHECKBOX']);
    expect(controlsFor('FLAG')).toEqual(['CHECKBOX']);
  });

  it('leaves no value type without a control', () => {
    for (const valueType of ALL_VALUE_TYPES) {
      expect(controlsFor(valueType).length).toBeGreaterThan(0);
    }
  });
});

describe('READ_UI_TYPE_TO_FORM_UI_TYPE', () => {
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
