/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, LitElement, render} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {BackendAiStyles} from '../../components/backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../../plastics/layout/iron-flex-layout-classes';

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
export default class PipelineJobList extends LitElement {
  public shadowRoot: any; // ShadowRoot
  // @property({type: Array}) pipelineJobs = [];
  @property({type: Array}) pipelineJobs = [ // hard coded for demo
    {
      id: 1,
      name: 'test1',
      version: 1,
      vfolder: '/home',
      status: 'SUCCESS',
      created_at: 1644288651967,
      ownership: 'admin',
      last_updated: new Date(),
      tasks: [
        {
          name: 'task1',
          description: 'task1',
          type: 'github',
          module_uri: 'github.com/lablup/backend.ai-modules@v2',
          command: ['ls', '-al'],
          environment: {
            'scaling-group': 'default',
            'image': 'cr.backend.ai/testing/ngc-pytorch:20.11-py3',
            'envs': '{"ENV1":"hello world"}',
          },
          resources: {
            'cpu': 2,
            'mem': 4,
            'cuda.shares': 0.2,
          },
          mounts: ['folder1', 'folder2'],
          depends: ['task3', 'task5'],
        },
      ],
    },
    {
      id: 2,
      name: 'test2',
      version: 1,
      vfolder: '/home',
      status: 'FAILED',
      created_at: 1644288491967,
      last_updated: new Date(),
    },
    {
      id: 3,
      name: 'test3',
      version: 1,
      vfolder: '/home',
      status: 'STOPPED',
      created_at: 1644188391967,
      ownership: 'admin',
      last_updated: new Date(),
    },
    {
      id: 4,
      name: 'test4',
      version: 1,
      vfolder: '/home',
      status: 'WAITING',
      created_at: 1644088291967,
      ownership: 'admin',
      last_updated: new Date(),
    },
    {
      id: 5,
      name: 'test5',
      version: 1,
      vfolder: '/home',
      status: 'RUNNING',
      created_at: 1643988191967,
      ownership: 'admin',
      last_updated: new Date(),
    },
  ];

