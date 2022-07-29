/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';

import PipelineUtils from '../lib/pipeline-utils';
import '../lib/pipeline-login';
import '../../components/backend-ai-dialog';
import '../../components/lablup-activity-panel';
import '../../components/lablup-codemirror';
import {BackendAIPage} from '../../components/backend-ai-page';
import {BackendAiStyles} from '../../components/backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../../plastics/layout/iron-flex-layout-classes';
import {default as YAML} from 'js-yaml';

import '@material/mwc-button';
import '@material/mwc-icon/mwc-icon';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-list/mwc-check-list-item';
import '@material/mwc-select';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';
import '@material/mwc-textarea';
import '@material/mwc-textfield';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column';

import 'weightless/expansion';

/**
 Pipeline List

 `pipeline-list` is fetches and lists of created/imported pipelines

 Example:

 <pipeline-list>
 ...
 </pipeline-list>

@group Backend.AI pipeline
 @element pipeline-list
*/
@customElement('pipeline-list')
export default class PipelineList extends BackendAIPage {
  public shadowRoot: any; // ShadowRoot
  @property({type: Array}) pipelineTypes = ['Custom']; //
  @property({type: Object}) pipelineInfo = Object();
  @property({type: Array}) pipelines = [];
  @property({type: Object}) userInfo;
  @query('vaadin-grid#pipeline-list') pipelineGrid;
  @property({type: String}) _activeTab = 'pipeline-general';
  @property({type: String}) pipelineUserId = '';
  @property({type: String}) pipelineUserPassword = '';

  // Elements
  @property({type: Object}) spinner = Object();
  @property({type: Object}) notification = Object();
  // Environments
  @property({type: Object}) tags = Object();
  @property({type: String}) defaultLanguage = '';
  @property({type: Boolean}) _defaultLanguageUpdated = false;
  @property({type: Boolean}) _defaultVersionUpdated = false;
  @property({type: String}) scalingGroup = '';
  @property({type: Array}) scalingGroups = ['default'];
  @property({type: String}) selectedStorageHost;
  @property({type: Array}) allowedStorageHostList;
  @property({type: Object}) images = Object();
  @property({type: Object}) imageInfo = Object();
  @property({type: Object}) imageNames = Object();
  @property({type: Object}) imageRequirements = Object();
  @property({type: String}) kernel = '';
  @property({type: Array}) languages;
  @property({type: Array}) versions;
  @property({type: String}) _helpDescription = '';
  @property({type: String}) _helpDescriptionTitle = '';
  @property({type: String}) _helpDescriptionIcon = '';
  @property({type: Object}) resourceLimits = Object();
  @property({type: Object}) supports = Object();
  @property({type: Object}) aliases = Object();
  @property({type: Object}) resourceBroker;
  @property({type: Array}) vfolders;
  @property({type: Array}) selectedVfolders;
  @property({type: Array}) autoMountedVfolders;
  @property({type: Array}) nonAutoMountedVfolders;
  @property({type: Object}) folderMapping = Object();
  @property({type: Boolean}) metricUpdating;
  @query('#pipeline-environment') private _environment;
  @query('#pipeline-environment-tag') private _versionSelector;
  @query('mwc-tab[title="pipeline-general"]', true) private _pipelineGeneralTab;
  @query('mwc-tab[title="pipeline-resources"]', true) private _pipelineResourcesTab;
  @query('mwc-tab[title="pipeline-mounts"]', true) private _pipelineMountsTab;
  @query('#vfolder-grid') vfolderGrid;

  @query('#pipeline-name') private _pipelineNameInput;
  @query('#pipeline-type') private _pipelineType;
  @query('#pipeline-description') private _pipelineDescriptionInput;
  @query('#pipeline-scaling-group') private _pipelineScalingGroupSelect;
  @query('#pipeline-cpu') private _pipelineCpuInput;
  @query('#pipeline-mem') private _pipelineMemInput;
  @query('#pipeline-shmem') private _pipelineShmemInput;
  @query('#pipeline-gpu') private _pipelineGpuInput;
  @query('#pipeline-storage-mount') private _pipelineStorageMountSelect;
  @query('#pipeline-mount-folder') private _pipelineMountFolderNameInput;

  private _isLaunchable = false;

