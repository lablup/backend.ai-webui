import {
  getImageFullName,
  isOutsideRange,
  isOutsideRangeWithUnits,
  localeCompare,
  numberSorterWithInfinityValue,
  convertToDecimalUnit,
  filterOutEmpty,
} from './index';

describe('isOutsideRange', () => {
  it('should return true if the value is less than the minimum', () => {
    expect(isOutsideRange(1, 2, 3)).toBe(true);
  });

  it('should return true if the value is greater than the maximum', () => {
    expect(isOutsideRange(4, 2, 3)).toBe(true);
  });
  it('should return false if the value is within the range', () => {
    expect(isOutsideRange(2, 1, 3)).toBe(false);
  });
  it('should return false if the value is within the range (==min)', () => {
    expect(isOutsideRange(1, 1, 3)).toBe(false);
  });
  it('should return false if the value is within the range (==max)', () => {
    expect(isOutsideRange(3, 1, 3)).toBe(false);
  });

  it('should treat "undefined" as no upper or lower limit', () => {
    expect(isOutsideRange(3, 1, undefined)).toBe(false);
    expect(isOutsideRange(1, 1, undefined)).toBe(false);
    expect(isOutsideRange(0.9, 1, undefined)).toBe(true);
    expect(isOutsideRange(3, undefined, 4)).toBe(false);
    expect(isOutsideRange(4.1, undefined, 4)).toBe(true);
    expect(isOutsideRange(4.1, undefined, undefined)).toBe(false);
  });
});

describe('isOutsideRangeWithUnits', () => {
  it('should return true if the value is less than the minimum', () => {
    expect(isOutsideRangeWithUnits('1g', '2g', '3g')).toBe(true);
    expect(isOutsideRangeWithUnits('1000m', '2g', '3g')).toBe(true);
    expect(isOutsideRangeWithUnits('2.5', '2m', '3m')).toBe(true);
  });

  it('should return true if the value is greater than the maximum', () => {
    expect(isOutsideRangeWithUnits('4g', '2g', '3g')).toBe(true);
    expect(isOutsideRangeWithUnits('4000m', '2g', '3g')).toBe(true);
    expect(isOutsideRangeWithUnits('4', '2m', '3m')).toBe(true);
  });

  it('should return false if the value is within the range', () => {
    expect(isOutsideRangeWithUnits('2.5g', '2g', '3g')).toBe(false);
    expect(isOutsideRangeWithUnits('2050m', '2g', '3g')).toBe(false);
    expect(isOutsideRangeWithUnits('2100000', '2m', '3m')).toBe(false);
  });

  it('should return false if the value is within the range (==min)', () => {
    expect(isOutsideRangeWithUnits('2g', '2g', '3g')).toBe(false);
    expect(isOutsideRangeWithUnits('2048m', '2g', '3g')).toBe(false);
    expect(isOutsideRangeWithUnits('2097152', '2m', '3m')).toBe(false);
    expect(isOutsideRangeWithUnits('2097151', '2m', '3m')).toBe(true);
  });

  it('should return false if the value is within the range (==max)', () => {
    expect(isOutsideRangeWithUnits('3g', '2g', '3g')).toBe(false);
    expect(isOutsideRangeWithUnits('3072k', '2m', '3m')).toBe(false);
    expect(isOutsideRangeWithUnits('3145728', '2m', '3m')).toBe(false);
    expect(isOutsideRangeWithUnits('3145729', '2m', '3m')).toBe(true);
  });

  it('should treat "undefined" as no upper or lower limit', () => {
    expect(isOutsideRangeWithUnits('3', '1', undefined)).toBe(false);
    expect(isOutsideRangeWithUnits('1', '1', undefined)).toBe(false);
    expect(isOutsideRangeWithUnits('0.9', '1', undefined)).toBe(true);
    expect(isOutsideRangeWithUnits('3', undefined, '4')).toBe(false);
    expect(isOutsideRangeWithUnits('4.1', undefined, '4')).toBe(true);
    expect(isOutsideRangeWithUnits('4.1', undefined, undefined)).toBe(false);
  });
});

