/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";

import {BackendAIPage} from './backend-ai-page';

import 'weightless/card';
import 'weightless/tab';
import 'weightless/tab-group';

import '@material/mwc-tab-bar';
import '@material/mwc-tab';

import './lablup-activity-panel';
import './backend-ai-agent-list';
import './backend-ai-scaling-group-list';
import {BackendAiStyles} from "./backend-ai-general-styles";

/**
 Backend.AI Agent view page

 Example:

 <backend-ai-agent-view active=true>
 ... content ...
 </backend-ai-agent-view>

 @group Backend.AI Console
 @element backend-ai-agent-view
 */

@customElement("backend-ai-agent-view")
export default class BackendAIAgentView extends BackendAIPage {
  @property({type: String}) _status = 'inactive';

  constructor() {
    super();
  }

  static get styles() {
    return [
      BackendAiStyles,
      // language=CSS
      css`
        h3.tab {
          background-color: var(--general-tabbar-background-color);
          border-radius: 5px 5px 0px 0px;
          margin: 0px auto;
        }

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
        }
      `];
  }

  firstUpdated() {
  }

  /**
   * Change agent's backend.ai running state.
   * 
   * @param {Boolean} active
   */
  async _viewStateChanged(active: Boolean) {
    await this.updateComplete;
    if (active === false) {
      this.shadowRoot.querySelector('#running-agents').active = false;
      this.shadowRoot.querySelector('#terminated-agents').active = false;
      this.shadowRoot.querySelector('#scaling-groups').active = false;
      this._status = 'inactive';
      return;
    }
    this.shadowRoot.querySelector('#running-agents').active = true;
    this.shadowRoot.querySelector('#terminated-agents').active = true;
    this.shadowRoot.querySelector('#scaling-groups').active = false;
    this._status = 'active';
  }

  /**
   * Display the tab.
   * 
   * @param tab 
   */
  _showTab(tab) {
    let els = this.shadowRoot.querySelectorAll(".tab-content");
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this.shadowRoot.querySelector('#' + tab.title).style.display = 'block';
  }

  render() {
    // language=HTML
    return html`
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar>
              <mwc-tab title="running-lists" label="${_t("agent.Connected")}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              <mwc-tab title="terminated-lists" label="${_t("agent.Terminated")}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              <!--<mwc-tab title="maintenance-lists" label="${_t("agent.Maintaining")}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>-->
              <mwc-tab title="scaling-group-lists" label="${_t("general.ResourceGroup")}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            </mwc-tab-bar>
            <div class="flex"></div>
          </h3>
          <div id="running-lists" class="tab-content">
            <backend-ai-agent-list id="running-agents" condition="running" ?active="${this._status === 'active'}"></backend-ai-agent-list>
          </div>
          <div id="terminated-lists" class="tab-content" style="display:none;">
            <backend-ai-agent-list id="terminated-agents" condition="terminated" ?active="${this._status === 'active'}"></backend-ai-agent-list>
          </div>
          <div id="scaling-group-lists" class="tab-content" style="display:none;">
            <backend-ai-scaling-group-list id="scaling-groups" ?active="${this._status === 'active'}"> </backend-ai-scaling-group-list>
          </div>
        </div>
      </lablup-activity-panel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-agent-view": BackendAIAgentView;
  }
}
