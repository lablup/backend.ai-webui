/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property, query, queryAll} from 'lit/decorators.js';

import {BackendAiStyles} from '../../components/backend-ai-general-styles';
import {BackendAIPipelineStyles} from '../lib/pipeline-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../../plastics/layout/iron-flex-layout-classes';

import {default as YAML} from 'js-yaml';

import '@material/mwc-tab/mwc-tab';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-menu/mwc-menu';
import '@material/mwc-button/mwc-button';
import '@material/mwc-select/mwc-select';
import '@material/mwc-list/mwc-list-item';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';

import PipelineUtils from '../lib/pipeline-utils';
import {PipelineJob, PipelineTaskInstance, PipelineYAML} from '../lib/pipeline-type';
import {BackendAIPage} from '../../components/backend-ai-page';
import './pipeline-job-list';
import '../lib/pipeline-flow';
import '../../components/lablup-activity-panel';
import '../../components/lablup-codemirror';
import '../../components/backend-ai-dialog';

/**
 Pipeline Job View

 `pipeline-job-view` is wrapper component of instantiated pipeline list and flow display

 Example:

 <pipeline-job-view>
 ...
 </pipeline-job-view>

@group Backend.AI pipeline
 @element pipeline-job-view
*/
@customElement('pipeline-job-view')
export default class PipelineJobView extends BackendAIPage {
  public shadowRoot: any; // ShadowRoot
  @property({type: String}) _activeTab = 'pipeline-job-list';
  @property({type: String}) totalDuration;
  @property({type: PipelineJob}) pipelineJobInfo;
  @property({type: Array<PipelineJob>}) pipelineJobs;
  @property({type: Array<PipelineTaskInstance>}) taskInstanceList;
  @property({type: Boolean}) refreshing;
  @property({type: Object}) refreshTimer;
  @property({type: Object}) taskInstanceNodeMap;
  // Elements
  @property({type: Object}) spinner;
  @property({type: Object}) notification;

  @query('vaadin-grid#pipeline-task-instance-list') taskInstanceGrid;
  @queryAll('vaadin-grid#pipeline-task-instance-list vaadin-grid-column') taskInstanceGridColumnList;
  @queryAll('vaadin-grid#pipeline-task-instance-list vaadin-grid-filter-column') taskInstanceGridFilterColumnList;
  @queryAll('vaadin-grid#pipeline-task-instance-list vaadin-grid-sort-column') taskInstanceGridSortColumnList;

  constructor() {
    super();
    this._initResource();
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      BackendAIPipelineStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        div.configuration {
          width: 90px !important;
          height: 20px;
        }

        div.configuration mwc-icon {
          padding-right: 5px;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        mwc-icon.indicator {
          --mdc-icon-size: 16px;
        }

        pipeline-flow {
          --pane-height: 400px;
        }

        pre {
          white-space: pre-wrap;
          white-space: -moz-pre-wrap;
          white-space: -pre-wrap;
          white-space: -o-pre-wrap;
          word-wrap: break-word;
        }

        #pipeline-list {
          border: 1px solid #ccc;
          margin-right: 20px;
        }

        mwc-menu#dropdown-menu-container {
          position: relative;
        }