  @property({type: Object}) _boundNameRenderer = this.nameRenderer.bind(this);
  @property({type: Object}) _boundIndexRenderer = this.indexRenderer.bind(this);
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);
  @property({type: Object}) _boundCreateAtRenderer = this.createdAtRenderer.bind(this);
  @property({type: Object}) _boundModifiedAtRenderer = this.modifiedAtRenderer.bind(this);
  @property({type: Object}) _boundFolderToMountListRenderer = this.folderToMountListRenderer.bind(this);
  @property({type: Object}) _boundFolderMapRenderer = this.folderMapRenderer.bind(this);
  @property({type: Object}) _boundPathRenderer = this.infoHeaderRenderer.bind(this);

  constructor() {
    super();
    this._initResource();
    this.notification = globalThis.lablupNotification;
    this.resourceBroker = globalThis.resourceBroker;
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
        .description {
          color: black;
        }

        .login-input {
          background-color: #FAFAFA;
          border-bottom: 1px solid #ccc;
          height: 50px;
        }

        .login-input mwc-icon {
          margin: 5px 15px 5px 15px;
          color: #737373;
        }

        .login-input input {
          width: 100%;
          background-color: #FAFAFA;
          margin-bottom: 5px;
          font-size: 18px;
          margin-top: 5px;
        }

        .tab-content {
          width: 100%;
        }

        .title {
          color: #666;
        }

        .pipeline-detail-items {
          margin-bottom: 10px;
        }

        #login-title-area {
          margin: 10px;
        }

        #vfolder {
          width: 100%;
        }

        #vfolder mwc-list-item[disabled] {
          background-color: rgba(255, 0, 0, 0.04) !important;
        }

        #vfolder-header-title {
          text-align: center;
          font-size: 16px;
          font-family: var(--general-font-family);
          font-weight: 500;
        }

        a.pipeline-link:hover {
          color: var(--general-textfield-selected-color);
        }

        backend-ai-dialog {
          --component-min-width: 390px;
          --component-max-width: 390px;
        }

        backend-ai-dialog.yaml {
          --component-min-width: auto;
          --component-max-width: 100%;
        }

        form#pipeline-server-login-form {
          width: 100%;
        }

        fieldset input {
          width: 100%;
          border: 0;
          margin: 15px 0 0 0;
          font: inherit;
          font-size: 16px;
          outline: none;
        }

        mwc-button {
          margin: 10px;
        }

        mwc-button.full-width {
          width: 100%;
        }

        mwc-select.full-width {
          width: 100%;
          font-family: var(--general-font-family);
          background-color: var(--mdc-text-field-fill-color, whitesmoke);
          --mdc-theme-primary: var(--general-sidebar-color);
          --mdc-menu-item-height: auto;
          /* Need to be set when fixedMenuPosition attribute is enabled */
          --mdc-menu-max-width: 390px;
          --mdc-menu-min-width: 390px;
        }

        mwc-tab-bar {
          height: 50px !important;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
        }

        mwc-tab {
          height: 50px !important;
        }

        mwc-textfield,
        mwc-textarea {
          width: 100%;
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

        /** disabled when all-rows-visible attribute enabled */
        vaadin-grid {
          max-height: 450px;
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

        wl-expansion.vfolder {
          --expansion-content-padding: 0;
          border-bottom: 1px;
        }

        wl-expansion span {
          font-size: 20px;
          font-weight: 200;
          display: block;
        }
      `
    ];
  }

  _initResource() {
    this.aliases = {
      'TensorFlow': 'python-tensorflow',
      'NGC-TensorFlow': 'ngc-tensorflow',
      'PyTorch': 'python-pytorch',
      'NGC-PyTorch': 'ngc-pytorch',
      'Lablup Research Env.': 'python-ff',
      'Python': 'python',
    };
    this.allowedStorageHostList = [];
    this.autoMountedVfolders = [];
    this.languages = [];
    this.nonAutoMountedVfolders = [];
    this.pipelines = [];
    this.selectedVfolders = [];
    this.selectedStorageHost = '';
    this.vfolders = [];
    this.versions = ['Not Selected'];
  }

  firstUpdated() {
    fetch('resources/image_metadata.json')
      .then(
        (resp) => resp.json()
      )
      .then((json) => {
        this.imageInfo = json.imageInfo;
        for (const key in this.imageInfo) {
          if ({}.hasOwnProperty.call(this.imageInfo, key)) {
            this.tags[key] = [];
            if ('name' in this.imageInfo[key]) {
              this.aliases[key] = this.imageInfo[key].name;
              this.imageNames[key] = this.imageInfo[key].name;
            }
            if ('label' in this.imageInfo[key]) {
              this.imageInfo[key].label.forEach((item) => {
                if (!('category' in item)) {
                  this.tags[key].push(item.tag);
                }
              });
            }
          }
        }
      });
    this._environment.addEventListener(
      'selected', this.updateLanguage.bind(this));
    this._versionSelector.addEventListener('selected', () => {
      this.updateEnvironmentSetting();
    });
  }

  /**
   * Update environment setting
   *
   */
  async updateEnvironmentSetting() {
    if (this.metricUpdating == true) {
      // console.log('update metric blocked');
      return;
    }
    const selectedItem = this._environment.selected;
    const selectedVersionItem = this._versionSelector.selected;
    // Pulldown is not ready yet.
    if (selectedVersionItem === null) {
      this.metricUpdating = false;
      return;
    }
    const selectedVersionValue = selectedVersionItem.value;
    const selectedVersionArchitecture = selectedVersionItem.getAttribute('architecture');
    this._update_versionSelectorText(selectedVersionValue, selectedVersionArchitecture);
    // Environment is not selected yet.
    if (typeof selectedItem === 'undefined' || selectedItem === null || selectedItem.getAttribute('disabled')) {
      this.metricUpdating = false;
      return;
    }
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.updateEnvironmentSetting();
      }, true);
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._fetchUserInfo();
        this._loadPipelineList();
        this._enableLaunchButton();
      }, {once: true});
    } else { // already connected
      this._fetchUserInfo();
      this._loadPipelineList();
      this._enableLaunchButton();
    }
  }

  _enableLaunchButton() {
    if (!this.resourceBroker.image_updating) { // Image information is successfully updated.
      this.languages = this.resourceBroker.languages;
      this._isLaunchable = true;
    } else {
      this._isLaunchable = false;
      setTimeout(() => {
        this._enableLaunchButton();
      }, 500);
    }
  }

  /**
   * Select fallback(default) image
   *
   * @param {boolean} forceUpdate - only update default language when its value is true
   * @param {string} language - default language
   */
  async selectDefaultLanguage(forceUpdate = false, language = '') {
    if (this._defaultLanguageUpdated === true && forceUpdate === false) {
      return;
    }
    if (language !== '') {
      this.defaultLanguage = language;
    } else if (globalThis.backendaiclient._config.default_session_environment !== undefined &&
      'default_session_environment' in globalThis.backendaiclient._config &&
      globalThis.backendaiclient._config.default_session_environment !== '') {
      this.defaultLanguage = globalThis.backendaiclient._config.default_session_environment;
    } else if (this.languages.length > 1) {
      this.defaultLanguage = this.languages[1].name;
    } else if (this.languages.length !== 0) {
      this.defaultLanguage = this.languages[0].name;
    } else {
      this.defaultLanguage = 'cr.backend.ai/stable/python';
    }
    // await environment.updateComplete; async way.
    const obj = this._environment.items.find((o) => o.value === this.defaultLanguage);
    if (typeof obj === 'undefined' && typeof globalThis.backendaiclient !== 'undefined' && globalThis.backendaiclient.ready === false) { // Not ready yet.
      setTimeout(() => {
        console.log('Environment selector is not ready yet. Trying to set the default language again.');
        return this.selectDefaultLanguage(forceUpdate, language);
      }, 500);
      return Promise.resolve(true);
    }
    const idx = this._environment.items.indexOf(obj);
    this._environment.select(idx);
    this._defaultLanguageUpdated = true;
    return Promise.resolve(true);
  }

  /**
   * Convert raw kernel name to formatted one
   *
   * @param {string} kernelName - raw kernel name
   * @return {string} humanizedName - kernel name with a certain format
   */
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
      } else if (imageName === '' && kernelName.endsWith(item) && item.length < matchedString.length) {
        humanizedName = candidate[item];
        matchedString = item;
      }
    });
    return humanizedName;
  }

  /**
   * Combine kernel and version
   *
   * @param {string} kernel - kernel name
   * @param {string} version - version
   * @return {string} `${kernel}:${version}`
   */
  _generateKernelIndex(kernel, version) {
    return kernel + ':' + version;
  }

  _validatePipelineConfigInput() {
    const validityCheckByGroup = (inputGroup: Array<any>) => {
      return inputGroup.some((elem) => {
        return !elem.reportValidity();
      });
    };

    // general tab inputs
    if (validityCheckByGroup(
      [this._pipelineNameInput, this._pipelineType, this._pipelineScalingGroupSelect, 
      this._environment, this._versionSelector, this._pipelineDescriptionInput])) {
        this._switchActiveTab(this._pipelineGeneralTab);
        return false;
    }

    // resources tab inputs
    if (validityCheckByGroup(
      [this._pipelineCpuInput, this._pipelineMemInput, this._pipelineShmemInput, 
       this._pipelineGpuInput])) {
        this._switchActiveTab(this._pipelineResourcesTab);
        return false;
    }

    // mounts tab inputs
    if (validityCheckByGroup(
      [this._pipelineStorageMountSelect, this._pipelineMountFolderNameInput])) {
        this._switchActiveTab(this._pipelineMountsTab);
        return false;
    }

    // all passed validation check
    return true;
  }

  /**
   * Create a pipeline
   */
  _createPipeline() {
    if (!this._validatePipelineConfigInput()) {
      return;
    }
    
    // FIXME: for now, we only support custom type pipeline creation.
    if (this._pipelineType.value === 'Custom') {
      const name = this._pipelineNameInput.value;
      const description = this._pipelineDescriptionInput.value;
      const scalingGroup = this._pipelineScalingGroupSelect.value;
      const kernel = this._environment.value;
      const version = this._versionSelector.value;
      const cpuRequest = parseInt(this._pipelineCpuInput.value);
      const memRequest = parseFloat(this._pipelineMemInput.value);
      const shmemRequest = parseFloat(this._pipelineShmemInput.value);
      const gpuRequest = parseFloat(this._pipelineGpuInput.value);
      const storageHost = this._pipelineStorageMountSelect.value;
      const storageHostMountFolderName = this._pipelineMountFolderNameInput.value;
      const environment = {
        scaling_group: scalingGroup,
        image: this._generateKernelIndex(kernel, version),
        envs: {},
      };
      const resources = {
        cpu: cpuRequest,
        mem: memRequest + 'g',
        cuda: {
          shares: gpuRequest,
          device: ''
        },
      };
      const resource_opts = {
        shmem: shmemRequest + 'g'
      };
      const storage = {
        host: storageHost,
        name: storageHostMountFolderName
      }
      const mounts = this.selectedVfolders;
      const yaml = { // used for tasks
        name: name,
        description: description,
        ownership: {
          domain_name: this.userInfo.domain_name,
          group_name: this.userInfo.group_name,
        },
        environment: environment,
        resources: resources,
        resource_opts: resource_opts,
        mounts: mounts,
        tasks: [], // this will be handled in server-side
      };
  
      this.pipelineInfo = {
        name: name,
        description: description,
        storage: storage,
        yaml: JSON.stringify(yaml),
        dataflow: {}, // used for graph visualization
        is_active: true,
      };
      globalThis.backendaiclient.pipeline.create(this.pipelineInfo).then((res) => {
        this.pipelineInfo = res;
        this.notification.text = `Pipeline ${this.pipelineInfo.name} created.`;
        this.notification.show();
        this._loadPipelineList();
        // move to pipeline view page with current pipeline info
        this.moveToViewTab();
        this.pipelineInfo = {};
      }).catch((err) => {
        console.log(err);
        this.notification.text = `Pipeline Creation failed. Check Input or server status.`;
        this.notification.show(true);
      }).finally(() => {
        this._hideDialogById('#create-pipeline');
      });
    }
  }

  /**
   * Delete selected pipeline
   */
  _deletePipeline() {
    globalThis.backendaiclient.pipeline.delete(this.pipelineInfo.id).then((res) => {
      this.notification.text = `Pipeline ${this.pipelineInfo.name} deleted.`;
      this.notification.show();
      this.pipelineInfo = {};
      this._loadPipelineList();
    }).catch((err) => {
      console.log(err);
    });
    this._hideDialogById('#delete-pipeline');
  }

  /**
   * Initialize user info
   */
  _fetchUserInfo() {
    return globalThis.backendaiclient.user.get(globalThis.backendaiclient.email, ['full_name', 'username', 'domain_name', 'id']).then((res) => {
      const userInfo = res.user;
      this.userInfo = {
        // username: userInfo.full_name ? userInfo.full_name : userInfo.username,
        domain_name: userInfo.domain_name,
        group_name: globalThis.backendaiclient.current_group,
        // user_uuid: userInfo.id
      };
    }).catch((err) => {
      console.log(err);
    });
  }

  /**
   * Get Pipeline list from pipeline server
   *
   */
  async _loadPipelineList() {
    const sanitizeYaml = (yaml) => {
      if (typeof yaml === 'string') {
        return (yaml === '') ? {} : JSON.parse(yaml);
      } else {
        // already parsed
        return yaml;
      }
    };
    try {
      const pipelineList = await globalThis.backendaiclient.pipeline.list();
      this.pipelines = pipelineList.map((pipeline) => {
        pipeline.yaml = sanitizeYaml(pipeline.yaml);
        // data transformation on yaml and date (created_at, last_modified)
        pipeline.created_at = PipelineUtils._humanReadableDate(pipeline.created_at);
        pipeline.last_modified = PipelineUtils._humanReadableDate(pipeline.last_modified);
        return pipeline;
      });
      this.requestUpdate();
    } catch (err) {
      this.notification.text = err.message;
      this.notification.show();
      const event = new CustomEvent('backend-ai-logout', {'detail': ''});
      document.dispatchEvent(event);
    }
  }

  /**
   * Display a dialog by id.
   *
   * @param {string} id - Dialog component ID
   */
  _launchDialogById(id) {
    this.shadowRoot.querySelector(id).show();
  }

  /**
   * Hide a dialog by id.
   *
   * @param {string} id - Dialog component ID
   */
  _hideDialogById(id) {
    this.shadowRoot.querySelector(id).hide();
  }

  /**
   * Show pipeline dialog
   */
  _launchPipelineDialog() {
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      setTimeout(() => {
        this._launchPipelineDialog();
      }, 1000);
    } else {
      this.selectDefaultLanguage();
      this._updateVirtualFolderList();
      this._showTabContent(this._pipelineGeneralTab);
      this._launchDialogById('#create-pipeline');
    }
  }

  /**
   * Show information dialog of selected pipeline
   *
   * @param {json} pipelineInfo
   */
  _launchPipelineDetailDialog(pipelineInfo: Object) {
    this.pipelineInfo = pipelineInfo;
    this._launchDialogById('#pipeline-detail');
  }

  /**
   * Show delete dialog of selected pipeline
   *
   * @param {json} pipelineInfo
   */
  _launchPipelineDeleteDialog(pipelineInfo: Object) {
    this.pipelineInfo = pipelineInfo;
    this._launchDialogById('#delete-pipeline');
  }

  /**
   * Show yaml data dialog of selected pipeline
   *
   */
  _launchPipelineYAMLDialog() {
    const codemirror = this.shadowRoot.querySelector('lablup-codemirror#yaml-data');
    const yamlString = YAML.dump(this.pipelineInfo.yaml, {});
    codemirror.setValue(yamlString);
    this._launchDialogById('#pipeline-yaml');
  }

  /**
   * Update accessible vfolders
   *
   * @return {void}
   */
  async _updateVirtualFolderList() {
    return this.resourceBroker.updateVirtualFolderList().then(() => {
      this.vfolders = this.resourceBroker.vfolders;
      this.allowedStorageHostList = [...new Set(this.vfolders.map((vfolder) => (vfolder.host)))];
      // select first element of allowedStorageHostList as a default
      this.selectedStorageHost = (this.allowedStorageHostList.length > 0) ? this.allowedStorageHostList[0] : '';
      this.autoMountedVfolders = this.vfolders.filter((item) => (item.name.startsWith('.')));
      this.nonAutoMountedVfolders = this.vfolders.filter((item) => !(item.name.startsWith('.')));
      this.requestUpdate();
    });
  }

  /**
   * Render index of rowData
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  indexRenderer(root, column, rowData) {
    const idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  /**
   * Render name of rowData
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  nameRenderer(root, column, rowData) {
    render(
      html`
        <div>
          <a class="pipeline-link" @click="${()=> this.loadPipeline(rowData.item)}">${rowData.item.name}</a>
        </div>
      `,
      root
    );
  }

  /**
   * Control rendering
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  controlRenderer(root, column, rowData) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center wrap" .pipeline-id="${rowData.item.name}">
          <wl-button fab flat inverted
            class="fg green" @click="${() => this._launchPipelineDetailDialog(rowData.item)}">
            <wl-icon>info</wl-icon>
          </wl-button>
          <!--<wl-button fab flat inverted
            class="fg blue">
            <wl-icon>settings</wl-icon>
          </wl-button>-->
          <wl-button fab flat inverted
            class="fg blue" @click="${() => this.loadPipeline(rowData.item)}">
            <wl-icon>account_tree</wl-icon>
          </wl-button>
          <wl-button fab flat inverted class="fg red controls-running" 
            @click="${() => this._launchPipelineDeleteDialog(rowData.item)}">
            <wl-icon>delete_forever</wl-icon>
          </wl-button>
        </div>
      `, root
    );
  }

  /**
   * Control rendering
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  createdAtRenderer(root, column?, rowData?) {
    render(
      html`
        <div class="layout vertical">
          <span style="font-size:0.75rem;">${rowData.item.created_at}</span>
        </div>
      `, root
    );
  }

  /**
   * Control rendering
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  modifiedAtRenderer(root, column?, rowData?) {
    render(
      html`
      <div class="layout vertical">
        <span style="font-size:0.75rem;">${rowData.item.last_modified}</span>
      </div>
      `, root
    );
  }

  /**
   * Move to pipeline-view tab
   */
  moveToViewTab() {
    const moveToViewEvent =
      new CustomEvent('pipeline-view-active-tab-change',
        {
          'detail': {
            'activeTab': {
              title: 'pipeline-view'
            },
            'pipeline': this.pipelineInfo
          }
        });
    document.dispatchEvent(moveToViewEvent);
  }

  /**
   * Move to pipeline view tab with selected pipeline data
   *
   * @param {json} pipelineInfo
   */
  loadPipeline(pipelineInfo: object) {
    this.pipelineInfo = pipelineInfo;
    this.moveToViewTab();
  }

  /**
   * Display inside the tab content.
   *
   * @param {HTMLElement} tab - mwc-tab element
   */
  _switchActiveTab(tab) {
    const els = this.shadowRoot.querySelectorAll('mwc-tab');
    // deactivate all
    for (const obj of els) {
      obj.deactivate();
    }
    // activate tab argument
    tab.activate();
    this._showTabContent(tab);
  }

  /**
   * Display inside the tab content.
   *
   * @param {HTMLElement} tab - mwc-tab element
   */
  _showTabContent(tab) {
    const els = this.shadowRoot.querySelectorAll('.tab-content');
    for (const obj of els) {
      obj.style.display = 'none';
    }
    this._activeTab = tab.title;
    this.shadowRoot.querySelector('#' + tab.title).style.display = 'block';
  }

  /**
   * Invoke updating available versions corresponding to installed environment
   */
  updateLanguage() {
    const selectedItem = this._environment.selected;
    if (selectedItem === null) return;
    const kernel = selectedItem.id;
    this._updateVersions(kernel);
  }

  /**
   * Update available versions according to kernel
   *
   * @param {string} kernel - environment image name
   */
  _updateVersions(kernel) {
    if (kernel in this.resourceBroker.supports) {
      this._versionSelector.disabled = true;
      const versions: {version: string, architecture: string}[] = [];
      for (const version of this.resourceBroker.supports[kernel]) {
        for (const architecture of this.resourceBroker.imageArchitectures[kernel + ':' + version]) {
          versions.push({version, architecture});
        }
      }
      versions.sort((a, b) => a.version > b.version ? 1 : -1);
      versions.reverse(); // New version comes first.
      this.versions = versions;
      this.kernel = kernel;
    } else {
      return;
    }
    if (this.versions !== undefined) {
      return this._versionSelector.layout(true).then(() => {
        // Set version selector's value beforehand to update resources in
        // updateEnvironmentSetting method. Without this, LAUNCH button's disabled state is not
        // updated, so in some cases, user cannot launch a session even though
        // there are available resources for the selected image.
        this._versionSelector.select(1);
        this._versionSelector.value = this.versions[0].version;
        this._versionSelector.architecture = this.versions[0].architecture;
        // this._versionSelector.selectedText = this._versionSelector.value;
        this._update_versionSelectorText(this._versionSelector.value, this._versionSelector.architecture);
        this._versionSelector.disabled = false;
      });
    }
  }

    /**
   * Update _versionSelector's selectedText.
   *
   * @param {any} text - version
   * */
     _update_versionSelectorText(version, architecture) {
      const res = this._getVersionInfo(version, architecture);
      const resultArray: string[] = [];
      res.forEach((item) => {
        resultArray.push(item.tag);
      });
      this._versionSelector.selectedText = resultArray.join(' / ');
    }

  /**
   * Update selected folders.
   * If selectedFolderItems are not empty and forceInitialize is true, unselect the selected items
   *
   * @param {boolean} forceInitialize - whether to initialize selected vfolder or not
   * */
  _updateSelectedFolder(forceInitialize = false) {
    if (this.vfolderGrid && this.vfolderGrid.selectedItems) {
      const selectedFolderItems = this.vfolderGrid.selectedItems;
      let selectedFolders: string[] = [];
      if (selectedFolderItems.length > 0) {
        selectedFolders = selectedFolderItems.map((item) => item.name);
        if (forceInitialize) {
          this._unselectAllSelectedFolder();
        }
      }
      this.selectedVfolders = selectedFolders;
    }
    return Promise.resolve(true);
  }

  /**
   * Unselect the selected items and update selectedVfolders to be empty.
   *
   */
  _unselectAllSelectedFolder() {
    if (this.vfolderGrid && this.vfolderGrid.selectedItems) {
      this.vfolderGrid.selectedItems.forEach((item) => {
        item.selected = false;
      });
      this.vfolderGrid.selectedItems = [];
    }
    this.selectedVfolders = [];
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

    /**
   * Get version information - Version, Language, Additional information.
   *
   * @param {any} version
   * @return {Record<string, unknown>} Array containing information object
   * */
     _getVersionInfo(version, architecture) {
      const info: any = [];
      const fragment = version.split('-');
      info.push({ // Version
        tag: this._aliasName(fragment[0]),
        color: 'blue',
        size: '60px'
      });
      if (fragment.length > 1) {
        // Image requirement overrides language information.
        if (this.kernel + ':' + version in this.imageRequirements && 'framework' in this.imageRequirements[this.kernel + ':' + version]) {
          info.push({ // Language
            tag: this.imageRequirements[this.kernel + ':' + version]['framework'],
            color: 'red',
            size: '110px'
          });
        } else {
          info.push({ // Language
            tag: this._aliasName(fragment[1]),
            color: 'red',
            size: '110px'
          });
        }
      }
      info.push({
        tag: architecture,
        color: 'lightgreen',
        size: '90px',
      });
      if (fragment.length > 2) {
        const requirements = this._aliasName(fragment[2]).split(':');
        if (requirements.length > 1) {
          info.push({ // Additional information
            tag: requirements[1],
            app: requirements[0],
            color: 'green',
            size: '90px'
          });
        } else {
          info.push({ // Additional information
            tag: requirements[0],
            color: 'green',
            size: '90px'
          });
        }
      }
      return info;
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

  _showPathDescription(e?) {
    if (e != undefined) {
      e.stopPropagation();
    }
    this._helpDescriptionTitle = _text('session.launcher.FolderAlias');
    this._helpDescription = _text('session.launcher.DescFolderAlias');
    this._helpDescriptionIcon = '';
    const pathDialog = this.shadowRoot.querySelector('#help-description');
    pathDialog.show();
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

  folderToMountListRenderer(root, column, rowData) {
    render(
      html`
          <div style="font-size:14px;text-overflow:ellipsis;overflow:hidden;">${rowData.item.name}</div>
          <span style="font-size:10px;">${rowData.item.host}</span>
        `,
      root
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
          <vaadin-text-field id="vfolder-alias-${rowData.item.name}" clear-button-visible prevent-invalid-input
                             pattern="^[a-zA-Z0-9\./_-]*$" ?disabled="${!rowData.selected}"
                             theme="small" placeholder="/home/work/${rowData.item.name}"
                             @change="${(e) => this._updateFolderMap(rowData.item.name, e.target.value)}"></vaadin-text-field>
        `,
      root
    );
  }

  infoHeaderRenderer(root, column?) {
    render(
      html`
          <div class="horizontal layout center">
            <span id="vfolder-header-title">${_t('session.launcher.FolderAlias')}</span>
            <mwc-icon-button icon="info" class="fg green info" @click="${(e) => this._showPathDescription(e)}"></mwc-icon-button>
          </div>
        `,
      root
    );
  }

  renderGeneralTabTemplate() {
    // language=HTML
    return html`
      <div id="pipeline-general" class="vertical layout center flex tab-content" style="display:none;">
        <mwc-textfield id="pipeline-name" label="Pipeline Name" required></mwc-textfield>
        <mwc-select class="full-width" id="pipeline-type" label="Pipeline Type" required fixedMenuPosition>
          <mwc-list-item value="Choose Pipeline Type" disabled>Choose Pipeline Type</mwc-list-item>
          ${this.pipelineTypes.map((item) => {
            return html`<mwc-list-item id="${item}" value="${item}">${item}</mwc-list-item>`;
          })} 
        </mwc-select>
        <mwc-select class="full-width" id="pipeline-scaling-group" label="Scaling Group" fixedMenuPosition>
          ${this.scalingGroups.map((item, idx) => {
            return html`<mwc-list-item id="${item}" value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>`;
          })}
        </mwc-select>
        <mwc-select class="full-width" id="pipeline-environment" icon="code" label="${_text('session.launcher.Environments')}" required fixedMenuPosition
                    value="${this.defaultLanguage}">
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
                                    description="${item.tag}"></lablup-shields>
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
        <mwc-select class="full-width" id="pipeline-environment-tag" icon="architecture" label="${_text('session.launcher.Version')}" required fixedMenuPosition>
          <mwc-list-item selected style="display:none!important"></mwc-list-item>
          <h5 style="font-size:12px;padding: 0 10px 3px 15px;margin:0; border-bottom:1px solid #ccc;"
              role="separator" disabled="true" class="horizontal layout">
              <div style="width:60px;">${_t('session.launcher.Version')}</div>
              <div style="width:110px;">${_t('session.launcher.Base')}</div>
              <div style="width:90px;">${_t('session.launcher.Architecture')}</div>
            <div style="width:90px;">${_t('session.launcher.Requirements')}</div>
          </h5>
          ${this.versions.map(({version, architecture}) => html`
            <mwc-list-item id="${version}" architecture="${architecture}" value="${version}">
                <span style="display:none">${version}</span>
                <div class="horizontal layout end-justified">
                ${this._getVersionInfo(version || '', architecture).map((item) => html`
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
        <mwc-textarea id="pipeline-description" label="Pipeline Description"></mwc-textarea>
      </div>`;
  }

  renderResourcesTabTemplate() {
    // language=HTML
    return html`
    <div id="pipeline-resources" class="vertical layout center flex tab-content" style="display:none;">
      <mwc-textfield id="pipeline-cpu" label="CPU" type="number" min="1" suffix="Core" required></mwc-textfield>
      <mwc-textfield id="pipeline-mem" label="Memory (GiB)" type="number" min="0" suffix="GiB" required></mwc-textfield>
      <mwc-textfield id="pipeline-shmem" label="Shared Memory" type="number" min="0.0125" step="0.0125" suffix="GiB" required></mwc-textfield>
      <mwc-textfield id="pipeline-gpu" label="GPU" type="number" min="0" suffix="Unit" required></mwc-textfield>
    </div>`;
  }

  renderMountsTabTemplate() {
    // language=HTML
    return html`
    <div id="pipeline-mounts" class="vertical layout center flex tab-content" style="display:none;">
      <mwc-select class="full-width" id="pipeline-storage-mount" icon="storage" label="Storage hosts"
                  ?required=${this.allowedStorageHostList.length > 0} style="z-index:10">
        ${this.allowedStorageHostList.map((storageHost) => {
          return html`
            <mwc-list-item ?selected="${storageHost === this.selectedStorageHost}" value="${storageHost}">${storageHost}</mwc-list-item>
          `}
        )}
      </mwc-select>
      <mwc-textfield id="pipeline-mount-folder" label="Pipeline Folder Name (Optional)" type="text"
                    maxLength="64" placeholder="" helper="${_text('maxLength.64chars')}"></mwc-textfield>
      <wl-expansion class="vfolder" name="vfolder">
        <span slot="title">Additional mount (Optional)</span>
        <div class="vfolder-list">
          <vaadin-grid
              theme="row-stripes column-borders compact"
              id="vfolder-grid"
              aria-label="vfolder list"
              all-rows-visible
              .items="${this.nonAutoMountedVfolders}"
              @selected-items-changed="${() => this._updateSelectedFolder()}">
            <vaadin-grid-selection-column id="select-column"
                                          flex-grow="0"
                                          text-align="center"
                                          auto-select></vaadin-grid-selection-column>
            <vaadin-grid-filter-column header="${_t('session.launcher.FolderToMountList')}"
                                      path="name" resizable
                                      .renderer="${this._boundFolderToMountListRenderer}"></vaadin-grid-filter-column>
            <vaadin-grid-column width="135px"
                                path=" ${_t('session.launcher.FolderAlias')}"
                                .renderer="${this._boundFolderMapRenderer}"
                                .headerRenderer="${this._boundPathRenderer}"></vaadin-grid-column>
          </vaadin-grid>
          ${this.vfolders.length > 0 ? html`` : html`
            <div class="vertical layout center flex blank-box-medium">
              <span>${_t('session.launcher.NoAvailableFolderToMount')}</span>
            </div>
          `}
        </div>
        <div class="vfolder-mounted-list">
          ${(this.selectedVfolders.length > 0) || (this.autoMountedVfolders.length > 0) ? html`
            <ul class="vfolder-list">
              ${this.selectedVfolders.map((item) => html`
                <li>
                  <mwc-icon>folder_open</mwc-icon>
                  ${item}
                  ${item in this.folderMapping ?
                    this.folderMapping[item].startsWith('/') ? html` (&#10140; ${this.folderMapping[item]})`:
                      html`(&#10140; /home/work/${this.folderMapping[item]})` :
                      html`(&#10140; /home/work/${item})`}
                </li>
              `)}
              ${this.autoMountedVfolders.map((item) => html`
                <li><mwc-icon>folder_special</mwc-icon>${item.name}</li>
              `)}
            </ul>` : html`
            <div class="vertical layout center flex blank-box-large">
              <span>${_t('session.launcher.NoFolderMounted')}</span>
            </div>
          `}
        </div>
      </wl-expansion>
    </div>`;
  }

  renderCreatePipelineDialogTemplate() {
    // language=HTML
    return html`
    <backend-ai-dialog id="create-pipeline" fixed backdrop blockscrolling persistent narrowLayout>
      <span slot="title">New Pipeline</span>
      <div slot="content" class="vertical layout flex">
        <mwc-tab-bar class="pipeline-tab">
          <mwc-tab title="pipeline-general" label="General" @click="${(e) => this._showTabContent(e.target)}"></mwc-tab>
          <mwc-tab title="pipeline-resources" label="Resources" @click="${(e) => this._showTabContent(e.target)}"></mwc-tab>
          <mwc-tab title="pipeline-mounts" label="Mounts" @click="${(e) => this._showTabContent(e.target)}"></mwc-tab>
        </mwc-tab-bar>
        ${this.renderGeneralTabTemplate()}
        ${this.renderResourcesTabTemplate()}
        ${this.renderMountsTabTemplate()}
      </div>
      <div slot="footer" class="horizontal layout end-justified flex">
        <mwc-button class="full-width" unelevated label="Create Pipeline" @click="${() => this._createPipeline()}"></mwc-button>
      </div>
    </backend-ai-dialog>`;
  }

  renderDeletePipelineDialogTemplate() {
    // language=HTML
    return html`
    <backend-ai-dialog id="delete-pipeline" fixed backdrop blockscrolling persistent>
      <span slot="title">Delete Pipeline</span>
      <div slot="content" class="vertical layout flex">
        <span>
          Are you sure you want to delete this pipeline?<br />
          This process cannot be undone!
        </span>
      </div>
      <div slot="footer" class="horizontal end-justified flex layout">
        <div class="flex"></div>
        <mwc-button label="Cancel" @click="${() => this._hideDialogById('#delete-pipeline')}"></mwc-button>
        <mwc-button unelevated class="delete" label="Delete" @click="${() => this._deletePipeline()}"></mwc-button>
      </div>
    </backend-ai-dialog>`;
  }

  renderPipelineDetailDialogTemplate() {
    // language=HTML
    return html`
    <backend-ai-dialog id="pipeline-detail" fixed backdrop blockscrolling persistent>
      <span slot="title">Pipeline Detail</span>
      <div slot="content" class="vertical layout flex">
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
            <div class="vertical center start-justified flex">
              <div class="title">Owner</div>
              <div class="description">${this.pipelineInfo.owner}</div>
            </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
            <div class="vertical center start-justified flex">
              <div class="title">Name</div>
              <div class="description">${this.pipelineInfo.name}</div>
            </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
            <div class="vertical center start-justified flex">
              <div class="title">Description</div>
              <div class="description">${this.pipelineInfo.description}</div>
            </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
          <div class="vertical center start-justified flex">
            <div class="title">YAML</div>
          </div>
          <mwc-button unelevated label="SEE YAML" icon="description" @click="${() => this._launchPipelineYAMLDialog()}"></mwc-button>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
          <div class="vertical center start-justified flex">
            <div class="title">Version</div>
            <div class="description">${this.pipelineInfo.version ? this.pipelineInfo.version : 'None'}</div>
          </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
          <div class="vertical center start-justified flex">
            <div class="title">Created at</div>
            <div class="description">${this.pipelineInfo.created_at}</div>
          </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
          <div class="vertical center start-justified flex">
            <div class="title">Last modified</div>
            <div class="description">${this.pipelineInfo.last_modified}</div>
          </div>
        </div>
      </div>
    </backend-ai-dialog>`;
  }

  renderPipelineYAMLDialogTemplate() {
    // language=HTML
    return html`
      <backend-ai-dialog class="yaml" id="pipeline-yaml" fixed backdrop blockscrolling>
        <span slot="title">${`Pipeline Data (YAML)`}</span>
        <div slot="content">
          <lablup-codemirror id="yaml-data" mode="yaml" readonly useLineWrapping></lablup-codemirror>
        </div>
      </backend-ai-dialog>`;
  }

  render() {
    // language=HTML
    return html`
    <div class="horizontal layout flex center end-justified">
      <mwc-button unelevated icon="add" label="New Pipeline" @click="${() => this._launchPipelineDialog()}" ?disabled="${!this._isLaunchable}"></mwc-button>
    </div>
    <vaadin-grid id="pipeline-list" theme="row-stripes column-borders compact wrap-cell-content" aria-label="Pipeline List" .items="${this.pipelines}">
      <vaadin-grid-column auto-width flex-grow="0" header="#" text-align="center" .renderer="${this._boundIndexRenderer}"></vaadin-grid-column>
      <vaadin-grid-filter-column id="name" auto-width header="Name" resizable .renderer="${this._boundNameRenderer}"></vaadin-grid-filter-column>
      <!--<vaadin-grid-column id="owner" header="Owner" resizable path="owner"></vaadin-grid-column>-->
      <vaadin-grid-column id="control" header="Controls" resizable .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
      <vaadin-grid-column id="created-at" header="Created At" resizable .renderer="${this._boundCreateAtRenderer}"></vaadin-grid-column>
      <vaadin-grid-column id="modified-at" header="Last Modified" resizable .renderer="${this._boundModifiedAtRenderer}"></vaadin-grid-column>
    </vaadin-grid>
    ${this.renderCreatePipelineDialogTemplate()}
    ${this.renderDeletePipelineDialogTemplate()}
    ${this.renderPipelineDetailDialogTemplate()}
    ${this.renderPipelineYAMLDialogTemplate()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-list': PipelineList;
  }
}
