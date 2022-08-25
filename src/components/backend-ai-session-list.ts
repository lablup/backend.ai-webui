/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-tree-toggle';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';
import '@vaadin/vaadin-icons/vaadin-icons';

import {default as AnsiUp} from '../lib/ansiup';
import 'weightless/button';
import 'weightless/checkbox';
import 'weightless/expansion';
import 'weightless/icon';
import 'weightless/textfield';
import 'weightless/tooltip/tooltip';

import '@material/mwc-icon-button';
import '@material/mwc-icon-button-toggle';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-menu';
import '@material/mwc-textfield/mwc-textfield';

import {default as PainKiller} from './backend-ai-painkiller';
import './backend-ai-list-status';
import '../plastics/lablup-shields/lablup-shields';
import './lablup-progress-bar';
import './backend-ai-dialog';

import {BackendAiStyles} from './backend-ai-general-styles';
import {BackendAIPage} from './backend-ai-page';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend AI Session List

 `backend-ai-session-list` is list of backend ai session.

 Example:

 <backend-ai-session-list>
 ...
 </backend-ai-session-list>

@group Backend.AI Web UI
 @element backend-ai-session-list
 */

/**
 * Type of commit session info
 */
type CommitSessionInfo = {
  environment: string;
  version: string;
  tags: Array<string>;
  session: {
    name: string;
    id: string;
  }
  taskId?: string
  commitStatus?: {
    statusDetail?: string
  }
}

/**
 * Type of commit session status
 * - ready: no container commit operation is on-going
 * - ongoing: container commit operation is proceeding now
 */
type CommitSessionStatus = 'ready' | 'ongoing';

/**
 * Type of sesion type
 * - INTERACTIVE: execute in prompt, terminate on-demand
 * - BATCH: apply execution date and time, and automatically terminated when command is done
 */
type SessionType = "INTERACTIVE" | "BATCH";
@customElement('backend-ai-session-list')
export default class BackendAiSessionList extends BackendAIPage {
  public shadowRoot: any;

