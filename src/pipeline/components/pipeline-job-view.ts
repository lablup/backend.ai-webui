/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {BackendAiStyles} from '../../components/backend-ai-general-styles';
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
import {BackendAIPage} from '../../components/backend-ai-page';
import './pipeline-job-list';
import '../lib/pipeline-flow';
import '../../components/lablup-activity-panel';
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
  @property({type: Object}) pipelineJobInfo = Object();
  @property({type: Array}) pipelineJobs;
  @property({type: Array}) taskInstanceList;
  @property({type: Boolean}) refreshing = false;
  @property({type: Object}) refreshTimer = Object();
  @property({type: Object}) taskInstanceNodeMap = Object();
  // Elements
  @property({type: Object}) spinner = Object();
  @property({type: Object}) notification = Object();


  constructor() {
    super();
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

        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0px 0px;
          margin: 0px auto;
        }

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
        }
        
        mwc-icon-button {
          color: var(--general-button-background-color);
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

        #dropdown-menu-container {
          position: relative;
        }

        #dropdown-menu {
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
          --mdc-menu-item-height: auto;
          --mdc-theme-surface: #f1f1f1;
          --mdc-menu-item-height : auto;
        }

        #dropdown-menu mwc-list-item {
          font-size: 14px;
        }

        #dropdown-menu mwc-icon {
          padding-right: 10px;
          position: relative;
          top: 5px;
        }

        #workflow-dialog-title {
          min-width: 530px;
        }
      `
    ];
  }

  firstUpdated() {
    this._setVaadinGridRenderers();
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    this.refreshTimer = null;
    document.addEventListener('pipeline-job-view-active-tab-change', (e: any) => {
      if (e.detail) {
        this._initPipelineTaskListItem();
        const tabGroup = [...this.shadowRoot.querySelector('#pipeline-job-pane').children];
        this.shadowRoot.querySelector('#pipeline-job-pane').activeIndex = tabGroup.map((tab) => tab.title).indexOf(e.detail.activeTab.title);
        this._showTab(e.detail.activeTab, '.tab-content');
        this.pipelineJobInfo = this._deserializePipelineInfo(e.detail.pipelineJob);
        this.pipelineJobs = e.detail.pipelineJobs;
        this._matchTaskNodeId();
        this._loadCurrentFlowData();
        this._loadTaskInstances(this.pipelineJobInfo.id).then((res) => {
          this.taskInstanceList = res;
        });
      }
    });
    document.addEventListener('active-menu-change-event', (e: any) => {
      if (e.detail) {
        this._showTab(e.detail.tabTitle, '.tab-content');
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
      document.addEventListener('backend-ai-connected', () => {
        if (this._activeTab === 'pipeline-job-view') {
          this._loadCurrentFlowData();
        }
      }, true);
    } else { // already connected
      if (this._activeTab === 'pipeline-job-view') {
        this._loadCurrentFlowData();
      }
    }
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

  async _loadTaskInstances(pipelineJobId = '') {
    return globalThis.backendaiclient.pipelineTaskInstance.list(pipelineJobId);
  }

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
      this.pipelineJobInfo = this._deserializePipelineInfo(res);
      if (['SUCCESS', 'FAILURE'].includes(this.pipelineJobInfo.result)) {
        repeat = false;
      }
      return this._loadTaskInstances(this.pipelineJobInfo.id);
    }).then((res) => {
      this.taskInstanceList = res;
      this.taskInstanceList.forEach((task) => {
        const updateTaskStatusEvent = new CustomEvent('update-task-status', {'detail': {
          nodeId: this.taskInstanceNodeMap[task.config.name]['nodeId'],
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
      console.log(err);
      this.notification.text = err.title;
      this.notification.show(true);
    });
  }

  _matchTaskNodeId() {
    const dataflowObj = this.pipelineJobInfo.dataflow;
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
   * Import pipeline node graph to dataflow pane
   */
  async _loadCurrentFlowData() {
    const currentFlowData = this.pipelineJobInfo.dataflow ?? {};
    const flowDataReqEvent = new CustomEvent('import-flow', {'detail': currentFlowData});
    document.dispatchEvent(flowDataReqEvent);
    if (Object.keys(this.pipelineJobInfo).length > 0) {
      await this._refreshPipelineJob();
      this.requestUpdate();
    }
  }

  _showTab(tab, tabClass='') {
    const els = this.shadowRoot.querySelectorAll(tabClass);
    for (const obj of els) {
      obj.style.display = 'none';
    }
    this._activeTab = tab?.title ?? tab;
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

  _initPipelineTaskListItem() {
    this.shadowRoot.querySelector('#pipeline-task-list').items = [];
  }

  _changePipelineJob(e) {
    const selectedPipelineJobName = e.target.value;
    this._initPipelineTaskListItem();
    this.pipelineJobInfo = this.pipelineJobs.filter((job) => job.name === selectedPipelineJobName)[0];
    this._loadCurrentFlowData();
  }

  async _refreshViewPane() {
    await this._loadCurrentFlowData();
    this._toggleButtonStatus();
  }

  /**
   * Show yaml data dialog of current pipeline job
   *
   */
  _launchWorkFlowDialog() {
    const codemirror = this.shadowRoot.querySelector('lablup-codemirror#workflow-editor');
    const yamlString = YAML.dump(this.pipelineJobInfo.yaml, {});
    codemirror.setValue(yamlString);
    this._launchDialogById('#workflow-dialog');
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

  _setVaadinGridRenderers() {
    let columns = this.shadowRoot.querySelectorAll('#pipeline-task-list vaadin-grid-column');
    columns[0].renderer = (root, column, rowData) => { // #
      root.textContent = rowData.index + 1;
    };
    columns[1].renderer = (root, column, rowData) => { // id
      render(
        html`
          <span class="monosapce" style="font-size:0.8rem">
            ${rowData.item.id}
          </span>
        `
        , root);
    };
    columns[2].renderer = (root, column, rowData) => { // status
      const color = PipelineUtils._getStatusColor(rowData.item.status);
      render(
        html`
          <lablup-shields description="${rowData.item.status}" color="${color}"></lablup-shields>
        `, root
      );
    };
    columns[3].renderer = (root, column, rowData) => { // resources
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
    columns[4].renderer = (root, column, rowData) => { // command
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
    columns = this.shadowRoot.querySelectorAll('#pipeline-task-list vaadin-grid-filter-column');
    columns[0].renderer = (root, column, rowData) => { // name
      render(
        html`
          <span>${rowData.item.config.name}</span>
        `, root);
    };
    columns = this.shadowRoot.querySelectorAll('#pipeline-task-list vaadin-grid-sort-column');
    columns[0].renderer = (root, column, rowData) => { // type
      render(
        html`
          <span>${rowData.item.config.type}</span>
        `, root);
    };
  }

  render() {
    // language=HTML
    return html`
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar id="pipeline-job-pane" @MDCTabBar:activated="${() => this._refreshViewPane()}">
              <mwc-tab title="pipeline-job-list" label="Job List" @click="${(e) => this._showTab(e.target, '.tab-content')}"></mwc-tab>
              <mwc-tab title="pipeline-job-view" label="Job View" @click="${(e) => this._showTab(e.target, '.tab-content')}"></mwc-tab>
            </mwc-tab-bar>
          </h3>
          <div id="pipeline-job-list" class="tab-content">
            <pipeline-job-list ?active="${this._activeTab === 'pipeline-job-list'}"></pipeline-job-list>
          </div>
          <div id="pipeline-job-view" class="tab-content item card" style="display:none;">
            <h4 class="horizontal flex center center-justified layout">
              <mwc-select id="pipeline-list" label="Pipeline">
                ${this.pipelineJobs?.map((job) => {
                  return html`
                    <mwc-list-item value="${job.name}" ?selected="${job.name === this.pipelineJobInfo.name}"
                        @click="${(e) => this._changePipelineJob(e)}">${job.name}</mwc-list-item>`;
                      }
                )}
              </mwc-select>
              <mwc-list-item twoline>
                <span><strong>Duration</strong></span>
                <span class="monospace" slot="secondary">${PipelineUtils._humanReadableTimeDuration(this.pipelineJobInfo.created_at, this.pipelineJobInfo.terminated_at)}</span>
              </mwc-list-item>
              <span class="flex"></span>
              ${['WAITING', 'RUNNING', 'STOPPED'].includes(this.pipelineJobInfo.status) ? html`
                <mwc-button label="Start" icon="play_arrow" @click="${(e) => this._toggleRunning(e)}"></mwc-button>
                ` : html``}
              <div id="dropdown-menu-container">
                <mwc-icon-button icon="more_horiz" @click="${(e) => this._toggleDropDown(e)}"></mwc-icon-button>
                <mwc-menu id="dropdown-menu" corner="BOTTOM_LEFT">
                  <mwc-list-item class="horizontal layout center"
                    @click="${() => {this._launchWorkFlowDialog();}}">
                    <mwc-icon>assignment</mwc-icon>
                    <span>View workflow file</span>
                  </mwc-list-item>
                </mwc-menu>
              </div>
            </h4>
            <pipeline-flow id="pipeline-job-flow"></pipeline-flow>
            <vaadin-grid id="pipeline-task-list" theme="row-stripes column-borders compact"
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
      <backend-ai-dialog id="workflow-dialog">
        <span id="workflow-dialog-title" slot="title">Workflow file</span>
        <div slot="content">
          <lablup-codemirror id="workflow-editor" mode="yaml" useLineWrapping readonly></lablup-codemirror>
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-job-view': PipelineJobView;
  }
}
