import { BigNumber } from './big-number';
import { expect } from '@jest/globals';
import '@jest/globals';
import Big from 'big.js';

declare module '@jest/expect' {
  interface Matchers<R> {
    toEqualBigNumber(expected: unknown, unit?: string): R;
  }
}

expect.extend({
  toEqualBigNumber(received, expected) {
    const number =
      received[0] instanceof Big ? received[0].toString() : received[0];
    const numberMatches =
      (BigNumber.isInvalidNumber(number) &&
        BigNumber.isInvalidNumber(expected[0])) ||
      number === expected[0];

    const pass = numberMatches && received[1] === expected[1];

    return {
      message: () =>
        pass
          ? `expected ${JSON.stringify(received)} not to equal ${JSON.stringify(expected)}`
          : `expected ${JSON.stringify(received)} to equal ${JSON.stringify(expected)}`,
      pass,
    };
  },
});

describe('parseUnit', () => {
  test('parses a number with a unit', () => {
    expect(BigNumber.parseUnit('123px')).toEqualBigNumber(['123', 'px']);
    expect(BigNumber.parseUnit('45.67em')).toEqualBigNumber(['45.67', 'em']);
    expect(BigNumber.parseUnit('100%')).toEqualBigNumber(['100', '%']);
  });

  test('parses a number without a unit', () => {
    expect(BigNumber.parseUnit('123')).toEqualBigNumber(['123', 'b']);
    expect(BigNumber.parseUnit('45.67')).toEqualBigNumber(['45.67', 'b']);
  });

  test('handles invalid input gracefully', () => {
    expect(() => BigNumber.parseUnit('abc')).toThrow();
    expect(() => BigNumber.parseUnit('')).toThrow();
  });

  test('handles edge cases', () => {
    expect(BigNumber.parseUnit('0')).toEqualBigNumber(['0', 'b']);
    expect(BigNumber.parseUnit('0px')).toEqualBigNumber(['0', 'px']);
    expect(BigNumber.parseUnit('.5em')).toEqualBigNumber(['0.5', 'em']);
  });

  test('handle a big large number', () => {
    expect(BigNumber.parseUnit(9007199254740991)).toEqualBigNumber([
      '9007199254740991',
      'b',
    ]);
    expect(BigNumber.parseUnit('9007199254740991B')).toEqualBigNumber([
      '9007199254740991',
      'b',
    ]);
    expect(BigNumber.parseUnit('8P')).toEqualBigNumber(['8', 'p']);
  });
});

describe('convertSizeUnit', () => {
  test('convert size units auto detect', () => {
    expect(BigNumber.convertSizeUnit('1B')).toEqual({
      number: new Big(1),
      numberFixed: '1',
      unit: 'B',
      numberUnit: '1B',
    });
  });

  test('convert big numbers byte to high units', () => {
    expect(BigNumber.convertSizeUnit('9007199254740991B', 'K')).toEqual({
      number: new Big('8796093022207.9990234375'),
      numberFixed: '8796093022208',
      unit: 'K',
      numberUnit: '8796093022208K',
    });

    expect(BigNumber.convertSizeUnit('9007199254740991B', 'P')).toEqual({
      number: new Big('7.99999999999999911182'),
      numberFixed: '8',
      unit: 'P',
      numberUnit: '8P',
    });

    expect(BigNumber.convertSizeUnit('1K')).toEqual({
      number: new Big(1),
      numberFixed: '1',
      unit: 'K',
      numberUnit: '1K',
    });
  });
});

