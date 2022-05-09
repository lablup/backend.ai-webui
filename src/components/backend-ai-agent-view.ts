/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

import '@material/mwc-tab-bar';
import '@material/mwc-tab';

import './lablup-activity-panel';
import './backend-ai-agent-list';
import './backend-ai-storage-proxy-list';
import './backend-ai-resource-group-list';
import {BackendAiStyles} from './backend-ai-general-styles';

/**
 Backend.AI Agent view page

 Example:

 <backend-ai-agent-view active=true>
 ... content ...
 </backend-ai-agent-view>

@group Backend.AI Web UI
 @element backend-ai-agent-view
 */

@customElement('backend-ai-agent-view')
export default class BackendAIAgentView extends BackendAIPage {
  @property({type: String}) _status = 'inactive';
  @property({type: String}) _tab = 'running-lists';
  @property({type: Boolean}) enableStorageProxy = false;

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

  firstUpdated() {
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.enableStorageProxy = globalThis.backendaiclient.supports('storage-proxy');
      }, true);
    } else {
      this.enableStorageProxy = globalThis.backendaiclient.supports('storage-proxy');
    }
  }

  /**
   * Change agent's backend.ai running state.
   *
   * @param {Boolean} active
   */
  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (!active) {
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
   * @param {mwc-tab} tab
   */
  _showTab(tab) {
    const els = this.shadowRoot.querySelectorAll('.tab-content');
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this.shadowRoot.querySelector('#' + tab.title).style.display = 'block';
    this._tab = tab.title;
  }

  render() {
    // language=HTML
    return html`
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar>
              <mwc-tab title="running-lists" label="${_t('agent.Connected')}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              <mwc-tab title="terminated-lists" label="${_t('agent.Terminated')}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              <!--<mwc-tab title="maintenance-lists" label="${_t('agent.Maintaining')}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>-->
              ${this.enableStorageProxy ? html`
                <mwc-tab title="storage-proxy-lists" label="${_t('general.StorageProxies')}"
                    @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              ` : html``}
              <mwc-tab title="scaling-group-lists" label="${_t('general.ResourceGroup')}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            </mwc-tab-bar>
            <div class="flex"></div>
          </h3>
          <div id="running-lists" class="tab-content">
            <backend-ai-agent-list id="running-agents" condition="running" ?active="${this._status === 'active' && this._tab === 'running-lists'}"></backend-ai-agent-list>
          </div>
          <div id="terminated-lists" class="tab-content" style="display:none;">
            <backend-ai-agent-list id="terminated-agents" condition="terminated" ?active="${this._status === 'active' && this._tab === 'terminated-lists'}"></backend-ai-agent-list>
          </div>
          ${this.enableStorageProxy ? html`
            <div id="storage-proxy-lists" class="tab-content" style="display:none;">
              <backend-ai-storage-proxy-list id="storage-proxies" ?active="${this._status === 'active' && this._tab === 'storage-proxy-lists'}"></backend-ai-storage-proxy-list>
            </div>
          `:html``}
          <div id="scaling-group-lists" class="tab-content" style="display:none;">
            <backend-ai-resource-group-list id="scaling-groups" ?active="${this._status === 'active' && this._tab === 'scaling-group-lists'}"> </backend-ai-resource-group-list>
          </div>
        </div>
      </lablup-activity-panel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-agent-view': BackendAIAgentView;
  }
}
