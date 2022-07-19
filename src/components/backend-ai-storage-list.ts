/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {BackendAIPage} from './backend-ai-page';

import './lablup-loading-spinner';
import './backend-ai-dialog';

import '@material/mwc-textfield';
import {Select} from '@material/mwc-select';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-icon-button';
import {Button} from '@material/mwc-button';
import {Radio} from '@material/mwc-radio';
import '@material/mwc-formfield';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column-group';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';
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

import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment, IronPositioning} from '../plastics/layout/iron-flex-layout-classes';

type TextField = HTMLElementTagNameMap['mwc-textfield'];

/**
 Backend AI Storage List

 `backend-ai-storage-list` is list of storage folder.

 Example:

 <backend-ai-storage-list storageType="general" ?active="${!0===this.active}"></backend-ai-storage-list>

@group Backend.AI Web UI
 @element backend-ai-storage-list
 */

@customElement('backend-ai-storage-list')
export default class BackendAiStorageList extends BackendAIPage {
  @property({type: Number}) _APIMajorVersion = 5;
  @property({type: String}) storageType = 'general';
  @property({type: Array}) folders = [];
  @property({type: Object}) folderInfo = Object();
  @property({type: Boolean}) is_admin = false;
  @property({type: Boolean}) enableStorageProxy = false;
  @property({type: Boolean}) authenticated = false;
  @property({type: String}) renameFolderName = '';
  @property({type: String}) deleteFolderName = '';
  @property({type: String}) leaveFolderName = '';
  @property({type: Object}) explorer = Object();
  @property({type: Array}) explorerFiles = [];
  @property({type: String}) existingFile = '';
  @property({type: Array}) invitees = [];
  @property({type: String}) selectedFolder = '';
  @property({type: String}) selectedFolderType = '';
  @property({type: String}) downloadURL = '';
  @property({type: Array}) uploadFiles = [];
  @property({type: Array}) fileUploadQueue = [];
  @property({type: Number}) fileUploadCount = 0;
  @property({type: Number}) concurrentFileUploadLimit = 2;
  @property({type: String}) vhost = '';
  @property({type: Array}) vhosts = [];
  @property({type: Array}) allowedGroups = [];
  @property({type: Object}) indicator = Object();
  @property({type: Object}) notification = Object();
  // TODO delete - not used in this file
  // @property({type: Object}) sessionLauncher = Object();
  @property({type: Array}) allowed_folder_type = [];
  @property({type: Boolean}) uploadFilesExist = false;
  @property({type: Object}) _boundIndexRenderer = Object();
  @property({type: Object}) _boundTypeRenderer = Object();
  @property({type: Object}) _boundFolderListRenderer = Object();
  @property({type: Object}) _boundControlFolderListRenderer = Object();
  @property({type: Object}) _boundControlFileListRenderer = Object();
  @property({type: Object}) _boundPermissionViewRenderer = Object();
  @property({type: Object}) _boundOwnerRenderer = Object();
  @property({type: Object}) _boundFileNameRenderer = Object();
  @property({type: Object}) _boundCreatedTimeRenderer = Object();
  @property({type: Object}) _boundPermissionRenderer = Object();
  @property({type: Object}) _boundCloneableRenderer = Object();
  @property({type: Object}) _boundQuotaRenderer = Object();
  @property({type: Object}) _boundUploadListRenderer = Object();
  @property({type: Object}) _boundUploadProgressRenderer = Object();
  @property({type: Object}) _boundInviteeInfoRenderer = Object();
  @property({type: Object}) _boundIDRenderer = Object();
  @property({type: Boolean}) _uploadFlag = true;
  @property({type: Boolean}) _folderRefreshing = false;
  @property({type: Number}) lastQueryTime = 0;
  @property({type: Boolean}) isWritable = false;
  @property({type: Object}) permissions = {
    rw: 'Read-Write',
    ro: 'Read-Only',
    wd: 'Delete'
  };
  @property({type: Number}) _maxFileUploadSize = -1;
  @property({type: Number}) selectAreaHeight;
  @property({type: String}) oldFileExtension = '';
  @property({type: String}) newFileExtension = '';
  @property({type: Boolean}) is_dir = false;
  @property({type: Number}) minimumResource = {
    cpu: 1,
    mem: 0.5
  };
  @property({type: Array}) filebrowserSupportedImages = [];
  @property({type: Object}) storageProxyInfo = Object();
  @property({type: Array}) quotaSupportStorageBackends = ['xfs', 'weka'];
  @property({type: Object}) quotaUnit = {
    MiB: Math.pow(2, 20),
    GiB: Math.pow(2, 30),
    TiB: Math.pow(2, 40),
    PiB: Math.pow(2, 50)
  };
  @property({type: Object}) maxSize = {
    value: 0,
    unit: 'MiB'
  };
  @property({type: Object}) quota = {
    value: 0,
    unit: 'MiB'
  };
  @query('#loading-spinner') spinner!: HTMLElementTagNameMap['lablup-loading-spinner'];
  @query('#modify-folder-quota') modifyFolderQuotaInput!: TextField;
  @query('#modify-folder-quota-unit') modifyFolderQuotaUnitSelect!: Select;
  @query('#fileList-grid') fileListGrid!: HTMLElementTagNameMap['vaadin-grid'];
  @query('#mkdir-name') mkdirNameInput!: TextField;
  @query('#delete-folder-name') deleteFolderNameInput!: TextField;
  @query('#new-folder-name') newFolderNameInput!: TextField;
  @query('#new-file-name') newFileNameInput!: TextField;
  @query('#leave-folder-name') leaveFolderNameInput!: TextField;
  @query('#update-folder-permission') updateFolderPermissionSelect!: Select;
  @query('#update-folder-cloneable') updateFolderCloneableSwitch!: HTMLElementTagNameMap['mwc-switch'];
  @query('#rename-file-dialog') renameFileDialog!: HTMLElementTagNameMap['backend-ai-dialog'];
  @query('#delete-file-dialog') deleteFileDialog!: HTMLElementTagNameMap['backend-ai-dialog'];
  @query('#filebrowser-notification-dialog') fileBrowserNotificationDialog!: HTMLElementTagNameMap['backend-ai-dialog'];
  @query('#file-extension-change-dialog') fileExtensionChangeDialog!: HTMLElementTagNameMap['backend-ai-dialog'];
  @query('#folder-explorer-dialog') folderExplorerDialog!: HTMLElementTagNameMap['backend-ai-dialog'];
  @query('#download-file-dialog') downloadFileDialog!: HTMLElementTagNameMap['backend-ai-dialog'];
  @query('#modify-permission-dialog') modifyPermissionDialog!: HTMLElementTagNameMap['backend-ai-dialog'];
  @query('#share-folder-dialog') shareFolderDialog!: HTMLElementTagNameMap['backend-ai-dialog'];

  constructor() {
    super();
    this._boundIndexRenderer = this.indexRenderer.bind(this);
    this._boundTypeRenderer = this.typeRenderer.bind(this);
    this._boundControlFolderListRenderer = this.controlFolderListRenderer.bind(this);
    this._boundControlFileListRenderer = this.controlFileListRenderer.bind(this);
    this._boundPermissionViewRenderer = this.permissionViewRenderer.bind(this);
    this._boundCloneableRenderer = this.CloneableRenderer.bind(this);
    this._boundOwnerRenderer = this.OwnerRenderer.bind(this);
    this._boundFileNameRenderer = this.fileNameRenderer.bind(this);
    this._boundCreatedTimeRenderer = this.createdTimeRenderer.bind(this);
    this._boundPermissionRenderer = this.permissionRenderer.bind(this);
    this._boundFolderListRenderer = this.folderListRenderer.bind(this);
    this._boundQuotaRenderer = this.quotaRenderer.bind(this);
    this._boundUploadListRenderer = this.uploadListRenderer.bind(this);
    this._boundUploadProgressRenderer = this.uploadProgressRenderer.bind(this);
    this._boundInviteeInfoRenderer = this.inviteeInfoRenderer.bind(this);
    this._boundIDRenderer = this.iDRenderer.bind(this);
  }

