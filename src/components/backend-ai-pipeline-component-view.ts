/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t} from 'lit-translate';
import {css, customElement, html, property} from 'lit-element';

import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select/mwc-select';

import {DataSet, Network} from "vis-network/standalone";

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
 Backend AI Pipeline Component View

 `backend-ai-pipeline-component-view` displays and controls pipeline components.

 @group Backend.AI Console
 @element backend-ai-pipeline-list
 */
@customElement('backend-ai-pipeline-component-view')
export default class BackendAIPipelineComponentView extends BackendAIPipelineCommon {
  // Elements
  @property({type: Object}) spinner = Object();
  // Pipeline components prpoerties
  @property({type: String}) pipelineSelectedName = '';
  @property({type: Object}) pipelineSelectedConfig = Object();
  @property({type: Array}) network = Object();
  @property({type: Array}) networkOptions = Object();
  @property({type: Object}) networkContainer = Object();
  @property({type: DataSet}) nodes;
  @property({type: DataSet}) edges;
  @property({type: Object}) nodeInfo;

  constructor() {
    super();
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this._initNetwork();
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

  _initNetwork() {
    this.networkOptions = {
      nodes: {
        // shape: 'custom',
        shape: 'box',
      },
      edges: {
        arrows: 'to',
      },
      interaction: {
        hover: true,
      }
    };

    this.nodes = new DataSet([
      {id: 1, label: "Node 1", ctxRenderer: this.ctxNodeRenderer},
      {id: 2, label: "Node 2", ctxRenderer: this.ctxNodeRenderer},
    ]);
    this.edges = new DataSet([
      {from: 1, to: 2},
    ]);

    // Create a network
    const data = {nodes: this.nodes, edges: this.edges};
    this.networkContainer = this.shadowRoot.querySelector('#component-network');
    this.network = new Network(this.networkContainer, data, this.networkOptions);

    // Event handling
    this.network.on('hoverNode', (e) => {
      console.log(e)
      console.log(this.nodeInfo[e.node]);
    })
  }

  async pipelineChanged() {
    const {nodes, edges} = await this._fetchPipelineComponents();
    this.nodes = new DataSet(nodes);
    this.edges = new DataSet(edges);
    const data = {nodes: this.nodes, edges: this.edges};
    this.network.setData(data);

    // Mapping component ID and its information
    const nodeInfo = {};
    nodes.forEach((node) => nodeInfo[node.id] = node);
    this.nodeInfo = nodeInfo;
    console.log(this.nodeInfo)
  }

  async _fetchPipelineComponents(folderName='') {
    if (folderName === '') {
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
      console.error(err)
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true);
    } finally {
      this.spinner.hide();
    }
  }

  ctxNodeRenderer({ctx, x, y, state: {selected, hover}, style}) {
    return {
      // bellow arrows
      // primarily meant for nodes and the labels inside of their boundaries
      drawNode() {
        const r = style.size;
        ctx.beginPath();
        const sides = 6;
        const a = (Math.PI * 2) / sides;
        ctx.moveTo(x , y + r);
        for (let i = 1; i < sides; i++) {
            ctx.lineTo(x + r * Math.sin(a * i), y + r * Math.cos(a * i));
        }
        ctx.closePath();
        ctx.save();
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.font = "normal 12px sans-serif";
        ctx.fillStyle = 'black';
      },
      // above arrows
      // primarily meant for labels outside of the node
      // drawExternalLabel() {
      //   ctx.drawSomeTextOutsideOfTheNode();
      // },
      // node dimensions defined by node drawing
      // nodeDimensions: { width, height },
    };
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
        #component-network {
          min-height: 500px;
        }
      `
    ];
  }

  render() {
    // language=HTML
    return html`
      <div class="card" elevation="0">
        <div id="component-network"></div>
      <!--
        <h3 class="horizontal center layout wrap">
        </h3>
        -->
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
