import {
  addNumberWithUnits,
  compareNumberWithUnits,
  iSizeToSize,
  isOutsideRange,
  isOutsideRangeWithUnits,
} from './index';

describe('iSizeToSize', () => {
  it('should convert iSize to Size with default fixed value', () => {
    const sizeWithUnit = '1K';
    const targetSizeUnit = 'B';
    const result = iSizeToSize(sizeWithUnit, targetSizeUnit);
    expect(result).toEqual({
      number: 1024,
      numberFixed: '1024',
      unit: 'B',
      numberUnit: '1024B',
    });
  });

  it('should convert iSize to Size with fixed value of 0', () => {
    const sizeWithUnit = '1K';
    const targetSizeUnit = 'B';
    const fixed = 0;
    const result = iSizeToSize(sizeWithUnit, targetSizeUnit, fixed);
    expect(result).toEqual({
      number: 1024,
      numberFixed: '1024',
      unit: 'B',
      numberUnit: '1024B',
    });
  });

  it('should convert iSize to Size with targetSizeUnit of "k"(lower case)', () => {
    const sizeWithUnit = '1m';
    const targetSizeUnit = 'k';
    const result = iSizeToSize(sizeWithUnit, targetSizeUnit);
    expect(result).toEqual({
      number: 1024,
      numberFixed: '1024',
      unit: 'K',
      numberUnit: '1024K',
    });
  });

  it('should convert iSize to Size with targetSizeUnit of "t"', () => {
    const sizeWithUnit = '1P';
    const targetSizeUnit = 'T';
    const result = iSizeToSize(sizeWithUnit, targetSizeUnit);
    expect(result).toEqual({
      number: 1024,
      numberFixed: '1024',
      unit: 'T',
      numberUnit: '1024T',
    });
  });

  it('should throw an error if size format is invalid', () => {
    const sizeWithUnit = 'invalid';
    expect(() => iSizeToSize(sizeWithUnit)).toThrow('Invalid size format');
  });

  it('should use default targetSizeUnit and fixed values if not provided', () => {
    const sizeWithUnit = '1K';
    const result = iSizeToSize(sizeWithUnit);
    expect(result).toEqual({
      number: 1,
      numberFixed: '1',
      unit: 'K',
      numberUnit: '1K',
    });
  });

  it('should return undefined if sizeWithUnit is undefined', () => {
    const sizeWithUnit = undefined;
    const result = iSizeToSize(sizeWithUnit);
    expect(result).toBeUndefined();
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
    expect(addNumberWithUnits('1K', '2K', 'K')).toBe('3K');
    expect(addNumberWithUnits('1M', '2M', 'M')).toBe('3M');
    expect(addNumberWithUnits('1G', '2G', 'G')).toBe('3G');
    expect(addNumberWithUnits('1T', '2T', 'T')).toBe('3T');
  });

  it('should add two sizes with the same unit (targetUnit is `m` default Unit)', () => {
    expect(addNumberWithUnits('1G', '2G')).toBe('3072M');
    expect(addNumberWithUnits('1T', '2T')).toBe('3145728M');
  });

  it('should add two sizes with different units', () => {
    expect(addNumberWithUnits('1K', '1M', 'K')).toBe('1025K');
    expect(addNumberWithUnits('1M', '1G', 'M')).toBe('1025M');
    expect(addNumberWithUnits('1G', '1T', 'G')).toBe('1025G');
    expect(addNumberWithUnits('1T', '1P', 'T')).toBe('1025T');
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
});

describe('isOutsideRangeWithUnits', () => {
  it('should return true if the value is less than the minimum', () => {
    expect(isOutsideRangeWithUnits('1G', '2G', '3G')).toBe(true);
    expect(isOutsideRangeWithUnits('1000M', '2G', '3G')).toBe(true);
    expect(isOutsideRangeWithUnits('2.5B', '2M', '3M')).toBe(true);
  });

  it('should return true if the value is greater than the maximum', () => {
    expect(isOutsideRangeWithUnits('4G', '2G', '3G')).toBe(true);
    expect(isOutsideRangeWithUnits('4000M', '2G', '3G')).toBe(true);
    expect(isOutsideRangeWithUnits('4B', '2M', '3M')).toBe(true);
  });

  it('should return false if the value is within the range', () => {
    expect(isOutsideRangeWithUnits('2.5G', '2G', '3G')).toBe(false);
    expect(isOutsideRangeWithUnits('2050M', '2G', '3G')).toBe(false);
    expect(isOutsideRangeWithUnits('2100000B', '2M', '3M')).toBe(false);
  });

  it('should return false if the value is within the range (==min)', () => {
    expect(isOutsideRangeWithUnits('2G', '2G', '3G')).toBe(false);
    expect(isOutsideRangeWithUnits('2048M', '2G', '3G')).toBe(false);
    expect(isOutsideRangeWithUnits('2097152B', '2M', '3M')).toBe(false);
    expect(isOutsideRangeWithUnits('2097151B', '2M', '3M')).toBe(true);
  });

  it('should return false if the value is within the range (==max)', () => {
    expect(isOutsideRangeWithUnits('3G', '2G', '3G')).toBe(false);
    expect(isOutsideRangeWithUnits('3072K', '2M', '3M')).toBe(false);
    expect(isOutsideRangeWithUnits('3145728B', '2M', '3M')).toBe(false);
    expect(isOutsideRangeWithUnits('3145729B', '2M', '3M')).toBe(true);
  });
});
