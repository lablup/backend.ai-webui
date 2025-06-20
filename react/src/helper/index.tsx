import { CommittedImage } from '../components/CustomizedImageList';
import { Image } from '../components/ImageEnvironmentSelectFormItems';
import { EnvironmentImage } from '../components/ImageList';
import { useSuspendedBackendaiClient } from '../hooks';
import { AttachmentsProps } from '@ant-design/x';
import { SorterResult } from 'antd/es/table/interface';
import Big from 'big.js';
import dayjs from 'dayjs';
import { Duration } from 'dayjs/plugin/duration';
import { TFunction } from 'i18next';
import _ from 'lodash';

export const newLineToBrElement = (
  text: string,
  separatorRegExp = /(<br\s*\/?>|\n)/,
) => {
  return text.split(separatorRegExp).map((line, index) => {
    return line.match(separatorRegExp) ? <br key={index} /> : line;
  });
};

export const baiSignedRequestWithPromise = ({
  method,
  url,
  body = null,
  client,
}: {
  method: string;
  url: string;
  body?: any;
  client: any;
}) => {
  let request = client?.newSignedRequest(method, url, body, null);
  return client?._wrapWithPromise(request);
};

export const useBaiSignedRequestWithPromise = () => {
  const baiClient = useSuspendedBackendaiClient();
  return ({
    method,
    url,
    body = null,
  }: {
    method: string;
    url: string;
    body?: any;
  }) =>
    baiSignedRequestWithPromise({
      method,
      url,
      body,
      client: baiClient,
    });
};

/**
 * Convert file size with binary unit to human readable unit and value
 *
 * @param {number} bytes
 * @param {number} decimalPoint decimal point set to 2 as a default
 * @return {string} converted file size to human readable value
 */
export const humanReadableDecimalSize = (bytes = 0, decimalPoint = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = Math.pow(10, 3);
  decimalPoint = decimalPoint < 0 ? 0 : decimalPoint;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i = Math.floor(Math.log(Math.round(bytes)) / Math.log(k));
  i = i < 0 ? 0 : i; // avoid negative value
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) + ' ' + sizes[i]
  );
};

/**
 * Change date of any type to human readable date time.
 *
 * @param {Date} d   - string or DateTime object to convert
 * @return {Date}   - Formatted date / time to be human-readable text.
 */
export const _humanReadableTime = (date: string) => {
  return new Date(date).toUTCString();
};

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
function convertUnitValue(
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

export type QuotaScopeType = 'project' | 'user';
export const addQuotaScopeTypePrefix = (type: QuotaScopeType, str: string) => {
  if (str === '' || str === undefined) return '';
  if (str.startsWith(`${type}:`)) return str;
  return `${type}:${str}`;
};

export const usageIndicatorColor = (percentage: number) => {
  return percentage < 70
    ? 'rgba(58, 178, 97, 1)'
    : percentage < 90
      ? 'rgb(223, 179, 23)'
      : '#ef5350';
};

export const maskString = (
  value = '',
  maskChar = '*',
  startFrom = 0,
  maskLength = 0,
) => {
  // clamp mask length
  maskLength =
    startFrom + maskLength > value.length ? value.length : maskLength;
  return (
    value.substring(0, startFrom) +
    maskChar.repeat(maskLength) +
    value.substring(startFrom + maskLength, value.length)
  );
};

export const offset_to_cursor = (offset: number): string => {
  return window.btoa(`arrayconnection:${offset}`);
};

export function filterNonNullItems<T extends { [key: string]: any }>(
  arr: ReadonlyArray<T | null | undefined> | null | undefined,
): T[] {
  if (arr === null || arr === undefined) {
    return [];
  }
  return arr.filter((item): item is T => item !== null) as T[];
}

export function parseValueWithUnit(str: string): [number, string | undefined] {
  const match = str?.match(/^(\d*\.?\d+)\s*([a-zA-Z%]*)$/);
  if (!match) {
    // If the input doesn't match the pattern, assume it's in bytes
    return [parseFloat(str), undefined];
  }
  const num = parseFloat(match[1]);
  const unit = match[2];
  return [num, unit];
}

export const isOutsideRange = (
  value?: number | string,
  min?: number | string,
  max?: number | string,
) => {
  if (value === undefined) return false;
  value = _.toNumber(value);
  if (min !== undefined && value < _.toNumber(min)) return true;
  if (max !== undefined && value > _.toNumber(max)) return true;
  return false;
};
export const isOutsideRangeWithUnits = (
  value: string,
  min?: string,
  max?: string,
) => {
  if (value === undefined) return false;
  if (min !== undefined && compareNumberWithUnits(value, min) < 0) return true;
  if (max !== undefined && compareNumberWithUnits(value, max) > 0) return true;
  return false;
};

export const getImageFullName = (
  image: Image | CommittedImage | EnvironmentImage,
) => {
  return image
    ? `${image.registry}/${image.namespace ?? image.name}:${image.tag}@${image.architecture}`
    : undefined;
};

export const localeCompare = (a?: string | null, b?: string | null) => {
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  return a.localeCompare(b);
};

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

export const numberSorterWithInfinityValue = (
  a?: number | null,
  b?: number | null,
  infiniteValue?: number | null,
  nullishFallbackValue: number = 0,
) => {
  const transform = (value?: number | null) => {
    if (value === infiniteValue) return Number.POSITIVE_INFINITY;
    if (value === null || value === undefined) return nullishFallbackValue;
    return value;
  };
  return transform(a) - transform(b);
};

/**
 * Filters out empty items from an array.
 *
 * @template T - The type of items in the array.
 * @param arr - The array to filter.
 * @returns An array containing only non-empty items.
 */
export const filterEmptyItem = <T,>(
  arr: Array<T | undefined | null | '' | false | any[] | object>,
): Array<T> => _.filter(arr, (item) => !_.isEmpty(item)) as Array<T>;

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

/**
 * Filters out empty values from an object.
 *
 * @template T - The type of the input object.
 * @param input - The object to filter.
 * @returns A new object containing only the non-empty values.
 */
export const filterEmptyValues = <T extends Record<string, any>>(
  input: T,
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([_, value]) => value !== null && value !== undefined,
    ),
  ) as Partial<T>;
};

