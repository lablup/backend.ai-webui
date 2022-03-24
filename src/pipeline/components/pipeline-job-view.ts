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

import '@material/mwc-tab/mwc-tab';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-menu/mwc-menu';
import '@material/mwc-button/mwc-button';
import '@material/mwc-select/mwc-select';
import '@material/mwc-list/mwc-list-item';

import PipelineUtils from '../lib/pipeline-utils';
import {BackendAIPage} from '../../components/backend-ai-page';
import './pipeline-job-list';
import '../lib/pipeline-flow';
import '../../components/lablup-activity-panel';
import '../../components/backend-ai-dialog';

import {store} from '../../store';

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
  @property({type: Object}) pipelineJob = Object();
  @property({type: Array}) pipelineJobs;


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

        div.configuration {
          width: 90px !important;
          height: 20px;
        }

        div.configuration mwc-icon {
          padding-right: 5px;
        }

        mwc-icon.indicator {
          --mdc-icon-size: 16px;
        }

        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        .tab-content {
          width: 100%;
        }

        #pipeline-list {
          border: 1px solid #ccc;
          margin-right: 20px;
        }

        #pipeline-job-flow {
          --pane-height: 300px;
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
    document.addEventListener('pipeline-job-view-active-tab-change', (e: any) => {
      if (e.detail) {
        this._initPipelineTaskListItem();
        const tabGroup = [...this.shadowRoot.querySelector('#pipeline-job-pane').children];
        this.shadowRoot.querySelector('#pipeline-job-pane').activeIndex = tabGroup.map((tab) => tab.title).indexOf(e.detail.activeTab.title);
        this._showTab(e.detail.activeTab, '.tab-content');
        this.pipelineJob = e.detail.pipelineJob;
        this.pipelineJobs = e.detail.pipelineJobs;
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
      }, true);
    } else { // already connected

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

  _showDialog(id) {
    this.shadowRoot.querySelector('#' + id).show();
  }

  _initPipelineTaskListItem() {
    this.shadowRoot.querySelector('#pipeline-task-list').items = [];
  }

  _changePipelineJob(e) {
    const selectedPipelineJobName = e.target.value;
    this._initPipelineTaskListItem();
    this.pipelineJob = this.pipelineJobs.filter((job) => job.name === selectedPipelineJobName)[0];
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
    const columns = this.shadowRoot.querySelectorAll('#pipeline-task-list vaadin-grid-column');
    columns[0].renderer = (root, column, rowData) => { // #
      root.textContent = rowData.index + 1;
    };
    columns[1].renderer = (root, column, rowData) => { // resources
      render(html`
        <div class="layout vertical flex">
          <div class="layout horizontal center configuration">
            <mwc-icon class="fg green indicator">developer_board</mwc-icon>
            <span>${rowData.item.resources.cpu}</span>
            <span class="indicator">core</span>
          </div>
          <div class="layout horizontal center configuration">
            <mwc-icon class="fg green indicator">memory</mwc-icon>
            <span>${rowData.item.resources.mem}</span>
            <span class="indicator">GB</span>
          </div>
          ${rowData.item.resources['cuda.shares'] ? html`
            <div class="layout horizontal center configuration">
              <mwc-icon class="fg green indicator">view_module</mwc-icon>
              <span>${rowData.item.resources['cuda.shares']}</span>
              <span class="indicator">GPU</span>
            </div>
          ` : html``}
        </div>
      `, root);
    };
  }

  render() {
    // language=HTML
    return html`
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar id="pipeline-job-pane">
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
                <mwc-list-item value="${job.name}" 
                  ?selected="${job.name === this.pipelineJob.name}"
                  @click="${(e) => this._changePipelineJob(e)}">${job.name}</mwc-list-item>`;
  })}
              </mwc-select>
              <mwc-list-item twoline>
                <span><strong>Duration</strong></span>
                <span class="monospace" slot="secondary">${PipelineUtils._humanReadableTimeDuration(this.pipelineJob.created_at, this.pipelineJob.last_modified)}</span>
              </mwc-list-item>
              <span class="flex"></span>
              ${['WAITING', 'RUNNING', 'STOPPED'].includes(this.pipelineJob.status) ? html`
                <mwc-button label="Start" icon="play_arrow" @click="${(e) => this._toggleRunning(e)}"></mwc-button>
              ` : html``}
              <div id="dropdown-menu-container">
                <mwc-icon-button icon="more_horiz" @click="${(e) => this._toggleDropDown(e)}"></mwc-icon-button>
                <mwc-menu id="dropdown-menu" corner="BOTTOM_LEFT">
                  <mwc-list-item class="horizontal layout center"
                    @click="${() => {
    this._showDialog('workflow-dialog');
    this.shadowRoot.querySelector('#workflow-editor').refresh();
  }}">
                    <mwc-icon>assignment</mwc-icon>
                    <span>View workflow file</span>
                  </mwc-list-item>
                </mwc-menu>
              </div>
            </h4>
            <pipeline-flow id="pipeline-job-flow"></pipeline-flow>
            <vaadin-grid id="pipeline-task-list" theme="row-stripes column-borders compact"
              aria-label="Pipeline Task List" .items="${this.pipelineJob.tasks}">
              <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center" frozen></vaadin-grid-column>
              <vaadin-grid-filter-column width="120px" path="name" header="Name" resizable frozen></vaadin-grid-filter-column>
              <vaadin-grid-sort-column path="type" header="Type" resizable></vaadin-grid-sort-column>
              <vaadin-grid-column path="resources" header="Resources" resizable></vaadin-grid-column>
              <vaadin-grid-column path="command" header="Command" resizable></vaadin-grid-column>
            </vaadin-grid>
          </div>
        </div>
      </lablup-activity-panel>
      <backend-ai-dialog id="workflow-dialog">
        <span id="workflow-dialog-title" slot="title">Workflow file</span>
        <div slot="content">
          <lablup-codemirror id="workflow-editor" mode="yaml"></lablup-codemirror>
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
