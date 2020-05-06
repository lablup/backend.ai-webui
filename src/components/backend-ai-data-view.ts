/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {render} from 'lit-html';
import {BackendAIPage} from './backend-ai-page';

import '@polymer/paper-item/paper-item';
import './lablup-loading-spinner';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';

import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select';
import '@material/mwc-textfield';

import 'weightless/button';
import 'weightless/card';
import 'weightless/dialog';
import 'weightless/divider';
import 'weightless/icon';
import 'weightless/label';
import 'weightless/select';
import 'weightless/tab';
import 'weightless/title';
import 'weightless/tab-group';
import 'weightless/textfield';
import '@material/mwc-icon-button';

import '../plastics/lablup-shields/lablup-shields';
import './backend-ai-storage-list';
import {default as PainKiller} from './backend-ai-painkiller';

import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment, IronPositioning} from "../plastics/layout/iron-flex-layout-classes";

@customElement("backend-ai-data-view")
export default class BackendAIData extends BackendAIPage {
  @property({type: String}) apiMajorVersion = '';
  @property({type: Object}) folders = Object();
  @property({type: Object}) folderInfo = Object();
  @property({type: Boolean}) is_admin = false;
  @property({type: Boolean}) authenticated = false;
  @property({type: String}) deleteFolderId = '';
  @property({type: String}) vhost = '';
  @property({type: Array}) vhosts = [];
  @property({type: Array}) usageModes = ['General', 'Data', 'Model'];
  @property({type: Array}) permissions = ['Read-Write', 'Read-Only', 'Delete'];
  @property({type: Array}) allowedGroups = [];
  @property({type: Array}) allowed_folder_type = [];
  @property({type: Object}) notification = Object();
  @property({type: Object}) spinner = Object();
  @property({type: Object}) folderLists = Object();
  @property({type: String}) _status = 'inactive';
  @property({type: Boolean}) active = true;
  @property({type: Object}) _lists = Object();
  @property({type: Boolean}) _vfolderInnatePermissionSupport = false;

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
        ul {
          padding-left: 0;
        }

        ul li {
          list-style: none;
          font-size: 13px;
        }

        span.indicator {
          width: 100px;
          font-size: 10px;
        }

        .folder-action-buttons wl-button {
          margin-right: 10px;
        }

        wl-button > wl-icon {
          --icon-size: 24px;
          padding: 0;
        }

        wl-icon {
          --icon-size: 16px;
          padding: 0;
        }

        wl-button.button {
          width: 330px;
        }

        mwc-icon-button.tiny {
          width: 35px;
          height: 35px;
        }

        wl-card.item {
          height: calc(100vh - 145px) !important;
        }

        .tab-content {
          border: 0;
          font-size: 14px;
        }

        mwc-textfield {
          width: 100%;
          --mdc-theme-primary: #242424;
          --mdc-text-field-fill-color: transparent;
        }

        mwc-textfield.red {
          --mdc-theme-primary: var(--paper-red-400) !important;
        }

        wl-tab-group {
          --tab-group-indicator-bg: var(--paper-orange-500);
        }

        wl-tab {
          --tab-color: #666666;
          --tab-color-hover: #222222;
          --tab-color-hover-filled: #222222;
          --tab-color-active: #222222;
          --tab-color-active-hover: #222222;
          --tab-color-active-filled: #cccccc;
          --tab-bg-active: var(--paper-orange-50);
          --tab-bg-filled: var(--paper-orange-50);
          --tab-bg-active-hover: var(--paper-orange-100);
        }

        wl-button {
          --button-bg: var(--paper-orange-50);
          --button-bg-hover: var(--paper-orange-100);
          --button-bg-active: var(--paper-orange-600);
          color: var(--paper-orange-900);
        }

        wl-dialog wl-textfield,
        wl-dialog wl-select {
          --input-font-family: Roboto, Noto, sans-serif;
          --input-color-disabled: #222222;
          --input-label-color-disabled: #222222;
          --input-label-font-size: 12px;
          --input-border-style-disabled: 1px solid #cccccc;
        }

        #textfields wl-textfield,
        wl-label {
          margin-bottom: 20px;
        }

        wl-label {
          --label-font-family: Roboto, Noto, sans-serif;
          --label-color: black;
        }

