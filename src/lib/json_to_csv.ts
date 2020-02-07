'use babel';
/*
Backend.AI API Library / SDK for Node.JS / Javascript ES6 (v20.01.0)
====================================================================

(C) Copyright 2016-2020 Lablup Inc.
Licensed under MIT
*/

export default class JsonToCsv {
    static exportToCsv(filename: string, rows: object[]) {
      if (!rows || !rows.length) {
        return;
      }
      const separator = ',';
      const keys = Object.keys(rows[0]);
      const csvContent =
        keys.join(separator) +
        '\n' +
        rows.map(row => {
          return keys.map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date
              ? cell.toLocaleString()
              : cell.toString().replace(/"/g, '""');
              
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          }).join(separator);
        }).join('\n');
  
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
      } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
          // Browsers that support HTML5 download attribute
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    }
  }