/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {translate as _t, get as _text} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {render} from 'lit-html';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-progress-bar/vaadin-progress-bar';
import '@material/mwc-textfield/mwc-textfield';

import {default as AnsiUp} from '../lib/ansiup';
import 'weightless/button';
import 'weightless/card';
import 'weightless/checkbox';
import 'weightless/dialog';
import 'weightless/icon';
import 'weightless/textfield';
import 'weightless/title';
import '@material/mwc-icon-button';

import {default as PainKiller} from "./backend-ai-painkiller";
import './lablup-loading-spinner';
import '../plastics/lablup-shields/lablup-shields';

import JsonToCsv from '../lib/json_to_csv';
import {BackendAiStyles} from './backend-ai-general-styles';
import {BackendAIPage} from './backend-ai-page';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

@customElement("backend-ai-session-list")
export default class BackendAiSessionList extends BackendAIPage {
  public shadowRoot: any;

  @property({type: Boolean}) active = true;
  @property({type: String}) condition = 'running';
  @property({type: Object}) jobs = Object();
  @property({type: Array}) compute_sessions = Array();
  @property({type: Array}) terminationQueue = Array();
  @property({type: String}) filterAccessKey = '';
  @property({type: String}) sessionNameField = 'session_name';
  @property({type: Array}) appSupportList = Array();
  @property({type: Object}) appTemplate = Object();
  @property({type: Object}) imageInfo = Object();
  @property({type: Array}) _selected_items = Array();
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);
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
  @property({type: Object}) exportToCsvDialog = Object();
  @property({type: Boolean}) enableScalingGroup = false;
  @property({type: Object}) spinner = Object();
  @property({type: Object}) refreshTimer = Object();
  @property({type: Object}) kernel_labels = Object();
  @property({type: Object}) indicator = Object();
  @property({type: Object}) _defaultFileName = '';
  @property({type: Proxy}) statusColorTable = new Proxy({
    'idle-timeout': 'green',
    'user-requested': 'green',
    'failed-to-start': 'red',
    'creation-failed': 'red',
    'self-terminated': 'green'
  }, {
    get: (obj, prop) => {
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
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 300px);
        }

        paper-item {
          height: 30px;
          --paper-item-min-height: 30px;
        }

        wl-icon.indicator {
          --icon-size: 16px;
        }

        wl-icon.pagination {
          color: var(--paper-grey-700);
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
          --dialog-height: calc(100vh - 130px);
          right: 0;
          top: 50px;
        }

        #app-dialog {
          --dialog-width: 330px;
        }

        #ssh-dialog {
          --dialog-width: 330px;
        }

        @media screen and (max-width: 899px) {
          #work-dialog,
          #work-dialog.mini_ui {
            left: 0;
            --dialog-width: 100%;
          }
        }

        @media screen and (min-width: 900px) {
          #work-dialog {
            left: 100px;
            --dialog-width: calc(100% - 220px);
          }

          #work-dialog.mini_ui {
            left: 40px;
            --dialog-width: calc(100% - 102px);
          }
        }

        #work-area {
          width: 100%;
          padding: 5px;
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

        .app-icon {
          margin-left: 5px;
          margin-right: 5px;
        }

        div.configuration {
          width: 70px !important;
        }

        div.configuration wl-icon {
          padding-right: 5px;
        }

        .app-icon .label {
          display: block;
          width: 80px;
          text-align: center;
          height: 25px;
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

        wl-dialog wl-textfield {
          padding: 10px 0px;
          --input-font-family: Roboto, Noto, sans-serif;
          --input-font-size: 12px;
          --input-color-disabled: #bbbbbb;
          --input-label-color-disabled: #222222;
          --input-label-font-size: 12px;
          --input-border-style-disabled: 1px solid #cccccc;
        }

        wl-label {
          width: 100%;
          background-color: color: var(--paper-grey-500);
          min-width: 60px;
          font-size: 12px;
          --label-font-family: Roboto, Noto, sans-serif;
        }

        wl-label.unlimited {
          margin: 12px 0px;
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

        mwc-textfield {
          width: 100%;
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--paper-green-600);
        }

        div.filters #access-key-filter {
          --input-font-size: small;
          --input-label-font-size: small;
          --input-font-family: Roboto, Noto, sans-serif;
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

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this._grid = this.shadowRoot.querySelector('#list-grid');
    this._initializeAppTemplate();
    this.refreshTimer = null;
    fetch('resources/image_metadata.json').then(
      response => response.json()
    ).then(
      json => {
        this.imageInfo = json.imageInfo;
        for (let key in this.imageInfo) {
          this.kernel_labels[key] = [];
          if ("label" in this.imageInfo[key]) {
            this.kernel_labels[key] = this.imageInfo[key].label;
          } else {
            this.kernel_labels[key] = [];
          }
        }
      }
    );
    this.notification = globalThis.lablupNotification;
    this.terminateSessionDialog = this.shadowRoot.querySelector('#terminate-session-dialog');
    this.terminateSelectedSessionsDialog = this.shadowRoot.querySelector('#terminate-selected-sessions-dialog');
    this.exportToCsvDialog = this.shadowRoot.querySelector('#export-to-csv');
    this._defaultFileName = new Date().toISOString().substring(0, 10) + '_'
      + new Date().toTimeString().slice(0, 8).replace(/:/gi, '-');

    document.addEventListener('backend-ai-group-changed', (e) => this.refreshList(true, false));
    document.addEventListener('backend-ai-ui-changed', (e) => this._refreshWorkDialogUI(e));
    this._refreshWorkDialogUI({"detail": {"mini-ui": globalThis.mini_ui}});

    /* TODO: json to csv file converting */
    document.addEventListener('backend-ai-csv-file-export-session', () => {
      this._openExportToCsvDialog();
    });
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
          this.shadowRoot.querySelector('#access-key-filter').parentNode.removeChild(this.shadowRoot.querySelector('#access-key-filter'));
          this.shadowRoot.querySelector('vaadin-grid').style.height = 'calc(100vh - 200px)!important';
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
        this.shadowRoot.querySelector('#access-key-filter').parentNode.removeChild(this.shadowRoot.querySelector('#access-key-filter'));
        this.shadowRoot.querySelector('vaadin-grid').style.height = 'calc(100vh - 200px)!important';
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
    }
  }

  _initializeAppTemplate() {
    fetch('resources/app_template.json').then(
      response => response.json()
    ).then(
      json => {
        this.appTemplate = json.appTemplate;
      }
    );
  }

  refreshList(refresh = true, repeat = true) {
    return this._refreshJobData(refresh, repeat);
  }

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
      case "running":
        status = ["RUNNING", "RESTARTING", "TERMINATING", "PENDING", "PREPARING", "PULLING"];
        break;
      case "finished":
        status = ["TERMINATED", "CANCELLED"]; //TERMINATED, CANCELLED
        break;
      case "others":
        status = ["TERMINATING", "ERROR"]; // "ERROR", "CANCELLED"..
        // Refer https://github.com/lablup/backend.ai-manager/blob/master/src/ai/backend/manager/models/kernel.py#L30-L67
        break;
      default:
        status = ["RUNNING", "RESTARTING", "TERMINATING", "PENDING", "PREPARING", "PULLING"];
    }
    if (globalThis.backendaiclient.supports('detailed-session-states')) {
      status = status.join(',');
    }
    let fields = [
      "session_name", "lang", "created_at", "terminated_at", "status", "status_info", "service_ports",
      "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes", "access_key"
    ];
    if (this.enableScalingGroup) {
      fields.push("scaling_group");
    }
    if (this._connectionMode === "SESSION") {
      fields.push("user_email");
    }
    if (globalThis.backendaiclient.is_superadmin) {
      fields.push("agent");
    }
    let group_id = globalThis.backendaiclient.current_group_id();

    globalThis.backendaiclient.computeSession.list(fields, status, this.filterAccessKey, this.session_page_limit, (this.current_page - 1) * this.session_page_limit, group_id).then((response) => {
      this.spinner.hide();
      this.total_session_count = response.compute_session_list.total_count;
      if (this.total_session_count === 0) {
        this.total_session_count = 1;
      }
      let sessions = response.compute_session_list.items;
      if (sessions !== undefined && sessions.length != 0) {
        let previous_sessions = this.compute_sessions;

        let previous_session_keys: any = [];
        Object.keys(previous_sessions).map((objectKey, index) => {
          previous_session_keys.push(previous_sessions[objectKey][this.sessionNameField]);
        });
        Object.keys(sessions).map((objectKey, index) => {
          let session = sessions[objectKey];
          let occupied_slots = JSON.parse(session.occupied_slots);
          const kernelImage = sessions[objectKey].lang.split('/')[2] || sessions[objectKey].lang.split('/')[1];
          sessions[objectKey].cpu_slot = parseInt(occupied_slots.cpu);
          sessions[objectKey].mem_slot = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem, 'g'));
          sessions[objectKey].mem_slot = sessions[objectKey].mem_slot.toFixed(2);
          // Readable text
          sessions[objectKey].cpu_used_time = this._automaticScaledTime(sessions[objectKey].cpu_used);
          sessions[objectKey].elapsed = this._elapsed(sessions[objectKey].created_at, sessions[objectKey].terminated_at);
          sessions[objectKey].created_at_hr = this._humanReadableTime(sessions[objectKey].created_at);
          sessions[objectKey].io_read_bytes_mb = this._byteToMB(sessions[objectKey].io_read_bytes);
          sessions[objectKey].io_write_bytes_mb = this._byteToMB(sessions[objectKey].io_write_bytes);
          let service_info = JSON.parse(sessions[objectKey].service_ports);
          if (Array.isArray(service_info) === true) {
            sessions[objectKey].app_services = service_info.map(a => a.name);
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
            //sessions[objectKey].fgpu_slot = parseFloat(occupied_slots['cuda.shares']);
            sessions[objectKey].cuda_fgpu_slot = parseFloat(occupied_slots['cuda.shares']).toFixed(2);
          }
          sessions[objectKey].kernel_image = kernelImage;
          sessions[objectKey].sessionTags = this._getKernelInfo(session.lang);
          const specs = session.lang.split('/');
          const tag = specs[specs.length - 1].split(':')[1]
          let tags = tag.split('-');
          if (tags[1] !== undefined) {
            sessions[objectKey].baseversion = tags[0];
            sessions[objectKey].baseimage = tags[1];
            sessions[objectKey].additional_reqs = tags.slice(1, tags.length).map((tag) => tag.toUpperCase());
          } else {
            sessions[objectKey].baseversion = sessions[objectKey].tag;
          }
          if (this._selected_items.includes(sessions[objectKey][this.sessionNameField])) {
            sessions[objectKey].checked = true;
          } else {
            sessions[objectKey].checked = false;
          }
        });
      }
      this.compute_sessions = sessions;
      let refreshTime;
      this.refreshing = false;
      if (this.active === true) {
        if (refresh === true) {
          //console.log("refresh!!");
          var event = new CustomEvent("backend-ai-resource-refreshed", {"detail": {}});
          document.dispatchEvent(event);
        }
        if (repeat === true) {
          if (this.condition === 'running') {
            refreshTime = 5000;
          } else {
            refreshTime = 30000;
          }
          this.refreshTimer = setTimeout(() => {
            this._refreshJobData()
          }, refreshTime);
        }
      }
    }).catch(err => {
      this.spinner.hide();
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  _refreshWorkDialogUI(e) {
    let work_dialog = this.shadowRoot.querySelector('#work-dialog');
    if (e.detail.hasOwnProperty('mini-ui') && e.detail['mini-ui'] === true) {
      work_dialog.classList.add('mini_ui');
    } else {
      work_dialog.classList.remove('mini_ui');
    }
  }

  _humanReadableTime(d: any) {
    d = new Date(d);
    return d.toLocaleString();
  }

  _getKernelInfo(lang) {
    let tags: any = [];
    if (lang === undefined) return [];
    const specs = lang.split('/');
    let name = (specs[2] || specs[1]).split(':')[0];
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

  _byteToMB(value) {
    return Math.floor(value / 1000000);
  }

  _byteToGB(value) {
    return Math.floor(value / 1000000000);
  }

  _MBToGB(value) {
    return value / 1024;
  }

  _automaticScaledTime(value: number) { // number: msec.
    let result = Object();
    let unitText = ['D', 'H', 'M', 'S'];
    let unitLength = [(1000 * 60 * 60 * 24), (1000 * 60 * 60), (1000 * 60), 1000];

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

  _elapsed(start, end) {
    return globalThis.backendaiclient.utils.elapsedTime(start, end);
  }

  _indexRenderer(root, column, rowData) {
    let idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  async sendRequest(rqst) {
    let resp, body;
    try {
      if (rqst.method == 'GET') {
        rqst.body = undefined;
      }
      resp = await fetch(rqst.uri, rqst);
      let contentType = resp.headers.get('Content-Type');
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
      //console.log(e);
    }
    return body;
  }

  _terminateApp(sessionName) {
    let accessKey = globalThis.backendaiclient._config.accessKey;
    let rqst = {
      method: 'GET',
      uri: this._getProxyURL() + 'proxy/' + accessKey + "/" + sessionName
    };
    return this.sendRequest(rqst)
      .then((response) => {
        this.total_session_count -= 1;
        let accessKey = globalThis.backendaiclient._config.accessKey;
        if (response !== undefined && response.code !== 404) {
          let rqst = {
            method: 'GET',
            uri: this._getProxyURL() + 'proxy/' + accessKey + "/" + sessionName + '/delete'
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

  _showLogs(e) {
    const controls = e.target.closest('#controls');
    const sessionName = controls['session-name'];
    const accessKey = controls['access-key'];

    globalThis.backendaiclient.getLogs(sessionName, accessKey).then((req) => {
      const ansi_up = new AnsiUp();
      let logs = ansi_up.ansi_to_html(req.result.logs);
      setTimeout(() => {
        this.shadowRoot.querySelector('#work-title').innerHTML = `${sessionName}`;
        this.shadowRoot.querySelector('#work-area').innerHTML = `<pre>${logs}</pre>` || _text('session.NoLogs');
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
    const sessionName = this.shadowRoot.querySelector('#work-dialog').sessionName;
    const accessKey = this.shadowRoot.querySelector('#work-dialog').accessKey;
    globalThis.backendaiclient.getLogs(sessionName, accessKey).then((req) => {
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
    const sessionName = controls['session-name'];
    const accessKey = controls['access-key'];
    const appServices = controls['app-services'];
    this.appSupportList = [];
    appServices.forEach((elm) => {
      if (elm in this.appTemplate) {
        if (elm !== 'sshd' || (elm === 'sshd' && globalThis.isElectron)) {
          this.appTemplate[elm].forEach((app) => {
            this.appSupportList.push(app);
          });
        }
      } else {
        if (!['ttyd', 'ipython'].includes(elm)) { // They are default apps from Backend.AI agent.
          this.appSupportList.push({
            'name': elm,
            'title': elm,
            'redirect': "",
            'src': './resources/icons/default_app.svg'
          });
        }
      }
    });
    let dialog = this.shadowRoot.querySelector('#app-dialog');
    dialog.setAttribute('session-name', sessionName);
    dialog.setAttribute('access-key', accessKey);
    dialog.positionTarget = e.target;

    this.shadowRoot.querySelector('#app-dialog').show();
  }

  _hideAppLauncher() {
    this.shadowRoot.querySelector('#app-dialog').hide();
  }

  async _open_wsproxy(sessionName, app = 'jupyter', port: number | null = null) {
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      return false;
    }

    let param = {
      endpoint: globalThis.backendaiclient._config.endpoint
    };
    if (globalThis.backendaiclient._config.connectionMode === 'SESSION') {
      param['mode'] = "SESSION";
      param['session'] = globalThis.backendaiclient._config._session_id;
    } else {
      param['mode'] = "DEFAULT";
      param['access_key'] = globalThis.backendaiclient._config.accessKey;
      param['secret_key'] = globalThis.backendaiclient._config.secretKey;
    }
    param['api_version'] = globalThis.backendaiclient.APIMajorVersion;
    if (port !== null && port > 1024 && port < 65535) {
      param['port'] = port;
    }
    if (globalThis.isElectron && globalThis.__local_proxy === undefined) {
      this.indicator.end();
      this.notification.text = 'Proxy is not ready yet. Check proxy settings for detail.';
      this.notification.show();
      return Promise.resolve(false);
    }
    let rqst = {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      uri: this._getProxyURL() + 'conf'
    };
    this.indicator.set(20, 'Setting up proxy for the app...');
    try {
      let response = await this.sendRequest(rqst);
      if (response === undefined) {
        this.indicator.end();
        this.notification.text = 'Proxy configurator is not responding.';
        this.notification.show();
        return Promise.resolve(false);
      }
      let token = response.token;
      this.indicator.set(50, 'Adding kernel to socket queue...');
      let rqst_proxy = {
        method: 'GET',
        app: app,
        uri: this._getProxyURL() + 'proxy/' + token + "/" + sessionName + "/add?app=" + app
      };
      return await this.sendRequest(rqst_proxy);
    } catch (err) {
      throw err;
    }
  }

  async _runApp(e) {
    const controller = e.target;
    let controls = controller.closest('#app-dialog');
    let sessionName = controls.getAttribute('session-name');
    let urlPostfix = controller['url-postfix'];
    let appName = controller['app-name'];
    if (appName === undefined || appName === null) {
      return;
    }

    if (urlPostfix === undefined || urlPostfix === null) {
      urlPostfix = '';
    }

    if (typeof globalThis.backendaiwsproxy === "undefined" || globalThis.backendaiwsproxy === null) {
      this._hideAppLauncher();
      this.indicator = await globalThis.lablupIndicator.start();
      let port = null;
      if (appName === 'sshd') {
        port = globalThis.backendaioptions.get('custom_ssh_port', null);
      }
      this._open_wsproxy(sessionName, appName, port)
        .then((response) => {
          if (appName === 'sshd') {
            this.indicator.set(100, 'Prepared.');
            this.sshPort = response.port;
            this._readSSHKey(sessionName);
            this._openSSHDialog();
            setTimeout(() => {
              this.indicator.end();
            }, 1000);
          } else if (appName === 'vnc') {
            this.indicator.set(100, 'Prepared.');
            this.vncPort = response.port;
            this._openVNCDialog();
          } else if (response.url) {
            this.indicator.set(100, 'Prepared.');
            setTimeout(() => {
              globalThis.open(response.url + urlPostfix, '_blank');
              console.log(appName + " proxy loaded: ");
              console.log(sessionName);
            }, 1000);
          }
        });
    }
  }

  async _readSSHKey(sessionName) {
    const downloadLinkEl = this.shadowRoot.querySelector('#sshkey-download-link');
    const file = '/home/work/id_container';
    const blob = await globalThis.backendaiclient.download_single(sessionName, file);
    // TODO: This blob has additional leading letters in front of key texts.
    //       Manually trim those letters.
    const rawText = await blob.text();
    const index = rawText.indexOf('-----');
    const trimmedBlob = await blob.slice(index, blob.size, blob.type);
    downloadLinkEl.href = globalThis.URL.createObjectURL(trimmedBlob);
    downloadLinkEl.download = 'id_container';
  }

  async _runTerminal(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const sessionName = controls['session-name'];
    if (globalThis.backendaiwsproxy == undefined || globalThis.backendaiwsproxy == null) {
      this.indicator = await globalThis.lablupIndicator.start();
      this._open_wsproxy(sessionName, 'ttyd')
        .then((response) => {
          if (response.url) {
            this.indicator.set(100, 'Prepared.');
            setTimeout(() => {
              globalThis.open(response.url, '_blank');
              this.indicator.end();
              console.log("Terminal proxy loaded: ");
              console.log(sessionName);
            }, 1000);
          }
        });
    }
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

  _openSSHDialog() {
    let dialog = this.shadowRoot.querySelector('#ssh-dialog');
    dialog.show();
  }

  _openVNCDialog() {
    let dialog = this.shadowRoot.querySelector('#vnc-dialog');
    dialog.show();
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
    this.notification.text = 'Terminating session...';
    this.notification.show();
    return this._terminateKernel(sessionName, accessKey);
  }

  _terminateSessionWithCheck(e) {
    if (this.terminationQueue.includes(this.terminateSessionDialog.sessionName)) {
      this.notification.text = 'Already terminating the session.';
      this.notification.show();
      return false;
    }
    this.notification.text = 'Terminating session...';
    this.notification.show();
    return this._terminateKernel(this.terminateSessionDialog.sessionName, this.terminateSessionDialog.accessKey).then(response => {
      this._selected_items = [];
      this._clearCheckboxes();
      this.terminateSessionDialog.hide();
      this.notification.text = "Session terminated.";
      this.notification.show();
      let event = new CustomEvent("backend-ai-resource-refreshed", {"detail": 'running'});
      document.dispatchEvent(event);
    }).catch((err) => {
      this._selected_items = [];
      this._clearCheckboxes();
      this.terminateSessionDialog.hide();
      this.notification.text = PainKiller.relieve('Problem occurred during termination.');
      this.notification.show(true, err);
      let event = new CustomEvent("backend-ai-resource-refreshed", {"detail": 'running'});
      document.dispatchEvent(event);
    });
  }

  // Multiple sessions closing
  _openTerminateSelectedSessionsDialog(e?) {
    this.terminateSelectedSessionsDialog.show();
  }

  _clearCheckboxes() {
    let elm = this.shadowRoot.querySelectorAll('wl-checkbox.list-check');
    [...elm].forEach((checkbox) => {
      checkbox.removeAttribute('checked');
    });
  }

  _terminateSelectedSessionsWithCheck() {
    this.notification.text = 'Terminating sessions...';
    this.notification.show();

    let terminateSessionQueue = this._selected_items.map(item => {
      return this._terminateKernel(item[this.sessionNameField], item.access_key);
    });
    this._selected_items = [];
    return Promise.all(terminateSessionQueue).then(response => {
      this.terminateSelectedSessionsDialog.hide();
      this._clearCheckboxes();
      this.shadowRoot.querySelector("#multiple-action-buttons").style.display = 'none';
      this.notification.text = "Sessions terminated.";
      this.notification.show();

    }).catch((err) => {
      this.terminateSelectedSessionsDialog.hide();
      this._clearCheckboxes();
      this.notification.text = PainKiller.relieve('Problem occurred during termination.');
      this.notification.show(true, err);
    });
  }

  _terminateSelectedSessions() {
    this.notification.text = 'Terminating sessions...';
    this.notification.show();

    let terminateSessionQueue = this._selected_items.map(item => {
      return this._terminateKernel(item[this.sessionNameField], item.access_key);
    });
    return Promise.all(terminateSessionQueue).then(response => {
      this._selected_items = [];
      this._clearCheckboxes();
      this.shadowRoot.querySelector("#multiple-action-buttons").style.display = 'none';
      this.notification.text = "Sessions terminated.";
      this.notification.show();
    }).catch((err) => {
      this._selected_items = [];
      this._clearCheckboxes();
      this.notification.text = PainKiller.relieve('Problem occurred during termination.');
      this.notification.show(true, err);
    });
  }

  // General closing

  async _terminateKernel(sessionName, accessKey) {
    this.terminationQueue.push(sessionName);
    return this._terminateApp(sessionName).then(() => {
      globalThis.backendaiclient.destroyKernel(sessionName, accessKey).then((req) => {
        setTimeout(() => {
          this.terminationQueue = [];
          this.refreshList(true, false);
        }, 1000);
      }).catch((err) => {
        this.refreshList(true, false);
        this.notification.text = PainKiller.relieve('Problem occurred during termination.');
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
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
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

  _openExportToCsvDialog() {
    this.exportToCsvDialog.show();
  }

  sessionInfoRenderer(root, column?, rowData?) {
    render(
      html`
        <div class="layout vertical start">
          <div>${rowData.item[this.sessionNameField]}</div>
          ${rowData.item.sessionTags ? rowData.item.sessionTags.map(item => html`
            ${item.map(item => {
        if (item.category === 'Env') {
          item.category = item.tag;
        }
        if (item.category && rowData.item.baseversion) {
          item.tag = rowData.item.baseversion;
        }
        return html`
                <lablup-shields app="${item.category === undefined ? '' : item.category}" color="${item.color}" description="${item.tag}"></lablup-shields>
              `;
      })}
          `) : html``}
          ${rowData.item.additional_reqs ? html`
            <div class="layout horizontal center wrap">
              ${rowData.item.additional_reqs.map((tag) => {
        return html`
                  <lablup-shields app="" color="green" description="${tag}"></lablup-shields>
                `;
      })}
            </div>
          ` : html``}
        </div>
      `, root
    );
  }

  controlRenderer(root, column?, rowData?) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center"
             .session-name="${rowData.item[this.sessionNameField]}"
             .access-key="${rowData.item.access_key}"
             .kernel-image="${rowData.item.kernel_image}"
             .app-services="${rowData.item.app_services}">
          ${rowData.item.appSupport ? html`
            <wl-button fab flat inverted class="fg controls-running green"
                               @click="${(e) => this._showAppLauncher(e)}"
                               icon="vaadin:caret-right"><wl-icon>launch</wl-icon></wl-button>
            <wl-button fab flat inverted class="fg controls-running"
                               @click="${(e) => this._runTerminal(e)}"
                               icon="vaadin:terminal"><wl-icon>keyboard_arrow_right</wl-icon></wl-button>
          ` : html``}
          ${(this._isRunning && !this._isPreparing(rowData.item.status)) || this._APIMajorVersion > 4 ? html`
            <wl-button fab flat inverted class="fg red controls-running"
                               @click="${(e) => this._openTerminateSessionDialog(e)}"
                               icon="delete"><wl-icon>delete</wl-icon></wl-button>
          ` : html``}
          ${(this._isRunning && !this._isPreparing(rowData.item.status)) || this._APIMajorVersion > 4 ? html`
            <wl-button fab flat inverted class="fg blue controls-running" icon="assignment"
                               @click="${(e) => this._showLogs(e)}"
                               on-tap="_showLogs"><wl-icon>assignment</wl-icon></wl-button>
          ` : html`
            <wl-button fab flat inverted disabled class="fg controls-running" icon="assignment"><wl-icon>assignment</wl-icon></wl-button>
          `}
        </div>
      `, root
    );
  }

  usageRenderer(root, column?, rowData?) {
    render(
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

  _toggleCheckbox(object) {
    let exist = this._selected_items.findIndex(x => x[this.sessionNameField] == object[this.sessionNameField]);
    if (exist === -1) {
      this._selected_items.push(object)
    } else {
      this._selected_items.splice(exist, 1);
    }
    if (this._selected_items.length > 0) {
      this.shadowRoot.querySelector("#multiple-action-buttons").style.display = 'block';
    } else {
      this.shadowRoot.querySelector("#multiple-action-buttons").style.display = 'none';
    }
  }

  _toggleDialogCheckbox(e) {
    let checkbox = e.target;
    let dateFrom = this.shadowRoot.querySelector('#date-from');
    let dateTo = this.shadowRoot.querySelector('#date-to');

    dateFrom.disabled = checkbox.checked;
    dateTo.disabled = checkbox.checked;
  }

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

  userInfoRenderer(root, column?, rowData?) {
    render(
      html`
        <div class="layout vertical">
          <span class="indicator">${this._connectionMode === "API" ? rowData.item.access_key : rowData.item.user_email}</span>
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
        <lablup-shields app="" color="${this.statusColorTable[rowData.item.status_info]}" description="${rowData.item.status_info}"></lablup-shields>
        ` : html``}
      `, root
    );
  }

  _getFirstDateOfMonth() {
    let date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 2).toISOString().substring(0, 10);
  }

  _getDefaultCSVFileName() {
    let date = new Date().toISOString().substring(0, 10);
    let time = new Date().toTimeString().slice(0, 8).replace(/:/gi, '-');
    return date + '_' + time;
  }

  _validateDateRange() {
    let dateTo = this.shadowRoot.querySelector('#date-to');
    let dateFrom = this.shadowRoot.querySelector('#date-from');

    if (dateTo.value && dateFrom.value) {
      let to = new Date(dateTo.value).getTime();
      let from = new Date(dateFrom.value).getTime();
      if (to < from) {
        dateTo.value = dateFrom.value;
      }
    }
  }

  _exportToCSV() {
    let fileNameEl = this.shadowRoot.querySelector('#export-file-name');

    if (!fileNameEl.validity.valid) {
      return;
    }

    let group_id = globalThis.backendaiclient.current_group_id();
    let fields = ["session_name", "lang", "created_at", "terminated_at", "status", "status_info",
      "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes", "access_key"];

    if (this._connectionMode === "SESSION") {
      fields.push("user_email");
    }
    if (globalThis.backendaiclient.is_superadmin) {
      fields.push("agent");
    }

    globalThis.backendaiclient.computeSession.listAll(fields, this.filterAccessKey, group_id).then((response) => {
      let sessions = response.compute_sessions;
      JsonToCsv.exportToCsv(fileNameEl.value, sessions);

      this.notification.text = "Downloading CSV file..."
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
    //     // TODO : new backendaiclien.computeSession query will be added (date range)
    //     console.log('Session between ' , dateFrom.value, ' ~ ', dateTo.value, " will be downloaded.");
    //   }
    // }
  }

  render() {
    // language=HTML
    return html`
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <div class="layout horizontal center filters">
        <div id="multiple-action-buttons" style="display:none;">
          <wl-button outlined class="multiple-action-button" @click="${() => this._openTerminateSelectedSessionsDialog()}">
            <wl-icon style="--icon-size: 20px;">delete</wl-icon>
            ${_t("session.Terminate")}
          </wl-button>
        </div>
        <span class="flex"></span>
        <wl-textfield id="access-key-filter" type="search" size=30
                     label="${_t("general.AccessKey")}" no-label-float .value="${this.filterAccessKey}"
                     style="display:none"
                     on-change="_updateFilterAccessKey">
        </wl-textfield>
      </div>

      <vaadin-grid id="list-grid" theme="row-stripes column-borders compact" aria-label="Session list"
         .items="${this.compute_sessions}" height-by-rows>
        ${this._isRunning ? html`
          <vaadin-grid-column width="40px" flex-grow="0" text-align="center" .renderer="${this._boundCheckboxRenderer}">
          </vaadin-grid-column>
        ` : html``}
        <vaadin-grid-column width="40px" flex-grow="0" header="#" .renderer="${this._indexRenderer}"></vaadin-grid-column>
        ${this.is_admin ? html`
          <vaadin-grid-sort-column resizable width="130px" header="${this._connectionMode === "API" ? 'API Key' : 'User ID'}" flex-grow="0" path="access_key" .renderer="${this._boundUserInfoRenderer}">
          </vaadin-grid-sort-column>
        ` : html``}
        <vaadin-grid-column width="150px" resizable header="${_t("session.SessionInfo")}" .renderer="${this._boundSessionInfoRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-column width="90px" flex-grow="0" header="${_t("session.Status")}" resizable .renderer="${this._boundStatusRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-column width="160px" flex-grow="0" header="${_t("general.Control")}" .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
        <vaadin-grid-column width="160px" flex-grow="0" header="${_t("session.Configuration")}" resizable>
          <template>
            <template is="dom-if" if="[[item.scaling_group]]">
            <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <wl-icon class="fg green indicator">work</wl-icon>
                <span>[[item.scaling_group]]</span>
                <span class="indicator">RG</span>
              </div>
            </div>
            </template>
            <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <wl-icon class="fg green indicator">developer_board</wl-icon>
                <span>[[item.cpu_slot]]</span>
                <span class="indicator">${_t("session.core")}</span>
              </div>
              <div class="layout horizontal configuration">
                <wl-icon class="fg green indicator">memory</wl-icon>
                <span>[[item.mem_slot]]</span>
                <span class="indicator">GB</span>
              </div>
            </div>
            <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <template is="dom-if" if="[[item.cuda_gpu_slot]]">
                  <img class="indicator-icon fg green" src="/resources/icons/file_type_cuda.svg" />
                  <span>[[item.cuda_gpu_slot]]</span>
                  <span class="indicator">GPU</span>
                </template>
                <template is="dom-if" if="[[!item.cuda_gpu_slot]]">
                  <template is="dom-if" if="[[item.cuda_fgpu_slot]]">
                    <img class="indicator-icon fg green" src="/resources/icons/file_type_cuda.svg" />
                    <span>[[item.cuda_fgpu_slot]]</span>
                    <span class="indicator">GPU</span>
                  </template>
                </template>
                <template is="dom-if" if="[[item.rocm_gpu_slot]]">
                  <img class="indicator-icon fg green" src="/resources/icons/ROCm.png" />
                  <span>[[item.rocm_gpu_slot]]</span>
                  <span class="indicator">GPU</span>
                </template>
                <template is="dom-if" if="[[item.tpu_slot]]">
                  <wl-icon class="fg green indicator">view_module</wl-icon>
                  <span>[[item.tpu_slot]]</span>
                  <span class="indicator">TPU</span>
                </template>
                <template is="dom-if" if="[[!item.cuda_gpu_slot]]">
                  <template is="dom-if" if="[[!item.cuda_fgpu_slot]]">
                    <template is="dom-if" if="[[!item.rocm_gpu_slot]]">
                      <template is="dom-if" if="[[!item.tpu_slot]]">
                        <wl-icon class="fg green indicator">view_module</wl-icon>
                        <span>-</span>
                        <span class="indicator">GPU</span>
                      </template>
                    </template>
                  </template>
                </template>
              </div>
              <div class="layout horizontal configuration">
                <wl-icon class="fg green indicator">cloud_queue</wl-icon>
                <!-- <wl-icon class="fg yellow" icon="device:storage"></wl-icon> -->
                <!-- <span>[[item.storage_capacity]]</span> -->
                <!-- <span class="indicator">[[item.storage_unit]]</span> -->
              </div>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="120px" flex-grow="0" resizable header="${_t("session.Usage")}" .renderer="${this._boundUsageRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-sort-column resizable auto-width flex-grow="0" header="${_t("session.Starts")}" path="created_at">
          <template>
            <div class="layout vertical">
              <span>[[item.created_at_hr]]</span>
            </div>
          </template>
        </vaadin-grid-sort-column>
        <vaadin-grid-column width="100px" flex-grow="0" resizable header="${_t("session.Reservation")}">
          <template>
            <div class="layout vertical">
              <span>[[item.elapsed]]</span>
            </div>
          </template>
        </vaadin-grid-column>
        ${this.is_superadmin ? html`
          <vaadin-grid-column auto-width flex-grow="0" resizable header="${_t("session.Agent")}">
            <template>
              <div class="layout vertical">
                <span>[[item.agent]]</span>
              </div>
            </template>
          </vaadin-grid-column>
            ` : html``}
      </vaadin-grid>
      <div class="horizontal center-justified layout flex" style="padding: 10px;">
        <wl-button class="pagination" id="previous-page"
                   ?disabled="${this.current_page === 1}"
                   @click="${(e) => {
      this._updateSessionPage(e)
    }}">
          <wl-icon class="pagination">navigate_before</wl-icon>
        </wl-button>
        <wl-label style="padding-top: 5px; width:auto; text-align:center;">
        ${this.current_page} / ${Math.ceil(this.total_session_count / this.session_page_limit)}</wl-label>
        <wl-button class="pagination" id="next-page"
                   ?disabled="${this.total_session_count <= this.session_page_limit * this.current_page}"
                   @click="${(e) => {
      this._updateSessionPage(e)
    }}">
          <wl-icon class="pagination">navigate_next</wl-icon>
        </wl-button>
      </div>
      <wl-dialog id="work-dialog" fixed blockscrolling scrollable
                    style="padding:0;">
        <wl-card elevation="1" class="intro" style="margin: 0; box-shadow: none; height: 100%;">
          <h3 class="horizontal center layout" style="font-weight:bold">
            <span id="work-title"></span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._refreshLogs(e)}">
              <wl-icon>refresh</wl-icon>
            </wl-button>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <div id="work-area" style="overflow:scroll;"></div>
          <iframe id="work-page" frameborder="0" border="0" cellspacing="0"
                  style="border-style: none;width: 100%;"></iframe>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="app-dialog" fixed backdrop blockscrolling
                    style="padding:0;">
        <wl-card elevation="1" class="intro" style="margin: 0; height: 100%;">
          <h4 class="horizontal center layout" style="font-weight:bold">
            <span>App</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h4>
          <div style="padding:15px;" class="horizontal layout wrap center center-justified">
          ${this.appSupportList.map(item => html`
            <div class="vertical layout center center-justified app-icon">
              <mwc-icon-button class="fg apps green" .app="${item.name}" .app-name="${item.name}"
                                 .url-postfix="${item.redirect}"
                                 @click="${(e) => this._runApp(e)}">
                <img src="${item.src}" />
              </mwc-icon-button>
              <span class="label">${item.title}</span>
            </div>
          `)}
           </div>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="ssh-dialog" fixed backdrop blockscrolling persistent
                 style="padding:0;">
        <wl-card elevation="1" class="intro" style="margin: 0; height: 100%;">
          <h4 class="horizontal center layout" style="font-weight:bold">
            <span>SSH / SFTP connection</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h4>
          <div style="padding:0 15px;" >Use your favorite SSH/SFTP application to connect.</div>
          <section class="vertical layout wrap start start-justified">
            <h4>${_t("session.ConnectionInformation")}</h4>
            <div><span>SSH URL:</span> <a href="ssh://127.0.0.1:${this.sshPort}">ssh://127.0.0.1:${this.sshPort}</a></div>
            <div><span>SFTP URL:</span> <a href="sftp://127.0.0.1:${this.sshPort}">sftp://127.0.0.1:${this.sshPort}</a></div>
            <div><span>Port:</span> ${this.sshPort}</div>
            <div><a id="sshkey-download-link" href="">Download SSH key file (id_container)</a></div>
          </section>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="vnc-dialog" fixed backdrop blockscrolling
                    style="padding:0;">
        <wl-card elevation="1" class="intro" style="margin: 0; height: 100%;">
          <h4 class="horizontal center layout" style="font-weight:bold">
            <span>${_t("session.VNCconnection")}</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h4>
          <div style="padding:0 15px;" >${_t("session.UseYourFavoriteSSHApp")}</div>
          <section class="vertical layout wrap start start-justified">
            <h4>${_t("session.ConnectionInformation")}</h4>
            <div><span>VNC URL:</span> <a href="ssh://127.0.0.1:${this.vncPort}">vnc://127.0.0.1:${this.vncPort}</a></div>
          </section>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="terminate-session-dialog" fixed backdrop blockscrolling>
         <wl-title level="3" slot="header">${_t("dialog.title.LetsDouble-Check")}</wl-title>
         <div slot="content">
            <p>${_t("session.CheckAgainDialog")}</p>
         </div>
         <div slot="footer">
            <wl-button class="cancel" inverted flat @click="${(e) => this._hideDialog(e)}">Cancel</wl-button>
            <wl-button class="ok" @click="${(e) => this._terminateSessionWithCheck(e)}">Okay</wl-button>
         </div>
      </wl-dialog>
      <wl-dialog id="terminate-selected-sessions-dialog" fixed backdrop blockscrolling>
         <wl-title level="3" slot="header">Let's double-check</wl-title>
         <div slot="content">
            <p>${_t("session.TerminatingSessionDialog")} ${_t("session.CheckAgainDialog")}</p>
         </div>
         <div slot="footer">
            <wl-button class="cancel" inverted flat @click="${(e) => this._hideDialog(e)}">${_t("button.Cancel")}</wl-button>
            <wl-button class="ok" @click="${() => this._terminateSelectedSessionsWithCheck()}">${_t("button.Okay")}</wl-button>
         </div>
      </wl-dialog>
      <wl-dialog id="export-to-csv" fixed backdrop blockscrolling>
      <wl-card elevation="1" class="intro centered login-panel" style="margin:0;">
        <h3 class="horizontal center layout" style="padding:10px;">
          <span style="margin-left:10px;">${_t("session.ExportSessionListToCSVFile")}</span>
          <div class="flex"></div>
          <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
            <wl-icon>close</wl-icon>
          </wl-button>
        </h3>
        <section style="padding: 10px;">
          <mwc-textfield id="export-file-name" label="File name" pattern="^[a-zA-Z0-9_-]+$"
                          validationMessage="Allows letters, numbers and -_."
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
          <div class="horizontal center layout" style="margin-bottom:10px;">
            <wl-icon class="warning">warning</wl-icon>
            <wl-label class="warning" for="warning">${_t("session.OnlyRecent100SessionExport")}</wl-label>
          </div>
          <div class="horizontal center layout">
            <wl-button class="fg green" type="button" inverted outlined style="width:100%;"
            @click="${this._exportToCSV}">
              <wl-icon>get_app</wl-icon>
              ${_t("session.ExportCSVFile")}
            </wl-button>
          </div>
          </section>
        </wl-card>
      </wl-dialog>
      `;
  }

  _updateSessionPage(e) {
    let page_action = e.target;
    if (page_action['role'] !== 'button') {
      page_action = e.target.closest('wl-button');
    }

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
    "backend-ai-session-list": BackendAiSessionList;
  }
}
