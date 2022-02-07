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
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-icon-button/mwc-icon-button';

import PipelineUtils from './pipeline-utils';
import '../../plastics/lablup-shields/lablup-shields';

/**
 Pipeline List

 `pipeline-list` is a grid table used for displaying pipeline related data

 Example:

 <pipeline-list>
 ...
 </pipeline-list>

@group Backend.AI pipeline
@element pipeline-list
*/

@customElement('pipeline-list')
export default class PipelineList extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: String}) theme = 'row-stripes column-borders compact';
  @property({type: String}) ariaLabel = '';
  @property({type: Array}) items = [];
  /**
   * Controls
   * e.g) <pipeline-list .editFunction="${function}"></pipeline-list>
   */
  @property({type: Object}) editFunction; // click the setting icon
  @property({type: Object}) pauseFunction; // pipeline pause function
  @property({type: Object}) startFunction; // pipeline start function

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

        mwc-icon {
          padding-right: 10px;
          position: relative;
          top: 2px;
          --mdc-icon-size: 16px;
        }
      `];
  }

  firstUpdated() {
    this._setVaadinGridRenderers();
  }

  _setVaadinGridRenderers() {
    const columns = this.shadowRoot.querySelectorAll('#pipeline-table vaadin-grid-column');
    columns[0].renderer = (root, column, rowData) => { // #
      root.textContent = rowData.index + 1;
    };
    columns[1].renderer = (root, column, rowData) => { // status
      let appColor = 'lightgrey';
      switch (PipelineUtils._categorizeStatus(rowData.item.status)) {
      case 'waiting':
        appColor = 'yellow';
        break;
      case 'transitional':
        appColor = 'orange';
        break;
      case 'ongoing':
        appColor = 'green';
        break;
      case 'terminal':
        appColor = 'lightgrey';
        break;
      case 'errorneous':
        appColor = 'red';
        break;
      }
      // TODO: add multi-color circular progressbar
      root.innerHTML = `
        <lablup-shields app="${rowData.item.status.toUpperCase()}" appColor="${appColor}"></lablup-shields>
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
      const isCompleted = ['terminal', 'errorneous'].includes(PipelineUtils._categorizeStatus(rowData.item.status));
      const isRunning = ['ongoing'].includes(PipelineUtils._categorizeStatus(rowData.item.status));
      render(html`
        <div id="controls" class="layout horizontal flex center" pipeline-id="${rowData.item.id}">
          <mwc-icon-button class="fg green info" icon="assignment"></mwc-icon-button>
          <mwc-icon-button class="fg blue settings" icon="settings" @click="${this.editFunction}"></mwc-icon-button>
          ${isCompleted ? html`` :
    isRunning ?
      html`<mwc-icon-button id="pause-pipeline-btn" class="fg green start" icon="pause" @click="${this.pauseFunction}"></mwc-icon-button>` :
      html`<mwc-icon-button id="start-pipeline-btn" class="fg green stop" icon="play_arrow" @click="${this.startFunction}"></mwc-icon-button>`
}
        </div>
      `, root);
    };
  }

  render() {
    // language=HTML
    return html`
      <vaadin-grid id="pipeline-table"
        theme="${this.theme}"
        aria-label="${this.ariaLabel}"
        .items="${this.items}">
        <vaadin-grid-column width="40px" flex-grow="0" header="#" text-align="center" frozen></vaadin-grid-column>
        <vaadin-grid-filter-column id="pipeline-name" width="120px" path="name" header="Name" resizable frozen></vaadin-grid-filter-column>
        <vaadin-grid-sort-column path="version" header="Version" resizable></vaadin-grid-sort-column>
        <vaadin-grid-filter-column path="vfolder" header="Mounted folder" resizable></vaadin-grid-filter-column>
        <vaadin-grid-column header="Status" resizable></vaadin-grid-column>
        <vaadin-grid-column width="150px" header="Duration" resizable></vaadin-grid-column>
        <vaadin-grid-column id="pipeline-control" width="160px" flex-grow="0" header="Control" resizable></vaadin-grid-column>
      </vaadin-grid>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-list': PipelineList;
  }
}
