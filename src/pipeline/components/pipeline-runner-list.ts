/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
 import {css, CSSResultGroup, html, LitElement} from 'lit';
 import {customElement, property, query} from 'lit/decorators';

/**
 Pipeline Runner List

 `pipeline-runner-list` is fetches and lists of instantiated pipelines

 Example:

 <pipeline-runner-list>
 ...
 </pipeline-runner-list>

@group Backend.AI pipeline
 @element pipeline-runner-list
*/
@customElement('pipeline-runner-list')
export default class PipelineRunnerList extends LitElement {
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
    'pipeline-runner-list': PipelineRunnerList;
  }
}