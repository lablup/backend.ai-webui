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
  @property({type: Array}) projectGroups = ['default']; // contains project groups that user can access
  @property({type: Array}) pipelineType = ['from Template', 'YAML', 'Custom'];
  @property({type: Object}) pipelineInfo;
  @property({type: Array}) pipelines = Array();
  @property({type: Object}) _boundIndexRenderer = this.indexRenderer.bind(this);
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);
  @property({type: Object}) _boundCreateAtRenderer = this.createdAtRenderer.bind(this);
  @property({type: Object}) _boundModifiedAtRenderer = this.modifiedAtRenderer.bind(this);

  constructor() {
    super();
    this.pipelineInfo = {
      name: "",
      project: "",
      type: "",
      data: {},
    }
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
      `
    ];
  }
  
  /**
   * Create a pipeline
   */
  _createPipeline() {
    /**
     * TODO: Add pipeline according to selected type
     * 
     */
    console.log('_createPipeline function called!');
    this._hideDialogById('#create-pipeline');
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
          <span>${rowData.item.created_at}
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
        <span>${rowData.item.created_at}
      </div>
      `, root
    );
  }

  render() {
    // language=HTML
    return html`
    <div class="horizontal layout flex center end-justified">
      <mwc-button unelevated icon="add" label="New Pipeline" @click="${() => this._launchDialogById('#create-pipeline')}"></mwc-button>
    </div>
    <vaadin-grid id="pipeline-list" thme="row-stripes column-borders compact" aria-label="Pipeline List" .items="${this.pipelines}" height-by-rows>
      <vaadin-grid-column auto-width flex-grow="0" header="#" text-align="center" .renderer="${this._boundIndexRenderer}"></vaadin-grid-column>
      <vaadin-grid-filter-column id="name" auto-width path="name" header="Name" resizable></vaadin-grid-filter-column>
      <vaadin-grid-column id="owner" header="Owner" path="owner"></vaadin-grid-column>
      <vaadin-grid-column id="control" header="Controls" .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
      <vaadin-grid-column id="created-at" header="Created At" .renderer="${this._boundCreateAtRenderer}"></vaadin-grid-column>
      <vaadin-grid-column id="modified-at" header="Last Modified" .renderer="${this._boundModifiedAtRenderer}"></vaadin-grid-column>
    </vaadin-grid>
    <backend-ai-dialog id="create-pipeline" fixed backdrop blockscrolling persistent>
      <span slot="title">New Pipeline</span>
      <div slot="content" class="vertical layout flex">
        <mwc-textfield id="pipeline-name" label="Pipeline Name"></mwc-textfield>
        <mwc-select class="full-width" id="project" label="Project" fixedMenuPosition>
          ${this.projectGroups.map((item, idx) => {
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
        <mwc-button outlined label="Cancel" @click="${() => this._hideDialogById('#create-pipeline')}"></mwc-button>
        <mwc-button unelevated label="Create" @click="${() => this._createPipeline()}"></mwc-button>
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