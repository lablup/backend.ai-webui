/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import * as _ from 'lodash-es';

/**
 * Escapes a value for CSV formatting.
 *
 * @param value - The value to escape.
 * @returns The escaped value.
 */
function escapeCsvValue(value: any) {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  // Convert non-string values to string using JSON.stringify
  value = _.isString(value) ? value : JSON.stringify(value);

  // Replace double quotes within the value with two double quotes
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Converts an array of JSON objects to a CSV string.
 *
 * @param data - The array of JSON objects to convert.
 * @param format_rules - The formatting rules for each property in the JSON objects.
 * @returns The CSV string representation of the JSON objects.
 */
export const JSONToCSVBody = <T>(
  data: T[],
  format_rules?: {
    [key in keyof T]?: (value: any) => any;
  },
) => {
  const displayedData = _.map(data, (row) => {
    return _.omit(row as object, '__fragments', '__fragmentOwner', '__id');
  });

  const CSVTitle = _.keys(displayedData[0]);
  const CSVData = _.map(displayedData, (row) => {
    return _.map(row, (value, key) => {
      if (format_rules?.[key as keyof T]) {
        return format_rules[key as keyof T]?.(value) || value;
      }
      return value;
    });
  });

  const csvContent = CSVData.map((row) =>
    row.map(escapeCsvValue).join(','),
  ).join('\n');
  const csvBody = [CSVTitle.map(escapeCsvValue).join(','), csvContent].join(
    '\n',
  );

  return csvBody;
};

/**
 * Download a file from the given blob.
 * @param {Blob} blob - The file content.
 * @param {string} filename - The name of the file.
 */

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportCSVWithFormattingRules = <T>(
  data: T[],
  filename: string,
  format_rules?: {
    [key in keyof T]?: (value: any) => any;
  },
) => {
  const bodyStr = JSONToCSVBody(data, format_rules);
  const blob = new Blob([bodyStr], { type: 'text/csv' });
  downloadBlob(blob, `${filename}.csv`);
};

/**
 * Parses a CSV string into an array of row objects keyed by the header row.
 *
 * Handles RFC 4180 style quoting: double-quoted fields, escaped double quotes
 * (`""`), and commas / line breaks inside quoted fields. Leading/trailing
 * whitespace around unquoted values and header names is trimmed, and fully
 * empty lines are skipped. Header names are preserved as-is (after trimming);
 * callers that need case-insensitive matching should normalize the keys.
 *
 * @param text - The raw CSV file content.
 * @returns An array of objects, one per data row, keyed by header name.
 */
export const parseCSV = (text: string): Record<string, string>[] => {
  // Strip a leading UTF-8 BOM so the first header cell does not become
  // a BOM-prefixed "email", which would silently fail header matching.
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const rows: string[][] = [];
  let cell = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          // Escaped double quote inside a quoted field.
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') {
        i++;
      }
      row.push(cell);
      cell = '';
      rows.push(row);
      row = [];
    } else {
      cell += char;
    }
  }
  // A quote that never closes means the file is malformed; fail loudly so
  // callers can surface a parse error instead of silently importing garbage.
  if (inQuotes) {
    throw new Error('Unterminated quoted field in CSV');
  }

  // Flush the final cell/row when the file does not end with a line break.
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const nonEmptyRows = rows.filter((r) => r.some((c) => c.trim() !== ''));
  if (nonEmptyRows.length === 0) {
    return [];
  }

  const header = nonEmptyRows[0].map((h) => h.trim());
  return nonEmptyRows.slice(1).map((dataRow) => {
    const record: Record<string, string> = {};
    header.forEach((key, index) => {
      record[key] = (dataRow[index] ?? '').trim();
    });
    return record;
  });
};
