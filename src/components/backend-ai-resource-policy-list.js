/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";
import {render} from 'lit-html';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/av-icons';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/dialog';
import 'weightless/card';

import '../plastics/lablup-shields/lablup-shields';
import './lablup-notification.js';
import {BackendAiStyles} from "./backend-ai-console-styles";
import {IronFlex, IronFlexAlignment} from "../plastics/layout/iron-flex-layout-classes";

class BackendAIResourcePolicyList extends LitElement {

  static get is() {
    return 'backend-ai-resource-policy-list';
  }

  constructor() {
    super();
    this.visible = false;
    this.keypairs = {};
    this.resourcePolicy = {};
    this.keypairInfo = {};
    this.is_admin = false;
    this.active = false;
    this.cpu_metric = [1, 2, 3, 4, 8, 16, 24, "Unlimited"];
    this.ram_metric = [1, 2, 4, 8, 16, 24, 32, 64, 128, 256, 512, "Unlimited"];
    this.gpu_metric = [0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 16, "Unlimited"];
    this.vgpu_metric = [0, 0.3, 0.6, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 12, 16, "Unlimited"];
    this.rate_metric = [1000, 2000, 3000, 4000, 5000, 10000, 50000];
    this.concurrency_metric = [1, 2, 3, 4, 5, 10, 50, "Unlimited"];
    this.container_per_session_metric = [1, 2, 3, 4, 8, "Unlimited"];
    this.idle_timeout_metric = [60, 180, 540, 900, 1800, 3600];
    this.vfolder_capacity_metric = [1, 2, 5, 10, 50, 100, 200, 1000];
    this.vfolder_count_metric = [1, 2, 3, 4, 5, 10, 30, 50, 100];
    this.is_admin = false;
    this.allowed_vfolder_hosts = [];
    this.default_vfolder_host = '';
    this._boundResourceRenderer = this.resourceRenderer.bind(this);
    this._boundControlRenderer = this.controlRenderer.bind(this);
  }

