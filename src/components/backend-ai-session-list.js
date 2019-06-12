/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/iron-ajax/iron-ajax';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/av-icons';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-progress/paper-progress';
import './lablup-loading-indicator';
import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-icons/vaadin-icons.js';
import '@vaadin/vaadin-progress-bar/vaadin-progress-bar';
import '@polymer/paper-toast/paper-toast';
import '@polymer/neon-animation/animations/slide-from-right-animation.js';
import '@polymer/neon-animation/animations/slide-right-animation.js';

import 'weightless/card';
import {BackendAiStyles} from './backend-ai-console-styles';
import {IronFlex, IronFlexAlignment, IronFlexFactors, IronPositioning} from '../layout/iron-flex-layout-classes';
import '../backend-ai-indicator.js';

class BackendAiSessionList extends LitElement {
  static get is() {
    return 'backend-ai-session-list';
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      condition: {
        type: String
      },
      jobs: {
        type: Object
      },
      compute_sessions: {
        type: Object
      },
      terminationQueue: {
        type: Array
      },
      filterAccessKey: {
        type: String
      },
      appSupportList: {
        type: Array
      },
      appTemplate: {
        type: Object
      }
    };
  }

  constructor() {
    super();
    this.active = false;
    this.condition = 'running';
    this.jobs = {};
    this.compute_sessions = {};
    this.terminationQueue = [];
    this.filterAccessKey = '';
    this.appSupportList = [];
    this.appTemplate = {};
  }

  firstUpdated() {
    this._initializeAppTemplate();
    this.refreshTimer = null;
    if (!window.backendaiclient ||
      !window.backendaiclient.is_admin) {
      this.shadowRoot.querySelector('#access-key-filter').parentNode.removeChild(this.shadowRoot.querySelector('#access-key-filter'));
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  shouldUpdate() {
    return this.active;
  }

  static get observers() {
    return [
      '_menuChanged(active)'
    ]
  }

  is_admin() {
    return window.backendaiclient.is_admin;
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name == 'active' && newval !== null) {
      this._menuChanged(true);
    } else {
      this._menuChanged(false);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }

  async _menuChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshJobData();
      }, true);
    } else { // already connected
        this._refreshJobData();
    }
  }

  _initializeAppTemplate() {
    let jupyterBase = [
      {
        'name': 'jupyter',
        'title': 'Notebook',
        'redirect': "&redirect=/tree",
        'icon': 'vaadin:notebook'
      },
      {
        'name': 'jupyterlab',
        'title': 'JupyterLab',
        'redirect': "&redirect=/lab",
        'icon': 'vaadin:flask'
      }];
    let TFBase = jupyterBase.concat(
      {
        'name': 'tensorboard',
        'title': 'TensorBoard',
        'redirect': "&redirect=/",
        'icon': 'vaadin:clipboard-pulse'
      });
    this.appTemplate = {
      'tensorflow': TFBase,
      'python': jupyterBase,
      'python-tensorflow': TFBase,
      'python-pytorch': TFBase,
      'ngc-digits':
        TFBase.concat(
          {
            'name': 'digits',
            'title': 'DIGITS',
            'redirect': "&redirect=/",
            'icon': 'vaadin:picture'
          }),
      'ngc-tensorflow': TFBase,
      'ngc-pytorch': TFBase,
      'julia': jupyterBase,
      'r': jupyterBase
    };
  }

  refreshList() {
    return this._refreshJobData(true);
  }

  _refreshJobData(refresh = false) {
    this.shadowRoot.querySelector('#loading-indicator').show();
    if (this.active !== true) {
      return;
    }
    let status = 'RUNNING';
    switch (this.condition) {
      case 'running':
        status = 'RUNNING';
        break;
      case 'finished':
        status = 'TERMINATED';
        break;
      case 'archived':
      default:
        status = 'RUNNING';
    }

    let fields = [
      "sess_id", "lang", "created_at", "terminated_at", "status",
      "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes", "access_key"
    ];
    window.backendaiclient.computeSession.list(fields, status,
      this.filterAccessKey).then((response) => {
      this.shadowRoot.querySelector('#loading-indicator').hide();

      var sessions = response.compute_sessions;
      if (sessions !== undefined && sessions.length != 0) {
        Object.keys(sessions).map((objectKey, index) => {
          var session = sessions[objectKey];
          var occupied_slots = JSON.parse(session.occupied_slots);
          const kernelImage = sessions[objectKey].lang.split('/')[2];
          sessions[objectKey].cpu_slot = parseInt(occupied_slots.cpu);
          sessions[objectKey].mem_slot = parseFloat(window.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem, 'g'));
          sessions[objectKey].mem_slot = sessions[objectKey].mem_slot.toFixed(2);

          sessions[objectKey].cpu_used_sec = this._msecToSec(sessions[objectKey].cpu_used);
          sessions[objectKey].elapsed = this._elapsed(sessions[objectKey].created_at, sessions[objectKey].terminated_at);

          if ('cuda.device' in occupied_slots) {
            sessions[objectKey].gpu_slot = parseInt(occupied_slots['cuda.device']);
          }
          if ('cuda.shares' in occupied_slots) {
            //sessions[objectKey].vgpu_slot = parseFloat(occupied_slots['cuda.shares']);
            sessions[objectKey].vgpu_slot = parseFloat(parseFloat(occupied_slots['cuda.shares']) * (1.0 / 1.0)).toFixed(2);
          }
          sessions[objectKey].kernel_image = kernelImage;
        });
      }
      this.compute_sessions = sessions;
      //this.jobs = response;
      let refreshTime;
      if (this.active === true) {
        if (refresh === true) {
          var event = new CustomEvent("backend-ai-resource-refreshed", {"detail": {}});
          document.dispatchEvent(event);
        }
        if (this.condition === 'running') {
          refreshTime = 5000;
        } else {
          refreshTime = 30000;
        }
        this.refreshTimer = setTimeout(() => {
          this._refreshJobData()
        }, refreshTime);
      }
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#notification').text = err.message;
        this.shadowRoot.querySelector('#notification').show();
      }
    });
  }

  _startProgressDialog() {
    this.shadowRoot.querySelector('#app-progress').value = 0;
    this.shadowRoot.querySelector('#app-progress-text').textContent = 'Initializing...';
    this.shadowRoot.querySelector('#app-progress-dialog').open();
  }

  _setProgressDialog(value, text = '') {
    this.shadowRoot.querySelector('#app-progress-text').textContent = text;
    this.shadowRoot.querySelector('#app-progress').value = value;
  }

  _endProgressDialog() {
    this.shadowRoot.querySelector('#app-progress-dialog').close();
  }

  _isRunning() {
    return this.condition === 'running';
  }

  _humanReadableTime(d) {
    var d = new Date(d);
    return d.toLocaleString();
  }

  _isAppRunning(lang) {
    if (this.condition != 'running') return false;
    let support_kernels = [
      'python',
      'python-tensorflow',
      'python-pytorch',
      'ngc-digits',
      'ngc-tensorflow',
      'ngc-pytorch',
      'julia',
      'r',
    ];
    //let support_kernels = this.appTemplate.keys;
    //console.log(support_kernels);
    lang = lang.split('/')[2].split(':')[0];
    //lang = lang.split('/')[3].split(':')[0];
    return this.condition === 'running' && support_kernels.includes(lang);
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
    return Number(value / 1000).toFixed(2);
  }

  _elapsed(start, end) {
    return window.backendaiclient.utils.elapsedTime(start, end);
  }

  _indexFrom1(index) {
    return index + 1;
  }

  _terminateKernel(e) {
    const termButton = e.target;
    const controls = e.target.closest('#controls');
    const kernelId = controls.kernelId;
    const accessKey = controls.accessKey;

    if (this.terminationQueue.includes(kernelId)) {
      this.shadowRoot.querySelector('#notification').text = 'Already terminating the session.';
      this.shadowRoot.querySelector('#notification').show();
      return false;
    }
    this.shadowRoot.querySelector('#notification').text = 'Terminating session...';
    this.shadowRoot.querySelector('#notification').show();
    this.terminationQueue.push(kernelId);
    this._terminateApp(kernelId).then(() => {
      window.backendaiclient.destroyKernel(kernelId, accessKey).then((req) => {
        setTimeout(() => {
          this.terminationQueue = [];
          this.refreshList();
        }, 1000);
      }).catch((err) => {
        this.shadowRoot.querySelector('#notification').text = 'Problem occurred during termination.';
        this.shadowRoot.querySelector('#notification').show();
      });
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#notification').text = err.message;
        this.shadowRoot.querySelector('#notification').show();
      }
    });
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
        if (resp.blob === undefined)
          body = await resp.buffer();  // for node-fetch
        else
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
      uri: window.backendaiclient._config.proxyURL + 'proxy/' + accessKey + "/" + kernelId
    };
    return this.sendRequest(rqst)
      .then((response) => {
        let accessKey = window.backendaiclient._config.accessKey;
        if (response !== undefined && response.code !== 404) {
          let rqst = {
            method: 'GET',
            uri: window.backendaiclient._config.proxyURL + 'proxy/' + accessKey + "/" + kernelId + '/delete'
          };
          return this.sendRequest(rqst);
        }
      }).catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.shadowRoot.querySelector('#notification').text = err.message;
          this.shadowRoot.querySelector('#notification').show();
        }
      });
  }

  _showLogs(e) {
    const controls = e.target.closest('#controls');
    const kernelId = controls.kernelId;
    const accessKey = controls.accessKey;

    window.backendaiclient.getLogs(kernelId, accessKey).then((req) => {
      setTimeout(() => {
        this.shadowRoot.querySelector('#work-title').innerHTML = `${kernelId}`;
        this.shadowRoot.querySelector('#work-area').innerHTML = `<pre>${req.result.logs}</pre>` || 'No logs.';
        this.shadowRoot.querySelector('#work-dialog').open();
      }, 100);
    }).catch((err) => {
      if (err && err.message) {
        this.shadowRoot.querySelector('#notification').text = err.message;
        this.shadowRoot.querySelector('#notification').show();
      } else if (err && err.title) {
        this.shadowRoot.querySelector('#notification').text = err.title;
        this.shadowRoot.querySelector('#notification').show();
      }
    });
  }

  _showAppLauncher(e) {
    const controls = e.target.closest('#controls');
    const kernelId = controls.kernelId;
    const accessKey = controls.accessKey;
    let imageName = controls.kernelImage.split(":")[0];
    if (imageName in this.appTemplate) {
      this.appSupportList = this.appTemplate[imageName];
    } else {
      this.appSupportList = [];
    }
    let dialog = this.shadowRoot.querySelector('#app-dialog');
    dialog.kernelId = kernelId;
    dialog.accessKey = accessKey;
    dialog.positionTarget = e.target;

    this.shadowRoot.querySelector('#app-dialog').open();
  }

  async _open_wsproxy(kernelId, app = 'jupyter') {
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      return false;
    }

    if (window.backendaiclient._config.proxyURL === undefined) {
      window.backendaiclient._config.proxyURL = 'http://127.0.0.1:5050/';
    }
    let param = {
      access_key: window.backendaiclient._config.accessKey,
      secret_key: window.backendaiclient._config.secretKey,
      endpoint: window.backendaiclient._config.endpoint
    };
    let rqst = {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      uri: window.backendaiclient._config.proxyURL + 'conf'
    };
    try {
      let response = await this.sendRequest(rqst);
      let token = response.token;
      this.$.indicator.set(50, 'Adding kernel to socket queue...');
      rqst = {
        method: 'GET',
        app: app,
        uri: window.backendaiclient._config.proxyURL + 'proxy/' + token + "/" + kernelId + "/add?app=" + app
      };
      return await this.sendRequest(rqst);
    } catch (err) {
      throw err;
    }
  }

  _runApp(e) {
    let controls = e.target.closest('#app-dialog');
    let kernelId = controls.kernelId;
    let urlPostfix = e.target.urlPostfix;
    let appName = e.target.appName;

    if (appName === undefined || appName === null) {
      return;
    }
    if (urlPostfix === undefined || urlPostfix === null) {
      urlPostfix = '';
    }

    if (window.backendaiwsproxy == undefined || window.backendaiwsproxy == null) {
      this.$.indicator.start();
      this._open_wsproxy(kernelId, appName)
        .then((response) => {
          if (response.url) {
            this.$.indicator.set(100, 'Prepared.');
            setTimeout(() => {
              window.open(response.url + urlPostfix, '_blank');
              this.$.indicator.end();
              console.log(appName + " proxy loaded: ");
              console.log(kernelId);
            }, 1000);
          }
        });
    }
  }

  _runJupyterTerminal(e) {
    const termButton = e.target;
    const controls = e.target.closest('#controls');
    const kernelId = controls.kernelId;
    let accessKey = window.backendaiclient._config.accessKey;
    if (window.backendaiwsproxy == undefined || window.backendaiwsproxy == null) {
      this.$.indicator.start();
      this._open_wsproxy(kernelId, 'jupyter')
        .then((response) => {
          if (response.url) {
            this.$.indicator.set(100, 'Prepared.');
            setTimeout(() => {
              window.open(response.url + "&redirect=/terminals/1", '_blank');
              this.$.indicator.end();
              console.log("Jupyter terminal proxy loaded: ");
              console.log(kernelId);
            }, 1000);
          }
        });
    }
  }

  _updateFilterAccessKey(e) {
    this.filterAccessKey = e.target.value;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this._refreshJobData();
    }
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

        iron-icon {
          width: 16px;
          height: 16px;
          min-width: 16px;
          min-height: 16px;
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
          height: calc(100vh - 80px);
          right: 0;
          top: 0;
          position: fixed;
          margin: 70px 0 0 0;
        }

        @media screen and (max-width: 899px) {
          #work-dialog {
            left: 0;
            width: 100%;
          }
        }

        @media screen and (min-width: 900px) {
          #work-dialog {
            left: 200px;
            width: calc(100% - 200px);
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

        div.filters #access-key-filter {
          --paper-input-container-input: {
            font-size: small;
          }
          --paper-input-container-label: {
            font-size: small;
          }
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <div class="layout horizontal center filters">
        <span class="flex"></span>
        <paper-input id="access-key-filter" type="search" size=30
                     label="access key" no-label-float .value="${this.filterAccessKey}"
                     on-change="_updateFilterAccessKey">
        </paper-input>
      </div>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" 
         .items="${this.compute_sessions}">
        <vaadin-grid-column width="40px" flex-grow="0" resizable>
          <template class="header">#</template>
          <template>[[index]]</template>
        </vaadin-grid-column>
        <template is="dom-if" if="{{is_admin}}">
          <vaadin-grid-column resizable width="100px" flex-grow="0">
            <template class="header">
              <vaadin-grid-sorter path="access_key">API Key</vaadin-grid-sorter>
            </template>
            <template>
              <div class="layout vertical">
                <span class="indicator">{{item.access_key}}</span>
              </div>
            </template>
          </vaadin-grid-column>
        </template>
        <vaadin-grid-column resizable>
          <template class="header">Job ID</template>
          <template>
            <div>[[item.sess_id]]</div>
            <div class="indicator">([[item.kernel_image]])</div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="90px">
          <template class="header">Control</template>
          <template>
            <div id="controls" class="layout horizontal flex center"
                 kernel-id="[[item.sess_id]]"
                 access-key="[[item.access_key]]"
                 kernel-image="[[item.kernel_image]]">
              <template is="dom-if" if="[[_isRunning()]]">
                <paper-icon-button class="fg blue controls-running" icon="assignment"
                                   on-tap="_showLogs"></paper-icon-button>
              </template>
              <template is="dom-if" if="[[!_isRunning()]]">
                <paper-icon-button disabled class="fg controls-running" icon="assignment"
                ></paper-icon-button>
              </template>
              <template is="dom-if" if="[[_isAppRunning(item.lang)]]">
                <paper-icon-button class="fg controls-running green"
                                   on-tap="_showAppLauncher" icon="vaadin:package"></paper-icon-button>
                <paper-icon-button class="fg controls-running"
                                   on-tap="_runJupyterTerminal" icon="vaadin:terminal"></paper-icon-button>
              </template>
              <template is="dom-if" if="[[_isRunning()]]">
                <paper-icon-button class="fg red controls-running"
                                   on-tap="_terminateKernel" icon="delete"></paper-icon-button>
              </template>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="150px" flex-grow="0" resizable>
          <template class="header">Configuration</template>
          <template>
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
                  <template is="dom-if" if="[[item.vgpu_slot]]">
                    <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                    <span>[[item.vgpu_slot]]</span>
                    <span class="indicator">vGPU</span>
                  </template>
                </template>
                <template is="dom-if" if="[[!item.gpu_slot]]">
                  <template is="dom-if" if="[[!item.vgpu_slot]]">
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

        <vaadin-grid-column width="100px" flex-grow="0" resizable>
          <template class="header">Usage</template>
          <template>
            <div class="layout horizontal center flex">
              <iron-icon class="fg blue" icon="hardware:developer-board"></iron-icon>
              <div class="vertical start layout">
                <span>[[item.cpu_used_sec]]</span>
                <span class="indicator">sec.</span>
              </div>
              <iron-icon class="fg blue" icon="hardware:device-hub"></iron-icon>
              <div class="vertical start layout">
                <span style="font-size:8px">[[_byteToMB(item.io_read_bytes)]]<span class="indicator">MB</span></span>
                <span style="font-size:8px">[[_byteToMB(item.io_write_bytes)]]<span class="indicator">MB</span></span>
              </div>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="created_at">Starts</vaadin-grid-sorter>
          </template>
          <template>
            <div class="layout vertical">
              <span>[[_humanReadableTime(item.created_at)]]</span>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="100px" flex-grow="0" resizable>
          <template class="header">
            Reservation
          </template>
          <template>
            <div class="layout vertical">
              <span>[[item.elapsed]]</span>
            </div>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-indicator id="indicator"></backend-ai-indicator>
      <paper-dialog id="work-dialog"
                    entry-animation="slide-from-right-animation" exit-animation="slide-right-animation"
                    style="padding:0;">
        <wl-card elevation="1" class="intro" style="margin: 0; box-shadow: none; height: 100%;">
          <h3 class="horizontal center layout" style="font-weight:bold">
            <span id="work-title"></span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <paper-dialog-scrollable id="work-area" style="overflow:scroll;"></paper-dialog-scrollable>
          <iframe id="work-page" frameborder="0" border="0" cellspacing="0"
                  style="border-style: none;width: 100%;"></iframe>

        </wl-card>
      </paper-dialog>
      <paper-dialog id="app-dialog"
                    style="padding:0;" no-overlap
                    horizontal-align="right"
                    vertical-align="top" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <wl-card elevation="1" class="intro" style="margin: 0; height: 100%;">
          <h4 class="horizontal center layout" style="font-weight:bold">
            <span>App</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h4>
          <div style="padding:15px;" class="horizontal layout wrap center center-justified">
              ${this.appSupportList.map(item => html`
                <div class="vertical layout center center-justified app-icon">
                  <paper-icon-button class="fg apps green" app="${item.name}" app-name="${item.name}"
                                     url-postfix="${item.redirect}"
                                     on-tap="_runApp" icon="${item.icon}"></paper-icon-button>
                  <span class="label">${item.title}</span>
                </div>
                `)}
            </div>
          </wl-card>
        </paper-dialog>
`;
  }
}

customElements.define(BackendAiSessionList.is, BackendAiSessionList);
