/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {render} from 'lit-html';
import {BackendAIPage} from './backend-ai-page';

import './lablup-loading-spinner';
import './backend-ai-dialog';

import '@material/mwc-textfield';
import '@material/mwc-select';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-icon-button';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column';
import '@vaadin/vaadin-progress-bar/vaadin-progress-bar';
import '@vaadin/vaadin-item/vaadin-item';

import 'weightless/button';
import 'weightless/card';
import 'weightless/checkbox';
import 'weightless/dialog';
import 'weightless/divider';
import 'weightless/icon';
import 'weightless/label';
import 'weightless/select';
import 'weightless/title';
import 'weightless/textfield';

import '../plastics/lablup-shields/lablup-shields';
import {default as PainKiller} from './backend-ai-painkiller';
import tus from '../lib/tus';

import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment, IronPositioning} from "../plastics/layout/iron-flex-layout-classes";

/**
 Backend AI Storage List

 `backend-ai-storage-list` is list of storage folder.

 Example:

 <backend-ai-storage-list storageType="general" ?active="${!0===this.active}"></backend-ai-storage-list>

 @group Backend.AI Console
 @element backend-ai-storage-list
 */

@customElement("backend-ai-storage-list")
export default class BackendAiStorageList extends BackendAIPage {
  @property({type: Number}) _APIMajorVersion = 5;
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
  @property({type: Boolean}) isWritable = false;
  @property({type: Number}) _maxFileUploadSize = -1;

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
          height: calc(100vh - 230px);
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

        .info-indicator {
          min-width: 90px;
          padding: 0 10px;
        }

        div.big.indicator {
          font-size: 48px;
          margin-top:10px;
          margin-bottom: 10px;
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
          width: calc(100% - 250px); /* 250px is width for drawer menu */
          --component-height: calc(100vh - 200px); /* calc(100vh - 170px); */
          right: 0;
          top: 0;
          margin: 170px 0 0 0;
        }