describe('convertBinarySizeUnit', () => {
  it('should convert size using binary (1024) base with default fixed value', () => {
    const sizeWithUnit = '1K';
    const targetSizeUnit = 'B';
    const result = BigNumber.convertBinarySizeUnit(
      sizeWithUnit,
      targetSizeUnit,
    );
    expect(result).toEqual({
      number: new Big(1024),
      numberFixed: '1024',
      unit: 'B',
      numberUnit: '1024B',
    });
  });

  it('should convert binary size with fixed value of 0', () => {
    const sizeWithUnit = '1K';
    const targetSizeUnit = 'B';
    const fixed = 0;
    const result = BigNumber.convertBinarySizeUnit(
      sizeWithUnit,
      targetSizeUnit,
      fixed,
    );
    expect(result).toEqual({
      number: new Big(1024),
      numberFixed: '1024',
      unit: 'B',
      numberUnit: '1024B',
    });
  });

  it('should handle lowercase unit input and convert to uppercase in result', () => {
    const sizeWithUnit = '1m';
    const targetSizeUnit = 'k';
    const result = BigNumber.convertBinarySizeUnit(
      sizeWithUnit,
      targetSizeUnit,
    );
    expect(result).toEqual({
      number: new Big(1024),
      numberFixed: '1024',
      unit: 'K',
      numberUnit: '1024K',
    });
  });

  it('should convert from peta to tera bytes correctly', () => {
    const sizeWithUnit = '1P';
    const targetSizeUnit = 'T';
    const result = BigNumber.convertBinarySizeUnit(
      sizeWithUnit,
      targetSizeUnit,
    );
    expect(result).toEqual({
      number: new Big(1024),
      numberFixed: '1024',
      unit: 'T',
      numberUnit: '1024T',
    });
  });

  it('should throw an error for invalid size format', () => {
    const sizeWithUnit = 'invalid';
    expect(() => BigNumber.convertBinarySizeUnit(sizeWithUnit)).toThrow();
  });

  it('should use input unit as target unit when targetSizeUnit is not provided', () => {
    const sizeWithUnit = '1K';
    const result = BigNumber.convertBinarySizeUnit(sizeWithUnit);
    expect(result).toEqual({
      number: new Big(1),
      numberFixed: '1',
      unit: 'K',
      numberUnit: '1K',
    });
  });

  it('should return undefined for undefined input', () => {
    const sizeWithUnit = undefined;
    const result = BigNumber.convertBinarySizeUnit(sizeWithUnit);
    expect(result).toBeUndefined();
  });

  it('should handle zero input correctly', () => {
    const result = BigNumber.convertBinarySizeUnit('0g', 'b');
    expect(result?.number.toString()).toBe('0');
    expect(result?.unit).toBe('B');
  });

  describe('auto unit selection', () => {
    it('should automatically select appropriate binary units', () => {
      expect(BigNumber.convertBinarySizeUnit('1024B', 'auto')).toEqual({
        number: new Big(1),
        numberFixed: '1',
        unit: 'K',
        numberUnit: '1K',
      });

      expect(BigNumber.convertBinarySizeUnit('1048576B', 'auto')).toEqual({
        number: new Big(1),
        numberFixed: '1',
        unit: 'M',
        numberUnit: '1M',
      });

      expect(BigNumber.convertBinarySizeUnit('1073741824B', 'auto')).toEqual({
        number: new Big(1),
        numberFixed: '1',
        unit: 'G',
        numberUnit: '1G',
      });
    });

    it('should handle small values correctly', () => {
      expect(BigNumber.convertBinarySizeUnit('900B', 'auto')).toEqual({
        number: new Big(900),
        numberFixed: '900',
        unit: 'B',
        numberUnit: '900B',
      });
    });

    it('should handle fractional values correctly', () => {
      expect(BigNumber.convertBinarySizeUnit('1536B', 'auto')).toEqual({
        number: new Big(1.5),
        numberFixed: '1.5',
        unit: 'K',
        numberUnit: '1.5K',
      });
    });
  });
});

