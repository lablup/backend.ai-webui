/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';
import {default as PainKiller} from "./backend-ai-painkiller";

@customElement("backend-ai-resource-broker")
export default class BackendAiResourceBroker extends BackendAIPage {
  @property({type: String}) direction = "horizontal";
  @property({type: String}) location = '';
  @property({type: Object}) supports = Object();
  @property({type: Object}) supportImages = Object();
  @property({type: Object}) resourceLimits = Object();
  @property({type: Object}) userResourceLimit = Object();
  @property({type: Object}) aliases = Object();
  @property({type: Object}) tags = Object();
  @property({type: Object}) icons = Object();
  @property({type: Object}) imageInfo = Object();
  @property({type: Object}) imageNames = Object();
  @property({type: Array}) versions;
  @property({type: Array}) languages;
  @property({type: Number}) marker_limit = 25;
  @property({type: String}) gpu_mode;
  @property({type: Array}) gpu_modes = [];
  @property({type: Number}) gpu_step = 0.05;
  @property({type: Object}) cpu_metric = {
    'min': '1',
    'max': '1'
  };
  @property({type: Object}) mem_metric = {
    'min': '1',
    'max': '1'
  };
  @property({type: Object}) shmem_metric = {
    'min': 0.0625,
    'max': 1,
    'preferred': 0.0625
  };
  @property({type: Object}) cuda_gpu_metric = {
    'min': 0,
    'max': 0
  };
  @property({type: Object}) cuda_fgpu_metric;
  @property({type: Object}) rocm_gpu_metric = {
    'min': '0',
    'max': '0'
  };
  @property({type: Object}) tpu_metric = {
    'min': '1',
    'max': '1'
  };
  @property({type: Object}) images;
  @property({type: String}) defaultResourcePolicy;
  @property({type: Object}) total_slot;
  @property({type: Object}) total_sg_slot;
  @property({type: Object}) total_pj_slot;
  @property({type: Object}) used_slot;
  @property({type: Object}) used_sg_slot;
  @property({type: Object}) used_pj_slot;
  @property({type: Object}) available_slot;
  @property({type: Number}) concurrency_used;
  @property({type: Number}) concurrency_max;
  @property({type: Number}) concurrency_limit;
  @property({type: Array}) vfolders;
  @property({type: Object}) used_slot_percent;
  @property({type: Object}) used_sg_slot_percent;
  @property({type: Object}) used_pj_slot_percent;
  @property({type: Array}) resource_templates;
  @property({type: Array}) resource_templates_filtered;
  @property({type: String}) default_language;
  @property({type: Number}) cpu_request;
  @property({type: Number}) mem_request;
  @property({type: Number}) shmem_request;
  @property({type: Number}) gpu_request;
  @property({type: Number}) session_request;
  @property({type: Boolean}) _status;
  @property({type: Number}) num_sessions;
  @property({type: String}) scaling_group;
  @property({type: Array}) scaling_groups;
  @property({type: Boolean}) enable_scaling_group;
  @property({type: Array}) sessions_list;
  @property({type: Boolean}) metric_updating;
  @property({type: Boolean}) metadata_updating;
  @property({type: Boolean}) aggregate_updating = false;
  @property({type: Object}) scaling_group_selection_box;
  @property({type: Object}) resourceGauge = Object();
  /* Parameters required to launch a session on behalf of other user */
  @property({type: Boolean}) ownerFeatureInitialized = false;
  @property({type: String}) ownerDomain = '';
  @property({type: Array}) ownerKeypairs;
  @property({type: Array}) ownerGroups;
  @property({type: Array}) ownerScalingGroups;
  @property({type: Boolean}) project_resource_monitor = false;
  @property({type: Object}) version_selector = Object();
  @property({type: Boolean}) _default_language_updated = false;
  @property({type: String}) _helpDescription = '';
  @property({type: String}) _helpDescriptionTitle = '';
  @property({type: String}) _helpDescriptionIcon = '';

