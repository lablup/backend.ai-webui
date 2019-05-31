/**
 * Backend.AI-credential-view
 */

import {html, PolymerElement} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import './plastics/plastic-material/plastic-material';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-image/iron-image';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';

import '@polymer/paper-input/paper-input';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-item/paper-item';
import '@polymer/neon-animation/animations/scale-up-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';
import '@vaadin/vaadin-icons/vaadin-icons.js';
import 'weightless/button';
import 'weightless/icon';

import './backend-ai-styles.js';
import './backend-ai-credential-list.js';
import './backend-ai-resource-policy-list.js';
import {OverlayPatchMixin} from './overlay-patch-mixin.js';

import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';


class BackendAICredentialView extends OverlayPatchMixin(PolymerElement) {
  static get properties() {
    return {
      active: {
        type: Boolean,
        value: false
      },
      cpu_metric: {
        type: Array,
        value: [1, 2, 3, 4, 8, 16, 24, "Unlimited"]
      },
      ram_metric: {
        type: Array,
        value: [1, 2, 4, 8, 16, 24, 32, 64, 128, 256, 512, "Unlimited"]
      },
      gpu_metric: {
        type: Array,
        value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 16, "Unlimited"]
      },
      vgpu_metric: {
        type: Array,
        value: [0, 0.3, 0.6, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 12, 16, "Unlimited"]
      },
      rate_metric: {
        type: Array,
        value: [1000, 2000, 3000, 4000, 5000, 10000, 50000]
      },
      concurrency_metric: {
        type: Array,
        value: [1, 2, 3, 4, 5, 10, 50, "Unlimited"]
      },
      container_per_session_metric: {
        type: Array,
        value: [1, 2, 3, 4, 8, "Unlimited"]
      },
      idle_timeout_metric: {
        type: Array,
        value: [60, 180, 540, 900, 1800, 3600]
      },
      vfolder_capacity_metric: {
        type: Array,
        value: [1, 2, 5, 10, 50, 100, 200, 1000]
      },
      vfolder_count_metric: {
        type: Array,
        value: [1, 2, 3, 4, 5, 10, 30, 50, 100]
      },
      resource_policies: {
        type: Object,
        value: {}
      },
      resource_policy_names: {
        type: Array,
        value: []
      },
      is_admin: {
        type: Boolean,
        value: false
      },
      allowed_vfolder_hosts: {
        type: Array,
        value: []
      },
      default_vfolder_host: {
        type: String,
        value: ''
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
    setPassiveTouchGestures(true);
  }

  ready() {
    super.ready();
    if (this.$['add-keypair']) {
      this.$['add-keypair'].addEventListener('tap', this._launchKeyPairDialog.bind(this));
    }
    this.$['create-keypair-button'].addEventListener('tap', this._addKeyPair.bind(this));

    if (this.$['add-policy']) {
      this.$['add-policy'].addEventListener('tap', this._launchResourcePolicyDialog.bind(this));
    }
    this.$['create-policy-button'].addEventListener('tap', this._addResourcePolicy.bind(this));

    document.addEventListener('backend-ai-credential-refresh', () => {
      this.$['active-credential-list'].refresh();
      this.$['inactive-credential-list'].refresh();
    }, true);

    if (window.backendaiclient == undefined || window.backendaiclient == null) {
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
    afterNextRender(this, function () {
    });
  }

  static get observers() {
    return [
      '_routeChanged(route.*)',
      '_viewChanged(routeData.view)',
      '_menuChanged(active)'
    ]
  }

  _routeChanged(changeRecord) {
    if (changeRecord.path === 'path') {
      console.log('Path changed!');
    }
  }

  _viewChanged(view) {
    // load data for view
  }

  _menuChanged(active) {
    if (!active) {
      this.$['active-credential-list'].active = false;
      this.$['inactive-credential-list'].active = false;
      this.$['resource-policy-list'].active = false;
      return;
    } else {
      this.$['active-credential-list'].active = true;
      this.$['inactive-credential-list'].active = true;
      this.$['resource-policy-list'].active = true;
    }
    this.is_admin = window.backendaiclient.is_admin;
  }

  async _launchKeyPairDialog() {
    await this._getResourcePolicies();
    this.$['new-keypair-dialog'].open();
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
    this.$['new-policy-dialog'].open();
  }

  _launchModifyResourcePolicyDialog() {
    this._readVFolderHostInfo();
    this.$['new-policy-dialog'].open();
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
    if (this.$['id_new_user_id'].value != '') {
      if (this.$['id_new_user_id'].invalid == true) {
        return;
      }
      user_id = this.$['id_new_user_id'].value;
    } else {
      user_id = window.backendaiclient.email;
    }
    console.log(user_id);
    let resource_policy = this.$['resource-policy'].value;
    let rate_limit = this.$['rate-limit'].value;

    // Read resources
    window.backendaiclient.keypair.add(user_id, is_active, is_admin,
      resource_policy, rate_limit).then(response => {
      this.$['new-keypair-dialog'].close();
      this.$.notification.text = "Keypair successfully created.";
      this.$.notification.show();
      this.$['active-credential-list'].refresh();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.$['new-keypair-dialog'].close();
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  _readResourcePolicyInput() {
    let cpu_resource = this.$['cpu-resource'].value;
    let ram_resource = this.$['ram-resource'].value;
    let gpu_resource = this.$['gpu-resource'].value;
    let vgpu_resource = this.$['vgpu-resource'].value;
    let vfolder_hosts = this.$['allowed_vfolder-hosts'].value;
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
    let concurrency_limit = this.$['concurrency-limit'].value;
    let containers_per_session_limit = this.$['container-per-session-limit'].value;
    let vfolder_count_limit = this.$['vfolder-count-limit'].value;
    let vfolder_capacity_limit = this.$['vfolder-capacity-limit'].value;
    let idle_timeout = this.$['idle-timeout'].value;
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
    if (this.$['id_new_policy_name'].value != '') {
      if (this.$['id_new_policy_name'].invalid == true) {
        return;
      }
      name = this.$['id_new_policy_name'].value;
    } else {
      this.$.notification.text = "Please input policy name";
      this.$.notification.show();
      return;
    }
    let input = this._readResourcePolicyInput();
    console.log(input);
    window.backendaiclient.resourcePolicy.add(name, input).then(response => {
      this.$['new-policy-dialog'].close();
      this.$.notification.text = "Resource policy successfully created.";
      this.$.notification.show();
      this.$['resource-policy-list'].refresh();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.$['new-policy-dialog'].close();
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  _modifyResourcePolicy() {
    let is_active = true;
    let is_admin = false;
    let name = this.$['id_new_policy_name'].value;
    let input = this._readResourcePolicyInput();

    window.backendaiclient.resourcePolicy.mutate(name, input).then(response => {
      this.$['new-policy-dialog'].close();
      this.$.notification.text = "Resource policy successfully updated.";
      this.$.notification.show();
      this.$['resource-policy-list'].refresh();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.$['new-policy-dialog'].close();
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

  static get template() {
    // language=HTML
    return html`
      <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
        wl-button.create-button {
          width: calc(100% - 40px);
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
          padding-left: 20px;
          padding-right: 20px;
          padding-bottom: 20px;
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

        wl-button {
          --button-bg: var(--paper-light-green-50);
          --button-bg-hover: var(--paper-green-100);
          --button-bg-active: var(--paper-green-600);
        }
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <plastic-material class="admin item" elevation="1">
        <h3>Credentials</h3>
        <h4 class="horizontal flex center center-justified layout">
          <span>Active</span>
          <span class="flex"></span>
          <wl-button class="fg green" id="add-keypair" outlined>
            <wl-icon>add</wl-icon>
            Add credential
          </wl-button>
        </h4>
        <div>
          <backend-ai-credential-list id="active-credential-list" condition="active"></backend-ai-credential-list>
        </div>
        <h4>Inactive</h4>
        <div>
          <backend-ai-credential-list id="inactive-credential-list" condition="inactive"></backend-ai-credential-list>
        </div>
      </plastic-material>

      <plastic-material class="admin item" elevation="1">
        <h3>Resource policies</h3>
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
      </plastic-material>


      <paper-dialog id="new-keypair-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <plastic-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3>Add credential</h3>
          <form id="login-form" onSubmit="this._addKeyPair()">
            <fieldset>
              <paper-input type="email" name="new_user_id" id="id_new_user_id" label="User ID as E-mail (optional)"
                           auto-validate></paper-input>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="resource-policy" label="Resource Policy">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ resource_policy_names }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="rate-limit" label="Rate Limit (for 15 min.)">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ rate_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <br/><br/>
              <wl-button class="fg blue create-button" id="create-keypair-button" outlined label="Add"
                         icon="add"></wl-button>
            </fieldset>
          </form>
        </plastic-material>
      </paper-dialog>
      <paper-dialog id="new-policy-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <plastic-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3>Create</h3>
          <form id="login-form" onSubmit="this._addResourcePolicy()">
            <fieldset>
              <paper-input type="text" name="new_policy_name" id="id_new_policy_name" label="Policy Name"
                           auto-validate required
                           pattern="[a-zA-Z0-9]*"
                           error-message="Policy name only accepts letters and numbers"></paper-input>
              <h4>Resource Policy</h4>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="cpu-resource" label="CPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ cpu_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="ram-resource" label="RAM (GB)">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ ram_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="gpu-resource" label="GPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ gpu_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="vgpu-resource" label="vGPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ vgpu_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>

              </div>
              <h4>Sessions</h4>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="container-per-session-limit" label="Container per session">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ container_per_session_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="idle-timeout" label="Idle timeout (sec.)">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ idle_timeout_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>

              <div class="horizontal center layout">
                <paper-dropdown-menu id="concurrency-limit" label="Concurrent Jobs">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ concurrency_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <h4>Virtual Folders</h4>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="allowed_vfolder-hosts" label="Allowed hosts">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ allowed_vfolder_hosts }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="vfolder-capacity-limit" label="Capacity (GB)">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ vfolder_capacity_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="vfolder-count-limit" label="Max.#">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ vfolder_count_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <br/><br/>
              <wl-button class="fg blue create-button" id="create-policy-button" outlined label="Create"
                         icon="add"></wl-button>
            </fieldset>
          </form>
        </plastic-material>
      </paper-dialog>
    `;
  }
}

customElements.define(BackendAICredentialView.is, BackendAICredentialView);
