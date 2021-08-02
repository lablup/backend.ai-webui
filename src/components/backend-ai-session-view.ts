/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultArray, CSSResultOrNative, customElement, html, property} from 'lit-element';

import './backend-ai-resource-monitor';
import './backend-ai-session-list';
import 'weightless/card';
import 'weightless/checkbox';
import 'weightless/icon';
import 'weightless/textfield';

import '@material/mwc-textfield/mwc-textfield';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-button/mwc-button';
import '@material/mwc-icon-button/mwc-icon-button';
import '@material/mwc-menu/mwc-menu';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';

import './lablup-activity-panel';
import './backend-ai-session-launcher';
import JsonToCsv from '../lib/json_to_csv';
import {BackendAIPage} from './backend-ai-page';
import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend AI Session View

 Example:

 <backend-ai-session-view active>
 ...
 </backend-ai-settings-view>

@group Backend.AI Web UI
 @element backend-ai-storage-list
 */

@customElement('backend-ai-session-view')
export default class BackendAiSessionView extends BackendAIPage {
  @property({type: String}) _status = 'inactive';
  @property({type: Boolean}) active = true;
  @property({type: Object}) _lists = Object();
  @property({type: Boolean}) is_admin = false;
  @property({type: String}) filterAccessKey = '';
  @property({type: String}) _connectionMode = 'API';
  @property({type: Object}) _defaultFileName = '';
  @property({type: Object}) exportToCsvDialog = Object();

  constructor() {
    super();
    this.active = false;
    this._status = 'inactive';
  }