  @property({type: Boolean}) active = true;
  @property({type: String}) condition = 'running';
  @property({type: Object}) jobs = Object();
  @property({type: Array}) compute_sessions = [];
  @property({type: Array}) terminationQueue;
  @property({type: String}) filterAccessKey = '';
  @property({type: String}) sessionNameField = 'name';
  @property({type: Array}) appSupportList = [];
  @property({type: Object}) appTemplate = Object();
  @property({type: Object}) imageInfo = Object();
  @property({type: Array}) _selected_items;
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);
  @property({type: Object}) _boundConfigRenderer = this.configRenderer.bind(this);
  @property({type: Object}) _boundUsageRenderer = this.usageRenderer.bind(this);
  @property({type: Object}) _boundReservationRenderer = this.reservationRenderer.bind(this);
  @property({type: Object}) _boundAgentRenderer = this.agentRenderer.bind(this);
  @property({type: Object}) _boundSessionInfoRenderer = this.sessionInfoRenderer.bind(this);
  @property({type: Object}) _boundArchitectureRenderer = this.architectureRenderer.bind(this);
  @property({type: Object}) _boundCheckboxRenderer = this.checkboxRenderer.bind(this);
  @property({type: Object}) _boundUserInfoRenderer = this.userInfoRenderer.bind(this);
  @property({type: Object}) _boundStatusRenderer = this.statusRenderer.bind(this);
  @property({type: Object}) _boundSessionTypeRenderer = this.sessionTypeRenderer.bind(this);
  @property({type: Boolean}) refreshing = false;
  @property({type: Boolean}) is_admin = false;
  @property({type: Boolean}) is_superadmin = false;
  @property({type: String}) _connectionMode = 'API';
  @property({type: Object}) _grid = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) terminateSessionDialog = Object();
  @property({type: Object}) terminateSelectedSessionsDialog = Object();
  @property({type: Object}) sessionStatusInfoDialog = Object();
  @property({type: Boolean}) enableScalingGroup = false;
  @property({type: Object}) list_status = Object();
  @property({type: String}) list_condition = 'loading';
  @property({type: Object}) refreshTimer = Object();
  @property({type: Object}) kernel_labels = Object();
  @property({type: Object}) kernel_icons = Object();
  @property({type: Object}) indicator = Object();
  @property({type: Proxy}) statusColorTable = new Proxy({
    'idle-timeout': 'green',
    'user-requested': 'green',
    'scheduled': 'green',
    'failed-to-start': 'red',
    'creation-failed': 'red',
    'self-terminated': 'green'
  }, {
    get: (obj, prop) => {
      // eslint-disable-next-line no-prototype-builtins
      return obj.hasOwnProperty(prop) ? obj[prop] : 'lightgrey';
    }
  });
  @property({type: Number}) sshPort = 0;
  @property({type: Number}) vncPort = 0;
  @property({type: Number}) current_page = 1;
  @property({type: Number}) session_page_limit = 50;
  @property({type: Number}) total_session_count = 0;
  @property({type: Number}) _APIMajorVersion = 5;
  @property({type: Object}) selectedSessionStatus = Object();
  @property({type: Boolean}) isUserInfoMaskEnabled = false;
  private _isContainerCommitEnabled = false;

  @query('#commit-session-dialog') commitSessionDialog;
  @query('#commit-current-session-path-input') commitSessionInput;

  constructor() {
    super();
    this._selected_items = [];
    this.terminationQueue = [];
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 265px);
        }

        wl-icon.indicator {
          --icon-size: 16px;
        }

        wl-icon.pagination {
          color: var(--paper-grey-700);
        }

        wl-button.pagination[disabled] wl-icon.pagination {
          color: var(--paper-grey-300);
        }

        wl-icon.warning {
          color: red;
        }

        wl-expansion {
          --expansion-elevation: 0;
          --expansion-elevation-open: 0;
          --expansion-elevation-hover: 0;
          --expansion-margin-open: 0;
          --expansion-content-padding: 0;
          --expansion-header-padding: 5px;
          width: 100%;
        }

        wl-button.pagination {
          width: 15px;
          height: 15px;
          padding: 10px;
          box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
          --button-bg: transparent;
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-600);
          --button-bg-active-flat: var(--paper-red-600);
          --button-bg-disabled: var(--paper-grey-50);
          --button-color-disabled: var(--paper-grey-200);
        }

        wl-button.pagination[disabled] {
          --button-shadow-color: transparent;
        }

        wl-button.controls-running {
          --button-fab-size: 32px;
          --button-padding: 3px;
          margin-right: 5px;
        }

        wl-tooltip.log-disabled-msg {
          position: absolute;
          top: 80%;
          left: 100%;
          transform: translate(-50%, -50%);
          z-index: 1; /* used for overlay */
        }

        img.indicator-icon {
          width: 16px;
          height: 16px;
          padding-right: 5px;
        }

        mwc-icon {
          margin-right: 5px;
        }

        mwc-icon.status-check {
          --mdc-icon-size: 16px;
        }

        mwc-icon-button.apps {
          --mdc-icon-button-size: 48px;
          --mdc-icon-size: 36px;
          padding: 3px;
          margin-right: 5px;
        }

        mwc-icon-button.status {
          --mdc-icon-button-size: 36px;
          padding: 0;
        }

        mwc-list-item {
          --mdc-typography-body2-font-size: 12px;
          --mdc-list-item-graphic-margin: 10px;
        }

        mwc-textfield {
          width: 100%;
        }

        lablup-shields.right-below-margin {
          margin-right: 3px;
          margin-bottom: 3px;
        }

        #work-dialog {
          --component-width: calc(100% - 80px);
          --component-height: auto;
          right: 0;
          top: 50px;
        }

        #status-detail-dialog {
          --component-width: 375px;
        }

        #commit-session-dialog {
          --component-width: 390px;
        }

        @media screen and (max-width: 899px) {
          #work-dialog,
          #work-dialog.mini_ui {
            left: 0;
            --component-width: 95%;
          }
        }

        @media screen and (min-width: 900px) {
          #work-dialog {
            left: 100px;
          }

          #work-dialog.mini_ui {
            left: 40px;
          }
        }

        #work-area {
          width: 100%;
          padding: 5px;
          font-size:12px;
          line-height: 12px;
          height: calc(100vh - 120px);
          background-color: #222222;
          color: #efefef;
        }

        #work-area pre {
          white-space: pre-wrap;
          white-space: -moz-pre-wrap;
          white-space: -pre-wrap;
          white-space: -o-pre-wrap;
          word-wrap: break-word;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        div.label,
        span.label {
          font-size: 12px;
        }

        div.configuration {
          width: 90px !important;
          height: 20px;
        }

        div.configuration wl-icon {
          padding-right: 5px;
        }

        span.subheading {
          color: #666;
          font-weight: bold;
        }

        mwc-list-item.commit-session-info {
          height: 100%;
        }

        mwc-list-item.predicate-check {
          height: 100%;
          margin-bottom: 5px;
        }

        .predicate-check-comment {
          white-space: pre-wrap;
        }

        .error-description {
          font-size: 0.8rem;
          word-break: break-word;
        }

        wl-button.multiple-action-button {
          --button-color: var(--paper-red-600);
          --button-color-active: red;
          --button-color-hover: red;
          --button-bg: var(--paper-red-50);
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-600);
          --button-bg-active-flat: var(--paper-red-600);
        }

        wl-label {
          width: 100%;
          background-color: var(--paper-grey-500);
          min-width: 60px;
          font-size: 12px;
          --label-font-family: 'Ubuntu', Roboto;
        }

        lablup-progress-bar.usage {
          --progress-bar-height: 5px;
          --progress-bar-width: 60px;
          margin-bottom: 0;
        }

        div.filters #access-key-filter {
          --input-font-size: small;
          --input-label-font-size: small;
          --input-font-family: var(--general-font-family);
        }

        .mount-button,
        .status-button {
          border: none;
          background: none;
          padding: 0;
          outline-style: none;
        }

        .no-mount {
          color: var(--paper-grey-400);
        }

        span#access-key-filter-helper-text {
          margin-top: 3px;
          font-size: 10px;
          color: var(--general-menu-color-2);
        }
      `];
  }

  get _isRunning() {
    return ['batch', 'interactive', 'running'].includes(this.condition);
  }

  get _isIntegratedCondition() {
    return ['running', 'finished', 'others'].includes(this.condition);
  }

  _isPreparing(status) {
    const preparingStatuses = ['RESTARTING', 'PREPARING', 'PULLING'];
    if (preparingStatuses.indexOf(status) === -1) {
      return false;
    }
    return true;
  }

  _isError(status) {
    return status === 'ERROR';
  }

  _isPending(status) {
    return status === 'PENDING';
  }

  _isFinished(status) {
    return ['TERMINATED', 'CANCELLED', 'TERMINATING'].includes(status);
  }

  firstUpdated() {
    this.list_status = this.shadowRoot.querySelector('#list-status');
    this._grid = this.shadowRoot.querySelector('#list-grid');
    this.refreshTimer = null;
    fetch('resources/image_metadata.json').then(
      (response) => response.json()
    ).then(
      (json) => {
        this.imageInfo = json.imageInfo;
        for (const key in this.imageInfo) {
          if ({}.hasOwnProperty.call(this.imageInfo, key)) {
            this.kernel_labels[key] = [];
            if ('label' in this.imageInfo[key]) {
              this.kernel_labels[key] = this.imageInfo[key].label;
            } else {
              this.kernel_labels[key] = [];
            }
            if ('icon' in this.imageInfo[key]) {
              this.kernel_icons[key] = this.imageInfo[key].icon;
            } else {
              this.kernel_icons[key] = '';
            }
          }
        }
      }
    );
    this.notification = globalThis.lablupNotification;
    this.indicator = globalThis.lablupIndicator;
    this.terminateSessionDialog = this.shadowRoot.querySelector('#terminate-session-dialog');
    this.terminateSelectedSessionsDialog = this.shadowRoot.querySelector('#terminate-selected-sessions-dialog');
    this.sessionStatusInfoDialog = this.shadowRoot.querySelector('#status-detail-dialog');
    document.addEventListener('backend-ai-group-changed', (e) => this.refreshList(true, false));
    document.addEventListener('backend-ai-ui-changed', (e) => this._refreshWorkDialogUI(e));
    document.addEventListener('backend-ai-clear-timeout', () => {
      clearTimeout(this.refreshTimer);
    });
    this._refreshWorkDialogUI({'detail': {'mini-ui': globalThis.mini_ui}});
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        if (!globalThis.backendaiclient.is_admin) {
          // this.shadowRoot.querySelector('#access-key-filter').parentNode.removeChild(this.shadowRoot.querySelector('#access-key-filter'));
          this.shadowRoot.querySelector('#access-key-filter').style.display = 'none';
          this.shadowRoot.querySelector('#access-key-filter-helper-text').style.display = 'none';
          this.shadowRoot.querySelector('vaadin-grid').style.height = 'calc(100vh - 225px)!important';
        } else {
          this.shadowRoot.querySelector('#access-key-filter').style.display = 'block';
        }
        if (globalThis.backendaiclient.APIMajorVersion < 5) {
          this.sessionNameField = 'sess_id';
        }
        this.is_admin = globalThis.backendaiclient.is_admin;
        this.is_superadmin = globalThis.backendaiclient.is_superadmin;
        this._connectionMode = globalThis.backendaiclient._config._connectionMode;
        this.enableScalingGroup = globalThis.backendaiclient.supports('scaling-group');
        this._APIMajorVersion = globalThis.backendaiclient.APIMajorVersion;
        this.isUserInfoMaskEnabled = globalThis.backendaiclient._config.maskUserInfo;
        // check whether image commit supported via both configuration variable and version(22.09)
        this._isContainerCommitEnabled = globalThis.backendaiclient._config.enableContainerCommit && globalThis.backendaiclient.supports('image-commit');
        this._refreshJobData();
      }, true);
    } else { // already connected
      if (!globalThis.backendaiclient.is_admin) {
        this.shadowRoot.querySelector('#access-key-filter').style.display = 'none';
        this.shadowRoot.querySelector('#access-key-filter-helper-text').style.display = 'none';
        // this.shadowRoot.querySelector('#access-key-filter').parentNode.removeChild(this.shadowRoot.querySelector('#access-key-filter'));
        this.shadowRoot.querySelector('vaadin-grid').style.height = 'calc(100vh - 225px)!important';
      } else {
        this.shadowRoot.querySelector('#access-key-filter').style.display = 'block';
        this.shadowRoot.querySelector('#access-key-filter-helper-text').style.display = 'block';
      }
      if (globalThis.backendaiclient.APIMajorVersion < 5) {
        this.sessionNameField = 'sess_id';
      }
      this.is_admin = globalThis.backendaiclient.is_admin;
      this.is_superadmin = globalThis.backendaiclient.is_superadmin;
      this._connectionMode = globalThis.backendaiclient._config._connectionMode;
      this.enableScalingGroup = globalThis.backendaiclient.supports('scaling-group');
      this._APIMajorVersion = globalThis.backendaiclient.APIMajorVersion;
      this.isUserInfoMaskEnabled = globalThis.backendaiclient._config.maskUserInfo;
      // check whether image commit supported via both configuration variable and version(22.09)
      this._isContainerCommitEnabled = globalThis.backendaiclient._config.enableContainerCommit && globalThis.backendaiclient.supports('image-commit');
      this._refreshJobData();
    }
  }

  /**
   * Refresh the job list.
   *
   * @param {boolean} refresh - if true, dispatch the 'backend-ai-resource-refreshed' event
   * @param {boolean} repeat - repeat the job data reading. Set refreshTime to 5000 for running list else 30000
   * */
  async refreshList(refresh = true, repeat = true) {
    return this._refreshJobData(refresh, repeat);
  }

  /**
   * Refresh the job data - data fields, sessions, etc.
   *
   * @param {boolean} refresh - if true, dispatch the 'backend-ai-resource-refreshed' event
   * @param {boolean} repeat - repeat the job data reading. Set refreshTime to 5000 for running list else 30000
   * */
  async _refreshJobData(refresh = false, repeat = true) {
    await this.updateComplete;
    if (this.active !== true) {
      return;
    }
    if (this.refreshing === true) {
      return;
    }
    this.refreshing = true;

    // this.list_condition = 'loading'; // Remove loading indicator during automatic refresh.
    // this.list_status.show();
    let status: any;
    status = 'RUNNING';
    switch (this.condition) {
    case 'running':
    case 'interactive':
    case 'batch':
      status = ['RUNNING', 'RESTARTING', 'TERMINATING', 'PENDING', 'SCHEDULED', 'PREPARING', 'PULLING'];
      break;
    case 'finished':
      status = ['TERMINATED', 'CANCELLED']; // TERMINATED, CANCELLED
      break;
    case 'others':
      status = ['TERMINATING', 'ERROR']; // "ERROR", "CANCELLED"..
      // Refer https://github.com/lablup/backend.ai-manager/blob/master/src/ai/backend/manager/models/kernel.py#L30-L67
      break;
    default:
      status = ['RUNNING', 'RESTARTING', 'TERMINATING', 'PENDING', 'SCHEDULED', 'PREPARING', 'PULLING'];
    }
    if (!globalThis.backendaiclient.supports('avoid-hol-blocking') && status.includes('SCHEDULED')) {
      status = status.filter((e) => e !== 'SCHEDULED');
    }
    if (globalThis.backendaiclient.supports('detailed-session-states')) {
      status = status.join(',');
    }

    const fields = [
      'id', 'session_id', 'name', 'image', 'architecture',
      'created_at', 'terminated_at', 'status', 'status_info',
      'service_ports', 'mounts',
      'occupied_slots', 'access_key', 'starts_at', 'type'
    ];
    if (globalThis.backendaiclient.supports('multi-container')) {
      fields.push('cluster_size');
    }
    if (globalThis.backendaiclient.supports('multi-node')) {
      fields.push('cluster_mode');
    }
    if (globalThis.backendaiclient.supports('session-detail-status')) {
      fields.push('status_data');
    }
    if (this.enableScalingGroup) {
      fields.push('scaling_group');
    }
    if (this._connectionMode === 'SESSION') {
      fields.push('user_email');
    }
    if (globalThis.backendaiclient.is_superadmin) {
      fields.push('containers {container_id agent occupied_slots live_stat last_stat}');
    } else {
      fields.push('containers {container_id occupied_slots live_stat last_stat}');
    }
    const group_id = globalThis.backendaiclient.current_group_id();

    if (this._isContainerCommitEnabled && status.includes('RUNNING')) {
      fields.push('commit_status');
    }

    globalThis.backendaiclient.computeSession.list(fields, status, this.filterAccessKey, this.session_page_limit, (this.current_page - 1) * this.session_page_limit, group_id, 10 * 1000).then((response) => {
      this.total_session_count = response.compute_session_list.total_count;
      let sessions = response.compute_session_list.items;
      if (this.total_session_count === 0) {
        this.list_condition = 'no-data';
        this.list_status.show();
        this.total_session_count = 1;
      } else {
        if (['interactive', 'batch'].includes(this.condition) && sessions.filter((session) => session.type.toLowerCase() === this.condition).length === 0) {
          this.list_condition = 'no-data';
          this.list_status.show();
        } else {
          this.list_status.hide();
        }
      }
      if (sessions !== undefined && sessions.length != 0) {
        const previousSessions = this.compute_sessions;
        const previousSessionKeys: any = [];
        Object.keys(previousSessions).map((objectKey, index) => {
          previousSessionKeys.push(previousSessions[objectKey]['session_id']);
        });
        Object.keys(sessions).map((objectKey, index) => {
          const session = sessions[objectKey];
          const occupied_slots = JSON.parse(session.occupied_slots);
          const kernelImage = sessions[objectKey].image.split('/')[2] || sessions[objectKey].image.split('/')[1];
          sessions[objectKey].cpu_slot = parseInt(occupied_slots.cpu);
          sessions[objectKey].mem_slot = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem, 'g'));
          sessions[objectKey].mem_slot = sessions[objectKey].mem_slot.toFixed(2);
          // Readable text
          sessions[objectKey].elapsed = this._elapsed(sessions[objectKey].created_at, sessions[objectKey].terminated_at);
          sessions[objectKey].created_at_hr = this._humanReadableTime(sessions[objectKey].created_at);
          sessions[objectKey].starts_at_hr = sessions[objectKey].starts_at ? this._humanReadableTime(sessions[objectKey].starts_at) : '';
          if (sessions[objectKey].containers && sessions[objectKey].containers.length > 0) {
            const container = sessions[objectKey].containers[0];
            const liveStat = container.live_stat ? JSON.parse(container.live_stat) : null;
            sessions[objectKey].agent = container.agent;
            if (liveStat && liveStat.cpu_used) {
              sessions[objectKey].cpu_used_time = this._automaticScaledTime(liveStat.cpu_used.current);
            } else {
              sessions[objectKey].cpu_used_time = this._automaticScaledTime(0);
            }
            if (liveStat && liveStat.cpu_util) {
              sessions[objectKey].cpu_util = liveStat.cpu_util.current;
            } else {
              sessions[objectKey].cpu_util = 0;
            }
            if (liveStat && liveStat.mem) {
              sessions[objectKey].mem_current = liveStat.mem.current;
            } else {
              sessions[objectKey].mem_current = 0;
            }
            if (liveStat && liveStat.io_read) {
              sessions[objectKey].io_read_bytes_mb = this._bytesToMB(liveStat.io_read.current);
            } else {
              sessions[objectKey].io_read_bytes_mb = 0;
            }
            if (liveStat && liveStat.io_write) {
              sessions[objectKey].io_write_bytes_mb = this._bytesToMB(liveStat.io_write.current);
            } else {
              sessions[objectKey].io_write_bytes_mb = 0;
            }
            if (liveStat && liveStat.cuda_util) {
              sessions[objectKey].cuda_util = liveStat.cuda_util.current;
            } else {
              sessions[objectKey].cuda_util = 0;
            }
            if (liveStat && liveStat.rocm_util) {
              sessions[objectKey].rocm_util = liveStat.rocm_util;
            } else {
              sessions[objectKey].rocm_util = 0;
            }
            if (liveStat && liveStat.tpu_util) {
              sessions[objectKey].tpu_util = liveStat.tpu_util;
            } else {
              sessions[objectKey].tpu_util = 0;
            }
          }
          const service_info = JSON.parse(sessions[objectKey].service_ports);
          if (Array.isArray(service_info) === true) {
            sessions[objectKey].app_services = service_info.map((a) => a.name);
            sessions[objectKey].app_services_option = {};
            service_info.forEach((elm) => {
              if ('allowed_arguments' in elm) {
                sessions[objectKey].app_services_option[elm.name] = elm.allowed_arguments;
              }
            });
          } else {
            sessions[objectKey].app_services = [];
            sessions[objectKey].app_services_option = {};
          }
          if (sessions[objectKey].app_services.length === 0 || !['batch', 'interactive', 'running'].includes(this.condition)) {
            sessions[objectKey].appSupport = false;
          } else {
            sessions[objectKey].appSupport = true;
          }

          if (['batch', 'interactive', 'running'].includes(this.condition)) {
            sessions[objectKey].running = true;
          } else {
            sessions[objectKey].running = false;
          }
          if ('cuda.device' in occupied_slots) {
            sessions[objectKey].cuda_gpu_slot = parseInt(occupied_slots['cuda.device']);
          }
          if ('rocm.device' in occupied_slots) {
            sessions[objectKey].rocm_gpu_slot = parseInt(occupied_slots['rocm.device']);
          }
          if ('tpu.device' in occupied_slots) {
            sessions[objectKey].tpu_slot = parseInt(occupied_slots['tpu.device']);
          }
          if ('cuda.shares' in occupied_slots) {
            // sessions[objectKey].fgpu_slot = parseFloat(occupied_slots['cuda.shares']);
            sessions[objectKey].cuda_fgpu_slot = parseFloat(occupied_slots['cuda.shares']).toFixed(2);
          }
          sessions[objectKey].kernel_image = kernelImage;
          sessions[objectKey].icon = this._getKernelIcon(session.image);
          sessions[objectKey].sessionTags = this._getKernelInfo(session.image);
          const specs = session.image.split('/');
          sessions[objectKey].cluster_size = parseInt(sessions[objectKey].cluster_size);
          const tag = specs[specs.length - 1].split(':')[1];
          const tags = tag.split('-');
          if (tags[1] !== undefined) {
            sessions[objectKey].baseversion = tags[0];
            sessions[objectKey].baseimage = tags[1];
            sessions[objectKey].additional_reqs = tags.slice(1, tags.length).map((tag) => tag.toUpperCase());
          } else if (sessions[objectKey].tag !== undefined) {
            sessions[objectKey].baseversion = sessions[objectKey].tag;
          } else {
            sessions[objectKey].baseversion = tag;
          }
          if (this._selected_items.includes(sessions[objectKey]['session_id'])) {
            sessions[objectKey].checked = true;
          } else {
            sessions[objectKey].checked = false;
          }
        });
      }
      if (['batch', 'interactive'].includes(this.condition)) {
        const result = sessions.reduce((res, session) => {
          res[session.type === 'BATCH' as SessionType ? 'batch' : 'interactive'].push(session);
          return res;
        }, {batch: [], interactive: []});
        sessions = result[this.condition === 'batch' ? 'batch': 'interactive'];
      }

      this.compute_sessions = sessions;
      this._grid.recalculateColumnWidths();
      this.requestUpdate();
      let refreshTime;
      this.refreshing = false;
      if (this.active === true) {
        if (refresh === true) {
          const event = new CustomEvent('backend-ai-resource-refreshed', {'detail': {}});
          document.dispatchEvent(event);
        }
        if (repeat === true) {
          refreshTime = ['batch', 'interactive', 'running'].includes(this.condition) ? 7000 : 30000;
          this.refreshTimer = setTimeout(() => {
            this._refreshJobData();
          }, refreshTime);
        }
      }
    }).catch((err) => {
      this.refreshing = false;
      if (this.active && repeat) {
        // Keep trying to fetch session list with more delay
        const refreshTime = ['batch', 'interactive', 'running'].includes(this.condition) ? 20000 : 120000;
        this.refreshTimer = setTimeout(() => {
          this._refreshJobData();
        }, refreshTime);
      }
      this.list_status.hide();
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  /**
   * Refresh work dialog.
   *
   * @param {Event} e
   * */
  _refreshWorkDialogUI(e) {
    const work_dialog = this.shadowRoot.querySelector('#work-dialog');
    if (Object.prototype.hasOwnProperty.call(e.detail, 'mini-ui') && e.detail['mini-ui'] === true) {
      work_dialog.classList.add('mini_ui');
    } else {
      work_dialog.classList.remove('mini_ui');
    }
  }

  /**
   * Convert start date to human readable date.
   *
   * @param {Date} d - Date to convert
   * @return {string} Human-readable date
   */
  _humanReadableTime(d: any) {
    d = new Date(d);
    return d.toLocaleString();
  }

  /**
   * Get kernel information - category, tag, color.
   *
   * @param {string} lang - session language
   * @return {Record<string, unknown>} Information containing category, tag, color
   * */
  _getKernelInfo(lang) {
    const tags: any = [];
    if (lang === undefined) return [];
    const specs = lang.split('/');
    const name = (specs[2] || specs[1]).split(':')[0];
    if (name in this.kernel_labels) {
      tags.push(this.kernel_labels[name]);
    } else {
      const imageParts = lang.split('/');
      // const registry = imageParts[0]; // hide registry (ip of docker registry is exposed)
      let namespace;
      let langName;
      if (imageParts.length === 3) {
        namespace = imageParts[1];
        langName = imageParts[2];
      } else if (imageParts.length > 3) {
        namespace = imageParts.slice(2, imageParts.length-1).join('/');
        langName = imageParts[imageParts.length-1];
      } else {
        namespace = '';
        langName = imageParts[1];
      }
      langName = langName.split(':')[0];
      langName = namespace ? namespace + '/' + langName : langName;
      tags.push([
        {'category': 'Env', 'tag': `${langName}`, 'color': 'lightgrey'}
      ]);
    }
    return tags;
  }

  /**
   * Get kernel icon
   *
   * @param {string} lang - session language
   * @return {string} kernel icon name
   * */
  _getKernelIcon(lang) {
    if (lang === undefined) return [];
    const specs = lang.split('/');
    const name = (specs[2] || specs[1]).split(':')[0];
    if (name in this.kernel_icons) {
      return this.kernel_icons[name];
    } else {
      return '';
    }
  }

  _byteToMB(value) {
    return Math.floor(value / 1000000);
  }

  _byteToGB(value) {
    return Math.floor(value / 1000000000);
  }

  _MBToGB(value) {
    return value / 1024;
  }

  /**
   * Scale the time in units of D, H, M, S, and MS.
   *
   * @param {number} value - time to want to scale
   * @return {Record<string, unknown>} result containing time information
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
  /**
   * Return elapsed time
   *
   * @param {any} start - start time
   * @param {any} end - end time
   * @return {string} Elapsed time between start and end
   * */
  _elapsed(start, end) {
    return globalThis.backendaiclient.utils.elapsedTime(start, end);
  }

  /**
   * Render index of rowData
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  _indexRenderer(root, column, rowData) {
    const idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  /**
   * Send request according to rqst method.
   *
   * @param {XMLHttpRequest} rqst
   * */
  async sendRequest(rqst) {
    let resp; let body;
    try {
      if (rqst.method == 'GET') {
        rqst.body = undefined;
      }
      resp = await fetch(rqst.uri, rqst);
      const contentType = resp.headers.get('Content-Type');
      if (contentType.startsWith('application/json') ||
        contentType.startsWith('application/problem+json')) {
        body = await resp.json();
      } else if (contentType.startsWith('text/')) {
        body = await resp.text();
      } else {
        body = await resp.blob();
      }
      if (!resp.ok) {
        throw body;
      }
    } catch (e) {
      // console.log(e);
    }
    return body;
  }

  async _terminateApp(sessionId) {
    const token = globalThis.backendaiclient._config.accessKey;
    const proxyURL = await globalThis.appLauncher._getProxyURL(sessionId);
    const rqst = {
      method: 'GET',
      uri: proxyURL + `proxy/${token}/${sessionId}`
    };
    return this.sendRequest(rqst)
      .then((response) => {
        this.total_session_count -= 1;
        if (response !== undefined && response.code !== 404) {
          const rqst = {
            method: 'GET',
            uri: proxyURL + `proxy/${token}/${sessionId}/delete`,
            credentials: 'include',
            mode: 'cors'
          };
          return this.sendRequest(rqst);
        }
        return Promise.resolve(true);
      }).catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  _getProxyToken() {
    let token = 'local';
    if (globalThis.backendaiclient._config.proxyToken !== undefined) {
      token = globalThis.backendaiclient._config.proxyToken;
    }
    return token;
  }

  /**
   * Show logs - work title, session logs, session name, and access key.
   *
   * @param {Event} e - click the assignment button
   * */
  _showLogs(e) {
    const controls = e.target.closest('#controls');
    const sessionUuid = controls['session-uuid'];
    const sessionName = controls['session-name'];
    const sessionId = (globalThis.backendaiclient.APIMajorVersion < 5) ? sessionName : sessionUuid;
    const accessKey = controls['access-key'];

    globalThis.backendaiclient.get_logs(sessionId, accessKey, 15000).then((req) => {
      const ansi_up = new AnsiUp();
      const logs = ansi_up.ansi_to_html(req.result.logs);
      setTimeout(() => {
        this.shadowRoot.querySelector('#work-title').innerHTML = `${sessionName} (${sessionUuid})`;
        this.shadowRoot.querySelector('#work-area').innerHTML = `<pre>${logs}</pre>` || _text('session.NoLogs');
        this.shadowRoot.querySelector('#work-dialog').sessionUuid = sessionUuid;
        this.shadowRoot.querySelector('#work-dialog').sessionName = sessionName;
        this.shadowRoot.querySelector('#work-dialog').accessKey = accessKey;
        this.shadowRoot.querySelector('#work-dialog').show();
      }, 100);
    }).catch((err) => {
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      } else if (err && err.title) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.show(true, err);
      }
    });
  }

  _refreshLogs() {
    const sessionUuid = this.shadowRoot.querySelector('#work-dialog').sessionUuid;
    const sessionName = this.shadowRoot.querySelector('#work-dialog').sessionName;
    const sessionId = (globalThis.backendaiclient.APIMajorVersion < 5) ? sessionName : sessionUuid;
    const accessKey = this.shadowRoot.querySelector('#work-dialog').accessKey;
    globalThis.backendaiclient.get_logs(sessionId, accessKey, 15000).then((req) => {
      const ansi_up = new AnsiUp();
      const logs = ansi_up.ansi_to_html(req.result.logs);
      this.shadowRoot.querySelector('#work-area').innerHTML = `<pre>${logs}</pre>` || _text('session.NoLogs');
    }).catch((err) => {
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      } else if (err && err.title) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.show(true, err);
      }
    });
  }

  _showAppLauncher(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    return globalThis.appLauncher.showLauncher(controls);
  }

  async _runTerminal(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const sessionUuid = controls['session-uuid'];
    return globalThis.appLauncher.runTerminal(sessionUuid);
  }

  async _getCommitSessionStatus(sessionName: string = '') {
    let isOnProgress: boolean = false;
    if (sessionName !== '') {
      globalThis.backendaiclient.computeSession.getCommitSessionStatus(sessionName).then((res) =>{
        // console.log(res);
        isOnProgress = res;
      }).catch((err) => {
        console.log(err);
      });
    }
    return isOnProgress;
  }

  /**
   * Request commit session
   */
  async _requestCommitSession(commitSessionInfo: CommitSessionInfo) {
    try {
      const commitSession = await globalThis.backendaiclient.computeSession.commitSession(commitSessionInfo.session.name);
      const newCommitSessionTask: CommitSessionInfo = Object.assign(commitSessionInfo, {
        taskId: commitSession.bgtask_id,
      }) as CommitSessionInfo;
      this._addCommitSessionToTasker(commitSession, newCommitSessionTask);
      this._applyContainerCommitAsBackgroundTask(newCommitSessionTask);
      this.notification.text = _text('session.CommitOnGoing');
      this.notification.show();
    } catch (err) {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    } finally {
      this.commitSessionDialog.hide();
    }
  }

  _applyContainerCommitAsBackgroundTask(commitSessionInfo: CommitSessionInfo) {
    const sse: EventSource = globalThis.backendaiclient.maintenance.attach_background_task(commitSessionInfo.taskId);
    // this._saveCurrentContainerCommitInfoToLocalStorage(commitSessionInfo);
    // sse.addEventListener('task_updated', (e) => {
    //   // FIXME: for now, there is no progress updates during this task
    //   // const ratio = data.current_progress/data.total_progress;
    //   // indicator.set(100 * ratio, _text('session.CommitOnGoing'));
    // });
    sse.addEventListener('bgtask_done', (e) => {
      // this._removeFinishedContainerCommitInfoFromLocalStorage(commitSessionInfo.session.id, commitSessionInfo.taskId);
      this.notification.text = _text('session.CommitFinished');
      this.notification.show();
      this._removeCommitSessionFromTasker(commitSessionInfo.taskId);
      sse.close();
    });
    sse.addEventListener('bgtask_failed', (e) => {
      // this._removeFinishedContainerCommitInfoFromLocalStorage(commitSessionInfo.session.id, commitSessionInfo.taskId);
      this.notification.text = _text('session.CommitFailed');
      this.notification.show(true);
      this._removeCommitSessionFromTasker(commitSessionInfo.taskId);
      sse.close();
      throw new Error('Commit session request has been failed.');
    });
    sse.addEventListener('bgtask_cancelled', (e) => {
      // this._removeFinishedContainerCommitInfoFromLocalStorage(commitSessionInfo.session.id, commitSessionInfo.taskId);
      this.notification.text = _text('session.CommitFailed');
      this.notification.show(true);
      this._removeCommitSessionFromTasker(commitSessionInfo.taskId);
      sse.close();
      throw new Error('Commit session request has been cancelled.');
    });
  }

  _addCommitSessionToTasker(task: any = null, commitSessionInfo: CommitSessionInfo) {
    /**
     * TODO:
     *    - Show progress of commit session operation
     *    - Show task in tasker panel regardless of client interruption (e.g. page refresh, etc.)
     */
    globalThis.tasker.add(
      _text('session.CommitSession') + commitSessionInfo.session.name,
      ((task !== null && typeof task === 'function') ? task : null),
      commitSessionInfo.taskId ?? '',
      'commit',
      'remove-later'
    );
  }

  _removeCommitSessionFromTasker(taskId: string = '') {
    globalThis.tasker.remove(taskId);
  }

  _getCurrentContainerCommitInfoListFromLocalStorage() {
    // FIXME:
    // parse error occurs when using `get` function declared in backendai-setting-store
    // instead, using `getItem` function in localStorage
    return JSON.parse(localStorage.getItem('backendaiwebui.settings.user.container_commit_sessions') || '[]');
  }

  _saveCurrentContainerCommitInfoToLocalStorage(commitSessionInfo: CommitSessionInfo) {
    const containerCommitSessionList = this._getCurrentContainerCommitInfoListFromLocalStorage();
    containerCommitSessionList.push(commitSessionInfo);
    globalThis.backendaioptions.set('container_commit_sessions', JSON.stringify(containerCommitSessionList));
  }

  _removeFinishedContainerCommitInfoFromLocalStorage(sessionId: string = '', taskId: string = '') {
    let containerCommitSessionList = this._getCurrentContainerCommitInfoListFromLocalStorage();
    containerCommitSessionList = containerCommitSessionList.filter((commitSessionInfo) => {
      return (commitSessionInfo.session.id !== sessionId && commitSessionInfo.taskId !== taskId);
    });
    globalThis.backendaioptions.set('container_commit_sessions', JSON.stringify(containerCommitSessionList));
  }

  _openCommitSessionDialog(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const sessionName: string = controls['session-name'];
    const sessionId: string = controls['session-uuid'];
    const kernelImage: string = controls['kernel-image'];
    this.commitSessionDialog.sessionName = sessionName;
    this.commitSessionDialog.sessionId = sessionId;
    this.commitSessionDialog.kernelImage = kernelImage;
    this.commitSessionDialog.show();
  }

  // Single session closing
  _openTerminateSessionDialog(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const sessionName = controls['session-name'];
    const sessionId = controls['session-uuid'];
    const accessKey = controls['access-key'];
    this.terminateSessionDialog.sessionName = sessionName;
    this.terminateSessionDialog.sessionId = sessionId;
    this.terminateSessionDialog.accessKey = accessKey;
    this.terminateSessionDialog.show();
  }

  _terminateSession(e) {
    const controls = e.target.closest('#controls');
    const sessionId = controls['session-uuid'];
    const accessKey = controls['access-key'];

    if (this.terminationQueue.includes(sessionId)) {
      this.notification.text = _text('session.AlreadyTerminatingSession');
      this.notification.show();
      return false;
    }
    return this._terminateKernel(sessionId, accessKey);
  }

  _terminateSessionWithCheck(forced = false) {
    if (this.terminationQueue.includes(this.terminateSessionDialog.sessionId)) {
      this.notification.text = _text('session.AlreadyTerminatingSession');
      this.notification.show();
      return false;
    }
    this.list_condition = 'loading';
    this.list_status.show();
    return this._terminateKernel(this.terminateSessionDialog.sessionId, this.terminateSessionDialog.accessKey, forced).then((response) => {
      this._selected_items = [];
      this._clearCheckboxes();
      this.terminateSessionDialog.hide();
      this.notification.text = _text('session.SessionTerminated');
      this.notification.show();
      const event = new CustomEvent('backend-ai-resource-refreshed', {'detail': 'running'});
      document.dispatchEvent(event);
    }).catch((err) => {
      this._selected_items = [];
      this._clearCheckboxes();
      this.terminateSessionDialog.hide();
      this.notification.text = PainKiller.relieve('Problem occurred during termination.');
      this.notification.show(true, err);
      const event = new CustomEvent('backend-ai-resource-refreshed', {'detail': 'running'});
      document.dispatchEvent(event);
    });
  }

  // Multiple sessions closing
  _openTerminateSelectedSessionsDialog(e?) {
    this.terminateSelectedSessionsDialog.show();
  }

  /**
   * Clear checked attributes.
   * */
  _clearCheckboxes() {
    const elm = this.shadowRoot.querySelectorAll('wl-checkbox.list-check');
    [...elm].forEach((checkbox) => {
      checkbox.removeAttribute('checked');
    });
  }

  _terminateSelectedSessionsWithCheck(forced = false) {
    this.list_condition = 'loading';
    this.list_status.show();
    const terminateSessionQueue = this._selected_items.map((item) => {
      return this._terminateKernel(item['session_id'], item.access_key, forced);
    });
    this._selected_items = [];
    return Promise.all(terminateSessionQueue).then((response) => {
      this.terminateSelectedSessionsDialog.hide();
      this._clearCheckboxes();
      this.shadowRoot.querySelector('#multiple-action-buttons').style.display = 'none';
      this.notification.text = _text('session.SessionsTerminated');
      this.notification.show();
    }).catch((err) => {
      this.terminateSelectedSessionsDialog.hide();
      this._clearCheckboxes();
      this.notification.text = PainKiller.relieve('Problem occurred during termination.');
      this.notification.show(true, err);
    });
  }

  /**
   * Terminate selected sessions without check.
   *
   * @return {void}
   * */
  _terminateSelectedSessions() {
    this.list_condition = 'loading';
    this.list_status.show();
    const terminateSessionQueue = this._selected_items.map((item) => {
      return this._terminateKernel(item['session_id'], item.access_key);
    });
    return Promise.all(terminateSessionQueue).then((response) => {
      this._selected_items = [];
      this._clearCheckboxes();
      this.shadowRoot.querySelector('#multiple-action-buttons').style.display = 'none';
      this.notification.text = _text('session.SessionsTerminated');
      this.notification.show();
    }).catch((err) => {
      this.list_status.hide();
      this._selected_items = [];
      this._clearCheckboxes();
      if ('description' in err) {
        this.notification.text = PainKiller.relieve(err.description);
      } else {
        this.notification.text = PainKiller.relieve('Problem occurred during termination.');
      }
      this.notification.show(true, err);
    });
  }

  // General closing

  async _terminateKernel(sessionId, accessKey, forced = false) {
    this.terminationQueue.push(sessionId);
    return this._terminateApp(sessionId).then(() => {
      globalThis.backendaiclient.destroy(sessionId, accessKey, forced).then((req) => {
        setTimeout(async () => {
          this.terminationQueue = [];
          // await this.refreshList(true, false); // Will be called from session-view from the event below
          const event = new CustomEvent('backend-ai-session-list-refreshed', {'detail': 'running'});
          document.dispatchEvent(event);
        }, 1000);
      }).catch((err) => {
        // this.refreshList(true, false); // Will be called from session-view from the event below
        const event = new CustomEvent('backend-ai-session-list-refreshed', {'detail': 'running'});
        document.dispatchEvent(event);
        if ('description' in err) {
          this.notification.text = PainKiller.relieve(err.description);
        } else {
          this.notification.text = PainKiller.relieve('Problem occurred during termination.');
        }
        this.notification.show(true, err);
      });
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  _hideDialog(e) {
    const hideButton = e.target;
    const dialog = hideButton.closest('backend-ai-dialog');
    dialog.hide();

    if (dialog.id === 'ssh-dialog') {
      const downloadLinkEl = this.shadowRoot.querySelector('#sshkey-download-link');
      globalThis.URL.revokeObjectURL(downloadLinkEl.href);
    }
  }

  _updateFilterAccessKey(e) {
    this.filterAccessKey = e.target.value;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this._refreshJobData();
    }
  }

  /**
   * Create dropdown menu that shows mounted folder names.
   * Added menu to document.body to show at the top.
   *
   * @param {Event} e - mouseenter the mount-button
   * @param {Array} mounts - array of the mounted folders
   * */
  _createMountedFolderDropdown(e, mounts) {
    const menuButton: HTMLElement = e.target;
    const menu = document.createElement('mwc-menu') as any;
    menu.anchor = menuButton;
    menu.className = 'dropdown-menu';
    menu.style.boxShadow = '0 1px 1px rgba(0, 0, 0, 0.2)';
    menu.setAttribute('open', '');
    menu.setAttribute('fixed', '');
    menu.setAttribute('x', 10);
    menu.setAttribute('y', 15);

    if (mounts.length >= 1) {
      mounts.map((key, index) => {
        const mountedFolderItem = document.createElement('mwc-list-item');
        mountedFolderItem.style.height = '25px';
        mountedFolderItem.style.fontWeight = '400';
        mountedFolderItem.style.fontSize = '14px';
        mountedFolderItem.style.fontFamily = 'var(--general-font-family)';
        mountedFolderItem.innerHTML = (mounts.length > 1) ? key : _text('session.OnlyOneFolderAttached');

        menu.appendChild(mountedFolderItem);
      });
      document.body.appendChild(menu);
    }
  }

  /**
   * Remove the dropdown menu when mouseleave the mount-button.
   * */
  _removeMountedFolderDropdown() {
    const menu = document.getElementsByClassName('dropdown-menu') as any;
    while (menu[0]) menu[0].parentNode.removeChild(menu[0]);
  }

  /**
   * Show tooltip when mouseenter the corresponding element
   *
   * @param {string} elementId
   */
  _showTooltip(elementId = '') {
    if (elementId) {
      const tooltip = this.shadowRoot.querySelector(`#${elementId}`);
      tooltip.open = true;
    }
  }

  /**
   * Hide tooltip when mouseleave the corresponding element
   *
   * @param {string} elementId
   */
  _hideTooltip(elementId = '') {
    if (elementId) {
      const tooltip = this.shadowRoot.querySelector(`#${elementId}`);
      tooltip.open = false;
    }
  }

  _renderStatusDetail() {
    const tmpSessionStatus = JSON.parse(this.selectedSessionStatus.data);
    tmpSessionStatus.reserved_time = this.selectedSessionStatus.reserved_time;
    const statusDetailEl = this.shadowRoot.querySelector('#status-detail');

    statusDetailEl.innerHTML = `
    <div class="vertical layout justified start">
      <h3 style="width:100%;padding-left:15px;border-bottom:1px solid #ccc;">${_text('session.Status')}</h3>
      <lablup-shields color="${this.statusColorTable[this.selectedSessionStatus.info]}"
          description="${this.selectedSessionStatus.info}" ui="round" style="padding-left:15px;"></lablup-shields>
    </div>`;

    if (tmpSessionStatus.hasOwnProperty('kernel') || tmpSessionStatus.hasOwnProperty('session')) {
      statusDetailEl.innerHTML += `
        <div class="vertical layout start flex" style="width:100%;">
        <div style="width:100%;">
          <h3 style="width:100%;padding-left:15px;border-bottom:1px solid #ccc;">${_text('session.StatusDetail')}</h3>
          <div class="vertical layout flex" style="width:100%;">
            <mwc-list>
              <mwc-list-item twoline noninteractive class="predicate-check">
                <span class="subheading"><strong>Kernel Exit Code</strong></span>
                <span class="monospace predicate-check-comment" slot="secondary">${tmpSessionStatus.kernel?.exit_code ?? 'null'}</span>
              </mwc-list-item>
              <mwc-list-item twoline noninteractive class="predicate-check">
                <span class="subheading">Session Status</span>
                <span class="monospace predicate-check-comment" slot="secondary">${tmpSessionStatus.session?.status}</span>
              </mwc-list-item>
            </mwc-list>
          </div>
        </div>
      `;
    } else if (tmpSessionStatus.hasOwnProperty('scheduler')) {
      const failedCount: number = tmpSessionStatus.scheduler.failed_predicates?.length ?? 0;
      const passedCount: number = tmpSessionStatus.scheduler.passed_predicates?.length ?? 0;
      statusDetailEl.innerHTML += `
        <div class="vertical layout start flex" style="width:100%;">
          <div style="width:100%;">
            <h3 style="width:100%;padding-left:15px;border-bottom:1px solid #ccc;">${_text('session.StatusDetail')}</h3>
            <div class="vertical layout flex" style="width:100%;">
              <mwc-list>
                <mwc-list-item twoline noninteractive class="predicate-check">
                  <span class="subheading">${_text('session.Message')}</span>
                  <span class="monospace predicate-check-comment" slot="secondary">${tmpSessionStatus.scheduler.msg}</span>
                </mwc-list-item>
                <mwc-list-item twoline noninteractive class="predicate-check">
                  <span class="subheading">${_text('session.TotalRetries')}</span>
                  <span class="monospace predicate-check-comment" slot="secondary">${tmpSessionStatus.scheduler.retries}</span>
                </mwc-list-item>
                <mwc-list-item twoline noninteractive class="predicate-check">
                  <span class="subheading">${_text('session.LastTry')}</span>
                  <span class="monospace predicate-check-comment" slot="secondary">${this._humanReadableTime(tmpSessionStatus.scheduler.last_try)}</span>
                </mwc-list-item>
              </mwc-list>
            </div>
          </div>
          <wl-expansion name="predicates" open>
          <div slot="title" class="horizontal layout center start-justified">
            ${failedCount > 0 ? `
              <mwc-icon class="fg red">cancel</mwc-icon>
              ` : `
              <mwc-icon class="fg green">check_circle</mwc-icon>
            `}
            Predicate Checks
          </div>
          <span slot="description">
          ${failedCount > 0 ? ` ${failedCount + ` Failed, `}` : ``}
          ${passedCount + ` Passed`}
          </span>
          <mwc-list>
          ${tmpSessionStatus.scheduler.failed_predicates.map((item) => {
    return `
          ${item.name === 'reserved_time' ? `
              <mwc-list-item twoline graphic="icon" noninteractive class="predicate-check">
                <span>${item.name}</span>
                <span slot="secondary" class="predicate-check-comment">${item.msg + ': ' + tmpSessionStatus.reserved_time}</span>
                <mwc-icon slot="graphic" class="fg red inverted status-check">close</mwc-icon>
              </mwc-list-item>` : `
              <mwc-list-item twoline graphic="icon" noninteractive class="predicate-check">
                <span>${item.name}</span>
                <span slot="secondary" class="predicate-check-comment">${item.msg}</span>
                <mwc-icon slot="graphic" class="fg red inverted status-check">close</mwc-icon>
              </mwc-list-item>`}
              <li divider role="separator"></li>
              `;
  }).join('')}
          ${tmpSessionStatus.scheduler.passed_predicates.map((item) => {
    return `
                <mwc-list-item graphic="icon" noninteractive>
                  <span style="padding-left:3px;">${item.name}</span>
                  <mwc-icon slot="graphic" class="fg green inverted status-check" style="padding-left:5px;">checked</mwc-icon>
                </mwc-list-item>
                <li divider role="separator"></li>
                `;
  }).join('')}
          </mwc-list>
        </wl-expansion>
        </div>
    `;
    } else if (tmpSessionStatus.hasOwnProperty('error')) {
      const sanitizeErrMsg = (msg) => {
        return (msg.match(/'(.*?)'/g) !== null) ? msg.match(/'(.*?)'/g)[0].replace(/'/g, '') : encodedStr(msg);
      };
      // FIXME: stopgap for handling html entities in msg
      const encodedStr = (str) => {
        return str.replace(/[\u00A0-\u9999<>\&]/gmi, (i) => {
          return '&#' + i.charCodeAt(0) + ';';
        });
      };
      const errorList = tmpSessionStatus.error.collection ?? [tmpSessionStatus.error];
      statusDetailEl.innerHTML += `
      <div class="vertical layout start flex" style="width:100%;">
        <div style="width:100%;">
          <h3 style="width:100%;padding-left:15px;border-bottom:1px solid #ccc;">${_text('session.StatusDetail')}</h3>
            ${errorList.map((item) => {
    return `
              <div style="border-radius: 4px;background-color:var(--paper-grey-300);padding:10px;margin:10px;">
                <div class="vertical layout start">
                  <span class="subheading">Error</span>
                  <lablup-shields color="red" description=${item.name} ui="round"></lablup-shields>
                </div>
                ${this.is_superadmin && item.agent_id ? `
                  <div class="vertical layout start">
                    <span class="subheading">Agent ID</span>
                    <span>${item.agent_id}</span>
                  </div>
                `: ``}
                <div class="vertical layout start">
                  <span class="subheading">Message</span>
                  <span class="error-description">${sanitizeErrMsg(item.repr)}</span>
                </div>
              </div>
              `;
  }).join('')}
        </div>
      </div>
      `;
    } else {
      statusDetailEl.innerHTML += `
        <div class="vertical layout start flex" style="width:100%;">
        <h3 style="width:100%;padding-left:15px;border-bottom:1px solid #ccc;">Detail</h3>
        <span style="margin:20px;">No Details.</span>
        </div>
      `;
    }
  }

  _openStatusDetailDialog(statusInfo: string, statusData: string, reservedTime: string) {
    this.selectedSessionStatus = {
      info: statusInfo,
      data: statusData,
      reserved_time: reservedTime
    };
    this._renderStatusDetail();
    this.sessionStatusInfoDialog.show();
  }

  _validateSessionName(e) {
    const sessionNames: string[] = this.compute_sessions.map((sessions) => sessions[this.sessionNameField]);
    const sessionNameContainer = e.target.parentNode;
    const currentName = sessionNameContainer.querySelector('#session-name-field').innerText;
    const renameField = sessionNameContainer.querySelector('#session-rename-field');
    renameField.validityTransform = (value, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          renameField.validationMessage = _text('session.Validation.SessionNameRequired');
          return {
            valid: nativeValidity.valid,
            valueMissing: !nativeValidity.valid
          };
        } else if (nativeValidity.patternMismatch) {
          renameField.validationMessage = _text('session.Validation.SluggedStrings');
          return {
            valid: nativeValidity.valid,
            patternMismatch: !nativeValidity.valid
          };
        } else {
          renameField.validationMessage = _text('session.Validation.EnterValidSessionName');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        }
      } else {
        const isValid = (!sessionNames.includes(value) || value === currentName);
        if (!isValid) {
          renameField.validationMessage = _text('session.Validation.SessionNameAlreadyExist');
        }
        return {
          valid: isValid,
          customError: !isValid
        };
      }
    };
  }

  /**
   * Update a session's name if session-rename-field is visiable.
   *
   * @param {String} id - original session id
   * @param {Object} e - click the edit icon
   * @return {void}
   */
  _renameSessionName(id, e) {
    const sessionNameContainer = e.target.parentNode;
    const nameField = sessionNameContainer.querySelector('#session-name-field');
    const renameField = sessionNameContainer.querySelector('#session-rename-field');
    const icon = sessionNameContainer.querySelector('#session-rename-icon');

    if (nameField.style.display === 'none') {
      if (renameField.checkValidity()) {
        const sessionId = (globalThis.backendaiclient.APIMajorVersion < 5) ? nameField.value : id;
        globalThis.backendaiclient.rename(sessionId, renameField.value).then((req) => {
          this.refreshList();
          this.notification.text = _text('session.SessionRenamed');
          this.notification.show();
        }).catch((err) => {
          renameField.value = nameField.innerText;
          if (err && err.message) {
            this.notification.text = PainKiller.relieve(err.title);
            this.notification.detail = err.message;
            this.notification.show(true, err);
          }
        }).finally(() => {
          this._toggleSessionNameField(nameField, renameField);
        });
      } else {
        renameField.reportValidity();
        icon.on = true;
        return;
      }
    } else {
      this._toggleSessionNameField(nameField, renameField);
    }
  }

  _toggleSessionNameField(nameField, renameField) {
    if (renameField.style.display === 'block') {
      nameField.style.display = 'block';
      renameField.style.display = 'none';
    } else {
      nameField.style.display = 'none';
      renameField.style.display = 'block';
      renameField.focus();
    }
  }

  /**
   * Render session type - batch or interactive
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  sessionTypeRenderer(root, column?, rowData?) {
    render(
      html`
        <div class="layout vertical start">
          <span style="font-size: 12px;">${rowData.item.type}</span>
        </div>
      `, root
    );
  }

  /**
   * Render session information - category, color, description, etc.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  sessionInfoRenderer(root, column?, rowData?) {
    render(
      html`
        <style>
          #session-name-field {
            display: block;
            margin-left: 16px;
            white-space: pre-wrap;
            word-break: break-all;
          }
          #session-rename-field {
            display: none;
            white-space: normal;
            word-break: break-word;
            font-family: var(--general-monospace-font-family);
            --mdc-ripple-color: transparent;
            --mdc-text-field-fill-color: transparent;
            --mdc-text-field-disabled-fill-color: transparent;
            --mdc-typography-font-family: var(--general-monospace-font-family);
            --mdc-typography-subtitle1-font-family: var(--general-monospace-font-family);
          }
          #session-rename-icon {
            --mdc-icon-size: 20px;
          }
        </style>
        <div class="layout vertical start">
          <div class="horizontal center center-justified layout">
            <pre id="session-name-field">${rowData.item[this.sessionNameField]}</pre>
            ${(this._isRunning && !this._isPreparing(rowData.item.status) && globalThis.backendaiclient.email == rowData.item.user_email) ? html`
            <mwc-textfield id="session-rename-field" required autoValidate
                             pattern="^(?:[a-zA-Z0-9][a-zA-Z0-9._-]{2,}[a-zA-Z0-9])?$" maxLength="64"
                             validationMessage="${_text('session.Validation.EnterValidSessionName')}"
                             value="${rowData.item[this.sessionNameField]}"
                             @input="${(e) => this._validateSessionName(e)}"></mwc-textfield>
              <mwc-icon-button-toggle id="session-rename-icon" onIcon="done" offIcon="edit"
                                      @click="${(e) => this._renameSessionName(rowData.item.session_id, e)}"></mwc-icon-button-toggle>
            ` : html`
            `}
          </div>
          <div class="horizontal center center-justified layout">
          ${rowData.item.icon ? html`
            <img src="resources/icons/${rowData.item.icon}" style="width:32px;height:32px;margin-right:10px;" />
          `: html`
          `}
            <div class="vertical start layout">
              ${rowData.item.sessionTags ? rowData.item.sessionTags.map((item) => html`
              <div class="horizontal center layout">
                ${item.map((item) => {
    if (item.category === 'Env') {
      item.category = item.tag;
    }
    if (item.category && rowData.item.baseversion) {
      item.tag = rowData.item.baseversion;
    }
    return html`
                <lablup-shields app="${item.category === undefined ? '' : item.category}"
                                color="${item.color}"
                                description="${item.tag}"
                                ui="round"
                                class="right-below-margin"></lablup-shields>
                    `;
  })}
              </div>`) : html``}
              ${rowData.item.additional_reqs ? html`
                <div class="layout horizontal center wrap">
                  ${rowData.item.additional_reqs.map((tag) => {
    return html`
                      <lablup-shields app=""
                                      color="green"
                                      description="${tag}"
                                      ui="round"
                                      class="right-below-margin"></lablup-shields>
                    `;
  })}
                </div>
              ` : html``}
              ${rowData.item.cluster_size > 1 ? html`
                <div class="layout horizontal center wrap">
                  <lablup-shields app="${rowData.item.cluster_mode === 'single-node' ? 'Multi-container': 'Multi-node'}"
                                  color="blue"
                                  description="${ 'X ' + rowData.item.cluster_size}"
                                  ui="round"
                                  class="right-below-margin"></lablup-shields>
                </div>
              `: html``}
            </div>
          </div>
        </div>
      `, root
    );
  }

  /**
   * Render architecture column
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  architectureRenderer(root, column?, rowData?) {
    render(
      html`
        <lablup-shields app=""
                        color="lightgreen"
                        description="${rowData.item.architecture}"
                        ui="round"></lablup-shields>
      `, root
    );
  }

  /**
   * Render control options - _showAppLauncher, _runTerminal, _openTerminateSessionDialog, and _showLogs
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  controlRenderer(root, column?, rowData?) {
    let mySession = true;
    mySession = (this._connectionMode === 'API' && rowData.item.access_key === globalThis.backendaiclient._config._accessKey) ||
      (rowData.item.user_email === globalThis.backendaiclient.email);
    render(
      html`
        <div id="controls" class="layout horizontal wrap center"
             .session-uuid="${rowData.item.session_id}"
             .session-name="${rowData.item[this.sessionNameField]}"
             .access-key="${rowData.item.access_key}"
             .kernel-image="${rowData.item.kernel_image}"
             .app-services="${rowData.item.app_services}"
             .app-services-option="${rowData.item.app_services_option}">
          ${rowData.item.appSupport ? html`
            <mwc-icon-button class="fg controls-running green"
                               @click="${(e) => this._showAppLauncher(e)}"
                               ?disabled="${!mySession || rowData.item.type === 'BATCH'}"
                               icon="apps"></mwc-icon-button>
            <mwc-icon-button class="fg controls-running"
                               ?disabled="${!mySession}"
                               @click="${(e) => this._runTerminal(e)}">
              <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                 width="471.362px" height="471.362px" viewBox="0 0 471.362 471.362" style="enable-background:new 0 0 471.362 471.362;"
                 xml:space="preserve">
              <g>
                <g>
                  <path d="M468.794,355.171c-1.707-1.718-3.897-2.57-6.563-2.57H188.145c-2.664,0-4.854,0.853-6.567,2.57
                    c-1.711,1.711-2.565,3.897-2.565,6.563v18.274c0,2.662,0.854,4.853,2.565,6.563c1.713,1.712,3.903,2.57,6.567,2.57h274.086
                    c2.666,0,4.856-0.858,6.563-2.57c1.711-1.711,2.567-3.901,2.567-6.563v-18.274C471.365,359.068,470.513,356.882,468.794,355.171z"
                    />
                  <path d="M30.259,85.075c-1.903-1.903-4.093-2.856-6.567-2.856s-4.661,0.953-6.563,2.856L2.852,99.353
                    C0.95,101.255,0,103.442,0,105.918c0,2.478,0.95,4.664,2.852,6.567L115.06,224.69L2.852,336.896C0.95,338.799,0,340.989,0,343.46
                    c0,2.478,0.95,4.665,2.852,6.567l14.276,14.273c1.903,1.906,4.089,2.854,6.563,2.854s4.665-0.951,6.567-2.854l133.048-133.045
                    c1.903-1.902,2.853-4.096,2.853-6.57c0-2.473-0.95-4.663-2.853-6.565L30.259,85.075z"/>
                </g>
              </g>
            </svg>
            </mwc-icon-button>
          ` : html``}
          ${(this._isRunning && !this._isPreparing(rowData.item.status)) || this._isError(rowData.item.status) ? html`
            <mwc-icon-button class="fg red controls-running" ?disabled=${!this._isPending(rowData.item.status) && rowData.item?.commit_status as CommitSessionStatus === 'ongoing'}
                               icon="power_settings_new" @click="${(e) => this._openTerminateSessionDialog(e)}"></mwc-icon-button>
          ` : html``}
          ${(this._isRunning && !this._isPreparing(rowData.item.status) || this._APIMajorVersion > 4) && !this._isPending(rowData.item.status) ? html`
            <mwc-icon-button class="fg blue controls-running" icon="assignment"
                               @click="${(e) => this._showLogs(e)}"></mwc-icon-button>
          ` : html`
            <div @mouseenter="${() => this._showTooltip('tooltip-'+rowData.item.session_id)}" @mouseleave="${() => this._hideTooltip('tooltip-'+rowData.item.session_id)}">
              <mwc-icon-button fab flat inverted disabled class="fg controls-running" icon="assignment"></mwc-icon-button>
            </div>
            <wl-tooltip class="log-disabled-msg" id="tooltip-${rowData.item.session_id}">${_t('session.NoLogMsgAvailable')}</wl-tooltip>
          `}
          ${this._isContainerCommitEnabled ? html`
            <mwc-icon-button class="fg blue controls-running"
                             ?disabled=${this._isPending(rowData.item.status) ||
                                         this._isPreparing(rowData.item.status) ||
                                         this._isError(rowData.item.status) ||
                                         this._isFinished(rowData.item.status) ||
                                         rowData.item.type as SessionType === 'BATCH' ||
                                         rowData.item.commit_status as CommitSessionStatus === 'ongoing'}
                             icon="archive" @click="${(e) => this._openCommitSessionDialog(e)}"></mwc-icon-button>
          ` : html``}
        </div>
      `, root
    );
  }

  /**
   * Render configs
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that show the config of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  configRenderer(root, column?, rowData?) {
    // extract mounted folder names and convert them to an array.
    // monkeypatch for extracting and formatting legacy mounts info
    const mountedFolderList: Array<string> = rowData.item.mounts.map((elem: string) => {
      return (elem.startsWith('[')) ? JSON.parse(elem.replace(/'/g, '"'))[0] : elem;
    });
    render(
      html`
        <div class="layout horizontal center flex">
          <div class="layout horizontal center configuration">
            ${rowData.item.mounts.length > 0 ? html`
              <wl-icon class="fg green indicator">folder_open</wl-icon>
              <button class="mount-button"
                @mouseenter="${(e) => this._createMountedFolderDropdown(e, mountedFolderList)}"
                @mouseleave="${() => this._removeMountedFolderDropdown()}">
                ${mountedFolderList.join(', ')}
              </button>
            ` : html`
            <wl-icon class="indicator no-mount">folder_open</wl-icon>
            <span class="no-mount">No mount</span>
            `}
          </div>
        </div>
        ${rowData.item.scaling_group ? html`
        <div class="layout horizontal center flex">
          <div class="layout horizontal center configuration">
            <wl-icon class="fg green indicator">work</wl-icon>
            <span>${rowData.item.scaling_group}</span>
            <span class="indicator">RG</span>
          </div>
        </div>` : html``}
        <div class="layout vertical flex" style="padding-left: 25px">
          <div class="layout horizontal center configuration">
            <wl-icon class="fg green indicator">developer_board</wl-icon>
            <span>${rowData.item.cpu_slot}</span>
            <span class="indicator">${_t('session.core')}</span>
          </div>
          <div class="layout horizontal center configuration">
            <wl-icon class="fg green indicator">memory</wl-icon>
            <span>${rowData.item.mem_slot}</span>
            <span class="indicator">GB</span>
          </div>
          <div class="layout horizontal center configuration">
            ${rowData.item.cuda_gpu_slot ? html`
              <img class="indicator-icon fg green" src="/resources/icons/file_type_cuda.svg" />
              <span>${rowData.item.cuda_gpu_slot}</span>
              <span class="indicator">GPU</span>
              ` : html``}
            ${!rowData.item.cuda_gpu_slot && rowData.item.cuda_fgpu_slot ? html`
              <img class="indicator-icon fg green" src="/resources/icons/file_type_cuda.svg" />
              <span>${rowData.item.cuda_fgpu_slot}</span>
              <span class="indicator">GPU</span>
              ` : html``}
            ${rowData.item.rocm_gpu_slot ? html`
              <img class="indicator-icon fg green" src="/resources/icons/ROCm.png" />
              <span>${rowData.item.rocm_gpu_slot}</span>
              <span class="indicator">GPU</span>
              ` : html``}
            ${rowData.item.tpu_slot ? html`
              <wl-icon class="fg green indicator">view_module</wl-icon>
              <span>${rowData.item.tpu_slot}</span>
              <span class="indicator">TPU</span>
              ` : html``}
            ${!rowData.item.cuda_gpu_slot &&
      !rowData.item.cuda_fgpu_slot &&
      !rowData.item.rocm_gpu_slot &&
      !rowData.item.tpu_slot ? html`
              <wl-icon class="fg green indicator">view_module</wl-icon>
              <span>-</span>
              <span class="indicator">GPU</span>
              ` : html``}
          </div>
        </div>
     `, root
    );
  }

  /**
   * Render usages - cpu_used_time, io_read_bytes_mb, and io_write_bytes_mb
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  usageRenderer(root, column?, rowData?) {
    if (['batch', 'interactive', 'running'].includes(this.condition)) {
      render(
        // language=HTML
        html`
        <div class="vertical start start-justified layout">
          <div class="horizontal start-justified center layout">
            <div style="font-size:8px;width:35px;">CPU</div>
            <div class="horizontal start-justified center layout">
              <lablup-progress-bar class="usage"
                progress="${rowData.item.cpu_util / (rowData.item.cpu_slot * 100)}"
                description=""
              ></lablup-progress-bar>
            </div>
          </div>
          <div class="horizontal start-justified center layout">
            <div style="font-size:8px;width:35px;">RAM</div>
            <div class="horizontal start-justified center layout">
              <lablup-progress-bar class="usage"
                progress="${rowData.item.mem_current / (rowData.item.mem_slot * 1000000000)}"
                description=""
              ></lablup-progress-bar>
            </div>
          </div>
          ${rowData.item.cuda_gpu_slot && parseInt(rowData.item.cuda_gpu_slot) > 0 ? html`
          <div class="horizontal start-justified center layout">
            <div style="font-size:8px;width:35px;">GPU</div>
            <div class="horizontal start-justified center layout">
              <lablup-progress-bar class="usage"
                progress="${rowData.item.cuda_util / (rowData.item.cuda_gpu_slot * 100)}"
                description=""
              ></lablup-progress-bar>
            </div>
          </div>` : html``}
          ${rowData.item.cuda_fgpu_slot && parseFloat(rowData.item.cuda_fgpu_slot) > 0 ? html`
          <div class="horizontal start-justified center layout">
            <div style="font-size:8px;width:35px;">GPU</div>
            <div class="horizontal start-justified center layout">
              <lablup-progress-bar class="usage"
                progress="${rowData.item.cuda_util / (rowData.item.cuda_fgpu_slot * 100)}"
                description=""
              ></lablup-progress-bar>
            </div>
          </div>` : html``}
          ${rowData.item.rocm_gpu_slot && parseFloat(rowData.item.cuda_rocm_gpu_slot) > 0 ? html`
          <div class="horizontal start-justified center layout">
            <div style="font-size:8px;width:35px;">GPU</div>
            <div class="horizontal start-justified center layout">
              <lablup-progress-bar class="usage"
                progress="${rowData.item.rocm_util / (rowData.item.rocm_gpu_slot * 100)}"
                description=""
              ></lablup-progress-bar>
            </div>
          </div>` : html``}
          ${rowData.item.tpu_slot && parseFloat(rowData.item.tpu_slot) > 0 ? html`
          <div class="horizontal start-justified center layout">
            <div style="font-size:8px;width:35px;">TPU</div>
            <div class="horizontal start-justified center layout">
              <lablup-progress-bar class="usage"
                progress="${rowData.item.tpu_util / (rowData.item.tpu_slot * 100)}"
                description=""
              ></lablup-progress-bar>
            </div>
          </div>` : html``}
          <div class="horizontal start-justified center layout">
            <div style="font-size:8px;width:35px;">I/O</div>
            <div style="font-size:8px;" class="horizontal start-justified center layout">
            R: ${rowData.item.io_read_bytes_mb}MB /
            W: ${rowData.item.io_write_bytes_mb}MB
            </div>
          </div>
       </div>
        `, root);
    } else if (this.condition === 'finished') {
      render(
        // language=HTML
        html`
        <div class="layout horizontal center flex">
          <wl-icon class="fg blue indicator" style="margin-right:3px;">developer_board</wl-icon>
          ${rowData.item.cpu_used_time.D ? html`
          <div class="vertical center-justified center layout">
            <span style="font-size:11px">${rowData.item.cpu_used_time.D}</span>
            <span class="indicator">day</span>
          </div>` : html``}
          ${rowData.item.cpu_used_time.H ? html`
          <div class="vertical center-justified center layout">
            <span style="font-size:11px">${rowData.item.cpu_used_time.H}</span>
            <span class="indicator">hour</span>
          </div>` : html``}
          ${rowData.item.cpu_used_time.M ? html`
          <div class="vertical start layout">
            <span style="font-size:11px">${rowData.item.cpu_used_time.M}</span>
            <span class="indicator">min.</span>
          </div>` : html``}
          ${rowData.item.cpu_used_time.S ? html`
          <div class="vertical start layout">
            <span style="font-size:11px">${rowData.item.cpu_used_time.S}</span>
            <span class="indicator">sec.</span>
          </div>` : html``}
          ${rowData.item.cpu_used_time.MS ? html`
          <div class="vertical start layout">
            <span style="font-size:11px">${rowData.item.cpu_used_time.MS}</span>
            <span class="indicator">msec.</span>
          </div>` : html``}
          ${rowData.item.cpu_used_time.NODATA ? html`
          <div class="vertical start layout">
            <span style="font-size:11px">No data</span>
          </div>` : html``}
        </div>
        <div class="layout horizontal center flex">
          <wl-icon class="fg blue indicator" style="margin-right:3px;">device_hub</wl-icon>
          <div class="vertical start layout">
            <span style="font-size:9px">${rowData.item.io_read_bytes_mb}<span class="indicator">MB</span></span>
            <span class="indicator">READ</span>
          </div>
          <div class="vertical start layout">
            <span style="font-size:8px">${rowData.item.io_write_bytes_mb}<span class="indicator">MB</span></span>
            <span class="indicator">WRITE</span>
          </div>
        </div>`, root
      );
    }
  }

  /**
   * Render reservation time
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  reservationRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout vertical">
          <span>${rowData.item.created_at_hr}</span>
          <span>(${rowData.item.elapsed})</span>
        </div>
      `, root);
  }

  /**
   * Render agent name
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  agentRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout vertical">
          <span>${rowData.item.agent}</span>
        </div>
      `, root);
  }

  _toggleCheckbox(object) {
    const exist = this._selected_items.findIndex((x) => x['session_id'] == object['session_id']);
    if (exist === -1) {
      this._selected_items.push(object);
    } else {
      this._selected_items.splice(exist, 1);
    }
    if (this._selected_items.length > 0) {
      this.shadowRoot.querySelector('#multiple-action-buttons').style.display = 'block';
    } else {
      this.shadowRoot.querySelector('#multiple-action-buttons').style.display = 'none';
    }
  }

  /**
   * Render a checkbox
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  checkboxRenderer(root, column?, rowData?) {
    if ((this._isRunning && !this._isPreparing(rowData.item.status)) || this._APIMajorVersion > 4) {
      render(
        html`
            <wl-checkbox class="list-check" style="--checkbox-size:12px;" ?checked="${rowData.item.checked === true}" @click="${() => this._toggleCheckbox(rowData.item)}"></wl-checkbox>
        `, root
      );
    } else {
      render(html``, root);
    }
  }

  /**
   * Render user's information. If _connectionMode is API, render access_key, else render user_email.
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  userInfoRenderer(root, column?, rowData?) {
    const userInfo = this._connectionMode === 'API' ? rowData.item.access_key : rowData.item.user_email;
    render(
      html`
        <div class="layout vertical">
          <span class="indicator">${this._getUserId(userInfo)}</span>
        </div>
      `, root
    );
  }

  statusRenderer(root, column?, rowData?) {
    render(
      html`
        <div class="horizontal layout center">
          <span style="font-size: 12px;">${rowData.item.status}</span>
          ${( !rowData.item.status_data || rowData.item.status_data === '{}') ? html`` : html`
            <mwc-icon-button class="fg green status" icon="help"
                @click="${() => this._openStatusDetailDialog(rowData.item.status_info ?? '', rowData.item.status_data, rowData.item.starts_at_hr)}"></mwc-icon-button>
          `}
        </div>
        ${rowData.item.status_info ? html`
          <div class="layout horizontal">
            <lablup-shields id="${rowData.item.name}" app="" color="${this.statusColorTable[rowData.item.status_info]}"
                  description="${rowData.item.status_info}" ui="round"></lablup-shields>
          </div>
        ` : html``}
        ${(this._isContainerCommitEnabled && rowData.item?.commit_status !== undefined) ? html`
          <lablup-shields app="" color="${this._setColorOfStatusInformation(rowData.item.commit_status)}" class="right-below-margin"
                          description=${rowData.item.commit_status as CommitSessionStatus === 'ongoing' ? 'commit on-going' : ''}></lablup-shields>
        ` : html``}
      `, root
    );
  }

  _setColorOfStatusInformation(status: CommitSessionStatus = 'ready') {
    return status === 'ready' ? 'green' : 'lightgrey';
  }

  /**
   * Get user id according to configuration
   *
   * @param {string} userId
   * @return {string} userId
   */
  _getUserId(userId = '') {
    if (userId && this.isUserInfoMaskEnabled) {
      const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      const isEmail: boolean = emailPattern.test(userId);
      const maskStartIdx = isEmail ? 2 : 0; // show only 2 characters if session mode
      const maskLength = isEmail ? userId.split('@')[0].length - maskStartIdx : 0;
      userId = globalThis.backendaiutils._maskString(userId, '*', maskStartIdx, maskLength);
    }
    return userId;
  }

  _renderCommitSessionConfirmationDialog(commitSessionInfo: CommitSessionInfo) {
    // language=HTML
    return html`
      <backend-ai-dialog id="commit-session-dialog" fixed backdrop>
        <span slot="title">${_t('session.CommitSession')}</span>
        <div slot="content" class="vertical layout center flex">
          <span style="font-size:14px;margin:auto 20px;">${_t('session.DescCommitSession')}</span>
          <mwc-list style="width:100%">
            <mwc-list-item twoline noninteractive class="commit-session-info">
                <span class="subheading">Session Name</span>
                <span class="monospace" slot="secondary">
                  ${commitSessionInfo?.session?.name ? commitSessionInfo.session.name : '-'}
                </span>
            </mwc-list-item>
            <mwc-list-item twoline noninteractive class="commit-session-info">
                <span class="subheading">Session Id</span>
                <span class="monospace" slot="secondary">
                  ${commitSessionInfo?.session?.id ? commitSessionInfo.session.id : '-'}
                </span>
            </mwc-list-item>
            <mwc-list-item twoline noninteractive class="commit-session-info">
              <span class="subheading"><strong>Environment and Version</strong></span>
              <span class="monospace" slot="secondary">
                ${commitSessionInfo ? html`
                  <lablup-shields app="${commitSessionInfo.environment === '' ? '-' : commitSessionInfo.environment}"
                    color="blue"
                    description="${commitSessionInfo.version === '' ? '-' : commitSessionInfo.version}"
                    ui="round"
                    class="right-below-margin"></lablup-shields>
                    `: html``}
              </span>
            </mwc-list-item>
            <mwc-list-item twoline noninteractive class="commit-session-info">
              <span class="subheading">Tags</span>
              <span class="monospace horizontal layout" slot="secondary">
                ${commitSessionInfo ? commitSessionInfo?.tags?.map((tag) =>
                  html`
                    <lablup-shields app=""
                      color="green"
                      description="${tag}"
                      ui="round"
                      class="right-below-margin"></lablup-shields>
                  `) : html`
                    <lablup-shields app=""
                      color="green"
                      description="-"
                      ui="round"
                      style="right-below-margin"></lablup-shields>`}
              </span>
            </mwc-list-item>
          </mwc-list>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
              unelevated
              class="ok"
              ?disabled="${commitSessionInfo?.environment === ''}"
              @click=${() => this._requestCommitSession(commitSessionInfo)}
              label="${_t('button.Commit')}"></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }

  _parseSessionInfoToCommitSessionInfo(kernelImageStr: string = '', sessionName: string = '', sessionId: string = '') {
    const emptyKernelImageArr = ['', ''];
    const [environment, rawVersion] = kernelImageStr ? kernelImageStr.split(':') : emptyKernelImageArr;
    const [version, ...tags] = rawVersion ? rawVersion.split('-') : emptyKernelImageArr;
    return {
      environment: environment,
      version: version,
      tags: tags,
      session: {
        name: sessionName,
        id: sessionId,
      }
    } as CommitSessionInfo;
  }

  render() {
    // language=HTML
    return html`
      <div class="layout horizontal center filters">
        <div id="multiple-action-buttons" style="display:none;">
          <wl-button outlined class="multiple-action-button" style="margin:8px;--button-shadow-color:0;--button-shadow-color-hover:0;" @click="${() => this._openTerminateSelectedSessionsDialog()}">
            <wl-icon style="--icon-size: 20px;">delete</wl-icon>
            ${_t('session.Terminate')}
          </wl-button>
        </div>
        <span class="flex"></span>
        <div class="vertical layout">
          <wl-textfield id="access-key-filter" type="search" maxLength="64"
                      label="${_t('general.AccessKey')}" no-label-float .value="${this.filterAccessKey}"
                      style="display:none;margin-right:20px;"
                      @change="${(e) => this._updateFilterAccessKey(e)}">
          </wl-textfield>
          <span id="access-key-filter-helper-text">${_t('maxLength.64chars')}</span>
        </div>
      </div>
      <div class="list-wrapper">
        <vaadin-grid id="list-grid" theme="row-stripes column-borders compact wrap-cell-content" aria-label="Session list"
          .items="${this.compute_sessions}" height-by-rows>
          ${this._isRunning ? html`
            <vaadin-grid-column frozen width="40px" flex-grow="0" text-align="center" .renderer="${this._boundCheckboxRenderer}">
            </vaadin-grid-column>
          ` : html``}
          <vaadin-grid-column frozen width="40px" flex-grow="0" header="#" .renderer="${this._indexRenderer}"></vaadin-grid-column>
          ${this.is_admin ? html`
            <vaadin-grid-filter-column frozen path="${this._connectionMode === 'API' ? 'access_key' : 'user_email'}"
                                      header="${this._connectionMode === 'API' ? 'API Key' : 'User ID'}" resizable
                                      .renderer="${this._boundUserInfoRenderer}">
            </vaadin-grid-filter-column>
          ` : html``}
          <vaadin-grid-filter-column frozen path="${this.sessionNameField}" auto-width header="${_t('session.SessionInfo')}" resizable
                                     .renderer="${this._boundSessionInfoRenderer}">
          </vaadin-grid-filter-column>
          <vaadin-grid-filter-column width="120px" path="status" header="${_t('session.Status')}" resizable
                                     .renderer="${this._boundStatusRenderer}">
          </vaadin-grid-filter-column>
          <vaadin-grid-column width=${this._isContainerCommitEnabled ? "260px": "210px"} flex-grow="0" resizable header="${_t('general.Control')}"
                              .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
          <vaadin-grid-column auto-width flex-grow="0" resizable header="${_t('session.Configuration')}"
                              .renderer="${this._boundConfigRenderer}"></vaadin-grid-column>
          <vaadin-grid-column width="120px" flex-grow="0" resizable header="${_t('session.Usage')}"
                              .renderer="${this._boundUsageRenderer}">
          </vaadin-grid-column>
          <vaadin-grid-sort-column resizable auto-width flex-grow="0" header="${_t('session.Reservation')}"
                                   path="created_at" .renderer="${this._boundReservationRenderer}">
          </vaadin-grid-sort-column>
          <vaadin-grid-filter-column width="110px" path="architecture" header="${_t('session.Architecture')}" resizable
                                     .renderer="${this._boundArchitectureRenderer}">
          </vaadin-grid-filter-column>
          ${this._isIntegratedCondition ? html`
            <vaadin-grid-filter-column path="type" width="120px" flex-grow="0" text-align="center" header="${_t('session.launcher.SessionType')}" resizable .renderer="${this._boundSessionTypeRenderer}"></vaadin-grid-filter-column>
        ` : html``}
          ${this.is_superadmin ? html`
            <vaadin-grid-column auto-width flex-grow="0" resizable header="${_t('session.Agent')}"
                                .renderer="${this._boundAgentRenderer}">
            </vaadin-grid-column>
                ` : html``}
          </vaadin-grid>
          <backend-ai-list-status id="list-status" status_condition="${this.list_condition}" message="${_text('session.NoSessionToDisplay')}"></backend-ai-list-status>
        </div>
      </div>
      <div class="horizontal center-justified layout flex" style="padding: 10px;">
        <mwc-icon-button
          class="pagination"
          id="previous-page"
          icon="navigate_before"
          ?disabled="${this.current_page === 1}"
          @click="${(e) => this._updateSessionPage(e)}"></mwc-icon-button>
        <wl-label style="padding-top: 5px; width:auto; text-align:center;">
        ${this.current_page} / ${Math.ceil(this.total_session_count / this.session_page_limit)}</wl-label>
        <mwc-icon-button
          class="pagination"
          id="next-page"
          icon="navigate_next"
          ?disabled="${this.total_session_count <= this.session_page_limit * this.current_page}"
          @click="${(e) => this._updateSessionPage(e)}"></mwc-icon-button>
      </div>
      <backend-ai-dialog id="work-dialog" narrowLayout scrollable fixed backdrop>
        <span slot="title" id="work-title"></span>
        <div slot="action">
          <mwc-icon-button fab flat inverted icon="refresh" @click="${(e) => this._refreshLogs()}">
          </mwc-icon-button>
        </div>
        <div slot="content" id="work-area" style="overflow:scroll;"></div>
        <iframe id="work-page" frameborder="0" border="0" cellspacing="0"
                style="border-style: none;display: none;width: 100%;"></iframe>
      </backend-ai-dialog>
      <backend-ai-dialog id="terminate-session-dialog" fixed backdrop>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>${_t('usersettings.SessionTerminationDialog')}</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <wl-button class="warning fg red" inverted flat @click="${() => this._terminateSessionWithCheck(true)}">
            ${_t('button.ForceTerminate')}
          </wl-button>
          <span class="flex"></span>
          <wl-button class="cancel" inverted flat @click="${(e) => this._hideDialog(e)}">${_t('button.Cancel')}
          </wl-button>
          <wl-button class="ok" @click="${() => this._terminateSessionWithCheck()}">${_t('button.Okay')}</wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="terminate-selected-sessions-dialog" fixed backdrop>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>${_t('usersettings.SessionTerminationDialog')}</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <wl-button class="warning fg red" inverted flat
                      @click="${() => this._terminateSelectedSessionsWithCheck(true)}">${_t('button.ForceTerminate')}
          </wl-button>
          <span class="flex"></span>
          <wl-button class="cancel" inverted flat @click="${(e) => this._hideDialog(e)}">${_t('button.Cancel')}
          </wl-button>
          <wl-button class="ok" @click="${() => this._terminateSelectedSessionsWithCheck()}">${_t('button.Okay')}
          </wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="status-detail-dialog" narrowLayout fixed backdrop>
        <span slot="title">${_t('session.StatusInfo')}</span>
        <div slot="content" id="status-detail"></div>
      </backend-ai-dialog>
      ${this._renderCommitSessionConfirmationDialog(
        this._parseSessionInfoToCommitSessionInfo(this.commitSessionDialog?.kernelImage, this.commitSessionDialog?.sessionName, this.commitSessionDialog?.sessionId))}
    `;
  }

  _updateSessionPage(e) {
    const page_action = e.target;

    if (page_action.id === 'previous-page') {
      this.current_page -= 1;
    } else {
      this.current_page += 1;
    }
    this.refreshList();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-session-list': BackendAiSessionList;
  }
}
