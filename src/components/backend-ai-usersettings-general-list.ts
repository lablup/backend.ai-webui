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

import 'weightless/card';
import 'weightless/switch';
import 'weightless/select';
import 'weightless/icon';
import 'weightless/button';

import {default as PainKiller} from "./backend-ai-painkiller";
import './lablup-codemirror';

@customElement("backend-ai-usersettings-general-list")
export default class BackendAiUsersettingsGeneralList extends BackendAIPage {
  public indicator: any;
  public lastSavedBootstrapScript: string = '';

  @property({type: Object}) options = Object();
  @property({type: Object}) bootstrapDialog = Object();
  @property({type: Object}) notification;
  @property({type: Boolean}) beta_feature_panel = false;

  constructor() {
    super();
    this.options = {  // Default option.
      desktop_notification: true,
      compact_sidebar: false,
      preserve_login: false,
      beta_feature: false,
    }
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
          --button-bg-disabled: #cccccc;
          --button-color: var(--paper-teal-100);
          --button-color-hover: var(--paper-teal-100);
          --button-color-disabled: #cccccc;
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

        wl-card {
          margin: 0;
        }

        wl-card wl-card {
          margin: 0;
          padding: 0;
          --card-elevation: 0;
        }

        #bootstrap-dialog {
          --dialog-min-width: calc(100vw - 200px);
          --dialog-max-width: calc(100vw - 200px);
          --dialog-min-height: calc(100vh - 100px);
          --dialog-max-height: calc(100vh - 100px);
        }
      `];
  }

  firstUpdated() {
    this.bootstrapDialog = this.shadowRoot.querySelector('#bootstrap-dialog');
    this.notification = window.lablupNotification;
    this.readUserSettings();
  }

  readUserSettings() {
    this._readUserSettings();
    this.beta_feature_panel = this.options['beta_feature'];
  }

  _readUserSettings() { // Read all user settings.
    for (let i = 0, len = localStorage.length; i < len; ++i) {
      if (localStorage.key(i)!.startsWith('backendaiconsole.usersetting.')) {
        let key = localStorage.key(i)!.replace('backendaiconsole.usersetting.', '');
        this._readUserSetting(key);
      }
    }
  }

  _readUserSetting(name, default_value = true) {
    let value: string | null = localStorage.getItem('backendaiconsole.usersetting.' + name);
    if (value !== null && value != '' && value != '""') {
      if (value === "false") {
        this.options[name] = false;
      } else if (value === "true") {
        this.options[name] = true;
      } else {
        this.options[name] = value;
      }
    } else {
      this.options[name] = default_value;
    }
  }

  _writeUserSetting(name, value) {
    if (value === false) {
      localStorage.setItem('backendaiconsole.usersetting.' + name, "false");
    } else if (value === true) {
      localStorage.setItem('backendaiconsole.usersetting.' + name, "true");
    } else {
      localStorage.setItem('backendaiconsole.usersetting.' + name, value);
    }
    this.options[name] = value;
  }

  toggleDesktopNotification(e) {
    if (e.target.checked === false) {
      this._writeUserSetting('desktop_notification', false);
      this.notification.supportDesktopNotification = false;
    } else {
      this._writeUserSetting('desktop_notification', true);
      this.notification.supportDesktopNotification = true;
    }
  }

  toggleCompactSidebar(e) {
    if (e.target.checked === false) {
      this._writeUserSetting('compact_sidebar', false);
    } else {
      this._writeUserSetting('compact_sidebar', true);
    }
  }

  togglePreserveLogin(e) {
    if (e.target.checked === false) {
      this._writeUserSetting('preserve_login', false);
    } else {
      this._writeUserSetting('preserve_login', true);
    }
  }

  toggleBetaFeature(e) {
    if (e.target.checked === false) {
      this._writeUserSetting('beta_feature', false);
      this.beta_feature_panel = false;
    } else {
      this._writeUserSetting('beta_feature', true);
      this.beta_feature_panel = true;
    }
  }

  _fetchBootstrapScript() {
    // Fetch user's bootstrap code.
    return window.backendaiclient.userConfig.get_bootstrap_script().then((resp) => {
      const script = resp || '';
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
        this.notification.text = 'Bootstrap script updated.';
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

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  render() {
    //languate=HTML
    return html`
      <wl-card elevation="1">
        <h3 class="horizontal center layout">
          <span>Preferences</span>
          <span class="flex"></span>
        </h3>
        <div class="horizontal wrap layout">
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Desktop Notification</div>
              <div class="description">Turn on or off desktop notification. <br />If turned on, Backend.AI uses OS built-in notification system too. Turning off this option does not affect notifications within console.
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="desktop-notification-switch" @change="${(e) => this.toggleDesktopNotification(e)}" ?checked="${this.options['desktop_notification']}"></wl-switch>
            </div>
          </div>
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Use Compact Sidebar by default</div>
              <div class="description">Compact sidebar lets you use more workspace. <br />If this option is turned on, compact sidebar becomes the initial UI at startup.
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="compact-sidebar-switch" @change="${(e) => this.toggleCompactSidebar(e)}" ?checked="${this.options['compact_sidebar']}"></wl-switch>
            </div>
          </div>
          ${window.isElectron ? html`
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Keep Login Session Information while Logout</div>
              <div class="description">Let console app keep current login session information next time.<br />If the option is turned off, login information will be cleared each logout.
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="preserve-login-switch" @change="${(e) => this.togglePreserveLogin(e)}" ?checked="${this.options['preserve_login']}"></wl-switch>
            </div>
          </div>
          ` : html``}
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>Beta features</div>
              <div class="description">Use beta features for GUI.<br />Beta features may be unstable. Some beta features may not be adopted as official feature.
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="beta-feature-switch" @change="${(e) => this.toggleBetaFeature(e)}" ?checked="${this.options['beta_feature']}"></wl-switch>
            </div>
          </div>
        </div>
        ${this.beta_feature_panel ? html`
        <h4 class="horizontal center layout">
          <span>Beta Features</span>
          <span class="flex"></span>
        </h4>
        <div>
          Preparing now. :)
        </div>
        ` : html``}

