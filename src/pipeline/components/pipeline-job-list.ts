/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property, query, queryAll} from 'lit/decorators.js';

import {BackendAiStyles} from '../../components/backend-ai-general-styles';
import {BackendAIPipelineStyles} from '../lib/pipeline-styles';
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
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';

import '@material/mwc-icon/mwc-icon';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-icon-button/mwc-icon-button';

import PipelineUtils from '../lib/pipeline-utils';
import {PipelineJob} from '../lib/pipeline-type';
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
  @property({type: Array<PipelineJob>}) pipelineJobs;
  @property({type: PipelineJob}) pipelineJobInfo;
  @property({type: Object}) tasksGraph;
  @property({type: Object}) options;
  @property({type: Boolean}) refreshing;
  @property({type: Object}) refreshTimer;
  @property({type: Object}) notification;

  @query('vaadin-grid#pipeline-job-list') pipelineJobGrid;
  @queryAll('vaadin-grid#pipeline-job-list vaadin-grid-column') pipelineJobGridColumnList;
  @queryAll('vaadin-grid#pipeline-job-list vaadin-grid-filter-column') pipelineJobGridFilterColumnList;

  constructor() {
    super();
    this._initResource();
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

        #pipeline-job-detail-dialog {
          --component-width: auto;
          --component-max-width: auto;
        }

        #workflow-item {
          padding-bottom: 6px;
        }

        #view-workflow-button {
          margin: 10px auto;
        }

        .mount-button,
        .status-button {
          border: none;
          background: none;
          padding: 0;
          outline-style: none;
        }

        .no-mount {
          color: var(--paper-grey-400);
        }

        a.pipeline-link:hover {
          color: var(--general-textfield-selected-color);
        }

        mwc-icon {
          padding-right: 10px;
          position: relative;
          top: 2px;
          --mdc-icon-size: 16px;
        }

        backend-ai-dialog.yaml {
          --component-width: 100%;
          --component-max-width: 100%;
        }

        mwc-list.left-border mwc-list-item {
          border-left: 1px solid #ccc;
        }

        /* Set width according to screen width (on mobile, tablet, and desktop) */
        @media screen and (max-width: 400px) {
          backend-ai-dialog.yaml {
            --component-width: 100%;
          }
        }

        @media screen and (max-width:720px) {
          #pipeline-job-detail-dialog {
            --component-width: 390px;
            --component-max-width: 390px;
          }

          #pipeline-job-detail-dialog div[slot="content"] {
            -ms-flex-wrap: wrap;
            -webkit-flex-wrap: wrap;
            flex-wrap: wrap;
          }

          mwc-list.left-border mwc-list-item {
            border-left: none;
          }
        }

        @media screen and (min-width: 1024px) {
          backend-ai-dialog.yaml {
            --component-width: 70vw;
          }
        }
      `
    ];
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
        await this._refreshPipelineJobList();
        this._createTaskProgressChart();
      }, true);
    } else { // already connected
      await this._refreshPipelineJobList();
      this._createTaskProgressChart();
    }
  }

  /**
   * Get Pipeline Job list from pipeline server
   */
  async _loadPipelineJobList() {
   await this._refreshPipelineJobList();
   this.requestUpdate();
  }

  async _refreshPipelineJobList(repeat = true) {
    await this.updateComplete;
    if (this.active !== true) {
      return;
    }
    if (this.refreshing === true) {
      return;
    }
    try {
      this.refreshing = true;

      const pipelineJobList = await globalThis.backendaiclient.pipelineJob.list();
      this.pipelineJobs = pipelineJobList.map((pipelineJob) => {
        // data transformation on yaml
        pipelineJob.yaml = YAML.load(pipelineJob.yaml);
        return pipelineJob;
      });
      const refreshTime = 5000; // refresh
      this.refreshing = false;
      if (this.active === true && repeat === true) {
        this.refreshTimer = setTimeout(async () => {
          await this._refreshPipelineJobList();
        }, refreshTime);
      } else {
      }
    } catch (err) {
      // console.log(err);
      if (err && err.message) {
        this.notification.text = err.title;
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
      // authentication failed
      if (err.statusCode === 403) {
        const event = new CustomEvent('backend-ai-logout', {'detail': ''});
        document.dispatchEvent(event);
      }
    }
  }

  /**
   * Create Task Progress Doughnut Chart
   */
  _createTaskProgressChart() {
    PipelineUtils._loadTaskInstances(this.pipelineJobInfo.id).then((res) => {
      const tasksGraph = res;
      const numActiveTasks = tasksGraph?.filter((task) =>
        ['PENDING', 'SCHEDULED', 'PREPARING', 'BUILDING', 'PULLING', 'RUNNING', 'RESTARTING', 'RESIZING', 'SUSPENDED', 'TERMINATING'].includes(task.status)).length?? 0;
      const numFinishedTasks = tasksGraph?.filter((task) => ['TERMINATED', 'ERROR', 'CANCELLED'].includes(task.status)).length?? 0;
      this.tasksGraph = {
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
      if (err && err.message) {
        this.notification.text = err.title;
        this.notification.detail = err.message;
        this.notification.show(true, err);
      }
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
   */
  _launchWorkFlowDialog() {
    const codemirror = this.shadowRoot.querySelector('lablup-codemirror#workflow-file');
    const yamlString = YAML.dump(this.pipelineJobInfo.yaml, {});
    codemirror.setValue(yamlString);
    this._launchDialogById('#workflow-file-dialog');
  }

  /**
   * Show information dialog of selected pipeline
   *
   * @param {PipelineJob} pipelineJobInfo
   */
  async _launchPipelineJobDetailDialog(pipelineJobInfo: PipelineJob) {
    this.pipelineJobInfo = pipelineJobInfo;
    await this._createTaskProgressChart();
    this._launchDialogById('#pipeline-job-detail-dialog');
  }

  /**
   * Toggle icon accornding to the status of event-target
   * 
   * @param {event} e 
   */
  _toggleRunningIcon(e) {
    const button = e.target;
    if (button.icon === 'pause') {
      button.icon = 'play_arrow';
    } else {
      button.icon = 'pause';
    }
  }

  /**
   * Set current pipelineJobInfo from argument
   * 
   * @param {PipelineJob} pipelineJob
   */
  _togglePipelineJobExecution(pipelineJob: PipelineJob) {
    this.pipelineJobInfo = pipelineJob;
  }

  /**
   * Send request to stop running pipeline job by id
   * 
   * @param {PipelineJob} pipelineJob 
   * @returns {Promise}
   */
  _stopPipelineJobExecution(pipelineJob: PipelineJob) {
    this.pipelineJobInfo = pipelineJob;
    /**
     * TODO: update the status of selected pipelineJob
     * 
     */
    return globalThis.backendaiclient.pipelineJob.stop(this.pipelineJobInfo.id).then((res) => {
      console.log(res);
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
   * Load current pipeline job information and trigger tab-change to pipeline-job-view
   * 
   * @param {PipelineJob} pipelineJob 
   */
  _loadPipelineJobView(pipelineJob: PipelineJob) {
    this.pipelineJobInfo = pipelineJob;
    const activeTabChangeEvent = new CustomEvent('pipeline-job-view-active-tab-change', {
      detail: {
        activeTab: {
          title: 'pipeline-job-view'
        },
        pipelineJob: this.pipelineJobInfo,
        pipelineJobs: this.pipelineJobs,
      }
    });
    document.dispatchEvent(activeTabChangeEvent);
  }

  /**
   * Create dropdown menu that shows mounted folder names.
   * Added menu to document.body to show at the top.
   *
   * @param {Event} e - mouseenter the mount-button
   * @param {Array} mounts - array of the mounted folders
   * */
   _createMountedFolderDropdown(e, mounts) {
    const menuButton: HTMLElement = e.target;
    const menu = document.createElement('mwc-menu') as any;
    menu.anchor = menuButton;
    menu.className = 'dropdown-menu';
    menu.style.boxShadow = '0 1px 1px rgba(0, 0, 0, 0.2)';
    menu.setAttribute('open', '');
    menu.setAttribute('fixed', '');
    menu.setAttribute('x', 10);
    menu.setAttribute('y', 15);

    if (mounts.length >= 1) {
      mounts.map((key, index) => {
        const mountedFolderItem = document.createElement('mwc-list-item');
        mountedFolderItem.style.height = '25px';
        mountedFolderItem.style.fontWeight = '400';
        mountedFolderItem.style.fontSize = '14px';
        mountedFolderItem.style.fontFamily = 'var(--general-font-family)';
        mountedFolderItem.innerHTML = (mounts.length > 1) ? key : _text('session.OnlyOneFolderAttached');

        menu.appendChild(mountedFolderItem);
      });
      document.body.appendChild(menu);
    }
  }

  /**
   * Remove the dropdown menu when mouseleave the mount-button.
   * */
  _removeMountedFolderDropdown() {
    const menu = document.getElementsByClassName('dropdown-menu') as any;
    while (menu[0]) menu[0].parentNode.removeChild(menu[0]);
  }

  /**
   * Render rowData according to type of the column (plain, filtered, sorted)
   */
  _setVaadinGridRenderers() {
    
    // plain columns
    this.pipelineJobGridColumnList[0].renderer = (root, column, rowData) => { // #
      root.textContent = rowData.index + 1;
    };
    this.pipelineJobGridColumnList[1].renderer = (root, column, rowData) => { // status
      const color = PipelineUtils._getStatusColor(rowData.item.status);
      root.innerHTML = `
        <lablup-shields description="${rowData.item.status}" color="${color}"></lablup-shields>
      `;
    };
    this.pipelineJobGridColumnList[2].renderer = (root, column, rowData) => { // result
      const color = PipelineUtils._getResultColor(rowData.item.result);
      root.innerHTML = `
        <lablup-shields description="${rowData.item.result}" color="${color}"></lablup-shields>
      `;
    };
    this.pipelineJobGridColumnList[3].renderer = (root, column, rowData) => { // duration
      const createdAt = PipelineUtils._humanReadablePassedTime(rowData.item.created_at);
      const duration = PipelineUtils._humanReadableTimeDuration(rowData.item.created_at, rowData.item.terminated_at);
      render(html`
        <mwc-list-item class="vertical layout start center-justified" style="font-size:15px;">
          <span class="horizontal layout"><mwc-icon>calendar_today</mwc-icon>${createdAt}</span>
          <span class="horizontal layout"><mwc-icon>alarm</mwc-icon>${duration}</span>
        </mwc-list-item>
      `, root);
    };

    // FIXME: hide stop/resume button since stop operation is not fully implemented in pipeline-server
    this.pipelineJobGridColumnList[4].renderer = (root, column, rowData) => { // control
      const isFinished = ['SUCCESS', 'FAILURE'].includes(rowData.item.result);
      const isActive = ['PENDING', 'RUNNING', 'WAITING'].includes(rowData.item.status);
      const isRunning = rowData.item.status === 'RUNNING';
      const icon = isActive ? 'pause' : 'play_arrow';
      render(html`
        <div id="controls" class="layout horizontal flex center" pipeline-id="${rowData.item.id}">
          <mwc-icon-button class="fg green info"
            icon="assignment"
            @click="${() => this._launchPipelineJobDetailDialog(rowData.item)}"></mwc-icon-button>
          <!--<mwc-icon-button class="fg blue settings" icon="settings"></mwc-icon-button>
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
          ` : html``}-->
        </div>
      `, root);
    };

    // filter columns
    this.pipelineJobGridFilterColumnList[0].renderer = (root, column, rowData) => { // name
      render(html`
        <a class="pipeline-link" @click="${() => this._loadPipelineJobView(rowData.item)}">${rowData.item.name}</a>
      `, root);
    };

    // TODO: show auto-created pipeline-folder (currently response doesn't have that information)
    this.pipelineJobGridFilterColumnList[1].renderer = (root, column, rowData) => { // mounts
      // monkeypatch for extracting and formatting legacy mounts info
      const mountedFolderList: Array<string> = rowData.item.yaml.mounts.map((elem: string) => {
        return (elem.startsWith('[')) ? JSON.parse(elem.replace(/'/g, '"'))[0] : elem;
      });
      render(html`
          <div class="layout horizontal center flex">
            <div class="layout horizontal center configuration">
              ${rowData.item.yaml.mounts.length > 0 ? html`
                <wl-icon class="fg green indicator">folder_open</wl-icon>
                <button class="mount-button"
                  @mouseenter="${(e) => this._createMountedFolderDropdown(e, mountedFolderList)}"
                  @mouseleave="${() => this._removeMountedFolderDropdown()}">
                  ${mountedFolderList.join(', ')}
                </button>
              ` : html`
              <wl-icon class="indicator no-mount">folder_open</wl-icon>
              <span class="no-mount">No mount</span>
              `}
            </div>
          </div>
      `, root);
    }
  }

  /**
   * Render pipeline job detail dialog
   * 
   * @returns {string} stringified html
   */
  renderPipelineJobDetailDialogTemplate() {
    // language=HTML
    return html`
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
                <chart-js id="tasks-status" type="doughnut" .data="${this.tasksGraph}" .options="${this.options}" width="160" height="40"></chart-js>
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
              <span class="monospace" slot="secondary">${(this.pipelineJobInfo.yaml?.mounts?.length > 0) ?
                this.pipelineJobInfo.yaml.mounts.map((vfolder) => html`
                  ${vfolder}
                `) : html`No mount`}</span>
            </mwc-list-item>
            <mwc-list-item id="workflow-item" twoline>
              <span><strong>View Workflow File</strong></span>
              <mwc-button id="view-workflow-button" unelevated slot="secondary" 
                icon="assignment" label="View workflow file"
                @click="${() => this._launchWorkFlowDialog()}">
              </mwc-button>
            </mwc-list-item>
          </mwc-list>
        </div>
      </backend-ai-dialog>
    `;
  }

  /**
   * Render workflow file (pipeline job YAML) dialog
   *
   * @returns {string} stringified html
   */
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
      <vaadin-grid id="pipeline-job-list" theme="row-stripes column-borders compact"
        aria-label="Pipeline Job List" .items="${this.pipelineJobs}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center" frozen></vaadin-grid-column>
        <vaadin-grid-filter-column id="pipeline-name" width="120px" path="name" header="Name" resizable frozen></vaadin-grid-filter-column>
        <vaadin-grid-filter-column auto-width flex-grow="0" path="yaml.mounts" header="Additional Mounted" resizable></vaadin-grid-filter-column>
        <vaadin-grid-column auto-width header="Status" resizable></vaadin-grid-column>
        <vaadin-grid-column auto-width  header="Result" resizable></vaadin-grid-column>
        <vaadin-grid-column width="150px" header="Duration" resizable></vaadin-grid-column>
        <vaadin-grid-column id="pipeline-control" width="160px" flex-grow="0" header="Control" resizable></vaadin-grid-column>
      </vaadin-grid>
      ${this.renderPipelineJobDetailDialogTemplate()}
      ${this.renderWorkflowFileDialogTemplate()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-job-list': PipelineJobList;
  }
}
