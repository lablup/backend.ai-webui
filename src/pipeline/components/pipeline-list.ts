/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html, render} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import PipelineUtils from '../lib/pipeline-utils';
import {PipelineInfo, PipelineInfoExtended, PipelineYAML} from '../lib/pipeline-type';
import PipelineConfigurationForm from '../lib/pipeline-configuration-form';
import '../lib/pipeline-configuration-form';
import '../../components/backend-ai-dialog';
import '../../components/lablup-activity-panel';
import '../../components/lablup-codemirror';
import {BackendAIPage} from '../../components/backend-ai-page';
import {BackendAiStyles} from '../../components/backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../../plastics/layout/iron-flex-layout-classes';
import {default as YAML} from 'js-yaml';

import '@material/mwc-button';
import '@material/mwc-icon/mwc-icon';

import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';

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
export default class PipelineList extends BackendAIPage {
  public shadowRoot: any; // ShadowRoot
  @property({type: PipelineInfo}) pipelineInfo;
  @property({type: PipelineInfoExtended}) pipelineInfoExtended;
  @property({type: Array<PipelineInfoExtended>}) pipelines;
  @property({type: String}) _activeTab = 'pipeline-general';

  @property({type: Object}) notification = Object();
  @property({type: Object}) resourceBroker;

  private _isLaunchable = false;

  @property({type: Object}) _boundNameRenderer = this.nameRenderer.bind(this);
  @property({type: Object}) _boundIndexRenderer = this.indexRenderer.bind(this);
  @property({type: Object}) _boundControlRenderer = this.controlRenderer.bind(this);
  @property({type: Object}) _boundCreateAtRenderer = this.createdAtRenderer.bind(this);
  @property({type: Object}) _boundModifiedAtRenderer = this.modifiedAtRenderer.bind(this);

  @query('vaadin-grid#pipeline-list') pipelineGrid;
  @query('pipeline-configuration-form') pipelineConfigurationForm!: PipelineConfigurationForm;

  constructor() {
    super();
    this._initResource();
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
        .description {
          color: black;
        }

        .title {
          color: #666;
        }

        .pipeline-detail-items {
          margin-bottom: 10px;
        }

        #login-title-area {
          margin: 10px;
        }

        a.pipeline-link:hover {
          color: var(--general-textfield-selected-color);
        }

        backend-ai-dialog {
          --component-min-width: 390px;
          --component-max-width: 390px;
        }

        backend-ai-dialog.yaml {
          --component-min-width: auto;
          --component-max-width: 100%;
        }

