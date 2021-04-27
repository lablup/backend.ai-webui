/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */

import {translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators';

import {BackendAIPage} from './backend-ai-page';

import 'weightless/card';
import 'weightless/progress-spinner';
import 'weightless/tab-group';
import 'weightless/tab';

import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';

import {BackendAiStyles} from './backend-ai-general-styles';
import './backend-ai-usage-list.js';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend AI Statistics View

 Example:

 <backend-ai-statistics-view active>
 ...
 </backend-ai-statistics-view>

@group Backend.AI Web UI
 @element backend-ai-statistics-view
 */

@customElement('backend-ai-statistics-view')
export default class BackendAIStatisticsView extends BackendAIPage {
  @property({type: String}) _status = 'inactive';

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup | undefined {
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

        .tab-content {
          width: 100%;
        }
      `
    ];
  }

  /**
   * If active is false, set _status to inactive.
   * Else, set both _status and #usage-list items to active.
   *
   * @param {boolean} active
   * */
  async _viewStateChanged(active) {
    await this.updateComplete;
    if (active === false) {
      this._status = 'inactive';
      return;
    }
    this.shadowRoot.querySelector('#usage-list').setAttribute('active', true);
    this._status = 'active';
  }

  /**
   * Show the contents contained in the selected tab.
   *
   * @param {EventTarget} tab - usage tab to want to show
   * */
  _showTab(tab) {
    const els = this.shadowRoot.querySelectorAll('.tab-content');

    for (const el of els) {
      el.style.display = 'none';
    }

    this.shadowRoot.querySelector('#' + tab.title + '-stat').style.display = 'block';

    els.forEach((e) => {
      e.children[0].removeAttribute('active');
    });
    this.shadowRoot.querySelector(`#${tab.title}-list`).setAttribute('active', true);
  }

  render() {
    // language=HTML
    return html`
        <div style="margin:20px;">
          <lablup-activity-panel elevation="1" noheader narrow autowidth>
            <div slot="message">
              <h3 class="tab horizontal center layout">
                <mwc-tab-bar>
                  <mwc-tab title="usage" label="${_t('statistics.Usage')}"></mwc-tab>
                </mwc-tab-bar>
              </h3>
              <div class="horizontal wrap layout">
                <div id="usage-stat" class="tab-content">
                  <backend-ai-usage-list id="usage-list"><wl-progress-spinner active></wl-progress-spinner></backend-ai-usage-list>
                </div>
              </div>
            </div>
          </lablup-activity-panel>
        </div>
      `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-statistics-view': BackendAIStatisticsView;
  }
}
