/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t, translateUnsafeHTML as _tr, use as setLanguage} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

import 'weightless/switch';
import 'weightless/select';
import 'weightless/icon';
import 'weightless/button';
import 'weightless/label';

import '@material/mwc-icon-button';
import '@material/mwc-switch/mwc-switch';
import '@material/mwc-select/mwc-select';
import '@material/mwc-textarea/mwc-textarea';

import {default as PainKiller} from './backend-ai-painkiller';
import './lablup-loading-spinner';
import './lablup-codemirror';
import './backend-ai-dialog';

/**
 Backend AI Usersettings General List

 `backend-ai-usersettings-general-list` is list of user settings such as preference, desktop notification, etc.

 Example:

 <backend-ai-usersettings-general-list active="true"></backend-ai-usersettings-general-list>

@group Backend.AI Web UI
 @element backend-ai-usersettings-general-list
 */

@customElement('backend-ai-usersettings-general-list')
export default class BackendAiUsersettingsGeneralList extends BackendAIPage {
  public spinner: any;
  public lastSavedBootstrapScript = '';

  @property({type: Object}) bootstrapDialog = Object();
  @property({type: Object}) userconfigDialog = Object();
  @property({type: Object}) notification;
  @property({type: Array}) supportLanguages = [
    {name: _t('language.OSDefault'), code: 'default'},
    {name: _t('language.English'), code: 'en'},
    {name: _t('language.Korean'), code: 'ko'},
    {name: _t('language.Russian'), code: 'ru'},
    {name: _t('language.French'), code: 'fr'},
    {name: _t('language.Mongolian'), code: 'mn'},
    {name: _t('language.Indonesian'), code: 'id'}
  ];
  @property({type: Boolean}) beta_feature_panel = false;
  @property({type: Boolean}) shell_script_edit = false;
  @property({type: Array}) rcfiles;
  @property({type: String}) rcfile = '';
  @property({type: String}) prevRcfile = '';
  @property({type: String}) preferredSSHPort = '';
  @property({type: String}) publicSSHkey = '';

  constructor() {
    super();
    this.rcfiles = [];
  }

  static get styles(): CSSResultGroup | undefined {
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
          display: inline-block;
        }

        div.title {
          font-size: 14px;
          font-weight: bold;
        }

        div.description,
        span.description {
          font-size: 13px;
          margin-top: 5px;
          margin-right: 5px;
        }

        .setting-item {
          margin: 15px 10px;
          width: 360px;
        }

        .setting-desc {
          width: 300px;
        }

        .setting-button {
          width: 35px;
        }

        .setting-select-desc {
          width: auto;
          margin-right: 5px;
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
          margin-right: 10px;
          width: 450px;
          min-height: 100px;
          overflow-y: scroll;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-size: 10px;
          scrollbar-width: none; /* firefox */
        }

