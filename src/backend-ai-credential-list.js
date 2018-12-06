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
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
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

    _refreshKeyData(user_id) {
        let status = 'active';
        let is_active = true;
        switch (this.condition) {
            case 'active':
                is_active = true;
                break;
            default:
                is_active = false;
        };
        let q;
        let fields = ["access_key", 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used', 
            'concurrency_limit', 'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy'];

        if (user_id == null) {
            q = `query($is_active: Boolean) {` +
            `  keypairs(is_active: $is_active) {` +
            `    ${fields.join(" ")}` +
            `  }` +
            `}`;
        } else {
            q = `query($user_id: String!, $is_active: Boolean) {` +
            `  keypairs(user_id: $user_id, is_active: $is_active) {` +
            `    ${fields.join(" ")}` +
            `  }` +
            `}`;
        }
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
        //let user_id = window.backendaiclient_email;
        let user_id = null;
        this._refreshKeyData();
    }

    _isActive() {
        return this.condition === 'active';
    }

    _revokeKey2(e) {
        const termButton = e.target;
        const controls = e.target.closest('#controls');
        const accessKey = controls.accessKey;

        console.log(accessKey);
    }

    _deleteKey(e) {
        const termButton = e.target;
        const controls = e.target.closest('#controls');
        const access_key = controls.accessKey;
        let q = `mutation($access_key: String!) {` +
            `  delete_keypair(access_key: $access_key) {` +
            `    ok msg` +
            `  }` +
            `}`;
        let v = { 'access_key': access_key,
        };
    
        window.backendaiclient.gql(q, v).then(response => {
            this.refresh();
        }).catch(err => {
            console.log(err);
            if (err && err.message) {
                this.$.notification.text = err.message;
                this.$.notification.show();
            }
        });
    }

    _revokeKey(e) {
        this._mutateKey(e, false);
    }
    _reuseKey(e) {
        this._mutateKey(e, true);
    }
    
    _mutateKey(e, is_active) {
        const termButton = e.target;
        const controls = e.target.closest('#controls');
        const access_key = controls.accessKey;
        let original = this.keypairs.keypairs.find(this._findKeyItem, access_key)
        console.log(original);
        let q = `mutation($access_key: String!, $input: KeyPairInput!) {` +
            `  modify_keypair(access_key: $access_key, props: $input) {` +
            `    ok msg` +
            `  }` +
            `}`;
        let v = { 'access_key': access_key,
            'input': {
                'is_active': is_active,
                'is_admin': original.is_admin,
                'resource_policy': original.resource_policy,
                'rate_limit': original.rate_limit,
                'concurrency_limit': original.concurrency_limit,
            },
        };
        window.backendaiclient.gql(q, v).then(response => {
            var event = new CustomEvent("backend-ai-credential-refresh", { "detail": this });
            document.dispatchEvent(event);
        }).catch(err => {
            console.log(err);
            if (err && err.message) {
                this.$.notification.text = err.message;
                this.$.notification.show();
            }
        });
    }

    _findKeyItem(element) {
        return element.access_key = this;
    }

    _byteToMB(value) {
        return Math.floor(value / 1000000);
    }

    _elapsed(start, end) {
        var startDate = new Date(start);
        if (this.condition == 'active') {
            var endDate = new Date();
        } else {
            var endDate = new Date();
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
                <template class="header">
                    <vaadin-grid-sorter path="user_id">User ID</vaadin-grid-sorter>
                </template>
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
                        <span style="font-size:8px">[[item.num_queries]] <span class="indicator">queries</span></span>
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
                            <template is="dom-if" if="[[!item.is_admin]]">
                                <paper-icon-button class="fg blue controls-running" icon="delete"
                                    on-tap="_revokeKey"></paper-icon-button>
                                <paper-icon-button class="fg red controls-running" icon="icons:delete-forever"
                                        on-tap="_deleteKey"></paper-icon-button>
                            </template>
                        </template>
                        <template is="dom-if" if="[[!_isActive()]]">
                            <paper-icon-button class="fg blue controls-running" icon="icons:redo"
                            on-tap="_reuseKey"></paper-icon-button>
                        </template>
                    </div>
              </template>
            </vaadin-grid-column>
        </vaadin-grid>
        `;
    }
}

customElements.define(BackendAICredentialList.is, BackendAICredentialList);
