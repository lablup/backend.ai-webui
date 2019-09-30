/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import {render} from 'lit-html';

import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/av-icons';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-icon-button/paper-icon-button';
import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-progress-bar/vaadin-progress-bar';

import {default as AnsiUp} from '../lib/ansiup';
import 'weightless/card';
import 'weightless/dialog';
import 'weightless/checkbox';
import 'weightless/title';

import {default as PainKiller} from "./backend-ai-painkiller";
import './lablup-loading-indicator';
import './lablup-notification';
import './backend-ai-indicator';
import '../plastics/lablup-shields/lablup-shields';

import {BackendAiStyles} from './backend-ai-console-styles';
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
  @property({type: Array}) appSupportList = Array();
  @property({type: Object}) appTemplate = Object();
  @property({type: Array}) _selected_items = Array();
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);
  @property({type: Object}) _boundSessionInfoRenderer = this.sessionInfoRenderer.bind(this);
  @property({type: Object}) _boundCheckboxRenderer = this.checkboxRenderer.bind(this);
  @property({type: Object}) _boundUserInfoRenderer = this.userInfoRenderer.bind(this);
  @property({type: Object}) _boundStatusRenderer = this.statusRenderer.bind(this);
  @property({type: Boolean}) refreshing = false;
  @property({type: Boolean}) is_admin = false;
  @property({type: String}) _connectionMode = 'API';
  @property({type: Object}) _grid = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) terminateSessionDialog = Object();
  @property({type: Object}) terminateSelectedSessionsDialog = Object();
  @property({type: Boolean}) enableScalingGroup = false;
  @property({type: Object}) loadingIndicator = Object();
  @property({type: Object}) refreshTimer = Object();
  @property({type: Object}) statusColorTable = {
    'idle-timeout': 'green',
    'user-requested': 'green',
    'failed-to-start': 'red',
    'creation-failed': 'red',
    'self-terminated': 'green'
  };

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
          height: calc(100vh - 240px);
        }

        paper-item {
          height: 30px;
          --paper-item-min-height: 30px;
        }

        iron-icon {
          width: 16px;
          height: 16px;
          min-width: 16px;
          min-height: 16px;
          padding: 0;
        }

        wl-button > wl-icon {
          --icon-size: 24px;
          padding: 0;
        }

        wl-icon {
          --icon-size: 16px;
          padding: 0;
        }

        paper-icon-button.controls-running {
          --paper-icon-button: {
            width: 25px;
            height: 25px;
            min-width: 25px;
            min-height: 25px;
            padding: 3px;
            margin-right: 5px;
          };
        }

        paper-icon-button.apps {
          --paper-icon-button: {
            width: 50px;
            height: 50px;
            min-width: 50px;
            min-height: 50px;
            padding: 3px;
            margin-right: 5px;
          };
        }

        #work-dialog {
          --dialog-height: calc(100vh - 130px);
          right: 0;
          top: 50px;
        }

        @media screen and (max-width: 899px) {
          #work-dialog {
            left: 0;
            --dialog-width: 100%;
          }
        }

        @media screen and (min-width: 900px) {
          #work-dialog {
            left: 100px;
            --dialog-width: calc(100% - 220px);
          }
        }

        #work-area {
          width: 100%;
          height: calc(100vh - 120px);
          background-color: #222;
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

        div.configuration iron-icon {
          padding-right: 5px;
        }

        paper-icon-button.apps {
          width: 48px;
          height: 48px;
        }

        .app-icon .label {
          display: block;
          width: 60px;
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

        div.filters #access-key-filter {
          --paper-input-container-input: {
            font-size: small;
          };
          --paper-input-container-label: {
            font-size: small;
          };
        }
      `];
  }

  get _isRunning() {
    return this.condition === 'running';
  }

  firstUpdated() {
    this.loadingIndicator = this.shadowRoot.querySelector('#loading-indicator');
    this._grid = this.shadowRoot.querySelector('#list-grid');
    this._initializeAppTemplate();
    this.refreshTimer = null;
    if (!window.backendaiclient ||
      !window.backendaiclient.is_admin) {
      this.shadowRoot.querySelector('#access-key-filter').parentNode.removeChild(this.shadowRoot.querySelector('#access-key-filter'));
      this.shadowRoot.querySelector('vaadin-grid').style.height = 'calc(100vh - 200px)';
    }
    this.notification = window.lablupNotification;
    this.terminateSessionDialog = this.shadowRoot.querySelector('#terminate-session-dialog');
    this.terminateSelectedSessionsDialog = this.shadowRoot.querySelector('#terminate-selected-sessions-dialog');
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.is_admin = window.backendaiclient.is_admin;
        this._connectionMode = window.backendaiclient._config._connectionMode;
        this.enableScalingGroup = window.backendaiclient.supports('scaling-group');
        this._refreshJobData();
      }, true);
    } else { // already connected
      this.is_admin = window.backendaiclient.is_admin;
      this._connectionMode = window.backendaiclient._config._connectionMode;
      this.enableScalingGroup = window.backendaiclient.supports('scaling-group');
      this._refreshJobData();
    }
  }

  _initializeAppTemplate() {
    this.appTemplate = {
      'jupyter':
        [{
          'name': 'jupyter',
          'title': 'Jupyter Notebook',
          'redirect': "&redirect=/tree",
          'src': './resources/icons/jupyter.png'
        }],
      'jupyterextension':
        [{
          'name': 'jupyter',
          'title': 'Jupyter Extension',
          'redirect': "&redirect=/nbextensions",
          'src': './resources/icons/jupyter.png',
          'icon': 'vaadin:clipboard-pulse'
        }],
      'jupyterlab':
        [{
          'name': 'jupyterlab',
          'title': 'JupyterLab',
          'redirect': "&redirect=/lab",
          'src': './resources/icons/jupyterlab.png',
          'icon': 'vaadin:flask'
        }],
      'tensorboard':
        [{
          'name': 'tensorboard',
          'title': 'TensorBoard',
          'redirect': "&redirect=/",
          'src': './resources/icons/tensorflow.png'
        }],
      'digits':
        [{
          'name': 'digits',
          'title': 'DIGITS',
          'redirect': "&redirect=/",
          'src': './resources/icons/nvidia.png'
        }],
      'h2o-dai':
        [{
          'name': 'h2o-dai',
          'title': 'H2O driverless AI',
          'redirect': "",
          'src': './resources/icons/h2o.png'
        }],
      'vscode':
        [{
          'name': 'vscode',
          'title': 'Visual Studio Code',
          'redirect': "",
          'src': './resources/icons/vscode.svg'
        }],
      'nniboard':
        [{
          'name': 'nniboard',
          'title': 'NNI Board',
          'redirect': "",
          'src': './resources/icons/nni.png'
        }],
      'sftp':
        [{
          'name': 'sftp',
          'title': 'SFTP',
          'redirect': "",
          'src': './resources/icons/sftp.png'
        }],
    };
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
    this.loadingIndicator.show();
    let status: any;
    status = 'RUNNING';
    switch (this.condition) {
      case "running":
        status = ["RUNNING", "RESTARTING", "TERMINATING"];
        break;
      case "finished":
        status = ["TERMINATED", "CANCELLED"]; //TERMINATED, CANCELLED
        break;
      case "others":
        status = ["TERMINATING", "ERROR"]; // "ERROR", "CANCELLED"..
        // Refer https://github.com/lablup/backend.ai-manager/blob/master/src/ai/backend/manager/models/kernel.py#L30-L67
        break;
      default:
        status = ["RUNNING"];
    }
    if (window.backendaiclient.supports('detailed-session-states')) {
      status = status.join(',');
    }
    let fields = [
      "sess_id", "lang", "created_at", "terminated_at", "status", "status_info", "service_ports",
      "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes", "access_key"
    ];
    if (this.enableScalingGroup) {
      fields.push("scaling_group");
    }
    if (this._connectionMode === "SESSION") {
      fields.push("user_email");
    }
    window.backendaiclient.computeSession.list(fields, status, this.filterAccessKey).then((response) => {
      this.loadingIndicator.hide();
      let sessions = response.compute_session_list.items;
      if (sessions !== undefined && sessions.length != 0) {
        let previous_sessions = this.compute_sessions;
        let previous_session_keys: any = [];
        Object.keys(previous_sessions).map((objectKey, index) => {
          previous_session_keys.push(previous_sessions[objectKey].sess_id);
        });
        Object.keys(sessions).map((objectKey, index) => {
          let session = sessions[objectKey];
          let occupied_slots = JSON.parse(session.occupied_slots);
          const kernelImage = sessions[objectKey].lang.split('/')[2];
          sessions[objectKey].cpu_slot = parseInt(occupied_slots.cpu);
          sessions[objectKey].mem_slot = parseFloat(window.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem, 'g'));
          sessions[objectKey].mem_slot = sessions[objectKey].mem_slot.toFixed(2);
          // Readable text
          sessions[objectKey].cpu_used_sec = this._msecToSec(sessions[objectKey].cpu_used);
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
            sessions[objectKey].gpu_slot = parseInt(occupied_slots['cuda.device']);
          }
          if ('cuda.shares' in occupied_slots) {
            //sessions[objectKey].fgpu_slot = parseFloat(occupied_slots['cuda.shares']);
            sessions[objectKey].fgpu_slot = parseFloat(occupied_slots['cuda.shares']).toFixed(2);
          }
          sessions[objectKey].kernel_image = kernelImage;
          sessions[objectKey].sessionTags = this._getKernelInfo(session.lang);
          let tag = session.lang.split(':')[1];
          let tags = tag.split('-');
          if (tags[1] !== undefined) {
            sessions[objectKey].baseversion = tags[0];
            sessions[objectKey].baseimage = tags[1];
            if (tags[2] !== undefined) {
              sessions[objectKey].additional_req = tags[2].toUpperCase();
            }
          } else {
            sessions[objectKey].baseversion = sessions[objectKey].tag;
          }
          if (this._selected_items.includes(sessions[objectKey].sess_id)) {
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
          console.log("refresh!!");
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
      this.loadingIndicator.hide();
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.message);
        this.notification.show(true);
      }
    });
  }

  _humanReadableTime(d: any) {
    d = new Date(d);
    return d.toLocaleString();
  }

  _getKernelInfo(lang) {
    const kernel_alias = {
      'python': [
        {'category': 'Env', 'tag': 'Python', 'color': 'yellow'}],
      'python-intel': [
        {'category': 'Env', 'tag': 'Python', 'color': 'yellow'},
        {'tag': 'Intel MKL', 'color': 'green'}],
      'python-ff': [
        {'category': 'Env', 'tag': 'Lablup Research', 'color': 'yellow'},
        {'tag': 'NVidia GPU Cloud', 'color': 'green'}],
      'python-tensorflow': [
        {'category': 'Env', 'tag': 'TensorFlow', 'color': 'yellow'}],
      'python-pytorch': [
        {'category': 'Env', 'tag': 'PyTorch', 'color': 'yellow'}],
      'ngc-digits': [
        {'category': 'Env', 'tag': 'DIGITS', 'color': 'yellow'},
        {'tag': 'NVidia GPU Cloud', 'color': 'green'}],
      'ngc-tensorflow': [
        {'category': 'Env', 'tag': 'TensorFlow', 'color': 'yellow'},
        {'tag': 'NVidia GPU Cloud', 'color': 'green'}],
      'ngc-pytorch': [
        {'category': 'Env', 'tag': 'PyTorch', 'color': 'yellow'},
        {'tag': 'NVidia GPU Cloud', 'color': 'green'}],
      'julia': [
        {'category': 'Env', 'tag': 'Julia', 'color': 'yellow'}],
      'r': [
        {'category': 'Env', 'tag': 'R', 'color': 'yellow'}],
      'r-base': [
        {'category': 'Env', 'tag': 'R', 'color': 'yellow'}],
      'c': [
        {'category': 'Env', 'tag': 'C', 'color': 'yellow'}],
      'cpp': [
        {'category': 'Env', 'tag': 'C++', 'color': 'yellow'}],
      'rust': [
        {'category': 'Env', 'tag': 'Rust', 'color': 'yellow'}],
      'octave': [
        {'category': 'Env', 'tag': 'Octave', 'color': 'yellow'}],
      'swift': [
        {'category': 'Env', 'tag': 'Swift', 'color': 'yellow'}],
      'h2o': [
        {'category': 'Env', 'tag': 'H2O', 'color': 'yellow'}],
      'sftp': [
        {'category': 'Env', 'tag': 'SFTP', 'color': 'yellow'},
        {'tag': 'Backend.AI', 'color': 'green'}],
      'lablup-pytorch': [
        {'category': 'Env', 'tag': 'PyTorch', 'color': 'yellow'},
        {'tag': 'Cloudia', 'color': 'green'}],
    };
    let tags: any = [];
    if (lang === undefined) return [];
    let name = lang.split('/')[2].split(':')[0];
    if (name in kernel_alias) {
      tags.push(kernel_alias[name]);
    } else {
      tags.push([
        {'category': 'Env', 'tag': lang, 'color': 'green'}
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

  _msecToSec(value) {
    return Number(value / 1000).toFixed(0);
  }

  _elapsed(start, end) {
    return window.backendaiclient.utils.elapsedTime(start, end);
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
      console.log(e);
    }
    return body;
  }

  _terminateApp(kernelId) {
    let accessKey = window.backendaiclient._config.accessKey;
    let rqst = {
      method: 'GET',
      uri: this._getProxyURL() + 'proxy/' + accessKey + "/" + kernelId
    };
    return this.sendRequest(rqst)
      .then((response) => {
        let accessKey = window.backendaiclient._config.accessKey;
        if (response !== undefined && response.code !== 404) {
          let rqst = {
            method: 'GET',
            uri: this._getProxyURL() + 'proxy/' + accessKey + "/" + kernelId + '/delete'
          };
          return this.sendRequest(rqst);
        }
        return Promise.resolve(true);
      }).catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.notification.text = PainKiller.relieve(err.message);
          this.notification.show(true);
        }
      });
  }

  _getProxyURL() {
    let url = 'http://127.0.0.1:5050/';
    if (window.__local_proxy !== undefined) {
      url = window.__local_proxy;
    } else if (window.backendaiclient._config.proxyURL !== undefined) {
      url = window.backendaiclient._config.proxyURL;
    }
    return url;
  }

  _showLogs(e) {
    const controls = e.target.closest('#controls');
    const kernelId = controls['kernel-id'];
    const accessKey = controls['access-key'];

    window.backendaiclient.getLogs(kernelId, accessKey).then((req) => {
      const ansi_up = new AnsiUp();
      let logs = ansi_up.ansi_to_html(req.result.logs);
      setTimeout(() => {
        this.shadowRoot.querySelector('#work-title').innerHTML = `${kernelId}`;
        this.shadowRoot.querySelector('#work-area').innerHTML = `<pre>${logs}</pre>` || 'No logs.';
        this.shadowRoot.querySelector('#work-dialog').show();
      }, 100);
    }).catch((err) => {
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.message);
        this.notification.show(true);
      } else if (err && err.title) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.show(true);
      }
    });
  }

  _showAppLauncher(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const kernelId = controls['kernel-id'];
    const accessKey = controls['access-key'];
    const appServices = controls['app-services'];
    this.appSupportList = [];
    appServices.forEach((elm) => {
      if (elm in this.appTemplate) {
        this.appTemplate[elm].forEach((app) => {
          this.appSupportList.push(app);
        });
      }
    });
    let dialog = this.shadowRoot.querySelector('#app-dialog');
    dialog.setAttribute('kernel-id', kernelId);
    dialog.setAttribute('access-key', accessKey);
    dialog.positionTarget = e.target;

    this.shadowRoot.querySelector('#app-dialog').show();
  }

  _hideAppLauncher() {
    this.shadowRoot.querySelector('#app-dialog').hide();
  }

  async _open_wsproxy(kernelId, app = 'jupyter') {
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      return false;
    }

    let param = {
      endpoint: window.backendaiclient._config.endpoint
    };
    if (window.backendaiclient._config.connectionMode === 'SESSION') {
      param['mode'] = "SESSION";
      param['session'] = window.backendaiclient._config._session_id;
    } else {
      param['mode'] = "DEFAULT";
      param['access_key'] = window.backendaiclient._config.accessKey;
      param['secret_key'] = window.backendaiclient._config.secretKey;
    }
    if (window.isElectron && window.__local_proxy === undefined) {
      this.shadowRoot.querySelector('#indicator').end();
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
    this.shadowRoot.querySelector('#indicator').set(20, 'Setting up proxy fot the app...');
    try {
      let response = await this.sendRequest(rqst);
      if (response === undefined) {
        this.shadowRoot.querySelector('#indicator').end();
        this.notification.text = 'Proxy configurator is not responding.';
        this.notification.show();
        return Promise.resolve(false);
      }
      let token = response.token;
      this.shadowRoot.querySelector('#indicator').set(50, 'Adding kernel to socket queue...');
      let rqst_proxy = {
        method: 'GET',
        app: app,
        uri: this._getProxyURL() + 'proxy/' + token + "/" + kernelId + "/add?app=" + app
      };
      return await this.sendRequest(rqst_proxy);
    } catch (err) {
      throw err;
    }
  }

  _runApp(e) {
    const controller = e.target;
    let controls = controller.closest('#app-dialog');
    let kernelId = controls.getAttribute('kernel-id');
    let urlPostfix = controller['url-postfix'];
    let appName = controller['app-name'];
    if (appName === undefined || appName === null) {
      return;
    }
    if (urlPostfix === undefined || urlPostfix === null) {
      urlPostfix = '';
    }

    if (window.backendaiwsproxy == undefined || window.backendaiwsproxy == null) {
      this._hideAppLauncher();
      this.shadowRoot.querySelector('#indicator').start();
      this._open_wsproxy(kernelId, appName)
        .then((response) => {
          if (response.url) {
            this.shadowRoot.querySelector('#indicator').set(100, 'Prepared.');
            setTimeout(() => {
              window.open(response.url + urlPostfix, '_blank');
              this.shadowRoot.querySelector('#indicator').end();
              console.log(appName + " proxy loaded: ");
              console.log(kernelId);
            }, 1000);
          }
        });
    }
  }

  _runTerminal(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const kernelId = controls['kernel-id'];
    if (window.backendaiwsproxy == undefined || window.backendaiwsproxy == null) {
      this.shadowRoot.querySelector('#indicator').start();
      this._open_wsproxy(kernelId, 'ttyd')
        .then((response) => {
          if (response.url) {
            this.shadowRoot.querySelector('#indicator').set(100, 'Prepared.');
            setTimeout(() => {
              window.open(response.url, '_blank');
              this.shadowRoot.querySelector('#indicator').end();
              console.log("Terminal proxy loaded: ");
              console.log(kernelId);
            }, 1000);
          }
        });
    }
  }

  _runJupyterTerminal(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const kernelId = controls['kernel-id'];
    if (window.backendaiwsproxy == undefined || window.backendaiwsproxy == null) {
      this.shadowRoot.querySelector('#indicator').start();
      this._open_wsproxy(kernelId, 'jupyter')
        .then((response) => {
          if (response.url) {
            this.shadowRoot.querySelector('#indicator').set(100, 'Prepared.');
            setTimeout(() => {
              window.open(response.url + "&redirect=/terminals/1", '_blank');
              this.shadowRoot.querySelector('#indicator').end();
              console.log("Jupyter terminal proxy loaded: ");
              console.log(kernelId);
            }, 1000);
          }
        });
    }
  }

  // Single session closing
  _openTerminateSessionDialog(e) {
    const controller = e.target;
    const controls = controller.closest('#controls');
    const kernelId = controls['kernel-id'];
    const accessKey = controls['access-key'];
    this.terminateSessionDialog.kernelId = kernelId;
    this.terminateSessionDialog.accessKey = accessKey;
    this.terminateSessionDialog.show();
  }

  _terminateSession(e) {
    const controls = e.target.closest('#controls');
    const kernelId = controls['kernel-id'];
    const accessKey = controls['access-key'];

    if (this.terminationQueue.includes(kernelId)) {
      this.notification.text = 'Already terminating the session.';
      this.notification.show();
      return false;
    }
    this.notification.text = 'Terminating session...';
    this.notification.show();
    return this._terminateKernel(kernelId, accessKey);
  }

  _terminateSessionWithCheck(e) {
    if (this.terminationQueue.includes(this.terminateSessionDialog.kernelId)) {
      this.notification.text = 'Already terminating the session.';
      this.notification.show();
      return false;
    }
    this.notification.text = 'Terminating session...';
    this.notification.show();
    return this._terminateKernel(this.terminateSessionDialog.kernelId, this.terminateSessionDialog.accessKey).then(response => {
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
      this.notification.show(true);
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
      return this._terminateKernel(item.sess_id, item.access_key);
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
      this.notification.show(true);
    });
  }

  _terminateSelectedSessions() {
    this.notification.text = 'Terminating sessions...';
    this.notification.show();

    let terminateSessionQueue = this._selected_items.map(item => {
      return this._terminateKernel(item.sess_id, item.access_key);
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
      this.notification.show(true);
    });
  }

  // General closing

  async _terminateKernel(kernelId, accessKey) {
    this.terminationQueue.push(kernelId);
    return this._terminateApp(kernelId).then(() => {
      window.backendaiclient.destroyKernel(kernelId, accessKey).then((req) => {
        setTimeout(() => {
          this.terminationQueue = [];
          this.refreshList(true, false);
        }, 1000);
      }).catch((err) => {
        this.refreshList(true, false);
        this.notification.text = PainKiller.relieve('Problem occurred during termination.');
        this.notification.show(true);
      });
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.message);
        this.notification.show(true);
      }
    });
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  _updateFilterAccessKey(e) {
    this.filterAccessKey = e.target.value;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this._refreshJobData();
    }
  }

  sessionInfoRenderer(root, column?, rowData?) {
    render(
      html`
        <div class="layout vertical start">
            <div>${rowData.item.sess_id}</div>
              ${rowData.item.sessionTags ? rowData.item.sessionTags.map(item => html`
${item.map(item => {
        if (item.category === 'Env' && rowData.item.baseversion !== undefined) {
          item.category = item.tag;
          item.tag = rowData.item.baseversion;
        }
        return html`
            <lablup-shields app="${item.category === undefined ? '' : item.category}" color="${item.color}" description="${item.tag}"></lablup-shields>
            `
      })}
                `) : html``}
        ${rowData.item.additional_req ? html`
          <lablup-shields app="" color="blue" description="${rowData.item.additional_req}"></lablup-shields>        
          ` : html``}
        </div>`, root
    );
  }

  controlRenderer(root, column?, rowData?) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center"
             .kernel-id="${rowData.item.sess_id}"
             .access-key="${rowData.item.access_key}"
             .kernel-image="${rowData.item.kernel_image}"
             .app-services="${rowData.item.app_services}">
             ${rowData.item.appSupport ? html`
            <paper-icon-button class="fg controls-running green"
                               @click="${(e) => this._showAppLauncher(e)}"
                               icon="vaadin:caret-right"></paper-icon-button>
            <paper-icon-button class="fg controls-running"
                               @click="${(e) => this._runTerminal(e)}"
                               icon="vaadin:terminal"></paper-icon-button>
                               ` : html``}
             ${this.condition === 'running' ? html`
            <paper-icon-button class="fg red controls-running"
                               @click="${(e) => this._openTerminateSessionDialog(e)}"
                               icon="delete"></paper-icon-button>
                               ` : html``}
             ${this._isRunning ? html`
            <paper-icon-button class="fg blue controls-running" icon="assignment"
                               @click="${(e) => this._showLogs(e)}"
                               on-tap="_showLogs"></paper-icon-button>
             ` : html`
            <paper-icon-button disabled class="fg controls-running" icon="assignment"
            ></paper-icon-button>
             `}
        </div>`, root
    );
  }

  _toggleCheckbox(object) {
    let exist = this._selected_items.findIndex(x => x.sess_id == object.sess_id);
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

  checkboxRenderer(root, column?, rowData?) {
    render(
      html`
        <wl-checkbox class="list-check" style="--checkbox-size:12px;" ?checked="${rowData.item.checked === true}" @click="${() => this._toggleCheckbox(rowData.item)}"></wl-checkbox>
      `, root
    );
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

  render(); {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <div class="layout horizontal center filters">
        <div id="multiple-action-buttons" style="display:none;">
          <wl-button outlined class="multiple-action-button" @click="${() => this._openTerminateSelectedSessionsDialog()}">
            <wl-icon style="--icon-size: 20px;">delete</wl-icon>
            terminate
          </wl-button>
        </div>
        <span class="flex"></span>
        <paper-input id="access-key-filter" type="search" size=30
                     label="access key" no-label-float .value="${this.filterAccessKey}"
                     on-change="_updateFilterAccessKey">
        </paper-input>
      </div>

      <vaadin-grid id="list-grid" theme="row-stripes column-borders compact" aria-label="Session list"
         .items="${this.compute_sessions}">
        <vaadin-grid-column width="40px" flex-grow="0" text-align="center" .renderer="${this._boundCheckboxRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-column width="40px" flex-grow="0" header="#" .renderer="${this._indexRenderer}"></vaadin-grid-column>
        ${this.is_admin ? html`
          <vaadin-grid-sort-column resizable width="130px" header="${this._connectionMode === "API" ? 'API Key' : 'User ID'}" flex-grow="0" path="access_key" .renderer="${this._boundUserInfoRenderer}">
          </vaadin-grid-sort-column>
        ` : html``}
        <vaadin-grid-column width="150px" resizable header="Session Info" .renderer="$
{
  this._boundSessionInfoRenderer
}
">
        </vaadin-grid-column>
        <vaadin-grid-column width="90px" flex-grow="0" header="Status" resizable .renderer="$
{
  this._boundStatusRenderer
}
">
        </vaadin-grid-column>
        <vaadin-grid-column width="160px" flex-grow="0" header="Control" .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
        <vaadin-grid-column width="160px" flex-grow="0" header="Configuration" resizable>
          <template>
            <template is="dom-if" if="[[item.scaling_group]]">
            <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="icons:work"></iron-icon>
                <span>[[item.scaling_group]]</span>
                <span class="indicator">SG</span>
              </div>
            </div>
            </template>
            <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
                <span>[[item.cpu_slot]]</span>
                <span class="indicator">core</span>
              </div>
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                <span>[[item.mem_slot]]</span>
                <span class="indicator">GB</span>
              </div>
            </div>
            <div class="layout horizontal center flex">
              <div class="layout horizontal configuration">
                <template is="dom-if" if="[[item.gpu_slot]]">
                  <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                  <span>[[item.gpu_slot]]</span>
                  <span class="indicator">GPU</span>
                </template>
                <template is="dom-if" if="[[!item.gpu_slot]]">
                  <template is="dom-if" if="[[item.fgpu_slot]]">
                    <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                    <span>[[item.fgpu_slot]]</span>
                    <span class="indicator">GPU</span>
                  </template>
                </template>
                <template is="dom-if" if="[[!item.gpu_slot]]">
                  <template is="dom-if" if="[[!item.fgpu_slot]]">
                    <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                    <span>-</span>
                    <span class="indicator">GPU</span>
                  </template>
                </template>
              </div>
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="icons:cloud-queue"></iron-icon>
                <!-- <iron-icon class="fg yellow" icon="device:storage"></iron-icon> -->
                <!-- <span>[[item.storage_capacity]]</span> -->
                <!-- <span class="indicator">[[item.storage_unit]]</span> -->
              </div>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="120px" flex-grow="0" resizable header="Usage">
          <template>
            <div class="layout horizontal center flex">
              <iron-icon class="fg blue" icon="hardware:developer-board"></iron-icon>
              <div class="vertical start layout">
                <span>[[item.cpu_used_sec]]</span>
                <span class="indicator">sec.</span>
              </div>
              <iron-icon class="fg blue" icon="hardware:device-hub"></iron-icon>
              <div class="vertical start layout">
                <span style="font-size:8px">[[item.io_read_bytes_mb]]<span class="indicator">MB</span></span>
                <span style="font-size:8px">[[item.io_write_bytes_mb]]<span class="indicator">MB</span></span>
              </div>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-sort-column resizable header="Starts" path="created_at">
          <template>
            <div class="layout vertical">
              <span>[[item.created_at_hr]]</span>
            </div>
          </template>
        </vaadin-grid-sort-column>
        <vaadin-grid-column width="100px" flex-grow="0" resizable header="Reservation">
          <template>
            <div class="layout vertical">
              <span>[[item.elapsed]]</span>
            </div>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-indicator id="indicator"></backend-ai-indicator>
      <wl-dialog id="work-dialog" fixed blockscrolling scrollable
                    style="padding:0;">
        <wl-card elevation="1" class="intro" style="margin: 0; box-shadow: none; height: 100%;">
          <h3 class="horizontal center layout" style="font-weight:bold">
            <span id="work-title"></span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <paper-dialog-scrollable id="work-area" style="overflow:scroll;"></paper-dialog-scrollable>
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
              <paper-icon-button class="fg apps green" .app="${item.name}" .app-name="${item.name}"
                                 .url-postfix="${item.redirect}"
                                 @click="${(e) => this._runApp(e)}"
                                 src="${item.src}"></paper-icon-button>
              <span class="label">${item.title}</span>
            </div>
          `)}
           </div>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="terminate-session-dialog" fixed backdrop blockscrolling>
         <wl-title level="3" slot="header">Let's double-check</wl-title>
         <div slot="content">
            <p>This action cannot be undone. Do you want to proceed?</p>
         </div>
         <div slot="footer">
            <wl-button class="cancel" inverted flat @click="${(e) => this._hideDialog(e)}">Cancel</wl-button>
            <wl-button class="ok" @click="${(e) => this._terminateSessionWithCheck(e)}">Okay</wl-button>
         </div>
      </wl-dialog>
      <wl-dialog id="terminate-selected-sessions-dialog" fixed backdrop blockscrolling>
         <wl-title level="3" slot="header">Let's double-check</wl-title>
         <div slot="content">
            <p>You are terminating multiple sessions. This action cannot be undone. Do you want to proceed?</p>
         </div>
         <div slot="footer">
            <wl-button class="cancel" inverted flat @click="${(e) => this._hideDialog(e)}">Cancel</wl-button>
            <wl-button class="ok" @click="${() => this._terminateSelectedSessionsWithCheck()}">Okay</wl-button>
         </div>
      </wl-dialog>

`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-session-list": BackendAiSessionList;
  }
}
