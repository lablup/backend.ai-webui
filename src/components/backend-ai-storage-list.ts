/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {render} from 'lit-html';
import {BackendAIPage} from './backend-ai-page';

import '@polymer/paper-item/paper-item';
import './lablup-loading-spinner';
import './backend-ai-dialog';
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
import {default as PainKiller} from './backend-ai-painkiller';
import tus from '../lib/tus';

import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment, IronPositioning} from "../plastics/layout/iron-flex-layout-classes";

@customElement("backend-ai-storage-list")
export default class BackendAiStorageList extends BackendAIPage {
  @property({type: String}) storageType = 'general';
  @property({type: Object}) folders = Object();
  @property({type: Object}) folderInfo = Object();
  @property({type: Boolean}) is_admin = false;
  @property({type: Boolean}) authenticated = false;
  @property({type: String}) renameFolderId = '';
  @property({type: String}) deleteFolderId = '';
  @property({type: Object}) explorer = Object();
  @property({type: Array}) explorerFiles = [];
  @property({type: Array}) invitees = [];
  @property({type: String}) selectedFolder = '';
  @property({type: String}) downloadURL = '';
  @property({type: Array}) uploadFiles = [];
  @property({type: Array}) fileUploadQueue = [];
  @property({type: Number}) fileUploadCount = 0;
  @property({type: Number}) concurrentFileUploadLimit = 2;
  @property({type: String}) vhost = '';
  @property({type: Array}) vhosts = [];
  @property({type: Array}) allowedGroups = [];
  @property({type: Object}) fileListGrid = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) renameFileDialog = Object();
  @property({type: Object}) deleteFileDialog = Object();
  @property({type: Object}) downloadFileDialog = Object();
  @property({type: Object}) spinner = Object();
  @property({type: Array}) allowed_folder_type = [];
  @property({type: Boolean}) uploadFilesExist = false;
  @property({type: Object}) _boundIndexRenderer = Object();
  @property({type: Object}) _boundTypeRenderer = Object();
  @property({type: Object}) _boundControlFolderListRenderer = Object();
  @property({type: Object}) _boundControlFileListRenderer = Object();
  @property({type: Object}) _boundPermissionViewRenderer = Object();
  @property({type: Object}) _boundFileNameRenderer = Object();
  @property({type: Object}) _boundCreatedTimeRenderer = Object();
  @property({type: Object}) _boundPermissionRenderer = Object();
  @property({type: Boolean}) _uploadFlag = true;

  constructor() {
    super();
    this._boundIndexRenderer = this.indexRenderer.bind(this);
    this._boundTypeRenderer = this.typeRenderer.bind(this);
    this._boundControlFolderListRenderer = this.controlFolderListRenderer.bind(this);
    this._boundControlFileListRenderer = this.controlFileListRenderer.bind(this);
    this._boundPermissionViewRenderer = this.permissionViewRenderer.bind(this);
    this._boundFileNameRenderer = this.fileNameRenderer.bind(this);
    this._boundCreatedTimeRenderer = this.createdTimeRenderer.bind(this);
    this._boundPermissionRenderer = this.permissionRenderer.bind(this);
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
        }

        vaadin-grid.folderlist {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 200px);
        }

        vaadin-grid.explorer {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 370px);
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

        .breadcrumb li:before {
          padding: 3px;
          transform: rotate(-45deg) translateY(-2px);
          transition: color ease-in .2s;
          border: solid;
          border-width: 0 2px 2px 0;
          border-color: #242424;
          margin-right: 10px;
          content: '';
          display: inline-block;
        }

        .breadcrumb li {
          display: inline-block;
          font-size: 16px;
        }

        .breadcrumb mwc-icon-button {
          --mdc-icon-size: 20px;
          --mdc-icon-button-size: 22px;
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
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <vaadin-grid class="folderlist" theme="row-stripes column-borders compact" aria-label="Folder list" .items="${this.folders}">
        <vaadin-grid-column width="40px" flex-grow="0" resizable header="#" text-align="center" .renderer="${this._boundIndexRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-column resizable header="${_t("data.folders.Name")}">
          <template>
            <div class="indicator" @click="[[_folderExplorer()]]" .folder-id="[[item.name]]">[[item.name]]</div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">id</template>
          <template>
            <div class="layout vertical">
              <span class="indicator monospace">[[item.id]]</span>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column width="85px" flex-grow="0" resizable header="${_t("data.folders.Location")}">
          <template>
            <div class="layout vertical">
              <span>[[item.host]]</span>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="45px" flex-grow="0" resizable header="${_t("data.folders.Type")}" .renderer="${this._boundTypeRenderer}"></vaadin-grid-column>
        <vaadin-grid-column width="85px" flex-grow="0" resizable header="${_t("data.folders.Permission")}" .renderer="${this._boundPermissionViewRenderer}"></vaadin-grid-column>
        <vaadin-grid-column resizable header="${_t("data.folders.Control")}" .renderer="${this._boundControlFolderListRenderer}"></vaadin-grid-column>
      </vaadin-grid>

      <wl-dialog id="rename-folder-dialog" class="dialog-ask" fixed backdrop blockscrolling>
        <wl-card class="login-panel intro centered">
          <h3 class="horizontal center layout">
            <span>${_t('data.folders.RenameAFolder')}</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <section>
            <div>
              <mwc-textfield class="red" id="new-folder-name" label="${_t('data.folders.TypeNewFolderName')}"
                pattern="[a-zA-Z0-9_-.]*"
                validationMessage="Allows letters, numbers and -_." auto-validate></mwc-textfield>
              <br/>
              <wl-button class="blue button" type="submit" id="rename-button" outlined @click="${() => this._renameFolder()}">
                <wl-icon>edit</wl-icon>
                ${_t('data.folders.Rename')}
              </wl-button>
            </div>
            </section>
        </wl-card>
      </wl-dialog>

      <backend-ai-dialog id="delete-folder-dialog">
        <span slot="title">${_t("data.folders.DeleteAFolder")}</span>
        <div slot="content" style="width:100%;">
          <div class="warning">${_t("dialog.warning.CannotBeUndone")}</div>
          <div>
            <mwc-textfield class="red" id="delete-folder-name" label="${_t('data.folders.TypeFolderNameToDelete')}"
                         pattern="[a-zA-Z0-9_-.]*"
                         validationMessage="Allows letters, numbers and -_." auto-validate></mwc-textfield>
          </div>
        </div>
        <div slot="footer">
          <wl-button class="blue button" type="submit" id="delete-button" outlined @click="${() => this._deleteFolderWithCheck()}">
            <wl-icon>close</wl-icon>
            ${_t("data.folders.Delete")}
          </wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="info-folder-dialog">
        <span slot="title">${this.folderInfo.name}</span>
        <div slot="content" role="listbox" style="margin: 0;width:100%;">
          <vaadin-item>
            <div><strong>ID</strong></div>
            <div class="monospace" secondary>${this.folderInfo.id}</div>
          </vaadin-item>
          <vaadin-item>
            <div><strong>${_t("data.folders.Location")}</strong></div>
            <div secondary>${this.folderInfo.host}</div>
          </vaadin-item>
          <vaadin-item>
            <div><strong>${_t("data.folders.NumberOfFiles")}</strong></div>
            <div secondary>${this.folderInfo.numFiles}</div>
          </vaadin-item>
          ${this.folderInfo.is_owner ? html`
            <vaadin-item>
              <div><strong>${_t("data.folders.Ownership")}</strong></div>
              <div secondary>${_t("data.folders.DescYouAreFolderOwner")}</div>
            </vaadin-item>
          ` : html``}
          <vaadin-item>
            <div><strong>${_t("data.folders.Permission")}</strong></div>
            <div secondary>${this.folderInfo.permission}</div>
          </vaadin-item>
        </div>
      </backend-ai-dialog>
      <wl-dialog id="folder-explorer-dialog" class="folder-explorer">
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
              <ul>
                ${this.explorer.breadcrumb.map(item => html`
                  <li>
                    ${item === '.' ? html`
                      <mwc-icon-button
                        icon="folder_open" dest="${item}"
                        @click="${(e) => this._gotoFolder(e)}"
                      ></mwc-icon-button>
                    ` : html`
                      <a outlined class="goto" path="item" @click="${(e) => this._gotoFolder(e)}" dest="${item}">${item}</a>
                    `}
                  </li>
                `)}
              </ul>
            ` : html``}
          </div>
          <div class="horizontal layout folder-action-buttons">
            <wl-button outlined class="multiple-action-buttons" @click="${() => this._openDeleteMultipleFileDialog()}" style="display:none;">
              <div class="horizontal center layout">
              <wl-icon style="--icon-size: 20px;margin-right:5px;">delete</wl-icon><span>${_t("data.explorer.Delete")}</span></div>
            </wl-button>
            <wl-button outlined id="add-btn" @click="${(e) => this._uploadFileBtnClick(e)}">
              <wl-icon style="--icon-size: 20px;margin-right:5px;">cloud_upload</wl-icon>
              ${_t("data.explorer.UploadFiles")}
            </wl-button>
            <wl-button outlined id="mkdir" @click="${() => this._mkdirDialog()}">
              <wl-icon style="--icon-size: 20px;margin-right:5px;">create_new_folder</wl-icon>
              ${_t("data.explorer.NewFolder")}
            </wl-button>
          </div>
          <div id="dropzone"><p>drag</p></div>
          <input type="file" id="fileInput" @change="${(e) => this._uploadFileChange(e)}" hidden multiple>
          ${this.uploadFilesExist ? html`
          <wl-button outlined id="cancel_upload" @click="${(e) => this._cancelUpload(e)}">
            <wl-icon>cancel</wl-icon> ${_t("data.explorer.StopUploading")}
          </wl-button>
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
                      <vaadin-progress-bar value="[[item.progress]]"></vaadin-progress-bar>
                    </div>
                    <div>
                      <span>[[item.caption]]</span>
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

            <vaadin-grid-sort-column flex-grow="2" resizable header="${_t("data.explorer.Name")}" path="filename" .renderer="${this._boundFileNameRenderer}">
            </vaadin-grid-sort-column>

            <vaadin-grid-sort-column flex-grow="2" resizable header="${_t("data.explorer.Created")}" path="ctime" .renderer="${this._boundCreatedTimeRenderer}">
            </vaadin-grid-sort-column>

            <vaadin-grid-column flex-grow="1" resizable>
              <template class="header">
                <vaadin-grid-sorter path="size">${_t("data.explorer.Size")}</vaadin-grid-sorter>
              </template>
              <template>
                <div class="layout vertical">
                  <span>[[item.size]]</span>
                </div>
              </template>
            </vaadin-grid-column>
            <vaadin-grid-column resizable flex-grow="2" header="${_t("data.explorer.Actions")}" .renderer="${this._boundControlFileListRenderer}"></vaadin-grid-column>
          </vaadin-grid>
        </wl-card>
      </wl-dialog>
      <backend-ai-dialog id="mkdir-dialog">
        <span slot="title">${_t("data.explorer.CreateANewFolder")}</span>
        <div slot="content">
          <mwc-textfield id="mkdir-name"
                         label="${_t("data.explorer.Foldername")}"
                         auto-validate
                         required
                         validationMessage="Value is required."></mwc-textfield>
          <br/>
          <wl-button class="blue button" type="submit" id="mkdir-btn" @click="${(e) => this._mkdir(e)}" outlined>
            <wl-icon>rowing</wl-icon>
            ${_t("button.Create")}
          </wl-button>
        </div>
        <div slot="footer">
          <wl-button class="blue button" type="submit" id="mkdir-btn" @click="${(e) => this._mkdir(e)}" outlined>
            <wl-icon>rowing</wl-icon>
            ${_t("button.Create")}
          </wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="share-folder-dialog">
        <span slot="title">${_t("data.explorer.ShareFolder")}</span>
        <div slot="content" role="listbox" style="margin: 0;width:100%;" >
          <div style="margin: 10px 0px">${_t("data.explorer.People")}</div>
          <div style="display: flex;">
            <div id="textfields" style="flex-grow: 2">
              <wl-textfield type="email" label="${_t("data.explorer.EnterEmailAddress")}"></wl-textfield>
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
          <div style="margin: 10px 0px">${_t("data.explorer.Permissions")}</div>
          <div style="display: flex; justify-content: space-evenly;">
            <wl-label>
              <wl-checkbox checked disabled></wl-checkbox>
              ${_t("button.View")}
            </wl-label>
            <wl-label>
              <wl-checkbox id="share-folder-write"></wl-checkbox>
              ${_t("button.Edit")}
            </wl-label>
          </div>
        </div>
        <wl-button slot="footer"
          type="button"
          outlined
          id="share-button"
          style="width: 100%; box-sizing: border-box;"
          @click=${e => this._shareFolder(e)}
        >
          <wl-icon>share</wl-icon>
          ${_t("button.Share")}
        </wl-button>
      </backend-ai-dialog>

      <wl-dialog
        id="modify-permission-dialog"
        class="dialog-ask"
        fixed backdrop blockscrolling
      >
        <wl-card class="intro" style="margin: 0; width: 100%;">
          <h3 class="horizontal center layout" style="border-bottom:1px solid #ddd;">
            <span>${_t("data.explorer.ModifyPermissions")}</span>
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
              <vaadin-grid-column header="${_t("data.explorer.InviteeEmail")}">
                <template>
                  <div>[[item.shared_to.email]]</div>
                </template>
              </vaadin-grid-column>
              <vaadin-grid-column header="${_t("data.explorer.Permission")}" .renderer="${this._boundPermissionRenderer}">
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
            ${_t("button.SaveChanges")}
          </wl-button>
        </div>
      </wl-dialog>
      <wl-dialog id="rename-file-dialog" class="dialog-ask" fixed backdrop blockscrolling>
        <wl-card class="login-panel intro centered">
          <h3 class="horizontal center layout">
            <span>${_t('data.explorer.RenameAFile')}</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <section>
            <div>
              <mwc-textfield class="red" id="new-file-name" label="${_t('data.explorer.NewFileName')}"></mwc-textfield>
              <div id="old-file-name" style="height:2.5em"></div>
              <wl-button class="blue button" type="submit" id="rename-file-button" outlined @click="${(e) => this._renameFile(e)}">
                <wl-icon>edit</wl-icon>
                ${_t('data.explorer.RenameAFile')}
              </wl-button>
            </div>
          </section>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="delete-file-dialog" fixed backdrop blockscrolling>
         <wl-title level="3" slot="header">${_t("dialog.title.LetsDouble-Check")}</wl-title>
         <div slot="content">
            <p>${_t("dialog.warning.CannotBeUndone")}
            ${_t("dialog.ask.DoYouWantToProceed")}</p>
         </div>
         <div slot="footer">
            <wl-button inverted flat @click="${(e) => this._hideDialog(e)}">${_t("button.Cancel")}</wl-button>
            <wl-button @click="${(e) => this._deleteFileWithCheck(e)}">${_t("button.Okay")}</wl-button>
         </div>
      </wl-dialog>
      <wl-dialog id="download-file-dialog" fixed backdrop blockscrolling>
         <wl-title level="3" slot="header">${_t("data.explorer.DownloadFile")}</wl-title>
         <div slot="content">
            <a href="${this.downloadURL}">
              <wl-button outlined>${_t("data.explorer.TouchToDownload")}</wl-button>
            </a>
         </div>
         <div slot="footer">
            <wl-button @click="${(e) => this._hideDialog(e)}">${_t("button.Close")}</wl-button>
         </div>
      </wl-dialog>
    `;
  }

  firstUpdated() {
    this._addEventListenerDropZone();
    this._mkdir = this._mkdir.bind(this);

    this.renameFileDialog = this.shadowRoot.querySelector('#rename-file-dialog');
    this.deleteFileDialog = this.shadowRoot.querySelector('#delete-file-dialog');
    this.downloadFileDialog = this.shadowRoot.querySelector('#download-file-dialog');
    this.fileListGrid = this.shadowRoot.querySelector('#fileList-grid');
    this.fileListGrid.addEventListener('selected-items-changed', () => {
      this._toggleCheckbox();
    });
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    let textfields = this.shadowRoot.querySelectorAll('mwc-textfield');
    for (const textfield of textfields) {
      this._addInputValidator(textfield);
    }
    document.addEventListener('backend-ai-group-changed', (e) => this._refreshFolderList());
    document.addEventListener('backend-ai-ui-changed', (e) => this._refreshFolderUI(e));
    this._refreshFolderUI({"detail": {"mini-ui": globalThis.mini_ui}});
    this._validatePathName();
  }

  _modifySharedFolderPermissions() {
    const selectNodeList = this.shadowRoot.querySelectorAll('#modify-permission-dialog wl-select');
    const inputList = Array.prototype.filter.call(selectNodeList, (pulldown, idx) => pulldown.value !== (this.invitees as any)[idx].perm)
      .map((pulldown, idx) => ({
        'perm': pulldown.value,
        'user': (this.invitees as any)[idx].shared_to.uuid,
        'vfolder': (this.invitees as any)[idx].vfolder_id
      }));
    const promiseArray = inputList.map(input => globalThis.backendaiclient.vfolder.modify_invitee_permission(input));
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
          <wl-select outlined label="${_t('data.folders.SelectPermission')}">
            <option ?selected=${rowData.item.perm === 'ro'} value="ro">${_t('data.folders.View')}</option>
            <option ?selected=${rowData.item.perm === 'rw'} value="rw">${_t('data.folders.Edit')}</option>
            <option ?selected=${rowData.item.perm === 'wd'} value="wd">${_t('data.folders.EditDelete')}</option>
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
          <mwc-icon-button
            class="fg green controls-running"
            icon="info"
            @click="${(e) => this._infoFolder(e)}"
          ></mwc-icon-button>

          ${this._hasPermission(rowData.item, 'r')
            ? html`
              <mwc-icon-button
                class="fg blue controls-running"
                icon="folder_open"
                @click="${(e) => this._folderExplorer(e)}" .folder-id="${rowData.item.name}"
              ></mwc-icon-button>
            `
            : html``
          }

          ${this._hasPermission(rowData.item, 'w') ? html`` : html``}

          ${rowData.item.is_owner && rowData.item.type == 'user'
            ? html`
              <mwc-icon-button
                class="fg blue controls-running"
                icon="share"
                @click="${(e) => this._shareFolderDialog(e)}"
              ></mwc-icon-button>
            `
            : html``
          }

          ${rowData.item.is_owner
            ? html`
              <mwc-icon-button
                class="fg cyan controls-running"
                icon="perm_identity"
                @click=${e => this._modifyPermissionDialog(rowData.item.id)}
              ></mwc-icon-button>
            `
            : html``
          }

          ${rowData.item.is_owner || this._hasPermission(rowData.item, 'd')
            ? html`
              <mwc-icon-button
                class="fg blue controls-running"
                icon="edit"
                @click="${(e) => this._renameFolderDialog(e)}"
              ></mwc-icon-button>
              <mwc-icon-button
                class="fg red controls-running"
                icon="delete"
                @click="${(e) => this._deleteFolderDialog(e)}"
              ></mwc-icon-button>
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
        <mwc-icon-button id="download-btn" class="tiny fg blue" icon="cloud_download"
            filename="${rowData.item.filename}" @click="${(e) => this._downloadFile(e)}"></mwc-icon-button>
        <mwc-icon-button id="rename-btn" class="tiny fg green" icon="edit" required
            filename="${rowData.item.filename}" @click="${this._openRenameFileDialog.bind(this)}"></mwc-icon-button>
        <mwc-icon-button id="delete-btn" class="tiny fg red" icon="delete_forever"
            filename="${rowData.item.filename}" @click="${(e) => this._openDeleteFileDialog(e)}"></mwc-icon-button>
       `, root
    );
  }

  fileNameRenderer(root, column?, rowData?) {
    render(
      html`
        ${this._isDir(rowData.item) ?
        html`
          <div class="indicator horizontal center layout" @click="${(e) => this._enqueueFolder(e)}" name="${rowData.item.filename}">
            <mwc-icon-button class="fg controls-running" icon="folder_open"
                               name="${rowData.item.filename}"></mwc-icon-button>
            ${rowData.item.filename}
          </div>
       ` : html`
          <div class="indicator horizontal center layout">
            <mwc-icon-button class="fg controls-running" icon="insert_drive_file"></mwc-icon-button>
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

  refreshFolderList() {
    return this._refreshFolderList();
  }

  _refreshFolderList() {
    this.spinner.show();
    let groupId = null;
    groupId = globalThis.backendaiclient.current_group_id();
    let l = globalThis.backendaiclient.vfolder.list(groupId);
    l.then((value) => {
      this.spinner.hide();
      let folders = value.filter(item => {
        if (this.storageType === 'general' && !item.name.startsWith('.')) {
          return item;
        } else if (this.storageType === 'automount' && item.name.startsWith('.')) {
          return item;
        }
      });
      this.folders = folders;
    });
    let vhosts = globalThis.backendaiclient.vfolder.list_hosts();
    vhosts.then((response) => {
    });
  }

  _refreshFolderUI(e) {
    let folder_explorer = this.shadowRoot.querySelector('#folder-explorer-dialog');
    if (e.detail.hasOwnProperty('mini-ui') && e.detail['mini-ui'] === true) {
      folder_explorer.classList.add('mini_ui');
    } else {
      folder_explorer.classList.remove('mini_ui');
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.is_admin = globalThis.backendaiclient.is_admin;
        this.authenticated = true;
        this._refreshFolderList();
      }, true);
    } else {
      this.is_admin = globalThis.backendaiclient.is_admin;
      this.authenticated = true;
      this._refreshFolderList();
    }
  }

  async _addFolderDialog() {
    let vhost_info = await globalThis.backendaiclient.vfolder.list_hosts();
    this.vhosts = vhost_info.allowed;
    this.vhost = vhost_info.default;
    if ((this.allowed_folder_type as String[]).includes('group')) {
      const group_info = await globalThis.backendaiclient.group.list();
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

  _getControlId(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const folderId = controls.getAttribute('folder-id');
    return folderId;
  }

  _infoFolder(e) {
    const folderId = this._getControlId(e);
    let job = globalThis.backendaiclient.vfolder.info(folderId);
    job.then((value) => {
      this.folderInfo = value;
      this.openDialog('info-folder-dialog');
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  _renameFolderDialog(e) {
    this.renameFolderId = this._getControlId(e);
    this.shadowRoot.querySelector('#new-folder-name').value = '';
    this.openDialog('rename-folder-dialog');
  }

  _renameFolder() {
    globalThis.backendaiclient.vfolder.name = this.renameFolderId;
    const newName = this.shadowRoot.querySelector('#new-folder-name').value;
    const job = globalThis.backendaiclient.vfolder.rename(newName);
    this.closeDialog('rename-folder-dialog');
    job.then((value) => {
      this.notification.text = _text('data.folders.FolderRenamed');
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
    let job = globalThis.backendaiclient.vfolder.delete(folderId);
    job.then((value) => {
      this.notification.text = 'Folder is successfully deleted.';
      this.notification.text = _text('data.folders.FolderDeleted');
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
  }

  /*Folder Explorer*/
  _clearExplorer(path = this.explorer.breadcrumb.join('/'),
                 id = this.explorer.id,
                 dialog = false) {
    let job = globalThis.backendaiclient.vfolder.list_files(path, id);
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
    const newfolderEl = this.shadowRoot.querySelector('#mkdir-name');
    const newfolder = newfolderEl.value;
    const explorer = this.explorer;
    newfolderEl.reportValidity();
    if (newfolderEl.checkValidity()) {
      let job = globalThis.backendaiclient.vfolder.mkdir([...explorer.breadcrumb, newfolder].join('/'), explorer.id).catch((err) => {
        console.log(err);
        if (err & err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        } else if (err && err.title) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.show(true, err);
        }
      })
      job.then(res => {
        this.closeDialog('mkdir-dialog');
        this._clearExplorer();
      });
    } else {
      return;
    }
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
          file.caption = '';
          file.error = false;
          file.complete = false;
          temp.push(file);
          (this.uploadFiles as any).push(file);
        }
      }
      return;

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
      file.caption = '';
      file.error = false;
      file.complete = false;
      (this.uploadFiles as any).push(file);
    }

    for (let i = 0; i < length; i++) {
      this.fileUpload(this.uploadFiles[i]);
    }

    this.shadowRoot.querySelector('#fileInput').value = '';
  }

  runFileUploadQueue(session = null) {
    if (session !== null) {
      (this.fileUploadQueue as any).push(session);
    }
    let queuedSession;
    for (let i = this.fileUploadCount; i < this.concurrentFileUploadLimit; i++) {
      if (this.fileUploadQueue.length > 0) {
        queuedSession = this.fileUploadQueue.shift();
        this.fileUploadCount = this.fileUploadCount + 1;
        queuedSession.start();
      }
    }
  }

  fileUpload(fileObj) {
    this._uploadFlag = true;
    this.uploadFilesExist = this.uploadFiles.length > 0;
    const path = this.explorer.breadcrumb.concat(fileObj.name).join("/");
    let job = globalThis.backendaiclient.vfolder.create_upload_session(path, fileObj, this.explorer.id);
    job.then(url => {
      const start_date = new Date().getTime();
      const upload = new tus.Upload(fileObj, {
        endpoint: url,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        uploadUrl: url,
        chunkSize: 15728640, // 15MB
        metadata: {
          filename: path,
          filetype: fileObj.type
        },
        onError: (error) => {
          console.log("Failed because: " + error);
          this.fileUploadCount = this.fileUploadCount - 1;
          this.runFileUploadQueue();
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          if (!this._uploadFlag) {
            upload.abort();
            (this.uploadFiles as any)[(this.uploadFiles as any).indexOf(fileObj)].caption = `Canceling...`;
            this.uploadFiles = this.uploadFiles.slice();
            setTimeout(() => {
              this.uploadFiles = [];
              this.uploadFilesExist = false;
            }, 1000);
            return;
          }

          const now = new Date().getTime();
          const speed: string = (bytesUploaded / (1024 * 1024) / ((now - start_date) / 1000)).toFixed(1) + "MB/s";
          const estimated_seconds = Math.floor((bytesTotal - bytesUploaded) / (bytesUploaded / (now - start_date) * 1000));
          let estimated_time_left = "Less than 10 seconds";
          if (estimated_seconds >= 86400) {
            estimated_time_left = "More than a day";
          } else if (estimated_seconds > 10) {
            const hour = Math.floor(estimated_seconds / 3600);
            const min = Math.floor((estimated_seconds % 3600) / 60);
            const sec = estimated_seconds % 60;
            estimated_time_left = `${hour}:${min}:${sec}`;
          }
          const percentage = (bytesUploaded / bytesTotal * 100).toFixed(1);
          (this.uploadFiles as any)[(this.uploadFiles as any).indexOf(fileObj)].progress = bytesUploaded / bytesTotal;
          (this.uploadFiles as any)[(this.uploadFiles as any).indexOf(fileObj)].caption = `${percentage}% / Time left : ${estimated_time_left} / Speed : ${speed}`;
          this.uploadFiles = this.uploadFiles.slice();
        },
        onSuccess: () => {
          this._clearExplorer();
          (this.uploadFiles as any)[(this.uploadFiles as any).indexOf(fileObj)].complete = true;
          this.uploadFiles = this.uploadFiles.slice();
          setTimeout(() => {
            this.uploadFiles.splice((this.uploadFiles as any).indexOf(fileObj), 1);
            this.uploadFilesExist = this.uploadFiles.length > 0 ? true : false;
            this.uploadFiles = this.uploadFiles.slice();
            this.fileUploadCount = this.fileUploadCount - 1;
            this.runFileUploadQueue();
          }, 1000);
        }
      });
      this.runFileUploadQueue(upload);
    });
  }

  _cancelUpload(e) {
    this._uploadFlag = false;
  }

  _downloadFile(e) {
    let fn = e.target.getAttribute("filename");
    let path = this.explorer.breadcrumb.concat(fn).join("/");
    let job = globalThis.backendaiclient.vfolder.request_download_token(path, this.explorer.id);
    job.then(res => {
      const token = res.token;
      const url = globalThis.backendaiclient.vfolder.get_download_url_with_token(token);
      if (globalThis.iOSSafari) {
        this.downloadURL = url;
        this.downloadFileDialog.show();
        URL.revokeObjectURL(url);
      } else {
        let a = document.createElement('a');
        a.style.display = 'none';
        a.addEventListener('click', function (e) {
          e.stopPropagation();
        });
        a.href = url;
        a.download = fn;
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();
        //a.remove();  //afterwards we remove the element again
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  }

  _openRenameFileDialog(e) {
    const fn = e.target.getAttribute("filename");
    this.renameFileDialog.querySelector('#old-file-name').textContent = fn;
    this.renameFileDialog.filename = fn;
    this.renameFileDialog.show();
  }

  _renameFile(e) {
    const fn = this.renameFileDialog.filename;
    const path = this.explorer.breadcrumb.concat(fn).join("/");
    const newName = this.renameFileDialog.querySelector('#new-file-name').value;
    if (!newName) return;
    const job = globalThis.backendaiclient.vfolder.rename_file(path, newName, this.explorer.id);
    job.then((res) => {
      this.notification.text = 'File renamed.';
      this.notification.show();
      this._clearExplorer();
      this.renameFileDialog.hide();
    }).catch((err) => {
      console.error(err);
      if (err && err.message) {
        this.notification.text = err.title;
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
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
      let job = globalThis.backendaiclient.vfolder.delete_files(filenames, true, this.explorer.id);
      job.then(res => {
        this.notification.text = 'Files deleted.';
        this.notification.show();
        this._clearExplorer();
        this.deleteFileDialog.hide();
      });
    } else {
      if (this.deleteFileDialog.filename != '') {
        let path = this.explorer.breadcrumb.concat(this.deleteFileDialog.filename).join("/");
        let job = globalThis.backendaiclient.vfolder.delete_files([path], true, this.explorer.id);
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
    let job = globalThis.backendaiclient.vfolder.delete_files([path], true, this.explorer.id);
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
    globalThis.backendaiclient.vfolder.list_invitees(vfolder_id)
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

    globalThis.backendaiclient.vfolder.invite(permission, emailArray, this.selectedFolder)
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

  _validatePathName() {
    let path_info = this.shadowRoot.querySelector('#mkdir-name');
    path_info.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          path_info.validationMessage = "Value is required."
          return {
            valid: nativeValidity.valid,
            valueMissing: !nativeValidity.valid
          };
        } else {
          return {
            valid: nativeValidity.valid,
            badInput: !nativeValidity.valid
          }
        }
      } else {
        // custom validation for path name using regex
        let regex = /^([.a-zA-Z0-9-_]{1,})+(\/[a-zA-Z0-9-_]{1,})*([\/,\\]{0,1})$/gm;
        let isValid = regex.exec(path_info.value);
        if (!isValid) {
          path_info.validationMessage = "Path should start with .(dot) or letters, numbers only."
        }

        return {
          valid: isValid,
          customError: !isValid
        };
      }
    }
  }

}
declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-storage-list": BackendAiStorageList;
  }
}
