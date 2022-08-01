/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import PipelineUtils from '../lib/pipeline-utils';
import PipelineConfigurationForm from '../lib/pipeline-configuration-form';
import {BackendAIPage} from '../../components/backend-ai-page';
import '../../components/backend-ai-dialog';
import '../../components/lablup-activity-panel';
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
import {PipelineInfo, PipelineTaskNode, PipelineTask, PipelineEnvironment, PipelineResources} from '../lib/pipeline-type';
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
  @property({type: PipelineInfo}) pipelineInfo;
  @property({type: Object}) taskInfo;

  // Elements
  @property({type: Object}) spinner = Object();
  @property({type: Object}) notification = Object();
  // Environments
  @property({type: Array}) scalingGroups = ['default'];
  @property({type: Object}) resourceBroker;

  @property({type: Object}) taskType = {
    github: 'Import from GitHub',
    gitlab: 'Import from GitLab',
    custom: 'Custom Task'
  };

  @query('pipeline-configuration-form') pipelineConfigurationForm!: PipelineConfigurationForm;

  constructor() {
    super();
    this._initResources();
  }

  _initResources() {
    this.resourceBroker = globalThis.resourceBroker;
    this.pipelineInfo = new PipelineInfo();
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

        backend-ai-dialog {
          --component-min-width: 390px;
          --component-max-width: 390px;
        }

        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0px 0px;
          margin: 0px auto;
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

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
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
        if (this._activeTab === 'pipeline-view') {
          const parsedPipelineInfo = this._parsePipelineInfo(this.pipelineInfo);
          this._loadCurrentFlowData(parsedPipelineInfo);
        }
      }, true);
    } else { // already connected
      if (this._activeTab === 'pipeline-view') {
        const parsedPipelineInfo = this._parsePipelineInfo(this.pipelineInfo);
        this._loadCurrentFlowData(parsedPipelineInfo);
      }
    }
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;

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
        this._showTabContent(e.detail.activeTab);
        this.pipelineInfo = e.detail.pipeline;
        const parsedPipelineInfo = this._parsePipelineInfo(this.pipelineInfo);
        this._loadCurrentFlowData(parsedPipelineInfo);
        this.pipelineConfigurationForm._loadDefaultMounts(parsedPipelineInfo.yaml.mounts);
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
   * Display inside the tab content and hide contents in the others tab
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
   * Create a task in pipeline
   */
  _createTask() {
    if (!this.pipelineConfigurationForm._validatePipelineConfigInput()) {
      return;
    }

    const taskInfo: PipelineTaskNode = this.pipelineConfigurationForm.inputFieldListAsInstance(false) as PipelineTaskNode;

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
   * Update the selected task in pipeline
   */
  _updateTask() {
    if (!this.pipelineConfigurationForm._validatePipelineConfigInput()) {
      return;
    }

    const taskInfo: PipelineTaskNode = this.pipelineConfigurationForm.inputFieldListAsInstance(false) as PipelineTaskNode;

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
      this.pipelineInfo = res;
      // pipeline.created_at = PipelineUtils._humanReadableDate(pipeline.created_at);
      // pipeline.last_modified = PipelineUtils._humanReadableDate(pipeline.last_modified);
      // this.pipelineInfo = this._parsePipelineInfo(pipeline);
      // this.pipelineInfo.yaml.environment.scaling_group = selectedScalingGroup;
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
   * Import pipeline node graph to dataflow pane
   */
  _loadCurrentFlowData(pipeline) {
    if (pipeline) {
      const currentFlowData = pipeline.dataflow ?? {};
      const flowDataReqEvent = new CustomEvent('import-flow', {'detail': currentFlowData});
      document.dispatchEvent(flowDataReqEvent);
      if (pipeline.name) {
        this.notification.text = `Pipeline ${pipeline.name} loaded.`;
        this.notification.show();
      }
    }
  }

  /**
   * Save pipeline node graph into pipeline data
   *
   */
  _saveCurrentFlowData() {
    const flowDataReqEvent = new CustomEvent('export-flow');
    document.dispatchEvent(flowDataReqEvent);

    const parsedPipelineInfo = this._parsePipelineInfo(this.pipelineInfo);
    // convert object to string (dataflow)
    parsedPipelineInfo.tasks = this._parseTaskListInfo(this.pipelineInfo.dataflow);
    this.pipelineInfo = this._stringifyPipelineInfo(parsedPipelineInfo);
    globalThis.backendaiclient.pipeline.update(this.pipelineInfo.id, this.pipelineInfo).then((res) => {
      this.pipelineInfo = res;
      this.notification.text = `Pipeline ${this.pipelineInfo.name} saved.`;
      this.notification.show();
    }).catch((err) => {
      console.log(err);
    });
  }

  /**
   * Return pipelineInfo to sendable data stream
   */
  _stringifyPipelineInfo(pipelineInfo) {
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
  _parsePipelineInfo(pipelineInfo) {
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
    this.pipelineInfo = this._stringifyPipelineInfo(this.pipelineInfo);
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
  async _showTaskCreateDialog() {
    this.pipelineConfigurationForm._clearCmdEditor();
    await this.pipelineConfigurationForm._initConfiguration();
    this._launchDialogById('#task-dialog');
  }

  /**
   * Show pipeline update dialog
   */
  async _showPipelineEditDialog() {
    const stringifiedPipelineInfo = this._stringifyPipelineInfo(this.pipelineInfo)
    await this.pipelineConfigurationForm._loadCurrentPipelineConfiguration(stringifiedPipelineInfo);
    this._launchDialogById('#edit-pipeline');
  }

  /**
   * Show task edit dialog
   */
  async _showTaskEditDialog() {
    this.pipelineConfigurationForm._loadDataToCmdEditor(this.selectedNode.data?.cmd);
    await this.pipelineConfigurationForm._initConfiguration();
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
   * Parse custom data from dataflow element to array of formatted task (json)
   *
   * @param {json} rawData - raw object from dataflow
   * @return {Array<PipelineTask>} taskList
   */
  _parseTaskListInfo(rawData) {
    const parsedPipelineInfo = this._parsePipelineInfo(this.pipelineInfo);
    const rawTaskList = rawData?.drawflow?.Home?.data;
    const getTaskNameFromNodeId = (connectionList) => {
      return (connectionList.length > 0) ? connectionList.map((item) => {
        return rawTaskList[item.node].name;
      }) : [];
    };
    let taskList: Array<PipelineTask>;
    const taskNodes = Object.values(rawTaskList ?? {});
    if (taskNodes.length > 0) {
      taskList = taskNodes.map((task: any) => {
        return {
          name: task.name,
          description: task.description,
          type: Object.keys(this.taskType).find((type) => this.taskType[type] === task.data.type),
          module_uri: '',
          command: task.data.command,
          environment: {
            'scaling-group': parsedPipelineInfo.yaml?.environment?.['scaling-group'],
            image: `${PipelineUtils._generateKernelIndex(task.data.environment.kernel, task.data.environment.version)}` ?? '',
            envs: task.data.environment.envs ?? {},
          } as PipelineEnvironment,
          resources: {
            cpu: task.data.resources.cpu,
            memory: task.data.resources.memory + 'g',
            cuda: task.data.resources.cuda
          } as PipelineResources,
          resource_opts: {
            shmem: task.data.resource_opts.shmem + 'g'
          },
          mounts: task.data.mounts,
          dependencies: getTaskNameFromNodeId(task.inputs?.input_1?.connections),
        } as PipelineTask;
      });
    } else {
      taskList = [];
    }
    return taskList;
  }

  renderRunPipelineDialogTemplate() {
    // language=HTML
    return html`
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
    </backend-ai-dialog>`;
  }

  renderEditPipelineDialogTemplate() {
    // language=HTML
    return html`
    <backend-ai-dialog id="edit-pipeline" fixed backdrop blockscrolling persistent narrowLayout>
      <span slot="title">Edit Pipeline</span>
      <div slot="content">
        <pipeline-configuration-form ?is-editmode=${this.pipelineInfo !== null} pipeline-info=${this.pipelineInfo}></pipeline-configuration-form>
      </div>
      <div slot="footer" class="horizontal layout end-justified flex">
        <mwc-button outlined label="Cancel" @click="${() => this._hideDialogById('#edit-pipeline')}"></mwc-button>
        <mwc-button unelevated label="Update" @click="${() => this._updatePipelineInfo()}"></mwc-button>
      </div>
    </backend-ai-dialog>
    `;
  }

  renderPipelineTaskDialogTemplate() {
    // language=HTML
    return html`
    <backend-ai-dialog id="task-dialog" fixed backdrop blockscrolling persistent narrowLayout>
    <span slot="title">${this.isNodeSelected ? 'Edit Task' : 'Add Task'}</span>
    <div slot="content" class="vertical layout center flex">
      <pipeline-configuration-form configuration-type="pipeline-task" ?is-editmode=${this.isNodeSelected}></pipeline-configuration-form>
    </div>
    <div slot="footer" class="horizontal layout center center-justified flex">
      ${this.isNodeSelected ? html`
        <mwc-button outlined label="Cancel" @click="${() => this._hideDialogById('#task-dialog')}"></mwc-button>
        <mwc-button unelevated label="Update" @click="${() => this._updateTask()}"></mwc-button>
      `: html`
        <mwc-button unelevated class="full-width" label="Create Task" @click="${()=> this._createTask()}"></mwc-button>
      `}
    </div>
  </backend-ai-dialog>
    `;
  }


  render() {
    // language=HTML
    return html`
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar id="pipeline-pane" @MDCTabBar:activated="${() => this._toggleButtonStatus()}">
              <mwc-tab title="pipeline-list" label="List" @click="${(e) => this._showTabContent(e.target)}"></mwc-tab>
              <mwc-tab title="pipeline-view" label="View" @click="${(e) => this._showTabContent(e.target)}"></mwc-tab>
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
                <mwc-icon-button class="pipeline-operation" icon="settings" @click="${() => this._showPipelineEditDialog()}"></mwc-icon-button>
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
            <pipeline-flow isEditable></pipeline-flow>
          </div>
        </div>
      </lablup-activity-panel>
      ${this.renderRunPipelineDialogTemplate()}
      ${this.renderEditPipelineDialogTemplate()}
      ${this.renderPipelineTaskDialogTemplate()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-view': PipelineView;
  }
}
