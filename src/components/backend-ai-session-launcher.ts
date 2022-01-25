/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

import {BackendAIPage} from './backend-ai-page';

import '@material/mwc-button';
import '@material/mwc-checkbox/mwc-checkbox';
import '@material/mwc-icon-button';
import '@material/mwc-linear-progress';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-list/mwc-check-list-item';
import '@material/mwc-select';
import '@material/mwc-switch';
import '@material/mwc-textfield/mwc-textfield';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-date-time-picker/vaadin-date-time-picker';

import 'weightless/checkbox';
import 'weightless/expansion';
import 'weightless/icon';
import 'weightless/label';

import './lablup-codemirror';
import './lablup-progress-bar';
import './lablup-slider';
import './backend-ai-dialog';

import {default as PainKiller} from './backend-ai-painkiller';

import '../plastics/lablup-shields/lablup-shields';
import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend AI Session Launcher Carousel

 Example:

 <backend-ai-session-launcher active></backend-ai-session-launcher>

@group Backend.AI Web UI
 @element backend-ai-session-launcher
 */

@customElement('backend-ai-session-launcher')
export default class BackendAiSessionLauncher extends BackendAIPage {
  @query('#image-name') manualImageName;
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
  @property({type: Number}) gpu_step = 0.1;
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
  @property({type: Object}) cluster_metric = {
    'min': 1,
    'max': 1
  };
  @property({type: Array}) cluster_mode_list = [
    'single-node', 'multi-node'
  ];
  @property({type: Boolean}) cluster_support = false;
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
  @property({type: Number}) max_containers_per_session;
  @property({type: Array}) vfolders;
  @property({type: Array}) selectedVfolders;
  @property({type: Array}) autoMountedVfolders;
  @property({type: Array}) nonAutoMountedVfolders;
  @property({type: Object}) folderMapping = Object();
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
  @property({type: String}) sessionType = 'interactive';
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
  @property({type: Number}) max_cpu_core_per_session = 128;
  @property({type: Number}) max_mem_per_container = 1536;
  @property({type: Number}) max_cuda_device_per_container = 16;
  @property({type: Number}) max_cuda_shares_per_container = 16;
  @property({type: Number}) max_shm_per_container = 8;
  @property({type: Boolean}) allow_manual_image_name_for_session = false;
  @property({type: Object}) resourceBroker;
  @property({type: Number}) cluster_size = 1;
  @property({type: String}) cluster_mode;
  @property({type: Object}) deleteEnvInfo = Object();
  @property({type: Object}) deleteEnvRow = Object();
  @property({type: Array}) environ;
  @property({type: Object}) environ_values = Object();
  @property({type: Object}) vfolder_select_expansion = Object();
  @property({type: Number}) currentIndex = 1;
  @property({type: Number}) progressLength;
  @property({type: Object}) _grid = Object();
  @property({type: Boolean}) _debug = false;
  @property({type: Object}) _boundFolderMapRenderer = this.folderMapRenderer.bind(this);
  @property({type: Boolean}) useScheduledTime = false;
  @property({type: Object}) schedulerTimer;

  constructor() {
    super();
    this.active = false;
    this.ownerKeypairs = [];
    this.ownerGroups = [];
    this.ownerScalingGroups = [];
    this.resourceBroker = globalThis.resourceBroker;
    this.notification = globalThis.lablupNotification;
    this.environ = [];
    this.init_resource();
  }

  static get is() {
    return 'backend-ai-session-launcher';
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        lablup-slider {
          width: 200px !important;
          --textfield-width: 50px;
          --slider-width: 120px;
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

        lablup-slider.cluster {
          --slider-color: var(--paper-blue-500);
        }

        lablup-progress-bar {
          --progress-bar-width: 100%;
          --progress-bar-height: 10px;
          --progress-bar-border-radius: 0px;
          height: 100%;
          width: 100%;
          --progress-bar-background: var(--general-progress-bar-using);
          /* transition speed for progress bar */
          --progress-bar-transition-second: .1s;
          margin: 0;
        }

        vaadin-grid {
          max-height: 450px;
        }

        .progress {
          // padding-top: 15px;
          position: relative;
          z-index: 12;
          display: none;
        }

        .progress.active {
          display: block;
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
          font-weight: 300;
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
          margin-right: 10px;
        }

        div.vfolder-list,
        div.vfolder-mounted-list,
        #mounted-folders-container,
        .environment-variables-container
         {
          background-color: rgba(244,244,244,1);
          overflow-y: scroll;
        }

        div.vfolder-list,
        div.vfolder-mounted-list {
          max-height: 450px;
        }

        div.blank-box {
          padding: 3rem 0;
        }

        div.blank-box-medium {
          padding: 8.8rem 0;
        }

        div.blank-box-large {
          padding: 11.3rem 0;
        }

        .environment-variables-container {
          font-size: 0.8rem;
          padding: 10px;
        }

        .environment-variables-container wl-textfield input {
          overflow: hidden;
          text-overflow: ellipsis;
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
        .cluster-total-allocation-container {
          border-radius:10px;
          border:1px dotted var(--general-button-background-color);
          padding-top:10px;
          margin-left:15px;
          margin-right:15px;
        }

        .resource-button {
          height: 140px;
          width: 330px;
          margin: 5px;
          padding: 0;
          font-size: 14px;
        }

        .resource-allocated {
          width: 40px;
          height: 60px;
          font-size: 16px;
          margin: 5px;
          opacity: 1;
          z-index:11;
        }

        .resource-allocated > p {
          margin: 0 auto;
          font-size: 8px;
        }
        .resource-allocated-box {
          z-index:10;
          position: relative;
        }
        .resource-allocated-box-shadow {
          position:relative;
          z-index:1;
          top: -65px;
          height:200px;
          width:70px;
          opacity: 1;
        }

        .cluster-allocated {
          min-width: 40px;
          min-height: 40px;
          width: auto;
          height: 70px;
          border-radius: 5px;
          font-size: 1rem;
          margin: 5px;
          padding: 0px 5px;
          background-color: var(--general-button-background-color);
          color: white;
        }

        .cluster-allocated > div.horizontal > p {
          font-size: 1rem;
          margin: 0px;
        }

        .cluster-allocated > p.small {
          font-size: 8px;
          margin: 0px;
        }

        .resource-allocated > span,
        .cluster-allocated > div.horizontal > span {
          font-weight: bolder;
        }

        .allocation-check {
          margin-bottom: 10px;
        }

        .resource-allocated-box {
          background-color: var(--paper-grey-300);
          border-radius: 5px;
          margin: 5px;
          z-index:10;
        }

        #new-session-dialog {
          --component-width: 400px;
          --component-height: 640px;
          --component-max-height: 640px;
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

        #launch-session {
          width: var(--component-width, auto);
          height: var(--component-height, 36px);
        }

        #launch-session[disabled] {
          background-image: var(--general-sidebar-color);
          --mdc-theme-on-primary: var(--general-button-color);
        }

        #launch-session-form {
          height: calc(var(--component-height, auto) - 157px);
        }

        wl-button > span {
          margin-left: 5px;
          font-weight: normal;
        }

        wl-icon {
          --icon-size: 20px;
        }

        wl-expansion {
          --font-family-serif: var(--general-font-family);
          --expansion-elevation: 0;
          --expansion-elevation-open: 0;
          --expansion-elevation-hover: 0;
          --expansion-header-padding: 16px;
          --expansion-margin-open: 0;
        }

        wl-expansion span[slot="title"] {
          font-size: 12px;
          color: rgb(64, 64, 64);
          font-weight: normal;
        }

        wl-expansion.vfolder,
        wl-expansion.editor {
          --expansion-content-padding: 0;
          border-bottom: 1px;
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

        vaadin-date-time-picker {
          width: 370px;
          margin-bottom: 10px;
        }

        lablup-codemirror {
          width: 370px;
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
          --mdc-select-disabled-ink-color: rgba(0, 0, 0, 0.64);
          --mdc-select-disabled-dropdown-icon-color: rgba(255, 0, 0, 0.87);
          --mdc-select-disabled-fill-color: rgba(244, 244, 244, 1);
          --mdc-select-idle-line-color: rgba(0, 0, 0, 0.42);
          --mdc-select-hover-line-color: rgba(255, 0, 0, 0.87);
          --mdc-select-outlined-idle-border-color: rgba(255, 0, 0, 0.42);
          --mdc-select-outlined-hover-border-color: rgba(255, 0, 0, 0.87);
          --mdc-theme-surface: white;
          --mdc-list-vertical-padding: 5px;
          --mdc-list-side-padding: 15px;
          --mdc-list-item__primary-text: {
            height: 20px;
          };
          /* Need to be set when fixedMenuPosition attribute is enabled */
          --mdc-menu-max-width: 400px;
          --mdc-menu-min-width: 400px;
        }

        mwc-select#owner-group,
        mwc-select#owner-scaling-group {
          margin-right: 0;
          padding-right: 0;
          width: 50%;
          --mdc-menu-max-width: 200px;
          --mdc-select-min-width: 190px;
        }

