/**
 * Backend.AI-job-view
 */

import {html, PolymerElement} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/paper-material/paper-material';
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
import '@material/mwc-button';

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
        value: [1, 2, 3, 4, 8, 16, 24]
      },
      ram_metric: {
        type: Array,
        value: [1, 2, 4, 8, 16, 24, 32, 64, 128, 256, 512]
      },
      gpu_metric: {
        type: Array,
        value: [0, 0.3, 0.6, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 12, 16]
      },
      rate_metric: {
        type: Array,
        value: [1000, 2000, 3000, 4000, 5000, 10000, 50000]
      },
      concurrency_metric: {
        type: Array,
        value: [1, 2, 3, 4, 5, 10, 50]
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
    this.$['add-keypair'].addEventListener('tap', this._launchKeyPairDialog.bind(this));
    this.$['create-keypair-button'].addEventListener('tap', this._addKeyPair.bind(this));

    this.$['add-policy'].addEventListener('tap', this._launchResourcePolicyDialog.bind(this));
    this.$['create-policy-button'].addEventListener('tap', this._addResourcePolicy.bind(this));

    document.addEventListener('backend-ai-credential-refresh', () => {
      this.$['active-credential-list'].refresh();
      this.$['inactive-credential-list'].refresh();
    }, true);
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
  }

  _launchKeyPairDialog() {
    console.log(this._getResourcePolicies());
    this.$['new-keypair-dialog'].open();
  }

  _launchResourcePolicyDialog() {
    this.$['new-policy-dialog'].open();
  }

  _getResourcePolicies() {
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
    let resource_policy = 'default';
    let rate_limit = 5000;
    let concurrency_limit = 1;
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
    // Read resources
    let cpu_resource = this.$['cpu-resource'].value;
    let ram_resource = this.$['ram-resource'].value;
    let gpu_resource = this.$['gpu-resource'].value;

    concurrency_limit = this.$['concurrency-limit'].value;
    rate_limit = this.$['rate-limit'].value;

    window.backendaiclient.keypairs.add(user_id, is_active, is_admin,
      resource_policy, rate_limit, concurrency_limit).then(response => {
      this.$['new-keypair-dialog'].close();
      this.$.notification.text = "Keypair successfully created.";
      this.$.notification.show();
      this.$['active-credential-list'].refresh();
      this.$['inactive-credential-list'].refresh();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.$['new-keypair-dialog'].close();
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  _addResourcePolicy() {
    let is_active = true;
    let is_admin = false;
    let user_id;
    if (this.$['id_new_policy_name'].value != '') {
      if (this.$['id_new_policy_name'].invalid == true) {
        return;
      }
      user_id = this.$['id__policy_name'].value;
    } else {
      return;
    }

    let cpu_resource = this.$['cpu-resource'].value;
    let ram_resource = this.$['ram-resource'].value;
    let gpu_resource = this.$['gpu-resource'].value;

    let concurrency_limit = this.$['concurrency-limit'].value;
    let containers_per_session_limit = this.$['container-per-session-limit'].value;
    let vfolder_count_limit = this.$['vfolder-count-limit'].value;
    let vfolder_capacity_limit = this.$['vfolder-capacity-limit'].value;
    let rate_limit = this.$['rate-limit'].value;
    let idle_timeout = this.$['idle-timeout'].value;
    let input = {
      'name': name,
      'default_for_unspecified': 'default',
      'total_resource_slots': total_resource_slots,
      'max_concurrent_sessions': concurrency_limit,
      'max_containers_per_session': containers_per_session_limit,
      'idle_timeout': idle_timeout,
      'max_vfolder_count': vfolder_count_limit,
      'max_vfolder_size': vfolder_capacity_limit,
      'allowed_vfolder_hosts': vfolder_hosts
    };
    window.backendaiclient.resource_policy.add(name, input).then(response => {
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

  static get template() {
    // language=HTML
    return html`
      <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
        mwc-button.create-button {
          width: 100%;
        }

        #new-keypair-dialog {
          min-width: 350px;
        }
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <paper-material class="item" elevation="1">
        <h3>Credentials</h3>
        <h4 class="horizontal flex center center-justified layout">
          <span>Active</span>
          <span class="flex"></span>
          <mwc-button class="fg red" id="add-keypair" outlined label="Add credential" icon="add"></mwc-button>
        </h4>
        <div>
          <backend-ai-credential-list id="active-credential-list" condition="active"></backend-ai-job-list>
        </div>
        <h4>Inactive</h4>
        <div>
          <backend-ai-credential-list id="inactive-credential-list" condition="inactive"></backend-ai-job-list>
        </div>
      </paper-material>

      <paper-material class="item" elevation="1">
        <h3>Resource policies</h3>
        <h4 class="horizontal flex center center-justified layout">
          <span>Policy groups</span>
          <span class="flex"></span>
          <mwc-button class="fg red" id="add-policy" outlined label="Create policy" icon="add"></mwc-button>
        </h4>
        <div>
          <backend-ai-resource-policy-list id="resource-policy-list"></backend-ai-resource-policy-list>
        </div>
      </paper-material>


      <paper-dialog id="new-keypair-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3>Add credential</h3>
          <form id="login-form" onSubmit="this._addKeyPair()">
            <fieldset>
              <paper-input type="email" name="new_user_id" id="id_new_user_id" label="User ID as E-mail (optional)"
                           auto-validate></paper-input>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="resource-policies" label="Resource Policy">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ resource_policy_names }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <br/><br/>
              <mwc-button class="fg blue create-button" id="create-keypair-button" outlined label="Add"
                          icon="add"></mwc-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
      <paper-dialog id="new-policy-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3>Create</h3>
          <form id="login-form" onSubmit="this._addKeyPair()">
            <fieldset>
              <paper-input type="text" name="new_policy_name" id="id_new_policy_name" label="Policy Name"
                           auto-validate></paper-input>
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
              </div>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="concurrency-limit" label="Concurrent Jobs">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ concurrency_metric }}">
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
              <div class="horizontal center layout">
                <paper-dropdown-menu id="vfolder-capacity-limit" label="Virtual Folder Capacity">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ vfolder_capacity_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="vfolder-count-limit" label="Max. Virtual Folders">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ vfolder_count_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <br/><br/>
              <mwc-button class="fg blue create-button" id="create-policy-button" outlined label="Create"
                          icon="add"></mwc-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
    `;
  }
}

customElements.define(BackendAICredentialView.is, BackendAICredentialView);