describe('compareNumberWithUnits', () => {
  it('should return 0 if both sizes are 0', () => {
    expect(BigNumber.compareNumberWithUnits('0', '0')).toBe(0);
  });

  it('should return a negative number if size1 is smaller than size2', () => {
    expect(
      BigNumber.compareNumberWithUnits('256m', '9007199254740991'),
    ).toBeLessThan(0);
  });

  it('should return a positive number if size1 is larger than size2', () => {
    expect(
      BigNumber.compareNumberWithUnits('9007199254740991', '256m'),
    ).toBeGreaterThan(0);
  });

  it('should return the correct value when comparing sizes with the same unit', () => {
    expect(BigNumber.compareNumberWithUnits('1k', '1024')).toBe(0);
    expect(BigNumber.compareNumberWithUnits('2m', '2048k')).toBe(0);
    expect(BigNumber.compareNumberWithUnits('3g', '3072m')).toBe(0);
    expect(BigNumber.compareNumberWithUnits('4t', '4096g')).toBe(0);
  });

  it('should return the correct value when comparing sizes with different units', () => {
    expect(BigNumber.compareNumberWithUnits('1k', '1m')).toBeLessThan(0);
    expect(BigNumber.compareNumberWithUnits('1m', '1g')).toBeLessThan(0);
    expect(BigNumber.compareNumberWithUnits('1g', '1t')).toBeLessThan(0);
    expect(BigNumber.compareNumberWithUnits('1t', '1p')).toBeLessThan(0);
  });
});

describe('addNumberWithUnits', () => {
  it('should add two sizes with the same unit', () => {
    expect(BigNumber.addNumberWithUnits('1K', '2K', 'K')).toBe('3K');
    expect(BigNumber.addNumberWithUnits('1M', '2M', 'M')).toBe('3M');
    expect(BigNumber.addNumberWithUnits('1G', '2G', 'G')).toBe('3G');
    expect(BigNumber.addNumberWithUnits('1T', '2T', 'T')).toBe('3T');
  });

  it('should add two sizes with the same unit (targetUnit is `m` default Unit)', () => {
    expect(BigNumber.addNumberWithUnits('1G', '2G')).toBe('3072M');
    expect(BigNumber.addNumberWithUnits('1T', '2T')).toBe('3145728M');
  });

  it('should add two sizes with different units', () => {
    expect(BigNumber.addNumberWithUnits('1K', '1M', 'K')).toBe('1025K');
    expect(BigNumber.addNumberWithUnits('1M', '1G', 'M')).toBe('1025M');
    expect(BigNumber.addNumberWithUnits('1G', '1T', 'G')).toBe('1025G');
    expect(BigNumber.addNumberWithUnits('1T', '1P', 'T')).toBe('1025T');
  });
});

describe('subNumberWithUnits', () => {
  it('should sub two sizes with the same unit', () => {
    expect(BigNumber.subNumberWithUnits('2K', '1K', 'K')).toBe('1K');
    expect(BigNumber.subNumberWithUnits('2M', '1M', 'M')).toBe('1M');
    expect(BigNumber.subNumberWithUnits('2G', '1G', 'G')).toBe('1G');
    expect(BigNumber.subNumberWithUnits('2T', '1T', 'T')).toBe('1T');
  });

  it('should sub two sizes with the same unit (targetUnit is `m` default Unit)', () => {
    expect(BigNumber.subNumberWithUnits('2G', '1G')).toBe('1024M');
    expect(BigNumber.subNumberWithUnits('2T', '1T')).toBe('1048576M');
  });

  it('should sub two sizes with different units', () => {
    expect(BigNumber.subNumberWithUnits('1M', '1K', 'K')).toBe('1023K');
    expect(BigNumber.subNumberWithUnits('1G', '1M', 'M')).toBe('1023M');
    expect(BigNumber.subNumberWithUnits('1T', '1G', 'G')).toBe('1023G');
    expect(BigNumber.subNumberWithUnits('1P', '1T', 'T')).toBe('1023T');
  });
});

