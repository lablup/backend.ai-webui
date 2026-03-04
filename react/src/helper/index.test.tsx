/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  getImageFullName,
  isOutsideRange,
  isOutsideRangeWithUnits,
  localeCompare,
  numberSorterWithInfinityValue,
  convertToDecimalUnit,
  isValidIPv4,
  isValidIPv6,
  isValidIP,
  isCidrRange,
  isValidIPOrCidr,
  parseImageString,
  removeArchitectureFromImageFullName,
  findMatchingImage,
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
        supported_accelerators: undefined,
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
        supported_accelerators: undefined,
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
        supported_accelerators: undefined,
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

describe('isValidIPv4', () => {
  it('should validate correct IPv4 addresses', () => {
    expect(isValidIPv4('192.168.1.1')).toBe(true);
    expect(isValidIPv4('10.0.0.0')).toBe(true);
    expect(isValidIPv4('255.255.255.255')).toBe(true);
    expect(isValidIPv4('0.0.0.0')).toBe(true);
    expect(isValidIPv4('1.1.1.1')).toBe(true);
  });

  it('should reject invalid IPv4 addresses', () => {
    expect(isValidIPv4('256.1.1.1')).toBe(false);
    expect(isValidIPv4('192.168.1')).toBe(false);
    expect(isValidIPv4('192.168.1.1.1')).toBe(false);
    expect(isValidIPv4('abc.def.ghi.jkl')).toBe(false);
    expect(isValidIPv4('192.168.-1.1')).toBe(false);
  });

  it('should reject IPv4 with leading zeros', () => {
    expect(isValidIPv4('01.2.3.4')).toBe(false);
    expect(isValidIPv4('192.168.01.1')).toBe(false);
    expect(isValidIPv4('192.168.001.1')).toBe(false);
    // '0' itself is valid
    expect(isValidIPv4('0.0.0.0')).toBe(true);
  });

  it('should reject IPv4 with whitespace', () => {
    expect(isValidIPv4(' 192.168.1.1')).toBe(false);
    expect(isValidIPv4('192.168.1.1 ')).toBe(false);
    expect(isValidIPv4('192. 168.1.1')).toBe(false);
    expect(isValidIPv4('1.1.1.1\n')).toBe(false);
    expect(isValidIPv4('\t1.1.1.1')).toBe(false);
  });

  it('should reject IPv4 with empty octets', () => {
    expect(isValidIPv4('192..1.1')).toBe(false);
    expect(isValidIPv4('.192.168.1.1')).toBe(false);
    expect(isValidIPv4('192.168.1.')).toBe(false);
  });
});

