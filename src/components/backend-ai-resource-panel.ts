/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import '../plastics/lablup-piechart/lablup-piechart';
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './backend-ai-release-check';
import './backend-ai-resource-monitor';
import './lablup-activity-panel';
import './lablup-loading-spinner';
import './lablup-progress-bar';
import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-linear-progress/mwc-linear-progress';
import { css, CSSResultGroup, html } from 'lit';
import {
  get as _text,
  translate as _t,
  translateUnsafeHTML as _tr,
} from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type LablupLoadingSpinner = HTMLElementTagNameMap['lablup-loading-spinner'];

/**
 `<backend-ai-resource-panel>` is a Summary panel of backend.ai web UI.

 Example:
 <backend-ai-resource-panel active></backend-ai-resource-panel>

 @group Lablup Elements
 @element backend-ai-resource-panel
 */

@customElement('backend-ai-resource-panel')
export default class BackendAIResourcePanel extends BackendAIPage {
  @property({ type: String }) condition = 'running';
  @property({ type: Number }) sessions = 0;
  @property({ type: Number }) agents = 0;
  @property({ type: Boolean }) is_admin = false;
  @property({ type: Boolean }) is_superadmin = false;
  @property({ type: Object }) resources = Object();
  @property({ type: Boolean }) authenticated = false;
  @property({ type: String }) manager_version = '';
  @property({ type: String }) webui_version = '';
  @property({ type: Number }) cpu_total = 0;
  @property({ type: Number }) cpu_used = 0;
  @property({ type: String }) cpu_percent = '0';
  @property({ type: String }) cpu_total_percent = '0';
  @property({ type: Number }) cpu_total_usage_ratio = 0;
  @property({ type: Number }) cpu_current_usage_ratio = 0;
  @property({ type: String }) mem_total = '0';
  @property({ type: String }) mem_used = '0';
  @property({ type: String }) mem_allocated = '0';
  @property({ type: Number }) mem_total_usage_ratio = 0;
  @property({ type: Number }) mem_current_usage_ratio = 0;
  @property({ type: String }) mem_current_usage_percent = '0';
  @property({ type: Number }) cuda_gpu_total = 0;
  @property({ type: Number }) cuda_gpu_used = 0;
  @property({ type: Number }) cuda_fgpu_total = 0;
  @property({ type: Number }) cuda_fgpu_used = 0;
  @property({ type: Number }) rocm_gpu_total = 0;
  @property({ type: Number }) rocm_gpu_used = 0;
  @property({ type: Number }) tpu_total = 0;
  @property({ type: Number }) tpu_used = 0;
  @property({ type: Number }) ipu_total = 0;
  @property({ type: Number }) ipu_used = 0;
  @property({ type: Number }) atom_total = 0;
  @property({ type: Number }) atom_used = 0;
  @property({ type: Number }) atom_plus_total = 0;
  @property({ type: Number }) atom_plus_used = 0;
  @property({ type: Number }) atom_max_total = 0;
  @property({ type: Number }) atom_max_used = 0;
  @property({ type: Number }) gaudi2_total = 0;
  @property({ type: Number }) gaudi2_used = 0;
  @property({ type: Number }) warboy_total = 0;
  @property({ type: Number }) warboy_used = 0;
  @property({ type: Number }) rngd_total = 0;
  @property({ type: Number }) rngd_used = 0;
  @property({ type: Number }) hyperaccel_lpu_total = 0;
  @property({ type: Number }) hyperaccel_lpu_used = 0;
  @property({ type: Object }) notification = Object();
  @property({ type: Object }) resourcePolicy;
  @property({ type: String }) announcement = '';
  @property({ type: Number }) height = 0;
  @query('#loading-spinner') spinner!: LablupLoadingSpinner;

