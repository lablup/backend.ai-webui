import { SorterResult } from 'antd/es/table/interface';
import Big from 'big.js';
import _ from 'lodash';

export function transformSorterToOrderString<T = any>(
  sorter: SorterResult<T> | Array<SorterResult<T>>,
) {
  if (Array.isArray(sorter)) {
    return _.chain(sorter)
      .map((s) =>
        s.order ? `${s.order === 'descend' ? '-' : ''}${s.field}` : undefined,
      )
      .compact()
      .join(',')
      .value();
  } else {
    return sorter.order
      ? `${sorter.order === 'descend' ? '-' : ''}${sorter.field}`
      : undefined;
  }
}

export function parseValueWithUnit(str: string): [number, string | undefined] {
  const match = str?.match(/^(\d+(?:\.\d+)?|\.\d+)\s*([a-zA-Z%]*)$/);
  if (!match) {
    // If the input doesn't match the pattern, assume it's in bytes
    return [parseFloat(str), undefined];
  }
  const num = parseFloat(match[1]);
  const unit = match[2];
  return [num, unit];
}

export const GBToBytes = (value = 0) => {
  const gigabyte = Math.pow(10, 9);
  return Math.round(gigabyte * value);
};

export const bytesToGB = (
  bytes: number,
  decimalPoint = 2,
  nullStr: string = '-',
) => {
  if (bytes === null || bytes === undefined) return nullStr;
  if (!bytes) return bytes;
  return (bytes / 10 ** 9).toFixed(decimalPoint);
};

export type InputSizeUnit = '' | 'k' | 'm' | 'g' | 't' | 'p' | 'e';
export type SizeUnit = InputSizeUnit;

/**
 * Converts a value with a unit to a different unit or automatically selects the most appropriate unit.
 *
 * @param inputValue - The input string value with or without a unit (e.g., '1024m', '2g', '500').
 * @param targetUnit - The target unit to convert to ('', 'k', 'm', 'g', 't', 'p', 'e') or 'auto' for automatic unit selection.
 * @param options - Additional conversion options.
 * @param options.fixed - Number of decimal places to keep in the result. Defaults to 2.
 * @param options.round - Whether to round the result (true) or floor it (false). Defaults to false.
 * @param options.base - The base for conversion: 1024 (binary) or 1000 (decimal). Defaults to 1024.
 *
 * @returns An object containing the conversion result:
 * - `number`: The converted value as a number
 * - `numberFixed`: The converted value as a string with fixed decimal places
 * - `unit`: The target unit used for conversion
 * - `value`: A formatted string combining the number and unit
 *
 * @throws Error if the input format is invalid or the unit is not recognized
 *
 * @example
 * // Convert 1.5g to mega
 * convertUnitValue('1.5g', 'm')
 * // => { number: 1536, numberFixed: "1536", unit: "m", value: "1536m" }
 *
 * @example
 * // Auto unit selection with custom precision
 * convertUnitValue('1048576', 'auto', { fixed: 1 })
 * // => { number: 1, numberFixed: "1", unit: "m", value: "1m" }
 */
export function convertUnitValue(
  inputValue: string | undefined,
  targetUnit: InputSizeUnit | 'auto',
  options?: {
    fixed?: number;
    round?: boolean;
    base?: 1024 | 1000;
  },
) {
  const { fixed = 2, round = false, base = 1024 } = options || {};
  if (inputValue === undefined) {
    return undefined;
  }
  // display units
  const sizes = ['', 'k', 'm', 'g', 't', 'p', 'e'];
  const [sizeValue, sizeUnit] = parseValueWithUnit(inputValue);
  const sizeIndex = sizeUnit ? sizes.indexOf(sizeUnit.toLowerCase()) : 0;
  if (sizeIndex === -1 || isNaN(sizeValue)) {
    throw new Error('Invalid size format,' + inputValue);
  }

  const bytes = sizeValue * Math.pow(base, sizeIndex);
  let targetIndex: number;

  if (targetUnit === 'auto') {
    // Auto unit selection logic
    targetIndex = Math.floor(Math.log(bytes) / Math.log(base));
    targetIndex = Math.min(Math.max(targetIndex, 0), sizes.length - 1);

    const tempBytes = bytes / Math.pow(base, targetIndex);
    if (tempBytes < 1 && targetIndex > 0) {
      targetIndex--;
    }
  } else {
    targetIndex = targetUnit ? sizes.indexOf(targetUnit.toLowerCase()) : 0;
  }

  const finalBytes = bytes / Math.pow(base, targetIndex);
  const numberFixed = round
    ? finalBytes.toFixed(fixed)
    : toFixedFloorWithoutTrailingZeros(finalBytes, fixed);

  const unit = sizes[targetIndex] as InputSizeUnit;

  return {
    number: finalBytes,
    numberFixed,
    unit,
    value: `${numberFixed}${unit}`,
  };
}

