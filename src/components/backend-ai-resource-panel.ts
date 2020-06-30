/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t, translateUnsafeHTML as _tr} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import './lablup-loading-spinner';

import 'weightless/card';
import 'weightless/icon';

import '@material/mwc-linear-progress/mwc-linear-progress';
import '@material/mwc-icon';
import '@material/mwc-icon-button';

import './lablup-activity-panel';
import './backend-ai-chart';
import './backend-ai-resource-monitor';
import './backend-ai-release-check';
import '../plastics/lablup-shields/lablup-shields';
import '../plastics/lablup-piechart/lablup-piechart';

import {default as PainKiller} from "./backend-ai-painkiller";
import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment, IronPositioning} from "../plastics/layout/iron-flex-layout-classes";

/**
 `<backend-ai-resource-panel>` is a Summary panel of backend.ai console.

 Example:
 <backend-ai-resource-panel active></backend-ai-resource-panel>

 @group Lablup Elements
 @element backend-ai-resource-panel
 */

@customElement("backend-ai-resource-panel")
export default class BackendAIResourcePanel extends BackendAIPage {
  @property({type: String}) condition = 'running';
  @property({type: Number}) sessions = 0;
  @property({type: Object}) jobs = Object();
  @property({type: Number}) agents = 0;
  @property({type: Boolean}) is_admin = false;
  @property({type: Boolean}) is_superadmin = false;
  @property({type: Object}) resources = Object();
  @property({type: Object}) update_checker = Object();
  @property({type: Boolean}) authenticated = false;
  @property({type: String}) manager_version = '';
  @property({type: String}) console_version = '';
  @property({type: Number}) cpu_total = 0;
  @property({type: Number}) cpu_used = 0;
  @property({type: String}) cpu_percent = '0';
  @property({type: String}) cpu_total_percent = '0';
  @property({type: Number}) cpu_total_usage_ratio = 0;
  @property({type: Number}) cpu_current_usage_ratio = 0;
  @property({type: String}) mem_total = '0';
  @property({type: String}) mem_used = '0';
  @property({type: String}) mem_allocated = '0';
  @property({type: Number}) mem_total_usage_ratio = 0;
  @property({type: Number}) mem_current_usage_ratio = 0;
  @property({type: String}) mem_current_usage_percent = '0';
  @property({type: Number}) cuda_gpu_total = 0;
  @property({type: Number}) cuda_gpu_used = 0;
  @property({type: Number}) cuda_fgpu_total = 0;
  @property({type: Number}) cuda_fgpu_used = 0;
  @property({type: Number}) rocm_gpu_total = 0;
  @property({type: Number}) rocm_gpu_used = 0;
  @property({type: Number}) tpu_total = 0;
  @property({type: Number}) tpu_used = 0;
  @property({type: Object}) spinner = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) resourcePolicy;
  @property({type: String}) announcement = '';

  public invitations: any;

  constructor() {
    super();
    this.invitations = [];
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
          font-size: 14px;
        }

        li:before {
          padding: 3px;
          transform: rotate(-45deg) translateY(-2px);
          transition: color ease-in .2s;
          border: solid;
          border-width: 0 2px 2px 0;
          border-color: #242424;
          margin-right: 10px;
          content: '';
          display: inline-block;
        }

        span.indicator {
          width: 100px;
        }

        div.big.indicator {
          font-size: 48px;
        }

        a,
        a:visited {
          color: #222222;
        }

        a:hover {
          color: #3e872d;
        }

        mwc-linear-progress {
          width: 190px;
          height: 5px;
          border-radius: 0;
          --mdc-theme-primary: #3677eb;
        }

        mwc-linear-progress.start-bar {
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
          --mdc-theme-primary: #3677eb;
        }

        mwc-linear-progress.end-bar {
          border-bottom-left-radius: 3px;
          border-bottom-right-radius: 3px;
          --mdc-theme-primary: #98be5a;
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

        wl-icon {
          --icon-size: 24px;
        }

        .invitation_folder_name {
          font-size: 13px;
        }

        mwc-icon-button.update-button {
          --mdc-icon-size: 16px;
          --mdc-icon-button-size: 24px;
          color: red;
        }

        mwc-icon.update-icon {
          --mdc-icon-size: 16px;
          --mdc-icon-button-size: 24px;
          color: black;
        }

        img.resource-type-icon {
          width: 16px;
          height: 16px;
          margin-right: 5px;
        }

        .system-health-indicator {
          width: 90px;
        }
      `
    ];
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    this.update_checker = this.shadowRoot.querySelector('#update-checker');
  }

  _refreshHealthPanel() {
    if (this.activeConnected) {
      this._refreshSessionInformation();
      if (this.is_superadmin) {
        this._refreshAgentInformation();
      }
    }
  }

  _refreshSessionInformation() {
    if (!this.activeConnected) {
      return;
    }
    this.spinner.show();
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
    let fields = ["created_at"];
    globalThis.backendaiclient.computeSession.list(fields, status).then((response) => {
      this.spinner.hide();
      this.jobs = response;
      this.sessions = response.compute_session_list.total_count;
      if (this.active) {
        setTimeout(() => {
          this._refreshSessionInformation()
        }, 15000);
      }
    }).catch(err => {
      this.spinner.hide();
      this.jobs = [];
      this.sessions = 0;
      this.notification.text = PainKiller.relieve('Couldn\'t connect to manager.');
      this.notification.detail = err;
      this.notification.show(true, err);
    });
  }

  _refreshConsoleUpdateInformation() {
    if (this.is_superadmin && globalThis.backendaioptions.get("automatic_update_check", true)) {
      this.update_checker.checkRelease();
    }
  }

  _refreshResourceInformation() {
    if (!this.activeConnected) {
      return;
    }
    return globalThis.backendaiclient.resourcePolicy.get(globalThis.backendaiclient.resource_policy).then((response) => {
      let rp = response.keypair_resource_policies;
      this.resourcePolicy = globalThis.backendaiclient.utils.gqlToObject(rp, 'name');
    });
  }

  _refreshAgentInformation(status: string = 'running') {
    if (!this.activeConnected) {
      return;
    }
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
    this.spinner.show();

    globalThis.backendaiclient.resources.totalResourceInformation().then((response) => {
      this.spinner.hide();
      this.resources = response;
      this._sync_resource_values();
      if (this.active == true) {
        setTimeout(() => {
          this._refreshAgentInformation(status)
        }, 15000);
      }
    }).catch(err => {
      this.spinner.hide();
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
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
    this.resources.cuda_gpu = {};
    this.resources.cuda_gpu.total = 0;
    this.resources.cuda_gpu.used = 0;
    this.resources.cuda_fgpu = {};
    this.resources.cuda_fgpu.total = 0;
    this.resources.cuda_fgpu.used = 0;
    this.resources.agents = {};
    this.resources.agents.total = 0;
    this.resources.agents.using = 0;
    this.cpu_total_usage_ratio = 0;
    this.cpu_current_usage_ratio = 0;
    this.mem_total_usage_ratio = 0;
    this.mem_current_usage_ratio = 0;
    this.mem_current_usage_percent = "0";
    this.is_admin = false;
    this.is_superadmin = false;
  }

  _sync_resource_values() {
    this.manager_version = globalThis.backendaiclient.managerVersion;
    this.console_version = globalThis.packageVersion;
    this.cpu_total = this.resources.cpu.total;
    this.mem_total = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(this.resources.mem.total, 'g')).toFixed(2);
    if (isNaN(this.resources['cuda.device'].total)) {
      this.cuda_gpu_total = 0;
    } else {
      this.cuda_gpu_total = this.resources['cuda.device'].total;
    }
    if (isNaN(this.resources['cuda.shares'].total)) {
      this.cuda_fgpu_total = 0;
    } else {
      this.cuda_fgpu_total = this.resources['cuda.shares'].total;
    }
    this.cpu_used = this.resources.cpu.used;
    this.cuda_gpu_used = this.resources['cuda.device'].used;
    this.cuda_fgpu_used = this.resources['cuda.shares'].used;

    this.cpu_percent = parseFloat(this.resources.cpu.percent).toFixed(2);
    this.cpu_total_percent = ((parseFloat(this.resources.cpu.percent) / (this.cpu_total * 100.0)) * 100.0).toFixed(2);
    this.cpu_total_usage_ratio = this.resources.cpu.used / this.resources.cpu.total * 100.0;
    this.cpu_current_usage_ratio = this.resources.cpu.percent / this.resources.cpu.total;

    // mem.total: total memory
    // mem.allocated: allocated by backend.ai
    // mem.used: used by backend.ai
    this.mem_used = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(this.resources.mem.used, 'g')).toFixed(2);
    this.mem_allocated = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(this.resources.mem.allocated, 'g')).toFixed(2);
    this.mem_total_usage_ratio = this.resources.mem.allocated / this.resources.mem.total * 100.0;
    this.mem_current_usage_ratio = this.resources.mem.used / this.resources.mem.total * 100.0;

    if (this.mem_total_usage_ratio === 0) { // Not allocated (no session presents)
      this.mem_current_usage_percent = '0.0';
    } else {
      this.mem_current_usage_percent = this.mem_total_usage_ratio.toFixed(2);//(this.mem_allocated / this.mem_total_usage_ratio * 100.0).toFixed(2);
    }
    this.agents = this.resources.agents.total;

    if (isNaN(parseFloat(this.mem_current_usage_percent))) {
      this.mem_current_usage_percent = '0';
    }
  }

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      this.shadowRoot.querySelector('#resource-monitor').removeAttribute('active');
      return;
    }
    this.shadowRoot.querySelector('#resource-monitor').setAttribute('active', 'true');
    this._init_resource_values();
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.is_superadmin = globalThis.backendaiclient.is_superadmin;
        this.is_admin = globalThis.backendaiclient.is_admin;
        this.authenticated = true;
        if (this.activeConnected) {
          this._refreshConsoleUpdateInformation();
          this._refreshHealthPanel();
          this.requestUpdate();
          //let event = new CustomEvent("backend-ai-resource-refreshed", {"detail": {}});
          //document.dispatchEvent(event);
        }
      }, true);
    } else {
      this.is_superadmin = globalThis.backendaiclient.is_superadmin;
      this.is_admin = globalThis.backendaiclient.is_admin;
      this.authenticated = true;
      this._refreshHealthPanel();
      this.requestUpdate();
      //let event = new CustomEvent("backend-ai-resource-refreshed", {"detail": {}});
      //document.dispatchEvent(event);
    }
  }

  _toInt(value: number) {
    return Math.ceil(value);
  }

  _countObject(obj: object) {
    return Object.keys(obj).length;
  }

  _addComma(num: any) {
    if (num === undefined) {
      return '';
    }
    var regexp = /\B(?=(\d{3})+(?!\d))/g;
    return num.toString().replace(regexp, ',');
  }

  render() {
    // language=HTML
    return html`
      <lablup-activity-panel title="${_t('summary.ResourceStatistics')}" elevation="1">
        <div slot="message">
          <div class="horizontal justified layout wrap">
            ${this.is_superadmin ? html`
              <div class="vertical layout center system-health-indicator">
                <div class="big indicator">${this.agents}</div>
                <span>${_tr('summary.ConnectedNodes')}</span>
              </div>` : html``}
            <div class="vertical layout center system-health-indicator">
              <div class="big indicator">${this.sessions}</div>
              <span>${_t('summary.ActiveSessions')}</span>
            </div>
          </div>
          ${this.is_superadmin ? html`
          <div class="layout horizontal center flex" style="margin-top:15px;margin-bottom:5px;">
            <div class="layout vertical start center-justified">
              <wl-icon class="fg green">developer_board</wl-icon>
              <span>CPU</span>
            </div>
            <div class="layout vertical start" style="padding-left:15px;">
              <mwc-linear-progress class="mem-usage-bar start-bar" progress="${this.cpu_total_usage_ratio / 100.0}"></mwc-linear-progress>
              <mwc-linear-progress class="mem-usage-bar end-bar" id="cpu-usage-bar"
                progress="${this.cpu_current_usage_ratio / 100.0}"
                buffer="${this.cpu_current_usage_ratio / 100.0}"></mwc-linear-progress>
              <div><span class="progress-value"> ${this._addComma(this.cpu_used)}</span>/${this._addComma(this.cpu_total)}
                ${_t('summary.CoresReserved')}.
              </div>
              <div>${_t('summary.Using')} <span class="progress-value"> ${this.cpu_total_percent}</span>% (util. ${this.cpu_percent} %)
              </div>
            </div>
          </div>
          <div class="layout horizontal center flex" style="margin-bottom:5px;">
            <div class="layout vertical start center-justified">
              <wl-icon class="fg green">memory</wl-icon>
              <span>RAM</span>
            </div>
            <div class="layout vertical start" style="padding-left:15px;">
              <mwc-linear-progress class="mem-usage-bar start-bar" id="mem-usage-bar" progress="${this.mem_total_usage_ratio / 100.0}"></mwc-linear-progress>
              <mwc-linear-progress class="mem-usage-bar end-bar"
                progress="${this.mem_current_usage_ratio / 100.0}"
                buffer="${this.mem_current_usage_ratio / 100.0}"></mwc-linear-progress>
              <div><span class="progress-value"> ${this._addComma(this.mem_allocated)}</span>/${this._addComma(this.mem_total)} GB
                ${_t('summary.reserved')}.
              </div>
              <div>${_t('summary.Using')} <span class="progress-value"> ${this._addComma(this.mem_used)}</span> GB
                (${this.mem_current_usage_percent} %)
              </div>
            </div>
          </div>
          ${this.cuda_gpu_total || this.cuda_fgpu_total || this.rocm_gpu_total || this.tpu_total ? html`
          <div class="layout horizontal center flex" style="margin-bottom:5px;">
            <div class="layout vertical start center-justified">
              <wl-icon class="fg green">view_module</wl-icon>
              <span>GPU</span>
            </div>
            <div class="layout vertical start" style="padding-left:15px;">
            ${this.cuda_gpu_total ? html`
              <mwc-linear-progress id="gpu-bar"
                progress="${this.cuda_gpu_used / this.cuda_gpu_total}"></mwc-linear-progress>
              <div class="horizontal center layout">
                <img class="resource-type-icon fg green" src="/resources/icons/file_type_cuda.svg" />
                <div>
                  <div><span class="progress-value"> ${this.cuda_gpu_used}</span>/${this.cuda_gpu_total} CUDA GPUs</div>
                </div>
              </div>
            ` : html``}
            ${this.cuda_fgpu_total ? html`
              <mwc-linear-progress id="vgpu-bar"
                progress="${this.cuda_fgpu_used / this.cuda_fgpu_total}"
                buffer="${this.cuda_fgpu_used / this.cuda_fgpu_total}"></mwc-linear-progress>
              <div class="horizontal center layout">
                <img class="resource-type-icon fg green" src="/resources/icons/file_type_cuda.svg" />
                <div>
                  <div><span class="progress-value"> ${this.cuda_fgpu_used}</span>/${this.cuda_fgpu_total} CUDA fGPUs</div>
                  <div><span class="progress-value">${_t('summary.FractionalGPUScalingEnabled')}.</div>
                </div>
              </div>
            ` : html``}
            ${this.rocm_gpu_total ? html`
              <mwc-linear-progress id="rocm-gpu-bar"
                progress="${this.rocm_gpu_used / 100.0}"
                buffer="${this.rocm_gpu_used / 100.0}"></mwc-linear-progress>
              <div class="horizontal center layout">
                <img class="resource-type-icon fg green" src="/resources/icons/ROCm.png" />
                <div>
                  <div><span class="progress-value"> ${this.rocm_gpu_used}</span>/${this.rocm_gpu_total} ROCm GPUs</div>
                </div>
              </div>
            ` : html``}
            ${this.tpu_total ? html`
              <mwc-linear-progress id="tpu-bar"
                progress="${this.tpu_used / 100.0}"
                buffer="${this.tpu_used / 100.0}"></mwc-linear-progress>
              <div class="horizontal center layout">
                <img class="resource-type-icon fg green" src="/resources/icons/tpu.svg" />
                <div>
                  <div><span class="progress-value"> ${this.tpu_used}</span>/${this.tpu_total} TPUs</div>
                </div>
              </div>
        ` : html``}
            </div>
          </div>` : html``}
          <div class="horizontal center layout">
            <div style="width:10px;height:10px;margin-left:40px;margin-right:3px;background-color:#4775E3;"></div>
            <span style="margin-right:5px;">${_t('summary.Reserved')}</span>
            <div style="width:10px;height:10px;margin-right:3px;background-color:#A0BD67"></div>
            <span style="margin-right:5px;">${_t('summary.Used')}</span>
            <div style="width:10px;height:10px;margin-right:3px;background-color:#E0E0E0"></div>
            <span>${_t('summary.Total')}</span>
          </div>` : html``}
        </div>
      </lablup-activity-panel>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-resource-panel": BackendAIResourcePanel;
  }
}
