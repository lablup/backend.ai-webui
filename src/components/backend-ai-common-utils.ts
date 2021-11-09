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

  _humanReadableFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = Math.pow(2, 10);
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    i = i < 0 ? 0 : i; // avoid negative value
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
