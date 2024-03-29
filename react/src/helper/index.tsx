import { useSuspendedBackendaiClient } from '../hooks';
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

export const humanReadableBinarySize = (
  bytes = 0,
  decimalPoint = 2,
  compact = false,
) => {
  if (!bytes) return 0;
  if (typeof bytes === 'string') bytes = parseInt(bytes);
  const k = Math.pow(2, 10);
  let i;
  let unitList;
  decimalPoint = decimalPoint < 0 || compact ? 0 : decimalPoint;
  i = Math.floor(Math.log(Math.round(bytes)) / Math.log(k));
  i = i < 0 ? 0 : i; // avoid negative value
  if (compact) {
    unitList = ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei'];
  } else {
    unitList = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];
  }
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) +
    ' ' +
    unitList[i]
  );
};

export function bytesToBinarySize(
  bytes: number,
  targetUnit?: 'Bytes' | 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB' | 'EiB',
): {
  number: number;
  unit: string;
} {
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];
  if (bytes === 0)
    return {
      number: 0,
      unit: 'Bytes',
    };
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return {
    number: parseFloat((bytes / Math.pow(1024, i)).toFixed(2)),
    unit: sizes[i],
  };
}

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

type SizeUnit =
  | 'B'
  | 'K'
  | 'M'
  | 'G'
  | 'T'
  | 'P'
  | 'E'
  | 'b'
  | 'k'
  | 'm'
  | 'g'
  | 't'
  | 'p'
  | 'e';
export function iSizeToSize(
  sizeWithUnit: string | undefined,
  targetSizeUnit?: SizeUnit,
  fixed: number = 2,
  round: boolean = false,
):
  | {
      number: number;
      numberFixed: string;
      unit: string;
      numberUnit: string;
    }
  | undefined {
  if (sizeWithUnit === undefined) {
    return undefined;
  }
  const sizes = ['B', 'K', 'M', 'G', 'T', 'P', 'E'];
  const [sizeValue, sizeUnit] = parseUnit(sizeWithUnit);
  const sizeIndex = sizes.indexOf(sizeUnit.toUpperCase());
  if (sizeIndex === -1 || isNaN(sizeValue)) {
    throw new Error('Invalid size format,' + sizeWithUnit);
  }
  const bytes = sizeValue * Math.pow(1024, sizeIndex);
  const targetIndex = targetSizeUnit
    ? sizes.indexOf(targetSizeUnit.toUpperCase())
    : sizeIndex;
  const targetBytes = bytes / Math.pow(1024, targetIndex);
  // const numberFixed = targetBytes.toFixed(fixed);
  const numberFixed = round
    ? targetBytes.toFixed(fixed)
    : toFixedFloorWithoutTrailingZeros(targetBytes, fixed);
  return {
    number: targetBytes,
    numberFixed,
    unit: sizes[targetIndex],
    numberUnit: `${numberFixed}${sizes[targetIndex]}`,
  };
}

//
function toFixedFloorWithoutTrailingZeros(num: number, fixed: number) {
  var re = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(re)?.[0] || '0';
}

export function compareNumberWithUnits(size1: string, size2: string) {
  const [number1, unit1] = parseUnit(size1);
  const [number2, unit2] = parseUnit(size2);
  // console.log(size1, size2);
  // console.log(number1, unit1, number2, unit2);
  if (unit1 === unit2) {
    return number1 - number2;
  }
  if (number1 === 0 && number2 === 0) {
    return 0;
  }
  // @ts-ignore
  return iSizeToSize(size1, 'g')?.number - iSizeToSize(size2, 'g')?.number;
}

export function addNumberWithUnits(
  size1: string,
  size2: string,
  targetUnit: SizeUnit = 'm',
) {
  return iSizeToSize(
    (iSizeToSize(size1, 'b')?.number || 0) +
      (iSizeToSize(size2, 'b')?.number || 0) +
      'b',
    targetUnit,
  )?.numberUnit;
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

export function parseUnit(str: string): [number, string] {
  const match = str?.match(/^(\d+(?:\.\d+)?)([a-zA-Z]*)$/);
  if (!match) {
    // If the input doesn't match the pattern, assume it's in bytes
    return [parseFloat(str), 'b'];
  }
  const num = parseFloat(match[1]);
  const unit = match[2];
  return [num, unit.toLowerCase() || 'b'];
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
