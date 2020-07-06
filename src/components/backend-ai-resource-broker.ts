/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

@customElement("backend-ai-resource-broker")
export default class BackendAiResourceBroker extends BackendAIPage {
  @property({type: Object}) supports = Object();
  // Environment-image information
  @property({type: Object}) images;
  @property({type: Object}) supportImages = Object();
  @property({type: Object}) imageRequirements = Object();
  @property({type: Object}) aliases = Object();
  @property({type: Object}) tags = Object();
  @property({type: Object}) imageInfo = Object();
  @property({type: Object}) imageNames = Object();
  // Resource information
  @property({type: Object}) resourceLimits = Object();
  @property({type: Object}) userResourceLimit = Object();
  @property({type: Object}) icons = Object();
  @property({type: String}) kernel = '';
  @property({type: Array}) versions;
  @property({type: Array}) languages;
  // Resource occupation information
  @property({type: String}) gpu_mode;
  @property({type: Array}) gpu_modes = [];
  @property({type: Number}) gpu_step = 0.05;

  // Resource slot information
  @property({type: Object}) total_slot;
  @property({type: Object}) total_resource_group_slot;
  @property({type: Object}) total_project_slot;
  @property({type: Object}) used_slot;
  @property({type: Object}) used_resource_group_slot;
  @property({type: Object}) used_project_slot;
  @property({type: Object}) available_slot;
  @property({type: Number}) concurrency_used;
  @property({type: Number}) concurrency_max;
  @property({type: Number}) concurrency_limit;
  @property({type: Array}) vfolders;
  // Percentage data for views
  @property({type: Object}) used_slot_percent;
  @property({type: Object}) used_resource_group_slot_percent;
  @property({type: Object}) used_project_slot_percent;
  // Environment images and templates
  @property({type: Array}) resource_templates;
  @property({type: Array}) resource_templates_filtered;
  @property({type: String}) default_language;
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
  @property({type: Object}) cuda_device_metric = {
    'min': 0,
    'max': 0
  };
  @property({type: Object}) cuda_shares_metric;
  @property({type: Object}) rocm_device_metric = {
    'min': '0',
    'max': '0'
  };
  @property({type: Object}) tpu_device_metric = {
    'min': '1',
    'max': '1'
  };
  @property({type: Number}) lastQueryTime = 0;
  @property({type: Number}) lastResourcePolicyQueryTime = 0;
  @property({type: Number}) lastVFolderQueryTime = 0;
  @property({type: String}) scaling_group;
  @property({type: Array}) scaling_groups;
  @property({type: Array}) sessions_list;
  @property({type: Boolean}) metric_updating;
  @property({type: Boolean}) metadata_updating;
  @property({type: Boolean}) aggregate_updating = false;
  @property({type: Boolean}) image_updating;
  // Flags
  @property({type: Boolean}) _default_language_updated = false;
  @property({type: Boolean}) _default_version_updated = false;
  @property({type: Boolean}) _GPUmodeUpdated = false;
  @property({type: Boolean}) allow_project_resource_monitor = false;
  @property({type: Array}) disableLaunch;
  // Custom information
  @property({type: Number}) max_cpu_core_per_session = 64;

  constructor() {
    super();
    this.active = false;
    this.init_resource();
  }

  static get is() {
    return 'backend-ai-resource-broker';
  }

  static get styles() {
    return [];
  }

  init_resource() {
    this.languages = [];
    this.total_slot = {};
    this.total_resource_group_slot = {};
    this.total_project_slot = {};
    this.used_slot = {};
    this.used_resource_group_slot = {};
    this.used_project_slot = {};
    this.available_slot = {};
    this.used_slot_percent = {};
    this.used_resource_group_slot_percent = {};
    this.used_project_slot_percent = {};
    this.resource_templates = [];
    this.resource_templates_filtered = [];
    this.vfolders = [];
    this.default_language = '';
    this.concurrency_used = 0;
    this.concurrency_max = 0;
    this.concurrency_limit = 0;
    this.scaling_groups = [{name: ''}]; // if there is no scaling group, set the name as empty string
    this.scaling_group = '';
    this.sessions_list = [];
    this.metric_updating = false;
    this.metadata_updating = false;
    this.image_updating = true;
    this.disableLaunch = [];
  }

