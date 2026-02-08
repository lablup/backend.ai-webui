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

export const getDisplayUnitToInputSizeUnit = (
  displayUnit: string | undefined,
): InputSizeUnit => {
  if (!displayUnit) return '';
  const unit = displayUnit.toLowerCase();
  if (['kib', 'ki'].includes(unit)) return 'k';
  if (['mib', 'mi'].includes(unit)) return 'm';
  if (['gib', 'gi'].includes(unit)) return 'g';
  if (['tib', 'ti'].includes(unit)) return 't';
  if (['pib', 'pi'].includes(unit)) return 'p';
  if (['eib', 'ei'].includes(unit)) return 'e';
  return '';
};
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
 *
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

export function divideNumberWithUnits(
  size1: string,
  size2: string,
  targetUnit: InputSizeUnit = 'm',
) {
  const num1 = convertToBinaryUnit(size1, '')?.number || 0;
  const num2 = convertToBinaryUnit(size2, '')?.number || 0;
  if (num2 === 0) return undefined; // Avoid division by zero
  return convertToBinaryUnit(num1 / num2, targetUnit)?.value;
}

export const localeCompare = (a?: string | null, b?: string | null) => {
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  return a.localeCompare(b);
};

type KnownGlobalIdType =
  | 'VirtualFolderNode'
  | 'ComputeSessionNode'
  | 'GroupNode'
  | 'UserNode';

export const toGlobalId = (type: KnownGlobalIdType, id: string): string => {
  return btoa(`${type}:${id}`);
};

export const toLocalId = (globalId: string): string => {
  return atob(globalId).split(':')?.[1];
};

/**
 * Filters out empty values from an array. An item is considered "empty" if it is:
 * - `undefined`
 * - `null`
 * - an empty string (`''`)
 * - `false`
 * - `true`
 * - any numbers
 * - an empty array (`[]`)
 * - an empty object (`{}`)
 *
 * Uses lodash's `isEmpty` function for the check.
 * Array-like values such as arguments objects, arrays, buffers, strings, or jQuery-like collections are considered empty if they have a length of 0. Similarly, maps and sets are considered empty if they have a
 *
 * @typeParam T - The type of the array elements to retain.
 * @param arr - The array to filter, which may contain empty values.
 * @returns A new array containing only the non-empty values of type `T`.
 */
export const filterOutEmpty = <T>(
  arr: Array<T | undefined | null | '' | false | any[] | object>,
): Array<T> => _.filter(arr, (item) => !_.isEmpty(item)) as Array<T>;

/**
 * Filters out `null` and `undefined` values from an array of objects.
 *
 * @template T - The type of objects in the array.
 * @param arr - The array to filter, which may contain `null` or `undefined` values, or be itself `null` or `undefined`.
 * @returns A new array containing only the non-null and non-undefined objects from the input array.
 */
export function filterOutNullAndUndefined<T extends { [key: string]: any }>(
  arr: ReadonlyArray<T | null | undefined> | null | undefined,
): T[] {
  if (arr === null || arr === undefined) {
    return [];
  }
  return arr.filter((item) => item !== null && item !== undefined);
}

/**
 * Returns a shallow copy of the input object with all properties whose values are `null` or `undefined` omitted.
 *
 * @typeParam T - The type of the input object.
 * @param input - The object to omit `null` and `undefined` values from.
 * @returns A new object with the same properties as `input`, except those with `null` or `undefined` values.
 */
export const omitNullAndUndefinedFields = <T extends Record<string, any>>(
  input: T,
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== null && value !== undefined,
    ),
  ) as Partial<T>;
};

/**
 * Generates a random string of alphabetic characters.
 *
 * @param n - The length of the random string to generate. Defaults to 3.
 * @returns A random string containing uppercase and lowercase letters of the specified length.
 *
 * @example
 * ```typescript
 * generateRandomString(); // Returns a 3-character string like "AbC"
 * generateRandomString(5); // Returns a 5-character string like "XyZaB"
 * ```
 *
 * @remarks
 * The function uses a base-52 number system where:
 * - Characters 0-25 map to uppercase letters A-Z
 * - Characters 26-51 map to lowercase letters a-z
 */
export const generateRandomString = (n = 3) => {
  let randNum = Math.floor(Math.random() * 52 * 52 * 52);

  const parseNum = (num: number) => {
    if (num < 26) return String.fromCharCode(65 + num);
    else return String.fromCharCode(97 + num - 26);
  };

  let randStr = '';

  for (let i = 0; i < n; i++) {
    randStr += parseNum(randNum % 52);
    randNum = Math.floor(randNum / 52);
  }

  return randStr;
};

export const isValidUUID = (uuid: string) => {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  return regex.test(uuid);
};

export const convertToUUID = (id: string): string => {
  if (isValidUUID(id) && /^[0-9a-fA-F]{36}$/.test(id)) {
    return id;
  }
  return id.replace(
    /([0-9a-fA-F]{8})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]{12})/,
    '$1-$2-$3-$4-$5',
  );
};

export * from './useDebouncedDeferredValue';
