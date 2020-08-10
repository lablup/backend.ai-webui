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

import './backend-ai-dialog';
import '../plastics/mwc/mwc-multi-select';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-textarea/mwc-textarea';

import {default as PainKiller} from "./backend-ai-painkiller";
import './lablup-loading-spinner';
import './lablup-codemirror';

/**
 Backend AI Usersettings General List

 `backend-ai-usersettings-general-list` is list of user settings such as preference, desktop notification, etc.

 Example:

 <backend-ai-usersettings-general-list active="true"></backend-ai-usersettings-general-list>

 @group Backend.AI Console
 @element backend-ai-usersettings-general-list
 */

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
  @property({type: String}) preferredSSHPort = '';
  @property({type: Number}) prevSSHKeypairGenerationMethod = -1;

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

        span[slot="title"] {
          font-weight: bold;
          margin-top: 15px !important;
          margin-bottom: 15px;
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


        .ssh-keypair {
          margin-right:20px;
          width: 445px;
          min-height:100px;
          overflow-y:scroll;
          white-space:pre-wrap;
          word-wrap:break-word;
          font-size:10px;
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

        mwc-multi-select {
          --mdc-select-min-width: 140px;
        }

        mwc-multi-select#select-rcfile-type {
          width: 300px;
          padding-right: 10px;
          --mdc-select-fill-color: transparent;
          --mdc-theme-primary: var(--paper-teal-400);
        }

        mwc-list-item {
          height: 30px;
          --mdc-list-item-graphic-margin: 0px;
        }

        mwc-select#keypair-generation-dropdown {
          width: 420px;
          margin-right: 10px;
          --mdc-theme-primary: var(--paper-indigo-400);
        }

        mwc-textarea {
          --mdc-theme-primary: var(--paper-indigo-400);
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

        wl-button.ssh-keypair {
          margin: 10px;
        }
        
        wl-button.copy {
          --button-font-size: 10px;
          display: inline-block;
          max-width: 15px;
          max-height: 15px;
        }

        wl-button#ssh-keypair-details {
          --button-bg: none;
        }

        wl-icon#ssh-keypair-icon {
          color: var(--paper-indigo-700);
        };

        ::-webkit-scrollbar {
          display:none; 
        }
      `];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    // If disconnected
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.preferredSSHPort = globalThis.backendaioptions.get('custom_ssh_port');
        if (globalThis.backendaiclient.isAPIVersionCompatibleWith('v4.20191231')) {
          this.shell_script_edit = true;
          this.bootstrapDialog = this.shadowRoot.querySelector('#bootstrap-dialog');
          this.userconfigDialog = this.shadowRoot.querySelector('#userconfig-dialog');
          this.rcfile = '.bashrc';
        }
      });
    } else { // already connected
      this.preferredSSHPort = globalThis.backendaioptions.get('custom_ssh_port');
      if (globalThis.backendaiclient.isAPIVersionCompatibleWith('v4.20191231')) {
        this.shell_script_edit = true;
        this.bootstrapDialog = this.shadowRoot.querySelector('#bootstrap-dialog');
        this.userconfigDialog = this.shadowRoot.querySelector('#userconfig-dialog');
        this.rcfile = '.bashrc';
      }
    }
  }

  /**
   * Toggle desktop_notification.
   *
   * @param {Event} e - click the desktop-notification-switch
   * */
  toggleDesktopNotification(e) {
    if (e.target.checked === false) {
      globalThis.backendaioptions.set('desktop_notification', false);
      this.notification.supportDesktopNotification = false;
    } else {
      globalThis.backendaioptions.set('desktop_notification', true);
      this.notification.supportDesktopNotification = true;
    }
  }

  /**
   * Toggle compact_sidebar.
   *
   * @param {Event} e - click the compact-sidebar-switch
   * */
  toggleCompactSidebar(e) {
    if (e.target.checked === false) {
      globalThis.backendaioptions.set('compact_sidebar', false);
    } else {
      globalThis.backendaioptions.set('compact_sidebar', true);
    }
  }

  /**
   * Toggle preserve_login.
   *
   * @param {Event} e - click the preserve-login-switch
   * */
  togglePreserveLogin(e) {
    if (e.target.checked === false) {
      globalThis.backendaioptions.set('preserve_login', false);
    } else {
      globalThis.backendaioptions.set('preserve_login', true);
    }
  }

  /**
   * Toggle automatic_update_check. If automatic_update_check is true, set automatic_update_count_trial to 0.
   *
   * @param {Event} e - click the automatic-update-check-switch
   * */
  toggleAutomaticUploadCheck(e) {
    if (e.target.checked === false) {
      globalThis.backendaioptions.set('automatic_update_check', false);
    } else {
      globalThis.backendaioptions.set('automatic_update_check', true);
      globalThis.backendaioptions.set('automatic_update_count_trial', 0);
    }
  }

  /**
   * Set language.
   *
   * @param {Event} e - select the ui-language item
   * */
  setUserLanguage(e) {
    if (e.target.selected.value !== globalThis.backendaioptions.get('language')) {
      globalThis.backendaioptions.set('language', e.target.selected.value);
      globalThis.backendaioptions.set('current_language', e.target.selected.value);
      setLanguage(e.target.selected.value);
    }
  }

  /**
   * Change custom_ssh_port.
   *
   * @param {Event} e - fill the textfield
   * */
  changePreferredSSHPort(e) {
    const value = Number(e.target.value);
    if (value !== globalThis.backendaioptions.get('custom_ssh_port', '')) {
      if (value === 0 || !value) {
        globalThis.backendaioptions.delete('custom_ssh_port');
      } else if (value < 1024 || value > 65534) {
        this.notification.text = _text("usersettings.InvalidPortNumber");
        this.notification.show();
        return;
      } else {
        globalThis.backendaioptions.set('custom_ssh_port', value);
      }
    }
  }

  /**
   * Toggle beta_feature.
   *
   * @param {Event} e - click the beta-feature-switch
   * */
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

  /**
   * Edit user's .bashrc or .zshrc code.
   * */
  async _editUserConfigScript() {
    const editor = this.shadowRoot.querySelector('#userconfig-dialog #usersetting-editor');
    this.rcfiles = await this._fetchUserConfigScript();
    const rcfileNames = Array('.bashrc', '.zshrc', '.Renviron');
    rcfileNames.map(filename => {
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
    this.spinner.hide();
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

  /**
   * Change current editor code according to select-rcfile-type.
   * */
  _changeCurrentEditorData() {
    let editor = this.shadowRoot.querySelector('#userconfig-dialog #usersetting-editor');
    let select = this.shadowRoot.querySelector('#select-rcfile-type');
    let idx = this.rcfiles.findIndex(item => item.path === select.value);
    let code = this.rcfiles[idx]['data'];
    editor.setValue(code);
  }

  /**
   * Toggle RcFile name according to editor code.
   * */
  _toggleRcFileName() {
    let editor = this.shadowRoot.querySelector('#userconfig-dialog #usersetting-editor');
    let select = this.shadowRoot.querySelector('#select-rcfile-type');
    this.prevRcfile = this.rcfile;
    this.rcfile = select.value;
    let idx = this.rcfiles.findIndex(item => item.path === this.prevRcfile);
    let code = idx > -1 ? this.rcfiles[idx]['data'] : '';
    let editorCode = editor.getValue();
    select.layout();
    if (code !== editorCode) {
      this._launchChangeCurrentEditorDialog();
    } else {
      idx = this.rcfiles.findIndex((item) => item.path === this.rcfile);
      code = this.rcfiles[idx]['data'];
      editor.setValue(code);
    }
  }

  /**
   * Delete user's config script.
   *
   * @param {string} path - path that you want to delete
   * */
  _deleteRcFile(path?: string) {
    if (!path) {
      path = this.rcfile;
    }
    if (path) {
      globalThis.backendaiclient.userConfig.delete_dotfile_script(path).then(res => {
        let message = 'User config script ' + path + 'is deleted.';
        this.notification.text = message;
        this.notification.show();
        this.spinner.hide();
        this._hideUserConfigScriptDialog();
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

  _openSSHKeypairManagementDialog() {
    this.shadowRoot.querySelector('#ssh-keypair-management-dialog').show();
  }

  _openSSHKeypairGenerationDialog() {
    this.shadowRoot.querySelector('#generate-ssh-keypair-dialog').show();
  }

  async _openSSHKeypairRefreshDialog() {
    globalThis.backendaiclient.fetchSSHKeypair().then((resp) => {
      const dialog = this.shadowRoot.querySelector('#ssh-keypair-management-dialog');
      dialog.querySelector('#current-ssh-public-key').value = resp.ssh_public_key;
      dialog.show();
    });
  }

  _openSSHKeypairClearDialog() {
    this.shadowRoot.querySelector('#clear-ssh-keypair-dialog').show();
  }

  _hideSSHKeypairGenerationDialog() {
    this.shadowRoot.querySelector('#generate-ssh-keypair-dialog').hide();
    const updatedSSHPublicKey: string = this.shadowRoot.querySelector('#ssh-public-key').value;
    if (updatedSSHPublicKey !== "") {
      const dialog = this.shadowRoot.querySelector('#ssh-keypair-management-dialog');
      dialog.querySelector('#current-ssh-public-key').value = updatedSSHPublicKey;
    }
  }

  _hideSSHKeypairDialog() {
    this.shadowRoot.querySelector('#ssh-keypair-management-dialog').hide();
  }

  _hideSSHKeypairClearDialog() {
    this.shadowRoot.querySelector('#clear-ssh-keypair-dialog').hide();
  }

  async _refreshSSHKeypair() {
    const p = globalThis.backendaiclient.refreshSSHKeypair();
    p.then((resp) => {
      const sshKeyDialog = this.shadowRoot.querySelector('#generate-ssh-keypair-dialog');
      sshKeyDialog.querySelector('#ssh-public-key').value = resp.ssh_public_key;
      sshKeyDialog.querySelector('#ssh-private-key').value = resp.ssh_private_key;
    });
  }

  _generateSSHKeypair() {
    const generateMethodElement = this.shadowRoot.querySelector('#keypair-generation-dropdown');
    if (generateMethodElement.selected !== null) {
      const generateMethod = generateMethodElement.value;
      switch (generateMethod) {
        case _text("usersettings.Random") : {
          this._refreshSSHKeypair();
          this.shadowRoot.querySelector('#ssh-public-key').readOnly = true;
          this.shadowRoot.querySelector('#ssh-private-key').readOnly = true;
          break;
        }
        case _text("usersettings.Custom") : {
          /**
           * TO DO : Custom SSH Keypair registration should be applied here.
           */
          break;
        }
        default : {
          console.error(_text("usersettings.SSHKeypairGenerationError"));
        }
      }
    } else {
      this.notification.text = _text("usersettings.SSHKeypairGenerationError");
      this.notification.show();
    } 
  }

  _discardCurrentKeypairGenerationMethod() {
    this.shadowRoot.querySelector('#keypair-generation-dropdown').select(this.prevSSHKeypairGenerationMethod);
    this._hideSSHKeypairClearDialog();
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

  _clearSSHKeypairText() {
    this.shadowRoot.querySelector('#ssh-public-key').value = '';
    this.shadowRoot.querySelector('#ssh-private-key').value = '';

    // if alert dialog is opened, then hide.
    if (this.shadowRoot.querySelector('#clear-ssh-keypair-dialog').open) {
      this._hideSSHKeypairClearDialog();
    }
    

  }

  _toggleSSHKeypairInput() {
    const selected: string = this.shadowRoot.querySelector('#keypair-generation-dropdown').value;
    const sshPublicKeyInput = this.shadowRoot.querySelector('#ssh-public-key').value;
    const sshPrivateKeyInput = this.shadowRoot.querySelector('#ssh-private-key').value;
    if (selected !== "") {
      if (sshPublicKeyInput !== "" || sshPrivateKeyInput !== "") {
        this._openSSHKeypairClearDialog();
      } else {
        this._clearSSHKeypairText();
      }
    }
    if (selected === _text("usersettings.Custom")) {
      this.shadowRoot.querySelector('#ssh-public-key').readOnly = false;
      this.shadowRoot.querySelector('#ssh-private-key').readOnly = false;
    } else {
      this.shadowRoot.querySelector('#ssh-public-key').readOnly = true;
      this.shadowRoot.querySelector('#ssh-private-key').readOnly = true;
    }
  }

  _copySSHKey(keyName : string) {
    if (keyName !== "") {
      let copyText: string = this.shadowRoot.querySelector(keyName).value;
      if (copyText.length == 0) {
        this.notification.text = _text("usersettings.SSHKeypairGenerationError");
        this.notification.show();
      }
      else {
        if (navigator.clipboard !== undefined) { // for Chrome, Safari
          navigator.clipboard.writeText(copyText).then( () => {
            this.notification.text = _text("usersettings.SSHKeyClipboardCopy");
            this.notification.show();
          }, (err) => {
            console.error("Could not copy text: ", err);
          });
        } else { // other browsers
          let tmpInputElement = document.createElement("input");
          tmpInputElement.type = "text";
          tmpInputElement.value = copyText;

          document.body.appendChild(tmpInputElement);
          tmpInputElement.select();
          document.execCommand("copy"); // copy operation
          document.body.removeChild(tmpInputElement);
        }
      }
    }
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
              <mwc-multi-select id="ui-language"
                          required
                          @selected="${(e) => this.setUserLanguage(e)}">
              ${this.supportLanguages.map(item => html`
                <mwc-list-item value="${item.code}" ?selected=${globalThis.backendaioptions.get('language') === item.code}>
                  ${item.name}
                </mwc-list-item>`)}
              </mwc-multi-select>
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
          <div class="horizontal layout wrap setting-item">
            <div class="vertical start center-justified layout setting-text-desc">
              <div>${_t("usersettings.PreferredSSHPort")}</div>
              <div class="description">${_tr("usersettings.DescPreferredSSHPort")}</div>
            </div>
            <div class="vertical center-justified layout setting-text">
              <mwc-textfield pattern="[0-9]*" @change="${(e) => this.changePreferredSSHPort(e)}"
                  value="${this.preferredSSHPort}" validationMessage="Allows numbers only" auto-validate></mwc-textfield>
            </div>
          </div>
          ` : html``}
          <div class="horizontal layout wrap setting-item">
            <div class="vertical start center-justified layout setting-desc">
              <div>${_t("usersettings.SSHKeypairManagement")}</div>
              <div class="description">${_tr("usersettings.DescSSHKeypairManagement")}</div>
            </div>
            <wl-button id="ssh-keypair-details" fab inverted flat @click="${this._openSSHKeypairRefreshDialog}">
              <wl-icon id="ssh-keypair-icon">more</wl-icon>
            </wl-button>
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
            <wl-button class="fg teal" outlined @click="${() => this._editBootstrapScript()}" style="margin-right:20px; background: none; display: none;">
              <wl-icon>edit</wl-icon>
              ${_t("usersettings.EditBootstrapScript")}
            </wl-button>
            <wl-button class="fg green" outlined @click="${() => this._launchUserConfigDialog()}" style="background: none;">
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
      <backend-ai-dialog id="bootstrap-dialog" fixed backdrop scrollable blockScrolling persistent>
        <span slot="title">${_t("usersettings.BootstrapScript")}</span>
        <div slot="content">
          <lablup-codemirror id="bootstrap-editor" mode="shell"></lablup-codemirror>
        </div>
        <div slot="footer" class="end-justified layout flex horizontal">
          <wl-button inverted flat id="discard-code" @click="${() => this._hideBootstrapScriptDialog()}">${_t("button.Cancel")}</wl-button>
          <wl-button id="save-code" class="button" @click="${() => this._saveBootstrapScript()}">${_t("button.Save")}</wl-button>
          <wl-button id="save-code-and-close" @click="${() => this._saveBootstrapScriptAndCloseDialog()}">${_t("button.SaveAndClose")}</wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="userconfig-dialog" fixed backdrop scrollable blockScrolling persistent>
        <span slot="title">Edit ${this.rcfile} shell script</span>
        <div slot="action" class="vertical layout">
          <mwc-multi-select id="select-rcfile-type"
                      label="config file name"
                      required
                      validationMessage="Please select one option."
                      @selected="${() => this._toggleRcFileName()}">
            ${this.rcfiles.map(item => html`
              <mwc-list-item id="${item.path}" value="${item.path}" ?selected=${this.rcfile === item.path}>
                ${item.path}
              </mwc-list-item>`)}
          </mwc-multi-select>
          <div class="horizontal layout">
            <wl-icon class="warning">warning</wl-icon>
            <wl-label class="warning" for="warning">
             ${_t("dialog.warning.WillBeAppliedToNewSessions")}
            </wl-label>
          </div>
        </div>
        <div slot="content" style="height:calc(100vh - 300px);background-color:#272823;">
          <lablup-codemirror id="usersetting-editor" mode="shell"></lablup-codemirror>
        </div>
        <div slot="footer" class="end-justified layout flex horizontal">
          <wl-button inverted flat id="discard-code" @click="${() => this._hideUserConfigScriptDialog()}">${_t("button.Cancel")}</wl-button>
          <wl-button style="margin-left:10px;" id="save-code" class="button" @click="${() => this._saveUserConfigScript()}">${_t("button.Save")}</wl-button>
          <wl-button style="margin-left:10px;" id="save-code-and-close" @click="${() => this._saveUserConfigScriptAndCloseDialog()}">${_t("button.SaveAndClose")}</wl-button>
          <wl-button style="margin-left:10px;" id="delete-rcfile" @click="${() => this._deleteRcFile()}" style="display:none;">${_t("button.Delete")}</wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="change-current-editor-dialog" fixed backdrop scrollable blockScrolling persistent style="border-bottom:none;">
        <div slot="title">
          ${_t("usersettings.DialogSaveToSpecificFile", {File: () => this.prevRcfile})}
        </div>
        <div slot="content">
          ${_t("usersettings.DialogNoSaveNoPreserve")}
        </div>
        <div slot="footer" style="border-top:none;" class="end-justified layout flex horizontal">
          <wl-button inverted flat id="cancel-editor" class="button"
                     style="margin: 0 10px;"
                     @click="${() => this._cancelCurrentEditorChange()}">
                     ${_t("button.Cancel")}</wl-button>
          <wl-button id="discard-editor-data"
                     style="margin: 0 10px;"
                     @click="${() => this._discardCurrentEditorChange()}">
                     ${_t("button.Discard")}</wl-button>
          <wl-button id="save-editor-data"
                     style="margin: 0 10px;"
                     @click="${() => this._saveCurrentEditorChange()}">
                     ${_t("button.Save")}</wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="ssh-keypair-management-dialog" fixed backdrop persistent>
        <span slot="title">${_t("usersettings.SSHKeypairManagement")}</span>
          <div slot="content" style="max-width:500px">
            <span slot="title"> ${_t("usersettings.CurrentSSHPublicKey")}</span>
            <mwc-textarea class="ssh-keypair" id="current-ssh-public-key" outlined readonly></mwc-textarea>
            <wl-button class="copy" @click="${() => this._copySSHKey("#current-ssh-public-key")}">
              <wl-icon>content_copy</wl-icon>
            </wl-button>
          </div>
          <div slot="footer">
            <wl-button class="cancel" inverted flat @click="${this._hideSSHKeypairDialog}">${_t("button.Cancel")}</wl-button>
            <wl-button class="ok" @click="${this._openSSHKeypairGenerationDialog}">${_t("button.Generate")}</wl-button>
          </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="generate-ssh-keypair-dialog" fixed persistent>
        <span slot="title">${_t("usersettings.SSHKeypairGeneration")}</span>
        <div slot="content" style="max-width:500px;">
        <div class="vertical layout">
          <div class="horizontal layout">
            <mwc-select id="keypair-generation-dropdown" outlined required label="${_t("usersettings.SelectSSHKeypairGenerationMethod")}" @opened=${(e) => {this.prevSSHKeypairGenerationMethod = e.target.index;}} @selected=${this._toggleSSHKeypairInput}>
              <mwc-list-item id="random-keypair-generation" value="${_t("usersettings.Random")}">${_t("usersettings.Random")}</mwc-list-item>
              <mwc-list-item id="custom-keypair-generation" value="${_t("usersettings.Custom")}">${_t("usersettings.Custom")}</mwc-list-item>
            </mwc-select>
            <wl-button @click="${this._generateSSHKeypair}" style="max-height:20px;">${_t("button.Generate")}</wl-button>
          </div>
          <span slot="title">${_t("usersettings.PublicKey")}</span>
            <div class="horizontal layout flex">
                <mwc-textarea class="ssh-keypair" id="ssh-public-key" outlined></mwc-textarea>
              <wl-button class="copy" @click="${() => this._copySSHKey("#ssh-public-key")}">
                <wl-icon>content_copy</wl-icon>
              </wl-button>
            </div>
            <span slot="title">${_t("usersettings.PrivateKey")}</span>
            <div class="horizontal layout flex">
                <mwc-textarea class="ssh-keypair" id="ssh-private-key" outlined></mwc-textarea>
                <wl-button class="copy" @click="${() => this._copySSHKey("#ssh-private-key")}">
                <wl-icon>content_copy</wl-icon>
              </wl-button>
            </div>
            <div style="color:crimson">${_t("usersettings.SSHKeypairGenerationWarning")}</div>
          </div>
        </div>
        <div slot="footer">
          <wl-button class="ok" @click="${this._hideSSHKeypairGenerationDialog}">${_t("button.Close")}</wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="clear-ssh-keypair-dialog" fixed persistent>
        <span slot="title">${_t("usersettings.ClearSSHKeypairInput")}</span>
        <div slot="footer">
            <wl-button class="cancel" inverted flat @click="${this._discardCurrentKeypairGenerationMethod}">${_t("button.Cancel")}</wl-button>
            <wl-button class="ok" @click="${this._clearSSHKeypairText}">${_t("button.Okay")}</wl-button>
          </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTageNameMap {
    "backend-ai-general": BackendAiUsersettingsGeneralList;
  }
}