  @property({type: Object}) pipelineJob = Object();
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
      document.addEventListener('backend-ai-connected', () => {
        this._createTaskProgressChart();
      }, true);
    } else { // already connected
      this._createTaskProgressChart();
    }
  }

  /**
   * Create Task Progress Doughnut Chart
   */
  async _createTaskProgressChart() {
    // number of tasks' status is hard coded for demo
    const numRunningTasks = 2;
    const numSuccessTasks = 3;
    const numFailedTasks = 1;
    this.tasks = {
      labels: [
        `${numRunningTasks} RUNNING`,
        `${numSuccessTasks} SUCCESS`,
        `${numFailedTasks} FAILED`,
      ],
      datasets: [{
        data: [
          numRunningTasks,
          numSuccessTasks,
          numFailedTasks,
        ],
        backgroundColor: [
          '#007ec6',
          '#97ca00',
          '#e05d44'
        ]
      }]
    };
  }

  _showDialog(id) {
    this.shadowRoot.querySelector('#' + id).show();
  }

  _toggleRunningIcon(e) {
    const button = e.target;
    if (button.icon === 'pause') {
      button.icon = 'play_arrow';
    } else {
      button.icon = 'pause';
    }
  }

  _loadPipelineView(pipelineJob) {
    this.pipelineJob = pipelineJob;
    PipelineUtils._setCustomEvent('pipeline-job-view-active-tab-change',
      {
        detail: {
          activeTab: {
            title: 'pipeline-job-view',
          },
          pipelineJob: this.pipelineJob,
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
    columns[2].renderer = (root, column, rowData) => { // duration
      const createdAt = PipelineUtils._humanReadablePassedTime(rowData.item.created_at);
      const duration = PipelineUtils._humanReadableTimeDuration(rowData.item.created_at, rowData.item.last_updated);
      render(html`
        <mwc-list-item class="vertical layout start center-justified" style="font-size:15px;">
          <span class="horizontal layout"><mwc-icon>calendar_today</mwc-icon>${createdAt}</span>
          <span class="horizontal layout"><mwc-icon>alarm</mwc-icon>${duration}</span>
        </mwc-list-item>
      `, root);
    };
    columns[3].renderer = (root, column, rowData) => { // control
      const isCompleted = ['SUCCESS', 'FAILED'].includes(rowData.item.status);
      const isRunning = ['WAITING', 'RUNNING'].includes(rowData.item.status);
      const icon = isRunning ? 'pause' : 'play_arrow';
      render(html`
        <div id="controls" class="layout horizontal flex center" pipeline-id="${rowData.item.id}">
          <mwc-icon-button class="fg green info"
            icon="assignment"
            @click="${() => {
    this.pipelineJob = rowData.item;
    this._createTaskProgressChart();
    this._showDialog('pipeline-job-detail-dialog');
  }}"></mwc-icon-button>
          <mwc-icon-button class="fg blue settings" icon="settings"></mwc-icon-button>
          ${!isCompleted ? html`
            <mwc-icon-button class="fg green start"
              icon="${icon}"
              @click="${(e) => {
    this.pipelineJob = rowData.item;
    this._toggleRunningIcon(e);
  }}"></mwc-icon-button>` : html``}
        </div>
      `, root);
    };

    columns = this.shadowRoot.querySelectorAll('#pipeline-job-list vaadin-grid-filter-column');
    columns[0].renderer = (root, column, rowData) => { // name
      render(html`
        <a @click="${() => this._loadPipelineView(rowData.item)}">${rowData.item.name}</a>
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
        <vaadin-grid-sort-column path="version" header="Version" resizable></vaadin-grid-sort-column>
        <vaadin-grid-filter-column path="vfolder" header="Mounted folder" resizable></vaadin-grid-filter-column>
        <vaadin-grid-column header="Status" resizable></vaadin-grid-column>
        <vaadin-grid-column width="150px" header="Duration" resizable></vaadin-grid-column>
        <vaadin-grid-column id="pipeline-control" width="160px" flex-grow="0" header="Control" resizable></vaadin-grid-column>
      </vaadin-grid>
      <backend-ai-dialog id="pipeline-job-detail-dialog" fixed backdrop>
        <span slot="title">${this.pipelineJob.name || 'Pipeline Details'}</span>
        <div slot="content" role="listbox" class="horizontal center layout">
          <mwc-list class="vertical center layout">
            <mwc-list-item twoline>
              <span><strong>ID</strong></span>
              <span class="monospace" slot="secondary">${this.pipelineJob.id}</span>
            </mwc-list-item>
            <mwc-list-item twoline>
              <span><strong>Created At</strong></span>
              <span class="monospace" slot="secondary">
                ${PipelineUtils._toLocaleString(this.pipelineJob.created_at)}
              </span>
            </mwc-list-item>
            <mwc-list-item twoline>
              <span><strong>Updated At</strong></span>
              <span class="monospace" slot="secondary">
                ${PipelineUtils._toLocaleString(this.pipelineJob.last_updated)}
              </span>
            </mwc-list-item>
            <mwc-list-item twoline>
              <span><strong>Duration</strong></span>
              <span class="monospace" slot="secondary">
                ${PipelineUtils._humanReadableTimeDuration(this.pipelineJob.created_at, this.pipelineJob.last_updated)}
              </span>
            </mwc-list-item>
          </mwc-list>
          <mwc-list class="vertical center layout left-border">
            <mwc-list-item id="status" twoline>
              <span><strong>Status</strong></span>
              <div slot="secondary" class="horizontal center layout">
                <lablup-shields id="pipeline-status" description="${this.pipelineJob.status}"
                  color="${PipelineUtils._getStatusColor(this.pipelineJob.status)}"></lablup-shields>
                <chart-js id="tasks-status" type="doughnut" .data="${this.tasks}" .options="${this.options}" width="160" height="40"></chart-js>
              </div>
            </mwc-list-item>
            ${this.pipelineJob.ownership ? html`
              <mwc-list-item twoline>
                <span><strong>Ownership</strong></span>
                <span class="monospace" slot="secondary">${this.pipelineJob.ownership}</span>
              </mwc-list-item>
            ` : html``}
            <mwc-list-item twoline>
              <span><strong>Mounted Folder</strong></span>
              <span class="monospace" slot="secondary">${this.pipelineJob.vfolder}</span>
            </mwc-list-item>
            <mwc-list-item id="workflow-item" twoline>
              <span><strong>View Workflow File</strong></span>
              <mwc-button id="view-workflow-button" unelevated slot="secondary" 
                icon="assignment" label="View workflow file"
                @click="${() => {
    this._showDialog('workflow-file-dialog');
    this.shadowRoot.querySelector('#workflow-editor').refresh();
  }}">
              </mwc-button>
            </mwc-list-item>
          </mwc-list>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="workflow-file-dialog">
        <span id="workflow-file-dialog-title" slot="title">Workflow file</span>
        <div slot="content">
          <lablup-codemirror id="workflow-editor" mode="yaml"></lablup-codemirror>
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