  firstUpdated() {
    fetch('resources/image_metadata.json').then(
      response => response.json()
    ).then(
      json => {
        this.imageInfo = json.imageInfo;
        for (let key in this.imageInfo) {
          this.tags[key] = [];
          if ("name" in this.imageInfo[key]) {
            this.aliases[key] = this.imageInfo[key].name;
            this.imageNames[key] = this.imageInfo[key].name;
          }
          if ("icon" in this.imageInfo[key]) {
            this.icons[key] = this.imageInfo[key].icon;
          } else {
            this.icons[key] = 'default.png';
          }

          if ("label" in this.imageInfo[key]) {
            this.imageInfo[key].label.forEach((item) => {
              if (!("category" in item)) {
                this.tags[key].push(item);
              }
            });
          }
        }
        if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
          document.addEventListener('backend-ai-connected', () => {
            this._refreshImageList();
          }, {once: true});
        } else {
          this._refreshImageList();
        }
      }
    );
    document.addEventListener('backend-ai-resource-refreshed', () => {
      if (this.active && this.metadata_updating === false) {
        this.metadata_updating = true;
        this.aggregateResource('resource-refreshed');
        this.metadata_updating = false;
      }
    });
    document.addEventListener("backend-ai-group-changed", (e) => {
      this._updatePageVariables(true);
    });
    /*setInterval(()=>{
      this.metadata_updating = true;
      this.aggregateResource('resource-refreshed');
      this.metadata_updating = false;
      console.log(this.used_slot);
    }, 3000);*/
  }

  /**
   * Copy forward aliases to backward aliases.
   *
   */
  _initAliases() {
    for (let item in this.aliases) {
      this.aliases[this.aliases[item]] = item;
    }
  }

  async updateScalingGroup(forceUpdate = false, scaling_group: string) {
    if (this.scaling_group == '' || scaling_group === '' || scaling_group === this.scaling_group) {
      return;
    }
    this.scaling_group = scaling_group;
    if (this.active) {
      this.lastQueryTime = 0; // Reset query interval
      if (forceUpdate === true) {
        await this._refreshResourcePolicy();
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
        this.allow_project_resource_monitor = globalThis.backendaiclient._config.allow_project_resource_monitor;
        this._updatePageVariables(true);
      }, {once: true});
    } else {
      this.allow_project_resource_monitor = globalThis.backendaiclient._config.allow_project_resource_monitor;
      await this._updatePageVariables(true);
    }
  }

  /**
   * Update all variables on the broker.
   *
   * @param {boolean} isChanged - set to true to reset query interval.
   */
  async _updatePageVariables(isChanged: boolean) {
    if (this.metadata_updating === false) {
      this.metadata_updating = true;
      if (isChanged) {
        this.lastQueryTime = 0; // Reset query interval
      }
      if (this.scaling_group === '' || isChanged) {
        const currentGroup = globalThis.backendaiclient.current_group || null;
        const sgs = await globalThis.backendaiclient.scalingGroup.list(currentGroup);
        // Make empty scaling group item if there is no scaling groups.
        this.scaling_groups = sgs.scaling_groups.length > 0 ? sgs.scaling_groups : [{name: ''}];
        this.scaling_group = this.scaling_groups[0].name;
      }

      // Reload number of sessions
      let fields = ["created_at"];
      await globalThis.backendaiclient.computeSession.list(fields = fields, status = "RUNNING", null, 1000)
        .then(res => {
          if (!res.compute_session_list && res.legacy_compute_session_list) {
            res.compute_session_list = res.legacy_compute_session_list;
          }
          this.sessions_list = res.compute_session_list.items.map(e => e.created_at);
        });
      this._initAliases();
      await this._refreshResourcePolicy();
      this.aggregateResource('update-page-variable');
      this.metadata_updating = false;
      let event = new CustomEvent("backend-ai-resource-broker-updated", {"detail": ''});
      document.dispatchEvent(event);
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * Refresh keypair concurrency.
   *
   */
  _refreshConcurrency() {
    return globalThis.backendaiclient.keypair.info(globalThis.backendaiclient._config.accessKey, ['concurrency_used']).then((response) => {
      this.concurrency_used = response.keypair.concurrency_used;
    });
  }

  /**
   * Refresh resource policy from manager.
   *
   */
  async _refreshResourcePolicy() {
    if (Date.now() - this.lastResourcePolicyQueryTime < 2000) {
      return Promise.resolve(false);
    }
    this.lastResourcePolicyQueryTime = Date.now();
    return globalThis.backendaiclient.keypair.info(globalThis.backendaiclient._config.accessKey, ['resource_policy', 'concurrency_used']).then((response) => {
      let policyName = response.keypair.resource_policy;
      this.concurrency_used = response.keypair.concurrency_used;
      return globalThis.backendaiclient.resourcePolicy.get(policyName, ['default_for_unspecified',
        'total_resource_slots',
        'max_concurrent_sessions',
        'max_containers_per_session',
      ]);
    }).then((response) => {
      let resource_policy = response.keypair_resource_policy;
      this.userResourceLimit = JSON.parse(response.keypair_resource_policy.total_resource_slots);
      this.concurrency_max = resource_policy.max_concurrent_sessions;
      //this._refreshResourceTemplate('refresh-resource-policy');
      return this._updateGPUMode();
    }).catch((err) => {
      this.metadata_updating = false;
      throw err;
    });
  }

  _updateGPUMode() {
    if (!this._GPUmodeUpdated) {
      this._GPUmodeUpdated = true;
      return globalThis.backendaiclient.getResourceSlots().then((response) => {
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
    } else {
      return Promise.resolve(true);
    }
  }

  generateSessionId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text + "-console";
  }

  /**
   * Update virtual folder list. Also divide automount folders from general ones.
   *
   */
  async updateVirtualFolderList() {
    if (Date.now() - this.lastVFolderQueryTime < 2000) {
      return Promise.resolve(false);
    }
    let l = globalThis.backendaiclient.vfolder.list(globalThis.backendaiclient.current_group_id());
    return l.then((value) => {
      this.lastVFolderQueryTime = Date.now();
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

  /**
   * Aggregate resources from manager and update the store.
   *
   * @param {string} from - set the value for debugging purpose.
   */
  async _aggregateCurrentResource(from: string = '') {
    if (this.aggregate_updating) {
      return Promise.resolve(false);
    }
    if (Date.now() - this.lastQueryTime < 1000) {
      return Promise.resolve(false);
    }
    //console.log('aggregate from:', from);
    this.aggregate_updating = true;
    let total_slot = {};
    let total_resource_group_slot = {};
    let total_project_slot = {};

    return globalThis.backendaiclient.keypair.info(globalThis.backendaiclient._config.accessKey, ['concurrency_used']).then(async (response) => {
      this.concurrency_used = response.keypair.concurrency_used;
      const param: any = {group: globalThis.backendaiclient.current_group};
      if (this.scaling_groups.length > 0) {
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
      return globalThis.backendaiclient.resourcePreset.check(param);
    }).then((response) => {
      if (response.presets) {
        let presets = response.presets;
        let available_presets: any = [];
        presets.forEach((item) => {
          if (item.allocatable === true) {
            if ('cuda.shares' in item.resource_slots) {
              item.cuda_shares = item.resource_slots['cuda.shares'];
            } else if ('cuda.device' in item.resource_slots) {
              item.cuda_device = item.resource_slots['cuda.device'];
            }
            if ('rocm.device' in item.resource_slots) {
              item.rocm_device = item.resource_slots['rocm.device'];
            }
            if ('tpu.device' in item.resource_slots) {
              item.tpu_device = item.resource_slots['tpu.device'];
            }
            item.cpu = item.resource_slots.cpu;
            item.mem = globalThis.backendaiclient.utils.changeBinaryUnit(item.resource_slots.mem, 'g');
            if (item.shared_memory) {
              item.shmem = globalThis.backendaiclient.utils.changeBinaryUnit(item.shared_memory, 'g');
            } else {
              item.shmem = null;
            }
            available_presets.push(item);
          }
        });
        available_presets.sort((a, b) => (a['name'] > b['name'] ? 1 : -1));
        this.resource_templates = available_presets;
        if (this.resource_templates_filtered.length === 0) {
          this.resource_templates_filtered = this.resource_templates;
        }
      }

      let resource_remaining = response.keypair_remaining;
      let resource_using = response.keypair_using;
      let project_resource_total = response.group_limits;
      let project_resource_using = response.group_using;
      let device_list = {
        'cuda.device': 'cuda_device',
        'cuda.shares': 'cuda_shares',
        'rocm.device': 'rocm_device',
        'tpu.device': 'tpu_device'
      }
      //let scaling_group_resource_remaining = response.scaling_group_remaining;
      if (this.scaling_group === '' && this.scaling_groups.length > 0) { // no scaling group in the current project
        response.scaling_groups[''] = {
          using: {'cpu': 0, 'mem': 0},
          remaining: {'cpu': 0, 'mem': 0},
        }
      } else if (this.scaling_groups.length === 0) {
        this.aggregate_updating = false;
        return Promise.resolve(false);
      }
      let scaling_group_resource_using = response.scaling_groups[this.scaling_group].using;
      let scaling_group_resource_remaining = response.scaling_groups[this.scaling_group].remaining;

      let keypair_resource_limit = response.keypair_limits;
      if ('cpu' in keypair_resource_limit) {
        total_resource_group_slot['cpu'] = Number(scaling_group_resource_remaining.cpu) + Number(scaling_group_resource_using.cpu);
        total_project_slot['cpu'] = Number(project_resource_total.cpu);
        if (keypair_resource_limit['cpu'] === 'Infinity') { // When resource is infinity, use scaling group limit instead.
          total_slot['cpu'] = total_resource_group_slot['cpu'];
        } else {
          total_slot['cpu'] = keypair_resource_limit['cpu'];
        }
      }
      if ('mem' in keypair_resource_limit) {
        total_resource_group_slot['mem'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(scaling_group_resource_remaining.mem, 'g')) + parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(scaling_group_resource_using.mem, 'g'));
        total_project_slot['mem'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(project_resource_total.mem, 'g'));
        if (keypair_resource_limit['mem'] === 'Infinity') {
          total_slot['mem'] = total_resource_group_slot['mem'];
        } else {
          total_slot['mem'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(keypair_resource_limit['mem'], 'g'));
        }
      }
      total_slot['mem'] = total_slot['mem'].toFixed(2);
      total_resource_group_slot['mem'] = total_resource_group_slot['mem'].toFixed(2);

      for (let [slot_key, slot_name] of Object.entries(device_list)) {
        if (slot_key in keypair_resource_limit) {
          total_resource_group_slot[slot_name] = Number(scaling_group_resource_remaining[slot_key]) + Number(scaling_group_resource_using[slot_key]);
          total_project_slot[slot_name] = Number(project_resource_total[slot_key]);
          if (keypair_resource_limit[slot_key] === 'Infinity') {
            total_slot[slot_name] = total_resource_group_slot[slot_name];
          } else {
            total_slot[slot_name] = keypair_resource_limit[slot_key];
          }
        }
      }

      let remaining_slot: Object = Object();
      let used_slot: Object = Object();
      let remaining_sg_slot: Object = Object();
      let used_resource_group_slot: Object = Object();
      let used_project_slot: Object = Object();

      if ('cpu' in resource_remaining) { // Monkeypatch: manager reports Infinity to cpu.
        if ('cpu' in resource_using) {
          used_slot['cpu'] = resource_using['cpu'];
        } else {
          used_slot['cpu'] = 0;
        }
        if (resource_remaining['cpu'] === 'Infinity') {  // Monkeypatch: manager reports Infinity to mem.
          remaining_slot['cpu'] = total_slot['cpu'] - used_slot['cpu'];
        } else {
          remaining_slot['cpu'] = resource_remaining['cpu'];
        }
      }
      if ('cpu' in scaling_group_resource_remaining) {
        if ('cpu' in scaling_group_resource_using) {
          used_resource_group_slot['cpu'] = scaling_group_resource_using['cpu'];
        } else {
          used_resource_group_slot['cpu'] = 0;
        }
        remaining_sg_slot['cpu'] = scaling_group_resource_remaining['cpu'];
      }
      if ('cpu' in project_resource_using) {
        used_project_slot['cpu'] = project_resource_using['cpu'];
      } else {
        used_project_slot['cpu'] = 0;
      }

      if ('mem' in resource_remaining) {
        if ('mem' in resource_using) {
          used_slot['mem'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(resource_using['mem'], 'g'));
        } else {
          used_slot['mem'] = 0.0;
        }
        if (resource_remaining['mem'] === 'Infinity') {  // Monkeypatch: manager reports Infinity to mem.
          remaining_slot['mem'] = total_slot['mem'] - used_slot['mem'];
        } else {
          remaining_slot['mem'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(resource_remaining['mem'], 'g'));
        }
      }
      used_slot['mem'] = used_slot['mem'].toFixed(2);
      if ('mem' in scaling_group_resource_remaining) {
        if ('mem' in scaling_group_resource_using) {
          used_resource_group_slot['mem'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(scaling_group_resource_using['mem'], 'g'));
        } else {
          used_resource_group_slot['mem'] = 0.0;
        }
        remaining_sg_slot['mem'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(scaling_group_resource_remaining['mem'], 'g'));
      }
      used_resource_group_slot['mem'] = used_resource_group_slot['mem'].toFixed(2);

      if ('mem' in project_resource_using) {
        used_project_slot['mem'] = parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(project_resource_using['mem'], 'g'));
      } else {
        used_project_slot['mem'] = 0.0;
      }
      used_project_slot['mem'] = used_project_slot['mem'].toFixed(2);

      for (let [slot_key, slot_name] of Object.entries(device_list)) {
        if (slot_key in resource_remaining) {
          remaining_slot[slot_name] = resource_remaining[slot_key];
          if (slot_key in resource_using) {
            used_slot[slot_name] = resource_using[slot_key];
          } else {
            used_slot[slot_name] = 0;
          }
        }
        if (slot_key in scaling_group_resource_remaining) {
          remaining_sg_slot[slot_name] = scaling_group_resource_remaining[slot_key];
          if (slot_key in scaling_group_resource_using) {
            used_resource_group_slot[slot_name] = scaling_group_resource_using[slot_key];
          } else {
            used_resource_group_slot[slot_name] = 0;
          }
        }
        if (slot_key in project_resource_using) {
          used_project_slot[slot_name] = project_resource_using[slot_key];
        } else {
          used_project_slot[slot_name] = 0;
        }
      }

      if ('cuda_shares' in used_slot) {
        total_slot['cuda_shares'] = parseFloat(total_slot['cuda_shares']).toFixed(2);
      }
      if ('cuda_shares' in used_resource_group_slot) {
        total_resource_group_slot['cuda_shares'] = parseFloat(total_resource_group_slot['cuda_shares']).toFixed(2);
      }
      if ('cuda_shares' in used_project_slot) {
        total_project_slot['cuda_shares'] = parseFloat(total_project_slot['cuda_shares']).toFixed(2);
      }

      this.total_slot = total_slot;
      this.total_resource_group_slot = total_resource_group_slot;
      this.total_project_slot = total_project_slot;
      this.used_slot = used_slot;
      this.used_resource_group_slot = used_resource_group_slot;
      this.used_project_slot = used_project_slot;

      let used_slot_percent = {};
      let used_resource_group_slot_percent = {};
      let used_project_slot_percent = {};

      ['cpu', 'mem', 'cuda_device', 'cuda_shares', 'rocm_device', 'tpu_device'].forEach((slot) => {
        if (slot in used_slot) {
          if (Number(total_slot[slot]) < Number(used_slot[slot])) { // Modify maximum resources when user have infinite resource
            total_slot[slot] = used_slot[slot];
          }
          if (total_slot[slot] != 0) {
            used_slot_percent[slot] = (used_slot[slot] / total_slot[slot]) * 100.0;
          } else {
            used_slot_percent[slot] = 0;
          }
          if (total_resource_group_slot[slot] != 0) {
            used_resource_group_slot_percent[slot] = (used_resource_group_slot[slot] / total_resource_group_slot[slot]) * 100.0;
          } else {
            used_resource_group_slot_percent[slot] = 0;
          }
          if (total_project_slot[slot] != 0) {
            used_project_slot_percent[slot] = (used_project_slot[slot] / total_project_slot[slot]) * 100.0;
          } else {
            used_project_slot_percent[slot] = 0;
          }
        } else {
        }
        if (slot in remaining_slot) {
          if (remaining_slot[slot] === 'Infinity') {
            remaining_slot[slot] = remaining_sg_slot[slot];
          }
        }
      });
      this.used_project_slot_percent = used_project_slot_percent;
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
      this.used_resource_group_slot_percent = used_resource_group_slot_percent;
      this.lastQueryTime = Date.now();
      this.aggregate_updating = false;
      return Promise.resolve(true);
      //return this.available_slot;
    }).catch(err => {
      this.lastQueryTime = Date.now();
      this.aggregate_updating = false;
      throw err;
    });
  }

  /**
   * Get available / total resources from manager
   *
   * @param {string} from - set the value for debugging purpose.
   */
  aggregateResource(from: string = '') {
    //console.log('aggregate resource called - ', from);
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._aggregateCurrentResource(from);
      }, true);
    } else {
      this._aggregateCurrentResource(from);
    }
  }

  /**
   * Refresh environment image information from manager.
   *
   */
  async _refreshImageList() {
    const fields = [
      'name', 'humanized_name', 'tag', 'registry', 'digest', 'installed',
      'resource_limits { key min max }', 'labels { key value }'
    ];
    return globalThis.backendaiclient.image.list(fields, true, false).then((response) => {
      if (response.images.length === 0) {
        return;
      }
      this.images = response.images;
      this.supports = {};
      this.supportImages = {};
      this.imageRequirements = {};
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
        this.imageRequirements[`${supportsKey}:${item.tag}`] = {};
        item.labels.forEach(label => {
          if (label['key'] === 'com.nvidia.tensorflow.version') {
            this.imageRequirements[`${supportsKey}:${item.tag}`]['framework'] = 'TensorFlow ' + label['value'];
          }
          if (label['key'] === 'com.nvidia.pytorch.version') {
            this.imageRequirements[`${supportsKey}:${item.tag}`]['framework'] = 'PyTorch ' + label['value'];
          }
        });
      });
      this._updateEnvironment();
    }).catch((err) => {
      this.metadata_updating = false;
      throw err;
    });
  }

  _guessHumanizedNames(kernelName) {
    const candidate = this.imageNames;
    let imageName = '';
    let humanizedName = null;
    let matchedString = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()';
    Object.keys(candidate).forEach((item, index) => {
      let specs = kernelName.split('/');
      if (specs.length == 2) {
        imageName = specs[1];
      } else {
        imageName = specs[2];
      }
      if (imageName === item) {
        humanizedName = candidate[item];
        matchedString = item;
      } else if (imageName === '' && kernelName.endsWith(item) && item.length < matchedString.length) {
        humanizedName = candidate[item];
        matchedString = item;
      }
    });
    return humanizedName;
  }

  _updateEnvironment() {
    const langs = Object.keys(this.supports);
    if (langs === undefined) return;
    langs.sort((a, b) => (this.supportImages[a].group > this.supportImages[b].group) ? 1 : -1); // TODO: fix this to rearrange kernels
    // TODO: add category indicator between groups
    let interCategory: string = '';
    this.languages = [];
    langs.forEach((item, index) => {
      if (!(Object.keys(this.aliases).includes(item))) {
        const humanizedName = this._guessHumanizedNames(item);
        if (humanizedName !== null) {
          this.aliases[item] = humanizedName;
        } else {
          this.aliases[item] = item;
        }
      }
      let specs = item.split('/');
      let registry = specs[0];
      let prefix, kernelName;
      if (specs.length == 2) {
        prefix = '';
        kernelName = specs[1];
      } else {
        prefix = specs[1];
        kernelName = specs[2];
      }
      let alias = this.aliases[item];
      let basename;
      if (alias !== undefined) {
        basename = alias.split(' (')[0];
      } else {
        basename = kernelName;
      }
      // Remove registry and namespace from alias and basename.
      alias = alias.split('/').slice(-1)[0];
      basename = basename.split('/').slice(-1)[0];

      let tags: object[] = [];
      if (kernelName in this.tags) {
        tags = tags.concat(this.tags[kernelName]);
      }
      if (prefix != '' && prefix != 'lablup') {
        tags.push({
          tag: prefix,
          color: 'purple'
        });
      }
      let icon: string = "default.png";
      if (kernelName in this.icons) {
        icon = this.icons[kernelName];
      }
      if (interCategory !== this.supportImages[item].group) {
        this.languages.push({
          name: "",
          registry: "",
          prefix: "",
          kernelname: "",
          alias: "",
          icon: "",
          basename: this.supportImages[item].group,
          tags: [],
          clickable: false
        });
        interCategory = this.supportImages[item].group;
      }
      this.languages.push({
        name: item,
        registry: registry,
        prefix: prefix,
        kernelname: kernelName,
        alias: alias,
        basename: basename,
        tags: tags,
        icon: icon
      });
    });
    //this._initAliases();
    this.image_updating = false;
  }

  /**
   * Initialize default language from configuration.
   *
   */
  async initDefaultLanguage() {
    if (this._default_language_updated) {
      return;
    }
    if (globalThis.backendaiclient._config.default_session_environment !== undefined &&
      'default_session_environment' in globalThis.backendaiclient._config &&
      globalThis.backendaiclient._config.default_session_environment !== '') {
      this.default_language = globalThis.backendaiclient._config.default_session_environment;
    } else if (this.languages.length > 1) {
      this.default_language = this.languages[1].name;
    } else if (this.languages.length !== 0) {
      this.default_language = this.languages[0].name;
    } else {
      this.default_language = 'index.docker.io/lablup/ngc-tensorflow';
    }
    this._default_language_updated = true;
    return this.default_language;
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
