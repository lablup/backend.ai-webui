/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {render} from 'lit-html';
import {BackendAIPage} from './backend-ai-page';

import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid';
import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid-sort-column';
import '../plastics/lablup-shields/lablup-shields';

import 'weightless/button';

import '@material/mwc-linear-progress';
import '@material/mwc-icon-button';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-icon';

import {default as PainKiller} from "./backend-ai-painkiller";
import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment} from "../plastics/layout/iron-flex-layout-classes";
import './backend-ai-dialog';
import './lablup-progress-bar';

/**
 Backend.AI Agent List

 Example:

 <backend-ai-agent-list active=true>
 ... content ...
 </backend-ai-agent-list>

 @group Backend.AI Console
 @element backend-ai-agent-list
 */

@customElement("backend-ai-agent-list")
export default class BackendAIAgentList extends BackendAIPage {
  @property({type: String}) condition = 'running';
  @property({type: Array}) agents = Array();
  @property({type: Object}) agentsObject = Object();
  @property({type: Object}) agentDetail = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) agentDetailDialog = Object();
  @property({type: Object}) _boundRegionRenderer = this.regionRenderer.bind(this);
  @property({type: Object}) _boundContactDateRenderer = this.contactDateRenderer.bind(this);
  @property({type: Object}) _boundResourceRenderer = this.resourceRenderer.bind(this);
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
          width: 16px !important;
          height: 16px !important;
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

        lablup-progress-bar {
          width: 100px;
          border-radius: 3px;
          height: 10px;
          --mdc-theme-primary: #3677eb;
          --mdc-linear-progress-buffer-color: #98be5a;
        }

        lablup-progress-bar.cpu {
          --progress-bar-height: 5px;
          margin-bottom: 0;
        }

        lablup-progress-bar.cuda {
          --progress-bar-height: 15px;
          margin-bottom: 5px;
        }

        lablup-progress-bar.mem {
          --progress-bar-height: 15px;
          width: 100px;
          margin-bottom: 0;
        }

        .resource-indicator {
          width: 100px !important;
        }

        .date-indicator {
          font-size: 12px;
        }

        .asic-indicator {
          border-top: 1px solid #cccccc;
          margin-top: 3px;
          padding-top: 3px;
        }
      `];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.agentDetailDialog = this.shadowRoot.querySelector('#agent-detail');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * Change state to 'ALIVE' when backend.ai client connected.
   *
   * @param {Booelan} active - The component will work if active is true.
   */
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

  /**
   * Load an agents list with agent's backend.ai information.
   *
   * @param {string} status - The agent's backend.ai client status.
   */
  _loadAgentList(status: string = 'running') {
    if (this.active !== true) {
      return;
    }
    let fields: Array<String>;
    switch (this.condition) {
      case 'running':
        status = 'ALIVE';
        fields = ['id', 'status', 'version', 'addr', 'region', 'compute_plugins', 'first_contact',
          'lost_at', 'status_changed', 'live_stat', 'cpu_cur_pct', 'mem_cur_bytes', 'available_slots', 'occupied_slots', 'scaling_group'];
        break;
      case 'terminated':
        status = 'TERMINATED';
        fields = ['id', 'status', 'version', 'addr', 'region', 'compute_plugins', 'first_contact',
          'lost_at', 'status_changed', 'cpu_cur_pct', 'mem_cur_bytes', 'available_slots', 'occupied_slots', 'scaling_group'];
        break;
      case 'archived':
      default:
        status = 'ALIVE';
        fields = ['id', 'status', 'version', 'addr', 'region', 'compute_plugins', 'first_contact',
          'lost_at', 'status_changed', 'cpu_cur_pct', 'mem_cur_bytes', 'available_slots', 'occupied_slots', 'scaling_group'];
    }
    globalThis.backendaiclient.agent.list(status, fields).then(response => {
      let agents = response.agents;
      if (agents !== undefined && agents.length != 0) {
        Object.keys(agents).map((objectKey, index) => {
          let agent = agents[objectKey];
          let occupied_slots = JSON.parse(agent.occupied_slots);
          let available_slots = JSON.parse(agent.available_slots);
          let compute_plugins = JSON.parse(agent.compute_plugins);
          ['cpu', 'mem'].forEach((slot) => { // Fallback routine when occupied slots are not present
            if (slot in occupied_slots === false) {
              occupied_slots[slot] = "0";
            }
          });
          if ('live_stat' in agent) {
            agents[objectKey].live_stat = JSON.parse(agent.live_stat);
          }
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
          if ('cuda' in compute_plugins) {
            let cuda_plugin = compute_plugins['cuda'];
            agents[objectKey].cuda_plugin = cuda_plugin;
          }
          if ('live_stat' in agents[objectKey] && 'devices' in agents[objectKey].live_stat && 'cpu_util' in agents[objectKey].live_stat.devices) {
            let cpu_util: Array<any> = [];
            Object.entries(agents[objectKey].live_stat.devices.cpu_util).forEach(([k, v]) => {
              let agentInfo = Object.assign({}, v, {num: k});
              cpu_util.push(agentInfo);
            });
            agents[objectKey].cpu_util_live = cpu_util;
          }
          if ('live_stat' in agents[objectKey] && 'devices' in agents[objectKey].live_stat && 'cuda_util' in agents[objectKey].live_stat.devices) {
            let cuda_util: Array<any> = [];
            Object.entries(agents[objectKey].live_stat.devices.cuda_util).forEach(([k, v]) => {
              let agentInfo = Object.assign({}, v, {num: k});
              cuda_util.push(agentInfo);
            });
            agents[objectKey].cuda_util_live = cuda_util;
          }
          if ('live_stat' in agents[objectKey] && 'devices' in agents[objectKey].live_stat && 'cuda_mem' in agents[objectKey].live_stat.devices) {
            let cuda_mem: Array<any> = [];
            Object.entries(agents[objectKey].live_stat.devices.cuda_mem).forEach(([k, v]) => {
              let agentInfo = Object.assign({}, v, {num: k});
              cuda_mem.push(agentInfo);
            });
            agents[objectKey].cuda_mem_live = cuda_mem;
          }
          if ('live_stat' in agents[objectKey] && 'devices' in agents[objectKey].live_stat && 'rocm_util' in agents[objectKey].live_stat.devices) {
            let rocm_util: Array<any> = [];
            Object.entries(agents[objectKey].live_stat.devices.rocm_util).forEach(([k, v]) => {
              let agentInfo = Object.assign({}, v, {num: k});
              rocm_util.push(agentInfo);
            });
            agents[objectKey].rocm_util_live = rocm_util;
          }
          if ('live_stat' in agents[objectKey] && 'devices' in agents[objectKey].live_stat && 'rocm_mem' in agents[objectKey].live_stat.devices) {
            let rocm_mem: Array<any> = [];
            Object.entries(agents[objectKey].live_stat.devices.rocm_mem).forEach(([k, v]) => {
              let agentInfo = Object.assign({}, v, {num: k});
              rocm_mem.push(agentInfo);
            });
            agents[objectKey].rocm_mem_live = rocm_mem;
          }
          if ('live_stat' in agents[objectKey] && 'devices' in agents[objectKey].live_stat && 'tpu_util' in agents[objectKey].live_stat.devices) {
            let tpu_util: Array<any> = [];
            Object.entries(agents[objectKey].live_stat.devices.tpu_util).forEach(([k, v]) => {
              let agentInfo = Object.assign({}, v, {num: k});
              tpu_util.push(agentInfo);
            });
            agents[objectKey].tpu_util_live = tpu_util;
          }
          if ('live_stat' in agents[objectKey] && 'devices' in agents[objectKey].live_stat && 'tpu_mem' in agents[objectKey].live_stat.devices) {
            let tpu_mem: Array<any> = [];
            Object.entries(agents[objectKey].live_stat.devices.tpu_mem).forEach(([k, v]) => {
              let agentInfo = Object.assign({}, v, {num: k});
              tpu_mem.push(agentInfo);
            });
            agents[objectKey].tpu_mem_live = tpu_mem;
          }

          this.agentsObject[agents[objectKey]['id']] = agents[objectKey];
        });
      }
      this.agents = agents;
      if (this.agentDetailDialog.open) { // refresh the data
        this.agentDetail = this.agentsObject[this.agentDetail['id']];
        this.agentDetailDialog.updateComplete;
      }

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

  /**
   * Check currecnt condition is running.
   */
  _isRunning() {
    return this.condition === 'running';
  }

  /**
   * Convert the value byte to MB.
   *
   * @param {number} value
   */
  _byteToMB(value) {
    return Math.floor(value / 1000000);
  }

  /**
   * Convert the value MB to GB.
   *
   * @param {number} value
   */
  _MBtoGB(value) {
    return Math.floor(value / 1024);
  }

  /**
   * Return backend.ai client elapsed time.
   *
   * @param {Date} start - Start time of backend.ai client.
   * @param {Date} end - End time of backend.ai client.
   */
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

  /**
   * Covert start date to human readable date.
   *
   * @param {Date} start
   */
  _humanReadableDate(start) {
    let d = new Date(start);
    return d.toLocaleString();
  }

  /**
   * Increase index by 1.
   *
   * @param {number} index
   */
  _indexFrom1(index: number) {
    return index + 1;
  }

  /**
   * Return the heartbeat status.
   *
   * @param {string} state
   */
  _heartbeatStatus(state: string) {
    return state;
  }

  /**
   * Change heartbeat color according to heartbeat status.
   *
   * @param {string} state
   */
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

  /**
   * Render an index.
   *
   * @param {DOM element} root
   * @param {<vaadin-grid-column> element} column
   * @param {object} rowData
   */
  _indexRenderer(root, column, rowData) {
    let idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  /**
   * Render regions by platforms and locations.
   *
   * @param {DOM element} root
   * @param {<vaadin-grid-column> element} column
   * @param {object} rowData
   */
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
      case "amazon":
        color = 'orange';
        icon = 'aws';
        break;
      case "azure":
        color = 'blue';
        icon = 'azure';
        break;
      case "gcp":
      case "google":
        color = 'lightblue';
        icon = 'gcp';
        break;
      case "nbp":
      case "naver":
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
                          description="${platform}" ui="round"></lablup-shields>
        </div>
    `, root
    );
  }

  /**
   * Return elapsed time
   *
   * @param {any} start - start time
   * @param {any} end - end time
   * */
  _elapsed2(start, end) {
    return globalThis.backendaiclient.utils.elapsedTime(start, end);
  }

  /**
   * Render a first contact date.
   *
   * @param {DOM element} root
   * @param {<vaadin-grid-column> element} column
   * @param {object} rowData
   */
  contactDateRenderer(root, column?, rowData?) {
    let elapsed: Date;
    if (rowData.item.status === 'TERMINATED' && 'lost_at' in rowData.item) {
      elapsed = this._elapsed2(rowData.item.lost_at, Date.now());
      render(
        // language=HTML
        html`
          <div class="layout vertical">
            <span>${this._humanReadableDate(rowData.item.first_contact)}</span>
            <lablup-shields app="${_t('agent.Terminated')}" color="yellow"
                            description="${elapsed}" ui="round"></lablup-shields>

          </div>`, root
      );
    } else {
      elapsed = this._elapsed2(rowData.item.first_contact, Date.now());
      render(
        // language=HTML
        html`
          <div class="layout vertical">
            <span>${this._humanReadableDate(rowData.item.first_contact)}</span>
            <lablup-shields app="${_t('agent.Running')}" color="darkgreen"
                            description="${elapsed}" ui="round"></lablup-shields>

          </div>`, root
      );
    }
  }

  /**
   * Render a resource.
   *
   * @param {DOM element} root
   * @param {<vaadin-grid-column> element} column
   * @param {object} rowData
   */
  resourceRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout flex">
          <div class="layout horizontal center flex">
            <div class="layout horizontal start resource-indicator">
              <wl-icon class="fg green">developer_board</wl-icon>
              <span style="padding-left:5px;">${rowData.item.cpu_slots}</span>
              <span class="indicator">${_t("general.cores")}</span>
            </div>
            <span class="flex"></span>
            <lablup-progress-bar id="cpu-usage-bar" progress="${rowData.item.cpu_current_usage_ratio}"
                            buffer="${rowData.item.cpu_total_usage_ratio}"
                            description="${rowData.item.current_cpu_percent}%"></lablup-progress-bar>
          </div>
          <div class="layout horizontal center flex">
            <div class="layout horizontal start resource-indicator">
              <wl-icon class="fg green">memory</wl-icon>
              <span style="padding-left:5px;">${rowData.item.mem_slots}</span>
              <span class="indicator">GB</span>
            </div>
            <span class="flex"></span>
            <lablup-progress-bar id="mem-usage-bar" progress="${rowData.item.mem_current_usage_ratio}"
                            buffer="${rowData.item.mem_total_usage_ratio}"
                            description="${rowData.item.current_mem}GB"></lablup-progress-bar>

          </div>
          ${rowData.item.cuda_gpu_slots ? html`
            <div class="layout horizontal center flex">
              <div class="layout horizontal start resource-indicator">
                <img class="indicator-icon fg green" src="/resources/icons/file_type_cuda.svg" />
                <span style="padding-left:5px;">${rowData.item.cuda_gpu_slots}</span>
                <span class="indicator">GPU</span>
              </div>
              <span class="flex"></span>
              <lablup-progress-bar id="gpu-bar" progress="${rowData.item.used_cuda_gpu_slots_ratio}"
                              description="${rowData.item.used_cuda_gpu_slots}"></lablup-progress-bar>
            </div>
            ` : html``}
          ${rowData.item.cuda_fgpu_slots ? html`
            <div class="layout horizontal center flex">
              <div class="layout horizontal start resource-indicator">
                <img class="indicator-icon fg green" src="/resources/icons/file_type_cuda.svg" />
                <span style="padding-left:5px;">${rowData.item.cuda_fgpu_slots}</span>
                <span class="indicator">fGPU</span>
              </div>
              <span class="flex"></span>
              <lablup-progress-bar id="vgpu-bar" progress="${rowData.item.used_cuda_fgpu_slots_ratio}"
                              description="${rowData.item.used_cuda_fgpu_slots}"></lablup-progress-bar>
\            </div>
            ` : html``}
          ${rowData.item.rocm_gpu_slots ? html`
            <div class="layout horizontal center flex">
              <div class="layout horizontal start resource-indicator">
                <img class="indicator-icon fg green" src="/resources/icons/ROCm.png" />
                <span style="padding-left:5px;">${rowData.item.rocm_gpu_slots}</span>
                <span class="indicator">ROCm</span>
              </div>
              <span class="flex"></span>
              <lablup-progress-bar id="rocm-gpu-bar" progress="${rowData.item.used_rocm_gpu_slots_ratio}"
                                description="${rowData.item.used_rocm_gpu_slots}"></lablup-progress-bar>
            </div>
            ` : html``}
          ${rowData.item.tpu_slots ? html`
            <div class="layout horizontal center flex">
              <div class="layout horizontal start resource-indicator">
                <img class="indicator-icon fg green" src="/resources/icons/tpu.svg" />
                <span style="padding-left:5px;">${rowData.item.tpu_slots}</span>
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
   * Render a heartbeat status.
   *
   * @param {DOM element} root
   * @param {<vaadin-grid-column> element} column
   * @param {object} rowData
   */
  statusRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout vertical start justified wrap">
          <lablup-shields app="Agent" color="${this._heartbeatColor(rowData.item.status)}"
                          description="${rowData.item.version}" ui="flat"></lablup-shields>
          ${rowData.item.cuda_plugin ? html`
          <lablup-shields app="CUDA Plugin" color="blue"
                          description="${rowData.item.cuda_plugin['version']}" ui="flat"></lablup-shields>
        ${rowData.item.cuda_fgpu_slots ? html`
          <lablup-shields app="" color="blue"
                          description="Fractional GPU™" ui="flat"></lablup-shields>
        ` : html``}
          ${'cuda_version' in rowData.item.cuda_plugin ? html`
          <lablup-shields app="CUDA" color="green"
                          description="${rowData.item.cuda_plugin['cuda_version']}" ui="flat"></lablup-shields>`
        : html`          <lablup-shields app="CUDA Disabled" color="green"
                          description="" ui="flat"></lablup-shields>`}` : html``}

        </div>`, root
    );
  }

  /**
   * Show detailed agent information as dialog form.
   *
   * @param {DOM element} root
   * @param {<vaadin-grid-column> element} column
   * @param {object} rowData
   */
  showAgentDetailDialog(agentId) {
    this.agentDetail = this.agentsObject[agentId];
    this.agentDetailDialog.show();
    return;
  }

  /**
   * Render control buttons such as assignment, build, add an alarm, pause and delete.
   *
   * @param {DOM element} root
   * @param {<vaadin-grid-column> element} column
   * @param {object} rowData
   */
  controlRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div id="controls" class="layout horizontal flex center" agent-id="${rowData.item.addr}">
          <mwc-icon-button class="fg blue controls-running" icon="assignment" @click="${(e) => this.showAgentDetailDialog(rowData.item.id)}"></mwc-icon-button>
          ${this._isRunning() ? html`
            <mwc-icon-button class="temporarily-hide" disabled class="fg controls-running" icon="build"></mwc-icon-button>
            <mwc-icon-button class="temporarily-hide" disabled class="fg controls-running" icon="alarm"></mwc-icon-button>
            <mwc-icon-button class="temporarily-hide" disabled class="fg controls-running" icon="pause"></mwc-icon-button>
            <mwc-icon-button class="temporarily-hide" disabled class="fg controls-running" icon="delete"></mwc-icon-button>
          ` : html``}
    </div>`, root
    );
  }

  _bytesToMB(value) {
    return Number(value / (1024 * 1024)).toFixed(1);
  }

  render() {
    // language=HTML
    return html`
      <vaadin-grid class="${this.condition}" theme="row-stripes column-borders compact" aria-label="Job list" .items="${this.agents}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center" .renderer="${this._indexRenderer}"></vaadin-grid-column>
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

        <vaadin-grid-column resizable width="140px" header="${_t("agent.Resources")}" .renderer="${this._boundResourceRenderer}">
        </vaadin-grid-column>
        <vaadin-grid-sort-column width="100px" resizable path="scaling_group" header="${_t("general.ResourceGroup")}"></vaadin-grid-sort-column>
        <vaadin-grid-column width="130px" flex-grow="0" resizable header="${_t("agent.Status")}" .renderer="${this._boundStatusRenderer}"></vaadin-grid-column>
        <vaadin-grid-column resizable header="${_t("general.Control")}" .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-dialog id="agent-detail" fixed backdrop blockscrolling persistent scrollable>
        <span slot="title">${_t("agent.DetailedInformation")}</span>
        <div slot="content">
          <div class="horizontal start start-justified layout">
          ${'cpu_util_live' in this.agentDetail ?
      html`<div>
              <h3>CPU</h3>
            ${this.agentDetail.cpu_util_live.map(item => html`
              <div class="horizontal start-justified center layout">
                <div style="font-size:8px;width:35px;">CPU${item.num}</div>
                <lablup-progress-bar class="cpu"
                  progress="${item.pct / 100.0}"
                  description=""
                ></lablup-progress-bar>
              </div>`)}
            </div>` : html``}
            <div style="margin-left:10px;">
              <h3>Memory</h3>
              <div>
                <lablup-progress-bar class="mem"
                  progress="${this.agentDetail.mem_current_usage_ratio}"
                  description="${this.agentDetail.current_mem}GB/${this.agentDetail.mem_slots}GB"
                ></lablup-progress-bar>
              </div>
              <h3>Network</h3>
              ${'live_stat' in this.agentDetail && 'node' in this.agentDetail.live_stat ? html`
              <div>TX: ${this._bytesToMB(this.agentDetail.live_stat.node.net_tx.current)}MB</div>
              <div>RX: ${this._bytesToMB(this.agentDetail.live_stat.node.net_rx.current)}MB</div>
              ` : html``}
            </div>
          ${'cuda_util_live' in this.agentDetail ?
      html`<div style="margin-left:10px;">
              <h3>CUDA Devices</h3>
              <h4>Utilization</h4>
            ${this.agentDetail.cuda_util_live.map(item => html`
              <div class="horizontal start-justified center layout">
                <div style="font-size:8px;width:35px;">CUDA${item.num}</div>
                <div class="horizontal start-justified center layout">
                  <lablup-progress-bar class="cuda"
                    progress="${item.pct / 100.0}"
                    description=""
                  ></lablup-progress-bar>
                </div>
              </div>`)}
              <h4>Memory</h4>
            ${this.agentDetail.cuda_mem_live.map(item => html`
              <div class="horizontal start-justified center layout">
                <div style="font-size:8px;width:35px;">CUDA${item.num}</div>
                <div class="horizontal start-justified center layout">
                  <lablup-progress-bar class="cuda"
                    progress="${item.pct / 100.0}"
                    description=""
                  ></lablup-progress-bar>
                </div>
              </div>`)}

            </div>` : html``}
          ${'rocm_util_live' in this.agentDetail ?
      html`<div style="margin-left:10px;">
              <h3>ROCm Devices</h3>
              <h4>Utilization</h4>
            ${this.agentDetail.rocm_util_live.map(item => html`
              <div class="horizontal start-justified center layout">
                <div style="font-size:8px;width:35px;">ROCm${item.num}</div>
                <div class="horizontal start-justified center layout">
                  <lablup-progress-bar class="cuda"
                    progress="${item.pct / 100.0}"
                    description=""
                  ></lablup-progress-bar>
                </div>
              </div>`)}
              <h4>Memory</h4>
            ${this.agentDetail.rocm_mem_live.map(item => html`
              <div class="horizontal start-justified center layout">
                <div style="font-size:8px;width:35px;">ROCm${item.num}</div>
                <div class="horizontal start-justified center layout">
                  <lablup-progress-bar class="cuda"
                    progress="${item.pct / 100.0}"
                    description=""
                  ></lablup-progress-bar>
                </div>
              </div>`)}

            </div>` : html``}
          ${'tpu_util_live' in this.agentDetail ?
      html`<div style="margin-left:10px;">
              <h3>TPU Devices</h3>
              <h4>Utilization</h4>
            ${this.agentDetail.tpu_util_live.map(item => html`
              <div class="horizontal start-justified center layout">
                <div style="font-size:8px;width:35px;">TPU${item.num}</div>
                <div class="horizontal start-justified center layout">
                  <lablup-progress-bar class="cuda"
                    progress="${item.pct / 100.0}"
                    description=""
                  ></lablup-progress-bar>
                </div>
              </div>`)}
              <h4>Memory</h4>
            ${this.agentDetail.tpu_mem_live.map(item => html`
              <div class="horizontal start-justified center layout">
                <div style="font-size:8px;width:35px;">TPU${item.num}</div>
                <div class="horizontal start-justified center layout">
                  <lablup-progress-bar class="cuda"
                    progress="${item.pct / 100.0}"
                    description=""
                  ></lablup-progress-bar>
                </div>
              </div>`)}

            </div>` : html``}
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
              unelevated
              id="close-button"
              icon="check"
              label="${_t("button.Close")}"
              @click="${(e) => this._hideDialog(e)}"></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-agent-list": BackendAIAgentList;
  }
}
