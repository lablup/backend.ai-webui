/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { BackendAIPage } from './backend-ai-page';
import { BackendAIWebUIStyles } from './backend-ai-webui-styles';
import '@material/mwc-drawer';
import '@material/mwc-icon';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import { css, CSSResultGroup, html } from 'lit';
import { translate as _t } from 'lit-translate';
import { customElement, property } from 'lit/decorators.js';

/**
 Backend.AI Sidepanel task viewer for Web UI

 `backend-ai-sidepanel-task` is a sidepanel task viewer for web UI.

 Example:
@group Backend.AI Web UI
 @element backend-ai-sidepanel-task
 */
@customElement('backend-ai-sidepanel-task')
export default class BackendAiSidepanelTask extends BackendAIPage {
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Array }) tasks = [];

  /**
   *  Backend.AI Task manager for Web UI
   *
   */
  constructor() {
    super();
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAIWebUIStyles,
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
          height: 25px;
          padding: 5px 15px;
          border-bottom: 1px solid var(--token-colorBorder, #ccc);
        }

        mwc-list {
          padding: 0;
          margin: 0;
        }

        mwc-list-item {
          height: 100%;
          margin-bottom: 10px;
        }

        .title {
          white-space: pre-wrap;
        }
      `,
    ];
  }

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
  }

  _taskIcon(type: string) {
    switch (type) {
      case 'session':
        return 'subject';
        break;
      case 'database':
        return 'dns';
        break;
      case 'image':
        return 'extension';
        break;
      case 'commit':
        return 'archive';
        break;
      case 'general':
      default:
        return 'widgets';
        break;
    }
  }

  render() {
    // language=HTML
    return html`
      <div id="container">
        <h3>${_t('sidePanel.BackgroundTasks')}</h3>
        <mwc-list>
          ${this.tasks.map(
            (item: any) => html`
              <mwc-list-item graphic="icon" twoline>
                <mwc-icon
                  id="summary-menu-icon"
                  slot="graphic"
                  id="activities-icon"
                  class="fg black"
                >
                  ${this._taskIcon(item.tasktype)}
                </mwc-icon>
                <span class="title">${item.tasktitle}</span>
                <span slot="secondary">${_t('sidePanel.Running')}</span>
              </mwc-list-item>
              <li divider role="separator"></li>
            `,
          )}
          ${this.tasks.length === 0
            ? html`
                <div style="padding:15px 0;width:100%;text-align:center;">
                  ${_t('sidePanel.NoBackgroundTask')}
                </div>
              `
            : html``}
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

  refresh() {
    this.tasks = globalThis.tasker.taskstore;
    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-task-view': BackendAiSidepanelTask;
  }
}
