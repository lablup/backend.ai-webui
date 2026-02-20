//'use babel';
/*
Backend.AI API : JSON to CSV Converter
======================================

(C) Copyright 2015-2026 Lablup Inc.
Licensed under MIT
*/

export default class JsonToCsv {
  static flatten(objs: object[]) {
    if (!objs || !objs.length) {
      return;
    }
    const keys = Object.keys(objs[0]);
    objs.map((obj) => {
      keys.map((k) => {
        let cell =
          obj[k] === null || obj[k] === undefined ? '' : obj[k].toString();
        if (typeof cell === 'string' && cell.startsWith('[object Object]')) {
          cell = JSON.stringify(obj[k]);
        }
        if (cell.search(/("|,|\n)/g) >= 0) {
          if (cell[0] === '[') {
            // Array of Objects
            let subJson = JSON.parse(cell);
            if (k === 'groups') {
              // groups key in users
              obj[k + '.' + 'name'] = subJson.map((key) => key.name).join(';');
            } else {
              subJson.map((key) => {
                obj[k + '.' + key] = key;
              });
            }
            delete obj[k];
          } else if (cell[0] === '{') {
            let subJson = JSON.parse(cell);
            Object.keys(subJson).map((key) => {
              subJson[key] =
                ['cpu',
                  'mem',
                  'cuda_shares',
                  'cuda_device',
                  'rocm_device',
                  'tpu_device',
                  'ipu_device',
                  'atom_device',
                  'warboy_device',
                  'rngd.device',].includes(key) &&
                typeof subJson[key] === 'string'
                  ? ''
                  : subJson[key];
              obj[k + '.' + key] = subJson[key];
            });
            delete obj[k];
          } else {
            if (cell.includes('GMT')) {
              // Datetime string
              obj[k] = cell.split(',').join('');
            } else if (cell.includes(',')) {
              cell = cell.split(',');
            }
          }
        }
      });
    });
  }

  static exportToCsv(filename: string, rows: object[]) {
    if (!rows || !rows.length) {
      return;
    }
    JsonToCsv.flatten(rows);
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) => {
          return keys
            .map((k) => {
              let cell = '';
              if (row[k] && typeof row[k] === 'object') {
                cell = JSON.stringify(row[k]);
                cell = cell.replace(/"/g, '""');
                if (cell.search(/("|,|\n)/g) >= 0) {
                  cell = `"${cell}"`;
                }
              } else {
                cell =
                  row[k] === null || row[k] === undefined
                    ? ''
                    : row[k].toString();
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    // @ts-ignore
    if (navigator.msSaveBlob) {
      // IE 10+
      // @ts-ignore
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename + '.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
}
