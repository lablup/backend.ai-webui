/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import { css, html } from "lit-element";
import {BackendAIPage} from './backend-ai-page.js';

import 'weightless/card';
import 'weightless/tab-group';
import 'weightless/tab';

import { BackendAiStyles } from './backend-ai-console-styles';
import './backend-ai-usage-list.js';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';


class BackendAIStatisticsView extends BackendAIPage {
	public _status: any;
	public updateComplete: any;
	public shadowRoot: any;

  constructor() {
    super();
    this.active = false;
    this._status = "inactive";
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

  static get is() {
      return 'backend-ai-statistics-view';
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
          --tab-group-indicator-bg: var(--paper-cyan-500);
        }

        wl-tab {
          --tab-color: #666;
          --tab-color-hover: #222;
          --tab-color-hover-filled: #222;
          --tab-color-active: #222;
          --tab-color-active-hover: #222;
          --tab-color-active-filled: #ccc;
          --tab-bg-active: var(--paper-cyan-50);
          --tab-bg-filled: var(--paper-cyan-50);
          --tab-bg-active-hover: var(--paper-cyan-100);
        }

        .tab-content {
          width: 100%;
        }
      `
    ]
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      this._status = "inactive";

      const activeElement = this.shadowRoot.querySelector("[active]");
      activeElement.removeAttribute("active");

      return;
    }
    this.shadowRoot.querySelector("#usage-list").setAttribute("active", true);
    this._status = "active";
  }

  _showTab(tab) {
    const els = this.shadowRoot.querySelectorAll(".tab-content");

    for (const el of els) {
      el.style.display = 'none';
    }

    this.shadowRoot.querySelector('#' + tab.value + '-stat').style.display = 'block';

    els.forEach(e => {
      e.children[0].removeAttribute("active");
    });
    this.shadowRoot.querySelector(`#${tab.value}-list`).setAttribute("active", true);
  }

  render() {
      // language=HTML
      return html`
        <wl-card class="item">
          <h3 class="tab horizontal center layout">
            <wl-tab-group>
              <wl-tab value="usage" checked @click="${e => this._showTab(e.target)}">Usage</wl-tab>
              <wl-tab value="insight" disabled @click="${e => this._showTab(e.target)}">Insight</wl-tab>
            </wl-tab-group>
          </h3>
          <div class="horizontal wrap layout">
            <div id="usage-stat" class="tab-content">
              <backend-ai-usage-list id="usage-list"></backend-ai-usage-list>
            </div>
            <div id="insight-stat" class="tab-content" style="display: none;">
              <div></div>
            </div>
          </div>
        </wl-card>
      `;
  }
}

customElements.define(BackendAIStatisticsView.is, BackendAIStatisticsView);