describe('isOutsideRangeWithUnits', () => {
  it('should return true if the value is less than the minimum', () => {
    expect(BigNumber.isOutsideRangeWithUnits('1G', '2G', '3G')).toBe(true);
    expect(BigNumber.isOutsideRangeWithUnits('1000M', '2G', '3G')).toBe(true);
    expect(BigNumber.isOutsideRangeWithUnits('2.5B', '2M', '3M')).toBe(true);
  });

  it('should return true if the value is greater than the maximum', () => {
    expect(BigNumber.isOutsideRangeWithUnits('4G', '2G', '3G')).toBe(true);
    expect(BigNumber.isOutsideRangeWithUnits('4000M', '2G', '3G')).toBe(true);
    expect(BigNumber.isOutsideRangeWithUnits('4B', '2M', '3M')).toBe(true);
  });

  it('should return false if the value is within the range', () => {
    expect(BigNumber.isOutsideRangeWithUnits('2.5G', '2G', '3G')).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('2050M', '2G', '3G')).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('2100000B', '2M', '3M')).toBe(
      false,
    );
  });

  it('should return false if the value is within the range (==min)', () => {
    expect(BigNumber.isOutsideRangeWithUnits('2G', '2G', '3G')).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('2048M', '2G', '3G')).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('2097152B', '2M', '3M')).toBe(
      false,
    );
    expect(BigNumber.isOutsideRangeWithUnits('2097151B', '2M', '3M')).toBe(
      true,
    );
  });

  it('should return false if the value is within the range (==max)', () => {
    expect(BigNumber.isOutsideRangeWithUnits('3G', '2G', '3G')).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('3072K', '2M', '3M')).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('3145728B', '2M', '3M')).toBe(
      false,
    );
    expect(BigNumber.isOutsideRangeWithUnits('3145729B', '2M', '3M')).toBe(
      true,
    );
  });

  it('should treat "undefined" as no upper or lower limit', () => {
    expect(BigNumber.isOutsideRangeWithUnits('3', '1', undefined)).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('1', '1', undefined)).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('0.9', '1', undefined)).toBe(true);
    expect(BigNumber.isOutsideRangeWithUnits('3', undefined, '4')).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('4.1', undefined, '4')).toBe(true);
    expect(BigNumber.isOutsideRangeWithUnits('4.1', undefined, undefined)).toBe(
      false,
    );
  });
});

describe('toFixedFloorWithoutTrailingZeros', () => {
  it('should return the number with trailing zeros', () => {
    expect(BigNumber.toFixedWithNoZero(1.1, 2)).toEqual('1.1');
    expect(BigNumber.toFixedWithNoZero(1.01, 2)).toEqual('1.01');
    expect(BigNumber.toFixedWithNoZero(1.001, 2)).toEqual('1');
    expect(BigNumber.toFixedWithNoZero(1.0001, 2)).toEqual('1');
    expect(BigNumber.toFixedWithNoZero(1.0010001, 2)).toEqual('1');
    expect(BigNumber.toFixedWithNoZero(1.0010001, 3)).toEqual('1.001');
    expect(BigNumber.toFixedWithNoZero(1.0010001, 4)).toEqual('1.001');
    expect(BigNumber.toFixedWithNoZero(1.006, 2)).toEqual('1.01');
    expect(BigNumber.toFixedWithNoZero(1.097, 2)).toEqual('1.1');
  });

  it('should work incase of string type input', () => {
    expect(BigNumber.toFixedWithNoZero('1.1', 2)).toEqual('1.1');
    expect(BigNumber.toFixedWithNoZero('1.01', 2)).toEqual('1.01');
    expect(BigNumber.toFixedWithNoZero('1.001', 2)).toEqual('1');
    expect(BigNumber.toFixedWithNoZero('1.0001', 2)).toEqual('1');
    expect(BigNumber.toFixedWithNoZero('1.0010001', 2)).toEqual('1');
    expect(BigNumber.toFixedWithNoZero('1.0010001', 3)).toEqual('1.001');
    expect(BigNumber.toFixedWithNoZero('1.0010001', 4)).toEqual('1.001');
    expect(BigNumber.toFixedWithNoZero('1.006', 2)).toEqual('1.01');
    expect(BigNumber.toFixedWithNoZero('1.097', 2)).toEqual('1.1');
  });
});
