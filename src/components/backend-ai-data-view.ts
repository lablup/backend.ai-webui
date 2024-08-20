/**
 @license
 Copyright (c) 2015-2024 Lablup Inc. All rights reserved.
 */
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './backend-ai-storage-list';
import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list-item';
import { Select } from '@material/mwc-select';
import '@material/mwc-switch';
import { Switch } from '@material/mwc-switch';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';
import { TextField } from '@material/mwc-textfield';
import { css, CSSResultGroup, html } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];
type BackendAIStorageList = HTMLElementTagNameMap['backend-ai-storage-list'];
interface GroupData {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  modified_at: string;
  domain_name: string;
  type?: string;
}
/**
 Backend.AI Data View

 Example:

 <backend-ai-data-view class="page" name="data" ?active="${0}">
 ... content ...
 </backend-ai-data-view>

@group Backend.AI Web UI
 @element backend-ai-data-view
 */

@customElement('backend-ai-data-view')
export default class BackendAIData extends BackendAIPage {
  @property({ type: String }) apiMajorVersion = '';
  @property({ type: String }) folderListFetchKey = 'first';
  @property({ type: Boolean }) is_admin = false;
  @property({ type: Boolean }) enableStorageProxy = false;
  @property({ type: Boolean }) enableInferenceWorkload = false;
  @property({ type: Boolean }) enableModelStore = false;
  @property({ type: Boolean }) supportVFolderTrashBin = false;
  @property({ type: Boolean }) authenticated = false;
  @property({ type: String }) vhost = '';
  @property({ type: String }) selectedVhost = '';
  @property({ type: Array }) vhosts = [];
  @property({ type: Array }) usageModes = ['General'];
  @property({ type: Array }) permissions = [
    'Read-Write',
    'Read-Only',
    'Delete',
  ];
  @property({ type: Array }) allowedGroups: GroupData[] = [];
  @property({ type: Array }) allowedModelTypeGroups: GroupData[] = [];
  @property({ type: Array }) groupListByUsage: GroupData[] = [];
  @property({ type: Array }) generalTypeGroups: GroupData[] = [];
  @property({ type: Array }) allowed_folder_type: string[] = [];
  @property({ type: Object }) notification = Object();
  @property({ type: Object }) folderLists = Object();
  @property({ type: String }) _status = 'inactive';
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Boolean }) _vfolderInnatePermissionSupport = false;
  @property({ type: Object }) storageInfo = Object();
  @property({ type: String }) _activeTab = 'general';
  @property({ type: String }) _helpDescription = '';
  @property({ type: String }) _helpDescriptionTitle = '';
  @property({ type: String }) _helpDescriptionIcon = '';
  @property({ type: Object }) _helpDescriptionStorageProxyInfo = Object();
  @property({ type: Object }) options;
  @property({ type: Number }) capacity;
  @property({ type: String }) cloneFolderName = '';
  @property({ type: Object }) storageProxyInfo = Object();
  @property({ type: String }) folderType = 'user';
  @property({ type: Number }) currentGroupIdx = 0;
  @query('#add-folder-name') addFolderNameInput!: TextField;
  @query('#clone-folder-name') cloneFolderNameInput!: TextField;
  @query('#add-folder-usage-mode') addFolderUsageModeSelect!: Select;
  @query('#add-folder-group') addFolderGroupSelect!: Select;
  @query('#add-folder-type') addFolderTypeSelect!: Select;
  @query('#cloneable-container') cloneableContainer!: HTMLDivElement;
  @query('#general-folder-storage')
  generalFolderStorageListElement!: BackendAIStorageList;
  @query('#data-folder-storage')
  dataFolderStorageListElement!: BackendAIStorageList;
  @query('#automount-folder-storage')
  automountFolderStorageListElement!: BackendAIStorageList;
  @query('#model-folder-storage')
  modelFolderStorageListElement!: BackendAIStorageList;
  @query('#trash-bin-folder-storage')
  trashBinFolderStorageListElement!: BackendAIStorageList;

  static get styles(): CSSResultGroup {
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

        .tab-content {
          border: 0;
          font-size: 14px;
        }

        mwc-textfield {
          width: 100%;
          --mdc-text-field-fill-color: transparent;
        }

        mwc-textfield.red {
          --mdc-theme-primary: var(--paper-red-400) !important;
        }

        #add-folder-dialog,
        #clone-folder-dialog {
          --component-width: 375px;
        }

        #help-description {
          --component-width: 350px;
        }

        mwc-select {
          width: 50%;
          margin-bottom: 10px;
          /* Need to be set when fixedMenuPosition attribute is enabled */
          --mdc-menu-max-width: 345px;
          --mdc-menu-min-width: 172.5px;
          --mdc-select-max-width: 345px;
          --mdc-select-min-width: 172.5px;
        }

        mwc-select.full-width.fixed-position {
          width: 100%;
          /* Need to be set when fixedMenuPosition attribute is enabled */
          --mdc-menu-max-width: 345px;
          --mdc-menu-min-width: 345px;
          --mdc-select-max-width: 345px;
          --mdc-select-min-width: 345px;
        }

        mwc-select.fixed-position {
          /* Need to be set when fixedMenuPosition attribute is enabled */
          --mdc-menu-max-width: 172.5px;
          --mdc-menu-min-width: 172.5px;
          --mdc-select-max-width: 172.5px;
          --mdc-select-min-width: 172.5px;
        }

        mwc-select mwc-icon-button {
          --mdc-icon-button-size: 24px;
          color: var(--general-textfield-selected-color);
        }

        #help-description {
          --dialog-width: 350px;
        }

        #help-description p {
          padding: 5px !important;
        }

        .storage-status-indicator {
          width: 90px;
          color: black;
        }

        div.big {
          font-size: 72px;
        }

        .storage-chart-wrapper {
          margin: 20px 50px 0px 50px;
        }

        h4#default-quota-unit {
          display: none;
        }

        @media screen and (max-width: 750px) {
          mwc-tab {
            --mdc-typography-button-font-size: 10px;
          }

          mwc-button > span {
            display: none;
          }
        }

        .host-status-indicator {
          height: 16px;
          padding-left: 8px;
          padding-right: 8px;
          border-radius: 8px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .host-status-indicator.adequate {
          background-color: rgba(58, 178, 97, 1);
        }

        .host-status-indicator.caution {
          background-color: rgb(223, 179, 23);
        }

        .host-status-indicator.insufficient {
          background-color: #ef5350;
        }
      `,
    ];
  }

  renderStatusIndicator(percentage: number, showTitle: boolean) {
    const idx = percentage < 70 ? 0 : percentage < 90 ? 1 : 2;
    const type = ['Adequate', 'Caution', 'Insufficient'][idx];
    const title = [
      _t('data.usage.Adequate'),
      _t('data.usage.Caution'),
      _t('data.usage.Insufficient'),
    ][idx];
    return html`
      <div
        class="host-status-indicator ${type.toLocaleLowerCase()} self-center"
      >
        ${showTitle ? title : ''}
      </div>
    `;
  }
  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <div class="vertical layout">
        <div>
          <div slot="message">
            <div
              style="display: ${this._activeTab === 'general'
                ? 'block'
                : 'none'};"
            >
              <backend-ai-storage-list
                id="general-folder-storage"
                storageType="general"
                ?active="${this.active === true &&
                this._activeTab === 'general'}"
              ></backend-ai-storage-list>
            </div>
            <div
              style="display: ${this._activeTab === 'data' ? 'block' : 'none'};"
            >
              <backend-ai-storage-list
                id="data-folder-storage"
                storageType="data"
                ?active="${this.active === true && this._activeTab === 'data'}"
              ></backend-ai-storage-list>
            </div>
            <div
              style="display: ${this._activeTab === 'automount'
                ? 'block'
                : 'none'};"
            >
              <backend-ai-storage-list
                id="automount-folder-storage"
                storageType="automount"
                ?active="${this.active === true &&
                this._activeTab === 'automount'}"
              ></backend-ai-storage-list>
            </div>
            ${this.enableInferenceWorkload
              ? html`
                  <div
                    style="display: ${this._activeTab === 'model'
                      ? 'block'
                      : 'none'};"
                  >
                    <backend-ai-storage-list
                      id="model-folder-storage"
                      storageType="model"
                      ?active="${this.active === true &&
                      this._activeTab === 'model'}"
                    ></backend-ai-storage-list>
                  </div>
                `
              : html``}
            ${this.enableModelStore
              ? html`
                  <backend-ai-react-model-store-list
                    id="model-store-folder-lists"
                    class="tab-content"
                    style="display:none;"
                    ?active="${this.active === true &&
                    this._activeTab === 'modelStore'}"
                  ></backend-ai-react-model-store-list>
                `
              : html``}
            ${this.supportVFolderTrashBin
              ? html`
                  <div
                    style="display: ${this._activeTab === 'trash-bin'
                      ? 'block'
                      : 'none'};"
                  >
                    <backend-ai-storage-list
                      id="trash-bin-folder-storage"
                      storageType="deadVFolderStatus"
                      ?active="${this.active === true &&
                      this._activeTab === 'trash-bin'}"
                    ></backend-ai-storage-list>
                  </div>
                `
              : html``}
          </div>
        </div>
      </div>
      <backend-ai-dialog id="add-folder-dialog" fixed backdrop>
        <span slot="title">${_t('data.CreateANewStorageFolder')}</span>
        <div slot="content" class="vertical layout flex">
          <mwc-textfield
            id="add-folder-name"
            label="${_t('data.Foldername')}"
            @change="${() => this._validateFolderName()}"
            pattern="^[a-zA-Z0-9._-]*$"
            required
            validationMessage="${_t('data.Allowslettersnumbersand-_dot')}"
            maxLength="64"
            placeholder="${_t('maxLength.64chars')}"
          ></mwc-textfield>
          <mwc-select
            class="full-width fixed-position"
            id="add-folder-host"
            label="${_t('data.Host')}"
            fixedMenuPosition
            @selected=${(e) => (this.selectedVhost = e.target.value)}
          >
            ${this.vhosts.map((item) => {
              const percentage =
                this.storageProxyInfo[item] &&
                this.storageProxyInfo[item]?.usage &&
                this.storageProxyInfo[item]?.usage?.percentage;
              return html`
                <mwc-list-item
                  hasMeta
                  .value="${item}"
                  ?selected="${item === this.vhost}"
                >
                  <div class="horizontal layout justified center">
                    <span>${item}</span>
                    ${html`
                      &nbsp;
                      ${typeof percentage === 'number'
                        ? this.renderStatusIndicator(percentage, false)
                        : ''}
                    `}
                  </div>
                  <mwc-icon-button
                    slot="meta"
                    icon="info"
                    @click="${(e) => this._showStorageDescription(e, item)}"
                  ></mwc-icon-button>
                </mwc-list-item>
              `;
            })}
          </mwc-select>
          <div
            class="horizontal layout start"
            style="margin-top:-5px;margin-bottom:10px;padding-left:16px;font-size:12px;"
          >
            ${typeof this.storageProxyInfo[this.selectedVhost]?.usage
              ?.percentage == 'number'
              ? html`
                  ${_t(
                    'data.usage.StatusOfSelectedHost',
                  )}:&nbsp;${this.renderStatusIndicator(
                    this.storageProxyInfo[this.selectedVhost]?.usage
                      ?.percentage,
                    true,
                  )}
                `
              : html``}
          </div>
          <div class="horizontal layout">
            <mwc-select
              id="add-folder-type"
              label="${_t('data.Type')}"
              style="width:${!this.is_admin ||
              !this.allowed_folder_type.includes('group')
                ? '100%'
                : '50%'}"
              @change=${() => {
                this._toggleFolderTypeInput();
                this._toggleGroupSelect();
              }}
              required
            >
              ${this.allowed_folder_type.includes('user')
                ? html`
                    <mwc-list-item value="user" selected>
                      ${_t('data.User')}
                    </mwc-list-item>
                  `
                : html``}
              ${this.is_admin && this.allowed_folder_type.includes('group')
                ? html`
                    <mwc-list-item
                      value="group"
                      ?selected="${!this.allowed_folder_type.includes('user')}"
                    >
                      ${_t('data.Project')}
                    </mwc-list-item>
                  `
                : html``}
            </mwc-select>
            ${this.is_admin && this.allowed_folder_type.includes('group')
              ? html`
                  <mwc-select
                    class="fixed-position"
                    id="add-folder-group"
                    ?disabled=${this.folderType === 'user'}
                    label="${_t('data.Project')}"
                    FixedMenuPosition
                  >
                    ${this.groupListByUsage.map(
                      (item, idx) => html`
                        <mwc-list-item
                          value="${item.name}"
                          ?selected="${this.currentGroupIdx === idx}"
                        >
                          ${item.name}
                        </mwc-list-item>
                      `,
                    )}
                  </mwc-select>
                `
              : html``}
          </div>
          ${this._vfolderInnatePermissionSupport
            ? html`
                <div class="horizontal layout">
                  <mwc-select
                    class="fixed-position"
                    id="add-folder-usage-mode"
                    label="${_t('data.UsageMode')}"
                    fixedMenuPosition
                    @change=${() => {
                      this._toggleGroupSelect();
                    }}
                  >
                    ${this.usageModes.map(
                      (item, idx) => html`
                        <mwc-list-item value="${item}" ?selected="${idx === 0}">
                          ${item}
                        </mwc-list-item>
                      `,
                    )}
                  </mwc-select>
                  <mwc-select
                    class="fixed-position"
                    id="add-folder-permission"
                    label="${_t('data.Permission')}"
                    fixedMenuPosition
                  >
                    ${this.permissions.map(
                      (item, idx) => html`
                        <mwc-list-item value="${item}" ?selected="${idx === 0}">
                          ${item}
                        </mwc-list-item>
                      `,
                    )}
                  </mwc-select>
                </div>
              `
            : html``}
          ${this.enableStorageProxy
            ? html`
                <div
                  id="cloneable-container"
                  class="horizontal layout flex wrap center justified"
                  style="display:none;"
                >
                  <p style="margin-left:10px;">
                    ${_t('data.folders.Cloneable')}
                  </p>
                  <mwc-switch
                    id="add-folder-cloneable"
                    style="margin-right:10px;"
                  ></mwc-switch>
                </div>
              `
            : html``}
          <div style="font-size:11px;">
            ${_t('data.DialogFolderStartingWithDotAutomount')}
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex">
          <mwc-button
            unelevated
            fullwidth
            id="add-button"
            icon="rowing"
            label="${_t('data.Create')}"
            @click="${() => this._addFolder()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="clone-folder-dialog" fixed backdrop>
        <span slot="title">${_t('data.folders.CloneAFolder')}</span>
        <div slot="content" style="width:100%;">
          <mwc-textfield
            id="clone-folder-src"
            label="${_t('data.FolderToCopy')}"
            value="${this.cloneFolderName}"
            disabled
          ></mwc-textfield>
          <mwc-textfield
            id="clone-folder-name"
            label="${_t('data.Foldername')}"
            @change="${() => this._validateFolderName()}"
            pattern="^[a-zA-Z0-9._-]*$"
            required
            validationMessage="${_t('data.Allowslettersnumbersand-_dot')}"
            maxLength="64"
            placeholder="${_t('maxLength.64chars')}"
          ></mwc-textfield>
          <mwc-select
            class="full-width fixed-position"
            id="clone-folder-host"
            label="${_t('data.Host')}"
            fixedMenuPosition
          >
            ${this.vhosts.map(
              (item, idx) => html`
                <mwc-list-item hasMeta value="${item}" ?selected="${idx === 0}">
                  <span>${item}</span>
                  <mwc-icon-button
                    slot="meta"
                    icon="info"
                    @click="${(e) => this._showStorageDescription(e, item)}"
                  ></mwc-icon-button>
                </mwc-list-item>
              `,
            )}
          </mwc-select>
          <div class="horizontal layout">
            <mwc-select
              id="clone-folder-type"
              label="${_t('data.Type')}"
              style="width:${!this.is_admin ||
              !this.allowed_folder_type.includes('group')
                ? '100%'
                : '50%'}"
            >
              ${this.allowed_folder_type.includes('user')
                ? html`
                    <mwc-list-item value="user" selected>
                      ${_t('data.User')}
                    </mwc-list-item>
                  `
                : html``}
              ${this.is_admin && this.allowed_folder_type.includes('group')
                ? html`
                    <mwc-list-item
                      value="group"
                      ?selected="${!this.allowed_folder_type.includes('user')}"
                    >
                      ${_t('data.Project')}
                    </mwc-list-item>
                  `
                : html``}
            </mwc-select>
            ${this.is_admin && this.allowed_folder_type.includes('group')
              ? html`
                  <mwc-select
                    class="fixed-position"
                    id="clone-folder-group"
                    label="${_t('data.Project')}"
                    FixedMenuPosition
                  >
                    ${this.allowedGroups.map(
                      (item, idx) => html`
                        <mwc-list-item
                          value="${item.name}"
                          ?selected="${item.name ===
                          globalThis.backendaiclient.current_group}"
                        >
                          ${item.name}
                        </mwc-list-item>
                      `,
                    )}
                  </mwc-select>
                `
              : html``}
          </div>
          ${this._vfolderInnatePermissionSupport
            ? html`
                <div class="horizontal layout">
                  <mwc-select
                    class="fixed-position"
                    id="clone-folder-usage-mode"
                    label="${_t('data.UsageMode')}"
                    FixedMenuPosition
                  >
                    ${this.usageModes.map(
                      (item, idx) => html`
                        <mwc-list-item value="${item}" ?selected="${idx === 0}">
                          ${item}
                        </mwc-list-item>
                      `,
                    )}
                  </mwc-select>
                  <mwc-select
                    class="fixed-position"
                    id="clone-folder-permission"
                    label="${_t('data.Permission')}"
                    FixedMenuPosition
                  >
                    ${this.permissions.map(
                      (item, idx) => html`
                        <mwc-list-item value="${item}" ?selected="${idx === 0}">
                          ${item}
                        </mwc-list-item>
                      `,
                    )}
                  </mwc-select>
                </div>
              `
            : html``}
          ${this.enableStorageProxy
            ? html`
                <div class="horizontal layout flex wrap center justified">
                  <p style="color:rgba(0, 0, 0, 0.6);">
                    ${_t('data.folders.Cloneable')}
                  </p>
                  <mwc-switch
                    id="clone-folder-cloneable"
                    style="margin-right:10px;"
                  ></mwc-switch>
                </div>
              `
            : html``}
          <div style="font-size:11px;">
            ${_t('data.DialogFolderStartingWithDotAutomount')}
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex">
          <mwc-button
            unelevated
            fullwidth
            id="clone-button"
            icon="file_copy"
            label="${_t('data.Create')}"
            @click="${() => this._cloneFolder()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="help-description" fixed backdrop>
        <span slot="title">${this._helpDescriptionTitle}</span>
        <div slot="content" class="vertical layout">
          <div class="horizontal layout center">
            ${this._helpDescriptionIcon == ''
              ? html``
              : html`
                  <img
                    slot="graphic"
                    src="resources/icons/${this._helpDescriptionIcon}"
                    style="width:64px;height:64px;margin-right:10px;"
                  />
                `}
            <p style="font-size:14px;width:256px;">
              ${unsafeHTML(this._helpDescription)}
            </p>
          </div>
          ${this._helpDescriptionStorageProxyInfo?.usage?.percentage !==
          undefined
            ? html`
                <div class="vertical layout" style="padding-left:8px;">
                  <span><strong>${_t('data.usage.Status')}</strong></span>
                  <div class="horizontal layout">
                    ${this.renderStatusIndicator(
                      this._helpDescriptionStorageProxyInfo?.usage?.percentage,
                      true,
                    )}
                  </div>
                  (${Math.floor(
                    this._helpDescriptionStorageProxyInfo?.usage?.percentage,
                  )}%
                  ${_t('data.usage.used')}
                  ${this._helpDescriptionStorageProxyInfo?.usage?.total &&
                  this._helpDescriptionStorageProxyInfo?.usage?.used
                    ? html`
                        ,
                        ${globalThis.backendaiutils._humanReadableFileSize(
                          this._helpDescriptionStorageProxyInfo?.usage?.used,
                        )}
                        /
                        ${globalThis.backendaiutils._humanReadableFileSize(
                          this._helpDescriptionStorageProxyInfo?.usage?.total,
                        )}
                      `
                    : html``}
                  )
                </div>
              `
            : html``}
        </div>
      </backend-ai-dialog>
    `;
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.folderLists = this.shadowRoot?.querySelectorAll(
      'backend-ai-storage-list',
    );
    fetch('resources/storage_metadata.json')
      .then((response) => response.json())
      .then((json) => {
        const storageInfo = Object();
        for (const key in json.storageInfo) {
          if ({}.hasOwnProperty.call(json.storageInfo, key)) {
            storageInfo[key] = {};
            if ('name' in json.storageInfo[key]) {
              storageInfo[key].name = json.storageInfo[key].name;
            }
            if ('description' in json.storageInfo[key]) {
              storageInfo[key].description = json.storageInfo[key].description;
            } else {
              storageInfo[key].description = _text(
                'data.NoStorageDescriptionFound',
              );
            }
            if ('icon' in json.storageInfo[key]) {
              storageInfo[key].icon = json.storageInfo[key].icon;
            } else {
              storageInfo[key].icon = 'local.png';
            }
            if ('dialects' in json.storageInfo[key]) {
              json.storageInfo[key].dialects.forEach((item) => {
                storageInfo[item] = storageInfo[key];
              });
            }
          }
        }
        this.storageInfo = storageInfo;
      });
    this.options = {
      responsive: true,
      maintainAspectRatio: true,
      legend: {
        display: true,
        position: 'bottom',
        align: 'center',
        labels: {
          fontSize: 20,
          boxWidth: 10,
        },
      },
    };
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this._getStorageProxyInformation();
        },
        true,
      );
    } else {
      // already connected
      this._getStorageProxyInformation();
    }
    document.addEventListener('backend-ai-folder-list-changed', () => {
      this.folderListFetchKey = new Date().toISOString();
    });
    document.addEventListener('backend-ai-vfolder-cloning', (e: any) => {
      if (e.detail) {
        const selectedItems = e.detail;
        this.cloneFolderName = selectedItems.name;
        this._cloneFolderDialog();
      }
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.dispatchEvent(new CustomEvent('backend-ai-data-view:connected'));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.dispatchEvent(
      new CustomEvent('backend-ai-data-view:disconnected'),
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
      this.enableStorageProxy =
        globalThis.backendaiclient.supports('storage-proxy');
      this.enableInferenceWorkload =
        globalThis.backendaiclient.supports('inference-workload');
      this.enableModelStore =
        globalThis.backendaiclient.supports('model-store') &&
        globalThis.backendaiclient._config.enableModelStore;
      this.supportVFolderTrashBin =
        globalThis.backendaiclient.supports('vfolder-trash-bin');
      if (this.enableInferenceWorkload && !this.usageModes.includes('Model')) {
        this.usageModes.push('Model');
      }
      this.apiMajorVersion = globalThis.backendaiclient.APIMajorVersion;
      this._getStorageProxyInformation();
      if (
        globalThis.backendaiclient.isAPIVersionCompatibleWith('v4.20191215')
      ) {
        this._vfolderInnatePermissionSupport = true;
      }
      globalThis.backendaiclient.vfolder
        .list_allowed_types()
        .then((response) => {
          this.allowed_folder_type = response;
        });
    };

    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          _init();
        },
        true,
      );
    } else {
      _init();
    }
  }
  /*
  private async _getCurrentKeypairResourcePolicy() {
    const accessKey = globalThis.backendaiclient._config.accessKey;
    const res = await globalThis.backendaiclient.keypair.info(accessKey, ['resource_policy']);
    return res.keypair.resource_policy;
  }
*/
  _toggleFolderTypeInput() {
    this.folderType = this.addFolderTypeSelect.value;
  }

  /**
   * Returns original vhost name of the lowest usage folder that the user can access.
   * If the usage percentage of the vhost is empty, set auto select vhost to default folder.
   *
   * @param {Object} vhostInfo - Result of globalThis.backendaiclient.vfolder.list_hosts()
   * @return {string} - auto selected vhost name
   */
  _getAutoSelectedVhostName(vhostInfo) {
    const lowestPercentage = Math.min(
      ...Object.values(vhostInfo.volume_info).map(
        (item: any) => item?.usage?.percentage,
      ),
    );
    return (
      Object.keys(vhostInfo.volume_info).find(
        (key) =>
          vhostInfo.volume_info[key]?.usage?.percentage === lowestPercentage,
      ) ?? vhostInfo.default
    );
  }

  /**
   * Returns volume_info of the lowest usage folder that the user can access.
   * If the usage percentage of the vhost is empty, set auto select vhost to default folder.
   *
   * @param {Object} vhostInfo - Result of globalThis.backendaiclient.vfolder.list_hosts()
   * @return {Object} - volume_info of auto selected vhost
   */
  _getAutoSelectedVhostInfo(vhostInfo) {
    const lowestPercentage = Math.min(
      ...Object.values(vhostInfo.volume_info).map(
        (item: any) => item?.usage?.percentage,
      ),
    );
    return (
      Object.values(vhostInfo.volume_info).find(
        (item: any) => item?.usage?.percentage === lowestPercentage,
      ) ?? vhostInfo.volume_info[vhostInfo.default]
    );
  }

  async _getAutoSelectedVhostIncludedList() {
    const vhostInfo = await globalThis.backendaiclient.vfolder.list_hosts();
    if (vhostInfo.allowed.length > 1) {
      vhostInfo.allowed.unshift(
        `auto (${this._getAutoSelectedVhostName(vhostInfo)})`,
      );
      vhostInfo.volume_info[
        `auto (${this._getAutoSelectedVhostName(vhostInfo)})`
      ] = this._getAutoSelectedVhostInfo(vhostInfo);
    }
    return vhostInfo;
  }

  /**
   * Clone folder dialog.
   */
  async _cloneFolderDialog() {
    const vhostInfo = await this._getAutoSelectedVhostIncludedList();
    this.addFolderNameInput.value = ''; // reset folder name
    this.vhosts = vhostInfo.allowed;
    if (this.vhosts.length > 1) {
      this.vhost = this.selectedVhost = `auto (${this._getAutoSelectedVhostName(
        vhostInfo,
      )})`;
    } else {
      this.vhost = this.selectedVhost = vhostInfo.default;
    }
    if (this.allowed_folder_type.includes('group')) {
      const group_info = await globalThis.backendaiclient.group.list();
      this.allowedGroups = group_info.groups;
    }
    this.cloneFolderNameInput.value = await this._checkFolderNameAlreadyExists(
      this.cloneFolderName,
    );
    this.openDialog('clone-folder-dialog');
  }

  // This property is meant to be accessed outside of component.
  openAddFolderDialog = () => {
    return this._addFolderDialog();
  };

  /**
   * Add folder dialog.
   */
  async _addFolderDialog() {
    const vhostInfo = await this._getAutoSelectedVhostIncludedList();
    this.addFolderNameInput.value = ''; // reset folder name
    this.vhosts = vhostInfo.allowed;
    if (this.vhosts.length > 1) {
      this.vhost = this.selectedVhost = `auto (${this._getAutoSelectedVhostName(
        vhostInfo,
      )})`;
    } else {
      this.vhost = this.selectedVhost = vhostInfo.default;
    }
    if (this.allowed_folder_type.includes('group')) {
      const group_info = await globalThis.backendaiclient.group.list(
        undefined,
        undefined,
        undefined,
        ['GENERAL', 'MODEL_STORE'],
      );
      this.allowedModelTypeGroups = [];
      this.allowedGroups = [];

      group_info?.groups?.forEach((element) => {
        if (element.type === 'MODEL_STORE') {
          this.allowedModelTypeGroups.push(element);
        } else {
          this.allowedGroups.push(element);
        }
      });
      this._toggleGroupSelect();
    }
    this.openDialog('add-folder-dialog');
  }

  async _getStorageProxyInformation() {
    const vhostInfo = await this._getAutoSelectedVhostIncludedList();
    this.storageProxyInfo = vhostInfo.volume_info || {};
  }

  openDialog(id: string) {
    (this.shadowRoot?.querySelector('#' + id) as BackendAIDialog).show();
  }

  closeDialog(id: string) {
    (this.shadowRoot?.querySelector('#' + id) as BackendAIDialog).hide();
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
      this._helpDescriptionIcon = this.storageInfo[item].icon;
      this._helpDescription = this.storageInfo[item].description;
    } else {
      this._helpDescriptionTitle = item;
      this._helpDescriptionIcon = 'local.png';
      this._helpDescription = _text('data.NoStorageDescriptionFound');
    }

    this._helpDescriptionStorageProxyInfo = this.storageProxyInfo[item];
    const desc = this.shadowRoot?.querySelector(
      '#help-description',
    ) as BackendAIDialog;
    desc.show();
  }

  _indexFrom1(index) {
    return index + 1;
  }

  /**
   * toggle visibility of group select
   * - only disable when (folderType is not 'user') and folderUsageMode is not 'Model'
   */
  _toggleGroupSelect() {
    this.groupListByUsage =
      this.addFolderUsageModeSelect?.value !== 'Model'
        ? this.allowedGroups
        : [...this.allowedGroups, ...this.allowedModelTypeGroups];
    this.addFolderGroupSelect &&
      this.addFolderGroupSelect.layout(true).then(() => {
        if (this.groupListByUsage.length > 0) {
          this.currentGroupIdx = this.addFolderGroupSelect.items.findIndex(
            (item) => item.value === globalThis.backendaiclient.current_group,
          );
          this.currentGroupIdx =
            this.currentGroupIdx < 0 ? 0 : this.currentGroupIdx;
          // FIXME: manually set selected text to follow updated list-item
          (this.addFolderGroupSelect as any)
            .createAdapter()
            .setSelectedText(
              this.groupListByUsage[this.currentGroupIdx]['name'],
            );
        } else {
          this.addFolderGroupSelect.disabled = true;
        }
      });
    this._toggleCloneableSwitch();
  }

  /**
   * toggle visibility of cloneable switch
   * - only visible when only admin selected Model usage mode.
   */
  _toggleCloneableSwitch() {
    if (this.cloneableContainer) {
      if (this.addFolderUsageModeSelect?.value === 'Model' && this.is_admin) {
        this.cloneableContainer.style.display = 'flex';
      } else {
        this.cloneableContainer.style.display = 'none';
      }
    }
  }

  /**
   * Add folder with name, host, type, usage mode and permission.
   */
  _addFolder() {
    const name = this.addFolderNameInput.value;
    let host = (this.shadowRoot?.querySelector('#add-folder-host') as Select)
      .value;
    // Auto volume
    const pattern = /^auto \((.+)\)$/;
    const match = host.match(pattern);
    if (match) {
      host = match[1];
    }
    let ownershipType = this.addFolderTypeSelect.value;
    let group;
    const usageModeEl = this.addFolderUsageModeSelect;
    const permissionEl = this.shadowRoot?.querySelector(
      '#add-folder-permission',
    ) as Select;
    const cloneableEl = this.shadowRoot?.querySelector(
      '#add-folder-cloneable',
    ) as Switch;
    let usageMode = '';
    let permission = '';
    let cloneable = false;
    if (['user', 'group'].includes(ownershipType) === false) {
      ownershipType = 'user';
    }
    if (ownershipType === 'user') {
      group = '';
    } else {
      group = this.is_admin
        ? this.addFolderGroupSelect.value
        : globalThis.backendaiclient.current_group;
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
    if (cloneableEl) {
      cloneable = cloneableEl.selected;
    }
    this.addFolderNameInput.reportValidity();
    if (this.addFolderNameInput.checkValidity()) {
      const job = globalThis.backendaiclient.vfolder.create(
        name,
        host,
        group,
        usageMode,
        permission,
        cloneable,
      );
      job
        .then(() => {
          this.notification.text = _text('data.folders.FolderCreated');
          this.notification.show();
          this._refreshFolderList();
        })
        .catch((err) => {
          if (err && err.message) {
            this.notification.text = PainKiller.relieve(err.message);
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
   * Clone VFolder
   */
  async _cloneFolder() {
    const name = await this._checkFolderNameAlreadyExists(
      this.cloneFolderNameInput.value,
      true,
    );
    let host = (this.shadowRoot?.querySelector('#clone-folder-host') as Select)
      .value;
    // Auto volume
    const pattern = /^auto \((.+)\)$/;
    const match = host.match(pattern);
    if (match) {
      host = match[1];
    }
    let ownershipType = (
      this.shadowRoot?.querySelector('#clone-folder-type') as Select
    ).value;
    const usageModeEl = this.shadowRoot?.querySelector<Select>(
      '#clone-folder-usage-mode',
    );
    const permissionEl = this.shadowRoot?.querySelector<Select>(
      '#clone-folder-permission',
    );
    const cloneableEl = this.shadowRoot?.querySelector<Switch>(
      '#clone-folder-cloneable',
    );
    let usageMode = '';
    let permission = '';
    let cloneable = false;
    if (['user', 'group'].includes(ownershipType) === false) {
      ownershipType = 'user';
    }
    // let group;
    // if (ownershipType === 'user') {
    //   group = '';
    // } else {
    //   group = this.is_admin ? this.shadowRoot.querySelector('#add-folder-group').value : globalThis.backendaiclient.current_group;
    // }
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
    cloneable = cloneableEl ? cloneableEl.selected : false;
    this.cloneFolderNameInput.reportValidity();
    if (this.cloneFolderNameInput.checkValidity()) {
      const input = {
        cloneable: cloneable,
        permission: permission,
        target_host: host,
        target_name: name,
        usage_mode: usageMode,
      };
      const job = globalThis.backendaiclient.vfolder.clone(
        input,
        this.cloneFolderName,
      );
      job
        .then(() => {
          this.notification.text = _text('data.folders.FolderCloned');
          this.notification.show();
          this._refreshFolderList();
        })
        .catch((err) => {
          if (err && err.message) {
            this.notification.text = PainKiller.relieve(err.message);
            this.notification.detail = err.message;
            this.notification.show(true, err);
          }
        });
      this.closeDialog('clone-folder-dialog');
    } else {
      return;
    }
  }

  /**
   * Validate folder name.
   */
  _validateFolderName() {
    this.addFolderNameInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.addFolderNameInput.validationMessage = _text(
            'data.FolderNameRequired',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        } else {
          this.addFolderNameInput.validationMessage = _text(
            'data.Allowslettersnumbersand-_dot',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
      } else {
        // custom validation for folder name using regex
        const regex = /[`~!@#$%^&*()|+=?;:'",<>{}[\]\\/\s]/gi;
        let isValid = !regex.test(this.addFolderNameInput.value);
        if (!isValid) {
          this.addFolderNameInput.validationMessage = _text(
            'data.Allowslettersnumbersand-_dot',
          );
        }
        if (this.addFolderNameInput.value.length > 64) {
          isValid = false;
          this.addFolderNameInput.validationMessage = _text(
            'data.FolderNameTooLong',
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
   * Refresh the folder list.
   */
  _refreshFolderList() {
    // Send notification to folder objects
    for (const list of this.folderLists) {
      list.refreshFolderList();
    }
  }

  async _checkFolderNameAlreadyExists(name, showMessage = false) {
    const groupId = globalThis.backendaiclient.current_group_id();
    const folderList = await globalThis.backendaiclient.vfolder.list(groupId);
    const folders = folderList.map((value) => value.name);
    if (folders.includes(name)) {
      if (showMessage) {
        this.notification.text = _text('import.FolderAlreadyExists');
        this.notification.show();
      }
      let i = 1;
      let newName: string = name;
      while (folders.includes(newName)) {
        newName = name + '_' + i;
        i++;
      }
      name = newName;
    }
    return name;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-data-view': BackendAIData;
  }
}
