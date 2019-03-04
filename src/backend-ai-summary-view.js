/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {html, PolymerElement} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
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
import '@polymer/paper-toast/paper-toast';
import '@polymer/paper-spinner/paper-spinner-lite';

import '@vaadin/vaadin-progress-bar/vaadin-progress-bar.js';
import '@polymer/paper-progress/paper-progress';

import './backend-ai-styles.js';
import './lablup-activity-panel.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';

class BackendAISummary extends PolymerElement {
  static get properties() {
    return {
      condition: {
        type: String,
        default: 'running'  // finished, running, archived
      },
      jobs: {
        type: Object,
        value: {}
      },
      sessions: {
        type: Object,
        value: {}
      },
      agents: {
        type: Object,
        value: {}
      },
      is_admin: {
        type: Boolean,
        value: false
      },
      resources: {
        type: Object,
        value: {}
      },
      authenticated: {
        type: Boolean,
        value: false
      },
      active: {
        type: Boolean,
        value: false
      }
    };
  }

  constructor() {
    super();
    // Resolve warning about scroll performance
    // See https://developers.google.com/web/updates/2016/06/passive-event-listeners
    setPassiveTouchGestures(true);
  }

  ready() {
    super.ready();
  }

  static get observers() {
    return [
      '_refreshHealthPanel(window.backendaiclient)',
      '_menuChanged(active)'
    ]
  }

  connectedCallback() {
    super.connectedCallback();
    afterNextRender(this, function () {
    });
  }

  shouldUpdate() {
    return this.active;
  }

  _refreshHealthPanel() {
    this._refreshSessionInformation();
    if (this.is_admin) {
      this._refreshAgentInformation();
    }
  }

