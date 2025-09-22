import deviceMetadata from '../../../resources/device_metadata.json';
// import json
import schema from '../../../resources/device_metadata.schema.json';
import '../../__test__/matchMedia.mock.js';
import {
  knownAcceleratorResourceSlotNames,
  baseResourceSlotNames,
} from './backendai';
import Ajv from 'ajv';
import _ from 'lodash';

const ajv = new Ajv();

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
