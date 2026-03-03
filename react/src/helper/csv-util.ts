/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import _ from 'lodash';

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
