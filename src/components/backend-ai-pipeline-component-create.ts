/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

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
  @property({type: Array}) componentNodes;
  @property({type: Array}) componentEdges;
  @property({type: Array}) selectedNodes; // List of IDs of components

  constructor() {
    super();
    this.componentNodes = [];
    this.componentEdges = [];
    this.selectedNodes = [];
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
    if (typeof window.backendaiclient === 'undefined' || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', async () => {
        return;
      }, true);
    } else {
    }
  }

  /**
   * Set properties for a new component and open dialog.
   *
   * @param {String} pipelineName - Virtual folder name to add a new pipeline component.
   * @param {Array} nodes - current nodes information.
   * @param {Array} edges - current edge information.
   * @param {Array} selectedNodes - parent component IDs (add edges from this node, if exist).
   * */
  openComponentAddDialog(pipelineName, nodes, edges, selectedNodes) {
    if (!pipelineName || pipelineName === '') {
      this.notification.text = _text('pipeline.NoPipelineSelected');
      this.notification.show();
      return;
    }
    this.componentCreateMode = 'create';
    this.pipelineSelectedName = pipelineName;
    this.componentNodes = nodes;
    this.componentEdges = edges;
    this.selectedNodes = selectedNodes;
    this.shadowRoot.querySelector('#component-add-dialog').show();
  }

  /**
   * Set properties for updating component and open dialog.
   *
   * @param {String} pipelineName - Virtual folder name to update pipeline component.
   * @param {Array} nodes - current nodes information.
   * @param {Array} edges - current edge information.
   * @param {Object} cinfo - detailed information of the component to be updated.
   * */
  openComponentUpdateDialog(pipelineName, nodes, edges, cinfo) {
    if (!pipelineName || pipelineName === '') {
      this.notification.text = _text('pipeline.NoPipelineSelected');
      this.notification.show();
      return;
    }
    if (!cinfo) {
      this.notification.text = _text('pipeline.Component.NoComponentSelected');
      this.notification.show();
      return;
    }
    this.componentCreateMode = 'update';
    this.pipelineSelectedName = pipelineName;
    this.componentNodes = nodes;
    this.componentEdges = edges;
    this.selectedNodes = [cinfo.id];
    this._fillComponentAddDialogFields(cinfo);
    this.shadowRoot.querySelector('#component-add-dialog').show();
  }

  /**
   * Set properties for deleting component and open dialog
   *
   * @param {String} pipelineName - Virtual folder name to delete pipeline component.
   * @param {Array} nodes - current nodes information.
   * @param {Array} edges - current edge information.
   * @param {Array} selectedNodes - component Ids to delete
   * */
  openComponentDeleteDialog(pipelineName, nodes, edges, selectedNodes) {
    if (!pipelineName || pipelineName === '') {
      this.notification.text = _text('pipeline.NoPipelineSelected');
      this.notification.show();
      return;
    }
    if (!selectedNodes || selectedNodes.length < 1) {
      this.notification.text = _text('pipeline.Component.NoComponentSelected');
      this.notification.show();
      return;
    }
    this.pipelineSelectedName = pipelineName;
    this.componentNodes = nodes;
    this.componentEdges = edges;
    this.selectedNodes = selectedNodes;
    this.shadowRoot.querySelector('#component-delete-dialog').show();
  }

  _hideComponentAddDialog() {
    this.shadowRoot.querySelector('#component-add-dialog').hide();
  }

  _hideComponentDeleteDialog() {
    this.shadowRoot.querySelector('#component-delete-dialog').hide();
  }

  /**
   * Connect/disconnect two components.
   *
   * @param {String} pipelineName - Virtual folder name to delete pipeline component.
   * @param {Array} nodes - current nodes information.
   * @param {Array} edges - current edge information.
   * @param {Array} selectedNodes - component Ids to delete
   * */
  async connectTwoNodes(pipelineName, nodes, edges, selectedNodes) {
    if (selectedNodes.length !== 2) {
      this.notification.text = _text('pipeline.Component.NoComponentSelected');
      this.notification.show();
      return;
    }
    let index = -1;
    const nid0 = selectedNodes[0];
    const nid1 = selectedNodes[1];
    for (let i = 0; i < edges.length; i++) {
      if ((edges[i].from === nid0 && edges[i].to === nid1) ||
          (edges[i].from === nid1 && edges[i].to === nid0)) {
        index = i;
        break;
      }
    }
    if (index > 0) { // already connected. let's disconnect
      edges.splice(index, 1);
    } else { // make new connection
      edges.push({from: nid0, to: nid1});
    }
    const graph = {nodes: nodes, edges: edges};
    this.spinner.show();
    await this._uploadPipelineComponents(pipelineName, graph);
    this.spinner.hide();
    const event = new CustomEvent(
      'backend-ai-pipeline-component-connection-updated',
      {'detail': {nodes: graph.nodes, edges: graph.edges}},
    );
    this.dispatchEvent(event);
  }

  _fillComponentAddDialogFields(info) {
    if (!info) {
      info = {};
    }
    const dialog = this.shadowRoot.querySelector('#component-add-dialog');
    dialog.querySelector('#component-name').value = info.title || '';
    dialog.querySelector('#component-description').value = info.description || '';
    dialog.querySelector('#component-path').value = info.path || '';
    dialog.querySelector('#component-cpu').value = info.cpu || '1';
    dialog.querySelector('#component-mem').value = info.mem || '1';
    dialog.querySelector('#component-gpu').value = info.gpu || '0';
  }

  async _addComponent() {
    const title = this.shadowRoot.querySelector('#component-name').value;
    const description = this.shadowRoot.querySelector('#component-description').value;
    const path = this.shadowRoot.querySelector('#component-path').value;
    if (!title || !path) {
      this.notification.text = _text('pipeline.ComponentDialog.NamePathRequired');
      this.notification.show();
      return;
    }
    const sluggedPath = window.backendaiclient.slugify(path);
    const cpu = this.shadowRoot.querySelector('#component-cpu').value;
    const mem = this.shadowRoot.querySelector('#component-mem').value;
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
      id: '',
      title, label: title, description,
      path: sluggedPath,
      cpu, mem, gpu,
      executed: false,
    };
    if (this.componentCreateMode === 'create') {
      const cid = `component-${window.backendaiclient.generateSessionId(8, true)}`;
      cinfo.id = cid;
      // Create a component and an edge if there is a selected component (parent).
      this.componentNodes.push(cinfo);
      if (this.selectedNodes && this.selectedNodes.length > 0) {
        this.selectedNodes.forEach((nid) => {
          this.componentEdges.push({from: nid, to: cinfo.id});
        });
      }
    } else {
      cinfo.id = this.selectedNodes[0];
      for (let i = 0; i < this.componentNodes.length; i++) {
        if (cinfo.id === this.componentNodes[i].id) {
          this.componentNodes[i] = cinfo;
          break;
        }
      }
    }

    this.spinner.show();
    const graph = {nodes: this.componentNodes, edges: this.componentEdges};
    await this._uploadPipelineComponents(this.pipelineSelectedName, graph);
    this._hideComponentAddDialog();
    this._fillComponentAddDialogFields(null);
    this.spinner.hide();
    const eventName = this.componentCreateMode === 'create' ? 'backend-ai-pipeline-component-created' : 'backend-ai-pipeline-component-updated';
    const event = new CustomEvent(
      eventName, {'detail': {nodes: graph.nodes, edges: graph.edges}},
    );
    this.dispatchEvent(event);
  }

  async _deleteComponent() {
    this.selectedNodes.forEach((nid) => {
      for (let i = 0; i < this.componentNodes.length; i++) {
        if (nid === this.componentNodes[i].id) {
          this.componentNodes.splice(i, 1);
          break;
        }
      }
      const indexes: number[] = [];
      for (let i = 0; i < this.componentEdges.length; i++) {
        if (nid === this.componentEdges[i].from || nid == this.componentEdges[i].to) {
          indexes.push(i);
        }
      }
      if (indexes.length > 0) {
        for (let i = indexes.length - 1; i >= 0; i--) {
          this.componentEdges.splice(indexes[i], 1);
        }
      }
    });
    const graph = {nodes: this.componentNodes, edges: this.componentEdges};
    this.spinner.show();
    await this._uploadPipelineComponents(this.pipelineSelectedName, graph);
    this._hideComponentDeleteDialog();
    this.spinner.hide();
    const event = new CustomEvent(
      'backend-ai-pipeline-component-deleted',
      {'detail': {nodes: graph.nodes, edges: graph.edges}},
    );
    this.dispatchEvent(event);
  }

  async _uploadPipelineComponents(folderName, graph) {
    const blob = new Blob([JSON.stringify(graph, null, 2)], {type: 'application/json'});
    try {
      await this._uploadFile(this.pipelineComponentDetailPath, blob, folderName);
    } catch (err) {
      console.error(err);
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
          <mwc-textfield id="component-name" type="text" autofocus
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

      <backend-ai-dialog id="component-delete-dialog" fixed backdrop blockscrolling>
        <span slot="title">${_t('pipeline.ComponentDialog.DeleteTitle')}</span>
        <div slot="content" class="layout vertical">
          <p>${_t('session.CheckAgainDialog')}</p>
          <span>${this.selectedNodes && this.selectedNodes.length > 0 ? this.selectedNodes.join(' | ') : ''}</span>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <div class="flex"></div>
          <mwc-button label="${_t('button.Cancel')}"
              @click="${this._hideComponentDeleteDialog}"></mwc-button>
          <mwc-button unelevated
              label="${_t('button.Delete')}"
              @click="${this._deleteComponent}"></mwc-button>
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
