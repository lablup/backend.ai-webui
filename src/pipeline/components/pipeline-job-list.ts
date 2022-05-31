/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {BackendAiStyles} from '../../components/backend-ai-general-styles';
import {BackendAIPage} from '../../components/backend-ai-page';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../../plastics/layout/iron-flex-layout-classes';

import {default as YAML} from 'js-yaml';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';

import '@material/mwc-icon/mwc-icon';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-icon-button/mwc-icon-button';

import PipelineUtils from '../lib/pipeline-utils';
import '../../plastics/chart-js';
import '../../plastics/lablup-shields/lablup-shields';
import '../../components/lablup-codemirror';
import '../../components/backend-ai-dialog';

/**
 Pipeline Job List

 `pipeline-job-list` is fetches and lists of instantiated pipelines

 Example:

 <pipeline-job-list>
 ...
 </pipeline-job-list>

 @group Backend.AI pipeline
 @element pipeline-job-list
*/

@customElement('pipeline-job-list')
export default class PipelineJobList extends BackendAIPage {
  public shadowRoot: any; // ShadowRoot
  @property({type: Array}) pipelineJobs = [];
  @property({type: Object}) pipelineJobInfo = Object();
  @property({type: Object}) tasks;
  @property({type: Object}) options;

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
        #pipeline-job-list {
          border: 0;
          font-size: 14px;
          height: calc(100vh - 235px);
        }

        #status {
          height: auto;
        }

        #pipeline-status, #tasks-status {
          position: relative;
          top: -10px;
        }

        #workflow-item {
          padding-bottom: 6px;
        }

        #view-workflow-button {
          margin: 10px auto;
        }

        #workflow-file-dialog-title {
          min-width: 530px;
        }

        mwc-icon {
          padding-right: 10px;
          position: relative;
          top: 2px;
          --mdc-icon-size: 16px;
        }

        mwc-list.left-border mwc-list-item {
          border-left: 1px solid #ccc;
        }
      `];
  }

  firstUpdated() {
    this._setVaadinGridRenderers();
    this.options = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            boxWidth: 7,
            boxHeight: 7,
            padding: 1,
            font: {
              size: 10,
              family: 'monospace',
            }
          },
        },
        tooltip: {
          enabled: false,
        },
      },
    };
  }

  /**
   * Create Task Progress Chart when backend.ai client connected.
   *
   * @param {Boolean} active - The component will work if active is true.
   */
  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', async () => {
        await this._loadPipelineJobList();
        this._createTaskProgressChart();
      }, true);
    } else { // already connected
      await this._loadPipelineJobList();
      this._createTaskProgressChart();
    }
  }

  /**
   * Get Pipeline Job list from pipeline server
   *
   */
  async _loadPipelineJobList() {
    try {
      const pipelineJobList = await globalThis.backendaiclient.pipelineJob.list();
      this.pipelineJobs = pipelineJobList.map((pipelineJob) => {
        // data transformation on yaml
        pipelineJob.yaml = JSON.parse(pipelineJob.yaml);
        return pipelineJob;
      });
      this.requestUpdate();
    } catch (err) {
      console.log(err);
      this.notification.text = err.message;
      this.notification.show();
      const event = new CustomEvent('backend-ai-logout', {'detail': ''});
      document.dispatchEvent(event);
    }
  }

  /**
   * Create Task Progress Doughnut Chart
   */
  _createTaskProgressChart() {
    this._loadTaskInstances(this.pipelineJobInfo.id).then((res) => {
      const tasks = res;
      const numActiveTasks = tasks?.filter((task) =>
        ['PENDING', 'SCHEDULED', 'PREPARING', 'BUILDING', 'PULLING', 'RUNNING', 'RESTARTING', 'RESIZING', 'SUSPENDED', 'TERMINATING'].includes(task.status)).length?? 0;
      const numFinishedTasks = tasks?.filter((task) => ['TERMINATED', 'ERROR', 'CANCELLED'].includes(task.status)).length?? 0;
      this.tasks = {
        labels: [
          `${numActiveTasks} ACTIVE`,
          `${numFinishedTasks} FINISHED`,
        ],
        datasets: [{
          data: [
            numActiveTasks,
            numFinishedTasks,
          ],
          backgroundColor: [
            // '#007ec6',
            '#97ca00',
            '#9f9f9f'
            // '#e05d44'
          ]
        }]
      };
    }).catch((err) => {
      console.log(err);
      this.notification.text = err.message;
      this.notification.show();
    });
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
   * Show yaml data dialog of selected pipeline
   *
   */
  _launchWorkFlowDialog() {
    const codemirror = this.shadowRoot.querySelector('lablup-codemirror#workflow-editor');
    const yamlString = YAML.dump(this.pipelineJobInfo.yaml, {});
    codemirror.setValue(yamlString);
    this._launchDialogById('#workflow-file-dialog');
  }

  /**
   * Show information dialog of selected pipeline
   *
   * @param {json} pipelineJobInfo
   */
  async _launchPipelineJobDetailDialog(pipelineJobInfo: Object) {
    this.pipelineJobInfo = pipelineJobInfo;
    await this._createTaskProgressChart();
    this._launchDialogById('#pipeline-job-detail-dialog');
  }

  _toggleRunningIcon(e) {
    const button = e.target;
    if (button.icon === 'pause') {
      button.icon = 'play_arrow';
    } else {
      button.icon = 'pause';
    }
  }

  async _loadTaskInstances(pipelineJobId = '') {
    return globalThis.backendaiclient.pipelineTaskInstance.list(pipelineJobId);
  }

  _togglePipelineJobExecution(pipelineJob) {
    this.pipelineJobInfo = pipelineJob;
  }

  _stopPipelineJobExecution(pipelineJob) {
    this.pipelineJobInfo = pipelineJob;
    /**
     * TODO: update the status of selected pipelineJob
     * 
     */
    return globalThis.backendaiclient.pipelineJob.stop(this.pipelineJobInfo.id).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  }

  _loadPipelineJobView(pipelineJob) {
    this.pipelineJobInfo = pipelineJob;
    PipelineUtils._setCustomEvent('pipeline-job-view-active-tab-change',
      {
        detail: {
          activeTab: {
            title: 'pipeline-job-view',
          },
          pipelineJob: this.pipelineJobInfo,
          pipelineJobs: this.pipelineJobs,
        }
      }
    );
  }

  _setVaadinGridRenderers() {
    let columns = this.shadowRoot.querySelectorAll('#pipeline-job-list vaadin-grid-column');
    columns[0].renderer = (root, column, rowData) => { // #
      root.textContent = rowData.index + 1;
    };
    columns[1].renderer = (root, column, rowData) => { // status
      const color = PipelineUtils._getStatusColor(rowData.item.status);
      root.innerHTML = `
        <lablup-shields description="${rowData.item.status}" color="${color}"></lablup-shields>
      `;
    };
    columns[2].renderer = (root, column, rowData) => { // result
      const color = PipelineUtils._getResultColor(rowData.item.result);
      root.innerHTML = `
        <lablup-shields description="${rowData.item.result}" color="${color}"></lablup-shields>
      `;
    };
    columns[3].renderer = (root, column, rowData) => { // duration
      const createdAt = PipelineUtils._humanReadablePassedTime(rowData.item.created_at);
      const duration = PipelineUtils._humanReadableTimeDuration(rowData.item.created_at, rowData.item.terminated_at);
      render(html`
        <mwc-list-item class="vertical layout start center-justified" style="font-size:15px;">
          <span class="horizontal layout"><mwc-icon>calendar_today</mwc-icon>${createdAt}</span>
          <span class="horizontal layout"><mwc-icon>alarm</mwc-icon>${duration}</span>
        </mwc-list-item>
      `, root);
    };
    columns[4].renderer = (root, column, rowData) => { // control
      const isFinished = ['SUCCESS', 'FAILURE'].includes(rowData.item.result);
      const isActive = ['PENDING', 'RUNNING', 'WAITING'].includes(rowData.item.status);
      const isRunning = rowData.item.status === 'RUNNING';
      const icon = isActive ? 'pause' : 'play_arrow';
      render(html`
        <div id="controls" class="layout horizontal flex center" pipeline-id="${rowData.item.id}">
          <mwc-icon-button class="fg green info"
            icon="assignment"
            @click="${() => { this._launchPipelineJobDetailDialog(rowData.item);}}"></mwc-icon-button>
          <!--<mwc-icon-button class="fg blue settings" icon="settings"></mwc-icon-button>-->
          ${!isFinished ? html`
            <mwc-icon-button class="fg green start"
              icon="${icon}"
              @click="${(e) => {
                this._togglePipelineJobExecution(rowData.item);
                this._toggleRunningIcon(e);
              }}"></mwc-icon-button>
              ` : html``}
          ${isRunning ? html`
          <mwc-icon-button class="fg green start"
              icon="stop" @click="${() => {this._stopPipelineJobExecution(rowData.item)}}"></mwc-icon-button>
          ` : html``}
        </div>
      `, root);
    };

    columns = this.shadowRoot.querySelectorAll('#pipeline-job-list vaadin-grid-filter-column');
    columns[0].renderer = (root, column, rowData) => { // name
      render(html`
        <a @click="${() => this._loadPipelineJobView(rowData.item)}">${rowData.item.name}</a>
      `, root);
    };
  }

  render() {
    // language=HTML
    return html`
      <vaadin-grid id="pipeline-job-list" theme="row-stripes column-borders compact"
        aria-label="Pipeline Job List" .items="${this.pipelineJobs}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center" frozen></vaadin-grid-column>
        <vaadin-grid-filter-column id="pipeline-name" width="120px" path="name" header="Name" resizable frozen></vaadin-grid-filter-column>
        <!--<vaadin-grid-sort-column path="version" header="Version" resizable></vaadin-grid-sort-column>-->
        <vaadin-grid-filter-column path="vfolder" header="Mounted folder" resizable></vaadin-grid-filter-column>
        <vaadin-grid-column header="Status" resizable></vaadin-grid-column>
        <vaadin-grid-column header="Result" resizable></vaadin-grid-column>
        <vaadin-grid-column width="150px" header="Duration" resizable></vaadin-grid-column>
        <vaadin-grid-column id="pipeline-control" width="160px" flex-grow="0" header="Control" resizable></vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-dialog id="pipeline-job-detail-dialog" fixed backdrop>
        <span slot="title">${this.pipelineJobInfo.name || 'Pipeline Details'}</span>
        <div slot="content" role="listbox" class="horizontal center layout">
          <mwc-list class="vertical center layout">
            <mwc-list-item twoline>
              <span><strong>ID</strong></span>
              <span class="monospace" slot="secondary">${this.pipelineJobInfo.id}</span>
            </mwc-list-item>
            <mwc-list-item twoline>
              <span><strong>Created At</strong></span>
              <span class="monospace" slot="secondary">
                ${PipelineUtils._humanReadableDate(this.pipelineJobInfo.created_at)}
              </span>
            </mwc-list-item>
            <mwc-list-item twoline>
              <span><strong>Updated At</strong></span>
              <span class="monospace" slot="secondary">
                ${PipelineUtils._humanReadableDate(this.pipelineJobInfo.last_modified)}
              </span>
            </mwc-list-item>
            <mwc-list-item twoline>
              <span><strong>Duration</strong></span>
              <span class="monospace" slot="secondary">
                ${PipelineUtils._humanReadableTimeDuration(this.pipelineJobInfo.created_at, this.pipelineJobInfo.terminated_at)}
              </span>
            </mwc-list-item>
          </mwc-list>
          <mwc-list class="vertical center layout left-border">
            <mwc-list-item id="status" twoline>
              <span><strong>Status</strong></span>
              <div slot="secondary" class="horizontal center layout">
                <lablup-shields id="pipeline-status" description="${this.pipelineJobInfo.status}"
                  color="${PipelineUtils._getStatusColor(this.pipelineJobInfo.status)}"></lablup-shields>
                <chart-js id="tasks-status" type="doughnut" .data="${this.tasks}" .options="${this.options}" width="160" height="40"></chart-js>
              </div>
            </mwc-list-item>
            ${this.pipelineJobInfo.ownership ? html`
              <mwc-list-item twoline>
                <span><strong>Ownership</strong></span>
                <span class="monospace" slot="secondary">${this.pipelineJobInfo.ownership}</span>
              </mwc-list-item>
            ` : html``}
            <mwc-list-item twoline>
              <span><strong>Mounted Folder</strong></span>
              <span class="monospace" slot="secondary">${this.pipelineJobInfo.vfolder}</span>
            </mwc-list-item>
            <mwc-list-item id="workflow-item" twoline>
              <span><strong>View Workflow File</strong></span>
              <mwc-button id="view-workflow-button" unelevated slot="secondary" 
                icon="assignment" label="View workflow file"
                @click="${() => { this._launchWorkFlowDialog(); }}">
              </mwc-button>
            </mwc-list-item>
          </mwc-list>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="workflow-file-dialog" fixed backgroup blockscrolling>
        <span id="workflow-file-dialog-title" slot="title">Workflow file</span>
        <div slot="content">
          <lablup-codemirror id="workflow-editor" mode="yaml" readonly></lablup-codemirror>
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-job-list': PipelineJobList;
  }
}