        mwc-menu#dropdown-menu {
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
          --mdc-menu-item-height: auto;
          --mdc-theme-surface: #f1f1f1;
          --mdc-menu-item-height : auto;
        }

        mwc-menu#dropdown-menu mwc-icon {
          padding-right: 10px;
          position: relative;
          top: 5px;
        }

        mwc-menu#dropdown-menu mwc-list-item {
          font-size: 14px;
        }
      `
    ];
  }

  /**
   *  Initialize properties of the component
   */
   _initResource() {
    this.notification = globalThis.lablupNotification;
    this.pipelineJobInfo = new PipelineJob();
    this.pipelineJobs = [] as Array<PipelineJob>;
    this.refreshing = false;
    this.refreshTimer = new Object();
    this.taskInstanceNodeMap = Object();
  }

  firstUpdated() {
    this._setVaadinGridRenderers();
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    this.refreshTimer = null;
    document.addEventListener('pipeline-job-view-active-tab-change', async (e: any) => {
      if (e.detail) {
        this._initPipelineTaskListItem();
        const tabGroup = [...this.shadowRoot.querySelector('#pipeline-job-pane').children];
        this.shadowRoot.querySelector('#pipeline-job-pane').activeIndex = tabGroup.map((tab) => tab.title).indexOf(e.detail.activeTab.title);
        this._showTabContent(e.detail.activeTab);
        this.pipelineJobInfo = PipelineUtils._parsePipelineInfo(e.detail.pipelineJob);
        this.pipelineJobs = e.detail.pipelineJobs;
        this._loadTaskNodesByCurrentPipelineJob();
        await this._loadCurrentFlowData();
        PipelineUtils._loadTaskInstances(this.pipelineJobInfo.id).then((res) => {
          this.taskInstanceList = res;
        }).catch((err) => {
          if (err && err.message) {
            this.notification.text = err.title;
            this.notification.detail = err.message;
            this.notification.show(true, err);
          }
        });
      }
    });
    document.addEventListener('active-menu-change-event', (e: any) => {
      if (e.detail) {
        this._showTabContent(e.detail.tabTitle);
      }
    });
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
      document.addEventListener('backend-ai-connected', async () => {
        if (this._activeTab === 'pipeline-job-view') {
          await this._loadCurrentFlowData();
        }
      }, true);
    } else { // already connected
      if (this._activeTab === 'pipeline-job-view') {
        await this._loadCurrentFlowData();
      }
    }
  }

  /**
   * Refresh PipelineJob by long-polling technique
   * 
   * @param {boolean} repeat 
   * @returns {Array<PipelineTaskInstance>} pipelinetask instances
   */
  async _refreshPipelineJob(repeat = true) {
    await this.updateComplete;
    if (this.active !== true) {
      return;
    }
    if (this.refreshing === true) {
      return;
    }
    this.refreshing = true;
    globalThis.backendaiclient.pipelineJob.info(this.pipelineJobInfo.id).then((res) => {
      this.pipelineJobInfo = PipelineUtils._parsePipelineInfo(res);
      if (['SUCCESS', 'FAILURE'].includes(this.pipelineJobInfo.result)) {
        repeat = false;
      }
      return PipelineUtils._loadTaskInstances(this.pipelineJobInfo.id);
    }).then((res) => {
      this.taskInstanceList = res;
      this.taskInstanceList.forEach((task: PipelineTaskInstance) => {
        const updateTaskStatusEvent = new CustomEvent('update-task-status', {'detail': {
          nodeId: this.taskInstanceNodeMap[task.config['name']]['nodeId'],
          status: task.status
        }});
        document.dispatchEvent(updateTaskStatusEvent);
      });
      const refreshTime = 5000; // refresh
      this.refreshing = false;
      if (this.active === true) {
        if (repeat === true) {
          this.refreshTimer = setTimeout(async () => {
            await this._refreshPipelineJob();
          }, refreshTime);
        } else {
        }
      }
    }).catch((err) => {
      // console.log(err);
      if (err && err.message) {
        this.notification.text = err.title;
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    });
  }

  /**
   * Load task nodes by current(selected) pipeline job
   */
  _loadTaskNodesByCurrentPipelineJob() {
    const dataflowObj = (typeof this.pipelineJobInfo.dataflow === 'string' ) ? JSON.parse(this.pipelineJobInfo.dataflow) : this.pipelineJobInfo.dataflow;
    const rawTaskInstanceList = dataflowObj?.drawflow?.Home?.data;
    const taskInstanceNodes = Object.values(rawTaskInstanceList ?? {});
    if (taskInstanceNodes.length > 0) {
      taskInstanceNodes.forEach((task: any) => {
        const nodemap = {};
        nodemap[task.name] = {};
        nodemap[task.name]['nodeId'] = task.id;
        Object.assign(this.taskInstanceNodeMap, nodemap);
      });
    }
  }

  /**
   * Request and receive pipeline job list from pipeline server
   */
  async _loadPipelineJobList() {
    try {
      // If disconnected
      if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
        document.addEventListener('backend-ai-connected', async () => {
          this.pipelineJobs = await globalThis.backendaiclient.pipelineJob.list();
        }, true);
      } else { // already connected
        this.pipelineJobs = await globalThis.backendaiclient.pipelineJob.list();
      }
    } catch (err) {
      if (err && err.message) {
        this.notification.text = err.title;
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
    }
  }

  /**
   * Import pipeline node graph to dataflow pane
   */
  async _loadCurrentFlowData() {
    const currentFlowData = (typeof this.pipelineJobInfo.dataflow === 'string' ) ? JSON.parse(this.pipelineJobInfo.dataflow) : this.pipelineJobInfo.dataflow;
    const flowDataReqEvent = new CustomEvent('import-flow', {'detail': currentFlowData});
    document.dispatchEvent(flowDataReqEvent);
    if (this.pipelineJobInfo.id !== '' && this.pipelineJobInfo.id !== undefined) {
      await this._refreshPipelineJob();
      this.requestUpdate();
    }
  }

  /**
   * Display inside the tab content and hide contents in the others tab
   * 
   * @param {HTMLElement} tab - mwc-tab
   */
  async _showTabContent(tab) {
    const els = this.shadowRoot.querySelectorAll('.tab-content');
    for (const obj of els) {
      obj.style.display = 'none';
    }
    this._activeTab = tab.title;
    this.shadowRoot.querySelector('#' + tab.title).style.display = 'block';
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
   * Empty items in task instance grid
   */
  _initPipelineTaskListItem() {
    this.taskInstanceGrid.items = [];
  }

  /**
   * Change pipeline job according to event target
   * 
   * @param {Event} e - event source
   */
  async _changePipelineJob(e) {
    const selectedPipelineJobName = e.target.value;
    this._initPipelineTaskListItem();
    this.pipelineJobInfo = this.pipelineJobs.filter((job) => job.name === selectedPipelineJobName)[0];
    await this._loadCurrentFlowData();
  }

  /**
   * Refresh view pane to current flow data
   */
  async _refreshViewPane() {
    await this._loadCurrentFlowData();
    this._toggleButtonStatus();
  }

  /**
   * Show yaml data dialog of current pipeline job
   */
  _launchWorkFlowDialog(pipelineYaml: PipelineYAML) {
    const codemirror = this.shadowRoot.querySelector('lablup-codemirror#workflow-file');
    const yamlString = YAML.dump(pipelineYaml, {});
    codemirror.setValue(yamlString);
    this._launchDialogById('#workflow-file-dialog');
  }

  _toggleButtonStatus() {
    /* TODO: Enable/Disable button when pipeline job selected/unselected */
  }

  /**
   * Control a button's running state and call method.
   *
   * @param {Event} e - event from dropdown component.
   */
  _toggleRunning(e) {
    const button = e.target;
    if (button.label === 'Start') {
      button.label = 'Stop';
      button.icon = 'pause';
      // call _stopPipeline()
    } else {
      button.label = 'Start';
      button.icon = 'play_arrow';
      // call _startPipeline()
    }
  }

  /**
   * Control a dropdown menu's open state.
   *
   * @param {Event} e - event from dropdown component.
   */
  _toggleDropDown(e) {
    const menu = this.shadowRoot.querySelector('#dropdown-menu');
    const button = e.target;
    menu.anchor = button;
    if (!menu.open) {
      menu.show();
    }
  }

  /**
   * Render rowData according to type of the column (plain, filtered, sorted)
   */
  _setVaadinGridRenderers() {
    // plain columns
    this.taskInstanceGridColumnList[0].renderer = (root, column, rowData) => { // #
      root.textContent = rowData.index + 1;
    };
    this.taskInstanceGridColumnList[1].renderer = (root, column, rowData) => { // id
      render(
        html`
          <span class="monosapce" style="font-size:0.8rem">
            ${rowData.item.id}
          </span>
        `
        , root);
    };
    this.taskInstanceGridColumnList[2].renderer = (root, column, rowData) => { // status
      const color = PipelineUtils._getStatusColor(rowData.item.status);
      render(
        html`
          <lablup-shields description="${rowData.item.status}" color="${color}"></lablup-shields>
        `, root
      );
    };
    this.taskInstanceGridColumnList[3].renderer = (root, column, rowData) => { // resources
      render(
        html`
        <div class="layout vertical flex">
          <div class="layout horizontal center configuration">
            <mwc-icon class="fg green indicator">developer_board</mwc-icon>
            <span>${rowData.item.config.resources.cpu}</span>
            <span class="indicator">core</span>
          </div>
          <div class="layout horizontal center configuration">
            <mwc-icon class="fg green indicator">memory</mwc-icon>
            <span>${parseFloat(globalThis.backendaiclient.utils.changeBinaryUnit(rowData.item.config.resources.mem, 'g'))}</span>
            <span class="indicator">GB</span>
          </div>
          ${rowData.item.config.resources['cuda.shares'] ? html`
            <div class="layout horizontal center configuration">
              <mwc-icon class="fg green indicator">view_module</mwc-icon>
              <span>${rowData.item.config.resources['cuda.shares']}</span>
              <span class="indicator">GPU</span>
            </div>
          ` : html``}
        </div>
      `, root);
    };
    this.taskInstanceGridColumnList[4].renderer = (root, column, rowData) => { // command
      render(
        html`
          <div class="horizontal center start-justified layout">
            <pre class="monospace" style="font-size:0.8rem;">
              ${rowData.item.config.command}
            </pre>
          </div>
        `
        , root);
    };

    // filter columns
    this.taskInstanceGridFilterColumnList[0].renderer = (root, column, rowData) => { // name
      render(
        html`
          <span>${rowData.item.config.name}</span>
        `, root);
    };

    // sortable columns
    this.taskInstanceGridSortColumnList[0].renderer = (root, column, rowData) => { // type
      render(
        html`
          <span>${rowData.item.config.type}</span>
        `, root);
    };
  }

  renderWorkflowFileDialogTemplate() {
    // language=HTML
    return html`
    <backend-ai-dialog class="yaml" id="workflow-file-dialog" fixed backgroup blockscrolling>
      <span slot="title">Workflow file</span>
      <div slot="content">
        <lablup-codemirror id="workflow-file" mode="yaml" readonly useLineWrapping></lablup-codemirror>
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
            <mwc-tab-bar id="pipeline-job-pane" @MDCTabBar:activated="${() => this._refreshViewPane()}">
              <mwc-tab title="pipeline-job-list" label="Job List" @click="${(e) => this._showTabContent(e.target)}"></mwc-tab>
              <mwc-tab title="pipeline-job-view" label="Job View" @click="${(e) => this._showTabContent(e.target)}"></mwc-tab>
            </mwc-tab-bar>
          </h3>
          <div id="pipeline-job-list" class="tab-content">
            <pipeline-job-list ?active="${this._activeTab === 'pipeline-job-list'}"></pipeline-job-list>
          </div>
          <div id="pipeline-job-view" class="tab-content item card" style="display:none;">
            <h4 class="horizontal flex center center-justified layout">
              <mwc-select id="pipeline-list" label="Pipeline Job" @change=${this._loadTaskNodesByCurrentPipelineJob} ?disabled="${this.pipelineJobs.length <= 0}">
                ${this.pipelineJobs?.map((job) => {
                  return html`
                    <mwc-list-item value="${job.name}" ?selected="${job.name === this.pipelineJobInfo.name}"
                        @click="${(e) => this._changePipelineJob(e)}">${job.name}</mwc-list-item>`;
                      }
                )}
              </mwc-select>
              <mwc-list-item twoline>
                <span><strong>Duration</strong></span>
                <span class="monospace" slot="secondary">
                  ${this.pipelineJobInfo.created_at !== '' ?
                    PipelineUtils._humanReadableTimeDuration(this.pipelineJobInfo.created_at, this.pipelineJobInfo.terminated_at) :
                    `-`}
                </span>
              </mwc-list-item>
              <span class="flex"></span>
              ${['WAITING', 'RUNNING', 'STOPPED'].includes(this.pipelineJobInfo.status) ? html`
                <mwc-button label="Start" icon="play_arrow" @click="${(e) => this._toggleRunning(e)}"></mwc-button>
                ` : html``}
              <div id="dropdown-menu-container">
                <mwc-icon-button icon="more_horiz" @click="${(e) => this._toggleDropDown(e)}"></mwc-icon-button>
                <mwc-menu id="dropdown-menu" corner="BOTTOM_LEFT">
                  <mwc-list-item class="horizontal layout center"
                    @click="${() => this._launchWorkFlowDialog(this.pipelineJobInfo.yaml)}">
                    <mwc-icon>assignment</mwc-icon>
                    <span>View workflow file</span>
                  </mwc-list-item>
                </mwc-menu>
              </div>
            </h4>
            <pipeline-flow id="pipeline-job-flow"></pipeline-flow>
            <vaadin-grid id="pipeline-task-instance-list" theme="row-stripes column-borders compact"
              aria-label="Pipeline Task List" .items="${this.taskInstanceList}">
              <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center" frozen></vaadin-grid-column>
              <vaadin-grid-filter-column width="120px" header="Name" resizable frozen></vaadin-grid-filter-column>
              <vaadin-grid-column path="id" header="ID" resizable></vaadin-grid-column>
              <vaadin-grid-column path="status" header="Status" auto-width resizable></vaadin-grid-column>
              <vaadin-grid-sort-column header="Type" resizable></vaadin-grid-sort-column>
              <vaadin-grid-column path="resources" header="Resources" resizable></vaadin-grid-column>
              <vaadin-grid-column path="command" header="Command" resizable></vaadin-grid-column>
            </vaadin-grid>
          </div>
        </div>
      </lablup-activity-panel>
      ${this.renderWorkflowFileDialogTemplate()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-job-view': PipelineJobView;
  }
}
