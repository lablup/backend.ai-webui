'use babel';
/*
Backend.AI API Library / SDK for Node.JS / Javascript ES6 (v20.01.0)
====================================================================

(C) Copyright 2016-2020 Lablup Inc.
Licensed under MIT
*/
export default class JsonToCsv {
    static flatten(objs) {
        if (!objs || !objs.length) {
            return;
        }
        const keys = Object.keys(objs[0]);
        objs.map(obj => {
            keys.map((k) => {
                let cell = (obj[k] === null || obj[k] === undefined) ? '' : obj[k].toString();
                if (cell.search(/("|,|\n)/g) >= 0) {
                    if (cell[0] === '[') { // Array of Objects
                        let subJson = JSON.parse(cell);
                        subJson.map((key) => {
                            if (key.name) { // session service_ports
                                delete obj[k];
                            }
                        });
                    }
                    else if (cell[0] === '{') {
                        let subJson = JSON.parse(cell);
                        Object.keys(subJson).map((key) => {
                            obj[k + '.' + key] = subJson[key];
                        });
                        delete obj[k];
                    }
                }
            });
        });
    }
    static exportToCsv(filename, rows) {
        if (!rows || !rows.length) {
            return;
        }
        JsonToCsv.flatten(rows);
        const separator = ',';
        const keys = Object.keys(rows[0]);
        const csvContent = keys.join(separator) +
            '\n' +
            rows.map(row => {
                return keys.map(k => {
                    let cell = '';
                    if (row[k] && typeof row[k] === 'object') {
                        if (row[k].name) { // session service_ports
                            cell = JSON.stringify(row[k], ['protocol', 'host_ports', 'container_ports']);
                            cell = cell.replace(/"/g, '""');
                        }
                        if (cell.search(/("|,|\n)/g) >= 0) {
                            cell = `"${cell}"`;
                        }
                    }
                    else {
                        cell = row[k] === null || row[k] === undefined ? '' : row[k].toString();
                    }
                    return cell;
                }).join(separator);
            }).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        }
        else {
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
