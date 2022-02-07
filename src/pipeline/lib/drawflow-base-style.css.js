import {css} from 'lit';

export const DrawflowBaseStyle = css`
:host {

    /* Custom variable definition used for drawflow theming */
    --dfBackgroundColor: #ffffff;
    --dfBackgroundSize: 15px;
    --dfBackgroundImage: radial-gradient(rgba(232, 232, 232, 1) 1px, transparent 1px);

  
    --dfNodeType: flex;
    --dfNodeTypeFloat: none;
    --dfNodeBackgroundColor: rgba(255, 255, 255, 1);
    --dfNodeTextColor: rgba(0, 0, 0, 1);
    --dfNodeBorderSize: 1px;
    --dfNodeBorderColor: rgba(163, 163, 163, 1);
    --dfNodeBorderRadius: 10px;
    --dfNodeMinHeight: 40px;
    --dfNodeMinWidth: 160px;
    --dfNodePaddingTop: 15px;
    --dfNodePaddingBottom: 15px;
    --dfNodeBoxShadowHL: 0px;
    --dfNodeBoxShadowVL: 2px;
    --dfNodeBoxShadowBR: 23px;
    --dfNodeBoxShadowS: 0px;
    --dfNodeBoxShadowColor: rgba(177, 177, 177, 1);
  
    --dfNodeHoverBackgroundColor: rgba(55, 178, 118, 0.78);
    --dfNodeHoverTextColor: rgba(255, 255, 255, 1);
    --dfNodeHoverBorderSize: 1px;
    --dfNodeHoverBorderColor: rgba(163, 163, 163, 1);
    --dfNodeHoverBorderRadius: 10px;
  
    --dfNodeHoverBoxShadowHL: 0px;
    --dfNodeHoverBoxShadowVL: 2px;
    --dfNodeHoverBoxShadowBR: 15px;
    --dfNodeHoverBoxShadowS: 0px;
    --dfNodeHoverBoxShadowColor: rgba(177, 177, 177, 1);
  
    --dfNodeSelectedBackgroundColor: rgba(55, 178, 118, 0.78);
    --dfNodeSelectedTextColor: rgba(255, 255, 255, 1);
    --dfNodeSelectedBorderSize: 1px;
    --dfNodeSelectedBorderColor: rgba(163, 163, 163, 1);
    --dfNodeSelectedBorderRadius: 10px;
  
    --dfNodeSelectedBoxShadowHL: 0px;
    --dfNodeSelectedBoxShadowVL: 2px;
    --dfNodeSelectedBoxShadowBR: 15px;
    --dfNodeSelectedBoxShadowS: 2px;
    --dfNodeSelectedBoxShadowColor: rgba(177, 177, 177, 1);
  
    --dfInputBackgroundColor: rgba(205, 205, 205, 1);
    --dfInputBorderSize: 3px;
    --dfInputBorderColor: rgba(255, 255, 255, 1);
    --dfInputBorderRadius: 15px;
    --dfInputLeft: -27px;
    --dfInputHeight: 15px;
    --dfInputWidth: 15px;
  
    --dfInputHoverBackgroundColor: #ffffff;
    --dfInputHoverBorderSize: 3px;
    --dfInputHoverBorderColor: #000000;
    --dfInputHoverBorderRadius: 15px;
  
    --dfOutputBackgroundColor: rgba(205, 205, 205, 1);
    --dfOutputBorderSize: 3px;
    --dfOutputBorderColor: rgba(255, 255, 255, 1);
    --dfOutputBorderRadius: 15px;
    --dfOutputRight: -3px;
    --dfOutputHeight: 15px;
    --dfOutputWidth: 15px;
  
    --dfOutputHoverBackgroundColor: rgba(255, 255, 255, 1);
    --dfOutputHoverBorderSize: 3px;
    --dfOutputHoverBorderColor: rgba(0, 0, 0, 1);
    --dfOutputHoverBorderRadius: 15px;
  
    --dfLineWidth: 3px;
    --dfLineColor: rgba(143, 143, 143, 1);
    --dfLineHoverColor: #4682b4;
    --dfLineSelectedColor: #43b993;
  
    --dfRerouteBorderWidth: 2px;
    --dfRerouteBorderColor: #000000;
    --dfRerouteBackgroundColor: #ffffff;
  
    --dfRerouteHoverBorderWidth: 2px;
    --dfRerouteHoverBorderColor: #000000;
    --dfRerouteHoverBackgroundColor: #ffffff;
  
    --dfDeleteDisplay: none;
    --dfDeleteColor: #ffffff;
    --dfDeleteBackgroundColor: #000000;
    --dfDeleteBorderSize: 3px;
    --dfDeleteBorderColor: #ffffff;
    --dfDeleteBorderRadius: 50px;
    --dfDeleteTop: -15px;
  
    --dfDeleteHoverColor: #000000;
    --dfDeleteHoverBackgroundColor: #ffffff;
    --dfDeleteHoverBorderSize: 2px;
    --dfDeleteHoverBorderColor: #000000;
    --dfDeleteHoverBorderRadius: 50px;
}


  /* Basic style for drawflow */
  .drawflow,
  .drawflow .parent-node {
      position: relative
  }
  
  .parent-drawflow {
      display: flex;
      overflow: hidden;
      touch-action: none;
      outline: 0
  }
  
  .drawflow {
      width: 100%;
      height: 100%;
      user-select: none;
      perspective: 0
  }
  
  .drawflow .drawflow-node {
      display: flex;
      align-items: center;
      position: absolute;
      background: #0ff;
      width: 160px;
      min-height: 40px;
      border-radius: 4px;
      border: 2px solid #000;
      color: #000;
      z-index: 2;
      padding: 15px
  }
  
  .drawflow .drawflow-node.selected {
      background: red
  }
  
  .drawflow .drawflow-node:hover {
      cursor: move
  }
  
  .drawflow .drawflow-node .inputs,
  .drawflow .drawflow-node .outputs {
      width: 0
  }
  
  .drawflow .drawflow-node .drawflow_content_node {
      width: 100%;
      display: block
  }
  
  .drawflow .drawflow-node .input,
  .drawflow .drawflow-node .output {
      position: relative;
      width: 20px;
      height: 20px;
      background: #fff;
      border-radius: 50%;
      border: 2px solid #000;
      cursor: crosshair;
      z-index: 1;
      margin-bottom: 5px
  }
  
  .drawflow .drawflow-node .input {
      left: -27px;
      top: 2px;
      background: #ff0
  }
  
  .drawflow .drawflow-node .output {
      right: -3px;
      top: 2px
  }
  
  .drawflow svg {
      z-index: 0;
      position: absolute;
      overflow: visible !important
  }
  
  .drawflow .connection {
      position: absolute;
      pointer-events: none
  }
  
  .drawflow .connection .main-path {
      fill: none;
      stroke-width: 5px;
      stroke: #4682b4;
      pointer-events: all
  }
  
  .drawflow .connection .main-path:hover {
      stroke: #1266ab;
      cursor: pointer
  }
  
  .drawflow .connection .main-path.selected {
      stroke: #43b993
  }
  
  .drawflow .connection .point {
      cursor: move;
      stroke: #000;
      stroke-width: 2;
      fill: #fff;
      pointer-events: all
  }
  
  .drawflow .connection .point.selected,
  .drawflow .connection .point:hover {
      fill: #1266ab
  }
  
  .drawflow .main-path {
      fill: none;
      stroke-width: 5px;
      stroke: #4682b4
  }
  
  .drawflow-delete {
      position: absolute;
      display: block;
      width: 30px;
      height: 30px;
      background: #000;
      color: #fff;
      z-index: 4;
      border: 2px solid #fff;
      line-height: 30px;
      font-weight: 700;
      text-align: center;
      border-radius: 50%;
      font-family: monospace;
      cursor: pointer
  }
  
  .drawflow>.drawflow-delete {
      margin-left: -15px;
      margin-top: 15px
  }
  
  .parent-node .drawflow-delete {
      right: -15px;
      top: -15px
  }
  `;
