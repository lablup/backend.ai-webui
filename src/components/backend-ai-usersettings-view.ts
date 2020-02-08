/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';
import {store} from '../store';

import {BackendAiStyles} from './backend-ai-console-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';

import 'weightless/card';
import 'weightless/switch';
import 'weightless/select';
import 'weightless/tab';
import 'weightless/tab-group';
import 'weightless/icon';
import 'weightless/button';


import {default as PainKiller} from "./backend-ai-painkiller";
import './lablup-codemirror';
import './lablup-loading-indicator';
import './backend-ai-error-log-list';

@customElement("backend-ai-usersettings-view")
export default class BackendAiUserSettingsView extends BackendAIPage {
  public indicator: any;
  public lastSavedBootstrapScript: string = '';

  @property({type: Object}) images = Object();
  @property({type: Boolean}) options = Object();
  @property({type: Object}) _activeTab = Object();
  @property({type: Object}) bootstrapDialog = Object();
  @property({type: Object}) clearLogsDialog  = Object();
  @property({type: Object}) logGrid = Object();

  constructor() {
    super();
    this.options = {
      automatic_image_update: false,
      cuda_gpu: false,
      cuda_fgpu: false,
      rocm_gpu: false,
      tpu: false,
      scheduler: 'fifo'
    }
  }

  static get is() {
    return 'backend-ai-usersettings-view';
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        div.description,
        span.description {
          font-size: 11px;
          margin-top: 5px;
          margin-right: 5px;
        }

        .setting-item {
          margin: 15px 10px;
          width: 340px;
        }

        .setting-desc {
          width: 300px;
        }

        .setting-button {
          width: 35px;
        }

        .setting-item wl-button {
          --button-bg: transparent;
          --button-bg-hover: var(--paper-teal-100);
          --button-bg-active: var(--paper-teal-100);
          --button-bg-disabled: #ccc;
          --button-color: var(--paper-teal-100);
          --button-color-hover: var(--paper-teal-100);
          --button-color-disabled: #ccc;
        }

        #bootstrap-dialog wl-button {
          margin-left: 5px;
        }

        wl-card > div {
          padding: 15px;
        }

        wl-card h3.tab {
          padding-top: 0;
          padding-bottom: 0;
          padding-left: 0;
        }

        wl-card wl-card {
          margin: 0;
          padding: 0;
          --card-elevation: 0;
        }

        wl-tab-group {
          --tab-group-indicator-bg: var(--paper-teal-600);
        }

