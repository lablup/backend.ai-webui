/**
 @license
 Copyright (c) 2015-2024 Lablup Inc. All rights reserved.
 */
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
} from '../plastics/layout/iron-flex-layout-classes';
import BackendAIDialog from './backend-ai-dialog';
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
import { Switch } from '@material/mwc-switch';
import '@vaadin/grid/vaadin-grid';
import '@vaadin/grid/vaadin-grid-column';
import '@vaadin/grid/vaadin-grid-sort-column';
import { css, CSSResultGroup, html, render } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/**
 Backend.AI Agent List

 Example:

 <backend-ai-agent-list active=true>
 ... content ...
 </backend-ai-agent-list>

 @group Backend.AI Web UI
 @element backend-ai-agent-list
 */

/* Custom type for live stat of agent node
 *  - cpu_util
 *  - mem_util
 *  - cuda_util (optional)
 *  - cuda_mem (optional)
 */
type LiveStat = {
  cpu_util: {
    capacity: number;
    current: number;
    ratio: number;
  };
  mem_util: {
    capacity: number;
    current: number;
    ratio: number;
  };
  cuda_util?: {
    // optional
    capacity: number;
    current: number;
    ratio: number;
  };
  cuda_mem?: {
    // optional
    capacity: number;
    current: number;
    ratio: number;
  };
};

@customElement('backend-ai-agent-list')
export default class BackendAIAgentList extends BackendAIPage {
  private _enableAgentSchedulable = false;

  @property({ type: String }) condition = 'running';
  @property({ type: String }) list_condition = 'loading';
  @property({ type: Boolean }) useHardwareMetadata = false;
  @property({ type: Array }) agents = [];
  @property({ type: Object }) agentsObject = Object();
  @property({ type: Object }) agentDetail = Object();
  @property({ type: Object }) notification = Object();
  @property({ type: Boolean }) enableAgentSchedulable = false;
  @property({ type: Object }) _boundEndpointRenderer =
    this.endpointRenderer.bind(this);
  @property({ type: Object }) _boundRegionRenderer =
    this.regionRenderer.bind(this);
  @property({ type: Object }) _boundContactDateRenderer =
    this.contactDateRenderer.bind(this);
  @property({ type: Object }) _boundResourceRenderer =
    this.resourceRenderer.bind(this);
  @property({ type: Object }) _boundUtilizationRenderer =
    this.utilizationRenderer.bind(this);
  @property({ type: Object }) _boundDiskRenderer = this.diskRenderer.bind(this);
  @property({ type: Object }) _boundStatusRenderer =
    this.statusRenderer.bind(this);
  @property({ type: Object }) _boundControlRenderer =
    this.controlRenderer.bind(this);
  @property({ type: Object }) _boundSchedulableRenderer =
    this.schedulableRenderer.bind(this);
  @property({ type: String }) filter = '';
  @query('#agent-detail') agentDetailDialog!: BackendAIDialog;
  @query('#agent-setting') agentSettingDialog!: BackendAIDialog;
  @query('#schedulable-switch') schedulableToggle!: Switch;
  @property({ type: String }) listCondition: StatusCondition = 'loading';
  @query('vaadin-grid') private _agentGrid;
  @query('#list-status') private _listStatus!: BackendAIListStatus;

