/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
 import {css, CSSResultGroup, html, LitElement} from 'lit';
 import {customElement, property, query} from 'lit/decorators.js';

/**
 Pipeline Dialog

 `pipeline-dialog` is a dialog with close button

 Example:

 <pipeline-dialog>
 ...
 </pipeline-dialog>

@group Backend.AI pipeline
 @element pipeline-dialog
*/

@customElement('pipeline-dialog')
export default class PipelineDialog extends LitElement {
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
    'pipeline-dialog': PipelineDialog;
  }
}