        #bootstrap-dialog wl-button {
          margin-left: 5px;
        }

        #bootstrap-dialog, #userconfig-dialog {
          --component-width: calc(100vw - 200px);
          --component-height: calc(100vh - 100px);
          --component-min-width: calc(100vw - 200px);
          --component-max-width: calc(100vw - 200px);
          --component-min-height: calc(100vh - 100px);
          --component-max-height: calc(100vh - 100px);
        }

        .terminal-area {
          height:calc(100vh - 300px);
        }

        mwc-select {
          width: 140px;
          font-family: var(--general-font-family);
          --mdc-typography-subtitle1-font-family: var(--general-font-family);
          --mdc-typography-subtitle1-font-size: 11px;
          --mdc-theme-primary: var(--general-sidebar-color);
          --mdc-select-fill-color: transparent;
          --mdc-select-label-ink-color: rgba(0, 0, 0, 0.75);
          --mdc-select-focused-dropdown-icon-color: var(--general-sidebar-color);
          --mdc-select-disabled-dropdown-icon-color: var(--general-sidebar-color);
          --mdc-select-idle-line-color: rgba(0, 0, 0, 0.42);
          --mdc-select-hover-line-color: var(--general-sidebar-color);
          --mdc-select-outlined-idle-border-color: var(--general-sidebar-color);
          --mdc-select-outlined-hover-border-color: var(--general-sidebar-color);
          --mdc-theme-surface: white;
          --mdc-list-vertical-padding: 5px;
          --mdc-list-side-padding: 25px;
        }

        mwc-select#select-rcfile-type {
          width: 300px;
          margin-bottom: 10px;
        }

        mwc-textarea {
          --mdc-theme-primary: var(--general-sidebar-color);
        }

        mwc-icon-button {
          color: #27824F;
        }

        mwc-button[outlined] {
          background-image: none;
          --mdc-button-outline-width: 2px;
          --mdc-button-disabled-outline-color: var(--general-button-background-color);
          --mdc-button-disabled-ink-color: var(--general-button-background-color);
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-on-theme-primary: var(--general-button-background-color);
        }

        mwc-button {
          margin: auto 10px;
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-on-theme-primary: var(--general-button-background-color);
        }

        mwc-button[unelevated] {
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-on-theme-primary: var(--general-button-background-color);
        }

        mwc-button.shell-button {
          margin: 5px;
          width: 260px;
        }

        wl-icon.warning {
          --icon-size: 16px;
          padding: 0;
          color: red;
        }

        wl-label.warning {
          font-family: var(--general-font-family);
          font-size: 12px;
          --label-color: var(--paper-red-600);
        }

        wl-button.ssh-keypair {
          display: inline-block;
          margin: 10px;
        }

        wl-button.copy {
          --button-font-size: 10px;
          display: inline-block;
          max-width: 15px !important;
          max-height: 15px !important;
        }

        wl-button#ssh-keypair-details {
          --button-bg: none;
        }

        wl-icon#ssh-keypair-icon {
          color: var(--paper-indigo-700);
        }

        ::-webkit-scrollbar {
          display: none; /* Chrome and Safari */
        }

        @media screen and (max-width: 500px) {
          #bootstrap-dialog, #userconfig-dialog {
            --component-min-width: 300px;
          }

          mwc-select#select-rcfile-type {
            width: 250px;
          }

          .setting-desc {
            width: 200px;
          }

          #language-setting {
            width: 150px;
          }
        }
      `];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    // this.beta_feature_panel = !this.shadowRoot.querySelector('#beta-feature-switch').disabled;
  }

  /**
   * Check the admin and set the keypair grid when backend.ai client connected.
   *
   * @param {Booelan} active - The component will work if active is true.
   */
  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.preferredSSHPort = globalThis.backendaioptions.get('custom_ssh_port');
      });
      if (globalThis.backendaiclient.isAPIVersionCompatibleWith('v4.20191231')) {
        this.shell_script_edit = true;
        this.bootstrapDialog = this.shadowRoot.querySelector('#bootstrap-dialog');
        this.userconfigDialog = this.shadowRoot.querySelector('#userconfig-dialog');
        this.rcfile = '.bashrc';
      }
    } else { // already connected
      this.preferredSSHPort = globalThis.backendaioptions.get('custom_ssh_port');
      if (globalThis.backendaiclient.isAPIVersionCompatibleWith('v4.20191231')) {
        this.shell_script_edit = true;
        this.bootstrapDialog = this.shadowRoot.querySelector('#bootstrap-dialog');
        this.userconfigDialog = this.shadowRoot.querySelector('#userconfig-dialog');
        this.rcfile = '.bashrc';
      }
    }
    this.userconfigDialog.addEventListener('dialog-closing-confirm', () => {
      const editor = this.shadowRoot.querySelector('#usersetting-editor');
      const script = editor.getValue();
      const idx = this.rcfiles.findIndex((item: any) => item.path === this.rcfile);
      if (this.rcfiles[idx]['data'] !== script) {
        this.prevRcfile = this.rcfile; // update prevRcfile to current file
        this._launchChangeCurrentEditorDialog();
      } else {
        this.userconfigDialog.closeWithConfirmation = false;
        this.userconfigDialog.hide();
      }
    });
  }

  /**
   * Toggle desktop_notification.
   *
   * @param {Event} e - click the desktop-notification-switch
   * */
  toggleDesktopNotification(e) {
    if (e.target.selected === false) {
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
    if (e.target.selected === false) {
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
    if (e.target.selected === false) {
      globalThis.backendaioptions.set('preserve_login', false);
    } else {
      globalThis.backendaioptions.set('preserve_login', true);
    }
  }

  /**
   * Toggle auto logout.
   *
   * @param {Event} e  - click the auto-logout-switch
   */
  toggleAutoLogout(e) {
    if (e.target.selected === false) {
      globalThis.backendaioptions.set('auto_logout', false);
      const event = new CustomEvent('backend-ai-auto-logout', {detail: false});
      document.dispatchEvent(event);
    } else {
      globalThis.backendaioptions.set('auto_logout', true);
      const event = new CustomEvent('backend-ai-auto-logout', {detail: true});
      document.dispatchEvent(event);
    }
  }

  /**
   * Toggle automatic_update_check. If automatic_update_check is true, set automatic_update_count_trial to 0.
   *
   * @param {Event} e - click the automatic-update-check-switch
   * */
  toggleAutomaticUploadCheck(e) {
    if (e.target.selected === false) {
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
      let lang = e.target.selected.value;
      if (lang === 'default') {
        lang = globalThis.navigator.language.split('-')[0];
      }
      globalThis.backendaioptions.set('language', e.target.selected.value);
      globalThis.backendaioptions.set('current_language', lang);
      setLanguage(lang);
      setTimeout(() => {
        const langEl = this.shadowRoot.querySelector('#ui-language');
        langEl.selectedText = langEl.selected.textContent.trim();
      }, 100);
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
        this.notification.text = _text('usersettings.InvalidPortNumber');
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
    if (e.target.selected === false) {
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
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  async _saveBootstrapScript() {
    const editor = this.shadowRoot.querySelector('#bootstrap-editor');
    const script = editor.getValue();
    if (this.lastSavedBootstrapScript === script) {
      this.notification.text = _text('resourceGroup.NochangesMade');
      this.notification.show();
      return;
    }
    this.spinner.show();
    globalThis.backendaiclient.userConfig.update_bootstrap_script(script)
      .then((res) => {
        this.notification.text = _text('usersettings.BootstrapScriptUpdated');
        this.notification.show();
        this.spinner.hide();
      });
  }

  async _saveBootstrapScriptAndCloseDialog() {
    await this._saveBootstrapScript();
    this._hideBootstrapScriptDialog();
  }

  async _launchBootstrapScriptDialog() {
    const editor = this.shadowRoot.querySelector('#bootstrap-editor');
    const script = await this._fetchBootstrapScript();
    editor.setValue(script);
    editor.focus();
    this.bootstrapDialog.show();
  }

  _hideBootstrapScriptDialog() {
    this.bootstrapDialog.hide();
  }

  /**
   * Edit user's .bashrc or .zshrc code.
   * */
  async _editUserConfigScript() {
    const editor = this.shadowRoot.querySelector('#usersetting-editor');
    this.rcfiles = await this._fetchUserConfigScript();
    const rcfileNames = ['.bashrc', '.zshrc', '.tmux.conf.local', '.vimrc', '.Renviron'];
    rcfileNames.map((filename) => {
      const idx = this.rcfiles.findIndex((item: any) => item.path === filename);
      if (idx === -1 ) {
        this.rcfiles.push({path: filename, data: ''});
        editor.setValue('');
      } else {
        const code = this.rcfiles[idx]['data'];
        editor.setValue(code);
      }
    });

    // instead of changing .tmux.conf, allow user to change .tmux.conf.local
    const ignoredRcFilename = ['.tmux.conf'];

    // remove ignored rcfilenames from fetched results
    ignoredRcFilename.forEach((filename) => {
      const idx = this.rcfiles.findIndex((item: any) => item.path === filename);
      if (idx > -1) {
        this.rcfiles.splice(idx, 1);
      }
    });

    const idx = this.rcfiles.findIndex((item: any) => item.path === this.rcfile);
    if (idx != -1) {
      const code = this.rcfiles[idx]['data'];
      editor.setValue(code);
    } else {
      editor.setValue('');
    }
    editor.focus();
    this.spinner.hide();
    this._toggleDeleteButton();
  }

  _fetchUserConfigScript() {
    // Fetch user's .zshrc or .bashrc code
    return globalThis.backendaiclient.userConfig.get().then((resp) => {
      const script = resp || '';
      return script;
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  async _saveUserConfigScript(fileName: string = this.rcfile) {
    const editor = this.shadowRoot.querySelector('#usersetting-editor');
    const script = editor.getValue();
    const idx = this.rcfiles.findIndex((item: any) => item.path === fileName);
    const rcfiles = this.shadowRoot.querySelector('#select-rcfile-type');
    if (rcfiles.items.length > 0) {
      const selectedFile = rcfiles.items.find((item) => item.value === fileName);
      const idx = rcfiles.items.indexOf(selectedFile);
      rcfiles.select(idx);
    }
    if (idx != -1) { // if recent modified file is in rcfiles
      if (this.rcfiles[idx]['data'] === '') { // if new rcfile
        if (script !== '') {
          // create and save with data and path
          globalThis.backendaiclient.userConfig.create(
            script, this.rcfiles[idx]['path'])
            .then((res) => {
              this.spinner.hide();
              this.notification.text = _text('usersettings.DescScriptCreated');
              this.notification.show();
            }).catch((err) => {
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
          this.notification.text = _text('usersettings.DescNewUserConfigFileCreated');
          this.notification.show();
          return;
        }
      } else { // if rcfile already exists
        if (this.rcfiles[idx]['data'] === script) {
          this.notification.text = _text('resourceGroup.NochangesMade');
          this.notification.show();
          return;
        } else if (script === '') {
          this.notification.text = _text('usersettings.DescLetUserUpdateScriptWithNonEmptyValue');
          this.notification.show();
          return;
        } else {
          await globalThis.backendaiclient.userConfig.update(script, fileName)
            .then((res) => {
              this.notification.text = _text('usersettings.DescScriptUpdated');
              this.notification.show();
              this.spinner.hide();
            }).catch((err) => {
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
    const rcfiles = this.shadowRoot.querySelector('#select-rcfile-type');
    const editor = this.shadowRoot.querySelector('#userconfig-dialog #usersetting-editor');
    if (rcfiles.items.length > 0) {
      const selectedFile = rcfiles.items.find((item) => item.value === fileName);
      const idx = rcfiles.items.indexOf(selectedFile);
      const code = this.rcfiles[idx]['data'];
      rcfiles.select(idx);
      editor.setValue(code);
    }
  }

  /**
   * Change current editor code according to select-rcfile-type.
   * */
  _changeCurrentEditorData() {
    const editor = this.shadowRoot.querySelector('#userconfig-dialog #usersetting-editor');
    const select = this.shadowRoot.querySelector('#select-rcfile-type');
    const idx = this.rcfiles.findIndex((item: any) => item.path === select.value);
    const code = this.rcfiles[idx]['data'];
    editor.setValue(code);
  }

  /**
   * Toggle RcFile name according to editor code.
   * */
  _toggleRcFileName() {
    const editor = this.shadowRoot.querySelector('#userconfig-dialog #usersetting-editor');
    const select = this.shadowRoot.querySelector('#select-rcfile-type');
    this.prevRcfile = this.rcfile;
    this.rcfile = select.value;
    let idx = this.rcfiles.findIndex((item: any) => item.path === this.prevRcfile);
    let code = idx > -1 ? this.rcfiles[idx]['data'] : '';
    const editorCode = editor.getValue();
    select.layout();
    this._toggleDeleteButton();
    if (code !== editorCode) {
      this._launchChangeCurrentEditorDialog();
    } else {
      idx = this.rcfiles.findIndex((item: any) => item.path === this.rcfile);
      code = this.rcfiles[idx]?.data ? this.rcfiles[idx]['data'] : '';
      editor.setValue(code);
    }
  }

  /**
   * Toggle delete button disabled when rcfile exists
   */
  _toggleDeleteButton() {
    const deleteBtn = this.shadowRoot.querySelector('#delete-rcfile');
    const idx = this.rcfiles.findIndex((item: any) => item.path === this.rcfile);
    if (idx > -1) {
      deleteBtn.disabled = !(this.rcfiles[idx]?.data && this.rcfiles[idx]?.permission);
    }
  }

  /**
   * Delete user's config script.
   *
   * @param {string} path - path that you want to delete
   * */
  async _deleteRcFile(path?: string) {
    if (!path) {
      path = this.rcfile;
    }
    if (path) {
      globalThis.backendaiclient.userConfig.delete(path).then((res) => {
        const message = _text('usersettings.DescScriptDeleted') + path;
        this.notification.text = message;
        this.notification.show();
        this.spinner.hide();
        this._hideUserConfigScriptDialog();
      }).catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
    }
    await setTimeout(() => {
      this._editUserConfigScript();
    }, 200);
  }

  /**
   * Delete all of created user's config script.
   */
  async _deleteRcFileAll() {
    const createdRcfiles = this.rcfiles.filter((item: any) => item.permission !== '' && item.data !== '');
    const rcfileDeletionQueue = createdRcfiles.map((item: any) => {
      const path = item.path;
      return globalThis.backendaiclient.userConfig.delete(path);
    });
    Promise.all(rcfileDeletionQueue).then( (response) => {
      const message = _text('usersettings.DescScriptAllDeleted');
      this.notification.text = message;
      this.notification.show();
      this.spinner.hide();
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
    await setTimeout(() => {
      this._editUserConfigScript();
    }, 200);
  }

  _createRcFile(path: string) {
    if (path) {
      globalThis.backendaiclient.userConfig.create(path);
    }
  }

  async _launchUserConfigDialog() {
    await this._editUserConfigScript();
    this.userconfigDialog.closeWithConfirmation = true;
    this.userconfigDialog.show();
  }

  _launchChangeCurrentEditorDialog() {
    this.shadowRoot.querySelector('#change-current-editor-dialog').show();
  }

  _openSSHKeypairManagementDialog() {
    this.shadowRoot.querySelector('#ssh-keypair-management-dialog').show();
  }

  /**
   * Fetch Existing Public key from Server.
   * */
  async _openSSHKeypairRefreshDialog() {
    globalThis.backendaiclient.fetchSSHKeypair().then((resp) => {
      const dialog = this.shadowRoot.querySelector('#ssh-keypair-management-dialog');
      const publicKeyEl = dialog.querySelector('#current-ssh-public-key');
      const publicKeyCopyBtn = dialog.querySelector('#copy-current-ssh-public-key-button');
      publicKeyEl.value = resp.ssh_public_key ? resp.ssh_public_key : '';

      // disable textarea and copy button when the user has never generated SSH Keypair.
      publicKeyEl.disabled = publicKeyEl.value === '' ? true : false;
      publicKeyCopyBtn.disabled = publicKeyEl.disabled;

      // show information text for SSH generation if the user has never generated SSH Keypair.
      this.publicSSHkey = publicKeyEl.value ? publicKeyEl.value : _text('usersettings.NoExistingSSHKeypair');

      dialog.show();
    });
  }
  _openSSHKeypairClearDialog() {
    this.shadowRoot.querySelector('#clear-ssh-keypair-dialog').show();
  }

  _hideSSHKeypairGenerationDialog() {
    this.shadowRoot.querySelector('#generate-ssh-keypair-dialog').hide();
    const updatedSSHPublicKey: string = this.shadowRoot.querySelector('#ssh-public-key').value;
    if (updatedSSHPublicKey !== '') {
      const dialog = this.shadowRoot.querySelector('#ssh-keypair-management-dialog');
      dialog.querySelector('#current-ssh-public-key').value = updatedSSHPublicKey;
      dialog.querySelector('#copy-current-ssh-public-key-button').disabled = false;
    }
  }

  _hideSSHKeypairDialog() {
    this.shadowRoot.querySelector('#ssh-keypair-management-dialog').hide();
  }

  _hideSSHKeypairClearDialog() {
    this.shadowRoot.querySelector('#clear-ssh-keypair-dialog').hide();
  }

  /**
   * Fetch Randomly refreshed keypair generated from server.
   * */
  async _refreshSSHKeypair() {
    const p = globalThis.backendaiclient.refreshSSHKeypair();
    p.then((resp) => {
      const sshKeyDialog = this.shadowRoot.querySelector('#generate-ssh-keypair-dialog');
      sshKeyDialog.querySelector('#ssh-public-key').value = resp.ssh_public_key;
      sshKeyDialog.querySelector('#ssh-private-key').value = resp.ssh_private_key;
      sshKeyDialog.show();
    });
  }

  _clearCurrentSSHKeypair() {
    this._hideSSHKeypairClearDialog();
    this._hideSSHKeypairGenerationDialog();
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
    // this._cacheUserConfigScript(this.prevRcfile);
    this._updateSelectedRcFileName(this.prevRcfile);
    this._hideCurrentEditorChangeDialog();
  }

  /**
   * Copy SSH Keypair to clipboard
   *
   * @param {string} keyName - identify ssh-public-key or ssh-private-key
   * */
  _copySSHKey(keyName : string) {
    if (keyName !== '') {
      const copyText: string = this.shadowRoot.querySelector(keyName).value;
      if (copyText.length == 0) {
        this.notification.text = _text('usersettings.NoExistingSSHKeypair');
        this.notification.show();
      } else {
        if (navigator.clipboard !== undefined) { // for Chrome, Safari
          navigator.clipboard.writeText(copyText).then( () => {
            this.notification.text = _text('usersettings.SSHKeyClipboardCopy');
            this.notification.show();
          }, (err) => {
            console.error('Could not copy text: ', err);
          });
        } else { // other browsers
          const tmpInputElement = document.createElement('input');
          tmpInputElement.type = 'text';
          tmpInputElement.value = copyText;

          document.body.appendChild(tmpInputElement);
          tmpInputElement.select();
          document.execCommand('copy'); // copy operation
          document.body.removeChild(tmpInputElement);
        }
      }
    }
  }

  render() {
    // languate=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <h3 class="horizontal center layout">
        <span>${_t('usersettings.Preferences')}</span>
        <span class="flex"></span>
      </h3>
      <div class="horizontal wrap layout">
        <div class="horizontal layout wrap setting-item">
          <div class="vertical start start-justified layout setting-desc">
            <div class="title">${_t('usersettings.DesktopNotification')}</div>
            <div class="description">${_tr('usersettings.DescDesktopNotification')}
            </div>
          </div>
          <div class="vertical center-justified layout setting-button flex end">
            <mwc-switch id="desktop-notification-switch" @click="${(e) => this.toggleDesktopNotification(e)}" ?selected="${globalThis.backendaioptions.get('desktop_notification')}"></mwc-switch>
          </div>
        </div>
        <div class="horizontal layout wrap setting-item">
          <div class="vertical start start-justified layout setting-desc">
            <div class="title">${_t('usersettings.UseCompactSidebar')}</div>
            <div class="description">${_tr('usersettings.DescUseCompactSidebar')}</div>
          </div>
          <div class="vertical center-justified layout setting-button flex end">
            <mwc-switch id="compact-sidebar-switch" @click="${(e) => this.toggleCompactSidebar(e)}" ?selected="${globalThis.backendaioptions.get('compact_sidebar')}"></mwc-switch>
          </div>
        </div>
        <div class="horizontal layout wrap setting-item">
          <div class="vertical start start-justified layout setting-select-desc" id="language-setting">
            <div class="title">${_t('usersettings.Language')}</div>
            <div class="description">${_tr('usersettings.DescLanguage')}
            </div>
          </div>
          <div class="vertical center-justified layout setting-select flex end">
            <mwc-select id="ui-language"
                        required
                        outlined
                        @selected="${(e) => this.setUserLanguage(e)}">
            ${this.supportLanguages.map((item) => html`
              <mwc-list-item value="${item.code}" ?selected=${globalThis.backendaioptions.get('language') === item.code}>
                ${item.name}
              </mwc-list-item>
            `)}
            </mwc-select>
          </div>
        </div>
        ${globalThis.isElectron ? html`
          <div class="horizontal layout wrap setting-item">
            <div class="vertical start start-justified layout setting-desc">
              <div class="title">${_t('usersettings.KeepLoginSessionInformation')}</div>
              <div class="description">${_tr('usersettings.DescKeepLoginSessionInformation')}</div>
            </div>
            <div class="vertical center-justified layout setting-button flex end">
              <mwc-switch id="preserve-login-switch" @click="${(e) => this.togglePreserveLogin(e)}" ?selected="${globalThis.backendaioptions.get('preserve_login')}"></mwc-switch>
            </div>
          </div>
          <div class="horizontal layout wrap setting-item">
            <div class="vertical start start-justified layout setting-text-desc">
              <div class="title">${_t('usersettings.PreferredSSHPort')}</div>
              <div class="description">${_tr('usersettings.DescPreferredSSHPort')}</div>
            </div>
            <div class="vertical center-justified layout setting-text">
              <mwc-textfield pattern="[0-9]*" @change="${(e) => this.changePreferredSSHPort(e)}"
                  value="${this.preferredSSHPort}" validationMessage="${_t('credential.validation.NumbersOnly')}" auto-validate maxLength="5"></mwc-textfield>
            </div>
          </div>
        ` : html``}
        <div class="horizontal layout wrap setting-item">
          <div class="vertical start start-justified layout setting-desc">
            <div class="title">${_t('usersettings.SSHKeypairManagement')}</div>
            <div class="description">${_tr('usersettings.DescSSHKeypairManagement')}</div>
          </div>
          <div class="vertical center-justified layout flex end">
            <mwc-icon-button
                id="ssh-keypair-details"
                icon="more"
                @click="${this._openSSHKeypairRefreshDialog}">
            </mwc-icon-button>
          </div>
        </div>
        <div class="horizontal layout wrap setting-item">
          <div class="vertical start start-justified layout setting-desc">
            <div class="title">${_t('usersettings.AutomaticUpdateCheck')}</div>
            <div class="description">${_tr('usersettings.DescAutomaticUpdateCheck')}</div>
          </div>
          <div class="vertical center-justified layout setting-button flex end">
            <mwc-switch id="automatic-update-check-switch" @click="${(e) => this.toggleAutomaticUploadCheck(e)}" ?selected="${globalThis.backendaioptions.get('automatic_update_check')}"></mwc-switch>
          </div>
        </div>
        <div class="horizontal layout wrap setting-item" style="display:none;">
          <div class="vertical start start-justified layout setting-desc">
            <div class="title">${_t('usersettings.BetaFeatures')}</div>
            <div class="description">${_tr('usersettings.DescBetaFeatures')}</div>
          </div>
          <div class="vertical center-justified layout setting-button flex end">
            <mwc-switch id="beta-feature-switch" @click="${(e) => this.toggleBetaFeature(e)}" ?selected="${globalThis.backendaioptions.get('beta_feature')}"></mwc-switch>
          </div>
        </div>
        <div class="horizontal layout wrap setting-item">
          <div class="vertical start start-justified layout setting-desc">
            <div class="title">${_t('usersettings.AutoLogout')}</div>
            <div class="description">${_tr('usersettings.DescAutoLogout')}
            </div>
          </div>
          <div class="vertical center-justified layout setting-button flex end">
            <mwc-switch id="auto-logout-switch" @click="${(e) => this.toggleAutoLogout(e)}"
                        ?selected="${globalThis.backendaioptions.get('auto_logout', false)}"></mwc-switch>
          </div>
        </div>
        ${this.beta_feature_panel ? html`
          <h3 class="horizontal center layout">
            <span>${_t('usersettings.BetaFeatures')}</span>
            <span class="flex"></span>
          </h3>
          <div class="description">
            ${_t('usersettings.DescNoBetaFeatures')}
          </div>
        ` : html``}
      </div>
      ${this.shell_script_edit ? html`
        <h3 class="horizontal center layout">
            <span>${_t('usersettings.ShellEnvironments')}</span>
            <span class="flex"></span>
          </h3>
          <div class="horizontal wrap layout">
            <mwc-button
              class="shell-button"
              icon="edit"
              outlined
              label="${_t('usersettings.EditBootstrapScript')}"
              @click="${() => this._launchBootstrapScriptDialog()}"></mwc-button>
            <mwc-button
              class="shell-button"
              icon="edit"
              outlined
              label="${_t('usersettings.EditUserConfigScript')}"
              @click="${() => this._launchUserConfigDialog()}"></mwc-button>
          </div>
        <h3 class="horizontal center layout" style="display:none;">
          <span>${_t('usersettings.PackageInstallation')}</span>
          <span class="flex"></span>
        </h3>
        <div class="horizontal wrap layout" style="display:none;">
          <div class="horizontal layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>TEST1</div>
              <div class="description">This is description.
              </div>
            </div>
            <div class="vertical center-justified layout setting-button flex end">
              <mwc-switch id="register-new-image-switch" disabled></mwc-switch>
            </div>
          </div>
        </div>
      ` : html``}
      <backend-ai-dialog id="bootstrap-dialog" fixed backdrop scrollable blockScrolling persistent>
        <span slot="title">${_t('usersettings.EditBootstrapScript')}</span>
        <div slot="content" class="vertical layout terminal-area">
          <div style="margin-bottom:1em">${_t('usersettings.BootstrapScriptDescription')}</div>
          <div style="background-color:#272823;height:100%;">
            <lablup-codemirror id="bootstrap-editor" mode="shell"></lablup-codemirror>
          </div>
        </div>
        <div slot="footer" class="end-justified layout flex horizontal">
          <mwc-button id="discard-code" label="${_t('button.Cancel')}" @click="${() => this._hideBootstrapScriptDialog()}"></mwc-button>
          <mwc-button unelevated id="save-code" label="${_t('button.Save')}" @click="${() => this._saveBootstrapScript()}"></mwc-button>
          <mwc-button unelevated id="save-code-and-close" label="${_t('button.SaveAndClose')}" @click="${() => this._saveBootstrapScriptAndCloseDialog()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="userconfig-dialog" fixed backdrop scrollable blockScrolling persistent closeWithConfirmation>
        <span slot="title">${_t('usersettings.Edit_ShellScriptTitle_1')} ${this.rcfile} ${_t('usersettings.Edit_ShellScriptTitle_2')}</span>
        <div slot="content" class="vertical layout terminal-area">
          <mwc-select id="select-rcfile-type"
                  label="${_t('usersettings.ConfigFilename')}"
                  required
                  outlined
                  validationMessage="${_t('credential.validation.PleaseSelectOption')}"
                  @selected="${() => this._toggleRcFileName()}"
                  helper=${_t('dialog.warning.WillBeAppliedToNewSessions')}>
            ${this.rcfiles.map((item: any) => html`
              <mwc-list-item id="${item.path}" value="${item.path}" ?selected=${this.rcfile === item.path}>
                ${item.path}
              </mwc-list-item>
            `
  )}
          </mwc-select>
          <div style="background-color:#272823;height:100%;">
            <lablup-codemirror id="usersetting-editor" mode="shell"></lablup-codemirror>
          </div>
        </div>
        <div slot="footer" class="end-justified layout flex horizontal">
          <mwc-button id="discard-code" label="${_t('button.Cancel')}" @click="${() => this._hideUserConfigScriptDialog()}"></mwc-button>
          <mwc-button id="delete-rcfile" label="${_t('button.Delete')}" @click="${() => this._deleteRcFile()}"></mwc-button>
          <mwc-button unelevated id="save-code" label="${_t('button.Save')}" @click="${() => this._saveUserConfigScript()}"></mwc-button>
          <mwc-button unelevated id="save-code-and-close" label="${_t('button.SaveAndClose')}" @click="${() => this._saveUserConfigScriptAndCloseDialog()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="change-current-editor-dialog" noclosebutton fixed backdrop scrollable blockScrolling persistent style="border-bottom:none;">
        <div slot="title">
          ${_t('usersettings.DialogDiscardOrSave', {File: () => this.prevRcfile})}
        </div>
        <div slot="content">
          ${_t('usersettings.DialogNoSaveNoPreserve')}
        </div>
        <div slot="footer" style="border-top:none;" class="end-justified layout flex horizontal">
          <mwc-button
              id="cancel-editor"
              label="${_t('button.Discard')}"
              @click="${() => this._discardCurrentEditorChange()}"></mwc-button>
          <mwc-button
              unelevated
              id="save-editor-data"
              label="${_t('button.Save')}"
              @click="${() => this._saveCurrentEditorChange()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="ssh-keypair-management-dialog" fixed backdrop persistent>
        <span slot="title">${_t('usersettings.SSHKeypairManagement')}</span>
        <div slot="content" style="max-width:500px">
          <span slot="title"> ${_t('usersettings.CurrentSSHPublicKey')}</span>
          <mwc-textarea
              outlined
              readonly
              class="ssh-keypair"
              id="current-ssh-public-key"
              style="width:430px; height:270px;"
              value="${this.publicSSHkey}"></mwc-textarea>
          <mwc-icon-button
              id="copy-current-ssh-public-key-button"
              icon="content_copy"
              @click="${() => this._copySSHKey('#current-ssh-public-key')}"></mwc-icon-button>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
              label="${_t('button.Close')}"
              @click="${this._hideSSHKeypairDialog}"></mwc-button>
          <mwc-button
              unelevated
              label="${_t('button.Generate')}"
              @click="${this._refreshSSHKeypair}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="generate-ssh-keypair-dialog" fixed persistent noclosebutton>
        <span slot="title">${_t('usersettings.SSHKeypairGeneration')}</span>
        <div slot="content" style="max-width:500px;">
          <div class="vertical layout" style="display:inline-block;">
            <span slot="title">${_t('usersettings.PublicKey')}</span>
            <div class="horizontal layout flex">
              <mwc-textarea class="ssh-keypair" id="ssh-public-key" outlined readonly></mwc-textarea>
              <mwc-icon-button
              icon="content_copy"
              @click="${() => this._copySSHKey('#ssh-public-key')}"></mwc-icon-button>
            </div>
            <span slot="title">${_t('usersettings.PrivateKey')}</span>
            <div class="horizontal layout flex">
              <mwc-textarea class="ssh-keypair" id="ssh-private-key" outlined readonly></mwc-textarea>
              <mwc-icon-button
                  icon="content_copy"
                  @click="${() => this._copySSHKey('#ssh-private-key')}"></mwc-icon-button>
            </div>
            <div style="color:crimson">${_t('usersettings.SSHKeypairGenerationWarning')}</div>
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
             unelevated
             label="${_t('button.Close')}"
             @click="${this._openSSHKeypairClearDialog}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="clear-ssh-keypair-dialog" fixed persistent>
        <span slot="title">${_t('usersettings.ClearSSHKeypairInput')}</span>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
              outlined
              label="${_t('button.No')}"
              @click="${this._hideSSHKeypairClearDialog}"></mwc-button>
          <mwc-button
              unelevated
              label="${_t('button.Yes')}"
              @click="${this._clearCurrentSSHKeypair}"></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTageNameMap {
    'backend-ai-general': BackendAiUsersettingsGeneralList;
  }
}
