import {
  addNumberWithUnits,
  compareNumberWithUnits,
  filterEmptyItem,
  getImageFullName,
  convertToBinaryUnit,
  isOutsideRange,
  isOutsideRangeWithUnits,
  localeCompare,
  numberSorterWithInfinityValue,
  parseValueWithUnit,
  toFixedFloorWithoutTrailingZeros,
  transformSorterToOrderString,
  convertToDecimalUnit,
} from './index';

describe('convertBinarySizeUnit', () => {
  it('should convert size using binary (1024) base with default fixed value', () => {
    const sizeWithUnit = '1k';
    const result = convertToBinaryUnit(sizeWithUnit, '');
    expect(result).toMatchObject({
      number: 1024,
      numberFixed: '1024',
      unit: '',
      value: '1024',
      displayValue: '1024 BiB',
    });
  });

  it('should convert binary size with fixed value of 0', () => {
    const sizeWithUnit = '1K';
    const fixed = 0;
    const result = convertToBinaryUnit(sizeWithUnit, '', fixed);
    expect(result).toMatchObject({
      number: 1024,
      numberFixed: '1024',
      unit: '',
      displayValue: '1024 BiB',
      value: '1024',
    });
  });

  it('should handle lowercase unit input and convert to uppercase in result', () => {
    const sizeWithUnit = '1m';
    const targetSizeUnit = 'k';
    const result = convertToBinaryUnit(sizeWithUnit, targetSizeUnit);
    expect(result).toMatchObject({
      number: 1024,
      numberFixed: '1024',
      unit: 'k',
      displayValue: '1024 KiB',
      value: '1024k',
    });
  });

  it('should convert from peta to tera bytes correctly', () => {
    const sizeWithUnit = '1P';
    const targetSizeUnit = 't';
    const result = convertToBinaryUnit(sizeWithUnit, targetSizeUnit);
    expect(result).toMatchObject({
      number: 1024,
      numberFixed: '1024',
      unit: 't',
      displayValue: '1024 TiB',
    });
  });

  it('should throw an error for invalid size format', () => {
    const sizeWithUnit = 'invalid';
    expect(() => convertToBinaryUnit(sizeWithUnit, '')).toThrow(
      'Invalid size format',
    );
  });

  it('should return undefined for undefined input', () => {
    const sizeWithUnit = undefined;
    const result = convertToBinaryUnit(sizeWithUnit, '');
    expect(result).toBeUndefined();
  });

  it('should handle zero input correctly', () => {
    const result = convertToBinaryUnit('0g', '');
    expect(result?.number).toBe(0);
    expect(result?.unit).toBe('');
  });
  describe('auto unit selection', () => {
    it('should automatically select appropriate binary units', () => {
      expect(convertToBinaryUnit('1024', 'auto')).toMatchObject({
        number: 1,
        numberFixed: '1',
        unit: 'k',
        value: '1k',
        displayValue: '1 KiB',
      });

      expect(convertToBinaryUnit('1048576', 'auto')).toMatchObject({
        number: 1,
        numberFixed: '1',
        unit: 'm',
        value: '1m',
        displayValue: '1 MiB',
      });

      expect(convertToBinaryUnit('1073741824', 'auto')).toMatchObject({
        number: 1,
        numberFixed: '1',
        unit: 'g',
        value: '1g',
        displayValue: '1 GiB',
      });
    });

    it('should handle small values correctly', () => {
      expect(convertToBinaryUnit('900', 'auto')).toMatchObject({
        number: 900,
        numberFixed: '900',
        unit: '',
        displayValue: '900 BiB',
      });
    });

    it('should handle fractional values correctly', () => {
      expect(convertToBinaryUnit('1536', 'auto')).toMatchObject({
        number: 1.5,
        numberFixed: '1.5',
        unit: 'k',
        displayValue: '1.5 KiB',
      });
    });
  });
});

describe('parseUnit', () => {
  test('parses a number with a unit', () => {
    expect(parseValueWithUnit('123k')).toEqual([123, 'k']);
    expect(parseValueWithUnit('45.67 g')).toEqual([45.67, 'g']);
  });

  test('parses a number without a unit', () => {
    expect(parseValueWithUnit('123')).toEqual([123, '']);
    expect(parseValueWithUnit('45.67')).toEqual([45.67, '']);
  });

  test('handles invalid input gracefully', () => {
    expect(parseValueWithUnit('abc')).toEqual([NaN, undefined]);
    expect(parseValueWithUnit('')).toEqual([NaN, undefined]);
  });

  test('handles edge cases', () => {
    expect(parseValueWithUnit('0')).toEqual([0, '']);
    expect(parseValueWithUnit('0')).toEqual([0, '']);
    expect(parseValueWithUnit('.5g')).toEqual([0.5, 'g']);
    expect(parseValueWithUnit('.5 g')).toEqual([0.5, 'g']);
  });
});

