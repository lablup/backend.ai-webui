/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import {render} from 'lit-html';
import {BackendAIPage} from './backend-ai-page';

import '@polymer/iron-icons/social-icons';
import '@polymer/paper-item/paper-item';
import './lablup-loading-indicator';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';

import '@material/mwc-textfield';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column';

import '@vaadin/vaadin-item/vaadin-item';
import '@vaadin/vaadin-upload/vaadin-upload';

import 'weightless/button';
import 'weightless/card';
import 'weightless/checkbox';
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

import {BackendAiStyles} from "./backend-ai-console-styles";
import {IronFlex, IronFlexAlignment, IronPositioning} from "../plastics/layout/iron-flex-layout-classes";

@customElement("backend-ai-data-view")
export default class BackendAIData extends BackendAIPage {
  @property({type: Object}) folders = Object();
  @property({type: Object}) folderInfo = Object();
  @property({type: Boolean}) is_admin = false;
  @property({type: Boolean}) authenticated = false;
  @property({type: String}) deleteFolderId = '';
  @property({type: String}) vhost = '';
  @property({type: Array}) vhosts = [];
  @property({type: Array}) allowedGroups = [];
  @property({type: Array}) allowed_folder_type = [];
  @property({type: Object}) notification = Object();
  @property({type: Object}) indicator = Object();
  @property({type: Object}) folderLists = Object();

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
        vaadin-grid {
          border: 0 !important;
          font-size: 12px;
        }

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

        .warning {
          color: red;
        }

        vaadin-item {
          font-size: 13px;
          font-weight: 100;
        }