  _refreshSessionInformation() {
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
    }
    let fields = ["sess_id"];
    window.backendaiclient.computeSession.list(fields, status).then((response) => {
      this.jobs = response;
      this.sessions = response.compute_sessions;
      if (this.active == true) {
        setTimeout(() => {
          this._refreshSessionInformation()
        }, 15000);
      }
    }).catch(err => {
      this.jobs = [];
      this.sessions = [];
      this.$.notification.text = 'Couldn\'t connect to manager.';
      this.$.notification.show();
    });
  }

  _refreshResourceInformation() {
    return window.backendaiclient.resourcePolicy.get(window.backendaiclient.resource_policy).then((response) => {
      let rp = response.keypair_resource_policies;
      this.resourcePolicy = window.backendaiclient.utils.gqlToObject(rp, 'name');

    });
  }

  _refreshAgentInformation(status = 'running') {
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
    }
    let fields = ['id',
      'addr',
      'status',
      'first_contact',
      'cpu_cur_pct',
      'mem_cur_bytes',
      'occupied_slots',
      'available_slots'];
    this.shadowRoot.querySelector('#loading-indicator').show();
    window.backendaiclient.agent.list(status, fields).then((response) => {
      this.shadowRoot.querySelector('#loading-indicator').hide();

      this.agents = response.agents;
      this._init_resource_values();
      Object.keys(this.agents).map((objectKey, index) => {
        let value = this.agents[objectKey];
        let occupied_slots = JSON.parse(value.occupied_slots);
        let available_slots = JSON.parse(value.available_slots);
        this.resources.cpu.total = this.resources.cpu.total + parseInt(Number(available_slots.cpu));
        this.resources.cpu.used = this.resources.cpu.used + parseInt(Number(occupied_slots.cpu));
        this.resources.cpu.percent = this.resources.cpu.percent + parseFloat(value.cpu_cur_pct);

        this.resources.mem.total = this.resources.mem.total + parseInt(window.backendaiclient.utils.changeBinaryUnit(available_slots.mem, 'm'));
        this.resources.mem.allocated = this.resources.mem.allocated + parseInt(window.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem, 'm'));
        this.resources.mem.used = this.resources.mem.used + parseInt(window.backendaiclient.utils.changeBinaryUnit(value.mem_cur_bytes, 'm'));

        this.resources.gpu.total = this.resources.gpu.total + parseInt(Number(available_slots['cuda.device']));
        if ('cuda.device' in occupied_slots) {
          this.resources.gpu.used = this.resources.gpu.used + parseInt(Number(occupied_slots['cuda.device']));
        }
        this.resources.vgpu.total = this.resources.vgpu.total + parseFloat(available_slots['cuda.shares']);
        if ('cuda.shares' in occupied_slots) {
          this.resources.vgpu.used = this.resources.vgpu.used + parseFloat(occupied_slots['cuda.shares']);
        }
        if (isNaN(this.resources.cpu.used)) {
          this.resources.cpu.used = 0;
        }
        if (isNaN(this.resources.mem.used)) {
          this.resources.mem.used = 0;
        }
        if (isNaN(this.resources.gpu.used)) {
          this.resources.gpu.used = 0;
        }
        if (isNaN(this.resources.vgpu.used)) {
          this.resources.vgpu.used = 0;
        }

      });
      this._sync_resource_values();
      if (this.active == true) {
        setTimeout(() => {
          this._refreshAgentInformation(status)
        }, 15000);
      }
    }).catch(err => {
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  _init_resource_values() {
    this.resources.cpu = {};
    this.resources.cpu.total = 0;
    this.resources.cpu.used = 0;
    this.resources.cpu.percent = 0;
    this.resources.mem = {};
    this.resources.mem.total = 0;
    this.resources.mem.allocated = 0;
    this.resources.mem.used = 0;
    this.resources.gpu = {};
    this.resources.gpu.total = 0;
    this.resources.gpu.used = 0;
    this.resources.vgpu = {};
    this.resources.vgpu.total = 0;
    this.resources.vgpu.used = 0;
  }

  _sync_resource_values() {
    this.cpu_total = this.resources.cpu.total;
    this.mem_total = this.resources.mem.total;
    this.gpu_total = this.resources.gpu.total;
    this.vgpu_total = this.resources.vgpu.total;

    this.cpu_used = this.resources.cpu.used;
    this.mem_used = this.resources.mem.used;
    this.gpu_used = this.resources.gpu.used;
    this.vgpu_used = this.resources.vgpu.used;

    this.cpu_percent = this.resources.cpu.percent;
    this.mem_allocated = this.resources.mem.allocated;
    this.cpu_total_usage_ratio = this.resources.cpu.used / this.resources.cpu.total * 100.0;
    this.cpu_current_usage_ratio = this.resources.cpu.percent / this.resources.cpu.total;
    this.mem_total_usage_ratio = this.resources.mem.allocated / this.resources.mem.total * 100.0;
    this.mem_current_usage_ratio = this.resources.mem.used / this.resources.mem.total * 100.0;
    this.mem_current_usage_percent = (this.mem_current_usage_ratio / this.mem_total_usage_ratio * 100.0).toFixed(2);
    if (isNaN(this.mem_current_usage_percent)) {
      this.mem_current_usage_percent = 0;
    }
  }

  _menuChanged(active) {
    if (!active) {
      return;
    }

    if (window.backendaiclient == undefined || window.backendaiclient == null) {
      document.addEventListener('backend-ai-connected', () => {
        this._init_resource_values();
        this.is_admin = window.backendaiclient.is_admin;
        this.authenticated = true;
        this._refreshHealthPanel();
      }, true);
    } else {
      this._init_resource_values();
      this.is_admin = window.backendaiclient.is_admin;
      this.authenticated = true;
      this._refreshHealthPanel();
    }
  }

  _toInt(value) {
    return Math.ceil(value);
  }

  _countObject(obj) {
    return Object.keys(obj).length;
  }

  static get template() {
    // language=HTML
    return html`
      <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
        ul {
          padding-left: 0;
        }

        ul li {
          list-style: none;
          font-size: 13px;
        }

        span.indicator {
          width: 100px;
        }

        div.big.indicator {
          font-size: 48px;
        }

        vaadin-progress-bar {
          width: 190px;
          height: 10px;
        }

        paper-progress {
          width: 190px;
          border-radius: 3px;
          --paper-progress-height: 10px;
          --paper-progress-active-color: #3677EB;
          --paper-progress-secondary-color: #98BE5A;
          --paper-progress-transition-duration: 0.08s;
          --paper-progress-transition-timing-function: ease;
          --paper-progress-transition-delay: 0s;
        }
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <paper-material class="item" elevation="1" style="padding-bottom:20px;">
        <h3 class="paper-material-title">Statistics</h3>
        <div class="horizontal wrap layout">
          <lablup-activity-panel title="Health" elevation="1">
            <div slot="message">
              <div class="horizontal justified layout wrap">
                <template is="dom-if" if="{{is_admin}}">
                  <div class="vertical layout center">
                    <div class="big indicator">[[_countObject(agents)]]</div>
                    <span>Connected nodes</span>
                  </div>
                </template>
                <div class="vertical layout center">
                  <div class="big indicator">[[_countObject(sessions)]]</div>
                  <span>Active sessions</span>
                </div>
              </div>
            </div>
          </lablup-activity-panel>

          <lablup-activity-panel title="Resource Allocation" elevation="1">
            <div slot="message">
              <template is="dom-if" if="{{is_admin}}">
                <div class="layout horizontal center flex" style="margin-bottom:5px;">
                  <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
                  <div class="layout vertical start" style="padding-left:15px;">
                    <paper-progress id="cpu-usage-bar" value="[[cpu_current_usage_ratio]]"
                                    secondary-progress="[[cpu_total_usage_ratio]]"></paper-progress>
                    <div>CPUs: <span class="progress-value"> [[cpu_used]]</span>/[[cpu_total]] Cores reserved.</div>
                    <div>Using <span class="progress-value"> [[cpu_percent]]</span>%.</div>
                  </div>
                </div>
                <div class="layout horizontal center flex" style="margin-bottom:5px;">
                  <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                  <div class="layout vertical start" style="padding-left:15px;">
                    <paper-progress id="mem-usage-bar" value="[[mem_current_usage_ratio]]"
                                    secondary-progress="[[mem_total_usage_ratio]]"></paper-progress>
                    <div><span class="progress-value"> [[mem_allocated]]</span>/[[mem_total]] MB reserved.</div>
                    <div>Using <span class="progress-value"> [[mem_used]]</span>/[[mem_total]] MB
                      ([[mem_current_usage_percent]] %)
                    </div>
                  </div>
                </div>
                <template is="dom-if" if="[[gpu_total]]">
                  <div class="layout horizontal center flex" style="margin-bottom:5px;">
                    <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                    <div class="layout vertical start" style="padding-left:15px;">
                      <vaadin-progress-bar id="gpu-bar" value="[[gpu_used]]" max="[[gpu_total]]"></vaadin-progress-bar>
                      <div><span class="progress-value"> [[gpu_used]]</span>/[[gpu_total]] GPUs</div>
                    </div>
                  </div>
                </template>
                <template is="dom-if" if="[[vgpu_total]]">
                  <div class="layout horizontal center flex" style="margin-bottom:5px;">
                    <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                    <div class="layout vertical start" style="padding-left:15px;">
                      <vaadin-progress-bar id="vgpu-bar" value="[[vgpu_used]]"
                                           max="[[vgpu_total]]"></vaadin-progress-bar>
                      <div><span class="progress-value"> [[vgpu_used]]</span>/[[vgpu_total]] vGPUs</div>
                    </div>
                  </div>
                </template>
                <template is="dom-if" if="[[!vgpu_total]]">
                  <div>vGPU disabled on this cluster.</div>
                </template>
              </template>
              <template is="dom-if" if="{{!is_admin}}">
                <ul>
                  <li>Login with administrator privileges required.</li>
                </ul>
              </template>
            </div>
          </lablup-activity-panel>
          <lablup-activity-panel title="My Resources" elevation="1">
            <div slot="message">
            </div>
          </lablup-activity-panel>
        </div>
        <h3 class="paper-material-title">Actions</h3>
        <div class="horizontal wrap layout">
          <template is="dom-if" if="{{is_admin}}">
            <lablup-activity-panel title="Keypair" elevation="1">
              <div slot="message">
                <ul>
                  <li><a href="/credential">Create a new key pair</a></li>
                  <li><a href="/credential">Maintain keypairs</a></li>
                </ul>
              </div>
            </lablup-activity-panel>
          </template>
          <template is="dom-if" if="{{!authenticated}}">
            <lablup-activity-panel title="No action" elevation="1">
              <div slot="message">
                <ul>
                  <li>You need an administrator privileges.</li>
                </ul>
              </div>
            </lablup-activity-panel>
          </template>
        </div>
      </paper-material>
    `;
  }
}

customElements.define('backend-ai-summary-view', BackendAISummary);
