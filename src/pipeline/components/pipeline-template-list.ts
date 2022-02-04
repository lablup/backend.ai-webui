/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
 import {css, CSSResultGroup, html, LitElement} from 'lit';
 import {customElement, property, query} from 'lit/decorators';

/**
 Pipeline Template List

 `pipeline-template-list` is fetches and lists of created/imported pipeline templates

 Example:

 <pipeline-template-list>
 ...
 </pipeline-template-list>

@group Backend.AI pipeline
 @element pipeline-template-list
*/
@customElement('pipeline-template-list')
export default class PipelineTemplateList extends LitElement {
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
    'pipeline-template-list': PipelineTemplateList;
  }
}