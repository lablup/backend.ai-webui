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
import '@vaadin/vaadin-grid/vaadin-grid.js';

import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';


class BackendAIAgentList extends PolymerElement {
    static get is() {
        return 'backend-ai-agent-list';
    }

    static get properties() {
        return {
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
            let status = 'ALIVE';
            switch (this.condition) {
                case 'running':
                    status = 'ALIVE';
                    break;
                case 'finished':
                    status = 'TERMINATED';
                    break;
                case 'archived':
                default:
                    status = 'ALIVE';
            };
            let fields = ['id',
            'addr',
            'status',
            'first_contact',
            'mem_slots',
            'cpu_slots',
            'gpu_slots']
            let q = `query($status: String) {` +
            `  agents(status: $status) {` +
            `     ${fields.join(" ")}` +
            `  }` +
            `}`;

            let v = {'status': status};
       
            window.backendaiclient.gql(q, v).then(response => {
                this.agents = response;
                console.log(this.agents);
            }).catch(err => {
                if (err && err.message) {
                    this.$.notification.text = err.message;
                    this.$.notification.show();
                }
            });
        });
    }

    _isRunning() {
        return this.condition === 'running';
    }
    _byteToMB(value) {
        return Math.floor(value/1000000);
    }

    _MBtoGB(value) {
        return Math.floor(value/1000);
    }
    _slotToCPU(value) {
        return Math.floor(value/6);
    }
    _slotToGPU(value) {
        return Math.floor(value/2);
    }

    _elapsed(start, end) {
        var startDate = new Date(start);
        if (this.condition == 'running') {
            var endDate = new Date();
        } else {
            var endDate = new Date(end);
        }
        var seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000,-1);
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

        this._requestBot.url = '/job/kernel/terminate/' + kernelId;
        this._requestBot.method = 'delete';
        const req = this._requestBot.generateRequest();
        req.completes.then((req) => {
            termButton.setAttribute('disabled', '');
            this.$.notification.text = 'Session will soon be terminated';
            this.$.notification.show();
        }).catch((err) => {
            if (response && response.error_msg) {
                this.$.notification.text = response.error_msg;
                this.$.notification.show();
            } else {
                this.$.notification.text = err.message;
                this.$.notification.show();
            }
        });
        this._requestBot.method = 'post';
    }
    static get template() {
        return html`
        <style include="iron-flex iron-flex-alignment">
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
        <paper-toast id="notification" text=""></paper-toast>
        <vaadin-grid theme="row-stripes column-borders compact" aria-label="Job list" items="[[agents.agents]]">
            <vaadin-grid-column width="40px" flex-grow="0" resizable>
                <template class="header">#</template>
                <template>[[_indexFrom1(index)]]</template>
            </vaadin-grid-column>

            <vaadin-grid-column resizable>
                <template class="header">Endpoint</template>
                <template>
                    <div class="indicator">[[item.addr]]</div>
                </template>
            </vaadin-grid-column>

            <vaadin-grid-column resizable>
                <template class="header">Starts</template>
                <template>
                    <div class="layout vertical">
                        <span>[[item.first_contact]]</span>
                    </div>
                </template>
            </vaadin-grid-column>

            <vaadin-grid-column resizable>
              <template class="header">Resources</template>
              <template>
                  <div class="layout horizontal center flex">
                      <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
                      <span>[[_slotToCPU(item.cpu_slots)]]</span>
                      <span class="indicator">cores</span>
                      <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                      <span>[[_MBtoGB(item.mem_slots)]]</span>
                      <span class="indicator">GB[[item.mem_unit]]</span>
                      <template is="dom-if" if="[[item.gpu_slots]]">
                        <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                        <span>[[_slotToGPU(item.gpu_slots)]]</span> 
                        <span class="indicator">GPU</span>
                      </template>
                      <!-- <iron-icon class="fg yellow" icon="device:storage"></iron-icon> -->
                      <!-- <span>[[item.storage_capacity]]</span> -->
                      <!-- <span class="indicator">[[item.storage_unit]]</span> -->
                  </div>
              </template>
            </vaadin-grid-column>
            <vaadin-grid-column width="80px" flex-grow="0" resizable>
              <template class="header">Status</template>
              <template>
                  <div>
                    ALIVE
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
                      <template is="dom-if" if="[[_isRunning()]]">
                          <paper-icon-button disabled class="fg controls-running"
                                             icon="build"></paper-icon-button>
                          <paper-icon-button disabled class="fg controls-running"
                                             icon="alarm-add"></paper-icon-button>
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

customElements.define(BackendAIAgentList.is, BackendAIAgentList);