        mwc-select {
          width: 180px;
          margin-bottom: 10px;
          --mdc-theme-primary: var(--paper-orange-600);
          --mdc-select-fill-color: transparent;
          --mdc-select-label-ink-color: rgba(0, 0, 0, 0.75);
          --mdc-select-dropdown-icon-color: var(--paper-orange-400);
          --mdc-select-hover-line-color: var(--paper-orange-600);
          --mdc-list-vertical-padding: 5px;
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <wl-card class="item" elevation="1" style="padding-bottom:20px;">
        <h3 class="horizontal center flex layout tab">
          <wl-tab-group>
            <wl-tab value="general-folder" checked @click="${(e) => this._showTab(e.target)}">${_t("data.Folders")}</wl-tab>
            <wl-tab value="automount-folder" @click="${(e) => this._showTab(e.target)}">${_t("data.AutomountFolders")}</wl-tab>
            <wl-tab value="shared-folder" disabled>${_t("data.SharedData")}</wl-tab>
            <wl-tab value="model" disabled>${_t("data.Models")}</wl-tab>
          </wl-tab-group>
          <span class="flex"></span>
          <wl-button class="fg red" id="add-folder" outlined @click="${() => this._addFolderDialog()}">
            <wl-icon>add</wl-icon>
            ${_t("data.NewFolder")}
          </wl-button>
        </h3>
        <div id="general-folder-lists" class="tab-content">
          <backend-ai-storage-list id="general-folder-storage" storageType="general" ?active="${this.active === true}"></backend-ai-storage-list>
        </div>
        <div id="automount-folder-lists" class="tab-content" style="display:none;">
          <p>${_t("data.DialogFolderStartingWithDotAutomount")}</p>
          <backend-ai-storage-list id="automount-folder-storage" storageType="automount" ?active="${this.active === true}"></backend-ai-storage-list>
        </div>
      </wl-card>
      <wl-dialog id="add-folder-dialog" class="dialog-ask" fixed backdrop blockscrolling>
        <wl-card elevation="1" class="login-panel intro centered">
          <h3 class="horizontal center layout">
            <span>${_t("data.CreateANewStorageFolder")}</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <section>
            <mwc-textfield id="add-folder-name" label="${_t("data.Foldername")}" pattern="[a-zA-Z0-9_-.]*"
                auto-validate required validationMessage="${_t("data.Allowslettersnumbersand-_dot")}"></mwc-textfield>
            <div class="horizontal layout">
              <mwc-select id="add-folder-host" label="${_t("data.Host")}">
                ${this.vhosts.map((item, idx) => html`
                  <mwc-list-item value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>
                `)}
              </mwc-select>
              <mwc-select id="add-folder-type" label="${_t("data.Type")}">
                ${(this.allowed_folder_type as String[]).includes('user') ? html`
                  <mwc-list-item value="user" selected>${_t("data.User")}</mwc-list-item>
                ` : html``}
                ${this.is_admin && (this.allowed_folder_type as String[]).includes('group') ? html`
                  <mwc-list-item value="group" ?selected="${!(this.allowed_folder_type as String[]).includes('user')}">${_t("data.Group")}</mwc-list-item>
                ` : html``}
              </mwc-select>
            </div>
            ${this._vfolderInnatePermissionSupport ? html`
              <div class="horizontal layout">
                <mwc-select id="add-folder-usage-mode" label="${_t("data.UsageMode")}">
                  ${this.usageModes.map((item, idx) => html`
                    <mwc-list-item value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>
                  `)}
                </mwc-select>
                <mwc-select id="add-folder-permission" label="${_t("data.Type")}">
                  ${this.permissions.map((item, idx) => html`
                    <mwc-list-item value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>
                  `)}
                </mwc-select>
              </div>
            `: html``}
            ${this.is_admin && (this.allowed_folder_type as String[]).includes('group') ? html`
              <div class="horizontal layout">
                <mwc-select id="add-folder-group" label="${_t("data.Group")}">
                  ${(this.allowedGroups as any).map((item, idx) => html`
                    <mwc-list-item value="${item.name}" ?selected="${idx === 0}">${item.name}</mwc-list-item>
                  `)}
                </mwc-select>
              </div>
            ` : html``}
            <div style="font-size:11px;">
              ${_t("data.DialogFolderStartingWithDotAutomount")}
            </div>
            <br/>
            <wl-button class="blue button" type="button" id="add-button" outlined @click="${() => this._addFolder()}">
              <wl-icon>rowing</wl-icon>
               ${_t("data.Create")}
            </wl-button>
          </section>
        </wl-card>
      </wl-dialog>
    `;
  }

  indexRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`${this._indexFrom1(rowData.index)}`, root
    );
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    this.folderLists = this.shadowRoot.querySelectorAll('backend-ai-storage-list');
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }

    const _init = () => {
      this.is_admin = globalThis.backendaiclient.is_admin;
      this.authenticated = true;
      this.apiMajorVersion = globalThis.backendaiclient.APIMajorVersion;
        if (globalThis.backendaiclient.isAPIVersionCompatibleWith('v4.20191215')) {
          this._vfolderInnatePermissionSupport = true;
        }
      globalThis.backendaiclient.vfolder.allowed_types().then(response => {
        this.allowed_folder_type = response;
      });
    }

    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        _init();
      }, true);
    } else {
      _init();
    }
  }

  _showTab(tab) {
    let els = this.shadowRoot.querySelectorAll(".tab-content");
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this.shadowRoot.querySelector('#' + tab.value + '-lists').style.display = 'block';
    for (let x = 0; x < this._lists.length; x++) {
      this._lists[x].removeAttribute('active');
    }
    this.shadowRoot.querySelector('#' + tab.value + '-storage').setAttribute('active', true);
  }

  async _addFolderDialog() {
    let vhost_info = await globalThis.backendaiclient.vfolder.list_hosts();
    let nameEl = this.shadowRoot.querySelector('#add-folder-name');
    nameEl.value = ''; // reset folder name
    this.vhosts = vhost_info.allowed;
    this.vhost = vhost_info.default;
    if ((this.allowed_folder_type as String[]).includes('group')) {
      const group_info = await globalThis.backendaiclient.group.list();
      this.allowedGroups = group_info.groups;
    }
    this.openDialog('add-folder-dialog');
  }

  openDialog(id) {
    this.shadowRoot.querySelector('#' + id).show();
  }

  closeDialog(id) {
    this.shadowRoot.querySelector('#' + id).hide();
  }

  _indexFrom1(index) {
    return index + 1;
  }

  _addFolder() {
    let nameEl = this.shadowRoot.querySelector('#add-folder-name');
    let name = nameEl.value;
    let host = this.shadowRoot.querySelector('#add-folder-host').value;
    let ownershipType = this.shadowRoot.querySelector('#add-folder-type').value;
    let group;
    const usageModeEl = this.shadowRoot.querySelector('#add-folder-usage-mode');
    const permissionEl = this.shadowRoot.querySelector('#add-folder-permission');
    let usageMode = '';
    let permission = '';
    if (['user', 'group'].includes(ownershipType) === false) {
      ownershipType = 'user';
    }
    if (ownershipType === 'user') {
      group = '';
    } else {
      group = this.is_admin ? this.shadowRoot.querySelector('#add-folder-group').value : globalThis.backendaiclient.current_group;
    }
    if (usageModeEl) {
      usageMode = usageModeEl.value;
      usageMode = usageMode.toLowerCase();
    }
    if (permissionEl) {
      permission = permissionEl.value;
      switch (permission) {
        case 'Read-Write':
          permission = 'rw';
          break;
        case 'Read-Only':
          permission = 'ro';
          break;
        case 'Delete':
          permission = 'wd';
          break;
        default:
          permission = 'rw';
      }
    }
    nameEl.reportValidity();
    if (nameEl.checkValidity()) {
      let job = globalThis.backendaiclient.vfolder.create(name, host, group, usageMode, permission);
      job.then((value) => {
        this.notification.text = 'Folder is successfully created.';
        this.notification.show();
        this._refreshFolderList();
      }).catch(err => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
      this.closeDialog('add-folder-dialog');
    } else {
      return ;
    }
  }

  _refreshFolderList() {
    // Send notification to folder objects
    for (const list of this.folderLists) {
      list.refreshFolderList();
    }
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-data-view": BackendAIData;
  }
}
