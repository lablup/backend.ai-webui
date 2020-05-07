/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {BackendAIPage} from './backend-ai-page';

import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-item/paper-item';

import '@material/mwc-select';
import '../plastics/mwc/mwc-multi-select';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-icon-button';
import '@material/mwc-textfield/mwc-textfield';

import 'weightless/button';
import 'weightless/card';
import 'weightless/checkbox';
import 'weightless/dialog';
import 'weightless/expansion';
import 'weightless/icon';
import 'weightless/label';
import 'weightless/radio';
import 'weightless/select';
import 'weightless/slider';

import '@material/mwc-linear-progress';

import './lablup-slider';

import {default as PainKiller} from "./backend-ai-painkiller";

import '../plastics/lablup-shields/lablup-shields';
import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

@customElement("backend-ai-resource-monitor")
export default class BackendAiResourceMonitor extends BackendAIPage {
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
  @property({type: Number}) lastQueryTime = 0;
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
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        wl-card h4 {
          padding: 5px 20px;
          border-bottom: 1px solid #dddddd;
          font-weight: 100;
        }

        lablup-slider {
          width: 210px !important;
          --textfield-width: 50px;
          --slider-width: 135px;
        }

        lablup-slider.mem,
        lablup-slider.shmem {
          --slider-color: var(--paper-orange-400);
        }

        lablup-slider.cpu {
          --slider-color: var(--paper-light-green-400);
        }

        lablup-slider.gpu {
          --slider-color: var(--paper-cyan-400);
        }

        lablup-slider.session {
          --slider-color: var(--paper-pink-400);
        }

        mwc-linear-progress {
          width: 90px;
          height: 5px;
          --mdc-theme-primary: #98be5a;
        }

        mwc-linear-progress.project-bar {
          height: 15px;
        }

        mwc-linear-progress.start-bar {
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
          --mdc-theme-primary: #3677eb;
        }

        mwc-linear-progress.middle-bar {
          --mdc-theme-primary: #4f8b46;
        }

        mwc-linear-progress.end-bar {
          border-bottom-left-radius: 3px;
          border-bottom-right-radius: 3px;
          --mdc-theme-primary: #98be5a;
        }

        mwc-linear-progress.full-bar {
          border-radius: 3px;
          height: 10px;
        }

        .resources.horizontal .short-indicator mwc-linear-progress {
          width: 50px;
        }

        .resources.horizontal .short-indicator .gauge-label {
          width: 50px;
        }

        span.caption {
          width: 30px;
          display: block;
          font-size: 12px;
          padding-left: 10px;
        }

        div.caption {
          font-size: 12px;
          width: 100px;
        }

