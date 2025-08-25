/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { BackendAIPage } from './backend-ai-page';
import { CSSResultGroup, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('backend-ai-resource-broker')
export default class BackendAiResourceBroker extends BackendAIPage {
  @property({ type: Object }) supports = Object();
  // Environment-image information
  @property({ type: Object }) images;
  @property({ type: Object }) supportImages = Object();
  @property({ type: Object }) imageRequirements = Object();
  @property({ type: Object }) imageArchitectures = Object();
  @property({ type: Object }) imageRoles = Object();
  @property({ type: Object }) imageRuntimeConfig = Object();
  @property({ type: Object }) aliases = Object();
  @property({ type: Object }) tags = Object();
  @property({ type: Object }) imageInfo = Object();
  @property({ type: Object }) imageNames = Object();
  @property({ type: Object }) imageTagAlias = Object();
  @property({ type: Object }) imageTagReplace = Object();
  // Resource information
  @property({ type: Object }) resourceLimits = Object();
  @property({ type: Object }) userResourceLimit = Object();
  @property({ type: Object }) icons = Object();
  @property({ type: String }) kernel = '';
  @property({ type: Array }) versions;
  @property({ type: Array }) languages;
  @property({ type: Array }) inferenceServers;
  // Resource occupation information
  @property({ type: String }) gpu_mode;
  @property({ type: Array }) gpu_modes = [];
  @property({ type: Number }) gpu_step = 0.1;

  // Resource slot information
  @property({ type: Object }) total_slot;
  @property({ type: Object }) total_resource_group_slot;
  @property({ type: Object }) total_project_slot;
  @property({ type: Object }) used_slot;
  @property({ type: Object }) used_resource_group_slot;
  @property({ type: Object }) used_project_slot;
  @property({ type: Object }) available_slot;
  @property({ type: Number }) concurrency_used;
  @property({ type: Number }) concurrency_max;
  @property({ type: Number }) concurrency_limit;
  @property({ type: Number }) max_containers_per_session;
  @property({ type: Array }) vfolders;
  // Percentage data for views
  @property({ type: Object }) used_slot_percent;
  @property({ type: Object }) used_resource_group_slot_percent;
  @property({ type: Object }) used_project_slot_percent;
  // Environment images and templates
  @property({ type: Array }) resource_templates;
  @property({ type: Array }) resource_templates_filtered;
  @property({ type: String }) default_language;
  @property({ type: Object }) cpu_metric = {
    min: '1',
    max: '1',
  };
  @property({ type: Object }) mem_metric = {
    min: '1',
    max: '1',
  };
  @property({ type: Object }) shmem_metric = {
    min: 0.0625,
    max: 1,
    preferred: 0.0625,
  };
  @property({ type: Object }) cuda_device_metric = {
    min: 0,
    max: 0,
  };
  @property({ type: Object }) cuda_shares_metric;
  @property({ type: Object }) rocm_device_metric = {
    min: '0',
    max: '0',
  };
  @property({ type: Object }) tpu_device_metric = {
    min: '1',
    max: '1',
  };
  @property({ type: Number }) lastQueryTime = 0;
  @property({ type: Number }) lastResourcePolicyQueryTime = 0;
  @property({ type: Number }) lastVFolderQueryTime = 0;
  @property({ type: String }) scaling_group;
  @property({ type: String }) current_user_group;
  @property({ type: Array }) scaling_groups;
  @property({ type: Array }) sessions_list;
  @property({ type: Boolean }) metric_updating;
  @property({ type: Boolean }) metadata_updating;
  @property({ type: Boolean }) aggregate_updating = false;
  @property({ type: Boolean }) image_updating;
  // Flags
  @property({ type: Boolean }) _default_language_updated = false;
  @property({ type: Boolean }) _default_version_updated = false;
  @property({ type: Boolean }) allow_project_resource_monitor = false;
  @property({ type: Array }) disableLaunch;
  // Custom information
  @property({ type: Number }) max_cpu_core_per_session = 64;

  // default concurrent session count
  public static readonly DEFAULT_CONCURRENT_SESSION_COUNT = 3;

  constructor() {
    super();
    this.active = false;
    this.init_resource();
  }

  static get is() {
    return 'backend-ai-resource-broker';
  }

  static get styles(): CSSResultGroup {
    return [];
  }

  init_resource() {
    this.languages = [];
    this.inferenceServers = [];
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
    this.scaling_groups = [{ name: '' }]; // if there is no scaling group, set the name as empty string
    this.scaling_group = '';
    this.current_user_group = '';
    this.sessions_list = [];
    this.metric_updating = false;
    this.metadata_updating = false;
    this.image_updating = true;
    this.disableLaunch = [];
  }

  firstUpdated() {
    this.tags = globalThis.backendaimetadata.tags;
    this.icons = globalThis.backendaimetadata.icons;
    this.imageTagAlias = globalThis.backendaimetadata.imageTagAlias;
    this.imageTagReplace = globalThis.backendaimetadata.imageTagReplace;
    this.imageInfo = globalThis.backendaimetadata.imageInfo;
    document.addEventListener(
      'backend-ai-metadata-image-loaded',
      () => {
        this.tags = globalThis.backendaimetadata.tags;
        this.icons = globalThis.backendaimetadata.icons;
        this.imageTagAlias = globalThis.backendaimetadata.imageTagAlias;
        this.imageTagReplace = globalThis.backendaimetadata.imageTagReplace;
        this.imageInfo = globalThis.backendaimetadata.imageInfo;
      },
      { once: true },
    );
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this._refreshImageList();
        },
        { once: true },
      );
    } else {
      this._refreshImageList();
    }

    document.addEventListener('backend-ai-resource-refreshed', () => {
      if (this.active && this.metadata_updating === false) {
        this.metadata_updating = true;
        this.aggregateResource('resource-refreshed');
        this.metadata_updating = false;
      }
    });
    document.addEventListener('backend-ai-group-changed', (e) => {
      this._updatePageVariables(true);
    });
    document.addEventListener('backend-ai-calculate-current-resource', (e) => {
      this.aggregateResource('resource-refreshed');
      globalThis.backendaioptions.set('current-resource', this.available_slot);
    });
    /* setInterval(()=>{
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
    for (const item in this.aliases) {
      if ({}.hasOwnProperty.call(this.aliases, item)) {
        this.aliases[this.aliases[item]] = item;
      }
    }
  }

  async updateScalingGroup(forceUpdate = false, scaling_group: string) {
    if (
      this.scaling_group == '' ||
      scaling_group === '' ||
      scaling_group === this.scaling_group
    ) {
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
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this.allow_project_resource_monitor =
            globalThis.backendaiclient._config.allow_project_resource_monitor;
          this._updatePageVariables(true);
        },
        { once: true },
      );
    } else {
      this.allow_project_resource_monitor =
        globalThis.backendaiclient._config.allow_project_resource_monitor;
      await this._updatePageVariables(true);
    }
  }

  async _sftpScalingGroups() {
    const hosts = await globalThis.backendaiclient?.vfolder?.list_hosts(
      globalThis.backendaiclient?.current_group_id(),
    );
    return Object.values(hosts.volume_info).map((item: any) =>
      item?.sftp_scaling_groups.join(', '),
    );
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
        if (this.current_user_group === '') {
          this.current_user_group = globalThis.backendaiclient.current_group;
        }
        // const currentGroup = globalThis.backendaiclient.current_group || null;
        let sgs = await globalThis.backendaiclient.scalingGroup.list(
          this.current_user_group,
        );
        // TODO: Delete these codes after backend.ai support scaling groups filtering.
        // ================================ START ====================================
        const sftpResourceGroups = await this._sftpScalingGroups();
        if (sgs.scaling_groups.length > 0) {
          sgs = sgs.scaling_groups.filter(
            (item) => !sftpResourceGroups?.includes(item.name),
          );
        }
        sgs = sgs ?? [];
        if (Array.isArray(sgs) && sgs.length === 0) {
          this.scaling_groups = [{ name: '' }];
        }
        // ================================ END ======================================

        // Make empty scaling group item if there is no scaling groups.
        // this.scaling_groups =
        //   sgs.scaling_groups.length > 0 ? sgs.scaling_groups : [{ name: '' }];
        this.scaling_group = this.scaling_groups[0].name;
      }

      // Reload number of sessions
      const fields = ['name'];
      await globalThis.backendaiclient?.computeSession
        ?.list(fields, 'RUNNING', null, 1)
        .then((res) => {
          if (!res.compute_session_list && res.legacy_compute_session_list) {
            res.compute_session_list = res.legacy_compute_session_list;
          }
          this.sessions_list = res.compute_session_list.items.map(
            (e) => e.name,
          );
        });
      this._initAliases();
      await this._refreshResourcePolicy();
      this.aggregateResource('update-page-variable');
      this.metadata_updating = false;
      const event = new CustomEvent('backend-ai-resource-broker-updated', {
        detail: '',
      });
      document.dispatchEvent(event);
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * Refresh keypair concurrency.
   *
   * @return {void}
   */
  _refreshConcurrency() {
    return globalThis.backendaiclient.keypair
      .info(globalThis.backendaiclient._config.accessKey, ['concurrency_used'])
      .then((response) => {
        this.concurrency_used = response.keypair.concurrency_used;
      });
  }

  /**
   * Refresh resource policy from manager.
   *
   */
  async _refreshResourcePolicy() {
    if (!globalThis.backendaiclient) {
      // To prevent a silent failure when the client is not ready in aggregating resources.
      return Promise.resolve(false);
    }
    if (Date.now() - this.lastResourcePolicyQueryTime < 2000) {
      return Promise.resolve(false);
    }
    this.lastResourcePolicyQueryTime = Date.now();
    await this._aggregateCurrentResource('refresh resource policy');
    return globalThis.backendaiclient.keypair
      .info(globalThis.backendaiclient._config.accessKey, [
        'resource_policy',
        'concurrency_used',
      ])
      .then((response) => {
        const policyName = response.keypair.resource_policy;
        this.concurrency_used = response.keypair.concurrency_used;
        return globalThis.backendaiclient.resourcePolicy.get(policyName, [
          'default_for_unspecified',
          'total_resource_slots',
          'max_concurrent_sessions',
          'max_containers_per_session',
        ]);
      })
      .then((response) => {
        const resource_policy = response.keypair_resource_policy;
        this.userResourceLimit = JSON.parse(
          response.keypair_resource_policy.total_resource_slots,
        );
        this.concurrency_max = resource_policy.max_concurrent_sessions;
        this.max_containers_per_session =
          resource_policy.max_containers_per_session;
        // this._refreshResourceTemplate('refresh-resource-policy');
        return this._updateGPUMode();
      })
      .catch((err) => {
        this.metadata_updating = false;
        throw err;
      });
  }

  _updateGPUMode() {
    return globalThis.backendaiclient.get_resource_slots().then((response) => {
      let maxValue = Number.MIN_VALUE;
      let maxItem;
      const results = response;
      const deviceList = {
        'cuda.device': 'cuda_device',
        'cuda.shares': 'cuda_shares',
        'rocm.device': 'rocm_device',
        'tpu.device': 'tpu_device',
        'ipu.device': 'ipu_device',
        'atom.device': 'atom_device',
        'atom-plus.device': 'atom_plus_device',
        'atom-max.device': 'atom_max_device',
        'gaudi2.device': 'gaudi2_device',
        'warboy.device': 'warboy_device',
        'rngd.device': 'rngd_device',
        'hyperaccel-lpu.device': 'hyperaccel_lpu_device',
      };
      for (const [k, v] of Object.entries(deviceList)) {
        // Set gpu_modes
        if (k in results && !(this.gpu_modes as Array<string>).includes(k)) {
          (this.gpu_modes as Array<string>).push(k);
        }

        // Set gpu device as the largest one among available slots
        if (
          k in results &&
          this.available_slot.hasOwnProperty(v) &&
          Number(this.available_slot[v]) > maxValue
        ) {
          maxValue = Number(this.available_slot[v]);
          maxItem = k;
        }
      }
      this.gpu_mode = maxItem;

      // Set gpu_step
      if (maxItem === 'cuda.shares') {
        this.gpu_step = 0.1;
      } else {
        this.gpu_step = 1;
      }
      if (typeof this.gpu_mode == 'undefined') {
        this.gpu_mode = 'none';
      }
    });
  }

  generateSessionId() {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text + '-session';
  }

  /**
   * Update virtual folder list. Also divide automount folders from general ones.
   *
   */
  async updateVirtualFolderList(userEmail = null) {
    if (Date.now() - this.lastVFolderQueryTime < 2000) {
      return Promise.resolve(false);
    }
    const vhostInfo = await globalThis.backendaiclient?.vfolder?.list_hosts(
      globalThis.backendaiclient?.current_group_id(),
    );
    const allowedHosts = vhostInfo?.allowed;
    const l = globalThis.backendaiclient.vfolder.list(
      globalThis.backendaiclient.current_group_id(),
      userEmail,
    );
    return l.then((value) => {
      this.lastVFolderQueryTime = Date.now();
      const selectableFolders: Record<string, unknown>[] = [];
      const automountFolders: Record<string, unknown>[] = [];
      value.forEach((item) => {
        if (allowedHosts.includes(item.host) || !item.is_owner) {
          // folder within allowed host or shared folder
          if (item.name.startsWith('.')) {
            item.disabled = true;
            item.name = item.name + ' (Automount folder)';
            automountFolders.push(item);
          } else {
            selectableFolders.push(item);
          }
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
  async _aggregateCurrentResource(from = '') {
    if (!globalThis.backendaiclient || this.aggregate_updating) {
      return Promise.resolve(false);
    }
    if (Date.now() - this.lastQueryTime < 2000) {
      return Promise.resolve(false);
    }
    // console.log('aggregate from:', from);
    this.aggregate_updating = true;
    const total_slot = {};
    const total_resource_group_slot: any = {};
    const total_project_slot = {};

    try {
      const keypairInfo = await globalThis.backendaiclient.keypair.info(
        globalThis.backendaiclient._config.accessKey,
        ['concurrency_used'],
      );
      this.concurrency_used = keypairInfo.keypair.concurrency_used;
      if (this.current_user_group === '') {
        this.current_user_group = globalThis.backendaiclient.current_group;
      }
      const param: any = { group: globalThis.backendaiclient.current_group };
      if (
        this.current_user_group !== globalThis.backendaiclient.current_group ||
        this.scaling_groups.length == 0 ||
        (this.scaling_groups.length === 1 && this.scaling_groups[0].name === '')
      ) {
        this.current_user_group = globalThis.backendaiclient.current_group;
        const sgs = await globalThis.backendaiclient.scalingGroup.list(
          this.current_user_group,
        );
        // TODO: Delete these codes after backend.ai support scaling groups filtering.
        // ================================ START ====================================
        if (sgs && sgs.scaling_groups && sgs.scaling_groups.length > 0) {
          const sftpResourceGroups = await this._sftpScalingGroups();
          sgs.scaling_groups = sgs.scaling_groups.filter(
            (item) => !sftpResourceGroups?.includes(item.name),
          );
        }
        // ================================ END ====================================
        // Make empty scaling group item if there is no scaling groups.
        this.scaling_groups =
          sgs.scaling_groups.length > 0 ? sgs.scaling_groups : [{ name: '' }];
      }
      if (this.scaling_groups.length > 0) {
        const scaling_groups: any = [];
        this.scaling_groups.map((group) => {
          scaling_groups.push(group.name);
        });
        if (
          this.scaling_group === '' ||
          !scaling_groups.includes(this.scaling_group)
        ) {
          this.scaling_group = this.scaling_groups[0].name;
        }
        param['scaling_group'] = this.scaling_group;
      }
      if (!param['scaling_group']) {
        delete param['scaling_group'];
      }
      const resourcePresetInfo =
        await globalThis.backendaiclient.resourcePreset.check(param);
      const resource_remaining = resourcePresetInfo.keypair_remaining;
      const resource_using = resourcePresetInfo.keypair_using;
      const project_resource_total = resourcePresetInfo.group_limits;
      const project_resource_using = resourcePresetInfo.group_using;
      const device_list = {
        'cuda.device': 'cuda_device',
        'cuda.shares': 'cuda_shares',
        'rocm.device': 'rocm_device',
        'tpu.device': 'tpu_device',
        'ipu.device': 'ipu_device',
        'atom.device': 'atom_device',
        'atom-plus.device': 'atom_plus_device',
        'atom-max.device': 'atom_max_device',
        'gaudi2.device': 'gaudi2_device',
        'warboy.device': 'warboy_device',
        'rngd.device': 'rngd_device',
        'hyperaccel-lpu.device': 'hyperaccel_lpu_device',
      };
      const slotList = {
        cpu: 'cpu',
        mem: 'mem',
        'cuda.device': 'cuda_device',
        'cuda.shares': 'cuda_shares',
        'rocm.device': 'rocm_device',
        'tpu.device': 'tpu_device',
        'ipu.device': 'ipu_device',
        'atom.device': 'atom_device',
        'atom-plus.device': 'atom_plus_device',
        'atom-max.device': 'atom_max_device',
        'gaudi2.device': 'gaudi2_device',
        'warboy.device': 'warboy_device',
        'rngd.device': 'rngd_device',
        'hyperaccel-lpu.device': 'hyperaccel_lpu_device',
      };
      if (this.scaling_group === '' && this.scaling_groups.length > 0) {
        // no scaling group in the current project
        resourcePresetInfo.scaling_groups[''] = {
          using: { cpu: 0, mem: 0 },
          remaining: { cpu: 0, mem: 0 },
        };
      } else if (
        this.scaling_groups.length === 0 ||
        resourcePresetInfo.scaling_groups[this.scaling_group] === undefined
      ) {
        this.aggregate_updating = false;
        return Promise.resolve(false);
      }
      const scaling_group_resource_using =
        resourcePresetInfo.scaling_groups[this.scaling_group].using;
      const scaling_group_resource_remaining =
        resourcePresetInfo.scaling_groups[this.scaling_group].remaining;
      const keypair_resource_limit = resourcePresetInfo.keypair_limits;

      if ('cpu' in keypair_resource_limit) {
        total_resource_group_slot['cpu'] =
          Number(scaling_group_resource_remaining.cpu) +
          Number(scaling_group_resource_using.cpu);
        total_project_slot['cpu'] = Number(project_resource_total.cpu);
        if (keypair_resource_limit['cpu'] === 'Infinity') {
          // When resource is infinity, use scaling group limit instead.
          total_slot['cpu'] = total_resource_group_slot['cpu'];
        } else {
          total_slot['cpu'] = keypair_resource_limit['cpu'];
        }
      }
      if ('mem' in keypair_resource_limit) {
        total_resource_group_slot['mem'] =
          parseFloat(
            globalThis.backendaiclient.utils.changeBinaryUnit(
              scaling_group_resource_remaining.mem,
              'g',
            ),
          ) +
          parseFloat(
            globalThis.backendaiclient.utils.changeBinaryUnit(
              scaling_group_resource_using.mem,
              'g',
            ),
          );
        total_project_slot['mem'] = parseFloat(
          globalThis.backendaiclient.utils.changeBinaryUnit(
            project_resource_total.mem,
            'g',
          ),
        );
        if (keypair_resource_limit['mem'] === 'Infinity') {
          total_slot['mem'] = total_resource_group_slot['mem'];
        } else {
          total_slot['mem'] = parseFloat(
            globalThis.backendaiclient.utils.changeBinaryUnit(
              keypair_resource_limit['mem'],
              'g',
            ),
          );
        }
      }
      for (const [slot_key, slot_name] of Object.entries(device_list)) {
        if (slot_key in keypair_resource_limit) {
          total_resource_group_slot[slot_name] =
            Number(scaling_group_resource_remaining[slot_key]) +
            Number(scaling_group_resource_using[slot_key]);
          total_project_slot[slot_name] = Number(
            project_resource_total[slot_key],
          );
          if (keypair_resource_limit[slot_key] === 'Infinity') {
            total_slot[slot_name] = total_resource_group_slot[slot_name];
          } else {
            total_slot[slot_name] = keypair_resource_limit[slot_key];
          }
        }
      }

      const remaining_slot: Record<number, unknown> = Object();
      const used_slot: Record<number, unknown> = Object();
      const remaining_sg_slot: Record<string, unknown> = Object();
      const used_resource_group_slot: Record<number, unknown> = Object();
      const used_project_slot: Record<number, unknown> = Object();

      if ('cpu' in resource_remaining) {
        // Monkeypatch: manager reports Infinity to cpu.
        if ('cpu' in resource_using) {
          used_slot['cpu'] = resource_using['cpu'];
        } else {
          used_slot['cpu'] = 0;
        }
        if (resource_remaining['cpu'] === 'Infinity') {
          // Monkeypatch: manager reports Infinity to mem.
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
          used_slot['mem'] = parseFloat(
            globalThis.backendaiclient.utils.changeBinaryUnit(
              resource_using['mem'],
              'g',
            ),
          );
        } else {
          used_slot['mem'] = 0.0;
        }
        if (resource_remaining['mem'] === 'Infinity') {
          // Monkeypatch: manager reports Infinity to mem.
          remaining_slot['mem'] = total_slot['mem'] - used_slot['mem'];
        } else {
          remaining_slot['mem'] = parseFloat(
            globalThis.backendaiclient.utils.changeBinaryUnit(
              resource_remaining['mem'],
              'g',
            ),
          );
        }
      }
      if ('mem' in scaling_group_resource_remaining) {
        if ('mem' in scaling_group_resource_using) {
          used_resource_group_slot['mem'] = parseFloat(
            globalThis.backendaiclient.utils.changeBinaryUnit(
              scaling_group_resource_using['mem'],
              'g',
            ),
          );
        } else {
          used_resource_group_slot['mem'] = 0.0;
        }
        remaining_sg_slot['mem'] = parseFloat(
          globalThis.backendaiclient.utils.changeBinaryUnit(
            scaling_group_resource_remaining['mem'],
            'g',
          ),
        );
      }
      if ('mem' in project_resource_using) {
        used_project_slot['mem'] = parseFloat(
          globalThis.backendaiclient.utils.changeBinaryUnit(
            project_resource_using['mem'],
            'g',
          ),
        );
      } else {
        used_project_slot['mem'] = 0.0;
      }
      for (const [slot_key, slot_name] of Object.entries(device_list)) {
        if (slot_key in resource_remaining) {
          remaining_slot[slot_name] = resource_remaining[slot_key];
          if (slot_key in resource_using) {
            used_slot[slot_name] = resource_using[slot_key];
          } else {
            used_slot[slot_name] = 0;
          }
        }
        if (slot_key in scaling_group_resource_remaining) {
          remaining_sg_slot[slot_name] =
            scaling_group_resource_remaining[slot_key];
          if (slot_key in scaling_group_resource_using) {
            used_resource_group_slot[slot_name] =
              scaling_group_resource_using[slot_key];
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

      if (!globalThis.backendaiclient._config.hideAgents) {
        // When `hideAgents` is false, we display the total resources of the current resoure group.

        const status = 'ALIVE';
        // TODO: Let's assume that the number of agents is less than 100 for
        //       user-accessible resource group. This will meet our current
        //       need, but we need to fix this when refactoring the resource
        //       indicator.
        const limit = 100;
        const offset = 0;
        const timeout = 10 * 1000;
        const fields = [
          'id',
          'status',
          'available_slots',
          'occupied_slots',
          'scaling_group',
          'schedulable',
        ];
        const agentSummaryList =
          await globalThis.backendaiclient.agentSummary.list(
            status,
            fields,
            limit,
            offset,
            timeout,
          );
        // resourceGroupSlots will have three fields: available, occupied, and remaining.
        const resourceGroupSlots = agentSummaryList.agent_summary_list?.items
          .filter(
            (agent) =>
              agent.scaling_group == this.scaling_group && agent.schedulable,
          )
          .map((agent) => {
            const availableSlots = JSON.parse(agent.available_slots);
            const occupiedSlots = JSON.parse(agent.occupied_slots);
            return {
              available: {
                cpu: parseInt(availableSlots?.['cpu'] ?? 0),
                mem: parseFloat(
                  globalThis.backendaiclient.utils.changeBinaryUnit(
                    availableSlots?.['mem'] ?? 0,
                    'g',
                  ),
                ),
                cuda_device: parseInt(availableSlots?.['cuda.device'] ?? 0),
                cuda_shares: parseFloat(availableSlots?.['cuda.shares'] ?? 0),
              },
              occupied: {
                cpu: parseInt(occupiedSlots?.['cpu'] ?? 0),
                mem: parseFloat(
                  globalThis.backendaiclient.utils.changeBinaryUnit(
                    occupiedSlots?.['mem'] ?? 0,
                    'g',
                  ),
                ),
                cuda_device: parseInt(occupiedSlots?.['cuda.device'] ?? 0),
                cuda_shares: parseFloat(occupiedSlots?.['cuda.shares'] ?? 0),
              },
            };
          })
          .reduce(
            (acc, curr) => {
              Object.keys(curr.available).forEach(
                (key) => (acc.available[key] += curr.available[key]),
              );
              Object.keys(curr.occupied).forEach(
                (key) => (acc.occupied[key] += curr.occupied[key]),
              );
              return acc;
            },
            {
              available: { cpu: 0, mem: 0, cuda_device: 0, cuda_shares: 0 },
              occupied: { cpu: 0, mem: 0, cuda_device: 0, cuda_shares: 0 },
            },
          );
        if (resourceGroupSlots !== undefined) {
          resourceGroupSlots.remaining = {};
          Object.keys(resourceGroupSlots.available).forEach((key) => {
            resourceGroupSlots.remaining[key] =
              resourceGroupSlots.available[key] -
              resourceGroupSlots.occupied[key];
          });
          this.total_resource_group_slot = this._roundResourceDecimalPlaces(
            resourceGroupSlots.available,
          );
          // This value is purposely set to the remaining resource group slots
          // when `hideAgents` is `true`.  There are some cases it is more useful
          // to display the remaining slots.
          this.used_resource_group_slot = this._roundResourceDecimalPlaces(
            resourceGroupSlots.occupied,
          );
        }
      } else {
        this.total_resource_group_slot = this._roundResourceDecimalPlaces(
          total_resource_group_slot,
        );
        this.used_resource_group_slot = this._roundResourceDecimalPlaces(
          used_resource_group_slot,
        );
      }
      // Post formatting
      this.total_slot = this._roundResourceDecimalPlaces(total_slot);
      this.used_slot = this._roundResourceDecimalPlaces(used_slot);
      this.total_project_slot =
        this._roundResourceDecimalPlaces(total_project_slot);
      this.used_project_slot =
        this._roundResourceDecimalPlaces(used_project_slot);

      const used_slot_percent = {};
      const used_resource_group_slot_percent = {};
      const used_project_slot_percent = {};

      Object.values(slotList).forEach((slot) => {
        if (slot in used_slot) {
          if (Number(total_slot[slot]) < Number(used_slot[slot])) {
            // Modify maximum resources when user have infinite resource
            total_slot[slot] = used_slot[slot];
          }
          if (total_slot[slot] != 0) {
            used_slot_percent[slot] =
              (used_slot[slot] / total_slot[slot]) * 100.0;
          } else {
            used_slot_percent[slot] = 0;
          }
          if (total_resource_group_slot[slot] != 0) {
            used_resource_group_slot_percent[slot] =
              (this.used_resource_group_slot[slot] /
                this.total_resource_group_slot[slot]) *
              100.0;
          } else {
            used_resource_group_slot_percent[slot] = 0;
          }
          if (total_project_slot[slot] != 0) {
            used_project_slot_percent[slot] =
              (used_project_slot[slot] / total_project_slot[slot]) * 100.0;
          } else {
            used_project_slot_percent[slot] = 0;
          }
        } else {
          used_slot_percent[slot] = 0;
          used_resource_group_slot_percent[slot] = 0;
          used_project_slot_percent[slot] = 0;
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
        used_slot_percent['concurrency'] =
          (this.concurrency_used / this.concurrency_max) * 100.0;
        remaining_slot['concurrency'] =
          this.concurrency_max - this.concurrency_used;
      }
      this.concurrency_limit = Math.min(
        remaining_slot['concurrency'],
        BackendAiResourceBroker.DEFAULT_CONCURRENT_SESSION_COUNT,
      );

      // Post formatting
      this.available_slot = this._roundResourceDecimalPlaces(remaining_sg_slot);
      this.used_slot_percent =
        this._roundResourceDecimalPlaces(used_slot_percent);
      this.used_resource_group_slot_percent = this._roundResourceDecimalPlaces(
        used_resource_group_slot_percent,
      );

      const availablePresets = resourcePresetInfo.presets
        .map((item) => {
          if (item.allocatable === true) {
            for (const [slotKey, slotName] of Object.entries(slotList)) {
              if (slotKey in item.resource_slots) {
                item[slotName] = item.resource_slots[slotKey];
              }
            }
          } else {
            // allocatable is determined based on when no resources are allocated.
            item.allocatable = true;
            for (const [slotKey, slotName] of Object.entries(slotList)) {
              if (
                slotKey in item.resource_slots &&
                slotName in this.total_resource_group_slot
              ) {
                const resourceSlot =
                  slotKey === 'mem'
                    ? globalThis.backendaiclient.utils.changeBinaryUnit(
                        item.resource_slots.mem,
                        'g',
                      )
                    : item.resource_slots[slotKey];
                const totalResourceGroupSlot =
                  this.total_resource_group_slot[slotName];
                if (
                  parseFloat(resourceSlot) <= parseFloat(totalResourceGroupSlot)
                ) {
                  item[slotName] = resourceSlot;
                } else {
                  item.allocatable = false;
                  break;
                }
              }
            }
          }
          // Change to binary unit
          item.mem = globalThis.backendaiclient.utils.changeBinaryUnit(
            item.resource_slots.mem,
            'g',
          );
          if (item.shared_memory) {
            item.shmem = globalThis.backendaiclient.utils.changeBinaryUnit(
              item.shared_memory,
              'g',
            );
          } else {
            item.shmem = null;
          }
          return item;
        })
        .filter((item) => item.allocatable)
        .sort((a, b) => (a['name'] > b['name'] ? 1 : -1));
      this.resource_templates = availablePresets;
      if (this.resource_templates_filtered.length === 0) {
        this.resource_templates_filtered = this.resource_templates;
      }
      this.lastQueryTime = Date.now();
      this.aggregate_updating = false;
      return Promise.resolve(true);
      // return this.available_slot;
    } catch (err) {
      this.lastQueryTime = Date.now();
      this.aggregate_updating = false;
      throw err;
    }
  }

  _roundResourceDecimalPlaces(resourceSlots: Object, roundUpNumber = 2) {
    Object.keys(resourceSlots).map((resource) => {
      // convert undefined or NaN to 0
      let resourceValue = Number(
        isNaN(resourceSlots[resource]) ? 0 : resourceSlots[resource],
      ).toString();

      // clamp to roundUpNumber if the number of decimal place exceeds
      if (
        !Number.isInteger(Number(resourceValue)) &&
        resourceValue.split('.')[1]?.length > roundUpNumber
      ) {
        resourceValue = (Math.round(Number(resourceValue) * 100) / 100).toFixed(
          2,
        );
      }
      resourceSlots[resource] = resourceValue;
    });
    return resourceSlots;
  }

  /**
   * Get available / total resources from manager
   *
   * @param {string} from - set the value for debugging purpose.
   */
  aggregateResource(from = '') {
    // console.log('aggregate resource called - ', from);
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this._aggregateCurrentResource(from);
        },
        true,
      );
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
      'name',
      'humanized_name',
      'tag',
      'registry',
      'architecture',
      'digest',
      'installed',
      'resource_limits { key min max }',
      'labels { key value }',
    ];
    return globalThis.backendaiclient.image
      .list(fields, true, false)
      .then((response) => {
        if (response.images.length === 0) {
          return;
        }
        this.images = response.images;
        this.supports = {};
        this.supportImages = {};
        this.imageRequirements = {};
        this.imageArchitectures = {};
        this.imageRoles = {};
        const privateImages: object = {};
        Object.keys(this.images).map((objectKey, index) => {
          const item = this.images[objectKey];
          const supportsKey = `${item.registry}/${item.name}`;
          if (!(supportsKey in this.supports)) {
            this.supports[supportsKey] = [];
          }
          // check if tag already exists since we can have multiple images with same tag and different architecture
          if (this.supports[supportsKey].indexOf(item.tag) === -1) {
            this.supports[supportsKey].push(item.tag);
          }
          let imageName: string;
          const specs: string[] = item.name.split('/');
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
                category: 'Custom',
                tag: 'Custom',
                color: 'black',
              },
            ],
          };
          // Fallback routine if image has no metadata
          if (!('group' in this.supportImages[supportsKey])) {
            this.supportImages[supportsKey].group = 'Custom Environments';
          }
          this.resourceLimits[`${supportsKey}:${item.tag}`] =
            item.resource_limits;
          this.imageRequirements[`${supportsKey}:${item.tag}`] = {};
          if (!this.imageArchitectures[`${supportsKey}:${item.tag}`]) {
            this.imageArchitectures[`${supportsKey}:${item.tag}`] = [];
          }
          this.imageArchitectures[`${supportsKey}:${item.tag}`].push(
            item.architecture,
          );
          this.imageRoles[`${supportsKey}`] = 'COMPUTE'; // Default role is COMPUTE.
          this.imageRuntimeConfig[`${supportsKey}:${item.tag}`] = {};
          item.labels.forEach((label) => {
            if (label['key'] === 'com.nvidia.tensorflow.version') {
              this.imageRequirements[`${supportsKey}:${item.tag}`][
                'framework'
              ] = 'TensorFlow ' + label['value'];
            }
            if (label['key'] === 'com.nvidia.pytorch.version') {
              this.imageRequirements[`${supportsKey}:${item.tag}`][
                'framework'
              ] = 'PyTorch ' + label['value'];
            }
            if (
              label['key'] === 'ai.backend.features' &&
              label['value'].includes('private')
            ) {
              if (!(supportsKey in privateImages)) {
                privateImages[supportsKey] = [];
              }
              privateImages[supportsKey].push(item.tag);
            }
            if (
              label['key'] === 'ai.backend.role' &&
              ['COMPUTE', 'INFERENCE', 'SYSTEM'].includes(label['value'])
            ) {
              this.imageRoles[`${supportsKey}`] = label['value'];
            }
            if (label['key'] === 'ai.backend.model-path') {
              this.imageRuntimeConfig[`${supportsKey}:${item.tag}`][
                'model-path'
              ] = label['value'];
            }
          });
        });
        Object.keys(privateImages).forEach((key) => {
          // Hide "private" images.
          const tags = this.supports[key];
          this.supports[key] = tags.filter(
            (tag) => !privateImages[key].includes(tag),
          );
          if (this.supports[key].length < 1) {
            // If there is no available version, remove the environment itself.
            delete this.supports[key];
            // delete this.supportImages[key];
          }
        });
        this._updateEnvironment();
      })
      .catch((err) => {
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
      const specs = kernelName.split('/');
      if (specs.length == 2) {
        imageName = specs[1];
      } else {
        imageName = specs[2];
      }
      if (imageName === item) {
        humanizedName = candidate[item];
        matchedString = item;
      } else if (
        imageName === '' &&
        kernelName.endsWith(item) &&
        item.length < matchedString.length
      ) {
        humanizedName = candidate[item];
        matchedString = item;
      }
    });
    return humanizedName;
  }

  _cap(text) {
    if (!text.includes('/')) {
      text = text.replace(/^./, text[0].toUpperCase());
    }
    return text;
  }

  _updateEnvironment() {
    const langs = Object.keys(this.supports);
    if (langs === undefined) return;
    langs.sort((a, b) =>
      this.supportImages[a].group > this.supportImages[b].group ? 1 : -1,
    ); // TODO: fix this to rearrange kernels
    let interCategory = '';
    this.languages = [];
    langs.forEach((item, index) => {
      if (!Object.keys(this.aliases).includes(item)) {
        const humanizedName = this._guessHumanizedNames(item);
        if (humanizedName !== null) {
          this.aliases[item] = humanizedName;
        } else {
          this.aliases[item] = item;
        }
      }
      const specs = item.split('/');
      const registry = specs[0];
      let prefix;
      let kernelName;
      if (specs.length == 2) {
        prefix = '';
        kernelName = specs[1];
      } else if (specs.length > 2) {
        prefix = specs.slice(1, specs.length - 1).join('/');
        kernelName = specs[specs.length - 1];
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

      let tags: Record<string, unknown>[] = [];
      if (kernelName in this.tags) {
        tags = tags.concat(this.tags[kernelName]);
      }
      if (prefix != '' && !['lablup', 'cloud', 'stable'].includes(prefix)) {
        tags.push({
          tag: this._cap(prefix),
          color: 'purple',
        });
      }
      let icon = 'default.png';
      if (kernelName in this.icons) {
        icon = this.icons[kernelName];
      }
      if (
        globalThis.backendaiclient._config &&
        globalThis.backendaiclient._config.allow_image_list !== undefined &&
        globalThis.backendaiclient._config.allow_image_list.length > 0 &&
        !globalThis.backendaiclient._config.allow_image_list.includes(item)
      ) {
        // Do nothing
      } else {
        if (interCategory !== this.supportImages[item].group) {
          this.languages.push({
            name: '',
            registry: '',
            prefix: '',
            kernelname: '',
            alias: '',
            icon: '',
            basename: this.supportImages[item].group,
            tags: [],
            clickable: false,
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
          icon: icon,
        });
      }
    });
    // this._initAliases();
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
    if (
      globalThis.backendaiclient._config.default_session_environment !==
        undefined &&
      'default_session_environment' in globalThis.backendaiclient._config &&
      globalThis.backendaiclient._config.default_session_environment !== ''
    ) {
      this.default_language =
        globalThis.backendaiclient._config.default_session_environment;
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
    'backend-ai-resource-broker': BackendAiResourceBroker;
  }
}