describe('compareNumberWithUnits', () => {
  it('should return 0 if both sizes are 0', () => {
    expect(compareNumberWithUnits('0', '0')).toBe(0);
  });

  it('should return a negative number if size1 is smaller than size2', () => {
    expect(compareNumberWithUnits('256m', '9007199254740991')).toBeLessThan(0);
  });

  it('should return a positive number if size1 is larger than size2', () => {
    expect(compareNumberWithUnits('9007199254740991', '256m')).toBeGreaterThan(
      0,
    );
  });

  it('should return the correct value when comparing sizes with the same unit', () => {
    expect(compareNumberWithUnits('1k', '1024')).toBe(0);
    expect(compareNumberWithUnits('2m', '2048k')).toBe(0);
    expect(compareNumberWithUnits('3g', '3072m')).toBe(0);
    expect(compareNumberWithUnits('4t', '4096g')).toBe(0);
  });

  it('should return the correct value when comparing sizes with different units', () => {
    expect(compareNumberWithUnits('1k', '1m')).toBeLessThan(0);
    expect(compareNumberWithUnits('1m', '1g')).toBeLessThan(0);
    expect(compareNumberWithUnits('1g', '1t')).toBeLessThan(0);
    expect(compareNumberWithUnits('1t', '1p')).toBeLessThan(0);
  });
});

describe('addNumberWithUnits', () => {
  it('should add two sizes with the same unit', () => {
    expect(addNumberWithUnits('1k', '2k', 'k')).toBe('3k');
    expect(addNumberWithUnits('1m', '2m', 'm')).toBe('3m');
    expect(addNumberWithUnits('1g', '2g', 'g')).toBe('3g');
    expect(addNumberWithUnits('1t', '2t', 't')).toBe('3t');
  });

  it('should add two sizes with the same unit (targetUnit is `m` default Unit)', () => {
    expect(addNumberWithUnits('1g', '2g')).toBe('3072m');
    expect(addNumberWithUnits('1t', '2t')).toBe('3145728m');
  });

  it('should add two sizes with different units', () => {
    expect(addNumberWithUnits('1k', '1m', 'k')).toBe('1025k');
    expect(addNumberWithUnits('1m', '1g', 'm')).toBe('1025m');
    expect(addNumberWithUnits('1g', '1t', 'g')).toBe('1025g');
    expect(addNumberWithUnits('1t', '1p', 't')).toBe('1025t');
  });

  it('should produce the same result even when there is a space between the number and unit', () => {
    expect(addNumberWithUnits('1 k', '1m', 'k')).toBe('1025k');
    expect(addNumberWithUnits('1m', '1 g', 'm')).toBe('1025m');
    expect(addNumberWithUnits('1 g', '1 t', 'g')).toBe('1025g');
    expect(addNumberWithUnits('1 t', '1p', 't')).toBe('1025t');
  });
});

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

describe('transformSorterToOrderString', () => {
  it('should correctly transform single sorter to order string', () => {
    const sorter = { order: 'descend' as const, field: 'name' };
    const result = transformSorterToOrderString(sorter);
    expect(result).toEqual('-name');
  });

  it('should correctly transform array of sorters to order string', () => {
    const sorter = [
      { order: 'descend' as const, field: 'name' },
      { order: 'ascend' as const, field: 'age' },
    ];
    const result = transformSorterToOrderString(sorter);
    expect(result).toEqual('-name,age');
  });

  it('should return undefined for sorter without order', () => {
    const sorter = { field: 'name' };
    const result = transformSorterToOrderString(sorter);
    expect(result).toBeUndefined();
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
    const output = filterEmptyItem(input);
    expect(output).toEqual(['item1', 'item2']);
  });

  it('should return an empty array when all items are empty', () => {
    const input = [undefined, null, '', false, [], {}];
    const output = filterEmptyItem(input);
    expect(output).toEqual([]);
  });

  it('should return the same array when no items are empty', () => {
    const input = ['item1', 'item2', 'item3'];
    const output = filterEmptyItem(input);
    expect(output).toEqual(['item1', 'item2', 'item3']);
  });
});

