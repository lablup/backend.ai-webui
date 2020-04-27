/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t, translateUnsafeHTML as _tr, use as setLanguage} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import {BackendAiStyles} from './backend-ai-general-styles';
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
import 'weightless/label';

import '@material/mwc-select';
import '@material/mwc-list/mwc-list-item';

import {default as PainKiller} from "./backend-ai-painkiller";
import './lablup-loading-spinner';
import './lablup-codemirror';

@customElement("backend-ai-usersettings-general-list")
export default class BackendAiUsersettingsGeneralList extends BackendAIPage {
  public spinner: any;
  public lastSavedBootstrapScript: string = '';

  @property({type: Object}) bootstrapDialog = Object();
  @property({type: Object}) userconfigDialog = Object();
  @property({type: Object}) notification;
  @property({type: Array}) supportLanguages = [
    {name: _text("language.OSDefault"), code: "default"},
    {name: _text("language.English"), code: "en"},
    {name: _text("language.Korean"), code: "ko"}
  ];
  @property({type: Boolean}) beta_feature_panel = false;
  @property({type: Boolean}) shell_script_edit = false;
  @property({type: Array}) rcfiles = Array();
  @property({type: String}) rcfile = '';
  @property({type: String}) prevRcfile = '';

  constructor() {
    super();
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
        }

        .setting-desc {
          width: 300px;
        }

        .setting-button {
          width: 35px;
        }

        .setting-select-desc {
          width: 200px;
        }

        .setting-select {
          width: 135px;
        }

        .setting-text-desc {
          width: 260px;
        }

        .setting-text {
          width: 75px;
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

        #bootstrap-dialog, #userconfig-dialog {
          --dialog-min-width: calc(100vw - 200px);
          --dialog-max-width: calc(100vw - 200px);
          --dialog-min-height: calc(100vh - 100px);
          --dialog-max-height: calc(100vh - 100px);
        }

