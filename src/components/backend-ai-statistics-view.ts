/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import 'weightless/card';
import 'weightless/progress-spinner';
import 'weightless/tab-group';
import 'weightless/tab';

import {BackendAiStyles} from './backend-ai-general-styles';
import './backend-ai-usage-list.js';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

@customElement("backend-ai-statistics-view")
export default class BackendAIStatisticsView extends BackendAIPage {
  @property({type: String}) _status = "inactive";

  constructor() {
    super();
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
              <wl-tab value="usage" checked @click="${e => this._showTab(e.target)}">${_t("statistics.Usage")}</wl-tab>
            </wl-tab-group>
          </h3>
          <div class="horizontal wrap layout">
            <div id="usage-stat" class="tab-content">
              <backend-ai-usage-list id="usage-list"><wl-progress-spinner active></wl-progress-spinner></backend-ai-usage-list>
            </div>
          </div>
        </wl-card>
      `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-statistics-view": BackendAIStatisticsView;
  }
}