describe('toFixedFloorWithoutTrailingZeros', () => {
  it('should return the number with trailing zeros', () => {
    expect(toFixedFloorWithoutTrailingZeros(1.1, 2)).toEqual('1.1');
    expect(toFixedFloorWithoutTrailingZeros(1.01, 2)).toEqual('1.01');
    expect(toFixedFloorWithoutTrailingZeros(1.001, 2)).toEqual('1');
    expect(toFixedFloorWithoutTrailingZeros(1.0001, 2)).toEqual('1');
    expect(toFixedFloorWithoutTrailingZeros(1.0010001, 2)).toEqual('1');
    expect(toFixedFloorWithoutTrailingZeros(1.0010001, 3)).toEqual('1.001');
    expect(toFixedFloorWithoutTrailingZeros(1.0010001, 4)).toEqual('1.001');
    expect(toFixedFloorWithoutTrailingZeros(1.006, 2)).toEqual('1.01');
    expect(toFixedFloorWithoutTrailingZeros(1.097, 2)).toEqual('1.1');
  });

  it('should work incase of string type input', () => {
    expect(toFixedFloorWithoutTrailingZeros('1.1', 2)).toEqual('1.1');
    expect(toFixedFloorWithoutTrailingZeros('1.01', 2)).toEqual('1.01');
    expect(toFixedFloorWithoutTrailingZeros('1.001', 2)).toEqual('1');
    expect(toFixedFloorWithoutTrailingZeros('1.0001', 2)).toEqual('1');
    expect(toFixedFloorWithoutTrailingZeros('1.0010001', 2)).toEqual('1');
    expect(toFixedFloorWithoutTrailingZeros('1.0010001', 3)).toEqual('1.001');
    expect(toFixedFloorWithoutTrailingZeros('1.0010001', 4)).toEqual('1.001');
    expect(toFixedFloorWithoutTrailingZeros('1.006', 2)).toEqual('1.01');
    expect(toFixedFloorWithoutTrailingZeros('1.097', 2)).toEqual('1.1');
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

describe('convertDecimalSizeUnit', () => {
  it('should convert size using decimal (1000) base with default fixed value', () => {
    const sizeWithUnit = '1k';
    const result = convertToDecimalUnit(sizeWithUnit, '');
    expect(result).toEqual({
      number: 1000,
      numberFixed: '1000',
      unit: '',
      displayUnit: 'B',
      value: '1000',
      displayValue: '1000 B',
    });
  });

  it('should convert decimal size with fixed value of 0', () => {
    const sizeWithUnit = '1k';
    const fixed = 0;
    const result = convertToDecimalUnit(sizeWithUnit, '', fixed);
    expect(result).toEqual({
      number: 1000,
      numberFixed: '1000',
      unit: '',
      displayUnit: 'B',
      value: '1000',
      displayValue: '1000 B',
    });
  });

  it('should handle lowercase unit input and convert to uppercase in result', () => {
    const sizeWithUnit = '1m';
    const targetSizeUnit = 'k';
    const result = convertToDecimalUnit(sizeWithUnit, targetSizeUnit);
    expect(result).toEqual({
      number: 1000,
      numberFixed: '1000',
      unit: 'k',
      displayUnit: 'KB',
      value: '1000k',
      displayValue: '1000 KB',
    });
  });

  it('should convert from peta to tera bytes correctly', () => {
    const sizeWithUnit = '1P';
    const targetSizeUnit = 't';
    const result = convertToDecimalUnit(sizeWithUnit, targetSizeUnit);
    expect(result).toEqual({
      number: 1000,
      numberFixed: '1000',
      unit: 't',
      displayUnit: 'TB',
      value: '1000t',
      displayValue: '1000 TB',
    });
  });

  it('should throw an error for invalid size format', () => {
    const sizeWithUnit = 'invalid';
    expect(() => convertToDecimalUnit(sizeWithUnit, '')).toThrow(
      'Invalid size format',
    );
  });

  it('should return undefined for undefined input', () => {
    const sizeWithUnit = undefined;
    const result = convertToDecimalUnit(sizeWithUnit, '');
    expect(result).toBeUndefined();
  });

  it('should handle zero input correctly', () => {
    const result = convertToDecimalUnit('0g', '');
    expect(result?.number).toBe(0);
    expect(result?.unit).toBe('');
  });

  it('should handle fractional numbers correctly', () => {
    const result = convertToDecimalUnit('0.5g', 'm');
    expect(result?.number).toBe(500);
    expect(result?.unit).toBe('m');
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
