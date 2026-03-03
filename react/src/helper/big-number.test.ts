/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BigNumber } from './big-number';
import { expect } from '@jest/globals';
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
    expect(BigNumber.parseUnit('123')).toEqualBigNumber(['123', '']);
    expect(BigNumber.parseUnit('45.67k')).toEqualBigNumber(['45.67', 'k']);
    expect(BigNumber.parseUnit('100g')).toEqualBigNumber(['100', 'g']);
  });

  test('parses a number without a unit', () => {
    expect(BigNumber.parseUnit('123')).toEqualBigNumber(['123', '']);
    expect(BigNumber.parseUnit('45.67')).toEqualBigNumber(['45.67', '']);
  });

  test('handles invalid input gracefully', () => {
    expect(() => BigNumber.parseUnit('abc')).toThrow();
    expect(() => BigNumber.parseUnit('')).toThrow();
  });

  test('handles edge cases', () => {
    expect(BigNumber.parseUnit('0')).toEqualBigNumber(['0', '']);
    expect(BigNumber.parseUnit('0g')).toEqualBigNumber(['0', 'g']);
    expect(BigNumber.parseUnit('.5g')).toEqualBigNumber(['0.5', 'g']);
  });

  test('handle a big large number', () => {
    expect(BigNumber.parseUnit(9007199254740991)).toEqualBigNumber([
      '9007199254740991',
      '',
    ]);
    expect(BigNumber.parseUnit('9007199254740991')).toEqualBigNumber([
      '9007199254740991',
      '',
    ]);
    expect(BigNumber.parseUnit('8P')).toEqualBigNumber(['8', 'P']);
  });
});

describe('convertSizeUnit', () => {
  test('convert size units auto detect', () => {
    expect(BigNumber.convertUnitValue('1')).toEqual({
      number: new Big(1),
      numberFixed: '1',
      unit: '',
      value: '1',
    });
  });

  test('convert big numbers byte to high units', () => {
    expect(BigNumber.convertUnitValue('9007199254740991', 'k')).toEqual({
      number: new Big('8796093022207.9990234375'),
      numberFixed: '8796093022208',
      unit: 'k',
      value: '8796093022208k',
    });

    expect(BigNumber.convertUnitValue('9007199254740991', 'p')).toEqual({
      number: new Big('7.99999999999999911182'),
      numberFixed: '8',
      unit: 'p',
      value: '8p',
    });

    expect(BigNumber.convertUnitValue('1k')).toEqual({
      number: new Big(1024),
      numberFixed: '1024',
      unit: '',
      value: '1024',
    });
  });
});

