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
import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';
import '@material/mwc-textfield';
import '../lib/pipeline-flow';
import './pipeline-list';
import '../lib/pipeline-dialog';

/**
 Pipeline View

 `pipeline-view` is wrapper component of pipeline list and flow editor

 Example:

 <pipeline-view>
 ...
 </pipeline-view>

@group Backend.AI pipeline
 @element pipeline-view
*/

@customElement('pipeline-view')
export default class PipelineView extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: String}) _activeTab = 'pipeline-list';
  @property({type: Boolean}) isNodeSelected = false;
  @property({type: Object}) selectedNode;
  @property({type: Object}) pipelineInfo;
  @property({type: Object}) taskInfo;
  @property({type: Array}) projectGroups = ['default']; // contains project groups that user can access

  constructor() {
    super();
    // dummy data for pipeline info
    this.pipelineInfo = {
      name: "Flow-01",
      project: "default",
      type: "custom",
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
        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0px 0px;
          margin: 0px auto;
        }

        span#pipeline-name {
          font-size: 1.2rem;
          margin: auto 10px;
          color: #555;
          min-width: 100px; 
        }

        mwc-button {
          margin: 10px;
        }

        mwc-icon-button {
          color: #555;
        }

        mwc-select.full-width {
          width: 100%;
          font-family: var(--general-font-family);
          --mdc-theme-primary: var(--general-sidebar-color);
          --mdc-menu-item-height: auto;
          /* Need to be set when fixedMenuPosition attribute is enabled */
          --mdc-menu-max-width: 385px;
          --mdc-menu-min-width: 385px;
        }

        mwc-select#pipeline-version {
          width: 130px;
        }

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
        }

        mwc-textfield {
          width: 100%;
        }

        mwc-textfield#edit-pipeline-name {
          margin-bottom: 10px;
        }

        mwc-textfield#pipeline-name {
          margin:auto 10px;
          height: 36px;
          width: auto;
        }

        pipeline-dialog {
          --component-min-width: 350px;
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
    document.addEventListener('flow-response', (e:any) => {
      if (e.detail) {
        this.pipelineInfo.data = e.detail;
      }
    })
  }

  _showTab(tab, tabClass='') {
    const els = this.shadowRoot.querySelectorAll(tabClass);
    for (const obj of els) {
      obj.style.display = 'none';
    }
    this._activeTab = tab.title;
    this.shadowRoot.querySelector('#' + tab.title).style.display = 'block';
  }

  /**
   * Create a task in pipeline
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
   * Edit the selected task in pipeline
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
   * Remove the selected task in pipeline
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

  /**
   * Update Pipeline Information to current change
   * 
   */
   _updatePipelineInfo() {
     const name = this.shadowRoot.querySelector('#edit-pipeline-name').value;
     const selectedProject = this.shadowRoot.querySelector('#edit-project').value;
     /**
      * TODO: Update pipeline info based on current value
      * 
      * procedure:
      *     step 1. Send update request to corresponding API server
      *     step 2. Receive the response and if succeeds, then change current pipeline info
      *     step 3. Close the edit-pipeline dialog
      */

    // step 1. Send update request to corresponding API server

    // step 2. Receive the response and if succeeds, then change current pipeline info
    this.pipelineInfo.name = name;
    this.pipelineInfo.project = selectedProject;

    this.shadowRoot.querySelector('#pipeline-name').value = this.pipelineInfo.name;

    this._hideDialogById('#edit-pipeline');
  }


  _getCurrentFlowData() {
    const flowDataReqEvent = new CustomEvent('export-flow');
    document.dispatchEvent(flowDataReqEvent);
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
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar>
              <mwc-tab title="pipeline-list" label="List" @click="${(e) => this._showTab(e.target, '.tab-content')}"></mwc-tab>
              <mwc-tab title="pipeline-view" label="View" @click="${(e) => this._showTab(e.target, '.tab-content')}"></mwc-tab>
            </mwc-tab-bar>
          </h3>
        <div id="pipeline-list" class="tab-content">
          <pipeline-list></pipeline-list>
        </div>
        <div id="pipeline-view" class="tab-content" style="display:none;">
          <div class="horizontal layout flex justified">
            <div class="horizontal layout flex center start-justified">
            <span id="pipeline-name">${this.pipelineInfo.name}</span>
            <mwc-select id="pipeline-version" label="Version">
              <mwc-list-item selected value="Latest">Latest</mwc-list-item>
            </mwc-select>
            <mwc-icon-button icon="save" @click="${() => this._getCurrentFlowData()}"></mwc-icon-button>
            <mwc-icon-button icon="play_arrow" @click="${() => this._launchDialogById('#run-pipeline')}"></mwc-icon-button>
            <mwc-icon-button icon="settings" @click="${() => this._launchDialogById('#edit-pipeline')}"></mwc-icon-button>
            </div>
            <div class="horizontal layout flex center end-justified">
              ${this.isNodeSelected ? html`
                <mwc-button outlined icon="delete" label="Remove Task" @click="${() => this._removeTask()}"></mwc-button>
                <mwc-button outlined icon="edit" label="Edit Task" @click="${() => this._editTask()}"></mwc-button>
              ` : html``}
                <mwc-button unelevated icon="add" label="New Task" @click="${() => this._createTask()}"></mwc-button>
            </div>
          </div>
          <pipeline-flow isEditable></pipeline-flow>
        </div>
      </lablup-activity-panel>
      <pipeline-dialog id="run-pipeline" fixed backdrop blockscrolling persistent>
        <span slot="title">Run Pipeline</span>
        <div slot="content"></div>
        <div slot="footer" class="horizontal layout end-justified flex">
          <mwc-button outlined label="Cancel" @click="${() => this._hideDialogById('#run-pipeline')}"></mwc-button>
          <mwc-button unelevated label="Proceed"></mwc-button>
        </div>
      </pipeline-dialog>
      <pipeline-dialog id="edit-pipeline" fixed backdrop blockscrolling persistent>
        <span slot="title">Edit Pipeline</span>
        <div slot="content">
          <mwc-textfield id="edit-pipeline-name" label="Pipeline Name" value="${this.pipelineInfo.name}"></mwc-textfield>
          <mwc-select class="full-width" id="edit-project" label="Project" fixedMenuPosition>
            ${this.projectGroups.map((item) => {
              return html`<mwc-list-item id="${item}" value="${item}" ?selected="${item === this.pipelineInfo.project}">${item}</mwc-list-item>`
            })}
          </mwc-select>
        </div>
        <div slot="footer" class="horizontal layout end-justified flex">
          <mwc-button outlined label="Cancel" @click="${() => this._hideDialogById('#edit-pipeline')}"></mwc-button>
          <mwc-button unelevated label="Update" @click="${() => this._updatePipelineInfo()}"></mwc-button>
        </div>
      </pipeline-dialog>
      <pipeline-dialog id="edit-task" fixed backdrop blockscrolling persistent>
        <span slot="title">Edit Task</span>
        <div slot="content">
          <mwc-tab-bar>
            <mwc-tab title="task-settings" label="Settings" @click="${(e) => this._showTab(e.target, '.task-tab-content')}"></mwc-tab>
            <mwc-tab title="task-resources" lable="Resources" @click="${(e) => this._showTab(e.target, '.task-tab-content')}"></mwc-tab>
            <mwc-tab title="task-command" lable="Command" @click="${(e) => this._showTab(e.target, '.task-tab-content')}"></mwc-tab>
          </mwc-tab-bar>
          <div id="task-settings" class="task-tab-content">
            <mwc-textfield label="Task Name"></mwc-textfield>
          </div>
        </div>
        <div slot="footer" class="horizontal layout end-justified flex">
          <mwc-button outlined label="Cancel" @click="${() => this._hideDialogById('#edit-task')}"></mwc-button>
          <mwc-button unelevated label="Update"></mwc-button>
        </div>
      </pipeline-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-view': PipelineView;
  }
}