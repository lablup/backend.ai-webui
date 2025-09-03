/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { navigate } from '../backend-ai-app';
import JsonToCsv from '../lib/json_to_csv';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { store } from '../store';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import './backend-ai-resource-monitor';
import './backend-ai-session-list';
import './lablup-activity-panel';
import '@material/mwc-button';
import '@material/mwc-checkbox';
import '@material/mwc-formfield';
import '@material/mwc-icon-button';
import '@material/mwc-list';
import { Menu } from '@material/mwc-menu';
import '@material/mwc-tab';
import '@material/mwc-tab-bar';
import '@material/mwc-textfield';
import { TextField } from '@material/mwc-textfield';
import { css, CSSResultGroup, html } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query, queryAll } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAISessionList = HTMLElementTagNameMap['backend-ai-session-list'];
type BackendAIResourceMonitor =
  HTMLElementTagNameMap['backend-ai-resource-monitor'];
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];

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
export default class BackendAISessionView extends BackendAIPage {
  @property({ type: String }) _status = 'inactive';
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Boolean }) is_admin = false;
  @property({ type: String }) filterAccessKey = '';
  @property({ type: String }) _connectionMode = 'API';
  @property({ type: Object }) _defaultFileName = '';
  @property({ type: Object }) resourceBroker;
  @queryAll('backend-ai-session-list')
  sessionList!: NodeListOf<BackendAISessionList>;
  @query('#running-jobs') runningJobs!: BackendAISessionList;
  @query('#resource-monitor') resourceMonitor!: BackendAIResourceMonitor;
  @query('#export-file-name') exportFileNameInput!: TextField;
  @query('#date-from') dateFromInput!: TextField;
  @query('#date-to') dateToInput!: TextField;
  @query('#dropdown-menu') dropdownMenu!: Menu;
  @query('#export-to-csv') exportToCsvDialog!: BackendAIDialog;

  constructor() {
    super();
    this.active = false;
    this._status = 'inactive';
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        mwc-menu {
          --mdc-menu-item-height: auto;
        }

        mwc-menu#dropdown-menu {
          position: relative;
          left: -170px;
          top: 50px;
        }

        mwc-list-item {
          font-size: 14px;
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

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        backend-ai-resource-monitor {
          margin: 10px 50px;
        }

        @media screen and (max-width: 805px) {
          mwc-tab {
            --mdc-typography-button-font-size: 10px;
          }
        }
      `,
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    document.addEventListener('backend-ai-session-list-refreshed', () => {
      this.runningJobs.refreshList(true, false);
    });
    this.resourceBroker = globalThis.resourceBroker;
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this.is_admin = globalThis.backendaiclient.is_admin;
          this._connectionMode =
            globalThis.backendaiclient._config._connectionMode;
        },
        true,
      );
    } else {
      this.is_admin = globalThis.backendaiclient.is_admin;
      this._connectionMode = globalThis.backendaiclient._config._connectionMode;
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      this.resourceMonitor.removeAttribute('active');
      this._status = 'inactive';
      for (let x = 0; x < this.sessionList.length; x++) {
        this.sessionList[x].removeAttribute('active');
      }
      return;
    }

    const _init = () => {
      this.resourceMonitor.setAttribute('active', 'true');
      this.runningJobs.setAttribute('active', 'true');
      this._status = 'active';
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

  _triggerClearTimeout() {
    const event = new CustomEvent('backend-ai-clear-timeout');
    document.dispatchEvent(event);
  }

  _showTab(tab) {
    const els = this.shadowRoot?.querySelectorAll(
      '.tab-content',
    ) as NodeListOf<HTMLDivElement>;
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    (
      this.shadowRoot?.querySelector('#' + tab.title + '-lists') as HTMLElement
    ).style.display = 'block';
    for (let x = 0; x < this.sessionList.length; x++) {
      this.sessionList[x].removeAttribute('active');
    }
    this._triggerClearTimeout();
    (
      this.shadowRoot?.querySelector('#' + tab.title + '-jobs') as HTMLElement
    ).setAttribute('active', 'true');
  }

  /**
   * toggle dropdown menu (admin-only)
   *
   * @param {Event} e - Toggle event
   */
  _toggleDropdown(e) {
    const menu = this.dropdownMenu;
    const button = e.target;
    menu.anchor = button;
    if (!menu.open) {
      menu.show();
    }
  }

  _openExportToCsvDialog() {
    const menu = this.dropdownMenu;
    if (menu.open) {
      menu.close();
    }
    console.log('Downloading CSV File...');
    this._defaultFileName = this._getDefaultCSVFileName();
    this.exportToCsvDialog.show();
  }

  _getFirstDateOfMonth() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 2)
      .toISOString()
      .substring(0, 10);
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
    const dateTo = this.dateToInput;
    const dateFrom = this.dateFromInput;

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
  static _automaticScaledTime(value: number) {
    // number: msec.
    let result = Object();
    const unitText = ['D', 'H', 'M', 'S'];
    const unitLength = [1000 * 60 * 60 * 24, 1000 * 60 * 60, 1000 * 60, 1000];

    for (let i = 0; i < unitLength.length; i++) {
      if (Math.floor(value / unitLength[i]) > 0) {
        result[unitText[i]] = Math.floor(value / unitLength[i]);
        value = value % unitLength[i];
      }
    }
    if (Object.keys(result).length === 0) {
      // only prints msec. when time is shorter than 1sec.
      if (value > 0) {
        result = { MS: value };
      } else {
        // No data.
        result = { NODATA: 1 };
      }
    }
    return result;
  }

  /**
   * Convert the value bytes to MiB with decimal point to 1 as a default
   *
   * @param {number} value
   * @param {number} decimalPoint decimal point to show
   * @return {string} converted value from Bytes to MiB
   */
  static bytesToMiB(value, decimalPoint = 1) {
    return Number(value / 2 ** 20).toFixed(1);
  }

  _exportToCSV() {
    const fileNameEl = this.exportFileNameInput;

    if (!fileNameEl.validity.valid) {
      return;
    }
    const exportList: any = [];

    // Parameters
    let status: any;
    if (globalThis.backendaiclient.supports('avoid-hol-blocking')) {
      status = [
        'RUNNING',
        'RESTARTING',
        'TERMINATING',
        'PENDING',
        'SCHEDULED',
        'PREPARING',
        'PULLING',
        'TERMINATED',
        'CANCELLED',
        'ERROR',
      ];
    } else {
      status = [
        'RUNNING',
        'RESTARTING',
        'TERMINATING',
        'PENDING',
        'PREPARING',
        'PULLING',
        'TERMINATED',
        'CANCELLED',
        'ERROR',
      ];
    }
    if (globalThis.backendaiclient.supports('prepared-session-status')) {
      status.push('PREPARED');
    }
    if (globalThis.backendaiclient.supports('creating-session-status')) {
      status.push('CREATING');
    }
    status = status.join(',');
    const fields = [
      'id',
      'name',
      'user_email',
      'image',
      'created_at',
      'terminated_at',
      'status',
      'status_info',
      'access_key',
      'cluster_mode',
      'occupying_slots',
    ];
    if (this._connectionMode === 'SESSION') {
      fields.push('user_email');
    }
    if (globalThis.backendaiclient.is_superadmin) {
      fields.push(
        'containers {container_id agent occupied_slots live_stat last_stat}',
      );
    } else {
      fields.push(
        'containers {container_id occupied_slots live_stat last_stat}',
      );
    }
    const groupId = globalThis.backendaiclient.current_group_id();
    const limit = 100;

    const supportedAIAccelerators = Object.keys(
      this.resourceBroker.total_slot,
    ).filter((key) => !['cpu', 'mem'].includes(key));
    const acceleratorDeviceList = {
      cuda_device: 'cuda.device',
      cuda_shares: 'cuda.shares',
      rocm_device: 'rocm.device',
      tpu_device: 'tpu.device',
      ipu_device: 'ipu.device',
      atom_device: 'atom.device',
      atom_plus_device: 'atom-plus.device',
      atom_max_device: 'atom-max.device',
      gaudi2_device: 'gaudi2.device',
      warboy_device: 'warboy.device',
      rngd_device: 'rngd.device',
      hyperaccel_lpu_device: 'hyperaccel-lpu.device',
    };

    // Get session list and export to csv file
    globalThis.backendaiclient.computeSession
      .listAll(fields, status, this.filterAccessKey, limit, 0, groupId)
      .then((response) => {
        const sessions = response;
        if (sessions.length === 0) {
          this.notification.text = _text('session.NoSession');
          this.notification.show();
          this.exportToCsvDialog.hide();
          return;
        }
        sessions.forEach((session) => {
          const occupyingSlots = JSON.parse(session.occupying_slots);
          const exportListItem: any = {};
          exportListItem.id = session.id;
          exportListItem.name = session.name;
          exportListItem.image =
            session.image.split('/')[2] || session.image.split('/')[1];
          exportListItem.cluster_mode = session.cluster_mode;
          exportListItem.user_email = session.user_email;
          exportListItem.status = session.status;
          exportListItem.status_info = session.status_info;
          exportListItem.access_key = session.access_key;
          exportListItem.cpu_slot = parseInt(occupyingSlots.cpu);
          exportListItem.mem_slot = parseFloat(
            globalThis.backendaiclient.utils.changeBinaryUnit(
              occupyingSlots.mem,
              'g',
            ),
          ).toFixed(2);
          // add supported AI accelerator item according to total slot
          supportedAIAccelerators.forEach((key) => {
            exportListItem[key] =
              occupyingSlots[acceleratorDeviceList[key]] ?? 0;
          });

          exportListItem.created_at = session.created_at;
          exportListItem.terminated_at = session.terminated_at;
          if (session.containers && session.containers.length > 0) {
            // only show useful metrics
            let cpu_used_time: number = 0;
            let cpu_util: number = 0;
            let mem_util: number = 0;
            let cuda_util: number = 0;
            let cuda_mem: number = 0;
            let io_read: number = 0;
            let io_write: number = 0;
            const agents: Array<string> = [];

            // In order to get session-based metrics
            // we will get average value of per-container based metrics
            session.containers.forEach((container) => {
              agents.push(container.agent);
              const liveStat = container.live_stat
                ? JSON.parse(container.live_stat)
                : null;
              if (liveStat) {
                if (liveStat.cpu_used && liveStat.cpu_used.current) {
                  cpu_used_time += parseFloat(liveStat.cpu_used.current);
                }
                if (liveStat.cpu_util && liveStat.cpu_util.pct) {
                  cpu_util += parseFloat(liveStat.cpu_util.pct);
                }
                if (liveStat.mem && liveStat.mem.pct) {
                  mem_util += parseFloat(liveStat.mem.pct);
                }
                if (liveStat.cuda_util && liveStat.cuda_util.pct) {
                  cuda_util += parseFloat(liveStat.cuda_util.pct);
                }
                if (liveStat.cuda_mem && liveStat.cuda_mem.current) {
                  cuda_mem += parseFloat(liveStat.cuda_mem.current);
                }
                if (liveStat.io_read) {
                  io_read += parseFloat(liveStat.io_read.current);
                }
                if (liveStat.io_write) {
                  io_write += parseFloat(liveStat.io_write.current);
                }
              }
            });

            exportListItem.agents = [...new Set(agents)];
            exportListItem.cpu_used_time =
              BackendAISessionView._automaticScaledTime(
                cpu_used_time / session.containers.length,
              );
            exportListItem.cpu_util = (
              cpu_util / session.containers.length
            ).toFixed(2);
            exportListItem.mem_util = (
              mem_util / session.containers.length
            ).toFixed(2);
            exportListItem.cuda_util = (
              cuda_util / session.containers.length
            ).toFixed(2);
            exportListItem.cuda_mem_bytes_mb = BackendAISessionView.bytesToMiB(
              cuda_mem / session.containers.length,
            );
            exportListItem.io_read_bytes_mb = BackendAISessionView.bytesToMiB(
              io_read / session.containers.length,
            );
            exportListItem.io_write_bytes_mb = BackendAISessionView.bytesToMiB(
              io_write / session.containers.length,
            );
          }
          exportList.push(exportListItem);
        });

        JsonToCsv.exportToCsv(fileNameEl.value, exportList);
        this.notification.text = _text('session.DownloadingCSVFile');
        this.notification.show();
        this.exportToCsvDialog.hide();
      });
  }

  async _launchSessionDialog() {
    const queryParams = new URLSearchParams();
    queryParams.set(
      'formValues',
      JSON.stringify({
        resourceGroup: this.resourceBroker.scaling_group,
      }),
    );
    store.dispatch(
      navigate(
        decodeURIComponent('/session/start?' + queryParams.toString()),
        {},
      ),
    );
    document.dispatchEvent(
      new CustomEvent('react-navigate', {
        detail: {
          pathname: '/session/start',
          search: queryParams.toString(),
        },
      }),
    );
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <div data-testid="page-legacy-session" class="vertical layout" style="gap:24px;">
        <lablup-activity-panel
          title="${_t('summary.ResourceStatistics')}"
          elevation="1"
          autowidth
        >
          <div slot="message">
            <backend-ai-resource-monitor
              location="session"
              id="resource-monitor"
              ?active="${this.active === true}"
            ></backend-ai-resource-monitor>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel
          title="${_t('summary.Announcement')}"
          elevation="1"
          horizontalsize="2x"
          style="display:none;"
        ></lablup-activity-panel>
        <lablup-activity-panel elevation="1" autowidth narrow noheader>
          <div slot="message">
            <h3
              class="tab horizontal center layout"
              style="margin-top:0;margin-bottom:0;"
            >
              <div class="scroll hide-scrollbar">
                <div
                  class="horizontal layout flex start-justified"
                  style="width:70%;"
                >
                  <mwc-tab-bar>
                    <mwc-tab
                      data-testid="tab-running"
                      title="running"
                      label="${_t('session.Running')}"
                      @click="${(e) => this._showTab(e.target)}"
                    ></mwc-tab>
                    <mwc-tab
                      data-testid="tab-interactive"
                      title="interactive"
                      label="${_t('session.Interactive')}"
                      @click="${(e) => this._showTab(e.target)}"
                    ></mwc-tab>
                    <mwc-tab
                      data-testid="tab-batch"
                      title="batch"
                      label="${_t('session.Batch')}"
                      @click="${(e) => this._showTab(e.target)}"
                    ></mwc-tab>
                    <mwc-tab
                      data-testid="tab-inference"
                      title="inference"
                      label="${_t('session.Inference')}"
                      @click="${(e) => this._showTab(e.target)}"
                    ></mwc-tab>
                    <mwc-tab
                      data-testid="tab-upload-session"
                      title="system"
                      label="${_t('session.System')}"
                      @click="${(e) => this._showTab(e.target)}"
                    ></mwc-tab>
                    <mwc-tab
                      data-testid="tab-finished"
                      title="finished"
                      label="${_t('session.Finished')}"
                      @click="${(e) => this._showTab(e.target)}"
                    ></mwc-tab>
                  </mwc-tab-bar>
                </div>
              </div>
              ${
                this.is_admin
                  ? html`
                      <div style="position: relative;">
                        <mwc-icon-button
                          id="dropdown-menu-button"
                          icon="more_horiz"
                          raised
                          @click="${(e) => this._toggleDropdown(e)}"
                        ></mwc-icon-button>
                        <mwc-menu id="dropdown-menu">
                          <mwc-list-item>
                            <a
                              class="horizontal layout start center export-csv"
                              @click="${() => this._openExportToCsvDialog()}"
                            >
                              <mwc-icon
                                style="color:var(--token-colorTextSecondary);padding-right:10px;"
                              >
                                get_app
                              </mwc-icon>
                              ${_t('session.ExportCSV')}
                            </a>
                          </mwc-list-item>
                        </mwc-menu>
                      </div>
                    `
                  : html``
              }
              <div
                class="horizontal layout flex end-justified"
                style="margin-right:20px;"
              >
                <mwc-button
                  class="primary-action"
                  id="launch-session"
                  icon="power_settings_new"
                  data-testid="start-session-button"
                  @click="${() => this._launchSessionDialog()}"
                >
                  ${_t('session.launcher.Start')}
                </mwc-button>
              </div>
            </h3>
            <div id="running-lists" class="tab-content">
              <backend-ai-session-list
                id="running-jobs"
                condition="running"
              ></backend-ai-session-list>
            </div>
            <div
              id="interactive-lists"
              class="tab-content"
              style="display:none;"
            >
              <backend-ai-session-list
                id="interactive-jobs"
                condition="interactive"
              ></backend-ai-session-list>
            </div>
            <div id="batch-lists" class="tab-content" style="display:none;">
              <backend-ai-session-list
                id="batch-jobs"
                condition="batch"
              ></backend-ai-session-list>
            </div>
            <div
              id="inference-lists"
              class="tab-content"
              style="display:none;"
            >
              <backend-ai-session-list
                id="inference-jobs"
                condition="inference"
              ></backend-ai-session-list>
            </div>
            <div
              id="system-lists"
              class="tab-content"
              style="display:none;"
            >
              <backend-ai-session-list
                id="system-jobs"
                condition="system"
              ></backend-ai-session-list>
            </div>
            <div id="finished-lists" class="tab-content" style="display:none;">
              <backend-ai-session-list
                id="finished-jobs"
                condition="finished"
              ></backend-ai-session-list>
            </div>
            <div id="others-lists" class="tab-content" style="display:none;">
              <backend-ai-session-list
                id="others-jobs"
                condition="others"
              ></backend-ai-session-list>
            </div>
          </div>
        </lablup-activity-panel>
      </div>
      <backend-ai-dialog id="export-to-csv" fixed backdrop>
        <span slot="title">${_t('session.ExportSessionListToCSVFile')}</span>
        <div slot="content">
          <mwc-textfield
            id="export-file-name"
            label="File name"
            validationMessage="${_t('data.explorer.ValueRequired')}"
            value="${'session_' + this._defaultFileName}"
            required
            style="margin-bottom:10px;"
          ></mwc-textfield>
        <div slot="footer" class="horizontal flex layout">
          <mwc-button
            unelevated
            fullwidth
            icon="get_app"
            label="${_t('session.ExportCSVFile')}"
            class="export-csv"
            @click="${this._exportToCSV}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-session-view': BackendAISessionView;
  }
}
