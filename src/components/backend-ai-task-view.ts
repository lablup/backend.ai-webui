/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import '../plastics/mwc/mwc-drawer';
import '@material/mwc-dialog';
import '@material/mwc-icon';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';

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
  @property({type: Array}) tasks = Array();

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
       <mwc-list>
       ${this.tasks.map(item =>
      html`
         <mwc-list-item graphic="icon" twoline>
           <mwc-icon id="summary-menu-icon" slot="graphic" id="activities-icon" class="fg green">widgets</mwc-icon>
           <span>${item.tasktitle}</span>
           <span slot="secondary">${item.taskid}</span>
         </mwc-list-item>
         <li divider role="separator"></li>`
    )}
       </mwc-list>
     </div>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    this.tasks = [];
    document.addEventListener('backend-ai-task-changed', () => this.refresh());
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async refresh() {
    this.tasks = globalThis.tasker.taskstore;
    await this.requestUpdate();
  }

}
declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-task-view": BackendAiTaskView;
  }
}
