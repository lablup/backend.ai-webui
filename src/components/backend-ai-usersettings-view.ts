/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

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

import {default as PainKiller} from "./backend-ai-painkiller";
import './lablup-codemirror';

@customElement("backend-ai-usersettings-view")
export default class BackendAiUserSettingsView extends BackendAIPage {
  public indicator: any;

  @property({type: Object}) images = Object();
  @property({type: Boolean}) options = Object();

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

        #bootstrap-dialog {
          --dialog-min-width: calc(100vw - 200px);
          --dialog-max-width: calc(100vw - 200px);
          --dialog-min-height: calc(100vh - 100px);
          --dialog-max-height: calc(100vh - 100px);
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <wl-card elevation="1">
        <h3 class="horizontal center layout">
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
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
    }
  }

  updateSettings() {
  }

  _fetchBootstrapScript() {
    // Fetch user's bootstrap code.
    const fields = ['bootstrap_script'];
    return window.backendaiclient.user.list(true, fields).then((response) => {
      return response.users.bootstrap_script || '';
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true);
      }
    });
  }

  async _saveBootstrapScript() {
    // TODO: uncomment when bootstrap_script field is added in the server
    // this.indicator.show();
    // const editor = this.shadowRoot.querySelector('#codemirror-editor');
    // const code = editor.getValue();
    // const input: Object = {bootstrap_script: code};
    // window.backendaiclient.user.modify(window.backendaiclient.email, input)
    //   .then(res => {
    //     if (res.modify_user.ok) {
    //       this.notification.text = 'Saved bootstrap script';
    //     } else {
    //       this.notification.text = `Error: ${res.modify_user.msg}`;
    //     }
    //     this.notification.show();
    //     this.indicator.hide();
    //   })
    this.notification.text = 'Not implemented yet'
    this.notification.show();
  }

  async _saveBootstrapScriptAndCloseDialog() {
    await this._saveBootstrapScript();
    this._hideBootstrapScriptDialog();
  }

  _editBootstrapScript() {
    const editor = this.shadowRoot.querySelector('#codemirror-editor');
    const dialog = this.shadowRoot.querySelector('#bootstrap-dialog');
    // TODO: uncomment when bootstrap_script field is added in the server
    // const script = this._fetchBootstrapScript();
    // editor.setValue(script);
    editor.setValue('');
    dialog.show();
  }


  _hideBootstrapScriptDialog() {
    const dialog = this.shadowRoot.querySelector('#bootstrap-dialog');
    dialog.hide();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-usersettings-view": BackendAiUserSettingsView;
  }
}