  static get styles(): CSSResultOrNative | CSSResultArray {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0 0;
        }
        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-sidebar-color);
        }

        wl-button {
          --button-bg:  var(--paper-light-green-50);
          --button-bg-hover:  var(--paper-green-100);
          --button-bg-active:  var(--paper-green-600);
        }

        wl-label.unlimited {
          margin: 12px 0;
        }

        wl-label.warning {
          font-size: 10px;
          --label-color: var(--paper-red-600);
        }

        wl-checkbox#export-csv-checkbox {
          margin-right: 5px;
          --checkbox-size: 10px;
          --checkbox-border-radius: 2px;
          --checkbox-bg-checked: var(--paper-green-800);
          --checkbox-checkmark-stroke-color: var(--paper-lime-100);
          --checkbox-color-checked: var(--paper-green-800);
        }

        backend-ai-dialog wl-textfield {
          padding: 10px 0;
          --input-font-family: var(--general-font-family);
          --input-font-size: 12px;
          --input-color-disabled: #bbbbbb;
          --input-label-color-disabled: #222222;
          --input-label-font-size: 12px;
          --input-border-style-disabled: 1px solid #cccccc;
        }

        mwc-menu {
          --mdc-theme-surface: #f1f1f1;
          --mdc-menu-item-height : auto;
        }

        mwc-menu#dropdown-menu {
          position: relative;
          left: -170px;
          top: 50px;
        }

        mwc-list-item {
          font-size : 14px;
        }

        mwc-icon-button {
          --mdc-icon-size: 20px;
          color: var(--paper-grey-700);
        }

        mwc-icon-button#dropdown-menu-button {
          margin-left: 10px;
        }

        mwc-textfield {
          width: 100%;
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--paper-green-600);
        }

        backend-ai-resource-monitor {
          margin: 10px 50px;
        }

        backend-ai-session-launcher#session-launcher {
          --component-width: 100px;
          --component-shadow-color: transparent;
        }
        @media screen and (max-width: 805px) {
          mwc-tab {
            --mdc-typography-button-font-size: 10px;
          }
        }
      `];
  }

  firstUpdated() {
    this._lists = this.shadowRoot.querySelectorAll('backend-ai-session-list');
    this.notification = globalThis.lablupNotification;
    document.addEventListener('backend-ai-session-list-refreshed', () => {
      this.shadowRoot.querySelector('#running-jobs').refreshList(true, false);
    });
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.is_admin = globalThis.backendaiclient.is_admin;
        this._connectionMode = globalThis.backendaiclient._config._connectionMode;
      }, true);
    } else {
      this.is_admin = globalThis.backendaiclient.is_admin;
      this._connectionMode = globalThis.backendaiclient._config._connectionMode;
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      this.shadowRoot.querySelector('#resource-monitor').removeAttribute('active');
      this._status = 'inactive';
      for (let x = 0; x < this._lists.length; x++) {
        this._lists[x].removeAttribute('active');
      }
      return;
    }
    this.shadowRoot.querySelector('#resource-monitor').setAttribute('active', true);
    this.shadowRoot.querySelector('#running-jobs').setAttribute('active', true);
    this.exportToCsvDialog = this.shadowRoot.querySelector('#export-to-csv');
    this._status = 'active';
  }

  /**
   * Toggle dateFrom and dateTo checkbox
   *
   * @param {Event} e - click the export-csv-checkbox switch
   * */
  _toggleDialogCheckbox(e) {
    const checkbox = e.target;
    const dateFrom = this.shadowRoot.querySelector('#date-from');
    const dateTo = this.shadowRoot.querySelector('#date-to');

    dateFrom.disabled = checkbox.checked;
    dateTo.disabled = checkbox.checked;
  }

  _showTab(tab) {
    const els = this.shadowRoot.querySelectorAll('.tab-content');
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this.shadowRoot.querySelector('#' + tab.title + '-lists').style.display = 'block';
    for (let x = 0; x < this._lists.length; x++) {
      this._lists[x].removeAttribute('active');
    }
    this.shadowRoot.querySelector('#' + tab.title + '-jobs').setAttribute('active', true);
  }

  /**
   * toggle dropdown menu (admin-only)
   *
   * @param {Event} e - Toggle event
   */
  _toggleDropdown(e) {
    const menu = this.shadowRoot.querySelector('#dropdown-menu');
    const button = e.target;
    menu.anchor = button;
    if (!menu.open) {
      menu.show();
    }
  }

  _openExportToCsvDialog() {
    const menu = this.shadowRoot.querySelector('#dropdown-menu');
    if (menu.open) {
      menu.close();
    }
    console.log('Downloading CSV File...');
    this._defaultFileName = this._getDefaultCSVFileName();
    this.exportToCsvDialog.show();
  }

  _getFirstDateOfMonth() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 2).toISOString().substring(0, 10);
  }

  _getDefaultCSVFileName() {
    const date = new Date().toISOString().substring(0, 10);
    const time = new Date().toTimeString().slice(0, 8).replace(/:/gi, '-');
    return date + '_' + time;
  }

  /**
   * Check date-to < date-from.
   * */
  _validateDateRange() {
    const dateTo = this.shadowRoot.querySelector('#date-to');
    const dateFrom = this.shadowRoot.querySelector('#date-from');

    if (dateTo.value && dateFrom.value) {
      const to = new Date(dateTo.value).getTime();
      const from = new Date(dateFrom.value).getTime();
      if (to < from) {
        dateTo.value = dateFrom.value;
      }
    }
  }

  /**
   * Scale the time in units of D, H, M, S, and MS.
   *
   * @param {number} value - time to want to scale
   * @return {Record<string, unknown>} result - data containing the scaled time
   * */
  _automaticScaledTime(value: number) { // number: msec.
    let result = Object();
    const unitText = ['D', 'H', 'M', 'S'];
    const unitLength = [(1000 * 60 * 60 * 24), (1000 * 60 * 60), (1000 * 60), 1000];

    for (let i = 0; i < unitLength.length; i++) {
      if (Math.floor(value / unitLength[i]) > 0) {
        result[unitText[i]] = Math.floor(value / unitLength[i]);
        value = value % unitLength[i];
      }
    }
    if (Object.keys(result).length === 0) { // only prints msec. when time is shorter than 1sec.
      if (value > 0) {
        result = {'MS': value};
      } else { // No data.
        result = {'NODATA': 1};
      }
    }
    return result;
  }

  _msecToSec(value) {
    return Number(value / 1000).toFixed(0);
  }

  _bytesToMB(value) {
    return Number(value / (1024 * 1024)).toFixed(1);
  }

  _exportToCSV() {
    const fileNameEl = this.shadowRoot.querySelector('#export-file-name');

    if (!fileNameEl.validity.valid) {
      return;
    }
    const exportList: any = [];

    // Parameters
    let status: any;
    if (globalThis.backendaiclient.supports('avoid-hol-blocking')) {
      status = ['RUNNING', 'RESTARTING', 'TERMINATING', 'PENDING', 'SCHEDULED', 'PREPARING', 'PULLING', 'TERMINATED', 'CANCELLED', 'ERROR'];
    } else {
      status = ['RUNNING', 'RESTARTING', 'TERMINATING', 'PENDING', 'PREPARING', 'PULLING', 'TERMINATED', 'CANCELLED', 'ERROR'];
    }
    if (globalThis.backendaiclient.supports('detailed-session-states')) {
      status = status.join(',');
    }
    const fields = ['id', 'name', 'image', 'created_at', 'terminated_at', 'status', 'status_info', 'access_key'];
    if (this._connectionMode === 'SESSION') {
      fields.push('user_email');
    }
    if (globalThis.backendaiclient.is_superadmin) {
      fields.push('containers {container_id agent occupied_slots live_stat last_stat}');
    } else {
      fields.push('containers {container_id occupied_slots live_stat last_stat}');
    }
    const groupId = globalThis.backendaiclient.current_group_id();
    const limit = 100;

    // Get session list and export to csv file
    globalThis.backendaiclient.computeSession.listAll(fields, status, this.filterAccessKey, limit, 0, groupId).then((response) => {
      const sessions = response;
      if (sessions.length === 0) {
        this.notification.text = _text('session.NoSession');
        this.notification.show();
        this.exportToCsvDialog.hide();
        return;
      }
      sessions.forEach((session) => {
        const exportListItem: any = {};
        exportListItem.id = session.id;
        exportListItem.name = session.name;
        exportListItem.image = session.image.split('/')[2] || session.image.split('/')[1];
        exportListItem.status = session.status;
        exportListItem.status_info = session.status_info;
        exportListItem.access_key = session.access_key;
        exportListItem.created_at = session.created_at;
        exportListItem.terminated_at = session.terminated_at;
        if (session.containers && session.containers.length > 0) {
          // Assume a session has only one container (no consideration on multi-container bundling)
          const container = session.containers[0];
          exportListItem.container_id = container.container_id;
          const occupiedSlots = container.occupied_slots ? JSON.parse(container.occupied_slots) : null;
          if (occupiedSlots) {
            exportListItem.cpu_slot = parseInt(occupiedSlots.cpu);
            exportListItem.mem_slot = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(occupiedSlots.mem, 'g')).toFixed(2);
            if (occupiedSlots['cuda.shares']) {
              exportListItem.cuda_shares = occupiedSlots['cuda.shares'];
            }
            if (occupiedSlots['cuda.device']) {
              exportListItem.cuda_device = occupiedSlots['cuda.device'];
            }
            if (occupiedSlots['tpu.device']) {
              exportListItem.tpu_device = occupiedSlots['tpu.device'];
            }
            if (occupiedSlots['rocm.device']) {
              exportListItem.rocm_device = occupiedSlots['rocm.device'];
            }
          }
          const liveStat = container.live_stat ? JSON.parse(container.live_stat) : null;
          if (liveStat) {
            if (liveStat.cpu_used && liveStat.cpu_used.current) {
              exportListItem.cpu_used_time = this._automaticScaledTime(liveStat.cpu_used.current);
            } else {
              exportListItem.cpu_used_time = 0;
            }
            if (liveStat.io_read) {
              exportListItem.io_read_bytes_mb = this._bytesToMB(liveStat.io_read.current);
            } else {
              exportListItem.io_read_bytes_mb = 0;
            }
            if (liveStat.io_write) {
              exportListItem.io_write_bytes_mb = this._bytesToMB(liveStat.io_write.current);
            } else {
              exportListItem.io_write_bytes_mb = 0;
            }
          }
          if (container.agent) {
            exportListItem.agent = container.agent;
          }
        }
        exportList.push(exportListItem);
      });

      JsonToCsv.exportToCsv(fileNameEl.value, exportList);
      this.notification.text = _text('session.DownloadingCSVFile');
      this.notification.show();
      this.exportToCsvDialog.hide();
    });

    // let isUnlimited = this.shadowRoot.querySelector('#export-csv-checkbox').checked;
    // if (isUnlimited) {
    //   globalThis.backendaiclient.computeSession.listAll(fields, this.filterAccessKey, group_id).then((response) => {
    //     // let total_count = response.compute_sessions.length;
    //     let sessions = response.compute_sessions;
    //     // console.log("total_count : ",total_count);
    //   JsonToCsv.exportToCsv(fileNameEl.value, sessions);
    //   });
    // } else {
    //   let dateTo = this.shadowRoot.querySelector('#date-to');
    //   let dateFrom = this.shadowRoot.querySelector('#date-from');

    //   if(dateTo.validity.valid && dateFrom.validity.valid) {
    //      TODO : new backendaiclient.computeSession query will be added (date range)
    //     console.log('Session between ' , dateFrom.value, ' ~ ', dateTo.value, " will be downloaded.");
    //   }
    // }
  }

  render() {
    // language=HTML
    return html`
      <div class="horizontal layout wrap">
        <lablup-activity-panel title="${_t('summary.ResourceStatistics')}" elevation="1" autowidth>
          <div slot="message">
            <backend-ai-resource-monitor location="session" id="resource-monitor" ?active="${this.active === true}"></backend-ai-resource-monitor>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel title="${_t('summary.Announcement')}" elevation="1" horizontalsize="2x" style="display:none;">
        </lablup-activity-panel>
      </div>
      <lablup-activity-panel elevation="1" autowidth narrow noheader>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <div class="horizontal layout flex start-justified">
            <mwc-tab-bar>
              <mwc-tab title="running" label="${_t('session.Running')}" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              <mwc-tab title="finished" label="${_t('session.Finished')}" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              <mwc-tab title="others" label="${_t('session.Others')}" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            </mwc-tab-bar>
            ${this.is_admin ? html`
              <div style="position: relative;">
                <mwc-icon-button id="dropdown-menu-button" icon="more_horiz" raised
                                  @click="${(e) => this._toggleDropdown(e)}"></mwc-icon-button>
                  <mwc-menu id="dropdown-menu">
                    <mwc-list-item>
                      <a class="horizontal layout start center" @click="${() => this._openExportToCsvDialog()}">
                        <mwc-icon style="color:#242424;padding-right:10px;">get_app</mwc-icon>
                        ${_t('session.exportCSV')}
                      </a>
                    </mwc-list-item>
                  </mwc-menu>
                </div>
              ` : html``}
            </div>
            <div class="horizontal layout flex end-justified" style="margin-right:20px;">
            <backend-ai-session-launcher location="session" id="session-launcher" ?active="${this.active === true}" isSupportingFab></backend-ai-session-launcher>
            </div>
          </h3>
          <div id="running-lists" class="tab-content">
            <backend-ai-session-list id="running-jobs" condition="running"></backend-ai-session-list>
          </div>
          <div id="finished-lists" class="tab-content" style="display:none;">
            <backend-ai-session-list id="finished-jobs" condition="finished"></backend-ai-session-list>
          </div>
          <div id="others-lists" class="tab-content" style="display:none;">
            <backend-ai-session-list id="others-jobs" condition="others"></backend-ai-session-list>
          </div>
        </div>
      </lablup-activity-panel>
      <backend-ai-dialog id="export-to-csv" fixed backdrop>
        <span slot="title">${_t('session.ExportSessionListToCSVFile')}</span>
        <div slot="content">
          <mwc-textfield id="export-file-name" label="File name"
                          validationMessage="${_t('data.explorer.ValueRequired')}"
                          value="${'session_' + this._defaultFileName}" required
                          style="margin-bottom:10px;"></mwc-textfield>
          <div class="horizontal center layout" style="display:none;">
            <wl-textfield id="date-from" label="From" type="date" style="margin-right:10px;"
                          value="${this._getFirstDateOfMonth()}" required
                          @change="${this._validateDateRange}">
              <wl-icon slot="before">date_range</wl-icon>
            </wl-textfield>
            <wl-textfield id="date-to" label="To" type="date"
                          value="${new Date().toISOString().substring(0, 10)}" required
                          @change="${this._validateDateRange}">
              <wl-icon slot="before">date_range</wl-icon>
            </wl-textfield>
          </div>
          <div class="horizontal center layout" style="display:none;">
            <wl-checkbox id="export-csv-checkbox" @change="${(e) => this._toggleDialogCheckbox(e)}"></wl-checkbox>
            <wl-label class="unlimited" for="export-csv-checkbox">Export All-time data</wl-label>
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button unelevated 
                      fullwidth
                      icon="get_app" 
                      label="${_t('session.ExportCSVFile')}"
                      @click="${this._exportToCSV}"></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-session-view': BackendAiSessionView;
  }
}
