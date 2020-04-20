/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {render} from 'lit-html';
import {BackendAIPage} from './backend-ai-page';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '../plastics/lablup-shields/lablup-shields';

import 'weightless/icon';
import 'weightless/button';

import '@material/mwc-linear-progress';

import {default as PainKiller} from "./backend-ai-painkiller";
import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment} from "../plastics/layout/iron-flex-layout-classes";

@customElement("backend-ai-agent-list")
export default class BackendAIAgentList extends BackendAIPage {
  @property({type: String}) condition = 'running';
  @property({type: Array}) agents = Array();
  @property({type: Object}) notification = Object();
  @property({type: Object}) _boundRegionRenderer = this.regionRenderer.bind(this);
  @property({type: Object}) _boundContactDateRenderer = this.contactDateRenderer.bind(this);
  @property({type: Object}) _boundStatusRenderer = this.statusRenderer.bind(this);
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);

  constructor() {
    super();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        vaadin-grid {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 200px);
        }

        paper-item {
          height: 30px;
          --paper-item-min-height: 30px;
        }

        wl-button > wl-icon {
          --icon-size: 24px;
          padding: 0;
        }

        wl-icon {
          --icon-size: 16px;
          padding: 0;
        }

        wl-icon {
          width: 16px;
          height: 16px;
          --icon-size: 16px;
          min-width: 16px;
          min-height: 16px;
          padding: 0;
        }

        img.indicator-icon {
          width: 16px;
          height: 16px;
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

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        mwc-linear-progress {
          width: 100px;
          border-radius: 3px;
          height: 10px;
          --mdc-theme-primary: #3677eb;
          --mdc-linear-progress-buffer-color: #98be5a;
        }

        .maintaining mwc-linear-progress,
        .terminated mwc-linear-progress {
          --mdc-linear-progress-buffering-dots-image: url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 1 1'%3E%3Cpath d='M0,0h1v1H0' fill='#fff'/%3E%3C/svg%3E");
        }
      `];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  async _viewStateChanged(active: Boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        let status = 'ALIVE';
        this._loadAgentList(status);
      }, true);
    } else { // already connected
      let status = 'ALIVE';
      this._loadAgentList(status);
    }
  }

  _loadAgentList(status: string = 'running') {
    if (this.active !== true) {
      return;
    }

    switch (this.condition) {
      case 'running':
        status = 'ALIVE';
        break;
      case 'terminated':
        status = 'TERMINATED';
        break;
      case 'archived':
      default:
        status = 'ALIVE';
    }
    let fields = ['id', 'status', 'addr', 'region', 'first_contact', 'cpu_cur_pct', 'mem_cur_bytes', 'available_slots', 'occupied_slots'];
    globalThis.backendaiclient.agent.list(status, fields).then(response => {
      let agents = response.agents;
      if (agents !== undefined && agents.length != 0) {
        Object.keys(agents).map((objectKey, index) => {
          var agent = agents[objectKey];
          var occupied_slots = JSON.parse(agent.occupied_slots);
          var available_slots = JSON.parse(agent.available_slots);
          ['cpu', 'mem'].forEach((slot) => { // Fallback routine when occupied slots are not present
            if (slot in occupied_slots === false) {
              occupied_slots[slot] = "0";
            }
          });

          agents[objectKey].cpu_slots = parseInt(available_slots.cpu);
          agents[objectKey].used_cpu_slots = parseInt(occupied_slots.cpu);
          if (agent.cpu_cur_pct !== null) {
            agents[objectKey].current_cpu_percent = agent.cpu_cur_pct;
            agents[objectKey].cpu_total_usage_ratio = agents[objectKey].used_cpu_slots / agents[objectKey].cpu_slots;
            agents[objectKey].cpu_current_usage_ratio = (agents[objectKey].current_cpu_percent / agents[objectKey].cpu_slots) / 100.0;
            agents[objectKey].current_cpu_percent = agents[objectKey].current_cpu_percent.toFixed(2);
          } else {
            agents[objectKey].current_cpu_percent = 0;
            agents[objectKey].cpu_total_usage_ratio = 0;
            agents[objectKey].cpu_current_usage_ratio = 0;
          }
          if (agent.mem_cur_bytes !== null) {
            agents[objectKey].current_mem_bytes = agent.mem_cur_bytes;
          } else {
            agents[objectKey].current_mem_bytes = 0;
          }
          agents[objectKey].current_mem = globalThis.backendaiclient.utils.changeBinaryUnit(agent.current_mem_bytes, 'g');
          agents[objectKey].mem_slots = parseInt(globalThis.backendaiclient.utils.changeBinaryUnit(available_slots.mem, 'g'));
          agents[objectKey].used_mem_slots = parseInt(globalThis.backendaiclient.utils.changeBinaryUnit(occupied_slots.mem, 'g'));
          agents[objectKey].mem_total_usage_ratio = agents[objectKey].used_mem_slots / agents[objectKey].mem_slots;
          agents[objectKey].mem_current_usage_ratio = agents[objectKey].current_mem / agents[objectKey].mem_slots;
          agents[objectKey].current_mem = agents[objectKey].current_mem.toFixed(2);
          if ('cuda.device' in available_slots) {
            agents[objectKey].cuda_gpu_slots = parseInt(available_slots['cuda.device']);
            if ('cuda.device' in occupied_slots) {
              agents[objectKey].used_cuda_gpu_slots = parseInt(occupied_slots['cuda.device']);
            } else {
              agents[objectKey].used_cuda_gpu_slots = 0;
            }
            agents[objectKey].used_cuda_gpu_slots_ratio = agents[objectKey].used_cuda_gpu_slots / agents[objectKey].cuda_gpu_slots;
          }
          if ('cuda.shares' in available_slots) {
            agents[objectKey].cuda_fgpu_slots = parseInt(available_slots['cuda.shares']);
            if ('cuda.shares' in occupied_slots) {
              agents[objectKey].used_cuda_fgpu_slots = parseInt(occupied_slots['cuda.shares']);
            } else {
              agents[objectKey].used_cuda_fgpu_slots = 0;
            }
            agents[objectKey].used_cuda_fgpu_slots_ratio = agents[objectKey].used_cuda_fgpu_slots / agents[objectKey].cuda_fgpu_slots;
          }
          if ('rocm.device' in available_slots) {
            agents[objectKey].rocm_gpu_slots = parseInt(available_slots['rocm.device']);
            if ('rocm.device' in occupied_slots) {
              agents[objectKey].used_rocm_gpu_slots = parseInt(occupied_slots['rocm.device']);
            } else {
              agents[objectKey].used_rocm_gpu_slots = 0;
            }
            agents[objectKey].used_rocm_gpu_slots_ratio = agents[objectKey].used_rocm_gpu_slots / agents[objectKey].rocm_gpu_slots;
          }
        });
      }
      this.agents = agents;
      if (this.active === true) {
        setTimeout(() => {
          this._loadAgentList(status)
        }, 15000);
      }
    }).catch(err => {
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  _isRunning() {
    return this.condition === 'running';
  }

  _byteToMB(value) {
    return Math.floor(value / 1000000);
  }

  _MBtoGB(value) {
    return Math.floor(value / 1024);
  }

  _elapsed(start, end) {
    let startDate = new Date(start);
    let endDate: Date;
    if (this.condition === 'running') {
      endDate = new Date();
    } else {
      endDate = new Date(end);
    }
    var seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    if (this.condition === 'running') {
      return 'Running ' + seconds + 'sec.';
    } else {
      return 'Reserved for ' + seconds + 'sec.';
    }
    return seconds;
  }

  _humanReadableDate(start) {
    var startDate = new Date(start);
    return startDate.toLocaleString('ko-KR');
  }

  _indexFrom1(index: number) {
    return index + 1;
  }

  _heartbeatStatus(state: string) {
    return state;
  }

  _heartbeatColor(state: string) {
    switch (state) {
      case 'ALIVE':
        return 'green';
      case 'TERMINATED':
        return 'red';
      default:
        return 'blue';
    }
  }

  _indexRenderer(root, column, rowData) {
    let idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  regionRenderer(root, column?, rowData?) {
    let platform: string;
    let location: string;
    let color: string;
    let icon: string;
    let regionData = rowData.item.region.split('/');
    if (regionData.length > 1) {
      platform = regionData[0];
      location = regionData[1];
    } else {
      platform = regionData[0];
      location = "";
    }
    switch (platform) {
      case "aws":
        color = 'orange';
        icon = 'aws';
        break;
      case "azure":
        color = 'blue';
        icon = 'azure';
        break;
      case "gcp":
        color = 'lightblue';
        icon = 'gcp';
        break;
      case "nbp":
        color = 'green';
        icon = 'nbp';
        break;
      case "openstack":
        color = 'red';
        icon = 'openstack';
        break;
      case "local":
        color = 'yellow';
        icon = 'local';
        break;
      default:
        color = 'yellow';
        icon = 'local';
    }
    render(
      // language=HTML
      html`
        <div class="horizontal start-justified center layout">
          <img src="/resources/icons/${icon}.png" style="width:32px;height:32px;"/>
          <lablup-shields app="${location}" color="${color}"
                          description="${platform}" ui="flat"></lablup-shields>
        </div>
    `, root
    );
  }

  contactDateRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout vertical">
            <span>${this._humanReadableDate(rowData.item.first_contact)}</span>
        </div>`, root
    );
  }

  statusRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout horizontal justified wrap">
          <lablup-shields app="" color="${this._heartbeatColor(rowData.item.status)}"
                          description="${this._heartbeatStatus(rowData.item.status)}" ui="flat"></lablup-shields>
        </div>`, root
    );
  }

  controlRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div id="controls" class="layout horizontal flex center" agent-id="${rowData.item.addr}">
          <wl-button fab flat inverted disabled class="fg" icon="assignment"><wl-icon>assignment</wl-icon></wl-button>
          ${this._isRunning() ? html`
            <wl-button fab flat inverted disabled class="fg controls-running" icon="build"><wl-icon>build</wl-icon></wl-button>
            <wl-button fab flat inverted disabled class="fg controls-running" icon="alarm-add"><wl-icon>alarm_add</wl-icon></wl-button>
            <wl-button fab flat inverted disabled class="fg controls-running" icon="av:pause"><wl-icon>pause</wl-icon></wl-button>
            <wl-button fab flat inverted disabled class="fg controls-running" icon="delete"><wl-icon>delete</wl-icon></wl-button>
          ` : html``}
    </div>`, root
    );
  }

  render() {
    // language=HTML
    return html`
      <vaadin-grid class="${this.condition}" theme="row-stripes column-borders compact" aria-label="Job list" .items="${this.agents}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" .renderer="${this._indexRenderer}"></vaadin-grid-column>
        <vaadin-grid-column width="80px">
          <template class="header">${_t("agent.Endpoint")}</template>
          <template>
            <div>[[item.id]]</div>
            <div class="indicator monospace">[[item.addr]]</div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="100px" resizable .renderer="${this._boundRegionRenderer}">
          <template class="header">${_t("agent.Region")}</template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable .renderer="${this._boundContactDateRenderer}">
          <template class="header">${_t("agent.Starts")}</template>
        </vaadin-grid-column>

        <vaadin-grid-column resizable>
          <template class="header">${_t("agent.Resources")}</template>
          <template>
            <div class="layout flex">
              <div class="layout horizontal center flex">
                <wl-icon class="fg green">developer_board</wl-icon>
                <div class="layout vertical start" style="padding-left:5px;">
                  <div class="layout horizontal start">
                    <span>[[ item.cpu_slots ]]</span>
                    <span class="indicator">${_t("general.cores")}</span>
                  </div>
                  <div class="layout horizontal start">
                    <span>[[item.current_cpu_percent]]</span>
                    <span class="indicator">%</span>
                  </div>
                </div>
                <span class="flex"></span>
                <mwc-linear-progress id="cpu-usage-bar" progress="[[item.cpu_current_usage_ratio]]"
                                buffer="[[item.cpu_total_usage_ratio]]"></mwc-linear-progress>
              </div>
              <div class="layout horizontal center flex">
                <wl-icon class="fg green">memory</wl-icon>
                <div class="layout vertical start" style="padding-left:5px;">
                  <div class="layout horizontal start">
                    <span>[[item.mem_slots]]</span>
                    <span class="indicator">GB</span>
                  </div>
                  <div class="layout horizontal start">
                    <span>[[item.current_mem]]</span>
                    <span class="indicator">GB</span>
                  </div>
                </div>
                <span class="flex"></span>
                <mwc-linear-progress id="mem-usage-bar" progress="[[item.mem_current_usage_ratio]]"
                                buffer="[[item.mem_total_usage_ratio]]"></mwc-linear-progress>

              </div>
              <template is="dom-if" if="[[item.cuda_gpu_slots]]">
                <div class="layout horizontal center flex">
                  <img class="indicator-icon fg green" src="/resources/icons/file_type_cuda.svg" />
                  <span style="padding-left:5px;">[[item.cuda_gpu_slots]]</span>
                  <span class="indicator">GPU</span>
                  <span class="flex"></span>
                  <mwc-linear-progress id="gpu-bar" value="[[item.used_cuda_gpu_slots_ratio]]" buffer="[[item.used_cuda_gpu_slots_ratio]]"></mwc-linear-progress>
                </div>
              </template>
              <template is="dom-if" if="[[item.cuda_fgpu_slots]]">
                <div class="layout horizontal center flex">
                  <img class="indicator-icon fg green" src="/resources/icons/file_type_cuda.svg" />
                  <span style="padding-left:5px;">[[item.cuda_fgpu_slots]]</span>
                  <span class="indicator">fGPU</span>
                  <span class="flex"></span>
                  <mwc-linear-progress id="vgpu-bar" value="[[item.used_cuda_fgpu_slots_ratio]]" buffer="[[item.used_cuda_fgpu_slots_ratio]]"></mwc-linear-progress>
                </div>
              </template>
              <template is="dom-if" if="[[item.rocm_gpu_slots]]">
                <div class="layout horizontal center flex">
                  <img class="indicator-icon fg green" src="/resources/icons/ROCm.png" />
                  <span style="padding-left:5px;">[[item.rocm_gpu_slots]]</span>
                  <span class="indicator">ROCm</span>
                  <span class="flex"></span>
                  <mwc-linear-progress id="rocm-gpu-bar" value="[[item.used_rocm_gpu_slots_ratio]]" buffer="[[item.used_rocm_gpu_slots_ratio]]"></mwc-linear-progress>
                </div>
              </template>
              <template is="dom-if" if="[[item.tpu_slots]]">
                <div class="layout horizontal center flex">
                  <img class="indicator-icon fg green" src="/resources/icons/tpu.svg" />
                  <span style="padding-left:5px;">[[item.tpu_slots]]</span>
                  <span class="indicator">TPU</span>
                  <span class="flex"></span>
                  <mwc-linear-progress id="tpu-bar" value="[[item.used_tpu_slots_ratio]]" buffer="[[item.used_tpu_slots_ratio]]"></mwc-linear-progress>
                </div>
              </template>
            </div>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column width="100px" flex-grow="0" resizable header="${_t("agent.Status")}" .renderer="${this._boundStatusRenderer}"></vaadin-grid-column>
        <vaadin-grid-column resizable header="${_t("general.Control")}" .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
      </vaadin-grid>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-agent-list": BackendAIAgentList;
  }
}