        mwc-textfield {
          width: 100%;
          font-family: var(--general-font-family);
          --mdc-typography-subtitle1-font-family: var(--general-font-family);
          --mdc-text-field-idle-line-color: rgba(0, 0, 0, 0.42);
          --mdc-text-field-hover-line-color: rgba(255, 0, 0, 0.87);
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--paper-red-600);
        }

        mwc-textfield#session-name {
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

        mwc-checkbox {
          --mdc-theme-secondary: var(--general-checkbox-color);
        }

        #prev-button, #next-button {
          color: #27824F;
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

        #launch-confirmation-dialog, #env-config-confirmation {
          --component-width: 400px;
          --component-font-size: 14px;
        }

        mwc-icon-button.info {
          --mdc-icon-button-size: 30px;
        }

        mwc-icon {
          --mdc-icon-size: 13px;
          margin-right: 2px;
          vertical-align: middle;
        }

        ul {
          list-style-type: none;
        }

        ul.vfolder-list {
          color: #646464;
          font-size: 12px;
          max-height: inherit;
        }

        ul.vfolder-list > li {
          max-width: 90%;
          display: block;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }

        mwc-button > mwc-icon {
          display: none;
        }

        p.title {
          padding: 2px 15px 10px 15px;
          margin-top: 0;
          font-size: 12px;
          font-weight: 200;
          color: #404040;
        }

        #progress-04 p.title {
          font-weight: 400;
        }

        #batch-mode-config-section {
          width: 100%;
          border-bottom: solid 1px rgba(0, 0, 0, 0.42);
          margin-bottom: 15px;
        }

        .launcher-item-title {
          font-size: 14px;
          color: #404040;
          font-weight: 400;
          padding-left:16px;
          width: 100%;
        }

        .allocation-shadow {
          height: 70px;
          width: 200px;
          position: absolute;
          top: -5px;
          left: 5px;
          border: 1px solid #ccc;
        }

        #modify-env-dialog {
          --component-max-height: 550px;
          --component-width: 400px;
        }

        #modify-env-dialog div.container {
          display: flex;
          flex-direction: column;
          padding: 0px 30px;
        }

        #modify-env-dialog div.row {
          display: grid;
          grid-template-columns: 4fr 4fr 1fr;
          margin-bottom: 10px;
        }

        .environment-variables-container h4 {
          margin: 0;
        }

        .environment-variables-container wl-textfield {
          --input-font-family: var(--general-font-family);
          --input-color-disabled: #222;
        }

        @media screen and (max-width: 375px) {
          lablup-slider {
            width: 180px;
            --textfield-width: 50px;
            --slider-width: 100px;
          }

          backend-ai-dialog {
            --component-min-width: 350px;
          }
        }

        @media screen and (max-width: 750px) {
          mwc-button > mwc-icon {
            display: inline-block;
          }
        }

        /* Fading animation */
        .fade {
          -webkit-animation-name: fade;
          -webkit-animation-duration: 1s;
          animation-name: fade;
          animation-duration: 1s;
        }

        @-webkit-keyframes fade {
          from {opacity: .7}
          to {opacity: 1}
        }

        @keyframes fade {
          from {opacity: .7}
          to {opacity: 1}
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
    this.nonAutoMountedVfolders = [];
    this.autoMountedVfolders = [];
    this.default_language = '';
    this.concurrency_used = 0;
    this.concurrency_max = 0;
    this.concurrency_limit = 1;
    this.max_containers_per_session = 1;
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
    this.cluster_size = 1; // cluster_size must be equal or greater than 1.
    this.cluster_mode = 'single-node';
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

    this.shadowRoot.querySelectorAll('wl-expansion').forEach((element) => {
      element.addEventListener('keydown', (event) => {
        event.stopPropagation();
      }, true);
    });

    this.resourceGauge = this.shadowRoot.querySelector('#resource-gauges');
    document.addEventListener('backend-ai-group-changed', (e) => {
      this._updatePageVariables(true);
    });
    document.addEventListener('backend-ai-resource-broker-updated', (e) => {
      // Fires when broker is updated.
    });
    if (this.hideLaunchButton === true) {
      this.shadowRoot.querySelector('#launch-session').style.display = 'none';
    }

    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.max_cpu_core_per_session = globalThis.backendaiclient._config.maxCPUCoresPerContainer || 128;
        this.max_mem_per_container = globalThis.backendaiclient._config.maxMemoryPerContainer || 1536;
        this.max_cuda_device_per_container = globalThis.backendaiclient._config.maxCUDADevicesPerContainer || 16;
        this.max_cuda_shares_per_container = globalThis.backendaiclient._config.maxCUDASharesPerContainer || 16;
        this.max_shm_per_container = globalThis.backendaiclient._config.maxShmPerContainer || 8;
        if (globalThis.backendaiclient._config.allow_manual_image_name_for_session !== undefined &&
          'allow_manual_image_name_for_session' in globalThis.backendaiclient._config &&
          globalThis.backendaiclient._config.allow_manual_image_name_for_session !== '') {
          this.allow_manual_image_name_for_session = globalThis.backendaiclient._config.allow_manual_image_name_for_session;
        } else {
          this.allow_manual_image_name_for_session = false;
        }
        if (globalThis.backendaiclient.supports('multi-container')) {
          this.cluster_support = true;
        }
        this.is_connected = true;
        this._debug = globalThis.backendaiwebui.debug;
        this._enableLaunchButton();
      }, {once: true});
    } else {
      this.max_cpu_core_per_session = globalThis.backendaiclient._config.maxCPUCoresPerContainer || 128;
      this.max_mem_per_container = globalThis.backendaiclient._config.maxMemoryPerContainer || 1536;
      this.max_cuda_device_per_container = globalThis.backendaiclient._config.maxCUDADevicesPerContainer || 16;
      this.max_cuda_shares_per_container = globalThis.backendaiclient._config.maxCUDASharesPerContainer || 16;
      this.max_shm_per_container = globalThis.backendaiclient._config.maxShmPerContainer || 8;
      if (globalThis.backendaiclient._config.allow_manual_image_name_for_session !== undefined &&
        'allow_manual_image_name_for_session' in globalThis.backendaiclient._config &&
        globalThis.backendaiclient._config.allow_manual_image_name_for_session !== '') {
        this.allow_manual_image_name_for_session = globalThis.backendaiclient._config.allow_manual_image_name_for_session;
      } else {
        this.allow_manual_image_name_for_session = false;
      }
      if (globalThis.backendaiclient.supports('multi-container')) {
        this.cluster_support = true;
      }
      this.is_connected = true;
      this._debug = globalThis.backendaiwebui.debug;
      this._enableLaunchButton();
    }
    const modifyEnvDialog = this.shadowRoot.querySelector('#modify-env-dialog');
    modifyEnvDialog.addEventListener('dialog-closing-confirm', (e) => {
      const currentEnv = {};
      const container = this.shadowRoot.querySelector('#modify-env-container');
      const rows = container.querySelectorAll('.row:not(.header)');

      // allow any input in variable or value
      const nonempty = (row) => Array.prototype.filter.call(
        row.querySelectorAll('wl-textfield'), (tf, idx) => tf.value === ''
      ).length <= 1;

      const encodeRow = (row) => {
        const items: Array<any> = Array.prototype.map.call(row.querySelectorAll('wl-textfield'), (tf) => tf.value);
        currentEnv[items[0]] = items[1];
        return items;
      };
      Array.prototype.filter.call(rows, (row) => nonempty(row)).map((row) => encodeRow(row));

      // check if there's any changes occurred
      const isEquivalent = (a, b) => {
        // create arrays of property names
        const aProps = Object.getOwnPropertyNames(a);
        const bProps = Object.getOwnPropertyNames(b);

        if (aProps.length != bProps.length) {
          return false;
        }

        for (let i = 0; i < aProps.length; i++) {
          const propName = aProps[i];

          if (a[propName] !== b[propName]) {
            return false;
          }
        }
        return true;
      };

      if (!isEquivalent(currentEnv, this.environ_values)) {
        this.openDialog('env-config-confirmation');
      } else {
        modifyEnvDialog.closeWithConfirmation = false;
        this.closeDialog('modify-env-dialog');
      }
    });
    this.currentIndex = 1;
    this.progressLength = this.shadowRoot.querySelectorAll('.progress').length;
    this._grid = this.shadowRoot.querySelector('#vfolder-grid');
    // Tricks to close expansion if window size changes
    globalThis.addEventListener('resize', () => {
      document.body.dispatchEvent(new Event('click'));
    });
  }

  _enableLaunchButton() {
    // Check preconditions and enable it via pooling
    if (!this.resourceBroker.image_updating) { // Image information is successfully updated.
      this.languages = this.resourceBroker.languages;
      this.enableLaunchButton = true;
    } else {
      this.enableLaunchButton = false;
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
    const Sgroups = this.shadowRoot.querySelector('#scaling-groups');
    this.scaling_groups = this.resourceBroker.scaling_groups;
    const selectedSgroup = Sgroups.items.find((item) => item.value === this.resourceBroker.scaling_group);
    if (this.resourceBroker.scaling_group === '' || typeof selectedSgroup == 'undefined') {
      setTimeout(() => {
        this._updateSelectedScalingGroup();
      }, 500);
      return;
    }
    const idx = Sgroups.items.indexOf(selectedSgroup);
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
   * Update selected folders.
   * If selectedFolderItems are not empty and forceInitialize is true, unselect the selected items
   *
   * @param {boolean} forceInitialize - whether to initialize selected vfolder or not
   * */
  async _updateSelectedFolder(forceInitialize = false) {
    if (this._grid && this._grid.selectedItems) {
      const selectedFolderItems = this._grid.selectedItems;
      let selectedFolders: string[] = [];
      if (selectedFolderItems.length > 0) {
        selectedFolders = selectedFolderItems.map((item) => item.name);
        if (forceInitialize) {
          this._unselectAllSelectedFolder();
        }
      }
      this.selectedVfolders = selectedFolders;
      for (const folder of this.selectedVfolders) {
        if (folder in this.folderMapping && this.selectedVfolders.includes(this.folderMapping[folder])) {
          delete this.folderMapping[folder];
          this.shadowRoot.querySelector('#vfolder-alias-' + folder).value = '';
          await this.shadowRoot.querySelector('#vfolder-mount-preview').updateComplete.then(() => this.requestUpdate());
          return Promise.resolve(true);
        }
      }
    }
    return Promise.resolve(true);
  }

  /**
   * Unselect the selected items and update selectedVfolders to be empty.
   *
   */
  _unselectAllSelectedFolder() {
    if (this._grid && this._grid.selectedItems) {
      this._grid.selectedItems.forEach((item) => {
        item.selected = false;
      });
      this._grid.selectedItems = [];
    }
    this.selectedVfolders = [];
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
      this.max_containers_per_session = this.resourceBroker.max_containers_per_session;
      this.gpu_mode = this.resourceBroker.gpu_mode;
      this.gpu_step = this.resourceBroker.gpu_step;
      this.gpu_modes = this.resourceBroker.gpu_modes;
      this.updateResourceAllocationPane('refresh resource policy');
    }).catch((err) => {
      // console.log(err);
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
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false || this.resourceBroker.image_updating === true) {
      setTimeout(() => {
        this._launchSessionDialog();
      }, 1000);
      // this.notification.text = _text('session.launcher.PleaseWaitInitializing');
      // this.notification.show();
    } else {
      this.folderMapping = Object();
      this._resetProgress();
      await this.selectDefaultLanguage();
      // Set display property of ownership panel.
      const ownershipPanel = this.shadowRoot.querySelector('wl-expansion[name="ownership"]');
      if (globalThis.backendaiclient.is_admin) {
        ownershipPanel.style.display = 'block';
      } else {
        ownershipPanel.style.display = 'none';
      }
      this._updateSelectedScalingGroup();
      /* To reflect current resource policy */
      await this._refreshResourcePolicy();
      this.requestUpdate();
      this._toggleScheduleTime(!this.useScheduledTime);
      this.shadowRoot.querySelector('#new-session-dialog').show();
    }
  }

  _generateKernelIndex(kernel, version) {
    return kernel + ':' + version;
  }

  /**
   * Move current progress of session launcher dialog to the last
   *
   */
  _moveToLastProgress() {
    this.moveProgress(4);
  }

  /**
   * If vfolder has not any items, show launch-confirmation-dialog.
   * Else, make new session by call _newSession().
   *
   * @return {void}
   * */
  _newSessionWithConfirmation() {
    const vfoldersCount = this._grid?.selectedItems?.map((item) => item.name).length;
    // check whether the progress is in the last stage
    if (this.currentIndex == this.progressLength) {
      if (vfoldersCount !== undefined && vfoldersCount > 0) {
        return this._newSession();
      } else {
        const confirmationDialog = this.shadowRoot.querySelector('#launch-confirmation-dialog');
        confirmationDialog.show();
      }
    } else {
      this._moveToLastProgress();
    }
  }

  /**
   * Make a new session.
   * */
  _newSession() {
    const confirmationDialog = this.shadowRoot.querySelector('#launch-confirmation-dialog');
    confirmationDialog.hide();
    let kernel;
    let version;
    if (this.manualImageName && this.manualImageName.value) {
      const nameFragments = this.manualImageName.value.split(':');
      version = nameFragments.splice(-1, 1)[0];
      kernel = nameFragments.join(':');
    } else {
      // When the "Environment" dropdown is disabled after typing the image name manually,
      // `selecteditem.id` is `null` and raises "id" exception when trying to launch the session.
      // That's why we need if-else block here.
      const selectedItem = this.shadowRoot.querySelector('#environment').selected;
      kernel = selectedItem.id;
      version = this.shadowRoot.querySelector('#version').value;
    }
    this.sessionType = this.shadowRoot.querySelector('#session-type').value;
    let sessionName = this.shadowRoot.querySelector('#session-name').value;
    const isSessionNameValid = this.shadowRoot.querySelector('#session-name').checkValidity();
    const vfolder = this.selectedVfolders;
    this.cpu_request = parseInt(this.shadowRoot.querySelector('#cpu-resource').value);
    this.mem_request = parseFloat(this.shadowRoot.querySelector('#mem-resource').value);
    this.shmem_request = parseFloat(this.shadowRoot.querySelector('#shmem-resource').value);
    this.gpu_request = parseFloat(this.shadowRoot.querySelector('#gpu-resource').value);
    this.session_request = parseInt(this.shadowRoot.querySelector('#session-resource').value);
    this.num_sessions = this.session_request;
    if (this.sessions_list.includes(sessionName)) {
      this.notification.text = _text('session.launcher.DuplicatedSessionName');
      this.notification.show();
      return;
    }
    if (!isSessionNameValid) {
      this.notification.text = _text('session.launcher.SessionNameAllowCondition');
      this.notification.show();
      return;
    }

    if (kernel === '' || version === '' || version === 'Not Selected') {
      this.notification.text = _text('session.launcher.MustSpecifyVersion');
      this.notification.show();
      return;
    }
    this.scaling_group = this.shadowRoot.querySelector('#scaling-groups').value;
    const config = {};
    config['group_name'] = globalThis.backendaiclient.current_group;
    config['domain'] = globalThis.backendaiclient._config.domainName;
    config['scaling_group'] = this.scaling_group;
    config['type'] = this.sessionType;
    if (globalThis.backendaiclient.supports('multi-container')) {
      config['cluster_mode'] = this.cluster_mode;
      config['cluster_size'] = this.cluster_size;
    }
    config['maxWaitSeconds'] = 15;
    const ownerEnabled = this.shadowRoot.querySelector('#owner-enabled');
    if (ownerEnabled && ownerEnabled.checked) {
      config['group_name'] = this.shadowRoot.querySelector('#owner-group').value;
      config['domain'] = this.ownerDomain;
      config['scaling_group'] = this.shadowRoot.querySelector('#owner-scaling-group').value;
      config['owner_access_key'] = this.shadowRoot.querySelector('#owner-accesskey').value;
      if (!config['group_name'] || !config['domain'] || !config['scaling_group'] || !config ['owner_access_key']) {
        this.notification.text = _text('session.launcher.NotEnoughOwnershipInfo');
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
    if (String(this.shadowRoot.querySelector('#mem-resource').value) === 'Infinity') {
      config['mem'] = String(this.shadowRoot.querySelector('#mem-resource').value);
    } else {
      config['mem'] = String(this.mem_request) + 'g';
    }
    if (this.shmem_request > this.mem_request) { // To prevent overflow of shared memory
      this.shmem_request = this.mem_request;
      this.notification.text = _text('session.launcher.SharedMemorySettingIsReduced');
      this.notification.show();
    }
    if (this.mem_request > 4 && this.shmem_request < 1) { // Automatically increase shared memory to 1GB
      this.shmem_request = 1;
    }
    config['shmem'] = String(this.shmem_request) + 'g';

    if (sessionName.length == 0) { // No name is given
      sessionName = this.generateSessionId();
    }
    if (vfolder.length !== 0) {
      config['mounts'] = vfolder;
      if (Object.keys(this.folderMapping).length !== 0) {
        config['mount_map'] = {};
        for (const f in this.folderMapping) {
          if ({}.hasOwnProperty.call(this.folderMapping, f)) {
            config['mount_map'][f] = '/home/work/' + this.folderMapping[f];
          }
        }
      }
    }
    if (this.mode === 'import' && this.importScript !== '') {
      config['bootstrap_script'] = this.importScript;
    }
    if (this.sessionType === 'batch') {
      const editor = this.shadowRoot.querySelector('lablup-codemirror#command-editor');
      config['startupCommand'] = editor.getValue();

      const scheduledTime = this.shadowRoot.querySelector('vaadin-date-time-picker').value;
      const useScheduledTime = this.shadowRoot.querySelector('#use-scheduled-time').selected;
      if (scheduledTime && useScheduledTime) {
        // modify client timezone offset
        const getClientTimezoneOffset = () => {
          let offset = new Date().getTimezoneOffset();
          const sign = offset < 0 ? '+' : '-';
          offset = Math.abs(offset);
          return sign + (offset / 60 | 0).toString().padStart(2, '0') + ':' + (offset % 60).toString().padStart(2, '0');
        };
        config['startsAt'] = scheduledTime + getClientTimezoneOffset();
      }
    }
    if (this.environ_values !== {}) {
      config['env'] = this.environ_values;
    }
    if (this.shadowRoot.querySelector('#OpenMPswitch').selected === false) {
      const openMPCoreValue = this.shadowRoot.querySelector('#OpenMPCore').value;
      const openBLASCoreValue = this.shadowRoot.querySelector('#OpenBLASCore').value;
      config['env']['OMP_NUM_THREADS'] = openMPCoreValue ? Math.max(0, parseInt(openMPCoreValue)).toString() : '1';
      config['env']['OPENBLAS_NUM_THREADS'] = openBLASCoreValue ? Math.max(0, parseInt(openBLASCoreValue)).toString() : '1';
    }
    let kernelName: string;
    if (this._debug || ( this.manualImageName && this.manualImageName.value !== '')) {
      kernelName = this.manualImageName.value;
    } else {
      kernelName = this._generateKernelIndex(kernel, version);
    }
    this.shadowRoot.querySelector('#launch-button').disabled = true;
    this.shadowRoot.querySelector('#launch-button-msg').textContent = _text('session.Preparing');
    this.notification.text = _text('session.PreparingSession');
    this.notification.show();

    const sessions: any = [];
    const randStr = this._getRandomString();

    if (this.num_sessions > 1) {
      for (let i = 1; i <= this.num_sessions; i++) {
        const add_session = {'kernelName': kernelName, 'sessionName': `${sessionName}-${randStr}-${i}`, config};
        sessions.push(add_session);
      }
    } else {
      sessions.push({'kernelName': kernelName, 'sessionName': sessionName, config});
    }
    const createSessionQueue = sessions.map((item) => {
      return this.tasker.add('Creating ' + item.sessionName, this._createKernel(item.kernelName, item.sessionName, item.config), '', 'session');
    });
    Promise.all(createSessionQueue).then((res: any) => {
      this.shadowRoot.querySelector('#new-session-dialog').hide();
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = _text('session.launcher.ConfirmAndLaunch');
      this._resetProgress();
      setTimeout(() => {
        this.metadata_updating = true;
        this.aggregateResource('session-creation');
        this.metadata_updating = false;
      }, 1500);
      const event = new CustomEvent('backend-ai-session-list-refreshed', {'detail': 'running'});
      document.dispatchEvent(event);
      // only open appLauncher when session type is 'interactive'
      if (res.length === 1 && this.sessionType !== 'batch') {
        res[0].taskobj.then((res) => {
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
          const service_info = res.servicePorts;
          if (Array.isArray(service_info) === true) {
            appOptions['app-services'] = service_info.map((a) => a.name);
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
      // initialize vfolder
      this._updateSelectedFolder(false);
    }).catch((err) => {
      // this.metadata_updating = false;
      // console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.message);
        if (err.description) {
          this.notification.text = PainKiller.relieve(err.description);
        } else {
          this.notification.detail = err.message;
        }
        this.notification.show(true, err);
      } else if (err && err.title) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.show(true, err);
      }
      const event = new CustomEvent('backend-ai-session-list-refreshed', {'detail': 'running'});
      document.dispatchEvent(event);
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = _text('session.launcher.ConfirmAndLaunch');
    });
  }

  _getRandomString() {
    let randnum = Math.floor(Math.random() * 52 * 52 * 52);

    const parseNum = (num) => {
      if (num < 26) return String.fromCharCode(65 + num);
      else return String.fromCharCode(97 + num - 26);
    };

    let randstr = '';

    for (let i = 0; i < 3; i++) {
      randstr += parseNum(randnum % 52);
      randnum = Math.floor(randnum / 52);
    }

    return randstr;
  }

  _createKernel(kernelName, sessionName, config) {
    const task = globalThis.backendaiclient.createIfNotExists(kernelName, sessionName, config, 20000);
    task.catch((err) => {
      // console.log(err);
      if (err && err.message) {
        if ('statusCode' in err && err.statusCode === 408) {
          this.notification.text = _text('session.launcher.sessionStillPreparing');
        } else {
          if (err.description) {
            this.notification.text = PainKiller.relieve(err.description);
          } else {
            this.notification.text = PainKiller.relieve(err.message);
          }
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
    const alias = {
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
      'triton-server': 'Triton Server',
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
      'py310': 'Python 3.10',
      'ji15': 'Julia 1.5',
      'ji16': 'Julia 1.6',
      'ji17': 'Julia 1.7',
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
      'cuda11.3': 'GPU:CUDA11.3',
      'miniconda': 'Miniconda',
      'anaconda2018.12': 'Anaconda 2018.12',
      'anaconda2019.12': 'Anaconda 2019.12',
      'alpine3.8': 'Alpine Linux 3.8',
      'alpine3.12': 'Alpine Linux 3.12',
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
      const versions = this.resourceBroker.supports[kernel];
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
        // this.version_selector.selectedText = this.version_selector.value;
        this._updateVersionSelectorText(this.version_selector.value);
        this.version_selector.disabled = false;
        this.environ_values = {};
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
    const res = this._getVersionInfo(text);
    const resultArray: string[] = [];
    res.forEach((item) => {
      resultArray.push(item.tag);
    });
    this.version_selector.selectedText = resultArray.join(' / ');
  }

  /**
   * Randomly generate session ID
   *
   * @return {string} Generated session ID
   * */
  generateSessionId() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text + '-session';
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
  async _aggregateResourceUse(from = '') {
    return this.resourceBroker._aggregateCurrentResource(from).then(async (res) => {
      if (res === false) {
        /* setTimeout(()=>{
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
      this.concurrency_limit = this.resourceBroker.concurrency_limit ? this.resourceBroker.concurrency_limit : 1;
      this.available_slot = this.resourceBroker.available_slot;
      this.used_slot_percent = this.resourceBroker.used_slot_percent;
      this.used_resource_group_slot_percent = this.resourceBroker.used_resource_group_slot_percent;
      await this.updateComplete;
      return Promise.resolve(true);
    }).catch((err) => {
      if (err && err.message) {
        if (err.description) {
          this.notification.text = PainKiller.relieve(err.description);
        } else {
          this.notification.text = PainKiller.relieve(err.title);
        }
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
      return Promise.resolve(false);
    });
  }

  // Get available / total resources from manager
  aggregateResource(from = '') {
    // console.log('aggregate resource called - ', from);
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
  async updateResourceAllocationPane(from = '') {
    if (this.metric_updating == true) {
      // console.log('update metric blocked');
      return;
    }
    if (from === 'refresh resource policy') {
      // console.log('refreshing resource policy');
      this.metric_updating = false;
      return this._aggregateResourceUse('update-metric').then(() => {
        return this.updateResourceAllocationPane('after refresh resource policy');
      });
    }
    const selectedItem = this.shadowRoot.querySelector('#environment').selected;
    const selectedVersionItem = this.version_selector.selected;
    // Pulldown is not ready yet.
    if (selectedVersionItem === null) {
      this.metric_updating = false;
      return;
    }
    const selectedVersionValue = selectedVersionItem.value;
    this._updateVersionSelectorText(selectedVersionValue);
    // Environment is not selected yet.
    if (typeof selectedItem === 'undefined' || selectedItem === null || selectedItem.getAttribute('disabled')) {
      this.metric_updating = false;
      return;
    }
    // console.log('update metric from', from);
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.updateResourceAllocationPane(from);
      }, true);
    } else {
      this.metric_updating = true;
      await this._aggregateResourceUse('update-metric');
      await this._updateVirtualFolderList();
      this.autoMountedVfolders = this.vfolders.filter((item) => (item.name.startsWith('.')));
      this.nonAutoMountedVfolders = this.vfolders.filter((item) => !(item.name.startsWith('.')));
      // Resource limitation is not loaded yet.
      if (Object.keys(this.resourceBroker.resourceLimits).length === 0) {
        // console.log("No resource limit loaded");
        this.metric_updating = false;
        return;
      }
      const kernel = selectedItem.id;
      const kernelVersion = selectedVersionValue;
      // Kernel or Kernel version information is missing
      if (kernel === '' || kernelVersion === '') {
        // console.log("No kernel / version");
        this.metric_updating = false;
        return;
      }
      const kernelName = kernel + ':' + kernelVersion;
      const currentResource = this.resourceBroker.resourceLimits[kernelName];
      if (!currentResource) {
        this.metric_updating = false;
        return;
      }
      this.gpu_mode = this.resourceBroker.gpu_mode;
      this.gpu_step = this.resourceBroker.gpu_step;
      this.gpu_modes = this.resourceBroker.gpu_modes;
      if (globalThis.backendaiclient.supports('multi-container')) {
        if (this.cluster_size > 1) {
          this.gpu_step = 1;
        }
      }
      const available_slot = this.resourceBroker.available_slot;

      // Post-UI markup to disable unchangeable values
      this.shadowRoot.querySelector('#cpu-resource').disabled = false;
      this.shadowRoot.querySelector('#mem-resource').disabled = false;
      this.shadowRoot.querySelector('#gpu-resource').disabled = false;
      if (globalThis.backendaiclient.supports('multi-container')) { // initialize cluster_size
        this.cluster_size = 1;
        this.shadowRoot.querySelector('#cluster-size').value = this.cluster_size;
      }
      this.shadowRoot.querySelector('#session-resource').disabled = false;
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = _text('session.launcher.ConfirmAndLaunch');
      let disableLaunch = false;
      let shmem_metric: any = {
        'min': 0.0625,
        'max': 2,
        'preferred': 0.0625
      };
      this.cuda_device_metric = {
        'min': 0,
        'max': 0
      };
      currentResource.forEach((item) => {
        if (item.key === 'cpu') {
          const cpu_metric = {...item};
          cpu_metric.min = parseInt(cpu_metric.min);
          if ('cpu' in this.userResourceLimit) {
            if (parseInt(cpu_metric.max) !== 0 && cpu_metric.max !== 'Infinity' && !isNaN(cpu_metric.max)) {
              cpu_metric.max = Math.min(parseInt(cpu_metric.max), parseInt(this.userResourceLimit.cpu), available_slot['cpu'], this.max_cpu_core_per_session);
            } else {
              cpu_metric.max = Math.min(parseInt(this.userResourceLimit.cpu), available_slot['cpu'], this.max_cpu_core_per_session);
            }
          } else {
            if (parseInt(cpu_metric.max) !== 0 && cpu_metric.max !== 'Infinity' && !isNaN(cpu_metric.max)) {
              cpu_metric.max = Math.min(parseInt(cpu_metric.max), available_slot['cpu'], this.max_cpu_core_per_session);
            } else {
              cpu_metric.max = Math.min(this.available_slot['cpu'], this.max_cpu_core_per_session);
            }
          }
          if (cpu_metric.min >= cpu_metric.max) {
            if (cpu_metric.min > cpu_metric.max) {
              cpu_metric.min = cpu_metric.max;
              disableLaunch = true;
            }
            this.shadowRoot.querySelector('#cpu-resource').disabled = true;
          }
          this.cpu_metric = cpu_metric;
          // monkeypatch for cluster_metric max size
          if (this.cluster_support && this.cluster_mode === 'single-node') {
            this.cluster_metric.max = Math.min(cpu_metric.max, this.max_containers_per_session);
            if (this.cluster_metric.min > this.cluster_metric.max) {
              this.cluster_metric.min = this.cluster_metric.max;
            } else {
              this.cluster_metric.min = cpu_metric.min;
            }
          }
        }
        if (item.key === 'cuda.device' && this.gpu_mode == 'cuda.device') {
          const cuda_device_metric = {...item};
          cuda_device_metric.min = parseInt(cuda_device_metric.min);
          if ('cuda.device' in this.userResourceLimit) {
            if (parseInt(cuda_device_metric.max) !== 0 && cuda_device_metric.max !== 'Infinity' && !isNaN(cuda_device_metric.max)) {
              cuda_device_metric.max = Math.min(parseInt(cuda_device_metric.max), parseInt(this.userResourceLimit['cuda.device']), available_slot['cuda_device'], this.max_cuda_device_per_container);
            } else {
              cuda_device_metric.max = Math.min(parseInt(this.userResourceLimit['cuda.device']), parseInt(available_slot['cuda_device']), this.max_cuda_device_per_container);
            }
          } else {
            if (parseInt(cuda_device_metric.max) !== 0 && cuda_device_metric.max !== 'Infinity' && !isNaN(cuda_device_metric.max)) {
              cuda_device_metric.max = Math.min(parseInt(cuda_device_metric.max), parseInt(available_slot['cuda_device']), this.max_cuda_device_per_container);
            } else {
              cuda_device_metric.max = Math.min(parseInt(this.available_slot['cuda_device']), this.max_cuda_device_per_container);
            }
          }
          if (cuda_device_metric.min >= cuda_device_metric.max) {
            if (cuda_device_metric.min > cuda_device_metric.max) {
              cuda_device_metric.min = cuda_device_metric.max;
              disableLaunch = true;
            }
            this.shadowRoot.querySelector('#gpu-resource').disabled = true;
          }
          this.cuda_device_metric = cuda_device_metric;
        }
        if (item.key === 'cuda.shares' && this.gpu_mode === 'cuda.shares') {
          const cuda_shares_metric = {...item};
          cuda_shares_metric.min = parseFloat(cuda_shares_metric.min);
          if ('cuda.shares' in this.userResourceLimit) {
            if (parseFloat(cuda_shares_metric.max) !== 0 && cuda_shares_metric.max !== 'Infinity' && !isNaN(cuda_shares_metric.max)) {
              cuda_shares_metric.max = Math.min(parseFloat(cuda_shares_metric.max), parseFloat(this.userResourceLimit['cuda.shares']), available_slot['cuda_shares'], this.max_cuda_shares_per_container);
            } else {
              cuda_shares_metric.max = Math.min(parseFloat(this.userResourceLimit['cuda.shares']), available_slot['cuda_shares'], this.max_cuda_shares_per_container);
            }
          } else {
            if (parseFloat(cuda_shares_metric.max) !== 0) {
              cuda_shares_metric.max = Math.min(parseFloat(cuda_shares_metric.max), available_slot['cuda_shares'], this.max_cuda_shares_per_container);
            } else {
              cuda_shares_metric.max = 0;
            }
          }
          if (cuda_shares_metric.min >= cuda_shares_metric.max) {
            if (cuda_shares_metric.min > cuda_shares_metric.max) {
              cuda_shares_metric.min = cuda_shares_metric.max;
              disableLaunch = true;
            }
            this.shadowRoot.querySelector('#gpu-resource').disabled = true;
          }

          this.cuda_shares_metric = cuda_shares_metric;
          if (cuda_shares_metric.max > 0) {
            this.cuda_device_metric = cuda_shares_metric;
          }
        }
        if (item.key === 'rocm.device' && this.gpu_mode === 'rocm.device') {
          const rocm_metric = {...item};
          rocm_metric.min = parseInt(rocm_metric.min);
          rocm_metric.max = parseInt(rocm_metric.max);
          if (rocm_metric.min > rocm_metric.max) {
            // TODO: dynamic maximum per user policy
          }
          this.rocm_device_metric = rocm_metric;
        }
        if (item.key === 'tpu.device') {
          const tpu_device_metric = {...item};
          tpu_device_metric.min = parseInt(tpu_device_metric.min);
          tpu_device_metric.max = parseInt(tpu_device_metric.max);
          if (tpu_device_metric.min > tpu_device_metric.max) {
            // TODO: dynamic maximum per user policy
          }
          this.tpu_device_metric = tpu_device_metric;
        }
        if (item.key === 'mem') {
          const mem_metric = {...item};
          mem_metric.min = globalThis.backendaiclient.utils.changeBinaryUnit(mem_metric.min, 'g');
          if (mem_metric.min < 0.1) {
            mem_metric.min = 0.1;
          }
          const image_mem_max = globalThis.backendaiclient.utils.changeBinaryUnit(mem_metric.max, 'g', 'g');
          if ('mem' in this.userResourceLimit) {
            const user_mem_max = globalThis.backendaiclient.utils.changeBinaryUnit(this.userResourceLimit['mem'], 'g');
            if (parseInt(image_mem_max) !== 0) {
              mem_metric.max = Math.min(parseFloat(image_mem_max), parseFloat(user_mem_max), available_slot['mem'], this.max_mem_per_container);
            } else {
              mem_metric.max = Math.min(parseFloat(user_mem_max), available_slot['mem'], this.max_mem_per_container);
            }
          } else {
            if (parseInt(mem_metric.max) !== 0 && mem_metric.max !== 'Infinity' && isNaN(mem_metric.max) !== true) {
              mem_metric.max = Math.min(parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(mem_metric.max, 'g', 'g')), available_slot['mem'], this.max_mem_per_container);
            } else {
              mem_metric.max = Math.min(available_slot['mem'], this.max_mem_per_container); // TODO: set to largest memory size
            }
          }
          if (mem_metric.min >= mem_metric.max) {
            if (mem_metric.min > mem_metric.max) {
              mem_metric.min = mem_metric.max;
              disableLaunch = true;
            }
            this.shadowRoot.querySelector('#mem-resource').disabled = true;
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
      shmem_metric.max = this.max_shm_per_container;
      shmem_metric.min = 0.0625; // 64m
      if (shmem_metric.min >= shmem_metric.max) {
        if (shmem_metric.min > shmem_metric.max) {
          shmem_metric.min = shmem_metric.max;
          disableLaunch = true;
        }
        this.shadowRoot.querySelector('#shmem-resource').disabled = true;
      }
      shmem_metric.min = Number(shmem_metric.min.toFixed(2));
      shmem_metric.max = Number(shmem_metric.max.toFixed(2));
      this.shmem_metric = shmem_metric;

      // GPU metric
      if (this.cuda_device_metric.min == 0 && this.cuda_device_metric.max == 0) { // GPU is disabled (by image,too).
        this.shadowRoot.querySelector('#gpu-resource').disabled = true;
        this.shadowRoot.querySelector('#gpu-resource').value = 0;
        if (this.resource_templates !== [] && this.resource_templates.length > 0) { // Remove mismatching templates
          const new_resource_templates: any = [];
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
        this.shadowRoot.querySelector('#gpu-resource').disabled = false;
        this.shadowRoot.querySelector('#gpu-resource').value = this.cuda_device_metric.max;
        this.resource_templates_filtered = this.resource_templates;
      }
      // Refresh with resource template
      if (this.resource_templates_filtered !== [] && this.resource_templates_filtered.length > 0) {
        const resource = this.resource_templates_filtered[0];
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
        this.shadowRoot.querySelector('#shmem-resource').disabled = true;
        this.shadowRoot.querySelector('#launch-button').disabled = true;
        this.shadowRoot.querySelector('.allocation-check').display = 'none';
        if (this.cluster_support) {
          this.shadowRoot.querySelector('#cluster-size').disabled = true;
        }
        this.shadowRoot.querySelector('#launch-button-msg').textContent = _text('session.launcher.NotEnoughResource');
      } else {
        this.shadowRoot.querySelector('#cpu-resource').disabled = false;
        this.shadowRoot.querySelector('#mem-resource').disabled = false;
        this.shadowRoot.querySelector('#gpu-resource').disabled = false;
        this.shadowRoot.querySelector('#session-resource').disabled = false;
        this.shadowRoot.querySelector('#shmem-resource').disabled = false;
        this.shadowRoot.querySelector('#launch-button').disabled = false;
        this.shadowRoot.querySelector('.allocation-check').display = 'block';
        if (this.cluster_support) {
          this.shadowRoot.querySelector('#cluster-size').disabled = false;
        }
      }
      if (this.cuda_device_metric.min == this.cuda_device_metric.max &&
          this.cuda_device_metric.max < 1) {
        this.shadowRoot.querySelector('#gpu-resource').disabled = true;
      }
      if (this.concurrency_limit <= 1) {
        this.shadowRoot.querySelector('#session-resource').max = 2;
        this.shadowRoot.querySelector('#session-resource').value = 1;
        this.shadowRoot.querySelector('#session-resource').disabled = true;
      }
      this.metric_updating = false;
    }
  }

  updateLanguage() {
    const selectedItem = this.shadowRoot.querySelector('#environment').selected;
    if (selectedItem === null) return;
    const kernel = selectedItem.id;
    this._updateVersions(kernel);
  }

  /**
   * Render a folder Map
   *
   * @param {DOMelement} root
   * @param {object} column (<vaadin-grid-column> element)
   * @param {object} rowData
   */
  folderMapRenderer(root, column?, rowData?) {
    render(
      html`
        <vaadin-text-field id="vfolder-alias-${rowData.item.name}" clear-button-visible prevent-invalid-input
                           pattern="^[a-zA-Z0-9\._-]*$" ?disabled="${!rowData.selected}"
                           theme="small" placeholder="${rowData.item.name}"
                           @change="${(e) => this._updateFolderMap(rowData.item.name, e.target.value)}"></vaadin-text-field>
        </template>
      `,
      root
    );
  }
  async _updateFolderMap(folder, alias) {
    if (alias === '') {
      if (folder in this.folderMapping) {
        delete this.folderMapping[folder];
      }
      await this.shadowRoot.querySelector('#vfolder-mount-preview').updateComplete.then(() => this.requestUpdate());
      return Promise.resolve(true);
    }
    if (folder !== alias) {
      if (this.selectedVfolders.includes(alias)) { // Prevent vfolder name & alias overlapping
        this.notification.text = _text('session.launcher.FolderAliasOverlapping');
        this.notification.show();
        delete this.folderMapping[folder];
        this.shadowRoot.querySelector('#vfolder-alias-' + folder).value = '';
        await this.shadowRoot.querySelector('#vfolder-mount-preview').updateComplete.then(() => this.requestUpdate());
        return Promise.resolve(false);
      }
      for (const f in this.folderMapping) { // Prevent alias overlapping
        if ({}.hasOwnProperty.call(this.folderMapping, f)) {
          if (this.folderMapping[f] == alias) {
            this.notification.text = _text('session.launcher.FolderAliasOverlapping');
            this.notification.show();
            delete this.folderMapping[folder];
            this.shadowRoot.querySelector('#vfolder-alias-' + folder).value = '';
            await this.shadowRoot.querySelector('#vfolder-mount-preview').updateComplete.then(() => this.requestUpdate());
            return Promise.resolve(false);
          }
        }
      }
      this.folderMapping[folder] = alias;
      await this.shadowRoot.querySelector('#vfolder-mount-preview').updateComplete.then(() => this.requestUpdate());
      return Promise.resolve(true);
    }
    return Promise.resolve(true);
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
   * Set Cluster mode between 'single-node' and 'multi-node'
   *
   * @param {Event} e
   */
  _setClusterMode(e) {
    this.cluster_mode = e.target.value;
  }

  /**
   * Set Cluster size when the cluster mode is 'multi-node'
   *
   * @param {Event} e
   */
  _setClusterSize(e) {
    this.cluster_size = e.target.value > 0 ? Math.round(e.target.value) : 0;
    this.shadowRoot.querySelector('#cluster-size').value = this.cluster_size;
    let maxSessionCount = 1;
    if (globalThis.backendaiclient.supports('multi-container')) {
      if (this.cluster_size > 1) {
        this.gpu_step = 1;
      } else {
        maxSessionCount = 0;
        this.gpu_step = this.resourceBroker.gpu_step;
      }
      this._setSessionLimit(maxSessionCount);
    }
  }

  /**
   * Set session count limit to value
   *
   * @param {Number} maxValue - max value to limit session in multi-container mode
   *
   */
  _setSessionLimit(maxValue = 1) {
    const sessionSlider = this.shadowRoot.querySelector('#session-resource');
    if (maxValue > 0) {
      sessionSlider.value = maxValue;
      this.session_request = maxValue;
      sessionSlider.disabled = true;
    } else {
      sessionSlider.max = this.concurrency_limit;
      sessionSlider.disabled = false;
    }
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
    let gpu_type; let gpu_value;
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
    const shmem = (button.shmem) ? button.shmem : this.shmem_metric;

    // if resource preset is initially selected
    if (typeof shmem !== 'number') {
      this.shmem_request = shmem.preferred;
    } else {
      this.shmem_request = shmem ? shmem : 0.0625; // 64MB as default. Enough for single core CPU.
      // this.shmem_metric.preferred = this.shmem_request;
    }
    this.shmem_metric.max = button.mem; // resource preset value of shared memory must be smaller than memory
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
   *
   * @param {boolean} forceUpdate - Force update language
   * @param {string} language - Target language
   * */
  async selectDefaultLanguage(forceUpdate = false, language = '') {
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
    const environment = this.shadowRoot.querySelector('#environment');
    // await environment.updateComplete; async way.
    const obj = environment.items.find((o) => o.value === this.default_language);
    if (typeof obj === 'undefined' && typeof globalThis.backendaiclient !== 'undefined' && globalThis.backendaiclient.ready === false) { // Not ready yet.
      setTimeout(() => {
        console.log('Environment selector is not ready yet. Trying to set the default language again.');
        return this.selectDefaultLanguage(forceUpdate, language);
      }, 500);
      return Promise.resolve(true);
    }
    const idx = environment.items.indexOf(obj);
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
      this.notification.text = _text('credential.validation.InvalidEmailAddress');
      this.notification.show();
      this.ownerKeypairs = [];
      this.ownerGroups = [];
      return;
    }

    /* Fetch keypair */
    const keypairs = await globalThis.backendaiclient.keypair.list(email, ['access_key']);
    this.ownerKeypairs = keypairs.keypairs;
    if (this.ownerKeypairs.length < 1) {
      this.notification.text = _text('session.launcher.NoActiveKeypair');
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
    const name = item.kernelname;
    if (name in this.resourceBroker.imageInfo && 'description' in this.resourceBroker.imageInfo[name]) {
      const desc = this.shadowRoot.querySelector('#help-description');
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
      this._helpDescription = _text('session.launcher.NoDescriptionFound');
    }
  }

  _showResourceDescription(e, item) {
    e.stopPropagation();
    const resource_description = {
      'cpu': {
        'name': _text('session.launcher.CPU'),
        'desc': _text('session.launcher.DescCPU')
      },
      'mem': {
        'name': _text('session.launcher.Memory'),
        'desc': _text('session.launcher.DescMemory')
      },
      'shmem': {
        'name': _text('session.launcher.SharedMemory'),
        'desc': _text('session.launcher.DescSharedMemory')
      },
      'gpu': {
        'name': _text('session.launcher.GPU'),
        'desc': _text('session.launcher.DescGPU')
      },
      'session': {
        'name': _text('session.launcher.TitleSession'),
        'desc': _text('session.launcher.DescSession')
      },
      'single-node': {
        'name': _text('session.launcher.SingleNode'),
        'desc': _text('session.launcher.DescSingleNode')
      },
      'multi-node': {
        'name': _text('session.launcher.MultiNode'),
        'desc': _text('session.launcher.DescMultiNode')
      },
      'openmp-optimization': {
        'name': _text('session.launcher.OpenMPOptimization'),
        'desc': _text('session.launcher.DescOpenMPOptimization')
      }
    };
    if (item in resource_description) {
      this._helpDescriptionTitle = resource_description[item].name;
      this._helpDescription = resource_description[item].desc;
      this._helpDescriptionIcon = '';
      const desc = this.shadowRoot.querySelector('#help-description');
      desc.show();
    }
  }

  _showEnvConfigDescription(e) {
    e.stopPropagation();
    this._helpDescriptionTitle = _text('session.launcher.EnvironmentVariableTitle');
    this._helpDescription = _text('session.launcher.DescSetEnv');
    const desc = this.shadowRoot.querySelector('#help-description');
    desc.show();
  }

  _resourceTemplateToCustom() {
    this.shadowRoot.querySelector('#resource-templates').selectedText = _text('session.launcher.CustomResourceApplied');
  }

  /**
   *
   * @param {Event} e - Click EventEmitter
   * @param {Boolean} isResourceClicked - true if resource is clicked
   */
  _applyResourceValueChanges(e, isResourceClicked = true) {
    const value = e.target.value;
    const id = e.target.id.split('-')[0];
    switch (id) {
    case 'cpu':
      this.cpu_request = value;
      break;
    case 'mem':
      this.mem_request = value;
      break;
    case 'shmem':
      this.shmem_request = value;
      break;
    case 'gpu':
      this.gpu_request = value;
      break;
    case 'session':
      this.session_request = value;
      break;
    case 'cluster':
      this._changeTotalAllocationPane();
      break;
    default:
      break;
    }
    this.requestUpdate();
    if (isResourceClicked) { // resource allocation
      this._resourceTemplateToCustom();
    } else { // cluster mode
      this._setClusterSize(e);
    }
  }

  _changeTotalAllocationPane() {
    this._deleteAllocationPaneShadow();
    const cluster_size = this.shadowRoot.querySelector('#cluster-size').value;
    if (cluster_size > 1) {
      const container = this.shadowRoot.querySelector('#resource-allocated-box-shadow');
      for (let i = 0; i < Math.min(6, cluster_size-1); i = i + 1) {
        const item = document.createElement('div');
        item.classList.add('horizontal', 'layout', 'center', 'center-justified', 'resource-allocated-box', 'allocation-shadow');
        item.style.position = 'absolute';
        item.style.top = '-' + (5 + 5 * i) + 'px';
        item.style.left = (5 + 5 * i) + 'px';
        const intensity = 245 + i*2;
        item.style.backgroundColor = 'rgb(' + intensity +',' + intensity +',' +intensity +')';
        item.style.borderColor = 'rgb(' + (intensity-10) +',' + (intensity-10) +',' +(intensity-10) +')';
        item.style.zIndex = (6 - i).toString();
        container.appendChild(item);
      }
      this.shadowRoot.querySelector('#total-allocation-pane').appendChild(container);
    }
  }

  _deleteAllocationPaneShadow() {
    const container = this.shadowRoot.querySelector('#resource-allocated-box-shadow');
    container.innerHTML = '';
  }

  _updateShmemLimit() {
    const shmemEl = this.shadowRoot.querySelector('#shmem-resource');
    const currentMemLimit = parseFloat(this.shadowRoot.querySelector('#mem-resource').value);
    let shmem_value = shmemEl.value;
    this.shmem_metric.max = Math.min(this.max_shm_per_container, currentMemLimit);
    // clamp the max value to the smaller of the current memory value or the configuration file value.
    shmemEl.max = this.shmem_metric.max;
    if (parseFloat(shmem_value) > this.shmem_metric.max) {
      shmem_value = this.shmem_metric.max;
      this.shmem_request = shmem_value;
      shmemEl.syncToSlider(); // explicitly call method of the slider component to avoid value mismatching
    }
  }

  /**
   * Get MB value when input is less than 1 GB.
   *
   * @param {number} value - value with GB unit.
   * @return {number} MB value if input is smaller than 1GB. Otherwise, GB value.
   * */
  _conditionalGBtoMB(value) {
    if (value < 1.0) {
      return (value * 1024).toFixed(0);
    }
    return value;
  }

  /**
   * Get MB unit when input is less than 1 GB.
   *
   * @param {number} value - value with GB unit.
   * @return {string} MB if input is smaller than 1GB. Otherwise, GB.
   * */
  _conditionalGBtoMBunit(value) {
    if (value < 1.0) {
      return 'MB';
    }
    return 'GB';
  }

  /**
   * Get version information - Version, Language, Additional information.
   *
   * @param {any} version
   * @return {Record<string, unknown>} Array containing information object
   * */
  _getVersionInfo(version) {
    const info: any = [];
    const fragment = version.split('-');
    info.push({ // Version
      tag: this._aliasName(fragment[0]),
      color: 'blue',
      size: '80px'
    });
    if (fragment.length > 1) {
      // Image requirement overrides language information.
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
      const requirements = this._aliasName(fragment[2]).split(':');
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
    this.shadowRoot.querySelectorAll('wl-expansion').forEach((element) => {
      element.onKeyDown = (e) => {
        const enterKey = 13;
        if (e.keyCode === enterKey) {
          e.preventDefault();
        }
      };
    });
  }

  /**
   * Check validation of input.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _validateInput(e) {
    const textfield = e.target.closest('mwc-textfield');
    if (textfield.value) {
      textfield.value = Math.round(textfield.value);
      textfield.value = globalThis.backendaiclient.utils.clamp(textfield.value, textfield.min, textfield.max);
    }
  }

  /**
   * Append a row to the environment variable list.
   *
   * @param {string} name - environment variable name
   * @param {string} value - environment variable value
   */
  _appendEnvRow(name = '', value = '') {
    const container = this.shadowRoot.querySelector('#modify-env-container');
    const lastChild = container.children[container.children.length - 1];
    const div = this._createEnvRow(name, value);
    container.insertBefore(div, lastChild.nextSibling);
  }
  /**
   * Create a row in the environment variable list.
   *
   * @param {string} name - environment variable name
   * @param {string} value - environment variable value
   * @return {HTMLElement} Generated division element
   *
   */
  _createEnvRow(name = '', value = '') {
    const div = document.createElement('div');
    div.setAttribute('class', 'row extra');

    const env = document.createElement('wl-textfield');
    env.setAttribute('type', 'text');
    env.setAttribute('value', name);

    const val = document.createElement('wl-textfield');
    val.setAttribute('type', 'text');
    val.setAttribute('value', value);

    const button = document.createElement('wl-button');
    button.setAttribute('class', 'fg pink');
    button.setAttribute('fab', '');
    button.setAttribute('flat', '');
    button.addEventListener('click', (e) => this._removeEnvItem(e));

    const icon = document.createElement('wl-icon');
    icon.innerHTML = 'remove';
    button.appendChild(icon);

    div.appendChild(env);
    div.appendChild(val);
    div.appendChild(button);
    return div;
  }

  /**
   * Check whether delete operation will proceed or not.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _removeEnvItem(e) {
    // htmlCollection should be converted to Array.
    this.deleteEnvRow = e.target.parentNode;
    this.deleteEnvRow.remove();
  }

  /**
   * Remove empty env input fields
   */
  _removeEmptyEnv() {
    const container = this.shadowRoot.querySelector('#modify-env-container');
    const rows = container.querySelectorAll('.row.extra');
    const empty = (row) => Array.prototype.filter.call(
      row.querySelectorAll('wl-textfield'), (tf, idx) => tf.value === ''
    ).length === 2;
    Array.prototype.filter.call(rows, (row) => empty(row)).map((row) => row.parentNode.removeChild(row));
  }

  /**
   * Modify environment variables for current session.
   */
  modifyEnv() {
    this._parseEnvVariableList();
    this._saveEnvVariableList();
    const modifyEnvDialog = this.shadowRoot.querySelector('#modify-env-dialog');
    modifyEnvDialog.closeWithConfirmation = false;
    modifyEnvDialog.hide();
    this.notification.text = _text('session.launcher.EnvironmentVariableConfigurationDone');
    this.notification.show();
  }

  /**
   * load environment variables for current session
   */
  _loadEnv() {
    this.environ.forEach((item: any, index) => {
      const firstIndex = 0;
      if (index === firstIndex) {
        const container = this.shadowRoot.querySelector('#modify-env-container');
        const firstRow = container.querySelector('.row:not(.header)');
        const envFields = firstRow.querySelectorAll('wl-textfield');
        Array.prototype.forEach.call(envFields, (elem: any, index) => {
          elem.value = (index === firstIndex) ? item.name : item.value;
        });
      } else {
        this._appendEnvRow(item.name, item.value);
      }
    });
  }

  /**
   * Show environment variable modification popup.
   */
  _showEnvDialog() {
    this._removeEmptyEnv();
    const modifyEnvDialog = this.shadowRoot.querySelector('#modify-env-dialog');
    modifyEnvDialog.closeWithConfirmation = true;
    modifyEnvDialog.show();
  }

  /**
   * Close confirmation dialog and environment variable dialog and reset the environment variable and value
   *
   */
  _closeAndResetEnvInput() {
    this._clearRows();
    this._loadEnv();
    this.closeDialog('env-config-confirmation');
    const modifyEnvDialog = this.shadowRoot.querySelector('#modify-env-dialog');
    modifyEnvDialog.closeWithConfirmation = false;
    modifyEnvDialog.hide();
  }

  /**
   * Parse environment variables on UI.
   */
  _parseEnvVariableList() {
    this.environ_values = {};
    const container = this.shadowRoot.querySelector('#modify-env-container');
    const rows = container.querySelectorAll('.row:not(.header)');
    const nonempty = (row) => Array.prototype.filter.call(
      row.querySelectorAll('wl-textfield'), (tf, idx) => tf.value === ''
    ).length === 0;
    const encodeRow = (row) => {
      const items: Array<any> = Array.prototype.map.call(row.querySelectorAll('wl-textfield'), (tf) => tf.value);
      this.environ_values[items[0]] = items[1];
      return items;
    };
    Array.prototype.filter.call(rows, (row) => nonempty(row)).map((row) => encodeRow(row));
  }

  /**
   * Save Environment variables
   */
  _saveEnvVariableList() {
    this.environ = Object.entries(this.environ_values).map(([name, value]) => ({name, value}));
  }

  _resetEnvironmentVariables() {
    this.environ = [];
    this.environ_values = {};
    const dialog = this.shadowRoot.querySelector('#modify-env-dialog');
    if (dialog !== null) {
      this._clearRows();
    }
  }

  /**
   * Clear rows from the environment variable.
   */
  _clearRows() {
    const container = this.shadowRoot.querySelector('#modify-env-container');
    const rows = container.querySelectorAll('.row:not(.header)');
    const firstRow = rows[0];

    // remain first row element and clear values
    firstRow.querySelectorAll('wl-textfield').forEach((tf) => {
      tf.value = '';
    });

    // delete extra rows
    container.querySelectorAll('.row.extra').forEach((e) => {
      e.remove();
    });
  }

  openDialog(id) {
    this.shadowRoot.querySelector('#' + id).show();
  }

  closeDialog(id) {
    this.shadowRoot.querySelector('#' + id).hide();
  }

  /**
   * Move to previous or next progress.
   *
   * @param {Number} n -1 : previous progress / 1 : next progress
   */
  moveProgress(n) {
    const currentProgressEl = this.shadowRoot.querySelector('#progress-0' + this.currentIndex);
    this.currentIndex += n;
    // limit the range of progress number
    if (this.currentIndex > this.progressLength) {
      this.currentIndex = globalThis.backendaiclient.utils.clamp(this.currentIndex + n, this.progressLength, 1);
    }
    const movedProgressEl = this.shadowRoot.querySelector('#progress-0' + this.currentIndex);
    const prevButton = this.shadowRoot.querySelector('#prev-button');
    const nextButton = this.shadowRoot.querySelector('#next-button');

    currentProgressEl.classList.remove('active');
    movedProgressEl.classList.add('active');

    prevButton.style.visibility = this.currentIndex == 1 ? 'hidden' : 'visible';
    nextButton.style.visibility = this.currentIndex == this.progressLength ? 'hidden' : 'visible';
    this.shadowRoot.querySelector('#launch-button-msg').textContent = this.progressLength == this.currentIndex ? _text('session.launcher.Launch') : _text('session.launcher.ConfirmAndLaunch');

    // monkeypatch for grid items in accessible vfolder list in Safari or Firefox
    this._grid?.clearCache();
  }

  /**
   * Move to first page and initialize environment variables and selected mount folders.
   *
   */
  _resetProgress() {
    this.moveProgress(-this.currentIndex + 1);
    this._resetEnvironmentVariables();
    this._unselectAllSelectedFolder();
  }

  /**
   *
   * @return {Number} - fraction of currentProgress when progressLength becomes 1
   */
  _calculateProgress() {
    const progressLength = this.progressLength > 0 ? this.progressLength : 1;
    const currentIndex = this.currentIndex > 0 ? this.currentIndex : 1;
    return (currentIndex / progressLength).toFixed(2);
  }

  /**
   * Disable Select UI about Environments and versions when event target value is not empty.
   *
   */
  _toggleEnvironmentSelectUI() {
    const SelectedEnvironment = this.shadowRoot.querySelector('mwc-select#environment');
    const SelectedVersions = this.shadowRoot.querySelector('mwc-select#version');
    const isManualImageEnabled = this.manualImageName?.value ? true : false;
    SelectedEnvironment.disabled = SelectedVersions.disabled = isManualImageEnabled;
    // select none(-1) when manual image is enabled
    const selectedIndex = isManualImageEnabled ? -1 : 1;
    SelectedEnvironment.select(selectedIndex);
    SelectedVersions.select(selectedIndex);
  }

  /**
   * Show HPC optimization options only if OpenMPswitch is not checked.
   */
  _toggleHPCOptimization() {
    const isOpenMPChecked = this.shadowRoot.querySelector('#OpenMPswitch').selected;
    this.shadowRoot.querySelector('#HPCOptimizationOptions').style.display = isOpenMPChecked ? 'none' : 'block';
  }

  /**
   * Toggle startup code input section according to session type
   *
   * @param {Event} e
   */
  _toggleStartUpCommandEditor(e) {
    this.sessionType = e.target.value;
    const isBatchmode: boolean = (this.sessionType === 'batch');
    const startUpCommandEditor = this.shadowRoot.querySelector('#batch-mode-config-section');
    startUpCommandEditor.style.display = isBatchmode ? 'inline-flex' : 'none';
    if (isBatchmode) {
      const editor = this.shadowRoot.querySelector('#command-editor');
      editor.refresh();
      editor.focus();
    }
  }

  /**
   * Toggle scheduling time UI when session type is in batch
   *
   */
  _toggleScheduleTimeDisplay() {
    this.useScheduledTime = this.shadowRoot.querySelector('#use-scheduled-time').selected;
    this.shadowRoot.querySelector('vaadin-date-time-picker').style.display = this.useScheduledTime ? 'block': 'none';
    this._toggleScheduleTime(!this.useScheduledTime);
  }

  /**
   * Toggle scheduling time interval according to `isActive` parameter
   *
   * @param {Boolean} isActive
   */

  _toggleScheduleTime(isActive = false) {
    if (isActive) {
      clearInterval(this.schedulerTimer);
    } else {
      this.schedulerTimer = setInterval(() => {
        // interval every 1 sec.
        this._getSchedulableTime();
      }, 1000);
    }
  }

  /**
   * Returns schedulable time according to current time (default: 2min after current time)
   *
   * @return {string}
   */
  _getSchedulableTime() {
    const getFormattedTime = (date) => {
      // YYYY-MM-DD`T`hh:mm:ss
      return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() +
            'T' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    };
    const schedulerEl = this.shadowRoot.querySelector('vaadin-date-time-picker');
    let currentTime = new Date();
    const extraMinutes = 60 * 2 * 1000;
    // add 2min
    let futureTime = new Date(currentTime.getTime() + extraMinutes);
    // disable scheduling in past
    schedulerEl.min = getFormattedTime(currentTime);
    // schedulerEl.value = getFormattedTime(futureTime);

    if (schedulerEl.value && schedulerEl.value !== '') {
      const scheduledTime = new Date(schedulerEl.value).getTime();
      currentTime = new Date();
      if (scheduledTime <= currentTime.getTime()) {
        futureTime = new Date(currentTime.getTime() + extraMinutes);
        schedulerEl.value = getFormattedTime(futureTime);
      }
    } else {
      schedulerEl.value = getFormattedTime(futureTime);
    }
    this._setRelativeTimeStamp();
  }

  _setRelativeTimeStamp() {
    // in miliseconds
    const units = {
      'year': 24 * 60 * 60 * 1000 * 365,
      'month': 24 * 60 * 60 * 1000 * 365/12,
      'day': 24 * 60 * 60 * 1000,
      'hour': 60 * 60 * 1000,
      'minute': 60 * 1000,
      'second': 1000
    };
    const i18n = globalThis.backendaioptions.get('current_language') ?? 'en';
    const rtf = new Intl.RelativeTimeFormat( i18n, {numeric: 'auto'});

    const getRelativeTime = (d1: number, d2 = +new Date()) => {
      const elapsed = d1 - d2;
      for (const u in units) {
        // "Math.abs" accounts for both "past" & "future" scenarios
        if (Math.abs(elapsed) > units[u] || u == 'second') {
          // type casting
          const formatString: Intl.RelativeTimeFormatUnit = <Intl.RelativeTimeFormatUnit>u;
          return rtf.format(Math.round(elapsed/units[u]), formatString);
        }
      }
      return _text('session.launcher.InfiniteTime');
    };
    const schedulerEl = this.shadowRoot.querySelector('vaadin-date-time-picker');
    if (schedulerEl.invalid) {
      schedulerEl.helperText = _text('session.launcher.ResetStartTime');
    } else {
      schedulerEl.helperText = _text('session.launcher.SessionStartTime') + getRelativeTime(+new Date(schedulerEl.value));
    }
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/fonts/font-awesome-all.min.css">
      <wl-button raised class="primary-action" id="launch-session" ?disabled="${!this.enableLaunchButton}"
                 @click="${() => this._launchSessionDialog()}">
        <wl-icon>power_settings_new</wl-icon>
        <span>${_t('session.launcher.Start')}</span>
      </wl-button>
      <backend-ai-dialog id="new-session-dialog" narrowLayout fixed backdrop persistent @dialog-closed="${() => this._toggleScheduleTime(true)}">
        <span slot="title">${this.newSessionDialogTitle ? this.newSessionDialogTitle : _t('session.launcher.StartNewSession')}</span>
        <form slot="content" id="launch-session-form" class="centered" style="position:relative;">
          <div id="progress-01" class="progress center layout fade active">
            <mwc-select id="session-type" icon="category" label="${_t('session.launcher.SessionType')}" required fixedMenuPosition
                        value="${this.sessionType}" @selected="${(e) => this._toggleStartUpCommandEditor(e)}">
              <mwc-list-item value="batch">
                ${_t('session.launcher.BatchMode')}
              </mwc-list-item>
              <mwc-list-item value="interactive" selected>
                ${_t('session.launcher.InteractiveMode')}
              </mwc-list-item>
            </mwc-select>
            <mwc-select id="environment" icon="code" label="${_t('session.launcher.Environments')}" required fixedMenuPosition
                        value="${this.default_language}">
              <mwc-list-item selected graphic="icon" style="display:none!important;">
                ${_t('session.launcher.ChooseEnvironment')}
              </mwc-list-item>
              ${this.languages.map((item) => html`
                ${item.clickable === false ? html`
                  <h5 style="font-size:12px;padding: 0 10px 3px 10px;margin:0; border-bottom:1px solid #ccc;"
                      role="separator" disabled="true">${item.basename}</h5>
                ` : html`
                  <mwc-list-item id="${item.name}" value="${item.name}" graphic="icon">
                    <img slot="graphic" alt="language icon" src="resources/icons/${item.icon}"
                         style="width:24px;height:24px;"/>
                    <div class="horizontal justified center flex layout" style="width:325px;">
                      <div style="padding-right:5px;">${item.basename}</div>
                      <div class="horizontal layout end-justified center flex">
                        ${item.tags ? item.tags.map((item) => html`
                          <lablup-shields style="margin-right:5px;" color="${item.color}"
                                          description=""></lablup-shields>
                        `) : ''}
                        <mwc-icon-button icon="info"
                                         class="fg blue info"
                                         @click="${(e) => this._showKernelDescription(e, item)}">
                        </mwc-icon-button>
                      </div>
                    </div>
                  </mwc-list-item>
                `}
              `)}
            </mwc-select>
            <mwc-select id="version" icon="architecture" label="${_t('session.launcher.Version')}" required fixedMenuPosition>
              <mwc-list-item selected style="display:none!important"></mwc-list-item>
              <h5 style="font-size:12px;padding: 0 10px 3px 15px;margin:0; border-bottom:1px solid #ccc;"
                  role="separator" disabled="true" class="horizontal layout">
                <div style="width:80px;">${_t('session.launcher.Version')}</div>
                <div style="width:120px;">${_t('session.launcher.Base')}</div>
                <div style="width:150px;">${_t('session.launcher.Requirements')}</div>
              </h5>
              ${this.versions.map((item) => html`
                <mwc-list-item id="${item}" value="${item}">
                  <span style="display:none">${item}</span>
                  <div class="horizontal layout end-justified">
                  ${this._getVersionInfo(item).map((item) => html`
                    <lablup-shields style="width:${item.size}!important;"
                                    color="${item.color}"
                                    app="${typeof item.app != 'undefined' && item.app != '' && item.app != ' ' ? item.app : ''}"
                                    description="${item.tag}">
                    </lablup-shields>
                  `)}
                </div>
              </mwc-list-item>
            `)}
            </mwc-select>
            ${this._debug || this.allow_manual_image_name_for_session ? html`
            <mwc-textfield id="image-name" type="text" class="flex" value="" icon="assignment_turned_in"
              label="${_t('session.launcher.ManualImageName')}"
              @change=${(e) => this._toggleEnvironmentSelectUI()}></mwc-textfield>
            `:html``}
            <mwc-textfield id="session-name" placeholder="${_t('session.launcher.SessionNameOptional')}"
                           pattern="[a-zA-Z0-9_-]{4,}" maxLength="64" icon="label"
                           helper="${_t('maxLength.64chars')}"
                           validationMessage="${_t('session.launcher.SessionNameAllowCondition')}">
            </mwc-textfield>
            <div class="vertical layout center flex" id="batch-mode-config-section" style="display:none;">
              <span class="launcher-item-title" style="width:386px;">${_t('session.launcher.BatchModeConfig')}</span>
              <div class="horizontal layout start-justified">
                <div style="width:370px;font-size:12px;">${_t('session.launcher.StartUpCommand')}</div>
              </div>
              <lablup-codemirror id="command-editor" mode="shell"></lablup-codemirror>
              <div class="horizontal center layout justified" style="margin: 10px auto;">
                <div style="width:330px;font-size:12px;">${_t('session.launcher.ScheduleTime')}</div>
                <mwc-switch id="use-scheduled-time" @click="${() => this._toggleScheduleTimeDisplay()}"></mwc-switch>
              </div>
              <vaadin-date-time-picker step="1"
                date-placeholder="DD/MM/YYYY"
                time-placeholder="hh:mm:ss"
                ?required="${this.useScheduledTime}"
                @change="${this._getSchedulableTime}"
                style="display:none;"></vaadin-date-time-picker>
            </div>
            <div class="horizontal layout center justified">
              <span class="launcher-item-title">${_t('session.launcher.SetEnvironmentVariable')}</span>
              <mwc-button
                unelevated
                icon="rule"
                label="${_t('session.launcher.Config')}"
                style="width:auto;margin-right:15px;"
                @click="${() => this._showEnvDialog()}"></mwc-button>
            </div>
            <div class="environment-variables-container" style="margin-top:18px;">
              ${this.environ.length > 0 ? html`
                <div class="horizontal flex center center-justified layout" style="overflow-x:hidden;">
                  <div role="listbox">
                    <h4>${_text('session.launcher.EnvironmentVariable')}</h4>
                    ${this.environ.map((item) => html`
                      <wl-textfield disabled value="${item.name}"></wl-textfield>
                    `)}
                  </div>
                  <div role="listbox" style="margin-left:15px;">
                    <h4>${_text('session.launcher.EnvironmentVariableValue')}</h4>
                    ${this.environ.map((item) => html`
                      <wl-textfield disabled value="${item.value}"></wl-textfield>
                    `)}
                  </div>
                </div>
              ` : html`
                  <div class="vertical layout center flex blank-box">
                    <span>${_t('session.launcher.NoEnvConfigured')}</span>
                  </div>
                `}
            </div>
          </div>
          <div id="progress-02" class="progress center layout fade" style="padding-top:0;">
          <wl-expansion class="vfolder" name="vfolder" open>
            <span slot="title">${_t('session.launcher.FolderToMount')}</span>
            <div class="vfolder-list">
              <vaadin-grid
                  theme="row-stripes column-borders compact"
                  id="vfolder-grid"
                  aria-label="vfolder list"
                  height-by-rows
                  .items="${this.nonAutoMountedVfolders}"
                  @selected-items-changed="${() => this._updateSelectedFolder()}">
                <vaadin-grid-selection-column id="select-column"
                                              flex-grow="0"
                                              text-align="center"
                                              auto-select></vaadin-grid-selection-column>
                <vaadin-grid-filter-column header="${_t('session.launcher.FolderToMount')}"
                                          path="name" resizable></vaadin-grid-filter-column>
                <vaadin-grid-column .renderer="${this._boundFolderMapRenderer}" header="${_t('session.launcher.FolderAlias')}">
                </vaadin-grid-column>
              </vaadin-grid>
              ${this.vfolders.length > 0 ? html`` : html`
              <div class="vertical layout center flex blank-box-medium">
                <span>${_t('session.launcher.NoAvailableFolderToMount')}</span>
              </div>
              `}
            </div>
            </wl-expansion>
            <wl-expansion id="vfolder-mount-preview" class="vfolder" name="vfolder">
              <span slot="title">${_t('session.launcher.MountedFolders')}</span>
              <div class="vfolder-mounted-list">
              ${(this.selectedVfolders.length > 0) || (this.autoMountedVfolders.length > 0) ? html`
                <ul class="vfolder-list">
                    ${this.selectedVfolders.map((item) => html`
                      <li><mwc-icon>folder_open</mwc-icon>${item}
                      ${item in this.folderMapping ? html` (&#10140; ${this.folderMapping[item]})`: html``}
                      </li>
                    `)}
                    ${this.autoMountedVfolders.map((item) => html`
                      <li><mwc-icon>folder_special</mwc-icon>${item.name}</li>
                    `)}
                </ul>
              ` : html`
                  <div class="vertical layout center flex blank-box-large">
                    <span>${_t('session.launcher.NoFolderMounted')}</span>
                  </div>
              `}
              </div>

            </wl-expansion>
          </div>
          <div id="progress-03" class="progress center layout fade">
            <div class="horizontal center layout">
              <mwc-select id="scaling-groups" label="${_t('session.launcher.ResourceGroup')}"
                          icon="storage" required fixedMenuPosition
                          @selected="${(e) => this.updateScalingGroup(false, e)}">
                ${this.scaling_groups.map((item) => html`
                  <mwc-list-item class="scaling-group-dropdown"
                                id="${item.name}" graphic="icon"
                                value="${item.name}">
                    ${item.name}
                  </mwc-list-item>
                `)}
              </mwc-select>
            </div>
            <div class="vertical center layout" style="position:relative;">
              <mwc-select id="resource-templates" label="${_t('session.launcher.ResourceAllocation')}"
                          icon="dashboard_customize" required fixedMenuPosition>
                <mwc-list-item selected style="display:none!important"></mwc-list-item>
                <h5 style="font-size:12px;padding: 0 10px 3px 15px;margin:0; border-bottom:1px solid #ccc;"
                    role="separator" disabled="true" class="horizontal layout center">
                  <div style="width:110px;">Name</div>
                  <div style="width:50px;text-align:right;">CPU</div>
                  <div style="width:50px;text-align:right;">RAM</div>
                  <div style="width:50px;text-align:right;">${_t('session.launcher.SharedMemory')}</div>
                  <div style="width:90px;text-align:right;">${_t('session.launcher.Accelerator')}</div>
                </h5>
                ${this.resource_templates_filtered.map((item) => html`
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
                      <div style="width:60px;text-align:right;">${item.shmem ? html`
                            ${parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(item.shared_memory, 'g')).toFixed(2)} GB` :
    html`64MB`}
                      </div>
                      <div style="width:80px;text-align:right;">
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
                    <h4>${_t('session.launcher.NoSuitablePreset')}</h4>
                    <div style="font-size:12px;">Use advanced settings to <br>start custom session</div>
                  </div>
                </mwc-list-item>
              ` : html``}
              </mwc-select>
            </div>
            <wl-expansion name="resource-group">
              <span slot="title">${_t('session.launcher.CustomAllocation')}</span>
              <div class="vertical center layout">
                <div class="horizontal center layout">
                  <div class="resource-type" style="width:70px;">CPU</div>
                  <lablup-slider id="cpu-resource" class="cpu"
                                pin snaps expand editable markers
                                @click="${(e) => this._applyResourceValueChanges(e)}"
                                @focusout="${(e) => this._applyResourceValueChanges(e)}"
                                marker_limit="${this.marker_limit}"
                                min="${this.cpu_metric.min}" max="${this.cpu_metric.max}"
                                value="${this.cpu_request}"></lablup-slider>
                  <span class="caption">${_t('session.launcher.Core')}</span>
                  <mwc-icon-button icon="info" class="fg green info"
                                    @click="${(e) => {
    this._showResourceDescription(e, 'cpu');
  }}"></mwc-icon-button>
                </div>
                <div class="horizontal center layout">
                  <div class="resource-type">RAM</div>
                  <lablup-slider id="mem-resource" class="mem"
                                pin snaps step=0.05 editable markers
                                  @click="${() => {
    this._resourceTemplateToCustom();
  }}"
                                  @changed="${() => {
    this._updateShmemLimit();
  }}"
                                  @focusout="${(e) => this._applyResourceValueChanges(e)}"
                                marker_limit="${this.marker_limit}"
                                min="${this.mem_metric.min}" max="${this.mem_metric.max}"
                                value="${this.mem_request}"></lablup-slider>
                  <span class="caption">GB</span>
                  <mwc-icon-button icon="info" class="fg orange info" @click="${(e) => {
    this._showResourceDescription(e, 'mem');
  }}"></mwc-icon-button>
                </div>
                <div class="horizontal center layout">
                  <div class="resource-type">${_t('session.launcher.SharedMemory')}</div>
                  <lablup-slider id="shmem-resource" class="mem"
                                pin snaps step="0.0025" editable markers
                                @click="${(e) => this._applyResourceValueChanges(e)}"
                                @focusout="${(e) => this._applyResourceValueChanges(e)}"
                                marker_limit="${this.marker_limit}"
                                min="0.0625" max="${this.shmem_metric.max}"
                                value="${this.shmem_request}"></lablup-slider>
                  <span class="caption">GB</span>
                  <mwc-icon-button icon="info" class="fg orange info" @click="${(e) => {
    this._showResourceDescription(e, 'shmem');
  }}"></mwc-icon-button>
                </div>
                <div class="horizontal center layout">
                  <div class="resource-type">GPU</div>
                  <lablup-slider id="gpu-resource" class="gpu"
                                pin snaps editable markers step="${this.gpu_step}"
                                @click="${(e) => this._applyResourceValueChanges(e)}"
                                @focusout="${(e) => this._applyResourceValueChanges(e)}"
                                marker_limit="${this.marker_limit}"
                                min="0.0" max="${this.cuda_device_metric.max}" value="${this.gpu_request}"></lablup-slider>
                  <span class="caption">GPU</span>
                  <mwc-icon-button icon="info" class="fg blue info" @click="${(e) => {
    this._showResourceDescription(e, 'gpu');
  }}"></mwc-icon-button>
                </div>
                <div class="horizontal center layout">
                  <div class="resource-type">${_t('webui.menu.Sessions')}</div>
                  <lablup-slider id="session-resource" class="session"
                                pin snaps editable markers step="1"
                                @click="${(e) => this._applyResourceValueChanges(e)}"
                                @focusout="${(e) => this._applyResourceValueChanges(e)}"
                                marker_limit="${this.marker_limit}"
                                min="1" max="${this.concurrency_limit}" value="${this.session_request}"></lablup-slider>
                  <span class="caption">#</span>
                  <mwc-icon-button icon="info" class="fg red info" @click="${(e) => {
    this._showResourceDescription(e, 'session');
  }}"></mwc-icon-button>
                </div>
              </div>
            </wl-expansion>
            ${this.cluster_support ? html`
              <mwc-select id="cluster-mode" label="${_t('session.launcher.ClusterMode')}" required
                          icon="account_tree" fixedMenuPosition
                          value="${this.cluster_mode}" @change="${(e) => this._setClusterMode(e)}">
                ${this.cluster_mode_list.map((item) => html`
                  <mwc-list-item
                      class="cluster-mode-dropdown"
                      id="${item}"
                      value="${item}">
                    <div class="horizontal layout center" style="width:100%;">
                      <p style="width:300px;margin-left:21px;">${_t('session.launcher.'+ item)}</p>
                      <mwc-icon-button
                          icon="info"
                          @click="${(e) => this._showResourceDescription(e, item)}">
                      </mwc-icon-button>
                    </div>
                  </mwc-list-item>
                `)}
              </mwc-select>
              <div class="horizontal layout center" style="padding:0 24px;">
                <div class="resource-type">${_t('session.launcher.ClusterSize')}</div>
                <lablup-slider id="cluster-size" class="cluster"
                              pin snaps expand editable markers
                              marker_limit="${this.marker_limit}"
                              min="${this.cluster_metric.min}" max="${this.cluster_metric.max}"
                              value="${this.cluster_size}"
                              @click="${(e) => this._applyResourceValueChanges(e, false)}"
                              @focusout="${(e) => this._applyResourceValueChanges(e, false)}"></lablup-slider>
                ${this.cluster_mode === 'single-node' ? html`
                  <span class="caption" style="width:60px;">${_t('session.launcher.Container')}</span>
                ` : html`
                  <span class="caption">${_t('session.launcher.Node')}</span>
                `}
              </div>
             ` : html``}
            <wl-expansion name="hpc-option-group">
              <span slot="title">${_t('session.launcher.HPCOptimization')}</span>
              <div class="vertical center layout">
                <div class="horizontal center center-justified flex layout">
                  <div style="width:313px;">${_t('session.launcher.SwitchOpenMPoptimization')}</div>
                  <mwc-switch id="OpenMPswitch" selected @click="${this._toggleHPCOptimization}"></mwc-switch>
                </div>
                <div id="HPCOptimizationOptions" style="display:none;">
                  <div class="horizontal center layout">
                    <div style="width:200px;">${_t('session.launcher.NumOpenMPthreads')}</div>
                    <mwc-textfield id="OpenMPCore" type="number" placeholder="1"
                                  value="" min="0" max="1000" step="1" style="width:120px;"
                                  pattern="[0-9]+" @change="${(e) => this._validateInput(e)}">
                    </mwc-textfield>
                    <mwc-icon-button icon="info" class="fg green info"
                                    @click="${(e) => {
    this._showResourceDescription(e, 'openmp-optimization');
  }}"></mwc-icon-button>
                  </div>
                  <div class="horizontal center layout">
                    <div style="width:200px;">${_t('session.launcher.NumOpenBLASthreads')}</div>
                    <mwc-textfield id="OpenBLASCore" type="number" placeholder="1"
                                  value="" min="0" max="1000" step="1" style="width:120px;"
                                  pattern="[0-9]+" @change="${(e) => this._validateInput(e)}">
                    </mwc-textfield>
                    <mwc-icon-button icon="info" class="fg green info"
                                      @click="${(e) => {
    this._showResourceDescription(e, 'openmp-optimization');
  }}"></mwc-icon-button>
                  </div>
                </div>
              </div>
            </wl-expansion>
            <wl-expansion name="ownership" style="--expansion-content-padding:15px 0;">
              <span slot="title">${_t('session.launcher.SetSessionOwner')}</span>
              <div class="vertical layout">
                <div class="horizontal center layout">
                  <mwc-textfield id="owner-email" type="email" class="flex" value=""
                                pattern="^.+@.+\..+$" icon="mail"
                                label="${_t('session.launcher.OwnerEmail')}" size="40"></mwc-textfield>
                  <mwc-icon-button icon="refresh" class="blue"
                                  @click="${() => this._fetchSessionOwnerGroups()}">
                  </mwc-icon-button>
                </div>
                <mwc-select id="owner-accesskey" label="${_t('session.launcher.OwnerAccessKey')}" icon="vpn_key" fixedMenuPosition naturalMenuWidth>
                  ${this.ownerKeypairs.map((item) => html`
                    <mwc-list-item class="owner-group-dropdown"
                                  id="${item.access_key}"
                                  value="${item.access_key}">
                      ${item.access_key}
                    </mwc-list-item>
                  `)}
                </mwc-select>
                <div class="horizontal center layout">
                  <mwc-select id="owner-group" label="${_t('session.launcher.OwnerGroup')}" icon="group_work" fixedMenuPosition naturalMenuWidth>
                    ${this.ownerGroups.map((item) => html`
                      <mwc-list-item class="owner-group-dropdown"
                                    id="${item.name}"
                                    value="${item.name}">
                        ${item.name}
                      </mwc-list-item>
                    `)}
                  </mwc-select>
                  <mwc-select id="owner-scaling-group" label="${_t('session.launcher.OwnerResourceGroup')}"
                              icon="storage" fixedMenuPosition>
                    ${this.ownerScalingGroups.map((item) => html`
                      <mwc-list-item class="owner-group-dropdown"
                                    id="${item.name}"
                                    value="${item.name}">
                        ${item.name}
                      </mwc-list-item>
                    `)}
                  </mwc-select>
                </div>
                <div class="horizontal layout start-justified center">
                <mwc-checkbox id="owner-enabled"></mwc-checkbox>
                <p style="color: rgba(0,0,0,0.6);">${_t('session.launcher.LaunchSessionWithAccessKey')}</p>
                </div>
              </div>
            </wl-expansion>
          </div>
          <div id="progress-04" class="progress center layout fade">
            <p class="title">${_t('session.launcher.TotalAllocation')}</p>
            <div class="vertical layout center center-justified cluster-total-allocation-container">
              <div id="cluster-allocation-pane" style="position:relative;${this.cluster_size <= 1 ? 'display:none;' : ''}">
                <div class="horizontal layout">
                  <div class="vertical layout center center-justified resource-allocated">
                    <p>${_t('session.launcher.CPU')}</p>
                    <span>${this.cpu_request * (this.cluster_size <= 1 ? this.session_request : this.cluster_size)}</span>
                    <p>Core</p>
                  </div>
                  <div class="vertical layout center center-justified resource-allocated">
                    <p>${_t('session.launcher.Memory')}</p>
                    <span>${this.mem_request * (this.cluster_size <= 1 ? this.session_request : this.cluster_size)}</span>
                    <p>GB</p>
                  </div>
                  <div class="vertical layout center center-justified resource-allocated">
                    <p>${_t('session.launcher.SharedMemoryAbbr')}</p>
                    <span>${this._conditionalGBtoMB(this.shmem_request * (this.cluster_size <= 1 ? this.session_request : this.cluster_size))}</span>
                    <p>${this._conditionalGBtoMBunit(this.shmem_request * (this.cluster_size <= 1 ? this.session_request : this.cluster_size))}</p>
                  </div>
                  <div class="vertical layout center center-justified resource-allocated">
                    <p>${_t('session.launcher.GPU')}</p>
                    <span>${this.gpu_request * (this.cluster_size <= 1 ? this.session_request : this.cluster_size)}</span>
                    <p>${_t('session.launcher.GPUSlot')}</p>
                  </div>
                </div>
              </div>
              <div id="total-allocation-container" class="horizontal layout center center-justified allocation-check">
                <div id="total-allocation-pane" style="position:relative;">
                  <div class="horizontal layout resource-allocated-box">
                    <div class="vertical layout center center-justified resource-allocated">
                      <p>${_t('session.launcher.CPU')}</p>
                      <span>${this.cpu_request}</span>
                      <p>Core</p>
                    </div>
                    <div class="vertical layout center center-justified resource-allocated">
                      <p>${_t('session.launcher.Memory')}</p>
                      <span>${this.mem_request}</span>
                      <p>GB</p>
                    </div>
                    <div class="vertical layout center center-justified resource-allocated">
                      <p>${_t('session.launcher.SharedMemoryAbbr')}</p>
                      <span>${this._conditionalGBtoMB(this.shmem_request)}</span>
                      <p>${this._conditionalGBtoMBunit(this.shmem_request)}</p>
                    </div>
                    <div class="vertical layout center center-justified resource-allocated">
                      <p>${_t('session.launcher.GPU')}</p>
                      <span>${this.gpu_request}</span>
                      <p>${_t('session.launcher.GPUSlot')}</p>
                    </div>
                  </div>
                  <div id="resource-allocated-box-shadow"></div>
                </div>
                <div class="vertical layout center center-justified cluster-allocated" style="z-index:10;">
                  <div class="horizontal layout">
                    <p>×</p>
                    <span>${this.cluster_size <= 1 ? this.session_request : this.cluster_size}</span>
                  </div>
                  <p class="small">${_t('session.launcher.Container')}</p>
                </div>
                <div class="vertical layout center center-justified cluster-allocated" style="z-index:10;">
                  <div class="horizontal layout">
                    <p>${this.cluster_mode === 'single-node' ? '' : ''}</p>
                    <span>${this.cluster_mode === 'single-node' ? _t('session.launcher.SingleNode') : _t('session.launcher.MultiNode')}</span>
                  </div>
                  <p class="small">${_t('session.launcher.AllocateNode')}</p>
                </div>
              </div>
            </div>
            <p class="title">${_t('session.launcher.MountedFolders')}</p>
            <div id="mounted-folders-container">
              ${this.selectedVfolders.length > 0 || this.autoMountedVfolders.length > 0 ? html`
                <ul class="vfolder-list">
                  ${this.selectedVfolders.map((item) => html`
                    <li><mwc-icon>folder_open</mwc-icon>${item}
                    ${item in this.folderMapping ? html` (&#10140; ${this.folderMapping[item]})`: html``}
                    </li>
                  `)}
                  ${this.autoMountedVfolders.map((item) => html`
                    <li><mwc-icon>folder_special</mwc-icon>${item.name}</li>
                  `)}
                </ul>
              ` : html`
                <div class="vertical layout center flex blank-box">
                  <span>${_t('session.launcher.NoFolderMounted')}</span>
                </div>
              `}
            </div>
            <p class="title">${_t('session.launcher.EnvironmentVariablePaneTitle')}</p>
            <div class="environment-variables-container">
              ${this.environ.length > 0 ? html`
                <div class="horizontal flex center center-justified layout" style="overflow-x:hidden;">
                  <div role="listbox">
                    <h4>${_text('session.launcher.EnvironmentVariable')}</h4>
                    ${this.environ.map((item) => html`
                      <wl-textfield disabled value="${item.name}"></wl-textfield>
                    `)}
                  </div>
                  <div role="listbox" style="margin-left:15px;">
                    <h4>${_text('session.launcher.EnvironmentVariableValue')}</h4>
                    ${this.environ.map((item) => html`
                      <wl-textfield disabled value="${item.value}"></wl-textfield>
                    `)}
                  </div>
                </div>
              ` : html`
                  <div class="vertical layout center flex blank-box">
                    <span>${_t('session.launcher.NoEnvConfigured')}</span>
                  </div>
                `}
            </div>
          </div>
        </form>
        <div slot="footer" class="vertical flex layout">
          <div class="horizontal flex layout distancing center-center">
            <mwc-icon-button id="prev-button"
                            icon="arrow_back"
                            style="visibility:hidden;margin-right:12px;"
                            @click="${() => this.moveProgress(-1)}"></mwc-icon-button>
            <mwc-button
                unelevated
                class="launch-button"
                id="launch-button"
                icon="rowing"
                @click="${() => this._newSessionWithConfirmation()}">
              <span id="launch-button-msg">${_t('session.launcher.Launch')}</span>
            </mwc-button>
            <mwc-icon-button id="next-button"
                            icon="arrow_forward"
                            style="margin-left:12px;"
                            @click="${() => this.moveProgress(1)}"></mwc-icon-button>
          </div>
          <div class="horizontal flex layout">
            <lablup-progress-bar progress="${this._calculateProgress()}"></lablup-progress-bar>
          </div>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="modify-env-dialog" fixed backdrop persistent closeWithConfirmation>
        <span slot="title">${_t('session.launcher.SetEnvironmentVariable')}</span>
        <span slot="action">
          <mwc-icon-button icon="info" @click="${(e) => this._showEnvConfigDescription(e)}" style="pointer-events: auto;"></mwc-icon-button>
        </span>
        <div slot="content" id="modify-env-container">
          <div class="row header">
            <div> ${_t('session.launcher.EnvironmentVariable')} </div>
            <div> ${_t('session.launcher.EnvironmentVariableValue')} </div>
          </div>
          ${this.environ.forEach((item: any, index) =>
    html`
          <div class="row">
            <wl-textfield
              type="text"
              value=${item.name}
            ></wl-textfield>
            <wl-textfield
              type="text"
              value=${item.value}
            ></wl-textfield>
            <wl-button
              fab flat
              class="fg pink"
              @click=${(e) => this._removeEnvItem(e)}
            >
              <wl-icon>remove</wl-icon>
            </wl-button>
          </div>
          `)}
          <div class="row">
            <wl-textfield type="text"></wl-textfield>
            <wl-textfield type="text"></wl-textfield>
            <wl-button
              fab flat
              class="fg pink"
              @click=${()=>this._appendEnvRow()}
            >
              <wl-icon>add</wl-icon>
            </wl-button>
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
              icon="delete"
              label="${_t('button.DeleteAll')}"
              @click="${()=>this._clearRows()}"></mwc-button>
          <mwc-button
              unelevated
              slot="footer"
              icon="check"
              label="${_t('button.Save')}"
              @click="${()=>this.modifyEnv()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="help-description" fixed backdrop>
        <span slot="title">${this._helpDescriptionTitle}</span>
        <div slot="content" class="horizontal layout center" style="margin:5px;">
        ${this._helpDescriptionIcon == '' ? html`` : html`
          <img slot="graphic" alt="help icon" src="resources/icons/${this._helpDescriptionIcon}"
               style="width:64px;height:64px;margin-right:10px;"/>
        `}
          <div style="font-size:14px;">${unsafeHTML(this._helpDescription)}</div>
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
            <span>${_t('session.launcher.Launch')}</span>
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="env-config-confirmation" warning fixed>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>${_t('session.launcher.EnvConfigWillDisappear')}</p>
          <p>${_t('dialog.ask.DoYouWantToProceed')}</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
              id="env-config-remain-button"
              label="${_t('button.Cancel')}"
              @click="${() => this.closeDialog('env-config-confirmation')}"
              style="width:auto;margin-right:10px;">
          </mwc-button>
          <mwc-button
              unelevated
              id="env-config-reset-button"
              label="${_t('button.DismissAndProceed')}"
              @click="${() => this._closeAndResetEnvInput()}"
              style="width:auto;">
          </mwc-button>
        </div>
      </backend-ai-dialog>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-session-launcher': BackendAiSessionLauncher;
  }
}
