/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import './lablup-loading-spinner';

import 'weightless/card';
import 'weightless/icon';

import '@material/mwc-linear-progress/mwc-linear-progress';
import '@material/mwc-icon';
import '@material/mwc-icon-button';

import './lablup-activity-panel';
import './backend-ai-chart';
import './backend-ai-resource-monitor';
import './backend-ai-resource-panel';
import './backend-ai-session-launcher';
import '../plastics/lablup-shields/lablup-shields';
import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment, IronPositioning} from "../plastics/layout/iron-flex-layout-classes";

/**
 `<backend-ai-import-view>` is a import feature of backend.ai console.

 Example:
 <backend-ai-import-view active></backend-ai-import-view>

 @group Lablup Elements
 @element backend-ai-import-view
 */

@customElement("backend-ai-import-view")
export default class BackendAIImport extends BackendAIPage {
  @property({type: String}) condition = 'running';
  @property({type: Boolean}) authenticated = false;
  @property({type: Object}) spinner = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) sessionLauncher = Object();
  @property({type: Object}) resourcePolicy;
  @property({type: String}) requestURL = '';
  @property({type: String}) queryString = '';

  constructor() {
    super();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronPositioning,
      // language=CSS
      css`
        #session-launcher {
          --component-width: 235px;
        }
      `
    ];
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.sessionLauncher = this.shadowRoot.querySelector('#session-launcher');
    this.notification = globalThis.lablupNotification;
  }

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      this.shadowRoot.querySelector('#resource-monitor').removeAttribute('active');
      return;
    }
    this.shadowRoot.querySelector('#resource-monitor').setAttribute('active', 'true');
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.authenticated = true;
        if (this.activeConnected) {
          this.requestUpdate();
        }
      }, true);
    } else {
      this.authenticated = true;
      this.requestUpdate();
    }
    this.requestURL = globalThis.currentPageParams.requestURL;
    let queryString = globalThis.currentPageParams.queryString;
    queryString = queryString.substring(queryString.indexOf("?") + 1);
    this.queryString = queryString;
    if (queryString !== "") {
      this.fetchURLResource(queryString);
    } else {
      this.notification.text = 'Wrong URL parameter.';
      this.notification.show();
    }
  }

  fetchURLResource(url) {
    let downloadURL = 'https://raw.githubusercontent.com/' + url;
    fetch(downloadURL).then((res) => {
      this.sessionLauncher.importScript = "#!/bin/sh\ncurl -O " + downloadURL;
      this.sessionLauncher.importFilename = downloadURL.split('/').pop();
      this.sessionLauncher._launchSessionDialog();
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <wl-card class="item" elevation="1" style="padding-bottom:20px;">
        <h3 class="plastic-material-title">${_t('import.Runtime')} <small>: Loading ${this.queryString}...</small></h3>
        <div class="horizontal wrap layout">
          <lablup-activity-panel title="${_t('import.RunOnBackendAI')}" elevation="1"  headerColor="#3164BA">
            <div slot="message">
              <div class="horizontal justified layout wrap">
                <backend-ai-session-launcher mode="import" location="summary" id="session-launcher" ?active="${this.active === true}"></backend-ai-session-launcher>
              </div>
            </div>
          </lablup-activity-panel>
          <lablup-activity-panel title="${_t('summary.ResourceStatistics')}" elevation="1" headerColor="#3164BA">
            <div slot="message">
              <div class="horizontal justified layout wrap">
                <backend-ai-resource-monitor location="summary" id="resource-monitor" ?active="${this.active === true}" direction="vertical"></backend-ai-resource-monitor>
              </div>
            </div>
          </lablup-activity-panel>

       </div>
      </wl-card>
      <backend-ai-release-check id="update-checker"></backend-ai-release-check>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-import-view": BackendAIImport;
  }
}
