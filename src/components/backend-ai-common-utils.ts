/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
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

  _humanReadableFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = Math.pow(2, 10);
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    i = i < 0 ? 0 : i; // avoid negative value
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
   */
  deleteNestedKeyFromObject(obj: Object, nestedKey: String, sep: String = '.') {
    if (!obj || obj.constructor !== Object || !nestedKey) {
      return obj;
    }
    const keys = nestedKey.split(sep)
    const lastKey = keys.pop();
    delete keys.reduce((o, k) => o[k], obj)[lastKey];
    return obj;
  }

  /**
   * Merge two nested objects into one.
   *
   * @param {Object} obj1 - source object
   * @param {Object} obj2 - the objects that will override obj1
   */
  mergeNestedObjects(obj1: Object, obj2: Object) {
    if (!obj1 || !obj2) {
      return obj1 || obj2 || {}
    }
    function _merge(a, b) {
      return Object.entries(b).reduce((o, [k, v]) => {
          o[k] = v && v.constructor === Object
              ? _merge(o[k] = o[k] || (Array.isArray(v) ? [] : {}), v)
              : v;
          return o;
      }, a);
    }
    return [obj1, obj2].reduce(_merge, {});
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
