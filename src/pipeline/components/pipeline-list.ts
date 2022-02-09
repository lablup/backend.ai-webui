/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import '../../components/lablup-activity-panel';
import {BackendAiStyles} from '../../components/backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../../plastics/layout/iron-flex-layout-classes';
import '@material/mwc-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select';
import '../lib/pipeline-dialog';

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

        pipeline-dialog {
          --component-min-width: 350px;
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

  render() {
    // language=HTML
    return html`
    <div class="horizontal layout flex center end-justified">
      <mwc-button unelevated icon="add" label="New Pipeline" @click="${() => this._launchDialogById('#create-pipeline')}"></mwc-button>
    </div>
    <pipeline-dialog id="create-pipeline" fixed backdrop blockscrolling persistent>
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
    </pipeline-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-list': PipelineList;
  }
}