  static get properties() {
    return {
      visible: {
        type: Boolean
      },
      keypairs: {
        type: Object
      },
      notification: {
        type: Object
      },
      active: {
        type: Boolean
      },
      resourcePolicy: {
        type: Object
      },
      keypairInfo: {
        type: Object
      },
      cpu_metric: {
        type: Array
      },
      ram_metric: {
        type: Array
      },
      gpu_metric: {
        type: Array
      },
      vgpu_metric: {
        type: Array
      },
      rate_metric: {
        type: Array
      },
      concurrency_metric: {
        type: Array
      },
      container_per_session_metric: {
        type: Array
      },
      idle_timeout_metric: {
        type: Array
      },
      vfolder_capacity_metric: {
        type: Array
      },
      vfolder_count_metric: {
        type: Array
      },
      is_admin: {
        type: Boolean
      },
      allowed_vfolder_hosts: {
        type: Array
      },
      default_vfolder_host: {
        type: String
      }
    };
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
          height: calc(100vh - 260px);
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

        div.configuration iron-icon {
          padding-right: 5px;
        }

        wl-button.create-button {
          width: calc(100% - 40px);
        }

        paper-dialog paper-input {
          padding-left: 20px;
          padding-right: 20px;
        }

        paper-dialog h4 {
          margin: 10px 0 5px 0;
          font-weight: 400;
          font-size: 13px;
          padding-left: 20px;
          border-bottom: 1px solid #ccc;
        }

        wl-button.create-button {
          width: 335px;
          --button-bg: white;
          --button-bg-hover: var(--paper-green-100);
          --button-bg-active: var(--paper-green-600);
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Resource Policy list"
                   .items="${this.resourcePolicy}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" .renderer="${this._indexRenderer}"></vaadin-grid-column>
        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="name">Name</vaadin-grid-sorter>
          </template>
          <template>
            <div class="layout horizontal center flex">
              <div>[[item.name]]</div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column width="150px" resizable header="Resources" .renderer="${this._boundResourceRenderer}">
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="max_concurrent_sessions">Concurrency</vaadin-grid-sorter>
          </template>
          <template>
            <div>[[item.max_concurrent_sessions]]
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">
            <vaadin-grid-sorter path="max_containers_per_session">Cluster size</vaadin-grid-sorter>
          </template>
          <template>
            <div>[[item.max_containers_per_session]]</div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Storage Nodes</template>
          <template>
            <div class="layout horizontal center flex">
              <div class="vertical start layout">
                <div>[[item.allowed_vfolder_hosts]]
                </div>
              </div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable header="Control" .renderer="${this._boundControlRenderer}">
        </vaadin-grid-column>
        
      </vaadin-grid>
      <wl-dialog id="modify-policy-dialog" fixed backdrop blockscrolling>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Modify resource policy</span>
            <div class="flex"></div>
            <wl-button fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <form id="login-form">
            <fieldset>
              <paper-input type="text" name="new_policy_name" id="id_new_policy_name" label="Policy Name"
                           required
                           error-message="Policy name only accepts letters and numbers"></paper-input>
              <h4>Resource Policy</h4>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="cpu-resource" label="CPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.cpu_metric.map(item => html`
                    <paper-item value="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="ram-resource" label="RAM (GB)">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.ram_metric.map(item => html`
                    <paper-item value="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="gpu-resource" label="GPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.gpu_metric.map(item => html`
                    <paper-item value="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="vgpu-resource" label="vGPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.vgpu_metric.map(item => html`
                    <paper-item value="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <h4>Sessions</h4>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="container-per-session-limit" label="Container per session">
                  <paper-listbox slot="dropdown-content" selected="0">
                    ${this.container_per_session_metric.map(item => html`
                      <paper-item value="${item}">${item}</paper-item>
                    `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="idle-timeout" label="Idle timeout (sec.)">
                  <paper-listbox slot="dropdown-content" selected="0">
                    ${this.idle_timeout_metric.map(item => html`
                      <paper-item value="${item}">${item}</paper-item>
                    `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>

              <div class="horizontal center layout">
                <paper-dropdown-menu id="concurrency-limit" label="Concurrent Jobs">
                  <paper-listbox slot="dropdown-content" selected="0">
                    ${this.concurrency_metric.map(item => html`
                      <paper-item value="${item}">${item}</paper-item>
                    `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <h4>Virtual Folders</h4>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="allowed_vfolder-hosts" label="Allowed hosts">
                  <paper-listbox slot="dropdown-content" selected="0">
                    ${this.allowed_vfolder_hosts.map(item => html`
                      <paper-item value="${item}">${item}</paper-item>
                    `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="vfolder-capacity-limit" label="Capacity (GB)">
                  <paper-listbox slot="dropdown-content" selected="0">
                    ${this.vfolder_capacity_metric.map(item => html`
                      <paper-item value="${item}">${item}</paper-item>
                    `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="vfolder-count-limit" label="Max.#">
                  <paper-listbox slot="dropdown-content" selected="0">
                    ${this.vfolder_count_metric.map(item => html`
                      <paper-item value="${item}">${item}</paper-item>
                    `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>

              <br/><br/>
              <wl-button class="fg blue create-button" id="create-policy-button" type="button"
                outlined @click="${() => this._modifyResourcePolicy()}">
                <wl-icon>add</wl-icon>
                Create
              </wl-button>

            </fieldset>
          </form>
        </wl-card>
      </wl-dialog>
    `;
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

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  resourceRenderer(root, column, rowData) {
    render(
      html`
        <div class="layout horizontal wrap center">
          <div class="layout horizontal configuration">
            <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
            <span>${this._markIfUnlimited(rowData.item.total_resource_slots.cpu)}</span>
            <span class="indicator">cores</span>
          </div>
          <div class="layout horizontal configuration">
            <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
            <span>${this._markIfUnlimited(rowData.item.total_resource_slots.mem)}</span>
            <span class="indicator">GB</span>
          </div>
        </div>
        <div class="layout horizontal wrap center">
        ${rowData.item.total_resource_slots['cuda_device'] ?
        html`
          <div class="layout horizontal configuration">
            <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
            <span>${this._markIfUnlimited(rowData.item.total_resource_slots.cuda_device)}</span>
            <span class="indicator">GPU</span>
          </div>
` : html``}
        ${rowData.item.total_resource_slots['cuda_shares'] ?
        html`
          <div class="layout horizontal configuration">
            <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
            <span>${this._markIfUnlimited(rowData.item.total_resource_slots.cuda_shares)}</span>
            <span class="indicator">vGPU</span>
          </div>
` : html``}
        </div>
        <div class="layout horizontal wrap center">
          <div class="layout horizontal configuration">
            <iron-icon class="fg green" icon="icons:cloud-queue"></iron-icon>
            <span>${this._markIfUnlimited(rowData.item.max_vfolder_size)}</span>
            <span class="indicator">GB</span>
          </div>
          <div class="layout horizontal configuration">
            <iron-icon class="fg green" icon="icons:folder"></iron-icon>
            <span>${this._markIfUnlimited(rowData.item.max_vfolder_count)}</span>
            <span class="indicator">Folders</span>
          </div>
        </div>
      `, root
    );
  }

  controlRenderer(root, column, rowData) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center"
             .policy-name="${rowData.item.name}">
        ${this.is_admin ? html`
              <paper-icon-button class="fg green controls-running" icon="settings"
                                 @click="${(e) => this._launchResourcePolicyDialog(e)}"></paper-icon-button>
                                 ` : html``}
        </div>
    `, root
    );
  }

  firstUpdated() {
    this.notification = this.shadowRoot.querySelector('#notification');
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
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshPolicyData();
        this.is_admin = window.backendaiclient.is_admin;
      }, true);
    } else { // already connected
      this._refreshPolicyData();
      this.is_admin = window.backendaiclient.is_admin;
    }
  }

  _launchResourcePolicyDialog(e) {
    this.updateCurrentPolicyToDialog(e);
    this.shadowRoot.querySelector('#modify-policy-dialog').show();
  }

  updateCurrentPolicyToDialog(e) {
    const controls = e.target.closest('#controls');
    const policyName = controls['policy-name'];
    let resourcePolicies = window.backendaiclient.utils.gqlToObject(this.resourcePolicy, 'name');
    let resourcePolicy = resourcePolicies[policyName];
    this.shadowRoot.querySelector('#id_new_policy_name').value = policyName;
    this.shadowRoot.querySelector('#cpu-resource').value = resourcePolicy.total_resource_slots.cpu;
    this.shadowRoot.querySelector('#gpu-resource').value = resourcePolicy.total_resource_slots['cuda_device'];
    this.shadowRoot.querySelector('#vgpu-resource').value = resourcePolicy.total_resource_slots['cuda_shares'];
    this.shadowRoot.querySelector('#ram-resource').value = resourcePolicy.total_resource_slots['mem'];

    this.shadowRoot.querySelector('#concurrency-limit').value = resourcePolicy.max_concurrent_sessions;
    this.shadowRoot.querySelector('#container-per-session-limit').value = resourcePolicy.max_containers_per_session;
    this.shadowRoot.querySelector('#vfolder-count-limit').value = resourcePolicy.max_vfolder_count;
    this.shadowRoot.querySelector('#vfolder-capacity-limit').value = resourcePolicy.max_vfolder_size;
    this.shadowRoot.querySelector('#idle-timeout').value = resourcePolicy.idle_timeout;
    this.shadowRoot.querySelector('#allowed_vfolder-hosts').value = resourcePolicy.allowed_vfolder_hosts[0]; /* TODO: multiple vfolder hosts */
  }

  _refreshPolicyData() {
    return window.backendaiclient.resourcePolicy.get().then((response) => {
      let rp = response.keypair_resource_policies;
      let resourcePolicy = window.backendaiclient.utils.gqlToObject(rp, 'name');
      return rp;
    }).then((response) => {
      let resourcePolicies = response;
      Object.keys(resourcePolicies).map((objectKey, index) => {
        var policy = resourcePolicies[objectKey];
        policy['total_resource_slots'] = JSON.parse(policy['total_resource_slots']);
        if ('cpu' in policy['total_resource_slots']) {
        } else if (policy['default_for_unspecified'] === 'UNLIMITED') {
          policy['total_resource_slots'].cpu = 'Unlimited';
        }
        if ('mem' in policy['total_resource_slots']) {
          policy['total_resource_slots'].mem = parseFloat(window.backendaiclient.utils.changeBinaryUnit(policy['total_resource_slots'].mem, 'g'));
        } else if (policy['default_for_unspecified'] === 'UNLIMITED') {
          policy['total_resource_slots'].mem = 'Unlimited';
        }
        if ('cuda.device' in policy['total_resource_slots']) {
          if (policy['total_resource_slots']['cuda.device'] === 0 && policy['default_for_unspecified'] === 'UNLIMITED') {
            policy['total_resource_slots'].cuda_device = 'Unlimited';
          } else {
            policy['total_resource_slots'].cuda_device = policy['total_resource_slots']['cuda.device'];
          }
        } else if (policy['default_for_unspecified'] === 'UNLIMITED') {
          policy['total_resource_slots'].cuda_device = 'Unlimited';
        }
        if ('cuda.shares' in policy['total_resource_slots']) {
          if (policy['total_resource_slots']['cuda.shares'] === 0 && policy['default_for_unspecified'] === 'UNLIMITED') {
            policy['total_resource_slots'].cuda_shares = 'Unlimited';
          } else {
            policy['total_resource_slots'].cuda_shares = policy['total_resource_slots']['cuda.shares'];
          }
        } else if (policy['default_for_unspecified'] === 'UNLIMITED') {
          policy['total_resource_slots'].cuda_shares = 'Unlimited';
        }
      });
      this.resourcePolicy = resourcePolicies;
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = err.message;
        this.notification.show();
      }
    });
  }

  refresh() {
    this._refreshPolicyData();
  }

  _isActive() {
    return this.condition === 'active';
  }

  _readResourcePolicyInput() {
    let cpu_resource = this.shadowRoot.querySelector('#cpu-resource').value;
    let ram_resource = this.shadowRoot.querySelector('#ram-resource').value;
    let gpu_resource = this.shadowRoot.querySelector('#gpu-resource').value;
    let vgpu_resource = this.shadowRoot.querySelector('#vgpu-resource').value;
    let vfolder_hosts = this.shadowRoot.querySelector('#allowed_vfolder-hosts').value;
    if (cpu_resource === "Unlimited") {
      cpu_resource = "Infinity";
    }
    if (ram_resource === "Unlimited") {
      ram_resource = "Infinity";
    }
    if (gpu_resource === "Unlimited") {
      gpu_resource = "Infinity";
    } else {
      gpu_resource = parseInt(gpu_resource).toString();
    }
    if (vgpu_resource === "Unlimited") {
      vgpu_resource = "Infinity";
    } else {
      vgpu_resource = parseFloat(vgpu_resource).toString();
    }

    let total_resource_slots = {
      "cpu": cpu_resource,
      "mem": ram_resource + 'g',
      "cuda.device": gpu_resource,
      "cuda.shares": vgpu_resource
    };
    let concurrency_limit = this.shadowRoot.querySelector('#concurrency-limit').value;
    let containers_per_session_limit = this.shadowRoot.querySelector('#container-per-session-limit').value;
    let vfolder_count_limit = this.shadowRoot.querySelector('#vfolder-count-limit').value;
    let vfolder_capacity_limit = this.shadowRoot.querySelector('#vfolder-capacity-limit').value;
    let rate_limit = this.shadowRoot.querySelector('#rate-limit').value;
    let idle_timeout = this.shadowRoot.querySelector('#idle-timeout').value;
    let input = {
      'default_for_unspecified': 'UNLIMITED',
      'total_resource_slots': JSON.stringify(total_resource_slots),
      'max_concurrent_sessions': concurrency_limit,
      'max_containers_per_session': containers_per_session_limit,
      'idle_timeout': idle_timeout,
      'max_vfolder_count': vfolder_count_limit,
      'max_vfolder_size': vfolder_capacity_limit,
      'allowed_vfolder_hosts': vfolder_hosts
    };
  }

  _modifyResourcePolicy() {
    let is_active = true;
    let is_admin = false;
    let name = this.shadowRoot.querySelector('#id_new_policy_name').value;
    let input = this._readResourcePolicyInput();

    window.backendaiclient.resourcePolicy.mutate(name, input).then(response => {
      this.shadowRoot.querySelector('#new-policy-dialog').close();
      this.notification.text = "Resource policy successfully updated.";
      this.notification.show();
      this.shadowRoot.querySelector('#resource-policy-list').refresh();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#new-policy-dialog').close();
        this.notification.text = err.message;
        this.notification.show();
      }
    });
  }

  _deleteKey(e) {
    const termButton = e.target;
    const controls = e.target.closest('#controls');
    const accessKey = controls.accessKey;
    window.backendaiclient.keypair.delete(accessKey).then(response => {
      this.refresh();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.notification.text = err.message;
        this.notification.show();
      }
    });
  }

  _markIfUnlimited(value) {
    if (['Unlimited', 0].includes(value)) {
      return '∞';
    } else {
      return value;
    }
  }
}

customElements.define(BackendAIResourcePolicyList.is, BackendAIResourcePolicyList);