  static get styles(): CSSResultGroup {
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
          transition: color ease-in 0.2s;
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

        div.card {
          margin: 20px;
        }

        div.big.indicator {
          font-size: 48px;
        }

        a,
        a:visited {
          color: #222222;
        }

        a:hover {
          color: var(--token-colorPrimary, #3e872d);
        }

        mwc-linear-progress {
          width: 260px;
          height: 15px;
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

        div.indicators {
          min-height: 83px;
          padding: 10px 20px;
          background-color: var(--token-colorBgContainer, #f6f6f6);
        }

        .system-health-indicator {
          width: 90px;
        }

        .resource {
          margin-bottom: 10px;
          margin-left: 5px;
        }

        .resource-line {
          margin-left: 85px;
        }
      `,
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
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
    globalThis.backendaiclient.computeSession
      .total_count(status)
      .then((response) => {
        this.spinner.hide();
        if (
          !response.compute_session_list &&
          response.legacy_compute_session_list
        ) {
          response.compute_session_list = response.legacy_compute_session_list;
        }
        this.sessions = response.compute_session_list.total_count;
        if (this.active) {
          setTimeout(() => {
            this._refreshSessionInformation();
          }, 15000);
        }
      })
      .catch((err) => {
        this.spinner.hide();
        this.sessions = 0;
        this.notification.text = _text('summary.ConnectingToCluster');
        this.notification.detail = err;
        this.notification.show(false, err);
        if (this.active) {
          setTimeout(() => {
            this._refreshSessionInformation();
          }, 15000);
        }
      });
  }

  _refreshResourceInformation() {
    if (!this.activeConnected) {
      return;
    }
    return globalThis.backendaiclient.resourcePolicy
      .get(globalThis.backendaiclient.resource_policy)
      .then((response) => {
        const rp = response.keypair_resource_policies;
        this.resourcePolicy = globalThis.backendaiclient.utils.gqlToObject(
          rp,
          'name',
        );
      });
  }

  _refreshAgentInformation(status = 'running') {
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

    globalThis.backendaiclient.resources
      .totalResourceInformation()
      .then((response) => {
        this.spinner.hide();
        this.resources = response;
        this._sync_resource_values();
        if (this.active == true) {
          setTimeout(() => {
            this._refreshAgentInformation(status);
          }, 30000);
        }
      })
      .catch((err) => {
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
    this.resources.rocm_gpu = {};
    this.resources.rocm_gpu.total = 0;
    this.resources.rocm_gpu.used = 0;
    this.resources.tpu = {};
    this.resources.tpu.total = 0;
    this.resources.tpu.used = 0;
    this.resources.ipu = {};
    this.resources.ipu.total = 0;
    this.resources.ipu.used = 0;
    this.resources.atom = {};
    this.resources.atom.total = 0;
    this.resources.atom.used = 0;
    this.resources.atom_plus = {};
    this.resources.atom_plus.total = 0;
    this.resources.atom_plus.used = 0;
    this.resources.atom_max = {};
    this.resources.atom_max.total = 0;
    this.resources.atom_max.used = 0;
    this.resources.gaudi2 = {};
    this.resources.gaudi2.total = 0;
    this.resources.gaudi2.used = 0;
    this.resources.warboy = {};
    this.resources.warboy.total = 0;
    this.resources.warboy.used = 0;
    this.resources.rngd = {};
    this.resources.rngd.total = 0;
    this.resources.rngd.used = 0;
    this.resources.hyperaccel_lpu = {};
    this.resources.hyperaccel_lpu.total = 0;
    this.resources.hyperaccel_lpu.used = 0;
    this.resources.agents = {};
    this.resources.agents.total = 0;
    this.resources.agents.using = 0;
    this.cpu_total_usage_ratio = 0;
    this.cpu_current_usage_ratio = 0;
    this.mem_total_usage_ratio = 0;
    this.mem_current_usage_ratio = 0;
    this.mem_current_usage_percent = '0';
    this.is_admin = false;
    this.is_superadmin = false;
  }

  _sync_resource_values() {
    this.manager_version = globalThis.backendaiclient.managerVersion;
    this.webui_version = globalThis.packageVersion;
    this.cpu_total = this.resources.cpu.total;
    this.mem_total = parseFloat(
      globalThis.backendaiclient.utils.changeBinaryUnit(
        this.resources.mem.total,
        'g',
      ),
    ).toFixed(2);
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
    if (isNaN(this.resources['rocm.device'].total)) {
      this.rocm_gpu_total = 0;
    } else {
      this.rocm_gpu_total = this.resources['rocm.device'].total;
    }
    if (isNaN(this.resources['tpu.device'].total)) {
      this.tpu_total = 0;
    } else {
      this.tpu_total = this.resources['tpu.device'].total;
    }
    if (isNaN(this.resources['ipu.device'].total)) {
      this.ipu_total = 0;
    } else {
      this.ipu_total = this.resources['ipu.device'].total;
    }
    if (isNaN(this.resources['atom.device'].total)) {
      this.atom_total = 0;
    } else {
      this.atom_total = this.resources['atom.device'].total;
    }
    if (isNaN(this.resources['atom-plus.device'].total)) {
      this.atom_plus_total = 0;
    } else {
      this.atom_plus_total = this.resources['atom-plus.device'].total;
    }
    if (isNaN(this.resources['atom-max.device'].total)) {
      this.atom_max_total = 0;
    } else {
      this.atom_max_total = this.resources['atom-max.device'].total;
    }
    if (isNaN(this.resources['gaudi2.device'].total)) {
      this.gaudi2_total = 0;
    } else {
      this.gaudi2_total = this.resources['gaudi2.device'].total;
    }
    if (isNaN(this.resources['warboy.device'].total)) {
      this.warboy_total = 0;
    } else {
      this.warboy_total = this.resources['warboy.device'].total;
    }
    if (isNaN(this.resources['rngd.device'].total)) {
      this.rngd_total = 0;
    } else {
      this.rngd_total = this.resources['rngd.device'].total;
    }
    if (isNaN(this.resources['hyperaccel-lpu.device'].total)) {
      this.hyperaccel_lpu_total = 0;
    } else {
      this.hyperaccel_lpu_total = this.resources['hyperaccel-lpu.device'].total;
    }
    this.cpu_used = this.resources.cpu.used;
    this.cuda_gpu_used = this.resources['cuda.device'].used;
    this.cuda_fgpu_used = this.resources['cuda.shares'].used;
    this.rocm_gpu_used = this.resources['rocm.device'].used;
    this.tpu_used = this.resources['tpu.device'].used;
    this.ipu_used = this.resources['ipu.device'].used;
    this.atom_used = this.resources['atom.device'].used;
    this.atom_plus_used = this.resources['atom-plus.device'].used;
    this.atom_max_used = this.resources['atom-max.device'].used;
    this.warboy_used = this.resources['warboy.device'].used;
    this.rngd_used = this.resources['rngd.device'].used;
    this.hyperaccel_lpu_used = this.resources['hyperaccel-lpu.device'].used;

    this.cpu_percent = parseFloat(this.resources.cpu.percent).toFixed(2);
    this.cpu_total_percent =
      this.cpu_used !== 0
        ? ((this.cpu_used / this.cpu_total) * 100).toFixed(2)
        : '0';
    // this.cpu_total_percent = ((parseFloat(this.cpu_percent) / (this.cpu_total * 100.0)) * 100.0).toFixed(2);
    this.cpu_total_usage_ratio =
      (this.resources.cpu.used / this.resources.cpu.total) * 100.0;
    this.cpu_current_usage_ratio =
      this.resources.cpu.percent / this.resources.cpu.total;

    // mem.total: total memory
    // mem.allocated: allocated by backend.ai
    // mem.used: used by backend.ai
    this.mem_used = parseFloat(
      globalThis.backendaiclient.utils.changeBinaryUnit(
        this.resources.mem.used,
        'g',
      ),
    ).toFixed(2);
    this.mem_allocated = parseFloat(
      globalThis.backendaiclient.utils.changeBinaryUnit(
        this.resources.mem.allocated,
        'g',
      ),
    ).toFixed(2);
    this.mem_total_usage_ratio =
      (this.resources.mem.allocated / this.resources.mem.total) * 100.0;
    this.mem_current_usage_ratio =
      (this.resources.mem.used / this.resources.mem.total) * 100.0;

    if (this.mem_total_usage_ratio === 0) {
      // Not allocated (no session presents)
      this.mem_current_usage_percent = '0.0';
    } else {
      this.mem_current_usage_percent = this.mem_total_usage_ratio.toFixed(2); // (this.mem_allocated / this.mem_total_usage_ratio * 100.0).toFixed(2);
    }
    this.agents = this.resources.agents.total;

    if (isNaN(parseFloat(this.mem_current_usage_percent))) {
      this.mem_current_usage_percent = '0';
    }
  }

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    this._init_resource_values();
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this.is_superadmin = globalThis.backendaiclient.is_superadmin;
          this.is_admin = globalThis.backendaiclient.is_admin;
          this.authenticated = true;
          if (this.activeConnected) {
            this._refreshHealthPanel();
            this.requestUpdate();
            // let event = new CustomEvent("backend-ai-resource-refreshed", {"detail": {}});
            // document.dispatchEvent(event);
          }
        },
        true,
      );
    } else {
      this.is_superadmin = globalThis.backendaiclient.is_superadmin;
      this.is_admin = globalThis.backendaiclient.is_admin;
      this.authenticated = true;
      this._refreshHealthPanel();
      this.requestUpdate();
      // let event = new CustomEvent("backend-ai-resource-refreshed", {"detail": {}});
      // document.dispatchEvent(event);
    }
  }

  _toInt(value: number) {
    return Math.ceil(value);
  }

  _countObject(obj) {
    return Object.keys(obj).length;
  }

  _addComma(num: any) {
    if (num === undefined) {
      return '';
    }
    const regexp = /\B(?=(\d{3})+(?!\d))/g;
    return num.toString().replace(regexp, ',');
  }

  _prefixFormatWithoutTrailingZeros(num: string | number = '0', fixed: number) {
    const number = typeof num === 'string' ? parseFloat(num) : num;
    return parseFloat(number.toFixed(fixed)).toString();
  }
  _prefixFormat(num: string | number = '0;', fixed: number) {
    return typeof num === 'string'
      ? parseFloat(num)?.toFixed(fixed)
      : num?.toFixed(fixed);
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <lablup-activity-panel
        title="${_t('summary.SystemResources')}"
        elevation="1"
        narrow
        height="${this.height}"
        scrollableY="true"
      >
        <div slot="message">
          <div class="horizontal justified layout wrap indicators">
            ${this.is_superadmin
              ? html`
                  <div class="vertical layout center system-health-indicator">
                    <div class="big indicator">${this.agents}</div>
                    <span>${_tr('summary.ConnectedNodes')}</span>
                  </div>
                `
              : html``}
            <div class="vertical layout center system-health-indicator">
              <div class="big indicator">${this.sessions}</div>
              <span>${_t('summary.ActiveSessions')}</span>
            </div>
          </div>
          <div class="vertical-card" style="align-items: flex-start">
            ${this.is_superadmin
              ? html`
                  <div class="layout horizontal center flex resource">
                    <div
                      class="layout vertical center center-justified resource-name"
                    >
                      <div class="gauge-name">CPU</div>
                    </div>
                    <div class="layout vertical start-justified wrap">
                      <lablup-progress-bar
                        id="cpu-usage-bar"
                        class="start"
                        progress="${this.cpu_total_usage_ratio / 100.0}"
                        description="${this._addComma(
                          this._prefixFormatWithoutTrailingZeros(
                            this.cpu_used,
                            0,
                          ),
                        )}/${this._addComma(
                          this._prefixFormatWithoutTrailingZeros(
                            this.cpu_total,
                            0,
                          ),
                        )} ${_t('summary.CoresReserved')}."
                      ></lablup-progress-bar>
                      <lablup-progress-bar
                        id="cpu-usage-bar-2"
                        class="end"
                        progress="${this.cpu_current_usage_ratio / 100.0}"
                        description="${_t(
                          'summary.Using',
                        )} ${this._prefixFormatWithoutTrailingZeros(
                          this.cpu_total_percent,
                          1,
                        )} % (util. ${this._prefixFormatWithoutTrailingZeros(
                          this.cpu_percent,
                          1,
                        )} %)"
                      ></lablup-progress-bar>
                    </div>
                    <div class="layout vertical center center-justified">
                      <span class="percentage start-bar">
                        ${this._prefixFormatWithoutTrailingZeros(
                          this.cpu_total_percent,
                          1,
                        ) + '%'}
                      </span>
                      <span class="percentage end-bar">
                        ${this._prefixFormatWithoutTrailingZeros(
                          this.cpu_percent,
                          1,
                        ) + '%'}
                      </span>
                    </div>
                  </div>
                  <div class="resource-line"></div>
                  <div class="layout horizontal center flex resource">
                    <div
                      class="layout vertical center center-justified resource-name"
                    >
                      <div class="gauge-name">RAM</div>
                    </div>
                    <div class="layout vertical start-justified wrap">
                      <lablup-progress-bar
                        id="mem-usage-bar"
                        class="start"
                        progress="${this.mem_total_usage_ratio / 100.0}"
                        description="${this._addComma(
                          this._prefixFormatWithoutTrailingZeros(
                            this.mem_allocated,
                            2,
                          ),
                        )} / ${this._addComma(
                          this._prefixFormatWithoutTrailingZeros(
                            this.mem_total,
                            2,
                          ),
                        )} GiB ${_t('summary.ReservedShort')}."
                      ></lablup-progress-bar>
                      <lablup-progress-bar
                        id="mem-usage-bar-2"
                        class="end"
                        progress="${this.mem_current_usage_ratio / 100.0}"
                        description="${_t('summary.Using')} ${this._addComma(
                          this._prefixFormatWithoutTrailingZeros(
                            this.mem_used,
                            2,
                          ),
                        )} GiB
                    (${parseInt(this.mem_used) !== 0
                          ? this._prefixFormatWithoutTrailingZeros(
                              (parseInt(this.mem_used) /
                                parseInt(this.mem_total)) *
                                100,
                              1,
                            )
                          : '0'} %)"
                      ></lablup-progress-bar>
                    </div>
                    <div class="layout vertical center center-justified">
                      <span class="percentage start-bar">
                        ${this._prefixFormatWithoutTrailingZeros(
                          this.mem_total_usage_ratio,
                          1,
                        ) + '%'}
                      </span>
                      <span class="percentage end-bar">
                        ${(parseInt(this.mem_used) !== 0
                          ? this._prefixFormatWithoutTrailingZeros(
                              (parseInt(this.mem_used) /
                                parseInt(this.mem_total)) *
                                100,
                              1,
                            )
                          : '0') + '%'}
                      </span>
                    </div>
                  </div>
                  ${this.cuda_gpu_total ||
                  this.cuda_fgpu_total ||
                  this.rocm_gpu_total ||
                  this.tpu_total ||
                  this.ipu_total ||
                  this.atom_total ||
                  this.atom_plus_total ||
                  this.atom_max_total ||
                  this.gaudi2_total ||
                  this.warboy_total ||
                  this.rngd_total ||
                  this.hyperaccel_lpu_total
                    ? html`
                        <div class="resource-line"></div>
                        <div class="layout horizontal center flex resource">
                          <div
                            class="layout vertical center center-justified resource-name"
                          >
                            <div class="gauge-name">GPU / NPU</div>
                          </div>
                          <div class="layout vertical">
                            ${this.cuda_gpu_total
                              ? html`
                                  <div class="layout horizontal">
                                    <div
                                      class="layout vertical start-justified wrap"
                                    >
                                      <lablup-progress-bar
                                        id="gpu-usage-bar"
                                        class="start"
                                        progress="${this.cuda_gpu_used /
                                        this.cuda_gpu_total}"
                                        description="${this._prefixFormat(
                                          this.cuda_gpu_used,
                                          2,
                                        )} / ${this._prefixFormat(
                                          this.cuda_gpu_total,
                                          2,
                                        )} CUDA GPUs ${_t(
                                          'summary.ReservedShort',
                                        )}."
                                      ></lablup-progress-bar>
                                      <lablup-progress-bar
                                        id="gpu-usage-bar-2"
                                        class="end"
                                        progress="0"
                                        description="${_t(
                                          'summary.FractionalGPUScalingEnabled',
                                        )}."
                                      ></lablup-progress-bar>
                                    </div>
                                    <div
                                      class="layout vertical center center-justified"
                                    >
                                      <span class="percentage start-bar">
                                        ${this.cuda_gpu_used !== 0
                                          ? this._prefixFormatWithoutTrailingZeros(
                                              (this.cuda_gpu_used /
                                                this.cuda_gpu_total) *
                                                100,
                                              1,
                                            )
                                          : 0}%
                                      </span>
                                      <span class="percentage end-bar">
                                        &nbsp;
                                      </span>
                                    </div>
                                  </div>
                                `
                              : html``}
                            ${this.cuda_fgpu_total
                              ? html`
                                  <div class="layout horizontal">
                                    <div
                                      class="layout vertical start-justified wrap"
                                    >
                                      <lablup-progress-bar
                                        id="fgpu-usage-bar"
                                        class="start"
                                        progress="${this.cuda_fgpu_used /
                                        this.cuda_fgpu_total}"
                                        description="${this._prefixFormat(
                                          this.cuda_fgpu_used,
                                          2,
                                        )} / ${this._prefixFormat(
                                          this.cuda_fgpu_total,
                                          2,
                                        )} CUDA FGPUs ${_t(
                                          'summary.Reserved',
                                        )}."
                                      ></lablup-progress-bar>
                                      <lablup-progress-bar
                                        id="fgpu-usage-bar-2"
                                        class="end"
                                        progress="0"
                                        description="${_t(
                                          'summary.FractionalGPUScalingEnabled',
                                        )}."
                                      ></lablup-progress-bar>
                                    </div>
                                    <div
                                      class="layout vertical center center-justified"
                                    >
                                      <span class="percentage start-bar">
                                        ${this.cuda_fgpu_used !== 0
                                          ? this._prefixFormatWithoutTrailingZeros(
                                              (this.cuda_fgpu_used /
                                                this.cuda_fgpu_total) *
                                                100,
                                              1,
                                            )
                                          : 0}%
                                      </span>
                                      <span class="percentage end-bar">
                                        &nbsp;
                                      </span>
                                    </div>
                                  </div>
                                `
                              : html``}
                            ${this.rocm_gpu_total
                              ? html`
                                  <div class="layout horizontal">
                                    <div
                                      class="layout vertical start-justified wrap"
                                    >
                                      <lablup-progress-bar
                                        id="rocm-gpu-usage-bar"
                                        class="start"
                                        progress="${this.rocm_gpu_used / 100.0}"
                                        description="${this._prefixFormat(
                                          this.rocm_gpu_used,
                                          2,
                                        )} / ${this._prefixFormat(
                                          this.rocm_gpu_total,
                                          2,
                                        )} ROCm GPUs ${_t(
                                          'summary.ReservedShort',
                                        )}."
                                      ></lablup-progress-bar>
                                      <lablup-progress-bar
                                        id="rocm-gpu-usage-bar-2"
                                        class="end"
                                        progress="0"
                                        description="${_t(
                                          'summary.ROCMGPUEnabled',
                                        )}."
                                      ></lablup-progress-bar>
                                    </div>
                                    <div
                                      class="layout vertical center center-justified"
                                    >
                                      <span class="percentage start-bar">
                                        ${this._prefixFormatWithoutTrailingZeros(
                                          this.rocm_gpu_used,
                                          1,
                                        ) + '%'}
                                      </span>
                                      <span class="percentage end-bar">
                                        &nbsp;
                                      </span>
                                    </div>
                                  </div>
                                `
                              : html``}
                            ${this.tpu_total
                              ? html`
                                  <div class="layout horizontal">
                                    <div
                                      class="layout vertical start-justified wrap"
                                    >
                                      <lablup-progress-bar
                                        id="tpu-usage-bar"
                                        class="start"
                                        progress="${this.tpu_used / 100.0}"
                                        description="${this._prefixFormatWithoutTrailingZeros(
                                          this.tpu_used,
                                          2,
                                        )} / ${this._prefixFormatWithoutTrailingZeros(
                                          this.tpu_total,
                                          2,
                                        )} TPUs ${_t('summary.ReservedShort')}."
                                      ></lablup-progress-bar>
                                      <lablup-progress-bar
                                        id="tpu-usage-bar-2"
                                        class="end"
                                        progress="0"
                                        description="${_t(
                                          'summary.TPUEnabled',
                                        )}."
                                      ></lablup-progress-bar>
                                    </div>
                                    <div
                                      class="layout vertical center center-justified"
                                    >
                                      <span class="percentage start-bar">
                                        ${this._prefixFormatWithoutTrailingZeros(
                                          this.tpu_used,
                                          1,
                                        ) + '%'}
                                      </span>
                                      <span class="percentage end-bar"></span>
                                    </div>
                                  </div>
                                `
                              : html``}
                            ${this.ipu_total
                              ? html`
                                  <div class="layout horizontal">
                                    <div
                                      class="layout vertical start-justified wrap"
                                    >
                                      <lablup-progress-bar
                                        id="ipu-usage-bar"
                                        class="start"
                                        progress="${this.ipu_used / 100.0}"
                                        description="${this._prefixFormatWithoutTrailingZeros(
                                          this.ipu_used,
                                          2,
                                        )} / ${this._prefixFormatWithoutTrailingZeros(
                                          this.ipu_total,
                                          2,
                                        )} IPUs ${_t('summary.ReservedShort')}."
                                      ></lablup-progress-bar>
                                      <lablup-progress-bar
                                        id="ipu-usage-bar-2"
                                        class="end"
                                        progress="0"
                                        description="${_t(
                                          'summary.IPUEnabled',
                                        )}."
                                      ></lablup-progress-bar>
                                    </div>
                                    <div
                                      class="layout vertical center center-justified"
                                    >
                                      <span class="percentage start-bar">
                                        ${this._prefixFormatWithoutTrailingZeros(
                                          this.ipu_used,
                                          1,
                                        ) + '%'}
                                      </span>
                                      <span class="percentage end-bar"></span>
                                    </div>
                                  </div>
                                `
                              : html``}
                            ${this.atom_total
                              ? html`
                                  <div class="layout horizontal">
                                    <div
                                      class="layout vertical start-justified wrap"
                                    >
                                      <lablup-progress-bar
                                        id="atom-usage-bar"
                                        class="start"
                                        progress="${this.atom_used / 100.0}"
                                        description="${this._prefixFormatWithoutTrailingZeros(
                                          this.atom_used,
                                          2,
                                        )} / ${this._prefixFormatWithoutTrailingZeros(
                                          this.atom_total,
                                          2,
                                        )} ATOMs ${_t(
                                          'summary.ReservedShort',
                                        )}."
                                      ></lablup-progress-bar>
                                      <lablup-progress-bar
                                        id="atom-usage-bar-2"
                                        class="end"
                                        progress="0"
                                        description="${_t(
                                          'summary.ATOMEnabled',
                                        )}."
                                      ></lablup-progress-bar>
                                    </div>
                                    <div
                                      class="layout vertical center center-justified"
                                    >
                                      <span class="percentage start-bar">
                                        ${this._prefixFormatWithoutTrailingZeros(
                                          this.atom_used,
                                          1,
                                        ) + '%'}
                                      </span>
                                      <span class="percentage end-bar"></span>
                                    </div>
                                  </div>
                                `
                              : html``}
                            ${this.atom_plus_total
                              ? html`
                                  <div class="layout horizontal">
                                    <div
                                      class="layout vertical start-justified wrap"
                                    >
                                      <lablup-progress-bar
                                        id="atom-plus-usage-bar"
                                        class="start"
                                        progress="${this.atom_plus_used /
                                        100.0}"
                                        description="${this._prefixFormatWithoutTrailingZeros(
                                          this.atom_plus_used,
                                          2,
                                        )} / ${this._prefixFormatWithoutTrailingZeros(
                                          this.atom_plus_total,
                                          2,
                                        )} ATOM+ ${_t(
                                          'summary.ReservedShort',
                                        )}."
                                      ></lablup-progress-bar>
                                      <lablup-progress-bar
                                        id="atom-plus-usage-bar-2"
                                        class="end"
                                        progress="0"
                                        description="${_t(
                                          'summary.ATOMPlusEnabled',
                                        )}."
                                      ></lablup-progress-bar>
                                    </div>
                                    <div
                                      class="layout vertical center center-justified"
                                    >
                                      <span class="percentage start-bar">
                                        ${this._prefixFormatWithoutTrailingZeros(
                                          this.atom_plus_used,
                                          1,
                                        ) + '%'}
                                      </span>
                                      <span class="percentage end-bar"></span>
                                    </div>
                                  </div>
                                `
                              : html``}
                            ${this.atom_max_total
                              ? html`
                                  <div class="layout horizontal">
                                    <div
                                      class="layout vertical start-justified wrap"
                                    >
                                      <lablup-progress-bar
                                        id="atom-max-usage-bar"
                                        class="start"
                                        progress="${this.atom_max_used / 100.0}"
                                        description="${this._prefixFormatWithoutTrailingZeros(
                                          this.atom_max_used,
                                          2,
                                        )} / ${this._prefixFormatWithoutTrailingZeros(
                                          this.atom_max_total,
                                          2,
                                        )} ATOM Max ${_t(
                                          'summary.ReservedShort',
                                        )}."
                                      ></lablup-progress-bar>
                                      <lablup-progress-bar
                                        id="atom-max-usage-bar-2"
                                        class="end"
                                        progress="0"
                                        description="${_t(
                                          'summary.ATOMMaxEnabled',
                                        )}."
                                      ></lablup-progress-bar>
                                    </div>
                                    <div
                                      class="layout vertical center center-justified"
                                    >
                                      <span class="percentage start-bar">
                                        ${this._prefixFormatWithoutTrailingZeros(
                                          this.atom_max_used,
                                          1,
                                        ) + '%'}
                                      </span>
                                      <span class="percentage end-bar"></span>
                                    </div>
                                  </div>
                                `
                              : html``}
                            ${this.gaudi2_total
                              ? html`
                                  <div class="layout horizontal">
                                    <div
                                      class="layout vertical start-justified wrap"
                                    >
                                      <lablup-progress-bar
                                        id="gaudi-2-usage-bar"
                                        class="start"
                                        progress="${this.gaudi2_used / 100.0}"
                                        description="${this._prefixFormatWithoutTrailingZeros(
                                          this.gaudi2_used,
                                          2,
                                        )} / ${this._prefixFormatWithoutTrailingZeros(
                                          this.gaudi2_total,
                                          2,
                                        )} Gaudi 2 ${_t(
                                          'summary.ReservedShort',
                                        )}."
                                      ></lablup-progress-bar>
                                      <lablup-progress-bar
                                        id="gaudi-2-usage-bar-2"
                                        class="end"
                                        progress="0"
                                        description="${_t(
                                          'session.Gaudi2Enabled',
                                        )}."
                                      ></lablup-progress-bar>
                                    </div>
                                    <div
                                      class="layout vertical center center-justified"
                                    >
                                      <span class="percentage start-bar">
                                        ${this._prefixFormatWithoutTrailingZeros(
                                          this.gaudi2_used,
                                          1,
                                        ) + '%'}
                                      </span>
                                      <span class="percentage end-bar"></span>
                                    </div>
                                  </div>
                                `
                              : html``}
                            ${this.warboy_total
                              ? html`
                                  <div class="layout horizontal">
                                    <div
                                      class="layout vertical start-justified wrap"
                                    >
                                      <lablup-progress-bar
                                        id="warboy-usage-bar"
                                        class="start"
                                        progress="${this.warboy_used / 100.0}"
                                        description="${this._prefixFormatWithoutTrailingZeros(
                                          this.warboy_used,
                                          2,
                                        )} / ${this._prefixFormatWithoutTrailingZeros(
                                          this.warboy_total,
                                          2,
                                        )} Warboys ${_t(
                                          'summary.ReservedShort',
                                        )}."
                                      ></lablup-progress-bar>
                                      <lablup-progress-bar
                                        id="warboy-usage-bar-2"
                                        class="end"
                                        progress="0"
                                        description="${_t(
                                          'summary.WarboyEnabled',
                                        )}."
                                      ></lablup-progress-bar>
                                    </div>
                                    <div
                                      class="layout vertical center center-justified"
                                    >
                                      <span class="percentage start-bar">
                                        ${this._prefixFormatWithoutTrailingZeros(
                                          this.warboy_used,
                                          1,
                                        ) + '%'}
                                      </span>
                                      <span class="percentage end-bar"></span>
                                    </div>
                                  </div>
                                `
                              : html``}
                            ${this.rngd_total
                              ? html`
                                  <div class="layout horizontal">
                                    <div
                                      class="layout vertical start-justified wrap"
                                    >
                                      <lablup-progress-bar
                                        id="rngd-usage-bar"
                                        class="start"
                                        progress="${this.rngd_used / 100.0}"
                                        description="${this._prefixFormatWithoutTrailingZeros(
                                          this.rngd_used,
                                          2,
                                        )} / ${this._prefixFormatWithoutTrailingZeros(
                                          this.rngd_total,
                                          2,
                                        )} RNGDs ${_t(
                                          'summary.ReservedShort',
                                        )}."
                                      ></lablup-progress-bar>
                                      <lablup-progress-bar
                                        id="rngd-usage-bar-2"
                                        class="end"
                                        progress="0"
                                        description="${_t(
                                          'summary.RNGDEnabled',
                                        )}."
                                      ></lablup-progress-bar>
                                    </div>
                                    <div
                                      class="layout vertical center center-justified"
                                    >
                                      <span class="percentage start-bar">
                                        ${this._prefixFormatWithoutTrailingZeros(
                                          this.rngd_used,
                                          1,
                                        ) + '%'}
                                      </span>
                                      <span class="percentage end-bar"></span>
                                    </div>
                                  </div>
                                `
                              : html``}
                            ${this.hyperaccel_lpu_total
                              ? html`
                                  <div class="layout horizontal">
                                    <div
                                      class="layout vertical start-justified wrap"
                                    >
                                      <lablup-progress-bar
                                        id="hyperaccel-lpu-usage-bar"
                                        class="start"
                                        progress="${this.hyperaccel_lpu_used /
                                        100.0}"
                                        description="${this._prefixFormatWithoutTrailingZeros(
                                          this.hyperaccel_lpu_used,
                                          2,
                                        )} / ${this._prefixFormatWithoutTrailingZeros(
                                          this.hyperaccel_lpu_total,
                                          2,
                                        )} Hyperaccel LPUs ${_t(
                                          'summary.reservedShort',
                                        )}."
                                      ></lablup-progress-bar>
                                      <lablup-progress-bar
                                        id="hyperaccel-lpu-usage-bar-2"
                                        class="end"
                                        progress="0"
                                        description="${_t(
                                          'summary.HyperaccelLPUEnabled',
                                        )}."
                                      ></lablup-progress-bar>
                                    </div>
                                    <div
                                      class="layout vertical center center-justified"
                                    >
                                      <span class="percentage start-bar">
                                        ${this._prefixFormatWithoutTrailingZeros(
                                          this.hyperaccel_lpu_used,
                                          1,
                                        ) + '%'}
                                      </span>
                                      <span class="percentage end-bar"></span>
                                    </div>
                                  </div>
                                `
                              : html``}
                          </div>
                        </div>
                      `
                    : html``}
                  <div class="vertical start layout" style="margin-top:30px;">
                    <div class="horizontal layout resource-legend-stack">
                      <div class="resource-legend-icon start"></div>
                      <span class="resource-legend">
                        ${_t('summary.Reserved')}
                        ${_t('resourcePolicy.Resources')}
                      </span>
                    </div>
                    <div class="horizontal layout resource-legend-stack">
                      <div class="resource-legend-icon end"></div>
                      <span class="resource-legend">
                        ${_t('summary.Used')} ${_t('resourcePolicy.Resources')}
                      </span>
                    </div>
                    <div class="horizontal layout">
                      <div class="resource-legend-icon total"></div>
                      <span class="resource-legend">
                        ${_t('summary.Total')} ${_t('resourcePolicy.Resources')}
                      </span>
                    </div>
                  </div>
                `
              : html``}
          </div>
        </div>
      </lablup-activity-panel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-resource-panel': BackendAIResourcePanel;
  }
}