        form#pipeline-server-login-form {
          width: 100%;
        }

        mwc-button {
          margin: 10px;
        }

        mwc-button.full-width {
          width: 100%;
        }

        mwc-icon {
          --mdc-icon-size: 13px;
          margin-right: 2px;
          vertical-align: middle;
        }

        /** disabled when all-rows-visible attribute enabled */
        vaadin-grid {
          max-height: 450px;
        }
      `
    ];
  }

  /**
   *  Initialize properties of the component
   */
  _initResource() {
    this.notification = globalThis.lablupNotification;
    this.resourceBroker = globalThis.resourceBroker;
    this.pipelineInfo = new PipelineInfo();
    this.pipelineInfoExtended = new PipelineInfoExtended();
    this.pipelines = [] as Array<PipelineInfoExtended>;
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', async () => {
        this._loadPipelineList();
        this._enableLaunchButton();
      }, {once: true});
    } else { // already connected
      this._loadPipelineList();
      this._enableLaunchButton();
    }
  }

  /**
   * Enable launch button only when image updating is not in progress
   */
  _enableLaunchButton() {
    if (!this.resourceBroker.image_updating) { // Image information is successfully updated.
      this._isLaunchable = true;
    } else {
      this._isLaunchable = false;
      setTimeout(() => {
        this._enableLaunchButton();
      }, 500);
    }
    this.requestUpdate();
  }

  /**
   * Create a pipeline
   */
  _createPipeline() {
    if (!this.pipelineConfigurationForm._validatePipelineConfigInput()) {
      return;
    }
    this.pipelineInfo = this.pipelineConfigurationForm.inputFieldListAsInstance();
    globalThis.backendaiclient.pipeline.create(this.pipelineInfo).then((res: PipelineInfoExtended) => {
      this.pipelineInfoExtended = res;
      this.notification.text = `Pipeline ${this.pipelineInfoExtended.name} created.`;
      this.notification.show();
      this._loadPipelineList();
      // move to pipeline view page with current pipeline info
      this.moveToViewTab();
      this.pipelineInfo = {};
    }).catch((err) => {
      console.log(err);
      this.notification.text = `Pipeline Creation failed. Check Input or server status.`;
      this.notification.show(true);
    }).finally(() => {
      this._hideDialogById('#create-pipeline');
    });
  }

  /**
   * Delete selected pipeline
   */
  _deletePipeline() {
    globalThis.backendaiclient.pipeline.delete(this.pipelineInfoExtended.id).then((res) => {
      this.notification.text = `Pipeline ${this.pipelineInfoExtended.name} deleted.`;
      this.notification.show();
      this.pipelineInfo = {};
      this._loadPipelineList();
    }).catch((err) => {
      console.log(err);
    });
    this._hideDialogById('#delete-pipeline');
  }

  /**
   * Get Pipeline list from pipeline server
   */
  _loadPipelineList() {
    const sanitizeYaml = (yaml) => {
      if (typeof yaml === 'string') {
        return (yaml === '') ? {} : YAML.load(yaml);
      } else {
        // already parsed
        return yaml;
      }
    };

    globalThis.backendaiclient.pipeline.list().then((res) => {
      this.pipelines = res.map((pipeline: PipelineInfoExtended) => {
        pipeline.yaml = sanitizeYaml(pipeline.yaml);
        // data transformation on yaml and date (created_at, last_modified)
        pipeline.created_at = PipelineUtils._humanReadableDate(pipeline.created_at);
        pipeline.last_modified = PipelineUtils._humanReadableDate(pipeline.last_modified);
        return pipeline;
      });
      // FIXME: need to update grid items manually. If not, deleted or updated row remains.
      this.pipelineGrid.items = this.pipelines;
    }).catch((err) => {
      this.notification.text = err.message;
      this.notification.show();
      // authentication failed
      if (err.statusCode === 403) {
        const event = new CustomEvent('backend-ai-logout', {'detail': ''});
        document.dispatchEvent(event);
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
   * Show pipeline dialog
   */
  async _launchPipelineDialog() {
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      setTimeout(() => {
        this._launchPipelineDialog();
      }, 1000);
    } else {
      await this.pipelineConfigurationForm._initPipelineConfiguration();
      this._launchDialogById('#create-pipeline');
    }
  }

  /**
   * Show information dialog of selected pipeline
   *
   * @param {pipelineInfoExtended} pipeline
   */
  _launchPipelineDetailDialog(pipeline: PipelineInfoExtended) {
    this.pipelineInfoExtended = pipeline;
    const parsedPipelineInfo = PipelineUtils._parsePipelineInfo(this.pipelineInfoExtended);
    parsedPipelineInfo.yaml.tasks = PipelineUtils._parseTaskListInfo(parsedPipelineInfo.dataflow, parsedPipelineInfo.yaml.environment['scaling-group']);
    this.pipelineInfoExtended = PipelineUtils._stringifyPipelineInfo(parsedPipelineInfo);
    this._launchDialogById('#pipeline-detail');
  }

  /**
   * Show delete dialog of selected pipeline
   *
   * @param {PipelineInfoExtended} pipeline
   */
  _launchPipelineDeleteDialog(pipeline: PipelineInfoExtended) {
    this.pipelineInfoExtended = pipeline;
    this._launchDialogById('#delete-pipeline');
  }

  /**
   * Show yaml data dialog of selected pipeline
   *
   */
  _launchPipelineYAMLDialog(pipelineYaml: PipelineYAML) {
    const codemirror = this.shadowRoot.querySelector('lablup-codemirror#yaml-data');
    const yamlString = YAML.dump(pipelineYaml, {});
    codemirror.setValue(yamlString);
    this._launchDialogById('#pipeline-yaml');
  }

  /**
   * Move to pipeline-view tab
   */
   moveToViewTab() {
    const moveToViewEvent =
      new CustomEvent('pipeline-view-active-tab-change',
        {
          'detail': {
            'activeTab': {
              title: 'pipeline-view'
            },
            'pipeline': this.pipelineInfoExtended
          }
        });
    document.dispatchEvent(moveToViewEvent);
  }

  /**
   * Move to pipeline view tab with selected pipeline data
   *
   * @param {PipelineInfoExtended} pipeline
   */
  loadPipeline(pipeline: PipelineInfoExtended) {
    this.pipelineInfoExtended = pipeline;
    this.moveToViewTab();
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
   * Render icon button for showing pipeline details, pipeline graph and double-checking for deletion
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  controlRenderer(root, column, rowData) {
    render(
      html`
        <div id="controls" class="layout horizontal flex center wrap" .pipeline-id="${rowData.item.name}">
          <wl-button fab flat inverted
            class="fg green" @click="${() => this._launchPipelineDetailDialog(rowData.item)}">
            <wl-icon>info</wl-icon>
          </wl-button>
          <!--<wl-button fab flat inverted
            class="fg blue">
            <wl-icon>settings</wl-icon>
          </wl-button>-->
          <wl-button fab flat inverted
            class="fg blue" @click="${() => this.loadPipeline(rowData.item)}">
            <wl-icon>account_tree</wl-icon>
          </wl-button>
          <wl-button fab flat inverted class="fg red controls-running" 
            @click="${() => this._launchPipelineDeleteDialog(rowData.item)}">
            <wl-icon>delete_forever</wl-icon>
          </wl-button>
        </div>
      `, root
    );
  }

  /**
   * Render created at date of rowData
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
   * Render modified at date of rowData
   *
   * @param {Element} root - the row details content DOM element
   * @param {Element} column - the column element that controls the state of the host element
   * @param {Object} rowData - the object with the properties related with the rendered item
   */
  modifiedAtRenderer(root, column?, rowData?) {
    render(
      html`
      <div class="layout vertical">
        <span style="font-size:0.75rem;">${rowData.item.last_modified}</span>
      </div>
      `, root
    );
  }

  /**
   * Render pipeline create dialog
   * 
   * @returns {string} stringified html
   */
  renderCreatePipelineDialogTemplate() {
    // language=HTML
    return html`
    <backend-ai-dialog id="create-pipeline" fixed backdrop blockscrolling persistent narrowLayout>
      <span slot="title">New Pipeline</span>
      <div slot="content" class="vertical layout flex">
        <pipeline-configuration-form></pipeline-configuration-form>
      </div>
      <div slot="footer" class="horizontal layout end-justified flex">
        <mwc-button class="full-width" unelevated label="Create Pipeline" @click="${() => this._createPipeline()}"></mwc-button>
      </div>
    </backend-ai-dialog>`;
  }

  /**
   * Render pipeline delete confirmation dialog
   * 
   * @returns {string} stringified html
   */
  renderDeletePipelineDialogTemplate() {
    // language=HTML
    return html`
    <backend-ai-dialog id="delete-pipeline" fixed backdrop blockscrolling persistent>
      <span slot="title">Delete Pipeline</span>
      <div slot="content" class="vertical layout flex">
        <span>
          Are you sure you want to delete this pipeline?<br />
          This process cannot be undone!
        </span>
      </div>
      <div slot="footer" class="horizontal end-justified flex layout">
        <div class="flex"></div>
        <mwc-button label="Cancel" @click="${() => this._hideDialogById('#delete-pipeline')}"></mwc-button>
        <mwc-button unelevated class="delete" label="Delete" @click="${this._deletePipeline}"></mwc-button>
      </div>
    </backend-ai-dialog>`;
  }

  /**
   * Render pipeline detail dialog
   * 
   * @param {PipelineInfoExtended} pipeline
   * @returns {string} stringified html
   */
  renderPipelineDetailDialogTemplate(pipeline: PipelineInfoExtended) {
    // language=HTML
    // FIXME: Hide owner info since its only provided by UUID
    // TODO: Add id of pipeline and fix visibility of created_at and modified_at
    const parsedPipelineInfo = PipelineUtils._parsePipelineInfo(pipeline);
    return html`
    <backend-ai-dialog id="pipeline-detail" fixed backdrop blockscrolling persistent>
      <span slot="title">Pipeline Detail</span>
      <div slot="content" class="vertical layout flex">
        <!--<div class="horizontal flex layout wrap justified center pipeline-detail-items">
            <div class="vertical center start-justified flex">
              <div class="title">Owner</div>
              <div class="description"></div>
            </div>
        </div>-->
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
            <div class="vertical center start-justified flex">
              <div class="title">Name</div>
              <div class="description">${parsedPipelineInfo.name}</div>
            </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
            <div class="vertical center start-justified flex">
              <div class="title">Description</div>
              <div class="description">${parsedPipelineInfo.description}</div>
            </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
          <div class="vertical center start-justified flex">
            <div class="title">YAML</div>
          </div>
          <mwc-button unelevated label="SEE YAML" icon="description" @click="${() => this._launchPipelineYAMLDialog(parsedPipelineInfo.yaml)}"></mwc-button>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
          <div class="vertical center start-justified flex">
            <div class="title">Version</div>
            <div class="description">${parsedPipelineInfo.version ? parsedPipelineInfo.version : 'None'}</div>
          </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
          <div class="vertical center start-justified flex">
            <div class="title">Created at</div>
            <div class="description">${this.pipelineInfo.created_at}</div>
          </div>
        </div>
        <div class="horizontal flex layout wrap justified center pipeline-detail-items">
          <div class="vertical center start-justified flex">
            <div class="title">Last modified</div>
            <div class="description">${this.pipelineInfo.last_modified}</div>
          </div>
        </div>
      </div>
    </backend-ai-dialog>`;
  }

  /**
   * Render pipeline YAML dialog
   * 
   * @returns {string} stringified html
   */
  renderPipelineYAMLDialogTemplate() {
    // language=HTML
    return html`
      <backend-ai-dialog class="yaml" id="pipeline-yaml" fixed backdrop blockscrolling>
        <span slot="title">${`Pipeline Data (YAML)`}</span>
        <div slot="content">
          <lablup-codemirror id="yaml-data" mode="yaml" readonly useLineWrapping></lablup-codemirror>
        </div>
      </backend-ai-dialog>`;
  }

  render() {
    // language=HTML
    return html`
    <div class="horizontal layout flex center end-justified">
      <mwc-button unelevated icon="add" label="New Pipeline" @click="${() => this._launchPipelineDialog()}" ?disabled="${!this._isLaunchable}"></mwc-button>
    </div>
    <vaadin-grid id="pipeline-list" theme="row-stripes column-borders compact wrap-cell-content" aria-label="Pipeline List" .items="${this.pipelines}">
      <vaadin-grid-column auto-width flex-grow="0" header="#" text-align="center" .renderer="${this._boundIndexRenderer}"></vaadin-grid-column>
      <vaadin-grid-filter-column id="name" auto-width header="Name" resizable .renderer="${this._boundNameRenderer}"></vaadin-grid-filter-column>
      <!--<vaadin-grid-column id="owner" header="Owner" resizable path="owner"></vaadin-grid-column>-->
      <vaadin-grid-column id="control" header="Controls" resizable .renderer="${this._boundControlRenderer}"></vaadin-grid-column>
      <vaadin-grid-column id="created-at" header="Created At" resizable .renderer="${this._boundCreateAtRenderer}"></vaadin-grid-column>
      <vaadin-grid-column id="modified-at" header="Last Modified" resizable .renderer="${this._boundModifiedAtRenderer}"></vaadin-grid-column>
    </vaadin-grid>
    ${this.renderCreatePipelineDialogTemplate()}
    ${this.renderDeletePipelineDialogTemplate()}
    ${this.renderPipelineDetailDialogTemplate(this.pipelineInfoExtended)}
    ${this.renderPipelineYAMLDialogTemplate()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-list': PipelineList;
  }
}
