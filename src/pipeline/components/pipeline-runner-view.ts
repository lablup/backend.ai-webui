/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
 import {LitElement} from 'lit';
 import {customElement} from 'lit/decorators.js';

/**
 Pipeline Runner View

 `pipeline-runner-view` is wrapper component of instantiated pipeline list and flow display

 Example:

 <pipeline-runner-view>
 ...
 </pipeline-runner-view>

@group Backend.AI pipeline
 @element pipeline-runner-view
*/
@customElement('pipeline-runner-view')
export default class PipelineRunnerView extends LitElement {
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
    'pipeline-runner-view': PipelineRunnerView;
  }
}