  static get styles(): CSSResultGroup {
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

        span.title {
          margin: auto 10px;
          min-width: 35px;
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

        mwc-icon.cloneable {
          padding-top: 10px;
        }

        .warning {
          color: red;
        }

        vaadin-item {
          font-size: 13px;
          font-weight: 100;
        }

        mwc-checkbox {
          --mdc-theme-secondary: var(--general-checkbox-color);
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

        #filebrowser-notification-dialog {
          --component-width: 350px;
        }

        vaadin-text-field {
          --vaadin-text-field-default-width: auto;
        }

        div.breadcrumb {
          color: #637282;
          font-size: 1em;
          margin-bottom: 10px;
          margin-left: 20px;
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

        mwc-textfield#modify-folder-quota {
          width: 100%;
          max-width: 200px;
          padding: 0;
        }

        mwc-button {
          --mdc-typography-button-font-size: 12px;
        }

        wl-button.goto {
          margin: 0;
          padding: 5px;
          min-width: 0;
        }

        wl-button.goto:last-of-type {
          font-weight: bold;
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

        mwc-select#modify-folder-quota-unit {
          width: 120px;
        }

        mwc-select.full-width {
          width: 100%;
        }

        mwc-select.full-width.fixed-position > mwc-list-item {
          width: 288px; // default width
        }

        mwc-select.fixed-position > mwc-list-item {
          width: 147px; // default width
        }

        mwc-select.fixed-position#modify-folder-quota-unit > mwc-list-item {
          width: 88px; // default width
        }

        mwc-radio {
          --mdc-theme-secondary: var(--general-textfield-selected-color);
        }

        #textfields wl-textfield,
        wl-label {
          margin-bottom: 20px;
        }

        wl-label {
          --label-font-family: 'Ubuntu', Roboto;
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

        backend-ai-dialog#modify-folder-dialog {
          --component-max-width: 375px;
        }

        .apply-grayscale {
          -webkit-filter: grayscale(1.0);
          filter: grayscale(1.0);
        }

        img#filebrowser-img {
          width:24px;
          margin:15px 10px;
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

        @media screen and (min-width: 900px) {
          #folder-explorer-dialog,
          #folder-explorer-dialog.mini_ui
           {
            --component-width: calc(100% - 45px); /* calc(100% - 30px); */
          }
        }
      `];
  }

  _toggleFileListCheckbox() {
    const buttons = this.shadowRoot?.querySelectorAll<Button>('.multiple-action-buttons') as NodeListOf<Button>;
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

  /**
   * Update Quota Input to human readable value with proper unit
   */
  _updateQuotaInputHumanReadableValue() {
    let unit = 'MiB'; // default unit starts with MiB.
    const convertedCurrentQuota = Number(this.modifyFolderQuotaInput.value) * (this.quotaUnit[this.modifyFolderQuotaUnitSelect.value]);
    const convertedQuota = this.maxSize.value * (this.quotaUnit[this.maxSize.unit]);
    [this.modifyFolderQuotaInput.value, unit]= globalThis.backendaiutils._humanReadableFileSize(convertedCurrentQuota).split(' ');
    if (['Bytes', 'KiB', 'MiB'].includes(unit)) {
      if (unit === 'MiB') {
        this.modifyFolderQuotaInput.value = Number(this.modifyFolderQuotaInput.value) < 1 ? '1' : Math.round(Number(this.modifyFolderQuotaInput.value)).toString();
      } else {
        this.modifyFolderQuotaInput.value = '1';
      }
      unit = 'MiB';
    } else {
      this.modifyFolderQuotaInput.value = parseFloat(this.modifyFolderQuotaInput.value).toFixed(1);
      if (convertedQuota < convertedCurrentQuota) {
        this.modifyFolderQuotaInput.value = this.maxSize.value.toString();
        unit = this.maxSize.unit;
      }
    }
    // apply step only when the unit is bigger than MB
    this.modifyFolderQuotaInput.step = (this.modifyFolderQuotaUnitSelect.value === 'MiB')? 0 : 0.1;
    const idx = this.modifyFolderQuotaUnitSelect.items.findIndex((item) => item.value === unit);
    this.modifyFolderQuotaUnitSelect.select(idx);
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <vaadin-grid class="folderlist" theme="row-stripes column-borders wrap-cell-content compact" column-reordering-allowed aria-label="Folder list" .items="${this.folders}">
        <vaadin-grid-column width="40px" flex-grow="0" resizable header="#" text-align="center" .renderer="${this._boundIndexRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-filter-column path="name" width="80px" resizable .renderer="${this._boundFolderListRenderer}"
            header="${_t('data.folders.Name')}"></vaadin-grid-filter-column>
        <vaadin-grid-column width="135px" flex-grow="0" resizable header="ID" .renderer="${this._boundIDRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-filter-column path="host" width="105px" flex-grow="0" resizable
            header="${_t('data.folders.Location')}"></vaadin-grid-filter-column>
        <vaadin-grid-column auto-width flex-grow="0" resizable header="${_t('data.folders.FolderQuota')}" .renderer="${this._boundQuotaRenderer}"></vaadin-grid-column>
        <vaadin-grid-column width="55px" flex-grow="0" resizable header="${_t('data.folders.Type')}" .renderer="${this._boundTypeRenderer}"></vaadin-grid-column>
        <vaadin-grid-column width="95px" flex-grow="0" resizable header="${_t('data.folders.Permission')}" .renderer="${this._boundPermissionViewRenderer}"></vaadin-grid-column>
        <vaadin-grid-column auto-width flex-grow="0" resizable header="${_t('data.folders.Owner')}" .renderer="${this._boundOwnerRenderer}"></vaadin-grid-column>
        ${this.enableStorageProxy ? html`
          <!--<vaadin-grid-column
              auto-width flex-grow="0" resizable header="${_t('data.folders.Cloneable')}"
              .renderer="${this._boundCloneableRenderer}"></vaadin-grid-column>` : html``}
        <vaadin-grid-column auto-width resizable header="${_t('data.folders.Control')}" .renderer="${this._boundControlFolderListRenderer}"></vaadin-grid-column>-->
      </vaadin-grid>

      <backend-ai-dialog id="modify-folder-dialog" fixed backdrop>
        <span slot="title">${_t('data.folders.FolderOptionUpdate')}</span>
        <div slot="content" class="vertical layout flex">
          <div class="vertical layout" id="modify-quota-controls"
               style="display:${this._checkFolderSupportSizeQuota(this.folderInfo.host) ? 'flex' : 'none'}">
            <div class="horizontal layout center justified">
                <mwc-textfield id="modify-folder-quota" label="${_t('data.folders.FolderQuota')}" value="${this.maxSize.value}"
                    type="number" min="0" step="0.1" @change="${() => this._updateQuotaInputHumanReadableValue()}"></mwc-textfield>
                <mwc-select class="fixed-position" id="modify-folder-quota-unit" @change="${() => this._updateQuotaInputHumanReadableValue()}" fixedMenuPosition>
                ${Object.keys(this.quotaUnit).map((unit, idx) => html`
                      <mwc-list-item value="${unit}" ?selected="${unit === this.maxSize.unit}">${unit}</mwc-list-item>
                    `)}
                </mwc-select>
            </div>
            <span class="helper-text">${_t('data.folders.MaxFolderQuota')} : ${this.maxSize.value + ' ' + this.maxSize.unit}</span>
          </div>
          <mwc-select class="full-width fixed-position" id="update-folder-permission" style="width:100%;" label="${_t('data.Permission')}"
                  fixedMenuPosition>
                  ${Object.keys(this.permissions).map((key) => html`
                    <mwc-list-item value="${this.permissions[key]}">${this.permissions[key]}</mwc-list-item>
                  `)}
          </mwc-select>
          ${this.enableStorageProxy ? html`
          <!--<div class="horizontal layout flex wrap center justified">
            <p style="color:rgba(0, 0, 0, 0.6);">
              ${_t('data.folders.Cloneable')}
            </p>
            <mwc-switch id="update-folder-cloneable" style="margin-right:10px;">
            </mwc-switch>
          </div>-->
          ` : html``}
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button unelevated fullwidth type="submit" icon="edit" id="update-button" @click="${() => this._updateFolder()}">
            ${_t('data.Update')}
          </mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="modify-folder-name-dialog" fixed backdrop>
        <span slot="title">${_t('data.folders.RenameAFolder')}</span>
        <div slot="content" class="vertical layout flex">
          <mwc-textfield
              id="clone-folder-src" label="${_t('data.ExistingFolderName')}" value="${this.renameFolderName}"
              disabled></mwc-textfield>
          <mwc-textfield class="red" id="new-folder-name" label="${_t('data.folders.TypeNewFolderName')}"
              pattern="^[a-zA-Z0-9\._-]*$" autoValidate validationMessage="${_t('data.Allowslettersnumbersand-_dot')}"
              maxLength="64" placeholder="${_text('maxLength.64chars')}"
              @change="${() => this._validateFolderName(true)}"></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button unelevated fullwidth type="submit" icon="edit" id="update-button" @click="${() => this._updateFolderName()}">
            ${_t('data.Update')}
          </mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="delete-folder-dialog" fixed backdrop>
        <span slot="title">${_t('data.folders.DeleteAFolder')}</span>
        <div slot="content">
          <div class="warning" style="margin-left:16px;">${_t('dialog.warning.CannotBeUndone')}</div>
          <mwc-textfield class="red" id="delete-folder-name" label="${_t('data.folders.TypeFolderNameToDelete')}"
                         maxLength="64" placeholder="${_text('maxLength.64chars')}"></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button unelevated fullwidth type="submit" icon="close" id="delete-button" @click="${() => this._deleteFolderWithCheck()}">
            ${_t('data.folders.Delete')}
          </mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="leave-folder-dialog" fixed backdrop>
        <span slot="title">${_t('data.folders.LeaveAFolder')}</span>
        <div slot="content">
          <div class="warning" style="margin-left:16px;">${_t('dialog.warning.CannotBeUndone')}</div>
          <mwc-textfield class="red" id="leave-folder-name" label="${_t('data.folders.TypeFolderNameToLeave')}"
                         maxLength="64" placeholder="${_text('maxLength.64chars')}"></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button unelevated fullwidth type="submit" id="leave-button" @click="${() => this._leaveFolderWithCheck()}">
            ${_t('data.folders.Leave')}
          </mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="info-folder-dialog" fixed backdrop>
        <span slot="title">${this.folderInfo.name}</span>
        <div slot="content" role="listbox" style="margin: 0;width:100%;">
          <div class="horizontal justified layout wrap" style="margin-top:15px;">
              <div class="vertical layout center info-indicator">
                <div class="big indicator">${this.folderInfo.host}</div>
                <span>${_t('data.folders.Location')}</span>
              </div>
            <div class="vertical layout center info-indicator">
              <div class="big indicator">
                ${this.folderInfo.numFiles < 0 ? 'many' : this.folderInfo.numFiles}
              </div>
              <span>${_t('data.folders.NumberOfFiles')}</span>
            </div>
          </div>
          <mwc-list>
            <mwc-list-item twoline>
              <span><strong>ID</strong></span>
              <span class="monospace" slot="secondary">${this.folderInfo.id}</span>
            </mwc-list-item>
            ${this.folderInfo.is_owner ? html`
              <mwc-list-item twoline>
                <span><strong>${_t('data.folders.Ownership')}</strong></span>
                <span slot="secondary">${_t('data.folders.DescYouAreFolderOwner')}</span>
              </mwc-list-item>
            ` : html``}
            <mwc-list-item twoline>
              <span><strong>${_t('data.folders.Permission')}</strong></span>
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
            ${this.enableStorageProxy ? html`
              <mwc-list-item twoline>
                <span><strong>${_t('data.folders.Cloneable')}</strong></span>
                <span class="monospace" slot="secondary">
                    ${this.folderInfo.cloneable ? html`
                    <mwc-icon class="cloneable" style="color:green;">check_circle</mwc-icon>
                    ` : html`
                    <mwc-icon class="cloneable" style="color:red;">block</mwc-icon>
                    `}
                </span>
              </mwc-list-item>
            ` : html``}
            ${this._checkFolderSupportSizeQuota(this.folderInfo.host) ? html`
              <mwc-list-item twoline>
                <span><strong>${_t('data.folders.FolderUsage')}</strong></span>
                <span class="monospace" slot="secondary">
                  ${_t('data.folders.FolderUsing')}: ${this.folderInfo.used_bytes >= 0 ? globalThis.backendaiutils._humanReadableFileSize(this.folderInfo.used_bytes) : 'Undefined'} /
                  ${_t('data.folders.FolderQuota')}: ${this.folderInfo.max_size >= 0 ? globalThis.backendaiutils._humanReadableFileSize(this.folderInfo.max_size * this.quotaUnit.MiB) : 'Undefined'}
                  ${this.folderInfo.used_bytes >= 0 && this.folderInfo.max_size >= 0 ? html`
                    <vaadin-progress-bar value="${this.folderInfo.used_bytes / this.folderInfo.max_size / 2**20}"></vaadin-progress-bar>
                  ` : html``}
                </span>
              </mwc-list-item>
            ` : html``}
          </mwc-list>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="folder-explorer-dialog" class="folder-explorer" narrowLayout>
        <span slot="title" style="margin-right:1rem;">${this.explorer.id}</span>
        <div slot="action" class="horizontal layout space-between folder-action-buttons center">
          <div class="flex"></div>
          ${this.isWritable ? html`
            <mwc-button
                outlined
                class="multiple-action-buttons fg red"
                icon="delete"
                @click="${() => this._openDeleteMultipleFileDialog()}"
                style="display:none;">
                <span>${_t('data.explorer.Delete')}</span>
            </mwc-button>
            <div id="add-btn-cover">
              <mwc-button
                  id="add-btn"
                  icon="cloud_upload"
                  ?disabled=${!this.isWritable}
                  @click="${(e) => this._uploadFileBtnClick(e)}">
                  <span>${_t('data.explorer.UploadFiles')}</span>
              </mwc-button>
            </div>
            <div id="mkdir-cover">
              <mwc-button
                  id="mkdir"
                  class="tooltip"
                  icon="create_new_folder"
                  ?disabled=${!this.isWritable}
                  @click="${() => this._mkdirDialog()}">
                  <span>${_t('data.explorer.NewFolder')}</span>
              </mwc-button>
            </div>
          ` : html`
          <mwc-button
              id="readonly-btn"
              disabled>
            <span>${_t('data.explorer.ReadonlyFolder')}</span>
          </mwc-button>
          `}
          <div id="filebrowser-btn-cover">
            <mwc-button
                id="filebrowser-btn"
                @click="${() => this._executeFileBrowser()}">
                <img
                  id="filebrowser-img"
                  alt="File Browser"
                  src="./resources/icons/filebrowser.svg"></img>
                <span>${_t('data.explorer.ExecuteFileBrowser')}</span>
            </mwc-button>
          </div>
        </div>
        <div slot="content">
            <div class="breadcrumb">
              ${this.explorer.breadcrumb ? html`
                <ul>
                  ${this.explorer.breadcrumb.map((item) => html`
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
            <div class="horizontal layout start-justified">
              <mwc-button icon="cancel" id="cancel_upload" @click="${() => this._cancelUpload()}">
                ${_t('data.explorer.StopUploading')}
              </mwc-button>
            </div>
          <vaadin-grid class="progress" theme="row-stripes compact" aria-label="uploadFiles" .items="${this.uploadFiles}" height-by-rows>
            <vaadin-grid-column width="100px" flex-grow="0" .renderer="${this._boundUploadListRenderer}"></vaadin-grid-column>
            <vaadin-grid-column .renderer="${this._boundUploadProgressRenderer}"></vaadin-grid-column>
          </vaadin-grid>` : html``}
          <vaadin-grid id="fileList-grid" class="explorer" theme="row-stripes compact" aria-label="Explorer" .items="${this.explorerFiles}">
            <vaadin-grid-selection-column auto-select></vaadin-grid-selection-column>
            <vaadin-grid-column width="40px" flex-grow="0" resizable header="#" .renderer="${this._boundIndexRenderer}">
            </vaadin-grid-column>
            <vaadin-grid-sort-column flex-grow="2" resizable header="${_t('data.explorer.Name')}" path="filename" .renderer="${this._boundFileNameRenderer}">
            </vaadin-grid-sort-column>
            <vaadin-grid-sort-column flex-grow="2" resizable header="${_t('data.explorer.Created')}" path="ctime" .renderer="${this._boundCreatedTimeRenderer}">
            </vaadin-grid-sort-column>
            <vaadin-grid-sort-column path="size" auto-width resizable header="${_t('data.explorer.Size')}">
            </vaadin-grid-sort-column>
            <vaadin-grid-column resizable auto-width header="${_t('data.explorer.Actions')}" .renderer="${this._boundControlFileListRenderer}">
            </vaadin-grid-column>
          </vaadin-grid>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="mkdir-dialog" fixed backdrop>
        <span slot="title">${_t('data.explorer.CreateANewFolder')}</span>
        <div slot="content">
          <mwc-textfield id="mkdir-name"
                         label="${_t('data.explorer.Foldername')}"
                         @change="${() => this._validatePathName()}"
                         required
                         maxLength="255" placeholder="${_text('maxLength.255chars')}"
                         validationMessage="${_text('data.explorer.ValueRequired')}"></mwc-textfield>
          <br/>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout distancing">
          <mwc-button icon="rowing" unelevated fullwidth type="submit" id="mkdir-btn" @click="${(e) => this._mkdir(e)}">
            ${_t('button.Create')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="share-folder-dialog" fixed backdrop persistent>
        <span slot="title">${_t('data.explorer.ShareFolder')}</span>
        <div slot="content" role="listbox" style="margin: 0;width:100%;">
          <div style="margin: 10px 0px">${_t('data.explorer.People')}</div>
          <div class="vertical layout flex" id="textfields">
            <div class="horizontal layout">
              <div style="flex-grow: 2">
                <mwc-textfield class="share-email" type="email" id="first-email"
                    label="${_t('data.explorer.EnterEmailAddress')}"
                    maxLength="64" placeholder="${_text('maxLength.64chars')}">
                </mwc-textfield>
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
          <div style="margin: 10px 0px">${_t('data.explorer.Permissions')}</div>
          <div style="display: flex; justify-content: space-evenly;">
            <mwc-formfield label="${_t('data.folders.View')}">
              <mwc-radio name="share-folder-permission" checked value="ro"></mwc-radio>
            </mwc-formfield>
            <mwc-formfield label="${_t('data.folders.Edit')}">
              <mwc-radio name="share-folder-permission" value="rw"></mwc-radio>
            </mwc-formfield>
            <mwc-formfield label="${_t('data.folders.EditDelete')}">
              <mwc-radio name="share-folder-permission" value="wd"></mwc-radio>
            </mwc-formfield>
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            icon="share"
            type="button"
            unelevated
            fullwidth
            id="share-button"
            @click=${(e) => this._shareFolder(e)}>
            ${_t('button.Share')}
          </mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="modify-permission-dialog" fixed backdrop>
        <span slot="title">${_t('data.explorer.ModifyPermissions')}</span>
        <div slot="content" role="listbox" style="margin: 0; padding: 10px;">
          <vaadin-grid theme="row-stripes column-borders compact" .items="${this.invitees}">
            <vaadin-grid-column
              width="30px"
              flex-grow="0"
              header="#"
              .renderer="${this._boundIndexRenderer}"
            ></vaadin-grid-column>
            <vaadin-grid-column header="${_t('data.explorer.InviteeEmail')}" .renderer="${this._boundInviteeInfoRenderer}">
            </vaadin-grid-column>
            <vaadin-grid-column header="${_t('data.explorer.Permission')}" .renderer="${this._boundPermissionRenderer}">
            </vaadin-grid-column>
          </vaadin-grid>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            icon="check"
            type="button"
            unelevated
            fullwidth
            @click=${() => this._modifySharedFolderPermissions()}
          >
            ${_t('button.SaveChanges')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="rename-file-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t('data.explorer.RenameAFile')}</span>
        <div slot="content">
          <mwc-textfield class="red" id="new-file-name" label="${_t('data.explorer.NewFileName')}"
          required @change="${() => this._validateExistingFileName()}" auto-validate style="width:320px;"
          maxLength="255" placeholder="${_text('maxLength.255chars')}" autoFocus></mwc-textfield>
          <div id="old-file-name" style="padding-left:15px;height:2.5em;"></div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button icon="edit" fullwidth type="button" id="rename-file-button" unelevated @click="${() => this._compareFileExtension()}">
            ${_t('data.explorer.RenameAFile')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="delete-file-dialog" fixed backdrop>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>${_t('dialog.warning.CannotBeUndone')}
          ${_t('dialog.ask.DoYouWantToProceed')}</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button outlined @click="${(e) => this._hideDialog(e)}">${_t('button.Cancel')}</mwc-button>
          <mwc-button raised @click="${(e) => this._deleteFileWithCheck(e)}">${_t('button.Okay')}</mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="download-file-dialog" fixed backdrop>
        <span slot="title">${_t('data.explorer.DownloadFile')}</span>
        <div slot="content">
          <a href="${this.downloadURL}">
            <mwc-button outlined>${_t('data.explorer.TouchToDownload')}</mwc-button>
          </a>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout distancing">
          <mwc-button @click="${(e) => this._hideDialog(e)}">${_t('button.Close')}</mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="file-extension-change-dialog" fixed backdrop>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>${_t('data.explorer.FileExtensionChanged')}</p>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout distancing">
          <mwc-button outlined fullwidth @click="${(e) => this._keepFileExtension()}">
            ${globalThis.backendaioptions.get('language') !== 'ko' ?
    html`
                ${_text('data.explorer.KeepFileExtension') + this.oldFileExtension}
              ` :
    html`
                ${this.oldFileExtension + _text('data.explorer.KeepFileExtension')}
              `}
          </mwc-button>
          <mwc-button unelevated fullwidth @click="${() => this._renameFile()}">
            ${globalThis.backendaioptions.get('language') !== 'ko' ?
    html`
                ${this.newFileExtension ? _text('data.explorer.UseNewFileExtension') + this.newFileExtension : _text('data.explorer.RemoveFileExtension')}
              ` :
    html`
                ${this.newFileExtension ? this.newFileExtension + _text('data.explorer.UseNewFileExtension') : _text('data.explorer.RemoveFileExtension')}
              `}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="filebrowser-notification-dialog" fixed backdrop narrowLayout>
        <span slot="title">${_t('dialog.title.Notice')}</span>
        <div slot="content" style="margin: 15px;">
          <span>${_t('data.explorer.ReadOnlyFolderOnFileBrowser')}</span>
        </div>
        <div slot="footer" class="flex horizontal layout center justified" style="margin: 15px 15px 15px 0px;">
          <div class="horizontal layout start-justified center">
            <mwc-checkbox @change="${(e) => this._toggleShowFilebrowserNotification(e)}"></mwc-checkbox>
            <span style="font-size:0.8rem;">${_text('dialog.hide.DonotShowThisAgain')}</span>
          </div>
          <mwc-button unelevated @click="${(e) => this._hideDialog(e)}">${_t('button.Confirm')}</mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }

  firstUpdated() {
    this._addEventListenerDropZone();
    this._mkdir = this._mkdir.bind(this);

    // TODO delete - not used in this file
    // this.sessionLauncher = this.shadowRoot?.querySelector('#session-launcher');
    this.fileListGrid.addEventListener('selected-items-changed', () => {
      this._toggleFileListCheckbox();
    });
    this.indicator = globalThis.lablupIndicator;
    this.notification = globalThis.lablupNotification;
    const textfields = this.shadowRoot?.querySelectorAll('mwc-textfield') as NodeListOf<TextField>;
    for (const textfield of Array.from(textfields)) {
      this._addInputValidator(textfield);
    }
    if (this.storageType === 'automount') {
      (this.shadowRoot?.querySelector('vaadin-grid.folderlist') as HTMLElement).style.height = 'calc(100vh - 230px)';
    } else {
      (this.shadowRoot?.querySelector('vaadin-grid.folderlist') as HTMLElement).style.height = 'calc(100vh - 185px)';
    }
    document.addEventListener('backend-ai-group-changed', (e) => this._refreshFolderList(true, 'group-changed'));
    document.addEventListener('backend-ai-ui-changed', (e) => this._refreshFolderUI(e));
    this._refreshFolderUI({'detail': {'mini-ui': globalThis.mini_ui}});
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._getStorageProxyBackendInformation();
        this._triggerFolderListChanged();
      }, true);
    } else { // already connected
      this._getStorageProxyBackendInformation();
      this._triggerFolderListChanged();
    }
  }

  _modifySharedFolderPermissions() {
    const selectNodeList = this.shadowRoot?.querySelectorAll('#modify-permission-dialog wl-select');
    const inputList = Array.prototype.filter.call(selectNodeList, (pulldown, idx) => pulldown.value !== (this.invitees as any)[idx].perm)
      .map((pulldown, idx) => ({
        'perm': pulldown.value === 'kickout' ? null : pulldown.value,
        'user': (this.invitees as any)[idx].shared_to.uuid,
        'vfolder': (this.invitees as any)[idx].vfolder_id
      }));
    const promiseArray = inputList.map((input) => globalThis.backendaiclient.vfolder.modify_invitee_permission(input));
    Promise.all(promiseArray).then((response: any) => {
      if (response.length === 0) {
        this.notification.text = _text('data.permission.NoChanges');
      } else {
        this.notification.text = _text('data.permission.PermissionModified');
      }
      this.notification.show();
      this.modifyPermissionDialog.hide();
    });
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
      html`
      <div class="vertical layout">
        <wl-select label="${_t('data.folders.SelectPermission')}">
          <option ?selected=${rowData.item.perm === 'ro'} value="ro">${_t('data.folders.View')}</option>
          <option ?selected=${rowData.item.perm === 'rw'} value="rw">${_t('data.folders.Edit')}</option>
          <option ?selected=${rowData.item.perm === 'wd'} value="wd">${_t('data.folders.EditDelete')}</option>
          <option value="kickout">${_t('data.folders.KickOut')}</option>
        </wl-select>
      </div>`, root);
    this.shadowRoot?.querySelector('wl-select')?.requestUpdate().then(() => {
      render(
        html`
        <div class="vertical layout">
          <wl-select label="${_t('data.folders.SelectPermission')}">
            <option ?selected=${rowData.item.perm === 'ro'} value="ro">${_t('data.folders.View')}</option>
            <option ?selected=${rowData.item.perm === 'rw'} value="rw">${_t('data.folders.Edit')}</option>
            <option ?selected=${rowData.item.perm === 'wd'} value="wd">${_t('data.folders.EditDelete')}</option>
            <option value="kickout">${_t('data.folders.KickOut')}</option>
          </wl-select>
        </div>`, root);
    });
  }

  folderListRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="indicator" @click="[[_folderExplorer()]]" .folder-id="${rowData.item.name}">${rowData.item.name}</div>
      `, root
    );
  }

  quotaRenderer(root, column?, rowData?) {
    let quotaIndicator = '-';
    if (this._checkFolderSupportSizeQuota(rowData.item.host) && rowData.item.max_size) {
      quotaIndicator = globalThis.backendaiutils._humanReadableFileSize(rowData.item.max_size * this.quotaUnit.MiB);
    }
    render(
      // language=HTML
      html`
        <div class="horizontal layout center center-justified">${quotaIndicator}</div>
      `, root
    );
  }

  uploadListRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
      <vaadin-item class="progress-item">
        <div>
          ${rowData.item.complete ? html`
            <wl-icon>check</wl-icon>
          ` : html``}
        </div>
      </vaadin-item>
      `, root
    );
  }

  uploadProgressRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
      <vaadin-item>
        <span>${rowData.item.name}</span>
        ${rowData.item.complete ? html`` : html`
        <div>
            <vaadin-progress-bar value="${rowData.item.progress}"></vaadin-progress-bar>
          </div>
          <div>
            <span>${rowData.item.caption}</span>
          </div>
        `}
      </vaadin-item>
      `, root
    );
  }

  inviteeInfoRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div>${rowData.item.shared_to.email}</div>
      `, root
    );
  }

  iDRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
      <div class="layout vertical">
        <span class="indicator monospace">${rowData.item.id}</span>
      </div>
      `, root
    );
  }

  /**
   * Add textfield to write email.
   *
   * */
  _addTextField() {
    const newTextField = document.createElement('mwc-textfield');
    newTextField.label = _text('data.explorer.EnterEmailAddress');
    newTextField.type = 'email';
    newTextField.className = 'share-email';
    newTextField.style.width = 'auto';
    newTextField.style.marginRight = '83px';
    this.shadowRoot?.querySelector('#textfields')?.appendChild(newTextField);
  }

  /**
   * Remove existing email textfield.
   *
   */
  _removeTextField() {
    const textfields = this.shadowRoot?.querySelector('#textfields') as HTMLDivElement;
    if (textfields.children.length > 1 && textfields.lastChild) {
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
          folder-id="${rowData.item.id}"
          folder-name="${rowData.item.name}"
          folder-type="${rowData.item.type}"
        >
          <mwc-icon-button
            class="fg green controls-running"
            icon="info"
            @click="${(e) => this._infoFolder(e)}"
          ></mwc-icon-button>

          ${this._hasPermission(rowData.item, 'r') ?
    html`
              <mwc-icon-button
                class="fg blue controls-running"
                icon="folder_open"
                @click="${(e) =>
    this._folderExplorer(e, (this._hasPermission(rowData.item, 'w') ||
                rowData.item.is_owner ||
                (rowData.item.type === 'group' && this.is_admin)))}"
                .folder-id="${rowData.item.name}"></mwc-icon-button>
            ` :
    html``
}
          <!--${this._hasPermission(rowData.item, 'r') && this.enableStorageProxy ?
    html`
            <mwc-icon-button
              class="fg blue controls-running"
              icon="content_copy"
              disabled
              @click="${() => {
    this._requestCloneFolder(rowData.item);
  }}"></mwc-icon-button>
            ` : html``}-->
          ${rowData.item.is_owner ?
    html`
              <mwc-icon-button
                class="fg ${rowData.item.type == 'user' ? 'blue' : 'green'} controls-running"
                icon="share"
                @click="${(e) => this._shareFolderDialog(e)}"
              ></mwc-icon-button>
            ` :
    html``
}

          ${rowData.item.is_owner ?
    html`
              <mwc-icon-button
                class="fg cyan controls-running"
                icon="perm_identity"
                @click=${(e) => (this._modifyPermissionDialog(rowData.item.id))}
              ></mwc-icon-button>
            ` :
    html``
}
          ${rowData.item.is_owner ?
    html`
              <mwc-icon-button
                class="fg ${rowData.item.type == 'user' ? 'blue' : 'green'} controls-running"
                icon="create"
                @click="${(e) => this._renameFolderDialog(e)}"
              ></mwc-icon-button>
            ` :
    html``
}
          ${rowData.item.is_owner ?
    html`
              <mwc-icon-button
                class="fg blue controls-running"
                icon="settings"
                @click="${(e) => this._modifyFolderOptionDialog(e)}"
              ></mwc-icon-button>
            ` :
    html``
}
          ${rowData.item.is_owner || this._hasPermission(rowData.item, 'd') || (rowData.item.type === 'group' && this.is_admin) ?
    html`
              <mwc-icon-button
                class="fg red controls-running"
                icon="delete"
                @click="${(e) => this._deleteFolderDialog(e)}"
              ></mwc-icon-button>
            ` :
    html``
}
          ${(!rowData.item.is_owner && rowData.item.type == 'user') ?
    html`
              <mwc-icon-button
                class="fg red controls-running"
                icon="remove_circle"
                @click="${(e) => this._leaveInvitedFolderDialog(e)}"
              ></mwc-icon-button>
            ` :
    html``
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
              filename="${rowData.item.filename}" @click="${(e) => this._openRenameFileDialog(e, this._isDir(rowData.item))}"></mwc-icon-button>
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
        </div>
      `, root
    );
  }

  /**
   * Render whether owner of the vfolder or not using icon
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  OwnerRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        ${rowData.item.is_owner ? html`
          <div class="horizontal center-justified center layout">
            <mwc-icon-button class="fg green" icon="done"></mwc-icon-button>
          </div>`: html``}
      `, root
    );
  }

  /**
   * Render whether the vfolder is cloneable or not
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  CloneableRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        ${rowData.item.cloneable ? html`
          <div class="horizontal center-justified center layout">
            <mwc-icon-button class="fg green" icon="done"></mwc-icon-button>
          </div>`: html``}
      `, root
    );
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
        </div>
      `, root
    );
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
        ${rowData.item.type == 'user' ? html`<wl-icon>person</wl-icon>` : html`<wl-icon class="fg green">group</wl-icon>`}
        </div>
      `, root
    );
  }

  async _getStorageProxyBackendInformation() {
    const vhostInfo = await globalThis.backendaiclient.vfolder.list_hosts();
    this.storageProxyInfo = vhostInfo.volume_info || {};
  }

  _checkFolderSupportSizeQuota(host: string) {
    if (!host) {
      return false;
    }
    const backend = this.storageProxyInfo[host]?.backend;
    return this.quotaSupportStorageBackends.includes(backend) ? true : false;
  }

  refreshFolderList() {
    this._triggerFolderListChanged();
    return this._refreshFolderList(true, 'refreshFolderList');
  }

  /**
   * If both refreshOnly and activeConnected are true, refresh folderlists.
   *
   * @param {boolean} refreshOnly
   * @param {string} source
   */
  _refreshFolderList(refreshOnly = false, source = 'unknown') {
    // Skip if it is already refreshing OR is not on the page.
    if (this._folderRefreshing || !this.active) {
      return;
    }
    if (Date.now() - this.lastQueryTime < 1000) {
      return;
    }
    this._folderRefreshing = true;
    this.lastQueryTime = Date.now();
    this._getMaxSize();
    this.spinner.show();
    let groupId = null;
    groupId = globalThis.backendaiclient.current_group_id();
    globalThis.backendaiclient.vfolder.list(groupId).then((value) => {
      this.spinner.hide();
      const folders = value.filter((item) => {
        if (this.storageType === 'general' && !item.name.startsWith('.')) {
          return item;
        } else if (this.storageType === 'automount' && item.name.startsWith('.')) {
          return item;
        }
      });
      this.folders = folders;
      this._folderRefreshing = false;
    }).catch(()=>{
      this._folderRefreshing = false;
    });
    globalThis.backendaiclient.vfolder.list_hosts().then((res) => {
      // refresh folder list every 30sec
      if (this.active && !refreshOnly) {
        setTimeout(() => {
          this._refreshFolderList(false, 'loop');
        }, 30000);
      }
    });
  }

  _refreshFolderUI(e) {
    if (Object.prototype.hasOwnProperty.call(e.detail, 'mini-ui') && e.detail['mini-ui'] === true) {
      this.folderExplorerDialog.classList.add('mini_ui');
    } else {
      this.folderExplorerDialog.classList.remove('mini_ui');
    }
  }

  /**
   * Check the images that supports filebrowser application
   *
   */
  async _checkFilebrowserSupported() {
    const response = await globalThis.backendaiclient.image.list(['name', 'tag', 'registry', 'digest', 'installed', 'labels { key value }', 'resource_limits { key min max }'], false, true);
    const images = response.images;
    // only filter both installed and filebrowser supported image from images
    this.filebrowserSupportedImages = images.filter((image) => image['installed'] && image.labels.find((label) => label.key === 'ai.backend.service-ports' && label.value.toLowerCase().includes('filebrowser')));
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.is_admin = globalThis.backendaiclient.is_admin;
        this.enableStorageProxy = globalThis.backendaiclient.supports('storage-proxy');
        this.authenticated = true;
        this._APIMajorVersion = globalThis.backendaiclient.APIMajorVersion;
        this._maxFileUploadSize = globalThis.backendaiclient._config.maxFileUploadSize;
        this._checkFilebrowserSupported();
        this._refreshFolderList(false, 'viewStatechanged');
      }, true);
    } else {
      this.is_admin = globalThis.backendaiclient.is_admin;
      this.enableStorageProxy = globalThis.backendaiclient.supports('storage-proxy');
      this.authenticated = true;
      this._APIMajorVersion = globalThis.backendaiclient.APIMajorVersion;
      this._maxFileUploadSize = globalThis.backendaiclient._config.maxFileUploadSize;
      this._checkFilebrowserSupported();
      this._refreshFolderList(false, 'viewStatechanged');
    }
  }

  _folderExplorerDialog() {
    this.openDialog('folder-explorer-dialog');
  }

  _mkdirDialog() {
    this.mkdirNameInput.value = '';
    this.openDialog('mkdir-dialog');
  }

  openDialog(id) {
    // var body = document.querySelector('body');
    // body.appendChild(this.$[id]);
    (this.shadowRoot?.querySelector('#' + id) as HTMLElementTagNameMap['backend-ai-dialog']).show();
  }

  closeDialog(id) {
    (this.shadowRoot?.querySelector('#' + id) as HTMLElementTagNameMap['backend-ai-dialog']).hide();
  }

  _indexFrom1(index) {
    return index + 1;
  }

  /**
   * Return whether item has permission or not.
   *
   * @param {object} item
   * @param {char} perm - permission
   * @return {boolean} true if user have permission. If not, false.
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

  _getControlName(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const folderName = controls.getAttribute('folder-name');
    return folderName;
  }

  _getControlId(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const folderId = controls.getAttribute('folder-id');
    return folderId;
  }

  _getControlType(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const folderId = controls.getAttribute('folder-type');
    return folderId;
  }

  /**
   * Inform about folder using dialog.
   *
   * @param {Event} e - click the info icon button
   * */
  _infoFolder(e) {
    const folderName = this._getControlName(e);
    const job = globalThis.backendaiclient.vfolder.info(folderName);
    job.then((value) => {
      this.folderInfo = value;
      this.openDialog('info-folder-dialog');
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  /**
   * Open modify-folder-dialog to rename folder name.
   *
   * @param {Event} e - click the settings icon button
   * */
  _modifyFolderOptionDialog(e) {
    globalThis.backendaiclient.vfolder.name = this._getControlName(e);
    const job = globalThis.backendaiclient.vfolder.info(globalThis.backendaiclient.vfolder.name);
    job.then((value) => {
      this.folderInfo = value;
      const permission = this.folderInfo.permission;
      let idx = Object.keys(this.permissions).indexOf(permission);
      idx = idx > 0 ? idx : 0;
      this.updateFolderPermissionSelect.select(idx);
      if (this.updateFolderCloneableSwitch) {
        this.updateFolderCloneableSwitch.selected = this.folderInfo.cloneable;
      }
      // get quota if host storage support per folder quota
      if (this._checkFolderSupportSizeQuota(this.folderInfo.host)) {
        [this.quota.value, this.quota.unit] = globalThis.backendaiutils._humanReadableFileSize(this.folderInfo.max_size * this.quotaUnit['MiB']).split(' ');
        this.modifyFolderQuotaInput.value = this.quota.value.toString();
        this.modifyFolderQuotaUnitSelect.value = this.quota.unit;
      }
      this.openDialog('modify-folder-dialog');
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  /**
   * Update the folder options such as "permission" and "cloneable"
   **/
  async _updateFolder() {
    let isErrorOccurred = false;
    let cloneable = false;
    const input = {};
    if (this.updateFolderPermissionSelect) {
      let permission = this.updateFolderPermissionSelect.value;
      permission = Object.keys(this.permissions).find((key) => this.permissions[key] === permission) ?? '';
      if (permission && this.folderInfo.permission !== permission) {
        input['permission'] = permission;
      }
    }
    if (this.updateFolderCloneableSwitch) {
      cloneable = this.updateFolderCloneableSwitch.selected;
      input['cloneable'] = cloneable;
    }

    const modifyFolderJobQueue = [] as any;
    if (Object.keys(input).length > 0) {
      const updateFolderConfig = globalThis.backendaiclient.vfolder.update_folder(input, globalThis.backendaiclient.vfolder.name);
      modifyFolderJobQueue.push(updateFolderConfig);
    }
    if (this._checkFolderSupportSizeQuota(this.folderInfo.host)) {
      const quota = this.modifyFolderQuotaInput.value ? BigInt(Number(this.modifyFolderQuotaInput.value) * this.quotaUnit[this.modifyFolderQuotaUnitSelect.value]).toString: '0';
      if ((this.quota.value != Number(this.modifyFolderQuotaInput.value)) || (this.quota.unit != this.modifyFolderQuotaUnitSelect.value)) {
        const updateFolderQuota = globalThis.backendaiclient.vfolder.set_quota(this.folderInfo.host, this.folderInfo.id, quota.toString());
        modifyFolderJobQueue.push(updateFolderQuota);
      }
    }
    if (modifyFolderJobQueue.length > 0) {
      await Promise.all(modifyFolderJobQueue).then((res) => {
        this.notification.text = _text('data.folders.FolderUpdated');
        this.notification.show();
        this._refreshFolderList(true, 'updateFolder');
      }).catch((err) => {
        console.log(err);
        if (err && err.message) {
          isErrorOccurred = true;
          this.notification.text = PainKiller.relieve(err.message);
          this.notification.show(true, err);
        }
      });
    }
    if (!isErrorOccurred) {
      this.closeDialog('modify-folder-dialog');
    }
  }

  /**
   * Update the folder with the name on the new-folder-name and
   *
   */
  async _updateFolderName() {
    globalThis.backendaiclient.vfolder.name = this.renameFolderName;
    const newName = this.newFolderNameInput.value;
    this.newFolderNameInput.reportValidity();
    if (newName) {
      if (this.newFolderNameInput.checkValidity()) {
        try {
          await globalThis.backendaiclient.vfolder.rename(newName);
          this.notification.text = _text('data.folders.FolderRenamed');
          this.notification.show();
          this._refreshFolderList(true, 'updateFolder');
          this.closeDialog('modify-folder-name-dialog');
        } catch (err) {
          this.notification.text = PainKiller.relieve(err.message);
          this.notification.show(true, err);
        }
      } else {
        // return when new folder name is invalid
        return;
      }
    }
  }

  /**
   *
   * @param {Event} e - click the
   */
  _renameFolderDialog(e) {
    this.renameFolderName = this._getControlName(e);
    this.newFolderNameInput.value = '';
    this.openDialog('modify-folder-name-dialog');
  }

  /**
   * Open delete-folder-dialog to delete folder.
   *
   * @param {Event} e - click the delete icon button
   * */
  async _deleteFolderDialog(e) {
    this.deleteFolderName = this._getControlName(e);
    // const deleteFolderId = this._getControlId(e);
    this.deleteFolderNameInput.value = '';
    // let isDelible = await this._checkVfolderMounted(deleteFolderId);
    // if (isDelible) {
    this.openDialog('delete-folder-dialog');
    // } else {
    //   this.notification.text = _text('data.folders.CannotDeleteFolder');
    //   this.notification.show(true);
    // }
  }

  /**
   * Check folder name to delete folder.
   * */
  _deleteFolderWithCheck() {
    const typedDeleteFolderName = this.deleteFolderNameInput.value;
    if (typedDeleteFolderName !== this.deleteFolderName) {
      this.notification.text = _text('data.folders.FolderNameMismatched');
      this.notification.show();
      return;
    }
    this.closeDialog('delete-folder-dialog');
    this._deleteFolder(this.deleteFolderName);
  }

  /**
   * Delete folder and notice.
   *
   * @param {string} folderName
   * */
  _deleteFolder(folderName) {
    const job = globalThis.backendaiclient.vfolder.delete(folderName);
    job.then((resp) => {
      // console.log(resp);
      if (resp.msg) {
        this.notification.text = _text('data.folders.CannotDeleteFolder');
        this.notification.show(true);
      } else {
        this.notification.text = _text('data.folders.FolderDeleted');
        this.notification.show();
        this.refreshFolderList();
        this._triggerFolderListChanged();
      }
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  /**
   * Check whether this vfolder is delible or not
   *
   * @param {string} folderId
   *
   */
  async _checkVfolderMounted(folderId = '') {
    /**
     * TODO: check whether the folder is mounted in one or more sessions or not
     *       by requests.
     */
  }


  /**
   * Clone folder
   *
   * @param {HTMLElement} selectedItem - selected Vfolder to clone
   */
  _requestCloneFolder(selectedItem) {
    // temporary diable cloning folder until the logic of cloning large size of virtual folder is optimized
    /* const event = new CustomEvent('backend-ai-vfolder-cloning', {'detail': selectedItem});
    document.dispatchEvent(event); */
  }

  /**
   * Open leave-folder-dialog to Leave invited folder
   *
   * @param {Event} e - click the delete icon button
   */
  _leaveInvitedFolderDialog(e) {
    this.leaveFolderName = this._getControlName(e);
    this.leaveFolderNameInput.value = '';
    this.openDialog('leave-folder-dialog');
  }

  /**
   * Check folder name to leave.
   *
   * */
  _leaveFolderWithCheck() {
    const typedDeleteFolderName = this.leaveFolderNameInput.value;
    if (typedDeleteFolderName !== this.leaveFolderName) {
      this.notification.text = _text('data.folders.FolderNameMismatched');
      this.notification.show();
      return;
    }
    this.closeDialog('leave-folder-dialog');
    this._leaveFolder(this.leaveFolderName);
  }

  /**
   * Leave invited folder and notice.
   *
   * @param {string} folderId
   * */
  _leaveFolder(folderId) {
    const job = globalThis.backendaiclient.vfolder.leave_invited(folderId);
    job.then((value) => {
      this.notification.text = _text('data.folders.FolderDisconnected');
      this.notification.show();
      this.refreshFolderList();
      this._triggerFolderListChanged();
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  /**
   * Get max_size of keypair resource policy
   *
   */
  async _getMaxSize() {
    const accessKey = globalThis.backendaiclient._config.accessKey;
    const res = await globalThis.backendaiclient.keypair.info(accessKey, ['resource_policy']);
    const policyName = res.keypair.resource_policy;
    const resource_policy = await globalThis.backendaiclient.resourcePolicy.get(policyName, ['max_vfolder_count', 'max_vfolder_size']);
    const max_vfolder_size = resource_policy.keypair_resource_policy.max_vfolder_size;
    // default unit starts with MB.
    [this.maxSize.value, this.maxSize.unit] = globalThis.backendaiutils._humanReadableFileSize(max_vfolder_size).split(' ');
    if (['Bytes', 'KiB', 'MiB'].includes(this.maxSize.unit)) {
      this.maxSize.value = this.maxSize.value < 1 ? 1 : Math.round(this.maxSize.value);
      this.maxSize.unit = 'MiB';
    } else {
      this.maxSize.value = Math.round(this.maxSize.value * 10) / 10;
    }
  }

  /**
   * dispatch backend-ai-folder-list-changed event
   *
   */
  _triggerFolderListChanged() {
    const event = new CustomEvent('backend-ai-folder-list-changed');
    document.dispatchEvent(event);
  }

  /**
   * Validate file/subfolder name.
   */
  _validateExistingFileName() {
    this.newFileNameInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.newFileNameInput.validationMessage = _text('data.FileandFoldernameRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        } else {
          this.newFileNameInput.validationMessage = _text('data.Allowslettersnumbersand-_dot');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        }
      } else {
        const regex = /[`~!@#$%^&*()|+=?;:'",<>{}[\]\\/]/gi;
        let isValid: boolean;
        // compare old name and new name.
        if (this.newFileNameInput.value === (this.renameFileDialog.querySelector('#old-file-name') as HTMLDivElement).textContent) {
          this.newFileNameInput.validationMessage = _text('data.EnterDifferentValue');
          isValid = false;
          return {
            valid: isValid,
            customError: !isValid
          };
        } else {
          isValid = true;
        }
        // custom validation for folder name using regex
        isValid = !regex.test(this.newFileNameInput.value);
        if (!isValid) {
          this.newFileNameInput.validationMessage = _text('data.Allowslettersnumbersand-_dot');
        }
        return {
          valid: isValid,
          customError: !isValid
        };
      }
    };
  }

  /**
   * Validate folder name.
   *
   * @param {boolean} isModifying
   */
  _validateFolderName(isModifying = false) {
    const folderName = isModifying ? this.newFolderNameInput : this.shadowRoot?.querySelector('#add-folder-name') as TextField;

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
        let isValid: boolean;
        const regex = /[`~!@#$%^&*()|+=?;:'",<>{}[\]\\/\s]/gi;
        // if renaming its name, then compare old name and new name.
        if (isModifying) {
          if (folderName.value === this.renameFolderName) {
            folderName.validationMessage = _text('data.EnterDifferentValue');
            isValid = false;
            return {
              valid: isValid,
              customError: !isValid
            };
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
    };
  }

  /* Folder Explorer*/
  /**
   * Clear the folder explorer.
   *
   * @param {string} path - explorer path
   * @param {string} id - explorer id
   * @param {boolean} dialog - whether open folder-explorer-dialog or not
   * */
  async _clearExplorer(path = this.explorer.breadcrumb.join('/'),
    id = this.explorer.id,
    dialog = false) {
    const job = await globalThis.backendaiclient.vfolder.list_files(path, id);
    this.fileListGrid.selectedItems = [];
    if (this._APIMajorVersion < 6) {
      this.explorer.files = JSON.parse(job.files);
    } else { // to support dedicated storage vendors such as FlashBlade
      const fileInfo = JSON.parse(job.files);
      fileInfo.forEach((info, cnt) => {
        let ftype = 'FILE';
        if (info.filename === job.items[cnt].name) {
          // value.files and value.items have same order
          ftype = job.items[cnt].type;
        } else {
          // In case the order is mixed
          for (let i = 0; i < job.items.length; i++) {
            if (info.filename === job.items[i].name) {
              ftype = job.items[i].type;
              break;
            }
          }
        }
        info.type = ftype;
      });
      this.explorer.files = fileInfo;
    }
    this.explorerFiles = this.explorer.files;
    if (dialog) {
      if (this.filebrowserSupportedImages.length === 0) {
        await this._checkFilebrowserSupported();
      }
      this._toggleFilebrowserButton();
      this.openDialog('folder-explorer-dialog');
    }
  }

  /**
   * toggle filebrowser button in Vfolder explorer dialog
   */
  _toggleFilebrowserButton() {
    const isfilebrowserSupported = (this.filebrowserSupportedImages.length > 0 && this._isResourceEnough()) ? true : false;
    const filebrowserIcon = this.shadowRoot?.querySelector('#filebrowser-img');
    const filebrowserBtn = this.shadowRoot?.querySelector('#filebrowser-btn') as Button;
    if (filebrowserIcon && filebrowserBtn) {
      filebrowserBtn.disabled = !isfilebrowserSupported;
      const filterClass = isfilebrowserSupported ? '' : 'apply-grayscale';
      filebrowserIcon.setAttribute('class', filterClass);
    }
  }

  /**
   * Set up the explorer of the folder and call the _clearExplorer() function.
   *
   * @param {Event} e - click the folder_open icon button
   * @param {boolean} isWritable - check whether write operation is allowed or not
   * */
  _folderExplorer(e, isWritable) {
    const folderName = this._getControlName(e);
    const explorer = {
      id: folderName,
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
    this._clearExplorer().then((res) => {
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
    const newfolder = this.mkdirNameInput.value;
    const explorer = this.explorer;
    this.mkdirNameInput.reportValidity();
    if (this.mkdirNameInput.checkValidity()) {
      const job = globalThis.backendaiclient.vfolder.mkdir([...explorer.breadcrumb, newfolder].join('/'), explorer.id).catch((err) => {
        // console.log(err);
        if (err & err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        } else if (err && err.title) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.show(true, err);
        }
      });
      job.then((res) => {
        this.closeDialog('mkdir-dialog');
        this._clearExplorer();
      });
    } else {
      return;
    }
  }

  _isDir(file) {
    if (this._APIMajorVersion < 6) {
      return file.mode.startsWith('d');
    } else {
      // For some vendor-specific storage APIs, we cannot discern file and
      // directory by just looking at the first letter of file mode. For
      // example, FlashBlade API returns file's mode as a pure number.
      // So, we have to rely on the explicit file's type property to support
      // vendor-specific APIs.
      return file.type === 'DIRECTORY';
    }
  }

  _byteToMB(value) {
    return Math.floor(value / 1000000);
  }

  /* File upload and download */
  /**
   * Add eventListener to the dropzone - dragleave, dragover, drop.
   * */
  _addEventListenerDropZone() {
    const dndZonePlaceholderEl = this.shadowRoot?.querySelector('#dropzone') as HTMLDivElement;
    dndZonePlaceholderEl.addEventListener('dragleave', () => {
      dndZonePlaceholderEl.style.display = 'none';
    });

    // TODO specify custom event type
    this.folderExplorerDialog.addEventListener('dragover', (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      if (this.isWritable) {
        e.dataTransfer.dropEffect = 'copy';
        dndZonePlaceholderEl.style.display = 'flex';
        return false;
      } else {
        return true;
      }
    });

    // TODO specify custom event type
    this.folderExplorerDialog.addEventListener('drop', (e: any) => {
      let isNotificationDisplayed = false;
      e.stopPropagation();
      e.preventDefault();
      dndZonePlaceholderEl.style.display = 'none';
      if (this.isWritable) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          if (e.dataTransfer.items[i].webkitGetAsEntry().isFile) {
            const file = e.dataTransfer.files[i];
            /* Drag & Drop file upload size limits to configuration */
            if (this._maxFileUploadSize > 0 && file.size > this._maxFileUploadSize) {
              this.notification.text = _text('data.explorer.FileUploadSizeLimit') + ` (${globalThis.backendaiutils._humanReadableFileSize(this._maxFileUploadSize)})`;
              this.notification.show();
              return;
            } else {
              const reUploadFile = this.explorerFiles.find((elem: any) => elem.filename === file.name);
              if (reUploadFile) {
                // plain javascript modal to confirm whether proceed to overwrite operation or not
                /*
                 *  TODO: replace confirm operation with customized dialog
                 */
                const confirmed = window.confirm(`${_text('data.explorer.FileAlreadyExists')}\n${file.name}\n${_text('data.explorer.DoYouWantToOverwrite')}`);
                if (confirmed) {
                  file.progress = 0;
                  file.caption = '';
                  file.error = false;
                  file.complete = false;
                  (this.uploadFiles as any).push(file);
                }
              } else {
                file.progress = 0;
                file.caption = '';
                file.error = false;
                file.complete = false;
                (this.uploadFiles as any).push(file);
              }
            }
          } else {
            // let item = e.dataTransfer.items[i].webkitGetAsEntry();
            // console.log(item.webkitRelativePath);
            // this._executeFileBrowser();
            // show snackbar to filebrowser only once
            if (!isNotificationDisplayed) {
              if (this.filebrowserSupportedImages.length > 0) {
                this.notification.text = _text('data.explorer.ClickFilebrowserButton');
                this.notification.show();
              } else {
                this.notification.text = _text('data.explorer.NoImagesSupportingFileBrowser');
                this.notification.show();
              }
            }
            isNotificationDisplayed = true;
          }
        }

        for (let i = 0; i < this.uploadFiles.length; i++) {
          this.fileUpload(this.uploadFiles[i]);
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
    const elem = this.shadowRoot?.querySelector('#fileInput') as HTMLInputElement;
    if (elem && document.createEvent) { // sanity check
      const evt = document.createEvent('MouseEvents');
      evt.initEvent('click', true, false);
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

      let text = '';
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
      /* File upload size limits to configuration */
      if (this._maxFileUploadSize > 0 && file.size > this._maxFileUploadSize) {
        this.notification.text = _text('data.explorer.FileUploadSizeLimit') + ` (${globalThis.backendaiutils._humanReadableFileSize(this._maxFileUploadSize)})`;
        this.notification.show();
        return;
      } else {
        const reUploadFile = this.explorerFiles.find((elem: any) => elem.filename === file.name);
        if (reUploadFile) {
          // plain javascript modal to confirm whether proceed to overwrite operation or not
          /*
           *  TODO: replace confirm operation with customized dialog
           */
          const confirmed = window.confirm(`${_text('data.explorer.FileAlreadyExists')}\n${file.name}\n${_text('data.explorer.DoYouWantToOverwrite')}`);
          if (confirmed) {
            file.id = text;
            file.progress = 0;
            file.caption = '';
            file.error = false;
            file.complete = false;
            (this.uploadFiles as any).push(file);
          }
        } else {
          file.id = text;
          file.progress = 0;
          file.caption = '';
          file.error = false;
          file.complete = false;
          (this.uploadFiles as any).push(file);
        }
      }
    }
    for (let i = 0; i < this.uploadFiles.length; i++) {
      this.fileUpload(this.uploadFiles[i]);
    }
    (this.shadowRoot?.querySelector('#fileInput') as HTMLInputElement).value = '';
  }

  /**
   * Running file upload queue to upload files.
   *
   * @param {null | string} session - upload session
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
    const path = this.explorer.breadcrumb.concat(fileObj.name).join('/');
    const job = globalThis.backendaiclient.vfolder.create_upload_session(path, fileObj, this.explorer.id);
    job.then((url) => {
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
          console.log('Failed because: ' + error);
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
          const speed: string = (bytesUploaded / (1024 * 1024) / ((now - start_date) / 1000)).toFixed(1) + 'MB/s';
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
   * */
  _cancelUpload() {
    this._uploadFlag = false;
  }

  /**
   * Download the file.
   *
   * @param {Event} e - click the cloud_download icon button
   * @param {boolean} archive - whether archive or not
   * */
  _downloadFile(e, archive = false) {
    const fn = e.target.getAttribute('filename');
    const path = this.explorer.breadcrumb.concat(fn).join('/');
    const job = globalThis.backendaiclient.vfolder.request_download_token(path, this.explorer.id, archive);
    job.then((res) => {
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
        const a = document.createElement('a');
        a.style.display = 'none';
        a.addEventListener('click', function(e) {
          e.stopPropagation();
        });
        a.href = url;
        a.download = fn;
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();
        // a.remove();  //afterwards we remove the element again
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  }

  /**
   * Select filename without extension
   *
   */
  _compareFileExtension() {
    const newFilename = this.newFileNameInput.value;
    const oldFilename = (this.renameFileDialog.querySelector('#old-file-name') as HTMLDivElement).textContent ?? '';
    const regex = /\.([0-9a-z]+)$/i;
    const newFileExtension = newFilename.match(regex);
    const oldFileExtension = oldFilename.match(regex);
    if (newFilename.includes('.') && newFileExtension) {
      this.newFileExtension = newFileExtension[1].toLowerCase();
    } else {
      this.newFileExtension = '';
    }
    if (oldFilename.includes('.') && oldFileExtension) {
      this.oldFileExtension = oldFileExtension[1].toLowerCase();
    } else {
      this.oldFileExtension = '';
    }

    if (newFilename) {
      if (this.newFileExtension !== this.oldFileExtension) {
        this.fileExtensionChangeDialog.show();
      } else if (this.oldFileExtension) {
        this._keepFileExtension();
      } else {
        this._renameFile();
      }
    } else {
      this._renameFile();
    }
  }

  /**
   * Keep the file extension whether the file extension is explicit or not.
   *
   */
  _keepFileExtension() {
    let newFilename = this.newFileNameInput.value;
    if (this.newFileExtension) {
      newFilename = newFilename.replace(new RegExp(this.newFileExtension + '$'), this.oldFileExtension);
    } else {
      newFilename = newFilename + '.' + this.oldFileExtension;
    }
    this.newFileNameInput.value = newFilename;
    this._renameFile();
  }

  /* Execute Filebrowser by launching session with mimimum resources
   *
   */
  _executeFileBrowser() {
    if (this._isResourceEnough()) {
      if (this.filebrowserSupportedImages.length > 0) {
        const isNotificationVisible = localStorage.getItem('backendaiwebui.filebrowserNotification');
        if ((isNotificationVisible == null || isNotificationVisible === 'true') && !this.isWritable) {
          this.fileBrowserNotificationDialog.show();
        }
        this._launchSession();
        this._toggleFilebrowserButton();
      } else {
        this.notification.text = _text('data.explorer.NoImagesSupportingFileBrowser');
        this.notification.show();
      }
    } else {
      this.notification.text = _text('data.explorer.NotEnoughResourceForFileBrowserSession');
      this.notification.show();
    }
  }

  /**
   * Toggle notification of filebrowser execution on read-only folder
   *
   * @param {any} e
   */
  _toggleShowFilebrowserNotification(e) {
    const checkbox = e.target;
    if (checkbox) {
      const isHidden = (!checkbox.checked).toString();
      localStorage.setItem('backendaiwebui.filebrowserNotification', isHidden);
    }
  }

  /**
   * Open the session launcher dialog to execute filebrowser app.
   *
   */
  async _launchSession() {
    let appOptions;
    const imageResource: Record<string, unknown> = {};
    // monkeypatch for filebrowser applied environment
    // const environment = 'cr.backend.ai/testing/filebrowser:21.01-ubuntu20.04';
    const images = this.filebrowserSupportedImages.filter((image: any) => (image['name'].toLowerCase().includes('filebrowser') && image['installed']));

    // select one image to launch filebrowser supported session
    const preferredImage = images[0];
    const environment = preferredImage['registry'] + '/' + preferredImage['name'] + ':' + preferredImage['tag'];

    // add current folder
    imageResource['mounts'] = [this.explorer.id];
    imageResource['cpu'] = 1;
    imageResource['mem'] = this.minimumResource.mem + 'g';
    imageResource['domain'] = globalThis.backendaiclient._config.domainName;
    imageResource['group_name'] = globalThis.backendaiclient.current_group;
    const indicator = await this.indicator.start('indeterminate');

    return globalThis.backendaiclient.get_resource_slots().then((response) => {
      indicator.set(200, _text('data.explorer.ExecutingFileBrowser'));
      return globalThis.backendaiclient.createIfNotExists(environment, null, imageResource, 10000, undefined);
    }).then(async (res) => {
      const service_info = res.servicePorts;
      appOptions = {
        'session-uuid': res.sessionId,
        'session-name': res.sessionName,
        'access-key': '',
        'runtime': 'filebrowser',
        'arguments': {'--root': '/home/work/' + this.explorer.id}
      };
      // only launch filebrowser app when it has valid service ports
      if (service_info.length > 0 && service_info.filter((el) => el.name === 'filebrowser').length > 0) {
        globalThis.appLauncher.showLauncher(appOptions);
      }
      if (this.folderExplorerDialog.open) {
        this.closeDialog('folder-explorer-dialog');
      }
      indicator.end(1000);
    }).catch((err) => {
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true, err);
      indicator.end(1000);
    });
  }

  /**
   * Open the renameFileDialog to rename the file.
   *
   * @param {Event} e - click the edit icon button
   * @param {Boolean} is_dir - True when file is directory type
   * */
  _openRenameFileDialog(e, is_dir = false) {
    const fn = e.target.getAttribute('filename');
    (this.renameFileDialog.querySelector('#old-file-name') as HTMLDivElement).textContent = fn;
    this.newFileNameInput.value = fn;
    // TODO define extended type for custom property
    (this.renameFileDialog as any).filename = fn;
    this.renameFileDialog.show();
    this.is_dir = is_dir;

    this.newFileNameInput.addEventListener('focus', (e) => {
      const endOfExtensionLength = fn.replace(/\.([0-9a-z]+)$/i, '').length;
      this.newFileNameInput.setSelectionRange(0, endOfExtensionLength);
    });
    this.newFileNameInput.focus();
  }

  /**
   * Rename the file.
   *
   * */
  _renameFile() {
    // TODO define extended type for custom property
    const fn = (this.renameFileDialog as any).filename;
    const path = this.explorer.breadcrumb.concat(fn).join('/');
    const newName = this.newFileNameInput.value;
    this.fileExtensionChangeDialog.hide();
    this.newFileNameInput.reportValidity();
    if (this.newFileNameInput.checkValidity()) {
      if (fn === newName) {
        this.newFileNameInput.focus();
        this.notification.text = _text('data.folders.SameFileName');
        this.notification.show();
        return;
      }

      const job = globalThis.backendaiclient.vfolder.rename_file(path, newName, this.explorer.id, this.is_dir);
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
    const fn = e.target.getAttribute('filename');
    // TODO define extended type for custom properties
    (this.deleteFileDialog as any).filename = fn;
    (this.deleteFileDialog as any).files = [];
    this.deleteFileDialog.show();
  }

  /**
   * Open the deleteFileDialog of selected files.
   *
   * @param {Event} e - click the delete button
   * */
  _openDeleteMultipleFileDialog(e?) {
    // TODO define extended type for custom property
    (this.deleteFileDialog as any).files = this.fileListGrid.selectedItems;
    (this.deleteFileDialog as any).filename = '';
    this.deleteFileDialog.show();
  }

  /**
   * If the user presses the Delete File button, and the Okay button on the double check dialogue, delete the file.
   *
   * @param {Event} e - click the Okay button
   * */

  _deleteFileWithCheck(e) {
    // TODO define extended type for custom property
    const files = (this.deleteFileDialog as any).files;
    if (files.length > 0) {
      const filenames: string[] = [];
      files.forEach((file) => {
        const filename = this.explorer.breadcrumb.concat(file.filename).join('/');
        filenames.push(filename);
      });
      const job = globalThis.backendaiclient.vfolder.delete_files(filenames, true, this.explorer.id);
      job.then((res) => {
        this.notification.text = (files.length == 1) ? _text('data.folders.FileDeleted') :_text('data.folders.MultipleFilesDeleted');
        this.notification.show();
        this._clearExplorer();
        this.deleteFileDialog.hide();
      });
    } else {
      // TODO define extended type for custom property
      if ((this.deleteFileDialog as any).filename != '') {
        const path = this.explorer.breadcrumb.concat((this.deleteFileDialog as any).filename).join('/');
        const job = globalThis.backendaiclient.vfolder.delete_files([path], true, this.explorer.id);
        job.then((res) => {
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
   *
   * @param {HTMLElement} e - file list component that contains filename attribute
   * */
  _deleteFile(e) {
    const fn = e.target.getAttribute('filename');
    const path = this.explorer.breadcrumb.concat(fn).join('/');
    const job = globalThis.backendaiclient.vfolder.delete_files([path], true, this.explorer.id);
    job.then((res) => {
      this.notification.text = _text('data.folders.FileDeleted');
      this.notification.show();
      this._clearExplorer();
    });
  }

  /**
   * Returns whether resource is enough to launch session for executing filebrowser app or not.
   * @return {boolean} - true when resource is enough, false when resource is not enough to create a session.
   */
  _isResourceEnough() {
    // update current resources statistics.
    const event = new CustomEvent('backend-ai-calculate-current-resource');
    document.dispatchEvent(event);
    const currentResource = globalThis.backendaioptions.get('current-resource');
    if (currentResource) {
      currentResource.cpu = (typeof currentResource.cpu === 'string') ? parseInt(currentResource['cpu']) : currentResource['cpu'];
      if ((currentResource.cpu >= this.minimumResource.cpu) && (currentResource.mem >= this.minimumResource.mem)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the time of the utc type for human reading.
   *
   * @param {Date} d - date
   * @return {string} UTC time string
   * */
  _humanReadableTime(d) {
    const date = new Date(d * 1000);
    const offset = date.getTimezoneOffset() / 60;
    const hours = date.getHours();
    date.setHours(hours - offset);
    return date.toUTCString();
  }

  /**
   * Return whether file is downloadable. (LEGACY FUNCTION)
   *
   * @param {Object} file
   * @return {boolean} true
   * */
  _isDownloadable(file) {
    return true;
  }

  /**
   *
   * Initialize share-folder-dialog to the original layout
   *
   */
  _initializeSharingFolderDialogLayout() {
    const emailInputList = this.shadowRoot?.querySelectorAll<TextField>('#share-folder-dialog mwc-textfield.share-email') as NodeListOf<TextField>;
    if (emailInputList.length > 1) {
      emailInputList.forEach((elem) => {
        if (elem.id !== 'first-email') {
          elem.parentNode?.removeChild(elem);
        }
      });
    }
  }

  /**
   * Open dialog to share folder.
   *
   * @param {Event} e - click the share button
   * */
  _shareFolderDialog(e) {
    this.selectedFolder = this._getControlName(e);
    this.selectedFolderType = this._getControlType(e);
    this._initializeSharingFolderDialogLayout();
    this.openDialog('share-folder-dialog');
  }

  /**
   * Open modify-permission-dialog.
   *
   * @param {string} vfolder_id - vfolder id to modify
   * */
  _modifyPermissionDialog(vfolder_id) {
    globalThis.backendaiclient.vfolder.list_invitees(vfolder_id)
      .then((res) => {
        this.invitees = res.shared;
        this.modifyPermissionDialog.updateComplete.then(()=>{
          this.openDialog('modify-permission-dialog');
        });
      });
  }

  /**
   * Share the folder to people with the email user entered.
   *
   * @param {Event} e - click the share-button
   * */
  _shareFolder(e) {
    const emailHtmlCollection = this.shadowRoot?.querySelectorAll('mwc-textfield.share-email') as NodeListOf<TextField>;

    // filter invalid and empty fields
    const emailArray = Array.prototype.filter.call(emailHtmlCollection, (e) => e.isUiValid && e.value !== '').map((e) => e.value.trim());
    const permission = (this.shadowRoot?.querySelector('mwc-radio[name=share-folder-permission][checked]') as Radio).value;

    if (emailArray.length === 0) {
      this.notification.text = _text('data.invitation.NoValidEmails');
      this.notification.show();
      this.shareFolderDialog.hide();
      for (const element of Array.from(emailHtmlCollection)) {
        element.value = '';
      }
      return;
    }

    let rqstJob;
    if (this.selectedFolderType === 'user') {
      rqstJob = globalThis.backendaiclient.vfolder.invite(permission, emailArray, this.selectedFolder);
    } else {
      rqstJob = globalThis.backendaiclient.vfolder.share(permission, emailArray, this.selectedFolder);
    }
    rqstJob
      .then((res) => {
        let msg;
        if (this.selectedFolderType === 'user') {
          if (res.invited_ids && res.invited_ids.length > 0) {
            msg = _text('data.invitation.Invited');
          } else {
            msg = _text('data.invitation.NoOneWasInvited');
          }
        } else {
          if (res.shared_emails && res.shared_emails.length > 0) {
            msg = _text('data.invitation.Shared');
          } else {
            msg = _text('data.invitation.NoOneWasShared');
          }
        }
        this.notification.text = msg;
        this.notification.show();
        this.shareFolderDialog.hide();
        for (let i = emailHtmlCollection.length - 1; i > 0; i--) {
          const element = emailHtmlCollection[i];
          element.parentElement?.removeChild(element);
        }
      }).catch((err) => {
        if (this.selectedFolderType === 'user') {
          this.notification.text = _text('data.invitation.InvitationError');
        } else {
          this.notification.text = _text('data.invitation.SharingError');
        }
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
    this.mkdirNameInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.mkdirNameInput.validationMessage = _text('data.explorer.ValueRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        } else {
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        }
      } else {
        // custom validation for path name using regex
        const regex = /^([^`~!@#$%^&*()|+=?;:'",<>{}[\]\r\n/]{1,})+(\/[^`~!@#$%^&*()|+=?;:'",<>{}[\]\r\n/]{1,})*([/,\\]{0,1})$/gm;
        let isValid = regex.test(this.mkdirNameInput.value);
        if (!isValid || this.mkdirNameInput.value === './') {
          this.mkdirNameInput.validationMessage = _text('data.explorer.ValueShouldBeStarted');
          isValid = false;
        }
        return {
          valid: isValid,
          customError: !isValid
        };
      }
    };
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-storage-list': BackendAiStorageList;
  }
}
