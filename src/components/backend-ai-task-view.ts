/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import '../plastics/mwc/mwc-drawer';
import '@material/mwc-dialog';
import {BackendAIPage} from './backend-ai-page';

/**
 Backend.AI Task viewer for Console

 `backend-ai-task-view` is a background task view for console.

 Example:
 @group Backend.AI Console
 @element backend-ai-view
 */
@customElement("backend-ai-task-view")
export default class BackendAiTaskView extends BackendAIPage {
  public shadowRoot: any;
  public updateComplete: any;

  @property({type: Boolean}) active = true;
  @property({type: Object}) tasker;

  /**
   *  Backend.AI Task manager for Console
   *
   */
  constructor() {
    super();
  }

  static get styles() {
    return [
      // language=CSS
      css`
      `];
  }

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
  }

  render() {
    // language=HTML
    return html`
     <div id="container">
       ${this.tasker.taskstore.map(item => {
      html`${item.taskid}`
    })}
     </div>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    this.tasker = globalThis.tasker;
    console.log(this.tasker);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  refresh() {

  }

}
declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-task-view": BackendAiTaskView;
  }
}
