import { parseFilterValue } from './BAIPropertyFilter';

describe('parseFilterValue', () => {
  it('should correctly parse filter with binary operators', () => {
    const filter = 'created_at >= "2021-01-01"';
    const result = parseFilterValue(filter);
    expect(result).toEqual({
      property: 'created_at',
      operator: '>=',
      value: '2021-01-01',
    });
  });

  it('should correctly parse filter with equality operator', () => {
    const filter = 'status == "READY"';
    const result = parseFilterValue(filter);
    expect(result).toEqual({
      property: 'status',
      operator: '==',
      value: 'READY',
    });
  });

  it('should correctly parse filter with in operator', () => {
    const filter = 'permission in ["READ_ONLY", "READ_WRITE"]';
    const result = parseFilterValue(filter);
    expect(result).toEqual({
      property: 'permission',
      operator: 'in',
      value: '["READ_ONLY", "READ_WRITE"]',
    });
  });

  it('should correctly parse filter with ilike operator', () => {
    expect(parseFilterValue('creator ilike "%@example.com"')).toEqual({
      property: 'creator',
      operator: 'ilike',
      value: '%@example.com',
    });
    expect(parseFilterValue('creator ilike "%@example.com%"')).toEqual({
      property: 'creator',
      operator: 'ilike',
      value: '%@example.com%',
    });
  });

  it('should correctly parse filter with ilike operator and multiple spaces', () => {
    expect(parseFilterValue('creator  ilike  "%@example.com"')).toEqual({
      property: 'creator',
      operator: 'ilike',
      value: '%@example.com',
    });
  });
});