  static get styles(): CSSResultGroup {
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
          --progress-bar-width: 85px;
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
          height: calc(100vh - 182px);
        }
      `,
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
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
   */
  _loadAgentList() {
    if (this.active !== true) {
      return;
    }
    this.listCondition = 'loading';
    this._listStatus?.show();
    let fields: Array<string>;
    let status;
    switch (this.condition) {
      case 'running':
        status = 'ALIVE';
        fields = [
          'id',
          'status',
          'version',
          'addr',
          'architecture',
          'region',
          'compute_plugins',
          'first_contact',
          'lost_at',
          'status_changed',
          'live_stat',
          'cpu_cur_pct',
          'mem_cur_bytes',
          'available_slots',
          'occupied_slots',
          'scaling_group',
        ];
        break;
      case 'terminated':
        status = 'TERMINATED';
        fields = [
          'id',
          'status',
          'version',
          'addr',
          'architecture',
          'region',
          'compute_plugins',
          'first_contact',
          'lost_at',
          'status_changed',
          'cpu_cur_pct',
          'mem_cur_bytes',
          'available_slots',
          'occupied_slots',
          'scaling_group',
        ];
        break;
      case 'archived':
      default:
        status = 'ALIVE';
        fields = [
          'id',
          'status',
          'version',
          'addr',
          'architecture',
          'region',
          'compute_plugins',
          'first_contact',
          'lost_at',
          'status_changed',
          'cpu_cur_pct',
          'mem_cur_bytes',
          'available_slots',
          'occupied_slots',
          'scaling_group',
        ];
    }
    if (
      this.useHardwareMetadata &&
      globalThis.backendaiclient.supports('hardware-metadata')
    ) {
      fields.push('hardware_metadata');
    }

    if (globalThis.backendaiclient.supports('schedulable')) {
      fields.push('schedulable');
    }

    const timeout = 10 * 1000;
    globalThis.backendaiclient.agent
      .list(status, fields, timeout)
      .then((response) => {
        const agents = response.agents;
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
              const compute_plugins = JSON.parse(agent.compute_plugins);
              ['cpu', 'mem'].forEach((slot) => {
                // Fallback routine when occupied slots are not present
                if (slot in occupied_slots === false) {
                  occupied_slots[slot] = '0';
                }
              });
              if ('live_stat' in agent) {
                agents[objectKey].live_stat = JSON.parse(agent.live_stat);
              }
              agents[objectKey].cpu_slots = parseInt(available_slots.cpu);
              agents[objectKey].used_cpu_slots = parseInt(occupied_slots.cpu);

              if (agent.cpu_cur_pct !== null) {
                agents[objectKey].current_cpu_percent = agent.cpu_cur_pct;
                agents[objectKey].cpu_total_usage_ratio =
                  agents[objectKey].used_cpu_slots /
                  agents[objectKey].cpu_slots;
                agents[objectKey].cpu_current_usage_ratio =
                  agents[objectKey].current_cpu_percent /
                  agents[objectKey].cpu_slots /
                  100.0;
                agents[objectKey].current_cpu_percent =
                  agents[objectKey].current_cpu_percent.toFixed(2);
                agents[objectKey].total_cpu_percent = (
                  agents[objectKey].cpu_total_usage_ratio * 100
                ).toFixed(2);
              } else {
                agents[objectKey].current_cpu_percent = 0;
                agents[objectKey].cpu_total_usage_ratio = 0;
                agents[objectKey].cpu_current_usage_ratio = 0;
                agents[objectKey].total_cpu_percent = (
                  agents[objectKey].cpu_total_usage_ratio * 100
                ).toFixed(2);
              }
              if (agent.mem_cur_bytes !== null) {
                agents[objectKey].current_mem_bytes = agent.mem_cur_bytes;
              } else {
                agents[objectKey].current_mem_bytes = 0;
              }
              agents[objectKey].current_mem =
                globalThis.backendaiclient.utils.changeBinaryUnit(
                  agent.current_mem_bytes,
                  'g',
                );
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
              agents[objectKey].mem_current_usage_ratio =
                agents[objectKey].current_mem / agents[objectKey].mem_slots;
              agents[objectKey].current_mem =
                agents[objectKey].current_mem.toFixed(2);
              agents[objectKey].total_mem_percent = (
                agents[objectKey].mem_total_usage_ratio * 100
              ).toFixed(2);

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
                ).toFixed(2);
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
                ).toFixed(2);
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
                ).toFixed(2);
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
                ).toFixed(2);
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
                ).toFixed(2);
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
                ).toFixed(2);
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
                ).toFixed(2);
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
                ).toFixed(2);
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
                ).toFixed(2);
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
                ).toFixed(2);
              }

              if ('cuda' in compute_plugins) {
                const cuda_plugin = compute_plugins['cuda'];
                agents[objectKey].cuda_plugin = cuda_plugin;
              }
              if (agents[objectKey].live_stat?.devices?.cpu_util) {
                const cpu_util: Array<any> = [];
                Object.entries(
                  agents[objectKey].live_stat.devices.cpu_util,
                ).forEach(([k, v]) => {
                  const agentInfo = Object.assign({}, v, { num: k });
                  cpu_util.push(agentInfo);
                });
                agents[objectKey].cpu_util_live = cpu_util;
              }
              if (agents[objectKey].live_stat?.devices?.cuda_util) {
                const cuda_util: Array<any> = [];
                let i = 1;
                Object.entries(
                  agents[objectKey].live_stat.devices.cuda_util,
                ).forEach(([k, v]) => {
                  const agentInfo = Object.assign({}, v, { num: k, idx: i });
                  i = i + 1;
                  cuda_util.push(agentInfo);
                });
                agents[objectKey].cuda_util_live = cuda_util;
              }
              if (agents[objectKey].live_stat?.devices?.cuda_mem) {
                const cuda_mem: Array<any> = [];
                let i = 1;
                Object.entries(
                  agents[objectKey].live_stat.devices.cuda_mem,
                ).forEach(([k, v]) => {
                  const agentInfo = Object.assign({}, v, { num: k, idx: i });
                  i = i + 1;
                  cuda_mem.push(agentInfo);
                });
                agents[objectKey].cuda_mem_live = cuda_mem;
              }
              if (agents[objectKey].live_stat?.devices?.rocm_util) {
                const rocm_util: Array<any> = [];
                let i = 1;
                Object.entries(
                  agents[objectKey].live_stat.devices.rocm_util,
                ).forEach(([k, v]) => {
                  const agentInfo = Object.assign({}, v, { num: k, idx: i });
                  i = i + 1;
                  rocm_util.push(agentInfo);
                });
                agents[objectKey].rocm_util_live = rocm_util;
              }
              if (agents[objectKey].live_stat?.devices?.rocm_mem) {
                const rocm_mem: Array<any> = [];
                let i = 1;
                Object.entries(
                  agents[objectKey].live_stat.devices.rocm_mem,
                ).forEach(([k, v]) => {
                  const agentInfo = Object.assign({}, v, { num: k, idx: i });
                  i = i + 1;
                  rocm_mem.push(agentInfo);
                });
                agents[objectKey].rocm_mem_live = rocm_mem;
              }
              if (agents[objectKey].live_stat?.devices?.tpu_util) {
                const tpu_util: Array<any> = [];
                let i = 1;
                Object.entries(
                  agents[objectKey].live_stat.devices.tpu_util,
                ).forEach(([k, v]) => {
                  const agentInfo = Object.assign({}, v, { num: k, idx: i });
                  i = i + 1;
                  tpu_util.push(agentInfo);
                });
                agents[objectKey].tpu_util_live = tpu_util;
              }
              if (agents[objectKey].live_stat?.devices?.tpu_mem) {
                const tpu_mem: Array<any> = [];
                let i = 1;
                Object.entries(
                  agents[objectKey].live_stat.devices.tpu_mem,
                ).forEach(([k, v]) => {
                  const agentInfo = Object.assign({}, v, { num: k, idx: i });
                  i = i + 1;
                  tpu_mem.push(agentInfo);
                });
                agents[objectKey].tpu_mem_live = tpu_mem;
              }
              if (agents[objectKey].live_stat?.devices?.ipu_util) {
                const ipu_util: Array<any> = [];
                let i = 1;
                Object.entries(
                  agents[objectKey].live_stat.devices.ipu_util,
                ).forEach(([k, v]) => {
                  const agentInfo = Object.assign({}, v, { num: k, idx: i });
                  i = i + 1;
                  ipu_util.push(agentInfo);
                });
                agents[objectKey].ipu_util_live = ipu_util;
              }
              if (agents[objectKey].live_stat?.devices?.ipu_mem) {
                const ipu_mem: Array<any> = [];
                let i = 1;
                Object.entries(
                  agents[objectKey].live_stat.devices.ipu_mem,
                ).forEach(([k, v]) => {
                  const agentInfo = Object.assign({}, v, { num: k, idx: i });
                  i = i + 1;
                  ipu_mem.push(agentInfo);
                });
                agents[objectKey].ipu_mem_live = ipu_mem;
              }
              if (agents[objectKey].live_stat?.devices?.atom_util) {
                const atom_util: Array<any> = [];
                let i = 1;
                Object.entries(
                  agents[objectKey].live_stat.devices.atom_util,
                ).forEach(([k, v]) => {
                  const agentInfo = Object.assign({}, v, { num: k, idx: i });
                  i = i + 1;
                  atom_util.push(agentInfo);
                });
                agents[objectKey].atom_util_live = atom_util;
              }
              if (agents[objectKey].live_stat?.devices?.atom_mem) {
                const atom_mem: Array<any> = [];
                let i = 1;
                Object.entries(
                  agents[objectKey].live_stat.devices.atom_mem,
                ).forEach(([k, v]) => {
                  const agentInfo = Object.assign({}, v, { num: k, idx: i });
                  i = i + 1;
                  atom_mem.push(agentInfo);
                });
                agents[objectKey].atom_mem_live = atom_mem;
              }

              if ('hardware_metadata' in agent) {
                agents[objectKey].hardware_metadata = JSON.parse(
                  agent.hardware_metadata,
                );
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

        if (this.agents.length == 0) {
          this.listCondition = 'no-data';
        } else {
          this._listStatus?.hide();
        }
        if (this.agentDetailDialog.open) {
          // refresh the data
          this.agentDetail = this.agentsObject[this.agentDetail['id']];
          this.agentDetailDialog.updateComplete;
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
   * Return backend.ai client elapsed time.
   *
   * @param {Date} start - Start time of backend.ai client.
   * @param {Date} end - End time of backend.ai client.
   * @return {number | string} Elasped time with guide text.
   */
  _elapsed(start, end) {
    const startDate = new Date(start);
    let endDate: Date;
    if (this.condition === 'running') {
      endDate = new Date();
    } else {
      endDate = new Date(end);
    }
    const seconds = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 1000,
    );
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
   * @return {string} Human-readable date string.
   */
  _humanReadableDate(start) {
    const d = new Date(start);
    return d.toLocaleString();
  }

  /**
   * Increase index by 1.
   *
   * @param {number} index
   * @return {number} index + 1 (for table index)
   */
  _indexFrom1(index: number) {
    return index + 1;
  }

  /**
   * Return the heartbeat status.
   *
   * @param {string} state
   * @return {string} state
   */
  _heartbeatStatus(state: string) {
    return state;
  }

  /**
   * Change heartbeat color according to heartbeat status.
   *
   * @param {string} state
   * @return {string} color of state. 'gree' if ALIVE, 'red' if TERMINATED. 'blue' for other states
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
   * Render regions by platforms and locations.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  regionRenderer(root, column?, rowData?) {
    let platform: string;
    let location: string;
    let color: string;
    let icon: string;
    const regionData = rowData.item.region.split('/');
    if (regionData.length > 1) {
      platform = regionData[0];
      location = regionData[1];
    } else {
      platform = regionData[0];
      location = '';
    }
    switch (platform) {
      case 'aws':
      case 'amazon':
        color = 'orange';
        icon = 'aws';
        break;
      case 'azure':
        color = 'blue';
        icon = 'azure';
        break;
      case 'gcp':
      case 'google':
        color = 'lightblue';
        icon = 'gcp';
        break;
      case 'nbp':
      case 'naver':
        color = 'green';
        icon = 'nbp';
        break;
      case 'openstack':
        color = 'red';
        icon = 'openstack';
        break;
      case 'dgx':
        color = 'green';
        icon = 'local';
        break;
      case 'local':
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
        <div class="horizontal start-justified center layout wrap">
          <img
            class="platform-icon"
            src="/resources/icons/${icon}.png"
            style="width:32px;height:32px;${this.isDarkMode && icon === 'local'
              ? 'filter:invert(1);'
              : ''}"
          />
          <lablup-shields
            app="${location}"
            color="${color}"
            description="${platform}"
            ui="round"
          ></lablup-shields>
        </div>
      `,
      root,
    );
  }

  /**
   * Return elapsed time
   *
   * @param {any} start - start time
   * @param {any} end - end time
   * @return {any} elapsedTime text (lazy evaluation via backendaiclient.utils)
   * */
  _elapsed2(start, end) {
    return globalThis.backendaiclient.utils.elapsedTime(start, end);
  }

  /**
   * Render a first contact date.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
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
            <lablup-shields
              app="${_t('agent.Terminated')}"
              color="yellow"
              description="${elapsed}"
              ui="round"
            ></lablup-shields>
          </div>
        `,
        root,
      );
    } else {
      elapsed = this._elapsed2(rowData.item.first_contact, Date.now());
      render(
        // language=HTML
        html`
          <div class="layout vertical">
            <span>${this._humanReadableDate(rowData.item.first_contact)}</span>
            <lablup-shields
              app="${_t('agent.Running')}"
              color="darkgreen"
              description="${elapsed}"
              ui="round"
            ></lablup-shields>
          </div>
        `,
        root,
      );
    }
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
                    description="${rowData.item.used_cuda_fgpu_slots}"
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
                    description="${rowData.item.used_rocm_gpu_slots}"
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
                    description="${rowData.item.used_tpu_slots}"
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
                      src="/resources/icons/ipu.svg"
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
                    description="${rowData.item.used_ipu_slots}"
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
                      src="/resources/icons/rebel.svg"
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
                    description="${rowData.item.used_atom_slots}"
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
                      src="/resources/icons/atom_plus.svg"
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
                    description="${rowData.item.used_atom_plus_slots}"
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
                      src="/resources/icons/gaudi2.svg"
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
                    description="${rowData.item.used_gaudi2_slots}"
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
                      src="/resources/icons/furiosa.svg"
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
                    description="${rowData.item.used_warboy_slots}"
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
                    description="${rowData.item.used_hyperaccel_lpu_slots}"
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

  utilizationRenderer(root, column?, rowData?) {
    if (rowData.item.status === 'ALIVE') {
      let liveStat: LiveStat = {
        cpu_util: { capacity: 0, current: 0, ratio: 0 },
        mem_util: { capacity: 0, current: 0, ratio: 0 },
      };
      if (rowData.item.live_stat?.node?.cuda_util) {
        liveStat = Object.assign(liveStat, {
          cuda_util: { capacity: 0, current: 0, ratio: 0 },
        });
        liveStat.cuda_util!.capacity = parseFloat(
          rowData.item.live_stat.node.cuda_util.capacity ?? 0,
        );
        liveStat.cuda_util!.current = parseFloat(
          rowData.item.live_stat.node.cuda_util.current,
        );
        // NOTE: cuda_util.capacity is reported as 0 from the server. In that case,
        //       we manually set it to 100 to properly display the GPU utilization.
        // liveStat.cuda_util!.ratio = (liveStat.cuda_util!.current / liveStat.cuda_util!.capacity ?? 100) || 0;
        // let cudaUtilCapacity;
        // if (!liveStat.cuda_util!.capacity || liveStat.cuda_util!.capacity === 0) {
        //   cudaUtilCapacity = 100;
        // } else {
        //   cudaUtilCapacity = liveStat.cuda_util!.capacity;
        // }
        // liveStat.cuda_util!.ratio = (liveStat.cuda_util!.current / cudaUtilCapacity) || 0;
        liveStat.cuda_util!.ratio = liveStat.cuda_util!.current / 100 || 0;
      }
      if (rowData.item.live_stat?.node?.cuda_mem) {
        liveStat = Object.assign(liveStat, {
          cuda_mem: { capacity: 0, current: 0, ratio: 0 },
        });
        liveStat.cuda_mem!.capacity = parseFloat(
          rowData.item.live_stat.node.cuda_mem.capacity ?? 0,
        );
        liveStat.cuda_mem!.current = parseFloat(
          rowData.item.live_stat.node.cuda_mem.current,
        );
        let cudaMemCapacity;
        if (!liveStat.cuda_mem!.capacity || liveStat.cuda_mem!.capacity === 0) {
          cudaMemCapacity = 100;
        } else {
          cudaMemCapacity = liveStat.cuda_mem!.capacity;
        }
        liveStat.cuda_mem!.ratio =
          liveStat.cuda_mem!.current / cudaMemCapacity || 0;
      }
      if (
        rowData.item.live_stat &&
        rowData.item.live_stat.node &&
        rowData.item.live_stat.devices
      ) {
        const numCores = Object.keys(
          rowData.item.live_stat.devices.cpu_util,
        ).length;
        liveStat.cpu_util.capacity = parseFloat(
          rowData.item.live_stat.node.cpu_util.capacity,
        );
        liveStat.cpu_util.current = parseFloat(
          rowData.item.live_stat.node.cpu_util.current,
        );
        liveStat.cpu_util.ratio =
          liveStat.cpu_util.current / liveStat.cpu_util.capacity / numCores ||
          0;
        liveStat.mem_util.capacity = parseInt(
          rowData.item.live_stat.node.mem.capacity,
        );
        liveStat.mem_util.current = parseInt(
          rowData.item.live_stat.node.mem.current,
        );
        liveStat.mem_util.ratio =
          liveStat.mem_util.current / liveStat.mem_util.capacity || 0;
      }
      render(
        // language=HTML
        html`
          <div>
            <div class="layout horizontal justified flex progress-bar-section">
              <span style="margin-right:5px;">CPU</span>
              <lablup-progress-bar
                class="utilization"
                progress="${liveStat.cpu_util.ratio}"
                description="${(liveStat.cpu_util?.ratio * 100).toFixed(1)} %"
              ></lablup-progress-bar>
            </div>
            <div class="layout horizontal justified flex progress-bar-section">
              <span style="margin-right:5px;">MEM</span>
              <lablup-progress-bar
                class="utilization"
                progress="${liveStat.mem_util.ratio}"
                description="${BackendAIAgentList.bytesToGiB(
                  liveStat.mem_util.current,
                )}/${BackendAIAgentList.bytesToGiB(
                  liveStat.mem_util.capacity,
                )} GiB"
              ></lablup-progress-bar>
            </div>
            ${liveStat.cuda_util
              ? html`
                  <div
                    class="layout horizontal justified flex progress-bar-section"
                  >
                    <span style="margin-right:5px;">GPU(util)</span>
                    <lablup-progress-bar
                      class="utilization"
                      progress="${liveStat.cuda_util?.ratio}"
                      description="${(liveStat.cuda_util?.ratio * 100).toFixed(
                        1,
                      )} %"
                    ></lablup-progress-bar>
                  </div>
                  <div
                    class="layout horizontal justified flex progress-bar-section"
                  >
                    <span style="margin-right:5px;">GPU(mem)</span>
                    <lablup-progress-bar
                      class="utilization"
                      progress="${liveStat.cuda_mem?.ratio || 0}"
                      description="${BackendAIAgentList.bytesToGiB(
                        liveStat.cuda_mem?.current,
                      )}/${BackendAIAgentList.bytesToGiB(
                        liveStat.cuda_mem?.capacity,
                      )} GiB"
                    ></lablup-progress-bar>
                  </div>
                `
              : html``}
          </div>
        `,
        root,
      );
    } else {
      render(
        // language=HTML
        html`
          ${_t('agent.NoAvailableLiveStat')}
        `,
        root,
      );
    }
  }

  /**
   * Render a disk occupancy.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  diskRenderer(root, column?, rowData?) {
    let pct;
    if (
      rowData.item.live_stat &&
      rowData.item.live_stat.node &&
      rowData.item.live_stat.node.disk
    ) {
      pct = parseFloat(rowData.item.live_stat.node.disk.pct || 0).toFixed(1);
    }
    render(
      html`
        ${pct
          ? html`
              <div class="indicator layout vertical center">
                ${pct > 80
                  ? html`
                      <lablup-progress-bar
                        class="utilization"
                        progress="${pct / 100 || 0}"
                        description="${pct} %"
                        style="margin-left:0;--progress-bar-background:var(--paper-red-500)"
                      ></lablup-progress-bar>
                    `
                  : html`
                      <lablup-progress-bar
                        class="utilization"
                        progress="${pct / 100 || 0}"
                        description="${pct} %"
                        style="margin-left:0;"
                      ></lablup-progress-bar>
                    `}
                <div style="margin-top:10px;">
                  ${globalThis.backendaiutils._humanReadableFileSize(
                    rowData.item.live_stat.node.disk.current,
                  )}
                  /
                  ${globalThis.backendaiutils._humanReadableFileSize(
                    rowData.item.live_stat.node.disk.capacity,
                  )}
                </div>
              </div>
            `
          : html`
              <span>-</span>
            `}
      `,
      root,
    );
  }

  /**
   * Render a heartbeat status.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  statusRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div class="layout vertical start justified wrap">
          <lablup-shields
            app="Agent"
            color="${this._heartbeatColor(rowData.item.status)}"
            description="${rowData.item.version}"
            ui="round"
          ></lablup-shields>
          ${rowData.item.cuda_plugin
            ? html`
                <lablup-shields
                  app="CUDA Plugin"
                  color="blue"
                  description="${rowData.item.cuda_plugin['version']}"
                  ui="round"
                ></lablup-shields>
                ${rowData.item.cuda_fgpu_slots
                  ? html`
                      <lablup-shields
                        app=""
                        color="blue"
                        description="Fractional GPU™"
                        ui="round"
                      ></lablup-shields>
                    `
                  : html``}
                ${rowData.item.cuda_plugin?.cuda_version
                  ? html`
                      <lablup-shields
                        app="CUDA"
                        color="green"
                        description="${rowData.item.cuda_plugin[
                          'cuda_version'
                        ]}"
                        ui="round"
                      ></lablup-shields>
                    `
                  : html`
                      <lablup-shields
                        app="CUDA Disabled"
                        color="green"
                        description=""
                        ui="flat"
                      ></lablup-shields>
                    `}
              `
            : html``}
        </div>
      `,
      root,
    );
  }

  /**
   * Show detailed agent information as dialog form.
   *
   * @param {string} agentId - ID of agent to show
   */
  showAgentDetailDialog(agentId) {
    this.agentDetail = this.agentsObject[agentId];
    this.agentDetailDialog.show();
    return;
  }

  /**
   * Render control buttons such as assignment, build, add an alarm, pause and delete.
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  controlRenderer(root, column?, rowData?) {
    render(
      // language=HTML
      html`
        <div
          id="controls"
          class="layout horizontal flex center"
          agent-id="${rowData.item.addr}"
        >
          <mwc-icon-button
            class="fg green controls-running"
            icon="assignment"
            @click="${() => this.showAgentDetailDialog(rowData.item.id)}"
          ></mwc-icon-button>
          ${this._isRunning()
            ? html`
                ${this._enableAgentSchedulable
                  ? html`
                      <mwc-icon-button
                        class="fg blue controls-running"
                        icon="settings"
                        @click="${() =>
                          this._showConfigDialog(rowData.item.id)}"
                      ></mwc-icon-button>
                    `
                  : html``}
                <mwc-icon-button
                  class="temporarily-hide fg green controls-running"
                  icon="refresh"
                  @click="${() => this._loadAgentList()}"
                ></mwc-icon-button>
                <mwc-icon-button
                  class="temporarily-hide fg controls-running"
                  disabled
                  icon="build"
                ></mwc-icon-button>
                <mwc-icon-button
                  class="temporarily-hide fg controls-running"
                  disabled
                  icon="alarm"
                ></mwc-icon-button>
                <mwc-icon-button
                  class="temporarily-hide fg controls-running"
                  disabled
                  icon="pause"
                ></mwc-icon-button>
                <mwc-icon-button
                  class="temporarily-hide fg controls-running"
                  disabled
                  icon="delete"
                ></mwc-icon-button>
              `
            : html``}
        </div>
      `,
      root,
    );
  }

  /**
   * Show configuration field of agent in dialog form.
   *
   * @param {string} agentId - ID of agent to configure
   */
  _showConfigDialog(agentId) {
    this.agentDetail = this.agentsObject[agentId];
    this.schedulableToggle.selected = this.agentDetail?.schedulable ?? false;
    this.agentSettingDialog.show();
    return;
  }

  /**
   * Convert the value bytes to MB
   *
   * @param {number} value
   * @return {number} converted value from bytes to MB
   */
  static bytesToMB(value) {
    return Number(value / 10 ** 6).toFixed(1);
  }

  /**
   * Convert the value bytes to GiB with decimal point to 2 as a default
   *
   * @param {number} value
   * @param {number} decimalPoint decimal point to show
   * @return {string} converted value from Bytes to GiB
   */
  static bytesToGiB(value, decimalPoint = 2) {
    if (!value) return value;
    return (value / 2 ** 30).toFixed(decimalPoint);
  }

  _modifyAgentSetting() {
    const schedulable = this.schedulableToggle.selected;
    if (this.agentDetail?.schedulable !== schedulable) {
      globalThis.backendaiclient.agent
        .update(this.agentDetail.id, { schedulable: schedulable })
        .then((res) => {
          this.notification.text = _text('agent.AgentSettingUpdated');
          this.notification.show();
          this.agentSettingDialog.hide();
          this._loadAgentList();
        })
        .catch((err) => {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.detail = err.message;
          this.notification.show(true, err);
        });
    } else {
      this.notification.text = _text('agent.NoChanges');
      this.notification.show();
      this.agentSettingDialog.hide();
    }
  }

  _renderAgentDetailDialog() {
    // language=HTML
    return html`
      <backend-ai-dialog
        id="agent-detail"
        fixed
        backdrop
        blockscrolling
        persistent
        scrollable
      >
        <span slot="title">${_t('agent.DetailedInformation')}</span>
        <div slot="content">
          <div class="horizontal start around-justified layout flex">
            ${this.agentDetail?.cpu_util_live
              ? html`
                  <div class="vertical layout start-justified flex">
                    <h3>CPU</h3>
                    ${this.agentDetail.cpu_util_live.map(
                      (item) => html`
                        <div
                          class="horizontal start-justified center layout"
                          style="padding:0 5px;"
                        >
                          <div class="agent-detail-title">CPU${item.num}</div>
                          <lablup-progress-bar
                            class="cpu"
                            progress="${item.pct / 100.0}"
                          ></lablup-progress-bar>
                        </div>
                      `,
                    )}
                  </div>
                `
              : html``}
            <div class="vertical layout start-justified flex">
              <h3>Memory</h3>
              <div>
                <lablup-progress-bar
                  class="mem"
                  progress="${this.agentDetail.mem_current_usage_ratio}"
                  description="${this.agentDetail.current_mem}GiB/${this
                    .agentDetail.mem_slots}GiB"
                ></lablup-progress-bar>
              </div>
              <h3>Network</h3>
              ${this.agentDetail?.live_stat?.node
                ? html`
                    <div
                      class="horizontal layout justified"
                      style="width:100px;"
                    >
                      <span>TX:</span>
                      <span>
                        ${BackendAIAgentList.bytesToMB(
                          this.agentDetail.live_stat.node.net_tx.current,
                        )}MiB
                      </span>
                    </div>
                    <div
                      class="horizontal layout justified flex"
                      style="width:100px;"
                    >
                      <span>RX:</span>
                      <span>
                        ${BackendAIAgentList.bytesToMB(
                          this.agentDetail.live_stat.node.net_rx.current,
                        )}MiB
                      </span>
                    </div>
                  `
                : html`
                    <p>${_t('agent.NoNetworkSignal')}</p>
                  `}
            </div>
            ${this.agentDetail?.cuda_util_live
              ? html`
                  <div class="vertical layout start-justified flex">
                    <h3>CUDA Devices</h3>
                    <h4>Utilization</h4>
                    ${this.agentDetail.cuda_util_live.map(
                      (item) => html`
                        <div class="horizontal start-justified center layout">
                          <div class="agent-detail-title">CUDA${item.idx}</div>
                          <div class="horizontal start-justified center layout">
                            <lablup-progress-bar
                              class="cuda"
                              progress="${item.pct / 100.0}"
                            ></lablup-progress-bar>
                          </div>
                        </div>
                      `,
                    )}
                    <h4>Memory</h4>
                    ${this.agentDetail.cuda_mem_live.map(
                      (item) => html`
                        <div class="horizontal start-justified center layout">
                          <div class="agent-detail-title">CUDA${item.idx}</div>
                          <div class="horizontal start-justified center layout">
                            <lablup-progress-bar
                              class="cuda"
                              progress="${item.pct / 100.0}"
                            ></lablup-progress-bar>
                          </div>
                        </div>
                      `,
                    )}
                  </div>
                `
              : html``}
            ${this.agentDetail?.rocm_util_live
              ? html`
                  <div class="vertical layout start-justified flex">
                    <h3>ROCm Devices</h3>
                    <h4>Utilization</h4>
                    ${this.agentDetail.rocm_util_live.map(
                      (item) => html`
                        <div class="horizontal start-justified center layout">
                          <div class="agent-detail-title">ROCm${item.num}</div>
                          <div class="horizontal start-justified center layout">
                            <lablup-progress-bar
                              class="cuda"
                              progress="${item.pct / 100.0}"
                            ></lablup-progress-bar>
                          </div>
                        </div>
                      `,
                    )}
                    <h4>Memory</h4>
                    ${this.agentDetail.rocm_mem_live.map(
                      (item) => html`
                        <div class="horizontal start-justified center layout">
                          <div class="agent-detail-title">ROCm${item.num}</div>
                          <div class="horizontal start-justified center layout">
                            <lablup-progress-bar
                              class="cuda"
                              progress="${item.pct / 100.0}"
                            ></lablup-progress-bar>
                          </div>
                        </div>
                      `,
                    )}
                  </div>
                `
              : html``}
            ${this.agentDetail?.tpu_util_live
              ? html`
                  <div class="vertical layout start-justified flex">
                    <h3>TPU Devices</h3>
                    <h4>Utilization</h4>
                    ${this.agentDetail.tpu_util_live.map(
                      (item) => html`
                        <div class="horizontal start-justified center layout">
                          <div class="agent-detail-title">TPU${item.num}</div>
                          <div class="horizontal start-justified center layout">
                            <lablup-progress-bar
                              class="cuda"
                              progress="${item.pct / 100.0}"
                            ></lablup-progress-bar>
                          </div>
                        </div>
                      `,
                    )}
                    <h4>Memory</h4>
                    ${this.agentDetail.tpu_mem_live.map(
                      (item) => html`
                        <div class="horizontal start-justified center layout">
                          <div class="agent-detail-title">TPU${item.num}</div>
                          <div class="horizontal start-justified center layout">
                            <lablup-progress-bar
                              class="cuda"
                              progress="${item.pct / 100.0}"
                            ></lablup-progress-bar>
                          </div>
                        </div>
                      `,
                    )}
                  </div>
                `
              : html``}
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
            unelevated
            icon="check"
            label="${_t('button.Close')}"
            @click="${(e) => this._hideDialog(e)}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }

  _renderAgentSettingDialog() {
    // language=HTML
    return html`
      <backend-ai-dialog
        id="agent-setting"
        fixed
        backdrop
        blockscrolling
        persistent
        scrollable
      >
        <span slot="title">${_t('agent.AgentSetting')}</span>
        <div slot="content" class="horizontal layout justified center">
          <span>${_t('agent.Schedulable')}</span>
          <mwc-switch
            id="schedulable-switch"
            ?selected="${this.agentDetail?.schedulable}"
          ></mwc-switch>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
            unelevated
            icon="check"
            label="${_t('button.Update')}"
            @click="${() => this._modifyAgentSetting()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
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
          multi-sort
          multi-sort-priority="append"
        >
          <vaadin-grid-column
            frozen
            width="30px"
            flex-grow="0"
            header="#"
            text-align="center"
            .renderer="${this._indexRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-sort-column
            frozen
            resizable
            width="100px"
            path="id"
            header="${_t('agent.Endpoint')}"
            .renderer="${this._boundEndpointRenderer}"
          ></vaadin-grid-sort-column>
          <vaadin-grid-column
            auto-width
            resizable
            header="${_t('agent.Region')}"
            .renderer="${(root, column, rowData) => {
              return this.regionRenderer(root, column, rowData);
            }}"
          ></vaadin-grid-column>
          <vaadin-grid-sort-column
            auto-width
            flex-grow="0"
            resizable
            path="architecture"
            header="${_t('agent.Architecture')}"
          ></vaadin-grid-sort-column>
          <vaadin-grid-sort-column
            resizable
            path="first_contact"
            auto-width
            flex-grow="0"
            header="${_t('agent.Starts')}"
            .renderer="${this._boundContactDateRenderer}"
          ></vaadin-grid-sort-column>
          <vaadin-grid-column
            resizable
            width="200px"
            header="${_t('agent.Allocation')}"
            .renderer="${this._boundResourceRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-column
            resizable
            width="185px"
            header="${_t('agent.Utilization')}"
            .renderer="${this._boundUtilizationRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-column
            resizable
            header="${_t('agent.DiskPerc')}"
            .renderer="${this._boundDiskRenderer}"
          ></vaadin-grid-column>
          <vaadin-grid-sort-column
            resizable
            auto-width
            flex-grow="0"
            path="scaling_group"
            header="${_t('general.ResourceGroup')}"
          ></vaadin-grid-sort-column>
          <vaadin-grid-column
            width="160px"
            flex-grow="0"
            resizable
            header="${_t('agent.Status')}"
            .renderer="${this._boundStatusRenderer}"
          ></vaadin-grid-column>
          ${this._enableAgentSchedulable
            ? html`
                <vaadin-grid-sort-column
                  auto-width
                  flex-grow="0"
                  resizable
                  path="schedulable"
                  header="${_t('agent.Schedulable')}"
                  .renderer="${this._boundSchedulableRenderer}"
                ></vaadin-grid-sort-column>
              `
            : html``}
          <vaadin-grid-column
            frozen-to-end
            auto-width
            flex-grow="0"
            header="${_t('general.Control')}"
            .renderer="${this._boundControlRenderer}"
          ></vaadin-grid-column>
        </vaadin-grid>
        <backend-ai-list-status
          id="list-status"
          statusCondition="${this.listCondition}"
          message="${_text('agent.NoAgentToDisplay')}"
        ></backend-ai-list-status>
      </div>
      ${this._renderAgentDetailDialog()} ${this._renderAgentSettingDialog()}
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-agent-list': BackendAIAgentList;
  }
}
