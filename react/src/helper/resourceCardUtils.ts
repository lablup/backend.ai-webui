import {
  convertUnitValue,
  convertToBinaryUnit,
  InputSizeUnit,
} from 'backend.ai-ui';
import _ from 'lodash';

export const UNLIMITED_VALUES = [
  NaN,
  Infinity,
  Number.MAX_SAFE_INTEGER,
  undefined,
];

export const getBaseUnit = (
  value: string | number,
  defaultUnit: InputSizeUnit = 'g',
): InputSizeUnit => {
  if (_.isEmpty(value)) {
    return defaultUnit;
  }
  return (
    (convertUnitValue(_.toString(value), 'auto', {
      base: 1000,
    })?.unit as InputSizeUnit) || 'g'
  );
};

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
    converted = convertToBinaryUnit(value, getBaseUnit(value))?.value;
  } else {
    converted = _.toNumber(value);
  }
  return converted;
};
