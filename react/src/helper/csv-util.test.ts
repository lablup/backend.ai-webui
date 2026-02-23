/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// csv-util.test.ts
import { JSONToCSVBody } from './csv-util';

describe('JSONToCSVBody', () => {
  it('should convert JSON data to CSV format without formatting rules', () => {
    const data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];
    const format_rules = {};

    const result = JSONToCSVBody(data, format_rules);
    const expected = '"name","age"\n"John",30\n"Jane",25';

    expect(result).toBe(expected);
  });

  it('should convert JSON data to CSV format with formatting rules', () => {
    const data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];
    const format_rules = {
      age: (value: any) => `${value} years old`,
    };

    const result = JSONToCSVBody(data, format_rules);
    const expected =
      '"name","age"\n"John","30 years old"\n"Jane","25 years old"';

    expect(result).toBe(expected);
  });

  it('should handle nested objects', () => {
    const data = [
      { name: 'John', details: { age: 30, hobbies: ['reading', 'sports'] } },
      { name: 'Jane', details: { age: 25, hobbies: ['music', 'travel'] } },
    ];
    const format_rules = {};

    const result = JSONToCSVBody(data, format_rules);
    const expected =
      '"name","details"\n"John","{""age"":30,""hobbies"":[""reading"",""sports""]}"\n"Jane","{""age"":25,""hobbies"":[""music"",""travel""]}"';

    expect(result).toBe(expected);
  });
  it('should handle arrays correctly', () => {
    const data = [
      { name: 'John', hobbies: ['reading', 'sports'] },
      { name: 'Jane', hobbies: ['music', 'travel'] },
    ];
    const format_rules = {};

    const result = JSONToCSVBody(data, format_rules);
    const expected =
      '"name","hobbies"\n"John","[""reading"",""sports""]"\n"Jane","[""music"",""travel""]"';

    expect(result).toBe(expected);
  });

  it('should escape CSV values correctly', () => {
    const data = [
      { name: 'John "Doe"', age: 30 },
      { name: 'Jane, the Great', age: 25 },
    ];
    const format_rules = {};

    const result = JSONToCSVBody(data, format_rules);
    const expected = '"name","age"\n"John ""Doe""",30\n"Jane, the Great",25';

    expect(result).toBe(expected);
  });
});
