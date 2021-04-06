/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */

import {get as _text} from 'lit-translate';
import {CSSResultArray, CSSResultOrNative, customElement, html, LitElement, property} from 'lit-element';

/**
 Backend AI Release Check

 `backend-ai-release-check` checks which is latest version.

 Example:

 <backend-ai-release-check></backend-ai-release-check>

@group Backend.AI Web UI
 @element backend-ai-release-check
 */

@customElement('backend-ai-release-check')
export default class BackendAiReleaseCheck extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: String}) releaseURL = 'https://raw.githubusercontent.com/lablup/backend.ai-webui/release/version.json';
  @property({type: String}) localVersion = '';
  @property({type: String}) localBuild = '';
  @property({type: String}) remoteVersion = '';
  @property({type: String}) remoteBuild = '';
  @property({type: String}) remoteRevision = '';
  @property({type: Boolean}) updateChecked = false;
  @property({type: Boolean}) updateNeeded = false;
  @property({type: String}) updateURL = '';
  @property({type: Object}) notification;

  constructor() {
    super();
  }

  static get styles(): CSSResultOrNative | CSSResultArray {
    return [];
  }

  render() {
    // language=HTML
    return html`
    `;
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    if (globalThis.isElectron && typeof globalThis.backendaioptions != 'undefined' && globalThis.backendaioptions.get('automatic_update_check', true)) {
      this.checkRelease();
    }
  }

  /**
   * Check package version is latest
   * */
  async checkRelease() {
    if (!this.updateChecked) {
      fetch(this.releaseURL).then(
        (response) => response.json()
      ).then(
        (json) => {
          this.updateChecked = true;
          this.remoteVersion = json.package;
          this.remoteBuild = json.build;
          this.remoteRevision = json.revision;
          if (this.compareVersion(globalThis.packageVersion, this.remoteVersion) < 0) { // update needed.
            // if (this.compareVersion('20.03.3', this.remoteVersion) < 0) { // For testing
            this.updateNeeded = true;
            this.updateURL = `https://github.com/lablup/backend.ai-webui/releases/tag/v${this.remoteVersion}`;
            if (globalThis.isElectron) {
              this.notification.text = _text('update.NewWebUIVersionAvailable') + ' ' + this.remoteVersion;
              this.notification.detail = _text('update.NewWebUIVersionAvailable');
              this.notification.url = this.updateURL;
              this.notification.show();
            }
          }
        }
      ).catch((e) => {
        const count = globalThis.backendaioptions.get('automatic_update_count_trial', 0);
        if (count > 3) { // Try 3 times.
          globalThis.backendaioptions.set('automatic_update_check', false); // Turn off automatic check.
        }
        globalThis.backendaioptions.set('automatic_update_count_trial', count + 1);
      });
    }
  }

  /**
   * Return  1 if v1 is latest.
   * Return -1 if v2 is latest.
   * Return  0 if v1 and v2 is same version.
   *
   * @param {string} v1 - version 1
   * @param {string} v2 - version 2
   * */
  compareVersion(v1, v2) {
    if (typeof v1 !== 'string') return false;
    if (typeof v2 !== 'string') return false;
    v1 = v1.split('.');
    v2 = v2.split('.');
    const k = Math.min(v1.length, v2.length);
    for (let i = 0; i < k; ++i) {
      v1[i] = parseInt(v1[i], 10);
      v2[i] = parseInt(v2[i], 10);
      if (v1[i] > v2[i]) return 1;
      if (v1[i] < v2[i]) return -1;
    }
    return v1.length == v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-release-check': BackendAiReleaseCheck;
  }
}