        #folder-explorer-dialog {
          --dialog-height: calc(100vh - 170px);
          height: calc(100vh - 170px);
          right: 0;
          top: 0;
          position: fixed;
          margin: 170px 0 0 0;
        }

        #folder-explorer-dialog vaadin-grid vaadin-grid-column {
          height: 32px !important;
        }

        #folder-explorer-dialog vaadin-grid mwc-icon-button {
          --mdc-icon-size: 24px;
          --mdc-icon-button-size: 28px;
        }

        @media screen and (max-width: 899px) {
          #folder-explorer-dialog,
          #folder-explorer-dialog.mini_ui {
            left: 0;
            --dialog-width: 100%;
            width: 100%;
          }
        }

        @media screen and (min-width: 900px) {
          #folder-explorer-dialog {
            left: 150px;
            --dialog-width: calc(100% - 100px);
            width: calc(100% - 100px);
          }

          #folder-explorer-dialog.mini_ui {
            left: 65px;
            --dialog-width: calc(100% - 45px);
            width: calc(100% - 45px);
          }
        }

        div.breadcrumb {
          color: #637282;
          font-size: 1em;
          margin-bottom: 10px;
        }

        div.breadcrumb span:first-child {
          display: none;
        }

        vaadin-grid.folderlist {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 220px);
        }

        vaadin-grid.explorer {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 370px);
        }

        mwc-textfield {
          width: 100%;
          --mdc-theme-primary: #242424;
          --mdc-text-field-fill-color: transparent;
        }

        mwc-textfield.red {
          --mdc-theme-primary: var(--paper-red-400) !important;
        }

        wl-button.goto {
          margin: 0;
          padding: 5px;
          min-width: 0;
        }

        wl-button.goto:last-of-type {
          font-weight: bold;
        }

        div#upload {
          margin: 0;
          padding: 0;
        }

        div#dropzone {
          display: none;
          position: absolute;
          top: 0;
          height: 100%;
          width: 100%;
          z-index: 10;
        }

        div#dropzone, div#dropzone p {
          margin: 0;
          padding: 0;
          width: 100%;
          background: rgba(211, 211, 211, .5);
          text-align: center;
        }

        .progress {
          padding: 30px 10px;
          border: 1px solid lightgray;
        }

        .progress-item {
          padding: 10px 30px;
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

        wl-checkbox {
          --checkbox-color: var(--paper-orange-900);
          --checkbox-color-checked: var(--paper-orange-900);
          --checkbox-bg-checked: var(--paper-orange-900);
          --checkbox-color-disabled-checked: var(--paper-orange-900);
          --checkbox-bg-disabled-checked: var(--paper-orange-900);
        }

        #modify-permission-dialog {
          --dialog-min-width: 600px;
        }

      `];
  }


  render() {
    // language=HTML
    return html`
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <wl-card class="item" elevation="1" style="padding-bottom:20px;">
        <h3 class="horizontal center flex layout tab">
          <wl-tab-group>
            <wl-tab value="folder-lists" checked>Folders</wl-tab>
            <wl-tab value="shared-folder-lists" disabled>Shared Data</wl-tab>
            <wl-tab value="model-lists" disabled>Models</wl-tab>
          </wl-tab-group>
          <span class="flex"></span>
          <wl-button class="fg red" id="add-folder" outlined @click="${() => this._addFolderDialog()}">
            <wl-icon>add</wl-icon>
            New folder
          </wl-button>
        </h3>
        <div id="folder-lists" class="tab-content">
          <backend-ai-storage-list id="general-storage" storageType="general" ?active="${this.active === true}"></backend-ai-storage-list>
        </div>
      </wl-card>
      <wl-dialog id="add-folder-dialog" class="dialog-ask" fixed backdrop blockscrolling>
        <wl-card elevation="1" class="login-panel intro centered">
          <h3 class="horizontal center layout">
            <span>Create a new storage folder</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <section>
            <mwc-textfield id="add-folder-name" label="Folder name" pattern="[a-zA-Z0-9_-]*" auto-validate
                         error-message="Allows letters, numbers and -_."></mwc-textfield>
            <div class="horizontal layout">
              <paper-dropdown-menu id="add-folder-host" label="Host">
                <paper-listbox slot="dropdown-content" selected="0">
                ${this.vhosts.map(item => html`
                  <paper-item id="${item}" label="${item}">${item}</paper-item>
                `)}
                </paper-listbox>
              </paper-dropdown-menu>
              <paper-dropdown-menu id="add-folder-type" label="Type">
                <paper-listbox slot="dropdown-content" selected="0">
                ${(this.allowed_folder_type as String[]).includes('user') ? html`
                  <paper-item label="user">User</paper-item>
                ` : html``}
                ${this.is_admin && (this.allowed_folder_type as String[]).includes('group') ? html`
                  <paper-item label="group">Group</paper-item>
                ` : html``}
                </paper-listbox>
              </paper-dropdown-menu>
            </div>
            ${this.is_admin && (this.allowed_folder_type as String[]).includes('group') ? html`
            <div class="horizontal layout">
              <paper-dropdown-menu id="add-folder-group" label="Group">
                <paper-listbox slot="dropdown-content" selected="0">
                ${(this.allowedGroups as any).map(item => html`
                  <paper-item id="${item.name}" label="${item.name}">${item.name}</paper-item>
                `)}
                </paper-listbox>
              </paper-dropdown-menu>
            </div>
            ` : html``}
            <br/>
            <wl-button class="blue button" type="button" id="add-button" outlined @click="${() => this._addFolder()}">
              <wl-icon>rowing</wl-icon>
              Create
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
    this.indicator = this.shadowRoot.querySelector('#loading-indicator');
    this.notification = window.lablupNotification;
    this.folderLists = this.shadowRoot.querySelectorAll('backend-ai-storage-list');
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    if (typeof window.backendaiclient === "undefined" || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.is_admin = window.backendaiclient.is_admin;
        this.authenticated = true;
        window.backendaiclient.vfolder.allowed_types().then(response => {
          this.allowed_folder_type = response;
        });
      }, true);
    } else {
      this.is_admin = window.backendaiclient.is_admin;
      this.authenticated = true;
      window.backendaiclient.vfolder.allowed_types().then(response => {
        this.allowed_folder_type = response;
      });
    }
  }

  async _addFolderDialog() {
    let vhost_info = await window.backendaiclient.vfolder.list_hosts();
    this.vhosts = vhost_info.allowed;
    this.vhost = vhost_info.default;
    if ((this.allowed_folder_type as String[]).includes('group')) {
      const group_info = await window.backendaiclient.group.list();
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
    let name = this.shadowRoot.querySelector('#add-folder-name').value;
    let host = this.shadowRoot.querySelector('#add-folder-host').value;
    let type = this.shadowRoot.querySelector('#add-folder-type').value;
    let group;
    if (['user', 'group'].includes(type) === false) {
      type = 'user';
    }
    if (type == 'user') {
      group = '';
    } else {
      if (this.is_admin) {
        group = this.shadowRoot.querySelector('#add-folder-group').value;
      } else {
        group = window.backendaiclient.current_group;
      }
    }
    let job = window.backendaiclient.vfolder.create(name, host, group);
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