describe('convertBinarySizeUnit', () => {
  it('should convert size using binary (1024) base with default fixed value', () => {
    const sizeWithUnit = '1k';
    const result = BigNumber.convertToBinaryUnit(sizeWithUnit, '');
    expect(result).toEqual({
      number: new Big(1024),
      numberFixed: '1024',
      unit: '',
      displayUnit: 'BiB',
      value: '1024',
      displayValue: '1024 BiB',
    });
  });

  it('should convert binary size with fixed value of 0', () => {
    const sizeWithUnit = '1k';
    const fixed = 0;
    const result = BigNumber.convertToBinaryUnit(sizeWithUnit, '', fixed);
    expect(result).toMatchObject({
      number: new Big(1024),
      numberFixed: '1024',
      unit: '',
      displayUnit: 'BiB',
      value: '1024',
      displayValue: '1024 BiB',
    });
  });

  it('should handle lowercase unit input and convert to uppercase in result', () => {
    const sizeWithUnit = '1m';
    const targetSizeUnit = 'k';
    const result = BigNumber.convertToBinaryUnit(sizeWithUnit, targetSizeUnit);
    expect(result).toEqual({
      number: new Big(1024),
      numberFixed: '1024',
      unit: 'k',
      displayUnit: 'KiB',
      value: '1024k',
      displayValue: '1024 KiB',
    });
  });

  it('should convert from peta to tera bytes correctly', () => {
    const sizeWithUnit = '1p';
    const targetSizeUnit = 't';
    const result = BigNumber.convertToBinaryUnit(sizeWithUnit, targetSizeUnit);
    expect(result).toMatchObject({
      number: new Big(1024),
      numberFixed: '1024',
      unit: 't',
      displayUnit: 'TiB',
      value: '1024t',
      displayValue: '1024 TiB',
    });
  });

  it('should throw an error for invalid size format', () => {
    const sizeWithUnit = 'invalid';
    expect(() => BigNumber.convertToBinaryUnit(sizeWithUnit)).toThrow();
  });

  it('should return undefined for undefined input', () => {
    const sizeWithUnit = undefined;
    const result = BigNumber.convertToBinaryUnit(sizeWithUnit);
    expect(result).toBeUndefined();
  });

  it('should handle zero input correctly', () => {
    const result = BigNumber.convertToBinaryUnit('0g', '');
    expect(result?.number.toString()).toBe('0');
    expect(result?.unit).toBe('');
    expect(result?.displayUnit).toBe('BiB');
  });

  describe('auto unit selection', () => {
    it('should automatically select appropriate binary units', () => {
      expect(BigNumber.convertToBinaryUnit('1024', 'auto')).toMatchObject({
        number: new Big(1),
        numberFixed: '1',
        unit: 'k',
        displayValue: '1 KiB',
      });

      expect(BigNumber.convertToBinaryUnit('1048576', 'auto')).toMatchObject({
        number: new Big(1),
        numberFixed: '1',
        unit: 'm',
        displayValue: '1 MiB',
      });

      expect(BigNumber.convertToBinaryUnit('1073741824', 'auto')).toMatchObject(
        {
          number: new Big(1),
          numberFixed: '1',
          unit: 'g',
          displayValue: '1 GiB',
        },
      );
    });

    it('should handle small values correctly', () => {
      expect(BigNumber.convertToBinaryUnit('900', 'auto')).toMatchObject({
        number: new Big(900),
        numberFixed: '900',
        unit: '',
        displayValue: '900 BiB',
      });
    });

    it('should handle fractional values correctly', () => {
      expect(BigNumber.convertToBinaryUnit('1536', 'auto')).toMatchObject({
        number: new Big(1.5),
        numberFixed: '1.5',
        unit: 'k',
        displayValue: '1.5 KiB',
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
    expect(BigNumber.addNumberWithUnits('1k', '2k', 'k')).toBe('3k');
    expect(BigNumber.addNumberWithUnits('1m', '2m', 'm')).toBe('3m');
    expect(BigNumber.addNumberWithUnits('1g', '2g', 'g')).toBe('3g');
    expect(BigNumber.addNumberWithUnits('1t', '2t', 't')).toBe('3t');
  });

  it('should add two sizes with the same unit (targetUnit is `m` default Unit)', () => {
    expect(BigNumber.addNumberWithUnits('1g', '2g')).toBe('3072m');
    expect(BigNumber.addNumberWithUnits('1t', '2t')).toBe('3145728m');
  });

  it('should add two sizes with different units', () => {
    expect(BigNumber.addNumberWithUnits('1k', '1m', 'k')).toBe('1025k');
    expect(BigNumber.addNumberWithUnits('1m', '1g', 'm')).toBe('1025m');
    expect(BigNumber.addNumberWithUnits('1g', '1t', 'g')).toBe('1025g');
    expect(BigNumber.addNumberWithUnits('1t', '1p', 't')).toBe('1025t');
  });
});

describe('subNumberWithUnits', () => {
  it('should sub two sizes with the same unit', () => {
    expect(BigNumber.subNumberWithUnits('2k', '1k', 'k')).toBe('1k');
    expect(BigNumber.subNumberWithUnits('2m', '1m', 'm')).toBe('1m');
    expect(BigNumber.subNumberWithUnits('2g', '1g', 'g')).toBe('1g');
    expect(BigNumber.subNumberWithUnits('2t', '1t', 't')).toBe('1t');
  });

  it('should sub two sizes with the same unit (targetUnit is `m` default Unit)', () => {
    expect(BigNumber.subNumberWithUnits('2g', '1g')).toBe('1024m');
    expect(BigNumber.subNumberWithUnits('2t', '1t')).toBe('1048576m');
  });

  it('should sub two sizes with different units', () => {
    expect(BigNumber.subNumberWithUnits('1m', '1k', 'k')).toBe('1023k');
    expect(BigNumber.subNumberWithUnits('1g', '1m', 'm')).toBe('1023m');
    expect(BigNumber.subNumberWithUnits('1t', '1g', 'g')).toBe('1023g');
    expect(BigNumber.subNumberWithUnits('1p', '1t', 't')).toBe('1023t');
  });
});

describe('isOutsideRangeWithUnits', () => {
  it('should return true if the value is less than the minimum', () => {
    expect(BigNumber.isOutsideRangeWithUnits('1g', '2g', '3g')).toBe(true);
    expect(BigNumber.isOutsideRangeWithUnits('1000m', '2g', '3g')).toBe(true);
    expect(BigNumber.isOutsideRangeWithUnits('2.5', '2m', '3m')).toBe(true);
  });

  it('should return true if the value is greater than the maximum', () => {
    expect(BigNumber.isOutsideRangeWithUnits('4G', '2G', '3G')).toBe(true);
    expect(BigNumber.isOutsideRangeWithUnits('4000M', '2G', '3G')).toBe(true);
    expect(BigNumber.isOutsideRangeWithUnits('4', '2M', '3M')).toBe(true);
  });

  it('should return false if the value is within the range', () => {
    expect(BigNumber.isOutsideRangeWithUnits('2.5G', '2G', '3G')).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('2050M', '2G', '3G')).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('2100000', '2M', '3M')).toBe(
      false,
    );
  });

  it('should return false if the value is within the range (==min)', () => {
    expect(BigNumber.isOutsideRangeWithUnits('2G', '2G', '3G')).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('2048M', '2G', '3G')).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('2097152', '2M', '3M')).toBe(
      false,
    );
    expect(BigNumber.isOutsideRangeWithUnits('2097151', '2M', '3M')).toBe(true);
  });

  it('should return false if the value is within the range (==max)', () => {
    expect(BigNumber.isOutsideRangeWithUnits('3G', '2G', '3G')).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('3072K', '2M', '3M')).toBe(false);
    expect(BigNumber.isOutsideRangeWithUnits('3145728', '2M', '3M')).toBe(
      false,
    );
    expect(BigNumber.isOutsideRangeWithUnits('3145729', '2M', '3M')).toBe(true);
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
