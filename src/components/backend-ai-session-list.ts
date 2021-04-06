/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultArray, CSSResultOrNative, customElement, html, property} from 'lit-element';
import {render} from 'lit-html';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-tree-column';
import '@vaadin/vaadin-grid/vaadin-grid-tree-toggle';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-icons/vaadin-icons';

import {default as AnsiUp} from '../lib/ansiup';
import 'weightless/button';
import 'weightless/checkbox';
import 'weightless/icon';
import 'weightless/textfield';

import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-menu';
import '@material/mwc-textfield/mwc-textfield';

import {default as PainKiller} from './backend-ai-painkiller';
import './lablup-loading-spinner';
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
  @property({type: Object}) _boundSessionInfoRenderer = this.sessionInfoRenderer.bind(this);
  @property({type: Object}) _boundCheckboxRenderer = this.checkboxRenderer.bind(this);
  @property({type: Object}) _boundUserInfoRenderer = this.userInfoRenderer.bind(this);
  @property({type: Object}) _boundStatusRenderer = this.statusRenderer.bind(this);
  @property({type: Boolean}) refreshing = false;
  @property({type: Boolean}) is_admin = false;
  @property({type: Boolean}) is_superadmin = false;
  @property({type: String}) _connectionMode = 'API';
  @property({type: Object}) _grid = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) terminateSessionDialog = Object();
  @property({type: Object}) terminateSelectedSessionsDialog = Object();
  @property({type: Boolean}) enableScalingGroup = false;
  @property({type: Object}) spinner = Object();
  @property({type: Object}) refreshTimer = Object();
  @property({type: Object}) kernel_labels = Object();
  @property({type: Object}) kernel_icons = Object();
  @property({type: Object}) indicator = Object();
  @property({type: Proxy}) statusColorTable = new Proxy({
    'idle-timeout': 'green',
    'user-requested': 'green',
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

  constructor() {
    super();
    this._selected_items = [];
    this.terminationQueue = [];
  }

  static get styles(): CSSResultOrNative | CSSResultArray {
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

        img.indicator-icon {
          width: 16px;
          height: 16px;
          padding-right: 5px;
        }

        wl-button.pagination {
          width: 15px;
          height: 15px;
          padding: 10 10px;
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

        mwc-icon-button.apps {
          --mdc-icon-button-size: 48px;
          --mdc-icon-size: 36px;
          padding: 3px;
          margin-right: 5px;
        }

        #work-dialog {
          --component-height: calc(100vh - 50px);
          right: 0;
          top: 50px;
        }

        @media screen and (max-width: 899px) {
          #work-dialog,
          #work-dialog.mini_ui {
            left: 0;
            --component-width: 100%;
          }
        }

        @media screen and (min-width: 900px) {
          #work-dialog {
            left: 100px;
            --component-width: calc(100% - 50px);
          }

          #work-dialog.mini_ui {
            left: 40px;
            --component-width: calc(100% - 50px);
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
          width: 70px !important;
        }

        div.configuration wl-icon {
          padding-right: 5px;
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
          --label-font-family: Roboto, Noto, sans-serif;
        }

        lablup-progress-bar.usage {
          --progress-bar-height: 5px;
          --progress-bar-width: 60px;
          margin-bottom: 0;
        }

        div.filters #access-key-filter {
          --input-font-size: small;
          --input-label-font-size: small;
          --input-font-family: Roboto, Noto, sans-serif;
        }

        .mount-button,
        .status-button {
          border: none;
          background: none;
          padding: 0;
          outline-style: none;
        }

        span#access-key-filter-helper-text {
          margin-top: 3px;
          font-size: 10px;
          color: var(--general-menu-color-2);
        }
      `];
  }

  get _isRunning() {
    return this.condition === 'running';
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

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this._grid = this.shadowRoot.querySelector('#list-grid');
    this.refreshTimer = null;
    fetch('resources/image_metadata.json').then(
      (response) => response.json()
    ).then(
      (json) => {
        this.imageInfo = json.imageInfo;
        for (const key in this.imageInfo) {
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
    );
    this.notification = globalThis.lablupNotification;
    this.terminateSessionDialog = this.shadowRoot.querySelector('#terminate-session-dialog');
    this.terminateSelectedSessionsDialog = this.shadowRoot.querySelector('#terminate-selected-sessions-dialog');
    document.addEventListener('backend-ai-group-changed', (e) => this.refreshList(true, false));
    document.addEventListener('backend-ai-ui-changed', (e) => this._refreshWorkDialogUI(e));
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
    this.spinner.show();
    let status: any;
    status = 'RUNNING';
    switch (this.condition) {
    case 'running':
      status = ['RUNNING', 'RESTARTING', 'TERMINATING', 'PENDING', 'PREPARING', 'PULLING'];
      break;
    case 'finished':
      status = ['TERMINATED', 'CANCELLED']; // TERMINATED, CANCELLED
      break;
    case 'others':
      status = ['TERMINATING', 'ERROR']; // "ERROR", "CANCELLED"..
      // Refer https://github.com/lablup/backend.ai-manager/blob/master/src/ai/backend/manager/models/kernel.py#L30-L67
      break;
    default:
      status = ['RUNNING', 'RESTARTING', 'TERMINATING', 'PENDING', 'PREPARING', 'PULLING'];
    }
    if (globalThis.backendaiclient.supports('detailed-session-states')) {
      status = status.join(',');
    }

    const fields = [
      'id', 'name', 'image',
      'created_at', 'terminated_at', 'status', 'status_info',
      'service_ports', 'mounts',
      'occupied_slots', 'access_key'
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

    globalThis.backendaiclient.computeSession.list(fields, status, this.filterAccessKey, this.session_page_limit, (this.current_page - 1) * this.session_page_limit, group_id, 10 * 1000).then((response) => {
      this.spinner.hide();
      this.total_session_count = response.compute_session_list.total_count;
      if (this.total_session_count === 0) {
        this.total_session_count = 1;
      }
      const sessions = response.compute_session_list.items;
      // console.log(sessions);
      if (sessions !== undefined && sessions.length != 0) {
        const previousSessions = this.compute_sessions;

        const previousSessionKeys: any = [];
        Object.keys(previousSessions).map((objectKey, index) => {
          previousSessionKeys.push(previousSessions[objectKey][this.sessionNameField]);
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
          } else {
            sessions[objectKey].app_services = [];
          }
          if (sessions[objectKey].app_services.length === 0 || this.condition != 'running') {
            sessions[objectKey].appSupport = false;
          } else {
            sessions[objectKey].appSupport = true;
          }

          if (this.condition === 'running') {
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
          if (this._selected_items.includes(sessions[objectKey][this.sessionNameField])) {
            sessions[objectKey].checked = true;
          } else {
            sessions[objectKey].checked = false;
          }
        });
      }
      this.compute_sessions = sessions;
      this.requestUpdate();
      let refreshTime;
      this.refreshing = false;
      if (this.active === true) {
        if (refresh === true) {
          // console.log("refresh!!");
          const event = new CustomEvent('backend-ai-resource-refreshed', {'detail': {}});
          document.dispatchEvent(event);
        }
        if (repeat === true) {
          refreshTime = this.condition === 'running' ? 5000 : 30000;
          this.refreshTimer = setTimeout(() => {
            this._refreshJobData();
          }, refreshTime);
        }
      }
    }).catch((err) => {
      this.refreshing = false;
      if (this.active && repeat) {
        // Keep trying to fetch session list with more delay
        const refreshTime = this.condition === 'running' ? 20000 : 120000;
        this.refreshTimer = setTimeout(() => {
          this._refreshJobData();
        }, refreshTime);
      }
      this.spinner.hide();
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
    if (e.detail.hasOwnProperty('mini-ui') && e.detail['mini-ui'] === true) {
      work_dialog.classList.add('mini_ui');
    } else {
      work_dialog.classList.remove('mini_ui');
    }
  }

  /**
   * Return human readable time.
   *
   * @param {any} d - date
   * */
  _humanReadableTime(d: any) {
    d = new Date(d);
    return d.toLocaleString();
  }

  /**
   * Get kernel information - category, tag, color.
   *
   * @param {string} lang - session language
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

  _terminateApp(sessionName) {
    const accessKey = globalThis.backendaiclient._config.accessKey;
    const rqst = {
      method: 'GET',
      uri: this._getProxyURL() + 'proxy/' + accessKey + '/' + sessionName
    };
    return this.sendRequest(rqst)
      .then((response) => {
        this.total_session_count -= 1;
        const accessKey = globalThis.backendaiclient._config.accessKey;
        if (response !== undefined && response.code !== 404) {
          const rqst = {
            method: 'GET',
            uri: this._getProxyURL() + 'proxy/' + accessKey + '/' + sessionName + '/delete'
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

  _getProxyURL() {
    let url = 'http://127.0.0.1:5050/';
    if (globalThis.__local_proxy !== undefined) {
      url = globalThis.__local_proxy;
    } else if (globalThis.backendaiclient._config.proxyURL !== undefined) {
      url = globalThis.backendaiclient._config.proxyURL;
    }
    return url;
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

  // Single session closing
  _openTerminateSessionDialog(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const sessionName = controls['session-name'];
    const accessKey = controls['access-key'];
    this.terminateSessionDialog.sessionName = sessionName;
    this.terminateSessionDialog.accessKey = accessKey;
    this.terminateSessionDialog.show();
  }

  _terminateSession(e) {
    const controls = e.target.closest('#controls');
    const sessionName = controls['session-name'];
    const accessKey = controls['access-key'];

    if (this.terminationQueue.includes(sessionName)) {
      this.notification.text = 'Already terminating the session.';
      this.notification.show();
      return false;
    }
    return this._terminateKernel(sessionName, accessKey);
  }

  _terminateSessionWithCheck(e) {
    if (this.terminationQueue.includes(this.terminateSessionDialog.sessionName)) {
      this.notification.text = 'Already terminating the session.';
      this.notification.show();
      return false;
    }
    this.spinner.show();
    return this._terminateKernel(this.terminateSessionDialog.sessionName, this.terminateSessionDialog.accessKey).then((response) => {
      this.spinner.hide();
      this._selected_items = [];
      this._clearCheckboxes();
      this.terminateSessionDialog.hide();
      this.notification.text = _text('session.SessionTerminated');
      this.notification.show();
      const event = new CustomEvent('backend-ai-resource-refreshed', {'detail': 'running'});
      document.dispatchEvent(event);
    }).catch((err) => {
      this.spinner.hide();
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

  _terminateSelectedSessionsWithCheck() {
    this.spinner.show();
    const terminateSessionQueue = this._selected_items.map((item) => {
      return this._terminateKernel(item[this.sessionNameField], item.access_key);
    });
    this._selected_items = [];
    return Promise.all(terminateSessionQueue).then((response) => {
      this.spinner.hide();
      this.terminateSelectedSessionsDialog.hide();
      this._clearCheckboxes();
      this.shadowRoot.querySelector('#multiple-action-buttons').style.display = 'none';
      this.notification.text = _text('session.SessionsTerminated');
      this.notification.show();
    }).catch((err) => {
      this.spinner.hide();
      this.terminateSelectedSessionsDialog.hide();
      this._clearCheckboxes();
      this.notification.text = PainKiller.relieve('Problem occurred during termination.');
      this.notification.show(true, err);
    });
  }

  /**
   * Terminate selected sessions without check.
   * */
  _terminateSelectedSessions() {
    this.spinner.show();
    const terminateSessionQueue = this._selected_items.map((item) => {
      return this._terminateKernel(item[this.sessionNameField], item.access_key);
    });
    return Promise.all(terminateSessionQueue).then((response) => {
      this.spinner.hide();
      this._selected_items = [];
      this._clearCheckboxes();
      this.shadowRoot.querySelector('#multiple-action-buttons').style.display = 'none';
      this.notification.text = _text('session.SessionsTerminated');
      this.notification.show();
    }).catch((err) => {
      this.spinner.hide();
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

  async _terminateKernel(sessionName, accessKey) {
    this.terminationQueue.push(sessionName);
    return this._terminateApp(sessionName).then(() => {
      globalThis.backendaiclient.destroy(sessionName, accessKey).then((req) => {
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
   * @param e {Event} - mouseenter the mount-button
   * @param mounts {Array} - array of the mounted folders
   * */
  _createMountedFolderDropdown(e, mounts) {
    const menuButton: HTMLElement = e.target;
    const menu = document.createElement('mwc-menu') as any;
    const regExp = /[\[\]\,\'\"]/g;

    menu.anchor = menuButton;
    menu.className = 'dropdown-menu';
    menu.style.boxShadow = '0 1px 1px rgba(0, 0, 0, 0.2)';
    menu.setAttribute('open', '');
    menu.setAttribute('fixed', '');
    menu.setAttribute('x', 10);
    menu.setAttribute('y', 15);

    if (mounts.length > 1) {
      mounts.map((key, index) => {
        if (index > 0) {
          const mountedFolderItem = document.createElement('mwc-list-item');
          mountedFolderItem.innerHTML = key.replace(regExp, '').split(' ')[0];
          mountedFolderItem.style.height = '25px';
          mountedFolderItem.style.fontWeight = '400';
          mountedFolderItem.style.fontSize = '14px';
          mountedFolderItem.style.fontFamily = 'var(--general-font-family)';

          menu.appendChild(mountedFolderItem);
        }
      });
    }
    document.body.appendChild(menu);
  }


  /**
   * Remove the dropdown menu when mouseleave the mount-button.
   * */
  _removeMountedFolderDropdown() {
    const menu = document.getElementsByClassName('dropdown-menu') as any;
    while (menu[0]) menu[0].parentNode.removeChild(menu[0]);
  }

  _createStatusDetailDropdown(e, item) {
    // console.log(item)
    const menuButton: HTMLElement = e.target;
    const menu = document.createElement('mwc-menu') as any;

    menu.anchor = menuButton;
    menu.className = 'dropdown-menu-status-detail';
    menu.style.boxShadow = '0 1px 1px rgba(0, 0, 0, 0.2)';
    menu.setAttribute('open', '');
    menu.setAttribute('fixed', '');
    menu.setAttribute('x', 10);
    menu.setAttribute('y', 15);

    const statusDetailItem = document.createElement('mwc-list-item');
    statusDetailItem.innerHTML = item.status_info;
    statusDetailItem.style.height = '25px';
    statusDetailItem.style.fontWeight = '400';
    statusDetailItem.style.fontStyle = 'oblique';
    statusDetailItem.style.fontSize = '14px';
    statusDetailItem.style.fontFamily = 'var(--general-font-family)';
    menu.appendChild(statusDetailItem);

    document.body.appendChild(menu);
  }

  _removeStatusDetailDropdown() {
    const menu = document.getElementsByClassName('dropdown-menu-status-detail') as any;
    while (menu[0]) menu[0].parentNode.removeChild(menu[0]);
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
        <div class="layout vertical start">
          <div>${rowData.item[this.sessionNameField]}</div>
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
                                style="margin-top:3px;margin-right:3px;"></lablup-shields>
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
                                  style="margin-top:3px;margin-right:3px;"></lablup-shields>
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
                              style="margin-top:3px;margin-right:3px;"></lablup-shields>
            </div>
          `: html``}
          </div>
        </div>
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
        <div id="controls" class="layout horizontal flex center"
             .session-uuid="${rowData.item.id}"
             .session-name="${rowData.item[this.sessionNameField]}"
             .access-key="${rowData.item.access_key}"
             .kernel-image="${rowData.item.kernel_image}"
             .app-services="${rowData.item.app_services}">
          ${rowData.item.appSupport ? html`
            <mwc-icon-button class="fg controls-running green"
                               @click="${(e) => this._showAppLauncher(e)}"
                               ?disabled="${!mySession}"
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
            <mwc-icon-button class="fg red controls-running"
                               icon="power_settings_new" @click="${(e) => this._openTerminateSessionDialog(e)}"></mwc-icon-button>
          ` : html``}
          ${(this._isRunning && !this._isPreparing(rowData.item.status)) || this._APIMajorVersion > 4 ? html`
            <mwc-icon-button class="fg blue controls-running" icon="assignment"
                               @click="${(e) => this._showLogs(e)}"
                               icon="assignment"></mwc-icon-button>
          ` : html`
            <mwc-icon-button fab flat inverted disabled class="fg controls-running" icon="assignment"></mwc-icon-button>
          `}
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
    render(
      html`
        ${rowData.item.scaling_group ? html`
        <div class="layout horizontal center flex">
          <div class="layout horizontal configuration">
            <wl-icon class="fg green indicator">work</wl-icon>
            <span>${rowData.item.scaling_group}</span>
            <span class="indicator">RG</span>
          </div>
        </div>` : html``}
        <div class="layout horizontal center flex">
          <div class="layout horizontal configuration">
            <wl-icon class="fg green indicator">developer_board</wl-icon>
            <span>${rowData.item.cpu_slot}</span>
            <span class="indicator">${_t('session.core')}</span>
          </div>
          <div class="layout horizontal configuration">
            <wl-icon class="fg green indicator">memory</wl-icon>
            <span>${rowData.item.mem_slot}</span>
            <span class="indicator">GB</span>
          </div>
        </div>
        <div class="layout horizontal center flex">
          <div class="layout horizontal configuration">
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
          <div class="layout horizontal configuration">
            <wl-icon class="fg green indicator">folder_open</wl-icon>
              ${rowData.item.mounts.length > 0 ? html`
                <button class="mount-button"
                  @mouseenter="${(e) => this._createMountedFolderDropdown(e, rowData.item.mounts)}"
                  @mouseleave="${() => this._removeMountedFolderDropdown()}"
                >
                  ${rowData.item.mounts[0].replace(/[\[\]\,\'\"]/g, '').split(' ')[0]}
                </button>
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
    if (this.condition === 'running') {
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

  _toggleCheckbox(object) {
    const exist = this._selected_items.findIndex((x) => x[this.sessionNameField] == object[this.sessionNameField]);
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
    render(
      html`
        <div class="layout vertical">
          <span class="indicator">${this._connectionMode === 'API' ? rowData.item.access_key : rowData.item.user_email}</span>
        </div>
      `, root
    );
  }

  statusRenderer(root, column?, rowData?) {
    render(
      html`
        <span style="font-size: 12px;">${rowData.item.status}</span>
        ${rowData.item.status_info ? html`
        <br />
        <div class="layout horizontal">
        <lablup-shields id="${rowData.item.name}" app="" color="${this.statusColorTable[rowData.item.status_info]}"
              description="${rowData.item.status_info}" ui="round"
              @mouseenter="${(e) => this._createStatusDetailDropdown(e, rowData.item)}"
              @mouseleave="${() => this._removeStatusDetailDropdown()}"></lablup-shields>
        </div>
        ` : html``}
      `, root
    );
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <div class="layout horizontal center filters">
        <div id="multiple-action-buttons" style="display:none;">
          <wl-button outlined class="multiple-action-button" @click="${() => this._openTerminateSelectedSessionsDialog()}">
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

      <vaadin-grid id="list-grid" theme="row-stripes column-borders compact" aria-label="Session list"
         .items="${this.compute_sessions}" height-by-rows>
        ${this._isRunning ? html`
          <vaadin-grid-column width="40px" flex-grow="0" text-align="center" .renderer="${this._boundCheckboxRenderer}">
          </vaadin-grid-column>
        ` : html``}
        <vaadin-grid-column width="40px" flex-grow="0" header="#" .renderer="${this._indexRenderer}"></vaadin-grid-column>
        ${this.is_admin ? html`
          <vaadin-grid-sort-column resizable width="130px" header="${this._connectionMode === 'API' ? 'API Key' : 'User ID'}" flex-grow="0" path="access_key" .renderer="${this._boundUserInfoRenderer}">
          </vaadin-grid-sort-column>
        ` : html``}
        <vaadin-grid-column width="150px" resizable header="${_t('session.SessionInfo')}" .renderer="${this._boundSessionInfoRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-column width="90px" flex-grow="0" header="${_t('session.Status')}" resizable .renderer="${this._boundStatusRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-column width="210px" flex-grow="0" header="${_t('general.Control')}" .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
        <vaadin-grid-column width="160px" flex-grow="0" resizable header="${_t('session.Configuration')}" .renderer="${this._boundConfigRenderer}"></vaadin-grid-column>
        <vaadin-grid-column width="120px" flex-grow="0" resizable header="${_t('session.Usage')}" .renderer="${this._boundUsageRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-sort-column resizable auto-width flex-grow="0" header="${_t('session.Reservation')}" path="created_at">
          <template>
            <div class="layout vertical">
              <span>[[item.created_at_hr]]</span>
              <span>([[item.elapsed]])</span>
            </div>
          </template>
        </vaadin-grid-sort-column>
        ${this.is_superadmin ? html`
          <vaadin-grid-column auto-width flex-grow="0" resizable header="${_t('session.Agent')}">
            <template>
              <div class="layout vertical">
                <span>[[item.agent]]</span>
              </div>
            </template>
          </vaadin-grid-column>
            ` : html``}
      </vaadin-grid>
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
            <wl-button class="cancel" inverted flat @click="${(e) => this._hideDialog(e)}">${_t('button.Cancel')}</wl-button>
            <wl-button class="ok" @click="${(e) => this._terminateSessionWithCheck(e)}">${_t('button.Okay')}</wl-button>
         </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="terminate-selected-sessions-dialog" fixed backdrop>
         <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
         <div slot="content">
            <p>${_t('usersettings.SessionTerminationDialog')}</p>
         </div>
         <div slot="footer" class="horizontal end-justified flex layout">
            <wl-button class="cancel" inverted flat @click="${(e) => this._hideDialog(e)}">${_t('button.Cancel')}</wl-button>
            <wl-button class="ok" @click="${() => this._terminateSelectedSessionsWithCheck()}">${_t('button.Okay')}</wl-button>
         </div>
      </backend-ai-dialog>
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
