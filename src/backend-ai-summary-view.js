/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {PolymerElement, html} from '@polymer/polymer';
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

import '@vaadin/vaadin-progress-bar/vaadin-progress-bar.js';

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
      visible: {
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
    document.addEventListener('backend-ai-connected', () => {
      this._init_resource_values();
      this.is_admin = window.backendaiclient.is_admin;
      this.authenticated = true;
      this._refreshHealthPanel();
    }, true);
  }

  static get observers() {
    return [
      '_routeChanged(route.*)',
      '_viewChanged(routeData.view)',
      '_refreshHealthPanel(window.backendaiclient)',
      '_menuChanged(visible)'
    ]
  }

  connectedCallback() {
    super.connectedCallback();
    afterNextRender(this, function () {
    });
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
    ;

    let fields = ["sess_id"];
    let q = `query($status:String) {` +
      `  compute_sessions(status:$status) { ${fields.join(" ")} }` +
      '}';
    let v = {'status': status};

    window.backendaiclient.gql(q, v).then(response => {
      this.jobs = response;
      this.sessions = response.compute_sessions;
      if (this.visible == true) {
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
    ;
    let fields = ['id',
      'addr',
      'status',
      'first_contact',
      'occupied_slots',
      'available_slots'];
    let q = `query($status: String) {` +
      `  agents(status: $status) {` +
      `     ${fields.join(" ")}` +
      `  }` +
      `}`;

    let v = {'status': status};

    window.backendaiclient.gql(q, v).then(response => {
      this.agents = response.agents;
      this._init_resource_values();
      Object.keys(this.agents).map((objectKey, index) => {
        var value = this.agents[objectKey];
        var occupied_slots = JSON.parse(value.occupied_slots);
        var available_slots = JSON.parse(value.available_slots);
        console.log(value);
        this.resources.cpu.total = this.resources.cpu.total + parseInt(available_slots.cpu);
        this.resources.cpu.used = this.resources.cpu.used + parseInt(occupied_slots.cpu);
        this.resources.mem.total = this.resources.mem.total + parseInt(window.backendaiclient.utils.changeBinaryUnit(available_slots.mem, 'm'));
        this.resources.mem.used = this.resources.mem.used + parseInt(window.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem, 'm'));
        this.resources.gpu.total = this.resources.gpu.total + parseInt(available_slots['cuda.device']);
        if ('cuda.device' in occupied_slots) {
          this.resources.gpu.used = this.resources.gpu.used + parseInt(occupied_slots['cuda.device']);
        }
        this.resources.vgpu.total = this.resources.vgpu.total + parseInt(available_slots['cuda.shares']);
        if ('cuda.shares' in occupied_slots) {
          this.resources.vgpu.used = this.resources.vgpu.used + parseInt(occupied_slots['cuda.shares']);
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
      console.log(this.resources.vgpu);
      this._sync_resource_values();
      if (this.visible == true) {
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
    this.resources.mem = {};
    this.resources.mem.total = 0;
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
  }

  _routeChanged(changeRecord) {
    if (changeRecord.path === 'path') {
      console.log('Path changed!');
    }
  }

  _viewChanged(view) {
    // load data for view
  }

  _menuChanged(visible) {
    if (!visible) {
      return;
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
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <paper-material class="item" elevation="1" style="padding-bottom:20px;">
        <h3 class="paper-material-title">Statistics</h3>
        <div class="horizontal wrap layout">
          <lablup-activity-panel title="Health" elevation="1">
            <div slot="message">
              <ul>
                <template is="dom-if" if="{{is_admin}}">
                  <li>Connected agents: [[_countObject(agents)]]</li>
                </template>
                <li>Active sessions: [[_countObject(sessions)]]</li>
              </ul>
            </div>
          </lablup-activity-panel>

          <lablup-activity-panel title="Loads" elevation="1">
            <div slot="message">
              <template is="dom-if" if="{{is_admin}}">
                <vaadin-progress-bar id="cpu-bar" value="[[cpu_used]]" max="[[cpu_total]]"></vaadin-progress-bar>
                CPUs: <span class="progress-value"> [[cpu_used]]</span>/[[cpu_total]] Cores
                <vaadin-progress-bar id="mem-bar" value="[[mem_used]]" max="[[mem_total]]"></vaadin-progress-bar>
                Memory: <span class="progress-value"> [[mem_used]]</span>/[[mem_total]] MB
                <template is="dom-if" if="[[gpu_total]]">
                  <vaadin-progress-bar id="gpu-bar" value="[[gpu_used]]" max="[[gpu_total]]"></vaadin-progress-bar>
                  GPUs: <span class="progress-value"> [[gpu_used]]</span>/[[gpu_total]] GPUs
                  <template is="dom-if" if="[[vgpu_total]]">
                  (<span class="progress-value"> [[vgpu_used]]</span>/[[vgpu_total]] vGPUs)
                  </template>
                  <template is="dom-if" if="[[!vgpu_total]]">
                  (vGPU disabled)
                  </template>
                </template>
                <template is="dom-if" if="[[!gpu_total]]">
                  <vaadin-progress-bar id="gpu-bar" value="0" max="1"></vaadin-progress-bar>
                  GPUs: <span class="progress-value"> Not installed</span>
                </template>
              </template>
              <template is="dom-if" if="{{!is_admin}}">
                <ul>
                  <li>Login with administrator privileges required.</li>
                </ul>
              </template>
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
