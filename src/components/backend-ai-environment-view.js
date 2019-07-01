/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {html, LitElement} from "lit-element";
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import {BackendAiStyles} from './backend-ai-console-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import './lablup-loading-indicator';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import 'weightless/tab';
import 'weightless/tab-group';

import './backend-ai-environment-list';
import '../backend-ai-resource-template-list';

class BackendAiEnvironmentView extends LitElement {
  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.images = {};
    this.active = false;
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
      IronFlexFactors,
      IronPositioning];
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

  attributeChangedCallback(name, oldval, newval) {
    if (name == 'active' && newval !== null) {
      this._menuChanged(true);
    } else {
      this._menuChanged(false);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }

  async _menuChanged(active) {
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

  render() {
    // language=HTML
    return html`
      <lablup-loading-indicator id="loading-indicator"></lablup-loading-indicator>
      <wl-card class="item" elevation="1">
        <h3 class="tab horizontal center layout">
          <wl-tab-group>
            <wl-tab value="image-lists" checked @click="${(e) => this._showTab(e.target)}">Images</wl-tab>  
            <wl-tab value="resource-template-lists" @click="${(e) => this._showTab(e.target)}">Resource Templates</wl-tab>
          </wl-tab-group>
          <div class="flex"></div>
        </h3>

        <div id="image-lists" class="tab-content">
          <backend-ai-environment-list ?active="${this._activeTab === 'image-lists'}"></backend-ai-environment-list>
        </div>
        <div id="resource-template-lists" class="tab-content" style="display:none;">
          <backend-ai-resource-template-list ?active="${this._activeTab === 'resource-template-lists'}"></backend-ai-resource-template-list>
      </div>
      </wl-card>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

customElements.define(BackendAiEnvironmentView.is, BackendAiEnvironmentView);
