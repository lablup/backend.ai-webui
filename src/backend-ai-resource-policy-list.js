/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {html, PolymerElement} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/iron-ajax/iron-ajax';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-icons/av-icons';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item';
import '@material/mwc-button';

import '@polymer/paper-toast/paper-toast';
import './backend-ai-styles.js';
import './lablup-piechart.js';
import './lablup-shields.js';

import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';
import {OverlayPatchMixin} from "./overlay-patch-mixin";

class BackendAIResourcePolicyList extends OverlayPatchMixin(PolymerElement) {

  static get is() {
    return 'backend-ai-resource-policy-list';
  }

  static get properties() {
    return {
      visible: {
        type: Boolean,
        value: false
      },
      keypairs: {
        type: Object,
        value: {}
      },
      resourcePolicy: {
        type: Object,
        value: {}
      },
      keypairInfo: {
        type: Object,
        value: {}
      },
      is_admin: {
        type: Boolean,
        value: false
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
      '_menuChanged(active)'
    ]
  }

  _menuChanged(active) {
    if (!active) {
      return;
    }
    // If disconnected
    if (window.backendaiclient == undefined || window.backendaiclient == null) {
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
    this.$['modify-policy-dialog'].open();
  }

  updateCurrentPolicyToDialog(e) {
    console.log(e.target);
    const controls = e.target.closest('#controls');
    const policyName = controls.policyName;
    console.log(policyName);
    let resourcePolicies = window.backendaiclient.utils.gqlToObject(this.resourcePolicy, 'name');
    let resourcePolicy = resourcePolicies[policyName];
    console.log(resourcePolicy);
    //resourcePolicy['total_resource_slots'] = JSON.parse(resourcePolicy['total_resource_slots']);
    this.$['cpu-resource'].value = resourcePolicy.total_resource_slots.cpu;
    this.$['gpu-resource'].value = resourcePolicy.total_resource_slots['cuda.device'];
    this.$['vgpu-resource'].value = resourcePolicy.total_resource_slots['cuda.shares'];
    this.$['ram-resource'].value = resourcePolicy.total_resource_slots['mem'];

    this.$['concurrency-limit'].value = resourcePolicy.max_concurrent_sessions;
    this.$['container-per-session-limit'].value = resourcePolicy.max_containers_per_session;
    this.$['vfolder-count-limit'].value = resourcePolicy.max_vfolder_count;
    this.$['vfolder-capacity-limit'].value = resourcePolicy.max_vfolder_size;
    this.$['idle-timeout'].value = resourcePolicy.idle_timeout;


    /*
    let cpu_resource = this.$['cpu-resource'].value;
    let ram_resource = this.$['ram-resource'].value;
    let gpu_resource = this.$['gpu-resource'].value;
    let vgpu_resource = this.$['vgpu-resource'].value;

    let total_resource_slots = {
      "cpu": cpu_resource,
      "mem": ram_resource + 'g',
      "cuda.device": parseInt(gpu_resource),
      "cuda.shares": parseFloat(vgpu_resource)
    };
    let vfolder_hosts = ["local"];
    let concurrency_limit = this.$['concurrency-limit'].value;
    let containers_per_session_limit = this.$['container-per-session-limit'].value;
    let vfolder_count_limit = this.$['vfolder-count-limit'].value;
    let vfolder_capacity_limit = this.$['vfolder-capacity-limit'].value;
    let rate_limit = this.$['rate-limit'].value;
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
*/
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
          policy['total_resource_slots'].cpu = '-';
        }
        if ('mem' in policy['total_resource_slots']) {
          policy['total_resource_slots'].mem = parseFloat(policy['total_resource_slots'].mem);
        } else if (policy['default_for_unspecified'] === 'UNLIMITED') {
          policy['total_resource_slots'].mem = '-';
        }
        if ('cuda.device' in policy['total_resource_slots']) {
          if (policy['total_resource_slots']['cuda.device'] === 0 && policy['default_for_unspecified'] === 'UNLIMITED') {
            policy['total_resource_slots'].cuda_device = '-';
          } else {
            policy['total_resource_slots'].cuda_device = policy['total_resource_slots']['cuda.device'];
          }
        } else if (policy['default_for_unspecified'] === 'UNLIMITED') {
          policy['total_resource_slots'].cuda_device = '-';
        }
        if ('cuda.shares' in policy['total_resource_slots']) {
          if (policy['total_resource_slots']['cuda.shares'] === 0 && policy['default_for_unspecified'] === 'UNLIMITED') {
            policy['total_resource_slots'].cuda_shares = '-';
          } else {
            policy['total_resource_slots'].cuda_shares = policy['total_resource_slots']['cuda.shares'];
          }
        } else if (policy['default_for_unspecified'] === 'UNLIMITED') {
          policy['total_resource_slots'].cuda_shares = '-';
        }
      });
      this.resourcePolicy = resourcePolicies;
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
    this._refreshPolicyData();
  }

  _isActive() {
    return this.condition === 'active';
  }

  _readResourcePolicyInput() {
    let cpu_resource = this.$['cpu-resource'].value;
    let ram_resource = this.$['ram-resource'].value;
    let gpu_resource = this.$['gpu-resource'].value;
    let vgpu_resource = this.$['vgpu-resource'].value;

    let total_resource_slots = {
      "cpu": cpu_resource,
      "mem": ram_resource + 'g',
      "cuda.device": parseInt(gpu_resource),
      "cuda.shares": parseFloat(vgpu_resource)
    };
    //let vfolder_hosts = ["local"];
    let vfolder_hosts = ["cephfs"];
    let concurrency_limit = this.$['concurrency-limit'].value;
    let containers_per_session_limit = this.$['container-per-session-limit'].value;
    let vfolder_count_limit = this.$['vfolder-count-limit'].value;
    let vfolder_capacity_limit = this.$['vfolder-capacity-limit'].value;
    let rate_limit = this.$['rate-limit'].value;
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

  _revokeKey2(e) {
    const termButton = e.target;
    const controls = e.target.closest('#controls');
    const accessKey = controls.accessKey;

    console.log(accessKey);
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

  _byteToGB(value) {
    return Math.floor(value / 1000000000);
  }

  _MBToGB(value) {
    return value / 1024;
  }

  _msecToSec(value) {
    return Number(value / 1000).toFixed(2);
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

  _markIfUnlimited(value) {
    if (['-', 0].includes(value)) {
      return '∞';
    } else {
      return value;
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
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>

      <vaadin-grid theme="row-stripes column-borders compact" aria-label="Resource Policy list"
                   items="[[resourcePolicy]]">
        <vaadin-grid-column width="40px" flex-grow="0" resizable>
          <template class="header">#</template>
          <template>[[_indexFrom1(index)]]</template>
        </vaadin-grid-column>

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

        <vaadin-grid-column width="150px" resizable>
          <template class="header">Resources</template>
          <template>
            <div class="layout horizontal wrap center">
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
                <span>[[_markIfUnlimited(item.total_resource_slots.cpu)]]</span>
                <span class="indicator">cores</span>
              </div>
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                <span>[[_markIfUnlimited(item.total_resource_slots.mem)]]</span>
                <span class="indicator">GB</span>
              </div>
            </div>
            <div class="layout horizontal wrap center">
              <template is="dom-if" if="[[item.total_resource_slots.cuda_device]]">
                <div class="layout horizontal configuration">
                  <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                  <span>[[_markIfUnlimited(item.total_resource_slots.cuda_device)]]</span>
                  <span class="indicator">GPU</span>
                </div>
              </template>
              <template is="dom-if" if="[[item.total_resource_slots.cuda_shares]]">
                <div class="layout horizontal configuration">
                  <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                  <span>[[_markIfUnlimited(item.total_resource_slots.cuda_shares)]]</span>
                  <span class="indicator">vGPU</span>
                </div>
              </template>
            </div>
            <div class="layout horizontal wrap center">
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="icons:cloud-queue"></iron-icon>
                <span>[[_markIfUnlimited(item.max_vfolder_size)]]</span>
                <span class="indicator">GB</span>
              </div>
              <div class="layout horizontal configuration">
                <iron-icon class="fg green" icon="icons:folder"></iron-icon>
                <span>[[_markIfUnlimited(item.max_vfolder_count)]]</span>
                <span class="indicator">Folders</span>
              </div>
            </div>
          </template>
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
          <template class="header">Data Nodes</template>
          <template>
            <div class="layout horizontal center flex">
              <div class="vertical start layout">
                <div>[[item.allowed_vfolder_hosts]]
                </div>
              </div>
            </div>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">Control</template>
          <template>
            <div id="controls" class="layout horizontal flex center"
                 policy-name="[[item.name]]">
              <template is="dom-if" if="[[is_admin]]">
                <paper-icon-button class="controls-running" icon="settings"
                                   on-tap="_launchResourcePolicyDialog"></paper-icon-button>
              </template>
            </div>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
      <paper-dialog id="modify-policy-dialog"
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3>Modify</h3>
          <form id="login-form" onSubmit="this._modifyResourcePolicy()">
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
              </div>
              <div class="horizontal center layout">
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

customElements.define(BackendAIResourcePolicyList.is, BackendAIResourcePolicyList);
