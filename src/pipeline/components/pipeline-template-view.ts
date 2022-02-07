/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '../../components/lablup-activity-panel';
import {BackendAiStyles} from '../../components/backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../../plastics/layout/iron-flex-layout-classes';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';
import '@material/mwc-button';
import '../lib/pipeline-flow';
import './pipeline-template-list';
import { DrawflowNode } from 'drawflow';

/**
 Pipeline Template View

 `pipeline-template-view` is wrapper component of pipeline template list and flow editor

 Example:

 <pipeline-template-view>
 ...
 </pipeline-template-view>

@group Backend.AI pipeline
 @element pipeline-template-view
*/

@customElement('pipeline-template-view')
export default class PipelineTemplateView extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: String}) _activeTab = 'template-list';
  @property({type: Boolean}) isNodeSelected = false;
  @property({type: Object}) selectedNode;

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

        mwc-button {
          margin: 10px;
        }
      `
    ];
  }

  firstUpdated() {
    document.addEventListener('node-selected', (e: any) => {
      if (e.detail) {
        this.selectedNode = e.detail;
        this.isNodeSelected = true;
      }
    });
    document.addEventListener('node-unselected', (e: any) => {
      this.selectedNode = {};
      this.isNodeSelected = false;
    });
  }

  _showTab(tab) {
    const els = this.shadowRoot.querySelectorAll('.tab-content');
    for (const obj of els) {
      obj.style.display = 'none';
    }
    this._activeTab = tab.title;
    this.shadowRoot.querySelector('#' + tab.title).style.display = 'block';
  }

  /**
   * Create a task in pipeline template
   */
  _createTask() {
    /**
     * TODO: Add task with config launcher
     * 
     * procedure:
     *    step 1. Select task type from 3 options: from URL / from YAML / custom task
     *    step 2. Show task configuration dialog
     *    step 3. Trigger custom event to add corresponding node into pipeline-flow pane.
     */
    
    // step 1. Select task type from 3 options: from URL / from YAML / custom task

    // step 2. Show task configuration dialog

    // step 3. Trigger custom event to add corresponding node into pipeline-flow pane.
    // detail: {name, inputs #, outputs #, pos_x, pos_y, class, data, html, typenode}
    const paneElement = this.shadowRoot.querySelector('pipeline-flow');
    const paneSize = paneElement.paneSize;
    const dummyNodeInfo = {
      name: 'dummy',
      inputs: 1,
      outputs: 1,
      pos_x: paneSize.width / 2 ,
      pos_y: paneSize.height / 3,
      class: 'new-task',
      data: {},
      html: 'dummy', // put raw html code
    };
    const addTaskEvent = new CustomEvent("add-task", {'detail': dummyNodeInfo});
    document.dispatchEvent(addTaskEvent);
  }

  /**
   * Edit the selected task in pipeline template
   */
  _editTask() {
    /**
     * TODO: Edit task in config launcher
     * 
     * * NOTE *
     * For now, when task is created, the user cannot change the type of task.
     * 
     * procedure:
     *    step 1. Show task configuration dialog
     *    step 2. Update the task
     */

    // step 1. Show task configuration dialog

    // step 2. Update the task
    console.log('_editTask function Called!');
  }

  /**
   * Remove the selected task in pipeline template
   */
  _removeTask() {
    /**
     * TODO: Remove task with confirmation dialog
     * 
     * procedure:
     *    step 1. Show remove task confirmation dialog
     *    step 2. If confirmation dialog returns true, then dispatchEvent to remove the node.
     */
    
    // step 1. Show remove task confirmation dialog

    // step 2. If confirmation dialog returns true, then dispatchEvent to remove the node.
    const removeTaskEvent = new CustomEvent("remove-task", {'detail': this.selectedNode.id});
    document.dispatchEvent(removeTaskEvent);
    console.log('_removeTask function Called!');
  }

  render() {
    // language=HTML
    return html`
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar>
              <mwc-tab title="template-list" label="Template List" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              <mwc-tab title="template-view" label="Template View" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            </mwc-tab-bar>
          </h3>
        <div id="template-list" class="tab-content">
          <pipeline-template-list></pipeline-template-list>
        </div>
        <div id="template-view" class="tab-content" style="display:none;">
          <div class="horizontal layout flex center end-justified">
            ${this.isNodeSelected ? html`
              <mwc-button outlined icon="delete" label="Remove Task" @click="${() => this._removeTask()}"></mwc-button>
              <mwc-button outlined icon="edit" label="Edit Task" @click="${() => this._editTask()}"></mwc-button>
            ` : html``}
              <mwc-button unelevated icon="add" label="New Task" @click="${() => this._createTask()}"></mwc-button>
          </div>
          <pipeline-flow isEditable></pipeline-flow>
        </div>
      </lablup-activity-panel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-template-view': PipelineTemplateView;
  }
}