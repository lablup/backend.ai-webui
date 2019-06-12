/**
 * Backend.AI-credential-view
 */

import {css, html, LitElement} from "lit-element";
import '@polymer/paper-input/paper-input';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-item/paper-item';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import 'weightless/dialog';
import 'weightless/textfield';
import 'weightless/tab';
import 'weightless/tab-group';
import 'weightless/expansion';
import './backend-ai-credential-list.js';
import '../backend-ai-resource-policy-list.js';

import {BackendAiStyles} from "./backend-ai-console-styles";
import {IronFlex, IronFlexAlignment, IronFlexFactors, IronPositioning} from "../layout/iron-flex-layout-classes";

/**
 Backend.AI Credential view page

 Example:

 <backend-ai-credential-view active=true>
 ... content ...
 </backend-ai-credential-view>

 @group Backend.AI Console
 */
class BackendAICredentialView extends LitElement {
  static get properties() {
    return {
      active: {
        type: Boolean
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
      resource_policies: {
        type: Object
      },
      resource_policy_names: {
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
      },
      _status: {
        type: Boolean
      }
    }
  }

  static get is() {
    return 'backend-ai-credential-view';
  }

  shouldUpdate() {
    return this.active;
  }

  constructor() {
    super();
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
    this.resource_policies = {};
    this.resource_policy_names = [];
    this.is_admin = false;
    this.allowed_vfolder_hosts = [];
    this.default_vfolder_host = '';
    this._status = false;
  }

  firstUpdated() {
    if (this.shadowRoot.querySelector('#add-keypair')) {
      this.shadowRoot.querySelector('#add-keypair').addEventListener('tap', this._launchKeyPairDialog.bind(this));
    }
    this.shadowRoot.querySelector('#create-keypair-button').addEventListener('tap', this._addKeyPair.bind(this));

    if (this.shadowRoot.querySelector('#add-policy')) {
      this.shadowRoot.querySelector('#add-policy').addEventListener('tap', this._launchResourcePolicyDialog.bind(this));
    }
    this.shadowRoot.querySelector('#create-policy-button').addEventListener('tap', this._addResourcePolicy.bind(this));

    document.addEventListener('backend-ai-credential-refresh', () => {
      this.shadowRoot.querySelector('#active-credential-list').refresh();
      this.shadowRoot.querySelector('#inactive-credential-list').refresh();
    }, true);

    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        if (window.backendaiclient.is_admin !== true) {
          this.disablePage();
        }
      });
    } else {
      if (window.backendaiclient.is_admin !== true) {
        this.disablePage();
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
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
      this.shadowRoot.querySelector('#resource-policy-list').active = false;
      this._status = 'inactive';
      return;
    }
    this.shadowRoot.querySelector('#resource-policy-list').active = true;
    this._status = 'active';
  }

  async _launchKeyPairDialog() {
    await this._getResourcePolicies();
    this.shadowRoot.querySelector('#new-keypair-dialog').show();
  }

  _readVFolderHostInfo() {
    window.backendaiclient.vfolder.list_hosts().then(response => {
      console.log(response);
      this.allowed_vfolder_hosts = response.allowed;
      this.default_vfolder_host = response.default;
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  _launchResourcePolicyDialog() {
    this._readVFolderHostInfo();
    this.shadowRoot.querySelector('#new-policy-dialog').show();
  }

  _launchModifyResourcePolicyDialog() {
    this._readVFolderHostInfo();
    this.shadowRoot.querySelector('#new-policy-dialog').show();
  }

  async _getResourcePolicies() {
    return window.backendaiclient.resourcePolicy.get(null, ['name', 'default_for_unspecified',
      'total_resource_slots',
      'max_concurrent_sessions',
      'max_containers_per_session',
    ]).then((response) => {
      let policies = window.backendaiclient.utils.gqlToObject(response.keypair_resource_policies, 'name');
      let policyNames = window.backendaiclient.utils.gqlToList(response.keypair_resource_policies, 'name');
      this.resource_policies = policies;
      this.resource_policy_names = policyNames;
    });
  }

  _addKeyPair() {
    let is_active = true;
    let is_admin = false;
    let user_id;
    if (this.shadowRoot.querySelector('#id_new_user_id').value != '') {
      if (this.shadowRoot.querySelector('#id_new_user_id').invalid == true) {
        return;
      }
      user_id = this.shadowRoot.querySelector('#id_new_user_id').value;
    } else {
      user_id = window.backendaiclient.email;
    }
    console.log(user_id);
    let resource_policy = this.shadowRoot.querySelector('#resource-policy').value;
    let rate_limit = this.shadowRoot.querySelector('#rate-limit').value;

    // Read resources
    window.backendaiclient.keypair.add(user_id, is_active, is_admin,
      resource_policy, rate_limit).then(response => {
      this.shadowRoot.querySelector('#new-keypair-dialog').hide();
      this.shadowRoot.querySelector('#notification').text = "Keypair successfully created.";
      this.shadowRoot.querySelector('#notification').show();
      this.shadowRoot.querySelector('#active-credential-list').refresh();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#new-keypair-dialog').hide();
        this.shadowRoot.querySelector('#notification').text = err.message;
        this.shadowRoot.querySelector('#notification').show();
      }
    });
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
    return input;
  }

  _addResourcePolicy() {
    let is_active = true;
    let is_admin = false;
    let name;
    if (this.shadowRoot.querySelector('#id_new_policy_name').value != '') {
      if (this.shadowRoot.querySelector('#id_new_policy_name').invalid == true) {
        return;
      }
      name = this.shadowRoot.querySelector('#id_new_policy_name').value;
    } else {
      this.$.notification.text = "Please input policy name";
      this.$.notification.show();
      return;
    }
    let input = this._readResourcePolicyInput();
    console.log(input);
    window.backendaiclient.resourcePolicy.add(name, input).then(response => {
      this.shadowRoot.querySelector('#new-policy-dialog').close();
      this.$.notification.text = "Resource policy successfully created.";
      this.$.notification.show();
      this.shadowRoot.querySelector('#resource-policy-list').refresh();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#new-policy-dialog').close();
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  _modifyResourcePolicy() {
    let is_active = true;
    let is_admin = false;
    let name = this.shadowRoot.querySelector('#id_new_policy_name').value;
    let input = this._readResourcePolicyInput();

    window.backendaiclient.resourcePolicy.mutate(name, input).then(response => {
      this.shadowRoot.querySelector('#new-policy-dialog').close();
      this.$.notification.text = "Resource policy successfully updated.";
      this.$.notification.show();
      this.shadowRoot.querySelector('#resource-policy-list').refresh();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#new-policy-dialog').close();
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  disablePage() {
    var els = this.shadowRoot.querySelectorAll(".admin");
    for (var x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
  }

  _showTab(tab) {
    var els = this.shadowRoot.querySelectorAll(".tab-content");
    for (var x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this.shadowRoot.querySelector('#' + tab.value).style.display = 'block';
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
        wl-button.create-button {
          width: 335px;
        }

        #new-keypair-dialog {
          min-width: 350px;
        }

        fieldset {
          padding: 0;
        }

        fieldset div {
          padding-left: 20px;
          padding-right: 20px;
        }

        fieldset wl-button {
          margin-left: 20px;
          margin-right: 20px;
          margin-bottom: 20px;
        }
        
        wl-dialog wl-textfield {
          padding-left: 20px;
          padding-right: 20px;
          --input-font-family: Roboto, Noto, sans-serif;
        }

        wl-textfield {
          --input-state-color-invalid: red;
        }

        wl-dialog h4 {
          margin: 15px 0 5px 0;
          font-weight: 100;
          font-size: 16px;
          padding-left: 20px;
          border-bottom: 1px solid #ccc;
        }

        wl-button {
          --button-bg: var(--paper-light-green-50);
          --button-bg-hover: var(--paper-green-100);
          --button-bg-active: var(--paper-green-600);
        }
        wl-card h3 {
          padding-top:0;
          padding-bottom:0;
        }
        
        wl-card wl-card {
          margin: 0;
          padding: 0;
          --card-elevation: 0;
        }

        wl-tab {
          --tab-color: #666;
          --tab-color-hover: #222;
          --tab-color-hover-filled: #222;
          --tab-color-active: var(--paper-green-600);
          --tab-color-active-hover: var(--paper-green-600);
          --tab-color-active-filled: #ccc;
          --tab-bg-active: var(--paper-lime-200);
          --tab-bg-filled: var(--paper-lime-200);
          --tab-bg-active-hover: var(--paper-lime-200);
        }
        
        wl-expansion {
          --expansion-elevation: 0;
          --expansion-elevation-open: 0;
          --expansion-elevation-hover: 0;
          --expansion-margin-open: 0;
          border-bottom: 1px solid #DDD;
        }
        
        wl-expansion h4 {
          font-weight: 200;
          border-bottom: 0;
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <wl-card class="admin item" elevation="1">
        <h3 class="horizontal wrap layout">
          <wl-tab-group>
            <wl-tab value="credential-lists" checked @click="${(e) => this._showTab(e.target)}">Credentials</wl-tab>  
            <wl-tab value="resource-policy-lists" @click="${(e) => this._showTab(e.target)}">Resource Policies</wl-tab>
            <wl-tab value="user-lists" disabled>Users</wl-tab>  
          </wl-tab-group>
          <div class="flex"></div>
          <wl-button class="fg green" id="add-keypair" outlined>
            <wl-icon>add</wl-icon>
            Add credential
          </wl-button>
        </h3>
        <wl-card id="credential-lists" class="tab-content">
          <wl-expansion name="credential-group" open>
            <h4 slot="title">Active</h4>
            <span slot="description">
            </span>
            <div>
              <backend-ai-credential-list id="active-credential-list" condition="active" ?active="${this._status === 'active'}"></backend-ai-credential-list>
            </div>
          </wl-expansion>
          <wl-expansion name="credential-group">
            <h4 slot="title">Inactive</h4>
            <div>
              <backend-ai-credential-list id="inactive-credential-list" condition="inactive" ?active="${this._status === 'active'}"></backend-ai-credential-list>
            </div>
          </wl-expansion>
        </wl-card>
        <wl-card id="resource-policy-lists" class="admin item tab-content" style="display:none;">
          <h4 class="horizontal flex center center-justified layout">
            <span>Policy groups</span>
            <span class="flex"></span>
            <wl-button class="fg green" id="add-policy" outlined>
              <wl-icon>add</wl-icon>
              Create policy
            </wl-button>
          </h4>
          <div>
            <backend-ai-resource-policy-list id="resource-policy-list"></backend-ai-resource-policy-list>
          </div>
        </wl-card>

      </wl-card>


      <wl-dialog id="new-keypair-dialog" fixed backdrop blockscrolling>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3>Add credential</h3>
          <form id="login-form" onSubmit="this._addKeyPair()">
            <fieldset>
              <wl-textfield type="email" name="new_user_id" id="id_new_user_id" label="User ID as E-mail (optional)"
                           auto-validate></wl-textfield>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="resource-policy" label="Resource Policy">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.resource_policy_names.map(item => html`
                    <paper-item label="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="rate-limit" label="Rate Limit (for 15 min.)">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.rate_metric.map(item => html`
                    <paper-item label="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <br/><br/>
              <wl-button class="fg blue create-button" id="create-keypair-button" outlined type="button"
              @click="${this._addKeyPair}">
                         <wl-icon>add</wl-icon>
                         Add
                         </wl-button>
            </fieldset>
          </form>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="new-policy-dialog" fixed backdrop blockscrolling>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3>Create</h3>
          <form id="login-form" onSubmit="this._addResourcePolicy()">
            <fieldset>
              <paper-input name="new_policy_name" id="id_new_policy_name" label="Policy Name"
                           type="text"
                           auto-validate required
                           pattern="[a-zA-Z0-9]*"
                           error-message="Policy name only accepts letters and numbers"></paper-input>
              <h4>Resource Policy</h4>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="cpu-resource" label="CPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.cpu_metric.map(item => html`
                    <paper-item label="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="ram-resource" label="RAM (GB)">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.ram_metric.map(item => html`
                    <paper-item label="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="gpu-resource" label="GPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.gpu_metric.map(item => html`
                    <paper-item label="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="vgpu-resource" label="vGPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.vgpu_metric.map(item => html`
                    <paper-item label="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>

              </div>
              <h4>Sessions</h4>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="container-per-session-limit" label="Container per session">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.container_per_session_metric.map(item => html`
                    <paper-item label="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="idle-timeout" label="Idle timeout (sec.)">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.idle_timeout_metric.map(item => html`
                    <paper-item label="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>

              <div class="horizontal center layout">
                <paper-dropdown-menu id="concurrency-limit" label="Concurrent Jobs">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.concurrency_metric.map(item => html`
                    <paper-item label="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <h4>Virtual Folders</h4>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="allowed_vfolder-hosts" label="Allowed hosts">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.allowed_vfolder_hosts.map(item => html`
                    <paper-item label="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="vfolder-capacity-limit" label="Capacity (GB)">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.vfolder_capacity_metric.map(item => html`
                    <paper-item label="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="vfolder-count-limit" label="Max.#">
                  <paper-listbox slot="dropdown-content" selected="0">
                  ${this.vfolder_count_metric.map(item => html`
                    <paper-item label="${item}">${item}</paper-item>
                  `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <br/><br/>
              <wl-button class="fg blue create-button" id="create-policy-button" type="button" outlined
               @click="${this._addResourcePolicy}">
                         <wl-icon>add</wl-icon>
                         Create
              </wl-button>
            </fieldset>
          </form>
        </wl-card>
      </wl-dialog>
    `;
  }
}

customElements.define(BackendAICredentialView.is, BackendAICredentialView);
