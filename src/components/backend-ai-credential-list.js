/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";
import {render} from 'lit-html';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item';

import 'weightless/card';
import 'weightless/dialog';
import 'weightless/button';

import '../plastics/lablup-shields/lablup-shields';
import './lablup-loading-indicator';
import './lablup-notification.js';
import {BackendAiStyles} from "./backend-ai-console-styles";
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";

class BackendAICredentialList extends LitElement {

  static get is() {
    return 'backend-ai-credential-list';
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      condition: {
        type: String
      },
      keypairs: {
        type: Object
      },
      resourcePolicy: {
        type: Object
      },
      keypairInfo: {
        type: Object
      },
      isAdmin: {
        type: Boolean
      },
      _status: {
        type: Boolean
      },
      notification: {
        type: Object
      }
    };
  }

  constructor() {
    super();
    this.active = false;
    this.condition = 'active';
    this.keypairs = {};
    this.resourcePolicy = {};
    this.keypairInfo = {
      user_id: '1',
      access_key: 'ABC',
      secret_key: 'ABC',
      last_used: '',
      is_admin: false
    };

    this.isAdmin = false;
    this._boundControlRenderer = this.controlRenderer.bind(this);
  }

  firstUpdated() {
    this.notification = this.shadowRoot.querySelector('#notification');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  shouldUpdate() {
    return this.active;
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name == 'active' && newval !== null) {
      this.active = true;
      this._menuChanged(true);
    } else {
      this.active = false;
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
        this._refreshKeyData();
        this.isAdmin = window.backendaiclient.is_admin;
      }, true);
    } else { // already connected
      this._refreshKeyData();
      this.isAdmin = window.backendaiclient.is_admin;
    }
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
    }
    return window.backendaiclient.resourcePolicy.get().then((response) => {
      this.shadowRoot.querySelector('#loading-indicator').hide();
      let rp = response.keypair_resource_policies;
      this.resourcePolicy = window.backendaiclient.utils.gqlToObject(rp, 'name');
    }).then(() => {
      let fields = ["access_key", 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used',
        'concurrency_limit', 'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy'];
      return window.backendaiclient.keypair.list(user_id, fields, is_active);
    }).then((response) => {
      let keypairs = response.keypairs;
      Object.keys(keypairs).map((objectKey, index) => {
        var keypair = keypairs[objectKey];
        if (keypair.resource_policy in this.resourcePolicy) {
          for (var k in this.resourcePolicy[keypair.resource_policy]) {
            if (k === 'created_at') {
              continue;
            }
            keypair[k] = this.resourcePolicy[keypair.resource_policy][k];
            if (k === 'total_resource_slots') {
              keypair['total_resource_slots'] = JSON.parse(this.resourcePolicy[keypair.resource_policy][k]);
            }
          }
          keypair['created_at_formatted'] = this._humanReadableTime(keypair['created_at']);
          keypair['elapsed'] = this._elapsed(keypair['created_at']);
          if ('cpu' in keypair['total_resource_slots']) {
          } else if (keypair['default_for_unspecified'] === 'UNLIMITED') {
            keypair['total_resource_slots'].cpu = '-';
          }
          if ('mem' in keypair['total_resource_slots']) {
            keypair['total_resource_slots'].mem = parseFloat(window.backendaiclient.utils.changeBinaryUnit(keypair['total_resource_slots'].mem, 'g'));
            //keypair['total_resource_slots'].mem = parseFloat(keypair['total_resource_slots'].mem);
          } else if (keypair['default_for_unspecified'] === 'UNLIMITED') {
            keypair['total_resource_slots'].mem = '-';
          }
          if ('cuda.device' in keypair['total_resource_slots']) {
            keypair['total_resource_slots'].cuda_device = keypair['total_resource_slots']['cuda.device'];
          }
          if ('cuda.shares' in keypair['total_resource_slots']) {
            keypair['total_resource_slots'].cuda_shares = keypair['total_resource_slots']['cuda.shares'];
          }
          if (('cuda_device' in keypair['total_resource_slots']) === false &&
            ('cuda_shares' in keypair['total_resource_slots']) === false &&
            keypair['default_for_unspecified'] === 'UNLIMITED') {
            keypair['total_resource_slots'].cuda_shares = '-';
            keypair['total_resource_slots'].cuda_device = '-';
          }
          ['cpu', 'mem', 'cuda_shares', 'cuda_device'].forEach((slot) => {
            keypair['total_resource_slots'][slot] = this._markIfUnlimited(keypair['total_resource_slots'][slot]);
          });
        }
      });
      this.keypairs = keypairs;
      //setTimeout(() => { this._refreshKeyData(status) }, 5000);
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = err.message;
        this.notification.show();
      }
    });
  }

  async _showKeypairDetail(e) {
    const controls = e.target.closest('#controls');
    const access_key = controls['access-key'];
    try {
      const data = await this._getKeyData(access_key);
      this.keypairInfo = data.keypair;
      this.shadowRoot.querySelector('#keypair-info-dialog').show();
    } catch (err) {
      if (err && err.message) {
        this.notification.text = err.message;
        this.notification.show();
      }
    }
  }

  async _getKeyData(accessKey) {
    let fields = ["access_key", 'secret_key', 'is_active', 'is_admin', 'user_id', 'created_at', 'last_used',
      'concurrency_limit', 'concurrency_used', 'rate_limit', 'num_queries', 'resource_policy'];
    return window.backendaiclient.keypair.info(accessKey, fields);
  }

  refresh() {
    //let user_id = window.backendaiclient_email;
    let user_id = null;
    this._refreshKeyData();
  }

  _isActive() {
    return this.condition === 'active';
  }

  _deleteKey(e) {
    const termButton = e.target;
    const controls = e.target.closest('#controls');
    const accessKey = controls['access-key'];
    window.backendaiclient.keypair.delete(accessKey).then(response => {
      this.refresh();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#notification').text = err.message;
        this.shadowRoot.querySelector('#notification').show();
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
    const accessKey = controls['access-key'];
    let original = this.keypairs.find(this._findKeyItem, accessKey);
    let input = {
      'is_active': is_active,
      'is_admin': original.is_admin,
      'resource_policy': original.resource_policy,
      'rate_limit': original.rate_limit,
      'concurrency_limit': original.concurrency_limit,
    };
    window.backendaiclient.keypair.mutate(accessKey, input).then((response) => {
      let event = new CustomEvent("backend-ai-credential-refresh", {"detail": this});
      document.dispatchEvent(event);
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#notification').text = err.message;
        this.shadowRoot.querySelector('#notification').show();
      }
    });
  }

  _findKeyItem(element) {
    return element.access_key = this;
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
    return new Date(d).toUTCString();
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


  _markIfUnlimited(value) {
    if (['-', 0].includes(value)) {
      return '∞';
    } else {
      return value;
    }
  }

  controlRenderer(root, column, rowData) {
    render(
      html`
            <div id="controls" class="layout horizontal flex center"
                 .access-key="${rowData.item.access_key}">
              <wl-button class="fg green" fab flat inverted @click="${(e) => this._showKeypairDetail(e)}">
                 <wl-icon>assignment</wl-icon>
              </wl-button>
              ${this.isAdmin && this._isActive() ? html`
                <wl-button class="fg blue" fab flat inverted @click="${(e) => this._revokeKey(e)}">
                   <wl-icon>delete</wl-icon>
                </wl-button>
                <wl-button class="fg red" fab flat inverted @click="${(e) => this._deleteKey(e)}">
                   <wl-icon>delete_forever</wl-icon>
                </wl-button>
              ` : html``}
              ${this._isActive() === false ? html`
                <wl-button class="fg blue" fab flat inverted @click="${(e) => this._reuseKey(e)}">
                   <wl-icon>redo</wl-icon>
                </wl-button>
              ` : html``}
            </div>
      `, root
    );
  }

  _hideDialog(e) {
    this.notification.show();
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 325px);
        }

        paper-item {
          height: 30px;
          --paper-item-min-height: 30px;
        }

        wl-button > wl-icon {
          --icon-size: 24px;
          padding: 0;
        }

        wl-icon {
          --icon-size: 16px;
          padding: 0;
        }

        wl-card h4 {
          font-size: 14px;
          padding: 5px 15px 5px 12px;
          margin: 0 0 10px 0;
          display: block;
          border-bottom: 1px solid #DDD;
        }

        vaadin-item {
          font-size: 13px;
          font-weight: 100;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        div.configuration {
          width: 70px !important;
        }

        div.configuration wl-icon {
          padding-right: 5px;
        }

        wl-button.fab {
          --button-bg: var(--paper-light-green-600);
          --button-bg-hover: var(--paper-green-600);
          --button-bg-active: var(--paper-green-900);
          color: var(--paper-green-900);
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Credential list"
                   id="keypair-grid" .items="${this.keypairs}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" .renderer="${this._indexRenderer}"></vaadin-grid-column>

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
          <template class="header">
            <vaadin-grid-sorter path="is_admin">Permission</vaadin-grid-sorter>
          </template>
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
          <template class="header">
            <vaadin-grid-sorter path="created_at">Key age</vaadin-grid-sorter>
          </template>
          <template>
            <div class="layout vertical">
              <span>[[item.elapsed]] Days</span>
              <span class="indicator">([[item.created_at_formatted]])</span>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column width="150px" resizable>
          <template class="header">Resource Policy</template>
          <template>
            <div class="layout horizontal wrap center">
              <div class="layout horizontal configuration">
                <wl-icon class="fg green">developer_board</wl-icon>
                <span>[[item.total_resource_slots.cpu]]</span>
                <span class="indicator">cores</span>
              </div>
              <div class="layout horizontal configuration">
                <wl-icon class="fg green">memory</wl-icon>
                <span>[[item.total_resource_slots.mem]]</span>
                <span class="indicator">GB</span>
              </div>
            </div>
            <div class="layout horizontal wrap center">
              <template is="dom-if" if="[[item.total_resource_slots.cuda_device]]">
                <div class="layout horizontal configuration">
                  <wl-icon class="fg green">view_module</wl-icon>
                  <span>[[item.total_resource_slots.cuda_device]]</span>
                  <span class="indicator">GPU</span>
                </div>
              </template>
              <template is="dom-if" if="[[item.total_resource_slots.cuda_shares]]">
                <div class="layout horizontal configuration">
                  <wl-icon class="fg green">view_module</wl-icon>
                  <span>[[item.total_resource_slots.cuda_shares]]</span>
                  <span class="indicator">fGPU</span>
                </div>
              </template>
            </div>
            <div class="layout horizontal wrap center">
              <div class="layout horizontal configuration">
                <wl-icon class="fg green">cloud_queue</wl-icon>
                <span>[[item.max_vfolder_size]]</span>
                <span class="indicator">GB</span>
              </div>
              <div class="layout horizontal configuration">
                <wl-icon class="fg green">folder</wl-icon>
                <span>[[item.max_vfolder_count]]</span>
                <span class="indicator">Folders</span>
              </div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Allocation</template>
          <template>
            <div class="layout horizontal center flex">
              <div class="vertical start layout">
                <div style="font-size:11px;width:40px;">[[item.concurrency_used]] /
                  [[item.concurrency_limit]]
                </div>
                <span class="indicator">Sess.</span>
              </div>
              <div class="vertical start layout">
                <span style="font-size:8px">[[item.rate_limit]] <span class="indicator">req./15m.</span></span>
                <span style="font-size:8px">[[item.num_queries]] <span class="indicator">queries</span></span>
              </div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column width="150px" resizable header="Control" .renderer="${this._boundControlRenderer}">
        </vaadin-grid-column>
      </vaadin-grid>
      <wl-dialog id="keypair-info-dialog" fixed backdrop blockscrolling>
        <wl-card elevation="0" class="intro" style="margin: 0;">
          <h3 class="horizontal center layout" style="border-bottom:1px solid #ddd;">
            <span style="margin-right:15px;">Keypair Detail</span>
            ${this.keypairInfo.is_admin ? html`
              <lablup-shields app="" color="red" description="admin" ui="flat"></lablup-shields>
              ` : html``}
            <lablup-shields app="" description="user" ui="flat"></lablup-shields>
            <div class="flex"></div>
            <wl-button class="fab" fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <div class="horizontal layout">
            <div style="width:335px;">
              <h4>Information</h4>
              <div role="listbox" style="margin: 0;">
                <vaadin-item>
                  <div><strong>User ID</strong></div>
                  <div secondary>${this.keypairInfo.user_id}</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Access Key</strong></div>
                  <div secondary>${this.keypairInfo.access_key}</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Secret Key</strong></div>
                  <div secondary>${this.keypairInfo.secret_key}</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Created</strong></div>
                  <div secondary>${this.keypairInfo.created_at}</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Last used</strong></div>
                  <div secondary>${this.keypairInfo.last_used}</div>
                </vaadin-item>
              </div>
            </div>
            <div style="width:335px;">
              <h4>Allocation</h4>
              <div role="listbox" style="margin: 0;">
                <vaadin-item>
                  <div><strong>Resource Policy</strong></div>
                  <div secondary>${this.keypairInfo.resource_policy}</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Number of queries</strong></div>
                  <div secondary>${this.keypairInfo.num_queries}</div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Concurrent Sessions</strong></div>
                  <div secondary>${this.keypairInfo.concurrency_used} active / ${this.keypairInfo.concurrency_used} concurrent
                    sessions.
                  </div>
                </vaadin-item>
                <vaadin-item>
                  <div><strong>Rate Limit</strong></div>
                  <div secondary>${this.keypairInfo.rate_limit} for 900 seconds.</div>
                </vaadin-item>
              </div>
            </div>
          </div>
        </wl-card>
      </wl-dialog>
    `;
  }
}

customElements.define(BackendAICredentialList.is, BackendAICredentialList);
