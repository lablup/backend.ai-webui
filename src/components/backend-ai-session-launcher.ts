/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {BackendAIPage} from './backend-ai-page';

import '@material/mwc-select';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-list/mwc-check-list-item';
import '@material/mwc-icon-button';
import '@material/mwc-button';
import '@material/mwc-textfield/mwc-textfield';

import 'weightless/checkbox';
import 'weightless/expansion';
import 'weightless/label';

import '@material/mwc-linear-progress';

import './lablup-slider';
import './backend-ai-dialog';

import {default as PainKiller} from "./backend-ai-painkiller";

import '../plastics/lablup-shields/lablup-shields';
import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend AI Session Launcher

 Example:

 <backend-ai-session-launcher active></backend-ai-session-launcher>

 @group Backend.AI Console
 @element backend-ai-session-launcher
 */

@customElement("backend-ai-session-launcher")
export default class BackendAiSessionLauncher extends BackendAIPage {
  @property({type: Boolean}) is_connected = false;
  @property({type: Boolean}) enableLaunchButton = false;
  @property({type: Boolean}) hideLaunchButton = false;
  @property({type: String}) location = '';
  @property({type: String}) mode = 'normal';
  @property({type: String}) newSessionDialogTitle = '';
  @property({type: String}) importScript = '';
  @property({type: String}) importFilename = '';
  @property({type: Object}) imageRequirements = Object();
  @property({type: Object}) resourceLimits = Object();
  @property({type: Object}) userResourceLimit = Object();
  @property({type: Object}) aliases = Object();
  @property({type: Object}) tags = Object();
  @property({type: Object}) icons = Object();
  @property({type: Object}) imageInfo = Object();
  @property({type: String}) kernel = '';
  @property({type: Array}) versions;
  @property({type: Array}) languages;
  @property({type: Number}) marker_limit = 25;
  @property({type: String}) gpu_mode;
  @property({type: Array}) gpu_modes = [];
  @property({type: Number}) gpu_step = 0.01;
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
  @property({type: Object}) images;
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
  @property({type: Array}) selectedVfolders;
  @property({type: Object}) used_slot_percent;
  @property({type: Object}) used_resource_group_slot_percent;
  @property({type: Object}) used_project_slot_percent;
  @property({type: Array}) resource_templates;
  @property({type: Array}) resource_templates_filtered;
  @property({type: String}) default_language;
  @property({type: Number}) cpu_request;
  @property({type: Number}) mem_request;
  @property({type: Number}) shmem_request;
  @property({type: Number}) gpu_request;
  @property({type: String}) gpu_request_type;
  @property({type: Number}) session_request;
  @property({type: Boolean}) _status;
  @property({type: Number}) num_sessions;
  @property({type: String}) scaling_group;
  @property({type: Array}) scaling_groups;
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
  @property({type: Boolean}) _default_version_updated = false;
  @property({type: String}) _helpDescription = '';
  @property({type: String}) _helpDescriptionTitle = '';
  @property({type: String}) _helpDescriptionIcon = '';
  @property({type: Number}) max_cpu_core_per_session = 64;
  @property({type: Number}) max_cuda_device_per_session = 16;
  @property({type: Number}) max_shm_per_session = 2;
  @property({type: Object}) resourceBroker;


  constructor() {
    super();
    this.active = false;
    this.ownerKeypairs = [];
    this.ownerGroups = [];
    this.ownerScalingGroups = [];
    this.resourceBroker = globalThis.resourceBroker;
    this.notification = globalThis.lablupNotification;
    this.init_resource();
  }

  static get is() {
    return 'backend-ai-session-launcher';
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

        img.resource-type-icon {
          width: 24px;
          height: 24px;
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
          width: 330px;
          margin: 5px;
          padding: 0;
          font-size: 14px;
        }

        #new-session-dialog {
          --component-width: 400px;
          z-index: 100;
        }

        .resource-button.iron-selected {
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
          width: var(--component-width, auto);
        }