  constructor() {
    super();
    this.active = false;
    this.ownerKeypairs = [];
    this.ownerGroups = [];
    this.ownerScalingGroups = [];
    this.init_resource();
  }

  static get is() {
    return 'backend-ai-resource-monitor';
  }

  static get styles() {
    return [];
  }

  init_resource() {
    this.versions = ['Not Selected'];
    this.languages = [];
    this.gpu_mode = 'no';
    this.defaultResourcePolicy = 'UNLIMITED';
    this.total_slot = {};
    this.total_sg_slot = {};
    this.total_pj_slot = {};
    this.used_slot = {};
    this.used_sg_slot = {};
    this.used_pj_slot = {};
    this.available_slot = {};
    this.used_slot_percent = {};
    this.used_sg_slot_percent = {};
    this.used_pj_slot_percent = {};
    this.resource_templates = [];
    this.resource_templates_filtered = [];
    this.vfolders = [];
    this.default_language = '';
    this.concurrency_used = 0;
    this.concurrency_max = 0;
    this.concurrency_limit = 0;
    this._status = 'inactive';
    this.cpu_request = 1;
    this.mem_request = 1;
    this.shmem_request = 0.0625;
    this.gpu_request = 0;
    this.session_request = 1;
    this.scaling_groups = [{name: ''}]; // if there is no scaling group, set the name as empty string
    this.scaling_group = '';
    this.enable_scaling_group = false;
    this.sessions_list = [];
    this.metric_updating = false;
    this.metadata_updating = false;
    /* Parameters required to launch a session on behalf of other user */
    this.ownerFeatureInitialized = false;
    this.ownerDomain = '';
    this.ownerKeypairs = [];
    this.ownerGroups = [];
    this.ownerScalingGroups = [];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    document.addEventListener('backend-ai-resource-refreshed', () => {
      if (this.active && this.metadata_updating === false) {
        this.metadata_updating = true;
        this.aggregateResource('resource-refreshed');
        this.metadata_updating = false;
      }
    });
    document.addEventListener("backend-ai-group-changed", (e) => {
      // this.scaling_group = '';
      this._updatePageVariables(true);
    });
  }

  _updateSelectedScalingGroup() {
    let Sgroups = this.shadowRoot.querySelector('#scaling-groups');
    let selectedSgroup = Sgroups.items.find(item => item.value === this.scaling_group);
    let idx = Sgroups.items.indexOf(selectedSgroup);
    Sgroups.select(idx);
  }

