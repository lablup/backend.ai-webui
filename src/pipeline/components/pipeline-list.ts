/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, LitElement, render} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import '../../components/lablup-activity-panel';
import {BackendAiStyles} from '../../components/backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../../plastics/layout/iron-flex-layout-classes';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';

import '@material/mwc-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select';
import '../../components/backend-ai-dialog';

/**
 Pipeline List

 `pipeline-list` is fetches and lists of created/imported pipelines

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
  @property({type: Array}) scalingGroups = ['default']; // contains project groups that user can access
  @property({type: Array}) pipelineType = ['from Template', 'YAML', 'Custom'];
  @property({type: Object}) pipelineInfo;
  @property({type: Array}) pipelines = Array();
  @property({type: String}) username;
  @property({type: Object}) _boundNameRenderer = this.nameRenderer.bind(this);
  @property({type: Object}) _boundIndexRenderer = this.indexRenderer.bind(this);
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);
  @property({type: Object}) _boundCreateAtRenderer = this.createdAtRenderer.bind(this);
  @property({type: Object}) _boundModifiedAtRenderer = this.modifiedAtRenderer.bind(this);

  constructor() {
    super();
    this.pipelineInfo = {
      name: "",
      scaling_group: "",
      owner: "",
      type: "",
      created_at: "",
      modified_at: "",
      data: {},
    }

    const now = new Date().toLocaleString();

    this.pipelines = [
      {
        name: "FMNIST",
        scaling_group: "default",
        owner: "admin",
        type: "Custom",
        created_at: now,
        modified_at: now,
        data: {}
      },
      {
        name: "LoanPrediction",
        scaling_group: "default",
        owner: "admin",
        type: "Custom",
        created_at: now,
        modified_at: now,
        data: {}
      },
      {
        name: "Flow-01",
        scaling_group: "default",
        owner: "admin",
        type: "Custom",
        created_at: now,
        modified_at: now,
        data: {}
      }
    ]; // hard-coded dummy data
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
        mwc-button {
          margin: 10px;
        }

        mwc-button.full-width {
          width: 100%;
        }

        mwc-select.full-width {
          width: 100%;
          font-family: var(--general-font-family);
          --mdc-theme-primary: var(--general-sidebar-color);
          --mdc-menu-item-height: auto;
          /* Need to be set when fixedMenuPosition attribute is enabled */
          --mdc-menu-max-width: 320px;
          --mdc-menu-min-width: 320px;
        }

        backend-ai-dialog {
          --component-min-width: 350px;
          --component-max-width: 390px;
        }

        a.pipeline-link:hover {
          color: var(--general-textfield-selected-color);
        }
      `
    ];
  }

  firstUpdated() {
    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.username = this._getUsername();
      }, true);
    } else { // already connected
      this.username = this._getUsername();
    }
  }

  /**
   * Create a pipeline
   */
  _createPipeline() {
    /**
     * TODO: Add pipeline according to selected type
     * 
     */
    const name = this.shadowRoot.querySelector('#pipeline-name').value;
    const scalingGroup = this.shadowRoot.querySelector('#scaling-group').value;
    const type = this.shadowRoot.querySelector('#pipeline-type').value;
    const createdAt = this._humanReadableTime();
    const modifiedAt = createdAt;

    this.pipelineInfo = {
      name: name,
      scaling_group: scalingGroup,
      owner: this.username,
      type: type,
      created_at: createdAt,
      modified_at: modifiedAt,
      data: {},
    };

    // move to pipeline view page with current pipeline info
    this.moveToViewTab();
    this.pipelineInfo = {};
    this._hideDialogById('#create-pipeline');
  }

  _getUsername() {
    return globalThis.backendaiclient.user.get(globalThis.backendaiclient.email, ['username']).then((response) => {
      const userInfo = response;
      return userInfo.user.username;
    });
  }

  /**
   * Change d of any type to human readable date time.
   *
   * @param {any} d   - string or DateTime object to convert
   * @return {Date}   - Formatted date / time to be human-readable text.
   */
  _humanReadableTime(d = '') {
    return new Date(d).toUTCString();
  }

  _launchDialogById(id) {
    this.shadowRoot.querySelector(id).show();
  }

  _hideDialogById(id) {
    this.shadowRoot.querySelector(id).hide();
  }

  /**
   * Render index of rowData
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
  indexRenderer(root, column, rowData) {
    const idx = rowData.index + 1;
    render(
      html`
        <div>${idx}</div>
      `,
      root
    );
  }

  /**
   * Render name of rowData
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   * */
   nameRenderer(root, column, rowData) {
    render(
      html`
        <div>
          <a class="pipeline-link" @click="${()=> this.loadPipeline(rowData.item)}">${rowData.item.name}</a>
        </div>
      `,
      root
    );
  }

  /**
   * Control rendering
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  controlRenderer(root, column?, rowData?) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center".pipeline-id="${rowData.item.name}">
          <wl-button fab flat inverted
            class="fg green"
            icon="assignment">
            <wl-icon>assignment</wl-icon>
          </wl-button>
          <wl-button fab flat inverted
            class="fg blue"
            icon="settings">
            <wl-icon>settings</wl-icon>
          </wl-button>
          <wl-button fab flat inverted class="fg red controls-running">
            <wl-icon>delete_forever</wl-icon>
          </wl-button>
        </div>
      `, root
    );
  }

  /**
   * Control rendering
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  createdAtRenderer(root, column?, rowData?) {
    render(
      html`
        <div class="layout vertical">
          <span style="font-size:0.75rem;">${rowData.item.created_at}</span>
        </div>
      `, root
    );
  }

  /**
   * Control rendering
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  modifiedAtRenderer(root, column?, rowData?) {
    render(
      html`
      <div class="layout vertical">
        <span style="font-size:0.75rem;">${rowData.item.modified_at}</span>
      </div>
      `, root
    );
  }

  moveToViewTab() {
    /**
     * TODO: Go to view tab loaded with current pipeline info
     * 
     */
    const moveToViewEvent = 
      new CustomEvent('pipeline-view-active-tab-change', 
        {
          'detail': {
          'activeTab': {
            title :'pipeline-view'
          },
          'pipeline': this.pipelineInfo
        }
      });
    document.dispatchEvent(moveToViewEvent);
  }

  loadPipeline(pipelineInfo: object) {
    this.pipelineInfo = pipelineInfo;
    this.moveToViewTab();
  }

  render() {
    // language=HTML
    return html`
    <div class="horizontal layout flex center end-justified">
      <mwc-button unelevated icon="add" label="New Pipeline" @click="${() => this._launchDialogById('#create-pipeline')}"></mwc-button>
    </div>
    <vaadin-grid id="pipeline-list" theme="row-stripes column-borders compact" aria-label="Pipeline List" .items="${this.pipelines}">
      <vaadin-grid-column auto-width flex-grow="0" header="#" text-align="center" .renderer="${this._boundIndexRenderer}"></vaadin-grid-column>
      <vaadin-grid-filter-column id="name" auto-width header="Name" resizable .renderer="${this._boundNameRenderer}"></vaadin-grid-filter-column>
      <vaadin-grid-column id="owner" header="Owner" path="owner"></vaadin-grid-column>
      <vaadin-grid-column id="control" header="Controls" .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
      <vaadin-grid-column id="created-at" header="Created At" .renderer="${this._boundCreateAtRenderer}"></vaadin-grid-column>
      <vaadin-grid-column id="modified-at" header="Last Modified" .renderer="${this._boundModifiedAtRenderer}"></vaadin-grid-column>
    </vaadin-grid>
    <backend-ai-dialog id="create-pipeline" fixed backdrop blockscrolling persistent>
      <span slot="title">New Pipeline</span>
      <div slot="content" class="vertical layout flex">
        <mwc-textfield id="pipeline-name" label="Pipeline Name"></mwc-textfield>
        <mwc-select class="full-width" id="scaling-group" label="Scaling Group" fixedMenuPosition>
          ${this.scalingGroups.map((item, idx) => {
            return html`<mwc-list-item id="${item}" value="${item}" ?selected="${idx === 0}">${item}</mwc-list-item>`
          })}
        </mwc-select>
        <mwc-select class="full-width" id="pipeline-type" label="Pipeline Type" fixedMenuPosition>
          ${this.pipelineType.map((item) => {
            return html`<mwc-list-item id="${item}" value="${item}" ?selected="${item === 'Custom'}">${item}</mwc-list-item>`
          })}
        </mwc-select>
      </div>
      <div slot="footer" class="horizontal layout end-justified flex">
        <mwc-button class="full-width" unelevated label="Create Pipeline" @click="${() => this._createPipeline()}"></mwc-button>
      </div>
    </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-list': PipelineList;
  }
}