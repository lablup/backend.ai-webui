import { comparePEP440Versions, isCompatibleMultipleConditions, normalizePEP440Version } from './pep440';

describe('normalizePEP440Version', () => {
  test('should normalize versions correctly', () => {
    expect(normalizePEP440Version('1.2.3dev1')).toBe('1.2.3.dev.1');
    expect(normalizePEP440Version('1.2.3-dev1')).toBe('1.2.3.dev.1');
    expect(normalizePEP440Version('1.2.3_dev1')).toBe('1.2.3.dev.1');
    expect(normalizePEP440Version('1.2.3 dev1')).toBe('1.2.3.dev.1');
    expect(normalizePEP440Version('1.2.3.dev.1')).toBe('1.2.3.dev.1');
    expect(normalizePEP440Version('1.2.3.dev.*')).toBe('1.2.3.dev.*');
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
    expect(comparePEP440Versions('1.2.3.*', '1.2.3.dev.1')).toBe(0);
    expect(comparePEP440Versions('1.2.3.*', '1.2.2.dev.1')).toBe(1);
    expect(comparePEP440Versions('1.2.3.*', '1.2.4.dev.1')).toBe(-1);

    //backend.ai
    expect(comparePEP440Versions('23.09.8rc2', '23.09.8.rc1')).toBe(1);
    expect(comparePEP440Versions('23.09.8rc2', '23.09.8')).toBe(-1);
    expect(comparePEP440Versions('23.09.8rc2', '23.09.6')).toBe(1);
    expect(comparePEP440Versions('24.03.0a1', '24.03.0rc2')).toBe(-1);
    expect(comparePEP440Versions('24.03.0a1', '24.03.0dev5')).toBe(1);
    expect(comparePEP440Versions('24.03.0dev3', '24.03.0dev5')).toBe(-1);
    expect(comparePEP440Versions('24.03.0dev3', '24.03.0dev3')).toBe(0);
    expect(comparePEP440Versions('24.03.0a1', '24.03.0b1')).toBe(-1);
    expect(comparePEP440Versions('24.03.4', '24.03.4-post.1')).toBe(-1);
    expect(comparePEP440Versions('24.03.4-post.2', '24.03.4-post.1')).toBe(1);
    expect(comparePEP440Versions('24.03.4-post.2', '24.03.4.post2')).toBe(0);
    expect(comparePEP440Versions('24.03.4-post.2', '24.03.4-post.2')).toBe(0);
    expect(comparePEP440Versions('24.03.4-beta.2', '24.03.4-post.2')).toBe(-1);
    expect(comparePEP440Versions('24.03.4-b.2', '24.03.4-beta.2')).toBe(0);
    expect(comparePEP440Versions('24.03.4-alpha.2', '24.03.4-a.2')).toBe(0);
    expect(comparePEP440Versions('24.03.4-b.2', '24.03.4-alpha.2')).toBe(1);

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

describe('isCompatibleMultipleConditions', ()=>{
  it('should compare versions correctly', ()=>{
    expect(isCompatibleMultipleConditions('23.03.3', ['24.3.1', '23.03.2'])).toBe(true)
    expect(isCompatibleMultipleConditions('23.03.3', ['24.3.1', '23.03.4'])).toBe(false)
    expect(isCompatibleMultipleConditions('25.03.3', ['24.3.1', '23.03.4'])).toBe(true)
    expect(isCompatibleMultipleConditions('22.03.3', ['24.3.1', '23.03.4'])).toBe(false)
    expect(isCompatibleMultipleConditions('24.12.1', ['25.1.0', '24.09.6', '24.03.12'])).toBe(false)
    expect(isCompatibleMultipleConditions('25.1.1', ['25.1.0', '24.09.6', '24.03.12'])).toBe(true)
    expect(isCompatibleMultipleConditions('25.0.0', ['25.1.0', '24.09.6', '24.03.12'])).toBe(false)
    expect(isCompatibleMultipleConditions('24.09.5', ['25.1.0', '24.09.6', '24.03.12'])).toBe(false)
    expect(isCompatibleMultipleConditions('24.09.7', ['25.1.0', '24.09.6', '24.03.12'])).toBe(true)
  });
})