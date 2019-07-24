/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";
import './lablup-loading-indicator';

import '@vaadin/vaadin-progress-bar/vaadin-progress-bar.js';
import '@polymer/paper-progress/paper-progress';

import 'weightless/card';

import './lablup-notification.js';
import './lablup-activity-panel.js';
import './backend-ai-chart.js';
import './backend-ai-resource-monitor.js';
import '../plastics/lablup-shields/lablup-shields';

import {default as PainKiller} from "./backend-ai-painkiller";
import {BackendAiStyles} from "./backend-ai-console-styles";
import {IronFlex, IronFlexAlignment, IronPositioning} from "../plastics/layout/iron-flex-layout-classes";

class BackendAISummary extends LitElement {
  constructor() {
    super();
    this.condition = 'running';
    this.jobs = {};
    this.sessions = {};
    this.agents = 0;
    this.is_superadmin = false;
    this.resources = {};
    this.authenticated = false;
    this.active = false;
    this.manager_version = '';
    this.invitations = [];
  }

  static get properties() {
    return {
      condition: {
        type: String
      },
      jobs: {
        type: Object
      },
      sessions: {
        type: Object
      },
      agents: {
        type: Number
      },
      is_superadmin: {
        type: Boolean
      },
      resources: {
        type: Object
      },
      authenticated: {
        type: Boolean
      },
      active: {
        type: Boolean
      },
      manager_version: {
        type: String
      },
      cpu_total: {type: Number},
      cpu_used: {type: Number},
      cpu_percent: {type: Number},
      cpu_total_percent: {type: Number},
      cpu_total_usage_ratio: {type: Number},
      cpu_current_usage_ratio: {type: Number},
      mem_total: {type: Number},
      mem_used: {type: Number},
      mem_allocated: {type: Number},
      mem_total_usage_ratio: {type: Number},
      mem_current_usage_ratio: {type: Number},
      mem_current_usage_percent: {type: Number},
      gpu_total: {type: Number},
      gpu_used: {type: Number},
      fgpu_total: {type: Number},
      fgpu_used: {type: Number},
      invitations: {
        type: Array
      }
    };
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronPositioning,
      // language=CSS
      css`
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
          border-radius: 0;
          --paper-progress-height: 5px;
          --paper-progress-transition-duration: 0.08s;
          --paper-progress-transition-timing-function: ease;
          --paper-progress-transition-delay: 0s;
        }

        paper-progress.start-bar {
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
          --paper-progress-active-color: #3677EB;
        }

        paper-progress.end-bar {
          border-bottom-left-radius: 3px;
          border-bottom-right-radius: 3px;
          --paper-progress-active-color: #98BE5A;
        }

        wl-button[class*="green"] {
          --button-bg: var(--paper-light-green-50);
          --button-bg-hover: var(--paper-green-100);
          --button-bg-active: var(--paper-green-600);
        }

        wl-button[class*="red"] {
          --button-bg: var(--paper-red-50);
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-600);
        }

        .invitation_folder_name {
          font-size:13px;
        }
        `
    ];
  }

  firstUpdated() {
  }

  connectedCallback() {
    super.connectedCallback();
  }

  shouldUpdate() {
    return this.active;
  }

  _refreshHealthPanel() {
    this._refreshSessionInformation();
    if (this.is_superadmin) {
      this._refreshAgentInformation();
    }
  }

  _refreshSessionInformation() {
    this.shadowRoot.querySelector('#loading-indicator').show();
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
      this.shadowRoot.querySelector('#loading-indicator').hide();

      this.jobs = response;
      this.sessions = response.compute_sessions;
      if (this.active === true) {
        setTimeout(() => {
          this._refreshSessionInformation()
        }, 15000);
      }
    }).catch(err => {
      this.jobs = [];
      this.sessions = [];
      this.shadowRoot.querySelector('#notification').text = PainKiller.relieve('Couldn\'t connect to manager.');
      this.shadowRoot.querySelector('#notification').show();
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

    window.backendaiclient.resources.totalResourceInformation().then((response) => {
      this.shadowRoot.querySelector('#loading-indicator').hide();
      this.resources = response;
      this._sync_resource_values();
      if (this.active == true) {
        setTimeout(() => {
          this._refreshAgentInformation(status)
        }, 15000);
      }
    }).catch(err => {
      if (err && err.message) {
        this.shadowRoot.querySelector('#notification').text = PainKiller.relieve(err.message);
        this.shadowRoot.querySelector('#notification').show();
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
    this.resources.agents = {};
    this.resources.agents.total = 0;
    this.resources.agents.using = 0;
  }

  _sync_resource_values() {
    this.manager_version = window.backendaiclient.managerVersion;
    this.cpu_total = this.resources.cpu.total;
    this.mem_total = parseFloat(window.backendaiclient.utils.changeBinaryUnit(this.resources.mem.total, 'g')).toFixed(2);
    if (isNaN(this.resources.gpu.total)) {
      this.gpu_total = null;
    } else {
      this.gpu_total = this.resources.gpu.total;
    }
    if (isNaN(this.resources.vgpu.total)) {
      this.fgpu_total = null;
    } else {
      this.fgpu_total = this.resources.vgpu.total;
    }
    this.cpu_used = this.resources.cpu.used;
    this.gpu_used = this.resources.gpu.used;
    this.fgpu_used = this.resources.vgpu.used;

    this.cpu_percent = parseFloat(this.resources.cpu.percent).toFixed(2);
    this.cpu_total_percent = ((parseFloat(this.resources.cpu.percent) / parseFloat(this.cpu_total * 100)) * 100.0).toFixed(2);
    this.cpu_total_usage_ratio = this.resources.cpu.used / this.resources.cpu.total * 100.0;
    this.cpu_current_usage_ratio = this.resources.cpu.percent / this.resources.cpu.total;

    // mem.total: total memory
    // mem.allocated: allocated by backend.ai
    // mem.used: used by backend.ai
    this.mem_used = parseFloat(window.backendaiclient.utils.changeBinaryUnit(this.resources.mem.used, 'g')).toFixed(2);
    this.mem_allocated = parseFloat(window.backendaiclient.utils.changeBinaryUnit(this.resources.mem.allocated, 'g')).toFixed(2);
    this.mem_total_usage_ratio = this.resources.mem.allocated / this.resources.mem.total * 100.0;
    this.mem_current_usage_ratio = this.resources.mem.used / this.resources.mem.total * 100.0;

    if (this.mem_total_usage_ratio === 0) { // Not allocated (no session presents)
      this.mem_current_usage_percent = 0.0;
    } else {
      this.mem_current_usage_percent = this.mem_total_usage_ratio.toFixed(2);//(this.mem_allocated / this.mem_total_usage_ratio * 100.0).toFixed(2);
    }
    this.agents = this.resources.agents.total;

    if (isNaN(this.mem_current_usage_percent)) {
      this.mem_current_usage_percent = 0;
    }
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
      //this.shadowRoot.querySelector('backend-ai-resource-monitor').active = false;
      return;
    }

    //this.shadowRoot.querySelector('backend-ai-resource-monitor').active = true;
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        console.log('queueing');
        this._init_resource_values();
        this.is_superadmin = window.backendaiclient.is_superadmin;
        this.authenticated = true;
        this._refreshHealthPanel();
        this._refreshInvitations();
      }, true);
    } else {
      console.log('running');
      this._init_resource_values();
      this.is_superadmin = window.backendaiclient.is_superadmin;
      this.authenticated = true;
      this._refreshHealthPanel();
      this._refreshInvitations();
    }
  }

  _toInt(value) {
    return Math.ceil(value);
  }

  _countObject(obj) {
    return Object.keys(obj).length;
  }

  _addComma(num) {
    if (num === undefined) {
      return '';
    }
    var regexp = /\B(?=(\d{3})+(?!\d))/g;
    return num.toString().replace(regexp, ',');
  }

  _refreshInvitations() {
    window.backendaiclient.vfolder.invitations().then(res => {
      this.invitations = res.invitations;
      if (this.active) {
        setTimeout(() => {
          this._refreshInvitations()
        }, 10000);
      }
    });
  }

  _acceptInvitation(invitation) {
    window.backendaiclient.vfolder.accept_invitation(invitation.id)
    .then(response => {
      this.shadowRoot.querySelector('#notification').text = response.msg;
      this.shadowRoot.querySelector('#notification').show();
      this._refreshInvitations();
    })
    .catch(err => {
      this.shadowRoot.querySelector('#notification').text = PainKiller.relieve(err.message);
      this.shadowRoot.querySelector('#notification').show();
    })
  }

  _deleteInvitation(invitation) {
    window.backendaiclient.vfolder.delete_invitation(invitation.id)
    .then(res => {
      this.shadowRoot.querySelector('#notification').text = res.msg;
      this.shadowRoot.querySelector('#notification').show();
      this._refreshInvitations();
    })
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <wl-card class="item" elevation="1" style="padding-bottom:20px;">
        <h3 class="plastic-material-title">Statistics</h3>
        <div class="horizontal wrap layout">
          <lablup-activity-panel title="Start Menu" elevation="1">
            <div slot="message">
              <div class="horizontal justified layout wrap">
                <backend-ai-resource-monitor ?active="${this.active}" direction="vertical"></backend-ai-resource-monitor>
              </div>
            </div>
          </lablup-activity-panel>
          <lablup-activity-panel title="System Health" elevation="1">
            <div slot="message">
              <div class="horizontal justified layout wrap">
                ${this.is_superadmin ? html`
                  <div class="vertical layout center">
                    <div class="big indicator">${this.agents}</div>
                    <span>Connected nodes</span>
                  </div>` : html``}
                <div class="vertical layout center">
                  <div class="big indicator">${this._countObject(this.sessions)}</div>
                  <span>Active sessions</span>
                </div>
              </div>
            </div>
          </lablup-activity-panel>
          ${this.is_superadmin ? html`
          <lablup-activity-panel title="Resource Statistics" elevation="1">
            <div slot="message">
              <div class="layout vertical center flex" style="margin-bottom:5px;">
                <lablup-shields app="Manager version" color="darkgreen" description="${this.manager_version}" ui="flat"></lablup-shields>
              </div>
              <div class="layout horizontal center flex" style="margin-bottom:5px;">
                <div class="layout vertical start center-justified">
                  <iron-icon class="fg green" icon="hardware:developer-board"></iron-icon>
                  <span>CPU</span>
                </div>
                <div class="layout vertical start" style="padding-left:15px;">
                  <paper-progress class="mem-usage-bar start-bar" value="${this.cpu_total_usage_ratio}"></paper-progress>
                  <paper-progress class="mem-usage-bar end-bar" id="cpu-usage-bar" value="${this.cpu_current_usage_ratio}"></paper-progress>
                  <div><span class="progress-value"> ${this._addComma(this.cpu_used)}</span>/${this._addComma(this.cpu_total)}
                    Cores reserved.
                  </div>
                  <div>Using <span class="progress-value"> ${this.cpu_total_percent}</span>% (util. ${this.cpu_percent} %)
                  </div>
                </div>
              </div>
              <div class="layout horizontal center flex" style="margin-bottom:5px;">
                <div class="layout vertical start center-justified">
                  <iron-icon class="fg green" icon="hardware:memory"></iron-icon>
                  <span>RAM</span>
                </div>
                <div class="layout vertical start" style="padding-left:15px;">
                  <paper-progress class="mem-usage-bar start-bar" id="mem-usage-bar" value="${this.mem_total_usage_ratio}"></paper-progress>
                  <paper-progress class="mem-usage-bar end-bar" value="${this.mem_current_usage_ratio}"></paper-progress>
                  <div><span class="progress-value"> ${this._addComma(this.mem_allocated)}</span>/${this._addComma(this.mem_total)} GB
                    reserved.
                  </div>
                  <div>Using <span class="progress-value"> ${this._addComma(this.mem_used)}</span> GB
                    (${this.mem_current_usage_percent} %)
                  </div>
                </div>
              </div>
              ${this.gpu_total ? html`
                <div class="layout horizontal center flex" style="margin-bottom:5px;">
                  <div class="layout vertical start center-justified">
                    <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                    <span>GPU</span>
                  </div>
                  <div class="layout vertical start" style="padding-left:15px;">
                    <vaadin-progress-bar id="gpu-bar" .value="${this.gpu_used}" .max="${this.gpu_total}"></vaadin-progress-bar>
                    <div><span class="progress-value"> ${this.gpu_used}</span>/${this.gpu_total} GPUs</div>
                  </div>
                </div>` : html``}
              ${this.fgpu_total ? html`
                <div class="layout horizontal center flex" style="margin-bottom:5px;">
                  <div class="layout vertical start center-justified">
                    <iron-icon class="fg green" icon="icons:view-module"></iron-icon>
                    <span>GPU</span>
                  </div>
                  <div class="layout vertical start" style="padding-left:15px;">
                    <vaadin-progress-bar id="vgpu-bar" value="${this.fgpu_used}"
                                         max="${this.fgpu_total}"></vaadin-progress-bar>
                    <div><span class="progress-value"> ${this.fgpu_used}</span>/${this.fgpu_total} GPUs</div>
                    <div><span class="progress-value">Fractional GPU scaling enabled</div>
                  </div>
                </div>` : html``}
                <div class="horizontal center layout">
                  <div style="width:10px;height:10px;margin-left:40px;margin-right:3px;background-color:#4775E3;"></div>
                  <span style="margin-right:5px;">Reserved</span>
                  <div style="width:10px;height:10px;margin-right:3px;background-color:#A0BD67"></div>
                  <span style="margin-right:5px;">Used</span>
                  <div style="width:10px;height:10px;margin-right:3px;background-color:#E0E0E0"></div>
                  <span>Total</span>
                </div>
            </div>
          </lablup-activity-panel>` : html``}
        </div>
        <h3 class="plastic-material-title">Actions</h3>
        <div class="horizontal wrap layout">
          <lablup-activity-panel title="Shortcut" elevation="1">
            <div slot="message">
              <ul>
                <li><a href="/data">Upload files</a></li>
              </ul>
              <ul>
                <li><a href="/job">Start a session</a></li>
              </ul>
              ${this.is_admin
              ? html`
                <ul>
                  <li><a href="/credential">Create a new key pair</a></li>
                  <li><a href="/credential">Maintain keypairs</a></li>
                </ul>`
              : html``}
            </div>
          </lablup-activity-panel>
          ${this.invitations.map(invitation =>
            html`
            <lablup-activity-panel title="Invitation">
              <div slot="message">
                <h3>From ${invitation.inviter}</h3>
                <span class="invitation_folder_name">Folder name: ${invitation.vfolder_name}</span>
                <div class="horizontal center layout">
                Permission:
                ${[...invitation.perm].map(c => {
                  return html`
                  <lablup-shields app="" color="${['green','blue','red'][['r','w','d'].indexOf(c)]}"
                            description="${c.toUpperCase()}" ui="flat"></lablup-shields>`;})}
                </div>
                <div style="margin-top:25px;" class="horizontal layout justified">
                  <wl-button
                    class="fg green"
                    outlined
                    @click=${e => this._acceptInvitation(invitation)}
                  >
                    <wl-icon>add</wl-icon>
                    Accept
                  </wl-button>
                  <wl-button
                    class="fg red"
                    outlined
                    @click=${e => this._deleteInvitation(invitation)}
                  >
                    <wl-icon>remove</wl-icon>
                    Decline
                  </wl-button>
                </div>
              </div>
            </lablup-activity-panel>
            `
          )}
        </div>
      </wl-card>
`;
  }
}

customElements.define('backend-ai-summary-view', BackendAISummary);
