/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// csv-util.test.ts
import { downloadCSV, JSONToCSVBody, UTF8_BOM } from './csv-util';

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
