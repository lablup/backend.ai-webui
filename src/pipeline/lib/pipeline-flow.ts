/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
 import {css, CSSResultGroup, html, LitElement} from 'lit';
 import {customElement, property, query} from 'lit/decorators.js';

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

  constructor() {
    super();
  }

  render() {
    // language=HTML
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-flow': PipelineFlow;
  }
}