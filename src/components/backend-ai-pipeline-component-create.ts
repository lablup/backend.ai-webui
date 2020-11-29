/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, customElement, html, property} from 'lit-element';

import '@material/mwc-button/mwc-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-menu/mwc-menu';
import '@material/mwc-select/mwc-select';
import '@material/mwc-textfield/mwc-textfield';

import 'weightless/card';
import {BackendAiStyles} from './backend-ai-general-styles';

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAIPipelineCommon} from './backend-ai-pipeline-common';

/**
 Backend AI Pipeline Component Create

 `backend-ai-pipeline-component-create` creates/updates/deletes pipeline component.

 @group Backend.AI Console
 @element backend-ai-pipeline-component-create
 */
@customElement('backend-ai-pipeline-component-create')
export default class BackendAIPipelineComponentCreate extends BackendAIPipelineCommon {
  // Elements
  @property({type: Object}) spinner = Object();
  @property({type: Object}) notification = Object();
  // Pipeline components prpoerties
  @property({type: String}) pipelineSelectedName = '';
  @property({type: String}) componentCreateMode = 'create';
  @property({type: Array}) componentNodes = Array();
  @property({type: Array}) componentEdges = Array();
  @property({type: String}) selectedNode = '';

  constructor() {
    super();
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    if (typeof window.backendaiclient === "undefined" || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', async () => {
      }, true);
    } else {
    }
  }

  openComponentAddDialog(pipelineName, nodes, edges, selectedNode) {
    if (!pipelineName || pipelineName === '') {
      this.notification.text = _text('pipeline.NoPipelineSelected');
      this.notification.show();
      return;
    }
    this.componentCreateMode = 'create';
    this.pipelineSelectedName = pipelineName;
    this.componentNodes = nodes;
    this.componentEdges = edges;
    this.selectedNode = selectedNode;
    this._fillComponentAddDialogFields(null);
    this.shadowRoot.querySelector('#component-add-dialog').show();
  }

  openComponentUpdateDialog(info, idx) {
    this.componentCreateMode = 'update';
    this.selectedComponentIndex = idx;
    this._fillComponentAddDialogFields(info);
    this.shadowRoot.querySelector('#component-add-dialog').show();
  }

  openComponentDeleteDialog(idx) {
    this.selectedComponentIndex = idx;
    this.shadowRoot.querySelector('#component-delete-dialog').show();
  }

  _hideComponentAddDialog() {
    this.shadowRoot.querySelector('#component-add-dialog').hide();
  }

  _hideComponentDeleteDialog() {
    this.shadowRoot.querySelector('#component-delete-dialog').hide();
  }

  _fillComponentAddDialogFields(info) {
    if (!info) {
      info = {};
    }
    const dialog = this.shadowRoot.querySelector('#component-add-dialog');
    dialog.querySelector('#component-title').value = info.title || '';
    dialog.querySelector('#component-description').value = info.description || '';
    dialog.querySelector('#component-path').value = info.path || '';
    dialog.querySelector('#component-cpu').value = info.cpu || '1';
    dialog.querySelector('#component-mem').value = info.mem || '1';
    dialog.querySelector('#component-gpu').value = info.gpu || '0';
  }

  async _addComponent() {
    const id = `component-${window.backendaiclient.generateSessionId(8, true)}`;
    const title = this.shadowRoot.querySelector('#component-title').value;
    const description = this.shadowRoot.querySelector('#component-description').value;
    const path = this.shadowRoot.querySelector('#component-path').value;
    if (!title || !path) {
      this.notification.text = _text('pipeline.ComponentDialog.NamePathRequired');
      this.notification.show();
      return;
    }
    const sluggedPath = window.backendaiclient.slugify(path);
    let cpu = this.shadowRoot.querySelector('#component-cpu').value;
    let mem = this.shadowRoot.querySelector('#component-mem').value;
    let gpu = this.shadowRoot.querySelector('#component-gpu').value;
    if (cpu < 1) {
      this.notification.text = _text('pipeline.ComponentDialog.CPUNotEnough');
      this.notification.show();
      return;
    }
    if (mem < 0.1) {
      this.notification.text = _text('pipeline.ComponentDialog.MemoryNotEnough');
      this.notification.show();
      return;
    }
    if (!gpu) {
      gpu = 0;
    }

    const cinfo = {
      id,
      title, label: title, description,
      path: sluggedPath,
      cpu, mem, gpu,
      executed: false,
    };
    if (this.componentCreateMode === 'create') {
      // Create a component and an edge if there is a selected component (parent).
      this.componentNodes.push(cinfo)
      if (this.selectedNode && this.selectedNode !== '') {
        this.componentEdges.push({
          from: this.selectedNode,
          to: cinfo.id,
        });
      }
    } else {
      // if (this.selectedComponentIndex < 0) {
      //   this.notification.text = 'Invalid component';
      //   this.notification.show();
      //   return;
      // }
      // this.pipelineComponents[this.selectedComponentIndex] = cinfo;
      // this.selectedComponentIndex = -1;
    }

    this.spinner.show();
    const graph = {nodes: this.componentNodes, edges: this.componentEdges};
    console.log(this.componentNodes)
    console.log(this.componentEdges)
    await this._uploadPipelineComponents(this.pipelineSelectedName, graph);
    this._hideComponentAddDialog();
    this.spinner.hide();
    const event = new CustomEvent(
      'backend-ai-pipeline-component-created',
      {'detail': {nodes: graph.nodes, edges: graph.edges}},
    );
    this.dispatchEvent(event);
  }

  async _uploadPipelineComponents(folderName, graph) {
    const blob = new Blob([JSON.stringify(graph, null, 2)], {type: 'application/json'});
    try {
      await this._uploadFile(this.pipelineComponentDetailPath, blob, folderName);
    } catch (err) {
      console.error(err)
      this.spinner.hide();
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true);
    }
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        mwc-textfield {
          width: 100%;
          --mdc-text-field-idle-line-color: rgba(0, 0, 0, 0.42);
          --mdc-text-field-hover-line-color: rgba(0, 0, 255, 0.87);
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--paper-blue-600);
        }
      `
    ];
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-dialog id="component-add-dialog" fixed backdrop>
        <span slot="title">
          ${this.componentCreateMode === 'create' ? _t('pipeline.ComponentDialog.CreateTitle') : _t('pipeline.ComponentDialog.UpdateTitle')}
        </span>
        <div slot="content" class="layout verticlal" style="width:450px">
          <mwc-textfield id="component-title" type="text" autofocus
              label="${_t('pipeline.ComponentDialog.Name')}" maxLength="30"></mwc-textfield>
          <mwc-textfield id="component-description" type="text"
              label="${_t('pipeline.ComponentDialog.Description')}" maxLength="200"></mwc-textfield>
          <mwc-textfield id="component-path" type="text"
              label="${_t('pipeline.ComponentDialog.PathInFolder')}" maxLength="300"></mwc-textfield>
          <div class="layout horizontal">
            <mwc-textfield id="component-cpu" label="CPU" type="number" value="1" min="1"></mwc-textfield>
            <mwc-textfield id="component-mem" label="Memory (GiB)" type="number" value="1" min="0"></mwc-textfield>
            <mwc-textfield id="component-gpu" label="GPU" type="number" value="0" min="0"></mwc-textfield>
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <div class="flex"></div>
          <mwc-button label="${_t('button.Cancel')}"
              @click="${this._hideComponentAddDialog}"></mwc-button>
          <mwc-button unelevated
              label="${this.componentCreateMode === 'create' ? _t('button.Add') : _t('button.Update')}"
              @click="${this._addComponent}"></mwc-button>
        </div>
      </backend-ai-dialog>

      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-pipeline-component-create': BackendAIPipelineComponentCreate;
  }
}
