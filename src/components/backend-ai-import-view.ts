/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import './lablup-loading-spinner';

import 'weightless/card';

import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-textfield';

import './lablup-activity-panel';
import './backend-ai-chart';
import './backend-ai-resource-monitor';
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
  @property({type: String}) environment = 'python';
  @property({type: String}) importMessage = '';

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
    this.importMessage = this.queryString;
    if (this.queryString.includes('tensorflow')) {
      this.environment = 'index.docker.io/lablup/python-tensorflow';
    } else if (this.queryString.includes('pytorch')) {
      this.environment = 'index.docker.io/lablup/python-pytorch';
    } else if (this.queryString.includes('mxnet')) {
      this.environment = 'index.docker.io/lablup/python-mxnet';
    } else {
      this.environment = 'index.docker.io/lablup/python-ff';
    }
    if (queryString !== "") {
      this.fetchURLResource(queryString);
    }
  }

  fetchURLResource(url): void {
    let downloadURL = 'https://raw.githubusercontent.com/' + url;
    fetch(downloadURL).then((res) => {
      this.notification.text = _text('import.ReadyToImport');
      this.importMessage = this.notification.text;
      this.notification.show();
      this.sessionLauncher.selectDefaultLanguage(true, this.environment);
      this.sessionLauncher.importScript = "#!/bin/sh\ncurl -O " + downloadURL;
      this.sessionLauncher.importFilename = downloadURL.split('/').pop();
      this.sessionLauncher._launchSessionDialog();
    }).catch((err) => {
      this.notification.text = _text('import.NoSuitableResourceFoundOnGivenURL');
      this.importMessage = this.notification.text;
      this.notification.show();
    });
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <wl-card class="item" elevation="1" style="padding-bottom:20px;">
        <h3 class="plastic-material-title">${_t('import.ImportAndRun')}</h3>
          ${this.queryString ? html`
            <lablup-activity-panel title="${_t('import.Importing')}" elevation="1" horizontalsize="2x" headerColor="#3164BA">
              <div slot="message">
              ${this.importMessage}...
              </div>
            </lablup-activity-panel>
          ` : html``}
        <div class="horizontal wrap layout">
          <div class="vertical wrap layout">
            <lablup-activity-panel title="${_t('import.RunOnBackendAI')}" elevation="1"  headerColor="#3164BA">
              <div slot="message">
                <div class="horizontal justified layout wrap">
                  <backend-ai-session-launcher mode="import" location="import"
                  id="session-launcher" ?active="${this.active === true}"
                  .newSessionDialogTitle="${_t('session.launcher.StartImportedNotebook')}"></backend-ai-session-launcher>
                </div>
              </div>
            </lablup-activity-panel>
          </div>
          <lablup-activity-panel title="${_t('summary.ResourceStatistics')}" elevation="1" headerColor="#3164BA">
            <div slot="message">
              <div class="horizontal justified layout wrap">
                <backend-ai-resource-monitor location="summary" id="resource-monitor" ?active="${this.active === true}" direction="vertical"></backend-ai-resource-monitor>
              </div>
            </div>
          </lablup-activity-panel>
        </div>
        <h3 class="plastic-material-title">${_t('import.ImportToStorage')}</h3>
        <div class="horizontal wrap layout">
        </div>
      </wl-card>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-import-view": BackendAIImport;
  }
}
