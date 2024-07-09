/**
 @license
 Copyright (c) 2015-2024 Lablup Inc. All rights reserved.
 */
import { navigate } from '../backend-ai-app';
import tus from '../lib/tus';
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { store } from '../store';
import './backend-ai-dialog';
import BackendAIDialog from './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import './backend-ai-list-status';
import BackendAIListStatus, { StatusCondition } from './backend-ai-list-status';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './backend-ai-session-launcher';
import BackendAiSessionLauncher from './backend-ai-session-launcher';
import './lablup-grid-sort-filter-column';
import './lablup-loading-spinner';
import LablupLoadingSpinner from './lablup-loading-spinner';
import { Button } from '@material/mwc-button';
import '@material/mwc-formfield';
import '@material/mwc-icon-button';
import '@material/mwc-list';
import '@material/mwc-radio';
import { Radio } from '@material/mwc-radio';
import { Select } from '@material/mwc-select';
import { Switch } from '@material/mwc-switch';
import '@material/mwc-textfield';
import { TextField } from '@material/mwc-textfield';
import '@vaadin/grid/vaadin-grid';
import '@vaadin/grid/vaadin-grid-column-group';
import '@vaadin/grid/vaadin-grid-filter-column';
import '@vaadin/grid/vaadin-grid-selection-column';
import '@vaadin/grid/vaadin-grid-sort-column';
import '@vaadin/item/vaadin-item';
import '@vaadin/progress-bar/vaadin-progress-bar';
import '@vaadin/tooltip';
import { css, CSSResultGroup, html, render } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query, state } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type VaadinGrid = HTMLElementTagNameMap['vaadin-grid'];

interface inviteeData {
  owner: string;
  perm: string;
  shared_to: {
    uuid: string;
    email: string;
  };
  status: string;
  type: string;
  vfolder_id: string;
  vfolder_name: string;
}

interface fileData {
  id: string;
  progress: number;
  caption: string;
  error: boolean;
  complete: boolean;
}

type VFolderOperationStatus =
  | 'ready'
  | 'performing'
  | 'cloning'
  | 'mounted'
  | 'error'
  | 'delete-pending'
  | 'delete-ongoing'
  | 'delete-complete'
  | 'delete-error'
  | 'deleting' // Deprecated since 24.03.0
  | 'purge-ongoing'; // Deprecated since 24.03.0

