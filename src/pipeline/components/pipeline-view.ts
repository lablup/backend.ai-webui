/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import PipelineUtils from '../lib/pipeline-utils';
import {BackendAIPage} from '../../components/backend-ai-page';
import '../../components/backend-ai-dialog';
import '../../components/lablup-activity-panel';
import '../../components/lablup-codemirror';
import {default as PainKiller} from '../../components/backend-ai-painkiller';
import {BackendAiStyles} from '../../components/backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../../plastics/layout/iron-flex-layout-classes';
import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';
import '@material/mwc-textfield';
import '../lib/pipeline-flow';
import './pipeline-list';

/**
 Pipeline View

 `pipeline-view` is wrapper component of pipeline list and flow editor

 Example:

 <pipeline-view>
 ...
 </pipeline-view>

@group Backend.AI pipeline
 @element pipeline-view
*/

@customElement('pipeline-view')
export default class PipelineView extends BackendAIPage {
  public shadowRoot: any; // ShadowRoot
  @property({type: String}) _activeTab = 'pipeline-list';
  @property({type: Boolean}) active = false;
  @property({type: Boolean}) isNodeSelected = false;
  @property({type: Object}) selectedNode = Object();
  @property({type: Object}) pipelineInfo = Object();
  @property({type: Object}) taskInfo;

  // Elements
  @property({type: Object}) spinner = Object();
  @property({type: Object}) notification = Object();
  // Environments
  @property({type: Object}) tags = Object();
  @property({type: Array}) languages;
  @property({type: String}) defaultLanguage = '';
  @property({type: Array}) versions = [];
  @property({type: String}) scalingGroup = '';
  @property({type: Array}) scalingGroups = ['default'];
  @property({type: String}) vhost = '';
  @property({type: Array}) vhosts = [];
  @property({type: Array}) vfolders;
  @property({type: Object}) vfolderGrid = Object();
  @property({type: Array}) selectedVfolders;
  @property({type: Array}) defaultSelectedVfolders;
  @property({type: Object}) images = Object();
  @property({type: Object}) imageInfo = Object();
  @property({type: Object}) imageNames = Object();
  @property({type: Object}) resourceLimits = Object();
  @property({type: Object}) resourceBroker;
  @property({type: Object}) supports = Object();
  @property({type: Object}) aliases = Object();

  @property({type: Object}) taskType = {
    github: 'Import from GitHub',
    gitlab: 'Import from GitLab',
    custom: 'Custom Task'
  };

  constructor() {
    super();
    this.aliases = {
      'TensorFlow': 'python-tensorflow',
      'NGC-TensorFlow': 'ngc-tensorflow',
      'PyTorch': 'python-pytorch',
      'NGC-PyTorch': 'ngc-pytorch',
      'Lablup Research Env.': 'python-ff',
      'Python': 'python',
    };
    this.languages = [];
    this.vfolders = [];
    this.selectedVfolders = [];
    this.defaultSelectedVfolders = [];
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
        .task-tab-content,
        .tab-content {
          width: 100%;
        }

        backend-ai-dialog {
          --component-min-width: 390px;
          --component-max-width: 390px;
        }

        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0px 0px;
          margin: 0px auto;
        }

        lablup-codemirror {
          width: 360px;
        }

        mwc-button { 
          margin: 10px;
        }

        mwc-button.full-width {
          width: 100%;
        }

        mwc-icon-button {
          color: #555;
        }

        mwc-select.full-width {
          width: 100%;
          font-family: var(--general-font-family);
          --mdc-theme-primary: var(--general-sidebar-color);
          --mdc-menu-item-height: auto;
          /* Need to be set when fixedMenuPosition attribute is enabled */
          --mdc-menu-max-width: 360px;
          --mdc-menu-min-width: 360px;
        }

