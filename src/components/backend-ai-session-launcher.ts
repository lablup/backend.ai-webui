/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { navigate } from '../backend-ai-app';
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { store } from '../store';
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './lablup-codemirror';
import './lablup-expansion';
import LablupExpansion from './lablup-expansion';
import './lablup-progress-bar';
import './lablup-slider';
import { Button } from '@material/mwc-button';
import '@material/mwc-button';
import { Checkbox } from '@material/mwc-checkbox/mwc-checkbox';
import { IconButton } from '@material/mwc-icon-button';
import '@material/mwc-linear-progress';
import '@material/mwc-list/mwc-check-list-item';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import { Select } from '@material/mwc-select';
import '@material/mwc-slider';
import { Switch } from '@material/mwc-switch';
import { TextField } from '@material/mwc-textfield/mwc-textfield';
import '@vaadin/grid/vaadin-grid';
import '@vaadin/grid/vaadin-grid-filter-column';
import '@vaadin/grid/vaadin-grid-selection-column';
import '@vaadin/text-field/vaadin-text-field';
import { css, CSSResultGroup, html, render } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type VaadinTextField = HTMLElementTagNameMap['vaadin-text-field'];
type LablupSlider = HTMLElementTagNameMap['lablup-slider'];
type LablupCodemirror = HTMLElementTagNameMap['lablup-codemirror'];
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];

/**
 Backend AI Session Launcher Carousel

 Example:

 <backend-ai-session-launcher active></backend-ai-session-launcher>

@group Backend.AI Web UI
 @element backend-ai-session-launcher
 */

@customElement('backend-ai-session-launcher')
export default class BackendAiSessionLauncher extends BackendAIPage {
  @property({ type: Boolean }) is_connected = false;
  @property({ type: Boolean }) enableLaunchButton = false;
  @property({ type: Boolean }) hideLaunchButton = false;
  @property({ type: Boolean }) hideEnvDialog = false;
  @property({ type: Boolean }) hidePreOpenPortDialog = false;
  @property({ type: Boolean }) enableInferenceWorkload = false;
  @property({ type: String }) location = '';
  @property({ type: String }) mode = 'normal';
  @property({ type: String }) newSessionDialogTitle = '';
  @property({ type: String }) importScript = '';
  @property({ type: String }) importFilename = '';
  @property({ type: Object }) imageRequirements = Object();
  @property({ type: Object }) resourceLimits = Object();
  @property({ type: Object }) userResourceLimit = Object();
  @property({ type: Object }) aliases = Object();
  @property({ type: Object }) tags = Object();
  @property({ type: Object }) icons = Object();
  @property({ type: Object }) imageInfo = Object();
  @property({ type: String }) kernel = '';
  @property({ type: Array }) versions;
  @property({ type: Array }) languages;
  @property({ type: Number }) marker_limit = 25;
  @property({ type: String }) gpu_mode;
  @property({ type: Array }) gpu_modes = [];
  @property({ type: Number }) gpu_step = 0.1;
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
  @property({ type: Object }) npu_device_metric = {
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
  @property({ type: Object }) ipu_device_metric = {
    min: '0',
    max: '0',
  };
  @property({ type: Object }) atom_device_metric = {
    min: '0',
    max: '0',
  };
  @property({ type: Object }) atom_plus_device_metric = {
    min: '0',
    max: '0',
  };
  @property({ type: Object }) gaudi2_device_metric = {
    min: '0',
    max: '0',
  };
  @property({ type: Object }) warboy_device_metric = {
    min: '0',
    max: '0',
  };
  @property({ type: Object }) rngd_device_metric = {
    min: '0',
    max: '0',
  };
  @property({ type: Object }) hyperaccel_lpu_device_metric = {
    min: '0',
    max: '0',
  };

  @property({ type: Object }) cluster_metric = {
    min: 1,
    max: 1,
  };
  @property({ type: Array }) cluster_mode_list = ['single-node', 'multi-node'];
  @property({ type: Boolean }) cluster_support = false;
  @property({ type: Object }) images;
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
  @property({ type: Array }) selectedVfolders;
  @property({ type: Array }) autoMountedVfolders;
  @property({ type: Array }) modelVfolders;
  @property({ type: Array }) nonAutoMountedVfolders;
  @property({ type: Object }) folderMapping = Object();
  @property({ type: Object }) customFolderMapping = Object();
  @property({ type: Object }) used_slot_percent;
  @property({ type: Object }) used_resource_group_slot_percent;
  @property({ type: Object }) used_project_slot_percent;
  @property({ type: Array }) resource_templates;
  @property({ type: Array }) resource_templates_filtered;
  @property({ type: String }) default_language;
  @property({ type: Number }) cpu_request;
  @property({ type: Number }) mem_request;
  @property({ type: Number }) shmem_request;
  @property({ type: Number }) gpu_request;
  @property({ type: String }) gpu_request_type;
  @property({ type: Number }) session_request;
  @property({ type: Boolean }) _status;
  @property({ type: Number }) num_sessions;
  @property({ type: String }) scaling_group;
  @property({ type: Array }) scaling_groups;
  @property({ type: Array }) sessions_list;
  @property({ type: Boolean }) metric_updating;
  @property({ type: Boolean }) metadata_updating;
  @property({ type: Boolean }) aggregate_updating = false;
  @property({ type: Object }) scaling_group_selection_box;
  @property({ type: Object }) resourceGauge = Object();
  @property({ type: String }) sessionType = 'interactive';
  /* Parameters required to launch a session on behalf of other user */
  @property({ type: Boolean }) ownerFeatureInitialized = false;
  @property({ type: String }) ownerDomain = '';
  @property({ type: Array }) ownerKeypairs;
  @property({ type: Array }) ownerGroups;
  @property({ type: Array }) ownerScalingGroups;
  @property({ type: Boolean }) project_resource_monitor = false;
  @property({ type: Boolean }) _default_language_updated = false;
  @property({ type: Boolean }) _default_version_updated = false;
  @property({ type: String }) _helpDescription = '';
  @property({ type: String }) _helpDescriptionTitle = '';
  @property({ type: String }) _helpDescriptionIcon = '';
  @property({ type: String }) _NPUDeviceNameOnSlider = 'GPU';
  @property({ type: Number }) max_cpu_core_per_session = 128;
  @property({ type: Number }) max_mem_per_container = 1536;
  @property({ type: Number }) max_cuda_device_per_container = 16;
  @property({ type: Number }) max_cuda_shares_per_container = 16;
  @property({ type: Number }) max_rocm_device_per_container = 10;
  @property({ type: Number }) max_tpu_device_per_container = 8;
  @property({ type: Number }) max_ipu_device_per_container = 8;
  @property({ type: Number }) max_atom_device_per_container = 4;
  @property({ type: Number }) max_atom_plus_device_per_container = 4;
  @property({ type: Number }) max_gaudi2_device_per_container = 4;
  @property({ type: Number }) max_warboy_device_per_container = 4;
  @property({ type: Number }) max_rngd_device_per_container = 4;
  @property({ type: Number }) max_hyperaccel_lpu_device_per_container = 4;
  @property({ type: Number }) max_shm_per_container = 8;
  @property({ type: Boolean }) allow_manual_image_name_for_session = false;
  @property({ type: Object }) resourceBroker;
  @property({ type: Number }) cluster_size = 1;
  @property({ type: String }) cluster_mode;
  @property({ type: Object }) deleteEnvInfo = Object();
  @property({ type: Object }) deleteEnvRow = Object();
  @property({ type: Array }) environ;
  @property({ type: Array }) preOpenPorts;
  @property({ type: Object }) environ_values = Object();
  @property({ type: Object }) vfolder_select_expansion = Object();
  @property({ type: Number }) currentIndex = 1;
  @property({ type: Number }) progressLength;
  @property({ type: Object }) _nonAutoMountedFolderGrid = Object();
  @property({ type: Object }) _modelFolderGrid = Object();
  @property({ type: Boolean }) _debug = false;
  @property({ type: Object }) _boundFolderToMountListRenderer =
    this.folderToMountListRenderer.bind(this);
  @property({ type: Object }) _boundFolderMapRenderer =
    this.folderMapRenderer.bind(this);
  @property({ type: Object }) _boundPathRenderer =
    this.infoHeaderRenderer.bind(this);
  @property({ type: String }) scheduledTime = '';
  @property({ type: Object }) schedulerTimer;
  @property({ type: Object }) sessionInfoObj = {
    environment: '',
    version: [''],
  };
  @property({ type: String }) launchButtonMessageTextContent = _text(
    'session.launcher.Launch',
  );
  @property({ type: Boolean }) isExceedMaxCountForPreopenPorts = false;
  @property({ type: Number }) maxCountForPreopenPorts = 10;
  @property({ type: Boolean }) allowCustomResourceAllocation = true;
  @property({ type: Boolean }) allowNEOSessionLauncher = false;
  @query('#image-name') manualImageName;
  @query('#version') version_selector!: Select;
  @query('#environment') environment!: Select;
  @query('#owner-group') ownerGroupSelect!: Select;
  @query('#scaling-groups') scalingGroups!: Select;
  @query('#resource-templates') resourceTemplatesSelect!: Select;
  @query('#owner-scaling-group') ownerScalingGroupSelect!: Select;
  @query('#owner-accesskey') ownerAccesskeySelect!: Select;
  @query('#owner-email') ownerEmailInput!: TextField;
  @query('#vfolder-mount-preview') vfolderMountPreview!: LablupExpansion;
  @query('#launch-button') launchButton!: Button;
  @query('#prev-button') prevButton!: IconButton;
  @query('#next-button') nextButton!: IconButton;
  @query('#OpenMPswitch') openMPSwitch!: Switch;
  @query('#cpu-resource') cpuResourceSlider!: LablupSlider;
  @query('#gpu-resource') npuResourceSlider!: LablupSlider;
  @query('#mem-resource') memoryResourceSlider!: LablupSlider;
  @query('#shmem-resource') sharedMemoryResourceSlider!: LablupSlider;
  @query('#session-resource') sessionResourceSlider!: LablupSlider;
  @query('#cluster-size') clusterSizeSlider!: LablupSlider;
  @query('#launch-button-msg') launchButtonMessage!: HTMLSpanElement;
  @query('#new-session-dialog') newSessionDialog!: BackendAIDialog;
  @query('#modify-env-dialog') modifyEnvDialog!: BackendAIDialog;
  @query('#modify-env-container') modifyEnvContainer!: HTMLDivElement;
  @query('#modify-preopen-ports-dialog')
  modifyPreOpenPortDialog!: BackendAIDialog;
  @query('#modify-preopen-ports-container')
  modifyPreOpenPortContainer!: HTMLDivElement;
  @query('#launch-confirmation-dialog')
  launchConfirmationDialog!: BackendAIDialog;
  @query('#help-description') helpDescriptionDialog!: BackendAIDialog;
  @query('#command-editor') commandEditor!: LablupCodemirror;
  @query('#session-name') sessionName!: TextField;
  @query('backend-ai-react-batch-session-scheduled-time-setting')
  batchSessionDatePicker!: HTMLElement;

  constructor() {
    super();
    this.active = false;
    this.ownerKeypairs = [];
    this.ownerGroups = [];
    this.ownerScalingGroups = [];
    this.resourceBroker = globalThis.resourceBroker;
    this.notification = globalThis.lablupNotification;
    this.environ = [];
    this.preOpenPorts = [];
    this.init_resource();
  }

  static get is() {
    return 'backend-ai-session-launcher';
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        h5,
        p,
        span {
          color: var(--token-colorText);
        }

        .slider-list-item {
          padding: 0;
        }

        hr.separator {
          border-top: 1px solid var(--token-colorBorder, #ddd);
        }

        lablup-slider {
          width: 350px !important;
          --textfield-min-width: 135px;
          --slider-width: 210px;
        }

        lablup-progress-bar {
          --progress-bar-width: 100%;
          --progress-bar-height: 10px;
          --progress-bar-border-radius: 0px;
          height: 100%;
          width: 100%;
          --progress-bar-background: var(--general-progress-bar-using);
          /* transition speed for progress bar */
          --progress-bar-transition-second: 0.1s;
          margin: 0;
        }

        vaadin-grid {
          max-height: 335px;
          margin-left: 20px;
        }

        .alias {
          max-width: 145px;
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

        mwc-list-item.resource-type {
          font-size: 14px;
          font-weight: 500;
          height: 20px;
          padding: 5px;
        }

        mwc-slider {
          width: 200px;
        }

        div.vfolder-list,
        div.vfolder-mounted-list,
        #mounted-folders-container,
        .environment-variables-container,
        .preopen-ports-container,
        mwc-select h5 {
          background-color: var(
            --token-colorBgElevated,
            rgba(244, 244, 244, 1)
          );
          color: var(--token-colorText);
          overflow-y: scroll;
        }

        div.vfolder-list,
        div.vfolder-mounted-list {
          max-height: 335px;
        }

        .environment-variables-container,
        .preopen-ports-container {
          font-size: 0.8rem;
          padding: 10px;
        }

        .environment-variables-container mwc-textfield input,
        .preopen-ports-container mwc-textfield input {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .environment-variables-container mwc-textfield,
        .preopen-ports-container mwc-textfield {
          --mdc-text-field-fill-color: var(--token-colorBgElevated);
          --mdc-text-field-disabled-fill-color: var(--token-colorBgElevated);
          --mdc-text-field-disabled-line-color: var(--token-colorBorder);
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
          border-radius: 10px;
          border: 1px dotted
            var(--token-colorBorder, --general-button-background-color);
          padding-top: 10px;
          margin-left: 15px;
          margin-right: 15px;
        }

        .resource-button {
          height: 140px;
          width: 330px;
          margin: 5px;
          padding: 0;
          font-size: 14px;
        }

        .resource-allocated {
          width: 45px;
          height: 60px;
          font-size: 16px;
          margin: 5px;
          opacity: 1;
          z-index: 11;
        }

        .resource-allocated > p {
          margin: 0 auto;
          font-size: 8px;
        }
        .resource-allocated-box {
          z-index: 10;
          position: relative;
        }
        .resource-allocated-box-shadow {
          position: relative;
          z-index: 1;
          top: -65px;
          height: 200px;
          width: 70px;
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
          line-height: 1.2em;
        }

        .cluster-allocated > div.horizontal > p {
          font-size: 1rem;
          margin: 0px;
          line-height: 1.2em;
        }

        .cluster-allocated > p.small {
          font-size: 8px;
          margin: 0px;
          margin-top: 0.5em;
          text-align: center;
          line-height: 1.2em;
        }

        .cluster-allocated {
          p,
          span {
            color: var(--token-colorWhite);
          }
        }

        .resource-allocated > span,
        .cluster-allocated > div.horizontal > span {
          font-weight: bolder;
        }

        .allocation-check {
          margin-bottom: 10px;
        }

        .resource-allocated-box {
          border-radius: 5px;
          margin: 5px;
          z-index: 10;
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

        #launch-session-form {
          height: calc(var(--component-height, auto) - 157px);
        }

        lablup-expansion {
          --expansion-elevation: 0;
          --expansion-elevation-open: 0;
          --expansion-elevation-hover: 0;
          --expansion-header-padding: 16px;
          --expansion-margin-open: 0;
          --expansion-header-font-weight: normal;
          --expansion-header-font-size: 14px;
          --expansion-header-font-color: var(
            --token-colorText,
            rgb(64, 64, 64)
          );
          --expansion-background-color: var(--token-colorBgElevated);
          --expansion-header-background-color: var(--token-colorBgElevated);
        }

        lablup-expansion.vfolder,
        lablup-expansion.editor {
          --expansion-content-padding: 0;
          border-bottom: 1px;
        }

        lablup-expansion[name='resource-group'] {
          --expansion-content-padding: 0 16px;
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
          --mdc-menu-min-width: 200px;
        }

        mwc-textfield {
          width: 100%;
        }

        mwc-textfield#session-name {
          margin-bottom: 1px;
        }

        mwc-button,
        mwc-button[raised],
        mwc-button[unelevated],
        mwc-button[disabled] {
          width: 100%;
        }

        mwc-checkbox {
          --mdc-theme-secondary: var(--general-checkbox-color);
        }

        mwc-checkbox#hide-guide {
          margin-right: 10px;
        }

        #prev-button,
        #next-button {
          color: var(--token-colorPrimary, #27824f);
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

        #vfolder-header-title {
          text-align: center;
          font-size: 16px;
          font-family: var(--token-fontFamily);
          font-weight: 500;
        }

        #help-description {
          --component-width: 350px;
        }

        #help-description p {
          padding: 5px !important;
        }

        #launch-confirmation-dialog,
        #env-config-confirmation,
        #preopen-ports-config-confirmation {
          --component-width: 400px;
          --component-font-size: 14px;
        }

        mwc-icon-button.info {
          --mdc-icon-button-size: 30px;
          color: var(--token-colorTextSecondary);
        }

        mwc-icon {
          --mdc-icon-size: 13px;
          margin-right: 2px;
          vertical-align: middle;
        }

        #error-icon {
          width: 24px;
          --mdc-icon-size: 24px;
          margin-right: 10px;
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

        p.title {
          padding: 15px 15px 0px;
          margin-top: 0;
          font-size: 12px;
          font-weight: 200;
          color: var(--token-colorTextTertiary, #404040);
        }

        #progress-04 p.title {
          font-weight: 400;
        }

