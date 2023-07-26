/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

/**
 Backend.AI Common Utils

 `backend-ai-common-utils` is a shared component for maintaining settings that affect overall components.
@group Backend.AI Web UI
 */
@customElement('backend-ai-common-utils')
export default class BackendAiCommonUtils extends BackendAIPage {
  @property({type: Object}) options = Object();


  constructor() {
    super();
  }

  /**
   * Returns password regex match with under condition
   * - at least one or more Alphabet regardless of upper / lower case
   * - at least one or more digit number (0-9)
   * - at least one or more special character includes (^, -, _)
   *
   * @return {string} regex string
   */
  static get passwordRegex() {
    return '^(?=.*\\d)(?=.*[a-zA-Z])(?=.*[_\\W]).{8,}$';
  }

  /**
   * Read recent project group according to endpoint id.
   *
   * @return {string} Current selected group
   */
  _readRecentProjectGroup() {
    const endpointId = globalThis.backendaiclient._config.endpointHost.replace(/\./g, '_'); // dot is used for namespace divider
    const value: string | null = globalThis.backendaioptions.get('projectGroup.' + endpointId);
    if (value) { // Check if saved group has gone between logins / sessions
      if (globalThis.backendaiclient.groups.length > 0 && globalThis.backendaiclient.groups.includes(value)) {
        return value; // value is included. So it is ok.
      } else {
        this._deleteRecentProjectGroupInfo();
        return globalThis.backendaiclient.current_group;
      }
    }
    return globalThis.backendaiclient.current_group;
  }

  /**
   * Set the project group according to current group.
   *
   * @param {string} value
   */
  _writeRecentProjectGroup(value: string) {
    const endpointId = globalThis.backendaiclient._config.endpointHost.replace(/\./g, '_'); // dot is used for namespace divider
    globalThis.backendaioptions.set('projectGroup.' + endpointId, value ? value : globalThis.backendaiclient.current_group);
  }

  /**
   * Delete the recent project group information.
   */
  _deleteRecentProjectGroupInfo() {
    const endpointId = globalThis.backendaiclient._config.endpointHost.replace(/\./g, '_'); // dot is used for namespace divider
    globalThis.backendaioptions.delete('projectGroup.' + endpointId);
  }

  /**
   * Convert file size with binary unit to human readable unit and value
   *
   * @param {number} bytes
   * @param {number} decimalPoint decimal point set to 2 as a default
   * @return {string} converted file size to human readable value
   */
  _humanReadableFileSize(bytes = 0, decimalPoint = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = Math.pow(10, 3);
    decimalPoint = decimalPoint < 0 ? 0 : decimalPoint;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let i = Math.floor(Math.log(Math.round(bytes)) / Math.log(k));
    i = i < 0 ? 0 : i; // avoid negative value
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) + ' ' + sizes[i];
  }

  /**
   * Mask String with range
   *
   * @param {string} value - string to mask
   * @param {string} maskChar - character used for masking (default: '*')
   * @param {number} startFrom - exclusive index masking starts
   * @param {number} maskLength - range length to mask
   * @return {string} maskedString
   */
  _maskString(value = '', maskChar = '*', startFrom = 0, maskLength = 0) {
    // clamp mask length
    maskLength = (startFrom + maskLength > value.length) ? value.length : maskLength;
    return value.substring(0, startFrom) + maskChar.repeat(maskLength) + value.substring(startFrom+maskLength, value.length);
  }

  /**
   * Delete a nested key from an object.
   *
   * @param {Object} obj - target object
   * @param {String} nestedKey - nested key to delete with arbitrary depths (ex: 'key.subkey')
   * @param {String} sep - separator of the `nestedKey`
   * @return {Object} - Object without nested key
  */
  deleteNestedKeyFromObject(obj: Object, nestedKey: string, sep = '.') {
    if (!obj || obj.constructor !== Object || !nestedKey) {
      return obj;
    }
    const keys = nestedKey.split(sep);
    const lastKey = keys.pop();
    if (lastKey) {
      delete keys.reduce((o, k) => o[k], obj)[lastKey];
    }
    return obj;
  }

  /**
   * Merge two nested objects into one.
   *
   * @param {object} obj1 - source object
   * @param {object} obj2 - the objects that will override obj1
   * @return {object} - Merged object
   */
  mergeNestedObjects(obj1: object, obj2: object) {
    if (!obj1 || !obj2) {
      return obj1 || obj2 || {};
    }
    function _merge(a, b) {
      return Object.entries(b).reduce((o, [k, v]) => {
        o[k] = v && (v as object).constructor === Object ?
          _merge(o[k] = o[k] || (Array.isArray(v) ? [] : {}), v) :
          v;
        return o;
      }, a);
    }
    return [obj1, obj2].reduce(_merge, {});
  }

  /**
   * Export string to txt file
   *
   * @param {String} fileName - file name to save
   * @param {String} str - contents string
   */
  exportToTxt(fileName: string, str: string) {
    if (!str || str.length === 0) {
      return;
    }
    const blob = new Blob([str], {type: 'text/plain;charset=utf-8'});
    const link = document.createElement('a');
    if (link.download !== undefined) {
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName + '.txt');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  isEmpty(str) {
    return str === '' || str === null || str === undefined || typeof str === 'undefined';
  }

  render() {
    // language=HTML
    return html`
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-common-utils': BackendAiCommonUtils;
  }
}