export function formatToUUID(str: string) {
  if (str.length !== 32) {
    throw new Error('Input string must be 32 characters long');
  }

  return `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(20)}`;
}

export const toGlobalId = (type: string, id: string): string => {
  return btoa(`${type}:${id}`);
};

export const toLocalId = (globalId: string): string => {
  return atob(globalId).split(':')?.[1];
};

export function preserveDotStartCase(str: string = '') {
  // Temporarily replace periods with a unique placeholder
  const placeholder = '<<<DOT>>>';
  const tempStr = str.replace(/\./g, placeholder);

  const startCased = _.startCase(tempStr);

  // Replace the placeholder back with periods
  return startCased.replace(new RegExp(placeholder, 'g'), '.');
}

export function formatDuration(duration: Duration, t: TFunction) {
  // We need to `t` function to translate the time unit in React render phase
  return [
    duration.weeks() ? `${duration.weeks()} ${t('time.Week')}` : '',
    duration.days() ? `${duration.days()} ${t('time.Day')}` : '',
    duration.hours() ? `${duration.hours()} ${t('time.Hour')}` : '',
    duration.minutes() ? `${duration.minutes()} ${t('time.Min')}` : '',
    duration.seconds() ? `${duration.seconds()} ${t('time.Sec')}` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function formatDurationAsDays(
  start: string,
  end?: string | null,
  dayLabel: string = 'd ',
): string {
  const startTime = dayjs(start);
  const endTime = end ? dayjs(end) : dayjs();

  const diff = dayjs.duration(endTime.diff(startTime));

  const asDays = Math.floor(diff.asDays());
  const hours = diff.hours().toString().padStart(2, '0');
  const minutes = diff.minutes().toString().padStart(2, '0');
  const seconds = diff.seconds().toString().padStart(2, '0');

  return `${asDays ? `${asDays}${dayLabel}` : ''}${hours}:${minutes}:${seconds}`;
}

export const handleRowSelectionChange = <T extends object, K extends keyof T>(
  selectedRowKeys: React.Key[],
  currentPageItems: T[],
  setSelectedItems: React.Dispatch<React.SetStateAction<T[]>>,
  keyField: K = 'id' as unknown as K,
) => {
  // Find items that are no longer selected on current page
  const deselectedItemsOnCurrentPage = currentPageItems.filter(
    (item) => !selectedRowKeys.includes(item[keyField] as React.Key),
  );

  // Find newly selected items on current page
  const selectedItemsOnCurrentPage = selectedRowKeys
    .map((key) => currentPageItems.find((item) => item[keyField] === key))
    .filter((item): item is T => item !== undefined);

  setSelectedItems((prevSelected) => {
    // Combine previous selection with new selections
    const combinedSelection = [...prevSelected, ...selectedItemsOnCurrentPage];

    // Remove duplicates and deselected items
    return _.uniqBy(combinedSelection, keyField as string).filter(
      (item) =>
        !_.some(
          deselectedItemsOnCurrentPage,
          (di) => di[keyField] === item[keyField],
        ),
    );
  });
};

export function createDataTransferFiles(files: AttachmentsProps['items']) {
  const fileList = _.map(files, (item) => item.originFileObj as File);
  const dataTransfer = new DataTransfer();
  _.forEach(fileList, (file) => {
    dataTransfer.items.add(file);
  });
  return dataTransfer.files;
}

export function getOS() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (_.includes(userAgent, 'windows')) return 'Windows';
  if (_.includes(userAgent, 'macintosh')) return 'MacOS';
  if (_.includes(userAgent, 'linux')) return 'Linux';
  return 'Linux';
}