export const generateDisplayValues = <T extends number | Big>(
  convertedValue:
    | {
        number: T;
        numberFixed: string;
        unit: InputSizeUnit;
        value: string;
      }
    | undefined,
  {
    baseDisplayUnit,
    displayUnitSuffix,
  }: {
    baseDisplayUnit: string;
    displayUnitSuffix: string;
  },
) => {
  if (convertedValue === undefined) {
    return undefined;
  }

  // Original logic for object input
  const displayUnit = convertedValue.unit
    ? `${convertedValue.unit.toUpperCase()}${displayUnitSuffix}`
    : baseDisplayUnit;
  const displayValue = `${convertedValue.numberFixed} ${displayUnit}`;
  return {
    ...convertedValue,
    displayValue,
    displayUnit,
  };
};

/**
 * Converts a binary size value from one unit to another.
 *
 * @param inputValue - The value to convert, can be a string, number, or undefined
 * @param targetUnit - The unit to convert to, or 'auto' for automatic unit selection
 * @param fixed - The number of decimal places to fix the result to (default: 2)
 * @param round - Whether to round the result (default: false)
 * @returns An object containing the converted value information or undefined if conversion fails:
 *          - number: The converted number value
 *          - numberFixed: The formatted number with fixed decimal places
 *          - unit: The resulting unit (lowercase)
 *          - displayValue: Formatted string with value and unit (e.g., "10.24 KiB")
 *          - displayUnit: The formatted unit string (e.g., "KiB")
 */
export function convertToBinaryUnit(
  inputValue: string | number | undefined,
  targetUnit: InputSizeUnit | 'auto',
  fixed: number = 2,
  round: boolean = false,
) {
  inputValue = _.isNumber(inputValue) ? _.toString(inputValue) : inputValue;
  return generateDisplayValues(
    convertUnitValue(inputValue, targetUnit, {
      fixed,
      round,
      base: 1024,
    }),
    {
      baseDisplayUnit: 'BiB',
      displayUnitSuffix: 'iB',
    },
  );
}

/**
 * Converts a size value to a different unit in the decimal-based system.
 *
 * @param inputValue - The input size value to convert, can be a string, number or undefined
 * @param targetUnit - The desired unit to convert to, or 'auto' to determine the best unit automatically
 * @param fixed - The number of decimal places to round to, defaults to 2
 * @param round - Whether to round the value (true) or truncate (false), defaults to false
 * @returns An object containing the converted value information, including:
 *          - numberFixed: The converted number with fixed decimal places
 *          - displayValue: The formatted string with value and unit (e.g., "5.25 KB")
 *          - displayUnit: The display unit (e.g., "KB")
 *          - additional properties from convertUnitValue
 *          Returns undefined if the conversion failed
 */
export function convertToDecimalUnit(
  inputValue: string | number | undefined,
  targetUnit: InputSizeUnit | 'auto',
  fixed: number = 2,
  round: boolean = false,
) {
  inputValue = _.isNumber(inputValue) ? _.toString(inputValue) : inputValue;
  return generateDisplayValues(
    convertUnitValue(inputValue, targetUnit, {
      fixed,
      round,
      base: 1000,
    }),
    {
      baseDisplayUnit: 'B',
      displayUnitSuffix: 'B',
    },
  );
}

export function toFixedFloorWithoutTrailingZeros(
  num: number | string,
  fixed: number,
) {
  const number = typeof num === 'string' ? parseFloat(num) : num;
  return parseFloat(number.toFixed(fixed)).toString();
}

export function toFixedWithTypeValidation(num: number | string, fixed: number) {
  return typeof num === 'number'
    ? num.toFixed(fixed)
    : parseFloat(num).toFixed(fixed);
}

export function compareNumberWithUnits(
  size1: string | number,
  size2: string | number,
) {
  const [number1, unit1] = parseValueWithUnit(_.toString(size1));
  const [number2, unit2] = parseValueWithUnit(_.toString(size2));

  if (unit1 === unit2) {
    return number1 - number2;
  }
  if (number1 === 0 && number2 === 0) {
    return 0;
  }

  const value1 = convertToBinaryUnit(size1, 'g')?.number ?? 0;
  const value2 = convertToBinaryUnit(size2, 'g')?.number ?? 0;
  return value1 - value2;
}

export function addNumberWithUnits(
  size1: string,
  size2: string,
  targetUnit: InputSizeUnit = 'm',
) {
  return convertToBinaryUnit(
    (convertToBinaryUnit(size1, '')?.number || 0) +
      (convertToBinaryUnit(size2, '')?.number || 0),
    targetUnit,
  )?.value;
}

export function subNumberWithUnits(
  size1: string,
  size2: string,
  targetUnit: InputSizeUnit = 'm',
) {
  return convertToBinaryUnit(
    (convertToBinaryUnit(size1, '')?.number || 0) -
      (convertToBinaryUnit(size2, '')?.number || 0),
    targetUnit,
  )?.value;
}

export function divideNumberWithUnits(size1: string, size2: string) {
  const num1 = convertToBinaryUnit(size1, '')?.number || 0;
  const num2 = convertToBinaryUnit(size2, '')?.number || 0;
  if (num2 === 0) return undefined; // Avoid division by zero
  return convertToBinaryUnit(num1 / num2, '')?.value;
}
