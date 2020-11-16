/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";

import {BackendAIPage} from './backend-ai-page';

import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import 'weightless/tab';
import 'weightless/tab-group';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';
import '@material/mwc-button';
import './lablup-activity-panel';
import './backend-ai-dialog';
import './backend-ai-environment-list';
import './backend-ai-resource-preset-list';
import './backend-ai-registry-list';

/**
 Backend.AI Environment View

 Example:

 <backend-ai-environment-view class="page" name="environment" ?active="${0}">
 ... content ...
 </backend-ai-environment-view>

 @group Backend.AI Console
 @element backend-ai-environment-view
 */

@customElement("backend-ai-environment-view")
export default class BackendAIEnvironmentView extends BackendAIPage {
  @property({type: String}) images = Object();
  @property({type: Boolean}) is_superadmin = false;
  @property({type: String}) _activeTab = 'image-lists';

  constructor() {
    super();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
          wl-tab-group {
              --tab-group-indicator-bg: var(--paper-yellow-600);
          }

          wl-tab {
              --tab-color: #666;
              --tab-color-hover: #222;
              --tab-color-hover-filled: #222;
              --tab-color-active: var(--paper-yellow-900);
              --tab-color-active-hover: var(--paper-yellow-900);
              --tab-color-active-filled: #ccc;
              --tab-bg-active: var(--paper-yellow-200);
              --tab-bg-filled: var(--paper-yellow-200);
              --tab-bg-active-hover: var(--paper-yellow-200);
          }

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

          div h4 {
              margin: 0;
              font-weight: 100;
              font-size: 16px;
              padding-left: 20px;
              border-bottom: 1px solid #ccc;
              width: 100%;
          }

          wl-card wl-card {
              margin: 0;
              padding: 0;
              --card-elevation: 0;
          }

      `
    ];
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      _activeTab: {
        type: Boolean
      }
    }
  }

  /**
   * Set backend.ai client to super admin.
   *
   * @param {Boolean} active
   */
  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return true;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.is_superadmin = globalThis.backendaiclient.is_superadmin;
      }, true);
    } else { // already connected
      this.is_superadmin = globalThis.backendaiclient.is_superadmin;
    }
    return false;
  }

  /**
   * Display the tab.
   *
   * @param tab
   */
  _showTab(tab) {
    var els = this.shadowRoot.querySelectorAll(".tab-content");
    for (var x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this._activeTab = tab.title;
    this.shadowRoot.querySelector('#' + tab.title).style.display = 'block';
  }

  render() {
    // language=HTML
    return html`
      <lablup-activity-panel noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar>
              <mwc-tab title="image-lists" label="${_t("environment.Images")}" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              <mwc-tab title="resource-template-lists" label="${_t("environment.ResourcePresets")}" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              ${this.is_superadmin ? html`
                <mwc-tab title="registry-lists" label="${_t("environment.Registries")}" @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              `: html``}
            </mwc-tab-bar>
            <div class="flex"></div>
          </h3>
          <div id="image-lists" class="tab-content">
            <backend-ai-environment-list ?active="${this._activeTab === 'image-lists'}"></backend-ai-environment-list>
          </div>
          <backend-ai-resource-preset-list id="resource-template-lists" class="admin item tab-content" style="display: none" ?active="${this._activeTab === 'resource-template-lists'}"></backend-ai-resource-preset-list>
          <div id="registry-lists" class="tab-content">
            <backend-ai-registry-list ?active="${this._activeTab === 'registry-lists'}"> </backend-ai-registry-list>
          </div>
        </div>
      </lablup-activity-panel>
    `;
  }

  firstUpdated() {
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-environment-view": BackendAIEnvironmentView;
  }
}

