/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, customElement, html} from "lit-element";
import {render} from 'lit-html';
import {BackendAIPage} from './backend-ai-page';

import '@polymer/iron-icons/social-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-item/paper-item';
import './lablup-loading-indicator';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';

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


import '../plastics/lablup-shields/lablup-shields';
import {default as PainKiller} from './backend-ai-painkiller';

import {BackendAiStyles} from "./backend-ai-console-styles";
import {IronFlex, IronFlexAlignment, IronPositioning} from "../plastics/layout/iron-flex-layout-classes";

@customElement("backend-ai-data-view")
export default class BackendAIData extends BackendAIPage {
  public folders: any;
  public folderInfo: any;
  public is_admin: any;
  public authenticated: any;
  public deleteFolderId: any;
  public explorer: any;
  public explorerFiles: any;
  public invitees: any;
  public selectedFolder: any;
  public uploadFiles: any;
  public vhost: any;
  public vhosts: any;
  public allowedGroups: any;
  public uploadFilesExist: any;
  public _boundIndexRenderer: any;
  public _boundTypeRenderer: any;
  public _boundControlFolderListRenderer: any;
  public _boundControlFileListRenderer: any;
  public _boundPermissionViewRenderer: any;
  public _boundFileNameRenderer: any;
  public _boundCreatedTimeRenderer: any;
  public _boundPermissionRenderer: any;
  public shadowRoot: any;
  public fileListGrid: any;
  public notification: any;
  public deleteFileDialog: any;
  public indicator: any;
  public updateComplete: any;
  public allowed_folder_type: any;

  constructor() {
    super();
    // Resolve warning about scroll performance
    // See https://developers.google.com/web/updates/2016/06/passive-event-listeners
    this.folders = {};
    this.folderInfo = {};
    this.is_admin = false;
    this.authenticated = false;
    this.deleteFolderId = '';
    this.active = false;
    this.explorer = {};
    this.explorerFiles = [];
    this.invitees = [];
    this.selectedFolder = '';
    this.uploadFiles = [];
    this.vhost = '';
    this.vhosts = [];
    this.allowedGroups = [];
    this.uploadFilesExist = false;
    this.allowed_folder_type = [];
    this._boundIndexRenderer = this.indexRenderer.bind(this);
    this._boundTypeRenderer = this.typeRenderer.bind(this);
    this._boundControlFolderListRenderer = this.controlFolderListRenderer.bind(this);
    this._boundControlFileListRenderer = this.controlFileListRenderer.bind(this);
    this._boundPermissionViewRenderer = this.permissionViewRenderer.bind(this);
    this._boundFileNameRenderer = this.fileNameRenderer.bind(this);
    this._boundCreatedTimeRenderer = this.createdTimeRenderer.bind(this);
    this._boundPermissionRenderer = this.permissionRenderer.bind(this);
  }

