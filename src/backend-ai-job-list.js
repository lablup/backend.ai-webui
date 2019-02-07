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
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-progress/paper-progress';

import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-icons/vaadin-icons.js';
import '@polymer/paper-toast/paper-toast';
import './backend-ai-styles.js';
import './backend-ai-indicator.js';

import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';


class BackendAIJobList extends PolymerElement {
  static get is() {
    return 'backend-ai-job-list';
  }

  static get properties() {
    return {
      visible: {
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
      }
    };
  }

  ready() {
    super.ready();
  }

  connectedCallback() {
    super.connectedCallback();
    afterNextRender(this, function () {
    });
  }

  static get observers() {
    return [
      '_menuChanged(visible)'
    ]
  }

  _menuChanged(visible) {
    if (!visible) {
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
    if (this.visible !== true) {
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
    ;

    let fields = ["sess_id", "lang", "created_at", "terminated_at", "status", "occupied_slots", "cpu_used", "io_read_bytes", "io_write_bytes"];
    let q, v;
    if (window.backendaiclient.is_admin == true) {
      q = `query($ak:String, $status:String) {` +
        `  compute_sessions(access_key:$ak, status:$status) { ${fields.join(" ")} }` +
        '}';
      v = {'status': status, 'ak': window.backendaiclient._config.accessKey};
    } else {
      q = `query($status:String) {` +
        `  compute_sessions(status:$status) { ${fields.join(" ")} }` +
        '}';
      v = {'status': status};
    }
    window.backendaiclient.gql(q, v).then(response => {
      var sessions = response.compute_sessions;
      if (sessions !== undefined && sessions.length != 0) {
        Object.keys(sessions).map((objectKey, index) => {
          var session = sessions[objectKey];
          var occupied_slots = JSON.parse(session.occupied_slots);
          sessions[objectKey].cpu_slot = parseInt(occupied_slots.cpu);
          sessions[objectKey].mem_slot = parseInt(window.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem, 'g'));
          if ('cuda.device' in occupied_slots) {
            sessions[objectKey].gpu_slot = parseInt(occupied_slots['cuda.device']);
          }
          if ('cuda.shares' in occupied_slots) {
            sessions[objectKey].vgpu_slot = parseInt(occupied_slots['cuda.shares']);
          }
        });
      }
      this.compute_sessions = sessions;
      //this.jobs = response;
      let refreshTime;
      if (this.visible === true) {
        if (this.condition === 'running') {
          refreshTime = 5000;
          setTimeout(() => {
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

  async _open_wsproxy() {
    if (window.backendaiclient == undefined || window.backendaiclient == null) {
      return false;
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
      uri: 'http://127.0.0.1:5050/conf'
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
    let rqst = {
      method: 'GET',
      uri: 'http://127.0.0.1:5050/proxy/' + kernelId
    };
    return this.sendRequest(rqst)
      .then((response) => {
        if (response.code !== 404) {
          let rqst = {
            method: 'GET',
            uri: 'http://127.0.0.1:5050/proxy/' + kernelId + '/delete'
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

  _runJupyter(e) {
    const termButton = e.target;
    const controls = e.target.closest('#controls');
    const kernelId = controls.kernelId;
    if (window.backendaiwsproxy == undefined || window.backendaiwsproxy == null) {
      this.$.indicator.start();
      this._open_wsproxy()
        .then((response) => {
          this.$.indicator.set(40, 'Preparing connection...');
          let rqst = {
            method: 'GET',
            uri: 'http://127.0.0.1:5050/proxy/' + kernelId
          };
          return this.sendRequest(rqst)
        })
        .then((response) => {
          this.$.indicator.set(80, 'Adding kernel to socket queue...');
          let rqst = {
            method: 'GET',
            uri: 'http://127.0.0.1:5050/proxy/' + kernelId + '/add'
          };
          return this.sendRequest(rqst);
        })
        .then((response) => {
          if (response.proxy) {
            console.log('http://' + response.proxy + '/tree');
            this.$.indicator.set(100, 'Prepared.');
            setTimeout(() => {
              window.open('http://' + response.proxy + '/tree', '_blank');
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
    if (window.backendaiwsproxy == undefined || window.backendaiwsproxy == null) {
      this.$.indicator.start();
      this._open_wsproxy()
        .then((response) => {
          this.$.indicator.set(40, 'Preparing connection...');
          let rqst = {
            method: 'GET',
            uri: 'http://127.0.0.1:5050/proxy/' + kernelId
          };
          return this.sendRequest(rqst)
        })
        .then((response) => {
          this.$.indicator.set(80, 'Adding kernel to socket queue...');
          let rqst = {
            method: 'GET',
            uri: 'http://127.0.0.1:5050/proxy/' + kernelId + '/add'
          };
          return this.sendRequest(rqst);
        })
        .then((response) => {
          if (response.proxy) {
            console.log('http://' + response.proxy + '/terminals/1');
            this.$.indicator.set(100, 'Prepared.');
            setTimeout(() => {
              this.$.indicator.end();
              window.open('http://' + response.proxy + '/terminals/1', '_blank');
              //window.open('http://'+response.proxy + '/tree', '_blank', 'nodeIntegration=no');
            }, 1000);
          }
        });
      console.log("Jupyter proxy loaded: ");
      console.log(kernelId);
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
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" items="[[compute_sessions]]">
        <vaadin-grid-column width="40px" flex-grow="0" resizable>
          <template class="header">#</template>
          <template>[[_indexFrom1(index)]]</template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Job ID</template>
          <template>
            <div class="indicator">[[item.sess_id]]</div>
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
              <paper-icon-button disabled class="fg"
                                 icon="assignment"></paper-icon-button>
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
    `;
  }
}

customElements.define(BackendAIJobList.is, BackendAIJobList);