describe('localeCompare', () => {
  it('should return -1 if first argument is null or undefined', () => {
    expect(localeCompare(null, 'test')).toEqual(-1);
    expect(localeCompare(undefined, 'test')).toEqual(-1);
  });

  it('should return 1 if second argument is null or undefined', () => {
    expect(localeCompare('test', null)).toEqual(1);
    expect(localeCompare('test', undefined)).toEqual(1);
  });

  it('should correctly compare two strings', () => {
    expect(localeCompare('apple', 'banana')).toEqual(-1);
    expect(localeCompare('banana', 'apple')).toEqual(1);
    expect(localeCompare('apple', 'apple')).toEqual(0);
  });
});

describe('numberSorterWithInfinityValue', () => {
  it('should correctly sort when a is greater than b', () => {
    expect(numberSorterWithInfinityValue(2, 1)).toBeGreaterThan(0);
  });

  it('should correctly sort when a is less than b', () => {
    expect(numberSorterWithInfinityValue(1, 2)).toBeLessThan(0);
  });

  it('should return 0 when a and b are equal', () => {
    expect(numberSorterWithInfinityValue(1, 1)).toBe(0);
  });

  it('should treat infiniteValue as infinity', () => {
    expect(numberSorterWithInfinityValue(-1, 1, -1)).toBeGreaterThan(0);
    expect(numberSorterWithInfinityValue(1, -1, -1)).toBeLessThan(0);
  });

  it('should use nullishFallbackValue for null or undefined values', () => {
    expect(numberSorterWithInfinityValue(null, 1, -1, 0)).toBeLessThan(0);
    expect(numberSorterWithInfinityValue(1, null, -1, 0)).toBeGreaterThan(0);
    expect(numberSorterWithInfinityValue(undefined, 1, -1, 0)).toBeLessThan(0);
    expect(numberSorterWithInfinityValue(1, undefined, -1, 0)).toBeGreaterThan(
      0,
    );
  });
});

describe('filterEmptyItem', () => {
  it('should filter out undefined, null, empty string, false, empty array, and empty object', () => {
    const input = [undefined, null, '', false, [], {}, 'item1', 'item2'];
    const output = filterOutEmpty(input);
    expect(output).toEqual(['item1', 'item2']);
  });

  it('should return an empty array when all items are empty', () => {
    const input = [undefined, null, '', false, [], {}];
    const output = filterOutEmpty(input);
    expect(output).toEqual([]);
  });

  it('should return the same array when no items are empty', () => {
    const input = ['item1', 'item2', 'item3'];
    const output = filterOutEmpty(input);
    expect(output).toEqual(['item1', 'item2', 'item3']);
  });
});