        #folder-explorer-dialog.mini_ui {
          width: calc(100% - 88px); /* 88px is width for mini-ui icon of drawer menu */
        }

        #folder-explorer-dialog vaadin-grid vaadin-grid-column {
          height: 32px !important;
        }

        #folder-explorer-dialog vaadin-grid mwc-icon-button {
          --mdc-icon-size: 24px;
          --mdc-icon-button-size: 28px;
        }

        @media screen and (max-width: 700px) {
          #folder-explorer-dialog,
          #folder-explorer-dialog.mini_ui {
            min-width: 410px;
            --component-width: 100%;
            width: 100%;
            position: absolute;
            margin-left: auto;
            margin-right: auto;
            left: 0px;
            right: 0px;
          }
        }

        @media screen and (max-width: 750px) {
          #folder-explorer-dialog,
          #folder-explorer-dialog.mini_ui {
            --component-width: auto;
          }
        }

        @media screen and (min-width: 900px) {
          #folder-explorer-dialog,
          #folder-explorer-dialog.mini_ui
           {
            --component-width: calc(100% - 45px); /* calc(100% - 30px); */
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

        mwc-button {
          margin: auto 10px;
        }

        wl-button.goto {
          margin: 0;
          padding: 5px;
          min-width: 0;
        }

        wl-button.goto:last-of-type {
          font-weight: bold;
        }

        mwc-button.fullwidth {
          width: 100%;
        }

        mwc-button#readonly-btn {
          width: 150px;
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

        wl-button {
          --button-bg: var(--paper-orange-50);
          --button-bg-hover: var(--paper-orange-100);
          --button-bg-active: var(--paper-orange-600);
          color: var(--paper-orange-900);
        }

        backend-ai-dialog mwc-textfield,
        backend-ai-dialog mwc-select {
          --mdc-typography-font-family: var(--general-font-family);
          --mdc-typography-label-font-size: 12px;
          --mdc-theme-primary: var(--general-textfield-selected-color);
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
          --component-min-width: 600px;
        }

        backend-ai-dialog {
          --component-min-width: 350px;
        }

        @media screen and (max-width: 750px) {
          mwc-button {
            width: auto;
          }
          mwc-button > span {
            display: none;
          }
          #modify-permission-dialog {
            --component-min-width: 100%;
          }
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
      <vaadin-grid class="folderlist" theme="row-stripes column-borders wrap-cell-content compact" column-reordering-allowed aria-label="Folder list" .items="${this.folders}">
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
        <vaadin-grid-column auto-width resizable header="${_t("data.folders.Control")}" .renderer="${this._boundControlFolderListRenderer}"></vaadin-grid-column>
      </vaadin-grid>

      <backend-ai-dialog id="rename-folder-dialog" fixed backdrop>
        <span slot="title">${_t('data.folders.RenameAFolder')}</span>
        <div slot="content">
          <mwc-textfield class="red" id="new-folder-name" label="${_t('data.folders.TypeNewFolderName')}"
           required auto-validate validationMessage="${_t("data.Allowslettersnumbersand-_dot")}"
           style="width:320px;"
           @change="${() => {this._validateFolderName(true)}}"></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button unelevated class="fullwidth bg-blue button" type="submit" icon="edit" id="rename-button" outlined @click="${() => this._renameFolder()}">
            ${_t('data.folders.Rename')}
          </mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="delete-folder-dialog" fixed backdrop>
        <span slot="title">${_t("data.folders.DeleteAFolder")}</span>
        <div slot="content" style="width:100%;">
          <div class="warning" style="margin-left:16px;">${_t("dialog.warning.CannotBeUndone")}</div>
          <mwc-textfield class="red" id="delete-folder-name" label="${_t('data.folders.TypeFolderNameToDelete')}"></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button unelevated class="fullwidth red button" type="submit" icon="close" id="delete-button" @click="${() => this._deleteFolderWithCheck()}">
            ${_t("data.folders.Delete")}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="info-folder-dialog" fixed backdrop>
        <span slot="title">${this.folderInfo.name}</span>
        <div slot="content" role="listbox" style="margin: 0;width:100%;">
          <div class="horizontal justified layout wrap" style="margin-top:15px;">
              <div class="vertical layout center info-indicator">
                <div class="big indicator">${this.folderInfo.host}</div>
                <span>${_t("data.folders.Location")}</span>
              </div>
            <div class="vertical layout center info-indicator">
              <div class="big indicator">${this.folderInfo.numFiles}</div>
              <span>${_t("data.folders.NumberOfFiles")}</span>
            </div>
          </div>
          <mwc-list>
            <mwc-list-item twoline>
              <span><strong>ID</strong></span>
              <span class="monospace" slot="secondary">${this.folderInfo.id}</span>
            </mwc-list-item>
            ${this.folderInfo.is_owner ? html`
              <mwc-list-item twoline>
                <span><strong>${_t("data.folders.Ownership")}</strong></span>
                <span slot="secondary">${_t("data.folders.DescYouAreFolderOwner")}</span>
              </mwc-list-item>
            ` : html``}
            <mwc-list-item twoline>
              <span><strong>${_t("data.folders.Permission")}</strong></span>
              <div slot="secondary" class="horizontal layout">
              ${this.folderInfo.permission ? html`
                ${this._hasPermission(this.folderInfo, 'r') ? html`
                    <lablup-shields app="" color="green"
                                    description="R" ui="flat"></lablup-shields>` : html``}
                ${this._hasPermission(this.folderInfo, 'w') ? html`
                    <lablup-shields app="" color="blue"
                                    description="W" ui="flat"></lablup-shields>` : html``}
                ${this._hasPermission(this.folderInfo, 'd') ? html`
                    <lablup-shields app="" color="red"
                                    description="D" ui="flat"></lablup-shields>` : html``}` : html``}
              </div>
            </mwc-list-item>
          </mwc-list>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="folder-explorer-dialog" class="folder-explorer" narrowLayout>
        <span slot="title">${this.explorer.id}</span>
        <div slot="action" class="horizontal layout flex folder-action-buttons">
          <div class="flex"></div>
          <mwc-button
              outlined
              class="multiple-action-buttons fg red"
              icon="delete"
              @click="${() => this._openDeleteMultipleFileDialog()}"
              style="display:none;">
              <span>${_t("data.explorer.Delete")}</span>
          </mwc-button>
          ${this.isWritable ? html`
          <div id="add-btn-cover">
            <mwc-button
                id="add-btn"
                icon="cloud_upload"
                ?disabled=${!this.isWritable}
                @click="${(e) => this._uploadFileBtnClick(e)}">
                <span>${_t("data.explorer.UploadFiles")}</span>
            </mwc-button>
          </div>
          <div id="mkdir-cover">
            <mwc-button
                id="mkdir"
                class="tooltip"
                icon="create_new_folder"
                ?disabled=${!this.isWritable}
                @click="${() => this._mkdirDialog()}">
                <span>${_t("data.explorer.NewFolder")}</span>
            </mwc-button>
          </div>
          ` : html`
          <mwc-button
              id="readonly-btn"
              disabled>
            <span>${_t("data.explorer.ReadonlyFolder")}</span>
          </mwc-button>
          `}
        </div>
        <div slot="content">
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
          <div id="dropzone"><p>drag</p></div>
          <input type="file" id="fileInput" @change="${(e) => this._uploadFileChange(e)}" hidden multiple>
          ${this.uploadFilesExist ? html`
          <mwc-button icon="cancel" id="cancel_upload" @click="${(e) => this._cancelUpload(e)}">
            ${_t("data.explorer.StopUploading")}
          </mwc-button>
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

            <vaadin-grid-column auto-width resizable>
              <template class="header">
                <vaadin-grid-sorter path="size">${_t("data.explorer.Size")}</vaadin-grid-sorter>
              </template>
              <template>
                <div class="layout vertical">
                  <span>[[item.size]]</span>
                </div>
              </template>
            </vaadin-grid-column>
            <vaadin-grid-column resizable auto-width header="${_t("data.explorer.Actions")}" .renderer="${this._boundControlFileListRenderer}"></vaadin-grid-column>
          </vaadin-grid>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="mkdir-dialog" fixed backdrop>
        <span slot="title">${_t("data.explorer.CreateANewFolder")}</span>
        <div slot="content">
          <mwc-textfield id="mkdir-name"
                         label="${_t("data.explorer.Foldername")}"
                         @change="${() => this._validatePathName()}"
                         required
                         validationMessage="${_text("data.explorer.ValueRequired")}"></mwc-textfield>
          <br/>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout distancing">
          <mwc-button icon="rowing" class="fullwidth blue button" type="submit" id="mkdir-btn" @click="${(e) => this._mkdir(e)}" outlined>
            ${_t("button.Create")}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="share-folder-dialog" fixed backdrop>
        <span slot="title">${_t("data.explorer.ShareFolder")}</span>
        <div slot="content" role="listbox" style="margin: 0;width:100%;" >
          <div style="margin: 10px 0px">${_t("data.explorer.People")}</div>
          <div class="vertical layout flex" id="textfields">
            <div class="horizontal layout">
              <div style="flex-grow: 2">
                <mwc-textfield class="share-email" type="email" label="${_t("data.explorer.EnterEmailAddress")}"></mwc-textfield>
              </div>
              <div>
                <wl-button fab flat @click="${() => this._addTextField()}">
                  <wl-icon>add</wl-icon>
                </wl-button>
                <wl-button fab flat @click="${() => this._removeTextField()}">
                  <wl-icon>remove</wl-icon>
                </wl-button>
              </div>
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
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            icon="share"
            type="button"
            class="fullwidth button"
            unelevated
            id="share-button"
            @click=${e => this._shareFolder(e)}
          >
            ${_t("button.Share")}
          </mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="modify-permission-dialog" fixed backdrop>
        <span slot="title">${_t("data.explorer.ModifyPermissions")}</span>
        <div slot="content" role="listbox" style="margin: 0; padding: 10px;">
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
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            icon="check"
            type="button"
            class="fullwidth button"
            unelevated
            @click=${()=>this._modifySharedFolderPermissions()}
          >
            ${_t("button.SaveChanges")}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="rename-file-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t('data.explorer.RenameAFile')}</span>
        <div slot="content">
          <mwc-textfield class="red" id="new-file-name" label="${_t('data.explorer.NewFileName')}"
          required @change="${() => this._validateExistingFileName()}" auto-validate style="width:320px;"></mwc-textfield>
          <div id="old-file-name" style="padding-left:15px;height:2.5em;"></div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button icon="edit" class="fullwidth blue button" type="button" id="rename-file-button" unelevated @click="${(e) => this._renameFile(e)}">
            ${_t('data.explorer.RenameAFile')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="delete-file-dialog" fixed backdrop>
         <span slot="title">${_t("dialog.title.LetsDouble-Check")}</span>
         <div slot="content">
            <p>${_t("dialog.warning.CannotBeUndone")}
            ${_t("dialog.ask.DoYouWantToProceed")}</p>
         </div>
         <div slot="footer" class="horizontal end-justified flex layout">
            <mwc-button outlined @click="${(e) => this._hideDialog(e)}">${_t("button.Cancel")}</mwc-button>
            <mwc-button raised @click="${(e) => this._deleteFileWithCheck(e)}">${_t("button.Okay")}</mwc-button>
         </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="download-file-dialog" fixed backdrop>
         <span slot="title">${_t("data.explorer.DownloadFile")}</span>
         <div slot="content">
            <a href="${this.downloadURL}">
              <wl-button outlined>${_t("data.explorer.TouchToDownload")}</wl-button>
            </a>
         </div>
         <div slot="footer" class="horizontal center-justified flex layout distancing">
            <mwc-button @click="${(e) => this._hideDialog(e)}">${_t("button.Close")}</mwc-button>
         </div>
      </backend-ai-dialog>
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
    if (this.storageType === 'automount') {
      this.shadowRoot.querySelector('vaadin-grid.folderlist').style.height = 'calc(100vh - 230px)';
    } else {
      this.shadowRoot.querySelector('vaadin-grid.folderlist').style.height = 'calc(100vh - 185px)';
    }

    document.addEventListener('backend-ai-group-changed', (e) => this._refreshFolderList());
    document.addEventListener('backend-ai-ui-changed', (e) => this._refreshFolderUI(e));
    this._refreshFolderUI({"detail": {"mini-ui": globalThis.mini_ui}});
  }

  _modifySharedFolderPermissions() {
    const selectNodeList = this.shadowRoot.querySelectorAll('#modify-permission-dialog wl-select');
    const inputList = Array.prototype.filter.call(selectNodeList, (pulldown, idx) => pulldown.value !== (this.invitees as any)[idx].perm)
      .map((pulldown, idx) => ({
        'perm': pulldown.value === 'kickout' ? null : pulldown.value,
        'user': (this.invitees as any)[idx].shared_to.uuid,
        'vfolder': (this.invitees as any)[idx].vfolder_id
      }));
    const promiseArray = inputList.map(input => globalThis.backendaiclient.vfolder.modify_invitee_permission(input));
    Promise.all(promiseArray).then((response: any) => {
      if (response.length === 0) {
        this.notification.text = _text('data.permission.NoChanges');
      } else {
        this.notification.text = _text('data.permission.PermissionModified');
      }
      this.notification.show();
      this.shadowRoot.querySelector('#modify-permission-dialog').hide();
    })
  }

  /**
   * Render permission options - View, Edit, EditDelete, KickOut.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  permissionRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="vertical layout">
          <wl-select label="${_t('data.folders.SelectPermission')}">
            <option ?selected=${rowData.item.perm === 'ro'} value="ro">${_t('data.folders.View')}</option>
            <option ?selected=${rowData.item.perm === 'rw'} value="rw">${_t('data.folders.Edit')}</option>
            <option ?selected=${rowData.item.perm === 'wd'} value="wd">${_t('data.folders.EditDelete')}</option>
            <option value=kickout>${_t('data.folders.KickOut')}</option>
          </wl-select>
          <!--<mwc-select outlined label="${_t('data.folders.SelectPermission')}">
            <mwc-list-item ?selected=${rowData.item.perm === 'ro'} value="ro">
            <mwc-list-item ?selected=${rowData.item.perm === 'rw'} value="rw">${_t('data.folders.Edit')}</mwc-list-item>
            <mwc-list-item ?selected=${rowData.item.perm === 'wd'} value="wd">${_t('data.folders.EditDelete')}</mwc-list-item>
            <mwc-list-item value="kickout">${_t('data.folders.KickOut')}</mwc-list-item>
          </mwc-select>-->
        </div>
      `, root
    )
  }

  /**
   * Add textfield to write email.
   *
   * */
  _addTextField() {
    let newTextField = document.createElement('mwc-textfield');
    newTextField.label = _text('data.explorer.EnterEmailAddress');
    newTextField.type = "email";
    newTextField.className = "share-email";
    newTextField.style.width = "auto";
    newTextField.style.marginRight = "83px";
    this.shadowRoot.querySelector('#textfields').appendChild(newTextField);
  }

  /**
   * Remove existing email textfield.
   *
   */
  _removeTextField() {
    const textfields = this.shadowRoot.querySelector('#textfields');
    if (textfields.children.length > 1) {
      textfields.removeChild(textfields.lastChild);
    }
  }

  indexRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`${this._indexFrom1(rowData.index)}`, root
    );
  }

  /**
   * Render control folder options - infoFolder, folderExplorer, shareFolderDialog, etc.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  controlFolderListRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div
          id="controls"
          class="layout flex center wrap"
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
                @click="${(e) =>
                  this._folderExplorer(e, (this._hasPermission(rowData.item, 'w')
                    || rowData.item.is_owner
                    || (rowData.item.type === 'group' && this.is_admin)))}"
                .folder-id="${rowData.item.name}"></mwc-icon-button>
            `
            : html``
          }
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
          ${rowData.item.is_owner ?
            html`
              <mwc-icon-button
                class="fg blue controls-running"
                icon="edit"
                @click="${(e) => this._renameFolderDialog(e)}"
              ></mwc-icon-button>
            ` : html``}
          ${rowData.item.is_owner || this._hasPermission(rowData.item, 'd') || (rowData.item.type === 'group' && this.is_admin)
            ? html`
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

  /**
   * Render control file options - downloadFile, openRenameFileDialog, openDeleteFileDialog, etc.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  controlFileListRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="flex layout wrap">
          ${this._isDir(rowData.item) ? html`
            <mwc-icon-button id="download-btn" class="tiny fg blue" icon="cloud_download"
                filename="${rowData.item.filename}" @click="${(e) => this._downloadFile(e, true)}"></mwc-icon-button>
          ` : html`
            <mwc-icon-button id="download-btn" class="tiny fg blue" icon="cloud_download"
                filename="${rowData.item.filename}" @click="${(e) => this._downloadFile(e)}"></mwc-icon-button>
          `}
          <mwc-icon-button id="rename-btn" ?disabled="${!this.isWritable}" class="tiny fg green" icon="edit" required
              filename="${rowData.item.filename}" @click="${this._openRenameFileDialog.bind(this)}"></mwc-icon-button>
          <mwc-icon-button id="delete-btn" ?disabled="${!this.isWritable}" class="tiny fg red" icon="delete_forever"
              filename="${rowData.item.filename}" @click="${(e) => this._openDeleteFileDialog(e)}"></mwc-icon-button>
        </div>
       `, root
    );
  }

  /**
   * Render file name as rowData.item.filename.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  fileNameRenderer(root, column?, rowData?) {
    render(
      html`
        ${this._isDir(rowData.item) ?
        html`
          <div class="indicator horizontal center layout" name="${rowData.item.filename}">
            <mwc-icon-button class="fg controls-running" icon="folder_open" name="${rowData.item.filename}"
                               @click="${(e) => this._enqueueFolder(e)}"></mwc-icon-button>
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

  /**
   * Render permission view - r, w, d.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
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

  /**
   * Render created time.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  createdTimeRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout vertical">
            <span>${this._humanReadableTime(rowData.item.ctime)}</span>
        </div>`, root
    )
  }

  /**
   * Render type of user - person, group.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
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

  /**
   * If both refreshOnly and activeConnected are true, refresh folderlists.
   *
   * @param {boolean} refreshOnly
   */
  _refreshFolderList(refreshOnly = false) {
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
    globalThis.backendaiclient.vfolder.list_hosts().then(res => {
      // refresh folder list every 10sec
      if (this.active && !refreshOnly) {
        setTimeout(() => {
          this._refreshFolderList();
        }, 10000);
      };
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
        this._APIMajorVersion = globalThis.backendaiclient.APIMajorVersion;
        this._maxFileUploadSize = globalThis.backendaiclient._config.maxFileUploadSize;
        this._refreshFolderList();
      }, true);
    } else {
      this.is_admin = globalThis.backendaiclient.is_admin;
      this.authenticated = true;
      this._APIMajorVersion = globalThis.backendaiclient.APIMajorVersion;
      this._maxFileUploadSize = globalThis.backendaiclient._config.maxFileUploadSize;
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

  /**
   * Return whether item has permission or not.
   *
   * @param {object} item
   * @param {char} perm - permission
   * */
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

  /**
   * Inform about folder using dialog.
   *
   * @param {Event} e - click the info icon button
   * */
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

  /**
   * Open rename-folder-dialog to rename folder name.
   *
   * @param {Event} e - click the edit icon button
   * */
  _renameFolderDialog(e) {
    this.renameFolderId = this._getControlId(e);
    this.shadowRoot.querySelector('#new-folder-name').value = '';
    this.openDialog('rename-folder-dialog');
  }

  /**
   * Rename the folder with the name on the new-folder-name.
   * */
  _renameFolder() {
    globalThis.backendaiclient.vfolder.name = this.renameFolderId;
    const newNameEl = this.shadowRoot.querySelector('#new-folder-name');
    const newName = newNameEl.value;
    newNameEl.reportValidity();
    if (newNameEl.checkValidity()) {
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
    } else {
      return;
    }

  }

  /**
   * Open delete-folder-dialog to delete folder.
   *
   * @param {Event} e - click the delete icon button
   * */
  _deleteFolderDialog(e) {
    this.deleteFolderId = this._getControlId(e);
    this.shadowRoot.querySelector('#delete-folder-name').value = '';
    this.openDialog('delete-folder-dialog');
  }

  /**
   * Check folder name to delete folder.
   * */
  _deleteFolderWithCheck() {
    let typedDeleteFolderName = this.shadowRoot.querySelector('#delete-folder-name').value;
    if (typedDeleteFolderName !== this.deleteFolderId) {
      this.notification.text = _text('data.folders.FolderNameMismatched');
      this.notification.show();
      return;
    }
    this.closeDialog('delete-folder-dialog');
    this._deleteFolder(this.deleteFolderId);
  }

  /**
   * Delete folder and notice.
   *
   * @param {string} folderId
   * */
  _deleteFolder(folderId) {
    let job = globalThis.backendaiclient.vfolder.delete(folderId);
    job.then((value) => {
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

  /**
   * Validate file/subfolder name.
   */
  _validateExistingFileName() {
    const filename = this.shadowRoot.querySelector('#new-file-name');
    filename.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          filename.validationMessage = _text('data.FileandFoldernameRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        } else {
          filename.validationMessage = _text('data.Allowslettersnumbersand-_dot');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        }
      } else {
        let regex = /[`~!@#$%^&*()|+=?;:'",<>\{\}\[\]\\\/]/gi;
        let isValid : boolean;
        // compare old name and new name.
        if (filename.value ===  this.renameFileDialog.querySelector('#old-file-name').textContent) {
          filename.validationMessage = _text('data.EnterDifferentValue');
          isValid = false;
          return {
            valid: isValid,
            customError: !isValid
          };
        } else {
          isValid = true;
        }
        // custom validation for folder name using regex
        isValid = !regex.test(filename.value);
        if (!isValid) {
          filename.validationMessage = _text('data.Allowslettersnumbersand-_dot');
        }
        return {
          valid: isValid,
          customError: !isValid
        };
      }
    }
  }

  /**
   * Validate folder name.
   *
   * @param {boolean} isModifying
   */
  _validateFolderName(isModifying = false) {
    const folderName = isModifying ? this.shadowRoot.querySelector('#new-folder-name') : this.shadowRoot.querySelector('#add-folder-name');

    folderName.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          folderName.validationMessage = _text('data.FolderNameRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        } else {
          folderName.validationMessage = _text('data.Allowslettersnumbersand-_dot');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        }
      } else {
        let isValid : boolean;
        let regex = /[`~!@#$%^&*()|+=?;:'",<>\{\}\[\]\\\/\s]/gi;
        // if renaming its name, then compare old name and new name.
        if (isModifying) {
          if (folderName.value === this.renameFolderId) {
            folderName.validationMessage = _text('data.EnterDifferentValue');
            isValid = false;
            return {
              valid: isValid,
              customError: !isValid
            }
          } else {
            isValid = true;
          }
        }
        // custom validation for folder name using regex
        isValid = !regex.test(folderName.value);
        if (!isValid) {
          folderName.validationMessage = _text('data.Allowslettersnumbersand-_dot');
        }
        return {
          valid: isValid,
          customError: !isValid
        };
      }
    }
  }

  /*Folder Explorer*/
  /**
   * Clear the folder explorer.
   *
   * @param path - explorer path
   * @param id - explorer id
   * @param {boolean} dialog - whether open folder-explorer-dialog or not
   * */
  _clearExplorer(path = this.explorer.breadcrumb.join('/'),
                 id = this.explorer.id,
                 dialog = false) {
    let job = globalThis.backendaiclient.vfolder.list_files(path, id);
    return job.then(value => {
      this.shadowRoot.querySelector('#fileList-grid').selectedItems = [];
      this.explorer.files = JSON.parse(value.files);
      this.explorerFiles = this.explorer.files;
      if (dialog) {
        this.openDialog('folder-explorer-dialog');
      }
    });
  }

  /**
   * Set up the explorer of the folder and call the _clearExplorer() function.
   *
   * @param {Event} e - click the folder_open icon button
   * @param {boolean} isWritable - check whether write operation is allowed or not
   * */
  _folderExplorer(e, isWritable) {
    let folderId = this._getControlId(e);
    let explorer = {
      id: folderId,
      breadcrumb: ['.'],
    };

    /**
     * NOTICE: If it's admin user and the folder type is group, It will have write permission.
     */
    this.isWritable = isWritable;
    this.explorer = explorer;
    this._clearExplorer(explorer.breadcrumb.join('/'), explorer.id, true);
  }

  /**
   * Enqueue the folder and call the _clearExplorer() function.
   *
   * @param {Event} e - click the folder_open icon button
   * */
  _enqueueFolder(e) {
    const button = e.target;

    // disable button to avoid executing extra onclick event
    button.setAttribute('disabled', 'true');
    const fn = e.target.getAttribute('name');
    this.explorer.breadcrumb.push(fn);

    // enable button only if the operation is done.
    this._clearExplorer().then(res => {
      button.removeAttribute('disabled');
    });
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
        // console.log(err);
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

  _byteToMB(value) {
    return Math.floor(value / 1000000);
  }

  _humanReadableFileSize(value) {
    if (value > 1000000000) {
      return Math.floor(value / 1000000000) + 'GB';
    } else if (value > 1000000) {
      return Math.floor(value / 1000000) + 'MB';
    } else if (value > 1000) {
      return Math.floor(value / 1000) + 'KB';
    } else {
      return Math.floor(value) + 'Bytes';
    }
  }

  /* File upload and download */
  /**
   * Add eventListener to the dropzone - dragleave, dragover, drop.
   * */
  _addEventListenerDropZone() {
    const dndZoneEl = this.shadowRoot.querySelector('#folder-explorer-dialog');
    const dndZonePlaceholderEl = this.shadowRoot.querySelector('#dropzone');

    dndZonePlaceholderEl.addEventListener('dragleave', () => {
      dndZonePlaceholderEl.style.display = "none";
    });

    dndZoneEl.addEventListener('dragover', e => {
      e.stopPropagation();
      e.preventDefault();
      if (this.isWritable) {
      e.dataTransfer.dropEffect = 'copy';
      dndZonePlaceholderEl.style.display = "flex";
      return false;
      } else {
         return true;
      }
    });

    dndZoneEl.addEventListener('drop', e => {
      e.stopPropagation();
      e.preventDefault();
      dndZonePlaceholderEl.style.display = "none";

      if (this.isWritable) {
        let temp: any = [];
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i];
          /* Drag & Drop file upload size limits to configuration */
          if (this._maxFileUploadSize > 0 && file.size > this._maxFileUploadSize) {
            this.notification.text = _text('data.explorer.FileUploadSizeLimit') + ` (${this._humanReadableFileSize(this._maxFileUploadSize)})`;
            this.notification.show();
            return;
          } else {
            file.progress = 0;
            file.caption = '';
            file.error = false;
            file.complete = false;
            temp.push(file);
            (this.uploadFiles as any).push(file);
          }
        }

        for (let i = 0; i < temp.length; i++) {
          this.fileUpload(temp[i]);
          this._clearExplorer();
        }
      } else {
        this.notification.text = _text('data.explorer.WritePermissionRequiredInUploadFiles');
        this.notification.show();
      }
    });
  }

  /**
   * Create MouseEvents when cloud_upload button is clicked.
   *
   * @param {Event} e - click the cloud_upload button
   * */
  _uploadFileBtnClick(e) {
    const elem = this.shadowRoot.querySelector('#fileInput');
    if (elem && document.createEvent) {  // sanity check
      const evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
    }
  }

  /**
   * If file is added, call the fileUpload() function and initialize fileInput string
   *
   * @param {Event} e - add file to the input element
   * */
  _uploadFileChange(e) {
    const length = e.target.files.length;
    for (let i = 0; i < length; i++) {
      const file = e.target.files[i];

      let text = "";
      let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
      /* File upload size limits to configuration */
      if (this._maxFileUploadSize > 0 && file.size > this._maxFileUploadSize) {
        this.notification.text = _text('data.explorer.FileUploadSizeLimit') + ` (${this._humanReadableFileSize(this._maxFileUploadSize)})`;
        this.notification.show();
        return;
      } else {
        file.id = text;
        file.progress = 0;
        file.caption = '';
        file.error = false;
        file.complete = false;
        (this.uploadFiles as any).push(file);
      }
    }

    for (let i = 0; i < length; i++) {
      this.fileUpload(this.uploadFiles[i]);
    }

    this.shadowRoot.querySelector('#fileInput').value = '';
  }

  /**
   * Running file upload queue to upload files.
   *
   * @param session - upload session
   * */
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

  /**
   * Upload the file.
   *
   * @param {Object} fileObj - file object
   * */
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
          let estimated_time_left = _text('data.explorer.LessThan10Sec');
          if (estimated_seconds >= 86400) {
            estimated_time_left = _text('data.explorer.MoreThanADay');
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

  /**
   * Cancel upload files.
   *
   * @param {Event} e - click the cancle button
   * */
  _cancelUpload(e) {
    this._uploadFlag = false;
  }

  /**
   * Download the file.
   *
   * @param {Event} e - click the cloud_download icon button
   * @param {boolean} archive - whether archive or not
   * */
  _downloadFile(e, archive = false) {
    let fn = e.target.getAttribute("filename");
    let path = this.explorer.breadcrumb.concat(fn).join("/");
    let job = globalThis.backendaiclient.vfolder.request_download_token(path, this.explorer.id, archive);
    job.then(res => {
      const token = res.token;
      let url;
      if (this._APIMajorVersion < 6) {
        url = globalThis.backendaiclient.vfolder.get_download_url_with_token(token);
      } else {
        url = `${res.url}?token=${res.token}&archive=${archive}`;
      }
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

  /**
   * Open the renameFileDialog to rename the file.
   *
   * @param {Event} e - click the edit icon button
   * */
  _openRenameFileDialog(e) {
    const fn = e.target.getAttribute("filename");
    this.renameFileDialog.querySelector('#old-file-name').textContent = fn;
    this.renameFileDialog.filename = fn;
    this.renameFileDialog.show();
  }

  /**
   * Rename the file.
   *
   * @param {Event} e - click the rename-file-button
   * */
  _renameFile(e) {
    const fn = this.renameFileDialog.filename;
    const path = this.explorer.breadcrumb.concat(fn).join("/");
    const newNameEl = this.renameFileDialog.querySelector('#new-file-name');
    const newName = newNameEl.value;
    newNameEl.reportValidity();
    if (newNameEl.checkValidity()) {
      const job = globalThis.backendaiclient.vfolder.rename_file(path, newName, this.explorer.id);
      job.then((res) => {
        this.notification.text = _text('data.folders.FileRenamed');
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
    } else {
      return;
    }
  }

  /**
   * Open delete file dialog to delete file.
   *
   * @param {Event} e - click the delete-btn
   * */
  _openDeleteFileDialog(e) {
    let fn = e.target.getAttribute("filename");
    this.deleteFileDialog.filename = fn;
    this.deleteFileDialog.files = [];
    this.deleteFileDialog.show();
  }

  /**
   * Open the deleteFileDialog of selected files.
   *
   * @param {Event} e - click the delete button
   * */
  _openDeleteMultipleFileDialog(e?) {
    this.deleteFileDialog.files = this.fileListGrid.selectedItems;
    this.deleteFileDialog.filename = '';
    this.deleteFileDialog.show();
  }

  /**
   * If the user presses the Delete File button, and the Okay button on the double check dialogue, delete the file.
   *
   * @param {Event} e - click the Okay button
   * */
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
        this.notification.text = _text('data.folders.MultipleFilesDeleted');
        this.notification.show();
        this._clearExplorer();
        this.deleteFileDialog.hide();
      });
    } else {
      if (this.deleteFileDialog.filename != '') {
        let path = this.explorer.breadcrumb.concat(this.deleteFileDialog.filename).join("/");
        let job = globalThis.backendaiclient.vfolder.delete_files([path], true, this.explorer.id);
        job.then(res => {
          this.notification.text = _text('data.folders.FileDeleted');
          this.notification.show();
          this._clearExplorer();
          this.deleteFileDialog.hide();
        });
      }
    }
  }

  /**
   * Delete a file.
   * */
  _deleteFile(e) {
    let fn = e.target.getAttribute("filename");
    let path = this.explorer.breadcrumb.concat(fn).join("/");
    let job = globalThis.backendaiclient.vfolder.delete_files([path], true, this.explorer.id);
    job.then(res => {
      this.notification.text = _text('data.folders.FileDeleted');
      this.notification.show();
      this._clearExplorer();
    });
  }

  /**
   * Returns the time of the utc type for human reading.
   *
   * @param {Date} d - date
   * */
  _humanReadableTime(d) {
    const date = new Date(d * 1000);
    const offset = date.getTimezoneOffset() / 60;
    const hours = date.getHours();
    date.setHours(hours - offset);
    return date.toUTCString();
  }

  /**
   * Return whether file is downloadable.
   *
   * @param {Object} file
   * */
  _isDownloadable(file) {
    return true;
  }

  /**
   * Open dialog to share folder.
   *
   * @param {Event} e - click the share button
   * */
  _shareFolderDialog(e) {
    this.selectedFolder = this._getControlId(e);
    this.openDialog('share-folder-dialog');
  }

  /**
   * Open modify-permission-dialog.
   *
   * @param vfolder_id - vfolder id to modify
   * */
  _modifyPermissionDialog(vfolder_id) {
    globalThis.backendaiclient.vfolder.list_invitees(vfolder_id)
      .then(res => {
        this.invitees = res.shared;
        this.openDialog('modify-permission-dialog');
      })
  }

  /**
   * Share the folder to people with the email user entered.
   *
   * @param {Event} e - click the share-button
   * */
  _shareFolder(e) {
    const emailHtmlCollection = this.shadowRoot.querySelectorAll('mwc-textfield.share-email');

    // filter invalid and empty fields
    const emailArray = Array.prototype.filter.call(emailHtmlCollection, e => e.isUiValid && e.value !== '').map(e => e.value.trim());
    const permission = 'r' + (this.shadowRoot.querySelector('#share-folder-write').checked ? 'w' : 'o');

    if (emailArray.length === 0) {
      this.notification.text = _text('data.invitation.NoValidEmails');
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
          msg = _text('data.invitation.Invited');
        } else {
          msg = _text('data.invitation.NoOneWasInvited');
        }
        this.notification.text = msg;
        this.notification.show();
        this.shadowRoot.querySelector('#share-folder-dialog').hide();
        for (let i = emailHtmlCollection.length - 1; i > 0; i--) {
          const element = emailHtmlCollection[i];
          element.parentElement.removeChild(element);
        }
      }).catch(err => {
        this.notification.text = _text('data.invitation.InvitationError');
        if (err && err.message) {
          this.notification.detail = err.message;
        }
        this.notification.show(true, err);
      });
  }

  /**
   * Validate path name
   * */
  _validatePathName() {
    let path_info = this.shadowRoot.querySelector('#mkdir-name');
    path_info.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          path_info.validationMessage = _text('data.explorer.ValueRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        } else {
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          }
        }
      } else {
        // custom validation for path name using regex
        let regex = /^([^`~!@#$%^&*()|+=?;:'",<>\{\}\[\]\r\n\/]{1,})+(\/[^`~!@#$%^&*()|+=?;:'",<>\{\}\[\]\r\n\/]{1,})*([\/,\\]{0,1})$/gm;
        let isValid = regex.test(path_info.value);
        if (!isValid || path_info.value === './') {
          path_info.validationMessage = _text('data.explorer.ValueShouldBeStarted');
          isValid = false;
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
