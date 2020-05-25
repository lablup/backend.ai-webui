/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import '../plastics/mwc/mwc-drawer';
import '@material/mwc-dialog';
import '@material/mwc-icon';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';

import {BackendAIPage} from './backend-ai-page';
import {BackendAiConsoleStyles} from './backend-ai-console-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";

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
      BackendAiConsoleStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=css
      css`
        h3 {
          font-size: 16px;
          color: #242424;
          display: block;
          width: 100%;
          height: 33px;
          padding: 5px 15px;
          border-bottom: 1px solid #cccccc;
        }

        mwc-list {
          padding: 0;
          margin: 0;
        }
      `
    ];
  }

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
  }

  _taskIcon(type) {
    switch (type) {
      case "session":
        return 'subject';
        break;
      case "database":
        return 'dns';
        break;
      case "image":
        return 'extension';
        break;
      case "general":
      default:
        return 'widget';
        break;
    }
  }

  render() {
    // language=HTML
    return html`
      <div id="container">
        <h3>${_t("sidepanel.BackgroundTasks")}</h3>
        <mwc-list>
        ${this.tasks.map(item =>
      html`
          <mwc-list-item graphic="icon" twoline>
            <mwc-icon id="summary-menu-icon" slot="graphic" id="activities-icon" class="fg black">${this._taskIcon(item.tasktype)}</mwc-icon>
            <span>${item.tasktitle}</span>
            <span slot="secondary">${_t("sidepanel.Running")}</span>
          </mwc-list-item>
          <li divider role="separator"></li>`)}
          ${this.tasks.length === 0 ? html`
            <div style="padding:15px 0;width:100%;text-align:center;">
              ${_t("sidepanel.NoBackgroundTask")}
            </div>
        ` : html``}
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
