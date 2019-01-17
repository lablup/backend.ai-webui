/**
@license
Copyright (c) 2015-2018 Lablup Inc. All rights reserved.
 */

import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/iron-ajax/iron-ajax';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/av-icons';

import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-icons/vaadin-icons.js';
import '@polymer/paper-toast/paper-toast';
import './backend-ai-styles.js';

import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';


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
       if(!visible) { 
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
        };

        let fields = ["sess_id", "lang", "created_at", "terminated_at", "status", "mem_slot", "cpu_slot", "gpu_slot", "cpu_used", "io_read_bytes", "io_write_bytes"];
        let q, v;
        if (window.backendaiclient.is_admin == true) {
            q = `query($ak:String, $status:String) {` +
                `  compute_sessions(access_key:$ak, status:$status) { ${fields.join(" ")} }` +
                '}';
            v = { 'status': status, 'ak': window.backendaiclient._config.accessKey };
        } else {
            q = `query($status:String) {` +
                `  compute_sessions(status:$status) { ${fields.join(" ")} }` +
                '}';
            v = { 'status': status };
        }
        window.backendaiclient.gql(q, v).then(response => {
            this.jobs = response;
            if (this.visible == true) {
                setTimeout(() => { this._refreshJobData(status) }, 5000);
            }
            console.log(this.jobs);
        }).catch(err => {
            console.log(err);
            if (err && err.message) {
                this.$.notification.text = err.message;
                this.$.notification.show();
            }
        });
    }
    _isRunning() {
        return this.condition === 'running';
    }
    _isAppRunning(lang) {
        let support_kernels = [
            'lablup/python:3.6-ubuntu',
            'lablup/python-tensorflow:1.10-py36',
            'lablup/python-tensorflow:1.11-py36',
            'lablup/python-tensorflow:1.12-py36',
            'lablup/python-tensorflow:1.11-py36-gpu',
            'lablup/python-tensorflow:1.12-py36-gpu',
            'lablup/python-tensorflow:2.0-py36'
        ];
        return this.condition === 'running' && support_kernels.includes(lang);
    }
    _byteToMB(value) {
        return Math.floor(value / 1000000);
    }

    _elapsed(start, end) {
        var startDate = new Date(start);
        if (this.condition == 'running') {
            var endDate = new Date();
        } else {
            var endDate = new Date(end);
        }
        var seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000, -1);
        if (this.condition == 'running') {
            return 'Running ' + seconds + 'sec.';
        } else {
            return 'Reserved for ' + seconds + 'sec.';
        }
        return seconds;
    }

    _indexFrom1(index) {
        return index + 1;
    }

    _terminateKernel(e) {
        const termButton = e.target;
        const controls = e.target.closest('#controls');
        const kernelId = controls.kernelId;

        window.backendaiclient.destroyKernel(kernelId).then((req) => {
            termButton.setAttribute('disabled', '');
            this.$.notification.text = 'Session will soon be terminated';
            this.$.notification.show();
            setTimeout(() => { this.refreshList() }, 1000);
        }).catch(err => {
            this.$.notification.text = 'Problem occurred during termination.';
            this.$.notification.show();
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
        } catch(e) {
            console.log(e);
        }
        return body;
    }
    
    _runJupyter(e) {
        const termButton = e.target;
        const controls = e.target.closest('#controls');
        const kernelId = controls.kernelId;
        if (window.backendaiwsproxy == undefined || window.backendaiwsproxy == null) {
            this._open_wsproxy()
                .then((response) => {
                    let rqst = {
                        method: 'GET',
                        uri: 'http://127.0.0.1:5050/proxy/' + kernelId
                    };
                    return this.sendRequest(rqst)})
                .then( (response) => {
                    let rqst = {
                        method: 'GET',
                        uri: 'http://127.0.0.1:5050/proxy/' + kernelId + '/add'
                    };
                    return this.sendRequest(rqst);
                })
                .then( (response) => {
                    if (response.proxy) {
                        console.log('http://'+response.proxy + '/tree');
                        setTimeout(() => { 
                            window.open('http://'+response.proxy + '/tree', '_blank'); 
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
            this._open_wsproxy()
                .then((response) => {
                    let rqst = {
                        method: 'GET',
                        uri: 'http://127.0.0.1:5050/proxy/' + kernelId
                    };
                    return this.sendRequest(rqst)})
                .then( (response) => {
                    let rqst = {
                        method: 'GET',
                        uri: 'http://127.0.0.1:5050/proxy/' + kernelId + '/add'
                    };
                    return this.sendRequest(rqst);
                })
                .then( (response) => {
                    if (response.proxy) {
                        console.log('http://'+response.proxy + '/terminals/1');
                        setTimeout(() => { 
                            window.open('http://'+response.proxy + '/terminals/1', '_blank'); 
                            //window.open('http://'+response.proxy + '/tree', '_blank', 'nodeIntegration=no'); 
                        }, 1000);
                    }
                });
                console.log("Jupyter proxy loaded: ");
                console.log(kernelId);
        }
    }

    static get template() {
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
        </style>
        <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
        
        <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" items="[[jobs.compute_sessions]]">
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
                <template class="header">Starts</template>
                <template>
                    <div class="layout vertical">
                        <span>[[item.created_at]]</span>
                        <span class="indicator">([[_elapsed(item.created_at, item.terminated_at)]])</span>
                    </div>
                </template>
            </vaadin-grid-column>

            <vaadin-grid-column resizable>
              <template class="header">Configuration</template>
              <template>
                  <div class="layout horizontal center flex">
                      <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
                      <span>[[item.cpu_slot]]</span>
                      <span class="indicator">slot</span>
                      <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                      <span>[[item.mem_slot]]</span>
                      <span class="indicator">MB[[item.mem_unit]]</span>
                      <template is="dom-if" if="[[item.gpu_slot]]">
                        <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                        <span>[[item.gpu_slot]]</span>
                        <span class="indicator">vGPU</span>
                      </template>
                      <!-- <iron-icon class="fg yellow" icon="device:storage"></iron-icon> -->
                      <!-- <span>[[item.storage_capacity]]</span> -->
                      <!-- <span class="indicator">[[item.storage_unit]]</span> -->
                  </div>
              </template>
            </vaadin-grid-column>

            <vaadin-grid-column resizable>
              <template class="header">Using</template>
              <template>
                  <div class="layout horizontal center flex">
                      <iron-icon class="fg blue" icon="hardware:memory"></iron-icon>
                      <div class="vertical start layout">
                      <span>[[item.cpu_used]]</span>
                      <span class="indicator">msec.</span>
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
                          <paper-icon-button class="fg red controls-running" icon="delete"
                            on-tap="_terminateKernel"></paper-icon-button>
                      </template>
                  </div>
              </template>
            </vaadin-grid-column>
        </vaadin-grid>
        `;
    }
}

customElements.define(BackendAIJobList.is, BackendAIJobList);
