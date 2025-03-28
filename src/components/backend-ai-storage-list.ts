/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { navigate } from '../backend-ai-app';
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
import '@material/mwc-formfield';
import '@material/mwc-icon-button';
import '@material/mwc-list';
import '@material/mwc-radio';
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
  @property({ type: String }) storageType = 'general';
  @property({ type: Array }) folders = [];
  @property({ type: Object }) folderInfo = Object();
  @property({ type: Boolean }) is_admin = false;
  @property({ type: Boolean }) enableStorageProxy = false;
  @property({ type: Boolean }) enableInferenceWorkload = false;
  @property({ type: Boolean }) enableVfolderTrashBin = false;
  @property({ type: Boolean }) authenticated = false;
  @property({ type: String }) renameFolderName = '';
  @property({ type: String }) renameFolderID = '';
  @property({ type: String }) deleteFolderName = '';
  @property({ type: String }) deleteFolderID = '';
  @property({ type: String }) leaveFolderName = '';
  @property({ type: String }) existingFile = '';
  @property({ type: Array }) invitees: inviteeData[] = [];
  @property({ type: String }) selectedFolder = '';
  @property({ type: String }) selectedFolderType = '';
  @property({ type: Object }) indicator = Object();
  @property({ type: Object }) notification = Object();
  @property({ type: String }) listCondition: StatusCondition = 'loading';
  @property({ type: Array }) allowed_folder_type = [];
  @property({ type: Object }) _boundTypeRenderer = Object();
  @property({ type: Object }) _boundFolderListRenderer = Object();
  @property({ type: Object }) _boundControlFolderListRenderer = Object();
  @property({ type: Object }) _boundTrashBinControlFolderListRenderer =
    Object();
  @property({ type: Object }) _boundPermissionViewRenderer = Object();
  @property({ type: Object }) _boundOwnerRenderer = Object();
  @property({ type: Object }) _boundPermissionRenderer = Object();
  @property({ type: Object }) _boundCloneableRenderer = Object();
  @property({ type: Object }) _boundQuotaRenderer = Object();
  @property({ type: Object }) _boundInviteeInfoRenderer = Object();
  @property({ type: Object }) _boundIDRenderer = Object();
  @property({ type: Object }) _boundStatusRenderer = Object();
  @property({ type: Boolean }) _folderRefreshing = false;
  @property({ type: Number }) lastQueryTime = 0;
  @property({ type: Object }) permissions = {
    rw: 'Read-Write',
    ro: 'Read-Only',
    wd: 'Delete',
  };
  @property({ type: Number }) selectAreaHeight;
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
  @query('#folder-list-grid') folderListGrid!: VaadinGrid;
  @query('#delete-folder-name') deleteFolderNameInput!: TextField;
  @query('#delete-from-trash-bin-name-input')
  deleteFromTrashBinNameInput!: TextField;
  @query('#new-folder-name') newFolderNameInput!: TextField;
  @query('#leave-folder-name') leaveFolderNameInput!: TextField;
  @query('#update-folder-permission') updateFolderPermissionSelect!: Select;
  @query('#update-folder-cloneable') updateFolderCloneableSwitch!: Switch;
  @query('#share-folder-dialog') shareFolderDialog!: BackendAIDialog;
  @query('#session-launcher') sessionLauncher!: BackendAiSessionLauncher;
  @state() private _unionedAllowedPermissionByVolume = Object();
  constructor() {
    super();
    this._boundTypeRenderer = this.typeRenderer.bind(this);
    this._boundControlFolderListRenderer =
      this.controlFolderListRenderer.bind(this);
    this._boundTrashBinControlFolderListRenderer =
      this.trashBinControlFolderListRenderer.bind(this);
    this._boundPermissionViewRenderer = this.permissionViewRenderer.bind(this);
    this._boundCloneableRenderer = this.CloneableRenderer.bind(this);
    this._boundOwnerRenderer = this.OwnerRenderer.bind(this);
    this._boundPermissionRenderer = this.permissionRenderer.bind(this);
    this._boundFolderListRenderer = this.folderListRenderer.bind(this);
    this._boundQuotaRenderer = this.quotaRenderer.bind(this);
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

        vaadin-text-field {
          --vaadin-text-field-default-width: auto;
        }

        vaadin-grid-cell-content {
          overflow: visible;
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

        @media screen and (max-width: 750px) {
          mwc-button {
            width: auto;
          }
          mwc-button > span {
            display: none;
          }
        }
      `,
    ];
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
        <span slot="title">${_t('data.explorer.RenameAFolder')}</span>
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
            validationMessage="${_t('data.AllowsLettersNumbersAnd-_Dot')}"
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
      <backend-ai-dialog id="delete-folder-without-confirm-dialog">
        <span slot="title">${_t('data.folders.MoveToTrash')}</span>
        <div slot="content">
          <div>
            ${_t('data.folders.MoveToTrashDescription', {
              folderName: this.deleteFolderName || '',
            })}
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            raised
            fullwidth
            class="warning fg red"
            type="submit"
            icon="delete"
            id="delete-without-confirm-button"
            @click="${() => {
              this._deleteFolder(this.deleteFolderID);
              this.closeDialog('delete-folder-without-confirm-dialog');
            }}"
          >
            ${_t('data.folders.MoveToTrash')}
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
    document.addEventListener('backend-ai-folder-created', (e) =>
      this._refreshFolderList(true, 'folder-updated'),
    );
    document.addEventListener('backend-ai-folder-updated', (e) =>
      this._refreshFolderList(true, 'folder-updated'),
    );
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
    const page = url !== '' ? url : 'start';
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
          <mwc-list-item value="kickout">
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
                  class="fg blue controls-running"
                  icon="share"
                  @click=${(e) =>
                    this._showPermissionSettingModal(rowData.item.id)}
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
                  text="${_t('data.folders.MoveToTrash')}"
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
          this.directoryBasedUsage =
            globalThis.backendaiclient._config.directoryBasedUsage &&
            !globalThis.backendaiclient.supports(
              'deprecated-max-quota-scope-in-keypair-resource-policy',
            );
          this._getAllowedVFolderHostsByCurrentUserInfo();
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
      this.directoryBasedUsage =
        globalThis.backendaiclient._config.directoryBasedUsage &&
        !globalThis.backendaiclient.supports(
          'deprecated-max-quota-scope-in-keypair-resource-policy',
        );
      this._getAllowedVFolderHostsByCurrentUserInfo();
      this._refreshFolderList(false, 'viewStatechanged');
    }
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
    const folder = globalThis.backendaiclient.supports('vfolder-id-based')
      ? this._getControlID(e)
      : this._getControlName(e);
    const job = globalThis.backendaiclient.vfolder.info(folder);
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
    globalThis.backendaiclient.vfolder.name =
      globalThis.backendaiclient.supports('vfolder-id-based')
        ? this._getControlID(e)
        : this._getControlName(e);
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
    globalThis.backendaiclient.vfolder.id = this.renameFolderID;
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
    this.renameFolderID = globalThis.backendaiclient.supports(
      'vfolder-id-based',
    )
      ? this._getControlID(e)
      : this._getControlName(e);
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
      // this._deleteFolder(this.deleteFolderID);
      this.openDialog('delete-folder-without-confirm-dialog');
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
            'data.AllowsLettersNumbersAnd-_Dot',
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
            'data.AllowsLettersNumbersAnd-_Dot',
          );
        }
        return {
          valid: isValid,
          customError: !isValid,
        };
      }
    };
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
    this.selectedFolder = globalThis.backendaiclient.supports(
      'vfolder-id-based',
    )
      ? this._getControlID(e)
      : this._getControlName(e);
    this.selectedFolderType = this._getControlType(e);
    this._initializeSharingFolderDialogLayout();
    this.openDialog('share-folder-dialog');
  }

  _showPermissionSettingModal(vfolderId) {
    const event = new CustomEvent('show-invite-folder-permission-setting', {
      detail: vfolderId,
      bubbles: true,
    });
    document.dispatchEvent(event);
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
