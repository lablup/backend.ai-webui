/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import {BackendAiStyles} from './backend-ai-console-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';
import './lablup-loading-indicator';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import 'weightless/tab';
import 'weightless/tab-group';
import './backend-ai-environment-list';
import './backend-ai-resource-preset-list';
import './backend-ai-registry-list';
import './lablup-notification';

class BackendAiEnvironmentView extends BackendAIPage {
  public images: any;
  public _activeTab: any;
  public updateComplete: any;
  public shadowRoot: any;
  public is_superadmin: any;

  constructor() {
    super();
    this.images = {};
    this.active = false;
    this.is_superadmin = false;
    this._activeTab = 'image-lists';
  }

  static get is() {
    return 'backend-ai-environment-view';
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

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      return true;
    }
  }

  _showTab(tab) {
    var els = this.shadowRoot.querySelectorAll(".tab-content");
    for (var x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this._activeTab = tab.value;
    this.shadowRoot.querySelector('#' + tab.value).style.display = 'block';
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <wl-card class="item" elevation="1">
        <h3 class="tab horizontal center layout">
          <wl-tab-group>
            <wl-tab value="image-lists" checked @click="${(e) => this._showTab(e.target)}">Images</wl-tab>
            <wl-tab value="resource-template-lists" @click="${(e) => this._showTab(e.target)}">Resource Presets</wl-tab>
            ${window.backendaiclient.is_superadmin === true ? html`
              <wl-tab value="registry-lists" @click="${(e) => this._showTab(e.target)}">Registries</wl-tab>` : html``}
          </wl-tab-group>
          <div class="flex"></div>
        </h3>
        <div id="image-lists" class="tab-content">
          <backend-ai-environment-list ?active="${this._activeTab === 'image-lists'}"></backend-ai-environment-list>
        </div>
        <backend-ai-resource-preset-list id="resource-template-lists" class="admin item tab-content" style="display: none" ?active="${this._activeTab === 'resource-template-lists'}"></backend-ai-resource-preset-list>
        <div id="registry-lists" class="tab-content">
          <backend-ai-registry-list ?active="${this._activeTab === 'registry-lists'}"> </backend-ai-registry-list>
        </div>
      </wl-card>
    `;
  }

  firstUpdated() {
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

customElements.define(BackendAiEnvironmentView.is, BackendAiEnvironmentView);