        #batch-mode-config-section {
          width: 100%;
          border-bottom: solid 1px var(--token-colorBorder, rgba(0, 0, 0, 0.42));
          margin-bottom: 15px;
        }

        .allocation-shadow {
          height: 70px;
          width: 200px;
          position: absolute;
          top: -5px;
          left: 5px;
          border: 1px solid var(--token-colorBorder, #ccc);
        }

        #modify-env-dialog,
        #modify-preopen-ports-dialog {
          --component-max-height: 550px;
          --component-width: 400px;
        }

        #modify-env-dialog div.container,
        #modify-preopen-ports-dialog div.container {
          display: flex;
          flex-direction: column;
          padding: 0px 30px;
        }

        #modify-env-dialog div.row,
        #modify-env-dialog div.header {
          display: grid;
          grid-template-columns: 4fr 4fr 1fr;
        }

        #modify-env-dialog div[slot='footer'],
        #modify-preopen-ports-dialog div[slot='footer'] {
          display: flex;
          margin-left: auto;
          gap: 15px;
        }

        #modify-env-container mwc-textfield,
        #modify-preopen-ports-dialog mwc-textfield {
          width: 90%;
          margin: auto 5px;
        }

        #env-add-btn,
        #preopen-ports-add-btn {
          margin: 20px auto 10px auto;
        }

        .delete-all-button {
          --mdc-theme-primary: var(--paper-red-600);
        }

        .minus-btn {
          --mdc-icon-size: 20px;
          color: var(--token-colorPrimary, #27824f);
        }

        .environment-variables-container h4,
        .preopen-ports-container h4 {
          margin: 0;
        }

        .environment-variables-container mwc-textfield,
        .preopen-ports-container mwc-textfield {
          --mdc-typography-subtitle1-font-family: var(--token-fontFamily);
          --mdc-text-field-disabled-ink-color: var(--token-colorText);
        }

        .optional-buttons {
          margin: auto 12px;
        }

        .optional-buttons mwc-button {
          width: 50%;
          --mdc-typography-button-font-size: 0.5vw;
        }

        #launch-button-msg {
          color: var(--token-colorWhite);
        }

        [name='resource-group'] mwc-list-item {
          --mdc-ripple-color: transparent;
        }

        @media screen and (max-width: 400px) {
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
          from {
            opacity: 0.7;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade {
          from {
            opacity: 0.7;
          }
          to {
            opacity: 1;
          }
        }
        #launch-button {
          font-size: 14px;
        }
      `,
    ];
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
    this.modelVfolders = [];
    this.autoMountedVfolders = [];
    this.default_language = '';
    this.concurrency_used = 0;
    this.concurrency_max = 0;
    this.concurrency_limit = 2;
    this.max_containers_per_session = 1;
    this._status = 'inactive';
    this.cpu_request = 1;
    this.mem_request = 1;
    this.shmem_request = 0.0625;
    this.gpu_request = 0;
    this.gpu_request_type = 'cuda.device';
    this.session_request = 1;
    this.scaling_groups = [{ name: '' }]; // if there is no scaling group, set the name as empty string
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
    this.environment.addEventListener(
      'selected',
      this.updateLanguage.bind(this),
    );
    this.version_selector.addEventListener('selected', () => {
      this.updateResourceAllocationPane();
    });

    this.shadowRoot?.querySelectorAll('lablup-expansion').forEach((element) => {
      element.addEventListener(
        'keydown',
        (event) => {
          event.stopPropagation();
        },
        true,
      );
    });

    this.resourceGauge = this.shadowRoot?.querySelector('#resource-gauges');
    document.addEventListener('backend-ai-group-changed', () => {
      this._updatePageVariables(true);
    });
    document.addEventListener('backend-ai-resource-broker-updated', () => {
      // Fires when broker is updated.
    });
    if (this.hideLaunchButton === true) {
      (
        this.shadowRoot?.querySelector('#launch-session') as HTMLElement
      ).style.display = 'none';
    }

    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this.max_cpu_core_per_session =
            globalThis.backendaiclient._config.maxCPUCoresPerContainer || 128;
          this.max_mem_per_container =
            globalThis.backendaiclient._config.maxMemoryPerContainer || 1536;
          this.max_cuda_device_per_container =
            globalThis.backendaiclient._config.maxCUDADevicesPerContainer || 16;
          this.max_cuda_shares_per_container =
            globalThis.backendaiclient._config.maxCUDASharesPerContainer || 16;
          this.max_rocm_device_per_container =
            globalThis.backendaiclient._config.maxROCMDevicesPerContainer || 10;
          this.max_tpu_device_per_container =
            globalThis.backendaiclient._config.maxTPUDevicesPerContainer || 8;
          this.max_ipu_device_per_container =
            globalThis.backendaiclient._config.maxIPUDevicesPerContainer || 8;
          this.max_atom_device_per_container =
            globalThis.backendaiclient._config.maxATOMDevicesPerContainer || 8;
          this.max_atom_plus_device_per_container =
            globalThis.backendaiclient._config.maxATOMPlUSDevicesPerContainer ||
            8;
          this.max_gaudi2_device_per_container =
            globalThis.backendaiclient._config.maxGaudi2DevicesPerContainer ||
            8;
          this.max_warboy_device_per_container =
            globalThis.backendaiclient._config.maxWarboyDevicesPerContainer ||
            8;
          this.max_rngd_device_per_container =
            globalThis.backendaiclient._config.maxRNGDDevicesPerContainer || 8;
          this.max_hyperaccel_lpu_device_per_container =
            globalThis.backendaiclient._config
              .maxHyperaccelLPUDevicesPerContainer || 8;
          this.max_shm_per_container =
            globalThis.backendaiclient._config.maxShmPerContainer || 8;
          if (
            globalThis.backendaiclient._config
              .allow_manual_image_name_for_session !== undefined &&
            'allow_manual_image_name_for_session' in
              globalThis.backendaiclient._config &&
            globalThis.backendaiclient._config
              .allow_manual_image_name_for_session !== ''
          ) {
            this.allow_manual_image_name_for_session =
              globalThis.backendaiclient._config.allow_manual_image_name_for_session;
          } else {
            this.allow_manual_image_name_for_session = false;
          }
          if (globalThis.backendaiclient.supports('multi-container')) {
            this.cluster_support = true;
          }
          this.maxCountForPreopenPorts =
            globalThis.backendaiclient._config.maxCountForPreopenPorts;
          this.allowCustomResourceAllocation =
            globalThis.backendaiclient._config.allowCustomResourceAllocation;
          this.is_connected = true;
          this._debug = globalThis.backendaiwebui.debug;
          this._enableLaunchButton();
        },
        { once: true },
      );
    } else {
      this.max_cpu_core_per_session =
        globalThis.backendaiclient._config.maxCPUCoresPerContainer || 128;
      this.max_mem_per_container =
        globalThis.backendaiclient._config.maxMemoryPerContainer || 1536;
      this.max_cuda_device_per_container =
        globalThis.backendaiclient._config.maxCUDADevicesPerContainer || 16;
      this.max_cuda_shares_per_container =
        globalThis.backendaiclient._config.maxCUDASharesPerContainer || 16;
      this.max_rocm_device_per_container =
        globalThis.backendaiclient._config.maxROCMDevicesPerContainer || 10;
      this.max_tpu_device_per_container =
        globalThis.backendaiclient._config.maxTPUDevicesPerContainer || 8;
      this.max_ipu_device_per_container =
        globalThis.backendaiclient._config.maxIPUDevicesPerContainer || 8;
      this.max_atom_device_per_container =
        globalThis.backendaiclient._config.maxATOMDevicesPerContainer || 8;
      this.max_atom_plus_device_per_container =
        globalThis.backendaiclient._config.maxATOMPlUSDevicesPerContainer || 8;
      this.max_gaudi2_device_per_container =
        globalThis.backendaiclient._config.maxGaudi2DevicesPerContainer || 8;
      this.max_warboy_device_per_container =
        globalThis.backendaiclient._config.maxWarboyDevicesPerContainer || 8;
      this.max_rngd_device_per_container =
        globalThis.backendaiclient._config.maxRNGDDevicesPerContainer || 8;
      this.max_hyperaccel_lpu_device_per_container =
        globalThis.backendaiclient._config
          .maxHyperaccelLPUDevicesPerContainer || 8;
      this.max_shm_per_container =
        globalThis.backendaiclient._config.maxShmPerContainer || 8;
      if (
        globalThis.backendaiclient._config
          .allow_manual_image_name_for_session !== undefined &&
        'allow_manual_image_name_for_session' in
          globalThis.backendaiclient._config &&
        globalThis.backendaiclient._config
          .allow_manual_image_name_for_session !== ''
      ) {
        this.allow_manual_image_name_for_session =
          globalThis.backendaiclient._config.allow_manual_image_name_for_session;
      } else {
        this.allow_manual_image_name_for_session = false;
      }
      if (globalThis.backendaiclient.supports('multi-container')) {
        this.cluster_support = true;
      }
      this.maxCountForPreopenPorts =
        globalThis.backendaiclient._config.maxCountForPreopenPorts;
      this.allowCustomResourceAllocation =
        globalThis.backendaiclient._config.allowCustomResourceAllocation;
      this.is_connected = true;
      this._debug = globalThis.backendaiwebui.debug;
      this._enableLaunchButton();
    }
    this.modifyEnvDialog.addEventListener('dialog-closing-confirm', (e) => {
      const currentEnv = {};
      const rows = this.modifyEnvContainer?.querySelectorAll('.row');

      // allow any input in variable or value
      const nonempty = (row) =>
        Array.prototype.filter.call(
          row.querySelectorAll('mwc-textfield'),
          (tf) => tf.value.length === 0,
        ).length <= 1;

      const encodeRow = (row) => {
        const items: Array<any> = Array.prototype.map.call(
          row.querySelectorAll('mwc-textfield'),
          (tf) => tf.value,
        );
        currentEnv[items[0]] = items[1];
        return items;
      };
      Array.prototype.filter
        .call(rows, (row) => nonempty(row))
        .map((row) => encodeRow(row));

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
        this.hideEnvDialog = true;
        this.openDialog('env-config-confirmation');
      } else {
        this.modifyEnvDialog.closeWithConfirmation = false;
        this.closeDialog('modify-env-dialog');
      }
    });
    this.modifyPreOpenPortDialog.addEventListener(
      'dialog-closing-confirm',
      () => {
        const rows = this.modifyPreOpenPortContainer?.querySelectorAll(
          '.row:not(.header) mwc-textfield',
        ) as NodeListOf<TextField>;
        const currentPorts = Array.from(rows)
          .filter((row) => row.value !== '')
          .map((row) => row.value);

        // check if there's any changes occurred
        const isEquivalent = (a, b): boolean => {
          if (a.length !== b.length) {
            return false;
          }
          return a.every((elem, index) => elem === b[index]);
        };

        if (!isEquivalent(currentPorts, this.preOpenPorts)) {
          this.hidePreOpenPortDialog = true;
          this.openDialog('preopen-ports-config-confirmation');
        } else {
          this.modifyPreOpenPortDialog.closeWithConfirmation = false;
          this.closeDialog('modify-preopen-ports-dialog');
        }
      },
    );
    this.currentIndex = 1;
    this.progressLength = this.shadowRoot?.querySelectorAll('.progress').length;
    this._nonAutoMountedFolderGrid = this.shadowRoot?.querySelector(
      '#non-auto-mounted-folder-grid',
    );
    this._modelFolderGrid =
      this.shadowRoot?.querySelector('#model-folder-grid');
    // Tricks to close expansion if window size changes
    globalThis.addEventListener('resize', () => {
      document.body.dispatchEvent(new Event('click'));
    });
  }

  _enableLaunchButton() {
    // Check preconditions and enable it via pooling
    if (!this.resourceBroker.image_updating) {
      // Image information is successfully updated.
      if (this.mode === 'inference') {
        this.languages = this.resourceBroker.languages.filter(
          (item) =>
            item.name !== '' &&
            this.resourceBroker.imageRoles[item.name] === 'INFERENCE',
        );
      } else {
        this.languages = this.resourceBroker.languages.filter(
          (item) =>
            item.name === '' ||
            this.resourceBroker.imageRoles[item.name] === 'COMPUTE',
        );
      }
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
    this.scaling_groups = this.resourceBroker.scaling_groups;
    const selectedSgroup = this.scalingGroups.items.find(
      (item) => item.value === this.resourceBroker.scaling_group,
    );
    if (
      this.resourceBroker.scaling_group === '' ||
      typeof selectedSgroup == 'undefined'
    ) {
      setTimeout(() => {
        this._updateSelectedScalingGroup();
      }, 500);
      return;
    }
    const idx = this.scalingGroups.items.indexOf(selectedSgroup);
    this.scalingGroups.select(-1);
    this.scalingGroups.select(idx);
    this.scalingGroups.value = selectedSgroup.value;
    this.scalingGroups.requestUpdate();
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
        await this.updateResourceAllocationPane('session dialog');
      }
    }
  }

  _initializeFolderMapping() {
    this.folderMapping = {};
    const aliasFields = this.shadowRoot?.querySelectorAll(
      '.alias',
    ) as NodeListOf<VaadinTextField>;
    aliasFields.forEach((element) => {
      element.value = '';
    });
  }

  /**
   * Update selected folders.
   * If selectedFolderItems are not empty and forceInitialize is true, unselect the selected items
   *
   * @param {boolean} forceInitialize - whether to initialize selected vfolder or not
   * */
  async _updateSelectedFolder(forceInitialize = false) {
    if (
      this._nonAutoMountedFolderGrid &&
      this._nonAutoMountedFolderGrid.selectedItems
    ) {
      let selectedFolderItems = this._nonAutoMountedFolderGrid.selectedItems;
      selectedFolderItems = selectedFolderItems.concat(
        this._modelFolderGrid.selectedItems,
      );
      let selectedFolders: string[] = [];
      if (selectedFolderItems.length > 0) {
        selectedFolders = selectedFolderItems.map((item) => item.name);
        if (forceInitialize) {
          this._unselectAllSelectedFolder();
        }
      }
      this.selectedVfolders = selectedFolders;
      for (const folder of this.selectedVfolders) {
        const alias = (
          this.shadowRoot?.querySelector(
            '#vfolder-alias-' + folder,
          ) as VaadinTextField
        ).value;
        if (alias.length > 0) {
          this.folderMapping[folder] = (
            this.shadowRoot?.querySelector(
              '#vfolder-alias-' + folder,
            ) as VaadinTextField
          ).value;
        }
        if (
          folder in this.folderMapping &&
          this.selectedVfolders.includes(this.folderMapping[folder])
        ) {
          delete this.folderMapping[folder];
          (
            this.shadowRoot?.querySelector(
              '#vfolder-alias-' + folder,
            ) as VaadinTextField
          ).value = '';
          await this.vfolderMountPreview.updateComplete.then(() =>
            this.requestUpdate(),
          );
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
    const gridListToUnselect = [
      this._nonAutoMountedFolderGrid,
      this._modelFolderGrid,
    ];
    gridListToUnselect.forEach((grid) => {
      if (grid && grid.selectedItems) {
        grid.selectedItems.forEach((item) => {
          item.selected = false;
        });
        grid.selectedItems = [];
      }
    });
    this.selectedVfolders = [];
  }

  _checkSelectedItems() {
    const gridListToSelect = [
      this._nonAutoMountedFolderGrid,
      this._modelFolderGrid,
    ];
    gridListToSelect.forEach((grid) => {
      if (grid && grid.selectedItems) {
        const selectedFolderItems = grid.selectedItems;
        let selectedFolders: string[] = [];
        if (selectedFolderItems.length > 0) {
          grid.selectedItems = [];
          selectedFolders = selectedFolderItems.map((item) => item?.id);
          grid.querySelectorAll('vaadin-checkbox').forEach((checkbox) => {
            if (selectedFolders.includes(checkbox.__item?.id)) {
              checkbox.checked = true;
            }
          });
        }
      }
    });
  }

  /**
   * derive session infomation from manualImageName or selector and save it in sessionInfoObj.
   *
   * @return {Boolean}
   * */
  _preProcessingSessionInfo() {
    let environmentString;
    let versionArray;

    if (this.manualImageName?.value) {
      const nameFragments = this.manualImageName.value.split(':');
      environmentString = nameFragments[0];
      versionArray = nameFragments.slice(-1)[0].split('-');
    } else if (
      this.kernel !== undefined &&
      this.version_selector?.disabled === false
    ) {
      environmentString = this.kernel;
      // TODO remove protected field access
      versionArray = (this.version_selector as any).selectedText.split('/');
    } else {
      return false;
    }

    this.sessionInfoObj.environment = environmentString.split('/').pop();
    this.sessionInfoObj.version = [versionArray[0].toUpperCase()].concat(
      versionArray.length !== 1
        ? versionArray.slice(1).map((item) => item.toUpperCase())
        : [''],
    );
    return true;
  }

  /**
   * If active is true, change view states. - update page variables, disable enter key.
   *
   * @param {Boolean} active - whether view states change or not
   * */
  async _viewStateChanged() {
    await this.updateComplete;

    if (!this.active) {
      return;
    }

    const _init = () => {
      this.enableInferenceWorkload =
        globalThis.backendaiclient.supports('inference-workload');
    };

    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this.project_resource_monitor =
            this.resourceBroker.allow_project_resource_monitor;
          this._updatePageVariables(true);
          this._disableEnterKey();
          _init();
        },
        { once: true },
      );
    } else {
      this.project_resource_monitor =
        this.resourceBroker.allow_project_resource_monitor;
      await this._updatePageVariables(true);
      this._disableEnterKey();
      _init();
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
    return this.resourceBroker
      ._refreshResourcePolicy()
      .then(() => {
        this.concurrency_used = this.resourceBroker.concurrency_used;
        this.userResourceLimit = this.resourceBroker.userResourceLimit;
        this.concurrency_max = this.resourceBroker.concurrency_max;
        this.max_containers_per_session =
          this.resourceBroker.max_containers_per_session ?? 1;
        this.gpu_mode = this.resourceBroker.gpu_mode;
        this.gpu_step = this.resourceBroker.gpu_step;
        this.gpu_modes = this.resourceBroker.gpu_modes;
        this.updateResourceAllocationPane('refresh resource policy');
      })
      .catch((err) => {
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
    const shouldNeo = !globalThis.backendaioptions.get(
      'classic_session_launcher',
      false,
    );

    if (this.allowNEOSessionLauncher === true && shouldNeo) {
      const url =
        '/session/start?formValues=' +
        encodeURIComponent(
          JSON.stringify({
            resourceGroup: this.resourceBroker.scaling_group,
          }),
        );
      store.dispatch(navigate(decodeURIComponent(url), {}));

      document.dispatchEvent(
        new CustomEvent('react-navigate', {
          detail: url,
        }),
      );
      return;
    }

    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false ||
      this.resourceBroker.image_updating === true
    ) {
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
      const ownershipPanel = this.shadowRoot?.querySelector(
        'lablup-expansion[name="ownership"]',
      ) as LablupExpansion;
      if (globalThis.backendaiclient.is_admin) {
        ownershipPanel.style.display = 'block';
      } else {
        ownershipPanel.style.display = 'none';
      }
      this._updateSelectedScalingGroup();
      /* To reflect current resource policy */
      await this._refreshResourcePolicy();
      this.requestUpdate();
      this.newSessionDialog.show();
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
    const vfoldersCount = this._nonAutoMountedFolderGrid?.selectedItems?.map(
      (item) => item.name,
    ).length;
    const modelFoldersCount = this._modelFolderGrid?.selectedItems?.map(
      (item) => item.name,
    ).length;
    // check whether the progress is in the last stage
    if (this.currentIndex == this.progressLength) {
      if (
        this.mode === 'inference' ||
        (vfoldersCount !== undefined && vfoldersCount > 0) ||
        (modelFoldersCount !== undefined && modelFoldersCount > 0)
      ) {
        return this._newSession();
      } else {
        this.launchConfirmationDialog.show();
      }
    } else {
      this._moveToLastProgress();
    }
  }

  /**
   * Make a new session.
   * */
  _newSession() {
    this.launchConfirmationDialog.hide();
    let kernel: string;
    let version: string;
    let architecture: string | undefined;
    if (this.manualImageName && this.manualImageName.value) {
      const nameFragments = this.manualImageName.value.split(':');
      version = nameFragments.splice(-1, 1)[0];
      kernel = nameFragments.join(':');
      // extract architecture if exists
      architecture = ['x86_64', 'aarch64'].includes(
        this.manualImageName.value.split('@').pop(),
      )
        ? this.manualImageName.value.split('@').pop()
        : undefined;
      if (architecture) {
        kernel = this.manualImageName.value.split('@')[0];
      }
      // TODO: Add support for selecting image architecture when starting kernel with manual image name
    } else {
      // When the "Environment" dropdown is disabled after typing the image name manually,
      // `selecteditem.id` is `null` and raises "id" exception when trying to launch the session.
      // That's why we need if-else block here.
      const selectedItem = this.environment.selected;
      kernel = selectedItem?.id ?? '';
      version = this.version_selector.selected?.value ?? '';
      architecture =
        this.version_selector.selected?.getAttribute('architecture') ??
        undefined;
    }
    this.sessionType = (
      this.shadowRoot?.querySelector('#session-type') as Select
    ).value;
    let sessionName = (
      this.shadowRoot?.querySelector('#session-name') as TextField
    ).value;
    const isSessionNameValid = (
      this.shadowRoot?.querySelector('#session-name') as TextField
    ).checkValidity();
    let vfolder = this.selectedVfolders; // Will be overwritten if customFolderMapping is given on inference mode.
    this.cpu_request = parseInt(this.cpuResourceSlider.value);
    this.mem_request = parseFloat(this.memoryResourceSlider.value);
    this.shmem_request = parseFloat(this.sharedMemoryResourceSlider.value);
    this.gpu_request = parseFloat(this.npuResourceSlider.value);
    this.session_request = parseInt(this.sessionResourceSlider.value);
    this.num_sessions = this.session_request;
    if (this.sessions_list.includes(sessionName)) {
      this.notification.text = _text('session.launcher.DuplicatedSessionName');
      this.notification.show();
      return;
    }
    if (!isSessionNameValid) {
      this.notification.text = _text(
        'session.launcher.SessionNameAllowCondition',
      );
      this.notification.show();
      return;
    }

    if (kernel === '' || version === '' || version === 'Not Selected') {
      this.notification.text = _text('session.launcher.MustSpecifyVersion');
      this.notification.show();
      return;
    }
    this.scaling_group = this.scalingGroups.value;
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
    const ownerEnabled = this.shadowRoot?.querySelector(
      '#owner-enabled',
    ) as Checkbox;
    if (ownerEnabled && ownerEnabled.checked) {
      config['group_name'] = this.ownerGroupSelect.value;
      config['domain'] = this.ownerDomain;
      config['scaling_group'] = this.ownerScalingGroupSelect.value;
      config['owner_access_key'] = this.ownerAccesskeySelect.value;
      if (
        !config['group_name'] ||
        !config['domain'] ||
        !config['scaling_group'] ||
        !config['owner_access_key']
      ) {
        this.notification.text = _text(
          'session.launcher.NotEnoughOwnershipInfo',
        );
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
      case 'ipu.device':
        config['ipu.device'] = this.gpu_request;
        break;
      case 'atom.device':
        config['atom.device'] = this.gpu_request;
        break;
      case 'atom-plus.device':
        config['atom-plus.device'] = this.gpu_request;
        break;
      case 'gaudi2.device':
        config['gaudi2.device'] = this.gpu_request;
        break;
      case 'warboy.device':
        config['warboy.device'] = this.gpu_request;
        break;
      case 'rngd.device':
        config['rngd.device'] = this.gpu_request;
        break;
      case 'hyperaccel-lpu.device':
        config['hyperaccel-lpu.device'] = this.gpu_request;
        break;
      default:
        // Fallback to current gpu mode if there is a gpu request, but without gpu type.
        if (this.gpu_request > 0 && this.gpu_mode) {
          config[this.gpu_mode] = this.gpu_request;
        }
    }
    if (String(this.memoryResourceSlider.value) === 'Infinity') {
      config['mem'] = String(this.memoryResourceSlider.value);
    } else {
      config['mem'] = String(this.mem_request) + 'g';
    }
    if (this.shmem_request > this.mem_request) {
      // To prevent overflow of shared memory
      this.shmem_request = this.mem_request;
      this.notification.text = _text(
        'session.launcher.SharedMemorySettingIsReduced',
      );
      this.notification.show();
    }
    if (this.mem_request > 4 && this.shmem_request < 1) {
      // Automatically increase shared memory to 1GiB
      this.shmem_request = 1;
    }
    config['shmem'] = String(this.shmem_request) + 'g';

    if (sessionName.length == 0) {
      // No name is given
      sessionName = this.generateSessionId();
    }

    let kernelName: string;
    if (
      (this._debug && this.manualImageName.value !== '') ||
      (this.manualImageName && this.manualImageName.value !== '')
    ) {
      kernelName = architecture ? kernel : this.manualImageName.value;
    } else {
      kernelName = this._generateKernelIndex(kernel, version);
    }

    let folderMapping = {};
    if (this.mode === 'inference') {
      // Override model folder setup
      // Inference image should have its own mount point for automatic container start.
      if (
        kernelName in this.resourceBroker.imageRuntimeConfig &&
        'model-path' in this.resourceBroker.imageRuntimeConfig[kernelName]
      ) {
        vfolder = Object.keys(this.customFolderMapping);
        folderMapping[vfolder] =
          this.resourceBroker.imageRuntimeConfig[kernelName]['model-path'];
      } else {
        this.notification.text = _text(
          'session.launcher.ImageDoesNotProvideModelPath',
        );
        this.notification.show();
        return;
      }
    } else {
      folderMapping = this.folderMapping;
    }
    if (vfolder.length !== 0) {
      config['mounts'] = vfolder;
      if (Object.keys(folderMapping).length !== 0) {
        config['mount_map'] = {};
        for (const f in folderMapping) {
          if ({}.hasOwnProperty.call(folderMapping, f)) {
            if (!folderMapping[f].startsWith('/')) {
              config['mount_map'][f] = '/home/work/' + folderMapping[f];
            } else {
              config['mount_map'][f] = folderMapping[f];
            }
          }
        }
      }
    }
    if (this.mode === 'import' && this.importScript !== '') {
      config['bootstrap_script'] = this.importScript;
    }
    if (this.sessionType === 'batch') {
      config['startupCommand'] = this.commandEditor.getValue();

      if (this.scheduledTime) {
        config['startsAt'] = this.scheduledTime;
      }
    }
    if (this.environ_values && Object.keys(this.environ_values).length !== 0) {
      config['env'] = this.environ_values;
    }
    if (this.preOpenPorts.length > 0) {
      config['preopen_ports'] = [
        ...new Set(this.preOpenPorts.map((port) => Number(port))),
      ];
    }
    if (this.openMPSwitch.selected === false) {
      const openMPCoreValue = (
        this.shadowRoot?.querySelector('#OpenMPCore') as TextField
      ).value;
      const openBLASCoreValue = (
        this.shadowRoot?.querySelector('#OpenBLASCore') as TextField
      ).value;
      config['env'] = config['env'] ?? {}; // need to initialize it first
      config['env']['OMP_NUM_THREADS'] = openMPCoreValue
        ? Math.max(0, parseInt(openMPCoreValue)).toString()
        : '1';
      config['env']['OPENBLAS_NUM_THREADS'] = openBLASCoreValue
        ? Math.max(0, parseInt(openBLASCoreValue)).toString()
        : '1';
    }

    this.launchButton.disabled = true;
    this.launchButtonMessageTextContent = _text('session.Preparing');
    this.notification.text = _text('session.PreparingSession');
    this.notification.show();

    const sessions: any[] = [];
    const randStr = this._getRandomString();
    if (this.num_sessions > 1) {
      for (let i = 1; i <= this.num_sessions; i++) {
        const add_session = {
          kernelName: kernelName,
          sessionName: `${sessionName}-${randStr}-${i}`,
          architecture: architecture,
          config,
        };
        sessions.push(add_session);
      }
    } else {
      sessions.push({
        kernelName: kernelName,
        sessionName: sessionName,
        architecture: architecture,
        config,
      });
    }
    const createSessionQueue = sessions.map((item) => {
      return this.tasker.add(
        _text('general.Session') + ': ' + item.sessionName,
        this._createKernel(
          item.kernelName,
          item.sessionName,
          item.architecture,
          item.config,
        ),
        '',
        'session',
        '',
        _text('eduapi.CreatingComputeSession'),
        _text('eduapi.ComputeSessionPrepared'),
        true,
      );
    });
    Promise.all(createSessionQueue)
      .then((res: any) => {
        this.newSessionDialog.hide();
        this.launchButton.disabled = false;
        this.launchButtonMessageTextContent = _text(
          'session.launcher.ConfirmAndLaunch',
        );
        this._resetProgress();
        setTimeout(() => {
          this.metadata_updating = true;
          this.aggregateResource('session-creation');
          this.metadata_updating = false;
        }, 1500);
        const event = new CustomEvent('backend-ai-session-list-refreshed', {
          detail: 'running',
        });
        document.dispatchEvent(event);
        // only open appLauncher when session type is 'interactive' or 'inference'.
        if (res.length === 1 && this.sessionType !== 'batch') {
          res[0]?.taskobj
            .then((res) => {
              let appOptions;
              if ('kernelId' in res) {
                // API v4
                appOptions = {
                  'session-name': res.kernelId,
                  'access-key': '',
                  mode: this.mode,
                };
              } else {
                // API >= v5
                appOptions = {
                  'session-uuid': res.sessionId,
                  'session-name': res.sessionName,
                  'access-key': '',
                  mode: this.mode,
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
              if (this.mode === 'inference') {
                appOptions['runtime'] = appOptions['app-services'].find(
                  (element) => !['ttyd', 'sshd'].includes(element),
                );
              }
              // only launch app when it has valid service ports
              if (service_info.length > 0) {
                globalThis.appLauncher.showLauncher(appOptions);
              }
            })
            .catch((err) => {
              // remove redundant error message
            });
        }
        // initialize vfolder
        this._updateSelectedFolder(false);
        this._initializeFolderMapping();
      })
      .catch((err) => {
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
        const event = new CustomEvent('backend-ai-session-list-refreshed', {
          detail: 'running',
        });
        document.dispatchEvent(event);
        this.launchButton.disabled = false;
        this.launchButtonMessageTextContent = _text(
          'session.launcher.ConfirmAndLaunch',
        );
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

  _createKernel(
    kernelName: string,
    sessionName: string,
    architecture: string,
    config,
  ) {
    const task = globalThis.backendaiclient.createIfNotExists(
      kernelName,
      sessionName,
      config,
      30000,
      architecture,
    );
    task
      .then((res) => {
        // When session is already created with the same name, the status code
        // is 200, but the response body has 'created' field as false. For better
        // user experience, we show the notification message.
        if (!res?.created) {
          this.notification.text = _text(
            'session.launcher.SessionAlreadyExists',
          );
          this.notification.show();
        }
      })
      .catch((err) => {
        // console.log(err);
        if (err && err.message) {
          if ('statusCode' in err && err.statusCode === 408) {
            this.notification.text = _text(
              'session.launcher.SessionStillPreparing',
            );
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
    this.newSessionDialog.hide();
  }

  _aliasName(value) {
    const alias = this.resourceBroker.imageTagAlias;
    const tagReplace = this.resourceBroker.imageTagReplace;
    for (const [key, replaceString] of Object.entries(tagReplace)) {
      const pattern = new RegExp(key);
      if (pattern.test(value)) {
        return value.replace(pattern, replaceString);
      }
    }
    if (value in alias) {
      return alias[value];
    } else {
      return value;
    }
  }

  // TODO refactor method to return consistent type
  _updateVersions(kernel): any {
    if (kernel in this.resourceBroker.supports) {
      this.version_selector.disabled = true;
      const versions: { version: string; architecture: string }[] = [];
      for (const version of this.resourceBroker.supports[kernel]) {
        for (const architecture of this.resourceBroker.imageArchitectures[
          kernel + ':' + version
        ]) {
          versions.push({ version, architecture });
        }
      }
      versions.sort((a, b) => (a.version > b.version ? 1 : -1));
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
        this.version_selector.value = this.versions[0].version;
        // TODO define extended type for custom property
        (this.version_selector as any).architecture =
          this.versions[0].architecture;
        // this.version_selector.selectedText = this.version_selector.value;
        // TODO define extended type for custom property
        this._updateVersionSelectorText(
          this.version_selector.value,
          (this.version_selector as any).architecture,
        );
        this.version_selector.disabled = false;
        this.environ_values = {};
        this.updateResourceAllocationPane('update versions');
      });
    }
  }

  /**
   * Update version_selector's selectedText.
   *
   * @param {any} version
   * @param {any} architecture
   * */
  _updateVersionSelectorText(version, architecture) {
    const res = this._getVersionInfo(version, architecture);
    const resultArray: string[] = [];
    res.forEach((item) => {
      if (item.tag !== '' && item.tag !== null) {
        resultArray.push(item.tag);
      }
    });
    // TODO remove protected field access
    (this.version_selector as any).selectedText = resultArray.join(' / ');
  }

  /**
   * Randomly generate session ID
   *
   * @return {string} Generated session ID
   * */
  generateSessionId() {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text + '-session';
  }

  async _updateVirtualFolderList() {
    // Set to a list of vfolders that can only be mounted if the status is 'ready'
    return this.resourceBroker.updateVirtualFolderList().then(() => {
      this.vfolders = this.resourceBroker.vfolders.filter(
        (vf) => vf.status === 'ready',
      );
    });
  }

  /**
   * Aggregate used resources from manager and save them.
   *
   * @param {string} from - set the value for debugging purpose
   * */
  async _aggregateResourceUse(from = '') {
    return this.resourceBroker
      ._aggregateCurrentResource(from)
      .then(async (res) => {
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
        this.resource_templates_filtered =
          this.resourceBroker.resource_templates_filtered;
        this.total_slot = this.resourceBroker.total_slot;
        this.total_resource_group_slot =
          this.resourceBroker.total_resource_group_slot;
        this.total_project_slot = this.resourceBroker.total_project_slot;
        this.used_slot = this.resourceBroker.used_slot;
        this.used_resource_group_slot =
          this.resourceBroker.used_resource_group_slot;
        this.used_project_slot = this.resourceBroker.used_project_slot;
        this.used_project_slot_percent =
          this.resourceBroker.used_project_slot_percent;
        this.concurrency_limit =
          this.resourceBroker.concurrency_limit &&
          this.resourceBroker.concurrency_limit > 1
            ? this.resourceBroker.concurrency_limit
            : 1;
        this.available_slot = this.resourceBroker.available_slot;
        this.used_slot_percent = this.resourceBroker.used_slot_percent;
        this.used_resource_group_slot_percent =
          this.resourceBroker.used_resource_group_slot_percent;
        await this.updateComplete;
        return Promise.resolve(true);
      })
      .catch((err) => {
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
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this._aggregateResourceUse(from);
        },
        true,
      );
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
        return this.updateResourceAllocationPane(
          'after refresh resource policy',
        );
      });
    }
    const selectedItem = this.environment.selected;
    const selectedVersionItem = this.version_selector.selected;
    // Pulldown is not ready yet.
    if (selectedVersionItem === null) {
      this.metric_updating = false;
      return;
    }
    const selectedVersionValue = selectedVersionItem.value;
    const selectedVersionArchitecture =
      selectedVersionItem.getAttribute('architecture');
    this._updateVersionSelectorText(
      selectedVersionValue,
      selectedVersionArchitecture,
    );
    // Environment is not selected yet.
    if (
      typeof selectedItem === 'undefined' ||
      selectedItem === null ||
      selectedItem.getAttribute('disabled')
    ) {
      this.metric_updating = false;
      return;
    }
    // console.log('update metric from', from);
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this.updateResourceAllocationPane(from);
        },
        true,
      );
    } else {
      this.metric_updating = true;
      await this._aggregateResourceUse('update-metric');
      await this._updateVirtualFolderList();
      this.autoMountedVfolders = this.vfolders.filter((item) =>
        item.name.startsWith('.'),
      );
      if (this.enableInferenceWorkload) {
        this.modelVfolders = this.vfolders.filter(
          (item) => !item.name.startsWith('.') && item.usage_mode === 'model',
        );
        this.nonAutoMountedVfolders = this.vfolders.filter(
          (item) => !item.name.startsWith('.') && item.usage_mode === 'general',
        );
      } else {
        this.nonAutoMountedVfolders = this.vfolders.filter(
          (item) => !item.name.startsWith('.'),
        );
      }
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
      this.cpuResourceSlider.disabled = false;
      this.memoryResourceSlider.disabled = false;
      this.npuResourceSlider.disabled = false;
      if (globalThis.backendaiclient.supports('multi-container')) {
        // initialize cluster_size
        this.cluster_size = 1;
        this.clusterSizeSlider.value = this.cluster_size;
      }
      this.sessionResourceSlider.disabled = false;
      this.launchButton.disabled = false;
      this.launchButtonMessageTextContent = _text(
        'session.launcher.ConfirmAndLaunch',
      );
      let disableLaunch = false;
      let shmem_metric: any = {
        min: 0.0625,
        max: 2,
        preferred: 0.0625,
      };
      this.npu_device_metric = {
        min: 0,
        max: 0,
      };
      currentResource.forEach((item) => {
        if (item.key === 'cpu') {
          const cpu_metric = { ...item };
          cpu_metric.min = parseInt(cpu_metric.min);

          [
            'cpu',
            'mem',
            'cuda_device',
            'cuda_shares',
            'rocm_device',
            'tpu_device',
            'ipu_device',
            'atom_device',
            'atom_plus_device',
            'gaudi2_device',
            'warboy_device',
            'rngd.device',
            'hyperaccel_lpu_device',
          ].forEach((slot) => {
            if (slot in this.total_resource_group_slot) {
              available_slot[slot] = this.total_resource_group_slot[slot];
            }
          });

          if ('cpu' in this.userResourceLimit) {
            if (
              parseInt(cpu_metric.max) !== 0 &&
              cpu_metric.max !== 'Infinity' &&
              !isNaN(cpu_metric.max) &&
              cpu_metric.max !== null
            ) {
              cpu_metric.max = Math.min(
                parseInt(cpu_metric.max),
                parseInt(this.userResourceLimit.cpu),
                available_slot['cpu'],
                this.max_cpu_core_per_session,
              );
            } else {
              cpu_metric.max = Math.min(
                parseInt(this.userResourceLimit.cpu),
                available_slot['cpu'],
                this.max_cpu_core_per_session,
              );
            }
          } else {
            if (
              parseInt(cpu_metric.max) !== 0 &&
              cpu_metric.max !== 'Infinity' &&
              !isNaN(cpu_metric.max) &&
              cpu_metric.max !== null
            ) {
              cpu_metric.max = Math.min(
                parseInt(cpu_metric.max),
                available_slot['cpu'],
                this.max_cpu_core_per_session,
              );
            } else {
              cpu_metric.max = Math.min(
                this.available_slot['cpu'],
                this.max_cpu_core_per_session,
              );
            }
          }
          if (cpu_metric.min >= cpu_metric.max) {
            if (cpu_metric.min > cpu_metric.max) {
              cpu_metric.min = cpu_metric.max;
              disableLaunch = true;
            }
            this.cpuResourceSlider.disabled = true;
          }
          this.cpu_metric = cpu_metric;
          // monkeypatch for cluster_metric max size
          if (this.cluster_support && this.cluster_mode === 'single-node') {
            this.cluster_metric.max = Math.min(
              cpu_metric.max,
              this.max_containers_per_session,
            );
            if (this.cluster_metric.min > this.cluster_metric.max) {
              this.cluster_metric.min = this.cluster_metric.max;
            } else {
              this.cluster_metric.min = cpu_metric.min;
            }
          }
        }
        if (item.key === 'cuda.device' && this.gpu_mode == 'cuda.device') {
          const cuda_device_metric = { ...item };
          cuda_device_metric.min = parseInt(cuda_device_metric.min);
          if ('cuda.device' in this.userResourceLimit) {
            if (
              parseInt(cuda_device_metric.max) !== 0 &&
              cuda_device_metric.max !== 'Infinity' &&
              !isNaN(cuda_device_metric.max) &&
              cuda_device_metric.max != null
            ) {
              cuda_device_metric.max = Math.min(
                parseInt(cuda_device_metric.max),
                parseInt(this.userResourceLimit['cuda.device']),
                available_slot['cuda_device'],
                this.max_cuda_device_per_container,
              );
            } else {
              cuda_device_metric.max = Math.min(
                parseInt(this.userResourceLimit['cuda.device']),
                parseInt(available_slot['cuda_device']),
                this.max_cuda_device_per_container,
              );
            }
          } else {
            if (
              parseInt(cuda_device_metric.max) !== 0 &&
              cuda_device_metric.max !== 'Infinity' &&
              !isNaN(cuda_device_metric.max) &&
              cuda_device_metric.max != null
            ) {
              cuda_device_metric.max = Math.min(
                parseInt(cuda_device_metric.max),
                parseInt(available_slot['cuda_device']),
                this.max_cuda_device_per_container,
              );
            } else {
              cuda_device_metric.max = Math.min(
                parseInt(this.available_slot['cuda_device']),
                this.max_cuda_device_per_container,
              );
            }
          }
          if (cuda_device_metric.min >= cuda_device_metric.max) {
            if (cuda_device_metric.min > cuda_device_metric.max) {
              cuda_device_metric.min = cuda_device_metric.max;
              disableLaunch = true;
            }
            this.npuResourceSlider.disabled = true;
          }
          this.npu_device_metric = cuda_device_metric;
          this._NPUDeviceNameOnSlider = 'GPU';
        }
        if (item.key === 'cuda.shares' && this.gpu_mode === 'cuda.shares') {
          const cuda_shares_metric = { ...item };
          cuda_shares_metric.min = parseFloat(cuda_shares_metric.min);
          if ('cuda.shares' in this.userResourceLimit) {
            if (
              parseFloat(cuda_shares_metric.max) !== 0 &&
              cuda_shares_metric.max !== 'Infinity' &&
              !isNaN(cuda_shares_metric.max) &&
              cuda_shares_metric.max != null
            ) {
              cuda_shares_metric.max = Math.min(
                parseFloat(cuda_shares_metric.max),
                parseFloat(this.userResourceLimit['cuda.shares']),
                parseFloat(available_slot['cuda_shares']),
                this.max_cuda_shares_per_container,
              );
            } else {
              cuda_shares_metric.max = Math.min(
                parseFloat(this.userResourceLimit['cuda.shares']),
                parseFloat(available_slot['cuda_shares']),
                this.max_cuda_shares_per_container,
              );
            }
          } else {
            if (
              parseFloat(cuda_shares_metric.max) !== 0 &&
              cuda_shares_metric.max !== 'Infinity' &&
              !isNaN(cuda_shares_metric.max) &&
              cuda_shares_metric.max != null
            ) {
              cuda_shares_metric.max = Math.min(
                parseFloat(cuda_shares_metric.max),
                parseFloat(available_slot['cuda_shares']),
                this.max_cuda_shares_per_container,
              );
            } else {
              cuda_shares_metric.max = Math.min(
                parseFloat(available_slot['cuda_shares']),
                this.max_cuda_shares_per_container,
              );
            }
          }
          if (cuda_shares_metric.min >= cuda_shares_metric.max) {
            if (cuda_shares_metric.min > cuda_shares_metric.max) {
              cuda_shares_metric.min = cuda_shares_metric.max;
              disableLaunch = true;
            }
            this.npuResourceSlider.disabled = true;
          }

          this.cuda_shares_metric = cuda_shares_metric;
          if (cuda_shares_metric.max > 0) {
            this.npu_device_metric = cuda_shares_metric;
          }
          this._NPUDeviceNameOnSlider = 'GPU';
        }
        if (item.key === 'rocm.device' && this.gpu_mode === 'rocm.device') {
          const rocm_device_metric = { ...item };
          rocm_device_metric.min = parseInt(rocm_device_metric.min);
          rocm_device_metric.max = parseInt(rocm_device_metric.max);
          if (rocm_device_metric.min >= rocm_device_metric.max) {
            if (rocm_device_metric.min > rocm_device_metric.max) {
              rocm_device_metric.min = rocm_device_metric.max;
              disableLaunch = true;
            }
            this.npuResourceSlider.disabled = true;
          }
          this.npu_device_metric = rocm_device_metric;
          this._NPUDeviceNameOnSlider = 'GPU';
        }
        if (item.key === 'tpu.device') {
          const tpu_device_metric = { ...item };
          tpu_device_metric.min = parseInt(tpu_device_metric.min);
          if ('tpu.device' in this.userResourceLimit) {
            if (
              parseInt(tpu_device_metric.max) !== 0 &&
              tpu_device_metric.max !== 'Infinity' &&
              !isNaN(tpu_device_metric.max) &&
              tpu_device_metric.max != null
            ) {
              tpu_device_metric.max = Math.min(
                parseInt(tpu_device_metric.max),
                parseInt(this.userResourceLimit['tpu.device']),
                available_slot['tpu_device'],
                this.max_tpu_device_per_container,
              );
            } else {
              tpu_device_metric.max = Math.min(
                parseInt(this.userResourceLimit['tpu.device']),
                parseInt(available_slot['tpu_device']),
                this.max_tpu_device_per_container,
              );
            }
          } else {
            if (
              parseInt(tpu_device_metric.max) !== 0 &&
              tpu_device_metric.max !== 'Infinity' &&
              !isNaN(tpu_device_metric.max) &&
              tpu_device_metric.max != null
            ) {
              tpu_device_metric.max = Math.min(
                parseInt(tpu_device_metric.max),
                parseInt(available_slot['tpu_device']),
                this.max_tpu_device_per_container,
              );
            } else {
              tpu_device_metric.max = Math.min(
                parseInt(this.available_slot['tpu_device']),
                this.max_tpu_device_per_container,
              );
            }
          }
          if (tpu_device_metric.min >= tpu_device_metric.max) {
            if (tpu_device_metric.min > tpu_device_metric.max) {
              tpu_device_metric.min = tpu_device_metric.max;
              disableLaunch = true;
            }
            this.npuResourceSlider.disabled = true;
          }
          this.npu_device_metric = tpu_device_metric;
          this._NPUDeviceNameOnSlider = 'TPU';
        }
        if (item.key === 'ipu.device') {
          const ipu_device_metric = { ...item };
          ipu_device_metric.min = parseInt(ipu_device_metric.min);
          if ('ipu.device' in this.userResourceLimit) {
            if (
              parseInt(ipu_device_metric.max) !== 0 &&
              ipu_device_metric.max !== 'Infinity' &&
              !isNaN(ipu_device_metric.max) &&
              ipu_device_metric.max != null
            ) {
              ipu_device_metric.max = Math.min(
                parseInt(ipu_device_metric.max),
                parseInt(this.userResourceLimit['ipu.device']),
                available_slot['ipu_device'],
                this.max_ipu_device_per_container,
              );
            } else {
              ipu_device_metric.max = Math.min(
                parseInt(this.userResourceLimit['ipu.device']),
                parseInt(available_slot['ipu_device']),
                this.max_ipu_device_per_container,
              );
            }
          } else {
            if (
              parseInt(ipu_device_metric.max) !== 0 &&
              ipu_device_metric.max !== 'Infinity' &&
              !isNaN(ipu_device_metric.max) &&
              ipu_device_metric.max != null
            ) {
              ipu_device_metric.max = Math.min(
                parseInt(ipu_device_metric.max),
                parseInt(available_slot['ipu_device']),
                this.max_ipu_device_per_container,
              );
            } else {
              ipu_device_metric.max = Math.min(
                parseInt(this.available_slot['ipu_device']),
                this.max_ipu_device_per_container,
              );
            }
          }
          if (ipu_device_metric.min >= ipu_device_metric.max) {
            if (ipu_device_metric.min > ipu_device_metric.max) {
              ipu_device_metric.min = ipu_device_metric.max;
              disableLaunch = true;
            }
            this.npuResourceSlider.disabled = true;
          }
          this.npu_device_metric = ipu_device_metric;
          this._NPUDeviceNameOnSlider = 'IPU';
        }
        if (item.key === 'atom.device') {
          const atom_device_metric = { ...item };
          atom_device_metric.min = parseInt(atom_device_metric.min);
          if ('atom.device' in this.userResourceLimit) {
            if (
              parseInt(atom_device_metric.max) !== 0 &&
              atom_device_metric.max !== 'Infinity' &&
              !isNaN(atom_device_metric.max) &&
              atom_device_metric.max != null
            ) {
              atom_device_metric.max = Math.min(
                parseInt(atom_device_metric.max),
                parseInt(this.userResourceLimit['atom.device']),
                available_slot['atom_device'],
                this.max_atom_device_per_container,
              );
            } else {
              atom_device_metric.max = Math.min(
                parseInt(this.userResourceLimit['atom.device']),
                parseInt(available_slot['atom_device']),
                this.max_atom_device_per_container,
              );
            }
          } else {
            if (
              parseInt(atom_device_metric.max) !== 0 &&
              atom_device_metric.max !== 'Infinity' &&
              !isNaN(atom_device_metric.max) &&
              atom_device_metric.max != null
            ) {
              atom_device_metric.max = Math.min(
                parseInt(atom_device_metric.max),
                parseInt(available_slot['atom_device']),
                this.max_atom_device_per_container,
              );
            } else {
              atom_device_metric.max = Math.min(
                parseInt(this.available_slot['atom_device']),
                this.max_atom_device_per_container,
              );
            }
          }
          if (atom_device_metric.min >= atom_device_metric.max) {
            if (atom_device_metric.min > atom_device_metric.max) {
              atom_device_metric.min = atom_device_metric.max;
              disableLaunch = true;
            }
            this.npuResourceSlider.disabled = true;
          }
          this._NPUDeviceNameOnSlider = 'ATOM';
          this.npu_device_metric = atom_device_metric;
        }
        if (item.key === 'atom-plus.device') {
          const atom_plus_device_metric = { ...item };
          atom_plus_device_metric.min = parseInt(atom_plus_device_metric.min);
          if ('atom-plus.device' in this.userResourceLimit) {
            if (
              parseInt(atom_plus_device_metric.max) !== 0 &&
              atom_plus_device_metric.max !== 'Infinity' &&
              !isNaN(atom_plus_device_metric.max) &&
              atom_plus_device_metric.max != null
            ) {
              atom_plus_device_metric.max = Math.min(
                parseInt(atom_plus_device_metric.max),
                parseInt(this.userResourceLimit['atom-plus.device']),
                available_slot['atom_plus_device'],
                this.max_atom_plus_device_per_container,
              );
            } else {
              atom_plus_device_metric.max = Math.min(
                parseInt(this.userResourceLimit['atom-plus.device']),
                parseInt(available_slot['atom_plus_device']),
                this.max_atom_plus_device_per_container,
              );
            }
          } else {
            if (
              parseInt(atom_plus_device_metric.max) !== 0 &&
              atom_plus_device_metric.max !== 'Infinity' &&
              !isNaN(atom_plus_device_metric.max) &&
              atom_plus_device_metric.max != null
            ) {
              atom_plus_device_metric.max = Math.min(
                parseInt(atom_plus_device_metric.max),
                parseInt(available_slot['atom_plus_device']),
                this.max_atom_plus_device_per_container,
              );
            } else {
              atom_plus_device_metric.max = Math.min(
                parseInt(this.available_slot['atom_plus_device']),
                this.max_atom_plus_device_per_container,
              );
            }
          }
          if (atom_plus_device_metric.min >= atom_plus_device_metric.max) {
            if (atom_plus_device_metric.min > atom_plus_device_metric.max) {
              atom_plus_device_metric.min = atom_plus_device_metric.max;
              disableLaunch = true;
            }
            this.npuResourceSlider.disabled = true;
          }
          this._NPUDeviceNameOnSlider = 'ATOM+';
          this.npu_device_metric = atom_plus_device_metric;
        }
        if (item.key === 'gaudi2.device') {
          const gaudi2_device_metric = { ...item };
          gaudi2_device_metric.min = parseInt(gaudi2_device_metric.min);
          if ('gaudi2.device' in this.userResourceLimit) {
            if (
              parseInt(gaudi2_device_metric.max) !== 0 &&
              gaudi2_device_metric.max !== 'Infinity' &&
              !isNaN(gaudi2_device_metric.max) &&
              gaudi2_device_metric.max != null
            ) {
              gaudi2_device_metric.max = Math.min(
                parseInt(gaudi2_device_metric.max),
                parseInt(this.userResourceLimit['gaudi2.device']),
                available_slot['gaudi2_device'],
                this.max_gaudi2_device_per_container,
              );
            } else {
              gaudi2_device_metric.max = Math.min(
                parseInt(this.userResourceLimit['gaudi2.device']),
                parseInt(available_slot['gaudi2_device']),
                this.max_gaudi2_device_per_container,
              );
            }
          } else {
            if (
              parseInt(gaudi2_device_metric.max) !== 0 &&
              gaudi2_device_metric.max !== 'Infinity' &&
              !isNaN(gaudi2_device_metric.max) &&
              gaudi2_device_metric.max != null
            ) {
              gaudi2_device_metric.max = Math.min(
                parseInt(gaudi2_device_metric.max),
                parseInt(available_slot['gaudi2_device']),
                this.max_gaudi2_device_per_container,
              );
            } else {
              gaudi2_device_metric.max = Math.min(
                parseInt(this.available_slot['gaudi2_device']),
                this.max_gaudi2_device_per_container,
              );
            }
          }
          if (gaudi2_device_metric.min >= gaudi2_device_metric.max) {
            if (gaudi2_device_metric.min > gaudi2_device_metric.max) {
              gaudi2_device_metric.min = gaudi2_device_metric.max;
              disableLaunch = true;
            }
            this.npuResourceSlider.disabled = true;
          }
          this._NPUDeviceNameOnSlider = 'Gaudi 2';
          this.npu_device_metric = gaudi2_device_metric;
        }
        if (item.key === 'warboy.device') {
          const warboy_device_metric = { ...item };
          warboy_device_metric.min = parseInt(warboy_device_metric.min);
          if ('warboy.device' in this.userResourceLimit) {
            if (
              parseInt(warboy_device_metric.max) !== 0 &&
              warboy_device_metric.max !== 'Infinity' &&
              !isNaN(warboy_device_metric.max) &&
              warboy_device_metric.max != null
            ) {
              warboy_device_metric.max = Math.min(
                parseInt(warboy_device_metric.max),
                parseInt(this.userResourceLimit['warboy.device']),
                available_slot['cuda_device'],
                this.max_cuda_device_per_container,
              );
            } else {
              warboy_device_metric.max = Math.min(
                parseInt(this.userResourceLimit['warboy.device']),
                parseInt(available_slot['cuda_device']),
                this.max_cuda_device_per_container,
              );
            }
          } else {
            if (
              parseInt(warboy_device_metric.max) !== 0 &&
              warboy_device_metric.max !== 'Infinity' &&
              !isNaN(warboy_device_metric.max) &&
              warboy_device_metric.max != null
            ) {
              warboy_device_metric.max = Math.min(
                parseInt(warboy_device_metric.max),
                parseInt(available_slot['warboy_device']),
                this.max_warboy_device_per_container,
              );
            } else {
              warboy_device_metric.max = Math.min(
                parseInt(this.available_slot['warboy_device']),
                this.max_warboy_device_per_container,
              );
            }
          }
          if (warboy_device_metric.min >= warboy_device_metric.max) {
            if (warboy_device_metric.min > warboy_device_metric.max) {
              warboy_device_metric.min = warboy_device_metric.max;
              disableLaunch = true;
            }
            this.npuResourceSlider.disabled = true;
          }
          this._NPUDeviceNameOnSlider = 'Warboy';
          this.npu_device_metric = warboy_device_metric;
        }
        if (item.key === 'rngd.device') {
          const rngd_device_metric = { ...item };
          rngd_device_metric.min = parseInt(rngd_device_metric.min);
          if ('rngd.device' in this.userResourceLimit) {
            if (
              parseInt(rngd_device_metric.max) !== 0 &&
              rngd_device_metric.max !== 'Infinity' &&
              !isNaN(rngd_device_metric.max) &&
              rngd_device_metric.max != null
            ) {
              rngd_device_metric.max = Math.min(
                parseInt(rngd_device_metric.max),
                parseInt(this.userResourceLimit['rngd.device']),
                available_slot['cuda_device'],
                this.max_cuda_device_per_container,
              );
            } else {
              rngd_device_metric.max = Math.min(
                parseInt(this.userResourceLimit['rngd.device']),
                parseInt(available_slot['cuda_device']),
                this.max_cuda_device_per_container,
              );
            }
          } else {
            if (
              parseInt(rngd_device_metric.max) !== 0 &&
              rngd_device_metric.max !== 'Infinity' &&
              !isNaN(rngd_device_metric.max) &&
              rngd_device_metric.max != null
            ) {
              rngd_device_metric.max = Math.min(
                parseInt(rngd_device_metric.max),
                parseInt(available_slot['rngd_device']),
                this.max_rngd_device_per_container,
              );
            } else {
              rngd_device_metric.max = Math.min(
                parseInt(this.available_slot['rngd_device']),
                this.max_rngd_device_per_container,
              );
            }
          }
          if (rngd_device_metric.min >= rngd_device_metric.max) {
            if (rngd_device_metric.min > rngd_device_metric.max) {
              rngd_device_metric.min = rngd_device_metric.max;
              disableLaunch = true;
            }
            this.npuResourceSlider.disabled = true;
          }
          this._NPUDeviceNameOnSlider = 'RNGD';
          this.npu_device_metric = rngd_device_metric;
        }
        if (item.key === 'hyperaccel-lpu.device') {
          const hyperaccel_lpu_device_metric = { ...item };
          hyperaccel_lpu_device_metric.min = parseInt(
            hyperaccel_lpu_device_metric.min,
          );
          if ('hyperaccel-lpu.device' in this.userResourceLimit) {
            if (
              parseInt(hyperaccel_lpu_device_metric.max) !== 0 &&
              hyperaccel_lpu_device_metric.max !== 'Infinity' &&
              !isNaN(hyperaccel_lpu_device_metric.max) &&
              hyperaccel_lpu_device_metric.max != null
            ) {
              hyperaccel_lpu_device_metric.max = Math.min(
                parseInt(hyperaccel_lpu_device_metric.max),
                parseInt(this.userResourceLimit['hyperaccel-lpu.device']),
                available_slot['hyperaccel_lpu_device'],
                this.max_hyperaccel_lpu_device_per_container,
              );
            } else {
              hyperaccel_lpu_device_metric.max = Math.min(
                parseInt(this.userResourceLimit['hyperaccel-lpu.device']),
                parseInt(available_slot['hyperaccel_lpu_device']),
                this.max_hyperaccel_lpu_device_per_container,
              );
            }
          } else {
            if (
              parseInt(hyperaccel_lpu_device_metric.max) !== 0 &&
              hyperaccel_lpu_device_metric.max !== 'Infinity' &&
              !isNaN(hyperaccel_lpu_device_metric.max) &&
              hyperaccel_lpu_device_metric.max != null
            ) {
              hyperaccel_lpu_device_metric.max = Math.min(
                parseInt(hyperaccel_lpu_device_metric.max),
                parseInt(available_slot['hyperaccel_lpu_device']),
                this.max_hyperaccel_lpu_device_per_container,
              );
            } else {
              hyperaccel_lpu_device_metric.max = Math.min(
                parseInt(this.available_slot['hyperaccel_lpu_device']),
                this.max_hyperaccel_lpu_device_per_container,
              );
            }
          }
          if (
            hyperaccel_lpu_device_metric.min >= hyperaccel_lpu_device_metric.max
          ) {
            if (
              hyperaccel_lpu_device_metric.min >
              hyperaccel_lpu_device_metric.max
            ) {
              hyperaccel_lpu_device_metric.min =
                hyperaccel_lpu_device_metric.max;
              disableLaunch = true;
            }
            this.npuResourceSlider.disabled = true;
          }
          this._NPUDeviceNameOnSlider = 'Hyperaccel LPU';
          this.npu_device_metric = hyperaccel_lpu_device_metric;
        }

        if (item.key === 'mem') {
          const mem_metric = { ...item };
          mem_metric.min = globalThis.backendaiclient.utils.changeBinaryUnit(
            mem_metric.min,
            'g',
          );
          if (mem_metric.min < 0.1) {
            mem_metric.min = 0.1;
          }
          if (!mem_metric.max) {
            mem_metric.max = 0;
          }
          const image_mem_max =
            globalThis.backendaiclient.utils.changeBinaryUnit(
              mem_metric.max,
              'g',
              'g',
            );
          if ('mem' in this.userResourceLimit) {
            const user_mem_max =
              globalThis.backendaiclient.utils.changeBinaryUnit(
                this.userResourceLimit['mem'],
                'g',
              );
            if (
              !isNaN(parseInt(image_mem_max)) &&
              parseInt(image_mem_max) !== 0
            ) {
              mem_metric.max = Math.min(
                parseFloat(image_mem_max),
                parseFloat(user_mem_max),
                available_slot['mem'],
                this.max_mem_per_container,
              );
            } else {
              mem_metric.max = Math.min(
                parseFloat(user_mem_max),
                available_slot['mem'],
                this.max_mem_per_container,
              );
            }
          } else {
            if (
              parseInt(mem_metric.max) !== 0 &&
              mem_metric.max !== 'Infinity' &&
              isNaN(mem_metric.max) !== true
            ) {
              mem_metric.max = Math.min(
                parseFloat(
                  globalThis.backendaiclient.utils.changeBinaryUnit(
                    mem_metric.max,
                    'g',
                    'g',
                  ),
                ),
                available_slot['mem'],
                this.max_mem_per_container,
              );
            } else {
              mem_metric.max = Math.min(
                available_slot['mem'],
                this.max_mem_per_container,
              ); // TODO: set to largest memory size
            }
          }
          if (mem_metric.min >= mem_metric.max) {
            if (mem_metric.min > mem_metric.max) {
              mem_metric.min = mem_metric.max;
              disableLaunch = true;
            }
            this.memoryResourceSlider.disabled = true;
          }
          mem_metric.min = Number(mem_metric.min.toFixed(2));
          mem_metric.max = Number(mem_metric.max.toFixed(2));
          this.mem_metric = mem_metric;
        }
        if (item.key === 'shmem') {
          // Shared memory is preferred value. No min/max is required.
          shmem_metric = { ...item };
          if ('preferred' in shmem_metric) {
            shmem_metric.preferred =
              globalThis.backendaiclient.utils.changeBinaryUnit(
                shmem_metric.preferred,
                'g',
                'g',
              );
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
        this.sharedMemoryResourceSlider.disabled = true;
      }
      shmem_metric.min = Number(shmem_metric.min.toFixed(2));
      shmem_metric.max = Number(shmem_metric.max.toFixed(2));
      this.shmem_metric = shmem_metric;

      // GPU metric
      if (this.npu_device_metric.min == 0 && this.npu_device_metric.max == 0) {
        // GPU is disabled (by image,too).
        this.npuResourceSlider.disabled = true;
        this.npuResourceSlider.value = 0;
        if (this.resource_templates.length > 0) {
          // Remove mismatching templates
          const new_resource_templates: any = [];
          for (let i = 0; i < this.resource_templates.length; i++) {
            if (
              !('cuda_device' in this.resource_templates[i]) &&
              !('cuda_shares' in this.resource_templates[i])
            ) {
              new_resource_templates.push(this.resource_templates[i]);
            } else if (
              (parseFloat(this.resource_templates[i].cuda_device) <= 0.0 &&
                !('cuda_shares' in this.resource_templates[i])) ||
              (parseFloat(this.resource_templates[i].cuda_shares) <= 0.0 &&
                !('cuda_device' in this.resource_templates[i]))
            ) {
              new_resource_templates.push(this.resource_templates[i]);
            } else if (
              parseFloat(this.resource_templates[i].cuda_device) <= 0.0 &&
              parseFloat(this.resource_templates[i].cuda_shares) <= 0.0
            ) {
              new_resource_templates.push(this.resource_templates[i]);
            }
          }
          this.resource_templates_filtered = new_resource_templates;
        } else {
          this.resource_templates_filtered = this.resource_templates;
        }
      } else {
        this.npuResourceSlider.disabled = false;
        this.npuResourceSlider.value = this.npu_device_metric.max;
        this.resource_templates_filtered = this.resource_templates;
      }
      // Refresh with resource template
      if (this.resource_templates_filtered.length > 0) {
        const resource = this.resource_templates_filtered[0];
        this._chooseResourceTemplate(resource);
        this.resourceTemplatesSelect
          .layout(true)
          .then(() => {
            return this.resourceTemplatesSelect.layoutOptions();
          })
          .then(() => {
            this.resourceTemplatesSelect.select(1);
          });
      } else {
        this._updateResourceIndicator(
          this.cpu_metric.min,
          this.mem_metric.min,
          'none',
          0,
        );
      }
      if (disableLaunch) {
        this.cpuResourceSlider.disabled = true; // Not enough CPU. so no session.
        this.memoryResourceSlider.disabled = true;
        this.npuResourceSlider.disabled = true;
        this.sessionResourceSlider.disabled = true;
        this.sharedMemoryResourceSlider.disabled = true;
        this.launchButton.disabled = true;
        (
          this.shadowRoot?.querySelector('.allocation-check') as HTMLDivElement
        ).style.display = 'none';
        if (this.cluster_support) {
          this.clusterSizeSlider.disabled = true;
        }
        this.launchButtonMessageTextContent = _text(
          'session.launcher.NotEnoughResource',
        );
      } else {
        this.cpuResourceSlider.disabled = false;
        this.memoryResourceSlider.disabled = false;
        this.npuResourceSlider.disabled = false;
        this.sessionResourceSlider.disabled = false;
        this.sharedMemoryResourceSlider.disabled = false;
        this.launchButton.disabled = false;
        (
          this.shadowRoot?.querySelector('.allocation-check') as HTMLDivElement
        ).style.display = 'flex';
        if (this.cluster_support) {
          this.clusterSizeSlider.disabled = false;
        }
      }
      if (
        this.npu_device_metric.min == this.npu_device_metric.max &&
        this.npu_device_metric.max < 1
      ) {
        this.npuResourceSlider.disabled = true;
      }
      if (this.concurrency_limit <= 1) {
        // this.shadowRoot.querySelector('#cluster-size').disabled = true;
        this.sessionResourceSlider.min = 1;
        this.sessionResourceSlider.max = 2;
        this.sessionResourceSlider.value = 1;
        this.sessionResourceSlider.disabled = true;
      }
      if (
        this.max_containers_per_session <= 1 &&
        this.cluster_mode === 'single-node'
      ) {
        this.clusterSizeSlider.min = 1;
        this.clusterSizeSlider.max = 2;
        this.clusterSizeSlider.value = 1;
        this.clusterSizeSlider.disabled = true;
      }
      this.metric_updating = false;
    }
  }

  updateLanguage() {
    const selectedItem = this.environment.selected;
    if (selectedItem === null) return;
    const kernel = selectedItem.id;
    this._updateVersions(kernel);
  }

  folderToMountListRenderer(root, column, rowData) {
    render(
      html`
        <div style="font-size:14px;text-overflow:ellipsis;overflow:hidden;">
          ${rowData.item.name}
        </div>
        <span style="font-size:10px;">${rowData.item.host}</span>
      `,
      root,
    );
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
        <vaadin-text-field
          id="vfolder-alias-${rowData.item.name}"
          class="alias"
          clear-button-visible
          prevent-invalid-input
          pattern="^[a-zA-Z0-9./_-]*$"
          ?disabled="${!rowData.selected}"
          theme="small"
          placeholder="/home/work/${rowData.item.name}"
          @change="${(e) =>
            this._updateFolderMap(rowData.item.name, e.target.value)}"
        ></vaadin-text-field>
      `,
      root,
    );
  }

  infoHeaderRenderer(root, column?) {
    render(
      html`
        <div class="horizontal layout center">
          <span id="vfolder-header-title">
            ${_t('session.launcher.FolderAlias')}
          </span>
          <mwc-icon-button
            icon="info"
            class="fg green info"
            @click="${(e) => this._showPathDescription(e)}"
          ></mwc-icon-button>
        </div>
      `,
      root,
    );
  }

  _showPathDescription(e?) {
    if (e != undefined) {
      e.stopPropagation();
    }
    this._helpDescriptionTitle = _text('session.launcher.FolderAlias');
    this._helpDescription = _text('session.launcher.DescFolderAlias');
    this._helpDescriptionIcon = '';
    // setTimeout(() => this.setPathContent(pathDialog, this.helpDescTagCount(this._helpDescription)));
    this.helpDescriptionDialog.show();
  }

  helpDescTagCount(helpDescription) {
    let childCount = 0;
    const searchChild = '<p>';
    let descPos = helpDescription.indexOf(helpDescription);
    while (descPos !== -1) {
      childCount++;
      descPos = helpDescription.indexOf(searchChild, descPos + 1);
    }
    return childCount;
  }

  setPathContent(pathDialog, helpDescChildNum) {
    const pathLastChild = pathDialog.children[pathDialog.children.length - 1];
    const pathContentLastChild =
      pathLastChild.children[pathLastChild.children.length - 1];
    if (pathContentLastChild.children.length < helpDescChildNum + 1) {
      const div: HTMLElement = document.createElement('div');
      div.setAttribute('class', 'horizontal layout flex center');
      const pathCheckbox = document.createElement('mwc-checkbox');
      pathCheckbox.setAttribute('id', 'hide-guide');
      const checkboxMsg = document.createElement('span');
      checkboxMsg.append(
        document.createTextNode(`${_text('dialog.hide.DoNotShowThisAgain')}`),
      );
      div.appendChild(pathCheckbox);
      div.appendChild(checkboxMsg);
      pathContentLastChild.appendChild(div);
      const eventCheckbox = this.shadowRoot?.querySelector('#hide-guide');
      eventCheckbox?.addEventListener('change', (event) => {
        if (event.target !== null) {
          event.stopPropagation();
          const eventTarget = event.target as HTMLInputElement;
          if (!eventTarget.checked) {
            localStorage.setItem('backendaiwebui.pathguide', 'true');
          } else {
            localStorage.setItem('backendaiwebui.pathguide', 'false');
          }
        }
      });
    }
  }

  async _updateFolderMap(folder, alias) {
    if (alias === '') {
      if (folder in this.folderMapping) {
        delete this.folderMapping[folder];
      }
      await this.vfolderMountPreview.updateComplete.then(() =>
        this.requestUpdate(),
      );
      return Promise.resolve(true);
    }
    if (folder !== alias) {
      if (this.selectedVfolders.includes(alias)) {
        // Prevent vfolder name & alias overlapping
        this.notification.text = _text(
          'session.launcher.FolderAliasOverlapping',
        );
        this.notification.show();
        delete this.folderMapping[folder];
        (
          this.shadowRoot?.querySelector(
            '#vfolder-alias-' + folder,
          ) as VaadinTextField
        ).value = '';
        await this.vfolderMountPreview.updateComplete.then(() =>
          this.requestUpdate(),
        );
        return Promise.resolve(false);
      }
      for (const f in this.folderMapping) {
        // Prevent alias overlapping
        if ({}.hasOwnProperty.call(this.folderMapping, f)) {
          if (this.folderMapping[f] == alias) {
            this.notification.text = _text(
              'session.launcher.FolderAliasOverlapping',
            );
            this.notification.show();
            delete this.folderMapping[folder];
            (
              this.shadowRoot?.querySelector(
                '#vfolder-alias-' + folder,
              ) as VaadinTextField
            ).value = '';
            await this.vfolderMountPreview.updateComplete.then(() =>
              this.requestUpdate(),
            );
            return Promise.resolve(false);
          }
        }
      }
      this.folderMapping[folder] = alias;
      await this.vfolderMountPreview.updateComplete.then(() =>
        this.requestUpdate(),
      );
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

  /**
   * @deprecated it does not used now
   */
  _toggleAdvancedSettings() {
    (
      this.shadowRoot?.querySelector('#advanced-resource-settings') as any
    ).toggle();
  }

  /**
   * Set Cluster mode between 'single-node' and 'multi-node'
   *
   * @param {Event} e
   */
  _setClusterMode(e) {
    this.cluster_mode = e.target.value;
    // Resource pane refresh is disabled to prevent resource slider reset.
    // this.updateResourceAllocationPane();
  }

  /**
   * Set Cluster size when the cluster mode is 'multi-node'
   *
   * @param {Event} e
   */
  _setClusterSize(e) {
    this.cluster_size = e.target.value > 0 ? Math.round(e.target.value) : 0;
    this.clusterSizeSlider.value = this.cluster_size;
    let maxSessionCount = 1;
    if (globalThis.backendaiclient.supports('multi-container')) {
      if (this.cluster_size > 1) {
        // this.gpu_step = 1;
        this.gpu_step = this.resourceBroker.gpu_step;
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
    if (maxValue > 0) {
      this.sessionResourceSlider.value = maxValue;
      this.session_request = maxValue;
      this.sessionResourceSlider.disabled = true;
    } else {
      this.sessionResourceSlider.max = this.concurrency_limit;
      this.sessionResourceSlider.disabled = false;
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
    if (typeof e?.cpu !== 'undefined') {
      button = e;
    } else {
      button = e.target?.closest('mwc-list-item');
    }
    const cpu = button.cpu;
    const mem = button.mem;
    const cuda_device = button.cuda_device;
    const cuda_shares = button.cuda_shares;
    const rocm_device = button.rocm_device;
    const tpu_device = button.tpu_device;
    const ipu_device = button.ipu_device;
    const atom_device = button.atom_device;
    const atom_plus_device = button.atom_plus_device;
    const gaudi2_device = button.gaudi2_device;
    const warboy_device = button.warboy_device;
    const rngd_device = button.rngd_device;
    const hyperaccel_lpu_device = button.hyperaccel_lpu_device;

    let gpu_type;
    let gpu_value;
    if (
      (typeof cuda_device !== 'undefined' && Number(cuda_device) > 0) ||
      (typeof cuda_shares !== 'undefined' && Number(cuda_shares) > 0)
    ) {
      if (typeof cuda_shares === 'undefined') {
        gpu_type = 'cuda.device';
        gpu_value = cuda_device;
      } else {
        // FGPU
        gpu_type = 'cuda.shares';
        gpu_value = cuda_shares;
      }
    } else if (typeof rocm_device !== 'undefined' && Number(rocm_device) > 0) {
      gpu_type = 'rocm.device';
      gpu_value = rocm_device;
    } else if (typeof tpu_device !== 'undefined' && Number(tpu_device) > 0) {
      gpu_type = 'tpu.device';
      gpu_value = tpu_device;
    } else if (typeof ipu_device !== 'undefined' && Number(ipu_device) > 0) {
      gpu_type = 'ipu.device';
      gpu_value = ipu_device;
    } else if (typeof atom_device !== 'undefined' && Number(atom_device) > 0) {
      gpu_type = 'atom.device';
      gpu_value = atom_device;
    } else if (
      typeof atom_plus_device !== 'undefined' &&
      Number(atom_plus_device) > 0
    ) {
      gpu_type = 'atom-plus.device';
      gpu_value = atom_plus_device;
    } else if (
      typeof gaudi2_device !== 'undefined' &&
      Number(gaudi2_device) > 0
    ) {
      gpu_type = 'gaudi2.device';
      gpu_value = gaudi2_device;
    } else if (
      typeof warboy_device !== 'undefined' &&
      Number(warboy_device) > 0
    ) {
      gpu_type = 'warboy.device';
      gpu_value = warboy_device;
    } else if (typeof rngd_device !== 'undefined' && Number(rngd_device) > 0) {
      gpu_type = 'rngd.device';
      gpu_value = rngd_device;
    } else if (
      typeof hyperaccel_lpu_device !== 'undefined' &&
      Number(hyperaccel_lpu_device) > 0
    ) {
      gpu_type = 'hyperaccel-lpu.device';
      gpu_value = hyperaccel_lpu_device;
    } else {
      gpu_type = 'none';
      gpu_value = 0;
    }
    const shmem = button.shmem ? button.shmem : this.shmem_metric;

    // if resource preset is initially selected
    if (typeof shmem !== 'number') {
      this.shmem_request = shmem.preferred;
    } else {
      this.shmem_request = shmem ? shmem : 0.0625; // 64MB as default. Enough for single core CPU.
      // this.shmem_metric.preferred = this.shmem_request;
    }
    this._updateResourceIndicator(cpu, mem, gpu_type, gpu_value);
  }

  _updateResourceIndicator(cpu, mem, gpu_type, gpu_value) {
    this.cpuResourceSlider.value = cpu;
    this.memoryResourceSlider.value = mem;
    this.npuResourceSlider.value = gpu_value;
    this.sharedMemoryResourceSlider.value = this.shmem_request;
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
    } else if (
      globalThis.backendaiclient._config.default_session_environment !==
        undefined &&
      'default_session_environment' in globalThis.backendaiclient._config &&
      globalThis.backendaiclient._config.default_session_environment !== ''
    ) {
      if (
        this.languages
          .map((item) => item.name)
          .includes(
            globalThis.backendaiclient._config.default_session_environment,
          )
      ) {
        this.default_language =
          globalThis.backendaiclient._config.default_session_environment;
      } else if (this.languages[0].name !== '') {
        this.default_language = this.languages[0].name;
      } else {
        this.default_language = this.languages[1].name;
      }
    } else if (this.languages.length > 1) {
      this.default_language = this.languages[1].name;
    } else if (this.languages.length !== 0) {
      this.default_language = this.languages[0].name;
    } else {
      this.default_language = 'index.docker.io/lablup/ngc-tensorflow';
    }
    // await environment.updateComplete; async way.
    const obj = this.environment.items.find(
      (o) => o.value === this.default_language,
    );
    if (
      typeof obj === 'undefined' &&
      typeof globalThis.backendaiclient !== 'undefined' &&
      globalThis.backendaiclient.ready === false
    ) {
      // Not ready yet.
      setTimeout(() => {
        console.log(
          'Environment selector is not ready yet. Trying to set the default language again.',
        );
        return this.selectDefaultLanguage(forceUpdate, language);
      }, 500);
      return Promise.resolve(true);
    }
    const idx = this.environment.items.indexOf(obj!);
    this.environment.select(idx);
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
      this.ownerGroupSelect.addEventListener(
        'selected',
        this._fetchSessionOwnerScalingGroups.bind(this),
      );
      this.ownerFeatureInitialized = true;
    }
    const email = this.ownerEmailInput.value;
    if (
      !this.ownerEmailInput.checkValidity() ||
      email === '' ||
      email === undefined
    ) {
      this.notification.text = _text(
        'credential.validation.InvalidEmailAddress',
      );
      this.notification.show();
      this.ownerKeypairs = [];
      this.ownerGroups = [];
      return;
    }

    /* Fetch keypair */
    const keypairs = await globalThis.backendaiclient.keypair.list(email, [
      'access_key',
    ]);
    const ownerEnabled = this.shadowRoot?.querySelector(
      '#owner-enabled',
    ) as Checkbox;
    this.ownerKeypairs = keypairs.keypairs;
    if (this.ownerKeypairs.length < 1) {
      this.notification.text = _text('session.launcher.NoActiveKeypair');
      this.notification.show();
      ownerEnabled.checked = false;
      ownerEnabled.disabled = true;
      this.ownerKeypairs = [];
      this.ownerGroups = [];
      return;
    }
    this.ownerAccesskeySelect.layout(true).then(() => {
      this.ownerAccesskeySelect.select(0);
      (this.ownerAccesskeySelect as any)
        .createAdapter()
        .setSelectedText(this.ownerKeypairs[0]['access_key']);
    });

    /* Fetch domain / group information */
    try {
      const userInfo = await globalThis.backendaiclient.user.get(email, [
        'domain_name',
        'groups {id name}',
      ]);
      this.ownerDomain = userInfo.user.domain_name;
      this.ownerGroups = userInfo.user.groups;
    } catch (e) {
      this.notification.text = _text('session.launcher.NotEnoughOwnershipInfo');
      this.notification.show();
      return;
    }

    if (this.ownerGroups.length) {
      this.ownerGroupSelect.layout(true).then(() => {
        this.ownerGroupSelect.select(0);
        // remove protected property usage
        (this.ownerGroupSelect as any)
          .createAdapter()
          .setSelectedText(this.ownerGroups[0]['name']);
      });
    }
    ownerEnabled.disabled = false;
  }

  async _fetchSessionOwnerScalingGroups() {
    const group = this.ownerGroupSelect.value;
    if (!group) {
      this.ownerScalingGroups = [];
      return;
    }
    const sgroupInfo =
      await globalThis.backendaiclient.scalingGroup.list(group);
    this.ownerScalingGroups = sgroupInfo.scaling_groups;
    if (this.ownerScalingGroups) {
      this.ownerScalingGroupSelect.layout(true).then(() => {
        this.ownerScalingGroupSelect.select(0);
        // TODO remove protected field usage
        (this.ownerGroupSelect as any)
          .createAdapter()
          .setSelectedText(this.ownerScalingGroups[0]['name']);
      });
    }
  }

  async _fetchDelegatedSessionVfolder() {
    const ownerEnabled = this.shadowRoot?.querySelector(
      '#owner-enabled',
    ) as Checkbox;
    const userEmail = this.ownerEmailInput.value;
    if (this.ownerKeypairs.length > 0 && ownerEnabled && ownerEnabled.checked) {
      await this.resourceBroker.updateVirtualFolderList(userEmail);
      this.vfolders = this.resourceBroker.vfolders;
    } else {
      await this._updateVirtualFolderList();
    }
    this.autoMountedVfolders = this.vfolders.filter((item) =>
      item.name.startsWith('.'),
    );
    if (this.enableInferenceWorkload) {
      this.modelVfolders = this.vfolders.filter(
        (item) => !item.name.startsWith('.') && item.usage_mode === 'model',
      );
      this.nonAutoMountedVfolders = this.vfolders.filter(
        (item) => !item.name.startsWith('.') && item.usage_mode === 'general',
      );
    } else {
      this.nonAutoMountedVfolders = this.vfolders.filter(
        (item) => !item.name.startsWith('.'),
      );
    }
  }

  _toggleResourceGauge() {
    if (
      this.resourceGauge.style.display == '' ||
      this.resourceGauge.style.display == 'flex' ||
      this.resourceGauge.style.display == 'block'
    ) {
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
    if (
      name in this.resourceBroker.imageInfo &&
      'description' in this.resourceBroker.imageInfo[name]
    ) {
      this._helpDescriptionTitle = this.resourceBroker.imageInfo[name].name;
      this._helpDescription =
        this.resourceBroker.imageInfo[name].description ||
        _text('session.launcher.NoDescriptionFound');
      this._helpDescriptionIcon = item.icon;
      this.helpDescriptionDialog.show();
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
      cpu: {
        name: _text('session.launcher.CPU'),
        desc: _text('session.launcher.DescCPU'),
      },
      mem: {
        name: _text('session.launcher.Memory'),
        desc: _text('session.launcher.DescMemory'),
      },
      shmem: {
        name: _text('session.launcher.SharedMemory'),
        desc: `${_text('session.launcher.DescSharedMemory')} <br /> <br /> ${_text('session.launcher.DescSharedMemoryContext')}`,
      },
      gpu: {
        name: _text('session.launcher.AIAccelerator'),
        desc: _text('session.launcher.DescAIAccelerator'),
      },
      session: {
        name: _text('session.launcher.TitleSession'),
        desc: _text('session.launcher.DescSession'),
      },
      'single-node': {
        name: _text('session.launcher.SingleNode'),
        desc: _text('session.launcher.DescSingleNode'),
      },
      'multi-node': {
        name: _text('session.launcher.MultiNode'),
        desc: _text('session.launcher.DescMultiNode'),
      },
      'openmp-optimization': {
        name: _text('session.launcher.OpenMPOptimization'),
        desc: _text('session.launcher.DescOpenMPOptimization'),
      },
    };
    if (item in resource_description) {
      this._helpDescriptionTitle = resource_description[item].name;
      this._helpDescription = resource_description[item].desc;
      this._helpDescriptionIcon = '';
      this.helpDescriptionDialog.show();
    }
  }

  _showEnvConfigDescription(e) {
    e.stopPropagation();
    this._helpDescriptionTitle = _text(
      'session.launcher.EnvironmentVariableTitle',
    );
    this._helpDescription = _text('session.launcher.DescSetEnv');
    this._helpDescriptionIcon = '';
    this.helpDescriptionDialog.show();
  }

  _showPreOpenPortConfigDescription(e) {
    e.stopPropagation();
    this._helpDescriptionTitle = _text('session.launcher.PreOpenPortTitle');
    this._helpDescription = _text('session.launcher.DescSetPreOpenPort');
    this._helpDescriptionIcon = '';
    this.helpDescriptionDialog.show();
  }

  _resourceTemplateToCustom() {
    // TODO remove protected property assignment
    (this.resourceTemplatesSelect as any).selectedText = _text(
      'session.launcher.CustomResourceApplied',
    );

    this._updateResourceIndicator(
      this.cpu_request,
      this.mem_request,
      this.gpu_mode,
      this.gpu_request,
    );
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
    if (isResourceClicked) {
      // resource allocation
      this._resourceTemplateToCustom();
    } else {
      // cluster mode
      this._setClusterSize(e);
    }
  }

  _changeTotalAllocationPane() {
    this._deleteAllocationPaneShadow();
    const cluster_size = this.clusterSizeSlider.value;
    if (cluster_size > 1) {
      const container = this.shadowRoot?.querySelector(
        '#resource-allocated-box-shadow',
      ) as HTMLDivElement;
      for (let i = 0; i <= Math.min(5, cluster_size - 1); i = i + 1) {
        const item = document.createElement('div');
        item.classList.add(
          'horizontal',
          'layout',
          'center',
          'center-justified',
          'resource-allocated-box',
          'allocation-shadow',
        );
        item.style.position = 'absolute';
        item.style.top = '-' + (5 + 5 * i) + 'px';
        item.style.left = 5 + 5 * i + 'px';
        const intensity = this.isDarkMode ? 88 - i * 2 : 245 + i * 2;
        item.style.backgroundColor =
          'rgb(' + intensity + ',' + intensity + ',' + intensity + ')';
        item.style.borderColor = this.isDarkMode
          ? 'none'
          : 'rgb(' +
            (intensity - 10) +
            ',' +
            (intensity - 10) +
            ',' +
            (intensity - 10) +
            ')';
        item.style.zIndex = (6 - i).toString();
        container.appendChild(item);
      }
      (
        this.shadowRoot?.querySelector(
          '#total-allocation-pane',
        ) as HTMLDivElement
      ).appendChild(container);
    }
  }

  _deleteAllocationPaneShadow() {
    const container = this.shadowRoot?.querySelector(
      '#resource-allocated-box-shadow',
    ) as HTMLDivElement;
    container.innerHTML = '';
  }

  _updateShmemLimit() {
    const currentMemLimit = parseFloat(this.memoryResourceSlider.value);
    let shmemValue = this.sharedMemoryResourceSlider.value;
    // this.shmem_metric.max = Math.min(this.max_shm_per_container, currentMemLimit);
    // clamp the max value to the smaller of the current memory value or the configuration file value.
    // shmemEl.max = this.shmem_metric.max;
    if (parseFloat(shmemValue) > currentMemLimit) {
      shmemValue = currentMemLimit;
      this.shmem_request = shmemValue;
      this.sharedMemoryResourceSlider.value = shmemValue;
      this.sharedMemoryResourceSlider.max = shmemValue;
      this.notification.text = _text(
        'session.launcher.SharedMemorySettingIsReduced',
      );
      this.notification.show();
    } else if (this.max_shm_per_container > shmemValue) {
      this.sharedMemoryResourceSlider.max =
        currentMemLimit > this.max_shm_per_container
          ? this.max_shm_per_container
          : currentMemLimit;
    }
  }

  /**
   * Round the value according to the specified number of digits.
   *
   * @param {string} allocation - size of allocated resource.
   * @param {string} digit - number of digits.
   * @return {string} rounded value according specified number of digits.
   * */
  _roundResourceAllocation(allocation, digit) {
    return parseFloat(allocation).toFixed(digit);
  }

  /**
   * Get MiB value when input is less than 1 GiB.
   *
   * @param {number} value - value with GB unit.
   * @return {number} MiB value if input is smaller than 1GiB. Otherwise, GiB value.
   * */
  _conditionalGiBtoMiB(value) {
    if (value < 1.0) {
      return this._roundResourceAllocation((value * 2 ** 10).toFixed(0), 2);
    }
    return this._roundResourceAllocation(value, 2);
  }

  /**
   * Get MB unit when input is less than 1 GiB.
   *
   * @param {number} value - value with GiB unit.
   * @return {string} MiB if input is smaller than 1GiB. Otherwise, GiB.
   * */
  _conditionalGiBtoMiBunit(value) {
    if (value < 1.0) {
      return 'MiB';
    }
    return 'GiB';
  }

  /**
   * Get version information - Version, Language, Additional information.
   *
   * @param {any} version
   * @param {any} architecture
   * @return {Record<string, unknown>} Array containing information object
   * */
  _getVersionInfo(version, architecture) {
    const info: any = [];
    const fragment = version.split('-');
    info.push({
      // Version
      tag: this._aliasName(fragment[0]),
      color: 'blue',
      size: '60px',
    });
    if (fragment.length > 1) {
      // Image requirement overrides language information.
      if (
        this.kernel + ':' + version in this.imageRequirements &&
        'framework' in this.imageRequirements[this.kernel + ':' + version]
      ) {
        info.push({
          // Language
          tag: this.imageRequirements[this.kernel + ':' + version]['framework'],
          color: 'red',
          size: '110px',
        });
      } else {
        info.push({
          // Language
          tag: this._aliasName(fragment[1]),
          color: 'red',
          size: '110px',
        });
      }
    }
    info.push({
      tag: architecture,
      color: 'lightgreen',
      size: '90px',
    });
    if (fragment.length > 2) {
      let requirements = this._aliasName(fragment.slice(2).join('-'));
      requirements = requirements.split(':');
      if (requirements.length > 1) {
        info.push({
          // Additional information
          tag: requirements.slice(1).join(':'),
          app: requirements[0],
          color: 'green',
          size: '110px',
        });
      } else {
        info.push({
          // Additional information
          tag: requirements[0],
          color: 'green',
          size: '110px',
        });
      }
    }
    return info;
  }

  _disableEnterKey() {
    this.shadowRoot
      ?.querySelectorAll<LablupExpansion>('lablup-expansion')
      .forEach((element) => {
        // remove protected property assignment
        element.onkeydown = (e) => {
          if (e.key === 'Enter') {
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
      textfield.value = globalThis.backendaiclient.utils.clamp(
        textfield.value,
        textfield.min,
        textfield.max,
      );
    }
  }

  /**
   * Check validation of session name.
   *
   */
  _validateSessionName() {
    this.sessionName.validityTransform = (value, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.patternMismatch) {
          this.sessionName.validationMessage = _text(
            'session.launcher.SessionNameAllowCondition',
          );
          return {
            valid: nativeValidity.valid,
            patternMismatch: !nativeValidity.valid,
          };
        } else {
          this.sessionName.validationMessage = _text(
            'session.validation.EnterValidSessionName',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
      } else {
        const isValid = !this.resourceBroker.sessions_list.includes(value);
        if (!isValid) {
          this.sessionName.validationMessage = _text(
            'session.launcher.DuplicatedSessionName',
          );
        }
        return {
          valid: isValid,
          customError: !isValid,
        };
      }
    };
  }

  /**
   * Append a row to the environment variable list.
   *
   * @param {string} name - environment variable name
   * @param {string} value - environment variable value
   */
  _appendEnvRow(name = '', value = '') {
    const lastChild =
      this.modifyEnvContainer?.children[
        this.modifyEnvContainer.children.length - 1
      ];
    const div = this._createEnvRow(name, value);
    this.modifyEnvContainer?.insertBefore(div, lastChild as ChildNode);
  }

  /**
   * Append a row to the environment variable list.
   *
   * @param {number} port - pre open port
   */
  _appendPreOpenPortRow(port = null) {
    const lastChild =
      this.modifyPreOpenPortContainer?.children[
        this.modifyPreOpenPortContainer.children.length - 1
      ];
    const div = this._createPreOpenPortRow(port);
    this.modifyPreOpenPortContainer?.insertBefore(div, lastChild as ChildNode);
    this._updateisExceedMaxCountForPreopenPorts();
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
    div.setAttribute('class', 'horizontal layout center row');

    const env = document.createElement('mwc-textfield');
    env.setAttribute('value', name);

    const val = document.createElement('mwc-textfield');
    val.setAttribute('value', value);

    const removeButton = document.createElement('mwc-icon-button');
    removeButton.setAttribute('icon', 'remove');
    removeButton.setAttribute('class', 'green minus-btn');
    removeButton.addEventListener('click', (e) => this._removeEnvItem(e));

    div.append(env);
    div.append(val);
    div.append(removeButton);
    return div;
  }

  _createPreOpenPortRow(port) {
    const div = document.createElement('div');
    div.setAttribute('class', 'horizontal layout center row');

    const row = document.createElement('mwc-textfield');
    if (port) {
      row.setAttribute('value', port);
    }
    row.setAttribute('type', 'number');
    row.setAttribute('min', '1024');
    row.setAttribute('max', '65535');

    const removeButton = document.createElement('mwc-icon-button');
    removeButton.setAttribute('icon', 'remove');
    removeButton.setAttribute('class', 'green minus-btn');
    removeButton.addEventListener('click', (e) =>
      this._removePreOpenPortItem(e),
    );

    div.append(row);
    div.append(removeButton);
    return div;
  }

  /**
   * Check whether delete operation will proceed or not.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _removeEnvItem(e) {
    // htmlCollection should be converted to Array.
    const parentNode = e.target.parentNode;
    parentNode.remove();
  }

  /**
   * Check whether delete operation will proceed or not.
   * And update `isExceedMaxCountForPreopenPorts`.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  _removePreOpenPortItem(e) {
    // htmlCollection should be converted to Array.
    const parentNode = e.target.parentNode;
    parentNode.remove();
    this._updateisExceedMaxCountForPreopenPorts();
  }

  /**
   * Remove empty env input fields
   */
  _removeEmptyEnv() {
    const rows = this.modifyEnvContainer?.querySelectorAll(
      '.row',
    ) as NodeListOf<HTMLDivElement>;
    const empty = (row) =>
      Array.prototype.filter.call(
        row.querySelectorAll('mwc-textfield'),
        (tf) => tf.value === '',
      ).length === 2;
    Array.prototype.filter
      .call(rows, (row) => empty(row))
      .map((row, idx) => {
        if (idx !== 0 || this.environ.length > 0) {
          row.parentNode.removeChild(row);
        }
      });
  }

  _removeEmptyPreOpenPorts() {
    const rows = this.modifyPreOpenPortContainer?.querySelectorAll(
      '.row:not(.header)',
    ) as NodeListOf<HTMLDivElement>;
    const empty = (row) =>
      Array.prototype.filter.call(
        row.querySelectorAll('mwc-textfield'),
        (tf) => tf.value === '',
      ).length === 1;
    Array.prototype.filter
      .call(rows, (row) => empty(row))
      .map((row, idx) => {
        if (idx !== 0 || this.preOpenPorts.length > 0) {
          row.parentNode.removeChild(row);
        }
      });
    this._updateisExceedMaxCountForPreopenPorts();
  }

  /**
   * Modify environment variables for current session.
   */
  modifyEnv() {
    this._parseEnvVariableList();
    this._saveEnvVariableList();
    this.modifyEnvDialog.closeWithConfirmation = false;
    this.modifyEnvDialog.hide();
    this.notification.text = _text(
      'session.launcher.EnvironmentVariableConfigurationDone',
    );
    this.notification.show();
  }

  /**
   * Modify pre open ports for current session.
   */
  modifyPreOpenPorts() {
    const rows = this.modifyPreOpenPortContainer?.querySelectorAll(
      '.row:not(.header) mwc-textfield',
    ) as NodeListOf<TextField>;
    const isPreOpenPortsValid =
      Array.from(rows).filter((row) => !row.checkValidity()).length === 0;
    if (!isPreOpenPortsValid) {
      this.notification.text = _text('session.launcher.PreOpenPortRange');
      this.notification.show();
      return;
    }
    this._parseAndSavePreOpenPortList();
    this.modifyPreOpenPortDialog.closeWithConfirmation = false;
    this.modifyPreOpenPortDialog.hide();
    this.notification.text = _text(
      'session.launcher.PreOpenPortConfigurationDone',
    );
    this.notification.show();
  }

  /**
   * load environment variables for current session
   */
  _loadEnv() {
    this.environ.forEach((item: any) => {
      this._appendEnvRow(item.name, item.value);
    });
  }

  /**
   * load pre open ports for current session
   */
  _loadPreOpenPorts() {
    this.preOpenPorts.forEach((item) => {
      this._appendPreOpenPortRow(item);
    });
  }

  /**
   * Show environment variable modification popup.
   */
  _showEnvDialog() {
    this._removeEmptyEnv();
    this.modifyEnvDialog.closeWithConfirmation = true;
    this.modifyEnvDialog.show();
  }

  /**
   * Show preopen ports popup.
   */
  _showPreOpenPortDialog() {
    this._removeEmptyPreOpenPorts();
    this.modifyPreOpenPortDialog.closeWithConfirmation = true;
    this.modifyPreOpenPortDialog.show();
  }

  /**
   * Close confirmation dialog and environment variable dialog and reset the environment variable and value
   */
  _closeAndResetEnvInput() {
    this._clearEnvRows(true);
    this.closeDialog('env-config-confirmation');
    if (this.hideEnvDialog) {
      this._loadEnv();
      this.modifyEnvDialog.closeWithConfirmation = false;
      this.modifyEnvDialog.hide();
    }
  }

  /**
   * Close confirmation dialog and environment variable dialog and reset the environment variable and value
   */
  _closeAndResetPreOpenPortInput() {
    this._clearPreOpenPortRows(true);
    this.closeDialog('preopen-ports-config-confirmation');
    if (this.hidePreOpenPortDialog) {
      this._loadPreOpenPorts();
      this.modifyPreOpenPortDialog.closeWithConfirmation = false;
      this.modifyPreOpenPortDialog.hide();
    }
  }

  /**
   * Parse environment variables on UI.
   */
  _parseEnvVariableList() {
    this.environ_values = {};
    const rows = this.modifyEnvContainer?.querySelectorAll(
      '.row:not(.header)',
    ) as NodeListOf<Element>;
    const nonempty = (row) =>
      Array.prototype.filter.call(
        row.querySelectorAll('mwc-textfield'),
        (tf) => tf.value.length === 0,
      ).length === 0;
    const encodeRow = (row) => {
      const items: Array<any> = Array.prototype.map.call(
        row.querySelectorAll('mwc-textfield'),
        (tf) => tf.value,
      );
      this.environ_values[items[0]] = items[1];
      return items;
    };
    Array.prototype.filter
      .call(rows, (row) => nonempty(row))
      .map((row) => encodeRow(row));
  }

  /**
   * Save Environment variables
   */
  _saveEnvVariableList() {
    this.environ = Object.entries(this.environ_values).map(([name, value]) => ({
      name,
      value,
    }));
  }

  _parseAndSavePreOpenPortList() {
    const rows = this.modifyPreOpenPortContainer?.querySelectorAll(
      '.row:not(.header) mwc-textfield',
    ) as NodeListOf<TextField>;
    this.preOpenPorts = Array.from(rows)
      .filter((row) => row.value !== '')
      .map((row) => row.value);
  }

  _resetEnvironmentVariables() {
    this.environ = [];
    this.environ_values = {};
    if (this.modifyEnvDialog !== null) {
      this._clearEnvRows(true);
    }
  }

  _resetPreOpenPorts() {
    this.preOpenPorts = [];
    if (this.modifyPreOpenPortDialog !== null) {
      this._clearPreOpenPortRows(true);
    }
  }

  /**
   * Clear rows from the environment variable.
   * @param {Boolean} force - Whether removing all rows except first row or not.
   */
  _clearEnvRows(force = false) {
    const rows = this.modifyEnvContainer?.querySelectorAll(
      '.row',
    ) as NodeListOf<Element>;
    const firstRow = rows[0];

    // show confirm dialog if not empty.
    if (!force) {
      const nonempty = (row) =>
        Array.prototype.filter.call(
          row.querySelectorAll('mwc-textfield'),
          (item) => item.value.length > 0,
        ).length > 0;
      if (
        Array.prototype.filter.call(rows, (row) => nonempty(row)).length > 0
      ) {
        this.hideEnvDialog = false;
        this.openDialog('env-config-confirmation');
        return;
      }
    }

    // remain first row element and clear values
    firstRow?.querySelectorAll('mwc-textfield').forEach((tf) => {
      tf.value = '';
    });

    // delete extra rows
    rows.forEach((e, idx) => {
      if (idx !== 0) {
        e.remove();
      }
    });
  }

  /**
   * Clear rows from the pre open port.
   * @param {Boolean} force - Whether removing all rows except first row or not.
   */
  _clearPreOpenPortRows(force = false) {
    const rows = this.modifyPreOpenPortContainer?.querySelectorAll(
      '.row',
    ) as NodeListOf<Element>;
    const firstRow = rows[0];

    // show confirm dialog if not empty.
    if (!force) {
      const nonempty = (row) =>
        Array.prototype.filter.call(
          row.querySelectorAll('mwc-textfield'),
          (item) => item.value.length > 0,
        ).length > 0;
      if (
        Array.prototype.filter.call(rows, (row) => nonempty(row)).length > 0
      ) {
        this.hidePreOpenPortDialog = false;
        this.openDialog('preopen-ports-config-confirmation');
        return;
      }
    }

    // remain first row element and clear values
    firstRow?.querySelectorAll('mwc-textfield').forEach((tf) => {
      tf.value = '';
    });

    // delete extra rows
    rows.forEach((e, idx) => {
      if (idx !== 0) {
        e.remove();
      }
    });
  }

  openDialog(id) {
    (this.shadowRoot?.querySelector('#' + id) as BackendAIDialog).show();
  }

  closeDialog(id) {
    (this.shadowRoot?.querySelector('#' + id) as BackendAIDialog).hide();
  }

  /**
   * Check whether the current session progress is valid or not.
   */
  validateSessionLauncherInput() {
    if (this.currentIndex === 1) {
      const isBatchModeValid =
        this.sessionType === 'batch'
          ? this.commandEditor._validateInput()
          : true;
      const isBatchScheduledTimeValid =
        this.sessionType === 'batch' && this.scheduledTime
          ? new Date(this.scheduledTime).getTime() > new Date().getTime()
          : true;
      const isSessionNameValid = this.sessionName.checkValidity();

      if (
        !isBatchModeValid ||
        !isBatchScheduledTimeValid ||
        !isSessionNameValid
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Move to previous or next progress.
   *
   * @param {Number} n -1 : previous progress / 1 : next progress
   */
  async moveProgress(n) {
    if (!this.validateSessionLauncherInput()) return;
    const currentProgressEl = this.shadowRoot?.querySelector(
      '#progress-0' + this.currentIndex,
    ) as HTMLDivElement;
    this.currentIndex += n;
    // Exclude for model inference. No folder will be shown in the inference mode.
    if (this.mode === 'inference' && this.currentIndex == 2) {
      this.currentIndex += n;
    }
    // limit the range of progress number
    if (this.currentIndex > this.progressLength) {
      this.currentIndex = globalThis.backendaiclient.utils.clamp(
        this.currentIndex + n,
        this.progressLength,
        1,
      );
    }
    const movedProgressEl = this.shadowRoot?.querySelector(
      '#progress-0' + this.currentIndex,
    ) as HTMLDivElement;
    currentProgressEl.classList.remove('active');
    movedProgressEl.classList.add('active');

    this.prevButton.style.visibility =
      this.currentIndex == 1 ? 'hidden' : 'visible';
    this.nextButton.style.visibility =
      this.currentIndex == this.progressLength ? 'hidden' : 'visible';
    if (!this.launchButton.disabled) {
      this.launchButtonMessageTextContent =
        this.progressLength == this.currentIndex
          ? _text('session.launcher.Launch')
          : _text('session.launcher.ConfirmAndLaunch');
    }

    // if (this.currentIndex == 2) {
    //   const isVisible = localStorage.getItem('backendaiwebui.pathguide');
    //   if (!isVisible || isVisible === 'true') {
    //     this._showPathDescription();
    //   }
    // }

    // monkeypatch for grid items in accessible vfolder list in Safari or Firefox
    this._nonAutoMountedFolderGrid?.clearCache();
    this._modelFolderGrid?.clearCache();
    if (this.currentIndex === 2) {
      await this._fetchDelegatedSessionVfolder();
      this._checkSelectedItems();
    }
  }

  /**
   * Move to first page and initialize environment variables and selected mount folders.
   *
   */
  _resetProgress() {
    this.moveProgress(-this.currentIndex + 1);
    this._resetEnvironmentVariables();
    this._resetPreOpenPorts();
    this._unselectAllSelectedFolder();
    this._deleteAllocationPaneShadow();
  }

  /**
   *
   * @return {Number} : fraction of currentProgress when progressLength becomes 1
   */
  _calculateProgress() {
    const progressLength = this.progressLength > 0 ? this.progressLength : 1;
    const currentIndex = this.currentIndex > 0 ? this.currentIndex : 1;
    return (currentIndex / progressLength).toFixed(2);
  }

  /**
   *
   * @param {String} gpu_type : GPU/NPU type to get accelerator name. Name convention follows Backend.AI Accelerator plugins device names.
   * @return {String} : Human-readable GPU/NPU name following the device type name
   */
  _acceleratorName(gpu_type: string) {
    const accelerator_names = {
      'cuda.device': 'GPU',
      'cuda.shares': 'GPU',
      'rocm.device': 'GPU',
      'tpu.device': 'TPU',
      'ipu.device': 'IPU',
      'atom.device': 'ATOM',
      'atom-plus.device': 'ATOM+',
      'gaudi2.device': 'Gaudi 2',
      'warboy.device': 'Warboy',
      'rngd.device': 'RNGD',
      'hyperaccel-lpu.device': 'Hyperaccel LPU',
    };
    if (gpu_type in accelerator_names) {
      return accelerator_names[gpu_type];
    } else {
      return 'GPU';
    }
  }
  /**
   * Disable Select UI about Environments and versions when event target value is not empty.
   *
   */
  _toggleEnvironmentSelectUI() {
    const isManualImageEnabled = this.manualImageName?.value ? true : false;
    this.environment.disabled = this.version_selector.disabled =
      isManualImageEnabled;
    // select none(-1) when manual image is enabled
    const selectedIndex = isManualImageEnabled ? -1 : 1;
    this.environment.select(selectedIndex);
    this.version_selector.select(selectedIndex);
  }

  /**
   * Show HPC optimization options only if OpenMPswitch is not checked.
   */
  _toggleHPCOptimization() {
    const isOpenMPChecked = this.openMPSwitch.selected;
    (
      this.shadowRoot?.querySelector(
        '#HPCOptimizationOptions',
      ) as HTMLDivElement
    ).style.display = isOpenMPChecked ? 'none' : 'block';
  }

  /**
   * Toggle startup code input section according to session type
   *
   * @param {Event} e
   */
  _toggleStartUpCommandEditor(e) {
    this.sessionType = e.target.value;
    const isBatchmode: boolean = this.sessionType === 'batch';
    const startUpCommandEditor = this.shadowRoot?.querySelector(
      '#batch-mode-config-section',
    ) as HTMLDivElement;
    startUpCommandEditor.style.display = isBatchmode ? 'inline-flex' : 'none';
    if (isBatchmode) {
      this.commandEditor.refresh();
      this.commandEditor.focus();
    }
  }

  _updateisExceedMaxCountForPreopenPorts() {
    const currentRowCount =
      this.modifyPreOpenPortContainer?.querySelectorAll('mwc-textfield')
        ?.length ?? 0;
    this.isExceedMaxCountForPreopenPorts =
      currentRowCount >= this.maxCountForPreopenPorts;
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/fonts/font-awesome-all.min.css" />
      <link rel="stylesheet" href="resources/custom.css" />
      <mwc-button
        class="primary-action"
        id="launch-session"
        ?disabled="${!this.enableLaunchButton}"
        icon="power_settings_new"
        data-testid="start-session-button"
        @click="${() => this._launchSessionDialog()}"
      >
        ${_t('session.launcher.Start')}
      </mwc-button>
      <backend-ai-dialog
        id="new-session-dialog"
        narrowLayout
        fixed
        backdrop
        persistent
        style="position:relative;"
      >
        <span slot="title">
          ${this.newSessionDialogTitle
            ? this.newSessionDialogTitle
            : _t('session.launcher.StartNewSession')}
        </span>
        <form
          slot="content"
          id="launch-session-form"
          class="centered"
          style="position:relative;"
        >
          <div id="progress-01" class="progress center layout fade active">
            <mwc-select
              id="session-type"
              icon="category"
              label="${_text('session.launcher.SessionType')}"
              required
              fixedMenuPosition
              value="${this.sessionType}"
              @selected="${(e) => this._toggleStartUpCommandEditor(e)}"
            >
              ${this.mode === 'inference'
                ? html`
                    <mwc-list-item value="inference" selected>
                      ${_t('session.launcher.InferenceMode')}
                    </mwc-list-item>
                  `
                : html`
                    <mwc-list-item value="batch">
                      ${_t('session.launcher.BatchMode')}
                    </mwc-list-item>
                    <mwc-list-item value="interactive" selected>
                      ${_t('session.launcher.InteractiveMode')}
                    </mwc-list-item>
                  `}
            </mwc-select>
            <mwc-select
              id="environment"
              icon="code"
              label="${_text('session.launcher.Environments')}"
              required
              fixedMenuPosition
              value="${this.default_language}"
            >
              <mwc-list-item
                selected
                graphic="icon"
                style="display:none!important;"
              >
                ${_t('session.launcher.ChooseEnvironment')}
              </mwc-list-item>
              ${this.languages.map(
                (item) => html`
                  ${item.clickable === false
                    ? html`
                        <h5
                          style="font-size:12px;padding: 0 10px 3px 10px;margin:0; border-bottom:1px solid var(--token-colorBorder, #ccc);"
                          role="separator"
                          disabled="true"
                        >
                          ${item.basename}
                        </h5>
                      `
                    : html`
                        <mwc-list-item
                          id="${item.name}"
                          value="${item.name}"
                          graphic="icon"
                        >
                          <img
                            slot="graphic"
                            alt="language icon"
                            src="resources/icons/${item.icon}"
                            style="width:24px;height:24px;"
                          />
                          <div
                            class="horizontal justified center flex layout"
                            style="width:325px;"
                          >
                            <div style="padding-right:5px;">
                              ${item.basename}
                            </div>
                            <div
                              class="horizontal layout end-justified center flex"
                            >
                              ${item.tags
                                ? item.tags.map(
                                    (item) => html`
                                      <lablup-shields
                                        style="margin-right:5px;"
                                        color="${item.color}"
                                        description="${item.tag}"
                                      ></lablup-shields>
                                    `,
                                  )
                                : ''}
                              <mwc-icon-button
                                icon="info"
                                class="fg blue info"
                                @click="${(e) =>
                                  this._showKernelDescription(e, item)}"
                              ></mwc-icon-button>
                            </div>
                          </div>
                        </mwc-list-item>
                      `}
                `,
              )}
            </mwc-select>
            <mwc-select
              id="version"
              icon="architecture"
              label="${_text('session.launcher.Version')}"
              required
              fixedMenuPosition
            >
              <mwc-list-item
                selected
                style="display:none!important"
              ></mwc-list-item>
              ${this.versions[0] === 'Not Selected' &&
              this.versions.length === 1
                ? html``
                : html`
                    <h5
                      style="font-size:12px;padding: 0 10px 3px 15px;margin:0; border-bottom:1px solid var(--token-colorBorder, #ccc);"
                      role="separator"
                      disabled="true"
                      class="horizontal layout"
                    >
                      <div style="width:60px;">
                        ${_t('session.launcher.Version')}
                      </div>
                      <div style="width:110px;">
                        ${_t('session.launcher.Base')}
                      </div>
                      <div style="width:90px;">
                        ${_t('session.launcher.Architecture')}
                      </div>
                      <div style="width:110px;">
                        ${_t('session.launcher.Requirements')}
                      </div>
                    </h5>
                    ${this.versions.map(
                      ({ version, architecture }) => html`
                        <mwc-list-item
                          id="${version}"
                          architecture="${architecture}"
                          value="${version}"
                          style="min-height:35px;height:auto;"
                        >
                          <span style="display:none">${version}</span>
                          <div class="horizontal layout end-justified">
                            ${this._getVersionInfo(
                              version || '',
                              architecture,
                            ).map(
                              (item) => html`
                                <lablup-shields
                                  style="width:${item.size}!important;"
                                  color="${item.color}"
                                  app="${typeof item.app != 'undefined' &&
                                  item.app != '' &&
                                  item.app != ' '
                                    ? item.app
                                    : ''}"
                                  description="${item.tag}"
                                  class="horizontal layout center center-justified"
                                ></lablup-shields>
                              `,
                            )}
                          </div>
                        </mwc-list-item>
                      `,
                    )}
                  `}
            </mwc-select>
            ${this._debug || this.allow_manual_image_name_for_session
              ? html`
                  <mwc-textfield
                    id="image-name"
                    type="text"
                    class="flex"
                    value=""
                    icon="assignment_turned_in"
                    label="${_text('session.launcher.ManualImageName')}"
                    @change=${(e) => this._toggleEnvironmentSelectUI()}
                  ></mwc-textfield>
                `
              : html``}
            <mwc-textfield
              id="session-name"
              placeholder="${_text('session.launcher.SessionNameOptional')}"
              pattern="^[a-zA-Z0-9]([a-zA-Z0-9\\-_\\.]{2,})[a-zA-Z0-9]$"
              minLength="4"
              maxLength="64"
              icon="label"
              helper="${_text('inputLimit.4to64chars')}"
              validationMessage="${_text(
                'session.launcher.SessionNameAllowCondition',
              )}"
              autoValidate
              @input="${() => this._validateSessionName()}"
            ></mwc-textfield>
            <div
              class="vertical layout center flex"
              id="batch-mode-config-section"
              style="display:none;gap:3px;"
            >
              <span
                class="launcher-item-title"
                style="width:386px;padding-left:16px;"
              >
                ${_t('session.launcher.BatchModeConfig')}
              </span>
              <div class="horizontal layout start-justified">
                <div style="width:370px;font-size:12px;">
                  ${_t('session.launcher.StartUpCommand')}*
                </div>
              </div>
              <lablup-codemirror
                id="command-editor"
                mode="shell"
                required
                validationMessage="${_t('dialog.warning.Required')}"
              ></lablup-codemirror>
              <backend-ai-react-batch-session-scheduled-time-setting
                @change=${({ detail: value }) => {
                  this.scheduledTime = value;
                }}
                style="align-self:start;margin-left:15px;margin-bottom:10px;"
              ></backend-ai-react-batch-session-scheduled-time-setting>
            </div>
            <lablup-expansion
              leftIconName="expand_more"
              rightIconName="settings"
              .rightCustomFunction="${() => this._showEnvDialog()}"
            >
              <span slot="title">
                ${_t('session.launcher.SetEnvironmentVariable')}
              </span>
              <div class="environment-variables-container">
                ${this.environ.length > 0
                  ? html`
                      <div
                        class="horizontal flex center center-justified layout"
                        style="overflow-x:hidden;"
                      >
                        <div role="listbox">
                          <h4>
                            ${_text('session.launcher.EnvironmentVariable')}
                          </h4>
                          ${this.environ.map(
                            (item) => html`
                              <mwc-textfield
                                disabled
                                value="${item.name}"
                              ></mwc-textfield>
                            `,
                          )}
                        </div>
                        <div role="listbox" style="margin-left:15px;">
                          <h4>
                            ${_text(
                              'session.launcher.EnvironmentVariableValue',
                            )}
                          </h4>
                          ${this.environ.map(
                            (item) => html`
                              <mwc-textfield
                                disabled
                                value="${item.value}"
                              ></mwc-textfield>
                            `,
                          )}
                        </div>
                      </div>
                    `
                  : html`
                      <div class="vertical layout center flex blank-box">
                        <span>${_t('session.launcher.NoEnvConfigured')}</span>
                      </div>
                    `}
              </div>
            </lablup-expansion>
            ${this.maxCountForPreopenPorts > 0
              ? html`
                  <lablup-expansion
                    leftIconName="expand_more"
                    rightIconName="settings"
                    .rightCustomFunction="${() =>
                      this._showPreOpenPortDialog()}"
                  >
                    <span slot="title">
                      ${_t('session.launcher.SetPreopenPorts')}
                    </span>
                    <div class="preopen-ports-container">
                      ${this.preOpenPorts.length > 0
                        ? html`
                            <div
                              class="horizontal flex center layout"
                              style="overflow-x:hidden;margin:auto 5px;"
                            >
                              ${this.preOpenPorts.map(
                                (port) => html`
                                  <lablup-shields
                                    color="lightgrey"
                                    description="${port}"
                                    style="padding:4px;"
                                  ></lablup-shields>
                                `,
                              )}
                            </div>
                          `
                        : html`
                            <div class="vertical layout center flex blank-box">
                              <span>
                                ${_t(
                                  'session.launcher.NoPreOpenPortsConfigured',
                                )}
                              </span>
                            </div>
                          `}
                    </div>
                  </lablup-expansion>
                `
              : html``}
            <lablup-expansion
              name="ownership"
              style="--expansion-content-padding:15px 0;"
            >
              <span slot="title">
                ${_t('session.launcher.SetSessionOwner')}
              </span>
              <div class="vertical layout">
                <div class="horizontal center layout">
                  <mwc-textfield
                    id="owner-email"
                    type="email"
                    class="flex"
                    value=""
                    pattern="^.+@.+..+$"
                    icon="mail"
                    label="${_text('session.launcher.OwnerEmail')}"
                    size="40"
                  ></mwc-textfield>
                  <mwc-icon-button
                    icon="refresh"
                    class="blue"
                    @click="${() => this._fetchSessionOwnerGroups()}"
                  ></mwc-icon-button>
                </div>
                <mwc-select
                  id="owner-accesskey"
                  label="${_text('session.launcher.OwnerAccessKey')}"
                  icon="vpn_key"
                  fixedMenuPosition
                  naturalMenuWidth
                >
                  ${this.ownerKeypairs.map(
                    (item) => html`
                      <mwc-list-item
                        class="owner-group-dropdown"
                        id="${item.access_key}"
                        value="${item.access_key}"
                      >
                        ${item.access_key}
                      </mwc-list-item>
                    `,
                  )}
                </mwc-select>
                <div class="horizontal center layout">
                  <mwc-select
                    id="owner-group"
                    label="${_text('session.launcher.OwnerGroup')}"
                    icon="group_work"
                    fixedMenuPosition
                    naturalMenuWidth
                  >
                    ${this.ownerGroups.map(
                      (item) => html`
                        <mwc-list-item
                          class="owner-group-dropdown"
                          id="${item.name}"
                          value="${item.name}"
                        >
                          ${item.name}
                        </mwc-list-item>
                      `,
                    )}
                  </mwc-select>
                  <mwc-select
                    id="owner-scaling-group"
                    label="${_text('session.launcher.OwnerResourceGroup')}"
                    icon="storage"
                    fixedMenuPosition
                  >
                    ${this.ownerScalingGroups.map(
                      (item) => html`
                        <mwc-list-item
                          class="owner-group-dropdown"
                          id="${item.name}"
                          value="${item.name}"
                        >
                          ${item.name}
                        </mwc-list-item>
                      `,
                    )}
                  </mwc-select>
                </div>
                <div class="horizontal layout start-justified center">
                  <mwc-checkbox id="owner-enabled"></mwc-checkbox>
                  <p>${_t('session.launcher.LaunchSessionWithAccessKey')}</p>
                </div>
              </div>
            </lablup-expansion>
          </div>
          <div
            id="progress-02"
            class="progress center layout fade"
            style="padding-top:0;"
          >
            <lablup-expansion class="vfolder" name="vfolder" open>
              <span slot="title">${_t('session.launcher.FolderToMount')}</span>
              <div class="vfolder-list">
                <vaadin-grid
                  theme="no-border row-stripes column-borders compact dark"
                  id="non-auto-mounted-folder-grid"
                  aria-label="vfolder list"
                  height-by-rows
                  .items="${this.nonAutoMountedVfolders}"
                  @selected-items-changed="${() =>
                    this._updateSelectedFolder()}"
                >
                  <vaadin-grid-selection-column
                    id="select-column"
                    flex-grow="0"
                    text-align="center"
                    auto-select
                  ></vaadin-grid-selection-column>
                  <vaadin-grid-filter-column
                    header="${_t('session.launcher.FolderToMountList')}"
                    path="name"
                    resizable
                    .renderer="${this._boundFolderToMountListRenderer}"
                  ></vaadin-grid-filter-column>
                  <vaadin-grid-column
                    width="135px"
                    path=" ${_t('session.launcher.FolderAlias')}"
                    .renderer="${this._boundFolderMapRenderer}"
                    .headerRenderer="${this._boundPathRenderer}"
                  ></vaadin-grid-column>
                </vaadin-grid>
                ${this.vfolders.length > 0
                  ? html``
                  : html`
                      <div class="vertical layout center flex blank-box-medium">
                        <span>
                          ${_t('session.launcher.NoAvailableFolderToMount')}
                        </span>
                      </div>
                    `}
              </div>
            </lablup-expansion>
            <lablup-expansion
              class="vfolder"
              name="vfolder"
              style="display:${this.enableInferenceWorkload
                ? 'block'
                : 'none'};"
            >
              <span slot="title">
                ${_t('session.launcher.ModelStorageToMount')}
              </span>
              <div class="vfolder-list">
                <vaadin-grid
                  theme="no-border row-stripes column-borders compact dark"
                  id="model-folder-grid"
                  aria-label="model storage vfolder list"
                  height-by-rows
                  .items="${this.modelVfolders}"
                  @selected-items-changed="${() =>
                    this._updateSelectedFolder()}"
                >
                  <vaadin-grid-selection-column
                    id="select-column"
                    flex-grow="0"
                    text-align="center"
                    auto-select
                  ></vaadin-grid-selection-column>
                  <vaadin-grid-filter-column
                    header="${_t('session.launcher.ModelStorageToMount')}"
                    path="name"
                    resizable
                    .renderer="${this._boundFolderToMountListRenderer}"
                  ></vaadin-grid-filter-column>
                  <vaadin-grid-column
                    width="135px"
                    path=" ${_t('session.launcher.FolderAlias')}"
                    .renderer="${this._boundFolderMapRenderer}"
                    .headerRenderer="${this._boundPathRenderer}"
                  ></vaadin-grid-column>
                </vaadin-grid>
              </div>
            </lablup-expansion>
            <lablup-expansion
              id="vfolder-mount-preview"
              class="vfolder"
              name="vfolder"
            >
              <span slot="title">${_t('session.launcher.MountedFolders')}</span>
              <div class="vfolder-mounted-list">
                ${this.selectedVfolders.length > 0 ||
                this.autoMountedVfolders.length > 0
                  ? html`
                      <ul class="vfolder-list">
                        ${this.selectedVfolders.map(
                          (item) => html`
                            <li>
                              <mwc-icon>folder_open</mwc-icon>
                              ${item}
                              ${item in this.folderMapping
                                ? this.folderMapping[item].startsWith('/')
                                  ? html`
                                      (&#10140; ${this.folderMapping[item]})
                                    `
                                  : html`
                                      (&#10140;
                                      /home/work/${this.folderMapping[item]})
                                    `
                                : html`
                                    (&#10140; /home/work/${item})
                                  `}
                            </li>
                          `,
                        )}
                        ${this.autoMountedVfolders.map(
                          (item) => html`
                            <li>
                              <mwc-icon>folder_special</mwc-icon>
                              ${item.name}
                            </li>
                          `,
                        )}
                      </ul>
                    `
                  : html`
                      <div class="vertical layout center flex blank-box-large">
                        <span>${_t('session.launcher.NoFolderMounted')}</span>
                      </div>
                    `}
              </div>
            </lablup-expansion>
          </div>
          <div id="progress-03" class="progress center layout fade">
            <div class="horizontal center layout">
              <mwc-select
                id="scaling-groups"
                label="${_text('session.launcher.ResourceGroup')}"
                icon="storage"
                required
                fixedMenuPosition
                @selected="${(e) => this.updateScalingGroup(true, e)}"
              >
                ${this.scaling_groups.map(
                  (item) => html`
                    <mwc-list-item
                      class="scaling-group-dropdown"
                      id="${item.name}"
                      graphic="icon"
                      value="${item.name}"
                    >
                      ${item.name}
                    </mwc-list-item>
                  `,
                )}
              </mwc-select>
            </div>
            <div class="vertical center layout" style="position:relative;">
              <mwc-select
                id="resource-templates"
                label="${this.isEmpty(this.resource_templates_filtered)
                  ? ''
                  : _text('session.launcher.ResourceAllocation')}"
                icon="dashboard_customize"
                ?required="${!this.isEmpty(this.resource_templates_filtered)}"
                fixedMenuPosition
              >
                <mwc-list-item
                  ?selected="${this.isEmpty(this.resource_templates_filtered)}"
                  style="display:none!important;"
                ></mwc-list-item>
                <h5
                  style="font-size:12px;padding: 0 10px 3px 15px;margin:0; border-bottom:1px solid var(--token-colorBorder, #ccc);"
                  role="separator"
                  disabled="true"
                  class="horizontal layout center"
                >
                  <div style="width:110px;">Name</div>
                  <div style="width:50px;text-align:right;">CPU</div>
                  <div style="width:50px;text-align:right;">RAM</div>
                  <div style="width:50px;text-align:right;">
                    ${_t('session.launcher.SharedMemory')}
                  </div>
                  <div style="width:90px;text-align:right;">
                    ${_t('session.launcher.Accelerator')}
                  </div>
                </h5>
                ${this.resource_templates_filtered.map(
                  (item) => html`
                    <mwc-list-item
                      value="${item.name}"
                      id="${item.name}-button"
                      @click="${(e) => this._chooseResourceTemplate(e)}"
                      .cpu="${item.cpu}"
                      .mem="${item.mem}"
                      .cuda_device="${item.cuda_device}"
                      .cuda_shares="${item.cuda_shares}"
                      .rocm_device="${item.rocm_device}"
                      .tpu_device="${item.tpu_device}"
                      .ipu_device="${item.ipu_device}"
                      .atom_device="${item.atom_device}"
                      .atom_plus_device="${item.atom_plus_device}"
                      .gaudi2_device="${item.gaudi2_device}"
                      .warboy_device="${item.warboy_device}"
                      .rngd_device="${item.rngd_device}"
                      .hyperaccel_lpu_device="${item.hyperaccel_lpu_device}"
                      .shmem="${item.shmem}"
                    >
                      <div class="horizontal layout end-justified">
                        <div style="width:110px;">${item.name}</div>
                        <div style="display:none">(</div>
                        <div style="width:50px;text-align:right;">
                          ${item.cpu}
                          <span style="display:none">CPU</span>
                        </div>
                        <div style="width:50px;text-align:right;">
                          ${item.mem}GiB
                        </div>
                        <div style="width:60px;text-align:right;">
                          ${item.shmem
                            ? html`
                                ${parseFloat(
                                  globalThis.backendaiclient.utils.changeBinaryUnit(
                                    item.shared_memory,
                                    'g',
                                  ),
                                ).toFixed(2)}
                                GiB
                              `
                            : html`
                                64MB
                              `}
                        </div>
                        <div style="width:80px;text-align:right;">
                          ${item.cuda_device && item.cuda_device > 0
                            ? html`
                                ${item.cuda_device} GPU
                              `
                            : html``}
                          ${item.cuda_shares && item.cuda_shares > 0
                            ? html`
                                ${item.cuda_shares} GPU
                              `
                            : html``}
                          ${item.rocm_device && item.rocm_device > 0
                            ? html`
                                ${item.rocm_device} GPU
                              `
                            : html``}
                          ${item.tpu_device && item.tpu_device > 0
                            ? html`
                                ${item.tpu_device} TPU
                              `
                            : html``}
                          ${item.ipu_device && item.ipu_device > 0
                            ? html`
                                ${item.ipu_device} IPU
                              `
                            : html``}
                          ${item.atom_device && item.atom_device > 0
                            ? html`
                                ${item.atom_device} ATOM
                              `
                            : html``}
                          ${item.atom_plus_device && item.atom_plus_device > 0
                            ? html`
                                ${item.atom_plus_device} ATOM+
                              `
                            : html``}
                          ${item.gaudi2_device && item.gaudi2_device > 0
                            ? html`
                                ${item.gaudi2_device} Gaudi 2
                              `
                            : html``}
                          ${item.warboy_device && item.warboy_device > 0
                            ? html`
                                ${item.warboy_device} Warboy
                              `
                            : html``}
                          ${item.rngd_device && item.rngd_device > 0
                            ? html`
                                ${item.rngd_device} RNGD
                              `
                            : html``}
                          ${item.hyperaccel_lpu_device &&
                          item.hyperaccel_lpu_device > 0
                            ? html`
                                ${item.hyperaccel_lpu_device} Hyperaccel LPU
                              `
                            : html``}
                        </div>
                        <div style="display:none">)</div>
                      </div>
                    </mwc-list-item>
                  `,
                )}
                ${this.isEmpty(this.resource_templates_filtered)
                  ? html`
                      <mwc-list-item
                        class="resource-button vertical center start layout"
                        role="option"
                        style="height:140px;width:350px;"
                        type="button"
                        flat
                        inverted
                        outlined
                        disabled
                        selected
                      >
                        <div>
                          <h4>${_t('session.launcher.NoSuitablePreset')}</h4>
                          <div style="font-size:12px;">
                            Use advanced settings to
                            <br />
                            start custom session
                          </div>
                        </div>
                      </mwc-list-item>
                    `
                  : html``}
              </mwc-select>
            </div>
            <lablup-expansion
              name="resource-group"
              style="display:${this.allowCustomResourceAllocation
                ? 'block'
                : 'none'}"
            >
              <span slot="title">
                ${_t('session.launcher.CustomAllocation')}
              </span>
              <div class="vertical layout">
                <div>
                  <mwc-list-item hasMeta class="resource-type">
                    <div>CPU</div>
                    <mwc-icon-button
                      slot="meta"
                      icon="info"
                      class="fg info"
                      @click="${(e) => this._showResourceDescription(e, 'cpu')}"
                    ></mwc-icon-button>
                  </mwc-list-item>
                  <hr class="separator" />
                  <div class="slider-list-item">
                    <lablup-slider
                      id="cpu-resource"
                      class="cpu"
                      step="1"
                      pin
                      snaps
                      expand
                      editable
                      markers
                      tabindex="0"
                      @change="${(e) => this._applyResourceValueChanges(e)}"
                      marker_limit="${this.marker_limit}"
                      suffix="${_text('session.launcher.Core')}"
                      min="${this.cpu_metric.min}"
                      max="${this.cpu_metric.max}"
                      value="${this.cpu_request}"
                    ></lablup-slider>
                  </div>
                  <mwc-list-item hasMeta class="resource-type">
                    <div>RAM</div>
                    <mwc-icon-button
                      slot="meta"
                      icon="info"
                      class="fg info"
                      @click="${(e) => this._showResourceDescription(e, 'mem')}"
                    ></mwc-icon-button>
                  </mwc-list-item>
                  <hr class="separator" />
                  <div class="slider-list-item">
                    <lablup-slider
                      id="mem-resource"
                      class="mem"
                      pin
                      snaps
                      expand
                      step="0.05"
                      editable
                      markers
                      tabindex="0"
                      @change="${(e) => {
                        this._applyResourceValueChanges(e);
                        this._updateShmemLimit();
                      }}"
                      marker_limit="${this.marker_limit}"
                      suffix="GB"
                      min="${this.mem_metric.min}"
                      max="${this.mem_metric.max}"
                      value="${this.mem_request}"
                    ></lablup-slider>
                  </div>
                  <mwc-list-item hasMeta class="resource-type">
                    <div>${_t('session.launcher.SharedMemory')}</div>
                    <mwc-icon-button
                      slot="meta"
                      icon="info"
                      class="fg info"
                      @click="${(e) =>
                        this._showResourceDescription(e, 'shmem')}"
                    ></mwc-icon-button>
                  </mwc-list-item>
                  <hr class="separator" />
                  <div class="slider-list-item">
                    <lablup-slider
                      id="shmem-resource"
                      class="mem"
                      pin
                      snaps
                      step="0.0125"
                      editable
                      markers
                      tabindex="0"
                      @change="${(e) => {
                        this._applyResourceValueChanges(e);
                        this._updateShmemLimit();
                      }}"
                      marker_limit="${this.marker_limit}"
                      suffix="GB"
                      min="0.0625"
                      max="${this.shmem_metric.max}"
                      value="${this.shmem_request}"
                    ></lablup-slider>
                  </div>
                  <mwc-list-item hasMeta class="resource-type">
                    <div>${_t('webui.menu.AIAccelerator')}</div>
                    <mwc-icon-button
                      slot="meta"
                      icon="info"
                      class="fg info"
                      @click="${(e) => this._showResourceDescription(e, 'gpu')}"
                    ></mwc-icon-button>
                  </mwc-list-item>
                  <hr class="separator" />
                  <div class="slider-list-item">
                    <lablup-slider
                      id="gpu-resource"
                      class="gpu"
                      pin
                      snaps
                      editable
                      markers
                      step="${this.gpu_step}"
                      @change="${(e) => this._applyResourceValueChanges(e)}"
                      marker_limit="${this.marker_limit}"
                      suffix="${this._NPUDeviceNameOnSlider}"
                      min="0.0"
                      max="${this.npu_device_metric.max}"
                      value="${this.gpu_request}"
                    ></lablup-slider>
                  </div>
                  <mwc-list-item hasMeta class="resource-type">
                    <div>${_t('webui.menu.Sessions')}</div>
                    <mwc-icon-button
                      slot="meta"
                      icon="info"
                      class="fg info"
                      @click="${(e) =>
                        this._showResourceDescription(e, 'session')}"
                    ></mwc-icon-button>
                  </mwc-list-item>
                  <hr class="separator" />
                  <div class="slider-list-item">
                    <lablup-slider
                      id="session-resource"
                      class="session"
                      pin
                      snaps
                      editable
                      markers
                      step="1"
                      @change="${(e) => this._applyResourceValueChanges(e)}"
                      marker_limit="${this.marker_limit}"
                      suffix="#"
                      min="1"
                      max="${this.concurrency_limit}"
                      value="${this.session_request}"
                    ></lablup-slider>
                  </div>
                </div>
              </div>
            </lablup-expansion>
            ${this.cluster_support
              ? html`
                  <mwc-select
                    id="cluster-mode"
                    label="${_text('session.launcher.ClusterMode')}"
                    required
                    icon="account_tree"
                    fixedMenuPosition
                    value="${this.cluster_mode}"
                    @change="${(e) => this._setClusterMode(e)}"
                  >
                    ${this.cluster_mode_list.map(
                      (item) => html`
                        <mwc-list-item
                          class="cluster-mode-dropdown"
                          ?selected="${item === this.cluster_mode}"
                          id="${item}"
                          value="${item}"
                        >
                          <div
                            class="horizontal layout center"
                            style="width:100%;"
                          >
                            <p style="width:300px;margin-left:21px;">
                              ${item === 'single-node'
                                ? _t('session.launcher.SingleNode')
                                : _t('session.launcher.MultiNode')}
                            </p>
                            <mwc-icon-button
                              icon="info"
                              @click="${(e) =>
                                this._showResourceDescription(e, item)}"
                            ></mwc-icon-button>
                          </div>
                        </mwc-list-item>
                      `,
                    )}
                  </mwc-select>
                  <div class="horizontal layout center flex center-justified">
                    <div>
                      <mwc-list-item
                        class="resource-type"
                        style="pointer-events: none;"
                      >
                        <div class="resource-type">
                          ${_t('session.launcher.ClusterSize')}
                        </div>
                      </mwc-list-item>
                      <hr class="separator" />
                      <div class="slider-list-item">
                        <lablup-slider
                          id="cluster-size"
                          class="cluster"
                          pin
                          snaps
                          expand
                          editable
                          markers
                          step="1"
                          marker_limit="${this.marker_limit}"
                          min="${this.cluster_metric.min}"
                          max="${this.cluster_metric.max}"
                          value="${this.cluster_size}"
                          @change="${(e) =>
                            this._applyResourceValueChanges(e, false)}"
                          suffix="${this.cluster_mode === 'single-node'
                            ? _text('session.launcher.Container')
                            : _text('session.launcher.Node')}"
                        ></lablup-slider>
                      </div>
                    </div>
                  </div>
                `
              : html``}
            <lablup-expansion name="hpc-option-group">
              <span slot="title">
                ${_t('session.launcher.HPCOptimization')}
              </span>
              <div class="vertical center layout">
                <div class="horizontal center center-justified flex layout">
                  <div style="width:313px;">
                    ${_t('session.launcher.SwitchOpenMPoptimization')}
                  </div>
                  <mwc-switch
                    id="OpenMPswitch"
                    selected
                    @click="${this._toggleHPCOptimization}"
                  ></mwc-switch>
                </div>
                <div id="HPCOptimizationOptions" style="display:none;">
                  <div class="horizontal center layout">
                    <div style="width:200px;">
                      ${_t('session.launcher.NumOpenMPthreads')}
                    </div>
                    <mwc-textfield
                      id="OpenMPCore"
                      type="number"
                      placeholder="1"
                      value=""
                      min="0"
                      max="1000"
                      step="1"
                      style="width:120px;"
                      pattern="[0-9]+"
                      @change="${(e) => this._validateInput(e)}"
                    ></mwc-textfield>
                    <mwc-icon-button
                      icon="info"
                      class="fg green info"
                      @click="${(e) =>
                        this._showResourceDescription(
                          e,
                          'openmp-optimization',
                        )}"
                    ></mwc-icon-button>
                  </div>
                  <div class="horizontal center layout">
                    <div style="width:200px;">
                      ${_t('session.launcher.NumOpenBLASthreads')}
                    </div>
                    <mwc-textfield
                      id="OpenBLASCore"
                      type="number"
                      placeholder="1"
                      value=""
                      min="0"
                      max="1000"
                      step="1"
                      style="width:120px;"
                      pattern="[0-9]+"
                      @change="${(e) => this._validateInput(e)}"
                    ></mwc-textfield>
                    <mwc-icon-button
                      icon="info"
                      class="fg green info"
                      @click="${(e) =>
                        this._showResourceDescription(
                          e,
                          'openmp-optimization',
                        )}"
                    ></mwc-icon-button>
                  </div>
                </div>
              </div>
            </lablup-expansion>
          </div>
          <div id="progress-04" class="progress center layout fade">
            <p class="title">${_t('session.SessionInfo')}</p>
            <div class="vertical layout cluster-total-allocation-container">
              ${this._preProcessingSessionInfo()
                ? html`
                    <div
                      class="vertical layout"
                      style="margin-left:10px;margin-bottom:5px;"
                    >
                      <div class="horizontal layout">
                        <div style="margin-right:5px;width:150px;">
                          ${_t('session.EnvironmentInfo')}
                        </div>
                        <div class="vertical layout">
                          <lablup-shields
                            app="${(
                              this.resourceBroker.imageInfo[
                                this.sessionInfoObj.environment
                              ]?.name || this.sessionInfoObj.environment
                            ).toUpperCase()}"
                            color="green"
                            description="${this.sessionInfoObj.version[0]}"
                            ui="round"
                            style="margin-right:3px;"
                          ></lablup-shields>
                          <div class="horizontal layout">
                            ${this.sessionInfoObj.version.map((item, index) => {
                              if (index > 0) {
                                return html`
                                  <lablup-shields
                                    color="green"
                                    description="${item}"
                                    ui="round"
                                    style="margin-top:3px;margin-right:3px;"
                                  ></lablup-shields>
                                `;
                              } else {
                                return html``;
                              }
                            })}
                          </div>
                          <lablup-shields
                            color="blue"
                            description="${this.mode === 'inference'
                              ? this.mode.toUpperCase()
                              : this.sessionType.toUpperCase()}"
                            ui="round"
                            style="margin-top:3px;margin-right:3px;margin-bottom:9px;"
                          ></lablup-shields>
                        </div>
                      </div>
                      <div class="horizontal layout">
                        <div
                          class="vertical layout"
                          style="margin-right:5px;width:150px;"
                        >
                          ${_t('registry.ProjectName')}
                        </div>
                        <div class="vertical layout">
                          ${globalThis.backendaiclient?.current_group}
                        </div>
                      </div>
                      <div class="horizontal layout">
                        <div
                          class="vertical layout"
                          style="margin-right:5px;width:150px;"
                        >
                          ${_t('session.ResourceGroup')}
                        </div>
                        <div class="vertical layout">${this.scaling_group}</div>
                      </div>
                    </div>
                  `
                : html``}
            </div>
            <p class="title">${_t('session.launcher.TotalAllocation')}</p>
            <div
              class="vertical layout center center-justified cluster-total-allocation-container"
            >
              <div
                id="cluster-allocation-pane"
                style="position:relative;${this.cluster_size <= 1
                  ? 'display:none;'
                  : ''}"
              >
                <div class="horizontal layout resource-allocated-box">
                  <div
                    class="vertical layout center center-justified resource-allocated"
                  >
                    <p>${_t('session.launcher.CPU')}</p>
                    <span>
                      ${this.cpu_request *
                      this.cluster_size *
                      this.session_request}
                    </span>
                    <p>Core</p>
                  </div>
                  <div
                    class="vertical layout center center-justified resource-allocated"
                  >
                    <p>${_t('session.launcher.Memory')}</p>
                    <span>
                      ${this._roundResourceAllocation(
                        this.mem_request *
                          this.cluster_size *
                          this.session_request,
                        1,
                      )}
                    </span>
                    <p>GiB</p>
                  </div>
                  <div
                    class="vertical layout center center-justified resource-allocated"
                  >
                    <p>${_t('session.launcher.SharedMemoryAbbr')}</p>
                    <span>
                      ${this._conditionalGiBtoMiB(
                        this.shmem_request *
                          this.cluster_size *
                          this.session_request,
                      )}
                    </span>
                    <p>
                      ${this._conditionalGiBtoMiBunit(
                        this.shmem_request *
                          this.cluster_size *
                          this.session_request,
                      )}
                    </p>
                  </div>
                  <div
                    class="vertical layout center center-justified resource-allocated"
                  >
                    <p>${this._acceleratorName(this.gpu_request_type)}</p>
                    <span>
                      ${this._roundResourceAllocation(
                        this.gpu_request *
                          this.cluster_size *
                          this.session_request,
                        2,
                      )}
                    </span>
                    <p>${_t('session.launcher.GPUSlot')}</p>
                  </div>
                </div>
                <div style="height:1em"></div>
              </div>
              <div
                id="total-allocation-container"
                class="horizontal layout center center-justified allocation-check"
              >
                <div id="total-allocation-pane" style="position:relative;">
                  <div class="horizontal layout">
                    <div
                      class="vertical layout center center-justified resource-allocated"
                    >
                      <p>${_t('session.launcher.CPU')}</p>
                      <span>${this.cpu_request}</span>
                      <p>Core</p>
                    </div>
                    <div
                      class="vertical layout center center-justified resource-allocated"
                    >
                      <p>${_t('session.launcher.Memory')}</p>
                      <span>
                        ${this._roundResourceAllocation(this.mem_request, 1)}
                      </span>
                      <p>GiB</p>
                    </div>
                    <div
                      class="vertical layout center center-justified resource-allocated"
                    >
                      <p>${_t('session.launcher.SharedMemoryAbbr')}</p>
                      <span>
                        ${this._conditionalGiBtoMiB(this.shmem_request)}
                      </span>
                      <p>
                        ${this._conditionalGiBtoMiBunit(this.shmem_request)}
                      </p>
                    </div>
                    <div
                      class="vertical layout center center-justified resource-allocated"
                    >
                      <p>${this._acceleratorName(this.gpu_request_type)}</p>
                      <span>${this.gpu_request}</span>
                      <p>${_t('session.launcher.GPUSlot')}</p>
                    </div>
                  </div>
                  <div id="resource-allocated-box-shadow"></div>
                </div>
                <div
                  class="vertical layout center center-justified cluster-allocated"
                  style="z-index:10;"
                >
                  <div class="horizontal layout">
                    <p>×</p>
                    <span>
                      ${this.cluster_size <= 1
                        ? this.session_request
                        : this.cluster_size}
                    </span>
                  </div>
                  <p class="small">${_t('session.launcher.Container')}</p>
                </div>
                <div
                  class="vertical layout center center-justified cluster-allocated"
                  style="z-index:10;"
                >
                  <div class="horizontal layout">
                    <p>${this.cluster_mode === 'single-node' ? '' : ''}</p>
                    <span style="text-align:center;">
                      ${this.cluster_mode === 'single-node'
                        ? _t('session.launcher.SingleNode')
                        : _t('session.launcher.MultiNode')}
                    </span>
                  </div>
                  <p class="small">${_t('session.launcher.AllocateNode')}</p>
                </div>
              </div>
            </div>
            ${this.mode !== 'inference'
              ? html`
                  <p class="title">${_t('session.launcher.MountedFolders')}</p>
                  <div
                    id="mounted-folders-container"
                    class="cluster-total-allocation-container"
                  >
                    ${this.selectedVfolders.length > 0 ||
                    this.autoMountedVfolders.length > 0
                      ? html`
                          <ul class="vfolder-list">
                            ${this.selectedVfolders.map(
                              (item) => html`
                                <li>
                                  <mwc-icon>folder_open</mwc-icon>
                                  ${item}
                                  ${item in this.folderMapping
                                    ? this.folderMapping[item].startsWith('/')
                                      ? html`
                                          (&#10140; ${this.folderMapping[item]})
                                        `
                                      : html`
                                          (&#10140;
                                          /home/work/${this.folderMapping[
                                            item
                                          ]})
                                        `
                                    : html`
                                        (&#10140; /home/work/${item})
                                      `}
                                </li>
                              `,
                            )}
                            ${this.autoMountedVfolders.map(
                              (item) => html`
                                <li>
                                  <mwc-icon>folder_special</mwc-icon>
                                  ${item.name}
                                </li>
                              `,
                            )}
                          </ul>
                        `
                      : html`
                          <div class="vertical layout center flex blank-box">
                            <span>
                              ${_t('session.launcher.NoFolderMounted')}
                            </span>
                          </div>
                        `}
                  </div>
                `
              : html``}
            <p class="title">
              ${_t('session.launcher.EnvironmentVariablePaneTitle')}
            </p>
            <div
              class="environment-variables-container cluster-total-allocation-container"
            >
              ${this.environ.length > 0
                ? html`
                    <div
                      class="horizontal flex center center-justified layout"
                      style="overflow-x:hidden;"
                    >
                      <div role="listbox">
                        <h4>
                          ${_text('session.launcher.EnvironmentVariable')}
                        </h4>
                        ${this.environ.map(
                          (item) => html`
                            <mwc-textfield
                              disabled
                              value="${item.name}"
                            ></mwc-textfield>
                          `,
                        )}
                      </div>
                      <div role="listbox" style="margin-left:15px;">
                        <h4>
                          ${_text('session.launcher.EnvironmentVariableValue')}
                        </h4>
                        ${this.environ.map(
                          (item) => html`
                            <mwc-textfield
                              disabled
                              value="${item.value}"
                            ></mwc-textfield>
                          `,
                        )}
                      </div>
                    </div>
                  `
                : html`
                    <div class="vertical layout center flex blank-box">
                      <span>${_t('session.launcher.NoEnvConfigured')}</span>
                    </div>
                  `}
            </div>
            ${this.maxCountForPreopenPorts > 0
              ? html`
                  <p class="title">
                    ${_t('session.launcher.PreOpenPortPanelTitle')}
                  </p>
                  <div
                    class="preopen-ports-container cluster-total-allocation-container"
                  >
                    ${this.preOpenPorts.length > 0
                      ? html`
                          <div
                            class="horizontal flex center layout"
                            style="overflow-x:hidden;margin:auto 5px;"
                          >
                            ${this.preOpenPorts.map(
                              (port) => html`
                                <lablup-shields
                                  color="lightgrey"
                                  description="${port}"
                                  style="padding:4px;"
                                ></lablup-shields>
                              `,
                            )}
                          </div>
                        `
                      : html`
                          <div class="vertical layout center flex blank-box">
                            <span>
                              ${_t('session.launcher.NoPreOpenPortsConfigured')}
                            </span>
                          </div>
                        `}
                  </div>
                `
              : html``}
          </div>
        </form>
        <div slot="footer" class="vertical flex layout">
          <div class="horizontal flex layout distancing center-center">
            <mwc-icon-button
              id="prev-button"
              icon="arrow_back"
              style="visibility:hidden;margin-right:12px;"
              @click="${() => this.moveProgress(-1)}"
            ></mwc-icon-button>
            <mwc-button
              unelevated
              class="launch-button"
              id="launch-button"
              icon="rowing"
              @click="${() => this._newSessionWithConfirmation()}"
            >
              <span id="launch-button-msg">
                ${this.launchButtonMessageTextContent}
              </span>
            </mwc-button>
            <mwc-icon-button
              id="next-button"
              icon="arrow_forward"
              style="margin-left:12px;"
              @click="${() => this.moveProgress(1)}"
            ></mwc-icon-button>
          </div>
          <div class="horizontal flex layout">
            <lablup-progress-bar
              progress="${this._calculateProgress()}"
            ></lablup-progress-bar>
          </div>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="modify-env-dialog"
        fixed
        backdrop
        persistent
        closeWithConfirmation
      >
        <span slot="title">
          ${_t('session.launcher.SetEnvironmentVariable')}
        </span>
        <span slot="action">
          <mwc-icon-button
            icon="info"
            @click="${(e) => this._showEnvConfigDescription(e)}"
            style="pointer-events: auto;"
          ></mwc-icon-button>
        </span>
        <div slot="content" id="modify-env-container">
          <div class="horizontal layout center flex justified header">
            <div>${_t('session.launcher.EnvironmentVariable')}</div>
            <div>${_t('session.launcher.EnvironmentVariableValue')}</div>
          </div>
          <div id="modify-env-fields-container" class="layout center">
            ${this.environ.forEach(
              (item: any) => html`
                <div class="horizontal layout center row">
                  <mwc-textfield value="${item.name}"></mwc-textfield>
                  <mwc-textfield value="${item.value}"></mwc-textfield>
                  <mwc-icon-button
                    class="green minus-btn"
                    icon="remove"
                    @click="${(e) => this._removeEnvItem(e)}"
                  ></mwc-icon-button>
                </div>
              `,
            )}
            <div class="horizontal layout center row">
              <mwc-textfield></mwc-textfield>
              <mwc-textfield></mwc-textfield>
              <mwc-icon-button
                class="green minus-btn"
                icon="remove"
                @click="${(e) => this._removeEnvItem(e)}"
              ></mwc-icon-button>
            </div>
          </div>
          <mwc-button
            id="env-add-btn"
            outlined
            icon="add"
            class="horizontal flex layout center"
            @click="${() => this._appendEnvRow()}"
          >
            Add
          </mwc-button>
        </div>
        <div slot="footer" class="horizontal layout">
          <mwc-button
            class="delete-all-button"
            slot="footer"
            icon="delete"
            style="width:100px"
            label="${_text('button.Reset')}"
            @click="${() => this._clearEnvRows()}"
          ></mwc-button>
          <mwc-button
            unelevated
            slot="footer"
            icon="check"
            style="width:100px"
            label="${_text('button.Save')}"
            @click="${() => this.modifyEnv()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="modify-preopen-ports-dialog"
        fixed
        backdrop
        persistent
        closeWithConfirmation
      >
        <span slot="title">${_t('session.launcher.SetPreopenPorts')}</span>
        <span slot="action">
          <mwc-icon-button
            icon="info"
            @click="${(e) => this._showPreOpenPortConfigDescription(e)}"
            style="pointer-events: auto;"
          ></mwc-icon-button>
        </span>
        <div slot="content" id="modify-preopen-ports-container">
          <div class="horizontal layout center flex justified header">
            <div>${_t('session.launcher.PortsTitleWithRange')}</div>
          </div>
          <div class="layout center">
            ${this.preOpenPorts.forEach(
              (item: number) => html`
                <div class="horizontal layout center row">
                  <mwc-textfield
                    value="${item}"
                    type="number"
                    min="1024"
                    max="65535"
                  ></mwc-textfield>
                  <mwc-icon-button
                    class="green minus-btn"
                    icon="remove"
                    @click="${(e) => this._removePreOpenPortItem(e)}"
                  ></mwc-icon-button>
                </div>
              `,
            )}
            <div class="horizontal layout center row">
              <mwc-textfield
                type="number"
                min="1024"
                max="65535"
              ></mwc-textfield>
              <mwc-icon-button
                class="green minus-btn"
                icon="remove"
                @click="${(e) => this._removePreOpenPortItem(e)}"
              ></mwc-icon-button>
            </div>
          </div>
          <mwc-button
            id="preopen-ports-add-btn"
            outlined
            icon="add"
            class="horizontal flex layout center"
            ?disabled="${this.isExceedMaxCountForPreopenPorts}"
            @click="${() => this._appendPreOpenPortRow()}"
          >
            Add
          </mwc-button>
        </div>
        <div slot="footer" class="horizontal layout">
          <mwc-button
            class="delete-all-button"
            slot="footer"
            icon="delete"
            style="width:100px"
            label="${_text('button.Reset')}"
            @click="${() => this._clearPreOpenPortRows()}"
          ></mwc-button>
          <mwc-button
            unelevated
            slot="footer"
            icon="check"
            style="width:100px"
            label="${_text('button.Save')}"
            @click="${() => this.modifyPreOpenPorts()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="help-description" fixed backdrop>
        <span slot="title">${this._helpDescriptionTitle}</span>
        <div
          slot="content"
          class="horizontal layout center"
          style="margin:5px;"
        >
          ${this._helpDescriptionIcon == ''
            ? html``
            : html`
                <img
                  slot="graphic"
                  alt="help icon"
                  src="resources/icons/${this._helpDescriptionIcon}"
                  style="width:64px;height:64px;margin-right:10px;"
                />
              `}
          <div style="font-size:14px;">
            ${unsafeHTML(this._helpDescription)}
          </div>
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
            @click="${() => this._newSession()}"
          >
            ${_t('session.launcher.Launch')}
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
            label="${_text('button.Cancel')}"
            @click="${() => this.closeDialog('env-config-confirmation')}"
            style="width:auto;margin-right:10px;"
          ></mwc-button>
          <mwc-button
            unelevated
            id="env-config-reset-button"
            label="${_text('button.DismissAndProceed')}"
            @click="${() => this._closeAndResetEnvInput()}"
            style="width:auto;"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="preopen-ports-config-confirmation" warning fixed>
        <span slot="title">${_t('dialog.title.LetsDouble-Check')}</span>
        <div slot="content">
          <p>${_t('session.launcher.PrePortConfigWillDisappear')}</p>
          <p>${_t('dialog.ask.DoYouWantToProceed')}</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
            id="preopen-ports-remain-button"
            label="${_text('button.Cancel')}"
            @click="${() =>
              this.closeDialog('preopen-ports-config-confirmation')}"
            style="width:auto;margin-right:10px;"
          ></mwc-button>
          <mwc-button
            unelevated
            id="preopen-ports-config-reset-button"
            label="${_text('button.DismissAndProceed')}"
            @click="${() => this._closeAndResetPreOpenPortInput()}"
            style="width:auto;"
          ></mwc-button>
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
