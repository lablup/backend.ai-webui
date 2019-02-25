/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {html, PolymerElement} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/iron-ajax/iron-ajax';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/av-icons';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-progress/paper-progress';

import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-sorter.js';
import '@vaadin/vaadin-icons/vaadin-icons.js';
import '@polymer/paper-toast/paper-toast';
import '@polymer/neon-animation/animations/slide-from-right-animation.js';
import '@polymer/neon-animation/animations/slide-right-animation.js';

import './backend-ai-styles.js';
import './backend-ai-indicator.js';

import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';


class BackendAIJobList extends PolymerElement {
  static get is() {
    return 'backend-ai-job-list';
  }

  static get properties() {
    return {
      active: {
        type: Boolean,
        value: false
      },
      condition: {
        type: String,
        default: 'running'  // finished, running, archived
      },
      jobs: {
        type: Object,
        value: {}
      },
      compute_sessions: {
        type: Object,
        value: {}
      },
      terminationQueue: {
        type: Array,
        value: []
      },
      filterAccessKey: {
        type: String,
        value: ''
      }
    };
  }

  ready() {
    super.ready();
    this.refreshTimer = null;
    if (this.condition !== 'running' || !window.backendaiclient ||
        !window.backendaiclient.is_admin) {
      this.$['access-key-filter'].parentNode.removeChild(this.$['access-key-filter']);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    afterNextRender(this, function () {
    });
  }

  shouldUpdate() {
    return this.active;
  }

  static get observers() {
    return [
      '_menuChanged(active)'
    ]
  }

  _menuChanged(active) {
    if (!active) {
      return;
    }
    // If disconnected
    if (window.backendaiclient == undefined || window.backendaiclient == null) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshJobData();
      }, true);
    } else { // already connected
      this._refreshJobData();
    }
  }

  refreshList() {
    return this._refreshJobData();
  }

  _refreshJobData() {
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
      "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes"
    ];
    window.backendaiclient.computeSession.list(fields, status,
        this.filterAccessKey).then((response) => {
      var sessions = response.compute_sessions;
      if (sessions !== undefined && sessions.length != 0) {
        Object.keys(sessions).map((objectKey, index) => {
          var session = sessions[objectKey];
          var occupied_slots = JSON.parse(session.occupied_slots);
          const kernelImage = sessions[objectKey].lang.split('/')[2];
          sessions[objectKey].cpu_slot = parseInt(occupied_slots.cpu);
          sessions[objectKey].mem_slot = parseFloat(window.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem, 'g'));
          if ('cuda.device' in occupied_slots) {
            sessions[objectKey].gpu_slot = parseInt(occupied_slots['cuda.device']);
          }
          if ('cuda.shares' in occupied_slots) {
            sessions[objectKey].vgpu_slot = parseFloat(occupied_slots['cuda.shares']);
          }
          sessions[objectKey].kernel_image = kernelImage;
        });
      }
      this.compute_sessions = sessions;
      //this.jobs = response;
      let refreshTime;
      if (this.active === true) {
        if (this.condition === 'running') {
          refreshTime = 5000;
          this.refreshTimer = setTimeout(() => {
            this._refreshJobData(status)
          }, refreshTime);
        } else {
          refreshTime = 15000;
        }
      }
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  _startProgressDialog() {
    this.$['app-progress'].value = 0;
    this.$['app-progress-text'].textContent = 'Initializing...';
    this.$['app-progress-dialog'].open();
  }

  _setProgressDialog(value, text = '') {
    this.$['app-progress-text'].textContent = text;
    this.$['app-progress'].value = value;
  }

  _endProgressDialog() {
    this.$['app-progress-dialog'].close();
  }

  _isRunning() {
    return this.condition === 'running';
  }

  _humanReadableTime(d) {
    var d = new Date(d);
    return d.toUTCString();
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
    if (this.terminationQueue.includes(kernelId)) {
      this.$.notification.text = 'Already terminating the session.';
      this.$.notification.show();
      return false;
    }
    this.$.notification.text = 'Terminating session...';
    this.$.notification.show();
    this.terminationQueue.push(kernelId);
    this._terminateApp(kernelId).then(() => {
      window.backendaiclient.destroyKernel(kernelId).then((req) => {
        setTimeout(() => {
          this.terminationQueue = [];
          this.refreshList();
        }, 1000);
      }).catch((err) => {
        this.$.notification.text = 'Problem occurred during termination.';
        this.$.notification.show();
      });
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  async _openwsproxy() {
    if (window.backendaiclient == undefined || window.backendaiclient == null) {
      return false;
    }
    if (window.backendaiclient.proxyURL === undefined) {
      window.backendaiclient.proxyURL = 'http://127.0.0.1:5050/';
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
      uri: window.backendaiclient.proxyURL + 'conf'
    };
    return this.sendRequest(rqst);
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
      uri: window.backendaiclient.proxyURL + 'proxy/' + accessKey + "/" + kernelId
    };
    return this.sendRequest(rqst)
      .then((response) => {
        let accessKey = window.backendaiclient._config.accessKey;
        if (response.code !== 404) {
          let rqst = {
            method: 'GET',
            uri: window.backendaiclient.proxyURL + 'proxy/' + accessKey + "/" + kernelId + '/delete'
          };
          return this.sendRequest(rqst);
        }
      }).catch((err) => {
        console.log(err);
        if (err && err.message) {
          this.$.notification.text = err.message;
          this.$.notification.show();
        }
      });
  }

  _showLogs(e) {
    const controls = e.target.closest('#controls');
    const kernelId = controls.kernelId;
    window.backendaiclient.getLogs(kernelId).then((req) => {
      setTimeout(() => {
        const logWindow = window.open('', '_blank', 'width=600,height=800');
        logWindow.document.head.innerHTML = `<title>${kernelId}</title>`;
        logWindow.document.body.innerHTML = `<pre>${req.result.logs}</pre>` || 'No logs.';
      }, 100);
    }).catch((err) => {
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
      } else if (err && err.title) {
        this.$.notification.text = err.title;
        this.$.notification.show();
      }
    });
  }

  _runJupyter(e) {
    const termButton = e.target;
    const controls = e.target.closest('#controls');
    const kernelId = controls.kernelId;
    if (window.backendaiwsproxy == undefined || window.backendaiwsproxy == null) {
      this.$.indicator.start();
      this._open_wsproxy()
        .then((response) => {
          this.$.indicator.set(40, 'Preparing connection...');
          let accessKey = window.backendaiclient._config.accessKey;
          let rqst = {
            method: 'GET',
            uri: window.backendaiclient.proxyURL + 'proxy/' + accessKey + "/" + kernelId
          };
          return this.sendRequest(rqst)
        })
        .then((response) => {
          this.$.indicator.set(80, 'Adding kernel to socket queue...');
          let accessKey = window.backendaiclient._config.accessKey;
          let rqst = {
            method: 'GET',
            uri: window.backendaiclient.proxyURL + 'proxy/' + accessKey + "/" + kernelId + "/add"
          };
          return this.sendRequest(rqst);
        })
        .then((response) => {
          if (response.proxy) {
            console.log(response.proxy + '/tree');
            this.$.indicator.set(100, 'Prepared.');
            setTimeout(() => {
              window.open(response.proxy + '/tree', '_blank');
              this.$.indicator.end();
              //window.open('http://'+response.proxy + '/tree', '_blank', 'nodeIntegration=no');
            }, 1000);
          }
        });
      console.log("Jupyter proxy loaded: ");
      console.log(kernelId);
    }
  }

  _runJupyterTerminal(e) {
    const termButton = e.target;
    const controls = e.target.closest('#controls');
    const kernelId = controls.kernelId;
    let accessKey = window.backendaiclient._config.accessKey;
    if (window.backendaiwsproxy == undefined || window.backendaiwsproxy == null) {
      this.$.indicator.start();
      this._open_wsproxy()
        .then((response) => {
          this.$.indicator.set(40, 'Preparing connection...');
          let rqst = {
            method: 'GET',
            uri: window.backendaiclient.proxyURL + 'proxy/' + accessKey + "/" + kernelId
          };
          return this.sendRequest(rqst)
        })
        .then((response) => {
          this.$.indicator.set(80, 'Adding kernel to socket queue...');
          let rqst = {
            method: 'GET',
            uri: window.backendaiclient.proxyURL + 'proxy/' + accessKey + "/" + kernelId + '/add'
          };
          return this.sendRequest(rqst);
        })
        .then((response) => {
          if (response.proxy) {
            console.log(response.proxy + '/terminals/1');
            this.$.indicator.set(100, 'Prepared.');
            setTimeout(() => {
              this.$.indicator.end();
              //this.$['work-area'].setAttribute('src', response.proxy + '/terminals/1');
              //this.$['work-dialog'].open();
              window.open(response.proxy + '/terminals/1', '_blank');
              //window.open('http://'+response.proxy + '/tree', '_blank', 'nodeIntegration=no');
            }, 1000);
          }
        });
      console.log("Jupyter proxy loaded: ");
      console.log(kernelId);
    }
  }

  _updateFilterAccessKey(e) {
    this.filterAccessKey = e.target.value;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this._refreshJobData();
    }
  }

  static get template() {
    // language=HTML
    return html`
      <style include="backend-ai-styles iron-flex iron-flex-alignment">
        vaadin-grid {
          border: 0;
          font-size: 14px;
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

        paper-icon-button {
          --paper-icon-button: {
            width: 25px;
            height: 25px;
            min-width: 25px;
            min-height: 25px;
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
          height: 100vh;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
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
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <div class="layout horizontal center filters">
        <span class="flex"></span>
        <paper-input id="access-key-filter" type="search" size=30
                     label="access key" no-label-float value="[[filterAccessKey]]"
                     on-change="_updateFilterAccessKey">
        </paper-input>
      </div>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" items="[[compute_sessions]]">
        <vaadin-grid-column width="40px" flex-grow="0" resizable>
          <template class="header">#</template>
          <template>[[_indexFrom1(index)]]</template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Job ID</template>
          <template>
            <div class="indicator">[[item.sess_id]]</div>
            <div class="indicator">([[item.kernel_image]])</div>
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
              <span>[[_elapsed(item.created_at, item.terminated_at)]]</span>
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
                <span>[[_msecToSec(item.cpu_used)]]</span>
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
          <template class="header">Control</template>
          <template>
            <div id="controls" class="layout horizontal flex center"
                 kernel-id="[[item.sess_id]]">
              <template is="dom-if" if="[[_isRunning()]]">
                <paper-icon-button class="fg blue controls-running" icon="assignment"
                                   on-tap="_showLogs"></paper-icon-button>
              </template>
              <template is="dom-if" if="[[_isAppRunning(item.lang)]]">
                <paper-icon-button class="fg controls-running orange"
                                   on-tap="_runJupyter" icon="vaadin:notebook"></paper-icon-button>
                <paper-icon-button class="fg controls-running"
                                   on-tap="_runJupyterTerminal" icon="vaadin:terminal"></paper-icon-button>
              </template>
              <template is="dom-if" if="[[_isRunning()]]">
                <paper-icon-button disabled class="fg controls-running"
                                   icon="av:pause"></paper-icon-button>
                <paper-icon-button class="fg red controls-running"
                                   on-tap="_terminateKernel" icon="delete"></paper-icon-button>
              </template>
            </div>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-indicator id="indicator"></backend-ai-indicator>
      <paper-dialog id="work-dialog"
                    entry-animation="slide-from-right-animation" exit-animation="slide-right-animation"
                    style="padding:0;">
        <paper-material elevation="1" class="intro" style="margin: 0; box-shadow: none; height: 100%;">
          <h3 class="horizontal center layout" style="font-weight:bold">
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <iframe id="work-area" frameborder="0" border="0" cellspacing="0"
                  style="border-style: none;width: 100%;"></iframe>
        </paper-material>
      </paper-dialog>
    `;
  }
}

customElements.define(BackendAIJobList.is, BackendAIJobList);
