/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {html} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import 'weightless/card';
import 'weightless/tab';
import 'weightless/tab-group';

import './backend-ai-agent-list';
import {BackendAiStyles} from "./backend-ai-console-styles";

/**
 Backend.AI Agent view page

 Example:

 <backend-ai-agent-view active=true>
 ... content ...
 </backend-ai-agent-view>

 @group Backend.AI Console
 */
class BackendAIAgentView extends BackendAIPage {
	public updateComplete: any;
	public shadowRoot: any;
	public _status: any;

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      _status: {
        type: Boolean
      }
    };
  }

  constructor() {
    super();
    this.active = false;
  }

  firstUpdated() {
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      this.shadowRoot.querySelector('#running-agents').active = false;
      this.shadowRoot.querySelector('#finished-agents').active = false;
      this._status = 'inactive';
      return;
    }
    this.shadowRoot.querySelector('#running-agents').active = true;
    this.shadowRoot.querySelector('#finished-agents').active = true;
    this._status = 'active';
  }

  static get styles() {
    return [
      BackendAiStyles];
  }

  _showTab(tab) {
    var els = this.shadowRoot.querySelectorAll(".tab-content");
    for (var x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this.shadowRoot.querySelector('#' + tab.value).style.display = 'block';
  }

  render() {
    // language=HTML
    return html`
      <wl-card class="item" elevation="1">
        <h3 class="tab horizontal center layout">
          <wl-tab-group>
            <wl-tab value="running-lists" checked @click="${(e) => this._showTab(e.target)}">Connected</wl-tab>  
            <wl-tab value="terminated-lists" @click="${(e) => this._showTab(e.target)}">Terminated</wl-tab>
            <wl-tab value="maintenance-lists" disabled>Maintaining</wl-tab>
          </wl-tab-group>
          <div class="flex"></div>
        </h3>

        <div id="running-lists" class="tab-content">
          <backend-ai-agent-list id="running-agents" condition="running" ?active="${this._status === 'active'}"></backend-ai-agent-list>
        </div>
        <div id="terminated-lists" class="tab-content" style="display:none;">
          <backend-ai-agent-list id="finished-agents" condition="finished" ?active="${this._status === 'active'}"></backend-ai-agent-list>
        </div>
      </wl-card>
    `;
  }
}

customElements.define('backend-ai-agent-view', BackendAIAgentView);
