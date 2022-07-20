/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import {unsafeHTML} from 'lit/directives/unsafe-html.js';

import {BackendAIPage} from './backend-ai-page';

import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list-item';
import {Select} from '@material/mwc-select';
import {Switch} from '@material/mwc-switch';
import '@material/mwc-tab/mwc-tab';
import '@material/mwc-tab-bar/mwc-tab-bar';
import {TextField} from '@material/mwc-textfield';

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

import '../plastics/lablup-shields/lablup-shields';
import '../plastics/chart-js';
import './backend-ai-dialog';
import './backend-ai-storage-list';
import './lablup-activity-panel';
import './lablup-loading-spinner';

import {default as PainKiller} from './backend-ai-painkiller';

import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment, IronPositioning} from '../plastics/layout/iron-flex-layout-classes';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];

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
  @property({type: String}) apiMajorVersion = '';
  @property({type: Object}) folders = Object();
  @property({type: Object}) folderInfo = Object();
  @property({type: Boolean}) is_admin = false;
  @property({type: Boolean}) enableStorageProxy = false;
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
  @property({type: String}) _activeTab = 'general';
  @property({type: String}) _helpDescription = '';
  @property({type: String}) _helpDescriptionTitle = '';
  @property({type: String}) _helpDescriptionIcon = '';
  @property({type: Object}) options;
  @property({type: Number}) createdCount;
  @property({type: Number}) invitedCount;
  @property({type: Number}) totalCount;
  @property({type: Number}) capacity;
  @property({type: String}) cloneFolderName = '';
  @property({type: Array}) quotaSupportStorageBackends = ['xfs', 'weka'];
  @property({type: Object}) storageProxyInfo = Object();
  @query('#add-folder-name') addFolderNameInput!: TextField;
  @query('#clone-folder-name') cloneFolderNameInput!: TextField;

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

        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0px 0px;
          margin: 0px auto;
        }

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
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

        #add-folder-dialog,
        #clone-folder-dialog {
          --component-width: 375px;
        }

        backend-ai-dialog wl-textfield,
        backend-ai-dialog wl-select {
          --input-font-family: var(--general-font-family);
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
          --label-font-family: 'Ubuntu', Roboto;
          --label-color: black;
        }

        mwc-select {
          width: 50%;
          margin-bottom: 10px;
          --mdc-theme-primary: var(--general-textfield-selected-color);
          --mdc-select-fill-color: transparent;
          --mdc-select-label-ink-color: rgba(0, 0, 0, 0.75);
          --mdc-select-dropdown-icon-color: var(--general-textfield-selected-color);
          --mdc-select-hover-line-color: var(--general-textfield-selected-color);
          --mdc-list-vertical-padding: 5px;
        }

        mwc-select.full-width {
          width: 100%;
        }

        mwc-select.full-width.fixed-position > mwc-list-item {
          width: 314px; // default width
        }

        mwc-select.fixed-position > mwc-list-item {
          width: 140px; // default width
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

        #automount-folder-lists > div {
          background-color: white;
          color: var(--general-textfield-selected-color);
          border-bottom:0.5px solid var(--general-textfield-selected-color);
        }

        #automount-folder-lists > div > p {
          color: var(--general-sidebar-color);
          margin-left: 10px;
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
          display:none;
        }

        @media screen and (max-width: 750px) {
          mwc-tab {
            --mdc-typography-button-font-size: 10px;
          }

          mwc-button > span {
            display: none;
          }
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <div class="vertical layout">
        <lablup-activity-panel elevation="1" narrow title=${_t('data.StorageStatus')} autowidth>
          <div slot="message">
            <div class="horizontal layout wrap flex center center-justified">
              <div class="storage-chart-wrapper">
                <chart-js id="storage-status" type="doughnut" .data="${this.folders}" .options="${this.options}" height="250" width="250"></chart-js>
              </div>
              <div class="horizontal layout justified">
                <div class="vertical layout center storage-status-indicator">
                  <div class="big">${this.createdCount}</div>
                  <span>${_t('data.Created')}</span>
                </div>
                <div class="vertical layout center storage-status-indicator">
                  <div class="big">${this.invitedCount}</div>
                  <span>${_t('data.Invited')}</span>
                </div>
                <div class="vertical layout center storage-status-indicator">
                  <div class="big">${this.capacity}</div>
                  <span>${_t('data.Capacity')}</span>
                </div>
              </div>
            </div>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel elevation="1" noheader narrow autowidth>
          <div slot="message">
            <h3 class="horizontal center flex layout tab">
              <mwc-tab-bar>
                <mwc-tab title="general" label="${_t('data.Folders')}"
                    @click="${(e) => this._showTab(e.target)}">
                </mwc-tab>
                <mwc-tab title="automount" label="${_t('data.AutomountFolders')}" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              </mwc-tab-bar>
              <span class="flex"></span>
              <mwc-button dense raised id="add-folder" icon="add" @click="${() => this._addFolderDialog()}" style="margin-right:15px;">
                <span>${_t('data.NewFolder')}</span>
              </mwc-button>
            </h3>
            <div id="general-folder-lists" class="tab-content">
              <backend-ai-storage-list id="general-folder-storage" storageType="general" ?active="${this.active === true && this._activeTab === 'general'}"></backend-ai-storage-list>
            </div>
            <div id="automount-folder-lists" class="tab-content" style="display:none;">
              <div class="horizontal layout">
                <p>${_t('data.DialogFolderStartingWithDotAutomount')}</p>
              </div>
              <backend-ai-storage-list id="automount-folder-storage" storageType="automount" ?active="${this.active === true && this._activeTab === 'automount'}"></backend-ai-storage-list>
            </div>
          </div>
        </lablup-activity-panel>
      </div>
      <backend-ai-dialog id="add-folder-dialog" fixed backdrop>
        <span slot="title">${_t('data.CreateANewStorageFolder')}</span>
        <div slot="content" class="vertical layout flex">
          <mwc-textfield id="add-folder-name" label="${_t('data.Foldername')}"
          @change="${() => this._validateFolderName()}" pattern="^[a-zA-Z0-9\._-]*$"
            required validationMessage="${_t('data.Allowslettersnumbersand-_dot')}" maxLength="64"
            placeholder="${_t('maxLength.64chars')}"></mwc-textfield>
          <mwc-select class="full-width fixed-position" id="add-folder-host" label="${_t('data.Host')}" fixedMenuPosition>
            ${this.vhosts.map((item, idx) => html`
              <mwc-list-item hasMeta value="${item}" ?selected="${item === this.vhost}">
                <span>${item}</span>
                <mwc-icon-button slot="meta" icon="info"
                    @click="${(e) => this._showStorageDescription(e, item)}">
                </mwc-icon-button>
              </mwc-list-item>
            `)}
          </mwc-select>
          <div class="horizontal layout">
            <mwc-select id="add-folder-type" label="${_t('data.Type')}"
                        style="width:${(!this.is_admin || !(this.allowed_folder_type as string[]).includes('group')) ? '100%': '50%'}">
              ${(this.allowed_folder_type as string[]).includes('user') ? html`
                <mwc-list-item value="user" selected>${_t('data.User')}</mwc-list-item>
              ` : html``}
              ${this.is_admin && (this.allowed_folder_type as string[]).includes('group') ? html`
                <mwc-list-item value="group" ?selected="${!(this.allowed_folder_type as string[]).includes('user')}">${_t('data.Project')}</mwc-list-item>
              ` : html``}
            </mwc-select>
            ${this.is_admin && (this.allowed_folder_type as string[]).includes('group') ? html`
              <mwc-select class="fixed-position" id="add-folder-group" label="${_t('data.Project')}" FixedMenuPosition>
                ${(this.allowedGroups as any).map((item, idx) => html`
                  <mwc-list-item value="${item.name}" ?selected="${idx === 0}">${item.name}</mwc-list-item>
                `)}
              </mwc-select>
            </div>
          ` : html``}
          </div>
          ${this._vfolderInnatePermissionSupport ? html`
            <div class="horizontal layout">
              <mwc-select class="fixed-position" id="add-folder-usage-mode" label="${_t('data.UsageMode')}" fixedMenuPosition>
                ${this.usageModes.map((item, idx) => html`
                  <mwc-list-item value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>
                `)}
              </mwc-select>
              <mwc-select class="fixed-position" id="add-folder-permission" label="${_t('data.Permission')}" fixedMenuPosition>
                ${this.permissions.map((item, idx) => html`
                  <mwc-list-item value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>
                `)}
              </mwc-select>
            </div>
          ` : html``}
          ${this.enableStorageProxy ?
    html`
          <!--<div class="horizontal layout flex wrap center justified">
              <p style="color:rgba(0, 0, 0, 0.6);">
                ${_t('data.folders.Cloneable')}
              </p>
              <mwc-switch id="add-folder-cloneable" style="margin-right:10px;">
              </mwc-switch>
            </div>-->
            ` : html``}
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
              @click="${() => this._addFolder()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="clone-folder-dialog" fixed backdrop>
        <span slot="title">${_t('data.folders.CloneAFolder')}</span>
        <div slot="content" style="width:100%;">
          <mwc-textfield id="clone-folder-src" label="${_t('data.FolderToCopy')}" value="${this.cloneFolderName}"
              disabled></mwc-textfield>
          <mwc-textfield id="clone-folder-name" label="${_t('data.Foldername')}"
              @change="${() => this._validateFolderName()}" pattern="^[a-zA-Z0-9\._-]*$"
              required validationMessage="${_t('data.Allowslettersnumbersand-_dot')}" maxLength="64"
              placeholder="${_t('maxLength.64chars')}"></mwc-textfield>
          <mwc-select class="full-width fixed-position" id="clone-folder-host" label="${_t('data.Host')}" fixedMenuPosition>
            ${this.vhosts.map((item, idx) => html`
              <mwc-list-item hasMeta value="${item}" ?selected="${idx === 0}">
                <span>${item}</span>
                <mwc-icon-button slot="meta" icon="info"
                    @click="${(e) => this._showStorageDescription(e, item)}">
                </mwc-icon-button>
              </mwc-list-item>
            `)}
          </mwc-select>
          <div class="horizontal layout">
            <mwc-select id="clone-folder-type" label="${_t('data.Type')}"
                        style="width:${(!this.is_admin || !(this.allowed_folder_type as string[]).includes('group')) ? '100%': '50%'}">
              ${(this.allowed_folder_type as string[]).includes('user') ? html`
                <mwc-list-item value="user" selected>${_t('data.User')}</mwc-list-item>
              ` : html``}
              ${this.is_admin && (this.allowed_folder_type as string[]).includes('group') ? html`
                <mwc-list-item value="group" ?selected="${!(this.allowed_folder_type as string[]).includes('user')}">${_t('data.Project')}</mwc-list-item>
              ` : html``}
            </mwc-select>
            ${this.is_admin && (this.allowed_folder_type as string[]).includes('group') ? html`
                <mwc-select class="fixed-position" id="clone-folder-group" label="${_t('data.Project')}" FixedMenuPosition>
                  ${(this.allowedGroups as any).map((item, idx) => html`
                    <mwc-list-item value="${item.name}" ?selected="${idx === 0}">${item.name}</mwc-list-item>
                  `)}
                </mwc-select>
            ` : html``}
          </div>
          ${this._vfolderInnatePermissionSupport ? html`
            <div class="horizontal layout">
              <mwc-select class="fixed-position" id="clone-folder-usage-mode" label="${_t('data.UsageMode')}" FixedMenuPosition>
                ${this.usageModes.map((item, idx) => html`
                  <mwc-list-item value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>
                `)}
              </mwc-select>
              <mwc-select class="fixed-position" id="clone-folder-permission" label="${_t('data.Permission')}" FixedMenuPosition>
                ${this.permissions.map((item, idx) => html`
                  <mwc-list-item value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>
                `)}
              </mwc-select>
            </div>
          ` : html``}
          ${this.enableStorageProxy ?
    html`
          <div class="horizontal layout flex wrap center justified">
              <p style="color:rgba(0, 0, 0, 0.6);">
                ${_t('data.folders.Cloneable')}
              </p>
              <mwc-switch id="clone-folder-cloneable" style="margin-right:10px;">
              </mwc-switch>
            </div>
            ` : html``}
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
              @click="${() => this._cloneFolder()}"></mwc-button>
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
    this.spinner = this.shadowRoot?.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    this.folderLists = this.shadowRoot?.querySelectorAll('backend-ai-storage-list');
    fetch('resources/storage_metadata.json').then(
      (response) => response.json()
    ).then(
      (json) => {
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
              storageInfo[key].description = _text('data.NoStorageDescriptionFound');
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
      }
    );
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
        }
      }
    };
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._getStorageProxyBackendInformation();
      }, true);
    } else { // already connected
      this._getStorageProxyBackendInformation();
    }
    document.addEventListener('backend-ai-folder-list-changed', () => {
      // this.shadowRoot.querySelector('#storage-status').updateChart();
      this._createStorageChart();
    });
    document.addEventListener('backend-ai-vfolder-cloning', (e: any) => {
      if (e.detail) {
        const selectedItems = e.detail;
        this.cloneFolderName = selectedItems.name;
        this._cloneFolderDialog();
      }
    });
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
      this.enableStorageProxy = globalThis.backendaiclient.supports('storage-proxy');
      this.apiMajorVersion = globalThis.backendaiclient.APIMajorVersion;
      this._getStorageProxyBackendInformation();
      if (globalThis.backendaiclient.isAPIVersionCompatibleWith('v4.20191215')) {
        this._vfolderInnatePermissionSupport = true;
      }
      globalThis.backendaiclient.vfolder.list_allowed_types().then((response) => {
        this.allowed_folder_type = response;
      });
    };

    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        _init();
        this._createStorageChart();
      }, true);
    } else {
      _init();
      this._createStorageChart();
    }
  }

  /** *
   * create Storage Doughnut Chart
   *
   */
  async _createStorageChart() {
    const accessKey = globalThis.backendaiclient._config.accessKey;
    const res = await globalThis.backendaiclient.keypair.info(accessKey, ['resource_policy']);
    const policyName = res.keypair.resource_policy;
    const resource_policy = await globalThis.backendaiclient.resourcePolicy.get(policyName, ['max_vfolder_count']);
    const max_vfolder_count = resource_policy.keypair_resource_policy.max_vfolder_count;
    const groupId = globalThis.backendaiclient.current_group_id();
    const folders = await globalThis.backendaiclient.vfolder.list(groupId);
    this.createdCount = folders.filter((item) => item.is_owner).length;
    this.invitedCount = folders.length - this.createdCount;
    this.capacity = (this.createdCount < max_vfolder_count ? (max_vfolder_count - this.createdCount) : 0);
    this.totalCount = this.capacity + this.createdCount + this.invitedCount;
    this.folders = {
      labels: [
        _text('data.Created'),
        _text('data.Invited'),
        _text('data.Capacity')
      ],
      datasets: [{
        data: [
          this.createdCount,
          this.invitedCount,
          this.capacity
        ],
        backgroundColor: [
          '#722cd7',
          '#60bb43',
          '#efefef'
        ]
      }]
    };
  }

  /**
   * display tabs
   *
   * @param {object} tab
   */
  _showTab(tab) {
    const els = this.shadowRoot?.querySelectorAll<HTMLDivElement>('.tab-content') as NodeListOf<HTMLDivElement>;
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    (this.shadowRoot?.querySelector('#' + tab.title + '-folder-lists') as HTMLDivElement).style.display = 'block';
    this._activeTab = tab.title;
  }

  /**
   * Clone folder dialog.
   */
  async _cloneFolderDialog() {
    const vhost_info = await globalThis.backendaiclient.vfolder.list_hosts();
    this.addFolderNameInput.value = ''; // reset folder name
    this.vhosts = vhost_info.allowed;
    this.vhost = vhost_info.default;
    if ((this.allowed_folder_type as string[]).includes('group')) {
      const group_info = await globalThis.backendaiclient.group.list();
      this.allowedGroups = group_info.groups;
    }
    this.cloneFolderNameInput.value = await this._checkFolderNameAlreadyExists(this.cloneFolderName);
    this.openDialog('clone-folder-dialog');
  }

  /**
   * Add folder dialog.
   */
  async _addFolderDialog() {
    const vhost_info = await globalThis.backendaiclient.vfolder.list_hosts();
    this.addFolderNameInput.value = ''; // reset folder name
    this.vhosts = vhost_info.allowed;
    this.vhost = vhost_info.default;
    if ((this.allowed_folder_type as string[]).includes('group')) {
      const group_info = await globalThis.backendaiclient.group.list();
      this.allowedGroups = group_info.groups;
    }
    this.openDialog('add-folder-dialog');
  }

  async _getStorageProxyBackendInformation() {
    const vhostInfo = await globalThis.backendaiclient.vfolder.list_hosts();
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
      this._helpDescription = this.storageInfo[item].description;
      this._helpDescriptionIcon = this.storageInfo[item].icon;
    } else {
      this._helpDescriptionTitle = item;
      this._helpDescriptionIcon = 'local.png';
      this._helpDescription = _text('data.NoStorageDescriptionFound');
    }
    const desc = this.shadowRoot?.querySelector('#help-description') as BackendAIDialog;
    desc.show();
  }

  _indexFrom1(index) {
    return index + 1;
  }

  /**
   * Add folder with name, host, type, usage mode and permission.
   */
  _addFolder() {
    const name = this.addFolderNameInput.value;
    const host = (this.shadowRoot?.querySelector('#add-folder-host') as Select).value;
    let ownershipType = (this.shadowRoot?.querySelector('#add-folder-type') as Select).value;
    let group;
    const usageModeEl = this.shadowRoot?.querySelector('#add-folder-usage-mode') as Select;
    const permissionEl = this.shadowRoot?.querySelector('#add-folder-permission') as Select;
    const cloneableEl = this.shadowRoot?.querySelector('#add-folder-cloneable') as any;
    let usageMode = '';
    let permission = '';
    let cloneable = false;
    if (['user', 'group'].includes(ownershipType) === false) {
      ownershipType = 'user';
    }
    if (ownershipType === 'user') {
      group = '';
    } else {
      group = this.is_admin ? (this.shadowRoot?.querySelector('#add-folder-group') as Select).value : globalThis.backendaiclient.current_group;
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
      cloneable = cloneableEl.checked;
    }
    this.addFolderNameInput.reportValidity();
    if (this.addFolderNameInput.checkValidity()) {
      const job = globalThis.backendaiclient.vfolder.create(name, host, group, usageMode, permission, cloneable);
      job.then((value) => {
        this.notification.text = _text('data.folders.FolderCreated');
        this.notification.show();
        this._refreshFolderList();
      }).catch((err) => {
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
   *
   */
  async _cloneFolder() {
    const name = await this._checkFolderNameAlreadyExists(this.cloneFolderNameInput.value, true);
    const host = (this.shadowRoot?.querySelector('#clone-folder-host') as Select).value;
    let ownershipType = (this.shadowRoot?.querySelector('#clone-folder-type') as Select).value;
    const usageModeEl = this.shadowRoot?.querySelector<Select>('#clone-folder-usage-mode');
    const permissionEl = this.shadowRoot?.querySelector<Select>('#clone-folder-permission');
    const cloneableEl = this.shadowRoot?.querySelector<Switch>('#clone-folder-cloneable');
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
        'cloneable': cloneable,
        'permission': permission,
        'target_host': host,
        'target_name': name,
        'usage_mode': usageMode
      };
      const job = globalThis.backendaiclient.vfolder.clone(input, this.cloneFolderName);
      job.then((value) => {
        this.notification.text = _text('data.folders.FolderCloned');
        this.notification.show();
        this._refreshFolderList();
      }).catch((err) => {
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
          this.addFolderNameInput.validationMessage = _text('data.FolderNameRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        } else {
          this.addFolderNameInput.validationMessage = _text('data.Allowslettersnumbersand-_dot');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        }
      } else {
        // custom validation for folder name using regex
        const regex = /[`~!@#$%^&*()|+=?;:'",<>{}[\]\\/\s]/gi;
        let isValid = !regex.test(this.addFolderNameInput.value);
        if (!isValid) {
          this.addFolderNameInput.validationMessage = _text('data.Allowslettersnumbersand-_dot');
        }
        if (this.addFolderNameInput.value.length > 64) {
          isValid = false;
          this.addFolderNameInput.validationMessage = _text('data.FolderNameTooLong');
        }
        return {
          valid: isValid,
          customError: !isValid
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
    const folders= folderList.map((value) => value.name);
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