        mwc-select#pipeline-version {
          width: 130px;
        }

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
        }

        mwc-tab-bar.task-tab {
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
        }

        mwc-textfield {
          width: 100%;
        }

        mwc-textfield#edit-pipeline-name {
          margin-bottom: 10px;
        }

        mwc-textfield#pipeline-name {
          margin:auto 10px;
          height: 36px;
          width: auto;
        }
        
        span#pipeline-name {
          font-size: 1.2rem;
          margin: auto 10px;
          color: #555;
          min-width: 100px; 
        }

        pipeline-flow {
          --pane-height: 70vh;
        }
      `
    ];
  }


  /**
   * Initialize the admin.
   *
   * @param {Boolean} active
   */
  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshImageList();
        this._selectDefaultLanguage();
        this._updateVirtualFolderList();
        if (this._activeTab === 'pipeline-view') {
          this._loadCurrentFlowData();
        }
      }, true);
    } else { // already connected
      this._refreshImageList();
      this._selectDefaultLanguage();
      this._updateVirtualFolderList();
      if (this._activeTab === 'pipeline-view') {
        this._loadCurrentFlowData();
      }
    }
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
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
    this.shadowRoot.querySelector('#task-environment').addEventListener(
      'selected', this.updateLanguage.bind(this));
    this.vfolderGrid = this.shadowRoot.querySelector('#vfolder-grid');

    document.addEventListener('node-selected', (e: any) => {
      if (e.detail) {
        this.selectedNode = e.detail;
        this.isNodeSelected = true;
      }
    });
    document.addEventListener('node-unselected', (e: any) => {
      this.selectedNode = {};
      this.isNodeSelected = false;
    });
    document.addEventListener('flow-response', (e: any) => {
      if (e.detail) {
        this.pipelineInfo.dataflow = e.detail;
      }
    });
    document.addEventListener('pipeline-view-active-tab-change', (e: any) => {
      if (e.detail) {
        const tabGroup = [...this.shadowRoot.querySelector('#pipeline-pane').children];
        this.shadowRoot.querySelector('#pipeline-pane').activeIndex = tabGroup.map((tab) => tab.title).indexOf(e.detail.activeTab.title);
        this._showTab(e.detail.activeTab, '.tab-content');
        this.pipelineInfo = e.detail.pipeline;
        this.pipelineInfo = this._deserializePipelineInfo(this.pipelineInfo);
        this._loadCurrentFlowData();
        this._loadDefaultMounts();
        this.shadowRoot.querySelector('#pipeline-name').innerHTML = this.pipelineInfo.name;
      }
    });
  }

  /**
   * Enable button only when pipelineInfo is loaded
   */
  _toggleButtonStatus() {
    const buttonList = <any>[];
    const pipelineOperationBtnList = [...this.shadowRoot.querySelectorAll('mwc-icon-button.pipeline-operation')];
    const newTaskBtn = this.shadowRoot.querySelector('mwc-button#new-task');
    if (pipelineOperationBtnList !== null) {
      buttonList.push(...pipelineOperationBtnList);
    }
    if (newTaskBtn !== null) {
      buttonList.push(newTaskBtn);
    }
    for (const elem of buttonList) {
      elem.disabled = this.pipelineInfo.name ? false : true;
    }
  }

  /**
   * Display the tab.
   *
   * @param {HTMLElement} tab - mwc-tab element
   * @param {string} tabClass - class name of tab
   */
  _showTab(tab, tabClass='') {
    const els = this.shadowRoot.querySelectorAll(tabClass);
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
    const selectedItem = this.shadowRoot.querySelector('#task-environment').selected;
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
    const tagEl = this.shadowRoot.querySelector('#task-environment-tag');
    if (kernel in this.supports) {
      const versions = this.supports[kernel];
      versions.sort();
      versions.reverse(); // New version comes first.
      this.versions = versions;
    }
    if (this.versions !== undefined) {
      tagEl.value = this.versions[0];
      tagEl.selectedText = tagEl.value;
      // this.updateMetric('update versions');
    }
  }

  /**
   * Refresh environment image information from manager.
   */
  _refreshImageList() {
    const fields = [
      'name', 'humanized_name', 'tag', 'registry', 'digest', 'installed',
      'resource_limits { key min max }'
    ];
    globalThis.backendaiclient.image.list(fields, true).then((response) => {
      const images: Array<Record<string, unknown>> = [];
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
      Object.keys(this.images).map((objectKey, index) => {
        const item = this.images[objectKey];
        const supportsKey = `${item.registry}/${item.name}`;
        if (!(supportsKey in this.supports)) {
          this.supports[supportsKey] = [];
        }
        this.supports[supportsKey].push(item.tag);
        this.resourceLimits[`${supportsKey}:${item.tag}`] = item.resource_limits;
      });
      this._updateEnvironment();
    }).catch((err) => {
      // this.metadata_updating = false;
      console.error(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true);
      }
    });
  }

  /**
   * Refresh environment image information into at most three tags
   */
  _updateEnvironment() {
    // this.languages = Object.keys(this.supports);
    // this.languages.sort();
    const langs = Object.keys(this.supports);
    if (langs === undefined) return;
    langs.sort();
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
      const specs = item.split('/');
      const registry = specs[0];
      let prefix; let kernelName;
      if (specs.length == 2) {
        prefix = '';
        kernelName = specs[1];
      } else {
        prefix = specs[1];
        kernelName = specs[2];
      }
      const alias = this.aliases[item];
      let basename;
      if (alias !== undefined) {
        basename = alias.split(' (')[0];
      } else {
        basename = kernelName;
      }
      let tags: string[] = [];
      if (kernelName in this.tags) {
        tags = tags.concat(this.tags[kernelName]);
      }
      if (prefix != '') {
        tags.push(prefix);
      }
      this.languages.push({
        name: item,
        registry: registry,
        prefix: prefix,
        kernelname: kernelName,
        alias: alias,
        basename: basename,
        tags: tags
      });
    });
    this._initAliases();
  }

  /**
   * Select fallback(default) image
   */
  _selectDefaultLanguage() {
    if (globalThis.backendaiclient._config.default_session_environment !== undefined &&
      'default_session_environment' in globalThis.backendaiclient._config &&
      globalThis.backendaiclient._config.default_session_environment !== '') {
      this.defaultLanguage = globalThis.backendaiclient._config.default_session_environment;
    } else if (this.languages.length !== 0) {
      this.defaultLanguage = this.languages[0].name;
    } else {
      this.defaultLanguage = 'cr.backend.ai/stable/python';
    }
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

  /**
   * Create a task in pipeline
   */
  _createTask() {
    const taskInfo = this._readCurrentTaskInfo();

    // detail: {name, inputs #, outputs #, pos_x, pos_y, class, data, html, typenode}
    const paneElement = this.shadowRoot.querySelector('pipeline-flow');
    const paneSize = paneElement.paneSize;
    Object.assign(taskInfo, {
      pos_x: paneSize.width / 2,
      pos_y: paneSize.height / 3,
    });
    const addTaskEvent = new CustomEvent('add-task', {'detail': taskInfo});
    document.dispatchEvent(addTaskEvent);
    this.notification.text = `Task ${taskInfo.name} updated.`;
    this.notification.show();
    this._hideDialogById('#task-dialog');
  }

  /**
   * Return task into formatted json
   *
   * @return {json} task
   */
  _readCurrentTaskInfo() {
    const taskName = this.shadowRoot.querySelector('#task-name').value;
    const taskType = this.shadowRoot.querySelector('#task-type').value;
    const taskEnvironment = {
      'kernel': this.shadowRoot.querySelector('#task-environment').value,
      'version': this.shadowRoot.querySelector('#task-environment-tag').value,
      'scaling-group': this.shadowRoot.querySelector('#task-environment-scaling-group').value,
    };
    const taskResources = {
      cpu: this.shadowRoot.querySelector('#task-cpu').value,
      mem: this.shadowRoot.querySelector('#task-mem').value,
      resource_opts: {
        shmem: this.shadowRoot.querySelector('#task-shmem').value,
      },
      cuda: {
        shares: this.shadowRoot.querySelector('#task-gpu').value,
        device: ''
      },
    };
    const taskCommand = this.shadowRoot.querySelector('#command-editor').getValue();
    const taskMounts = this.selectedVfolders;
    // detail: {name, inputs #, outputs #, pos_x, pos_y, class, data, html, typenode}
    return {
      name: taskName,
      inputs: 1,
      outputs: 1,
      class: 'new-task',
      pos_x: 0,
      pos_y: 0,
      data: {
        type: taskType,
        environment: taskEnvironment,
        resources: taskResources,
        cmd: taskCommand,
        mounts: taskMounts,
      },
      html: `${taskName}`, // put raw html code
    };
  }

  /**
   * Update the selected task in pipeline
   */
  _updateTask() {
    const taskInfo = this._readCurrentTaskInfo();

    // detail: {name, inputs #, outputs #, pos_x, pos_y, class, data, html, typenode}
    Object.assign(taskInfo, {
      pos_x: this.selectedNode.pos_x,
      pos_y: this.selectedNode.pos_y,
    });
    const updateTaskEvent = new CustomEvent('update-task', {'detail': {
      nodeId: this.selectedNode.id,
      data: taskInfo
    }
    });
    document.dispatchEvent(updateTaskEvent);
    this._hideDialogById('#task-dialog');
    this.notification.text = `Task ${taskInfo.name} updated.`;
    this.notification.show();
  }

  /**
   * Remove the selected task in pipeline
   */
  _removeTask() {
    /**
     * TODO: Remove task with confirmation dialog
     *
     * procedure:
     *    step 1. Show remove task confirmation dialog
     *    step 2. If confirmation dialog returns true, then dispatchEvent to remove the node.
     */
    // step 1. Show remove task confirmation dialog

    // step 2. If confirmation dialog returns true, then dispatchEvent to remove the node.
    const removeTaskEvent = new CustomEvent('remove-task', {'detail': this.selectedNode.id});
    document.dispatchEvent(removeTaskEvent);
    this.notification.text = `Task ${this.selectedNode.name} removed.`;
    this.notification.show();
  }

  /**
   * Update Pipeline Information to current change
   *
   */
  _updatePipelineInfo() {
    // if name input field is empty, then use original name instead
    const name = this.shadowRoot.querySelector('#edit-pipeline-name').value ?? this.pipelineInfo.name;
    const selectedScalingGroup = this.shadowRoot.querySelector('#edit-scaling-group').value;

    /**
     * TODO: update pipeline edit dialog with rich input form
     */
    const yaml = this.pipelineInfo.yaml;
    yaml.name = name;
    yaml.environment.scaling_group = selectedScalingGroup;
    const input = {
      name: name,
      // description: '',
      yaml: JSON.stringify(yaml),
      // dataflow: {},
      // is_active: true,
    };
    // step 1. Send update request to corresponding API server
    const pipelineId = this.pipelineInfo.id;
    globalThis.backendaiclient.pipeline.update(pipelineId, input).then((res) => {
      // step 2. Receive the response and if succeeds, then change current pipeline info
      const pipeline = res;
      pipeline.created_at = PipelineUtils._humanReadableDate(pipeline.created_at);
      pipeline.last_modified = PipelineUtils._humanReadableDate(pipeline.last_modified);
      this.pipelineInfo = this._deserializePipelineInfo(pipeline);
      this.pipelineInfo.yaml.environment.scaling_group = selectedScalingGroup;
      this.shadowRoot.querySelector('#pipeline-name').innerHTML = this.pipelineInfo.name;
      this.notification.text = `Pipeline ${this.pipelineInfo.name} updated.`;
      this.notification.show();
    }).catch((err) => {
      console.log(err);
    });
    // step 3. Close the edit-pipeline dialog
    this._hideDialogById('#edit-pipeline');
  }

  /**
   * Update selected folders.
   * If selectedFolderItems are not empty and forceInitialize is true, unselect the selected items
   *
   * */
  _updateSelectedFolder() {
    if (this.vfolderGrid && this.vfolderGrid.selectedItems) {
      const selectedFolderItems = this.vfolderGrid.selectedItems;
      let selectedFolders: string[] = [];
      if (selectedFolderItems.length > 0) {
        selectedFolders = selectedFolderItems.map((item) => item.name);
      }
      this.selectedVfolders = selectedFolders;
    }
    return Promise.resolve(true);
  }

  /**
   * Give focus on command-editor
   */
  _focusCmdEditor() {
    const cmdEditor = this.shadowRoot.querySelector('#command-editor');
    cmdEditor.refresh();
    cmdEditor.focus();
  }

  /**
   * Remove any string typed in command-editor
   */
  _clearCmdEditor() {
    const cmdEditor = this.shadowRoot.querySelector('#command-editor');
    cmdEditor.setValue('');
  }

  /**
   * Load string to command-editor
   */
  _loadDataToCmdEditor() {
    const cmdEditor = this.shadowRoot.querySelector('#command-editor');
    cmdEditor.setValue(this.selectedNode.data?.cmd ?? '');
  }

  /**
   * Import pipeline node graph to dataflow pane
   */
  _loadCurrentFlowData() {
    if (this.pipelineInfo) {
      const currentFlowData = this.pipelineInfo.dataflow ?? {};
      const flowDataReqEvent = new CustomEvent('import-flow', {'detail': currentFlowData});
      document.dispatchEvent(flowDataReqEvent);
      if (this.pipelineInfo.name) {
        this.notification.text = `Pipeline ${this.pipelineInfo.name} loaded.`;
        this.notification.show();
      }
    }
  }

  _loadDefaultMounts() {
    this.defaultSelectedVfolders = this.pipelineInfo.yaml.mounts;
    if (this.vfolderGrid.items) {
      this.vfolderGrid.items.forEach((item) => {
        if (this.defaultSelectedVfolders.includes(item.name)) {
          // force-select vfolder
          this.vfolderGrid.selectItem(item);
        }
      });
    }
  }

  /**
   * Update accessible vfolders
   *
   * @return {void}
   */
  async _updateVirtualFolderList() {
    return this.resourceBroker.updateVirtualFolderList().then(() => {
      this.vfolders = this.resourceBroker.vfolders;
    });
  }

  /**
   * Save pipeline node graph into pipeline data
   *
   */
  _saveCurrentFlowData() {
    const flowDataReqEvent = new CustomEvent('export-flow');
    document.dispatchEvent(flowDataReqEvent);

    this.pipelineInfo = this._deserializePipelineInfo(this.pipelineInfo);
    // convert object to string (dataflow)
    this.pipelineInfo.yaml.tasks = this.parseTaskListInfo(this.pipelineInfo.dataflow);
    this.pipelineInfo = this._serializePipelineInfo(this.pipelineInfo);
    globalThis.backendaiclient.pipeline.update(this.pipelineInfo.id, this.pipelineInfo).then((res) => {
      const pipeline = res;
      this.pipelineInfo = this._deserializePipelineInfo(pipeline);
      this.notification.text = `Pipeline ${this.pipelineInfo.name} saved.`;
      this.notification.show();
    }).catch((err) => {
      console.log(err);
    });
  }

  /**
   * Return pipelineInfo to sendable data stream
   */
  _serializePipelineInfo(pipelineInfo) {
    if (Object.keys(pipelineInfo).length !== 0) {
      return {
        ...pipelineInfo,
        yaml: (typeof pipelineInfo.yaml !== 'string') ? JSON.stringify(pipelineInfo.yaml ?? {}) : pipelineInfo.yaml,
        dataflow: (typeof pipelineInfo.dataflow !== 'string') ? JSON.stringify(pipelineInfo.dataflow ?? `{}`): pipelineInfo.dataflow,
      };
    }
  }

  /**
   * Return pipelineInfo to modificable data object
   */
  _deserializePipelineInfo(pipelineInfo) {
    if (Object.keys(pipelineInfo).length !== 0) {
      return {
        ...pipelineInfo,
        yaml: (typeof pipelineInfo.yaml === 'string') ? JSON.parse(pipelineInfo.yaml ?? `{}`) : pipelineInfo.yaml,
        dataflow: (typeof pipelineInfo.dataflow === 'string') ? JSON.parse(pipelineInfo.dataflow ?? `{}`): pipelineInfo.dataflow,
      };
    }
  }

  /**
   * Move from current page to the other page corrsponding to url address and tab
   *
   * @param {string} url - page to redirect from the current page.
   */
  _moveTo(url = '', tabTitle = '') {
    // const page = url !== '' ? url : '/pipeline';
    // const tab = tabTitle !== '' ? tabTitle : 'pipeline-job-list';
    // setTimeout(() => {}, 100);
    // globalThis.history.pushState({}, '', url);
    // store.dispatch(navigate(decodeURIComponent(page), {tab: tab}));
    const activePageChangeEvent = new CustomEvent('active-menu-change-event', {
      'detail': {
        activePage: url,
        activeTab: tabTitle
      }
    });
    document.dispatchEvent(activePageChangeEvent);
    // FIXME: temporally redirect page due to inert attribute in page element
    globalThis.location.href = url;
  }

  /**
   * Instantiate pipeline to pipeline job and move to pipeline job page
   */
  _runPipeline() {
    this.pipelineInfo = this._serializePipelineInfo(this.pipelineInfo);
    globalThis.backendaiclient.pipeline.run(this.pipelineInfo.id, this.pipelineInfo).then((res) => {
      this.notification.text = `Instantiate Pipeline ${this.pipelineInfo.id}...`;
      this.notification.show();
      this._moveTo('/pipeline-job');
    }).catch((err) => {
      console.log(err);
    });
  }

  /**
   * Show run pipeline dialog
   */
  _showRunPipelineDialog() {
    // automatically save current pipeline info before execute
    this._saveCurrentFlowData();
    this._launchDialogById('#run-pipeline');
  }

  /**
   * Show task create dialog
   */
  _showTaskCreateDialog() {
    this._clearCmdEditor();
    this._updateSelectedFolder();
    this._launchDialogById('#task-dialog');
  }

  /**
   * Show task edit dialog
   */
  _showTaskEditDialog() {
    this._loadDataToCmdEditor();
    this._updateSelectedFolder();
    this._launchDialogById('#task-dialog');
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
   * Combine kernel and version
   *
   * @param {string} kernel - kernel name
   * @param {string} version - version
   * @return {string} `${kernel}:${version}`
   */
  _generateKernelIndex(kernel, version) {
    return kernel + ':' + version;
  }

  /**
   * Parse custom data from dataflow element to array of formatted task (json)
   *
   * @param {json} rawData - raw object from dataflow
   * @return {Array} taskList
   */
  parseTaskListInfo(rawData) {
    const rawTaskList = rawData?.drawflow?.Home?.data;
    const getTaskNameFromNodeId = (connectionList) => {
      return (connectionList.length > 0) ? connectionList.map((item) => {
        return rawTaskList[item.node].name;
      }) : [];
    };
    let taskList;
    const taskNodes = Object.values(rawTaskList ?? {});
    if (taskNodes.length > 0) {
      taskList = taskNodes.map((task: any) => {
        return {
          name: task.name,
          description: task.description,
          type: Object.keys(this.taskType).find((type) => this.taskType[type] === task.data.type),
          module_uri: '',
          command: task.data.cmd,
          environment: {
            'scaling-group': this.pipelineInfo?.yaml?.environment?.scaling_group,
            'image': `${this._generateKernelIndex(task.data.environment.kernel, task.data.environment.version)}` ?? '',
            'envs': task.data.environment.envs ?? {},
          },
          resources: {
            cpu: parseInt(task.data.resources.cpu),
            mem: task.data.resources.mem + 'g',
            // cuda: task.data.resources.cuda
          },
          resource_opts: {
            shmem: task.data.resources.resource_opts.shmem + 'g'
          },
          mounts: task.data.mounts,
          dependencies: getTaskNameFromNodeId(task.inputs?.input_1?.connections),
        };
      });
    } else {
      taskList = [];
    }
    return taskList;
  }

  render() {
    // language=HTML
    return html`
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar id="pipeline-pane" @MDCTabBar:activated="${() => this._toggleButtonStatus()}">
              <mwc-tab title="pipeline-list" label="List" @click="${(e) => this._showTab(e.target, '.tab-content')}"></mwc-tab>
              <mwc-tab title="pipeline-view" label="View" @click="${(e) => this._showTab(e.target, '.tab-content')}"></mwc-tab>
            </mwc-tab-bar>
          </h3>
        <div id="pipeline-list" class="tab-content">
          <pipeline-list ?active="${this._activeTab === 'pipeline-list'}"></pipeline-list>
        </div>
        <div id="pipeline-view" class="tab-content" style="display:none;">
          <div class="horizontal layout flex justified">
            <div class="horizontal layout flex center start-justified">
            <span id="pipeline-name"></span>
            <mwc-icon-button class="pipeline-operation" icon="save" @click="${() => this._saveCurrentFlowData()}"></mwc-icon-button>
            <mwc-icon-button class="pipeline-operation" icon="play_arrow" @click="${() => this._showRunPipelineDialog()}"></mwc-icon-button>
            <mwc-icon-button class="pipeline-operation" icon="settings" @click="${() => this._launchDialogById('#edit-pipeline')}"></mwc-icon-button>
            </div>
            <div class="horizontal layout flex center end-justified">
              ${this.isNodeSelected ? html`
                <mwc-button outlined icon="delete" label="Remove Task" @click="${() => this._removeTask()}"></mwc-button>
                <mwc-button outlined icon="edit" label="Edit Task" @click="${() => this._showTaskEditDialog()}"></mwc-button>
              ` : html`
                <mwc-button id="new-task" unelevated icon="add" label="New Task" @click="${() => this._showTaskCreateDialog()}"></mwc-button>
              `}
            </div>
          </div>
          <pipeline-flow isEditable="true"></pipeline-flow>
        </div>
      </lablup-activity-panel>
      <backend-ai-dialog id="run-pipeline" fixed backdrop blockscrolling persistent>
        <span slot="title">Run Pipeline</span>
        <div slot="content" class="vertical layout center center-justified flex">
          <p style="font-weight: bold; font-size:1rem;">Ready to instantiate pipeline</p>
          <p style="font-size:1rem;">${this.pipelineInfo.name}</p>
        </div>
        <div slot="footer" class="horizontal layout end-justified flex">
          <mwc-button outlined label="Cancel" @click="${() => this._hideDialogById('#run-pipeline')}"></mwc-button>
          <mwc-button unelevated label="Proceed" @click="${() => this._runPipeline()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="edit-pipeline" fixed backdrop blockscrolling persistent>
        <span slot="title">Edit Pipeline</span>
        <div slot="content">
          <mwc-textfield id="edit-pipeline-name" label="Pipeline Name" value="${this.pipelineInfo.name}" required></mwc-textfield>
          <mwc-select class="full-width" id="edit-scaling-group" label="ScalingGroup" fixedMenuPosition required>
            ${this.scalingGroups.map((item) => {
    return html`<mwc-list-item id="${item}" value="${item}" ?selected="${item === this.pipelineInfo?.yaml?.environment?.scaling_group}">${item}</mwc-list-item>`;
  })}
          </mwc-select>
        </div>
        <div slot="footer" class="horizontal layout end-justified flex">
          <mwc-button outlined label="Cancel" @click="${() => this._hideDialogById('#edit-pipeline')}"></mwc-button>
          <mwc-button unelevated label="Update" @click="${() => this._updatePipelineInfo()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="task-dialog" fixed backdrop blockscrolling persistent>
        <span slot="title">${this.isNodeSelected ? 'Edit Task' : 'Add Task'}</span>
        <div slot="content" class="vertical layout center flex">
          <mwc-tab-bar class="task-tab">
            <mwc-tab title="task-settings" label="Settings" @MDCTab:interacted=${() => this._focusCmdEditor()} @click="${(e) => this._showTab(e.target, '.task-tab-content')}"></mwc-tab>
            <mwc-tab title="task-resources" label="Resources" @click="${(e) => this._showTab(e.target, '.task-tab-content')}"></mwc-tab>
            <mwc-tab title="task-mounts" label="Mounts" @click="${(e) => this._showTab(e.target, '.task-tab-content')}"></mwc-tab>
          </mwc-tab-bar>
          <div id="task-settings" class="vertical layout center flex task-tab-content">
            <mwc-textfield id="task-name" label="Task Name" value="${this.selectedNode?.name}" required></mwc-textfield>
            ${this.isNodeSelected ? html`
              <mwc-textfield id="task-type" label="Task Type" value="${this.selectedNode?.data?.type}" disabled></mwc-textfield>
            ` : html`
              <mwc-select class="full-width" id="task-type" label="Task Type" fixedMenuPosition required>
                ${Object.keys(this.taskType).map((item) => {
    return html`<mwc-list-item id="${item}" value="${this.taskType[item]}" ?selected="${item === 'custom'}">${this.taskType[item]}</mwc-list-item>`;
  })}
              </mwc-select>
            `}
            <div class="vertical layout start-justified flex">
              <span style="padding-left:15px;">Command</span>
              <lablup-codemirror id="command-editor" mode="shell"></lablup-codemirror>
            </div>
          </div>
          <div id="task-resources" class="vertical layout center flex task-tab-content" style="display:none;">
          <mwc-select class="full-width" id="task-environment-scaling-group" label="Scaling Group" fixedMenuPosition>
            ${this.scalingGroups.map((item, idx) => {
    return html`<mwc-list-item id="${item}" value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>`;
  })}
          </mwc-select>
            <mwc-select class="full-width" id="task-environment" label="Task Environment" required fixedMenuPosition value="${this.defaultLanguage}">
                ${this.languages.map((item) => html`
                  <mwc-list-item id="${item.name}" value="${item.name}" ?selected="${item.name === (this.selectedNode?.environment?.kernel ?? this.defaultLanguage)}">
                    <div class="horizontal justified center flex layout" style="width:325px;">
                      <div style="padding-right:5px;">${item.basename}</div>
                      <div class="horizontal layout end-justified center flex">
                          ${item.tags ? item.tags.map((item) => html`
                            <lablup-shields style="margin-left:5px;" description="${item}"></lablup-shields>
                          `) : ''}
                        </div>
                    </div>
                  </mwc-list-item>`
  )}
            </mwc-select>

            <mwc-select class="full-width" id="task-environment-tag" label="Version" required fixedMenuPosition>
              <mwc-list-item style="display:none"></mwc-list-item>
              ${this.isNodeSelected ? html`
                ${this.versions.map((item) => {
    return html`
                  <mwc-list-item id="${item}" value="${item}"
                  ?selected="${item === this.selectedNode?.data?.environment?.version}">${item}</mwc-list-item>
                  `;
  })}
              ` : html`
                  ${this.versions.map((item, idx) => html`
                    <mwc-list-item id="${item}" value="${item}"
                        ?selected="${idx === 0}">${item}</mwc-list-item>
                  `)}
              `}
            </mwc-select>
            <mwc-textfield id="task-cpu" label="CPU" type="number" value="${this.selectedNode.data?.resources?.cpu ?? 1}" min="1" suffix="Core"></mwc-textfield>
            <mwc-textfield id="task-mem" label="Memory (GiB)" type="number" value="${this.selectedNode.data?.resources?.mem ?? 0}" min="0" suffix="GB"></mwc-textfield>
            <mwc-textfield id="task-shmem" label="Shared Memory" type="number" value="${this.selectedNode.data?.resources?.resource_opts?.shmem ?? 0.0125}" min="0.0125" suffix="GB"></mwc-textfield>
            <mwc-textfield id="task-gpu" label="GPU" type="number" value="${this.selectedNode.data?.resources?.cuda?.shares ?? 0}" min="0" suffix="Unit"></mwc-textfield>
          </div>
          <div id="task-mounts" class="vertical layout center flex task-tab-content" style="display:none;">
            <vaadin-grid
                theme="row-stripes column-borders compact wrap-cell-content"
                id="vfolder-grid"
                aria-label="vfolder list"
                all-rows-visible
                .items="${this.vfolders}"
                @selected-items-changed="${() => this._updateSelectedFolder()}">
              <vaadin-grid-selection-column id="select-column"
                                            flex-grow="0"
                                            text-align="center"
                                            auto-select></vaadin-grid-selection-column>
              <vaadin-grid-filter-column header="Folder"
                                        path="name" resizable></vaadin-grid-filter-column>
            </vaadin-grid>
            ${this.vfolders.length > 0 ? html`` : html`
              <div class="vertical layout center flex blank-box-medium">
                <span>There's no available folder to mount :(</span>
              </div>
            `}
          </div>
        </div>
        <div slot="footer" class="horizontal layout center center-justified flex">
          ${this.isNodeSelected ? html`
            <mwc-button outlined label="Cancel" @click="${() => this._hideDialogById('#task-dialog')}"></mwc-button>
            <mwc-button unelevated label="Update" @click="${() => this._updateTask()}"></mwc-button>
          `: html`
            <mwc-button unelevated class="full-width" label="CREATE TASK" @click="${()=> this._createTask()}"></mwc-button>
          `}
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-view': PipelineView;
  }
}