  async updateScalingGroup(forceUpdate = false, e) {
    if (this.scaling_group == '' || e.target.value === '' || e.target.value === this.scaling_group) {
      return;
    }
    this.scaling_group = e.target.value;
    if (this.active) {
      if (this.direction === 'vertical') {
        const scaling_group_selection_box = this.shadowRoot.querySelector('#scaling-group-select-box');
        scaling_group_selection_box.firstChild.value = this.scaling_group;
      }
      // let sgnum = this.scaling_groups.map((sg) => sg.name).indexOf(this.scaling_group);
      // if (sgnum < 0) sgnum = 0;
      // this.shadowRoot.querySelector('#scaling-groups paper-listbox').selected = sgnum;
      if (forceUpdate === true) {
        //console.log('force update called');
        //this.metric_updating = true;
        //await this._aggregateResourceUse('update-scaling-group');
        await this._refreshResourcePolicy();
      } else {
      }
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (!this.active) {
      return;
    }
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.project_resource_monitor = globalThis.backendaiclient._config.allow_project_resource_monitor;
        this._updatePageVariables(true);
      }, true);
    } else {
      this.project_resource_monitor = globalThis.backendaiclient._config.allow_project_resource_monitor;
      await this._updatePageVariables(true);
    }
    //this.run_after_connection(this._updatePageVariables());
  }

  async _updatePageVariables(isChanged) {
    if (this.active && this.metadata_updating === false) {
      this.metadata_updating = true;
      this.enable_scaling_group = globalThis.backendaiclient.supports('scaling-group');
      if (this.enable_scaling_group === true) {
        if (this.scaling_group === '' || isChanged) {
          const currentGroup = globalThis.backendaiclient.current_group || null;
          let sgs = await globalThis.backendaiclient.scalingGroup.list(currentGroup);
          // Make empty scaling group item if there is no scaling groups.
          this.scaling_groups = sgs.scaling_groups.length > 0 ? sgs.scaling_groups : [{name: ''}];
          this.scaling_group = this.scaling_groups[0].name;
        }
      }
      // update selected Scaling Group depends on project group
      this._updateSelectedScalingGroup();
      // Reload number of sessions
      let fields = ["created_at"];
      globalThis.backendaiclient.computeSession.list(fields = fields, status = "RUNNING", null, 1000)
        .then(res => {
          this.sessions_list = res.compute_session_list.items.map(e => e.created_at);
        });

      await this._refreshResourcePolicy();
      this.aggregateResource('update-page-variable');
      this.metadata_updating = false;
    }
  }

  _refreshConcurrency() {
    return globalThis.backendaiclient.keypair.info(globalThis.backendaiclient._config.accessKey, ['concurrency_used']).then((response) => {
      this.concurrency_used = response.keypair.concurrency_used;
    });
  }

  async _refreshResourcePolicy() {
    return globalThis.backendaiclient.keypair.info(globalThis.backendaiclient._config.accessKey, ['resource_policy', 'concurrency_used']).then((response) => {
      let policyName = response.keypair.resource_policy;
      this.concurrency_used = response.keypair.concurrency_used;
      // Workaround: We need a new API for user mode resource policy access, and current resource usage.
      // TODO: Fix it to use API-based resource max.
      return globalThis.backendaiclient.resourcePolicy.get(policyName, ['default_for_unspecified',
        'total_resource_slots',
        'max_concurrent_sessions',
        'max_containers_per_session',
      ]);
    }).then((response) => {
      let resource_policy = response.keypair_resource_policy;
      if (resource_policy.default_for_unspecified === 'UNLIMITED' ||
        resource_policy.default_for_unspecified === 'DefaultForUnspecified.UNLIMITED') {
        this.defaultResourcePolicy = 'UNLIMITED';
      } else {
        this.defaultResourcePolicy = 'LIMITED';
      }
      this.userResourceLimit = JSON.parse(response.keypair_resource_policy.total_resource_slots);
      this.concurrency_max = resource_policy.max_concurrent_sessions;
      //this._refreshResourceTemplate('refresh-resource-policy');
      return this._refreshImageList();
    }).then(() => {
      this._updateGPUMode();
    }).catch((err) => {
      console.log(err);
      this.metadata_updating = false;
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      } else if (err && err.title) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.show(true, err);
      }
    });
  }

  _updateGPUMode() {
    globalThis.backendaiclient.getResourceSlots().then((response) => {
      let results = response;

      ['cuda.device', 'cuda.shares', 'rocm.device', 'tpu.device'].forEach((item) => {
        if (item in results && !(this.gpu_modes as Array<string>).includes(item)) {
          this.gpu_mode = item;
          (this.gpu_modes as Array<string>).push(item);
          if (item === 'cuda.shares') {
            this.gpu_step = 0.05;
          } else {
            this.gpu_step = 1;
          }
        }
      });
    });
  }

  async _updateVirtualFolderList() {
    let l = globalThis.backendaiclient.vfolder.list(globalThis.backendaiclient.current_group_id());
    l.then((value) => {
      let selectableFolders: object[] = [];
      let automountFolders: object[] = [];
      value.forEach((item) => {
        if (item.name.startsWith('.')) {
          item.disabled = true;
          item.name = item.name + ' (Automount folder)';
          automountFolders.push(item);
        } else {
          selectableFolders.push(item);
        }
      });
      this.vfolders = selectableFolders.concat(automountFolders);
    });
  }

  async _aggregateResourceUse(from: string = '') {
    if (this.aggregate_updating === true) {
      return;
    }
    //console.log('aggregate from:', from);
    this.aggregate_updating = true;
    let total_slot = {};
    let total_sg_slot = {};
    let total_pj_slot = {};

    return globalThis.backendaiclient.keypair.info(globalThis.backendaiclient._config.accessKey, ['concurrency_used']).then((response) => {
      this.concurrency_used = response.keypair.concurrency_used;
      const param: any = {group: globalThis.backendaiclient.current_group};
      if (this.enable_scaling_group == true && this.scaling_groups.length > 0) {
        let scaling_group: string = '';
        if (this.scaling_group !== '') {
          scaling_group = this.scaling_group;
        } else {
          scaling_group = this.scaling_groups[0]['name'];
          this.scaling_group = scaling_group;
        }
        if (scaling_group) {
          param['scaling_group'] = scaling_group;
        }
      }
      //console.log('check resource preset from : aggregate resource use, ', from);
      return globalThis.backendaiclient.resourcePreset.check(param);
      //console.log(this.resource_templates);
      //return {'preset': this.resource_templates};

    }).then((response) => {
      if (response.presets) {
        let presets = response.presets;
        let available_presets: any = [];
        presets.forEach((item) => {
          if (item.allocatable === true) {
            if ('cuda.shares' in item.resource_slots) {
              item.cuda_fgpu = item.resource_slots['cuda.shares'];
            } else if ('cuda.device' in item.resource_slots) {
              item.cuda_gpu = item.resource_slots['cuda.device'];
            }
            if ('rocm.device' in item.resource_slots) {
              item.rocm_gpu = item.resource_slots['rocm.device'];
            }
            if ('tpu.device' in item.resource_slots) {
              item.tpu = item.resource_slots['tpu.device'];
            }
            item.cpu = item.resource_slots.cpu;
            item.mem = globalThis.backendaiclient.utils.changeBinaryUnit(item.resource_slots.mem, 'g');
            available_presets.push(item);
          }
        });
        this.resource_templates = available_presets;
        if (this.resource_templates_filtered.length === 0) {
          this.resource_templates_filtered = this.resource_templates;
        }
      }

      let resource_remaining = response.keypair_remaining;
      let resource_using = response.keypair_using;
      let project_resource_total = response.group_limits;
      let project_resource_using = response.group_using;

      //let scaling_group_resource_remaining = response.scaling_group_remaining;
      //console.log('current:', this.scaling_group);
      if (this.scaling_group === '') { // no scaling group in the current project
        response.scaling_groups[''] = {
          using: {'cpu': 0, 'mem': 0},
          remaining: {'cpu': 0, 'mem': 0},
        }
      }
      let scaling_group_resource_using = response.scaling_groups[this.scaling_group].using;
      let scaling_group_resource_remaining = response.scaling_groups[this.scaling_group].remaining;

      let keypair_resource_limit = response.keypair_limits;
      if ('cpu' in keypair_resource_limit) {
        total_sg_slot['cpu_slot'] = Number(scaling_group_resource_remaining.cpu) + Number(scaling_group_resource_using.cpu);
        total_pj_slot['cpu_slot'] = Number(project_resource_total.cpu);
        if (keypair_resource_limit['cpu'] === 'Infinity') { // When resource is infinity, use scaling group limit instead.
          total_slot['cpu_slot'] = total_sg_slot['cpu_slot'];
        } else {
          total_slot['cpu_slot'] = keypair_resource_limit['cpu'];
        }
      }
      if ('mem' in keypair_resource_limit) {
        total_sg_slot['mem_slot'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(scaling_group_resource_remaining.mem, 'g')) + parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(scaling_group_resource_using.mem, 'g'));
        total_pj_slot['mem_slot'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(project_resource_total.mem, 'g'));
        if (keypair_resource_limit['mem'] === 'Infinity') {
          total_slot['mem_slot'] = total_sg_slot['mem_slot'];
        } else {
          total_slot['mem_slot'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(keypair_resource_limit['mem'], 'g'));
        }
      }
      total_slot['mem_slot'] = total_slot['mem_slot'].toFixed(2);
      total_sg_slot['mem_slot'] = total_sg_slot['mem_slot'].toFixed(2);
      if ('cuda.device' in keypair_resource_limit) {
        total_sg_slot['cuda_gpu_slot'] = Number(scaling_group_resource_remaining['cuda.device']) + Number(scaling_group_resource_using['cuda.device']);
        total_pj_slot['cuda_gpu_slot'] = Number(project_resource_total['cuda.device']);
        if (keypair_resource_limit['cuda.device'] === 'Infinity') {
          total_slot['cuda_gpu_slot'] = total_sg_slot['cuda_gpu_slot'];
        } else {
          total_slot['cuda_gpu_slot'] = keypair_resource_limit['cuda.device'];
        }
      }
      if ('cuda.shares' in keypair_resource_limit) {
        total_sg_slot['cuda_fgpu_slot'] = Number(scaling_group_resource_remaining['cuda.shares']) + Number(scaling_group_resource_using['cuda.shares']);
        total_pj_slot['cuda_fgpu_slot'] = Number(project_resource_total['cuda.shares']);
        if (keypair_resource_limit['cuda.shares'] === 'Infinity') {
          total_slot['cuda_fgpu_slot'] = total_sg_slot['cuda_fgpu_slot'];
        } else {
          total_slot['cuda_fgpu_slot'] = keypair_resource_limit['cuda.shares'];
        }
      }
      let remaining_slot: Object = Object();
      let used_slot: Object = Object();
      let remaining_sg_slot: Object = Object();
      let used_sg_slot: Object = Object();
      let used_pj_slot: Object = Object();

      if ('cpu' in resource_remaining) { // Monkeypatch: manager reports Infinity to cpu.
        if ('cpu' in resource_using) {
          used_slot['cpu_slot'] = resource_using['cpu'];
        } else {
          used_slot['cpu_slot'] = 0;
        }
        if (resource_remaining['cpu'] === 'Infinity') {  // Monkeypatch: manager reports Infinity to mem.
          remaining_slot['cpu_slot'] = total_slot['cpu_slot'] - used_slot['cpu_slot'];
        } else {
          remaining_slot['cpu_slot'] = resource_remaining['cpu'];
        }
      }
      if ('cpu' in scaling_group_resource_remaining) {
        if ('cpu' in scaling_group_resource_using) {
          used_sg_slot['cpu_slot'] = scaling_group_resource_using['cpu'];
        } else {
          used_sg_slot['cpu_slot'] = 0;
        }
        remaining_sg_slot['cpu_slot'] = scaling_group_resource_remaining['cpu'];
      }
      if ('cpu' in project_resource_using) {
        used_pj_slot['cpu_slot'] = project_resource_using['cpu'];
      } else {
        used_pj_slot['cpu_slot'] = 0;
      }

      if ('mem' in resource_remaining) {
        if ('mem' in resource_using) {
          used_slot['mem_slot'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(resource_using['mem'], 'g'));
        } else {
          used_slot['mem_slot'] = 0.0;
        }
        if (resource_remaining['mem'] === 'Infinity') {  // Monkeypatch: manager reports Infinity to mem.
          remaining_slot['mem_slot'] = total_slot['mem_slot'] - used_slot['mem_slot'];
        } else {
          remaining_slot['mem_slot'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(resource_remaining['mem'], 'g'));
        }
      }
      used_slot['mem_slot'] = used_slot['mem_slot'].toFixed(2);
      if ('mem' in scaling_group_resource_remaining) {
        if ('mem' in scaling_group_resource_using) {
          used_sg_slot['mem_slot'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(scaling_group_resource_using['mem'], 'g'));
        } else {
          used_sg_slot['mem_slot'] = 0.0;
        }
        remaining_sg_slot['mem_slot'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(scaling_group_resource_remaining['mem'], 'g'));
      }
      used_sg_slot['mem_slot'] = used_sg_slot['mem_slot'].toFixed(2);

      if ('mem' in project_resource_using) {
        used_pj_slot['mem_slot'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(project_resource_using['mem'], 'g'));
      } else {
        used_pj_slot['mem_slot'] = 0.0;
      }
      used_pj_slot['mem_slot'] = used_pj_slot['mem_slot'].toFixed(2);


      if ('cuda.device' in resource_remaining) {
        remaining_slot['cuda_gpu_slot'] = resource_remaining['cuda.device'];
        if ('cuda.device' in resource_using) {
          used_slot['cuda_gpu_slot'] = resource_using['cuda.device'];
        } else {
          used_slot['cuda_gpu_slot'] = 0;
        }
      }
      if ('cuda.device' in scaling_group_resource_remaining) {
        remaining_sg_slot['cuda_gpu_slot'] = scaling_group_resource_remaining['cuda.device'];
        if ('cuda.device' in scaling_group_resource_using) {
          used_sg_slot['cuda_gpu_slot'] = scaling_group_resource_using['cuda.device'];
        } else {
          used_sg_slot['cuda_gpu_slot'] = 0;
        }
      }
      if ('cuda.device' in project_resource_using) {
        used_pj_slot['cuda_gpu_slot'] = project_resource_using['cuda.device'];
      } else {
        used_pj_slot['cuda_gpu_slot'] = 0;
      }

      if ('cuda.shares' in resource_remaining) {
        remaining_slot['cuda_fgpu_slot'] = resource_remaining['cuda.shares'];
        if ('cuda.shares' in resource_using) {
          used_slot['cuda_fgpu_slot'] = parseFloat(resource_using['cuda.shares']).toFixed(2);
        } else {
          used_slot['cuda_fgpu_slot'] = 0;
        }
      }
      if ('cuda.shares' in scaling_group_resource_remaining) {
        remaining_sg_slot['cuda_fgpu_slot'] = scaling_group_resource_remaining['cuda.shares'];
        if ('cuda.shares' in resource_using) {
          used_sg_slot['cuda_fgpu_slot'] = parseFloat(scaling_group_resource_using['cuda.shares']).toFixed(2);
        } else {
          used_sg_slot['cuda_fgpu_slot'] = 0;
        }
      }
      if ('cuda.shares' in project_resource_using) {
        used_pj_slot['cuda_fgpu_slot'] = parseFloat(project_resource_using['cuda.shares']).toFixed(2);
      } else {
        used_pj_slot['cuda_fgpu_slot'] = 0;
      }

      if ('cuda_fgpu_slot' in used_slot) {
        total_slot['cuda_fgpu_slot'] = parseFloat(total_slot['cuda_fgpu_slot']).toFixed(2);
      }
      if ('cuda_fgpu_slot' in used_sg_slot) {
        total_sg_slot['cuda_fgpu_slot'] = parseFloat(total_sg_slot['cuda_fgpu_slot']).toFixed(2);
      }
      if ('cuda_fgpu_slot' in used_pj_slot) {
        total_pj_slot['cuda_fgpu_slot'] = parseFloat(total_pj_slot['cuda_fgpu_slot']).toFixed(2);
      }

      this.total_slot = total_slot;
      this.total_sg_slot = total_sg_slot;
      this.total_pj_slot = total_pj_slot;

      this.used_slot = used_slot;
      this.used_sg_slot = used_sg_slot;
      this.used_pj_slot = used_pj_slot;

      let used_slot_percent = {};
      let used_sg_slot_percent = {};
      let used_pj_slot_percent = {};

      ['cpu_slot', 'mem_slot', 'cuda_gpu_slot', 'cuda_fgpu_slot'].forEach((slot) => {
        if (slot in used_slot) {
          if (Number(total_slot[slot]) < Number(used_slot[slot])) { // Modify maximum resources when user have infinite resource
            total_slot[slot] = used_slot[slot];
          }
          if (total_slot[slot] != 0) {
            used_slot_percent[slot] = (used_slot[slot] / total_slot[slot]) * 100.0;
          } else {
            used_slot_percent[slot] = 0;
          }
          if (total_sg_slot[slot] != 0) {
            used_sg_slot_percent[slot] = (used_sg_slot[slot] / total_sg_slot[slot]) * 100.0;
          } else {
            used_sg_slot_percent[slot] = 0;
          }
          if (total_pj_slot[slot] != 0) {
            used_pj_slot_percent[slot] = (used_pj_slot[slot] / total_pj_slot[slot]) * 100.0;
          } else {
            used_pj_slot_percent[slot] = 0;
          }
        } else {
        }
        if (slot in remaining_slot) {
          if (remaining_slot[slot] === 'Infinity') {
            remaining_slot[slot] = remaining_sg_slot[slot];
          }
        }
      });
      this.used_pj_slot_percent = used_pj_slot_percent;
      if (this.concurrency_max === 0) {
        used_slot_percent['concurrency'] = 0;
        remaining_slot['concurrency'] = this.concurrency_max;
      } else {
        used_slot_percent['concurrency'] = (this.concurrency_used / this.concurrency_max) * 100.0;
        remaining_slot['concurrency'] = this.concurrency_max - this.concurrency_used;
      }
      this.concurrency_limit = Math.min(remaining_slot['concurrency'], 5);
      this.available_slot = remaining_sg_slot;
      this.used_slot_percent = used_slot_percent;
      this.used_sg_slot_percent = used_sg_slot_percent;
      this.aggregate_updating = false;
      return this.available_slot;
    }).catch(err => {
      this.aggregate_updating = false;
      if (err && err.message) {
        console.log(err);
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  // Get available / total resources from manager
  aggregateResource(from: string = '') {
    //console.log('aggregate resource called - ', from);
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._aggregateResourceUse(from);
      }, true);
    } else {
      this._aggregateResourceUse(from);
    }
  }

  // Manager requests
  async _refreshImageList() {
    const fields = [
      'name', 'humanized_name', 'tag', 'registry', 'digest', 'installed',
      'resource_limits { key min max }'
    ];
    return globalThis.backendaiclient.image.list(fields, true, false).then((response) => {
      const images: Array<object> = [];
      Object.keys(response.images).map((objectKey, index) => {
        const item = response.images[objectKey];
        if (item.installed === true) {
          images.push(item);
        }
      });
      if (images.length === 0) {
        return;
      }
      this.images = images;
      this.supports = {};
      this.supportImages = {};
      Object.keys(this.images).map((objectKey, index) => {
        const item = this.images[objectKey];
        const supportsKey = `${item.registry}/${item.name}`;
        if (!(supportsKey in this.supports)) {
          this.supports[supportsKey] = [];
        }
        this.supports[supportsKey].push(item.tag);
        let imageName: string;
        let specs: string[] = item.name.split('/');
        if (specs.length === 1) {
          imageName = specs[0];
        } else {
          imageName = specs[1];
        }
        this.supportImages[supportsKey] = this.imageInfo[imageName] || {
          name: 'Custom Environments',
          description: 'Custom-built images.',
          group: 'Custom Environments',
          tags: [],
          label: [
            {
              'category': 'Custom',
              'tag': 'Custom',
              'color': 'black'
            }
          ]
        };
        // Fallback routine if image has no metadata
        if (!('group' in this.supportImages[supportsKey])) {
          this.supportImages[supportsKey].group = 'Custom Environments';
        }
        this.resourceLimits[`${supportsKey}:${item.tag}`] = item.resource_limits;
      });
    }).catch((err) => {
      this.metadata_updating = false;
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  render() {
    // language=HTML
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-resource-broker": BackendAiResourceBroker;
  }
}