        mwc-select#select-rcfile-type {
          width: 300px;
          padding-right: 10px;
          --mdc-select-fill-color: transparent;
          --mdc-theme-primary: var(--paper-teal-400);
        }

        mwc-list-item {
          height: 30px;
          --mdc-list-item-graphic-margin: 0px;
        }

        wl-icon.warning {
          --icon-size: 16px;
          padding: 0;
          color: red;
        }

        wl-label.warning {
          font-family: Roboto, Noto, sans-serif;
          font-size: 12px;
          --label-color: var(--paper-red-600);
        }
      `];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    // If disconnected
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        if (globalThis.backendaiclient.isAPIVersionCompatibleWith('v4.20191231')) {
          this.shell_script_edit = true;
          this.bootstrapDialog = this.shadowRoot.querySelector('#bootstrap-dialog');
          this.userconfigDialog = this.shadowRoot.querySelector('#userconfig-dialog');
          this.rcfile = '.bashrc';
        }
      });
    } else { // already connected
      if (globalThis.backendaiclient.isAPIVersionCompatibleWith('v4.20191231')) {
        this.shell_script_edit = true;
        this.bootstrapDialog = this.shadowRoot.querySelector('#bootstrap-dialog');
        this.userconfigDialog = this.shadowRoot.querySelector('#userconfig-dialog');
        this.rcfile = '.bashrc';
      }
    }
  }

  toggleDesktopNotification(e) {
    if (e.target.checked === false) {
      globalThis.backendaioptions.set('desktop_notification', false);
      this.notification.supportDesktopNotification = false;
    } else {
      globalThis.backendaioptions.set('desktop_notification', true);
      this.notification.supportDesktopNotification = true;
    }
  }

  toggleCompactSidebar(e) {
    if (e.target.checked === false) {
      globalThis.backendaioptions.set('compact_sidebar', false);
    } else {
      globalThis.backendaioptions.set('compact_sidebar', true);
    }
  }

  togglePreserveLogin(e) {
    if (e.target.checked === false) {
      globalThis.backendaioptions.set('preserve_login', false);
    } else {
      globalThis.backendaioptions.set('preserve_login', true);
    }
  }

  toggleAutomaticUploadCheck(e) {
    if (e.target.checked === false) {
      globalThis.backendaioptions.set('automatic_update_check', false);
    } else {
      globalThis.backendaioptions.set('automatic_update_check', true);
      globalThis.backendaioptions.set('automatic_update_count_trial', 0);
    }
  }

  setUserLanguage(e) {
    if (e.target.selected.value !== globalThis.backendaioptions.get('language')) {
      globalThis.backendaioptions.set('language', e.target.selected.value);
      setLanguage(e.target.selected.value);
    }
  }

  changePreferredSSHPort(e) {
    let value = Number(e.target.value);
    if (value !== globalThis.backendaioptions.get('custom_ssh_port', '')) {
      if (value < 1024 || value > 65534) {
        this.notification.text = _text("usersettings.InvalidPortNumber");
        this.notification.show();
        return;
      } else {
        globalThis.backendaioptions.set('custom_ssh_port', value);
      }
    }
  }

  toggleBetaFeature(e) {
    if (e.target.checked === false) {
      globalThis.backendaioptions.set('beta_feature', false);
      this.beta_feature_panel = false;
    } else {
      globalThis.backendaioptions.set('beta_feature', true);
      this.beta_feature_panel = true;
    }
  }

  _fetchBootstrapScript() {
    // Fetch user's bootstrap code.
    return globalThis.backendaiclient.userConfig.get_bootstrap_script().then((resp) => {
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
    const editor = this.shadowRoot.querySelector('#bootstrap-dialog #bootstrap-editor');
    const script = editor.getValue();
    if (this.lastSavedBootstrapScript === script) {
      this.notification.text = 'No changes';
      this.notification.show();
      return;
    }
    this.spinner.show();
    globalThis.backendaiclient.userConfig.update_bootstrap_script(script)
      .then(res => {
        this.notification.text = 'Bootstrap script updated.';
        this.notification.show();
        this.spinner.hide();
      });
  }

  async _saveBootstrapScriptAndCloseDialog() {
    await this._saveBootstrapScript();
    this._hideBootstrapScriptDialog();
  }

  async _editBootstrapScript() {
    const editor = this.shadowRoot.querySelector('#bootstrap-dialog #bootstrap-editor');
    const script = await this._fetchBootstrapScript();
    editor.setValue(script);
    this.bootstrapDialog.show();
  }

  _hideBootstrapScriptDialog() {
    this.bootstrapDialog.hide();
  }

  async _editUserConfigScript() {
    let editor = this.shadowRoot.querySelector('#userconfig-dialog #usersetting-editor');
    this.rcfiles = await this._fetchUserConfigScript();
    let rcfile_names = Array(".bashrc", ".zshrc");
    rcfile_names.map(filename => {
      let idx = this.rcfiles.findIndex(item => item.path === filename);
      if (idx == -1) {
        this.rcfiles.push({path: filename, data: ""});
        editor.setValue('');
      } else {
        let code = this.rcfiles[idx]['data'];
        editor.setValue(code);
      }
    });
    let idx = this.rcfiles.findIndex(item => item.path === this.rcfile);
    if (idx != -1) {
      let code = this.rcfiles[idx]['data'];
      editor.setValue(code);
    } else {
      editor.setValue('');
    }
    editor.refresh();
  }

  _fetchUserConfigScript() {
    // Fetch user's .zshrc or .bashrc code
    return globalThis.backendaiclient.userConfig.get_dotfile_script().then((resp) => {
      const script = resp || '';
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

  async _saveUserConfigScript(fileName: string = this.rcfile) {
    const editor = this.shadowRoot.querySelector('#userconfig-dialog #usersetting-editor');
    const script = editor.getValue();
    let idx = this.rcfiles.findIndex(item => item.path === fileName);
    let rcfiles = this.shadowRoot.querySelector('#select-rcfile-type');
    if (rcfiles.items.length > 0) {
      let selectedFile = rcfiles.items.find(item => item.value === fileName);
      let idx = rcfiles.items.indexOf(selectedFile);
      rcfiles.select(idx);
    }
    if (idx != -1) { // if recent modified file is in rcfiles
      if (this.rcfiles[idx]['data'] === '') { // if new rcfile
        if (script !== '') {
          // create and save with data and path
          globalThis.backendaiclient.userConfig.create_dotfile_script(
            script, this.rcfiles[idx]['path'])
            .then(res => {
              this.spinner.hide();
              this.notification.text = _text("usersettings.DescScriptCreated");
              this.notification.show();
            }).catch(err => {
            this.spinner.hide();
            console.log(err);
            if (err && err.message) {
              this.notification.text = PainKiller.relieve(err.title);
              this.notification.detail = err.message;
              this.notification.show(true, err);
            }
          });
        } else {
          this.spinner.hide();
          this.notification.text = _text("usersettings.DescNewUserConfigFileCreated");
          this.notification.show();
          return;
        }
      } else { // if rcfile already exists
        if (this.rcfiles[idx]['data'] === script) {
          this.notification.text = 'No changes';
          this.notification.show();
          return;
        } else if (script === '') {
          this.notification.text = _text("usersettings.DescLetUserUpdateScriptWithNonEmptyValue");
          this.notification.show();
          return;
        } else {
          await globalThis.backendaiclient.userConfig.update_dotfile_script(script, this.rcfile)
            .then(res => {
              this.notification.text = _text("usersettings.DescScriptUpdated");
              this.notification.show();
              this.spinner.hide();
            }).catch(err => {
              this.spinner.hide();
              console.log(err);
              if (err && err.message) {
                this.notification.text = PainKiller.relieve(err.title);
                this.notification.detail = err.message;
                this.notification.show(true, err);
              }
            });
        }
      }
    }
    await setTimeout(() => {
      this._editUserConfigScript();
    }, 200);
    this.spinner.show();
  }

  async _saveUserConfigScriptAndCloseDialog() {
    await this._saveUserConfigScript();
    this._hideUserConfigScriptDialog();
  }

  _hideUserConfigScriptDialog() {
    this.userconfigDialog.hide();
  }

  _hideCurrentEditorChangeDialog() {
    this.shadowRoot.querySelector('#change-current-editor-dialog').hide();
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  _updateSelectedRcFileName(fileName: string) {
    let rcfiles = this.shadowRoot.querySelector('#select-rcfile-type');
    let editor = this.shadowRoot.querySelector('#userconfig-dialog #usersetting-editor');
    if (rcfiles.items.length > 0) {
      let selectedFile = rcfiles.items.find(item => item.value === fileName);
      let idx = rcfiles.items.indexOf(selectedFile);
      let code = this.rcfiles[idx]['data'];
      rcfiles.select(idx);
      editor.setValue(code);
    }
  }

  _changeCurrentEditorData() {
    let editor = this.shadowRoot.querySelector('#userconfig-dialog #usersetting-editor');
    let select = this.shadowRoot.querySelector('#select-rcfile-type');
    let idx = this.rcfiles.findIndex(item => item.path === select.value);
    let code = this.rcfiles[idx]['data'];
    editor.setValue(code);
  }

  _toggleRcFileName() {
    let editor = this.shadowRoot.querySelector('#userconfig-dialog #usersetting-editor');
    let select = this.shadowRoot.querySelector('#select-rcfile-type');
    this.prevRcfile = this.rcfile;
    this.rcfile = select.value;
    let idx = this.rcfiles.findIndex(item => item.path === this.prevRcfile);
    let code = this.rcfiles[idx]['data'];
    let editorCode = editor.getValue();
    select.layout();
    if (code !== editorCode) {
      this._launchChangeCurrentEditorDialog();
    } else {
      idx = this.rcfiles.findIndex(item => item.path === this.rcfile);
      code = this.rcfiles[idx]['data'];
      editor.setValue(code);
    }
  }

  _deleteRcFile(path: string) {
    if (path) {
      globalThis.backendaiclient.userConfig.delete_dotfile_script(path).then(res => {
        let message = 'User config script ' + path + 'is deleted.';
        this.notification.text = message;
        this.notification.show();
        this.spinner.hide();
      }).catch(err => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      })
    }
  }

  _deleteRcFileAll() {
    this.rcfiles.map(item => {
      let path = item.path;
      globalThis.backendaiclient.userConfig.delete_dotfile_script(item.path).then(res => {
        let message = 'User config script ' + path + ' is deleted.';
        this.notification.text = message;
        this.notification.show();
        this.spinner.hide();
      }).catch(err => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
    });
  }

  _createRcFile(path: string) {
    if (path) {
      globalThis.backendaiclient.userConfig.create_dotfile_script(path);
    }
  }

  _launchUserConfigDialog() {
    this._editUserConfigScript();
    this.userconfigDialog.show();
  }

  _launchChangeCurrentEditorDialog() {
    this.shadowRoot.querySelector('#change-current-editor-dialog').show();
  }

  _discardCurrentEditorChange() {
    this._updateSelectedRcFileName(this.rcfile);
    this._hideCurrentEditorChangeDialog();
  }

  _saveCurrentEditorChange() {
    this._saveUserConfigScript(this.prevRcfile);
    this._updateSelectedRcFileName(this.rcfile);
    // this._changeCurrentEditorData();
    this._hideCurrentEditorChangeDialog();
  }

  _cancelCurrentEditorChange() {
    this._updateSelectedRcFileName(this.prevRcfile);
    this._hideCurrentEditorChangeDialog();
  }

  render() {
    //languate=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <wl-card elevation="1">
        <h3 class="horizontal center layout">
          <span>${_t("usersettings.Preferences")}</span>
          <span class="flex"></span>
        </h3>
        <div class="horizontal wrap layout">
          <div class="horizontal layout wrap setting-item">
            <div class="vertical start center-justified layout setting-desc">
              <div>${_t("usersettings.DesktopNotification")}</div>
              <div class="description">${_tr("usersettings.DescDesktopNotification")}
              </div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="desktop-notification-switch" @change="${(e) => this.toggleDesktopNotification(e)}" ?checked="${globalThis.backendaioptions.get('desktop_notification')}"></wl-switch>
            </div>
          </div>
          <div class="horizontal layout wrap setting-item">
            <div class="vertical start center-justified layout setting-desc">
              <div>${_t("usersettings.UseCompactSidebar")}</div>
              <div class="description">${_tr("usersettings.DescUseCompactSidebar")}</div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="compact-sidebar-switch" @change="${(e) => this.toggleCompactSidebar(e)}" ?checked="${globalThis.backendaioptions.get('compact_sidebar')}"></wl-switch>
            </div>
          </div>
          <div class="horizontal layout wrap setting-item">
            <div class="vertical start center-justified layout setting-select-desc">
              <div>${_t("usersettings.Language")}</div>
              <div class="description">${_tr("usersettings.DescLanguage")}
              </div>
            </div>
            <div class="vertical center-justified layout setting-select">
              <mwc-select id="ui-language"
                          required
                          @selected="${(e) => this.setUserLanguage(e)}">
              ${this.supportLanguages.map(item => html`
                <mwc-list-item value="${item.code}" ?selected=${globalThis.backendaioptions.get('language') === item.code}>
                  ${item.name}
                </mwc-list-item>`)}
              </mwc-select>
            </div>
          </div>
          ${globalThis.isElectron ? html`
          <div class="horizontal layout wrap setting-item">
            <div class="vertical start center-justified layout setting-desc">
              <div>${_t("usersettings.KeepLoginSessionInformation")}</div>
              <div class="description">${_tr("usersettings.DescKeepLoginSessionInformation")}</div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="preserve-login-switch" @change="${(e) => this.togglePreserveLogin(e)}" ?checked="${globalThis.backendaioptions.get('preserve_login')}"></wl-switch>
            </div>
          </div>
          ` : html``}
          <div class="horizontal layout wrap setting-item">
            <div class="vertical start center-justified layout setting-text-desc">
              <div>${_t("usersettings.PreferredSSHPort")}</div>
              <div class="description">${_tr("usersettings.DescPreferredSSHPort")}</div>
            </div>
            <div class="vertical center-justified layout setting-text">
              <mwc-textfield pattern="[0-9]*" @change="${(e) => this.changePreferredSSHPort(e)}"
                validationMessage="Allows numbers only" auto-validate></mwc-textfield>
            </div>
          </div>
          <div class="horizontal layout wrap setting-item">
            <div class="vertical start center-justified layout setting-desc">
              <div>${_t("usersettings.AutomaticUpdateCheck")}</div>
              <div class="description">${_tr("usersettings.DescAutomaticUpdateCheck")}</div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="automatic-update-check-switch" @change="${(e) => this.toggleAutomaticUploadCheck(e)}" ?checked="${globalThis.backendaioptions.get('automatic_update_check')}"></wl-switch>
            </div>
          </div>
          <div class="horizontal layout wrap setting-item">
            <div class="vertical start center-justified layout setting-desc">
              <div>${_t("usersettings.BetaFeatures")}</div>
              <div class="description">${_tr("usersettings.DescBetaFeatures")}</div>
            </div>
            <div class="vertical center-justified layout setting-button">
              <wl-switch id="beta-feature-switch" @change="${(e) => this.toggleBetaFeature(e)}" ?checked="${globalThis.backendaioptions.get('beta_feature')}"></wl-switch>
            </div>
          </div>
        </div>
        ${this.beta_feature_panel ? html`
        <h4 class="horizontal center layout">
          <span>${_t("usersettings.BetaFeatures")}</span>
          <span class="flex"></span>
        </h4>
        <div>
          ${_t("usersettings.DescNoBetaFeatures")}
        </div>
        ` : html``}
        ${this.shell_script_edit ? html`
        <h3 class="horizontal center layout">
          <span>Shell Environments</span>
          <span class="flex"></span>
        </h3>
        <div class="horizontal wrap layout setting-item">
            <wl-button class="fg teal" outlined @click="${() => this._editBootstrapScript()}" style="margin-right:20px; display:none;">
              <wl-icon>edit</wl-icon>
              ${_t("usersettings.EditBootstrapScript")}
            </wl-button>
            <wl-button class="fg green" outlined @click="${() => this._launchUserConfigDialog()}">
              <wl-icon>edit</wl-icon>
              ${_t("usersettings.EditUserConfigScript")}
            </wl-button>
        </div>
        <h3 class="horizontal center layout" style="display:none;">
          <span>${_t("usersettings.PackageInstallation")}</span>
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
        </div>` : html``}
      </wl-card>
      <wl-dialog id="bootstrap-dialog" fixed backdrop scrollable blockScrolling persistent>
        <div slot="header" style="padding: 0px 20px;">
        <h3 class="horizontal center layout">
          <span>${_t("usersettings.BootstrapScript")}</span>
          <div class="flex"></div>
          <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
            <wl-icon>close</wl-icon>
          </wl-button>
        </h3>
        </div>
        <div slot="content">
          <lablup-codemirror id="bootstrap-editor" mode="shell"></lablup-codemirror>
        </div>
        <div slot="footer">
          <wl-button inverted flat id="discard-code" @click="${() => this._hideBootstrapScriptDialog()}">${_t("button.Cancel")}</wl-button>
          <wl-button id="save-code" class="button" @click="${() => this._saveBootstrapScript()}">${_t("button.Save")}</wl-button>
          <wl-button id="save-code-and-close" @click="${() => this._saveBootstrapScriptAndCloseDialog()}">${_t("button.SaveAndClose")}</wl-button>
        </div>
      </wl-dialog>
      <wl-dialog id="userconfig-dialog" fixed backdrop scrollable blockScrolling persistent>
        <div slot="header" style="padding: 0px 20px;">
          <h3 class="horizontal center layout">
            <span>Edit ${this.rcfile} shell script</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <div class="vertical layout">
            <mwc-select id="select-rcfile-type"
                        label="config file name"
                        required
                        validationMessage="Please select one option."
                        @selected="${() => this._toggleRcFileName()}">
              ${this.rcfiles.map(item => html`
                <mwc-list-item id="${item.path}" value="${item.path}" ?selected=${this.rcfile === item.path}>
                  ${item.path}
                </mwc-list-item>`)}
            </mwc-select>
            <div class="horizontal layout">
              <wl-icon class="warning">warning</wl-icon>
              <wl-label class="warning" for="warning">
               ${_t("dialog.warning.WillBeAppliedToNewSessions")}
              </wl-label>
            </div>
          </div>
        </div>
        <div slot="content">
          <lablup-codemirror id="usersetting-editor" mode="shell"></lablup-codemirror>
        </div>
        <div slot="footer">
          <wl-button inverted flat id="discard-code" @click="${() => this._hideUserConfigScriptDialog()}">${_t("button.Cancel")}</wl-button>
          <wl-button style="margin-left:10px;" id="save-code" class="button" @click="${() => this._saveUserConfigScript()}">${_t("button.Save")}</wl-button>
          <wl-button style="margin-left:10px;" id="save-code-and-close" @click="${() => this._saveUserConfigScriptAndCloseDialog()}">${_t("button.SaveAndClose")}</wl-button>
          <wl-button style="margin-left:10px;" id="delete-all" @click="${() => this._deleteRcFileAll()}" style="display:none;">${_t("button.DeleteAll")}</wl-button>
        </div>
      </wl-dialog>
      <wl-dialog id="change-current-editor-dialog" fixed backdrop scrollable blockScrolling persistent style="border-bottom:none;">
        <div slot="header" style="border-bottom:none;">
          <h3>${_t("usersettings.DialogSaveToSpecificFile", {File: () => this.prevRcfile})}
          </h3>
          <span>${_t("usersettings.DialogNoSaveNoPreserve")}</span>
        </div>
        <div slot="footer" style="border-top:none;">
          <wl-button id="discard-editor-data"
                     style="margin: 0 10px;"
                     @click="${() => this._discardCurrentEditorChange()}">
                     ${_t("button.Discard")}</wl-button>
          <wl-button id="save-editor-data"
                     style="margin: 0 10px;"
                     @click="${() => this._saveCurrentEditorChange()}">
                     ${_t("button.Save")}</wl-button>
          <wl-button inverted flat id="cancel-editor" class="button"
                     style="margin: 0 10px;"
                     @click="${() => this._cancelCurrentEditorChange()}">
                     ${_t("button.Cancel")}</wl-button>
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
