/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {unsafeHTML} from 'lit-html/directives/unsafe-html';

import {BackendAIPage} from './backend-ai-page';

import '@polymer/paper-item/paper-item';
import './lablup-loading-spinner';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';

import '@material/mwc-list/mwc-list-item';
import '../plastics/mwc/mwc-multi-select';
import '@material/mwc-textfield';

import 'weightless/button';
import 'weightless/card';
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
import './backend-ai-dialog';
import './backend-ai-storage-list';
import {default as PainKiller} from './backend-ai-painkiller';

import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment, IronPositioning} from "../plastics/layout/iron-flex-layout-classes";

/**
 Backend.AI Data View

 Example:

 <backend-ai-data-view class="page" name="data" ?active="${0}">
 ... content ...
 </backend-ai-data-view>

 @group Backend.AI Console
 @element backend-ai-data-view
 */

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
  @property({type: Object}) storageInfo = Object();
  @property({type: String}) _helpDescription = '';
  @property({type: String}) _helpDescriptionTitle = '';
  @property({type: String}) _helpDescriptionIcon = '';

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
          width: 350px;
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

        #add-folder-dialog {
          --component-width: 400px;
        }

        backend-ai-dialog wl-textfield,
        backend-ai-dialog wl-select {
          --input-font-family: Roboto, Noto, sans-serif;
          --input-color-disabled: #222222;
          --input-label-color-disabled: #222222;
          --input-label-font-size: 12px;
          --input-border-style-disabled: 1px solid #cccccc;
        }

        #help-description {
          --component-width: 350px;
        }

        #textfields wl-textfield,
        wl-label {
          margin-bottom: 20px;
        }

        wl-label {
          --label-font-family: Roboto, Noto, sans-serif;
          --label-color: black;
        }

        mwc-multi-select {
          width: 180px;
          --mdc-select-min-width: 180px;
          margin-bottom: 10px;
          --mdc-theme-primary: var(--paper-orange-600);
          --mdc-select-fill-color: transparent;
          --mdc-select-label-ink-color: rgba(0, 0, 0, 0.75);
          --mdc-select-dropdown-icon-color: var(--paper-orange-400);
          --mdc-select-hover-line-color: var(--paper-orange-600);
          --mdc-list-vertical-padding: 5px;
        }

        #help-description {
          --dialog-width: 350px;
        }

        #help-description p {
          padding: 5px !important;
        }

        mwc-multi-select mwc-icon-button {
          --mdc-icon-button-size: 24px;
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
      <backend-ai-dialog id="add-folder-dialog" fixed backdrop>
        <span slot="title">${_t("data.CreateANewStorageFolder")}</span>
        <div slot="content">
          <mwc-textfield id="add-folder-name" label="${_t("data.Foldername")}" pattern="[a-zA-Z0-9_-.]+"
              auto-validate required validationMessage="${_t("data.Allowslettersnumbersand-_dot")}"></mwc-textfield>
          <div class="horizontal layout">
            <mwc-multi-select id="add-folder-host" label="${_t("data.Host")}">
              ${this.vhosts.map((item, idx) => html`
                <mwc-list-item hasMeta value="${item}" ?selected="${idx === 0}">
                  <span>${item}</span>
                  <mwc-icon-button slot="meta" icon="info" class="fg orange info"
                      @click="${(e) => {
      this._showStorageDescription(e, item);
    }}">
                  </mwc-icon-button>
                </mwc-list-item>
              `)}
            </mwc-multi-select>
            <mwc-multi-select id="add-folder-type" label="${_t("data.Type")}">
              ${(this.allowed_folder_type as String[]).includes('user') ? html`
                <mwc-list-item value="user" selected>${_t("data.User")}</mwc-list-item>
              ` : html``}
              ${this.is_admin && (this.allowed_folder_type as String[]).includes('group') ? html`
                <mwc-list-item value="group" ?selected="${!(this.allowed_folder_type as String[]).includes('user')}">${_t("data.Group")}</mwc-list-item>
              ` : html``}
            </mwc-multi-select>
          </div>
          ${this._vfolderInnatePermissionSupport ? html`
            <div class="horizontal layout">
              <mwc-multi-select id="add-folder-usage-mode" label="${_t("data.UsageMode")}">
                ${this.usageModes.map((item, idx) => html`
                  <mwc-list-item value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>
                `)}
              </mwc-multi-select>
              <mwc-multi-select id="add-folder-permission" label="${_t("data.Type")}">
                ${this.permissions.map((item, idx) => html`
                  <mwc-list-item value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>
                `)}
              </mwc-multi-select>
            </div>
          ` : html``}
          ${this.is_admin && (this.allowed_folder_type as String[]).includes('group') ? html`
            <div class="horizontal layout">
              <mwc-multi-select id="add-folder-group" label="${_t("data.Group")}">
                ${(this.allowedGroups as any).map((item, idx) => html`
                  <mwc-list-item value="${item.name}" ?selected="${idx === 0}">${item.name}</mwc-list-item>
                `)}
              </mwc-multi-select>
            </div>
          ` : html``}
          <div style="font-size:11px;">
            ${_t("data.DialogFolderStartingWithDotAutomount")}
          </div>
        </div>
        <div slot="footer">
          <wl-button class="blue button" type="button" id="add-button" outlined @click="${() => this._addFolder()}">
            <wl-icon>rowing</wl-icon>
             ${_t("data.Create")}
          </wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="help-description" fixed backdrop>
        <span slot="title">${this._helpDescriptionTitle}</span>
        <div slot="content" class="horizontal layout center">
        ${this._helpDescriptionIcon == '' ? html`` : html`
          <img slot="graphic" src="resources/icons/${this._helpDescriptionIcon}" style="width:64px;height:64px;margin-right:10px;" />
          `}
          <p style="font-size:14px;width:256px;">${unsafeHTML(this._helpDescription)}</p>
        </div>
      </backend-ai-dialog>
    `;
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    this.folderLists = this.shadowRoot.querySelectorAll('backend-ai-storage-list');
    fetch('resources/storage_metadata.json').then(
      response => response.json()
    ).then(
      json => {
        let storageInfo = Object();
        for (let key in json.storageInfo) {
          storageInfo[key] = {};
          if ("name" in json.storageInfo[key]) {
            storageInfo[key].name = json.storageInfo[key].name;
          }
          if ("description" in json.storageInfo[key]) {
            storageInfo[key].description = json.storageInfo[key].description;
          } else {
            storageInfo[key].description = _text('data.NoStorageDescriptionFound');
          }
          if ("icon" in json.storageInfo[key]) {
            storageInfo[key].icon = json.storageInfo[key].icon;
          } else {
            storageInfo[key].icon = 'local.png';
          }
          if ("dialects" in json.storageInfo[key]) {
            json.storageInfo[key].dialects.forEach(item => {
              storageInfo[item] = storageInfo[key];
            });
          }
        }
        this.storageInfo = storageInfo;
      }
    );
  }

  /**
   * Initialize the admin.
   *
   * @param {Boolean} active
   */
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
      globalThis.backendaiclient.vfolder.list_allowed_types().then(response => {
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

  /**
   * display tabs
   *
   * @param {object} tab
   */
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

  /**
   * Add folder dialog.
   */
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

  /**
   * Display the storage description.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   * @param {object} item
   */
  _showStorageDescription(e, item) {
    e.stopPropagation();
    if (item in this.storageInfo) {
      this._helpDescriptionTitle = this.storageInfo[item].name;
      this._helpDescription = this.storageInfo[item].description;
      this._helpDescriptionIcon = this.storageInfo[item].icon;
    } else {
      this._helpDescriptionTitle = item;
      this._helpDescriptionIcon = 'local.png';
      this._helpDescription = _text('data.NoStorageDescriptionFound');
    }
    let desc = this.shadowRoot.querySelector('#help-description');
    desc.show();
  }

  _indexFrom1(index) {
    return index + 1;
  }

  /**
   * Add folder with name, host, type, usage mode and permission.
   */
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
        this.notification.text = _text('data.folders.FolderCreated');
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
      return;
    }
  }

  /**
   * Refresh the folder list.
   */
  _refreshFolderList() {
    // Send notification to folder objects
    for (const list of this.folderLists) {
      list.refreshFolderList();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-data-view": BackendAIData;
  }
}