type DeadVFolderStatus =
  | 'delete-pending'
  | 'delete-ongoing'
  | 'delete-complete'
  | 'delete-error'
  | 'deleting'; // Deprecated since 24.03.0

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
  @property({ type: Number }) _APIMajorVersion = 5;
  @property({ type: String }) storageType = 'general';
  @property({ type: Array }) folders = [];
  @property({ type: Object }) folderInfo = Object();
  @property({ type: Boolean }) is_admin = false;
  @property({ type: Boolean }) enableStorageProxy = false;
  @property({ type: Boolean }) enableInferenceWorkload = false;
  @property({ type: Boolean }) enableVfolderTrashBin = false;
  @property({ type: Boolean }) authenticated = false;
  @property({ type: String }) renameFolderName = '';
  @property({ type: String }) deleteFolderName = '';
  @property({ type: String }) deleteFolderID = '';
  @property({ type: String }) leaveFolderName = '';
  @property({ type: Object }) explorer = Object();
  @property({ type: Array }) explorerFiles = [];
  @property({ type: String }) existingFile = '';
  @property({ type: Array }) invitees: inviteeData[] = [];
  @property({ type: String }) selectedFolder = '';
  @property({ type: String }) selectedFolderType = '';
  @property({ type: String }) downloadURL = '';
  @property({ type: Array }) uploadFiles: fileData[] = [];
  @property({ type: Object }) currentUploadFile = Object();
  @property({ type: Array }) fileUploadQueue = [];
  @property({ type: Number }) fileUploadCount = 0;
  @property({ type: Number }) concurrentFileUploadLimit = 2;
  @property({ type: String }) vhost = '';
  @property({ type: Array }) vhosts = [];
  @property({ type: Array }) allowedGroups = [];
  @property({ type: Object }) indicator = Object();
  @property({ type: Object }) notification = Object();
  @property({ type: String }) listCondition: StatusCondition = 'loading';
  @property({ type: Array }) allowed_folder_type = [];
  @property({ type: Boolean }) uploadFilesExist = false;
  @property({ type: Object }) _boundIndexRenderer = Object();
  @property({ type: Object }) _boundTypeRenderer = Object();
  @property({ type: Object }) _boundFolderListRenderer = Object();
  @property({ type: Object }) _boundControlFolderListRenderer = Object();
  @property({ type: Object }) _boundTrashBinControlFolderListRenderer =
    Object();
  @property({ type: Object }) _boundControlFileListRenderer = Object();
  @property({ type: Object }) _boundPermissionViewRenderer = Object();
  @property({ type: Object }) _boundOwnerRenderer = Object();
  @property({ type: Object }) _boundFileNameRenderer = Object();
  @property({ type: Object }) _boundCreatedTimeRenderer = Object();
  @property({ type: Object }) _boundSizeRenderer = Object();
  @property({ type: Object }) _boundPermissionRenderer = Object();
  @property({ type: Object }) _boundCloneableRenderer = Object();
  @property({ type: Object }) _boundQuotaRenderer = Object();
  @property({ type: Object }) _boundUploadListRenderer = Object();
  @property({ type: Object }) _boundUploadProgressRenderer = Object();
  @property({ type: Object }) _boundInviteeInfoRenderer = Object();
  @property({ type: Object }) _boundIDRenderer = Object();
  @property({ type: Object }) _boundStatusRenderer = Object();
  @property({ type: Boolean }) _uploadFlag = true;
  @property({ type: Boolean }) _folderRefreshing = false;
  @property({ type: Number }) lastQueryTime = 0;
  @property({ type: Boolean }) isWritable = false;
  @property({ type: Object }) permissions = {
    rw: 'Read-Write',
    ro: 'Read-Only',
    wd: 'Delete',
  };
  @property({ type: Number }) _maxFileUploadSize = -1;
  @property({ type: Number }) selectAreaHeight;
  @property({ type: String }) oldFileExtension = '';
  @property({ type: String }) newFileExtension = '';
  @property({ type: Boolean }) is_dir = false;
  @property({ type: Boolean }) _isDirectorySizeVisible = true;
  @property({ type: Number }) minimumResource = {
    cpu: 1,
    mem: 0.5,
  };
  @property({ type: Array }) filebrowserSupportedImages = [];
  @property({ type: Array }) systemRoleSupportedImages = [];
  @property({ type: Object }) volumeInfo = Object();
  @property({ type: Array }) quotaSupportStorageBackends = [
    'xfs',
    'weka',
    'spectrumscale',
    'netapp',
    'vast',
    'cephfs',
    'ddn',
  ];
  @property({ type: Object }) quotaUnit = {
    MB: Math.pow(10, 6),
    GB: Math.pow(10, 9),
    TB: Math.pow(10, 12),
    PB: Math.pow(10, 15),
    MiB: Math.pow(2, 20),
    GiB: Math.pow(2, 30),
    TiB: Math.pow(2, 40),
    PiB: Math.pow(2, 50),
  };
  @property({ type: Object }) maxSize = {
    value: 0,
    unit: 'MB',
  };
  @property({ type: Object }) quota = {
    value: 0,
    unit: 'MB',
  };
  @property({ type: Boolean }) directoryBasedUsage = false;
  @query('#loading-spinner') spinner!: LablupLoadingSpinner;
  @query('#list-status') private _listStatus!: BackendAIListStatus;
  @query('#modify-folder-quota') modifyFolderQuotaInput!: TextField;
  @query('#modify-folder-quota-unit') modifyFolderQuotaUnitSelect!: Select;
  @query('#file-list-grid') fileListGrid!: VaadinGrid;
  @query('#folder-list-grid') folderListGrid!: VaadinGrid;
  @query('#mkdir-name') mkdirNameInput!: TextField;
  @query('#delete-folder-name') deleteFolderNameInput!: TextField;
  @query('#delete-from-trash-bin-name-input')
  deleteFromTrashBinNameInput!: TextField;
  @query('#new-folder-name') newFolderNameInput!: TextField;
  @query('#new-file-name') newFileNameInput!: TextField;
  @query('#leave-folder-name') leaveFolderNameInput!: TextField;
  @query('#update-folder-permission') updateFolderPermissionSelect!: Select;
  @query('#update-folder-cloneable') updateFolderCloneableSwitch!: Switch;
  @query('#rename-file-dialog') renameFileDialog!: BackendAIDialog;
  @query('#delete-file-dialog') deleteFileDialog!: BackendAIDialog;
  @query('#filebrowser-notification-dialog')
  fileBrowserNotificationDialog!: BackendAIDialog;
  @query('#file-extension-change-dialog')
  fileExtensionChangeDialog!: BackendAIDialog;
  @query('#folder-explorer-dialog') folderExplorerDialog!: BackendAIDialog;
  @query('#download-file-dialog') downloadFileDialog!: BackendAIDialog;
  @query('#modify-permission-dialog') modifyPermissionDialog!: BackendAIDialog;
  @query('#share-folder-dialog') shareFolderDialog!: BackendAIDialog;
  @query('#session-launcher') sessionLauncher!: BackendAiSessionLauncher;
  @state() private _unionedAllowedPermissionByVolume = Object();
  constructor() {
    super();
    this._boundIndexRenderer = this.indexRenderer.bind(this);
    this._boundTypeRenderer = this.typeRenderer.bind(this);
    this._boundControlFolderListRenderer =
      this.controlFolderListRenderer.bind(this);
    this._boundTrashBinControlFolderListRenderer =
      this.trashBinControlFolderListRenderer.bind(this);
    this._boundControlFileListRenderer =
      this.controlFileListRenderer.bind(this);
    this._boundPermissionViewRenderer = this.permissionViewRenderer.bind(this);
    this._boundCloneableRenderer = this.CloneableRenderer.bind(this);
    this._boundOwnerRenderer = this.OwnerRenderer.bind(this);
    this._boundFileNameRenderer = this.fileNameRenderer.bind(this);
    this._boundCreatedTimeRenderer = this.createdTimeRenderer.bind(this);
    this._boundSizeRenderer = this.sizeRenderer.bind(this);
    this._boundPermissionRenderer = this.permissionRenderer.bind(this);
    this._boundFolderListRenderer = this.folderListRenderer.bind(this);
    this._boundQuotaRenderer = this.quotaRenderer.bind(this);
    this._boundUploadListRenderer = this.uploadListRenderer.bind(this);
    this._boundUploadProgressRenderer = this.uploadProgressRenderer.bind(this);
    this._boundInviteeInfoRenderer = this.inviteeInfoRenderer.bind(this);
    this._boundIDRenderer = this.iDRenderer.bind(this);
    this._boundStatusRenderer = this.statusRenderer.bind(this);
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
          height: calc(100vh - 460px);
        }

        vaadin-grid.folderlist {
          border: 0;
          font-size: 14px;
        }

        vaadin-grid.explorer {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 370px);
        }

        #session-launcher {
          --component-width: 235px;
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
          margin-top: 10px;
          margin-bottom: 10px;
        }

        mwc-icon-button {
          --mdc-icon-size: 24px;
        }
        mwc-icon {
          --mdc-icon-size: 16px;
          padding: 0;
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
          width: calc(
            100% - 88px
          ); /* 88px is width for mini-ui icon of drawer menu */
        }

        /* #folder-explorer-dialog vaadin-grid vaadin-grid-column {
          height: 32px !important;
        }*/

        #folder-explorer-dialog vaadin-grid mwc-icon-button {
          --mdc-icon-size: 24px;
          --mdc-icon-button-size: 28px;
          background-color: transparent;
        }

        #filebrowser-notification-dialog {
          --component-width: 350px;
        }

        vaadin-text-field {
          --vaadin-text-field-default-width: auto;
        }

        vaadin-grid-cell-content {
          overflow: visible;
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
          transition: color ease-in 0.2s;
          border: solid;
          border-width: 0 2px 2px 0;
          border-color: var(--token-colorBorder, #242424);
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
          /* --mdc-text-field-label-ink-color: var(--token-colorText); */
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

        div#dropzone,
        div#dropzone p {
          margin: 0;
          padding: 0;
          width: 100%;
          background: rgba(211, 211, 211, 0.5);
          text-align: center;
        }

        .progress {
          padding: 30px 10px;
          border: 1px solid lightgray;
        }

        .progress-item {
          padding: 10px 30px;
        }

        backend-ai-dialog mwc-textfield,
        backend-ai-dialog mwc-select {
          --mdc-typography-label-font-size: var(--token-fontSizeSM, 12px);
        }

        mwc-select#modify-folder-quota-unit {
          width: 120px;
          --mdc-menu-min-width: 120px;
          --mdc-menu-max-width: 120px;
        }

        mwc-select.full-width {
          width: 100%;
        }

        mwc-select.full-width.fixed-position > mwc-list-item {
          width: 288px; // default width
        }

        mwc-select.fixed-position {
          /* Need to be set when fixedMenuPosition attribute is enabled */
          --mdc-menu-max-width: 320px;
          --mdc-menu-min-width: 320px;
        }

        mwc-select#modify-folder-quota-unit > mwc-list-item {
          width: 88px; // default width
        }

        mwc-select.fixed-position > mwc-list-item {
          width: 147px; // default width
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
          -webkit-filter: grayscale(1);
          filter: grayscale(1);
        }

        img#filebrowser-img,
        img#ssh-img {
          width: 18px;
          margin: 15px 10px;
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
          #folder-explorer-dialog.mini_ui {
            --component-width: calc(100% - 45px); /* calc(100% - 30px); */
          }
        }
      `,
    ];
  }

  _toggleFileListCheckbox() {
    const buttons = this.shadowRoot?.querySelectorAll<Button>(
      '.multiple-action-buttons',
    ) as NodeListOf<Button>;
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
    let unit = 'MB'; // default unit starts with MB.
    const convertedCurrentQuota =
      Number(this.modifyFolderQuotaInput.value) *
      this.quotaUnit[this.modifyFolderQuotaUnitSelect.value];
    const convertedQuota =
      this.maxSize.value * this.quotaUnit[this.maxSize.unit];
    [this.modifyFolderQuotaInput.value, unit] = globalThis.backendaiutils
      ._humanReadableFileSize(convertedCurrentQuota)
      .split(' ');
    if (['Bytes', 'KB', 'MB'].includes(unit)) {
      if (unit === 'MB') {
        this.modifyFolderQuotaInput.value =
          Number(this.modifyFolderQuotaInput.value) < 1
            ? '1'
            : Math.round(Number(this.modifyFolderQuotaInput.value)).toString();
      } else {
        this.modifyFolderQuotaInput.value = '1';
      }
      unit = 'MB';
    } else {
      this.modifyFolderQuotaInput.value = parseFloat(
        this.modifyFolderQuotaInput.value,
      ).toFixed(1);
      if (convertedQuota < convertedCurrentQuota) {
        this.modifyFolderQuotaInput.value = this.maxSize.value.toString();
        unit = this.maxSize.unit;
      }
    }
    // apply step only when the unit is bigger than MB
    this.modifyFolderQuotaInput.step =
      this.modifyFolderQuotaUnitSelect.value === 'MB' ? 0 : 0.1;
    const idx = this.modifyFolderQuotaUnitSelect.items.findIndex(
      (item) => item.value === unit,
    );
    this.modifyFolderQuotaUnitSelect.select(idx);
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <backend-ai-session-launcher
        mode="inference"
        location="data"
        hideLaunchButton
        id="session-launcher"
        ?active="${this.active === true}"
        .newSessionDialogTitle="${_t('session.launcher.StartModelServing')}"
      ></backend-ai-session-launcher>
      <div class="list-wrapper">
        <vaadin-grid
          class="folderlist"
          id="folder-list-grid"
          theme="row-stripes column-borders wrap-cell-content compact dark"
          column-reordering-allowed
          aria-label="Folder list"
          .items="${this.folders}"
        >
          <vaadin-grid-column
            width="40px"
            flex-grow="0"
            resizable
            header="#"
            text-align="center"
            .renderer="${this._boundIndexRenderer}"
          ></vaadin-grid-column>
          <lablup-grid-sort-filter-column
            path="name"
            width="80px"
            resizable
            .renderer="${this._boundFolderListRenderer}"
            header="${_t('data.folders.Name')}"
          ></lablup-grid-sort-filter-column>
          <lablup-grid-sort-filter-column
            path="id"
            width="130px"
            flex-grow="0"
            resizable
            header="ID"
            .renderer="${this._boundIDRenderer}"
          ></lablup-grid-sort-filter-column>
          <lablup-grid-sort-filter-column
            path="host"
            width="105px"
            flex-grow="0"
            resizable
            header="${_t('data.folders.Location')}"
          ></lablup-grid-sort-filter-column>
          <lablup-grid-sort-filter-column
            path="status"
            width="80px"
            flex-grow="0"
            resizable
            .renderer="${this._boundStatusRenderer}"
            header="${_t('data.folders.Status')}"
          ></lablup-grid-sort-filter-column>
          ${this.directoryBasedUsage
            ? html`
                <vaadin-grid-sort-column
                  id="folder-quota-column"
                  path="max_size"
                  width="95px"
                  flex-grow="0"
                  resizable
                  header="${_t('data.folders.FolderQuota')}"
                  .renderer="${this._boundQuotaRenderer}"
                ></vaadin-grid-sort-column>
              `
            : html``}
          <lablup-grid-sort-filter-column
            path="ownership_type"
            width="70px"
            flex-grow="0"
            resizable
            header="${_t('data.folders.Type')}"
            .renderer="${this._boundTypeRenderer}"
          ></lablup-grid-sort-filter-column>
          <vaadin-grid-column
            width="95px"
            flex-grow="0"
            resizable
            header="${_t('data.folders.Permission')}"
            .renderer="${this._boundPermissionViewRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-column
            auto-width
            flex-grow="0"
            resizable
            header="${_t('data.folders.Owner')}"
            .renderer="${this._boundOwnerRenderer}"
          ></vaadin-grid-column>
          ${this.enableStorageProxy &&
          this.storageType === 'model' &&
          this.is_admin
            ? html`
                <vaadin-grid-column
                  auto-width
                  flex-grow="0"
                  resizable
                  header="${_t('data.folders.Cloneable')}"
                  .renderer="${this._boundCloneableRenderer}"
                ></vaadin-grid-column>
              `
            : html``}
          ${this.storageType !== 'deadVFolderStatus'
            ? html`
                <vaadin-grid-column
                  auto-width
                  resizable
                  header="${_t('data.folders.Control')}"
                  .renderer="${this._boundControlFolderListRenderer}"
                ></vaadin-grid-column>
              `
            : html`
                <vaadin-grid-column
                  auto-width
                  resizable
                  header="${_t('data.folders.Control')}"
                  .renderer="${this._boundTrashBinControlFolderListRenderer}"
                ></vaadin-grid-column>
              `}
        </vaadin-grid>
        <backend-ai-list-status
          id="list-status"
          statusCondition="${this.listCondition}"
          message="${_text('data.folders.NoFolderToDisplay')}"
        ></backend-ai-list-status>
      </div>
      <backend-ai-dialog id="modify-folder-dialog" fixed backdrop>
        <span slot="title">${_t('data.folders.FolderOptionUpdate')}</span>
        <div slot="content" class="vertical layout flex">
          <div
            class="vertical layout"
            id="modify-quota-controls"
            style="display:${this.directoryBasedUsage &&
            this._checkFolderSupportDirectoryBasedUsage(this.folderInfo.host)
              ? 'flex'
              : 'none'}"
          >
            <div class="horizontal layout center justified">
              <mwc-textfield
                id="modify-folder-quota"
                label="${_t('data.folders.FolderQuota')}"
                value="${this.maxSize.value}"
                type="number"
                min="0"
                step="0.1"
                @change="${() => this._updateQuotaInputHumanReadableValue()}"
              ></mwc-textfield>
              <mwc-select
                class="fixed-position"
                id="modify-folder-quota-unit"
                @change="${() => this._updateQuotaInputHumanReadableValue()}"
                fixedMenuPosition
              >
                ${Object.keys(this.quotaUnit).map(
                  (unit, idx) => html`
                    <mwc-list-item
                      value="${unit}"
                      ?selected="${unit == this.maxSize.unit}"
                    >
                      ${unit}
                    </mwc-list-item>
                  `,
                )}
              </mwc-select>
            </div>
            <span class="helper-text">
              ${_t('data.folders.MaxFolderQuota')} :
              ${this.maxSize.value + ' ' + this.maxSize.unit}
            </span>
          </div>
          <mwc-select
            class="full-width fixed-position"
            id="update-folder-permission"
            style="width:100%;"
            label="${_t('data.Permission')}"
            fixedMenuPosition
          >
            ${Object.keys(this.permissions).map(
              (key) => html`
                <mwc-list-item value="${this.permissions[key]}">
                  ${this.permissions[key]}
                </mwc-list-item>
              `,
            )}
          </mwc-select>
          ${this.enableStorageProxy &&
          this.storageType === 'model' &&
          this.is_admin
            ? html`
                <div
                  id="update-folder-cloneable-container"
                  class="horizontal layout flex wrap center justified"
                >
                  <p style="color:rgba(0, 0, 0, 0.6);margin-left:10px;">
                    ${_t('data.folders.Cloneable')}
                  </p>
                  <mwc-switch
                    id="update-folder-cloneable"
                    style="margin-right:10px;"
                  ></mwc-switch>
                </div>
              `
            : html``}
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            unelevated
            fullwidth
            type="submit"
            icon="edit"
            id="update-button"
            @click="${() => this._updateFolder()}"
          >
            ${_t('data.Update')}
          </mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="modify-folder-name-dialog" fixed backdrop>
        <span slot="title">${_t('data.folders.RenameAFolder')}</span>
        <div slot="content" class="vertical layout flex">
          <mwc-textfield
            id="clone-folder-src"
            label="${_t('data.ExistingFolderName')}"
            value="${this.renameFolderName}"
            disabled
          ></mwc-textfield>
          <mwc-textfield
            class="red"
            id="new-folder-name"
            label="${_t('data.folders.TypeNewFolderName')}"
            pattern="^[a-zA-Z0-9._-]*$"
            autoValidate
            validationMessage="${_t('data.Allowslettersnumbersand-_dot')}"
            maxLength="64"
            placeholder="${_text('maxLength.64chars')}"
            @change="${() => this._validateFolderName(true)}"
          ></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            unelevated
            fullwidth
            type="submit"
            icon="edit"
            id="update-button"
            @click="${() => this._updateFolderName()}"
          >
            ${_t('data.Update')}
          </mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="delete-folder-dialog" fixed backdrop>
        <span slot="title">${_t('data.folders.DeleteAFolder')}</span>
        <div slot="content">
          <div class="warning" style="margin-left:16px;">
            ${_t('dialog.warning.CannotBeUndone')}
          </div>
          <mwc-textfield
            class="red"
            id="delete-folder-name"
            label="${_t('data.folders.TypeFolderNameToDelete')}"
            maxLength="64"
            placeholder="${_text('maxLength.64chars')}"
          ></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            unelevated
            fullwidth
            type="submit"
            icon="close"
            id="delete-button"
            @click="${() => this._deleteFolderWithCheck()}"
          >
            ${_t('data.folders.Delete')}
          </mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="leave-folder-dialog" fixed backdrop>
        <span slot="title">${_t('data.folders.LeaveAFolder')}</span>
        <div slot="content">
          <div class="warning" style="margin-left:16px;">
            ${_t('dialog.warning.CannotBeUndone')}
          </div>
          <mwc-textfield
            class="red"
            id="leave-folder-name"
            label="${_t('data.folders.TypeFolderNameToLeave')}"
            maxLength="64"
            placeholder="${_text('maxLength.64chars')}"
          ></mwc-textfield>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            unelevated
            fullwidth
            type="submit"
            id="leave-button"
            @click="${() => this._leaveFolderWithCheck()}"
          >
            ${_t('data.folders.Leave')}
          </mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="info-folder-dialog" fixed backdrop>
        <span slot="title">${this.folderInfo.name}</span>
        <div slot="content" role="listbox" style="margin: 0;width:100%;">
          <div
            class="horizontal justified layout wrap"
            style="margin-top:15px;"
          >
            <div class="vertical layout center info-indicator">
              <div class="big indicator">${this.folderInfo.host}</div>
              <span>${_t('data.folders.Location')}</span>
            </div>
            ${this.directoryBasedUsage
              ? html`
                  <div class="vertical layout center info-indicator">
                    <div class="big indicator">
                      ${this.folderInfo.numFiles < 0
                        ? 'many'
                        : this.folderInfo.numFiles}
                    </div>
                    <span>${_t('data.folders.NumberOfFiles')}</span>
                  </div>
                `
              : html``}
          </div>
          <mwc-list>
            <mwc-list-item twoline>
              <span><strong>ID</strong></span>
              <span class="monospace" slot="secondary">
                ${this.folderInfo.id}
              </span>
            </mwc-list-item>
            ${this.folderInfo.is_owner
              ? html`
                  <mwc-list-item twoline>
                    <span>
                      <strong>${_t('data.folders.Ownership')}</strong>
                    </span>
                    <span slot="secondary">
                      ${_t('data.folders.DescYouAreFolderOwner')}
                    </span>
                  </mwc-list-item>
                `
              : html``}
            ${this.folderInfo.usage_mode !== 'undefined'
              ? html`
                  <mwc-list-item twoline>
                    <span><strong>${_t('data.UsageMode')}</strong></span>
                    <span slot="secondary">${this.folderInfo.usage_mode}</span>
                  </mwc-list-item>
                `
              : html``}
            ${this.folderInfo.permission
              ? html`
                  <mwc-list-item twoline>
                    <span>
                      <strong>${_t('data.folders.Permission')}</strong>
                    </span>
                    <div slot="secondary" class="horizontal layout">
                      ${this._hasPermission(this.folderInfo, 'r')
                        ? html`
                            <lablup-shields
                              app=""
                              color="green"
                              description="R"
                              ui="flat"
                            ></lablup-shields>
                          `
                        : html``}
                      ${this._hasPermission(this.folderInfo, 'w')
                        ? html`
                            <lablup-shields
                              app=""
                              color="blue"
                              description="W"
                              ui="flat"
                            ></lablup-shields>
                          `
                        : html``}
                      ${this._hasPermission(this.folderInfo, 'd')
                        ? html`
                            <lablup-shields
                              app=""
                              color="red"
                              description="D"
                              ui="flat"
                            ></lablup-shields>
                          `
                        : html``}
                    </div>
                  </mwc-list-item>
                `
              : html``}
            ${this.enableStorageProxy
              ? html`
                  <mwc-list-item twoline>
                    <span>
                      <strong>${_t('data.folders.Cloneable')}</strong>
                    </span>
                    <span class="monospace" slot="secondary">
                      ${this.folderInfo.cloneable
                        ? html`
                            <mwc-icon class="cloneable" style="color:green;">
                              check_circle
                            </mwc-icon>
                          `
                        : html`
                            <mwc-icon class="cloneable" style="color:red;">
                              block
                            </mwc-icon>
                          `}
                    </span>
                  </mwc-list-item>
                `
              : html``}
            ${this.directoryBasedUsage &&
            this._checkFolderSupportDirectoryBasedUsage(this.folderInfo.host)
              ? html`
                  <mwc-list-item twoline>
                    <span>
                      <strong>${_t('data.folders.FolderUsage')}</strong>
                    </span>
                    <span class="monospace" slot="secondary">
                      ${_t('data.folders.FolderUsing')}:
                      ${this.folderInfo.used_bytes >= 0
                        ? globalThis.backendaiutils._humanReadableFileSize(
                            this.folderInfo.used_bytes,
                          )
                        : 'Undefined'}
                      / ${_t('data.folders.FolderQuota')}:
                      ${this.folderInfo.max_size >= 0
                        ? globalThis.backendaiutils._humanReadableFileSize(
                            this.folderInfo.max_size * this.quotaUnit.MiB,
                          )
                        : 'Undefined'}
                      ${this.folderInfo.used_bytes >= 0 &&
                      this.folderInfo.max_size >= 0
                        ? html`
                            <vaadin-progress-bar
                              value="${this.folderInfo.used_bytes /
                              this.folderInfo.max_size /
                              2 ** 20}"
                            ></vaadin-progress-bar>
                          `
                        : html``}
                    </span>
                  </mwc-list-item>
                `
              : html`
                  <mwc-list-item twoline>
                    <span>
                      <strong>${_t('data.folders.FolderUsage')}</strong>
                    </span>
                    <span class="monospace" slot="secondary">
                      ${_t('data.folders.FolderUsing')}:
                      ${this.folderInfo.used_bytes >= 0
                        ? globalThis.backendaiutils._humanReadableFileSize(
                            this.folderInfo.used_bytes,
                          )
                        : 'Undefined'}
                    </span>
                  </mwc-list-item>
                `}
          </mwc-list>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="folder-explorer-dialog"
        class="folder-explorer"
        narrowLayout
        scrimClickAction
        @dialog-closed=${() => {
          this.triggerCloseFilebrowserToReact();
        }}
      >
        <span slot="title" style="margin-right:1rem;">${this.explorer.id}</span>
        <div
          slot="action"
          class="horizontal layout space-between folder-action-buttons center"
        >
          <div class="flex"></div>
          ${this.isWritable
            ? html`
                <mwc-button
                  outlined
                  class="multiple-action-buttons fg red"
                  icon="delete"
                  @click="${() => this._openDeleteMultipleFileDialog()}"
                  style="display:none;"
                >
                  <span>${_t('data.explorer.Delete')}</span>
                </mwc-button>
                <div id="add-btn-cover">
                  <mwc-button
                    id="add-btn"
                    icon="upload_file"
                    ?disabled=${!this.isWritable}
                    @click="${(e) => this._uploadBtnClick(e)}"
                  >
                    <span>${_t('data.explorer.UploadFiles')}</span>
                  </mwc-button>
                </div>
                <div>
                  <mwc-button
                    id="add-folder-btn"
                    icon="drive_folder_upload"
                    ?disabled=${!this.isWritable}
                    @click="${(e) => this._uploadBtnClick(e)}"
                  >
                    <span>${_t('data.explorer.UploadFolder')}</span>
                  </mwc-button>
                </div>
                <div id="mkdir-cover">
                  <mwc-button
                    id="mkdir"
                    class="tooltip"
                    icon="create_new_folder"
                    ?disabled=${!this.isWritable}
                    @click="${() => this._mkdirDialog()}"
                  >
                    <span>${_t('data.explorer.NewFolder')}</span>
                  </mwc-button>
                </div>
              `
            : html`
                <mwc-button id="readonly-btn" disabled>
                  <span>${_t('data.explorer.ReadonlyFolder')}</span>
                </mwc-button>
              `}
          <div id="filebrowser-btn-cover">
            <mwc-button
              id="filebrowser-btn"
              @click="${() => this._executeFileBrowser()}"
            >
              <img
                id="filebrowser-img"
                alt="File Browser"
                src="./resources/icons/filebrowser.svg"
              />
              <span>${_t('data.explorer.ExecuteFileBrowser')}</span>
            </mwc-button>
          </div>
          <div>
            <mwc-button
              id="ssh-btn"
              title="SSH / SFTP"
              @click="${() => this._executeSSHProxyAgent()}"
            >
              <img
                id="ssh-img"
                alt="SSH / SFTP"
                src="/resources/icons/sftp.png"
              />
              <span>${_t('data.explorer.RunSSH/SFTPserver')}</span>
            </mwc-button>
          </div>
        </div>
        <div slot="content">
          <div class="breadcrumb">
            ${this.explorer.breadcrumb
              ? html`
                  <ul>
                    ${this.explorer.breadcrumb.map(
                      (item) => html`
                        <li>
                          ${item === '.'
                            ? html`
                                <mwc-icon-button
                                  icon="folder_open"
                                  dest="${item}"
                                  @click="${(e) => this._gotoFolder(e)}"
                                ></mwc-icon-button>
                              `
                            : html`
                                <a
                                  outlined
                                  class="goto"
                                  path="item"
                                  @click="${(e) => this._gotoFolder(e)}"
                                  dest="${item}"
                                >
                                  ${item}
                                </a>
                              `}
                        </li>
                      `,
                    )}
                  </ul>
                `
              : html``}
          </div>
          <div id="dropzone"><p>drag</p></div>
          <input
            type="file"
            id="fileInput"
            @change="${(e) => this._uploadInputChange(e)}"
            hidden
            multiple
          />
          <input
            type="file"
            id="folderInput"
            @change="${(e) => this._uploadInputChange(e)}"
            hidden
            webkitdirectory
            mozdirectory
            directory
            multiple
          />
          ${this.uploadFilesExist
            ? html`
                <div class="horizontal layout start-justified">
                  <mwc-button
                    icon="cancel"
                    id="cancel_upload"
                    @click="${() => this._cancelUpload()}"
                  >
                    ${_t('data.explorer.StopUploading')}
                  </mwc-button>
                </div>
                <div class="horizontal layout center progress-item flex">
                  ${this.currentUploadFile?.complete
                    ? html`
                        <mwc-icon>check</mwc-icon>
                      `
                    : html``}
                  <div
                    class="vertical layout progress-item"
                    style="width:100%;"
                  >
                    <span>${this.currentUploadFile?.name}</span>
                    <vaadin-progress-bar
                      value="${this.currentUploadFile?.progress}"
                    ></vaadin-progress-bar>
                    <span>${this.currentUploadFile?.caption}</span>
                  </div>
                </div>
                <!-- <vaadin-grid class="progress" theme="row-stripes compact" aria-label="uploadFiles" .items="${this
                  .uploadFiles}" height-by-rows>
            <vaadin-grid-column width="100px" flex-grow="0" .renderer="${this
                  ._boundUploadListRenderer}"></vaadin-grid-column>
            <vaadin-grid-column .renderer="${this
                  ._boundUploadProgressRenderer}"></vaadin-grid-column>
          </vaadin-grid> -->
              `
            : html``}
          <vaadin-grid
            id="file-list-grid"
            class="explorer"
            theme="row-stripes compact dark"
            aria-label="Explorer"
            .items="${this.explorerFiles}"
          >
            <vaadin-grid-selection-column
              auto-select
            ></vaadin-grid-selection-column>
            <vaadin-grid-column
              width="40px"
              flex-grow="0"
              resizable
              header="#"
              .renderer="${this._boundIndexRenderer}"
            ></vaadin-grid-column>
            <vaadin-grid-sort-column
              flex-grow="2"
              resizable
              header="${_t('data.explorer.Name')}"
              path="filename"
              .renderer="${this._boundFileNameRenderer}"
            ></vaadin-grid-sort-column>
            <vaadin-grid-sort-column
              flex-grow="2"
              resizable
              header="${_t('data.explorer.Created')}"
              path="ctime"
              .renderer="${this._boundCreatedTimeRenderer}"
            ></vaadin-grid-sort-column>
            <vaadin-grid-sort-column
              auto-width
              resizable
              header="${_t('data.explorer.Size')}"
              path="size"
              .renderer="${this._boundSizeRenderer}"
            ></vaadin-grid-sort-column>
            <vaadin-grid-column
              resizable
              auto-width
              header="${_t('data.explorer.Actions')}"
              .renderer="${this._boundControlFileListRenderer}"
            ></vaadin-grid-column>
          </vaadin-grid>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="mkdir-dialog" fixed backdrop>
        <span slot="title">${_t('data.explorer.CreateANewFolder')}</span>
        <div slot="content">
          <mwc-textfield
            id="mkdir-name"
            label="${_t('data.explorer.Foldername')}"
            @change="${() => this._validatePathName()}"
            required
            maxLength="255"
            placeholder="${_text('maxLength.255chars')}"
            validationMessage="${_text('data.explorer.ValueRequired')}"
          ></mwc-textfield>
          <br />
        </div>
        <div
          slot="footer"
          class="horizontal center-justified flex layout distancing"
        >
          <mwc-button
            icon="rowing"
            unelevated
            fullwidth
            type="submit"
            id="mkdir-btn"
            @click="${(e) => this._mkdir(e)}"
          >
            ${_t('button.Create')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="share-folder-dialog" fixed backdrop>
        <span slot="title">${_t('data.explorer.ShareFolder')}</span>
        <div slot="content" role="listbox" style="margin: 0;width:100%;">
          <div style="margin: 10px 0px">${_t('data.explorer.People')}</div>
          <div class="vertical layout flex" id="textfields">
            <div class="horizontal layout">
              <div style="flex-grow: 2">
                <mwc-textfield
                  class="share-email"
                  type="email"
                  id="first-email"
                  label="${_t('data.explorer.EnterEmailAddress')}"
                  maxLength="64"
                  placeholder="${_text('maxLength.64chars')}"
                ></mwc-textfield>
              </div>
              <div>
                <mwc-icon-button
                  icon="add"
                  @click="${() => this._addTextField()}"
                ></mwc-icon-button>
                <mwc-icon-button
                  icon="remove"
                  @click="${() => this._removeTextField()}"
                ></mwc-icon-button>
              </div>
            </div>
          </div>
          <div style="margin: 10px 0px">${_t('data.explorer.Permissions')}</div>
          <div style="display: flex; justify-content: space-evenly;">
            <mwc-formfield label="${_t('data.folders.View')}">
              <mwc-radio
                name="share-folder-permission"
                checked
                value="ro"
              ></mwc-radio>
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
            @click=${(e) => this._shareFolder(e)}
          >
            ${_t('button.Share')}
          </mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="modify-permission-dialog" fixed backdrop>
        <span slot="title">${_t('data.explorer.ModifyPermissions')}</span>
        <div slot="content" role="listbox" style="margin: 0; padding: 10px;">
          <vaadin-grid
            theme="row-stripes column-borders compact dark"
            .items="${this.invitees}"
          >
            <vaadin-grid-column
              width="30px"
              flex-grow="0"
              header="#"
              .renderer="${this._boundIndexRenderer}"
            ></vaadin-grid-column>
            <vaadin-grid-column
              header="${_t('data.explorer.InviteeEmail')}"
              .renderer="${this._boundInviteeInfoRenderer}"
            ></vaadin-grid-column>
            <vaadin-grid-column
              header="${_t('data.explorer.Permission')}"
              .renderer="${this._boundPermissionRenderer}"
            ></vaadin-grid-column>
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
          <mwc-textfield
            class="red"
            id="new-file-name"
            label="${_t('data.explorer.NewFileName')}"
            required
            @change="${() => this._validateExistingFileName()}"
            auto-validate
            style="width:320px;"
            maxLength="255"
            placeholder="${_text('maxLength.255chars')}"
            autoFocus
          ></mwc-textfield>
          <div id="old-file-name" style="padding-left:15px;height:2.5em;"></div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            icon="edit"
            fullwidth
            type="button"
            id="rename-file-button"
            unelevated
            @click="${() => this._compareFileExtension()}"
          >
            ${_t('data.explorer.RenameAFile')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="delete-file-dialog" fixed backdrop>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>
            ${_t('dialog.warning.CannotBeUndone')}
            ${_t('dialog.ask.DoYouWantToProceed')}
          </p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button outlined @click="${(e) => this._hideDialog(e)}">
            ${_t('button.Cancel')}
          </mwc-button>
          <mwc-button raised @click="${(e) => this._deleteFileWithCheck(e)}">
            ${_t('button.Okay')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="download-file-dialog" fixed backdrop>
        <span slot="title">${_t('data.explorer.DownloadFile')}</span>
        <div slot="content">
          <a href="${this.downloadURL}">
            <mwc-button outlined>
              ${_t('data.explorer.TouchToDownload')}
            </mwc-button>
          </a>
        </div>
        <div
          slot="footer"
          class="horizontal end-justified flex layout distancing"
        >
          <mwc-button @click="${(e) => this._hideDialog(e)}">
            ${_t('button.Close')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="file-extension-change-dialog" fixed backdrop>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>${_t('data.explorer.FileExtensionChanged')}</p>
        </div>
        <div
          slot="footer"
          class="horizontal center-justified flex layout distancing"
        >
          <mwc-button
            outlined
            fullwidth
            @click="${(e) => this._keepFileExtension()}"
          >
            ${globalThis.backendaioptions.get(
              'language',
              'default',
              'general',
            ) !== 'ko'
              ? html`
                  ${_text('data.explorer.KeepFileExtension') +
                  this.oldFileExtension}
                `
              : html`
                  ${this.oldFileExtension +
                  _text('data.explorer.KeepFileExtension')}
                `}
          </mwc-button>
          <mwc-button unelevated fullwidth @click="${() => this._renameFile()}">
            ${globalThis.backendaioptions.get(
              'language',
              'default',
              'general',
            ) !== 'ko'
              ? html`
                  ${this.newFileExtension
                    ? _text('data.explorer.UseNewFileExtension') +
                      this.newFileExtension
                    : _text('data.explorer.RemoveFileExtension')}
                `
              : html`
                  ${this.newFileExtension
                    ? this.newFileExtension +
                      _text('data.explorer.UseNewFileExtension')
                    : _text('data.explorer.RemoveFileExtension')}
                `}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="filebrowser-notification-dialog"
        fixed
        backdrop
        narrowLayout
      >
        <span slot="title">${_t('dialog.title.Notice')}</span>
        <div slot="content" style="margin: 15px;">
          <span>${_t('data.explorer.ReadOnlyFolderOnFileBrowser')}</span>
        </div>
        <div
          slot="footer"
          class="flex horizontal layout center justified"
          style="margin: 15px 15px 15px 0px;"
        >
          <div class="horizontal layout start-justified center">
            <mwc-checkbox
              @change="${(e) => this._toggleShowFilebrowserNotification(e)}"
            ></mwc-checkbox>
            <span style="font-size:0.8rem;">
              ${_text('dialog.hide.DonotShowThisAgain')}
            </span>
          </div>
          <mwc-button unelevated @click="${(e) => this._hideDialog(e)}">
            ${_t('button.Confirm')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="delete-from-trash-bin-dialog" fixed backdrop>
        <span slot="title">${_t('dialog.title.DeleteForever')}</span>
        <div slot="content">
          <div class="warning">${_t('dialog.warning.DeleteForeverDesc')}</div>
          <mwc-textfield
            class="red"
            id="delete-from-trash-bin-name-input"
            label="${_t('data.folders.TypeFolderNameToDelete')}"
            maxLength="64"
            placeholder="${_text('maxLength.64chars')}"
          ></mwc-textfield>
        </div>
        <div
          slot="footer"
          class="horizontal end-justified flex layout"
          style="gap:5px;"
        >
          <mwc-button outlined @click="${(e) => this._hideDialog(e)}">
            ${_t('button.Cancel')}
          </mwc-button>
          <mwc-button
            raised
            class="warning fg red"
            @click="${() => this._deleteFromTrashBin()}"
          >
            ${_t('data.folders.DeleteForever')}
          </mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }

  firstUpdated() {
    this._addEventListenerDropZone();
    this._mkdir = this._mkdir.bind(this);
    this.fileListGrid.addEventListener('selected-items-changed', () => {
      this._toggleFileListCheckbox();
    });
    this.indicator = globalThis.lablupIndicator;
    this.notification = globalThis.lablupNotification;
    const textfields = this.shadowRoot?.querySelectorAll(
      'mwc-textfield',
    ) as NodeListOf<TextField>;
    for (const textfield of Array.from(textfields)) {
      this._addInputValidator(textfield);
    }
    if (['data', 'automount', 'model'].includes(this.storageType)) {
      (
        this.shadowRoot?.querySelector('vaadin-grid.folderlist') as HTMLElement
      ).style.height = 'calc(100vh - 464px)';
    } else {
      (
        this.shadowRoot?.querySelector('vaadin-grid.folderlist') as HTMLElement
      ).style.height = 'calc(100vh - 420px)';
    }
    document.addEventListener('backend-ai-group-changed', (e) =>
      this._refreshFolderList(true, 'group-changed'),
    );
    document.addEventListener('backend-ai-ui-changed', (e) =>
      this._refreshFolderUI(e),
    );
    this._refreshFolderUI({ detail: { 'mini-ui': globalThis.mini_ui } });
  }

  _modifySharedFolderPermissions() {
    const selectNodeList = this.shadowRoot?.querySelectorAll(
      '#modify-permission-dialog mwc-select',
    );
    const inputList = Array.prototype.filter
      .call(
        selectNodeList,
        (pulldown, idx) =>
          pulldown.value !== (this.invitees as inviteeData[])[idx].perm,
      )
      .map((pulldown, idx) => ({
        perm: pulldown.value === 'kickout' ? null : pulldown.value,
        user: this.invitees[idx].shared_to.uuid,
        vfolder: this.invitees[idx].vfolder_id,
      }));
    const promiseArray = inputList.map((input) =>
      globalThis.backendaiclient.vfolder.modify_invitee_permission(input),
    );
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

  _isUncontrollableStatus(status: VFolderOperationStatus) {
    return [
      'performing',
      'cloning',
      'mounted',
      'error',
      'delete-pending',
      'delete-ongoing',
      'deleted-complete',
      'delete-error',
      'purge-ongoing', // Deprecated since 24.03.0
      'deleting', // deprecated since 24.03.0;
    ].includes(status);
  }

  _isDeadVFolderStatus(status: DeadVFolderStatus) {
    return [
      'delete-pending',
      'delete-ongoing',
      'delete-complete',
      'delete-error',
      'deleting', // deprecated since 24.03.0;
    ].includes(status);
  }

  /**
   *
   * @param {string} url - page to redirect from the current page.
   */
  _moveTo(url = '') {
    const page = url !== '' ? url : 'summary';
    // globalThis.history.pushState({}, '', page);
    store.dispatch(navigate(decodeURIComponent(page), {}));

    document.dispatchEvent(
      new CustomEvent('react-navigate', {
        detail: url,
      }),
    );
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
        <mwc-select label="${_t('data.folders.SelectPermission')}">
          <mwc-list-item value="ro" ?selected="${rowData.item.perm === 'ro'}">
            ${_t('data.folders.View')}
          </mwc-list-item>
          <mwc-list-item value="rw" ?selected="${rowData.item.perm === 'rw'}">
            ${_t('data.folders.Edit')}
          </mwc-list-item>
          <mwc-list-item value="wd" ?selected="${rowData.item.perm === 'wd'}">
            ${_t('data.folders.EditDelete')}
          </mwc-list-item>
          <mwc-list-item value="kickout"">
            ${_t('data.folders.KickOut')}
          </mwc-list-item>
        </mwc-select>
      `,
      root,
    );
    /* this.shadowRoot?.querySelector('mwc-select')?.requestUpdate().then(() => {
      render(
        html`
        <div class="vertical layout">
          <mwc-select label="${_t('data.folders.SelectPermission')}">
            <option ?selected=${rowData.item.perm === 'ro'} value="ro">${_t('data.folders.View')}</option>
            <option ?selected=${rowData.item.perm === 'rw'} value="rw">${_t('data.folders.Edit')}</option>
            <option ?selected=${rowData.item.perm === 'wd'} value="wd">${_t('data.folders.EditDelete')}</option>
            <option value="kickout">${_t('data.folders.KickOut')}</option>
          </mwc-select>
        </div>`, root);
    });*/
  }

  folderListRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div
          class="controls layout flex horizontal start-justified center wrap"
          folder-id="${rowData.item.id}"
          folder-name="${rowData.item.name}"
          folder-type="${rowData.item.type}"
        >
          ${this._hasPermission(rowData.item, 'r')
            ? html`
                <mwc-icon-button
                  class="fg blue controls-running"
                  icon="folder_open"
                  title=${_t('data.folders.OpenAFolder')}
                  @click="${() => {
                    this.triggerOpenFilebrowserToReact(rowData);
                  }}"
                  ?disabled="${this._isUncontrollableStatus(
                    rowData.item.status,
                  )}"
                  .folder-id="${rowData.item.name}"
                ></mwc-icon-button>
              `
            : html``}
          <div
            @click="${(e) =>
              !this._isUncontrollableStatus(rowData.item.status) &&
              this.triggerOpenFilebrowserToReact(rowData)}"
            .folder-id="${rowData.item.name}"
            style="cursor:${this._isUncontrollableStatus(rowData.item.status)
              ? 'default'
              : 'pointer'};"
          >
            ${rowData.item.name}
          </div>
        </div>
      `,
      root,
    );
  }

  quotaRenderer(root, column?, rowData?) {
    let quotaIndicator = '-';
    if (
      this._checkFolderSupportDirectoryBasedUsage(rowData.item.host) &&
      rowData.item.max_size
    ) {
      // `max_size` is in MiB. Convert this to SI unit
      quotaIndicator = globalThis.backendaiutils._humanReadableFileSize(
        rowData.item.max_size * this.quotaUnit.MiB,
      );
    }
    render(
      // language=HTML
      html`
        <div class="horizontal layout center center-justified">
          ${quotaIndicator}
        </div>
      `,
      root,
    );
  }

  uploadListRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <vaadin-item class="progress-item">
          <div>
            ${rowData.item.complete
              ? html`
                  <mwc-icon>check</mwc-icon>
                `
              : html``}
          </div>
        </vaadin-item>
      `,
      root,
    );
  }

  uploadProgressRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <vaadin-item>
          <span>${rowData.item.name}</span>
          ${rowData.item.complete
            ? html``
            : html`
                <div>
                  <vaadin-progress-bar
                    value="${rowData.item.progress}"
                  ></vaadin-progress-bar>
                </div>
                <div>
                  <span>${rowData.item.caption}</span>
                </div>
              `}
        </vaadin-item>
      `,
      root,
    );
  }

  inviteeInfoRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div>${rowData.item.shared_to.email}</div>
      `,
      root,
    );
  }

  iDRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout vertical">
          <span class="indicator monospace">${rowData.item.id}</span>
        </div>
      `,
      root,
    );
  }

  statusRenderer(root, column?, rowData?) {
    let color: string;
    switch (rowData.item.status) {
      case 'ready':
        color = 'green';
        break;
      case 'performing':
      case 'cloning':
      case 'mounted':
        color = 'blue';
        break;
      case 'delete-ongoing':
        color = 'yellow';
        break;
      default:
        color = 'grey';
    }
    render(
      // language=HTML
      html`
        <lablup-shields
          app=""
          color="${color}"
          description="${rowData.item.status}"
          ui="flat"
        ></lablup-shields>
      `,
      root,
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
    const textfields = this.shadowRoot?.querySelector(
      '#textfields',
    ) as HTMLDivElement;
    if (textfields.children.length > 1 && textfields.lastChild) {
      textfields.removeChild(textfields.lastChild);
    }
  }

  indexRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        ${this._indexFrom1(rowData.index)}
      `,
      root,
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
    const isSharingAllowed =
      (
        this._unionedAllowedPermissionByVolume[rowData.item.host] ?? []
      ).includes('invite-others') && !rowData.item.name.startsWith('.');
    render(
      // language=HTML
      html`
        <div
          class="controls layout flex center wrap"
          folder-id="${rowData.item.id}"
          folder-name="${rowData.item.name}"
          folder-type="${rowData.item.type}"
        >
          ${this.enableInferenceWorkload && rowData.item.usage_mode == 'model'
            ? html`
                <mwc-icon-button
                  class="fg green controls-running"
                  icon="play_arrow"
                  @click="${(e) =>
                    this._moveTo('/service/start?model=' + rowData.item.id)}"
                  ?disabled="${this._isUncontrollableStatus(
                    rowData.item.status,
                  )}"
                  id="${rowData.item.id + '-serve'}"
                ></mwc-icon-button>
                <vaadin-tooltip
                  for="${rowData.item.id + '-serve'}"
                  text="${_t('data.folders.Serve')}"
                  position="top-start"
                ></vaadin-tooltip>
              `
            : html``}
          <mwc-icon-button
            class="fg green controls-running"
            icon="info"
            @click="${(e) => this._infoFolder(e)}"
            ?disabled="${this._isUncontrollableStatus(rowData.item.status)}"
            id="${rowData.item.id + '-folderinfo'}"
          ></mwc-icon-button>
          <vaadin-tooltip
            for="${rowData.item.id + '-folderinfo'}"
            text="${_t('data.folders.FolderInfo')}"
            position="top-start"
          ></vaadin-tooltip>
          <!--${this._hasPermission(rowData.item, 'r') &&
          this.enableStorageProxy
            ? html`
                <mwc-icon-button
                  class="fg blue controls-running"
                  icon="content_copy"
                  ?disabled=${!rowData.item.cloneable}
                  @click="${() => {
                    this._requestCloneFolder(rowData.item);
                  }}"
                  id="${rowData.item.id + '-clone'}"
                ></mwc-icon-button>
                <vaadin-tooltip
                  for="${rowData.item.id + '-clone'}"
                  text="${_t('data.folders.CloneFolder')}"
                  position="top-start"
                ></vaadin-tooltip>
              `
            : html``}-->
          ${rowData.item.is_owner
            ? html`
                <mwc-icon-button
                  class="fg ${rowData.item.type == 'user'
                    ? 'blue'
                    : 'green'} controls-running"
                  icon="share"
                  @click="${(e) => this._shareFolderDialog(e)}"
                  ?disabled="${this._isUncontrollableStatus(
                    rowData.item.status,
                  )}"
                  style="display: ${isSharingAllowed ? '' : 'none'}"
                  id="${rowData.item.id + '-share'}"
                ></mwc-icon-button>
                <vaadin-tooltip
                  for="${rowData.item.id + '-share'}"
                  text="${_t('data.folders.ShareFolder')}"
                  position="top-start"
                ></vaadin-tooltip>
                <mwc-icon-button
                  class="fg blue controls-running"
                  icon="perm_identity"
                  @click=${(e) => this._modifyPermissionDialog(rowData.item.id)}
                  ?disabled="${this._isUncontrollableStatus(
                    rowData.item.status,
                  )}"
                  style="display: ${isSharingAllowed ? '' : 'none'}"
                  id="${rowData.item.id + '-modifypermission'}"
                ></mwc-icon-button>
                <vaadin-tooltip
                  for="${rowData.item.id + '-modifypermission'}"
                  text="${_t('data.folders.ModifyPermissions')}"
                  position="top-start"
                ></vaadin-tooltip>
                <mwc-icon-button
                  class="fg ${rowData.item.type == 'user'
                    ? 'blue'
                    : 'green'} controls-running"
                  icon="create"
                  @click="${(e) => this._renameFolderDialog(e)}"
                  ?disabled="${this._isUncontrollableStatus(
                    rowData.item.status,
                  )}"
                  id="${rowData.item.id + '-rename'}"
                ></mwc-icon-button>
                <vaadin-tooltip
                  for="${rowData.item.id + '-rename'}"
                  text="${_t('data.folders.Rename')}"
                  position="top-start"
                ></vaadin-tooltip>
                <mwc-icon-button
                  class="fg blue controls-running"
                  icon="settings"
                  @click="${(e) => this._modifyFolderOptionDialog(e)}"
                  ?disabled="${this._isUncontrollableStatus(
                    rowData.item.status,
                  )}"
                  id="${rowData.item.id + '-optionupdate'}"
                ></mwc-icon-button>
                <vaadin-tooltip
                  for="${rowData.item.id + '-optionupdate'}"
                  text="${_t('data.folders.FolderOptionUpdate')}"
                  position="top-start"
                ></vaadin-tooltip>
              `
            : html``}
          ${rowData.item.is_owner ||
          this._hasPermission(rowData.item, 'd') ||
          (rowData.item.type === 'group' && this.is_admin)
            ? html`
                <mwc-icon-button
                  class="fg ${this.enableVfolderTrashBin
                    ? 'blue'
                    : 'red'} controls-running"
                  icon="delete"
                  @click="${(e) => this._deleteFolderDialog(e)}"
                  ?disabled="${this._isUncontrollableStatus(
                    rowData.item.status,
                  )}"
                  id="${rowData.item.id + '-delete'}"
                ></mwc-icon-button>
                <vaadin-tooltip
                  for="${rowData.item.id + '-delete'}"
                  text="${_t('data.folders.MoveToTrashBin')}"
                  position="top-start"
                ></vaadin-tooltip>
              `
            : html``}
          ${!rowData.item.is_owner && rowData.item.type == 'user'
            ? html`
                <mwc-icon-button
                  class="fg red controls-running"
                  icon="remove_circle"
                  @click="${(e) => this._leaveInvitedFolderDialog(e)}"
                  ?disabled="${this._isUncontrollableStatus(
                    rowData.item.status,
                  )}"
                  id="${rowData.item.id + '-leavefolder'}"
                ></mwc-icon-button>
                <vaadin-tooltip
                  for="${rowData.item.id + '-leavefolder'}"
                  text="${_t('data.folders.LeaveFolder')}"
                  position="top-start"
                ></vaadin-tooltip>
              `
            : html``}
        </div>
      `,
      root,
    );
  }

  /**
   * Render trash bin control folder options - infoFolder, restore, delete forever, etc.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  trashBinControlFolderListRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div
          class="controls layout flex center wrap"
          folder-id="${rowData.item.id}"
          folder-name="${rowData.item.name}"
          folder-type="${rowData.item.type}"
        >
          <mwc-icon-button
            class="fg green controls-running"
            icon="info"
            @click="${(e) => this._infoFolder(e)}"
            id="${rowData.item.id + '-folderinfo'}"
          ></mwc-icon-button>
          <vaadin-tooltip
            for="${rowData.item.id + '-folderinfo'}"
            text="${_t('data.folders.FolderInfo')}"
            position="top-start"
          ></vaadin-tooltip>
          ${rowData.item.is_owner ||
          this._hasPermission(rowData.item, 'd') ||
          (rowData.item.type === 'group' && this.is_admin)
            ? html`
                <mwc-icon-button
                  class="fg blue controls-running"
                  icon="redo"
                  ?disabled=${rowData.item.status !== 'delete-pending'}
                  @click="${(e) => this._restoreFolder(e)}"
                  id="${rowData.item.id + '-restore'}"
                ></mwc-icon-button>
                <vaadin-tooltip
                  for="${rowData.item.id + '-restore'}"
                  text="${_t('data.folders.Restore')}"
                  position="top-start"
                ></vaadin-tooltip>
                <mwc-icon-button
                  class="fg red controls-running"
                  icon="delete_forever"
                  ?disabled=${rowData.item.status !== 'delete-pending'}
                  @click="${(e) => {
                    this.openDeleteFromTrashBinDialog(e);
                  }}"
                  id="${rowData.item.id + '-delete-forever'}"
                ></mwc-icon-button>
                <vaadin-tooltip
                  for="${rowData.item.id + '-delete-forever'}"
                  text="${_t('data.folders.DeleteForever')}"
                  position="top-start"
                ></vaadin-tooltip>
              `
            : html``}
        </div>
      `,
      root,
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
          <mwc-icon-button
            id="${rowData.item.filename + '-download-btn'}"
            class="tiny fg blue"
            icon="cloud_download"
            style="pointer-events: auto !important;"
            ?disabled="${!this._isDownloadable(this.vhost)}"
            filename="${rowData.item.filename}"
            @click="${(e) => this._downloadFile(e, this._isDir(rowData.item))}"
          ></mwc-icon-button>
          ${!this._isDownloadable(this.vhost)
            ? html`
                <vaadin-tooltip
                  for="${rowData.item.filename + '-download-btn'}"
                  text="${_t('data.explorer.DownloadNotAllowed')}"
                  position="top-start"
                ></vaadin-tooltip>
              `
            : html``}
          <mwc-icon-button
            id="rename-btn"
            ?disabled="${!this.isWritable}"
            class="tiny fg green"
            icon="edit"
            required
            filename="${rowData.item.filename}"
            @click="${(e) =>
              this._openRenameFileDialog(e, this._isDir(rowData.item))}"
          ></mwc-icon-button>
          <mwc-icon-button
            id="delete-btn"
            ?disabled="${!this.isWritable}"
            class="tiny fg red"
            icon="delete_forever"
            filename="${rowData.item.filename}"
            @click="${(e) => this._openDeleteFileDialog(e)}"
          ></mwc-icon-button>
        </div>
      `,
      root,
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
        ${this._isDir(rowData.item)
          ? html`
              <div
                class="indicator horizontal center layout"
                name="${rowData.item.filename}"
              >
                <mwc-icon-button
                  class="fg controls-running"
                  icon="folder_open"
                  name="${rowData.item.filename}"
                  @click="${(e) => this._enqueueFolder(e)}"
                ></mwc-icon-button>
                ${rowData.item.filename}
              </div>
            `
          : html`
              <div class="indicator horizontal center layout">
                <mwc-icon-button
                  class="fg controls-running"
                  icon="insert_drive_file"
                ></mwc-icon-button>
                ${rowData.item.filename}
              </div>
            `}
      `,
      root,
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
          ${this._hasPermission(rowData.item, 'r')
            ? html`
                <lablup-shields
                  app=""
                  color="green"
                  description="R"
                  ui="flat"
                ></lablup-shields>
              `
            : html``}
          ${this._hasPermission(rowData.item, 'w')
            ? html`
                <lablup-shields
                  app=""
                  color="blue"
                  description="W"
                  ui="flat"
                ></lablup-shields>
              `
            : html``}
          ${this._hasPermission(rowData.item, 'd')
            ? html`
                <lablup-shields
                  app=""
                  color="red"
                  description="D"
                  ui="flat"
                ></lablup-shields>
              `
            : html``}
        </div>
      `,
      root,
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
        ${rowData.item.is_owner
          ? html`
              <div
                class="horizontal center-justified center layout"
                style="pointer-events: none;"
              >
                <mwc-icon-button class="fg green" icon="done"></mwc-icon-button>
              </div>
            `
          : html``}
      `,
      root,
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
        ${rowData.item.cloneable
          ? html`
              <div
                class="horizontal center-justified center layout"
                style="pointer-events: none;"
              >
                <mwc-icon-button class="fg green" icon="done"></mwc-icon-button>
              </div>
            `
          : html``}
      `,
      root,
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
      `,
      root,
    );
  }

  /**
   * Render size by condition
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  sizeRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout horizontal">
          ${(rowData.item.type as string).toUpperCase() === 'DIRECTORY' &&
          !this._isDirectorySizeVisible
            ? html`
                <span class="monospace">-</span>
              `
            : html`
                <span>${rowData.item.size}</span>
              `}
        </div>
      `,
      root,
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
          ${rowData.item.type == 'user'
            ? html`
                <mwc-icon>person</mwc-icon>
              `
            : html`
                <mwc-icon class="fg green">group</mwc-icon>
              `}
        </div>
      `,
      root,
    );
  }

  private async _getCurrentKeypairResourcePolicy() {
    const accessKey = globalThis.backendaiclient._config.accessKey;
    const res = await globalThis.backendaiclient.keypair.info(accessKey, [
      'resource_policy',
    ]);
    return res.keypair.resource_policy;
  }

  async _getVolumeInformation() {
    const vhostInfo = await globalThis.backendaiclient.vfolder.list_hosts();
    this.volumeInfo = vhostInfo.volume_info || {};
  }

  async _getAllowedVFolderHostsByCurrentUserInfo() {
    const [vhostInfo, currentKeypairResourcePolicy] = await Promise.all([
      globalThis.backendaiclient.vfolder.list_hosts(),
      this._getCurrentKeypairResourcePolicy(),
    ]);
    const currentDomain = globalThis.backendaiclient._config.domainName;
    const currentGroupId = globalThis.backendaiclient.current_group_id();
    const mergedData =
      await globalThis.backendaiclient.storageproxy.getAllowedVFolderHostsByCurrentUserInfo(
        currentDomain,
        currentGroupId,
        currentKeypairResourcePolicy,
      );

    const allowedPermissionForDomainsByVolume = JSON.parse(
      mergedData?.domain?.allowed_vfolder_hosts || '{}',
    );
    const allowedPermissionForGroupsByVolume = JSON.parse(
      mergedData?.group?.allowed_vfolder_hosts || '{}',
    );
    const allowedPermissionForResourcePolicyByVolume = JSON.parse(
      mergedData?.keypair_resource_policy.allowed_vfolder_hosts || '{}',
    );

    const _mergeDedupe = (arr) => [...new Set([].concat(...arr))];
    this._unionedAllowedPermissionByVolume = Object.assign(
      {},
      ...vhostInfo.allowed.map((volume) => {
        return {
          [volume]: _mergeDedupe([
            allowedPermissionForDomainsByVolume[volume],
            allowedPermissionForGroupsByVolume[volume],
            allowedPermissionForResourcePolicyByVolume[volume],
          ]),
        };
      }),
    );
    this.folderListGrid.clearCache();
  }

  _checkFolderSupportDirectoryBasedUsage(host: string) {
    if (
      !host ||
      globalThis.backendaiclient.supports(
        'deprecated-max-quota-scope-in-keypair-resource-policy',
      )
    ) {
      return false;
    }
    const backend = this.volumeInfo[host]?.backend;
    return this.quotaSupportStorageBackends.includes(backend);
  }

  async refreshFolderList() {
    this._triggerFolderListChanged();
    if (this.folderListGrid) {
      this.folderListGrid.clearCache();
    }
    return await this._refreshFolderList(true, 'refreshFolderList');
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
    this.listCondition = 'loading';
    this._listStatus?.show();
    this._getMaxSize();
    let groupId = null;
    groupId = globalThis.backendaiclient.current_group_id();
    globalThis.backendaiclient.vfolder
      .list(groupId)
      .then((value) => {
        let folders = value.filter((item) => {
          if (
            !this.enableInferenceWorkload &&
            this.storageType === 'general' &&
            !item.name.startsWith('.') &&
            item.usage_mode == 'model'
          ) {
            return item;
          } else if (
            this.storageType === 'general' &&
            !item.name.startsWith('.') &&
            item.usage_mode == 'general'
          ) {
            return item;
          } else if (
            this.storageType === 'data' &&
            !item.name.startsWith('.') &&
            item.usage_mode == 'data'
          ) {
            return item;
          } else if (
            this.storageType === 'automount' &&
            item.name.startsWith('.')
          ) {
            return item;
          } else if (
            this.storageType === 'model' &&
            !item.name.startsWith('.') &&
            item.usage_mode == 'model'
          ) {
            return item;
          } else if (
            this.storageType === 'deadVFolderStatus' &&
            this._isDeadVFolderStatus(item.status)
          ) {
            return item;
          }
        });
        // Filter folder lists whose status is belonging to `DeadVFolderStatus`
        // for storageTypes other than `delete-pending-deletion-ongoing`
        if (this.storageType !== 'deadVFolderStatus') {
          folders = folders.filter(
            (item) => !this._isDeadVFolderStatus(item.status),
          );
        }
        // Filter `delete-complete` status folders.
        folders = folders.filter((item) => item.status !== 'delete-complete');
        this.folders = folders;
        this._triggerFolderListChanged();
        if (this.folders.length == 0) {
          this.listCondition = 'no-data';
        } else {
          this._listStatus?.hide();
        }
        this._folderRefreshing = false;
      })
      .catch(() => {
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
    if (
      Object.prototype.hasOwnProperty.call(e.detail, 'mini-ui') &&
      e.detail['mini-ui'] === true
    ) {
      this.folderExplorerDialog.classList.add('mini_ui');
    } else {
      this.folderExplorerDialog.classList.remove('mini_ui');
    }
  }

  /**
   * Check the images that supports filebrowser application
   *
   */
  async _checkImageSupported() {
    const fields = [
      'name',
      'tag',
      'registry',
      'digest',
      'installed',
      'labels { key value }',
      'resource_limits { key min max }',
    ];
    const response = await globalThis.backendaiclient.image.list(
      fields,
      true,
      true,
    );
    const images = response.images;
    // Filter filebrowser supported images.
    this.filebrowserSupportedImages = images.filter((image) =>
      image.labels.find(
        (label) =>
          label.key === 'ai.backend.service-ports' &&
          label.value.toLowerCase().includes('filebrowser'),
      ),
    );
    // Filter service supported images.
    this.systemRoleSupportedImages = images.filter((image) =>
      image.labels.find(
        (label) =>
          label.key === 'ai.backend.role' &&
          label.value.toLowerCase().includes('system'),
      ),
    );
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        async () => {
          this.is_admin = globalThis.backendaiclient.is_admin;
          this.enableStorageProxy =
            globalThis.backendaiclient.supports('storage-proxy');
          this.enableInferenceWorkload =
            globalThis.backendaiclient.supports('inference-workload');
          this.enableVfolderTrashBin =
            globalThis.backendaiclient.supports('vfolder-trash-bin');
          this.authenticated = true;
          this._APIMajorVersion = globalThis.backendaiclient.APIMajorVersion;
          this._maxFileUploadSize =
            globalThis.backendaiclient._config.maxFileUploadSize;
          this.directoryBasedUsage =
            globalThis.backendaiclient._config.directoryBasedUsage &&
            !globalThis.backendaiclient.supports(
              'deprecated-max-quota-scope-in-keypair-resource-policy',
            );
          this._isDirectorySizeVisible =
            globalThis.backendaiclient._config.isDirectorySizeVisible;
          this._getAllowedVFolderHostsByCurrentUserInfo();
          this._checkImageSupported();
          this._getVolumeInformation();
          this._refreshFolderList(false, 'viewStatechanged');
        },
        true,
      );
    } else {
      this.is_admin = globalThis.backendaiclient.is_admin;
      this.enableStorageProxy =
        globalThis.backendaiclient.supports('storage-proxy');
      this.enableInferenceWorkload =
        globalThis.backendaiclient.supports('inference-workload');
      this.enableVfolderTrashBin =
        globalThis.backendaiclient.supports('vfolder-trash-bin');
      this.authenticated = true;
      this._APIMajorVersion = globalThis.backendaiclient.APIMajorVersion;
      this._maxFileUploadSize =
        globalThis.backendaiclient._config.maxFileUploadSize;
      this.directoryBasedUsage =
        globalThis.backendaiclient._config.directoryBasedUsage &&
        !globalThis.backendaiclient.supports(
          'deprecated-max-quota-scope-in-keypair-resource-policy',
        );
      this._isDirectorySizeVisible =
        globalThis.backendaiclient._config.isDirectorySizeVisible;
      this._getAllowedVFolderHostsByCurrentUserInfo();
      this._checkImageSupported();
      this._getVolumeInformation();
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
    (this.shadowRoot?.querySelector('#' + id) as BackendAIDialog).show();
  }

  closeDialog(id) {
    (this.shadowRoot?.querySelector('#' + id) as BackendAIDialog).hide();
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
    const controls = controller.closest('.controls');
    const folderName = controls.getAttribute('folder-name');
    return folderName;
  }

  _getControlID(e) {
    const controller = e.target;
    const controls = controller.closest('.controls');
    const folderId = controls.getAttribute('folder-id');
    return folderId;
  }

  _getControlType(e) {
    const controller = e.target;
    const controls = controller.closest('.controls');
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
    job
      .then((value) => {
        this.folderInfo = value;
        this.openDialog('info-folder-dialog');
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

  /**
   * Open modify-folder-dialog to rename folder name.
   *
   * @param {Event} e - click the settings icon button
   * */
  _modifyFolderOptionDialog(e) {
    globalThis.backendaiclient.vfolder.name = this._getControlName(e);
    const job = globalThis.backendaiclient.vfolder.info(
      globalThis.backendaiclient.vfolder.name,
    );
    job
      .then((value) => {
        this.folderInfo = value;
        const permission = this.folderInfo.permission;
        let idx = Object.keys(this.permissions).indexOf(permission);
        idx = idx > 0 ? idx : 0;
        this.updateFolderPermissionSelect.select(idx);
        if (this.updateFolderCloneableSwitch) {
          this.updateFolderCloneableSwitch.selected = this.folderInfo.cloneable;
        }
        // get quota if host storage support per folder quota
        if (
          this.directoryBasedUsage &&
          this._checkFolderSupportDirectoryBasedUsage(this.folderInfo.host)
        ) {
          [this.quota.value, this.quota.unit] = globalThis.backendaiutils
            ._humanReadableFileSize(
              this.folderInfo.max_size * this.quotaUnit.MiB,
            )
            .split(' ');
          this.modifyFolderQuotaInput.value = this.quota.value.toString();
          this.modifyFolderQuotaUnitSelect.value =
            this.quota.unit == 'Bytes' ? 'MB' : this.quota.unit;
        }
        this.openDialog('modify-folder-dialog');
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

  /**
   * Update the folder options such as "permission" and "cloneable"
   **/
  async _updateFolder() {
    let isErrorOccurred = false;
    let cloneable = false;
    const input = {};
    if (this.updateFolderPermissionSelect) {
      let permission = this.updateFolderPermissionSelect.value;
      permission =
        Object.keys(this.permissions).find(
          (key) => this.permissions[key] === permission,
        ) ?? '';
      if (permission && this.folderInfo.permission !== permission) {
        input['permission'] = permission;
      }
    }
    if (this.updateFolderCloneableSwitch) {
      cloneable = this.updateFolderCloneableSwitch.selected;
      input['cloneable'] = cloneable;
    }

    const modifyFolderJobQueue: Promise<string>[] = [];
    if (Object.keys(input).length > 0) {
      const updateFolderConfig =
        globalThis.backendaiclient.vfolder.update_folder(
          input,
          globalThis.backendaiclient.vfolder.name,
        );
      modifyFolderJobQueue.push(updateFolderConfig);
    }
    if (
      this.directoryBasedUsage &&
      this._checkFolderSupportDirectoryBasedUsage(this.folderInfo.host)
    ) {
      const quota = this.modifyFolderQuotaInput.value
        ? BigInt(
            Number(this.modifyFolderQuotaInput.value) *
              this.quotaUnit[this.modifyFolderQuotaUnitSelect.value],
          ).toString()
        : '0';
      if (
        this.quota.value != Number(this.modifyFolderQuotaInput.value) ||
        this.quota.unit != this.modifyFolderQuotaUnitSelect.value
      ) {
        const updateFolderQuota = globalThis.backendaiclient.vfolder.set_quota(
          this.folderInfo.host,
          this.folderInfo.id,
          quota.toString(),
        );
        modifyFolderJobQueue.push(updateFolderQuota);
      }
    }
    if (modifyFolderJobQueue.length > 0) {
      await Promise.all(modifyFolderJobQueue)
        .then(() => {
          this.notification.text = _text('data.folders.FolderUpdated');
          this.notification.show();
          this._refreshFolderList(true, 'updateFolder');
        })
        .catch((err) => {
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
  _deleteFolderDialog(e) {
    this.deleteFolderID = this._getControlID(e) || '';
    this.deleteFolderName = this._getControlName(e) || '';
    this.deleteFolderNameInput.value = '';
    // let isDelible = await this._checkVfolderMounted(deleteFolderId);
    // if (isDelible) {
    if (this.enableVfolderTrashBin) {
      this._deleteFolder(this.deleteFolderID);
    } else {
      this.openDialog('delete-folder-dialog');
    }
    // } else {
    //   this.notification.text = _text('data.folders.CannotDeleteFolder');
    //   this.notification.show(true);
    // }
  }

  /**
   * Open delete-from-trash-bin-dialog to delete folder from trash bin.
   *
   * @param {Event} e - click the delete icon button
   * */
  openDeleteFromTrashBinDialog(e) {
    this.deleteFolderID = this._getControlID(e) || '';
    this.deleteFolderName = this._getControlName(e) || '';
    this.deleteFromTrashBinNameInput.value = '';
    this.openDialog('delete-from-trash-bin-dialog');
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
    const folder = this.enableVfolderTrashBin
      ? this.deleteFolderID
      : this.deleteFolderName;
    this._deleteFolder(folder);
  }

  /**
   * Delete folder and notice.
   *
   * @param {string} folder
   * */
  _deleteFolder(folder) {
    const job = this.enableVfolderTrashBin
      ? globalThis.backendaiclient.vfolder.delete_by_id(folder)
      : globalThis.backendaiclient.vfolder.delete(folder);
    job
      .then(async (resp) => {
        if (resp.msg) {
          this.notification.text = _text('data.folders.CannotDeleteFolder');
          this.notification.show(true);
        } else {
          this.notification.text = this.enableVfolderTrashBin
            ? _text('data.folders.MovedToTrashBin', {
                folderName: this.deleteFolderName || '',
              })
            : _text('data.folders.FolderDeleted', {
                folderName: this.deleteFolderName || '',
              });
          this.notification.show();
          await this.refreshFolderList();
        }
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

  /**
   * Start inference with the selected folder
   *
   * @param {Event} e - clicked running icon button
   */
  _inferModel(e) {
    const folderName = this._getControlName(e);
    this.sessionLauncher.customFolderMapping = {};
    this.sessionLauncher.customFolderMapping[folderName] = 'mount'; // Session launcher only uses key. Therefore value can be anything. (reserved for future use)
    this.sessionLauncher._launchSessionDialog();
    /*
    this.mode = 'inference'
    this.customFolderMapping  {test-model: '/work'}
     */
    return;
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
    job
      .then(async (value) => {
        this.notification.text = _text('data.folders.FolderDisconnected');
        this.notification.show();
        await this.refreshFolderList();
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

  /**
   * Get max_size of keypair resource policy
   *
   */
  async _getMaxSize() {
    // const accessKey = globalThis.backendaiclient._config.accessKey;
    // const res = await globalThis.backendaiclient.keypair.info(accessKey, [
    //  'resource_policy',
    // ]);
    // const policyName = res.keypair.resource_policy;
    // const resource_policy =
    //  await globalThis.backendaiclient.resourcePolicy.get(policyName);
    // default unit starts with MB.
    // [this.maxSize.value, this.maxSize.unit] = globalThis.backendaiutils
    //   ._humanReadableFileSize(max_vfolder_size)
    //   .split(' ');
    // if (['Bytes', 'KB', 'MB'].includes(this.maxSize.unit)) {
    //   this.maxSize.value =
    //     this.maxSize.value < 1 ? 1 : Math.round(this.maxSize.value);
    //   this.maxSize.unit = 'MB';
    // } else {
    //   this.maxSize.value = Math.round(this.maxSize.value * 10) / 10;
    // }
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
          this.newFileNameInput.validationMessage = _text(
            'data.FileandFoldernameRequired',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        } else {
          this.newFileNameInput.validationMessage = _text(
            'data.Allowslettersnumbersand-_dot',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
      } else {
        const regex = /[`~!@#$%^&*()|+=?;:'",<>{}[\]\\/]/gi;
        let isValid: boolean;
        // compare old name and new name.
        if (
          this.newFileNameInput.value ===
          (
            this.renameFileDialog.querySelector(
              '#old-file-name',
            ) as HTMLDivElement
          ).textContent
        ) {
          this.newFileNameInput.validationMessage = _text(
            'data.EnterDifferentValue',
          );
          isValid = false;
          return {
            valid: isValid,
            customError: !isValid,
          };
        } else {
          isValid = true;
        }
        // custom validation for folder name using regex
        isValid = !regex.test(this.newFileNameInput.value);
        if (!isValid) {
          this.newFileNameInput.validationMessage = _text(
            'data.Allowslettersnumbersand-_dot',
          );
        }
        return {
          valid: isValid,
          customError: !isValid,
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
    const folderName = isModifying
      ? this.newFolderNameInput
      : (this.shadowRoot?.querySelector('#add-folder-name') as TextField);

    folderName.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          folderName.validationMessage = _text('data.FolderNameRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        } else {
          folderName.validationMessage = _text(
            'data.Allowslettersnumbersand-_dot',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
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
              customError: !isValid,
            };
          } else {
            isValid = true;
          }
        }
        // custom validation for folder name using regex
        isValid = !regex.test(folderName.value);
        if (!isValid) {
          folderName.validationMessage = _text(
            'data.Allowslettersnumbersand-_dot',
          );
        }
        return {
          valid: isValid,
          customError: !isValid,
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
  async _clearExplorer(
    path = this.explorer.breadcrumb.join('/'),
    id = this.explorer.id,
    dialog = false,
  ) {
    const job = await globalThis.backendaiclient.vfolder.list_files(path, id);
    this.fileListGrid.selectedItems = [];
    if (this._APIMajorVersion < 6) {
      this.explorer.files = JSON.parse(job.files);
    } else {
      // to support dedicated storage vendors such as FlashBlade
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
      if (
        this.filebrowserSupportedImages.length === 0 ||
        this.systemRoleSupportedImages.length === 0
      ) {
        await this._checkImageSupported();
      }
      this._toggleFilebrowserButton();
      this._toggleSSHSessionButton();
      this.openDialog('folder-explorer-dialog');
    }
  }

  /**
   * toggle filebrowser button in Vfolder explorer dialog
   */
  _toggleFilebrowserButton() {
    const isfilebrowserSupported =
      this.filebrowserSupportedImages.length > 0 && this._isResourceEnough()
        ? true
        : false;
    const filebrowserIcon = this.shadowRoot?.querySelector('#filebrowser-img');
    const filebrowserBtn = this.shadowRoot?.querySelector(
      '#filebrowser-btn',
    ) as Button;
    if (filebrowserIcon && filebrowserBtn) {
      filebrowserBtn.disabled = !isfilebrowserSupported;
      const filterClass = isfilebrowserSupported ? '' : 'apply-grayscale';
      filebrowserIcon.setAttribute('class', filterClass);
    }
  }

  triggerOpenFilebrowserToReact(rowData) {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('folder', rowData.item.id);
    document.dispatchEvent(
      new CustomEvent('react-navigate', {
        detail: {
          pathname: '/data',
          search: queryParams.toString(),
        },
      }),
    );
  }

  triggerCloseFilebrowserToReact() {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.delete('folder');
    document.dispatchEvent(
      new CustomEvent('react-navigate', {
        detail: {
          pathname: window.location.pathname,
          search: queryParams.toString(),
        },
      }),
    );
  }

  /**
   * Set up the explorer of the folder and call the _clearExplorer() function.
   *
   * @param {Event} e - click the folder_open icon button
   * @param {boolean} isWritable - check whether write operation is allowed or not
   * */
  _folderExplorer(rowData) {
    this.vhost = rowData.item.host;
    const folderName = rowData.item.name;
    const isWritable =
      this._hasPermission(rowData.item, 'w') ||
      rowData.item.is_owner ||
      (rowData.item.type === 'group' && this.is_admin);
    const explorer = {
      id: folderName,
      uuid: rowData.item.id,
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
      const job = globalThis.backendaiclient.vfolder
        .mkdir([...explorer.breadcrumb, newfolder].join('/'), explorer.id)
        .catch((err) => {
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

  /* File upload and download */
  /**
   * Add eventListener to the dropzone - dragleave, dragover, drop.
   * */
  _addEventListenerDropZone() {
    const dndZonePlaceholderEl = this.shadowRoot?.querySelector(
      '#dropzone',
    ) as HTMLDivElement;
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
            if (
              this._maxFileUploadSize > 0 &&
              file.size > this._maxFileUploadSize
            ) {
              this.notification.text =
                _text('data.explorer.FileUploadSizeLimit') +
                ` (${globalThis.backendaiutils._humanReadableFileSize(
                  this._maxFileUploadSize,
                )})`;
              this.notification.show();
              return;
            } else {
              const reUploadFile = this.explorerFiles.find(
                (elem: any) => elem.filename === file.name,
              );
              if (reUploadFile) {
                // plain javascript modal to confirm whether proceed to overwrite operation or not
                /*
                 *  TODO: replace confirm operation with customized dialog
                 */
                const confirmed = window.confirm(
                  `${_text('data.explorer.FileAlreadyExists')}\n${
                    file.name
                  }\n${_text('data.explorer.DoYouWantToOverwrite')}`,
                );
                if (confirmed) {
                  file.progress = 0;
                  file.caption = '';
                  file.error = false;
                  file.complete = false;
                  this.uploadFiles.push(file);
                }
              } else {
                file.progress = 0;
                file.caption = '';
                file.error = false;
                file.complete = false;
                this.uploadFiles.push(file);
              }
            }
          } else {
            // let item = e.dataTransfer.items[i].webkitGetAsEntry();
            // console.log(item.webkitRelativePath);
            // this._executeFileBrowser();
            // show snackbar to filebrowser only once
            if (!isNotificationDisplayed) {
              if (this.filebrowserSupportedImages.length > 0) {
                this.notification.text = _text(
                  'data.explorer.ClickFilebrowserButton',
                );
                this.notification.show();
              } else {
                this.notification.text = _text(
                  'data.explorer.NoImagesSupportingFileBrowser',
                );
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
        this.notification.text = _text(
          'data.explorer.WritePermissionRequiredInUploadFiles',
        );
        this.notification.show();
      }
    });
  }

  /**
   * Create MouseEvents when cloud_upload button is clicked.
   *
   * @param {Event} e - click the cloud_upload button.
   * */
  _uploadBtnClick(e) {
    const isFolder = e.target.id === 'add-folder-btn';
    const elem = isFolder
      ? (this.shadowRoot?.querySelector('#folderInput') as HTMLInputElement)
      : (this.shadowRoot?.querySelector('#fileInput') as HTMLInputElement);
    if (elem && document.createEvent) {
      // sanity check
      const evt = document.createEvent('MouseEvents');
      evt.initEvent('click', true, false);
      elem.dispatchEvent(evt);
    }
  }

  getFolderName(file: File) {
    const filePath = file.webkitRelativePath || file.name;
    return filePath.split('/')?.[0];
  }

  /**
   * If file is added, call the fileUpload() function and initialize fileInput string
   *
   * @param {Event} e - add file to the input element
   * */
  _uploadInputChange(e) {
    const length = e.target.files.length;
    const isFolderUpload = e.target.id === 'folderInput';
    const inputElement = isFolderUpload
      ? (this.shadowRoot?.querySelector('#folderInput') as HTMLInputElement)
      : (this.shadowRoot?.querySelector('#fileInput') as HTMLInputElement);
    let isEmptyFileIncluded = false;
    let reUploadFolderConfirmed = false;
    // plain javascript modal to confirm whether proceed to overwrite "folder" operation or not
    /*
     *  TODO: replace confirm operation with customized dialog
     */
    if (e.target.files.length > 0 && isFolderUpload) {
      const f = e.target.files[0];
      const reUploadFolder = this.explorerFiles.find(
        (elem: any) => elem.filename === this.getFolderName(f),
      );
      if (reUploadFolder) {
        reUploadFolderConfirmed = window.confirm(
          `${_text('data.explorer.FolderAlreadyExists')}\n${this.getFolderName(
            f,
          )}\n${_text('data.explorer.DoYouWantToOverwrite')}`,
        );
        if (!reUploadFolderConfirmed) {
          inputElement.value = '';
          return;
        }
      }
    }
    for (let i = 0; i < length; i++) {
      const file = e.target.files[i];

      let text = '';
      const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      /* File upload size limits to configuration */
      if (this._maxFileUploadSize > 0 && file.size > this._maxFileUploadSize) {
        this.notification.text =
          _text('data.explorer.FileUploadSizeLimit') +
          ` (${globalThis.backendaiutils._humanReadableFileSize(
            this._maxFileUploadSize,
          )})`;
        this.notification.show();
        return;
      } else if (file.size === 0) {
        // skip the empty file upload
        isEmptyFileIncluded = true;
        continue;
      } else {
        const reUploadFile = this.explorerFiles.find(
          (elem: any) => elem.filename === file.name,
        );
        if (reUploadFile && !reUploadFolderConfirmed) {
          // plain javascript modal to confirm whether proceed to overwrite "file" operation or not
          // if the user already confirms to overwrite the "folder", the modal doesn't appear.
          /*
           *  TODO: replace confirm operation with customized dialog
           */
          const confirmed = window.confirm(
            `${_text('data.explorer.FileAlreadyExists')}\n${file.name}\n${_text(
              'data.explorer.DoYouWantToOverwrite',
            )}`,
          );
          if (confirmed) {
            file.id = text;
            file.progress = 0;
            file.caption = '';
            file.error = false;
            file.complete = false;
            this.uploadFiles.push(file);
          }
        } else {
          file.id = text;
          file.progress = 0;
          file.caption = '';
          file.error = false;
          file.complete = false;
          this.uploadFiles.push(file);
        }
      }
    }
    for (let i = 0; i < this.uploadFiles.length; i++) {
      this.fileUpload(this.uploadFiles[i]);
    }
    if (isEmptyFileIncluded || isFolderUpload) {
      this.notification.text = _text(
        'data.explorer.EmptyFilesAndFoldersAreNotUploaded',
      );
      this.notification.show();
    }
    inputElement.value = '';
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
    for (
      let i = this.fileUploadCount;
      i < this.concurrentFileUploadLimit;
      i++
    ) {
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
    const path = this.explorer.breadcrumb
      .concat(fileObj.webkitRelativePath || fileObj.name)
      .join('/');
    const job = globalThis.backendaiclient.vfolder.create_upload_session(
      path,
      fileObj,
      this.explorer.id,
    );
    job.then((url) => {
      const start_date = new Date().getTime();
      const upload = new tus.Upload(fileObj, {
        endpoint: url,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        uploadUrl: url,
        chunkSize: 15728640, // 15MB
        metadata: {
          filename: path,
          filetype: fileObj.type,
        },
        onError: (error) => {
          console.log('Failed because: ' + error);
          this.currentUploadFile =
            this.uploadFiles[this.uploadFiles.indexOf(fileObj)];
          this.fileUploadCount = this.fileUploadCount - 1;
          this.runFileUploadQueue();
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          this.currentUploadFile =
            this.uploadFiles[this.uploadFiles.indexOf(fileObj)];
          if (!this._uploadFlag) {
            upload.abort();
            this.uploadFiles[this.uploadFiles.indexOf(fileObj)].caption =
              `Canceling...`;
            this.uploadFiles = this.uploadFiles.slice();
            setTimeout(() => {
              this.uploadFiles = [];
              this.uploadFilesExist = false;
              this.fileUploadCount = this.fileUploadCount - 1;
            }, 1000);
            return;
          }

          const now = new Date().getTime();
          const speed: string =
            (
              bytesUploaded /
              (1024 * 1024) /
              ((now - start_date) / 1000)
            ).toFixed(1) + 'MB/s';
          const estimated_seconds = Math.floor(
            (bytesTotal - bytesUploaded) /
              ((bytesUploaded / (now - start_date)) * 1000),
          );
          let estimated_time_left = _text('data.explorer.LessThan10Sec');
          if (estimated_seconds >= 86400) {
            estimated_time_left = _text('data.explorer.MoreThanADay');
          } else if (estimated_seconds > 10) {
            const hour = Math.floor(estimated_seconds / 3600);
            const min = Math.floor((estimated_seconds % 3600) / 60);
            const sec = estimated_seconds % 60;
            estimated_time_left = `${hour}:${min}:${sec}`;
          }
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(1);
          this.uploadFiles[this.uploadFiles.indexOf(fileObj)].progress =
            bytesUploaded / bytesTotal;
          this.uploadFiles[this.uploadFiles.indexOf(fileObj)].caption =
            `${percentage}% / Time left : ${estimated_time_left} / Speed : ${speed}`;
          this.uploadFiles = this.uploadFiles.slice();
        },
        onSuccess: () => {
          this._clearExplorer();
          this.currentUploadFile =
            this.uploadFiles[this.uploadFiles.indexOf(fileObj)];
          this.uploadFiles[this.uploadFiles.indexOf(fileObj)].complete = true;
          this.uploadFiles = this.uploadFiles.slice();
          setTimeout(() => {
            this.uploadFiles.splice(this.uploadFiles.indexOf(fileObj), 1);
            this.uploadFilesExist = this.uploadFiles.length > 0 ? true : false;
            this.uploadFiles = this.uploadFiles.slice();
            this.fileUploadCount = this.fileUploadCount - 1;
            this.runFileUploadQueue();
          }, 1000);
        },
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
    if (!this._isDownloadable(this.vhost)) {
      this.notification.text = _text('data.explorer.DownloadNotAllowed');
      this.notification.show();
      return;
    }
    const fn = e.target.getAttribute('filename');
    const path = this.explorer.breadcrumb.concat(fn).join('/');
    const job = globalThis.backendaiclient.vfolder.request_download_token(
      path,
      this.explorer.id,
      archive,
    );
    job.then((res) => {
      const token = res.token;
      let url;
      if (this._APIMajorVersion < 6) {
        url =
          globalThis.backendaiclient.vfolder.get_download_url_with_token(token);
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
        a.addEventListener('click', function (e) {
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
    const oldFilename =
      (this.renameFileDialog.querySelector('#old-file-name') as HTMLDivElement)
        .textContent ?? '';
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
      newFilename = newFilename.replace(
        new RegExp(this.newFileExtension + '$'),
        this.oldFileExtension,
      );
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
        const isNotificationVisible = localStorage.getItem(
          'backendaiwebui.filebrowserNotification',
        );
        if (
          (isNotificationVisible == null || isNotificationVisible === 'true') &&
          !this.isWritable
        ) {
          this.fileBrowserNotificationDialog.show();
        }
        this._launchFileBrowserSession();
        this._toggleFilebrowserButton();
      } else {
        this.notification.text = _text(
          'data.explorer.NoImagesSupportingFileBrowser',
        );
        this.notification.show();
      }
    } else {
      this.notification.text = _text(
        'data.explorer.NotEnoughResourceForFileBrowserSession',
      );
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
  async _launchFileBrowserSession() {
    let appOptions;
    const imageResource: Record<string, unknown> = {};
    // monkeypatch for filebrowser applied environment
    // const environment = 'cr.backend.ai/testing/filebrowser:21.01-ubuntu20.04';
    const images = this.filebrowserSupportedImages.filter(
      (image: any) =>
        image['name'].toLowerCase().includes('filebrowser') &&
        image['installed'],
    );

    // select one image to launch filebrowser supported session
    const preferredImage = images[0];
    const environment =
      preferredImage['registry'] +
      '/' +
      preferredImage['name'] +
      ':' +
      preferredImage['tag'];

    // add current folder
    imageResource['mounts'] = [this.explorer.id];
    imageResource['cpu'] = 1;
    imageResource['mem'] = this.minimumResource.mem + 'g';
    imageResource['domain'] = globalThis.backendaiclient._config.domainName;
    imageResource['group_name'] = globalThis.backendaiclient.current_group;
    const indicator = await this.indicator.start('indeterminate');

    return globalThis.backendaiclient
      .get_resource_slots()
      .then((response) => {
        indicator.set(20, _text('data.explorer.ExecutingFileBrowser'));
        return globalThis.backendaiclient.createIfNotExists(
          environment,
          null,
          imageResource,
          10000,
          undefined,
        );
      })
      .then(async (res) => {
        const service_info = res.servicePorts;
        appOptions = {
          'session-uuid': res.sessionId,
          'session-name': res.sessionName,
          'access-key': '',
          runtime: 'filebrowser',
          arguments: { '--root': '/home/work/' + this.explorer.id },
        };
        // only launch filebrowser app when it has valid service ports
        if (
          service_info.length > 0 &&
          service_info.filter((el) => el.name === 'filebrowser').length > 0
        ) {
          globalThis.appLauncher.showLauncher(appOptions);
        }
        if (this.folderExplorerDialog.open) {
          this.closeDialog('folder-explorer-dialog');
        }
        indicator.end(1000);
      })
      .catch((err) => {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
        indicator.end(100);
      });
  }

  _executeSSHProxyAgent() {
    if (this.volumeInfo[this.vhost]?.sftp_scaling_groups?.length > 0) {
      if (this.systemRoleSupportedImages.length > 0) {
        this._launchSystemRoleSSHSession();
        this._toggleSSHSessionButton();
      } else {
        this.notification.text = _text(
          'data.explorer.NoImagesSupportingSystemSession',
        );
        this.notification.show();
      }
    } else {
      this.notification.text = _text('data.explorer.SFTPSessionNotAvailable');
      this.notification.show();
    }
  }

  /**
   * Launch system role sftp-uploader image and open the dialog that includes the ssh link.
   */
  async _launchSystemRoleSSHSession() {
    const imageResource: Record<string, unknown> = {};
    const configSSHImage = globalThis.backendaiclient._config.systemSSHImage;
    const images = this.systemRoleSupportedImages.filter(
      (image: any) => image['installed'],
    );
    // TODO: use lablup/openssh-server image
    // select one image to launch system role supported session
    const preferredImage = images[0];
    const environment =
      configSSHImage !== ''
        ? configSSHImage
        : preferredImage['registry'] +
          '/' +
          preferredImage['name'] +
          ':' +
          preferredImage['tag'];

    // add current folder
    imageResource['mounts'] = [this.explorer.id];
    imageResource['cpu'] = 1;
    imageResource['mem'] = '256m';
    imageResource['domain'] = globalThis.backendaiclient._config.domainName;
    imageResource['scaling_group'] =
      this.volumeInfo[this.vhost]?.sftp_scaling_groups[0];
    imageResource['group_name'] = globalThis.backendaiclient.current_group;
    const indicator = await this.indicator.start('indeterminate');
    return (async () => {
      try {
        await globalThis.backendaiclient.get_resource_slots();
        indicator.set(50, _text('data.explorer.StartingSSH/SFTPSession'));
        const sessionResponse =
          await globalThis.backendaiclient.createIfNotExists(
            environment,
            `sftp-${this.explorer.uuid}`,
            imageResource,
            15000,
            undefined,
          );
        if (sessionResponse.status === 'CANCELLED') {
          // Max # of upload sessions exceeded for this used
          this.notification.text = PainKiller.relieve(
            _text('data.explorer.NumberOfSFTPSessionsExceededTitle'),
          );
          this.notification.detail = _text(
            'data.explorer.NumberOfSFTPSessionsExceededBody',
          );
          this.notification.show(true, {
            title: _text('data.explorer.NumberOfSFTPSessionsExceededTitle'),
            message: _text('data.explorer.NumberOfSFTPSessionsExceededBody'),
          });
          indicator.end(100);
          return;
        }
        const directAccessInfo =
          await globalThis.backendaiclient.get_direct_access_info(
            sessionResponse.sessionId,
          );
        const host = directAccessInfo.public_host.replace(/^https?:\/\//, '');
        const port = directAccessInfo.sshd_ports;
        const event = new CustomEvent('read-ssh-key-and-launch-ssh-dialog', {
          detail: {
            sessionUuid: sessionResponse.sessionId,
            host: host,
            port: port,
            mounted: this.explorer.id,
          },
        });
        document.dispatchEvent(event);
        indicator.end(100);
      } catch (err) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
        indicator.end(100);
      }
    })();
  }

  _toggleSSHSessionButton() {
    const isSystemRoleSupported = this.systemRoleSupportedImages.length > 0;
    const sshImageIcon = this.shadowRoot?.querySelector('#ssh-img');
    const sshImageBtn = this.shadowRoot?.querySelector('#ssh-btn') as Button;
    if (sshImageIcon && sshImageBtn) {
      sshImageBtn.disabled = !isSystemRoleSupported;
      const filterClass = isSystemRoleSupported ? '' : 'apply-grayscale';
      sshImageIcon.setAttribute('class', filterClass);
    }
  }

  /**
   * Open the renameFileDialog to rename the file.
   *
   * @param {Event} e - click the edit icon button
   * @param {Boolean} is_dir - True when file is directory type
   * */
  _openRenameFileDialog(e, is_dir = false) {
    const fn = e.target.getAttribute('filename');
    (
      this.renameFileDialog.querySelector('#old-file-name') as HTMLDivElement
    ).textContent = fn;
    this.newFileNameInput.value = fn;
    // TODO define extended type for custom property
    this.renameFileDialog.filename = fn;
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
    const fn = this.renameFileDialog.filename;
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

      const job = globalThis.backendaiclient.vfolder.rename_file(
        path,
        newName,
        this.explorer.id,
        this.is_dir,
      );
      job
        .then((res) => {
          this.notification.text = _text('data.folders.FileRenamed');
          this.notification.show();
          this._clearExplorer();
          this.renameFileDialog.hide();
        })
        .catch((err) => {
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
    // TODO define extended type for custom property
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
    // TODO define extended type for custom property
    const files = this.deleteFileDialog.files;
    if (files.length > 0) {
      const filenames: string[] = [];
      files.forEach((file) => {
        const filename = this.explorer.breadcrumb
          .concat(file.filename)
          .join('/');
        filenames.push(filename);
      });
      const job = globalThis.backendaiclient.vfolder.delete_files(
        filenames,
        true,
        this.explorer.id,
      );
      job.then((res) => {
        this.notification.text =
          files.length == 1
            ? _text('data.folders.FileDeleted')
            : _text('data.folders.MultipleFilesDeleted');
        this.notification.show();
        this._clearExplorer();
        this.deleteFileDialog.hide();
      });
    } else {
      // TODO define extended type for custom property
      if (this.deleteFileDialog.filename != '') {
        const path = this.explorer.breadcrumb
          .concat(this.deleteFileDialog.filename)
          .join('/');
        const job = globalThis.backendaiclient.vfolder.delete_files(
          [path],
          true,
          this.explorer.id,
        );
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
    const job = globalThis.backendaiclient.vfolder.delete_files(
      [path],
      true,
      this.explorer.id,
    );
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
      currentResource.cpu =
        typeof currentResource.cpu === 'string'
          ? parseInt(currentResource['cpu'])
          : currentResource['cpu'];
      if (
        currentResource.cpu >= this.minimumResource.cpu &&
        currentResource.mem >= this.minimumResource.mem
      ) {
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
   * Return whether file is downloadable.
   * NOTE: For now, It's handled by storage host, not file itself.
   *
   * @param {Object} host
   * @return {boolean} true
   * */
  _isDownloadable(host) {
    return (this._unionedAllowedPermissionByVolume[host] ?? []).includes(
      'download-file',
    );
  }

  /**
   *
   * Initialize share-folder-dialog to the original layout
   *
   */
  _initializeSharingFolderDialogLayout() {
    const emailInputList = this.shadowRoot?.querySelectorAll<TextField>(
      '#share-folder-dialog mwc-textfield.share-email',
    ) as NodeListOf<TextField>;
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
    globalThis.backendaiclient.vfolder.list_invitees(vfolder_id).then((res) => {
      this.invitees = res.shared;
      this.modifyPermissionDialog.updateComplete.then(() => {
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
    const emailHtmlCollection = this.shadowRoot?.querySelectorAll(
      'mwc-textfield.share-email',
    ) as NodeListOf<TextField>;

    // filter invalid and empty fields
    const emailArray = Array.prototype.filter
      .call(emailHtmlCollection, (e) => e.isUiValid && e.value !== '')
      .map((e) => e.value.trim());
    const permission = (
      this.shadowRoot?.querySelector(
        'mwc-radio[name=share-folder-permission][checked]',
      ) as Radio
    ).value;

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
      rqstJob = globalThis.backendaiclient.vfolder.invite(
        permission,
        emailArray,
        this.selectedFolder,
      );
    } else {
      rqstJob = globalThis.backendaiclient.vfolder.share(
        permission,
        emailArray,
        this.selectedFolder,
      );
    }

    const getRqstFailedEmailList = (requestedEmailList, resultEmailList) => {
      return requestedEmailList.filter(
        (email) => !resultEmailList.includes(email),
      );
    };

    rqstJob
      .then((res) => {
        let msg;
        // FIXME:
        // we need to replace more proper word to distinguish folder sharing on user and group(project).
        // For now, invite means sharing `user` folder and share means sharing `group(project)` folder
        if (this.selectedFolderType === 'user') {
          if (res.invited_ids && res.invited_ids.length > 0) {
            msg = _text('data.invitation.Invited');
            const failedInvitingEmailList = getRqstFailedEmailList(
              emailArray,
              res.invited_ids,
            );
            if (failedInvitingEmailList.length > 0) {
              msg =
                _text('data.invitation.FolderSharingNotAvailableToUser') +
                failedInvitingEmailList.join(', ');
            }
          } else {
            msg = _text('data.invitation.NoOneWasInvited');
          }
        } else {
          if (res.shared_emails && res.shared_emails.length > 0) {
            msg = _text('data.invitation.Shared');
            const failedSharingEmailList = getRqstFailedEmailList(
              emailArray,
              res.shared_emails,
            );
            if (failedSharingEmailList.length > 0) {
              msg =
                _text('data.invitation.FolderSharingNotAvailableToUser') +
                failedSharingEmailList.join(', ');
            }
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
      })
      .catch((err) => {
        // if (this.selectedFolderType === 'user') {
        //   this.notification.text = _text('data.invitation.InvitationError');
        // } else {
        //   this.notification.text = _text('data.invitation.SharingError');
        // }
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.message);
          this.notification.detail = err.message;
        }
        this.notification.show();
      });
  }

  /**
   * Validate path name
   * */
  _validatePathName() {
    this.mkdirNameInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.mkdirNameInput.validationMessage = _text(
            'data.explorer.ValueRequired',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        } else {
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
      } else {
        // custom validation for path name using regex
        const regex =
          /^([^`~!@#$%^&*()|+=?;:'",<>{}[\]\r\n/]{1,})+(\/[^`~!@#$%^&*()|+=?;:'",<>{}[\]\r\n/]{1,})*([/,\\]{0,1})$/gm;
        let isValid = regex.test(this.mkdirNameInput.value);
        if (!isValid || this.mkdirNameInput.value === './') {
          this.mkdirNameInput.validationMessage = _text(
            'data.explorer.ValueShouldBeStarted',
          );
          isValid = false;
        }
        return {
          valid: isValid,
          customError: !isValid,
        };
      }
    };
  }

  /**
   * Restore folder. Change the folder status from `delete-pending` to `ready`.
   * */
  _restoreFolder(e) {
    const folderID = this._getControlID(e) || '';
    globalThis.backendaiclient.vfolder
      .restore_from_trash_bin(folderID)
      .then(async (resp) => {
        this.notification.text = _text('data.folders.FolderRestored', {
          folderName: this.deleteFolderName || '',
        });
        this.notification.show();
        await this.refreshFolderList();
      })
      .catch((err) => {
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  /**
   * Call `delete_from_trash_bin` API to delete the folder permanently.
   * */
  _deleteFromTrashBin() {
    const typedDeleteForeverFolderName = this.deleteFromTrashBinNameInput.value;
    if (typedDeleteForeverFolderName !== this.deleteFolderName) {
      this.notification.text = _text('data.folders.FolderNameMismatched');
      this.notification.show();
      return;
    }
    globalThis.backendaiclient.vfolder
      .delete_from_trash_bin(this.deleteFolderID)
      .then(async (resp) => {
        this.notification.text = _text('data.folders.FolderDeletedForever', {
          folderName: this.deleteFolderName || '',
        });
        this.notification.show();
        await this.refreshFolderList();
      })
      .catch((err) => {
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
    this.closeDialog('delete-from-trash-bin-dialog');
    this.deleteFromTrashBinNameInput.value = '';
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-storage-list': BackendAiStorageList;
  }
}
