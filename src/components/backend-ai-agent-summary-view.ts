/**
 @license
Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
*/

import {translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

import '@material/mwc-tab-bar';
import '@material/mwc-tab';

import './lablup-activity-panel';
import './backend-ai-list-status';
import './backend-ai-agent-summary-list';
import {BackendAiStyles} from './backend-ai-general-styles';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAIAgentSummaryList = HTMLElementTagNameMap['backend-ai-agent-summary-list'];

/**
Backend.AI Agent Summary view page

Example:

<backend-ai-agent-summary-view active=true>
... content ...
</backend-ai-agent-summary-view>

@group Backend.AI Web UI
@element backend-ai-agent-view
*/

@customElement('backend-ai-agent-summary-view')
export default class BackendAIAgentSummaryView extends BackendAIPage {
  @property({type: String}) _status = 'inactive';
  @property({type: String}) _tab = 'running-lists';
  @property({type: Boolean}) hideAgents = true;

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      // language=CSS
      css`
        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0 0;
          margin: 0 auto;
        }

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
        }

        @media screen and (max-width: 805px) {
          mwc-tab {
            --mdc-typography-button-font-size: 10px;
          }
        }
      `];
  }

  /**
  * Change agent's backend.ai running state.
  *
  * @param {Boolean} active
  */
  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (!active) {
      (this.shadowRoot?.querySelector('#running-agents') as BackendAIAgentSummaryList).active = false;
      (this.shadowRoot?.querySelector('#terminated-agents') as BackendAIAgentSummaryList).active = false;
      this._status = 'inactive';
      return;
    }
    (this.shadowRoot?.querySelector('#running-agents') as BackendAIAgentSummaryList).active = true;
    (this.shadowRoot?.querySelector('#terminated-agents') as BackendAIAgentSummaryList).active = true;
    this._status = 'active';
  }

  /**
  * Display the tab.
  *
  * @param {mwc-tab} tab
  */
  _showTab(tab) {
    const els = this.shadowRoot?.querySelectorAll('.tab-content') as NodeListOf<HTMLDivElement>;
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    (this.shadowRoot?.querySelector('#' + tab.title) as HTMLDivElement).style.display = 'block';
    this._tab = tab.title;
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css">
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar>
              <mwc-tab title="running-lists" label="${_t('agent.Connected')}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              <mwc-tab title="terminated-lists" label="${_t('agent.Terminated')}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            </mwc-tab-bar>
            <div class="flex"></div>
          </h3>
          <div id="running-lists" class="tab-content">
            <backend-ai-agent-summary-list id="running-agents" condition="running" ?active="${this._status === 'active' && this._tab === 'running-lists'}"></backend-ai-agent-summary-list>
          </div>
          <div id="terminated-lists" class="tab-content" style="display:none;">
            <backend-ai-agent-summary-list id="terminated-agents" condition="terminated" ?active="${this._status === 'active' && this._tab === 'terminated-lists'}"></backend-ai-agent-summary-list>
          </div>
        </div>
      </lablup-activity-panel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-agent-summary-view': BackendAIAgentSummaryView;
  }
}
