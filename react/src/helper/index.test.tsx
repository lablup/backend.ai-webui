import { iSizeToSize } from './index';

describe('iSizeToSize', () => {
  it('should convert iSize to Size with default fixed value', () => {
    const sizeWithUnit = '1K';
    const targetSizeUnit = 'B';
    const result = iSizeToSize(sizeWithUnit, targetSizeUnit);
    expect(result).toEqual({
      number: 1024,
      numberFixed: '1024.00',
      unit: 'B',
      numberUnit: '1024.00B',
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

  it('should convert iSize to Size with targetSizeUnit of "k"', () => {
    const sizeWithUnit = '1M';
    const targetSizeUnit = 'k';
    const result = iSizeToSize(sizeWithUnit, targetSizeUnit);
    expect(result).toEqual({
      number: 1024,
      numberFixed: '1024.00',
      unit: 'k',
      numberUnit: '1024.00k',
    });
  });

  it('should convert iSize to Size with targetSizeUnit of "t"', () => {
    const sizeWithUnit = '1P';
    const targetSizeUnit = 't';
    const result = iSizeToSize(sizeWithUnit, targetSizeUnit);
    expect(result).toEqual({
      number: 0.0009765625,
      numberFixed: '0.00',
      unit: 't',
      numberUnit: '0.00t',
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
      numberFixed: '1.00',
      unit: 'K',
      numberUnit: '1.00K',
    });
  });
});