  static get properties() {
    return {
      folders: {
        type: Object
      },
      folderInfo: {
        type: Object
      },
      fileListGrid: {
        type: Object
      },
      is_admin: {
        type: Boolean
      },
      authenticated: {
        type: Boolean
      },
      deleteFolderId: {
        type: String
      },
      active: {
        type: Boolean
      },
      explorer: {
        type: Object
      },
      explorerFiles: {
        type: Array
      },
      uploadFiles: {
        type: Array
      },
      uploadFilesExist: {
        type: Boolean
      },
      vhost: {
        type: String
      },
      vhosts: {
        type: Array
      },
      allowedGroups: {
        type: Array
      },
      invitees: {
        type: Array
      },
      deleteFileDialog: {
        type: Object
      },
      notification: {
        type: Object
      },
      indicator: {
        type: Object
      }
    };
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

        paper-icon-button.tiny {
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

        @media screen and (max-width: 899px) {
          #folder-explorer-dialog {
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

  _toggleCheckbox() {
    let buttons = this.shadowRoot.querySelectorAll(".multiple-action-buttons");
    if (this.fileListGrid.selectedItems.length > 0) {
      [].forEach.call(buttons, (e: HTMLElement) => {
        e.style.display = 'block';
      });
    } else {
      [].forEach.call(buttons, (e: HTMLElement) => {
        e.style.display = 'none';
      });
    }
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

        <vaadin-grid class="folderlist" theme="row-stripes column-borders compact" aria-label="Folder list" .items="${this.folders}">
          <vaadin-grid-column width="40px" flex-grow="0" resizable header="#" .renderer="${this._boundIndexRenderer}">
          </vaadin-grid-column>
          <vaadin-grid-column resizable header="Name">
            <template>
              <div class="indicator" @click="[[_folderExplorer()]]" .folder-id="[[item.name]]">[[item.name]]</div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column resizable>
            <template class="header">id</template>
            <template>
              <div class="layout vertical">
                <span class="indicator">[[item.id]]</span>
              </div>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column width="85px" flex-grow="0" resizable header="Location">
            <template>
              <div class="layout vertical">
                <span>[[item.host]]</span>
              </div>
            </template>
          </vaadin-grid-column>
          <vaadin-grid-column width="45px" flex-grow="0" resizable header="Type" .renderer="${this._boundTypeRenderer}"></vaadin-grid-column>
          <vaadin-grid-column width="85px" flex-grow="0" resizable header="Permission" .renderer="${this._boundPermissionViewRenderer}"></vaadin-grid-column>
          <vaadin-grid-column resizable header="Control" .renderer="${this._boundControlFolderListRenderer}"></vaadin-grid-column>
        </vaadin-grid>
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
            <paper-input id="add-folder-name" label="Folder name" pattern="[a-zA-Z0-9_-]*"
                         error-message="Allows letters, numbers and -_." auto-validate></paper-input>
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
                ${this.allowed_folder_type.includes('user') ? html`
                  <paper-item label="user">User</paper-item>
                ` : html``}
                ${this.is_admin && this.allowed_folder_type.includes('group') ? html`
                  <paper-item label="group">Group</paper-item>
                ` : html``}
                </paper-listbox>
              </paper-dropdown-menu>
            </div>
            ${this.is_admin && this.allowed_folder_type.includes('group') ? html`
            <div class="horizontal layout">
              <paper-dropdown-menu id="add-folder-group" label="Group">
                <paper-listbox slot="dropdown-content" selected="0">
                ${this.allowedGroups.map(item => html`
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
      <wl-dialog id="delete-folder-dialog" class="dialog-ask" fixed backdrop blockscrolling>
        <wl-card class="login-panel intro centered">
          <h3 class="horizontal center layout">
            <span>Delete a folder</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <section>
            <div class="warning">WARNING: this cannot be undone!</div>
            <div>
              <paper-input class="red" id="delete-folder-name" label="Type folder name to delete"
                           pattern="[a-zA-Z0-9_-]*"
                           error-message="Allows letters, numbers and -_." auto-validate></paper-input>
              <br/>
              <wl-button class="blue button" type="submit" id="delete-button" outlined @click="${() => this._deleteFolderWithCheck()}">
                <wl-icon>close</wl-icon>
                Delete
              </wl-button>
            </div>
            </section>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="info-folder-dialog" class="dialog-ask" fixed backdrop blockscrolling>
        <wl-card class="intro centered" style="margin: 0;">
          <h3 class="horizontal center layout" style="border-bottom:1px solid #ddd;">
            <span>${this.folderInfo.name}</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <div role="listbox" style="margin: 0;">
            <vaadin-item>
              <div><strong>ID</strong></div>
              <div secondary>${this.folderInfo.id}</div>
            </vaadin-item>
            <vaadin-item>
              <div><strong>Location</strong></div>
              <div secondary>${this.folderInfo.host}</div>
            </vaadin-item>
            <vaadin-item>
              <div><strong>Number of Files</strong></div>
              <div secondary>${this.folderInfo.numFiles}</div>
            </vaadin-item>
            ${this.folderInfo.is_owner ? html`
              <vaadin-item>
                <div><strong>Ownership</strong></div>
                <div secondary>You are the owner of this folder.</div>
              </vaadin-item>
            ` : html``}
            <vaadin-item>
              <div><strong>Permission</strong></div>
              <div secondary>${this.folderInfo.permission}</div>
            </vaadin-item>
          </div>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="folder-explorer-dialog">
        <wl-card>
          <h3 class="horizontal center layout" style="font-weight:bold">
            <span>${this.explorer.id}</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>

          <div class="breadcrumb">
          ${this.explorer.breadcrumb ? html`
              ${this.explorer.breadcrumb.map(item => html`
               <wl-icon>keyboard_arrow_right</wl-icon>
               <wl-button outlined class="goto" path="item" @click="${(e) => this._gotoFolder(e)}" dest="${item}">${item}</wl-button>
              `)}
              ` : html``}
          </div>
          <div class="horizontal layout folder-action-buttons">
            <wl-button outlined class="multiple-action-buttons" @click="${() => this._openDeleteMultipleFileDialog()}" style="display:none;">
              <div class="horizontal center layout">
              <wl-icon style="--icon-size: 20px;margin-right:5px;">delete</wl-icon><span>Delete...</span></div>
            </wl-button>
            <wl-button outlined id="add-btn" @click="${(e) => this._uploadFileBtnClick(e)}">
              <wl-icon style="--icon-size: 20px;margin-right:5px;">cloud_upload</wl-icon>
              Upload Files...
            </wl-button>
            <wl-button outlined id="mkdir" @click="${() => this._mkdirDialog()}">
              <wl-icon style="--icon-size: 20px;margin-right:5px;">create_new_folder</wl-icon>
              New Folder
            </wl-button>
          </div>

          <div id="dropzone"><p>drag</p></div>
          <input type="file" id="fileInput" @change="${(e) => this._uploadFileChange(e)}" hidden multiple>
          ${this.uploadFilesExist ? html`
          <vaadin-grid class="progress" theme="row-stripes compact" aria-label="uploadFiles" .items="${this.uploadFiles}"
                       height-by-rows>
            <vaadin-grid-column width="100px" flex-grow="0">
              <template>
                <vaadin-item class="progress-item">
                  <div>
                    <template is="dom-if" if="[[item.complete]]">
                      <wl-icon>check</wl-icon>
                    </template>
                  </div>
                </vaadin-item>
              </template>
            </vaadin-grid-column>

            <vaadin-grid-column>
              <template>
                <vaadin-item>
                  <span>[[item.name]]</span>
                  <template is="dom-if" if="[[!item.complete]]">
                    <div>
                      <vaadin-progress-bar indeterminate value="0"></vaadin-progress-bar>
                    </div>
                  </template>
                </vaadin-item>
              </template>
            </vaadin-grid-column>
          </vaadin-grid>` : html``}
          <vaadin-grid id="fileList-grid" class="explorer" theme="row-stripes compact" aria-label="Explorer" .items="${this.explorerFiles}">
            <vaadin-grid-selection-column auto-select></vaadin-grid-selection-column>
            <vaadin-grid-column width="40px" flex-grow="0" resizable header="#" .renderer="${this._boundIndexRenderer}">
            </vaadin-grid-column>

            <vaadin-grid-sort-column flex-grow="2" resizable header="Name" path="filename" .renderer="${this._boundFileNameRenderer}">
            </vaadin-grid-sort-column>

            <vaadin-grid-sort-column flex-grow="2" resizable header="Created" path="ctime" .renderer="${this._boundCreatedTimeRenderer}">
            </vaadin-grid-sort-column>

            <vaadin-grid-column flex-grow="1" resizable>
              <template class="header">
                <vaadin-grid-sorter path="size">Size</vaadin-grid-sorter>
              </template>
              <template>
                <div class="layout vertical">
                  <span>[[item.size]]</span>
                </div>
              </template>
            </vaadin-grid-column>
            <vaadin-grid-column resizable flex-grow="2" header="Actions" .renderer="${this._boundControlFileListRenderer}"></vaadin-grid-column>
          </vaadin-grid>
        </wl-card>
      </wl-dialog>

      <wl-dialog id="mkdir-dialog" class="dialog-ask" fixed blockscrolling backdrop>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Create a new folder</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <section>
            <paper-input id="mkdir-name" label="Folder name" pattern="[a-zA-Z0-9_-]*"
                         error-message="Allows letters, numbers and -_." auto-validate></paper-input>
            <br/>
            <wl-button class="blue button" type="submit" id="mkdir-btn" @click="${(e) => this._mkdir(e)}" outlined>
              <wl-icon>rowing</wl-icon>
              Create
            </wl-button>
          </section>
        </wl-card>
      </wl-dialog>

      <wl-dialog
        id="share-folder-dialog"
        class="dialog-ask"
        fixed
        backdrop
        blockscrolling
      >
        <wl-card class="intro centered" style="margin: 0;">
          <h3 class="horizontal center layout" style="border-bottom:1px solid #ddd;">
            <span>Share Folder</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <div role="listbox" style="margin: 0; padding: 20px 25px 25px 25px;">
            <div style="margin: 10px 0px">People</div>
            <div style="display: flex;">
              <div id="textfields" style="flex-grow: 2">
                <wl-textfield type="email" label="Enter e-mail address"></wl-textfield>
              </div>
              <div>
                <wl-button fab flat @click="${(e) => this._addTextField(e)}">
                  <wl-icon>add</wl-icon>
                </wl-button>
                <wl-button fab flat @click="${(e) => this._removeTextField(e)}">
                  <wl-icon>remove</wl-icon>
                </wl-button>
              </div>
            </div>
            <div style="margin: 10px 0px">Permissions</div>
            <div style="display: flex; justify-content: space-evenly;">
              <wl-label>
                <wl-checkbox checked disabled></wl-checkbox>
                View
              </wl-label>
              <wl-label>
                <wl-checkbox id="share-folder-write"></wl-checkbox>
                Edit
              </wl-label>
            </div>

            <wl-button
              type="button"
              outlined
              id="share-button"
              style="width: 100%; box-sizing: border-box;"
              @click=${e => this._shareFolder(e)}
            >
              <wl-icon>share</wl-icon>
              Share
            </wl-button>
          </div>
        </wl-card>
      </wl-dialog>
      <wl-dialog
        id="modify-permission-dialog"
        class="dialog-ask"
        fixed backdrop blockscrolling
      >
        <wl-card class="intro" style="margin: 0; width: 100%;">
          <h3 class="horizontal center layout" style="border-bottom:1px solid #ddd;">
            <span>Modify Permissions</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <div role="listbox" style="margin: 0; padding: 10px;">
            <vaadin-grid theme="row-stripes column-borders compact" .items="${this.invitees}">
              <vaadin-grid-column
                width="30px"
                flex-grow="0"
                header="#"
                .renderer="${this._boundIndexRenderer}"
              ></vaadin-grid-column>
              <vaadin-grid-column header="Invitee Email">
                <template>
                  <div>[[item.shared_to.email]]</div>
                </template>
              </vaadin-grid-column>
              <vaadin-grid-column header="Permission" .renderer="${this._boundPermissionRenderer}">
              </vaadin-grid-column>
            </vaadin-grid>
          </div>
        </wl-card>
        <div slot="footer">
          <wl-button
            type="button"
            outlined
            style="width: 100%; box-sizing: border-box;"
            @click=${this._modifySharedFolderPermissions}
          >
            <wl-icon>check</wl-icon>
            Save Changes
          </wl-button>
        </div>
      </wl-dialog>
      <wl-dialog id="delete-file-dialog" fixed backdrop blockscrolling>
         <wl-title level="3" slot="header">Let's double-check</wl-title>
         <div slot="content">
            <p>This action cannot be undone. Do you want to proceed?</p>
         </div>
         <div slot="footer">
            <wl-button inverted flat @click="${(e) => this._hideDialog(e)}">Cancel</wl-button>
            <wl-button @click="${(e) => this._deleteFileWithCheck(e)}">Okay</wl-button>
         </div>
      </wl-dialog>

    `;
  }

  _modifySharedFolderPermissions() {
    const selectNodeList = this.shadowRoot.querySelectorAll('#modify-permission-dialog wl-select');
    const inputList = Array.prototype.filter.call(selectNodeList, (pulldown, idx) => pulldown.value !== this.invitees[idx].perm)
      .map((pulldown, idx) => ({
        'perm': pulldown.value,
        'user': this.invitees[idx].shared_to.uuid,
        'vfolder': this.invitees[idx].vfolder_id
      }));
    const promiseArray = inputList.map(input => window.backendaiclient.vfolder.modify_invitee_permission(input));
    Promise.all(promiseArray).then((response: any) => {
      if (response.length === 0) {
        this.notification.text = 'No changes made.';
      } else {
        this.notification.text = 'Permission successfully modified.';
      }
      this.notification.show();
      this.shadowRoot.querySelector('#modify-permission-dialog').hide();
    })
  }

  permissionRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div>
          <wl-select outlined label="Select Permission">
            <option ?selected=${rowData.item.perm === 'ro'} value="ro">View</option>
            <option ?selected=${rowData.item.perm === 'rw'} value="rw">Edit</option>
            <option ?selected=${rowData.item.perm === 'wd'} value="wd">Edit+Delete</option>
          </wl-select>
        </div>
      `, root
    )
  }

  _addTextField(e) {
    let newTextField = document.createElement('wl-textfield');
    newTextField.label = "Enter e-mail address";
    newTextField.type = "email";

    this.shadowRoot.querySelector('#textfields').appendChild(newTextField)
  }

  _removeTextField(e) {
    const textfields = this.shadowRoot.querySelector('#textfields');
    textfields.removeChild(textfields.lastChild);
  }

  indexRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`${this._indexFrom1(rowData.index)}`, root
    );
  }

  controlFolderListRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div
          id="controls"
          class="layout horizontal flex center"
          folder-id="${rowData.item.name}"
        >
          <paper-icon-button
            class="fg green controls-running"
            icon="vaadin:info-circle-o"
            @click="${(e) => this._infoFolder(e)}"
          ></paper-icon-button>

          ${this._hasPermission(rowData.item, 'r')
        ? html`
              <paper-icon-button
                class="fg blue controls-running"
                icon="folder-open"
                @click="${(e) => this._folderExplorer(e)}" .folder-id="${rowData.item.name}"
              ></paper-icon-button>
            `
        : html``
      }

          ${this._hasPermission(rowData.item, 'w') ? html`` : html``}

          ${rowData.item.is_owner && rowData.item.type == 'user'
        ? html`
              <paper-icon-button
                class="fg blue controls-running"
                icon="social:share"
                @click="${(e) => this._shareFolderDialog(e)}"
              ></paper-icon-button>
            `
        : html``
      }

          ${rowData.item.is_owner
        ? html`
              <paper-icon-button
                class="fg cyan controls-running"
                icon="perm-identity"
                @click=${e => this._modifyPermissionDialog(rowData.item.id)}
              ></paper-icon-button>
            `
        : html``
      }

          ${this._hasPermission(rowData.item, 'd')
        ? html`
              <paper-icon-button
                class="fg red controls-running"
                icon="delete"
                @click="${(e) => this._deleteFolderDialog(e)}"
              ></paper-icon-button>
            `
        : html``
      }
        </div>
       `, root
    );
  }

  controlFileListRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        ${!this._isDir(rowData.item) && this._isDownloadable(rowData.item) ?
        html`
            <paper-icon-button id="download-btn" class="tiny fg blue" icon="vaadin:download"
                               filename="${rowData.item.filename}" @click="${(e) => this._downloadFile(e)}"></paper-icon-button>
            <paper-icon-button id="delete-btn" class="tiny fg red" icon="vaadin:trash"
                               filename="${rowData.item.filename}" @click="${(e) => this._openDeleteFileDialog(e)}"></paper-icon-button>
                               ` : html``}
       `, root
    );
  }

  fileNameRenderer(root, column?, rowData?) {
    render(
      html`
        ${this._isDir(rowData.item) ?
        html`
          <div class="indicator" @click="${(e) => this._enqueueFolder(e)}" name="${rowData.item.filename}">
            <paper-icon-button class="fg controls-running" icon="folder-open"
                               name="${rowData.item.filename}"></paper-icon-button>
            ${rowData.item.filename}
          </div>
       ` : html`
          <div class="indicator">
            <paper-icon-button class="fg controls-running" icon="insert-drive-file"></paper-icon-button>
            ${rowData.item.filename}
          </div>
       `}
      `, root
    );
  }

  permissionViewRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="horizontal center-justified wrap layout">
        ${this._hasPermission(rowData.item, 'r') ? html`
            <lablup-shields app="" color="green"
                            description="R" ui="flat"></lablup-shields>` : html``}
        ${this._hasPermission(rowData.item, 'w') ? html`
            <lablup-shields app="" color="blue"
                            description="W" ui="flat"></lablup-shields>` : html``}
        ${this._hasPermission(rowData.item, 'd') ? html`
            <lablup-shields app="" color="red"
                            description="D" ui="flat"></lablup-shields>` : html``}
        </div>`, root
    )
  }

  createdTimeRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout vertical">
            <span>${this._humanReadableTime(rowData.item.ctime)}</span>
        </div>`, root
    )
  }

  typeRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout vertical center-justified">
        ${rowData.item.type == 'user' ? html`
          <wl-icon>person</wl-icon>
        ` : html`
          <wl-icon>group</wl-icon>
        `}
        </div>`, root
    )
  }

  firstUpdated() {
    this._addEventListenerDropZone();
    this._mkdir = this._mkdir.bind(this);

    this.deleteFileDialog = this.shadowRoot.querySelector('#delete-file-dialog');
    this.fileListGrid = this.shadowRoot.querySelector('#fileList-grid');
    this.fileListGrid.addEventListener('selected-items-changed', () => {
      this._toggleCheckbox();
    });
    this.indicator = this.shadowRoot.querySelector('#loading-indicator');
    this.notification = window.lablupNotification;

    document.addEventListener('backend-ai-group-changed', (e) => this._refreshFolderList());
  }

  _refreshFolderList() {
    this.indicator.show();
    let groupId = null;
    groupId = window.backendaiclient.current_group_id();
    let l = window.backendaiclient.vfolder.list(groupId);
    l.then((value) => {
      this.indicator.hide();
      this.folders = value;
    });
    let vhosts = window.backendaiclient.vfolder.list_hosts();
    vhosts.then((response) => {
    });
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
        this._refreshFolderList();
      }, true);
    } else {
      this.is_admin = window.backendaiclient.is_admin;
      this.authenticated = true;
      window.backendaiclient.vfolder.allowed_types().then(response => {
        this.allowed_folder_type = response;
      });
      this._refreshFolderList();
    }
  }

  async _addFolderDialog() {
    let vhost_info = await window.backendaiclient.vfolder.list_hosts();
    this.vhosts = vhost_info.allowed;
    this.vhost = vhost_info.default;
    if (this.allowed_folder_type.includes('group')) {
      const group_info = await window.backendaiclient.group.list();
      this.allowedGroups = group_info.groups;
    }
    this.openDialog('add-folder-dialog');
  }

  _folderExplorerDialog() {
    this.openDialog('folder-explorer-dialog');
  }

  _mkdirDialog() {
    this.shadowRoot.querySelector('#mkdir-name').value = '';
    this.openDialog('mkdir-dialog');
  }

  openDialog(id) {
    //var body = document.querySelector('body');
    //body.appendChild(this.$[id]);
    this.shadowRoot.querySelector('#' + id).show();
  }

  closeDialog(id) {
    this.shadowRoot.querySelector('#' + id).hide();
  }

  _indexFrom1(index) {
    return index + 1;
  }

  _hasPermission(item, perm) {
    if (item.permission.includes(perm)) {
      return true;
    }
    if (item.permission.includes('w') && perm === 'r') {
      return true;
    }
    return false;
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
        this.notification.show(true);
      }
    });
    this.closeDialog('add-folder-dialog');
  }

  _getControlId(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const folderId = controls.getAttribute('folder-id');
    return folderId;
  }

  _infoFolder(e) {
    const folderId = this._getControlId(e);
    let job = window.backendaiclient.vfolder.info(folderId);
    job.then((value) => {
      this.folderInfo = value;
      this.openDialog('info-folder-dialog');
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true);
      }
    });
  }

  _deleteFolderDialog(e) {
    this.deleteFolderId = this._getControlId(e);
    this.shadowRoot.querySelector('#delete-folder-name').value = '';
    this.openDialog('delete-folder-dialog');
  }

  _deleteFolderWithCheck() {
    let typedDeleteFolderName = this.shadowRoot.querySelector('#delete-folder-name').value;
    if (typedDeleteFolderName != this.deleteFolderId) {
      this.notification.text = 'Folder name mismatched. Check your typing.';
      this.notification.show();
      return;
    }
    this.closeDialog('delete-folder-dialog');
    this._deleteFolder(this.deleteFolderId);
  }

  _deleteFolder(folderId) {
    let job = window.backendaiclient.vfolder.delete(folderId);
    job.then((value) => {
      this.notification.text = 'Folder is successfully deleted.';
      this.notification.show();
      this._refreshFolderList();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true);
      }
    });
  }

  /*Folder Explorer*/
  _clearExplorer(path = this.explorer.breadcrumb.join('/'),
                 id = this.explorer.id,
                 dialog = false) {
    let job = window.backendaiclient.vfolder.list_files(path, id);
    job.then(value => {
      this.shadowRoot.querySelector('#fileList-grid').selectedItems = [];
      this.explorer.files = JSON.parse(value.files);
      this.explorerFiles = this.explorer.files;
      if (dialog) {
        this.openDialog('folder-explorer-dialog');
      }
    });
  }

  _folderExplorer(e) {
    let folderId = this._getControlId(e);
    let explorer = {
      id: folderId,
      breadcrumb: ['.'],
    };

    this.explorer = explorer;
    this._clearExplorer(explorer.breadcrumb.join('/'), explorer.id, true);
  }

  _enqueueFolder(e) {
    const fn = e.target.getAttribute('name');
    this.explorer.breadcrumb.push(fn);
    this._clearExplorer();
  }

  _gotoFolder(e) {
    const dest = e.target.getAttribute('dest');
    let tempBreadcrumb = this.explorer.breadcrumb;
    const index = tempBreadcrumb.indexOf(dest);

    if (index === -1) {
      return;
    }

    tempBreadcrumb = tempBreadcrumb.slice(0, index + 1);

    this.explorer.breadcrumb = tempBreadcrumb;
    this._clearExplorer(tempBreadcrumb.join('/'), this.explorer.id, false);
  }

  _mkdir(e) {
    const newfolder = this.shadowRoot.querySelector('#mkdir-name').value;
    const explorer = this.explorer;
    let job = window.backendaiclient.vfolder.mkdir([...explorer.breadcrumb, newfolder].join('/'), explorer.id);
    job.then(res => {
      this.closeDialog('mkdir-dialog');
      this._clearExplorer();
    });
  }

  _isDir(file) {
    return file.mode.startsWith("d");
  }

  /* File upload and download */
  _addEventListenerDropZone() {
    const dndZoneEl = this.shadowRoot.querySelector('#folder-explorer-dialog');
    const dndZonePlaceholderEl = this.shadowRoot.querySelector('#dropzone');

    dndZonePlaceholderEl.addEventListener('dragleave', () => {
      dndZonePlaceholderEl.style.display = "none";
    });

    dndZoneEl.addEventListener('dragover', e => {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      dndZonePlaceholderEl.style.display = "flex";
      return false;
    });

    dndZoneEl.addEventListener('drop', e => {
      e.stopPropagation();
      e.preventDefault();
      dndZonePlaceholderEl.style.display = "none";

      let temp: any = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.size > 2 ** 20) {
          console.log('File size limit (< 1 MiB)');
        } else {
          file.progress = 0;
          file.error = false;
          file.complete = false;
          temp.push(file);
          this.uploadFiles.push(file);
        }
      }

      for (let i = 0; i < temp.length; i++) {
        this.fileUpload(temp[i]);
        this._clearExplorer();
      }
    });
  }

  _uploadFileBtnClick(e) {
    const elem = this.shadowRoot.querySelector('#fileInput');
    if (elem && document.createEvent) {  // sanity check
      const evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
    }
  }

  _uploadFileChange(e) {
    const length = e.target.files.length;
    for (let i = 0; i < length; i++) {
      const file = e.target.files[i];

      let text = "";
      let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

      file.id = text;
      file.progress = 0;
      file.error = false;
      file.complete = false;
      this.uploadFiles.push(file);
    }

    for (let i = 0; i < length; i++) {
      this.fileUpload(this.uploadFiles[i]);
    }

    this.shadowRoot.querySelector('#fileInput').value = '';
  }

  fileUpload(fileObj) {
    this.uploadFilesExist = this.uploadFiles.length > 0 ? true : false;
    const fd = new FormData();
    const explorer = this.explorer;
    const path = explorer.breadcrumb.concat(fileObj.name).join("/");
    fd.append("src", fileObj, path);
    let job = window.backendaiclient.vfolder.uploadFormData(fd, explorer.id);
    job.then(resp => {
      this._clearExplorer();
      this.uploadFiles[this.uploadFiles.indexOf(fileObj)].complete = true;
      this.uploadFiles = this.uploadFiles.slice();
      setTimeout(() => {
        this.uploadFiles.splice(this.uploadFiles.indexOf(fileObj), 1);
        this.uploadFilesExist = this.uploadFiles.length > 0 ? true : false;
        this.uploadFiles = this.uploadFiles.slice();
      }, 1000);
    });
  }

  _downloadFile(e) {
    let fn = e.target.getAttribute("filename");
    let path = this.explorer.breadcrumb.concat(fn).join("/");
    let job = window.backendaiclient.vfolder.download(path, this.explorer.id);
    job.then(res => {
      const url = res.url;
      let a = document.createElement('a');
      a.addEventListener('click', function (e) {
        e.stopPropagation();
      });
      a.href = url;
      a.download = fn;
      document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
      a.click();
      a.remove();  //afterwards we remove the element again
      URL.revokeObjectURL(url);
    });
  }

  _openDeleteFileDialog(e) {
    let fn = e.target.getAttribute("filename");
    this.deleteFileDialog.filename = fn;
    this.deleteFileDialog.files = [];
    this.deleteFileDialog.show();
  }

  _openDeleteMultipleFileDialog(e?) {
    this.deleteFileDialog.files = this.fileListGrid.selectedItems;
    this.deleteFileDialog.filename = '';
    this.deleteFileDialog.show();
  }

  _deleteFileWithCheck(e) {
    let files = this.deleteFileDialog.files;
    if (files.length > 0) {
      let filenames: string[] = [];
      files.forEach((file) => {
        let filename = this.explorer.breadcrumb.concat(file.filename).join("/");
        filenames.push(filename);
      });
      let job = window.backendaiclient.vfolder.delete_files(filenames, true, this.explorer.id);
      job.then(res => {
        this.notification.text = 'Files deleted.';
        this.notification.show();
        this._clearExplorer();
        this.deleteFileDialog.hide();
      });
    } else {
      if (this.deleteFileDialog.filename != '') {
        let path = this.explorer.breadcrumb.concat(this.deleteFileDialog.filename).join("/");
        let job = window.backendaiclient.vfolder.delete_files([path], true, this.explorer.id);
        job.then(res => {
          this.notification.text = 'File deleted.';
          this.notification.show();
          this._clearExplorer();
          this.deleteFileDialog.hide();
        });
      }
    }
  }

  _deleteFile(e) {
    let fn = e.target.getAttribute("filename");
    let path = this.explorer.breadcrumb.concat(fn).join("/");
    let job = window.backendaiclient.vfolder.delete_files([path], true, this.explorer.id);
    job.then(res => {
      this.notification.text = 'File deleted.';
      this.notification.show();
      this._clearExplorer();
    });
  }

  _humanReadableTime(d) {
    const date = new Date(d * 1000);
    const offset = date.getTimezoneOffset() / 60;
    const hours = date.getHours();
    date.setHours(hours - offset);
    return date.toUTCString();
  }

  _isDownloadable(file) {
    return true;
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  _shareFolderDialog(e) {
    this.selectedFolder = this._getControlId(e);

    this.openDialog('share-folder-dialog');
  }

  _modifyPermissionDialog(vfolder_id) {
    window.backendaiclient.vfolder.list_invitees(vfolder_id)
      .then(res => {
        this.invitees = res.shared;
        this.openDialog('modify-permission-dialog');
      })
  }

  _shareFolder(e) {
    // the .children property is an HtmlCollection. They don't have the map function like an array would
    const emailHtmlCollection = this.shadowRoot.querySelector('#textfields').children;

    // filter invalid and empty fields
    const emailArray = Array.prototype.filter.call(emailHtmlCollection, e => !e.hasAttribute('invalid') && e.value !== '').map(e => e.value.trim());
    const permission = 'r' + (this.shadowRoot.querySelector('#share-folder-write').checked ? 'w' : 'o');

    if (emailArray.length === 0) {
      this.notification.text = 'No valid emails were entered';
      this.notification.show();
      this.shadowRoot.querySelector('#share-folder-dialog').hide();
      for (let element of emailHtmlCollection) {
        element.value = '';
      }
      return;
    }

    window.backendaiclient.vfolder.invite(permission, emailArray, this.selectedFolder)
      .then(res => {
        let msg;
        if (res.invited_ids && res.invited_ids.length > 0) {
          msg = res.invited_ids.reduce((cur, val) => cur + val + " ", "") + (emailArray.length === 1 ? 'was' : 'were') + " successfully invited";
        } else {
          msg = "No one was invited";
        }
        this.notification.text = msg;
        this.notification.show();
        this.shadowRoot.querySelector('#share-folder-dialog').hide();
        for (let element of emailHtmlCollection) {
          element.value = '';
        }
      })
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-data-view": BackendAIData;
  }
}
