/**
 @license
Copyright (c) 2015-2024 Lablup Inc. All rights reserved.
*/
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import BackendAIListStatus, { StatusCondition } from './backend-ai-list-status';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './lablup-progress-bar';
import '@material/mwc-icon-button';
import '@material/mwc-icon/mwc-icon';
import '@material/mwc-linear-progress';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-switch';
import '@vaadin/grid/vaadin-grid';
import '@vaadin/grid/vaadin-grid-column';
import '@vaadin/grid/vaadin-grid-sort-column';
import { css, CSSResultGroup, html, render } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/**
Backend.AI Agent Summary List

Example:

<backend-ai-agent-summary-list active=true>
... content ...
</backend-ai-agent-summary-list>

@group Backend.AI Web UI
@element backend-ai-agent-list
*/

@customElement('backend-ai-agent-summary-list')
export default class BackendAIAgentSummaryList extends BackendAIPage {
  private _enableAgentSchedulable = false;

  @property({ type: String }) condition = 'running';
  @property({ type: Boolean }) useHardwareMetadata = false;
  @property({ type: Array }) agents = [];
  @property({ type: Object }) agentsObject = Object();
  @property({ type: Object }) agentDetail = Object();
  @property({ type: Object }) notification = Object();
  @property({ type: Object }) agentDetailDialog = Object();
  @property({ type: Object }) agentSettingDialog = Object();
  @property({ type: Object }) _boundEndpointRenderer =
    this.endpointRenderer.bind(this);
  @property({ type: Object }) _boundAllocationRenderer =
    this.allocationRenderer.bind(this);
  @property({ type: Object }) _boundSchedulableRenderer =
    this.schedulableRenderer.bind(this);
  @property({ type: String }) filter = '';
  @property({ type: String }) listCondition: StatusCondition = 'loading';
  @query('#list-status') private _listStatus!: BackendAIListStatus;
  @query('vaadin-grid') private _agentGrid;

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 182px);
        }

        .progress-bar-section {
          height: 20px;
        }

        .resource-indicator {
          width: 100px !important;
        }

        .agent-detail-title {
          font-size: 8px;
          width: 42px;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        backend-ai-dialog#agent-detail {
          --component-max-width: 90%;
          --component-min-width: 400px;
        }

        backend-ai-dialog {
          --component-width: 350px;
        }

        img.indicator-icon {
          max-width: 16px !important;
          max-height: 16px !important;
          width: auto;
          height: auto;
          align-self: center;
        }

        lablup-progress-bar {
          --progress-bar-width: 70px;
          border-radius: 3px;
          height: 10px;
          --mdc-theme-primary: #3677eb;
          --mdc-linear-progress-buffer-color: #98be5a;
          margin-bottom: 0;
        }

        lablup-progress-bar.cpu {
          --progress-bar-height: 7px;
        }

        lablup-progress-bar.cuda {
          --progress-bar-width: 80px;
          --progress-bar-height: 15px;
          margin-bottom: 5px;
        }

        lablup-progress-bar.mem {
          --progress-bar-width: 100px;
          --progress-bar-height: 15px;
        }

        lablup-progress-bar.utilization {
          --progress-bar-width: 80px;
          margin-left: 10px;
        }

        lablup-shields {
          margin: 1px;
        }

        mwc-icon {
          --mdc-icon-size: 16px;
        }

        mwc-icon.schedulable {
          --mdc-icon-size: 24px;
        }

        vaadin-grid {
          border: 0;
          font-size: 14px;
        }
      `,
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.agentDetailDialog = this.shadowRoot?.querySelector('#agent-detail');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * Change state to 'ALIVE' when backend.ai client connected.
   *
   * @param {Boolean} active - The component will work if active is true.
   */
  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this._enableAgentSchedulable =
            globalThis.backendaiclient.supports('schedulable');
          this._loadAgentList();
        },
        true,
      );
    } else {
      // already connected
      this._enableAgentSchedulable =
        globalThis.backendaiclient.supports('schedulable');
      this._loadAgentList();
    }
  }

  /**
   * Load an agents list with agent's backend.ai information.
   *
   * @param {string} status - The agent's backend.ai client status.
   */
  _loadAgentList() {
    if (this.active !== true) {
      return;
    }
    this.listCondition = 'loading';
    this._listStatus?.show();
    const fields = [
      'id',
      'status',
      'available_slots',
      'occupied_slots',
      'architecture',
    ];
    if (globalThis.backendaiclient.supports('schedulable')) {
      fields.push('schedulable');
    }
    const status = this.condition === 'running' ? 'ALIVE' : 'TERMINATED';
    // TODO: Let's assume that the number of agents is less than 100 for
    //       user-accessible resource group. This will meet our current need,
    //       but we need to fix this when refactoring the resource indicator.
    const limit = 100;
    const offset = 0;
    const timeout = 10 * 1000;
    globalThis.backendaiclient.agentSummary
      .list(status, fields, limit, offset, timeout)
      .then((response) => {
        const agents = response.agent_summary_list?.items;
        if (agents !== undefined && agents.length != 0) {
          let filter;
          if (this.filter !== '') {
            filter = this.filter.split(':');
          }
          Object.keys(agents).map((objectKey, index) => {
            const agent: any = agents[objectKey];
            if (
              this.filter === '' ||
              (filter[0] in agent && agent[filter[0]] === filter[1])
            ) {
              const occupied_slots = JSON.parse(agent.occupied_slots);
              const available_slots = JSON.parse(agent.available_slots);
              ['cpu', 'mem'].forEach((slot) => {
                // Fallback routine when occupied slots are not present
                if (slot in occupied_slots === false) {
                  occupied_slots[slot] = '0';
                }
              });
              agents[objectKey].cpu_slots = parseInt(available_slots.cpu);
              agents[objectKey].used_cpu_slots = parseInt(occupied_slots.cpu);

              if (agent.cpu_cur_pct !== null) {
                agents[objectKey].cpu_total_usage_ratio =
                  agents[objectKey].used_cpu_slots /
                  agents[objectKey].cpu_slots;
                agents[objectKey].total_cpu_percent = (
                  agents[objectKey].cpu_total_usage_ratio * 100
                )?.toFixed(1);
              } else {
                agents[objectKey].cpu_total_usage_ratio = 0;
                agents[objectKey].total_cpu_percent = (
                  agents[objectKey].cpu_total_usage_ratio * 100
                )?.toFixed(1);
              }
              agents[objectKey].mem_slots = parseInt(
                globalThis.backendaiclient.utils.changeBinaryUnit(
                  available_slots.mem,
                  'g',
                ),
              );
              agents[objectKey].used_mem_slots = parseInt(
                globalThis.backendaiclient.utils.changeBinaryUnit(
                  occupied_slots.mem,
                  'g',
                ),
              );
              agents[objectKey].mem_total_usage_ratio =
                agents[objectKey].used_mem_slots / agents[objectKey].mem_slots;
              agents[objectKey].total_mem_percent = (
                agents[objectKey].mem_total_usage_ratio * 100
              )?.toFixed(1);
              if ('cuda.device' in available_slots) {
                agents[objectKey].cuda_gpu_slots = parseInt(
                  available_slots['cuda.device'],
                );
                if ('cuda.device' in occupied_slots) {
                  agents[objectKey].used_cuda_gpu_slots = parseInt(
                    occupied_slots['cuda.device'],
                  );
                } else {
                  agents[objectKey].used_cuda_gpu_slots = 0;
                }
                agents[objectKey].used_cuda_gpu_slots_ratio =
                  agents[objectKey].used_cuda_gpu_slots /
                  agents[objectKey].cuda_gpu_slots;
                agents[objectKey].total_cuda_gpu_percent = (
                  agents[objectKey].used_cuda_gpu_slots_ratio * 100
                )?.toFixed(1);
              }
              if ('cuda.shares' in available_slots) {
                agents[objectKey].cuda_fgpu_slots = parseFloat(
                  available_slots['cuda.shares'],
                )?.toFixed(2);
                if ('cuda.shares' in occupied_slots) {
                  agents[objectKey].used_cuda_fgpu_slots = parseFloat(
                    occupied_slots['cuda.shares'],
                  )?.toFixed(2);
                } else {
                  agents[objectKey].used_cuda_fgpu_slots = 0;
                }
                agents[objectKey].used_cuda_fgpu_slots_ratio =
                  agents[objectKey].used_cuda_fgpu_slots /
                  agents[objectKey].cuda_fgpu_slots;
                agents[objectKey].total_cuda_fgpu_percent = (
                  agents[objectKey].used_cuda_fgpu_slots_ratio * 100
                )?.toFixed(1);
              }
              if ('rocm.device' in available_slots) {
                agents[objectKey].rocm_gpu_slots = parseInt(
                  available_slots['rocm.device'],
                );
                if ('rocm.device' in occupied_slots) {
                  agents[objectKey].used_rocm_gpu_slots = parseInt(
                    occupied_slots['rocm.device'],
                  );
                } else {
                  agents[objectKey].used_rocm_gpu_slots = 0;
                }
                agents[objectKey].used_rocm_gpu_slots_ratio =
                  agents[objectKey].used_rocm_gpu_slots /
                  agents[objectKey].rocm_gpu_slots;
                agents[objectKey].total_rocm_gpu_percent = (
                  agents[objectKey].used_rocm_gpu_slots_ratio * 100
                )?.toFixed(1);
              }
              if ('tpu.device' in available_slots) {
                agents[objectKey].tpu_slots = parseInt(
                  available_slots['tpu.device'],
                );
                if ('tpu.device' in occupied_slots) {
                  agents[objectKey].used_tpu_slots = parseInt(
                    occupied_slots['tpu.device'],
                  );
                } else {
                  agents[objectKey].used_tpu_slots = 0;
                }
                agents[objectKey].used_tpu_slots_ratio =
                  agents[objectKey].used_tpu_slots /
                  agents[objectKey].tpu_slots;
                agents[objectKey].total_tpu_percent = (
                  agents[objectKey].used_tpu_slots_ratio * 100
                )?.toFixed(1);
              }
              if ('ipu.device' in available_slots) {
                agents[objectKey].ipu_slots = parseInt(
                  available_slots['ipu.device'],
                );
                if ('ipu.device' in occupied_slots) {
                  agents[objectKey].used_ipu_slots = parseInt(
                    occupied_slots['ipu.device'],
                  );
                } else {
                  agents[objectKey].used_ipu_slots = 0;
                }
                agents[objectKey].used_ipu_slots_ratio =
                  agents[objectKey].used_ipu_slots /
                  agents[objectKey].ipu_slots;
                agents[objectKey].total_ipu_percent = (
                  agents[objectKey].used_ipu_slots_ratio * 100
                )?.toFixed(1);
              }
              if ('atom.device' in available_slots) {
                agents[objectKey].atom_slots = parseInt(
                  available_slots['atom.device'],
                );
                if ('atom.device' in occupied_slots) {
                  agents[objectKey].used_atom_slots = parseInt(
                    occupied_slots['atom.device'],
                  );
                } else {
                  agents[objectKey].used_atom_slots = 0;
                }
                agents[objectKey].used_atom_slots_ratio =
                  agents[objectKey].used_atom_slots /
                  agents[objectKey].atom_slots;
                agents[objectKey].total_atom_percent = (
                  agents[objectKey].used_atom_slots_ratio * 100
                )?.toFixed(2);
              }
              if ('atom-plus.device' in available_slots) {
                agents[objectKey].atom_plus_slots = parseInt(
                  available_slots['atom-plus.device'],
                );
                if ('atom-plus.device' in occupied_slots) {
                  agents[objectKey].used_atom_plus_slots = parseInt(
                    occupied_slots['atom-plus.device'],
                  );
                } else {
                  agents[objectKey].used_atom_plus_slots = 0;
                }
                agents[objectKey].used_atom_plus_slots_ratio =
                  agents[objectKey].used_atom_plus_slots /
                  agents[objectKey].atom_plus_slots;
                agents[objectKey].total_atom_plus_percent = (
                  agents[objectKey].used_atom_plus_slots_ratio * 100
                )?.toFixed(1);
              }
              if ('gaudi2.device' in available_slots) {
                agents[objectKey].gaudi2_slots = parseInt(
                  available_slots['gaudi2.device'],
                );
                if ('gaudi2.device' in occupied_slots) {
                  agents[objectKey].used_gaudi2_slots = parseInt(
                    occupied_slots['gaudi2.device'],
                  );
                } else {
                  agents[objectKey].used_gaudi2_slots = 0;
                }
                agents[objectKey].used_gaudi2_slots_ratio =
                  agents[objectKey].used_gaudi2_slots /
                  agents[objectKey].gaudi2_slots;
                agents[objectKey].total_gaudi2_percent = (
                  agents[objectKey].used_gaudi2_slots_ratio * 100
                )?.toFixed(1);
              }
              if ('warboy.device' in available_slots) {
                agents[objectKey].warboy_slots = parseInt(
                  available_slots['warboy.device'],
                );
                if ('warboy.device' in occupied_slots) {
                  agents[objectKey].used_warboy_slots = parseInt(
                    occupied_slots['warboy.device'],
                  );
                } else {
                  agents[objectKey].used_warboy_slots = 0;
                }
                agents[objectKey].used_warboy_slots_ratio =
                  agents[objectKey].used_warboy_slots /
                  agents[objectKey].warboy_slots;
                agents[objectKey].total_warboy_percent = (
                  agents[objectKey].used_warboy_slots_ratio * 100
                )?.toFixed(1);
              }
              if ('hyperaccel-lpu.device' in available_slots) {
                agents[objectKey].hyperaccel_lpu_slots = parseInt(
                  available_slots['hyperaccel-lpu.device'],
                );
                if ('hyperaccel-lpu.device' in occupied_slots) {
                  agents[objectKey].used_hyperaccel_lpu_slots = parseInt(
                    occupied_slots['hyperaccel-lpu.device'],
                  );
                } else {
                  agents[objectKey].used_hyperaccel_lpu_slots = 0;
                }
                agents[objectKey].used_hyperaccel_lpu_slots_ratio =
                  agents[objectKey].used_hyperaccel_lpu_slots /
                  agents[objectKey].hyperaccel_lpu_slots;
                agents[objectKey].total_hyperaccel_lpu_percent = (
                  agents[objectKey].used_hyperaccel_lpu_slots_ratio * 100
                )?.toFixed(1);
              }
              if ('schedulable' in agent) {
                agents[objectKey].schedulable = agent.schedulable;
              }
              this.agentsObject[agents[objectKey]['id']] = agents[objectKey];
            }
          });
        }
        this.agents = agents;
        this._agentGrid.recalculateColumnWidths();

        if (this.agents?.length === 0) {
          this.listCondition = 'no-data';
        } else {
          this._listStatus?.hide();
        }

        if (this.active === true) {
          setTimeout(() => {
            this._loadAgentList();
          }, 15000);
        }
      })
      .catch((err) => {
        this._listStatus?.hide();
        if (err && err.message) {
          console.log(err);
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        }
      });
  }

  /**
   * Check currecnt condition is running.
   *
   * @return {boolean} true if condition is 'running'
   */
  _isRunning() {
    return this.condition === 'running';
  }

  /**
   * Render an index.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  _indexRenderer(root, column, rowData) {
    const idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root,
    );
  }

  /**
   * Render endpoint with IP and name.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  endpointRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div style="white-space:pre-wrap;">${rowData.item.id}</div>
        <div class="indicator monospace" style="white-space:pre-wrap;">
          ${rowData.item.addr}
        </div>
      `,
      root,
    );
  }

  /**
   * Render a allocation.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  allocationRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout flex">
          ${rowData.item.cpu_slots
            ? html`
                <div
                  class="layout horizontal center-justified flex progress-bar-section"
                >
                  <div class="layout horizontal start resource-indicator">
                    <mwc-icon class="fg green">developer_board</mwc-icon>
                    <span class="monospace" style="padding-left:5px;">
                      ${rowData.item.used_cpu_slots}/${rowData.item.cpu_slots}
                    </span>
                    <span class="indicator">${_t('general.cores')}</span>
                  </div>
                  <span class="flex"></span>
                  <lablup-progress-bar
                    id="cpu-usage-bar"
                    progress="${rowData.item.cpu_total_usage_ratio}"
                    description="${rowData.item.total_cpu_percent}%"
                  ></lablup-progress-bar>
                </div>
              `
            : html``}
          ${rowData.item.mem_slots
            ? html`
                <div
                  class="layout horizontal center-justified flex progress-bar-section"
                >
                  <div class="layout horizontal start resource-indicator">
                    <mwc-icon class="fg green">memory</mwc-icon>
                    <span class="monospace" style="padding-left:5px;">
                      ${rowData.item.used_mem_slots}/${rowData.item.mem_slots}
                    </span>
                    <span class="indicator">GiB</span>
                  </div>
                  <span class="flex"></span>
                  <lablup-progress-bar
                    id="mem-usage-bar"
                    progress="${rowData.item.mem_total_usage_ratio}"
                    description="${rowData.item.total_mem_percent}%"
                  ></lablup-progress-bar>
                </div>
              `
            : html``}
          ${rowData.item.cuda_gpu_slots
            ? html`
                <div
                  class="layout horizontal center-justified flex progress-bar-section"
                >
                  <div class="layout horizontal start resource-indicator">
                    <img
                      class="indicator-icon fg green"
                      src="/resources/icons/file_type_cuda.svg"
                    />
                    <span class="monospace" style="padding-left:5px;">
                      ${rowData.item.used_cuda_gpu_slots}/${rowData.item
                        .cuda_gpu_slots}
                    </span>
                    <span class="indicator">GPU</span>
                  </div>
                  <span class="flex"></span>
                  <lablup-progress-bar
                    id="gpu-bar"
                    progress="${rowData.item.used_cuda_gpu_slots_ratio}"
                    description="${rowData.item.total_cuda_gpu_percent}%"
                  ></lablup-progress-bar>
                </div>
              `
            : html``}
          ${rowData.item.cuda_fgpu_slots
            ? html`
                <div
                  class="layout horizontal center-justified flex progress-bar-section"
                >
                  <div class="layout horizontal start resource-indicator">
                    <img
                      class="indicator-icon fg green"
                      src="/resources/icons/file_type_cuda.svg"
                    />
                    <span class="monospace" style="padding-left:5px;">
                      ${rowData.item.used_cuda_fgpu_slots}/${rowData.item
                        .cuda_fgpu_slots}
                    </span>
                    <span class="indicator">fGPU</span>
                  </div>
                  <span class="flex"></span>
                  <lablup-progress-bar
                    id="vgpu-bar"
                    progress="${rowData.item.used_cuda_fgpu_slots_ratio}"
                    description="${rowData.item.total_cuda_fgpu_percent}%"
                  ></lablup-progress-bar>
                </div>
              `
            : html``}
          ${rowData.item.rocm_gpu_slots
            ? html`
                <div
                  class="layout horizontal center-justified flex progress-bar-section"
                >
                  <div class="layout horizontal start resource-indicator">
                    <img
                      class="indicator-icon fg green"
                      src="/resources/icons/rocm.svg"
                    />
                    <span class="monospace" style="padding-left:5px;">
                      ${rowData.item.used_rocm_gpu_slots}/${rowData.item
                        .rocm_gpu_slots}
                    </span>
                    <span class="indicator">ROCm</span>
                  </div>
                  <span class="flex"></span>
                  <lablup-progress-bar
                    id="rocm-gpu-bar"
                    progress="${rowData.item.used_rocm_gpu_slots_ratio}"
                    description="${rowData.item.total_rocm_gpu_percent}%"
                  ></lablup-progress-bar>
                </div>
              `
            : html``}
          ${rowData.item.tpu_slots
            ? html`
                <div
                  class="layout horizontal center-justified flex progress-bar-section"
                >
                  <div class="layout horizontal start resource-indicator">
                    <img
                      class="indicator-icon fg green"
                      src="/resources/icons/tpu.svg"
                    />
                    <span class="monospace" style="padding-left:5px;">
                      ${rowData.item.used_tpu_slots}/${rowData.item.tpu_slots}
                    </span>
                    <span class="indicator">TPU</span>
                  </div>
                  <span class="flex"></span>
                  <lablup-progress-bar
                    id="tpu-bar"
                    progress="${rowData.item.used_tpu_slots_ratio}"
                    description="${rowData.item.total_tpu_percent}%"
                  ></lablup-progress-bar>
                </div>
              `
            : html``}
          ${rowData.item.ipu_slots
            ? html`
                <div
                  class="layout horizontal center-justified flex progress-bar-section"
                >
                  <div class="layout horizontal start resource-indicator">
                    <img
                      class="indicator-icon fg green"
                      src="/resources/icons/tpu.svg"
                    />
                    <span class="monospace" style="padding-left:5px;">
                      ${rowData.item.used_ipu_slots}/${rowData.item.ipu_slots}
                    </span>
                    <span class="indicator">IPU</span>
                  </div>
                  <span class="flex"></span>
                  <lablup-progress-bar
                    id="ipu-bar"
                    progress="${rowData.item.used_ipu_slots_ratio}"
                    description="${rowData.item.total_ipu_percent}%"
                  ></lablup-progress-bar>
                </div>
              `
            : html``}
          ${rowData.item.atom_slots
            ? html`
                <div
                  class="layout horizontal center-justified flex progress-bar-section"
                >
                  <div class="layout horizontal start resource-indicator">
                    <img
                      class="indicator-icon fg green"
                      src="/resources/icons/tpu.svg"
                    />
                    <span class="monospace" style="padding-left:5px;">
                      ${rowData.item.used_atom_slots}/${rowData.item.atom_slots}
                    </span>
                    <span class="indicator">ATOM</span>
                  </div>
                  <span class="flex"></span>
                  <lablup-progress-bar
                    id="atom-bar"
                    progress="${rowData.item.used_atom_slots_ratio}"
                    description="${rowData.item.total_atom_percent}%"
                  ></lablup-progress-bar>
                </div>
              `
            : html``}
          ${rowData.item.gaudi2_slots
            ? html`
                <div
                  class="layout horizontal center-justified flex progress-bar-section"
                >
                  <div class="layout horizontal start resource-indicator">
                    <img
                      class="indicator-icon fg green"
                      src="/resources/icons/gaudi.svg"
                    />
                    <span class="monospace" style="padding-left:5px;">
                      ${rowData.item.used_gaudi2_slots}/${rowData.item
                        .gaudi2_slots}
                    </span>
                    <span class="indicator">Gaudi 2</span>
                  </div>
                  <span class="flex"></span>
                  <lablup-progress-bar
                    id="gaudi-2-bar"
                    progress="${rowData.item.used_gaudi2_slots_ratio}"
                    description="${rowData.item.total_gaudi2_percent}%"
                  ></lablup-progress-bar>
                </div>
              `
            : html``}
          ${rowData.item.atom_plus_slots
            ? html`
                <div
                  class="layout horizontal center-justified flex progress-bar-section"
                >
                  <div class="layout horizontal start resource-indicator">
                    <img
                      class="indicator-icon fg green"
                      src="/resources/icons/tpu.svg"
                    />
                    <span class="monospace" style="padding-left:5px;">
                      ${rowData.item.used_atom_plus_slots}/${rowData.item
                        .atom_plus_slots}
                    </span>
                    <span class="indicator">ATOM+</span>
                  </div>
                  <span class="flex"></span>
                  <lablup-progress-bar
                    id="atom-plus-bar"
                    progress="${rowData.item.used_atom_plus_slots_ratio}"
                    description="${rowData.item.total_atom_plus_percent}%"
                  ></lablup-progress-bar>
                </div>
              `
            : html``}
          ${rowData.item.warboy_slots
            ? html`
                <div
                  class="layout horizontal center-justified flex progress-bar-section"
                >
                  <div class="layout horizontal start resource-indicator">
                    <img
                      class="indicator-icon fg green"
                      src="/resources/icons/tpu.svg"
                    />
                    <span class="monospace" style="padding-left:5px;">
                      ${rowData.item.used_warboy_slots}/${rowData.item
                        .warboy_slots}
                    </span>
                    <span class="indicator">Warboy</span>
                  </div>
                  <span class="flex"></span>
                  <lablup-progress-bar
                    id="warboy-bar"
                    progress="${rowData.item.used_warboy_slots_ratio}"
                    description="${rowData.item.total_warboy_percent}%"
                  ></lablup-progress-bar>
                </div>
              `
            : html``}
          ${rowData.item.hyperaccel_lpu_slots
            ? html`
                <div
                  class="layout horizontal center-justified flex progress-bar-section"
                >
                  <div class="layout horizontal start resource-indicator">
                    <img
                      class="indicator-icon fg green"
                      src="/resources/icons/npu_generic.svg"
                    />
                    <span class="monospace" style="padding-left:5px;">
                      ${rowData.item.used_hyperaccel_lpu_slots}/${rowData.item
                        .hyperaccel_lpu_slots}
                    </span>
                    <span class="indicator">Hyperaccel LPU</span>
                  </div>
                  <span class="flex"></span>
                  <lablup-progress-bar
                    id="hyperaccel-lpu-bar"
                    progress="${rowData.item.used_hyperaccel_lpu_slots_ratio}"
                    description="${rowData.item.total_hyperaccel_lpu_percent}%"
                  ></lablup-progress-bar>
                </div>
              `
            : html``}
        </div>
      `,
      root,
    );
  }

  /**
   * Render whether the agent is schedulable or not
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  schedulableRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout horizontal center center-justified wrap">
          ${rowData.item?.schedulable
            ? html`
                <mwc-icon class="fg green schedulable">check_circle</mwc-icon>
              `
            : html`
                <mwc-icon class="fg red schedulable">block</mwc-icon>
              `}
        </div>
      `,
      root,
    );
  }

  render() {
    // language=HTML
    return html`
      <div class="list-wrapper">
        <vaadin-grid
          class="${this.condition}"
          theme="row-stripes column-borders compact dark"
          aria-label="Job list"
          .items="${this.agents}"
        >
          <vaadin-grid-column
            width="30px"
            flex-grow="0"
            header="#"
            text-align="center"
            .renderer="${this._indexRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-column
            resizable
            auto-width
            header="${_t('agent.Endpoint')}"
            .renderer="${this._boundEndpointRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-sort-column
            auto-width
            resizable
            path="architecture"
            header="${_t('agent.Architecture')}"
          ></vaadin-grid-sort-column>
          <vaadin-grid-column
            resizable
            auto-width
            header="${_t('agent.Allocation')}"
            .renderer="${this._boundAllocationRenderer}"
          ></vaadin-grid-column>
          ${this._enableAgentSchedulable
            ? html`
                <vaadin-grid-column
                  auto-width
                  flex-grow="0"
                  resizable
                  header="${_t('agent.Schedulable')}"
                  .renderer="${this._boundSchedulableRenderer}"
                ></vaadin-grid-column>
              `
            : html``}
        </vaadin-grid>
        <backend-ai-list-status
          id="list-status"
          statusCondition="${this.listCondition}"
          message="${_text('agent.NoAgentToDisplay')}"
        ></backend-ai-list-status>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-agent-summary-list': BackendAIAgentSummaryList;
  }
}