describe('isValidIPv6', () => {
  it('should validate correct IPv6 addresses', () => {
    expect(isValidIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
    expect(isValidIPv6('2001:db8:85a3::8a2e:370:7334')).toBe(true);
    expect(isValidIPv6('::1')).toBe(true);
    expect(isValidIPv6('::')).toBe(true);
    expect(isValidIPv6('fe80::1')).toBe(true);
  });

  it('should accept uppercase hex digits', () => {
    expect(isValidIPv6('2001:DB8::1')).toBe(true);
    expect(isValidIPv6('2001:0DB8:85A3::8A2E:370:7334')).toBe(true);
    expect(isValidIPv6('ABCD:EF01:2345:6789:ABCD:EF01:2345:6789')).toBe(true);
  });

  it('should reject invalid IPv6 addresses', () => {
    expect(isValidIPv6('gggg::1')).toBe(false);
    expect(isValidIPv6('2001:db8::8a2e::7334')).toBe(false);
  });

  it('should reject IPv4 addresses', () => {
    expect(isValidIPv6('192.168.1.1')).toBe(false);
  });

  it('should reject IPv4-mapped IPv6 addresses', () => {
    // These contain dots (IPv4 notation) so they are rejected
    expect(isValidIPv6('::ffff:192.168.0.1')).toBe(false);
    expect(isValidIPv6('64:ff9b::192.0.2.1')).toBe(false);
  });

  it('should reject zone identifiers', () => {
    expect(isValidIPv6('fe80::1%eth0')).toBe(false);
    expect(isValidIPv6('fe80::1%lo0')).toBe(false);
    expect(isValidIPv6('fe80::1%1')).toBe(false);
  });

  it('should reject IPv6 with whitespace', () => {
    expect(isValidIPv6(' 2001:db8::1')).toBe(false);
    expect(isValidIPv6('2001:db8::1 ')).toBe(false);
    expect(isValidIPv6('2001:db8 ::1')).toBe(false);
    expect(isValidIPv6('2001:db8::1\n')).toBe(false);
  });

  it('should reject hextet that is too long', () => {
    expect(isValidIPv6('12345::')).toBe(false);
    expect(isValidIPv6('2001:0db8:85a3:00000::1')).toBe(false);
  });

  it('should reject IPv6 with wrong number of groups', () => {
    expect(isValidIPv6('1:2:3:4:5:6:7:8:9')).toBe(false);
    expect(isValidIPv6('1:2:3:4:5:6:7')).toBe(false);
    expect(isValidIPv6('1:2:3:4:5:6:7:8:9:10')).toBe(false);
  });

  it('should reject multiple :: compressions', () => {
    expect(isValidIPv6('2001::db8::1')).toBe(false);
    expect(isValidIPv6('::1::')).toBe(false);
  });
});

describe('isValidIP', () => {
  it('should validate both IPv4 and IPv6 addresses', () => {
    expect(isValidIP('192.168.1.1')).toBe(true);
    expect(isValidIP('2001:db8::1')).toBe(true);
    expect(isValidIP('invalid')).toBe(false);
  });
});

describe('isCidrRange', () => {
  describe('IPv4 CIDR validation', () => {
    it('should validate correct IPv4 CIDR ranges', () => {
      expect(isCidrRange('192.168.1.0/24')).toBe(true);
      expect(isCidrRange('10.0.0.0/8')).toBe(true);
      expect(isCidrRange('172.16.0.0/12')).toBe(true);
      expect(isCidrRange('192.168.0.0/16')).toBe(true);
      expect(isCidrRange('0.0.0.0/0')).toBe(true);
    });

    it('should reject IPv4 CIDR with non-zero host bits', () => {
      // 10.20.30.40/12 should be 10.16.0.0/12
      expect(isCidrRange('10.20.30.40/12')).toBe(false);
      // 192.168.1.5/24 should be 192.168.1.0/24
      expect(isCidrRange('192.168.1.5/24')).toBe(false);
      // 172.16.5.128/25 should be 172.16.5.128/25 (actually valid)
      expect(isCidrRange('172.16.5.128/25')).toBe(true);
      // 172.16.5.129/25 should be 172.16.5.128/25
      expect(isCidrRange('172.16.5.129/25')).toBe(false);
    });

    it('should handle edge case prefix lengths', () => {
      expect(isCidrRange('192.168.1.1/32')).toBe(true); // Single host
      expect(isCidrRange('192.168.1.0/32')).toBe(true);
      expect(isCidrRange('0.0.0.0/0')).toBe(true); // All addresses
    });

    it('should reject invalid prefix lengths', () => {
      expect(isCidrRange('192.168.1.0/33')).toBe(false);
      expect(isCidrRange('192.168.1.0/-1')).toBe(false);
    });

    it('should reject invalid formats', () => {
      expect(isCidrRange('192.168.1.0')).toBe(false);
      expect(isCidrRange('192.168.1.0/24/16')).toBe(false);
      expect(isCidrRange('192.168.1.0/abc')).toBe(false);
    });
  });

  describe('IPv6 CIDR validation', () => {
    it('should validate correct IPv6 CIDR ranges', () => {
      expect(isCidrRange('2001:db8::/32')).toBe(true);
      expect(isCidrRange('fe80::/10')).toBe(true);
      expect(isCidrRange('::/0')).toBe(true);
      expect(isCidrRange('2001:db8:85a3::/48')).toBe(true);
    });

    it('should reject IPv6 CIDR with non-zero host bits', () => {
      // 2001:db8::1/32 should be 2001:db8::/32
      expect(isCidrRange('2001:db8::1/32')).toBe(false);
      // 2001:db8:85a3::8a2e:370:7334/48 should be 2001:db8:85a3::/48
      expect(isCidrRange('2001:db8:85a3::8a2e:370:7334/48')).toBe(false);
    });

    it('should handle edge case prefix lengths', () => {
      expect(isCidrRange('2001:db8::1/128')).toBe(true); // Single host
      expect(isCidrRange('::/0')).toBe(true); // All addresses
    });

    it('should reject invalid prefix lengths', () => {
      expect(isCidrRange('2001:db8::/129')).toBe(false);
      expect(isCidrRange('2001:db8::/-1')).toBe(false);
    });
  });
});

describe('isValidIPOrCidr', () => {
  it('should validate IP addresses', () => {
    expect(isValidIPOrCidr('192.168.1.1')).toBe(true);
    expect(isValidIPOrCidr('2001:db8::1')).toBe(true);
  });

  it('should validate CIDR ranges', () => {
    expect(isValidIPOrCidr('192.168.1.0/24')).toBe(true);
    expect(isValidIPOrCidr('2001:db8::/32')).toBe(true);
  });

  it('should reject invalid CIDR ranges with non-zero host bits', () => {
    expect(isValidIPOrCidr('10.20.30.40/12')).toBe(false);
    expect(isValidIPOrCidr('192.168.1.5/24')).toBe(false);
  });

  it('should reject invalid values', () => {
    expect(isValidIPOrCidr('invalid')).toBe(false);
    expect(isValidIPOrCidr('192.168.1.0/33')).toBe(false);
  });
});

describe('parseImageString', () => {
  describe('full image string with registry, namespace, tag, and architecture', () => {
    it('should parse standard image string', () => {
      const result = parseImageString(
        'registry.example.com/lablup/python:3.9-ubuntu@x86_64',
      );
      expect(result).toEqual({
        registryAndNamespace: 'registry.example.com/lablup/python',
        tag: '3.9-ubuntu',
        architecture: 'x86_64',
        hasTag: true,
        hasArch: true,
      });
    });

    it('should parse image string with registry port', () => {
      const result = parseImageString(
        'myregistry.org:5000/namespace/image:1.0@aarch64',
      );
      expect(result).toEqual({
        registryAndNamespace: 'myregistry.org:5000/namespace/image',
        tag: '1.0',
        architecture: 'aarch64',
        hasTag: true,
        hasArch: true,
      });
    });

    it('should parse image string with IP address and port as registry', () => {
      const result = parseImageString(
        '192.168.0.1:7080/abc/def/training:01-py3-abc-v1-def@x86_64',
      );
      expect(result).toEqual({
        registryAndNamespace: '192.168.0.1:7080/abc/def/training',
        tag: '01-py3-abc-v1-def',
        architecture: 'x86_64',
        hasTag: true,
        hasArch: true,
      });
    });

    it('should parse image string with IPv6 address as registry', () => {
      const result = parseImageString(
        '[::1]:5000/python:3.6-cuda9-ubuntu@x86_64',
      );
      expect(result).toEqual({
        registryAndNamespace: '[::1]:5000/python',
        tag: '3.6-cuda9-ubuntu',
        architecture: 'x86_64',
        hasTag: true,
        hasArch: true,
      });
    });
  });

  describe('image string without architecture', () => {
    it('should parse image string with tag but no architecture', () => {
      const result = parseImageString(
        'node03.spccluster.skku.edu:7081/repo/r-base:4.5.1',
      );
      expect(result).toEqual({
        registryAndNamespace: 'node03.spccluster.skku.edu:7081/repo/r-base',
        tag: '4.5.1',
        architecture: undefined,
        hasTag: true,
        hasArch: false,
      });
    });

    it('should parse image string with complex tag but no architecture', () => {
      const result = parseImageString('127.0.0.1:5000/python:3.6-cuda9-ubuntu');
      expect(result).toEqual({
        registryAndNamespace: '127.0.0.1:5000/python',
        tag: '3.6-cuda9-ubuntu',
        architecture: undefined,
        hasTag: true,
        hasArch: false,
      });
    });
  });

  describe('image string without tag (registry/namespace only)', () => {
    it('should parse image string with only registry and namespace', () => {
      const result = parseImageString(
        'node03.spccluster.skku.edu:7081/repo/r-base',
      );
      expect(result).toEqual({
        registryAndNamespace: 'node03.spccluster.skku.edu:7081/repo/r-base',
        tag: undefined,
        architecture: undefined,
        hasTag: false,
        hasArch: false,
      });
    });

    it('should parse image string with IP registry and namespace only', () => {
      const result = parseImageString('192.168.0.1:5000/lablup/python');
      expect(result).toEqual({
        registryAndNamespace: '192.168.0.1:5000/lablup/python',
        tag: undefined,
        architecture: undefined,
        hasTag: false,
        hasArch: false,
      });
    });

    it('should correctly distinguish port from tag in registry-only strings', () => {
      // The colon in "myregistry.org:5000" should NOT be treated as a tag separator
      const result = parseImageString('myregistry.org:5000/namespace');
      expect(result).toEqual({
        registryAndNamespace: 'myregistry.org:5000/namespace',
        tag: undefined,
        architecture: undefined,
        hasTag: false,
        hasArch: false,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle simple image name without registry', () => {
      const result = parseImageString('python:3.9');
      expect(result).toEqual({
        registryAndNamespace: 'python',
        tag: '3.9',
        architecture: undefined,
        hasTag: true,
        hasArch: false,
      });
    });

    it('should handle image with only name', () => {
      const result = parseImageString('python');
      expect(result).toEqual({
        registryAndNamespace: 'python',
        tag: undefined,
        architecture: undefined,
        hasTag: false,
        hasArch: false,
      });
    });

    it('should handle deeply nested namespace', () => {
      const result = parseImageString(
        'registry.gitlab.com/user/workspace/python/img:3.6-cuda9-ubuntu@x86_64',
      );
      expect(result).toEqual({
        registryAndNamespace: 'registry.gitlab.com/user/workspace/python/img',
        tag: '3.6-cuda9-ubuntu',
        architecture: 'x86_64',
        hasTag: true,
        hasArch: true,
      });
    });

    it('should handle empty string input', () => {
      const result = parseImageString('');
      expect(result).toEqual({
        registryAndNamespace: '',
        tag: undefined,
        architecture: undefined,
        hasTag: false,
        hasArch: false,
      });
    });

    it('should handle null/undefined input defensively', () => {
      // TypeScript would catch this, but runtime might not
      const result = parseImageString(null as unknown as string);
      expect(result).toEqual({
        registryAndNamespace: '',
        tag: undefined,
        architecture: undefined,
        hasTag: false,
        hasArch: false,
      });

      const result2 = parseImageString(undefined as unknown as string);
      expect(result2).toEqual({
        registryAndNamespace: '',
        tag: undefined,
        architecture: undefined,
        hasTag: false,
        hasArch: false,
      });
    });
  });
});

describe('removeArchitectureFromImageFullName', () => {
  it('should remove architecture suffix from full image name', () => {
    expect(
      removeArchitectureFromImageFullName(
        'registry.example.com/python:3.9@x86_64',
      ),
    ).toBe('registry.example.com/python:3.9');
  });

  it('should remove architecture from image with port in registry', () => {
    expect(
      removeArchitectureFromImageFullName(
        '192.168.0.1:7080/namespace:tag@aarch64',
      ),
    ).toBe('192.168.0.1:7080/namespace:tag');
  });

  it('should return same string if no architecture present', () => {
    expect(
      removeArchitectureFromImageFullName('registry.example.com/python:3.9'),
    ).toBe('registry.example.com/python:3.9');
  });

  it('should handle undefined input', () => {
    expect(removeArchitectureFromImageFullName(undefined)).toBe(undefined);
  });

  it('should only remove the last @ and everything after it', () => {
    // Edge case: @ in other parts should not be affected (though unusual)
    expect(
      removeArchitectureFromImageFullName('registry/name@special:tag@x86_64'),
    ).toBe('registry/name@special:tag');
  });
});

describe('findMatchingImage', () => {
  // Sample images for testing
  const mockImages = [
    {
      registry: 'cr.backend.ai',
      namespace: 'lablup/python',
      tag: '3.9-ubuntu',
      architecture: 'x86_64',
    },
    {
      registry: 'cr.backend.ai',
      namespace: 'lablup/python',
      tag: '3.9-ubuntu',
      architecture: 'aarch64',
    },
    {
      registry: 'cr.backend.ai',
      namespace: 'lablup/python',
      tag: '3.8-ubuntu',
      architecture: 'x86_64',
    },
    {
      registry: 'cr.backend.ai',
      namespace: 'lablup/tensorflow',
      tag: '2.9-cuda',
      architecture: 'x86_64',
    },
  ];

  // Images with deprecated 'name' field instead of 'namespace'
  const mockImagesWithNameField = [
    {
      registry: 'cr.backend.ai',
      name: 'lablup/python',
      tag: '3.9-ubuntu',
      architecture: 'x86_64',
    },
  ];

  describe('Tier 1: Exact match', () => {
    it('should find exact match with full image string', () => {
      const result = findMatchingImage(
        'cr.backend.ai/lablup/python:3.9-ubuntu@x86_64',
        mockImages,
      );
      expect(result).toBe(mockImages[0]);
    });

    it('should find exact match for different architecture', () => {
      const result = findMatchingImage(
        'cr.backend.ai/lablup/python:3.9-ubuntu@aarch64',
        mockImages,
      );
      expect(result).toBe(mockImages[1]);
    });

    it('should find exact match for different image', () => {
      const result = findMatchingImage(
        'cr.backend.ai/lablup/tensorflow:2.9-cuda@x86_64',
        mockImages,
      );
      expect(result).toBe(mockImages[3]);
    });
  });

  describe('Tier 2: Partial match without architecture', () => {
    it('should find match by registry/namespace:tag', () => {
      const result = findMatchingImage(
        'cr.backend.ai/lablup/python:3.9-ubuntu',
        mockImages,
      );
      expect(result).toBe(mockImages[0]); // First matching arch (x86_64)
    });

    it('should find match for different tag', () => {
      const result = findMatchingImage(
        'cr.backend.ai/lablup/python:3.8-ubuntu',
        mockImages,
      );
      expect(result).toBe(mockImages[2]);
    });
  });

  describe('Tier 3: Partial match without tag', () => {
    it('should find match by registry/namespace only', () => {
      const result = findMatchingImage(
        'cr.backend.ai/lablup/python',
        mockImages,
      );
      expect(result).toBe(mockImages[0]); // First in list
    });

    it('should find match for different environment', () => {
      const result = findMatchingImage(
        'cr.backend.ai/lablup/tensorflow',
        mockImages,
      );
      expect(result).toBe(mockImages[3]);
    });
  });

  describe('Edge cases', () => {
    it('should return undefined for empty string', () => {
      expect(findMatchingImage('', mockImages)).toBeUndefined();
    });

    it('should return undefined for null', () => {
      expect(findMatchingImage(null, mockImages)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(findMatchingImage(undefined, mockImages)).toBeUndefined();
    });

    it('should return undefined for empty image list', () => {
      expect(
        findMatchingImage('cr.backend.ai/lablup/python:3.9-ubuntu@x86_64', []),
      ).toBeUndefined();
    });

    it('should return undefined when no match found', () => {
      expect(
        findMatchingImage('nonexistent/image:tag@arch', mockImages),
      ).toBeUndefined();
    });

    it('should return undefined when partial match not found', () => {
      expect(
        findMatchingImage('cr.backend.ai/nonexistent', mockImages),
      ).toBeUndefined();
    });
  });

  describe('Registry with port', () => {
    const imagesWithPort = [
      {
        registry: '192.168.0.1:7080',
        namespace: 'lablup/python',
        tag: '3.9',
        architecture: 'x86_64',
      },
      {
        registry: '192.168.0.1:7080',
        namespace: 'lablup/python',
        tag: '3.9',
        architecture: 'aarch64',
      },
    ];

    it('should correctly match exact image with registry port', () => {
      const result = findMatchingImage(
        '192.168.0.1:7080/lablup/python:3.9@x86_64',
        imagesWithPort,
      );
      expect(result).toBe(imagesWithPort[0]);
    });

    it('should correctly match partial image without arch with registry port', () => {
      const result = findMatchingImage(
        '192.168.0.1:7080/lablup/python:3.9',
        imagesWithPort,
      );
      expect(result).toBe(imagesWithPort[0]);
    });

    it('should correctly match image by registry/namespace only with port', () => {
      const result = findMatchingImage(
        '192.168.0.1:7080/lablup/python',
        imagesWithPort,
      );
      expect(result).toBe(imagesWithPort[0]);
    });
  });

  describe('Backward compatibility with deprecated name field', () => {
    it('should work with images using name field instead of namespace', () => {
      const result = findMatchingImage(
        'cr.backend.ai/lablup/python:3.9-ubuntu@x86_64',
        mockImagesWithNameField,
      );
      expect(result).toBe(mockImagesWithNameField[0]);
    });

    it('should match by environment name using name field', () => {
      const result = findMatchingImage(
        'cr.backend.ai/lablup/python',
        mockImagesWithNameField,
      );
      expect(result).toBe(mockImagesWithNameField[0]);
    });
  });

  describe('Custom getEnvironmentName option', () => {
    it('should use custom getEnvironmentName function', () => {
      const customImages = [
        {
          registry: 'custom-registry',
          namespace: 'custom-namespace',
          tag: '1.0',
          architecture: 'x86_64',
          customEnvName: 'my-custom-env',
        },
      ];

      const result = findMatchingImage('my-custom-env', customImages, {
        getEnvironmentName: (image) =>
          (image as (typeof customImages)[0]).customEnvName,
      });
      expect(result).toBe(customImages[0]);
    });
  });

  describe('Priority of matching tiers', () => {
    it('should prefer exact match over partial match', () => {
      // Create images where both exact and partial could match
      const images = [
        {
          registry: 'cr.backend.ai',
          namespace: 'lablup/python',
          tag: '3.9-ubuntu',
          architecture: 'aarch64',
        },
        {
          registry: 'cr.backend.ai',
          namespace: 'lablup/python',
          tag: '3.9-ubuntu',
          architecture: 'x86_64',
        },
      ];

      // Exact match should return the specific architecture
      const result = findMatchingImage(
        'cr.backend.ai/lablup/python:3.9-ubuntu@x86_64',
        images,
      );
      expect(result?.architecture).toBe('x86_64');
    });

    it('should prefer tier 2 over tier 3 when applicable', () => {
      const images = [
        {
          registry: 'cr.backend.ai',
          namespace: 'lablup/python',
          tag: '3.8-ubuntu',
          architecture: 'x86_64',
        },
        {
          registry: 'cr.backend.ai',
          namespace: 'lablup/python',
          tag: '3.9-ubuntu',
          architecture: 'x86_64',
        },
      ];

      // Tier 2 match should find specific tag
      const result = findMatchingImage(
        'cr.backend.ai/lablup/python:3.9-ubuntu',
        images,
      );
      expect(result?.tag).toBe('3.9-ubuntu');
    });
  });
});