        <h3 class="horizontal center layout" style="display:none;">
          <span>Shell Environments</span>
          <span class="flex"></span>
        </h3>
        <div class="horizontal wrap layout" style="display:none;">
          <div class="horizontal layout wrap setting-item">
            <wl-button class="fg teal" outlined @click="${this._editBootstrapScript}">
              <wl-icon>edit</wl-icon>
              Edit bootstrap script
            </wl-button>
          </div>
        </div>
        <h3 class="horizontal center layout" style="display:none;">
          <span>Package Installation</span>
          <span class="flex"></span>
        </h3>
        <div class="horizontal wrap layout" style="display:none;">
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
        <div slot="header" style="padding: 0px 20px;">
        <h3 class="horizontal center layout">
          <span>Bootstrap script</span>
          <div class="flex"></div>
          <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
            <wl-icon>close</wl-icon>
          </wl-button>
        </h3>
        </div>
        <div slot="content">
          <lablup-codemirror id="codemirror-editor" mode="shell"></lablup-codemirror>
        </div>
        <div slot="footer">
          <wl-button inverted flat id="discard-code" @click="${() => this._hideBootstrapScriptDialog()}">Cancel</wl-button>
          <wl-button id="save-code" class="button" @click="${() => this._saveBootstrapScript()}">Save</wl-button>
          <wl-button id="save-code-and-close" @click="${() => this._saveBootstrapScriptAndCloseDialog()}">Save and close</wl-button>
        </div>
      </wl-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTageNameMap {
    "backend-ai-general": BackendAiUsersettingsGeneralList;
  }
}
