import { convertToBinaryUnit, InputSizeUnit } from '../helper';
import _ from 'lodash';

export const UNLIMITED_VALUES = [NaN, Infinity, Number.MAX_SAFE_INTEGER];

export const isMemoryResource = (resource: string) => resource === 'mem';

export const processResourceValue = (
  value: string | number | undefined,
  resource: string,
  unit: InputSizeUnit | 'auto',
) => {
  if (isMemoryResource(resource)) {
    const converted = convertToBinaryUnit(value, unit);
    return _.toNumber(converted?.numberFixed);
  }
  return _.toNumber(value);
};

export const isUnlimitedValue = (value: number) => {
  return UNLIMITED_VALUES.includes(value);
};
