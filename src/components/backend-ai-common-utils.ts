/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */
import {customElement, html, property} from 'lit-element';
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

  /**
   * Convert the value byte to MB.
   *
   * @param {number} value
   * @return {number} converted value from byte to MB.
   */
  _byteToMB(value) {
    return Math.floor(value / 1000000);
  }

  _bytesToMB(value) {
    return Number(value / (1024 * 1024)).toFixed(1);
  }

  _bytesToGB(value) {
    const gibibyte = Math.pow(1024, 3);
    return Number(value / gibibyte).toFixed(1);
  }

  _bytesToTB(value) {
    const gibibyte = Math.pow(1024, 4);
    return Number(value / gibibyte).toFixed(1);
  }

  /**
   * Convert the value MB to GB.
   *
   * @param {number} value
   * @return {number} converted value from MB to GB.
   */
  _MBtoGB(value) {
    return Math.floor(value / 1024);
  }

  /**
   * Get MB value when input is less than 1 GB.
   *
   * @param {number} value - value with GB unit.
   * @return {number} MB value if input is smaller than 1GB. Otherwise, GB value.
   * */
  _conditionalGBtoMB(value) {
    if (value < 1.0) {
      return (value * 1024).toFixed(0);
    }
    return value;
  }

  /**
   * Get MB unit when input is less than 1 GB.
   *
   * @param {number} value - value with GB unit.
   * @return {string} MB if input is smaller than 1GB. Otherwise, GB.
   * */
  _conditionalGBtoMBunit(value) {
    if (value < 1.0) {
      return 'MB';
    }
    return 'GB';
  }

  _msecToSec(value) {
    return Number(value / 1000).toFixed(0);
  }

  /**
   * Convert start date to human readable date.
   *
   * @param {Date} start date
   * @return {string} Human-readable date
   */
  _humanReadableDate(start) {
    const d = new Date(start);
    return d.toLocaleString();
  }

  /**
   * Change d of any type to human readable date time.
   *
   * @param {string | Date} d - Data string or object
   * @return {string} Human readable time string
   */
  _humanReadableTime(d: any) {
    d = new Date(d);
    const option = {hour12: false};
    return d.toLocaleString('en-US', option);
  }

  /**
   * Change d of any type to ISO date time.
   *
   * @param {string | Date} d - Data string or object
   * @return {string} ISO time string
   */
  _toISOTime(d: any) {
    d = new Date(d);
    return d.toISOString();
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

  _markIfUnlimited(value) {
    if (['-', 0, '0', 'Unlimited', Infinity, 'Infinity'].includes(value)) {
      return '∞';
    } else if (['NaN', NaN].includes(value)) {
      return '-';
    } else {
      return value;
    }
  }

  /**
   * Increase index by 1.
   *
   * @param {number} index
   * @return {number} index + 1
   */
  _indexFrom1(index: number) {
    return index + 1;
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
