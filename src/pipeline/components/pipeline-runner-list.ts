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
import '../lib/pipeline-dialog';
import '../../plastics/lablup-shields/lablup-shields';
import '../../components/lablup-codemirror';

/**
 Pipeline Runner List

 `pipeline-runner-list` is fetches and lists of instantiated pipelines

 Example:

 <pipeline-runner-list>
 ...
 </pipeline-runner-list>

 @group Backend.AI pipeline
 @element pipeline-runner-list
*/

@customElement('pipeline-runner-list')
export default class PipelineRunnerList extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: Array}) pipelines = [];
  @property({type: Object}) pipeline = Object();

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
        #pipeline-table {
          height: calc(100vh - 265px);
        }

        #info-status {
          position: relative;
          top: -10px;
        }

        #workflow-item {
          padding-bottom:6px;
        }

        #view-workflow-button {
          margin:10px auto;
        }

        #workflow-dialog-title {
          min-width: 530px;
        }

        mwc-icon {
          padding-right: 10px;
          position: relative;
          top: 2px;
          --mdc-icon-size: 16px;
        }

        mwc-list.right-border mwc-list-item {
          border-right: 1px solid #ccc;
        }
      `];
  }

  firstUpdated() {
    this._setVaadinGridRenderers();
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

  _setVaadinGridRenderers() {
    const columns = this.shadowRoot.querySelectorAll('#pipeline-table vaadin-grid-column');
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
    this.pipeline = rowData.item;
    this._showDialog('pipeline-detail-dialog');
  }}"></mwc-icon-button>
          <mwc-icon-button class="fg blue settings" icon="settings"></mwc-icon-button>
          ${!isCompleted ? html`
            <mwc-icon-button class="fg green start"
              icon="${icon}"
              @click="${(e) => {
    this.pipeline = rowData.item;
    this._toggleRunningIcon(e);
  }}"></mwc-icon-button>` : html``}
        </div>
      `, root);
    };
  }

  render() {
    // language=HTML
    return html`
      <vaadin-grid id="pipeline-table" theme="row-stripes column-borders compact"
        aria-label="Pipeline Runner List" .items="${this.pipelines}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center" frozen></vaadin-grid-column>
        <vaadin-grid-filter-column id="pipeline-name" width="120px" path="name" header="Name" resizable frozen></vaadin-grid-filter-column>
        <vaadin-grid-sort-column path="version" header="Version" resizable></vaadin-grid-sort-column>
        <vaadin-grid-filter-column path="vfolder" header="Mounted folder" resizable></vaadin-grid-filter-column>
        <vaadin-grid-column header="Status" resizable></vaadin-grid-column>
        <vaadin-grid-column width="150px" header="Duration" resizable></vaadin-grid-column>
        <vaadin-grid-column id="pipeline-control" width="160px" flex-grow="0" header="Control" resizable></vaadin-grid-column>
      </vaadin-grid>
      <pipeline-dialog id="pipeline-detail-dialog" fixed backdrop>
        <span slot="title">${this.pipeline.name || 'Pipeline Details'}</span>
        <div slot="content" role="listbox" class="horizontal center layout">
          <mwc-list class="vertical center layout right-border">
            <mwc-list-item twoline>
              <span><strong>ID</strong></span>
              <span class="monospace" slot="secondary">${this.pipeline.id}</span>
            </mwc-list-item>
            <mwc-list-item twoline>
              <span><strong>Created At</strong></span>
              <span class="monospace" slot="secondary">
                ${PipelineUtils._toLocaleString(this.pipeline.created_at)}
              </span>
            </mwc-list-item>
            <mwc-list-item twoline>
              <span><strong>Updated At</strong></span>
              <span class="monospace" slot="secondary">
                ${PipelineUtils._toLocaleString(this.pipeline.last_updated)}
              </span>
            </mwc-list-item>
            <mwc-list-item twoline>
              <span><strong>Duration</strong></span>
              <span class="monospace" slot="secondary">
                ${PipelineUtils._humanReadableTimeDuration(this.pipeline.created_at, this.pipeline.last_updated)}
              </span>
            </mwc-list-item>
          </mwc-list>
          <mwc-list class="vertical center layout">
            <mwc-list-item twoline>
              <span><strong>Status</strong></span>
              <lablup-shields id="info-status" slot="secondary" description="${this.pipeline.status}"
                color="${PipelineUtils._getStatusColor(this.pipeline.status)}"></lablup-shields>
              <!-- TODO: circular progress -->
            </mwc-list-item>
            ${this.pipeline.ownership ? html`
              <mwc-list-item twoline>
                <span><strong>Ownership</strong></span>
                <span class="monospace" slot="secondary">${this.pipeline.ownership}</span>
              </mwc-list-item>
            ` : html``}
            <mwc-list-item twoline>
              <span><strong>Mounted Folder</strong></span>
              <span class="monospace" slot="secondary">${this.pipeline.vfolder}</span>
            </mwc-list-item>
            <mwc-list-item id="workflow-item" twoline>
              <span><strong>View Workflow File</strong></span>
              <mwc-button id="view-workflow-button" unelevated slot="secondary" 
                icon="assignment" label="View workflow file"
                @click="${() => {
    this._showDialog('workflow-dialog');
    this.shadowRoot.querySelector('#workflow-editor').refresh();
  }}">
              </mwc-button>
            </mwc-list-item>
          </mwc-list>
        </div>
      </pipeline-dialog>
      <pipeline-dialog id="workflow-dialog">
        <span id="workflow-dialog-title" slot="title">Workflow file</span>
        <div slot="content">
          <lablup-codemirror id="workflow-editor" mode="yaml"></lablup-codemirror>
        </div>
      </pipeline-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-runner-list': PipelineRunnerList;
  }
}
