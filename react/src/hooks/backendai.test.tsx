/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import deviceMetadata from '../../../resources/device_metadata.json';
// import json
import schema from '../../../resources/device_metadata.schema.json';
import '../../__test__/matchMedia.mock.js';
import {
  knownAcceleratorResourceSlotNames,
  baseResourceSlotNames,
  isUnifiedAcceleratorSlot,
} from './backendai';
import Ajv from 'ajv';
import * as _ from 'lodash-es';

const ajv = new Ajv();

describe('isUnifiedAcceleratorSlot', () => {
  it('returns true for slot names ending with .unified', () => {
    expect(isUnifiedAcceleratorSlot('cuda.unified')).toBe(true);
    expect(isUnifiedAcceleratorSlot('rocm.unified')).toBe(true);
  });

  it('returns false for discrete accelerator slot names', () => {
    expect(isUnifiedAcceleratorSlot('cuda.shares')).toBe(false);
    expect(isUnifiedAcceleratorSlot('cuda.device')).toBe(false);
    expect(isUnifiedAcceleratorSlot('cuda.mem')).toBe(false);
    expect(isUnifiedAcceleratorSlot('rocm.device')).toBe(false);
  });

  it('returns false for nullish or empty input', () => {
    expect(isUnifiedAcceleratorSlot(undefined)).toBe(false);
    expect(isUnifiedAcceleratorSlot(null)).toBe(false);
    expect(isUnifiedAcceleratorSlot('')).toBe(false);
  });
});

describe('deviceMetadata JSON Schema Validation', () => {
  it('should include all known accelerator names and base resource names', () => {
    const strictSchema = _.cloneDeep(schema);

    // @ts-ignore
    strictSchema.properties.deviceInfo.required = [
      ...knownAcceleratorResourceSlotNames,
      ...baseResourceSlotNames,
    ];

    const validate = ajv.compile(strictSchema);
    const valid = validate(deviceMetadata);
    if (!valid) {
      console.error(validate.errors);
    }
    expect(valid).toBe(true);
  });
});
