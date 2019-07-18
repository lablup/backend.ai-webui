/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";

import './backend-ai-resource-monitor.js';
import './backend-ai-session-list.js';
import './backend-ai-dropdown-menu';
import 'weightless/card';
import 'weightless/tab';
import 'weightless/tab-group';

import './lablup-notification.js';
import {BackendAiStyles} from './backend-ai-console-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

class BackendAiSessionView extends LitElement {
  constructor() {
    super();
    this.active = false;
    this._status = 'inactive';
  }

  static get is() {
    return 'backend-ai-session-view';
  }

  static get properties() {
    return {
      active: {
        type: Boolean,
        reflect: true
      },
      _status: {
        type: Boolean
      },
      _lists: {
        type: Object
      }
    }
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        wl-card h3.tab {
          padding-top: 0;
          padding-bottom: 0;
          padding-left: 0;
        }
        wl-tab-group {
          --tab-group-indicator-bg: var(--paper-red-500);
        }

        wl-tab {
          --tab-color: #666;
          --tab-color-hover: #222;
          --tab-color-hover-filled: #222;
          --tab-color-active: #222;
          --tab-color-active-hover: #222;
          --tab-color-active-filled: #ccc;
          --tab-bg-active: var(--paper-red-50);
          --tab-bg-filled: var(--paper-red-50);
          --tab-bg-active-hover: var(--paper-red-100);
        }
      `];
  }

  firstUpdated() {
    this._lists = this.shadowRoot.querySelectorAll("backend-ai-session-list");

    document.addEventListener('backend-ai-session-list-refreshed', () => {
      this.shadowRoot.querySelector('#running-jobs').refreshList();
    });
  }

  connectedCallback() {
    super.connectedCallback();
  }

  shouldUpdate() {
    return this.active;
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name == 'active' && newval !== null) {
      this.active = true;
      this._menuChanged(true);
    } else {
      this.active = false;
      this._menuChanged(false);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }

  async _menuChanged(active) {
    await this.updateComplete;
    if (active === false) {
      this._status = 'inactive';
      for (var x = 0; x < this._lists.length; x++) {
        this._lists[x].removeAttribute('active');
      }
      return;
    }
    this.shadowRoot.querySelector('#running-jobs').setAttribute('active', true);
    //for (var x = 0; x < this._lists.length; x++) {
    //  this._lists[x].setAttribute('active', true);
    //}
    this._status = 'active';
  }

  _showTab(tab) {
    var els = this.shadowRoot.querySelectorAll(".tab-content");
    for (var x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this.shadowRoot.querySelector('#' + tab.value + '-lists').style.display = 'block';
    for (var x = 0; x < this._lists.length; x++) {
      this._lists[x].removeAttribute('active');
    }
    this.shadowRoot.querySelector('#' + tab.value + '-jobs').setAttribute('active', true);
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <wl-card class="item">
        <h3 class="tab horizontal center layout">
          <wl-tab-group>
            <wl-tab value="running" checked @click="${(e) => this._showTab(e.target)}">Running</wl-tab>
            <wl-tab value="finished" @click="${(e) => this._showTab(e.target)}">Finished</wl-tab>
            <wl-tab value="others" @click="${(e) => this._showTab(e.target)}">Others</wl-tab>
          </wl-tab-group>
          <div class="flex"></div>
          <backend-ai-resource-monitor ?active="${this.active}"></backend-ai-resource-monitor>
        </h3>
        <div id="running-lists" class="tab-content">
          <backend-ai-session-list id="running-jobs" condition="running"></backend-ai-session-list>
        </div>
        <div id="finished-lists" class="tab-content" style="display:none;">
          <backend-ai-session-list id="finished-jobs" condition="finished"></backend-ai-session-list>
        </div>
        <div id="others-lists" class="tab-content" style="display:none;">
          <backend-ai-session-list id="others-jobs" condition="others"></backend-ai-session-list>
        </div>

      </wl-card>
`;
  }
}

customElements.define(BackendAiSessionView.is, BackendAiSessionView);
