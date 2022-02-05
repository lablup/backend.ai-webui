/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
 import {LitElement} from 'lit';
 import {customElement} from 'lit/decorators.js';

/**
 Pipeline Template View

 `pipeline-template-view` is wrapper component of pipeline template list and flow editor

 Example:

 <pipeline-template-view>
 ...
 </pipeline-template-view>

@group Backend.AI pipeline
 @element pipeline-template-view
*/
@customElement('pipeline-template-view')
export default class PipelineTemplateView extends LitElement {
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
    'pipeline-template-view': PipelineTemplateView;
  }
}