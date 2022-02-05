/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
 import {css, CSSResultGroup, html, LitElement} from 'lit';
 import {customElement, property, query} from 'lit/decorators.js';

/**
 Pipeline List

 `pipeline-list` is a grid table used for displaying pipeline related data

 Example:

 <pipeline-list>
 ...
 </pipeline-list>

@group Backend.AI pipeline
 @element pipeline-list
*/

@customElement('pipeline-list')
export default class PipelineList extends LitElement {
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
    'pipeline-list': PipelineList;
  }
}