        #launch-session[disabled] {
          background-image: var(--general-sidebar-color);
          --mdc-theme-on-primary: var(--general-button-color);
        }

        /* #launch-session {
          height: var(--component-height, auto);
          width: var(--component-width, auto);
          --button-color: var(--component-color, var(--paper-red-600));
          --button-bg: var(--component-bg, var(--paper-red-50));
          --button-bg-hover: var(--component-bg-hover, var(--paper-red-100));
          --button-bg-active: var(--component-bg-active, var(--paper-red-600));
          --button-shadow-color: var(--component-shadow-color, hsla(224, 47%, 38%, 0.2));
        }

        #launch-session[disabled] {
          --button-color: var(--paper-gray-600);
          --button-color-disabled: var(--paper-gray-600);
          --button-bg: var(--paper-gray-50);
          --button-bg-hover: var(--paper-gray-100);
          --button-bg-active: var(--paper-gray-600);
        } */

        wl-expansion {
          --font-family-serif: var(--general-font-family);
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

        mwc-textfield {
          font-family: var(--general-font-family);
          --mdc-typography-subtitle1-font-family: var(--general-font-family);
        }

        mwc-select {
          width: 100%;
          font-family: var(--general-font-family);
          --mdc-typography-subtitle1-font-family: var(--general-font-family);
          --mdc-theme-primary: var(--paper-red-600);
          --mdc-select-fill-color: transparent;
          --mdc-select-label-ink-color: rgba(0, 0, 0, 0.75);
          --mdc-select-dropdown-icon-color: rgba(255, 0, 0, 0.87);
          --mdc-select-focused-dropdown-icon-color: rgba(255, 0, 0, 0.42);
          --mdc-select-disabled-dropdown-icon-color: rgba(255, 0, 0, 0.87);
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
          margin-right: 0;
          padding-right: 0;
          width: 50%;
          --mdc-select-min-width: 190px;
        }

        mwc-select#owner-group {
          margin-right: 0;
          padding-right: 0;
          width: 50%;
          --mdc-select-min-width: 190px;
        }
        mwc-select#owner-scaling-group {
          margin-right: 0;
          padding-right: 0;
          width: 50%;
          --mdc-select-min-width: 190px;
        }

        mwc-textfield {
          width: 100%;
          --mdc-text-field-idle-line-color: rgba(0, 0, 0, 0.42);
          --mdc-text-field-hover-line-color: rgba(255, 0, 0, 0.87);
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--paper-red-600);
        }

        mwc-textfield#session-name {
          width: 50%;
          padding-top: 20px;
          padding-left: 0;
          margin-left: 0;
          margin-bottom: 1px;
        }

        mwc-button, mwc-button[raised], mwc-button[unelevated], mwc-button[disabled] {
          width: 100%;
        }

        mwc-button[disabled] {
          background-image: none;
          --mdc-theme-primary: #ddd;
          --mdc-on-theme-primary: var(--general-sidebar-topbar-background-color);
        }

        #environment {
          --mdc-menu-item-height: 40px;
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

        wl-label {
          margin-right: 10px;
          outline: none;
        }

        #help-description {
          --component-width: 350px;
        }

        #help-description p {
          padding: 5px !important;
        }

        #launch-confirmation-dialog {
          --component-width: 400px;
          --component-font-size: 14px;
        }

        mwc-icon-button.info {
          --mdc-icon-button-size: 30px;
        }

        mwc-icon {
          --mdc-icon-size: 14px;
        }

        ul {
          list-style-type: none;
        }

      `];
  }

  init_resource() {
    this.versions = ['Not Selected'];
    this.languages = [];
    this.gpu_mode = 'none';
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
    this.selectedVfolders = [];
    this.default_language = '';
    this.concurrency_used = 0;
    this.concurrency_max = 0;
    this.concurrency_limit = 0;
    this._status = 'inactive';
    this.cpu_request = 1;
    this.mem_request = 1;
    this.shmem_request = 0.0625;
    this.gpu_request = 0;
    this.gpu_request_type = 'cuda.device';
    this.session_request = 1;
    this.scaling_groups = [{name: ''}]; // if there is no scaling group, set the name as empty string
    this.scaling_group = '';
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
    this.shadowRoot.querySelector('#environment').addEventListener('selected', this.updateLanguage.bind(this));
    this.version_selector = this.shadowRoot.querySelector('#version');
    this.version_selector.addEventListener('selected', () => {
      this.updateResourceAllocationPane();
    });

    this.resourceGauge = this.shadowRoot.querySelector('#resource-gauges');
    const gpu_resource = this.shadowRoot.querySelector('#gpu-resource');

    gpu_resource.addEventListener('value-changed', () => {
      if (gpu_resource.value > 0) {
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = true;
      } else {
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = false;
      }
    });
    this.shadowRoot.querySelector('#use-gpu-checkbox').addEventListener('change', () => {
      if (this.shadowRoot.querySelector('#use-gpu-checkbox').checked === true) {
        this.shadowRoot.querySelector('#gpu-resource').disabled = this.cuda_device_metric.min === this.cuda_device_metric.max;
      } else {
        this.shadowRoot.querySelector('#gpu-resource').disabled = true;
      }
    });
    document.addEventListener("backend-ai-group-changed", (e) => {
      this._updatePageVariables(true);
    });
    document.addEventListener("backend-ai-resource-broker-updated", (e) => {
      // Fires when broker is updated.
    });
    if (this.hideLaunchButton === true) {
      this.shadowRoot.querySelector('#launch-session').style.display = 'none';
    }

    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.is_connected = true;
        this._enableLaunchButton();
      }, {once: true});
    } else {
      this.is_connected = true;
      this._enableLaunchButton();
    }
  }

  _enableLaunchButton() {
    // Check preconditions and enable it via pooling
    if (!this.resourceBroker.image_updating) { // Image information is successfully updated.
      this.languages = this.resourceBroker.languages;
      this.enableLaunchButton = true;
    } else {
      setTimeout(() => {
        this._enableLaunchButton();
      }, 1000);
    }
  }

  /**
   * Update selected scaling groups.
   * An element should update based on some state not triggered by setting a property.
   * */
  _updateSelectedScalingGroup() {
    let Sgroups = this.shadowRoot.querySelector('#scaling-groups');
    this.scaling_groups = this.resourceBroker.scaling_groups;
    let selectedSgroup = Sgroups.items.find(item => item.value === this.resourceBroker.scaling_group);
    if (this.resourceBroker.scaling_group === '' || typeof selectedSgroup == 'undefined') {
      setTimeout(() => {
        this._updateSelectedScalingGroup();
      }, 500);
      return;
    }
    let idx = Sgroups.items.indexOf(selectedSgroup);
    Sgroups.select(-1);
    Sgroups.select(idx);
    Sgroups.value = selectedSgroup.value;
    Sgroups.requestUpdate();
  }

  /**
   * Update scaling groups asynchronously.
   * If forceUpdate is true, call _refreshResourcePolicy().
   * Else, call updateResourceAllocationPane().
   *
   * @param {boolean} forceUpdate - whether to refresh resource policy or not
   * @param {any} e
   * */
  async updateScalingGroup(forceUpdate = false, e) {
    if (this.active) {
      await this.resourceBroker.updateScalingGroup(forceUpdate, e.target.value);

      if (forceUpdate === true) {
        await this._refreshResourcePolicy();
      } else {
        this.updateResourceAllocationPane('session dialog');
      }
    }
  }

  /**
   * Update selected folders
   * */
  _updateSelectedFolder() {
    let folders = this.shadowRoot.querySelector('#vfolder');
    let selectedFolderItems = folders.selected;
    let selectedFolders: String[] = [];
    if (selectedFolderItems.length > 0) {
      selectedFolders = selectedFolderItems.map(item => item.value);
    } else {
      selectedFolders = [];
    }
    this.selectedVfolders = selectedFolders;
  }

  /**
   * If active is true, change view states. - update page variables, disable enter key.
   *
   * @param {Boolean} active - whether view states change or not
   * */
  async _viewStateChanged(active) {
    await this.updateComplete;

    if (!this.active) {
      return;
    }
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.project_resource_monitor = this.resourceBroker.allow_project_resource_monitor;
        this._updatePageVariables(true);
        this._disableEnterKey();
      }, {once: true});
    } else {
      this.project_resource_monitor = this.resourceBroker.allow_project_resource_monitor;
      await this._updatePageVariables(true);
      this._disableEnterKey();
    }
  }

  async _updatePageVariables(isChanged) {
    if (this.active && this.metadata_updating === false) {
      this.metadata_updating = true;
      await this.resourceBroker._updatePageVariables(isChanged);
      // update selected Scaling Group depends on project group
      this._updateSelectedScalingGroup();
      this.sessions_list = this.resourceBroker.sessions_list;
      await this._refreshResourcePolicy();
      this.aggregateResource('update-page-variable');
      this.metadata_updating = false;
    }
  }

  async _refreshResourcePolicy() {
    return this.resourceBroker._refreshResourcePolicy().then(() => {
      this.concurrency_used = this.resourceBroker.concurrency_used;
      this.userResourceLimit = this.resourceBroker.userResourceLimit;
      this.concurrency_max = this.resourceBroker.concurrency_max;
      this.gpu_mode = this.resourceBroker.gpu_mode;
      this.gpu_step = this.resourceBroker.gpu_step;
      this.gpu_modes = this.resourceBroker.gpu_modes;
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

  /**
   * If backendaiclient is not ready, notify wait for initializing.
   * Else, launch session dialog.
   * */
  async _launchSessionDialog() {
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false || this.resourceBroker.image_updating === true) {
      setTimeout(() => {
        this._launchSessionDialog();
      }, 1000);
      //this.notification.text = _text('session.launcher.PleaseWaitInitializing');
      //this.notification.show();
    } else {
      await this.selectDefaultLanguage();
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

  _generateKernelIndex(kernel, version) {
    return kernel + ':' + version;
  }

  /**
   * If vfolder has not any items, show launch-confirmation-dialog.
   * Else, make new session by call _newSession().
   * */
  _newSessionWithConfirmation() {
    const vfolderItems = this.shadowRoot.querySelector('#vfolder').selected;
    const vfolders = vfolderItems.map((el) => el.value);
    if (vfolders.length === 0) {
      let confirmationDialog = this.shadowRoot.querySelector('#launch-confirmation-dialog');
      confirmationDialog.show();
    } else {
      return this._newSession();
    }
  }

  /**
   * Make a new session.
   * */
  _newSession() {
    let confirmationDialog = this.shadowRoot.querySelector('#launch-confirmation-dialog');
    confirmationDialog.hide();
    let selectedItem = this.shadowRoot.querySelector('#environment').selected;
    let kernel = selectedItem.id;
    let version = this.shadowRoot.querySelector('#version').value;
    let sessionName = this.shadowRoot.querySelector('#session-name').value;
    let isSessionNameValid = this.shadowRoot.querySelector('#session-name').checkValidity();
    let vfolder = this.selectedVfolders;
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
    if (!isSessionNameValid) {
      this.notification.text = _text("session.launcher.SessionNameAllowCondition");
      this.notification.show();
      return;
    }

    if (kernel === "" || version === "" || version === "Not Selected") {
      this.notification.text = _text("session.launcher.MustSpecifyVersion");
      this.notification.show();
      return;
    }
    this.scaling_group = this.shadowRoot.querySelector('#scaling-groups').value;
    let config = {};
    config['group_name'] = globalThis.backendaiclient.current_group;
    config['domain'] = globalThis.backendaiclient._config.domainName;
    config['scaling_group'] = this.scaling_group;
    config['maxWaitSeconds'] = 10;
    const ownerEnabled = this.shadowRoot.querySelector('#owner-enabled');
    if (ownerEnabled && ownerEnabled.checked) {
      config['group_name'] = this.shadowRoot.querySelector('#owner-group').value;
      config['domain'] = this.ownerDomain;
      config['scaling_group'] = this.shadowRoot.querySelector('#owner-scaling-group').value;
      config['owner_access_key'] = this.shadowRoot.querySelector('#owner-accesskey').value;
      if (!config['group_name'] || !config['domain'] || !config['scaling_group'] || !config ['owner_access_key']) {
        this.notification.text = _text("session.launcher.NotEnoughOwnershipInfo");
        this.notification.show();
        return;
      }
    }
    config['cpu'] = this.cpu_request;
    switch (this.gpu_request_type) {
      case 'cuda.shares':
        config['cuda.shares'] = this.gpu_request;
        break;
      case 'cuda.device':
        config['cuda.device'] = this.gpu_request;
        break;
      case 'rocm.device':
        config['rocm.device'] = this.gpu_request;
        break;
      case 'tpu.device':
        config['tpu.device'] = this.gpu_request;
        break;
      default:
        // Fallback to current gpu mode if there is a gpu request, but without gpu type.
        if (this.gpu_request > 0 && this.gpu_mode) {
          config[this.gpu_mode] = this.gpu_request;
        }
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
    if (this.mode === 'import' && this.importScript !== '') {
      config['bootstrap_script'] = this.importScript;
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
      return this.tasker.add("Creating " + item.sessionName, this._createKernel(item.kernelName, item.sessionName, item.config), '', "session");
    });
    Promise.all(createSessionQueue).then((res: any) => {
      this.shadowRoot.querySelector('#new-session-dialog').hide();
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = _text('session.launcher.Launch');
      setTimeout(() => {
        this.metadata_updating = true;
        this.aggregateResource('session-creation');
        this.metadata_updating = false;
      }, 1500);
      let event = new CustomEvent("backend-ai-session-list-refreshed", {"detail": 'running'});
      document.dispatchEvent(event);
      if (res.length === 1) {
        res[0].taskobj.then(res => {
          let appOptions;
          if ('kernelId' in res) { // API v4
            appOptions = {
              'session-name': res.kernelId,
              'access-key': ''
            };
          } else { // API >= v5
            appOptions = {
              'session-uuid': res.sessionId,
              'session-name': res.sessionName,
              'access-key': ''
            };
          }
          let service_info = res.servicePorts;
          if (Array.isArray(service_info) === true) {
            appOptions['app-services'] = service_info.map(a => a.name);
          } else {
            appOptions['app-services'] = [];
          }
          if (this.mode === 'import') {
            appOptions['runtime'] = 'jupyter';
            appOptions['filename'] = this.importFilename;
          }
          // only launch app when it has valid service ports
          if (service_info.length > 0) {
            globalThis.appLauncher.showLauncher(appOptions);
          }
        }).catch((err) => {
          // remove redundant error message
        });
      }
    }).catch((err) => {
      // this.metadata_updating = false;
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.message);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      } else if (err && err.title) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.show(true, err);
      }
      let event = new CustomEvent("backend-ai-session-list-refreshed", {"detail": 'running'});
      document.dispatchEvent(event);
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = _text('session.launcher.Launch');
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
    const task = globalThis.backendaiclient.createIfNotExists(kernelName, sessionName, config, 20000);
    task.catch((err) => {
      if (err && err.message) {
        if ('statusCode' in err && err.statusCode === 408) {
          this.notification.text = _text("session.launcher.sessionStillPreparing");
        } else {
          this.notification.text = PainKiller.relieve(err.message);
        }
        this.notification.detail = err.message;
        this.notification.show(true, err);
      } else if (err && err.title) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.show(true, err);
      }
    });
    return task;
  }

  _hideSessionDialog() {
    this.shadowRoot.querySelector('#new-session-dialog').hide();
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
      'tpu': 'TPU:TPUv3',
      'rocm': 'GPU:ROCm',
      'cuda9': 'GPU:CUDA9',
      'cuda10': 'GPU:CUDA10',
      'cuda10.0': 'GPU:CUDA10',
      'cuda10.1': 'GPU:CUDA10.1',
      'cuda10.2': 'GPU:CUDA10.2',
      'cuda10.3': 'GPU:CUDA10.3',
      'cuda11': 'GPU:CUDA11',
      'cuda11.0': 'GPU:CUDA11',
      'cuda11.1': 'GPU:CUDA11.1',
      'cuda11.2': 'GPU:CUDA11.2',
      'miniconda': 'Miniconda',
      'anaconda2018.12': 'Anaconda 2018.12',
      'anaconda2019.12': 'Anaconda 2019.12',
      'alpine3.8': 'Alpine Linux 3.8',
      'ngc': 'Nvidia GPU Cloud',
      'ff': 'Research Env.',
    };
    if (value in alias) {
      return alias[value];
    } else {
      return value;
    }
  }

  _updateVersions(kernel) {
    if (kernel in this.resourceBroker.supports) {
      this.version_selector.disabled = true;
      let versions = this.resourceBroker.supports[kernel];
      versions.sort();
      versions.reverse(); // New version comes first.
      this.versions = versions;
      this.kernel = kernel;
    } else {
      return;
    }
    if (this.versions !== undefined) {
      return this.version_selector.layout(true).then(() => {
        // Set version selector's value beforehand to update resources in
        // updateResourceAllocationPane method. Without this, LAUNCH button's disabled state is not
        // updated, so in some cases, user cannot launch a session even though
        // there are available resources for the selected image.
        this.version_selector.select(1);
        this.version_selector.value = this.versions[0];
        //this.version_selector.selectedText = this.version_selector.value;
        this._updateVersionSelectorText(this.version_selector.value);
        this.version_selector.disabled = false;
        this.updateResourceAllocationPane('update versions');
      });
    }
  }

  /**
   * Update version_selector's selectedText.
   *
   * @param {any} text - version
   * */
  _updateVersionSelectorText(text) {
    let res = this._getVersionInfo(text);
    let resultArray: string[] = [];
    res.forEach(item => {
      resultArray.push(item.tag);
    });
    this.version_selector.selectedText = resultArray.join(' / ');
  }

  /**
   * Rondomly generate session ID
   * */
  generateSessionId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text + "-console";
  }

  async _updateVirtualFolderList() {
    return this.resourceBroker.updateVirtualFolderList().then(() => {
      this.vfolders = this.resourceBroker.vfolders;
    });
  }

  /**
   * Aggregate used resources from manager and save them.
   *
   * @param {string} from - set the value for debugging purpose
   * */
  async _aggregateResourceUse(from: string = '') {
    return this.resourceBroker._aggregateCurrentResource(from).then(async (res) => {
      if (res === false) {
        /*setTimeout(()=>{
          this._aggregateResourceUse(from);
        }, 1500);
        return Promise.resolve(false);  // retry later
         */
      }
      this.concurrency_used = this.resourceBroker.concurrency_used;
      this.scaling_group = this.resourceBroker.scaling_group;
      this.scaling_groups = this.resourceBroker.scaling_groups;
      this.resource_templates = this.resourceBroker.resource_templates;
      this.resource_templates_filtered = this.resourceBroker.resource_templates_filtered;
      this.total_slot = this.resourceBroker.total_slot;
      this.total_resource_group_slot = this.resourceBroker.total_resource_group_slot;
      this.total_project_slot = this.resourceBroker.total_project_slot;
      this.used_slot = this.resourceBroker.used_slot;
      this.used_resource_group_slot = this.resourceBroker.used_resource_group_slot;
      this.used_project_slot = this.resourceBroker.used_project_slot;
      this.used_project_slot_percent = this.resourceBroker.used_project_slot_percent;
      this.concurrency_limit = this.resourceBroker.concurrency_limit;
      this.available_slot = this.resourceBroker.available_slot;
      this.used_slot_percent = this.resourceBroker.used_slot_percent;
      this.used_resource_group_slot_percent = this.resourceBroker.used_resource_group_slot_percent;
      await this.updateComplete;
      return Promise.resolve(true);
    }).catch(err => {
      if (err && err.message) {
        console.log(err);
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
      return Promise.resolve(false);
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

  /**
   * Update resource allocation pane
   * - resource policy, metrics of cpu, gpu, rocm, tpu, memory, and shared memory
   *
   * @param {string} from
   * */
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
    let selectedVersionItem = this.version_selector.selected;
    // Pulldown is not ready yet.
    if (selectedVersionItem === null) {
      this.metric_updating = false;
      return;
    }
    let selectedVersionValue = selectedVersionItem.value;
    this._updateVersionSelectorText(selectedVersionValue);
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
      await this._updateVirtualFolderList();
      // Resource limitation is not loaded yet.
      if (Object.keys(this.resourceBroker.resourceLimits).length === 0) {
        //console.log("No resource limit loaded");
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
      let currentResource = this.resourceBroker.resourceLimits[kernelName];
      if (!currentResource) {
        this.metric_updating = false;
        return;
      }
      this.gpu_mode = this.resourceBroker.gpu_mode;
      this.gpu_step = this.resourceBroker.gpu_step;
      this.gpu_modes = this.resourceBroker.gpu_modes;

      let available_slot = this.resourceBroker.available_slot;

      // Post-UI markup to disable unchangeable values
      this.shadowRoot.querySelector('#cpu-resource').disabled = false;
      this.shadowRoot.querySelector('#mem-resource').disabled = false;
      this.shadowRoot.querySelector('#gpu-resource').disabled = false;
      this.shadowRoot.querySelector('#session-resource').disabled = false;
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = _text('session.launcher.Launch');
      let disableLaunch = false;
      let shmem_metric: any = {
        'min': 0.0625,
        'max': 2,
        'preferred': 0.125
      };
      this.cuda_device_metric = {
        'min': 0,
        'max': 0
      };
      currentResource.forEach((item) => {
        if (item.key === 'cpu') {
          let cpu_metric = {...item};
          cpu_metric.min = parseInt(cpu_metric.min);
          if ('cpu' in this.userResourceLimit) {
            if (parseInt(cpu_metric.max) !== 0 && cpu_metric.max !== 'Infinity' && cpu_metric.max !== NaN) {
              cpu_metric.max = Math.min(parseInt(cpu_metric.max), parseInt(this.userResourceLimit.cpu), available_slot['cpu'], this.max_cpu_core_per_session);
            } else {
              cpu_metric.max = Math.min(parseInt(this.userResourceLimit.cpu), available_slot['cpu'], this.max_cpu_core_per_session);
            }
          } else {
            if (parseInt(cpu_metric.max) !== 0 && cpu_metric.max !== 'Infinity' && cpu_metric.max !== NaN) {
              cpu_metric.max = Math.min(parseInt(cpu_metric.max), available_slot['cpu'], this.max_cpu_core_per_session);
            } else {
              cpu_metric.max = Math.min(this.available_slot['cpu'], this.max_cpu_core_per_session);
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
          let cuda_device_metric = {...item};
          cuda_device_metric.min = parseInt(cuda_device_metric.min);
          if ('cuda.device' in this.userResourceLimit) {
            if (parseInt(cuda_device_metric.max) !== 0 && cuda_device_metric.max !== 'Infinity' && cuda_device_metric.max !== NaN) {
              cuda_device_metric.max = Math.min(parseInt(cuda_device_metric.max), parseInt(this.userResourceLimit['cuda.device']), available_slot['cuda_shares'], this.max_cuda_device_per_session);
            } else {
              cuda_device_metric.max = Math.min(parseInt(this.userResourceLimit['cuda.device']), available_slot['cuda_device'], this.max_cuda_device_per_session);
            }
          } else {
            if (parseInt(cuda_device_metric.max) !== 0) {
              cuda_device_metric.max = Math.min(parseInt(cuda_device_metric.max), available_slot['cuda_device'], this.max_cuda_device_per_session);
            } else {
              cuda_device_metric.max = this.available_slot['cuda_device'];
            }
          }
          if (cuda_device_metric.min >= cuda_device_metric.max) {
            if (cuda_device_metric.min > cuda_device_metric.max) {
              cuda_device_metric.min = cuda_device_metric.max;
              disableLaunch = true;
              this.shadowRoot.querySelector('#gpu-resource').disabled = true
            } else {
              cuda_device_metric.max = cuda_device_metric.max + 1;
              this.shadowRoot.querySelector('#gpu-resource').disabled = true
            }
          }
          this.cuda_device_metric = cuda_device_metric;
        }
        if (item.key === 'cuda.shares' && this.gpu_mode === 'cuda.shares') {
          let cuda_shares_metric = {...item};
          cuda_shares_metric.min = parseFloat(cuda_shares_metric.min);
          if ('cuda.shares' in this.userResourceLimit) {
            if (parseFloat(cuda_shares_metric.max) !== 0 && cuda_shares_metric.max !== 'Infinity' && cuda_shares_metric.max !== NaN) {
              cuda_shares_metric.max = Math.min(parseFloat(cuda_shares_metric.max), parseFloat(this.userResourceLimit['cuda.shares']), available_slot['cuda_shares']);
            } else {
              cuda_shares_metric.max = Math.min(parseFloat(this.userResourceLimit['cuda.shares']), available_slot['cuda_shares']);
            }
          } else {
            if (parseFloat(cuda_shares_metric.max) !== 0) {
              cuda_shares_metric.max = Math.min(parseFloat(cuda_shares_metric.max), available_slot['cuda_shares']);
            } else {
              cuda_shares_metric.max = 0;
            }
          }
          if (cuda_shares_metric.min >= cuda_shares_metric.max) {
            if (cuda_shares_metric.min > cuda_shares_metric.max) {
              cuda_shares_metric.min = cuda_shares_metric.max;
              disableLaunch = true;
              this.shadowRoot.querySelector('#gpu-resource').disabled = true
            } else {
              cuda_shares_metric.max = cuda_shares_metric.max + 1;
              this.shadowRoot.querySelector('#gpu-resource').disabled = true
            }
          }

          this.cuda_shares_metric = cuda_shares_metric;
          //console.log(this.cuda_shares_metric);
          if (cuda_shares_metric.max > 0) {
            this.cuda_device_metric = cuda_shares_metric;
          }
        }
        if (item.key === 'rocm.device' && this.gpu_mode === 'rocm.device') {
          let rocm_metric = {...item};
          rocm_metric.min = parseInt(rocm_metric.min);
          rocm_metric.max = parseInt(rocm_metric.max);
          if (rocm_metric.min > rocm_metric.max) {
            // TODO: dynamic maximum per user policy
          }
          this.rocm_device_metric = rocm_metric;
        }
        if (item.key === 'tpu.device') {
          let tpu_device_metric = {...item};
          tpu_device_metric.min = parseInt(tpu_device_metric.min);
          tpu_device_metric.max = parseInt(tpu_device_metric.max);
          if (tpu_device_metric.min > tpu_device_metric.max) {
            // TODO: dynamic maximum per user policy
          }
          this.tpu_device_metric = tpu_device_metric;
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
              mem_metric.max = Math.min(parseFloat(image_mem_max), parseFloat(user_mem_max), available_slot['mem']);
            } else {
              mem_metric.max = parseFloat(user_mem_max);
            }
          } else {
            if (parseInt(mem_metric.max) !== 0 && mem_metric.max !== 'Infinity' && isNaN(mem_metric.max) !== true) {
              mem_metric.max = Math.min(parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(mem_metric.max, 'g', 'g')), available_slot['mem']);
            } else {
              mem_metric.max = available_slot['mem']; // TODO: set to largest memory size
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
      // Shared memory setting
      shmem_metric.max = this.max_shm_per_session;
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
      if (this.cuda_device_metric.min == 0 && this.cuda_device_metric.max == 0) { // GPU is disabled (by image,too).
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = false;
        this.shadowRoot.querySelector('#gpu-resource').disabled = true;
        this.shadowRoot.querySelector('#gpu-resource').value = 0;
        if (this.resource_templates !== [] && this.resource_templates.length > 0) { // Remove mismatching templates
          let new_resource_templates: any = [];
          for (let i = 0; i < this.resource_templates.length; i++) {
            if (!('cuda_device' in this.resource_templates[i]) &&
              !('cuda_shares' in this.resource_templates[i])) {
              new_resource_templates.push(this.resource_templates[i]);
            } else if ((parseFloat(this.resource_templates[i].cuda_device) <= 0.0 && !('cuda_shares' in this.resource_templates[i])) ||
              (parseFloat(this.resource_templates[i].cuda_shares) <= 0.0) && !('cuda_device' in this.resource_templates[i])) {
              new_resource_templates.push(this.resource_templates[i]);
            } else if (parseFloat(this.resource_templates[i].cuda_device) <= 0.0 &&
              parseFloat(this.resource_templates[i].cuda_shares) <= 0.0) {
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
        this.shadowRoot.querySelector('#gpu-resource').value = this.cuda_device_metric.max;
        this.resource_templates_filtered = this.resource_templates;
      }
      // Refresh with resource template
      if (this.resource_templates_filtered !== [] && this.resource_templates_filtered.length > 0) {
        let resource = this.resource_templates_filtered[0];
        this._chooseResourceTemplate(resource);
        this.shadowRoot.querySelector('#resource-templates').layout(true).then(() => {
          this.shadowRoot.querySelector('#resource-templates').select(1);
        });
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
      if (this.cuda_device_metric.min == this.cuda_device_metric.max) {
        this.shadowRoot.querySelector('#gpu-resource').max = this.cuda_device_metric.max + 1;
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

  /**
   * Choose resource template
   * - cpu, mem, cuda_device, cuda_shares, rocm_device, tpu_device, shmem
   *
   * @param {Event} e
   * */
  _chooseResourceTemplate(e) {
    let button;
    if (typeof e.cpu !== 'undefined') {
      button = e;
    } else {
      button = e.target.closest('mwc-list-item');
    }
    const cpu = button.cpu;
    const mem = button.mem;
    const cuda_device = button.cuda_device;
    const cuda_shares = button.cuda_shares;
    const rocm_device = button.rocm_device;
    const tpu_device = button.tpu_device;
    let gpu_type, gpu_value;
    if ((typeof cuda_device !== 'undefined' || typeof cuda_shares !== 'undefined')) {
      if (typeof cuda_device === 'undefined') { // FGPU
        gpu_type = 'cuda.shares';
        gpu_value = cuda_shares;
      } else {
        gpu_type = 'cuda.device';
        gpu_value = cuda_device;
      }
    } else if (typeof rocm_device !== 'undefined') {
      gpu_type = 'rocm.device';
      gpu_value = rocm_device;
    } else if (typeof tpu_device !== 'undefined') {
      gpu_type = 'tpu.device';
      gpu_value = tpu_device;
    } else {
      gpu_type = 'none';
      gpu_value = 0;
    }
    const shmem = button.shmem;
    this.shmem_request = shmem ? shmem : 0.0625; // 64MB as default. Enough for single core CPU.
    this._updateResourceIndicator(cpu, mem, gpu_type, gpu_value);
  }

  _updateResourceIndicator(cpu, mem, gpu_type, gpu_value) {
    this.shadowRoot.querySelector('#cpu-resource').value = cpu;
    this.shadowRoot.querySelector('#mem-resource').value = mem;
    this.shadowRoot.querySelector('#gpu-resource').value = gpu_value;
    this.shadowRoot.querySelector('#shmem-resource').value = this.shmem_request;
    this.cpu_request = cpu;
    this.mem_request = mem;
    this.gpu_request = gpu_value;
    this.gpu_request_type = gpu_type;
  }

  /**
   * Select default_language and then set _default_language_updated to true.
   * */
  async selectDefaultLanguage(forceUpdate: boolean = false, language: string = '') {
    if (this._default_language_updated === true && forceUpdate === false) {
      return;
    }
    if (language !== '') {
      this.default_language = language;
    } else if (globalThis.backendaiclient._config.default_session_environment !== undefined &&
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
    if (typeof obj === 'undefined' && typeof globalThis.backendaiclient !== 'undefined' && globalThis.backendaiclient.ready === false) { // Not ready yet.
      setTimeout(() => {
        console.log('Environment selector is not ready yet. Trying to set the default language again.');
        return this.selectDefaultLanguage(forceUpdate, language);
      }, 500);
      return Promise.resolve(true);
    }
    let idx = environment.items.indexOf(obj);
    environment.select(idx);
    this._default_language_updated = true;
    return Promise.resolve(true);
  }

  _selectDefaultVersion(version) {
    return false;
  }

  /**
   * Fetch session owner groups.
   * - owner email, keypair, and domain / group information
   * */
  async _fetchSessionOwnerGroups() {
    if (!this.ownerFeatureInitialized) {
      this.shadowRoot.querySelector('#owner-group').addEventListener('selected', this._fetchSessionOwnerScalingGroups.bind(this));
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
    this.shadowRoot.querySelector('#owner-accesskey').layout(true).then(()=>{
      this.shadowRoot.querySelector('#owner-accesskey').select(0);
    });

    /* Fetch domain / group information */
    const userInfo = await globalThis.backendaiclient.user.get(email, ['domain_name', 'groups {id name}']);
    this.ownerDomain = userInfo.user.domain_name;
    this.ownerGroups = userInfo.user.groups;
    if (this.ownerGroups) {
      this.shadowRoot.querySelector('#owner-group').layout(true).then(()=>{
        this.shadowRoot.querySelector('#owner-group').select(0);
      });
    }
  }

  async _fetchSessionOwnerScalingGroups() {
    const group = this.shadowRoot.querySelector('#owner-group').value;
    if (!group) {
      this.ownerScalingGroups = [];
      return;
    }
    const sgroupInfo = await globalThis.backendaiclient.scalingGroup.list(group);
    this.ownerScalingGroups = sgroupInfo.scaling_groups;
    if (this.ownerScalingGroups) {
      this.shadowRoot.querySelector('#owner-scaling-group').layout(true).then(()=>{
        this.shadowRoot.querySelector('#owner-scaling-group').select(0);
      });
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
    if (name in this.resourceBroker.imageInfo && 'description' in this.resourceBroker.imageInfo[name]) {
      let desc = this.shadowRoot.querySelector('#help-description');
      this._helpDescriptionTitle = this.resourceBroker.imageInfo[name].name;
      this._helpDescription = this.resourceBroker.imageInfo[name].description;
      this._helpDescriptionIcon = item.icon;
      desc.show();
    } else {
      if (name in this.imageInfo) {
        this._helpDescriptionTitle = this.resourceBroker.imageInfo[name].name;
      } else {
        this._helpDescriptionTitle = name;
      }
      this._helpDescription = _text("session.launcher.NoDescriptionFound");
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

  _resourceTemplateToCustom() {
    this.shadowRoot.querySelector('#resource-templates').selectedText = _text('session.launcher.CustomResourceApplied');
  }

  /**
   * Get version information - Version, Language, Additional information.
   *
   * @param {any} version
   * */
  _getVersionInfo(version) {
    let info: any = [];
    let fragment = version.split('-');
    info.push({ // Version
      tag: this._aliasName(fragment[0]),
      color: 'blue',
      size: '80px'
    });
    if (fragment.length > 1) {
      //Image requirement overrides language information.
      if (this.kernel + ':' + version in this.imageRequirements && 'framework' in this.imageRequirements[this.kernel + ':' + version]) {
        info.push({ // Language
          tag: this.imageRequirements[this.kernel + ':' + version]['framework'],
          color: 'red',
          size: '120px'
        });
      } else {
        info.push({ // Language
          tag: this._aliasName(fragment[1]),
          color: 'red',
          size: '120px'
        });
      }
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
      <mwc-button raised class="primary-action" id="launch-session" label="${_t("session.launcher.Start")}" ?disabled="${!this.enableLaunchButton}" @click="${() => this._launchSessionDialog()}">
      </mwc-button>
      <backend-ai-dialog id="new-session-dialog" narrowLayout fixed backdrop>
        <span slot="title">${this.newSessionDialogTitle ? this.newSessionDialogTitle : _t("session.launcher.StartNewSession")}</span>
        <form slot="content" id="launch-session-form" class="centered">
          <div class="vertical center layout" style="padding-top:15px;">
            <mwc-select id="environment" label="${_t("session.launcher.Environments")}" fullwidth required
              value="${this.default_language}">
              <mwc-list-item selected style="dispxlay:none!important;">${_t("session.launcher.ChooseEnvironment")}</mwc-list-item>
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
                          <span style="display:none">(${item.tag})</span>
                        `) : ''}
                          <mwc-icon-button icon="info"
                                           class="fg blue info"
                                           @click="${(e) => {
                                             this._showKernelDescription(e, item);}}">
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
                                    app="${typeof item.app != 'undefined' && item.app != "" && item.app != " " ? item.app : ''}"
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
            <mwc-select id="scaling-groups" label="${_t("session.launcher.ResourceGroup")}" required
                        @selected="${(e) => this.updateScalingGroup(false, e)}">
              ${this.scaling_groups.map(item => html`
                <mwc-list-item class="scaling-group-dropdown"
                               id="${item.name}"
                               value="${item.name}">
                  ${item.name}
                </mwc-list-item>
              `)}
            </mwc-select>
            <mwc-textfield id="session-name" placeholder="${_t("session.launcher.SessionNameOptional")}"
                           pattern="[a-zA-Z0-9_-]{4,}" fullwidth
                           validationMessage="${_t("session.launcher.SessionNameAllowCondition")}"
                           style="margin-left:5px;">
            </mwc-textfield>
          </div>

          <wl-expansion name="vfolder-group" style="--expansion-header-padding:16px;--expansion-content-padding:0;">
            <span slot="title" style="font-size:12px;color:#404040;">${_t("session.launcher.FolderToMount")}</span>
            <mwc-list fullwidth multi id="vfolder"
              @selected="${this._updateSelectedFolder}">
            ${this.vfolders.length === 0 ? html`
              <mwc-list-item value="" disabled="true">${_t("session.launcher.NoFolderExists")}</mwc-list-item>
            `:html``}
            ${this.vfolders.map(item => html`
              <mwc-check-list-item value="${item.name}" ?disabled="${item.disabled}">${item.name}</mwc-check-list-item>
            `)}
            </mwc-list>
          </wl-expansion>
          <ul style="color:#646464;font-size:12px;">
          ${this.selectedVfolders.map(item => html`
                <li><mwc-icon>folder_open</mwc-icon>${item}</li>
              `)}
          </ul>
          <div class="vertical center layout" style="padding-top:15px;">
            <mwc-select id="resource-templates" label="${_t("session.launcher.ResourceAllocation")}" fullwidth required>
              <mwc-list-item selected style="display:none!important"></mwc-list-item>
                <h5 style="font-size:12px;padding: 0 10px 3px 25px;margin:0; border-bottom:1px solid #ccc;" role="separator" disabled="true" class="horizontal layout center">
                  <div style="width:110px;">Name</div>
                  <div style="width:50px;text-align:right;">CPU</div>
                  <div style="width:50px;text-align:right;">RAM</div>
                  <div style="width:50px;text-align:right;">${_t("session.launcher.SharedMemory")}</div>
                  <div style="width:90px;text-align:right;">${_t("session.launcher.Accelerator")}</div>
                </h5>
            ${this.resource_templates_filtered.map(item => html`
              <mwc-list-item value="${item.name}"
                           id="${item.name}-button"
                           @click="${(e) => {
      this._chooseResourceTemplate(e);
    }}"
                           .cpu="${item.cpu}"
                           .mem="${item.mem}"
                           .cuda_device="${item.cuda_device}"
                           .cuda_shares="${item.cuda_shares}"
                           .rocm_device="${item.rocm_device}"
                           .tpu_device="${item.tpu_device}"
                           .shmem="${item.shmem}">
                <div class="horizontal layout end-justified">
                  <div style="width:110px;">${item.name}</div>
                  <div style="display:none"> (</div>
                  <div style="width:50px;text-align:right;">${item.cpu}<span style="display:none">CPU</span></div>
                  <div style="width:50px;text-align:right;">${item.mem}GB</div>
                  <div style="width:50px;text-align:right;">${item.shmem ? html`${item.shmem}GB` : html`64MB`}</div>
                  <div style="width:90px;text-align:right;">
                    ${item.cuda_device && item.cuda_device > 0 ? html`${item.cuda_device} CUDA GPU` : html``}
                    ${item.cuda_shares && item.cuda_shares > 0 ? html`${item.cuda_shares} GPU` : html``}
                    ${item.rocm_device && item.rocm_device > 0 ? html`${item.rocm_device} ROCM GPU` : html``}
                    ${item.tpu_device && item.tpu_device > 0 ? html`${item.tpu_device} TPU` : html``}
                  </div>
                  <div style="display:none">)</div>
                </div>
              </mwc-list-item>
            `)}
            ${this.isEmpty(this.resource_templates_filtered) ? html`
              <mwc-list-item class="resource-button vertical center start layout" role="option"
                         style="height:140px;width:350px;" type="button"
                         flat inverted outlined disabled>
                <div>
                  <h4>${_t("session.launcher.NoSuitablePreset")}</h4>
                  <div style="font-size:12px;">Use advanced settings to <br>start custom session</div>
                </div>
              </mwc-list-item>
              ` : html``}
            </mwc-select>
          </div>
          <wl-expansion name="resource-group" open style="--expansion-header-padding:16px;">
            <span slot="title" style="font-size:12px;color:#404040;">${_t("session.launcher.CustomAllocation")}</span>
            <span slot="description" style="font-size:12px;color:#646464;"></span>
            <div class="vertical layout">
              <div class="horizontal center layout">
                <div class="resource-type" style="width:70px;">CPU</div>
                <lablup-slider id="cpu-resource" class="cpu"
                               pin snaps expand editable markers
                               @click="${this._resourceTemplateToCustom}"
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
                             @click="${this._resourceTemplateToCustom}"
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
                             pin snaps step="0.0025" editable markers
                             @click="${this._resourceTemplateToCustom}"
                             marker_limit="${this.marker_limit}"
                             min="0.0625" max="${this.shmem_metric.max}"
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
                             @click="${this._resourceTemplateToCustom}"
                             marker_limit="${this.marker_limit}"
                             min="0.0" max="${this.cuda_device_metric.max}" value="${this.gpu_request}"></lablup-slider>
              <span class="caption">GPU</span>
              <mwc-icon-button icon="info" class="fg blue info" @click="${(e) => {
      this._showResourceDescription(e, 'gpu');
    }}"></mwc-icon-button>
            </div>
            <div class="horizontal center layout">
              <div class="resource-type" style="width:70px;">Sessions</div>
              <lablup-slider id="session-resource" class="session"
                             pin snaps editable markers step="1"
                             @click="${this._resourceTemplateToCustom}"
                             marker_limit="${this.marker_limit}"
                             min="1" max="${this.concurrency_limit}" value="${this.session_request}"></lablup-slider>
              <span class="caption">#</span>
              <mwc-icon-button icon="info" class="fg red info" @click="${(e) => {
      this._showResourceDescription(e, 'session');
    }}"></mwc-icon-button>
            </div>
          </div>
        </wl-expansion>

        <wl-expansion name="ownership" style="--expansion-header-padding:16px;--expansion-content-padding:15px 0;">
          <span slot="title" style="font-size:12px;color:#404040;">${_t("session.launcher.SetSessionOwner")}</span>
          <span slot="description"></span>
          <div class="vertical layout">
            <div class="horizontal center layout">
              <mwc-textfield id="owner-email" type="email" class="flex" value=""
                pattern="^.+@.+\..+$"
                label="${_t("session.launcher.OwnerEmail")}" size="40"></mwc-textfield>
              <mwc-icon-button icon="refresh" class="blue"
                @click="${() => this._fetchSessionOwnerGroups()}">
              </mwc-icon-button>
            </div>
            <mwc-select id="owner-accesskey" label="${_t("session.launcher.OwnerAccessKey")}">
              ${this.ownerKeypairs.map(item => html`
                <mwc-list-item class="owner-group-dropdown"
                               id="${item.access_key}"
                               value="${item.access_key}">
                  ${item.access_key}
                </mwc-list-item>
              `)}
            </mwc-select>
            <div class="horizontal center layout">
              <mwc-select id="owner-group" label="${_t("session.launcher.OwnerGroup")}">
                ${this.ownerGroups.map(item => html`
                  <mwc-list-item class="owner-group-dropdown"
                                 id="${item.name}"
                                 value="${item.name}">
                    ${item.name}
                  </mwc-list-item>
                `)}
              </mwc-select>
              <mwc-select id="owner-scaling-group" label="${_t("session.launcher.OwnerResourceGroup")}">
                ${this.ownerScalingGroups.map(item => html`
                  <mwc-list-item class="owner-group-dropdown"
                                 id="${item.name}"
                                 value="${item.name}">
                    ${item.name}
                  </mwc-list-item>
                `)}
              </mwc-select>
            </div>
            <wl-label style="padding:15px;">
              <wl-checkbox id="owner-enabled"></wl-checkbox>
              ${_t("session.launcher.LaunchSessionWithAccessKey")}
            </wl-label>
          </div>
        </wl-expansion>
      </form>
      <div slot="footer" class="horizontal center-justified flex layout distancing">
        <mwc-button
            unelevated
            class="launch-button"
            id="launch-button"
            icon="rowing"
            @click="${() => this._newSessionWithConfirmation()}">
          <span id="launch-button-msg">${_t('session.launcher.Launch')}</span>
        </mwc-button>
      </div>
    </backend-ai-dialog>
    <backend-ai-dialog id="help-description" fixed backdrop>
      <span slot="title">${this._helpDescriptionTitle}</span>
      <div slot="content" class="horizontal layout center" style="margin:5px;">
      ${this._helpDescriptionIcon == '' ? html`` : html`
        <img slot="graphic" src="resources/icons/${this._helpDescriptionIcon}" style="width:64px;height:64px;margin-right:10px;" />
        `}
        <p style="font-size:14px;">${unsafeHTML(this._helpDescription)}</p>
      </div>
    </backend-ai-dialog>
    <backend-ai-dialog id="launch-confirmation-dialog" warning fixed backdrop>
      <span slot="title">${_t('session.launcher.NoFolderMounted')}</span>
      <div slot="content" class="vertical layout">
        <p>${_t('session.launcher.HomeDirectoryDeletionDialog')}</p>
        <p>${_t('session.launcher.LaunchConfirmationDialog')}</p>
        <p>${_t('dialog.ask.DoYouWantToProceed')}</p>
      </div>
      <div slot="footer" class="horizontal end-justified flex layout">
        <mwc-button
            unelevated
            class="launch-confirmation-button"
            id="launch-confirmation-button"
            icon="rowing"
            @click="${() => this._newSession()}">
          <span id="launch-button-msg">${_t('session.launcher.Launch')}</span>
        </mwc-button>
      </div>
    </backend-ai-dialog>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-session-launcher": BackendAiSessionLauncher;
  }
}
