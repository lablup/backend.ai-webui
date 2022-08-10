/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, LitElement, render} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import PipelineUtils from '../lib/pipeline-utils';
import {BackendAiStyles} from '../../components/backend-ai-general-styles';
import '../../components/lablup-codemirror';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../../plastics/layout/iron-flex-layout-classes';
import {PipelineInfo, PipelineYAML, PipelineTask, PipelineTaskNode, PipelineEnvironment, PipelineResources, PipelineTaskDetail} from '../lib/pipeline-type';
import {default as YAML} from 'js-yaml';

import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-list/mwc-check-list-item';
import '@material/mwc-select';
import '@material/mwc-textarea';
import '@material/mwc-textfield';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column';

import 'weightless/expansion';

type ConfigurationType = 'pipeline' | 'pipeline-task';

/**
 Pipeline Configuration Form

 `pipeline-configuration-form` display current/new configuration on pipeline itself and pipeline-task 
 mostly split into relative items

 Example:

 <pipeline-configuration-form>
 ...
 </pipeline-configuration-form>

@group Backend.AI pipeline
 @element pipeline-configuration-form
*/
@customElement('pipeline-configuration-form')
export default class PipelineConfigurationForm extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: Object, attribute: 'configuration-type'}) configurationType = 'pipeline' as ConfigurationType;
  @property({type: Boolean, attribute: 'is-editmode'}) isEditmode = false;
  @property({type: Boolean}) active = false;
  @property({type: Object}) userInfo;
  @property({type: String}) _activeTab = 'general';
  @property({type: Object}) resourceBroker;
  @property({type: Array}) pipelineTypes = ['Custom'];
  @property({type: String}) scalingGroup = '';
  @property({type: Array}) scalingGroups = ['default'];
  @property({type: String}) selectedStorageHost;
  @property({type: Array}) allowedStorageHostList;
  @property({type: Object}) images = Object();
  @property({type: Object}) imageInfo = Object();
  @property({type: Object}) imageNames = Object();
  @property({type: Object}) imageRequirements = Object();
  @property({type: String}) defaultLanguage;
  @property({type: Boolean}) _defaultLanguageUpdated = false;
  @property({type: String}) kernel = '';
  @property({type: Array}) languages;
  @property({type: Array}) versions;
  @property({type: Object}) tags = Object();
  @property({type: Object}) aliases = Object();

  @property({type: String}) _helpDescription = '';
  @property({type: String}) _helpDescriptionTitle = '';
  @property({type: String}) _helpDescriptionIcon = '';
  @property({type: Array}) vfolders;
  @property({type: Array}) selectedVfolders;
  @property({type: Array}) defaultSelectedVfolders;
  @property({type: Array}) autoMountedVfolders;
  @property({type: Array}) nonAutoMountedVfolders;
  @property({type: Object}) folderMapping = Object();
  @property({type: Boolean}) metricUpdating;
  @property({type: Object}) notification;

  @property({type: Object}) _boundFolderToMountListRenderer = this.folderToMountListRenderer.bind(this);
  @property({type: Object}) _boundFolderMapRenderer = this.folderMapRenderer.bind(this);
  @property({type: Object}) _boundPathRenderer = this.infoHeaderRenderer.bind(this);

  @query('mwc-tab[title="general"]', true) private _generalTab;
  @query('mwc-tab[title="resources"]', true) private _resourcesTab;
  @query('mwc-tab[title="mounts"]', true) private _mountsTab;

  @query('#environment-select') private _environment;
  @query('#environment-tag-select') private _versionSelector;
  @query('#vfolder-grid') vfolderGrid;
  @query('#name-input') private _nameInput;
  @query('#type-select') private _typeSelect;
  @query('#description-input') private _descriptionInput;
  @query('#scaling-group-select') private _scalingGroupSelect;
  @query('#cpu-input') private _cpuInput;
  @query('#mem-input') private _memInput;
  @query('#shmem-input') private _shmemInput;
  @query('#gpu-input') private _gpuInput;
  @query('#storage-mount-select') private _storageMountSelect;
  @query('#mount-folder-input') private _mountFolderNameInput;
  @query('#command-editor') private _cmdEditor;
  @query('#codemirror-validation-message') private _cmdEditorValidationMessage;
  
  private _isRequired;

  @property({type: Object}) taskType = {
    github: 'Import from GitHub',
    gitlab: 'Import from GitLab',
    custom: 'Custom Task'
  };

  @property({type: PipelineInfo, attribute: "pipeline-info"}) pipelineInfo;
  @property({type: PipelineTask, attribute: "pipeline-task"}) pipelineTask;

  constructor() {
    super();
    this._initResource();
    this.resourceBroker = globalThis.resourceBroker;
    this.notification = globalThis.lablupNotification;
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
    this.selectedVfolders = [];
    this.selectedStorageHost = '';
    this.vfolders = [];
    this.versions = ['Not Selected'];

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
        .tab-content {
          width: 100%;
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

        #codemirror-validation-message {
          font-size: 12px;
          font-family: var(--general-font-family);
          margin-left: 15px;
          color: var(--paper-red-400);
        }

        fieldset input {
          width: 100%;
          border: 0;
          margin: 15px 0 0 0;
          font: inherit;
          font-size: 16px;
          outline: none;
        }

        lablup-codemirror {
          width: 360px;
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

        mwc-select#pipeline-version {
          width: 130px;
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
    `];
  }

  firstUpdated() {
    this._environment.addEventListener(
      'selected', this.updateLanguage.bind(this));
    this._versionSelector.addEventListener('selected', () => {
      this.updateEnvironmentSetting();
    });
  }

  async _initConfiguration() {
    this._fetchUserInfo();
    await this._updateVirtualFolderList();
    this._configureRequiredInputField();
    this._loadSupportedLanguages();
    this._selectDefaultLanguage();

    // name, description
    this._autoFillInput(this._nameInput, '');
    this._autoFillInput(this._descriptionInput, '');

    // resources
    this._autoFillInput(this._cpuInput, '');
    this._autoFillInput(this._memInput, '');
    this._autoFillInput(this._gpuInput, '');
    this._autoFillInput(this._shmemInput, '');

    // virtual folders
    this._unselectAllSelectedFolder();

    // default active tab is general
    this._switchActiveTab(this._generalTab);
    this._showTabContent(this._generalTab);
  }

  _loadSupportedLanguages() {
    this.languages = this.resourceBroker.languages;
  }

  _configureRequiredInputField() {
    // default resource configuration is required when creating/modifying pipeline
    this._isRequired = (this.configurationType === 'pipeline');
  }

  async _loadCurrentPipelineConfiguration(pipeline: PipelineInfo) {
    await this._updateVirtualFolderList(pipeline.storage.name);
    this._fetchUserInfo();
    this._loadSupportedLanguages();
    this._configureRequiredInputField();
    const pipelineYaml = YAML.load(pipeline.yaml) as PipelineYAML;

    // name, description
    this._autoFillInput(this._nameInput, pipeline.name);
    this._autoFillInput(this._descriptionInput, pipeline.description);

    // storage
    this._autoFillInput(this._storageMountSelect, pipeline.storage.host);
    this._autoFillInput(this._mountFolderNameInput, pipeline.storage.name);
     // FIXME: disable renaming auto-created vfolder of pipeline
    this._mountFolderNameInput.disabled = true;

    // type
    /* FIXME:
     * - apply "Custom", since only custom type is available
     * - temporally disable changing type selection
     */
    this._autoFillInput(this._typeSelect, this.pipelineTypes[0]);
    this._typeSelect.disabled = true;

    // scaling-group
    this._autoFillInput(this._scalingGroupSelect, pipelineYaml.environment['scaling-group']);

    // environment
    const [environment, version] = pipelineYaml.environment['image'].split(':');
    this._autoFillInput(this._environment, environment);
    this._autoFillInput(this._versionSelector, version);

    // resources
    this._autoFillInput(this._cpuInput, pipelineYaml.resources.cpu);

    /* FIXME:
     * split "g"(GiB) from memory, gpu, shared memory unit since only supports "g" unit for now.
     */
    this._autoFillInput(this._memInput, pipelineYaml.resources.memory.split('g')[0] ?? this._memInput.min);
    this._autoFillInput(this._shmemInput, pipelineYaml.resource_opts.shmem.split('g')[0] ?? this._shmemInput.min);
    // FIXME: auto input cuda resources if it's declared
    const cudaResource = [pipelineYaml.resources['cuda.device'], pipelineYaml.resources['cuda.shares']].filter((resource) => resource !== undefined) as string[];
    if (cudaResource.length > 0) {
      this._autoFillInput(this._gpuInput, cudaResource[0]);
    }

    // virtual folders
    this._loadDefaultMounts(pipelineYaml.mounts);
  }

  async _initPipelineTaskConfiguration(pipeline: PipelineInfo) {
    await this._updateVirtualFolderList();
    this._loadSupportedLanguages();
    this._configureRequiredInputField();

    const pipelineYaml = YAML.load(pipeline.yaml) as PipelineYAML;

    // name, description
    this._autoFillInput(this._nameInput, '');
    this._autoFillInput(this._descriptionInput, '');

    // type
    /* FIXME:
     * - apply "Import ", since only custom type is available
     * - temporally disable changing type selection
     */
    this._autoFillInput(this._typeSelect, this.taskType.custom);

    // scaling-group
    this._autoFillInput(this._scalingGroupSelect, pipelineYaml.environment['scaling-group']);

    // environment
    const [environment, version] = pipelineYaml.environment['image'].split(':');
    this._autoFillInput(this._environment, environment);
    this._autoFillInput(this._versionSelector, version);

    // resources
    this._autoFillInput(this._cpuInput, pipelineYaml.resources.cpu);

    /* FIXME:
     * split "g"(GiB) from memory, gpu, shared memory unit since only supports "g" unit for now.
     */
    this._autoFillInput(this._memInput, pipelineYaml.resources.memory.split('g')[0] ?? this._memInput.min);
    this._autoFillInput(this._shmemInput, pipelineYaml.resource_opts.shmem.split('g')[0] ?? this._shmemInput.min);
    // FIXME: auto input cuda resources if it's declared
    const cudaResource = [pipelineYaml.resources['cuda.device'], pipelineYaml.resources['cuda.shares']].filter((resource) => resource !== undefined) as string[];
    if (cudaResource.length > 0) {
      this._autoFillInput(this._gpuInput, cudaResource[0]);
    }

    // virtual folders
    this._loadDefaultMounts(pipelineYaml.mounts);

    // default active tab is general
    this._showTabContent(this._generalTab);
  }

  async _loadCurrentPipelineTaskConfiguration(pipelineTask: PipelineTask) {
    await this._updateVirtualFolderList();
    this._loadSupportedLanguages();

    // name, description
    this._autoFillInput(this._nameInput, pipelineTask.name);
    this._autoFillInput(this._descriptionInput, pipelineTask.description);

    // type
    /* FIXME:
     * - apply "Custom Task", since only custom type is available
     * - temporally disable changing type selection
     */
    this._autoFillInput(this._typeSelect, this.taskType.custom);
    this._typeSelect.disabled = true;

    /**
     * FIXME:
     * - temporally disable changing scaling-group selection
     */
    // scaling-group
    this._autoFillInput(this._scalingGroupSelect, pipelineTask.environment['scaling-group']);
    this._scalingGroupSelect.disabled = true;

    // environment
    const [environment, version] = pipelineTask.environment['image'].split(':');
    this._autoFillInput(this._environment, environment);
    this._autoFillInput(this._versionSelector, version);

    // resources
    this._autoFillInput(this._cpuInput, pipelineTask.resources.cpu);

    /* FIXME:
     * split "g"(GiB) from memory, gpu, shared memory unit since only supports "g" unit for now.
     */
    this._autoFillInput(this._memInput, pipelineTask.resources.memory.split('g')[0] ?? this._memInput.min);
    this._autoFillInput(this._shmemInput, pipelineTask.resource_opts.shmem.split('g')[0] ?? this._shmemInput.min);
    // FIXME: auto input cuda resources if it's declared
    const cudaResource = [pipelineTask.resources['cuda.device'], pipelineTask.resources['cuda.shares']].filter((resource) => resource !== undefined) as string[];
    if (cudaResource.length > 0) {
      this._autoFillInput(this._gpuInput, cudaResource[0]);
    }

    // virtual folders
    this._loadDefaultMounts(pipelineTask.mounts);
  }

  _autoFillInput(inputElement: any, value: string) {
    inputElement.value = value;
  }

  _loadDefaultMounts(mountFolderList: Array<string> = []) {
    this.defaultSelectedVfolders = mountFolderList;
    if (this.vfolderGrid && this.vfolderGrid.items) {
      this.vfolderGrid.items.forEach((item) => {
        if (this.defaultSelectedVfolders.includes(item.name)) {
          // force-select vfolder
          this.vfolderGrid.selectItem(item);
        }
      });
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

  /**
   * Update accessible vfolders
   *
   * @return {void}
   */
   async _updateVirtualFolderList(pipelineFolder = '') {
    return this.resourceBroker.updateVirtualFolderList().then(() => {
      this.vfolders = this.resourceBroker.vfolders;
      this.allowedStorageHostList = [...new Set(this.vfolders.map((vfolder) => (vfolder.host)))];
      // select first element of allowedStorageHostList as a default
      this.selectedStorageHost = (this.allowedStorageHostList.length > 0) ? this.allowedStorageHostList[0] : '';
      this.autoMountedVfolders = this.vfolders.filter((item) => (item.name.startsWith('.')));
      // filter pipeline-folder created by pipeline server during pipeline creation
      this.nonAutoMountedVfolders = this.vfolders.filter((item) => !(item.name.startsWith('.') || item.name === pipelineFolder));
    });
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
        this._updateVersionSelectorText(this._versionSelector.value, this._versionSelector.architecture);
        this._versionSelector.disabled = false;
      });
    }
  }

  /**
   * Update _versionSelector's selectedText.
   *
   * @param {any} text - version
   * */
  _updateVersionSelectorText(version, architecture) {
    const res = this._getVersionInfo(version, architecture);
    const resultArray: string[] = [];
    res.forEach((item) => {
      resultArray.push(item.tag);
    });
    this._versionSelector.selectedText = resultArray.join(' / ');
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
    this._updateVersionSelectorText(selectedVersionValue, selectedVersionArchitecture);
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

  /**
   * Select fallback(default) image
   *
   * @param {boolean} forceUpdate - only update default language when its value is true
   * @param {string} language - default language
   */
   async _selectDefaultLanguage(forceUpdate = false, language = '') {
    this.languages = this.resourceBroker.languages;
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
    if (typeof obj === 'undefined' && 
        typeof globalThis.backendaiclient !== 'undefined' && 
        globalThis.backendaiclient.ready === false) { // Not ready yet.
      setTimeout(() => {
        console.log('Environment selector is not ready yet. Trying to set the default language again.');
        return this._selectDefaultLanguage(forceUpdate, language);
      }, 500);
      return Promise.resolve(true);
    }
    const idx = this._environment.items.indexOf(obj);
    this._environment.select(idx);
    this._defaultLanguageUpdated = true;
    return Promise.resolve(true);
  }

  static _validityCheckByGroup(inputGroup: Array<any>) {
    return inputGroup.some((elem) => {
        return !elem.reportValidity();
      });
  }

  _validatePipelineConfigInput() {
    // general tab inputs
    if (PipelineConfigurationForm._validityCheckByGroup(
      [this._nameInput, this._typeSelect, this._scalingGroupSelect, 
      this._environment, this._versionSelector, this._descriptionInput])) {
        this._switchActiveTab(this._generalTab);
        return false;
    }

    // resources tab inputs
    if (PipelineConfigurationForm._validityCheckByGroup(
      [this._cpuInput, this._memInput, this._shmemInput, 
       this._gpuInput])) {
        this._switchActiveTab(this._resourcesTab);
        return false;
    }

    // mounts tab inputs
    if (PipelineConfigurationForm._validityCheckByGroup(
      [this._storageMountSelect, this._mountFolderNameInput])) {
        this._switchActiveTab(this._mountsTab);
        return false;
    }

    // all passed validation check
    return true;
  }

  _validatePipelineTaskConfigInput() {
    // general task tab inputs
    if (PipelineConfigurationForm._validityCheckByGroup(
      [this._nameInput, this._typeSelect])) {
        this._switchActiveTab(this._generalTab);
        return false;
    }
    // const isCommandValid = this._cmdEditor._validateInput();
    // if (!isCommandValid) {
    //   this._cmdEditorValidationMessage.style.display = '';
    //   this._switchActiveTab(this._generalTab);
    //   return false;
    // } else {
    //   this._cmdEditorValidationMessage.style.display = 'none';
    // }

    // resources task tab inputs
    if (PipelineConfigurationForm._validityCheckByGroup(
      [this._scalingGroupSelect, this._environment, this._versionSelector,
       this._cpuInput, this._memInput, this._shmemInput, this._gpuInput])) {
        this._switchActiveTab(this._resourcesTab);
        return false;
    }

    // all passed validation check
    return true;
  }

  inputFieldListAsInstance (isPipelineType = true) {
    let obj: PipelineInfo | PipelineTaskNode;
    /* raw inputs */
    const name = this._nameInput.value;
    const description = this._descriptionInput.value;
    const scalingGroup = this._scalingGroupSelect.value;
    const kernel = this._environment.value;
    const version = this._versionSelector.value;
    const cpuRequest = this._cpuInput.value;
    const memRequest = this._memInput.value;
    const shmemRequest = this._shmemInput.value;
    const gpuRequest = this._gpuInput.value;
    const mounts = this.selectedVfolders;

    /* structured inputs */
    const environment = {
      'scaling-group': scalingGroup,
      image: PipelineUtils._generateKernelIndex(kernel, version),
      envs: {},
    } as PipelineEnvironment;
    const resources = {
      cpu: cpuRequest,
      memory: memRequest + 'g',
      ...(gpuRequest !== '' ? {"cuda.device" : gpuRequest} : null),
      ...(gpuRequest !== '' ? {"cuda.shares": gpuRequest}: null),
    } as PipelineResources;
    const resource_opts = {
      shmem: shmemRequest + 'g'
    };

    if (isPipelineType) {
      // FIXME: for now, we only support custom type pipeline creation.

      /* raw inputs only used in pipeline info */
      const storageHost = this._storageMountSelect.value;
      const storageHostMountFolderName = this._mountFolderNameInput.value;

      /* extra structured inputs */
      const storage = {
        host: storageHost,
        name: storageHostMountFolderName
      };
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
      } as PipelineYAML;

      obj = {
        name: name,
        description: description,
        storage: storage,
        yaml: YAML.dump(yaml),
        dataflow: {}, // used for graph visualization,
        is_active: true,
      } as PipelineInfo;
    } else {
      /* raw inputs only used in pipeline task info */
      const taskType = this._typeSelect.value;
      const command = this._cmdEditor.getValue();

      /* extra structured inputs */
      const taskData: PipelineTaskDetail = {
        type: taskType,
        environment: environment,
        resources: resources,
        resource_opts: resource_opts,
        command: command,
        mounts: mounts,
      } as PipelineTaskDetail;

      obj = {
        name: name,
        inputs: 1,
        outputs: 1,
        pos_x: 0,
        pos_y: 0,
        // FIXME: temporary name for distinguishing pipeline specific node
        class: 'drawflow-node',
        data: JSON.stringify(taskData),
        html: name,
      } as PipelineTaskNode;
    }
    return obj;
  }

  /**
   * Initialize user info
   */
   _fetchUserInfo() {
    const userKeyList: Array<string> = ['full_name', 'username', 'domain_name', 'id'];
    return globalThis.backendaiclient.user.get(globalThis.backendaiclient.email, userKeyList).then((res) => {
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
   * Display inside the tab content and hide contents in the others tab
   *
   * @param {HTMLElement} tabContent - tabContnet to show corresponding mwc-tab
   */
  _showTabContent(tabContent) {
    const els = this.shadowRoot.querySelectorAll('.tab-content');
    for (const obj of els) {
      obj.style.display = 'none';
    }
    this._activeTab = tabContent.title;
    this.shadowRoot.querySelector('#' + tabContent.title).style.display = 'block';
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
      tag: PipelineUtils._aliasName(fragment[0]),
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
          tag: PipelineUtils._aliasName(fragment[1]),
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
      const requirements = PipelineUtils._aliasName(fragment[2]).split(':');
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

  /**
   * Give focus on command-editor
   */
   async _focusCmdEditor() {
    await this._cmdEditor.refresh();
    this._cmdEditor.focus();
  }

  /**
   * Remove any string typed in command-editor
   */
  _clearCmdEditor() {
    this._cmdEditor.setValue('');
  }

  /**
   * Load string to command-editor
   */
  _loadDataToCmdEditor(data: string = '') {
    this._cmdEditor.setValue(data);
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

  infoHeaderRenderer(root, column?, rowData?) {
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

  renderNameTemplate(label="Pipeline Name") {
    // language=HTML
    return html`
      <mwc-textfield id="name-input" label=${label} required autoValidate></mwc-textfield>
    `;
  }

  renderDescriptionTemplate(label="Pipeline Description") {
    // language=HTML
    return html`
    <mwc-textarea id="description-input" label=${label}></mwc-textarea>
    `;

  }

  renderPipelineTypeTemplate() {
    // language=HTML
    return html`
    <mwc-select class="full-width" id="type-select" label="Pipeline Type" required fixedMenuPosition>
      <mwc-list-item value="Choose Pipeline Type" disabled>Choose Pipeline Type</mwc-list-item>
      ${this.pipelineTypes.map((item) => {
        return html`<mwc-list-item id="${item}" value="${item}">${item}</mwc-list-item>`;
      })} 
    </mwc-select>
    `;
  }

  renderPipelineTaskTypeTemplate(isEdit = false) {
    // language=HTML
    // FIXME: disable other types except 'custom' for now
    return html`
    <mwc-select class="full-width" id="type-select" label="Task Type" fixedMenuPosition required ?disabled=${isEdit}>
      ${Object.keys(this.taskType).map((item) => {
        return html`<mwc-list-item id="${item}" value="${this.taskType[item]}" ?selected="${item === 'custom'}" ?disabled=${item !== 'custom'}">
                      ${this.taskType[item]}
                    </mwc-list-item>`;
      })}
    </mwc-select>
    `;
  }

  renderScalingGroupTemplate() {
    // language=HTML
    return html`
    <mwc-select class="full-width" id="scaling-group-select" label="Scaling Group" fixedMenuPosition>
      ${this.scalingGroups.map((item, idx) => {
        return html`<mwc-list-item id="${item}" value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>`;
      })}
    </mwc-select>`;
  }

  renderEnvironmentTemplate() {
    // language=HTML
    return html`
      <mwc-select class="full-width" id="environment-select" icon="code" label="${_text('session.launcher.Environments')}" required fixedMenuPosition>
      <mwc-list-item selected graphic="icon" style="display:none!important;">
        ${_t('session.launcher.ChooseEnvironment')}
      </mwc-list-item>
      ${this.languages.map((item) => html`
        ${item.clickable === false ? html`
          <h5 style="font-size:12px;padding: 0 10px 3px 10px;margin:0; border-bottom:1px solid #ccc;"
              role="separator" disabled="true">${item.basename}</h5>
          ` : html`
          <mwc-list-item id="${item.name}" value="${item.name}" graphic="icon" ?selected="$${item.name === this.defaultLanguage}">
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
    <mwc-select class="full-width" id="environment-tag-select" icon="architecture" label="${_text('session.launcher.Version')}" required fixedMenuPosition>
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
    </mwc-select>`;
  }
  renderCmdEditorTemplate() {
    // language=HTML
    return html`
    <div class="vertical layout start-justified">
      <span style="width:370px;padding-left:15px;">Command</span>
    </div>
    <lablup-codemirror id="command-editor" mode="shell" useLineWrapping required></lablup-codemirror>
    <span id="codemirror-validation-message" style="display:none;">This command field is required.</span>
    `;
  }

  renderGeneralTabTemplate() {
    // language=HTML
    return html`
      <div id="general" class="vertical layout center flex tab-content">
        ${this.renderNameTemplate()}
        ${this.renderPipelineTypeTemplate()}
        ${this.renderScalingGroupTemplate()}
        ${this.renderEnvironmentTemplate()}
        ${this.renderDescriptionTemplate()}
      </div>`;
  }

  renderGeneralTaskTabTemplate(isEdit = false) {
    // language=HTML
    return html`
    <div id="general" class="vertical layout center flex tab-content">
      ${this.renderNameTemplate("Task Name")}
      ${this.renderDescriptionTemplate("Task Description")}
      ${this.renderPipelineTaskTypeTemplate(isEdit)}
      ${this.renderCmdEditorTemplate()}
    </div>
    `;
  }

  renderResourcesTaskTabTemplate(isRequired = false) {
    return html`
    <div id="resources" class="vertical layout center flex tab-content" style="display:none;">
      ${this.renderScalingGroupTemplate()}
      ${this.renderEnvironmentTemplate()}
      ${this.renderResourceContentTemplate(isRequired)}
    </div>`;
  }

  renderResourcesTabTemplate(isRequired = false) {
    // language=HTML
    return html`
    <div id="resources" class="vertical layout center flex tab-content" style="display:none;">
      ${this.renderResourceContentTemplate(isRequired)}
    </div>`;
  }

  renderResourceContentTemplate(isRequired = false) {
    // language=HTML
    return html`
      <mwc-textfield id="cpu-input" label="CPU" type="number" min="1" suffix="Core" ?required=${isRequired}></mwc-textfield>
      <mwc-textfield id="mem-input" label="Memory (GiB)" type="number" min="2" suffix="GiB" ?required=${isRequired}></mwc-textfield>
      <mwc-textfield id="shmem-input" label="Shared Memory" type="number" min="0.0125" step="0.0125" suffix="GiB" ?required=${isRequired}></mwc-textfield>
      <mwc-textfield id="gpu-input" label="GPU" type="number" min="0" suffix="Unit" ?required=${isRequired}></mwc-textfield>
    `;
  }

  renderMountsContentTemplate() {
    // language=HTML
    return html`

    `;
  }

  renderMountsTabTemplate() {
    // language=HTML
    return html`
    <div id="mounts" class="vertical layout center flex tab-content" style="display:none;">
      <mwc-select class="full-width" id="storage-mount-select" icon="storage" label="Storage hosts"
                  ?required=${this.allowedStorageHostList.length > 0} style="z-index:10">
        ${this.allowedStorageHostList.map((storageHost) => {
          return html`
            <mwc-list-item ?selected="${storageHost === this.selectedStorageHost}" value="${storageHost}">${storageHost}</mwc-list-item>
          `}
        )}
      </mwc-select>
      <mwc-textfield id="mount-folder-input" label="Pipeline Folder Name (Optional)" type="text"
                    maxLength="64" placeholder="" helper="${_text('maxLength.64chars')}"></mwc-textfield>
      <wl-expansion class="vfolder" name="vfolder">
        <span slot="title">Additional mount (Optional)</span>
          ${this.renderAdditionalVFolderListTemplate()}
      </wl-expansion>
    </div>`;
  }

  renderMountsTaskTabTemplate() {
    // language=HTML
    return html`
    <div id="mounts" class="vertical layout center flex tab-content" style="display:none;">
      ${this.renderAdditionalVFolderListTemplate()}
    </div>`;
  }

  renderAdditionalVFolderListTemplate() {
    // language=HTML
    return html`
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
    `;
  }

  render() {
    // language=HTML
    return html`
      <mwc-tab-bar class="pipeline-tab">
        <mwc-tab title="general" label="General" @click="${(e) => this._showTabContent(e.target)}"></mwc-tab>
        <mwc-tab title="resources" label="Resources" @click="${(e) => this._showTabContent(e.target)}"></mwc-tab>
        <mwc-tab title="mounts" label="Mounts" @click="${(e) => this._showTabContent(e.target)}"></mwc-tab>
      </mwc-tab-bar>
      ${this.configurationType === 'pipeline' ? html`
        ${this.renderGeneralTabTemplate()}
        ${this.renderResourcesTabTemplate(this._isRequired)}
        ${this.renderMountsTabTemplate()}
      ` : html`
        ${this.renderGeneralTaskTabTemplate(this.isEditmode)}
        ${this.renderResourcesTaskTabTemplate(this._isRequired)}
        ${this.renderMountsTaskTabTemplate()}
      `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-configuration-form': PipelineConfigurationForm;
  }
}