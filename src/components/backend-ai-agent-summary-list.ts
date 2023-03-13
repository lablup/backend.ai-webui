/**
 @license
Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
*/

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {BackendAIPage} from './backend-ai-page';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '../plastics/lablup-shields/lablup-shields';

import '@material/mwc-linear-progress';
import '@material/mwc-icon-button';
import '@material/mwc-switch';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-icon/mwc-icon';


import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';
import BackendAIListStatus, {StatusCondition} from './backend-ai-list-status';
import './backend-ai-dialog';
import './lablup-progress-bar';

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

  @property({type: String}) condition = 'running';
  @property({type: Boolean}) useHardwareMetadata = false;
  @property({type: Array}) agents = [];
  @property({type: Object}) agentsObject = Object();
  @property({type: Object}) agentDetail = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) agentDetailDialog = Object();
  @property({type: Object}) agentSettingDialog = Object();
  @property({type: Object}) _boundEndpointRenderer = this.endpointRenderer.bind(this);
  @property({type: Object}) _boundResourceRenderer = this.resourceRenderer.bind(this);
  @property({type: Object}) _boundSchedulableRenderer = this.schedulableRenderer.bind(this);
  @property({type: String}) filter = '';
  @property({type: String}) listCondition: StatusCondition = 'loading';
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
          width: 16px !important;
          height: 16px !important;
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
    `];
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
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._enableAgentSchedulable = globalThis.backendaiclient.supports('schedulable');
        this._loadAgentList();
      }, true);
    } else { // already connected
      this._enableAgentSchedulable = globalThis.backendaiclient.supports('schedulable');
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
    const fields = ['id', 'status', 'available_slots', 'occupied_slots', 'architecture'];
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
    globalThis.backendaiclient.agentSummary.list(status, fields, limit, offset, timeout).then((response) => {
      const agents = response.agent_summary_list?.items;
      if (agents !== undefined && agents.length != 0) {
        let filter;
        if (this.filter !== '') {
          filter = this.filter.split(':');
        }
        Object.keys(agents).map((objectKey, index) => {
          const agent: any = agents[objectKey];
          if (this.filter === '' || (filter[0] in agent && agent[filter[0]] === filter[1])) {
            const occupied_slots = JSON.parse(agent.occupied_slots);
            const available_slots = JSON.parse(agent.available_slots);
            ['cpu', 'mem'].forEach((slot) => { // Fallback routine when occupied slots are not present
              if (slot in occupied_slots === false) {
                occupied_slots[slot] = '0';
              }
            });
            agents[objectKey].cpu_slots = parseInt(available_slots.cpu);
            agents[objectKey].used_cpu_slots = parseInt(occupied_slots.cpu);

            if (agent.cpu_cur_pct !== null) {
              agents[objectKey].cpu_total_usage_ratio = agents[objectKey].used_cpu_slots / agents[objectKey].cpu_slots;
              agents[objectKey].total_cpu_percent = (agents[objectKey].cpu_total_usage_ratio * 100)?.toFixed(2);
            } else {
              agents[objectKey].cpu_total_usage_ratio = 0;
              agents[objectKey].total_cpu_percent = (agents[objectKey].cpu_total_usage_ratio * 100)?.toFixed(2);
            }
            agents[objectKey].mem_slots = parseInt(globalThis.backendaiclient.utils.changeBinaryUnit(available_slots.mem, 'g'));
            agents[objectKey].used_mem_slots = parseInt(globalThis.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem, 'g'));
            agents[objectKey].mem_total_usage_ratio = agents[objectKey].used_mem_slots / agents[objectKey].mem_slots;
            agents[objectKey].total_mem_percent = (agents[objectKey].mem_total_usage_ratio * 100)?.toFixed(2);

            if ('cuda.device' in available_slots) {
              agents[objectKey].cuda_gpu_slots = parseInt(available_slots['cuda.device']);
              if ('cuda.device' in occupied_slots) {
                agents[objectKey].used_cuda_gpu_slots = parseInt(occupied_slots['cuda.device']);
              } else {
                agents[objectKey].used_cuda_gpu_slots = 0;
              }
              agents[objectKey].used_cuda_gpu_slots_ratio = agents[objectKey].used_cuda_gpu_slots / agents[objectKey].cuda_gpu_slots;
              agents[objectKey].total_cuda_gpu_percent = (agents[objectKey].used_cuda_gpu_slots_ratio * 100)?.toFixed(2);
            }
            if ('cuda.shares' in available_slots) {
              agents[objectKey].cuda_fgpu_slots = parseInt(available_slots['cuda.shares']);
              if ('cuda.shares' in occupied_slots) {
                agents[objectKey].used_cuda_fgpu_slots = parseInt(occupied_slots['cuda.shares']);
              } else {
                agents[objectKey].used_cuda_fgpu_slots = 0;
              }
              agents[objectKey].used_cuda_fgpu_slots_ratio = agents[objectKey].used_cuda_fgpu_slots / agents[objectKey].cuda_fgpu_slots;
              agents[objectKey].total_cuda_fgpu_percent = (agents[objectKey].used_cuda_fgpu_slots_ratio * 100)?.toFixed(2);
            }
            if ('rocm.device' in available_slots) {
              agents[objectKey].rocm_gpu_slots = parseInt(available_slots['rocm.device']);
              if ('rocm.device' in occupied_slots) {
                agents[objectKey].used_rocm_gpu_slots = parseInt(occupied_slots['rocm.device']);
              } else {
                agents[objectKey].used_rocm_gpu_slots = 0;
              }
              agents[objectKey].used_rocm_gpu_slots_ratio = agents[objectKey].used_rocm_gpu_slots / agents[objectKey].rocm_gpu_slots;
              agents[objectKey].total_rocm_gpu_percent = (agents[objectKey].used_rocm_gpu_slots_ratio * 100)?.toFixed(2);
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
    }).catch((err) => {
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
      root
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
        <div class="indicator monospace" style="white-space:pre-wrap;">${rowData.item.addr}</div>
      `, root
    );
  }

  /**
  * Render a resource.
  *
  * @param {DOMelement} root
  * @param {object} column (<vaadin-grid-column> element)
  * @param {object} rowData
  */
  resourceRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout flex">
          ${rowData.item.cpu_slots ? html`
            <div class="layout horizontal center-justified flex progress-bar-section">
              <div class="layout horizontal start resource-indicator">
                <mwc-icon class="fg green">developer_board</mwc-icon>
                <span class="monospace" style="padding-left:5px;">${rowData.item.used_cpu_slots}/${rowData.item.cpu_slots}</span>
                <span class="indicator">${_t('general.cores')}</span>
              </div>
              <span class="flex"></span>
              <lablup-progress-bar id="cpu-usage-bar" progress="${rowData.item.cpu_total_usage_ratio}"
                                  description="${rowData.item.total_cpu_percent}%"></lablup-progress-bar>
            </div>` : html``}
          ${rowData.item.mem_slots ? html`
            <div class="layout horizontal center-justified flex progress-bar-section">
              <div class="layout horizontal start resource-indicator">
                <mwc-icon class="fg green">memory</mwc-icon>
                <span class="monospace" style="padding-left:5px;">${rowData.item.used_mem_slots}/${rowData.item.mem_slots}</span>
                <span class="indicator">GiB</span>
              </div>
              <span class="flex"></span>
              <lablup-progress-bar id="mem-usage-bar" progress="${rowData.item.mem_total_usage_ratio}"
                                  description="${rowData.item.total_mem_percent}%"></lablup-progress-bar>
            </div>` : html``}
          ${rowData.item.cuda_gpu_slots ? html`
            <div class="layout horizontal center-justified flex progress-bar-section">
              <div class="layout horizontal start resource-indicator">
                <img class="indicator-icon fg green" src="/resources/icons/file_type_cuda.svg"/>
                <span class="monospace" style="padding-left:5px;">${rowData.item.used_cuda_gpu_slots}/${rowData.item.cuda_gpu_slots}</span>
                <span class="indicator">GPU</span>
              </div>
              <span class="flex"></span>
              <lablup-progress-bar id="gpu-bar" progress="${rowData.item.used_cuda_gpu_slots_ratio}"
                                  description="${rowData.item.total_cuda_gpu_percent}%"></lablup-progress-bar>
            </div>
          ` : html``}
          ${rowData.item.cuda_fgpu_slots ? html`
            <div class="layout horizontal center-justified flex progress-bar-section">
              <div class="layout horizontal start resource-indicator">
                <img class="indicator-icon fg green" src="/resources/icons/file_type_cuda.svg"/>
                <span class="monospace" style="padding-left:5px;">${rowData.item.used_cuda_fgpu_slots}/${rowData.item.cuda_fgpu_slots}</span>
                <span class="indicator">fGPU</span>
              </div>
              <span class="flex"></span>
              <lablup-progress-bar id="vgpu-bar" progress="${rowData.item.used_cuda_fgpu_slots_ratio}"
                                  description="${rowData.item.used_cuda_fgpu_slots}"></lablup-progress-bar>
            </div>
          ` : html``}
          ${rowData.item.rocm_gpu_slots ? html`
            <div class="layout horizontal center-justified flex progress-bar-section">
              <div class="layout horizontal start resource-indicator">
                <img class="indicator-icon fg green" src="/resources/icons/ROCm.png"/>
                <span class="monospace" style="padding-left:5px;">${rowData.item.used_rocm_gpu_slots}/${rowData.item.rocm_gpu_slots}</span>
                <span class="indicator">ROCm</span>
              </div>
              <span class="flex"></span>
              <lablup-progress-bar id="rocm-gpu-bar" progress="${rowData.item.used_rocm_gpu_slots_ratio}"
                                  description="${rowData.item.used_rocm_gpu_slots}"></lablup-progress-bar>
            </div>
          ` : html``}
          ${rowData.item.tpu_slots ? html`
            <div class="layout horizontal center-justified flex progress-bar-section">
              <div class="layout horizontal start resource-indicator">
                <img class="indicator-icon fg green" src="/resources/icons/tpu.svg"/>
                <span class="monospace" style="padding-left:5px;">${rowData.item.used_tpu_slots}/${rowData.item.tpu_slots}</span>
                <span class="indicator">TPU</span>
              </div>
              <span class="flex"></span>
              <lablup-progress-bar id="tpu-bar" progress="${rowData.item.used_tpu_slots_ratio}"
                                  description="${rowData.item.used_tpu_slots}"></lablup-progress-bar>
            </div>
          ` : html``}
        </div>`, root
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
          ${rowData.item?.schedulable ? html`
            <mwc-icon class="fg green schedulable">check_circle</mwc-icon>
          ` : html`
            <mwc-icon class="fg red schedulable">block</mwc-icon>
          `}
        </div>`, root
    );
  }

  _bytesToMiB(value) {
    return Number(value / (1024 * 1024)).toFixed(1);
  }

  static bytesToGiB(num, digits=2) {
    if (!num) return num;
    return (num / 2 ** 30).toFixed(digits);
  }

  render() {
    // language=HTML
    return html`
      <div class="list-wrapper">
        <vaadin-grid class="${this.condition}" theme="row-stripes column-borders compact" aria-label="Job list"
                    .items="${this.agents}">
          <vaadin-grid-column width="30px" flex-grow="0" header="#" text-align="center"
                              .renderer="${this._indexRenderer}"></vaadin-grid-column>
          <vaadin-grid-column resizable auto-width header="${_t('agent.Endpoint')}"
                              .renderer="${this._boundEndpointRenderer}">
          </vaadin-grid-column>
          <vaadin-grid-sort-column auto-width resizable path="architecture" header="${_t('agent.Architecture')}">
          </vaadin-grid-sort-column>
          <vaadin-grid-column resizable auto-width header="${_t('agent.Allocation')}"
                              .renderer="${this._boundResourceRenderer}">
          </vaadin-grid-column>
          ${this._enableAgentSchedulable ? html`
          <vaadin-grid-column auto-width flex-grow="0" resizable header="${_t('agent.Schedulable')}"
                              .renderer="${this._boundSchedulableRenderer}"></vaadin-grid-column>
          ` : html``}
        </vaadin-grid>
        <backend-ai-list-status id="list-status" statusCondition="${this.listCondition}" message="${_text('agent.NoAgentToDisplay')}"></backend-ai-list-status>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-agent-summary-list': BackendAIAgentSummaryList;
  }
}