        #resource-gauges.horizontal {
          position: absolute;
          top: 48px;
          z-index: 100;
          left: 160px;
          width: 420px;
          height: 48px;
          color: #ffffff;
          background-color: transparent;
        }

        wl-icon {
          --icon-size: 24px;
        }

        img.resource-type-icon {
          width: 24px;
          height: 24px;
        }

        @media screen and (max-width: 749px) {
          #resource-gauge-toggle.horizontal {
            display: flex;
          }

          #resource-gauge-toggle.vertical {
            display: none;
          }

          #resource-gauges.horizontal {
            display: none;
          }

          #resource-gauges.vertical {
            display: flex;
          }

        }

        @media screen and (min-width: 750px) {
          #resource-gauge-toggle {
            display: none;
          }

          #resource-gauges.horizontal,
          #resource-gauges.vertical {
            display: flex;
          }
        }

        div.resource-type {
          font-size: 14px;
          width: 70px;
        }

        .resources.horizontal .monitor.session {
          margin-left: 5px;
        }

        .gauge-name {
          font-size: 10px;
        }

        .gauge-label {
          width: 100px;
          font-weight: 300;
          font-size: 12px;
        }

        .indicator {
          font-family: monospace;
        }

        .resource-button {
          height: 140px;
          width: 120px;
          margin: 5px;
          padding: 0;
          font-size: 14px;
        }

        #new-session-dialog {
          z-index: 100;
        }

        wl-select {
          --input-bg: transparent;
          --input-color: rgb(24, 24, 24);
          --input-color-disabled: rgb(24, 24, 24);
          --input-label-color: rgb(24, 24, 24);
          --input-label-font-size: 10px;
          --input-border-style: 0;
          --input-font-family: 'Quicksand', Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
        }

        #scaling-group-select {
          width: 250px;
        }

        wl-button.resource-button.iron-selected {
          --button-color: var(--paper-red-600);
          --button-bg: var(--paper-red-600);
          --button-bg-active: var(--paper-red-600);
          --button-bg-hover: var(--paper-red-600);
          --button-bg-active-flat: var(--paper-orange-50);
          --button-bg-flat: var(--paper-orange-50);
        }

        .resource-button h4 {
          padding: 5px 0;
          margin: 0;
          font-weight: 400;
        }

        .resource-button ul {
          padding: 0;
          list-style-type: none;
        }

        #scaling-groups {
          width: 50%;
        }

        #launch-session {
          --button-bg: var(--paper-red-50);
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-600);
        }

        wl-button.launch-button {
          width: 335px;
          --button-bg: var(--paper-red-50);
          --button-bg-active: var(--paper-red-300);
          --button-bg-hover: var(--paper-red-300);
          --button-bg-active-flat: var(--paper-orange-50);
          --button-color: var(--paper-red-600);
          --button-color-active: red;
          --button-color-hover: red;
        }

        wl-button.resource-button {
          --button-bg: white;
          --button-bg-active: var(--paper-red-600);
          --button-bg-hover: var(--paper-red-600);
          --button-bg-active-flat: var(--paper-orange-50);
          --button-color: #8899aa;
          --button-color-active: red;
          --button-color-hover: red;
        }

        wl-expansion {
          --font-family-serif: 'Quicksand', Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
          --expansion-elevation: 0;
          --expansion-elevation-open: 0;
          --expansion-elevation-hover: 0;
          --expansion-margin-open: 0;
        }

        wl-expansion span {
          font-size: 20px;
          font-weight: 200;
          display: block;
        }

        .resources .monitor {
          margin-right: 5px;
        }

        .resources.vertical .monitor {
          margin-bottom: 10px;
        }

        .resources.vertical .monitor div:first-child {
          width: 40px;
        }

        mwc-select,
        mwc-multi-select {
          width: 100%;
          --mdc-theme-primary: var(--paper-red-600);
          --mdc-select-fill-color: transparent;
          --mdc-select-label-ink-color: rgba(0, 0, 0, 0.75);
          --mdc-select-dropdown-icon-color: blue;
          --mdc-select-idle-line-color: rgba(0, 0, 0, 0.42);
          --mdc-select-hover-line-color: rgba(255, 0, 0, 0.87);
          --mdc-select-outlined-idle-border-color: rgba(255, 0, 0, 0.42);
          --mdc-select-outlined-hover-border-color: rgba(255, 0, 0, 0.87);
          --mdc-theme-surface: white;
          --mdc-list-vertical-padding: 5px;
          --mdc-list-side-padding: 25px;
          --mdc-list-item__primary-text: {
            height: 20px;
          };
        }

        mwc-select#scaling-groups {
          margin-right: 5px;
          width: 190px;
        }

        mwc-textfield {
          width: 100%;
          --mdc-text-field-idle-line-color: rgba(0, 0, 0, 0.42);
          --mdc-text-field-hover-line-color: rgba(255, 0, 0, 0.87);
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--paper-red-600);
        }

        mwc-textfield#session-name {
          padding-top: 20px;
          margin-left: 5px;
        }

        #environment {
          --mdc-menu-item-height: 40px;
          z-index: 10000;
          max-height: 300px;
        }

        #version {
          --mdc-menu-item-height: 35px;
        }

        #vfolder {
          width: 100%;
        }

        #vfolder mwc-list-item[disabled] {
          background-color: rgba(255, 0, 0, 0.04) !important;
        }

        wl-button[fab] {
          --button-fab-size: 70px;
          border-radius: 6px;
        }

        wl-label {
          margin-right: 10px;
          outline: none;
        }

        #help-description {
          --dialog-width: 350px;
        }

        #help-description p {
          padding: 5px !important;
        }

        mwc-icon-button.info {
          --mdc-icon-button-size: 30px;
        }
      `];
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
      }
    );
    this.shadowRoot.querySelector('#environment').addEventListener('selected', this.updateLanguage.bind(this));
    this.version_selector = this.shadowRoot.querySelector('#version');
    this.version_selector.addEventListener('selected', this.updateResourceAllocationPane.bind(this));

    this.resourceGauge = this.shadowRoot.querySelector('#resource-gauges');
    if (document.body.clientWidth < 750 && this.direction == 'horizontal') {
      this.resourceGauge.style.display = 'none';
    }
    this.notification = globalThis.lablupNotification;
    const gpu_resource = this.shadowRoot.querySelector('#gpu-resource');
    document.addEventListener('backend-ai-resource-refreshed', () => {
      if (this.active && this.metadata_updating === false) {
        this.metadata_updating = true;
        this.aggregateResource('resource-refreshed');
        this.metadata_updating = false;
      }
    });
    gpu_resource.addEventListener('value-changed', () => {
      if (gpu_resource.value > 0) {
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = true;
      } else {
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = false;
      }
    });
    this.shadowRoot.querySelector('#use-gpu-checkbox').addEventListener('change', () => {
      if (this.shadowRoot.querySelector('#use-gpu-checkbox').checked === true) {
        this.shadowRoot.querySelector('#gpu-resource').disabled = this.cuda_gpu_metric.min === this.cuda_gpu_metric.max;
      } else {
        this.shadowRoot.querySelector('#gpu-resource').disabled = true;
      }
    });
    document.addEventListener("backend-ai-group-changed", (e) => {
      // this.scaling_group = '';
      this._updatePageVariables(true);
    });
  }

  _initAliases() {
    for (let item in this.aliases) {
      this.aliases[this.aliases[item]] = item;
    }
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
      this.lastQueryTime = 0; // Reset query interval
      if (forceUpdate === true) {
        await this._refreshResourcePolicy();
      } else {
        this.updateResourceAllocationPane('session dialog');
      }
    }
  }

  _updateSelectedFolder() {
    let folders = this.shadowRoot.querySelector('#vfolder');
    let selectedFolders = folders.value;
    let indexes = Array<number>();
    folders.items.map((item, index: number) => {
      if (selectedFolders.indexOf(item.value) > -1) {
        indexes.push(index);
      }
    });
    folders.select(indexes);
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
        this._disableEnterKey();
      }, true);
    } else {
      this.project_resource_monitor = globalThis.backendaiclient._config.allow_project_resource_monitor;
      await this._updatePageVariables(true);
      this._disableEnterKey();
    }
    //this.run_after_connection(this._updatePageVariables());
  }

  async _updatePageVariables(isChanged) {
    if (this.active && this.metadata_updating === false) {
      this.metadata_updating = true;
      if (isChanged) {
        this.lastQueryTime = 0; // Reset query interval
      }
      if (this.scaling_group === '' || isChanged) {
        const currentGroup = globalThis.backendaiclient.current_group || null;
        let sgs = await globalThis.backendaiclient.scalingGroup.list(currentGroup);
        // Make empty scaling group item if there is no scaling groups.
        this.scaling_groups = sgs.scaling_groups.length > 0 ? sgs.scaling_groups : [{name: ''}];
        this.scaling_group = this.scaling_groups[0].name;
        if (this.direction === 'vertical') {
          const scaling_group_selection_box = this.shadowRoot.querySelector('#scaling-group-select-box');
          // Detached from template to support live-update after creating new group (will need it)
          if (scaling_group_selection_box.hasChildNodes()) {
            scaling_group_selection_box.removeChild(scaling_group_selection_box.firstChild);
          }
          const scaling_select = document.createElement('wl-select');
          scaling_select.label = _text('session.launcher.ResourceGroup');
          scaling_select.name = 'scaling-group-select';
          scaling_select.id = 'scaling-group-select';
          scaling_select.value = this.scaling_group;
          scaling_select.addEventListener('input', this.updateScalingGroup.bind(this, true));

          let opt = document.createElement('option');
          opt.setAttribute('disabled', 'true');
          opt.innerHTML = _text('session.launcher.SelectResourceGroup');
          scaling_select.appendChild(opt);
          this.scaling_groups.map(group => {
            opt = document.createElement('option');
            opt.value = group.name;
            if (this.scaling_group === group.name) {
              opt.selected = true;
            } else {
              opt.selected = false;
            }
            opt.innerHTML = group.name;
            scaling_select.appendChild(opt);
          });
          //scaling_select.updateOptions();
          scaling_group_selection_box.appendChild(scaling_select);
        }
        const scaling_group_selection_dialog = this.shadowRoot.querySelector('#scaling-groups');
        scaling_group_selection_dialog.selectedText = this.scaling_group;
        scaling_group_selection_dialog.value = this.scaling_group;
        scaling_group_selection_dialog.addEventListener('selected-item-label-changed', () => {
          this.updateScalingGroup.bind(this, false);
        });
      }
      // update selected Scaling Group depends on project group
      this._updateSelectedScalingGroup();
      // Reload number of sessions
      let fields = ["created_at"];
      globalThis.backendaiclient.computeSession.list(fields = fields, status = "RUNNING", null, 1000)
        .then(res => {
          this.sessions_list = res.compute_session_list.items.map(e => e.created_at);
        });

      this._initAliases();
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
      this.updateResourceAllocationPane('refresh resource policy');
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

  async _launchSessionDialog() {
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      this.notification.text = 'Please wait while initializing...';
      this.notification.show();
    } else {
      this.selectDefaultLanguage();
      await this.updateResourceAllocationPane('launch session dialog');
      const gpu_resource = this.shadowRoot.querySelector('#gpu-resource');
      //this.shadowRoot.querySelector('#gpu-value'].textContent = gpu_resource.value;
      if (gpu_resource.value > 0) {
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = true;
      } else {
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = false;
      }

      // Set display property of ownership panel.
      const ownershipPanel = this.shadowRoot.querySelector('wl-expansion[name="ownership"]');
      if (globalThis.backendaiclient.is_admin) {
        ownershipPanel.style.display = 'block';
      } else {
        ownershipPanel.style.display = 'none';
      }
      this._updateSelectedScalingGroup();
      this.requestUpdate();
      this.shadowRoot.querySelector('#new-session-dialog').show();
    }
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

  _generateKernelIndex(kernel, version) {
    return kernel + ':' + version;
  }

  _newSession() {
    //let kernel = this.shadowRoot.querySelector('#environment').value;
    let selectedItem = this.shadowRoot.querySelector('#environment').selected;
    let kernel = selectedItem.id;
    let version = this.shadowRoot.querySelector('#version').value;
    let sessionName = this.shadowRoot.querySelector('#session-name').value;
    let vfolder = this.shadowRoot.querySelector('#vfolder').value;
    this.cpu_request = this.shadowRoot.querySelector('#cpu-resource').value;
    this.mem_request = this.shadowRoot.querySelector('#mem-resource').value;
    this.shmem_request = this.shadowRoot.querySelector('#shmem-resource').value;
    this.gpu_request = this.shadowRoot.querySelector('#gpu-resource').value;
    this.session_request = this.shadowRoot.querySelector('#session-resource').value;
    this.num_sessions = this.session_request;
    if (this.sessions_list.includes(sessionName)) {
      this.notification.text = "Duplicate session name not allowed.";
      this.notification.show();
      return;
    }
    if (kernel === "" || version === "" || version === "Not Selected") {
      this.notification.text = "You must specify Environment and Version.";
      this.notification.show();
      return;
    }
    if (this.enable_scaling_group) {
      this.scaling_group = this.shadowRoot.querySelector('#scaling-groups').value;
    }
    let config = {};
    config['group_name'] = globalThis.backendaiclient.current_group;
    config['domain'] = globalThis.backendaiclient._config.domainName;
    config['scaling_group'] = this.scaling_group;
    config['maxWaitSeconds'] = 5;
    const ownerEnabled = this.shadowRoot.querySelector('#owner-enabled');
    if (ownerEnabled && ownerEnabled.checked) {
      config['group_name'] = this.shadowRoot.querySelector('#owner-group').selectedItemLabel;
      config['domain'] = this.ownerDomain;
      config['scaling_group'] = this.shadowRoot.querySelector('#owner-scaling-group').selectedItemLabel;
      config['owner_access_key'] = this.shadowRoot.querySelector('#owner-accesskey').selectedItemLabel;
      if (!config['group_name'] || !config['domain'] || !config['scaling_group'] || !config ['owner_access_key']) {
        this.notification.text = 'Not enough ownership information';
        this.notification.show();
        return;
      }
    }
    config['cpu'] = this.cpu_request;
    if (this.gpu_mode == 'cuda.shares') {
      config['cuda.shares'] = this.gpu_request;
    } else {
      config['cuda.device'] = this.gpu_request;
    }

    if (String(this.shadowRoot.querySelector('#mem-resource').value) === "Infinity") {
      config['mem'] = String(this.shadowRoot.querySelector('#mem-resource').value);
    } else {
      config['mem'] = String(this.mem_request) + 'g';
    }
    if (this.shmem_request > this.mem_request) { // To prevent overflow of shared memory
      this.shmem_request = this.mem_request;
      this.notification.text = 'Shared memory setting is reduced to below the allocated memory.';
      this.notification.show();
    }
    if (this.mem_request > 4 && this.shmem_request < 1) { // Automatically increase shared memory to 1GB
      this.shmem_request = 1;
    }
    config['shmem'] = String(this.shmem_request) + 'g';

    if (this.shadowRoot.querySelector('#use-gpu-checkbox').checked !== true) {
      if (this.gpu_mode == 'cuda.shares') {
        config['fgpu'] = 0.0;
      } else {
        config['gpu'] = 0.0;
      }
    }
    if (sessionName.length == 0) { // No name is given
      sessionName = this.generateSessionId();
    }
    if (vfolder.length !== 0) {
      config['mounts'] = vfolder;
    }
    const kernelName: string = this._generateKernelIndex(kernel, version);
    this.shadowRoot.querySelector('#launch-button').disabled = true;
    this.shadowRoot.querySelector('#launch-button-msg').textContent = 'Preparing...';
    this.notification.text = 'Preparing session...';
    this.notification.show();

    let sessions: any = [];
    const randStr = this._getRandomString();

    if (this.num_sessions > 1) {
      for (let i = 1; i <= this.num_sessions; i++) {
        let add_session = {'kernelName': kernelName, 'sessionName': `${sessionName}-${randStr}-${i}`, config};
        sessions.push(add_session);
      }
    } else {
      sessions.push({'kernelName': kernelName, 'sessionName': sessionName, config});
    }

    const createSessionQueue = sessions.map(item => {
      return this._createKernel(item.kernelName, item.sessionName, item.config);
    });
    Promise.all(createSessionQueue).then((res) => {
      this.shadowRoot.querySelector('#new-session-dialog').hide();
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = 'Launch';
      this.aggregateResource('session-creation');
      let event = new CustomEvent("backend-ai-session-list-refreshed", {"detail": 'running'});
      document.dispatchEvent(event);
    }).catch((err) => {
      this.metadata_updating = false;
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      } else if (err && err.title) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.show(true, err);
      }
      let event = new CustomEvent("backend-ai-session-list-refreshed", {"detail": 'running'});
      document.dispatchEvent(event);
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = 'Launch';
    });
  }

  _getRandomString() {
    let randnum = Math.floor(Math.random() * 52 * 52 * 52);

    const parseNum = (num) => {
      if (num < 26) return String.fromCharCode(65 + num);
      else return String.fromCharCode(97 + num - 26);
    };

    let randstr = "";

    for (let i = 0; i < 3; i++) {
      randstr += parseNum(randnum % 52);
      randnum = Math.floor(randnum / 52);
    }

    return randstr;
  }

  _createKernel(kernelName, sessionName, config) {
    return globalThis.backendaiclient.createKernel(kernelName, sessionName, config);
  }

  _hideSessionDialog() {
    this.shadowRoot.querySelector('#new-session-dialog').hide();
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
    e.stopPropagation();
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

  _aliasName(value) {
    let alias = {
      'python': 'Python',
      'tensorflow': 'TensorFlow',
      'pytorch': 'PyTorch',
      'lua': 'Lua',
      'r': 'R',
      'r-base': 'R',
      'julia': 'Julia',
      'rust': 'Rust',
      'cpp': 'C++',
      'gcc': 'GCC',
      'go': 'Go',
      'tester': 'Tester',
      'haskell': 'Haskell',
      'matlab': 'MATLAB',
      'sagemath': 'Sage',
      'texlive': 'TeXLive',
      'java': 'Java',
      'php': 'PHP',
      'octave': 'Octave',
      'nodejs': 'Node',
      'caffe': 'Caffe',
      'scheme': 'Scheme',
      'scala': 'Scala',
      'base': 'Base',
      'cntk': 'CNTK',
      'h2o': 'H2O.AI',
      'digits': 'DIGITS',
      'ubuntu-linux': 'Ubuntu Linux',
      'tf1': 'TensorFlow 1',
      'tf2': 'TensorFlow 2',
      'py3': 'Python 3',
      'py2': 'Python 2',
      'py27': 'Python 2.7',
      'py35': 'Python 3.5',
      'py36': 'Python 3.6',
      'py37': 'Python 3.7',
      'py38': 'Python 3.8',
      'py39': 'Python 3.9',
      'lxde': 'LXDE',
      'lxqt': 'LXQt',
      'xfce': 'XFCE',
      'gnome': 'GNOME',
      'kde': 'KDE',
      'ubuntu16.04': 'Ubuntu 16.04',
      'ubuntu18.04': 'Ubuntu 18.04',
      'ubuntu20.04': 'Ubuntu 20.04',
      'intel': 'Intel MKL',
      '2018': '2018',
      '2019': '2019',
      '2020': '2020',
      '2021': '2021',
      '2022': '2022',
      'rocm': 'GPU:ROCm',
      'cuda9': 'GPU:CUDA9',
      'cuda10': 'GPU:CUDA10',
      'cuda10.0': 'GPU:CUDA10',
      'cuda10.1': 'GPU:CUDA10.1',
      'cuda10.2': 'GPU:CUDA10.2',
      'cuda10.3': 'GPU:CUDA10.3',
      'cuda11': 'GPU:CUDA11',
      'cuda11.0': 'GPU:CUDA11',
      'miniconda': 'Miniconda',
      'anaconda2018.12': 'Anaconda 2018.12',
      'anaconda2019.12': 'Anaconda 2019.12',
      'alpine3.8': 'Alpine Linux 3.8',
      'ngc': 'NVidia GPU Cloud',
      'ff': 'Research Env.',
    };
    if (value in alias) {
      return alias[value];
    } else {
      return value;
    }
  }

  _updateEnvironment() {
    // this.languages = Object.keys(this.supports);
    // this.languages.sort();
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
        //console.log(item);
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
    this._initAliases();
  }

  _updateVersions(kernel) {
    if (kernel in this.supports) {
      this.version_selector.disabled = true;
      let versions = this.supports[kernel];
      versions.sort();
      versions.reverse(); // New version comes first.
      this.versions = versions;
    } else {
      return;
    }
    if (this.versions !== undefined) {
      return this.version_selector.layout(true).then(() => {
        // Set version selector's value beforehand to update resources in
        // updateResourceAllocationPane method. Without this, LAUNCH button's disabled state is not
        // updated, so in some cases, user cannot launch a session even though
        // there are available resources for the selected image.
        this.version_selector.value = this.versions[0];
        setTimeout(async () => {
          this.version_selector.select(0);
          this.version_selector.select(1);
          this.version_selector.disabled = false;
          await this.updateComplete;
          this.updateResourceAllocationPane('update versions');
        }, 500);
      });
    }
  }

  generateSessionId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text + "-console";
  }

  async _updateVirtualFolderList() {
    let l = globalThis.backendaiclient.vfolder.list(globalThis.backendaiclient.current_group_id());
    l.then((value) => {
      //this.vfolders = value;
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
    if (Date.now() - this.lastQueryTime < 2000) {
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
            if (item.shared_memory) {
              item.shmem = globalThis.backendaiclient.utils.changeBinaryUnit(item.shared_memory, 'g');
            } else {
              item.shmem = null;
            }
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
      let device_list = {
        'cuda.device': 'cuda_device_slot',
        'cuda.shares': 'cuda_shares_slot',
        'rocm.device': 'tpu_device_slot',
        'tpu.device': 'tpu_device_slot'
      }


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

      for (let [slot_key, slot_name] of Object.entries(device_list)) {
        if (slot_key in keypair_resource_limit) {
          total_sg_slot[slot_name] = Number(scaling_group_resource_remaining[slot_key]) + Number(scaling_group_resource_using[slot_key]);
          total_pj_slot[slot_name] = Number(project_resource_total[slot_key]);
          if (keypair_resource_limit[slot_key] === 'Infinity') {
            total_slot[slot_name] = total_sg_slot[slot_name];
          } else {
            total_slot[slot_name] = keypair_resource_limit[slot_key];
          }
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
            used_sg_slot[slot_name] = scaling_group_resource_using[slot_key];
          } else {
            used_sg_slot[slot_name] = 0;
          }
        }
        if (slot_key in project_resource_using) {
          used_pj_slot[slot_name] = project_resource_using[slot_key];
        } else {
          used_pj_slot[slot_name] = 0;
        }
      }

      if ('cuda_shares_slot' in used_slot) {
        total_slot['cuda_shares_slot'] = parseFloat(total_slot['cuda_shares_slot']).toFixed(2);
      }
      if ('cuda_shares_slot' in used_sg_slot) {
        total_sg_slot['cuda_shares_slot'] = parseFloat(total_sg_slot['cuda_shares_slot']).toFixed(2);
      }
      if ('cuda_shares_slot' in used_pj_slot) {
        total_pj_slot['cuda_shares_slot'] = parseFloat(total_pj_slot['cuda_shares_slot']).toFixed(2);
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

      ['cpu_slot', 'mem_slot', 'cuda_device_slot', 'cuda_shares_slot', 'rocm_device_slot', 'tpu_device_slot'].forEach((slot) => {
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
      this.lastQueryTime = Date.now();
      this.aggregate_updating = false;
      return this.available_slot;
    }).catch(err => {
      this.lastQueryTime = Date.now();
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

  async updateResourceAllocationPane(from: string = '') {
    if (this.metric_updating == true) {
      //console.log('update metric blocked');
      return;
    }
    if (from === 'refresh resource policy') {
      //console.log('refreshing resource policy');
      this.metric_updating = false;
      return this._aggregateResourceUse('update-metric').then(() => {
        return this.updateResourceAllocationPane('after refresh resource policy');
      });
    }
    let selectedItem = this.shadowRoot.querySelector('#environment').selected;
    let selectedVersionItem = this.shadowRoot.querySelector('#version').selected;
    // Pulldown is not ready yet.
    if (selectedVersionItem === null) {
      this.metric_updating = false;
      return;
    }
    let selectedVersionValue = selectedVersionItem.value;
    // Environment is not selected yet.
    if (typeof selectedItem === 'undefined' || selectedItem === null || selectedItem.getAttribute("disabled")) {
      this.metric_updating = false;
      return;
    }
    //console.log('update metric from', from);
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.updateResourceAllocationPane(from);
      }, true);
    } else {
      this.metric_updating = true;
      await this._aggregateResourceUse('update-metric');
      // Resource limitation is not loaded yet.
      if (Object.keys(this.resourceLimits).length === 0) {
        this.metric_updating = false;
        return;
      }
      let kernel = selectedItem.id;
      let kernelVersion = selectedVersionValue;
      // Kernel or Kernel version information is missing
      if (kernel === '' || kernelVersion === '') {
        //console.log("No kernel / version");
        this.metric_updating = false;
        return;
      }
      let kernelName = kernel + ':' + kernelVersion;
      let currentResource = this.resourceLimits[kernelName];
      if (!currentResource) {
        this.metric_updating = false;
        return;
      }
      await this._updateVirtualFolderList();
      let available_slot = this.available_slot;

      // Post-UI markup to disable unchangeable values
      this.shadowRoot.querySelector('#cpu-resource').disabled = false;
      this.shadowRoot.querySelector('#mem-resource').disabled = false;
      this.shadowRoot.querySelector('#gpu-resource').disabled = false;
      this.shadowRoot.querySelector('#session-resource').disabled = false;
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = 'Launch';
      let disableLaunch = false;
      let shmem_metric: any = {
        'min': 0.0625,
        'max': 1,
        'preferred': 0.125
      };
      //console.log(currentResource);
      this.cuda_gpu_metric = {
        'min': 0,
        'max': 0
      };
      currentResource.forEach((item) => {
        if (item.key === 'cpu') {
          let cpu_metric = {...item};
          cpu_metric.min = parseInt(cpu_metric.min);
          if ('cpu' in this.userResourceLimit) {
            if (parseInt(cpu_metric.max) !== 0 && cpu_metric.max !== 'Infinity' && cpu_metric.max !== NaN) {
              cpu_metric.max = Math.min(parseInt(cpu_metric.max), parseInt(this.userResourceLimit.cpu), available_slot['cpu_slot']);
            } else {
              cpu_metric.max = Math.min(parseInt(this.userResourceLimit.cpu), available_slot['cpu_slot']);
            }
          } else {
            if (parseInt(cpu_metric.max) !== 0 && cpu_metric.max !== 'Infinity' && cpu_metric.max !== NaN) {
              cpu_metric.max = Math.min(parseInt(cpu_metric.max), available_slot['cpu_slot']);
            } else {
              cpu_metric.max = this.available_slot['cpu_slot'];
            }
          }
          if (cpu_metric.min >= cpu_metric.max) {
            if (cpu_metric.min > cpu_metric.max) {
              cpu_metric.min = cpu_metric.max;
              cpu_metric.max = cpu_metric.max + 1;
              disableLaunch = true;
              this.shadowRoot.querySelector('#cpu-resource').disabled = true;
            } else { // min == max
              cpu_metric.max = cpu_metric.max + 1;
              this.shadowRoot.querySelector('#cpu-resource').disabled = true;
            }
          }
          this.cpu_metric = cpu_metric;
        }
        if (item.key === 'cuda.device' && this.gpu_mode == 'cuda.device') {
          let gpu_metric = {...item};
          gpu_metric.min = parseInt(gpu_metric.min);
          if ('cuda.device' in this.userResourceLimit) {
            if (parseInt(gpu_metric.max) !== 0 && gpu_metric.max !== 'Infinity' && gpu_metric.max !== NaN) {
              gpu_metric.max = Math.min(parseInt(gpu_metric.max), parseInt(this.userResourceLimit['cuda.device']), available_slot['cuda_shares_slot']);
            } else {
              gpu_metric.max = Math.min(parseInt(this.userResourceLimit['cuda.device']), available_slot['cuda_device_slot']);
            }
          } else {
            if (parseInt(gpu_metric.max) !== 0) {
              gpu_metric.max = Math.min(parseInt(gpu_metric.max), available_slot['cuda_device_slot']);
            } else {
              gpu_metric.max = this.available_slot['cuda_device_slot'];
            }
          }
          if (gpu_metric.min >= gpu_metric.max) {
            if (gpu_metric.min > gpu_metric.max) {
              gpu_metric.min = gpu_metric.max;
              disableLaunch = true;
              this.shadowRoot.querySelector('#gpu-resource').disabled = true
            } else {
              gpu_metric.max = gpu_metric.max + 1;
              this.shadowRoot.querySelector('#gpu-resource').disabled = true
            }
          }
          this.cuda_gpu_metric = gpu_metric;
        }
        if (item.key === 'cuda.shares' && this.gpu_mode === 'cuda.shares') {
          let fgpu_metric = {...item};
          fgpu_metric.min = parseFloat(fgpu_metric.min);
          if ('cuda.shares' in this.userResourceLimit) {
            if (parseFloat(fgpu_metric.max) !== 0 && fgpu_metric.max !== 'Infinity' && fgpu_metric.max !== NaN) {
              fgpu_metric.max = Math.min(parseFloat(fgpu_metric.max), parseFloat(this.userResourceLimit['cuda.shares']), available_slot['cuda_shares_slot']);
            } else {

              fgpu_metric.max = Math.min(parseFloat(this.userResourceLimit['cuda.shares']), available_slot['cuda_shares_slot']);
            }
          } else {
            if (parseFloat(fgpu_metric.max) !== 0) {
              fgpu_metric.max = Math.min(parseFloat(fgpu_metric.max), available_slot['cuda_shares_slot']);
            } else {
              fgpu_metric.max = 0;
            }
          }
          if (fgpu_metric.min >= fgpu_metric.max) {
            if (fgpu_metric.min > fgpu_metric.max) {
              fgpu_metric.min = fgpu_metric.max;
              disableLaunch = true;
              this.shadowRoot.querySelector('#gpu-resource').disabled = true
            } else {
              fgpu_metric.max = fgpu_metric.max + 1;
              this.shadowRoot.querySelector('#gpu-resource').disabled = true
            }
          }

          this.cuda_fgpu_metric = fgpu_metric;
          if (fgpu_metric.max > 0) {
            this.cuda_gpu_metric = fgpu_metric;
          }
        }
        if (item.key === 'rocm.device' && this.gpu_mode === 'rocm.device') {
          let rocm_metric = {...item};
          rocm_metric.min = parseInt(rocm_metric.min);
          rocm_metric.max = parseInt(rocm_metric.max);
          if (rocm_metric.min > rocm_metric.max) {
            // TODO: dynamic maximum per user policy
          }
          this.rocm_gpu_metric = rocm_metric;
        }
        if (item.key === 'tpu') {
          let tpu_metric = {...item};
          tpu_metric.min = parseInt(tpu_metric.min);
          tpu_metric.max = parseInt(tpu_metric.max);
          if (tpu_metric.min > tpu_metric.max) {
            // TODO: dynamic maximum per user policy
          }
          this.tpu_metric = tpu_metric;
        }
        if (item.key === 'mem') {
          let mem_metric = {...item};
          mem_metric.min = globalThis.backendaiclient.utils.changeBinaryUnit(mem_metric.min, 'g');
          if (mem_metric.min < 0.1) {
            mem_metric.min = 0.1;
          }
          let image_mem_max = globalThis.backendaiclient.utils.changeBinaryUnit(mem_metric.max, 'g', 'g');
          if ('mem' in this.userResourceLimit) {
            let user_mem_max = globalThis.backendaiclient.utils.changeBinaryUnit(this.userResourceLimit['mem'], 'g');
            if (parseInt(image_mem_max) !== 0) {
              mem_metric.max = Math.min(parseFloat(image_mem_max), parseFloat(user_mem_max), available_slot['mem_slot']);
            } else {
              mem_metric.max = parseFloat(user_mem_max);
            }
          } else {
            if (parseInt(mem_metric.max) !== 0 && mem_metric.max !== 'Infinity' && isNaN(mem_metric.max) !== true) {
              mem_metric.max = Math.min(parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(mem_metric.max, 'g', 'g')), available_slot['mem_slot']);
            } else {
              mem_metric.max = available_slot['mem_slot']; // TODO: set to largest memory size
            }
          }
          if (mem_metric.min >= mem_metric.max) {
            if (mem_metric.min > mem_metric.max) {
              mem_metric.min = mem_metric.max;
              mem_metric.max = mem_metric.max + 1;
              disableLaunch = true;
              this.shadowRoot.querySelector('#mem-resource').disabled = true
            } else {
              mem_metric.max = mem_metric.max + 1;
              this.shadowRoot.querySelector('#mem-resource').disabled = true
            }
          }
          mem_metric.min = Number(mem_metric.min.toFixed(2));
          mem_metric.max = Number(mem_metric.max.toFixed(2));
          this.mem_metric = mem_metric;
        }
        if (item.key === 'shmem') { // Shared memory is preferred value. No min/max is required.
          shmem_metric = {...item};
          if ('preferred' in shmem_metric) {
            shmem_metric.preferred = globalThis.backendaiclient.utils.changeBinaryUnit(shmem_metric.preferred, 'g', 'g');
          } else {
            shmem_metric.preferred = 0.0625;
          }
        }
      });
      //console.log(this.cuda_gpu_metric);
      // Shared memory setting
      shmem_metric.max = this.mem_metric.max;
      shmem_metric.min = 0.0625; // 64m
      if (shmem_metric.min >= shmem_metric.max) {
        if (shmem_metric.min > shmem_metric.max) {
          shmem_metric.min = shmem_metric.max;
          shmem_metric.max = shmem_metric.max + 1;
          disableLaunch = true;
          this.shadowRoot.querySelector('#shmem-resource').disabled = true;
        } else {
          shmem_metric.max = shmem_metric.max + 1;
          this.shadowRoot.querySelector('#shmem-resource').disabled = true;
        }
      }
      shmem_metric.min = Number(shmem_metric.min.toFixed(2));
      shmem_metric.max = Number(shmem_metric.max.toFixed(2));
      this.shmem_metric = shmem_metric;

      // GPU metric
      if (this.cuda_gpu_metric.min == 0 && this.cuda_gpu_metric.max == 0) { // GPU is disabled (by image,too)
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = false;
        this.shadowRoot.querySelector('#gpu-resource').disabled = true;
        this.shadowRoot.querySelector('#gpu-resource').value = 0;
        if (this.resource_templates !== [] && this.resource_templates.length > 0) { // Remove mismatching templates
          let new_resource_templates: any = [];
          for (let i = 0; i < this.resource_templates.length; i++) {
            if (!('cuda_gpu' in this.resource_templates[i]) &&
              !('cuda_fgpu' in this.resource_templates[i])) {
              new_resource_templates.push(this.resource_templates[i]);
            } else if (parseFloat(this.resource_templates[i].cuda_gpu) <= 0.0 &&
              parseFloat(this.resource_templates[i].cuda_fgpu) <= 0.0) {
              new_resource_templates.push(this.resource_templates[i]);
            }
          }
          this.resource_templates_filtered = new_resource_templates;
        } else {
          this.resource_templates_filtered = this.resource_templates;
        }
      } else {
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = true;
        this.shadowRoot.querySelector('#gpu-resource').disabled = false;
        this.shadowRoot.querySelector('#gpu-resource').value = this.cuda_gpu_metric.max;
        this.resource_templates_filtered = this.resource_templates;
      }
      // Refresh with resource template
      if (this.resource_templates_filtered !== [] && this.resource_templates_filtered.length > 0) {
        let resource = this.resource_templates_filtered[0];
        this._chooseResourceTemplate(resource);
        let default_template = this.shadowRoot.querySelector('#resource-templates').getElementsByTagName('wl-button')[0];
        this.shadowRoot.querySelector('#resource-templates').selected = "0";
        default_template.setAttribute('active', true);
        //this.shadowRoot.querySelector('#' + resource.title + '-button').raised = true;
      } else {
        this._updateResourceIndicator(this.cpu_metric.min, this.mem_metric.min, 'none', 0);
      }
      if (disableLaunch) {
        this.shadowRoot.querySelector('#cpu-resource').disabled = true; // Not enough CPU. so no session.
        this.shadowRoot.querySelector('#mem-resource').disabled = true;
        this.shadowRoot.querySelector('#gpu-resource').disabled = true;
        this.shadowRoot.querySelector('#session-resource').disabled = true;
        this.shadowRoot.querySelector('#launch-button').disabled = true;
        this.shadowRoot.querySelector('#launch-button-msg').textContent = 'Not enough resource';
      }
      if (this.cuda_gpu_metric.min == this.cuda_gpu_metric.max) {
        this.shadowRoot.querySelector('#gpu-resource').max = this.cuda_gpu_metric.max + 1;
        this.shadowRoot.querySelector('#gpu-resource').disabled = true;
      }
      if (this.concurrency_limit == 1) {
        this.shadowRoot.querySelector('#session-resource').max = 2;
        this.shadowRoot.querySelector('#session-resource').value = 1;
        this.shadowRoot.querySelector('#session-resource').disabled = true;
      }
      this.metric_updating = false;
    }
  }

  updateLanguage() {
    let selectedItem = this.shadowRoot.querySelector('#environment').selected;
    if (selectedItem === null) return;
    let kernel = selectedItem.id;
    this._updateVersions(kernel);
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
      //console.log("update image list.", this.resourceLimits);
      this._updateEnvironment();
    }).catch((err) => {
      this.metadata_updating = false;
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  changed(e) {
    console.log(e);
  }

  isEmpty(item) {
    if (item.length === 0) {
      return true;
    }
    return false;
  }

  _toggleAdvancedSettings() {
    this.shadowRoot.querySelector('#advanced-resource-settings').toggle();
  }

  _chooseResourceTemplate(e) {
    let button;
    if (typeof e.cpu !== 'undefined') {
      button = e;
    } else {
      button = e.target.closest('wl-button');
    }
    const cpu = button.cpu;
    const mem = button.mem;
    const cuda_gpu = button.cuda_gpu;
    const cuda_fgpu = button.cuda_fgpu;
    const rocm_gpu = button.rocm_gpu;
    const tpu = button.tpu;
    let gpu_type, gpu_value;
    if ((typeof cuda_gpu !== 'undefined' || typeof cuda_fgpu !== 'undefined')) {
      if (typeof cuda_gpu === 'undefined') { // FGPU
        gpu_type = 'cuda.share';
        gpu_value = cuda_fgpu;
      } else {
        gpu_type = 'cuda.device';
        gpu_value = cuda_gpu;
      }
    } else if (typeof rocm_gpu !== 'undefined') {
      gpu_type = 'rocm.device';
      gpu_value = rocm_gpu;
    } else if (typeof tpu !== 'undefined') {
      gpu_type = 'tpu.device';
      gpu_value = tpu;
    } else {
      gpu_type = 'none';
      gpu_value = 0;
    }
    const shmem = button.shmem;
    this.shmem_request = shmem ? shmem : 0.0625;
    this._updateResourceIndicator(cpu, mem, gpu_type, gpu_value);
  }

  _updateResourceIndicator(cpu, mem, gpu_type, gpu_value) {
    this.shadowRoot.querySelector('#gpu-resource').value = gpu_value;
    this.shadowRoot.querySelector('#shmem-resource').value = this.shmem_request;
    this.cpu_request = cpu;
    this.mem_request = mem;
    this.gpu_request = gpu_value;
  }

  selectDefaultLanguage() {
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._selectDefaultLanguage();
      }, true);
    } else {
      this._selectDefaultLanguage();
    }
  }

  _selectDefaultLanguage() {
    if (this._default_language_updated === true) {
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
    let environment = this.shadowRoot.querySelector('#environment');
    //await environment.updateComplete; async way.
    let obj = environment.items.find(o => o.value === this.default_language);
    if (typeof obj === 'undefined') { // Not ready yet.
      setTimeout(() => {
        console.log('Environment selector is not ready yet. Trying to set the default language again.');
        this._selectDefaultLanguage();
      }, 500);
      return true;
    }
    let idx = environment.items.indexOf(obj);
    environment.select(idx);
    this._default_language_updated = true;
    return true;
  }

  _selectDefaultVersion(version) {
    return false;
  }

  async _fetchSessionOwnerGroups() {
    if (!this.ownerFeatureInitialized) {
      this.shadowRoot.querySelector('#owner-group').addEventListener('selected-item-label-changed', this._fetchSessionOwnerScalingGroups.bind(this));
      this.ownerFeatureInitialized = true;
    }
    const ownerEmail = this.shadowRoot.querySelector('#owner-email');
    const email = ownerEmail.value;
    if (!ownerEmail.checkValidity()) {
      this.notification.text = 'Invalid email address';
      this.notification.show();
      this.ownerKeypairs = [];
      this.ownerGroups = [];
      return;
    }

    /* Fetch keypair */
    const keypairs = await globalThis.backendaiclient.keypair.list(email, ['access_key']);
    this.ownerKeypairs = keypairs.keypairs;
    if (this.ownerKeypairs.length < 1) {
      this.notification.text = 'No active keypair';
      this.notification.show();
      this.ownerKeypairs = [];
      this.ownerGroups = [];
      return;
    }
    this.shadowRoot.querySelector('#owner-accesskey paper-listbox').selected = this.ownerKeypairs[0].access_key;

    /* Fetch domain / group information */
    const userInfo = await globalThis.backendaiclient.user.get(email, ['domain_name', 'groups {id name}']);
    this.ownerDomain = userInfo.user.domain_name;
    this.ownerGroups = userInfo.user.groups;
    if (this.ownerGroups) {
      this.shadowRoot.querySelector('#owner-group paper-listbox').selected = this.ownerGroups[0].name;
    }
  }

  async _fetchSessionOwnerScalingGroups() {
    const group = this.shadowRoot.querySelector('#owner-group').selectedItemLabel;
    if (!group) {
      this.ownerScalingGroups = [];
      return;
    }
    const sgroupInfo = await globalThis.backendaiclient.scalingGroup.list(group);
    this.ownerScalingGroups = sgroupInfo.scaling_groups;
    if (this.ownerScalingGroups) {
      this.shadowRoot.querySelector('#owner-scaling-group paper-listbox').selected = 0;
    }
  }

  _toggleResourceGauge() {
    if (this.resourceGauge.style.display == '' || this.resourceGauge.style.display == 'flex' || this.resourceGauge.style.display == 'block') {
      this.resourceGauge.style.display = 'none';
    } else {
      if (document.body.clientWidth < 750) {
        this.resourceGauge.style.left = '20px';
        this.resourceGauge.style.right = '20px';
        this.resourceGauge.style.backgroundColor = 'var(--paper-red-800)';
      } else {
        this.resourceGauge.style.backgroundColor = 'transparent';
      }
      this.resourceGauge.style.display = 'flex';
    }
  }

  _showKernelDescription(e, item) {
    e.stopPropagation();
    let name = item.kernelname;
    if (name in this.imageInfo && 'description' in this.imageInfo[name]) {
      let desc = this.shadowRoot.querySelector('#help-description');
      this._helpDescriptionTitle = this.imageInfo[name].name;
      this._helpDescription = this.imageInfo[name].description;
      this._helpDescriptionIcon = item.icon;
      desc.show();
    } else {
      if (name in this.imageInfo) {
        this._helpDescriptionTitle = this.imageInfo[name].name;
      } else {
        this._helpDescriptionTitle = name;
      }
      this._helpDescription = "No description found.";
    }
  }

  _showResourceDescription(e, item) {
    e.stopPropagation();
    const resource_description = {
      'cpu': {
        'name': _text("session.launcher.CPU"),
        'desc': _text("session.launcher.DescCPU")
      },
      'mem': {
        'name': _text("session.launcher.Memory"),
        'desc': _text("session.launcher.DescMemory")
      },
      'shmem': {
        'name': _text("session.launcher.SharedMemory"),
        'desc': _text("session.launcher.DescSharedMemory")
      },
      'gpu': {
        'name': _text("session.launcher.GPU"),
        'desc': _text("session.launcher.DescGPU")
      },
      'session': {
        'name': _text("session.launcher.TitleSession"),
        'desc': _text("session.launcher.DescSession")
      }
    };
    if (item in resource_description) {
      this._helpDescriptionTitle = resource_description[item].name;
      this._helpDescription = resource_description[item].desc;
      this._helpDescriptionIcon = '';
      let desc = this.shadowRoot.querySelector('#help-description');
      desc.show();
    }
  }

  _getVersionInfo(version) {
    let info: any = [];
    let fragment = version.split('-');
    info.push({ // Version
      tag: this._aliasName(fragment[0]),
      color: 'blue',
      size: '80px'
    });
    if (fragment.length > 1) {
      info.push({ // Language
        tag: this._aliasName(fragment[1]),
        color: 'red',
        size: '120px'
      });
    }
    if (fragment.length > 2) {
      let requirements = this._aliasName(fragment[2]).split(':');
      if (requirements.length > 1) {
        info.push({ // Additional information
          tag: requirements[1],
          app: requirements[0],
          color: 'green',
          size: '150px'
        });
      } else {
        info.push({ // Additional information
          tag: requirements[0],
          color: 'green',
          size: '150px'
        });
      }
    }
    return info;
  }

  _disableEnterKey() {
    this.shadowRoot.querySelectorAll('wl-expansion').forEach(element => {
      element.onKeyDown = (e) => {
        let enterKey = 13;
        if (e.keyCode === enterKey) {
          e.preventDefault();
        }
      }
    });
  }

  render() {
    // language=HTML
    return html`
      ${this.enable_scaling_group && this.direction === 'vertical' ? html`
      <div id="scaling-group-select-box" class="layout horizontal start-justified">
      </div>
      ` : html``}
      <div class="layout horizontal">
        <mwc-icon-button id="resource-gauge-toggle" icon="assessment" class="fg blue ${this.direction}"
          @click="${() => this._toggleResourceGauge()}">
        </mwc-icon-button>
        <div id="resource-gauges" class="layout ${this.direction} resources flex" style="align-items: flex-start">
        ${this.direction === 'horizontal' ? html`
          <div class="layout vertical end-justified wrap short-indicator">
            <span class="gauge-label">${_t('session.launcher.TOTAL')}</span>
            <div style="font-size:8px;height:10px;">${_t('session.launcher.RESOURCE')}</div>
            <span class="gauge-label">${_t('session.launcher.MY')}</span>
          </div>
          ` : html``}
          <div class="layout horizontal start-justified monitor">
            <div class="layout vertical center center-justified" style="margin-right:5px;">
              <wl-icon class="fg blue">developer_board</wl-icon>
              <div class="gauge-name">CPU</div>
            </div>
            <div class="layout vertical start-justified wrap short-indicator">
              <span class="gauge-label">${this.used_sg_slot.cpu_slot}/${this.total_sg_slot.cpu_slot}</span>
              <mwc-linear-progress id="cpu-usage-bar" class="start-bar" progress="${this.used_sg_slot_percent.cpu_slot / 100.0}"></mwc-linear-progress>
              <mwc-linear-progress id="cpu-usage-bar-2" class="end-bar" progress="${this.used_slot_percent.cpu_slot / 100.0}"></mwc-linear-progress>
              <span class="gauge-label">${this.used_slot.cpu_slot}/${this.total_slot.cpu_slot}</span>
            </div>
          </div>
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified" style="margin-right:5px;">
              <wl-icon class="fg blue">memory</wl-icon>
              <span class="gauge-name">RAM</span>
            </div>
            <div class="layout vertical start-justified wrap">
              <span class="gauge-label">${this.used_sg_slot.mem_slot}/${this.total_sg_slot.mem_slot}GB</span>
              <mwc-linear-progress id="mem-usage-bar" class="start-bar" progress="${this.used_sg_slot_percent.mem_slot / 100.0}"></mwc-linear-progress>
              <mwc-linear-progress id="mem-usage-bar-2" class="end-bar" progress="${this.used_slot_percent.mem_slot / 100.0}"></mwc-linear-progress>
              <span class="gauge-label">${this.used_slot.mem_slot}/${this.total_slot.mem_slot}GB</span>
            </div>
          </div>
          ${this.total_slot.cuda_device_slot ?
      html`
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified" style="margin-right:5px;">
              <img class="resource-type-icon fg green" src="/resources/icons/file_type_cuda.svg" />
              <span class="gauge-name">GPU</span>
            </div>
            <div class="layout vertical center-justified wrap short-indicator">
              <span class="gauge-label">${this.used_sg_slot.cuda_device_slot}/${this.total_sg_slot.cuda_device_slot}</span>
              <mwc-linear-progress id="gpu-usage-bar" class="start-bar" progress="${this.used_sg_slot_percent.cuda_device_slot / 100.0}"></mwc-linear-progress>
              <mwc-linear-progress id="gpu-usage-bar-2" class="end-bar" progress="${this.used_slot_percent.cuda_device_slot / 100.0}"></mwc-linear-progress>
              <span class="gauge-label">${this.used_slot.cuda_device_slot}/${this.total_slot.cuda_device_slot}</span>
            </div>
          </div>` :
      html``}
          ${this.total_slot.cuda_shares_slot && this.total_slot.cuda_shares_slot > 0 ?
      html`
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified" style="margin-right:5px;">
              <img class="resource-type-icon fg green" src="/resources/icons/file_type_cuda.svg" />
              <span class="gauge-name">FGPU</span>
            </div>
            <div class="layout vertical start-justified wrap short-indicator">
              <span class="gauge-label">${this.used_sg_slot.cuda_shares_slot}/${this.total_sg_slot.cuda_shares_slot}</span>
              <mwc-linear-progress id="gpu-usage-bar" class="start-bar" progress="${this.used_sg_slot_percent.cuda_shares_slot / 100.0}"></mwc-linear-progress>
              <mwc-linear-progress id="gpu-usage-bar-2" class="end-bar" progress="${this.used_slot_percent.cuda_shares_slot / 100.0}"></mwc-linear-progress>
              <span class="gauge-label">${this.used_slot.cuda_shares_slot}/${this.total_slot.cuda_shares_slot}</span>
            </div>
          </div>` :
      html``}
          ${this.total_slot.rocm_gpu_slot ?
      html`
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified" style="margin-right:5px;">
              <img class="resource-type-icon fg green" src="/resources/icons/ROCm.png" />
              <span class="gauge-name">ROCm<br/>GPU</span>
            </div>
            <div class="layout vertical center-justified wrap short-indicator">
              <span class="gauge-label">${this.used_sg_slot.rocm_gpu_slot}/${this.total_sg_slot.rocm_gpu_slot}</span>
              <mwc-linear-progress id="gpu-usage-bar" class="start-bar" progress="${this.used_sg_slot_percent.rocm_gpu_slot / 100.0}"></mwc-linear-progress>
              <mwc-linear-progress id="gpu-usage-bar-2" class="end-bar" progress="${this.used_slot_percent.rocm_gpu_slot / 100.0}"></mwc-linear-progress>
              <span class="gauge-label">${this.used_slot.rocm_gpu_slot}/${this.total_slot.rocm_gpu_slot}</span>
            </div>
          </div>` :
      html``}
          ${this.total_slot.tpu_slot ?
      html`
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified" style="margin-right:5px;">
              <wl-icon class="fg blue">view_module</wl-icon>
              <span class="gauge-name">TPU</span>
            </div>
            <div class="layout vertical center-justified wrap short-indicator">
              <span class="gauge-label">${this.used_sg_slot.tpu_slot}/${this.total_sg_slot.tpu_slot}</span>
              <mwc-linear-progress id="gpu-usage-bar" class="start-bar" progress="${this.used_sg_slot_percent.tpu_slot / 100.0}"></mwc-linear-progress>
              <mwc-linear-progress id="gpu-usage-bar-2" class="end-bar" progress="${this.used_slot_percent.tpu_slot / 100.0}"></mwc-linear-progress>
              <span class="gauge-label">${this.used_slot.tpu_slot}/${this.total_slot.tpu_slot}</span>
            </div>
          </div>` :
      html``}

          <div class="layout horizontal center-justified monitor session">
            <div class="layout vertical center center-justified" style="margin-right:5px;">
              <wl-icon class="fg blue">assignment</wl-icon>
              <span class="gauge-name">${_t('session.launcher.Session')}</span>
            </div>
            <div class="layout vertical start-justified wrap short-indicator">
              <span class="gauge-label">${this.concurrency_used}/${this.concurrency_max}</span>
              <mwc-linear-progress class="short full-bar" id="concurrency-usage-bar" progress="${this.used_slot_percent.concurrency / 100.0}"></mwc-linear-progress>
              <span class="gauge-label">&nbsp;</span>
            </div>
          </div>
        </div>
        <div class="layout vertical" style="align-self: center;">
          <wl-button class="fg red" id="launch-session" ?fab=${this.direction === 'vertical'} outlined @click="${() => this._launchSessionDialog()}">
            <wl-icon>add</wl-icon>
            ${_t("session.launcher.Start")}
          </wl-button>
        </div>
        <div class="flex"></div>
      </div>
      ${this.enable_scaling_group && this.direction === 'vertical' ? html`
      <div class="vertical start-justified layout">
        <div class="layout horizontal center start-justified">
          <div style="width:10px;height:10px;margin-left:10px;margin-right:3px;background-color:#4775E3;"></div>
          <span style="margin-right:5px;">${_t('session.launcher.CurrentResourceGroup')} (${this.scaling_group})</span>
        </div>
        <div class="layout horizontal center start-justified">
          <div style="width:10px;height:10px;margin-left:10px;margin-right:3px;background-color:#A0BD67"></div>
          <span style="margin-right:5px;">${_t('session.launcher.UserResourceLimit')}</span>
        </div>
      </div>
      ` : html``}
      ${this.direction === 'vertical' && this.project_resource_monitor === true &&
    (this.total_pj_slot.cpu_slot > 0 || this.total_pj_slot.cpu_slot === Infinity) ? html`
      <hr />
      <div class="vertical start-justified layout">
        <div class="flex"></div>
        <div class="layout horizontal center-justified monitor">
          <div class="layout vertical center center-justified" style="margin-right:5px;">
            <wl-icon class="fg blue">group_work</wl-icon>
            <span class="gauge-name">${_t('session.launcher.Project')}</span>
          </div>
          <div class="layout vertical start-justified wrap short-indicator">
            <div class="layout horizontal">
              <span style="width:35px; margin-left:5px; margin-right:5px;">CPU</span>
              <mwc-linear-progress id="cpu-project-usage-bar" class="start-bar project-bar" progress="${this.used_pj_slot_percent.cpu_slot / 100.0}"></mwc-linear-progress>
              <span style="margin-left:5px;">${this.used_pj_slot.cpu_slot}/${this.total_pj_slot.cpu_slot === Infinity ? '∞' : this.total_pj_slot.cpu_slot}</span>
            </div>
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">RAM</span>
              <mwc-linear-progress id="mem-project-usage-bar" class="middle-bar project-bar" progress="${this.used_pj_slot_percent.mem_slot / 100.0}"></mwc-linear-progress>
              <span style="margin-left:5px;">${this.used_pj_slot.mem_slot}/${this.total_pj_slot.mem_slot === Infinity ? '∞' : this.total_pj_slot.mem_slot}</span>
            </div>
            ${this.total_pj_slot.cuda_device_slot ? html`
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">GPU</span>
              <mwc-linear-progress id="gpu-project-usage-bar" class="end-bar project-bar" progress="${this.used_pj_slot_percent.cuda_device_slot / 100.0}"></mwc-linear-progress>
              <span style="margin-left:5px;">${this.used_pj_slot.cuda_device_slot}/${this.total_pj_slot.cuda_device_slot === 'Infinity' ? '∞' : this.total_pj_slot.cuda_device_slot}</span>
            </div>` : html``}
            ${this.total_pj_slot.cuda_shares_slot ? html`
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">fGPU</span>
              <mwc-linear-progress id="gpu-project-usage-bar" class="end-bar project-bar" progress="${this.used_pj_slot_percent.cuda_shares_slot / 100.0}"></mwc-linear-progress>
              <span style="margin-left:5px;">${this.used_pj_slot.cuda_shares_slot}/${this.total_pj_slot.cuda_shares_slot === 'Infinity' ? '∞' : this.total_pj_slot.cuda_shares_slot}</span>
            </div>` : html``}
            ${this.total_pj_slot.rocm_device_slot ? html`
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">GPU</span>
              <mwc-linear-progress id="gpu-project-usage-bar" class="end-bar project-bar" progress="${this.used_pj_slot_percent.rocm_device_slot / 100.0}"></mwc-linear-progress>
              <span style="margin-left:5px;">${this.used_pj_slot.rocm_device_slot}/${this.total_pj_slot.rocm_device_slot === 'Infinity' ? '∞' : this.total_pj_slot.rocm_device_slot}</span>
            </div>` : html``}
            ${this.total_pj_slot.tpu_device_slot ? html`
            <div class="layout horizontal">
              <span style="width:35px;margin-left:5px; margin-right:5px;">GPU</span>
              <mwc-linear-progress id="gpu-project-usage-bar" class="end-bar project-bar" progress="${this.used_pj_slot_percent.tpu_device_slot / 100.0}"></mwc-linear-progress>
              <span style="margin-left:5px;">${this.used_pj_slot.tpu_device_slot}/${this.total_pj_slot.tpu_device_slot === 'Infinity' ? '∞' : this.total_pj_slot.cuda_device_slot}</span>
            </div>` : html``}
          </div>
          <div class="flex"></div>
        </div>
      </div>
      ` : html``}
      <wl-dialog id="new-session-dialog" fixed backdrop blockscrolling persistent style="padding:0;">
        <wl-card class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>${_t("session.launcher.StartNewSession")}</span>
            <div class="flex"></div>
            <mwc-icon-button icon="close" class="blue close-button"
              @click="${() => this._hideSessionDialog()}">
            </mwc-icon-button>
          </h3>
          <form id="launch-session-form">
            <div class="vertical center layout" style="padding-top:15px;">
              <mwc-select id="environment" label="${_t("session.launcher.Environments")}" fullwidth required
                value="${this.default_language}">
                <mwc-list-item selected style="display:none!important;">${_t("session.launcher.ChooseEnvironment")}</mwc-list-item>
                  ${this.languages.map(item => html`
                    ${item.clickable === false ? html`
                      <h5 style="font-size:12px;padding: 0 10px 3px 10px;margin:0; border-bottom:1px solid #ccc;" role="separator" disabled="true">${item.basename}</h5>
                    ` : html`
                      <mwc-list-item id="${item.name}" value="${item.name}" graphic="icon">
                        <img slot="graphic" src="resources/icons/${item.icon}" style="width:32px;height:32px;" />
                        <div class="horizontal justified center flex layout" style="width:293px;">
                          <div style="padding-right:5px;">${item.basename}</div>
                          <div class="flex"></div>
                          <div class="horizontal layout end-justified center flex">
                          ${item.tags ? item.tags.map(item => html`
                            <lablup-shields slot="meta" style="margin-right:5px;" color="${item.color}" description="${item.tag}"></lablup-shields>
                          `) : ''}
                            <mwc-icon-button icon="info" class="fg blue info"
                                             @click="${(e) => {
      this._showKernelDescription(e, item);
    }}">
                            </mwc-icon-button>
                          </div>
                        </div>
                      </mwc-list-item>
                    `}
                  `)}
              </mwc-select>
              <mwc-select id="version" label="${_t("session.launcher.Version")}" fullwidth required>
                <mwc-list-item selected style="display:none!important"></mwc-list-item>
                  <h5 style="font-size:12px;padding: 0 10px 3px 25px;margin:0; border-bottom:1px solid #ccc;" role="separator" disabled="true" class="horizontal layout">
                    <div style="width:80px;">${_t("session.launcher.Version")}</div>
                    <div style="width:120px;">${_t("session.launcher.Base")}</div>
                    <div style="width:150px;">${_t("session.launcher.Requirements")}</div>
                  </h5>
              ${this.versions.map(item => html`
                <mwc-list-item id="${item}" value="${item}">
                  <span style="display:none">${item}</span>
                  <div class="horizontal layout end-justified">
                    ${this._getVersionInfo(item).map(item => html`
                      <lablup-shields style="width:${item.size}!important;"
                                      color="${item.color}"
                                      app="${item.app && item.app != "" && item.app != " " ? item.app : ''}"
                                      description="${item.tag}">
                      </lablup-shields>
                    `)}
                  </div>
                </mwc-list-item>
              `)}
              </mwc-select>
            </div>
              <div style="display:none;">
                <wl-checkbox id="use-gpu-checkbox">${_t("session.launcher.UseGPU")}</wl-checkbox>
              </div>
              <div class="horizontal center layout">
                ${this.enable_scaling_group ? html`
                  <mwc-select id="scaling-groups" label="${_t("session.launcher.ResourceGroup")}" required naturalMenuWidth
                              @selected="${(e) => this.updateScalingGroup(false, e)}">
                    ${this.scaling_groups.map(item => html`
                      <mwc-list-item class="scaling-group-dropdown"
                                     id="${item.name}"
                                     value="${item.name}">
                        ${item.name}
                      </mwc-list-item>
                    `)}
                  </mwc-select>
                ` : html``}
                <mwc-textfield id="session-name" placeholder="${_t("session.launcher.SessionNameOptional")}"
                               pattern="[a-zA-Z0-9_-]{4,}" fullwidth
                               validationMessage="4 or more characters / no whitespace."
                               style="margin-left:5px;">
                </mwc-textfield>
              </div>
              <div class="horizontal center layout">
                <mwc-multi-select fullwidth id="vfolder" label="${_t("session.launcher.FolderToMount")}" multi
                @selected="${this._updateSelectedFolder}">
                ${this.vfolders.map(item => html`
                  <mwc-list-item value="${item.name}" ?disabled="${item.disabled}">${item.name}</mwc-list-item>
                `)}
                </mwc-multi-select>
              </div>
            <wl-expansion name="resource-group" open>
              <span slot="title">${_t("session.launcher.ResourceAllocation")}</span>
              <span slot="description"></span>
              <paper-listbox id="resource-templates" selected="0" class="horizontal center layout"
                             style="width:350px; overflow:scroll;">
                ${this.resource_templates_filtered.map(item => html`
                  <wl-button class="resource-button vertical center start-justified layout" role="option"
                             style="height:140px;min-width:120px;" type="button"
                             flat outlined
                             @click="${this._chooseResourceTemplate}"
                             id="${item.name}-button"
                             .cpu="${item.cpu}"
                             .mem="${item.mem}"
                             .cuda_gpu="${item.cuda_gpu}"
                             .cuda_fgpu="${item.cuda_fgpu}"
                             .rocm_gpu="${item.rocm_gpu}"
                             .tpu="${item.tpu}"
                             .shmem="${item.shmem}">
                  <div>
                    <h4 style="padding-top:15px;padding-bottom:15px;">${item.name}</h4>
                    <ul>
                      <li>${item.cpu} CPU</li>
                      <li>${item.mem}GB RAM</li>
                      ${item.cuda_gpu ? html`<li>${item.cuda_gpu} CUDA GPU</li>` : html``}
                      ${item.cuda_fgpu ? html`<li>${item.cuda_fgpu} GPU</li>` : html``}
                      ${item.rocm_gpu ? html`<li>${item.rocm_gpu} ROCM GPU</li>` : html``}
                      ${item.tpu ? html`<li>${item.tpu} TPU</li>` : html``}
                      ${item.shmem ? html`<li>${item.shmem}GB SHRAM</li>` : html``}
                      </ul>
                  </div>
                </wl-button>
              `)}
              ${this.isEmpty(this.resource_templates) ? html`
                <wl-button class="resource-button vertical center start layout" role="option"
                           style="height:140px;width:350px;" type="button"
                           flat inverted outlined disabled>
                  <div>
                    <h4>${_t("session.launcher.NoSuitablePreset")}</h4>
                    <div style="font-size:12px;">Use advanced settings to <br>start custom session</div>
                  </div>
                </wl-button>
                ` : html``}
              </paper-listbox>
            </wl-expansion>
            <wl-expansion name="resource-group">
              <span slot="title">${_t("session.launcher.Advanced")}</span>
              <span slot="description">${_t("session.launcher.CustomAllocation")}</span>
              <div class="vertical layout">
                <div class="horizontal center layout">
                  <div class="resource-type" style="width:70px;">CPU</div>
                  <lablup-slider id="cpu-resource" class="cpu"
                                 pin snaps expand editable markers
                                 marker_limit="${this.marker_limit}"
                                 min="${this.cpu_metric.min}" max="${this.cpu_metric.max}"
                                 value="${this.cpu_request}"></lablup-slider>
                  <span class="caption">${_t("session.launcher.Core")}</span>
                  <mwc-icon-button icon="info" class="fg green info" @click="${(e) => {
      this._showResourceDescription(e, 'cpu');
    }}"></mwc-icon-button>
                </div>
                <div class="horizontal center layout">
                  <div class="resource-type" style="width:70px;">RAM</div>
                  <lablup-slider id="mem-resource" class="mem"
                                 pin snaps step=0.05 editable markers
                                 marker_limit="${this.marker_limit}"
                                 min="${this.mem_metric.min}" max="${this.mem_metric.max}"
                                 value="${this.mem_request}"></lablup-slider>
                  <span class="caption">GB</span>
                  <mwc-icon-button icon="info" class="fg orange info" @click="${(e) => {
      this._showResourceDescription(e, 'mem');
    }}"></mwc-icon-button>
                </div>
                <div class="horizontal center layout">
                  <div class="resource-type" style="width:70px;">${_t("session.launcher.SharedMemory")}</div>
                  <lablup-slider id="shmem-resource" class="mem"
                                 pin snaps step=0.0025 editable markers
                                 marker_limit="${this.marker_limit}"
                                 min="0.0" max="${this.shmem_metric.max}"
                                 value="${this.shmem_request}"></lablup-slider>
                  <span class="caption">GB</span>
                  <mwc-icon-button icon="info" class="fg orange info" @click="${(e) => {
      this._showResourceDescription(e, 'shmem');
    }}"></mwc-icon-button>
                </div>
                <div class="horizontal center layout">
                  <div class="resource-type" style="width:70px;">GPU</div>
                  <lablup-slider id="gpu-resource" class="gpu"
                                 pin snaps editable markers step="${this.gpu_step}"
                                 marker_limit="${this.marker_limit}"
                                 min="0.0" max="${this.cuda_gpu_metric.max}" value="${this.gpu_request}"></lablup-slider>
                  <span class="caption">GPU</span>
                  <mwc-icon-button icon="info" class="fg blue info" @click="${(e) => {
      this._showResourceDescription(e, 'gpu');
    }}"></mwc-icon-button>
                </div>
                <div class="horizontal center layout">
                  <div class="resource-type" style="width:70px;">Sessions</div>
                  <lablup-slider id="session-resource" class="session"
                                 pin snaps editable markers step="1"
                                 marker_limit="${this.marker_limit}"
                                 min="1" max="${this.concurrency_limit}" value="${this.session_request}"></lablup-slider>
                  <span class="caption">#</span>
                  <mwc-icon-button icon="info" class="fg red info" @click="${(e) => {
      this._showResourceDescription(e, 'session');
    }}"></mwc-icon-button>
                </div>
              </div>
            </wl-expansion>

            <wl-expansion name="ownership">
              <span slot="title">${_t("session.launcher.Ownership")}</span>
              <span slot="description">${_t("session.launcher.SetSessionOwner")}</span>
              <div class="vertical layout">
                <div class="horizontal center layout">
                  <mwc-textfield id="owner-email" type="email" class="flex" value=""
                    pattern="^.+@.+\..+$"
                    label="${_t("session.launcher.OwnerEmail")}" size="40"></mwc-textfield>
                  <mwc-icon-button icon="refresh" class="blue"
                    @click="${() => this._fetchSessionOwnerGroups()}">
                  </mwc-icon-button>
                </div>
                <paper-dropdown-menu id="owner-accesskey" label="${_t("session.launcher.OwnerAccessKey")}">
                  <paper-listbox slot="dropdown-content" attr-for-selected="id">
                    ${this.ownerKeypairs.map(item => html`
                      <paper-item id="${item.access_key}" label="${item.access_key}">${item.access_key}</paper-item>
                    `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <div class="horizontal center layout">
                  <paper-dropdown-menu id="owner-group" label="${_t("session.launcher.OwnerGroup")}" horizontal-align="left">
                    <paper-listbox slot="dropdown-content" attr-for-selected="id"
                                   selected="${this.default_language}">
                      ${this.ownerGroups.map(item => html`
                        <paper-item id="${item.name}" label="${item.name}">${item.name}</paper-item>
                      `)}
                    </paper-listbox>
                  </paper-dropdown-menu>
                  <paper-dropdown-menu id="owner-scaling-group" label="${_t("session.launcher.OwnerResourceGroup")}">
                    <paper-listbox slot="dropdown-content" selected="0">
                      ${this.ownerScalingGroups.map(item => html`
                        <paper-item id="${item.name}" label="${item.name}">${item.name}</paper-item>
                      `)}
                    </paper-listbox>
                  </paper-dropdown-menu>
                </div>
                <wl-label>
                  <wl-checkbox id="owner-enabled"></wl-checkbox>
                  ${_t("session.launcher.LaunchSessionWithAccessKey")}
                </wl-label>
              </div>
            </wl-expansion>
            <fieldset slot="footer" style="padding-top:0;">
              <wl-button class="launch-button" type="button" id="launch-button"
                                           outlined @click="${() => this._newSession()}">
                                          <wl-icon>rowing</wl-icon>
                <span id="launch-button-msg">Launch</span>
              </wl-button>
            </fieldset>
          </form>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="help-description" fixed backdrop blockscrolling persistent style="padding:0;">
        <wl-card class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span style="font-size:16px;">${this._helpDescriptionTitle}</span>
            <div class="flex"></div>
            <mwc-icon-button icon="close" class="blue close-button"
              @click="${(e) => this._hideDialog(e)}">
            </mwc-icon-button>
          </h3>
          <div class="horizontal layout center" style="margin:5px;">
          ${this._helpDescriptionIcon == '' ? html`` : html`
            <img slot="graphic" src="resources/icons/${this._helpDescriptionIcon}" style="width:64px;height:64px;margin-right:10px;" />
            `}
            <p style="font-size:14px;">${unsafeHTML(this._helpDescription)}</p>
          </div>
        </wl-card>
      </wl-dialog>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-resource-monitor": BackendAiResourceMonitor;
  }
}
