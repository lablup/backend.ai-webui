/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '../../components/backend-ai-dialog';
import '../../components/lablup-activity-panel';
import '../../components/lablup-codemirror';
import {default as PainKiller} from '../../components/backend-ai-painkiller';
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
import * as e from 'express';

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

  // Elements
  @property({type: Object}) spinner = Object();
  @property({type: Object}) notification = Object();
  // Environments
  @property({type: Object}) tags = Object();
  @property({type: Array}) languages;
  @property({type: String}) defaultLanguage = '';
  @property({type: Array}) versions = [];
  @property({type: String}) scalingGroup = '';
  @property({type: Array}) scalingGroups = [];
  @property({type: String}) vhost = '';
  @property({type: Array}) vhosts = [];
  @property({type: Object}) images = Object();
  @property({type: Object}) imageInfo = Object();
  @property({type: Object}) imageNames = Object();
  @property({type: Object}) resourceLimits = Object();
  @property({type: Object}) supports = Object();
  @property({type: Object}) aliases = Object();

  @property({type: Array}) projectGroups = ['default']; // contains project groups that user can access
  @property({type: Array}) taskType = ['Import from GitHub', 'Import from GitLab', 'Custom Task'];

  constructor() {
    super();
    this.aliases = {
      'TensorFlow': 'python-tensorflow',
      'NGC-TensorFlow': 'ngc-tensorflow',
      'PyTorch': 'python-pytorch',
      'NGC-PyTorch': 'ngc-pytorch',
      'Lablup Research Env.': 'python-ff',
      'Python': 'python',
    };
    this.languages = [];

    // dummy data for pipeline info
    this.pipelineInfo = {
      name: "",
      scaling_group: "",
      owner: "",
      type: "",
      created_at: "",
      modified_at: "",
      data: {},
    };

    this.selectedNode = {
      name: '',
      inputs: 1,
      outputs: 1,
      pos_x: 0,
      pos_y: 0,
      class: '',
      data: {},
      html: '',
    };
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
        .task-tab-content,
        .tab-content {
          width: 100%;
        }

        backend-ai-dialog {
          --component-min-width: 350px;
          --component-max-width: 390px;
        }

        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0px 0px;
          margin: 0px auto;
        }

        h3.task-tab {
          background-color: #bbb;
        }

        lablup-codemirror {
          width: 370px;
        }

        mwc-button {
          margin: 10px;
        }

        mwc-button.full-width {
          width: 100%;
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

        mwc-tab-bar.task-tab {
          --mdc-theme-primary: var(--general-button-background-color);
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
        
        span#pipeline-name {
          font-size: 1.2rem;
          margin: auto 10px;
          color: #555;
          min-width: 100px; 
        }

        pipeline-flow {
          --pane-height: 500px;
        }
      `
    ];
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    fetch('resources/image_metadata.json')
      .then(
        (resp) => resp.json()
      )
      .then((json) => {
        this.imageInfo = json.imageInfo;
        for (const key in this.imageInfo) {
          if ({}.hasOwnProperty.call(this.imageInfo, key)) {
            this.tags[key] = [];
            if ('name' in this.imageInfo[key]) {
              this.aliases[key] = this.imageInfo[key].name;
              this.imageNames[key] = this.imageInfo[key].name;
            }
            if ('label' in this.imageInfo[key]) {
              this.imageInfo[key].label.forEach((item) => {
                if (!('category' in item)) {
                  this.tags[key].push(item.tag);
                }
              });
            }
          }
        }
      });

    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshImageList();
        this.selectDefaultLanguage();
      }, true);
    } else { // already connected
      this._refreshImageList();
      this.selectDefaultLanguage();
    }

    this.shadowRoot.querySelector('#task-environment').addEventListener(
      'selected', this.updateLanguage.bind(this));
    
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
    });
    document.addEventListener('pipeline-view-active-tab-change', (e:any) => {
      if (e.detail) {
        const tabGroup = [...this.shadowRoot.querySelector('#pipeline-pane').children];
        this.shadowRoot.querySelector('#pipeline-pane').activeIndex = tabGroup.map(tab => tab.title).indexOf(e.detail.activeTab.title);
        this._showTab(e.detail.activeTab, '.tab-content');
        this.pipelineInfo = e.detail.pipeline;
        /**
         * TODO: load pipeline infomation to pipeline-flow pane
         */
        this.shadowRoot.querySelector('#pipeline-name').innerHTML = this.pipelineInfo.name;
      }
    });
  }

  _showTab(tab, tabClass='') {
    const els = this.shadowRoot.querySelectorAll(tabClass);
    for (const obj of els) {
      obj.style.display = 'none';
    }
    this._activeTab = tab.title;
    this.shadowRoot.querySelector('#' + tab.title).style.display = 'block';
  }

  updateLanguage() {
    const selectedItem = this.shadowRoot.querySelector('#task-environment').selected;
    if (selectedItem === null) return;
    const kernel = selectedItem.id;
    this._updateVersions(kernel);
  }

  _updateVersions(kernel) {
    const tagEl = this.shadowRoot.querySelector('#task-environment-tag');
    if (kernel in this.supports) {
      const versions = this.supports[kernel];
      versions.sort();
      versions.reverse(); // New version comes first.
      this.versions = versions;
    }
    if (this.versions !== undefined) {
      tagEl.value = this.versions[0];
      tagEl.selectedText = tagEl.value;
      // this.updateMetric('update versions');
    }
  }

  _refreshImageList() {
    const fields = [
      'name', 'humanized_name', 'tag', 'registry', 'digest', 'installed',
      'resource_limits { key min max }'
    ];
    globalThis.backendaiclient.image.list(fields, true).then((response) => {
      const images: Array<Record<string, unknown>> = [];
      Object.keys(response.images).map((objectKey, index) => {
        const item = response.images[objectKey];
        if (item.installed === true) {
          images.push(item);
        }
      });
      if (images.length === 0) {
        return;
      }
      this.images = images;
      this.supports = {};
      Object.keys(this.images).map((objectKey, index) => {
        const item = this.images[objectKey];
        const supportsKey = `${item.registry}/${item.name}`;
        if (!(supportsKey in this.supports)) {
          this.supports[supportsKey] = [];
        }
        this.supports[supportsKey].push(item.tag);
        this.resourceLimits[`${supportsKey}:${item.tag}`] = item.resource_limits;
      });
      this._updateEnvironment();
    }).catch((err) => {
      // this.metadata_updating = false;
      console.error(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true);
      }
    });
  }

  _updateEnvironment() {
    // this.languages = Object.keys(this.supports);
    // this.languages.sort();
    const langs = Object.keys(this.supports);
    if (langs === undefined) return;
    langs.sort();
    this.languages = [];
    langs.forEach((item, index) => {
      if (!(Object.keys(this.aliases).includes(item))) {
        const humanizedName = this._guessHumanizedNames(item);
        if (humanizedName !== null) {
          this.aliases[item] = humanizedName;
        } else {
          this.aliases[item] = item;
        }
      }
      const specs = item.split('/');
      const registry = specs[0];
      let prefix; let kernelName;
      if (specs.length == 2) {
        prefix = '';
        kernelName = specs[1];
      } else {
        prefix = specs[1];
        kernelName = specs[2];
      }
      const alias = this.aliases[item];
      let basename;
      if (alias !== undefined) {
        basename = alias.split(' (')[0];
      } else {
        basename = kernelName;
      }
      let tags: string[] = [];
      if (kernelName in this.tags) {
        tags = tags.concat(this.tags[kernelName]);
      }
      if (prefix != '') {
        tags.push(prefix);
      }
      this.languages.push({
        name: item,
        registry: registry,
        prefix: prefix,
        kernelname: kernelName,
        alias: alias,
        basename: basename,
        tags: tags
      });
    });
    this._initAliases();
  }

  selectDefaultLanguage() {
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._selectDefaultLanguage();
      }, true);
    } else {
      this._selectDefaultLanguage();
    }
  }

  _selectDefaultLanguage() {
    if (globalThis.backendaiclient._config.default_session_environment !== undefined &&
      'default_session_environment' in globalThis.backendaiclient._config &&
      globalThis.backendaiclient._config.default_session_environment !== '') {
      this.defaultLanguage = globalThis.backendaiclient._config.default_session_environment;
    } else if (this.languages.length !== 0) {
      this.defaultLanguage = this.languages[0].name;
    } else {
      this.defaultLanguage = 'cr.backend.ai/stable/python';
    }
    return true;
  }

    _guessHumanizedNames(kernelName) {
    const candidate = this.imageNames;
    let imageName = '';
    let humanizedName = null;
    let matchedString = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()';
    Object.keys(candidate).forEach((item, index) => {
      const specs = kernelName.split('/');
      if (specs.length == 2) {
        imageName = specs[1];
      } else {
        imageName = specs[2];
      }
      if (imageName === item) {
        humanizedName = candidate[item];
        matchedString = item;
      } else if (imageName === '' && kernelName.endsWith(item) && item.length < matchedString.length) {
        humanizedName = candidate[item];
        matchedString = item;
      }
    });
    return humanizedName;
  }

  _initAliases() {
    for (const item in this.aliases) {
      if ({}.hasOwnProperty.call(this.aliases, item)) {
        this.aliases[this.aliases[item]] = item;
      }
    }
  }

  /**
   * Create a task in pipeline
   */
  _createTask() {
    const taskName = this.shadowRoot.querySelector('#task-name').value;
    const taskType = this.shadowRoot.querySelector('#task-type').value;
    const taskEnvironment = {
      kernel: this.shadowRoot.querySelector('#task-environment').value,
      version: this.shadowRoot.querySelector('#task-environment-tag').value
    };
    const taskResource = {
      cpu: this.shadowRoot.querySelector('#task-cpu').value,
      mem: this.shadowRoot.querySelector('#task-mem').value,
      shmem: this.shadowRoot.querySelector('#task-shmem').value,
      gpu: this.shadowRoot.querySelector('#task-gpu').value
    };
    const taskCommand = this.shadowRoot.querySelector('#command-editor').getValue();
    // TODO: Trigger custom event to add corresponding node into pipeline-flow pane.
    // detail: {name, inputs #, outputs #, pos_x, pos_y, class, data, html, typenode}
    const paneElement = this.shadowRoot.querySelector('pipeline-flow');
    const paneSize = paneElement.paneSize;
    const dummyNodeInfo = {
      name: taskName,
      inputs: 1,
      outputs: 1,
      pos_x: paneSize.width / 2 ,
      pos_y: paneSize.height / 3,
      class: 'new-task',
      data: {
        type: taskType,
        environment: taskEnvironment,
        resource: taskResource,
        cmd: taskCommand,
      },
      html: `${taskName}`, // put raw html code
    };
    const addTaskEvent = new CustomEvent("add-task", {'detail': dummyNodeInfo});
    document.dispatchEvent(addTaskEvent);
    this._hideDialogById('#task-dialog');
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

  _focusCmdEditor() {
    const cmdEditor = this.shadowRoot.querySelector('#command-editor');
    cmdEditor.refresh();
    cmdEditor.focus();
  }

  _clearCmdEditor() {
    const cmdEditor = this.shadowRoot.querySelector('#command-editor');
    cmdEditor.setValue('');
  }

  _loadDataToCmdEditor() {
    const cmdEditor = this.shadowRoot.querySelector('#command-editor');
    console.log(this.selectedNode.data)
    cmdEditor.setValue(this.selectedNode.data?.cmd ?? '');
  }

  _getCurrentFlowData() {
    const flowDataReqEvent = new CustomEvent('export-flow');
    document.dispatchEvent(flowDataReqEvent);
  }

  _showTaskCreateDialog() {
    this._clearCmdEditor();
    this._launchDialogById('#task-dialog')
  }

  _showTaskEditDialog() {
    this._loadDataToCmdEditor();
    this._launchDialogById('#task-dialog')
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
            <mwc-tab-bar id="pipeline-pane">
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
            <span id="pipeline-name"></span>
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
                <mwc-button outlined icon="edit" label="Edit Task" @click="${() => this._showTaskEditDialog()}"></mwc-button>
              ` : html`
                <mwc-button unelevated icon="add" label="New Task" @click="${() => this._showTaskCreateDialog()}"></mwc-button>
              `}
            </div>
          </div>
          <pipeline-flow isEditable></pipeline-flow>
        </div>
      </lablup-activity-panel>
      <backend-ai-dialog id="run-pipeline" fixed backdrop blockscrolling persistent>
        <span slot="title">Run Pipeline</span>
        <div slot="content"></div>
        <div slot="footer" class="horizontal layout end-justified flex">
          <mwc-button outlined label="Cancel" @click="${() => this._hideDialogById('#run-pipeline')}"></mwc-button>
          <mwc-button unelevated label="Proceed"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="edit-pipeline" fixed backdrop blockscrolling persistent>
        <span slot="title">Edit Pipeline</span>
        <div slot="content">
          <mwc-textfield id="edit-pipeline-name" label="Pipeline Name" value="${this.pipelineInfo.name}" required></mwc-textfield>
          <mwc-select class="full-width" id="edit-project" label="Project" fixedMenuPosition required>
            ${this.projectGroups.map((item) => {
              return html`<mwc-list-item id="${item}" value="${item}" ?selected="${item === this.pipelineInfo.project}">${item}</mwc-list-item>`
            })}
          </mwc-select>
        </div>
        <div slot="footer" class="horizontal layout end-justified flex">
          <mwc-button outlined label="Cancel" @click="${() => this._hideDialogById('#edit-pipeline')}"></mwc-button>
          <mwc-button unelevated label="Update" @click="${() => this._updatePipelineInfo()}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="task-dialog" fixed backdrop blockscrolling persistent narrowLayout>
        <span slot="title">${this.isNodeSelected ? "Edit Task" : "Add Task"}</span>
        <div slot="content" class="vertical layout center flex">
          <mwc-tab-bar class="task-tab">
            <mwc-tab title="task-settings" label="Settings" @click="${(e) => this._showTab(e.target, '.task-tab-content')}"></mwc-tab>
            <mwc-tab title="task-resources" label="Resources" @click="${(e) => this._showTab(e.target, '.task-tab-content')}"></mwc-tab>
            <mwc-tab title="task-command" label="Command" @MDCTab:interacted=${() => this._focusCmdEditor()} @click="${(e) => this._showTab(e.target, '.task-tab-content')}"></mwc-tab>
          </mwc-tab-bar>
          <div id="task-settings" class="vertical layout center flex task-tab-content">
            <mwc-textfield id="task-name" label="Task Name" value="${this.selectedNode?.name}" required></mwc-textfield>
            ${this.isNodeSelected ? html`
              <mwc-textfield id="task-type" label="Task Type" value="${this.selectedNode?.data?.type}" disabled></mwc-textfield>
            ` : html`
              <mwc-select class="full-width" id="task-type" label="Task Type" fixedMenuPosition required>
                ${this.taskType.map((item) => {
                  return html`<mwc-list-item id="${item}" value="${item}" ?selected="${item === 'Custom Task'}">${item}</mwc-list-item>`
                })}
              </mwc-select>
            `}
          </div>
          <div id="task-resources" class="vertical layout center flex task-tab-content" style="display:none;">
            <mwc-select class="full-width" id="task-environment" label="Task Environment" required fixedMenuPosition>
                ${this.languages.map((item) => html`
                  <mwc-list-item id="${item.name}" value="${item.name}" ?selected="${item.name === this.selectedNode?.environment?.kernel ?? this.defaultLanguage }">
                    <div class="horizontal justified center flex layout" style="width:325px;">
                      <div style="padding-right:5px;">${item.basename}</div>
                      <div class="horizontal layout end-justified center flex">
                          ${item.tags ? item.tags.map((item) => html`
                            <lablup-shields style="margin-left:5px;" description="${item}"></lablup-shields>
                          `) : ''}
                        </div>
                    </div>
                  </mwc-list-item>`
                )}
            </mwc-select>

            <mwc-select class="full-width" id="task-environment-tag" label="Version" required fixedMenuPosition>
              <mwc-list-item style="display:none"></mwc-list-item>
              ${this.isNodeSelected ? html`
                ${this.versions.map((item) => {
                  return html`
                  <mwc-list-item id="${item}" value="${item}"
                  ?selected="${item === this.selectedNode?.data?.environment?.version}">${item}</mwc-list-item>
                  `
                })}
              ` : html`
                  ${this.versions.map((item, idx) => html`
                    <mwc-list-item id="${item}" value="${item}"
                        ?selected="${idx === 0}">${item}</mwc-list-item>
                  `)}
              `}
            </mwc-select>
            <mwc-textfield id="task-cpu" label="CPU" type="number" value="${this.selectedNode.data?.resource?.cpu ?? 1}" min="1"></mwc-textfield>
            <mwc-textfield id="task-mem" label="Memory (GiB)" type="number" value="${this.selectedNode.data?.resource?.mem ?? 0}" min="0"></mwc-textfield>
            <mwc-textfield id="task-shmem" label="Shared Memory" type="number" value="${this.selectedNode.data?.resource?.shmem ?? 0.0125}" min="0.0125"></mwc-textfield>
            <mwc-textfield id="task-gpu" label="GPU" type="number" value="${this.selectedNode.data?.resource?.gpu ?? 0}" min="0"></mwc-textfield>
          </div>
          <div id="task-command" class="vertical layout center flex task-tab-content" style="display:none;">
            <lablup-codemirror id="command-editor" mode="shell"></lablup-codemirror>
          </div>
        </div>
        <div slot="footer" class="horizontal layout center center-justified flex">
          ${this.isNodeSelected ? html`
            <mwc-button outlined label="Cancel" @click="${() => this._hideDialogById('#task-dialog')}"></mwc-button>
            <mwc-button unelevated label="Update"></mwc-button>
          `: html`
            <mwc-button unelevated class="full-width" label="CREATE TASK" @click="${()=> this._createTask()}"></mwc-button>
          `}
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-view': PipelineView;
  }
}