describe('getImageFullName', () => {
  it('should return the full image name using only the namespace if there is a namespace but no name.', () => {
    const result =
      getImageFullName({
        namespace: 'abc/def/training',
        name: undefined,
        humanized_name: 'abc/def/training',
        tag: '01-py3-abc-v1-def',
        registry: '192.168.0.1:7080',
        architecture: 'x86_64',
        digest: 'sha256:123456',
        id: 'sample id',
        installed: true,
        resource_limits: [
          {
            key: 'cpu',
            min: '1',
            max: null,
          },
          {
            key: 'mem',
            min: '1g',
            max: null,
          },
          {
            key: 'cuda.device',
            min: '0',
            max: null,
          },
          {
            key: 'cuda.shares',
            min: '0',
            max: null,
          },
        ],
        labels: [
          {
            key: 'maintainer',
            value: 'NVIDIA CORPORATION <cudatools@nvidia.com>',
          },
        ],
        base_image_name: 'def/training',
        tags: [
          {
            key: 'py3',
            value: 'abc',
          },
          {
            key: 'v1',
            value: 'def',
          },
        ],
        version: '01',
      }) || '';
    expect(result).toBe(
      '192.168.0.1:7080/abc/def/training:01-py3-abc-v1-def@x86_64',
    );
  });
  it('should return the full image name using only the name if there is a name but no namespace.', () => {
    const result =
      getImageFullName({
        namespace: undefined,
        name: 'abc/def/training',
        humanized_name: 'abc/def/training',
        tag: '01-py3-abc-v1-def',
        registry: '192.168.0.1:7080',
        architecture: 'x86_64',
        digest: 'sha256:123456',
        id: 'sample id',
        installed: true,
        resource_limits: [
          {
            key: 'cpu',
            min: '1',
            max: null,
          },
          {
            key: 'mem',
            min: '1g',
            max: null,
          },
          {
            key: 'cuda.device',
            min: '0',
            max: null,
          },
          {
            key: 'cuda.shares',
            min: '0',
            max: null,
          },
        ],
        labels: [
          {
            key: 'maintainer',
            value: 'NVIDIA CORPORATION <cudatools@nvidia.com>',
          },
        ],
        base_image_name: 'def/training',
        tags: [
          {
            key: 'py3',
            value: 'abc',
          },
          {
            key: 'v1',
            value: 'def',
          },
        ],
        version: '01',
      }) || '';
    expect(result).toBe(
      '192.168.0.1:7080/abc/def/training:01-py3-abc-v1-def@x86_64',
    );
  });

  it('should return the full image name using namespace if there are both name and namespace.', () => {
    const result =
      getImageFullName({
        namespace: 'abc/def/training',
        name: 'ghi/jkl/training',
        humanized_name: 'abc/def/training',
        tag: '01-py3-abc-v1-def',
        registry: '192.168.0.1:7080',
        architecture: 'x86_64',
        digest: 'sha256:123456',
        id: 'sample id',
        installed: true,
        resource_limits: [
          {
            key: 'cpu',
            min: '1',
            max: null,
          },
          {
            key: 'mem',
            min: '1g',
            max: null,
          },
          {
            key: 'cuda.device',
            min: '0',
            max: null,
          },
          {
            key: 'cuda.shares',
            min: '0',
            max: null,
          },
        ],
        labels: [
          {
            key: 'maintainer',
            value: 'NVIDIA CORPORATION <cudatools@nvidia.com>',
          },
        ],
        base_image_name: 'def/training',
        tags: [
          {
            key: 'py3',
            value: 'abc',
          },
          {
            key: 'v1',
            value: 'def',
          },
        ],
        version: '01',
      }) || '';
    expect(result).toBe(
      '192.168.0.1:7080/abc/def/training:01-py3-abc-v1-def@x86_64',
    );
  });
});

describe('auto unit selection', () => {
  it('should automatically select appropriate decimal units', () => {
    expect(convertToDecimalUnit('1000', 'auto')).toEqual({
      number: 1,
      numberFixed: '1',
      unit: 'k',
      displayUnit: 'KB',
      value: '1k',
      displayValue: '1 KB',
    });

    expect(convertToDecimalUnit('1000000', 'auto')).toEqual({
      number: 1,
      numberFixed: '1',
      unit: 'm',
      displayUnit: 'MB',
      value: '1m',
      displayValue: '1 MB',
    });

    expect(convertToDecimalUnit('1000000000', 'auto')).toEqual({
      number: 1,
      numberFixed: '1',
      unit: 'g',
      displayUnit: 'GB',
      value: '1g',
      displayValue: '1 GB',
    });
  });

  it('should handle small values correctly', () => {
    expect(convertToDecimalUnit('900', 'auto')).toEqual({
      number: 900,
      numberFixed: '900',
      unit: '',
      displayUnit: 'B',
      value: '900',
      displayValue: '900 B',
    });
  });

  it('should handle fractional values correctly', () => {
    expect(convertToDecimalUnit('1500', 'auto')).toEqual({
      number: 1.5,
      numberFixed: '1.5',
      unit: 'k',
      displayUnit: 'KB',
      value: '1.5k',
      displayValue: '1.5 KB',
    });
  });
});
