import {
  addNumberWithUnits,
  compareNumberWithUnits,
  comparePEP440Versions,
  iSizeToSize,
  normalizePEP440Version,
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

describe('normalizePEP440Version', () => {
  test('should normalize versions correctly', () => {
    expect(normalizePEP440Version('1.2.3dev1')).toBe('1.2.3.dev.1');
    expect(normalizePEP440Version('1.2.3-dev1')).toBe('1.2.3.dev.1');
    expect(normalizePEP440Version('1.2.3_dev1')).toBe('1.2.3.dev.1');
    expect(normalizePEP440Version('1.2.3 dev1')).toBe('1.2.3.dev.1');
    expect(normalizePEP440Version('1.2.3.dev.1')).toBe('1.2.3.dev.1');
  });
});

describe('comparePEP440Versions', () => {
  test('should compare versions correctly', () => {
    expect(comparePEP440Versions('1.2.3', '1.2.3')).toBe(0);
    expect(comparePEP440Versions('1.2.3', '1.2.4')).toBe(-1);
    expect(comparePEP440Versions('1.2.4', '1.2.3')).toBe(1);
    expect(comparePEP440Versions('1.2.3.dev.1', '1.2.3')).toBe(-1);
    expect(comparePEP440Versions('1.2.3', '1.2.3.dev.1')).toBe(1);
    expect(comparePEP440Versions('1.2.3.dev.1', '1.2.3.dev.2')).toBe(-1);
    expect(comparePEP440Versions('1.2.3.dev.2', '1.2.3.dev.1')).toBe(1);
    expect(comparePEP440Versions('1.2.3.dev.2', '1.2.3.dev.1')).toBe(1);
  });

  test('comparePEP440Versions', () => {
    const versions = [
      '1.dev0',
      '1.0.dev456',
      '1.0a1',
      '1.0a2.dev456',
      '1.0a12.dev456',
      '1.0a12',
      '1.0b1.dev456',
      '1.0b2',
      '1.0b2.post345.dev456',
      '1.0b2.post345',
      '1.0rc1.dev456',
      '1.0rc1',
      '1.0',
      '1.0+abc.5',
      '1.0+abc.7',
      '1.0+5',
      '1.0.post456.dev34',
      '1.0.post456',
      '1.0.15',
      '1.1.dev1',
    ];

    for (let i = 0; i < versions.length - 1; i++) {
      expect(comparePEP440Versions(versions[i], versions[i + 1])).toBe(-1);
    }
  });
});
