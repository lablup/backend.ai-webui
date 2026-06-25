/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// csv-util.test.ts
import {
  downloadCSV,
  exportCSVWithFormattingRules,
  JSONToCSVBody,
  parseCSV,
  UTF8_BOM,
} from './csv-util';

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

describe('downloadCSV', () => {
  // jsdom does not implement createObjectURL/revokeObjectURL; save whatever
  // is there so the mocks below never leak into other test suites.
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  let capturedBlob: Blob | undefined;
  let capturedAnchor: HTMLAnchorElement | undefined;

  beforeEach(() => {
    capturedBlob = undefined;
    capturedAnchor = undefined;
    vi.useFakeTimers();
    URL.createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    }) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn() as typeof URL.revokeObjectURL;

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(
      (tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'a') {
          capturedAnchor = element as HTMLAnchorElement;
          vi.spyOn(element as HTMLAnchorElement, 'click').mockImplementation(
            () => {},
          );
        }
        return element;
      },
    );
  });

  afterEach(() => {
    // Flush downloadBlob's delayed URL.revokeObjectURL while the mock is
    // still installed, then restore the real timers and URL methods.
    vi.runAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  // Blob.text() strips a leading BOM while decoding, so assert on the raw
  // bytes instead. The decoder below keeps the BOM visible via ignoreBOM.
  const decodeKeepingBOM = async (blob: Blob) =>
    new TextDecoder('utf-8', { ignoreBOM: true }).decode(
      await blob.arrayBuffer(),
    );

  it('should prepend the UTF-8 BOM exactly once', async () => {
    const csvContent = '이름,설명\n홍길동,"한글, 내용"';

    downloadCSV(csvContent, 'report.csv');

    const text = await decodeKeepingBOM(capturedBlob!);
    expect(text).toBe(UTF8_BOM + csvContent);
    expect(text.startsWith(UTF8_BOM + UTF8_BOM)).toBe(false);
  });

  it('should not duplicate a pre-existing BOM', async () => {
    const csvContent = `${UTF8_BOM}name,value\nfoo,1`;

    downloadCSV(csvContent, 'report.csv');

    const text = await decodeKeepingBOM(capturedBlob!);
    expect(text).toBe(csvContent);
    expect(text.startsWith(UTF8_BOM + UTF8_BOM)).toBe(false);
  });

  it('should append the .csv extension when missing', () => {
    downloadCSV('a,b\n1,2', 'report');

    expect(capturedAnchor?.download).toBe('report.csv');
  });

  it('should not double the .csv extension when already present', () => {
    downloadCSV('a,b\n1,2', 'report.csv');

    expect(capturedAnchor?.download).toBe('report.csv');
  });

  it('should recognize the extension case-insensitively', () => {
    downloadCSV('a,b\n1,2', 'report.CSV');

    expect(capturedAnchor?.download).toBe('report.CSV');
  });

  it('should remove the anchor from the document after clicking', () => {
    downloadCSV('a,b\n1,2', 'report');

    expect(capturedAnchor?.click).toHaveBeenCalledTimes(1);
    expect(capturedAnchor?.isConnected).toBe(false);
  });

  it('should revoke the object URL after a delay', () => {
    downloadCSV('a,b\n1,2', 'report');

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should set the UTF-8 CSV MIME type on the blob', () => {
    downloadCSV('a,b\n1,2', 'report');

    expect(capturedBlob?.type).toBe('text/csv;charset=utf-8;');
  });
});

describe('exportCSVWithFormattingRules', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  let capturedBlob: Blob | undefined;
  let capturedAnchor: HTMLAnchorElement | undefined;

  beforeEach(() => {
    capturedBlob = undefined;
    capturedAnchor = undefined;
    vi.useFakeTimers();
    URL.createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    }) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn() as typeof URL.revokeObjectURL;

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(
      (tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'a') {
          capturedAnchor = element as HTMLAnchorElement;
          vi.spyOn(element as HTMLAnchorElement, 'click').mockImplementation(
            () => {},
          );
        }
        return element;
      },
    );
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  const decodeKeepingBOM = async (blob: Blob) =>
    new TextDecoder('utf-8', { ignoreBOM: true }).decode(
      await blob.arrayBuffer(),
    );

  it('should export CSV with formatting rules applied', async () => {
    const data = [
      { name: 'Alice', score: 95 },
      { name: 'Bob', score: 87 },
    ];
    const format_rules = {
      score: (value: number) => `${value}%`,
    };

    exportCSVWithFormattingRules(data, 'scores.csv', format_rules);

    const text = await decodeKeepingBOM(capturedBlob!);
    expect(text).toContain('"name","score"');
    expect(text).toContain('"Alice","95%"');
    expect(text).toContain('"Bob","87%"');
    expect(capturedAnchor?.download).toBe('scores.csv');
  });

  it('should export CSV without formatting rules', async () => {
    const data = [
      { id: 1, value: 'test' },
      { id: 2, value: 'data' },
    ];

    exportCSVWithFormattingRules(data, 'export');

    const text = await decodeKeepingBOM(capturedBlob!);
    expect(text).toContain('"id","value"');
    expect(text).toContain('1,"test"');
    expect(text).toContain('2,"data"');
    expect(capturedAnchor?.download).toBe('export.csv');
  });

  it('should include UTF-8 BOM in exported file', async () => {
    const data = [{ name: '한글', value: 'Korean' }];

    exportCSVWithFormattingRules(data, 'multilingual.csv');

    const text = await decodeKeepingBOM(capturedBlob!);
    expect(text.startsWith(UTF8_BOM)).toBe(true);
  });
});

