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
import '@polymer/paper-toast/paper-toast';
import './backend-ai-styles.js';
import './lablup-piechart.js';
import './lablup-shields.js';

import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';

class BackendAICredentialList extends PolymerElement {

    static get is() {
        return 'backend-ai-credential-list';
    }

    static get properties() {
        return {
            condition: {
                type: String,
                default: 'active'  // active, inactive
            },
            keypairs: {
                type: Object,
                value: {}
            }
        };
    }

    ready() {
        super.ready();
        document.addEventListener('backend-ai-connected', () => {
            this._refreshKeyData();
        }, true);
    }

    connectedCallback() {
        super.connectedCallback();
        afterNextRender(this, function () {
            if (window.backendaiclient != undefined && window.backendaiclient != null) {
                this._refreshKeyData();
            }
        });
    }

    _refreshKeyData() {
        let status = 'active';
        let is_active = true;
        switch (this.condition) {
            case 'active':
                is_active = true;
                break;
            default:
                is_active = false;
        };

        let user_id = 'admin@lablup.com';
        let fields = ["access_key", 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used', 
            'concurrency_limit', 'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy'];
        let q = `query($user_id: String!, $is_active: Boolean) {` +
            `  keypairs(user_id: $user_id, is_active: $is_active) {` +
            `    ${fields.join(" ")}` +
            `  }` +
            `}`;

        let v = { 'user_id': user_id,
            'is_active': is_active,
        }

        window.backendaiclient.gql(q, v).then(response => {
            this.keypairs = response;
            //setTimeout(() => { this._refreshKeyData(status) }, 5000);
            console.log(this.keypairs);
        }).catch(err => {
            console.log(err);
            if (err && err.message) {
                this.$.notification.text = err.message;
                this.$.notification.show();
            }
        });
    }
    refresh() {
        this._refreshKeyData();
    }

    _isActive() {
        return this.condition === 'active';
    }

    _revokeKey(e) {
        const termButton = e.target;
        const controls = e.target.closest('#controls');
        const accessKey = controls.accessKey;
        
        console.log(accessKey);
    }
    _byteToMB(value) {
        return Math.floor(value / 1000000);
    }

    _elapsed(start, end) {
        var startDate = new Date(start);
        if (this.condition == 'active') {
            var endDate = new Date();
        } else {
            var endDate = new Date(end);
        }
        var seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000, -1);
        var days = Math.floor(seconds / 86400);
        return days;
    }
    _humanReadableTime(d) {
        var d = new Date(d);
        return d.toUTCString();
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
            setNotification('Session will soon be terminated');
        }).catch(err => {
            this.$.notification.text = 'Problem occurred during termination.';
            this.$.notification.show();
        });
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
        
        <vaadin-grid theme="row-stripes column-borders compact" aria-label="Credential list" items="[[keypairs.keypairs]]">
            <vaadin-grid-column width="40px" flex-grow="0" resizable>
                <template class="header">#</template>
                <template>[[_indexFrom1(index)]]</template>
            </vaadin-grid-column>

            <vaadin-grid-column resizable>
                <template class="header">User ID</template>
                <template>
                    <div class="layout horizontal center flex">
                    <div class="indicator">[[item.user_id]]</div>
                    </div>
                </template>
            </vaadin-grid-column>

            <vaadin-grid-column resizable>
                <template class="header">Access Key</template>
                <template>
                    <div class="indicator">[[item.access_key]]</div>
                </template>
            </vaadin-grid-column>

            <vaadin-grid-column resizable>
                <template class="header">Permission</template>
                <template>
                    <div class="layout horizontal center flex">
                    <template is="dom-if" if="[[item.is_admin]]">
                        <lablup-shields app="" color="red" description="admin" ui="flat"></lablup-shields>
                    </template>
                    <lablup-shields app="" description="user" ui="flat"></lablup-shields>
                    </div>
                </template>
            </vaadin-grid-column>

            <vaadin-grid-column resizable>
                <template class="header">Key age</template>
                <template>
                    <div class="layout vertical">
                        <span>[[_elapsed(item.created_at)]] Days</span>
                        <span class="indicator">([[_humanReadableTime(item.created_at)]])</span>
                    </div>
                </template>
            </vaadin-grid-column>

            <vaadin-grid-column resizable>
              <template class="header">Configuration</template>
              <template>
                  <div class="layout horizontal center flex">
                      <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
                      <span>[[item.cpu_slot]]Inf.</span>
                      <span class="indicator">slot</span>
                      <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                      <span>[[item.mem_slot]]Inf.</span>
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
              <template class="header">Allocation</template>
              <template>
                  <div class="layout horizontal center flex">
                      <div class="vertical start layout">
                      <lablup-piechart 
                        number="[[item.concurrency_used]]" 
                        maxnumber="[[item.concurrency_limit]]" 
                        chartcolor="#cddc39" 
                        unit="[[item.concurrency_limit]]" 
                        size="25"></lablup-piechart>
                      </div>
                      <div class="vertical start layout">
                        <span style="font-size:8px">[[item.rate_limit]] <span class="indicator">req./15min.</span></span>
                        <span style="font-size:8px">No policy</span>
                      </div>
                  </div>
              </template>
            </vaadin-grid-column>

            <vaadin-grid-column resizable>
              <template class="header">Control</template>
              <template>
                  <div id="controls" class="layout horizontal flex center"
                       access-key="[[item.access_key]]">
                      <paper-icon-button disabled class="fg"
                                         icon="assignment"></paper-icon-button>
                      <template is="dom-if" if="[[_isActive()]]">
                          <paper-icon-button class="fg red controls-running" icon="delete"
                            on-tap="_revokeKey"></paper-icon-button>
                      </template>
                  </div>
              </template>
            </vaadin-grid-column>
        </vaadin-grid>
        `;
    }
}

customElements.define(BackendAICredentialList.is, BackendAICredentialList);
