import { convertToBinaryUnit } from 'backend.ai-ui';
import _ from 'lodash';

export const UNLIMITED_VALUES = [
  NaN,
  Infinity,
  Number.MAX_SAFE_INTEGER,
  undefined,
];

export const processResourceValue = (
  value: string | number | undefined,
  resource: string,
  checkUnlimited = true,
) => {
  if (checkUnlimited && _.includes(UNLIMITED_VALUES, value)) {
    return Number.MAX_SAFE_INTEGER;
  }

  let converted;
  if (resource === 'mem' && value !== undefined) {
    converted = convertToBinaryUnit(value, 'auto')?.value;
  } else {
    converted = _.toNumber(value);
  }
  return converted;
};