describe('parseCSV', () => {
  it('should parse basic CSV with headers', () => {
    const csv = 'name,age\nJohn,30\nJane,25';
    const result = parseCSV(csv);

    expect(result).toEqual([
      { name: 'John', age: '30' },
      { name: 'Jane', age: '25' },
    ]);
  });

  it('should handle UTF-8 BOM at the start', () => {
    const csv = '\uFEFFname,value\ntest,123';
    const result = parseCSV(csv);

    expect(result).toEqual([{ name: 'test', value: '123' }]);
    expect(result[0]).not.toHaveProperty('\uFEFFname');
  });

  it('should handle quoted fields with commas', () => {
    const csv = 'name,description\n"Smith, John","A person"';
    const result = parseCSV(csv);

    expect(result).toEqual([{ name: 'Smith, John', description: 'A person' }]);
  });

  it('should handle escaped double quotes inside quoted fields', () => {
    const csv = 'title,quote\n"Book","She said ""Hello"""';
    const result = parseCSV(csv);

    expect(result).toEqual([{ title: 'Book', quote: 'She said "Hello"' }]);
  });

  it('should handle line breaks inside quoted fields', () => {
    const csv = 'name,bio\n"John","Line 1\nLine 2"';
    const result = parseCSV(csv);

    expect(result).toEqual([{ name: 'John', bio: 'Line 1\nLine 2' }]);
  });

  it('should handle CRLF line endings', () => {
    const csv = 'a,b\r\n1,2\r\n3,4';
    const result = parseCSV(csv);

    expect(result).toEqual([
      { a: '1', b: '2' },
      { a: '3', b: '4' },
    ]);
  });

  it('should trim whitespace from unquoted values', () => {
    const csv = 'name , age \n  John  ,  30  ';
    const result = parseCSV(csv);

    expect(result).toEqual([{ name: 'John', age: '30' }]);
  });

  it('should skip fully empty lines', () => {
    const csv = 'name,value\n\n\nJohn,1\n\nJane,2\n\n';
    const result = parseCSV(csv);

    expect(result).toEqual([
      { name: 'John', value: '1' },
      { name: 'Jane', value: '2' },
    ]);
  });

  it('should handle file without trailing newline', () => {
    const csv = 'x,y\n1,2';
    const result = parseCSV(csv);

    expect(result).toEqual([{ x: '1', y: '2' }]);
  });

  it('should return empty array for empty input', () => {
    expect(parseCSV('')).toEqual([]);
    expect(parseCSV('\n\n')).toEqual([]);
    expect(parseCSV('   \n   \n   ')).toEqual([]);
  });

  it('should handle missing values (sparse rows)', () => {
    const csv = 'a,b,c\n1,2,3\n4,,6';
    const result = parseCSV(csv);

    expect(result).toEqual([
      { a: '1', b: '2', c: '3' },
      { a: '4', b: '', c: '6' },
    ]);
  });

  it('should throw error on unterminated quoted field', () => {
    const csv = 'name,value\n"John,123';

    expect(() => parseCSV(csv)).toThrow('Unterminated quoted field in CSV');
  });

  it('should handle empty quoted fields', () => {
    const csv = 'a,b,c\n"",2,""';
    const result = parseCSV(csv);

    expect(result).toEqual([{ a: '', b: '2', c: '' }]);
  });

  it('should handle headers with special characters', () => {
    const csv = 'email@domain,first-name,last_name\ntest@test.com,John,Doe';
    const result = parseCSV(csv);

    expect(result).toEqual([
      {
        'email@domain': 'test@test.com',
        'first-name': 'John',
        last_name: 'Doe',
      },
    ]);
  });

  it('should handle complex mixed quoting scenarios', () => {
    const csv = `name,address,notes
"John Doe","123 Main St, Apt ""5""","New customer
Very important"
Jane,"456 Oak Ave",Regular`;

    const result = parseCSV(csv);

    expect(result).toEqual([
      {
        name: 'John Doe',
        address: '123 Main St, Apt "5"',
        notes: 'New customer\nVery important',
      },
      { name: 'Jane', address: '456 Oak Ave', notes: 'Regular' },
    ]);
  });
});
