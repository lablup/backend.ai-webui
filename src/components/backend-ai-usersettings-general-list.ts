/**
 @license
 Copyright (c) 2015-2024 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './lablup-codemirror';
import './lablup-loading-spinner';
import { Button } from '@material/mwc-button';
import { Select } from '@material/mwc-select';
import '@material/mwc-switch';
import { css, CSSResultGroup, html } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type LablupLoadingSpinner = HTMLElementTagNameMap['lablup-loading-spinner'];
type LablupCodemirror = HTMLElementTagNameMap['lablup-codemirror'];
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];

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
  public lastSavedBootstrapScript = '';

  @property({ type: Object }) notification;
  @property({ type: Boolean }) beta_feature_panel = false;
  @property({ type: Boolean }) shell_script_edit = false;
  @property({ type: Array }) rcfiles;
  @property({ type: String }) rcfile = '';
  @property({ type: String }) prevRcfile = '';
  @property({ type: String }) preferredSSHPort = '';
  @property({ type: String }) publicSSHkey = '';
  @query('#loading-spinner') spinner!: LablupLoadingSpinner;
  @query('#bootstrap-editor') bootstrapEditor!: LablupCodemirror;
  @query('#usersetting-editor') userSettingEditor!: LablupCodemirror;
  @query('#select-rcfile-type') rcFileTypeSelect!: Select;
  @query('#bootstrap-dialog') bootstrapDialog!: BackendAIDialog;
  @query('#userconfig-dialog') userconfigDialog!: BackendAIDialog;
  @query('#delete-rcfile') deleteRcfileButton!: Button;

  constructor() {
    super();
    this.rcfiles = [];
  }

  static get styles(): CSSResultGroup {
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

        span[slot='title'] {
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

        #bootstrap-dialog,
        #userconfig-dialog {
          --component-width: calc(100vw - 200px);
          --component-height: calc(100vh - 100px);
          --component-min-width: calc(100vw - 200px);
          --component-max-width: calc(100vw - 200px);
          --component-min-height: calc(100vh - 100px);
          --component-max-height: calc(100vh - 100px);
        }

        .terminal-area {
          height: calc(100vh - 300px);
        }

        mwc-select {
          width: 160px;
          --mdc-list-side-padding: 25px;
        }

        mwc-select#select-rcfile-type {
          width: 300px;
          margin-bottom: 10px;
        }

        mwc-select#select-rcfile-type > mwc-list-item {
          width: 250px;
        }

        mwc-button {
          margin: auto 10px;
        }

        mwc-button.shell-button {
          margin: 5px;
          width: 260px;
        }

        mwc-icon-button {
          color: var(--token-colorPrimary);
        }

        ::-webkit-scrollbar {
          display: none; /* Chrome and Safari */
        }

        @media screen and (max-width: 500px) {
          #bootstrap-dialog,
          #userconfig-dialog {
            --component-min-width: 300px;
          }

          mwc-select#select-rcfile-type {
            width: 250px;
          }

          mwc-select#select-rcfile-type > mwc-list-item {
            width: 200px;
          }

          .setting-desc {
            width: 200px;
          }

          #language-setting {
            width: 160px;
          }
        }
      `,
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
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
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener('backend-ai-connected', () => {
        this.preferredSSHPort =
          globalThis.backendaioptions.get('custom_ssh_port');
        if (
          globalThis.backendaiclient.isAPIVersionCompatibleWith('v4.20191231')
        ) {
          this.shell_script_edit = true;
          this.rcfile = '.bashrc';
        }
      });
    } else {
      // already connected
      this.preferredSSHPort =
        globalThis.backendaioptions.get('custom_ssh_port');
      if (
        globalThis.backendaiclient.isAPIVersionCompatibleWith('v4.20191231')
      ) {
        this.shell_script_edit = true;
        this.rcfile = '.bashrc';
      }
    }
    this.userconfigDialog.addEventListener('dialog-closing-confirm', () => {
      const script = this.userSettingEditor.getValue();
      const idx = this.rcfiles.findIndex(
        (item: any) => item.path === this.rcfile,
      );
      if (this.rcfiles[idx]['data'] !== script) {
        this.prevRcfile = this.rcfile; // update prevRcfile to current file
      }
      this.userconfigDialog.closeWithConfirmation = false;
      this.userconfigDialog.hide();
    });
  }

  _fetchBootstrapScript() {
    // Fetch user's bootstrap code.
    return globalThis.backendaiclient.userConfig
      .get_bootstrap_script()
      .then((resp) => {
        const script = resp || '';
        this.lastSavedBootstrapScript = script;
        return script;
      })
      .catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  async _saveBootstrapScript() {
    const script = this.bootstrapEditor.getValue();
    if (this.lastSavedBootstrapScript === script) {
      this.notification.text = _text('resourceGroup.NochangesMade');
      this.notification.show();
      return;
    }
    this.spinner.show();
    globalThis.backendaiclient.userConfig
      .update_bootstrap_script(script)
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
    const script = await this._fetchBootstrapScript();
    this.bootstrapEditor.setValue(script);
    this.bootstrapEditor.focus();
    this.bootstrapDialog.show();
  }

  _hideBootstrapScriptDialog() {
    this.bootstrapDialog.hide();
  }

  /**
   * Edit user's .bashrc or .zshrc code.
   * */
  async _editUserConfigScript() {
    this.rcfiles = await this._fetchUserConfigScript();
    const rcfileNames = [
      '.bashrc',
      '.zshrc',
      '.tmux.conf.local',
      '.vimrc',
      '.Renviron',
    ];
    rcfileNames.map((filename) => {
      const idx = this.rcfiles.findIndex((item: any) => item.path === filename);
      if (idx === -1) {
        this.rcfiles.push({ path: filename, data: '' });
        this.userSettingEditor.setValue('');
      } else {
        const code = this.rcfiles[idx]['data'];
        this.userSettingEditor.setValue(code);
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

    const idx = this.rcfiles.findIndex(
      (item: any) => item.path === this.rcfile,
    );
    if (idx != -1) {
      const code = this.rcfiles[idx]['data'];
      this.userSettingEditor.setValue(code);
    } else {
      this.userSettingEditor.setValue('');
    }
    this.userSettingEditor.focus();
    this.spinner.hide();
    this._toggleDeleteButton();
  }

  _fetchUserConfigScript() {
    // Fetch user's .zshrc or .bashrc code
    return globalThis.backendaiclient.userConfig
      .get()
      .then((resp) => {
        const script = resp || '';
        return script;
      })
      .catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  async _saveUserConfigScript(fileName: string = this.rcfile) {
    const script = this.userSettingEditor.getValue();
    const idx = this.rcfiles.findIndex((item: any) => item.path === fileName);
    if (this.rcFileTypeSelect.items.length > 0) {
      const selectedFile = this.rcFileTypeSelect.items.find(
        (item) => item.value === fileName,
      );
      if (selectedFile) {
        const idx = this.rcFileTypeSelect.items.indexOf(selectedFile);
        this.rcFileTypeSelect.select(idx);
      }
    }
    if (idx != -1) {
      // if recent modified file is in rcfiles
      if (this.rcfiles[idx]['data'] === '') {
        // if new rcfile
        if (script !== '') {
          // create and save with data and path
          globalThis.backendaiclient.userConfig
            .create(script, this.rcfiles[idx]['path'])
            .then((res) => {
              this.spinner.hide();
              this.notification.text = _text('usersettings.DescScriptCreated');
              this.notification.show();
            })
            .catch((err) => {
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
          this.notification.text = _text(
            'usersettings.DescNewUserConfigFileCreated',
          );
          this.notification.show();
          return;
        }
      } else {
        // if rcfile already exists
        if (this.rcfiles[idx]['data'] === script) {
          this.notification.text = _text('resourceGroup.NochangesMade');
          this.notification.show();
          return;
        } else if (script === '') {
          this.notification.text = _text(
            'usersettings.DescLetUserUpdateScriptWithNonEmptyValue',
          );
          this.notification.show();
          return;
        } else {
          await globalThis.backendaiclient.userConfig
            .update(script, fileName)
            .then((res) => {
              this.notification.text = _text('usersettings.DescScriptUpdated');
              this.notification.show();
              this.spinner.hide();
            })
            .catch((err) => {
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
    setTimeout(() => {
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

  _updateSelectedRcFileName(fileName: string) {
    if (this.rcFileTypeSelect.items.length > 0) {
      const selectedFile = this.rcFileTypeSelect.items.find(
        (item) => item.value === fileName,
      );
      if (selectedFile) {
        const idx = this.rcFileTypeSelect.items.indexOf(selectedFile);
        const code = this.rcfiles[idx]['data'];
        this.rcFileTypeSelect.select(idx);
        this.userSettingEditor.setValue(code);
      }
    }
  }

  /**
   * Toggle RcFile name according to editor code.
   * */
  _toggleRcFileName() {
    this.prevRcfile = this.rcfile;
    this.rcfile = this.rcFileTypeSelect.value;
    let idx = this.rcfiles.findIndex(
      (item: any) => item.path === this.prevRcfile,
    );
    let code = idx > -1 ? this.rcfiles[idx]['data'] : '';
    const editorCode = this.userSettingEditor.getValue();
    this.rcFileTypeSelect.layout();
    this._toggleDeleteButton();
    if (code !== editorCode) {
      this._launchChangeCurrentEditorDialog();
    } else {
      idx = this.rcfiles.findIndex((item: any) => item.path === this.rcfile);
      code = this.rcfiles[idx]?.data ? this.rcfiles[idx]['data'] : '';
      this.userSettingEditor.setValue(code);
    }
  }

  /**
   * Toggle delete button disabled when rcfile exists
   */
  _toggleDeleteButton() {
    const idx = this.rcfiles.findIndex(
      (item: any) => item.path === this.rcfile,
    );
    if (idx > -1) {
      this.deleteRcfileButton.disabled = !(
        this.rcfiles[idx]?.data && this.rcfiles[idx]?.permission
      );
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
      globalThis.backendaiclient.userConfig
        .delete(path)
        .then((res) => {
          const message = _text('usersettings.DescScriptDeleted') + path;
          this.notification.text = message;
          this.notification.show();
          this.spinner.hide();
          this._hideUserConfigScriptDialog();
        })
        .catch((err) => {
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
    const createdRcfiles = this.rcfiles.filter(
      (item: any) => item.permission !== '' && item.data !== '',
    );
    const rcfileDeletionQueue = createdRcfiles.map((item: any) => {
      const path = item.path;
      return globalThis.backendaiclient.userConfig.delete(path);
    });
    Promise.all(rcfileDeletionQueue)
      .then((response) => {
        const message = _text('usersettings.DescScriptAllDeleted');
        this.notification.text = message;
        this.notification.show();
        this.spinner.hide();
      })
      .catch((err) => {
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

  render() {
    // languate=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <backend-ai-dialog
        id="bootstrap-dialog"
        fixed
        backdrop
        scrollable
        blockScrolling
        persistent
      >
        <span slot="title">${_t('usersettings.EditBootstrapScript')}</span>
        <div slot="content" class="vertical layout terminal-area">
          <div style="margin-bottom:1em">
            ${_t('usersettings.BootstrapScriptDescription')}
          </div>
          <div style="background-color:#272823;height:100%;">
            <lablup-codemirror
              id="bootstrap-editor"
              mode="shell"
            ></lablup-codemirror>
          </div>
        </div>
        <div slot="footer" class="end-justified layout flex horizontal">
          <mwc-button
            id="discard-code"
            label="${_t('button.Cancel')}"
            @click="${() => this._hideBootstrapScriptDialog()}"
          ></mwc-button>
          <mwc-button
            unelevated
            id="save-code"
            label="${_t('button.Save')}"
            @click="${() => this._saveBootstrapScript()}"
          ></mwc-button>
          <mwc-button
            unelevated
            id="save-code-and-close"
            label="${_t('button.SaveAndClose')}"
            @click="${() => this._saveBootstrapScriptAndCloseDialog()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="userconfig-dialog"
        fixed
        backdrop
        scrollable
        blockScrolling
        persistent
      >
        <span slot="title">
          ${_t('usersettings.Edit_ShellScriptTitle_1')} ${this.rcfile}
          ${_t('usersettings.Edit_ShellScriptTitle_2')}
        </span>
        <div slot="content" class="vertical layout terminal-area">
          <mwc-select
            id="select-rcfile-type"
            label="${_t('usersettings.ConfigFilename')}"
            required
            outlined
            fixedMenuPosition
            validationMessage="${_t(
              'credential.validation.PleaseSelectOption',
            )}"
            @selected="${() => this._toggleRcFileName()}"
            helper=${_t('dialog.warning.WillBeAppliedToNewSessions')}
          >
            ${this.rcfiles.map(
              (item: any) => html`
                <mwc-list-item
                  id="${item.path}"
                  value="${item.path}"
                  ?selected=${this.rcfile === item.path}
                >
                  ${item.path}
                </mwc-list-item>
              `,
            )}
          </mwc-select>
          <div style="background-color:#272823;height:100%;">
            <lablup-codemirror
              id="usersetting-editor"
              mode="shell"
            ></lablup-codemirror>
          </div>
        </div>
        <div slot="footer" class="end-justified layout flex horizontal">
          <mwc-button
            id="discard-code"
            label="${_t('button.Cancel')}"
            @click="${() => this._hideUserConfigScriptDialog()}"
          ></mwc-button>
          <mwc-button
            id="delete-rcfile"
            label="${_t('button.Delete')}"
            @click="${() => this._deleteRcFile()}"
          ></mwc-button>
          <mwc-button
            unelevated
            id="save-code"
            label="${_t('button.Save')}"
            @click="${() => this._saveUserConfigScript()}"
          ></mwc-button>
          <mwc-button
            unelevated
            id="save-code-and-close"
            label="${_t('button.SaveAndClose')}"
            @click="${() => this._saveUserConfigScriptAndCloseDialog()}"
          ></mwc-button>
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