        #bootstrap-dialog {
          --dialog-min-width: calc(100vw - 200px);
          --dialog-max-width: calc(100vw - 200px);
          --dialog-min-height: calc(100vh - 100px);
          --dialog-max-height: calc(100vh - 100px);
        }

        wl-tab {
          --tab-color: #666;
          --tab-color-hover: #222;
          --tab-color-hover-filled: #222;
          --tab-color-active: var(--paper-teal-600);
          --tab-color-active-hover: var(--paper-teal-600);
          --tab-color-active-filled: #ccc;
          --tab-bg-active: var(--paper-teal-200);
          --tab-bg-filled: var(--paper-teal-200);
          --tab-bg-active-hover: var(--paper-teal-200);
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <wl-card class="item">
        <h3 class="tab horizontal wrap layout">
          <wl-tab-group>
            <wl-tab value="general" checked @click="${(e) => this._showTab(e.target)}">General</wl-tab>
            <wl-tab value="logs" checked @click="${(e) => this._showTab(e.target)}">Logs</wl-tab>
          </wl-tab-group>
        </h3>
        <wl-card id="general" class="item tab-content" style="display:none;">
          <h3 class="horizontal flex center layout">
            <span>General</span>
            <span class="flex"></span>
          </h3>
          <div class="horizontal wrap layout">
            <div class="horizontal layout wrap setting-item">
              <div class="vertical center-justified layout setting-desc">
                <div>TEST1</div>
                <div class="description">This is description.
                </div>
              </div>
              <div class="vertical center-justified layout setting-button">
                <wl-switch id="register-new-image-switch" disabled></wl-switch>
              </div>
            </div>
          </div>
          <h3 class="horizontal center layout">
            <span>Shell Environments</span>
            <span class="flex"></span>
          </h3>
          <div class="horizontal wrap layout">
            <div class="horizontal layout wrap setting-item">
              <wl-button class="fg teal" outlined @click="${this._editBootstrapScript}">
                <wl-icon>edit</wl-icon>
                Edit bootstrap script
              </wl-button>
            </div>
          </div>
          <h3 class="horizontal center layout">
            <span>Package Installation</span>
            <span class="flex"></span>
          </h3>
          <div class="horizontal wrap layout">
            <div class="horizontal layout wrap setting-item">
              <div class="vertical center-justified layout setting-desc">
                <div>TEST1</div>
                <div class="description">This is description.
                </div>
              </div>
              <div class="vertical center-justified layout setting-button">
                <wl-switch id="register-new-image-switch" disabled></wl-switch>
              </div>
            </div>
          </div>
        </wl-card>
        <wl-card id="logs" class="item tab-content" style="display:none;">
        <h3 class="horizontal center layout">
          <span>Log messages</span>
          <span class="flex"></span>
          <wl-button class="fg cyan" inverted outlined @click="${this._refreshLogs}" style="margin: 0px 10px;">
            <wl-icon>refresh</wl-icon>
            refresh
          </wl-button>
          <wl-button class="fg teal" inverted outlined @click="${this._showClearLogsDialog}" style="margin: 0px 10px;">
            <wl-icon>delete</wl-icon>
            clear logs
        </wl-button>
        </h3>
        <backend-ai-error-log-list active="true"></backend-ai-error-log-list>
        </wl-card>
      </wl-card>
      <wl-dialog id="bootstrap-dialog" fixed backdrop scrollable blockScrolling persistent>
        <div slot="header">Bootstrap script</div>
        <div slot="content">
          <lablup-codemirror id="codemirror-editor" mode="shell"></lablup-codemirror>
        </div>
        <div slot="footer">
          <wl-button inverted flat id="discard-code" @click="${this._hideBootstrapScriptDialog}">Cancel</wl-button>
          <wl-button id="save-code" class="button" @click="${this._saveBootstrapScript}">Save</wl-button>
          <wl-button id="save-code-and-close" @click="${this._saveBootstrapScriptAndCloseDialog}">Save and close</wl-button>
        </div>
      </wl-dialog>
      <wl-dialog id="clearlogs-dialog" fixed backdrop scrollable blockScrolling persistent style="border-bottom:none;">
        <div slot="header" style="border-bottom:none;">Are you sure you want to delete all of the log messages ?</div>
        <div slot="footer" style="border-top:none;">
          <wl-button inverted flat id="discard-removal"
                     style="margin: 0 5px;"
                     @click="${this._hideClearLogsDialog}">No</wl-button>
          <wl-button id="apply-removal" class="button"
                     style="margin: 0 5px;"
                     @click="${this._removeLogMessage}">Yes</wl-button>
        </div>
      </wl-dialog>
    `;
  }

  firstUpdated() {
    if (typeof window.backendaiclient === "undefined" || window.backendaiclient === null) {
      document.addEventListener('backend-ai-connected', () => {
        this.updateSettings();
      }, true);
    } else { // already connected
      this.updateSettings();
    }
    this.indicator = this.shadowRoot.querySelector('#loading-indicator');
    this.notification = window.lablupNotification;
    this._activeTab = "general";
    this.bootstrapDialog = this.shadowRoot.querySelector('#bootstrap-dialog');
    this.clearLogsDialog = this.shadowRoot.querySelector('#clearlogs-dialog');
  }

  async _viewStateChanged(active) {
    const params = store.getState().app.params;
    const tab = params.tab;
    if (tab && tab === 'logs') {
      window.setTimeout(() => {
        const tabEl = this.shadowRoot.querySelector('wl-tab[value="logs"]');
        tabEl.click();
      }, 0);
    } else {
      window.setTimeout(() => {
        const tabEl = this.shadowRoot.querySelector('wl-tab[value="general"]');
        tabEl.click();
      }, 0);
    }
  }

  updateSettings() {
  }

  _fetchBootstrapScript() {
    // Fetch user's bootstrap code.
    return window.backendaiclient.userConfig.get_bootstrap_script().then((resp) => {
      const script =  resp || '';
      this.lastSavedBootstrapScript = script;
      return script;
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  async _saveBootstrapScript() {
    const editor = this.shadowRoot.querySelector('#codemirror-editor');
    const script = editor.getValue();
    if (this.lastSavedBootstrapScript === script) {
      this.notification.text = 'No changes';
      this.notification.show();
      return;
    }
    this.indicator.show();
    window.backendaiclient.userConfig.update_bootstrap_script(script)
      .then(res => {
        this.notification.text = 'Saved bootstrap script';
        this.notification.show();
        this.indicator.hide();
      });
  }

  async _saveBootstrapScriptAndCloseDialog() {
    await this._saveBootstrapScript();
    this._hideBootstrapScriptDialog();
  }

  async _editBootstrapScript() {
    const script = await this._fetchBootstrapScript();
    this.bootstrapDialog.setValue(script);
    this.bootstrapDialog.show();
  }

  _hideBootstrapScriptDialog() {
    this.bootstrapDialog.hide();
  }

  _hideClearLogsDialog() {
    this.clearLogsDialog.hide();
  }

  _removeLogMessage() {
    let currentLogs = localStorage.getItem('backendaiconsole.logs');
    if (currentLogs) {
    localStorage.removeItem('backendaiconsole.logs');
    }
    let event = new CustomEvent("log-message-clear", {});
    document.dispatchEvent(event);
    localStorage.getItem('backendaiconsole.logs');
    this.clearLogsDialog.hide();
    this.notification.text = 'Log Messages have been removed.';
    this.notification.show();
    this.indicator.hide();
  }

  _showClearLogsDialog() {
    this.clearLogsDialog.show();
  }

  _refreshLogs() {
    this.logGrid = JSON.parse(localStorage.getItem('backendaiconsole.logs') || '{}');
    let event = new CustomEvent("log-message-refresh", this.logGrid);
    document.dispatchEvent(event);
  }

  _showTab(tab) {
    let els = this.shadowRoot.querySelectorAll(".tab-content");
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this._activeTab = tab.value;
    if (this._activeTab === 'logs') {
      this._refreshLogs();
    }
    this.shadowRoot.querySelector('#' + tab.value).style.display = 'block';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-usersettings-view": BackendAiUserSettingsView;
  }
}
