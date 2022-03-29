/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-icon-button-toggle';
import 'drawflow';
import {style} from 'drawflow/dist/drawflow.style';
import {DrawflowBaseStyle} from './drawflow-base-style.css';
import 'drawflow/dist/drawflow.min';
import {DrawflowNode} from 'drawflow';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../../plastics/layout/iron-flex-layout-classes';

/**
 Pipeline Flow

 `pipeline-flow` is a flow component used for node graph visualization

 Example:

 <pipeline-flow>
 ...
 </pipeline-flow>

@group Backend.AI pipeline
 @element pipeline-flow
*/

@customElement('pipeline-flow')
export default class PipelineFlow extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: Object}) editor;
  @property({type: Object}) data;
  @property({type: Boolean}) isEditable = false;
  @property({type: Object}) paneSize = {
    width: 0,
    height: 0
  };

  static get styles() {
    return [
      style,
      DrawflowBaseStyle,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      css`
        #drawflow {
          display: inline-flex;
          position: relative;
          width: 100%;
          height: var(--pane-height, 800px); // height of pipeline-flow pane
          background: var(--dfBackgroundColor);
          background-size: var(--dfBackgroundSize) var(--dfBackgroundSize);
          background-image: var(--dfBackgroundImage);
        }
        
        .drawflow .drawflow-node {
          display: var(--dfNodeType);
          background: var(--dfNodeBackgroundColor);
          color: var(--dfNodeTextColor);
          border: var(--dfNodeBorderSize)  solid var(--dfNodeBorderColor);
          border-radius: var(--dfNodeBorderRadius);
          min-height: var(--dfNodeMinHeight);
          width: auto;
          min-width: var(--dfNodeMinWidth);
          padding-top: var(--dfNodePaddingTop);
          padding-bottom: var(--dfNodePaddingBottom);
          -webkit-box-shadow: var(--dfNodeBoxShadowHL) var(--dfNodeBoxShadowVL) var(--dfNodeBoxShadowBR) var(--dfNodeBoxShadowS) var(--dfNodeBoxShadowColor);
          box-shadow:  var(--dfNodeBoxShadowHL) var(--dfNodeBoxShadowVL) var(--dfNodeBoxShadowBR) var(--dfNodeBoxShadowS) var(--dfNodeBoxShadowColor);
        }
        
        .drawflow .drawflow-node:hover {
          background: var(--dfNodeHoverBackgroundColor);
          color: var(--dfNodeHoverTextColor);
          border: var(--dfNodeHoverBorderSize)  solid var(--dfNodeHoverBorderColor);
          border-radius: var(--dfNodeHoverBorderRadius);
          -webkit-box-shadow: var(--dfNodeHoverBoxShadowHL) var(--dfNodeHoverBoxShadowVL) var(--dfNodeHoverBoxShadowBR) var(--dfNodeHoverBoxShadowS) var(--dfNodeHoverBoxShadowColor);
          box-shadow:  var(--dfNodeHoverBoxShadowHL) var(--dfNodeHoverBoxShadowVL) var(--dfNodeHoverBoxShadowBR) var(--dfNodeHoverBoxShadowS) var(--dfNodeHoverBoxShadowColor);
        }
        
        .drawflow .drawflow-node.selected {
          background: var(--dfNodeSelectedBackgroundColor);
          color: var(--dfNodeSelectedTextColor);
          border: var(--dfNodeSelectedBorderSize)  solid var(--dfNodeSelectedBorderColor);
          border-radius: var(--dfNodeSelectedBorderRadius);
          -webkit-box-shadow: var(--dfNodeSelectedBoxShadowHL) var(--dfNodeSelectedBoxShadowVL) var(--dfNodeSelectedBoxShadowBR) var(--dfNodeSelectedBoxShadowS) var(--dfNodeSelectedBoxShadowColor);
          box-shadow:  var(--dfNodeSelectedBoxShadowHL) var(--dfNodeSelectedBoxShadowVL) var(--dfNodeSelectedBoxShadowBR) var(--dfNodeSelectedBoxShadowS) var(--dfNodeSelectedBoxShadowColor);
        }
        
        .drawflow .drawflow-node .input {
          left: var(--dfInputLeft);
          background: var(--dfInputBackgroundColor);
          border: var(--dfInputBorderSize)  solid var(--dfInputBorderColor);
          border-radius: var(--dfInputBorderRadius);
          height: var(--dfInputHeight);
          width: var(--dfInputWidth);
        }
        
        .drawflow .drawflow-node .input:hover {
          background: var(--dfInputHoverBackgroundColor);
          border: var(--dfInputHoverBorderSize)  solid var(--dfInputHoverBorderColor);
          border-radius: var(--dfInputHoverBorderRadius);
        }
        
        .drawflow .drawflow-node .outputs {
          float: var(--dfNodeTypeFloat);
        }
        
        .drawflow .drawflow-node .output {
          right: var(--dfOutputRight);
          background: var(--dfOutputBackgroundColor);
          border: var(--dfOutputBorderSize)  solid var(--dfOutputBorderColor);
          border-radius: var(--dfOutputBorderRadius);
          height: var(--dfOutputHeight);
          width: var(--dfOutputWidth);
        }
        
        .drawflow .drawflow-node .output:hover {
          background: var(--dfOutputHoverBackgroundColor);
          border: var(--dfOutputHoverBorderSize)  solid var(--dfOutputHoverBorderColor);
          border-radius: var(--dfOutputHoverBorderRadius);
        }
        
        .drawflow .connection .main-path {
          stroke-width: var(--dfLineWidth);
          stroke: var(--dfLineColor);
        }
        
        .drawflow .connection .main-path:hover {
          stroke: var(--dfLineHoverColor);
        }
        
        .drawflow .connection .main-path.selected {
          stroke: var(--dfLineSelectedColor);
        }
        
        .drawflow .connection .point {
          stroke: var(--dfRerouteBorderColor);
          stroke-width: var(--dfRerouteBorderWidth);
          fill: var(--dfRerouteBackgroundColor);
        }
        
        .drawflow .connection .point:hover {
          stroke: var(--dfRerouteHoverBorderColor);
          stroke-width: var(--dfRerouteHoverBorderWidth);
          fill: var(--dfRerouteHoverBackgroundColor);
        }
        
        .drawflow-delete {
          display: var(--dfDeleteDisplay);
          color: var(--dfDeleteColor);
          background: var(--dfDeleteBackgroundColor);
          border: var(--dfDeleteBorderSize) solid var(--dfDeleteBorderColor);
          border-radius: var(--dfDeleteBorderRadius);
        }
        
        .parent-node .drawflow-delete {
          top: var(--dfDeleteTop);
        }
        
        .drawflow-delete:hover {
          color: var(--dfDeleteHoverColor);
          background: var(--dfDeleteHoverBackgroundColor);
          border: var(--dfDeleteHoverBorderSize) solid var(--dfDeleteHoverBorderColor);
          border-radius: var(--dfDeleteHoverBorderRadius);
        }

        mwc-icon-button,
        mwc-icon-button-toggle {
          color: white;
          --mdc-icon-size: 36px;
        }

        .pane-options {
          margin: 5px 10px;
          background: #555555;
          border-radius: 10px;
          border-right: 1px solid var(--border-color);
          z-index: 5;
        }
      `
    ];
  }

  constructor() {
    super();
  }

  firstUpdated() {
    const parentDrawflowElement: HTMLElement = this.shadowRoot?.getElementById('drawflow')!;
    this.editor = new Drawflow(parentDrawflowElement);
    this.editor.start();

    this.data = {};

    document.addEventListener('add-task', (e: any) => {
      const isEditorMode = this.editor.editor_mode === 'edit';
      if (e.detail && isEditorMode) {
        this._addNode(e.detail);
      }
    });

    document.addEventListener('update-task', (e: any) => {
      const isEditorMode = this.editor.editor_mode === 'edit';
      if (e.detail && isEditorMode) {
        this._updateNode(e.detail.nodeId, e.detail.data);
      }
    });

    document.addEventListener('remove-task', (e: any) => {
      if (e.detail) {
        this._removeNode(e.detail);
      }
    });

    document.addEventListener('import-flow', (e: any) => {
      if (e.detail) {
        const data: object = e.detail;
        if (Object.keys(data).length > 0) {
          this.editor.import(data);
        } else {
          // clear editor when saved data is empty
          this.editor.clear();
        }
      }
    });

    document.addEventListener('export-flow', () => {
      const data = this.editor.export();
      const exportFlowEvent = new CustomEvent('flow-response', {'detail': data});
      document.dispatchEvent(exportFlowEvent);
    });

    // measure pane size when event triggered
    const paneResizeObserver = new ResizeObserver(() => {
      this.paneSize = {
        width: this.editor.precanvas.clientWidth,
        height: this.editor.precanvas.clientHeight
      };
    });

    paneResizeObserver.observe(this.editor.precanvas);

    this.editor.on('nodeSelected', (nodeId: any) => {
      const nodeInfo: DrawflowNode = this.editor.getNodeFromId(nodeId);
      const nodeSelectedEvent = new CustomEvent('node-selected', {'detail': nodeInfo});
      document.dispatchEvent(nodeSelectedEvent);
    });

    this.editor.on('nodeUnselected', () => {
      const nodeUnselectedEvent = new CustomEvent('node-unselected', {'detail': false});
      document.dispatchEvent(nodeUnselectedEvent);
    });
    // Example data
    // this.editor.addNode('MNIST', 1, 1, 100, 200, 'foo', this.data, 'MNIST');
    // this.editor.addNode('CNN_3conv2_FC_flatten_hidden_Adam', 1, 1, 400, 100, 'bar', this.data, 'CNN_3conv2_FC_flatten_hidden_Adam');
    // this.editor.addNode('CNN_1conv_5x5_Adam', 1, 1, 400, 300, 'bar', this.data, 'CNN_1conv_5x5_Adam');

    // this.editor.addConnection(1, 2, "output_1", "input_1");
    // this.editor.addConnection(1, 3, "output_1", "input_1");
  }

  render() {
    // language=HTML
    return html`
      <div class="vertical layout center flex">
        <div id="drawflow"></div>
      </div>
      <div class="horizontal layout center end-justified flex">
        <div class="pane-options">
          <mwc-icon-button-toggle ?on="${this.isEditable}" onIcon="lock_open" offIcon="lock" @click="${this._togglePaneMode}"></mwc-icon-button-toggle>
        </div>
        <div class="pane-options">
          <mwc-icon-button icon="zoom_out" @click="${this._zoomOutPane}}"></mwc-icon-button>
          <mwc-icon-button icon="search" @click="${this._resetZoom}"></mwc-icon-button>
          <mwc-icon-button icon="zoom_in" @click="${this._zoomInPane}"></mwc-icon-button>
        </div>
      </div>
    `;
  }


  /**
   * Add node into pane
   *
   * @param {DrawflowNode} nodeInfo
   */
  _addNode(nodeInfo: DrawflowNode) {
    this.editor.addNode(nodeInfo.name, nodeInfo.inputs, nodeInfo.outputs,
      nodeInfo.pos_x, nodeInfo.pos_y, nodeInfo.class, nodeInfo.data, nodeInfo.html);
  }

  /**
   * Update node according to data
   *
   * @param {number} id
   * @param {DrawflowNode} nodeInfo
   */
  _updateNode(id: number, nodeInfo: DrawflowNode) {
    const moduleName = this.editor.getModuleFromNodeId(id);
    const node = this.editor.drawflow.drawflow[moduleName].data[id];
    // partially modify data
    Object.assign(node, {
      data: nodeInfo.data,
      html: nodeInfo.html,
      name: nodeInfo.name});
    // monkeypatch: manually update node name
    const nodeElem = this.shadowRoot.querySelector(`.${nodeInfo.class}.selected`);
    const titleElement = [...nodeElem.children].find((elem) => elem.className === 'drawflow_content_node');
    titleElement.innerHTML = nodeInfo.html;
  }

  /**
   * Remove node from pane
   *
   * @param {number} id
   */
  _removeNode(id: number) {
    // NOTE: every node element id starts with 'node-'
    const nodeId = `node-${id}`;
    this.editor.removeNodeId(nodeId);
  }

  /**
   * Zoom in 10% from current pane
   *
   */
  _zoomInPane() {
    this.editor.zoom_in();
  }

  /**
   * Zoom out 10% from current pane
   */
  _zoomOutPane() {
    this.editor.zoom_out();
  }

  /**
   * Reset Zoom amount to default status
   */
  _resetZoom() {
    this.editor.zoom_reset();
  }

  /**
   * Toggle Pane Mode into two option
   */
  _togglePaneMode() {
    if (this.isEditable) {
      this.editor.editor_mode = this.editor.editor_mode === 'edit' ? 'fixed' : 'edit';
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-flow': PipelineFlow;
  }
}
