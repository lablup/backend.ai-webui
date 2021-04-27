/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators';

import '@material/mwc-button/mwc-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select/mwc-select';

import {Network} from 'vis-network/standalone';

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
import './backend-ai-pipeline-component-create';
import './backend-ai-pipeline-runner';

/**
 Backend AI Pipeline Component View

 `backend-ai-pipeline-component-view` displays and controls pipeline components.

 @group Backend.AI Console
 @element backend-ai-pipeline-component-view
 */
@customElement('backend-ai-pipeline-component-view')
export default class BackendAIPipelineComponentView extends BackendAIPipelineCommon {
  // Elements
  @property({type: Object}) spinner = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) componentCreate = Object();
  @property({type: Object}) pipelineRunner = Object();
  // Pipeline components prpoerties
  @property({type: String}) pipelineSelectedName = '';
  @property({type: Object}) pipelineSelectedConfig = Object();
  @property({type: Array}) network = Object();
  @property({type: Array}) networkOptions = Object();
  @property({type: Object}) networkContainer = Object();
  @property({type: Array}) nodes = [];
  @property({type: Array}) edges = [];
  @property({type: Object}) nodeInfo = Object();
  @property({type: Array}) componentsSelected = [];

  constructor() {
    super();

    // Network parameter initialization
    this.networkOptions = {
      nodes: {
        // shape: 'custom',
        borderWidth: 2,
        shape: 'box',
        color: {
          border: 'lightgray',
          background: 'white',
          highlight: {
            border: 'lightgray',
            background: 'lightblue',
          },
          hover: {
            border: 'lightgray',
            background: 'lightblue',
          },
        },
      },
      edges: {
        arrows: 'to',
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'vertical',
        },
        color: 'lightgray',
      },
      layout: {
        hierarchical: {
          direction: 'UD',
          levelSeparation: 60,
          // treeSpacing: 100,
          // nodeSpacing: 50,
          sortMethod: 'directed',
        },
      },
      interaction: {
        hover: true,
        multiselect: true,
        // dragNodes: false,
      },
      physics: {
        // enabled: false,
      }
    };
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    this.componentCreate = this.shadowRoot.querySelector('backend-ai-pipeline-component-create');
    this.pipelineRunner = this.shadowRoot.querySelector('backend-ai-pipeline-runner');
    this._initEventHandlers();
    this._initNetwork();
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

  _initEventHandlers() {
    const _updateNetwork = (e) => {
      e.stopPropagation();
      this.nodes = e.detail.nodes.slice();
      this.edges = e.detail.edges.slice();
      this.network.setData({nodes: this.nodes, edges: this.edges});
    };
    this.componentCreate.addEventListener('backend-ai-pipeline-component-created', (e) => {
      _updateNetwork(e);
    });
    this.componentCreate.addEventListener('backend-ai-pipeline-component-updated', (e) => {
      _updateNetwork(e);
    });
    this.componentCreate.addEventListener('backend-ai-pipeline-component-deleted', (e) => {
      _updateNetwork(e);
    });
    this.componentCreate.addEventListener('backend-ai-pipeline-component-connection-updated', (e) => {
      _updateNetwork(e);
    });
  }

  _initNetwork() {
    const data = {nodes: this.nodes, edges: this.edges};
    this.networkContainer = this.shadowRoot.querySelector('#component-network');
    this.network = new Network(this.networkContainer, data, this.networkOptions);

    // Event handling
    // ``deselectNode`` event is not triggered when node is deselected.
    // So, we just use ``click`` event to get selected nodes.
    this.network.on('click', (params) => {
      this.componentsSelected = params.nodes;
    });

    this.network.on('doubleClick', (params) => {
      if (params.nodes.length === 1) {
        this._editComponentCode();
      }
    });

    // this.network.on('hoverNode', (e) => {
    //   const node = this.network.getNodeAt(e.pointer.DOM);
    //   const info = this.nodeInfo[e.node];
    //   info.title = JSON.stringify(info);
    //   this.network.body.data.nodes.update(info);
    // });
  }

  /**
   * Update network.
   * */
  async pipelineChanged() {
    const {nodes, edges} = await this._fetchPipelineComponents();
    this.nodes = nodes || [];
    this.edges = edges || [];
    this.network.setData({nodes, edges});

    // Mapping component ID and its information
    const nodeInfo = {};
    this.nodes.forEach((node: Record<string, number>) => nodeInfo[node.id] = node);
    this.nodeInfo = nodeInfo;
  }

  /**
   * Fetch pipeline component information.
   *
   * @param {String} folderName - Virtual folder name to fetch pipeline component.
   * */
  async _fetchPipelineComponents(folderName='') {
    if (folderName === '' || !folderName) {
      folderName = this.pipelineSelectedName;
    }
    try {
      this.spinner.show();
      const res = await window.backendaiclient.vfolder.download(
        this.pipelineComponentDetailPath, folderName, false, true
      );
      const config = await res.json();
      return config;
    } catch (err) {
      console.error(err);
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true);
    } finally {
      this.spinner.hide();
    }
  }

  _openComponentAddDialog() {
    let selectedNodes: any = null;
    if (this.componentsSelected.length > 0) {
      selectedNodes = this.componentsSelected;
    }
    this.componentCreate.openComponentAddDialog(
      this.pipelineSelectedName, this.nodes.slice(), this.edges.slice(), selectedNodes,
    );
  }

  _openComponentUpdateDialog() {
    if (this.componentsSelected.length !== 1) {
      this.notification.text = _text('pipeline.Component.NoComponentSelected');
      this.notification.show();
      return;
    }
    const selectedNode = this.componentsSelected[0];
    const nodeInfo = this.network.body.data.nodes.get(selectedNode);
    this.componentCreate.openComponentUpdateDialog(
      this.pipelineSelectedName, this.nodes.slice(), this.edges.slice(), nodeInfo,
    );
  }

  _openComponentDeleteDialog() {
    if (this.componentsSelected.length < 1) {
      this.notification.text = _text('pipeline.Component.NoComponentSelected');
      this.notification.show();
      return;
    }
    const selectedNodes = this.componentsSelected.slice();
    this.componentCreate.openComponentDeleteDialog(
      this.pipelineSelectedName, this.nodes.slice(), this.edges.slice(), selectedNodes,
    );
  }

  _connectTwoComponents() {
    if (this.componentsSelected.length !== 2) {
      this.notification.text = _text('pipeline.Component.NoComponentSelected');
      this.notification.show();
      return;
    }
    const selectedNodes = this.componentsSelected.slice();
    this.componentCreate.connectTwoNodes(
      this.pipelineSelectedName, this.nodes.slice(), this.edges.slice(), selectedNodes,
    );
  }

  _editComponentCode() {
    if (this.componentsSelected.length !== 1) {
      this.notification.text = _text('pipeline.Component.NoComponentSelected');
      this.notification.show();
      return;
    }
    const selectedNode = this.componentsSelected[0];
    const nodeInfo = this.network.body.data.nodes.get(selectedNode);
    this.pipelineRunner.editCode(this.pipelineSelectedName, nodeInfo);
  }

  _runPipeline() {
    // TODO: fix this function.
    return;
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
        #component-network {
          // min-height: 500px;
        }
      `
    ];
  }

  render() {
    // language=HTML
    return html`
      <div class="card" elevation="0">
        <div class="layout horizontal center wrap" style="margin:0.2em">
          <mwc-button dense outlined id="add-component-btn" icon="add"
              label="${_t('button.Add')}" @click="${() => this._openComponentAddDialog()}">
          </mwc-button>
          ${this.componentsSelected.length === 1 ? html`
            <mwc-button dense outlined id="update-component-btn" icon="edit"
                label="${_t('button.Edit')}" @click="${() => this._openComponentUpdateDialog()}">
            </mwc-button>
          ` : html``}
          ${this.componentsSelected.length > 0 ? html`
            <mwc-button dense outlined id="delete-component-btn" icon="delete"
                label="${_t('button.Delete')}" @click="${() => this._openComponentDeleteDialog()}">
            </mwc-button>
          ` : html``}
          ${this.componentsSelected.length === 2 ? html`
            <mwc-button dense outlined id="connect-component-btn" icon="trending_up"
                label="${_t('pipeline.Component.Connect')}" @click="${() => this._connectTwoComponents()}">
            </mwc-button>
          ` : html``}
          <span class="flex"></span>
          <mwc-button dense raised id="run-pipeline-btn" icon="play_arrow"
              label="${_t('pipeline.RunPipeline')}" @click="${() => this._runPipeline()}">
          </mwc-button>
        </div>
        <backend-ai-pipeline-component-create ?active="${this.active}"></backend-ai-pipeline-component-create>
        <backend-ai-pipeline-runner ?active="${this.active}"></backend-ai-pipeline-runner>
        <div id="component-network"></div>
      </div>

      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-pipeline-component-view': BackendAIPipelineComponentView;
  }
}
