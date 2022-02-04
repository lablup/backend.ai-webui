import { css, LitElement, html } from 'lit';
import { style } from 'drawflow/dist/drawflow.style';
import { DrawflowBaseStyle } from './drawflow-base-style.css';
import 'drawflow/dist/drawflow.min';

class DrawflowElement extends LitElement {
  static get styles() {
    return [
      style,
      DrawflowBaseStyle,
      css`
        #drawflow {
          display: inline-flex;
          position: relative;
          width: 100%;
          height: 800px;
        }
        
        #drawflow {
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
      `
    ];
  }

  render() {
    return html`
      <div id="drawflow"></div>
    `;
  }

  firstUpdated() {
    const container = this.shadowRoot?.getElementById('drawflow');
    const editor = new Drawflow(container);

    editor.reroute = true;
    editor.reroute_fix_curvature = true;

    editor.start();

    const data = {
      name: ''
    };

    // Example data
    /*
    editor.addNode('MNIST', 1, 1, 100, 200, 'foo', data, 'MNIST');
    editor.addNode('CNN_3conv2_FC_flatten_hidden_Adam', 1, 1, 400, 100, 'bar', data, 'CNN_3conv2_FC_flatten_hidden_Adam');
    editor.addNode('CNN_1conv_5x5_Adam', 1, 1, 400, 300, 'bar', data, 'CNN_1conv_5x5_Adam');

    editor.addConnection(1, 2, "output_1", "input_1");
    editor.addConnection(1, 3, "output_1", "input_1");

        var html = document.createElement("div");
    html.innerHTML =  "Hello Drawflow!!";
    editor.registerNode('test', html);
    Use
    editor.addNode('github', 0, 1, 150, 300, 'github', data, 'test', true);
    */
  }
}

customElements.define("drawflow-element", DrawflowElement);