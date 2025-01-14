/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import './backend-ai-usage-list.js';
import '@material/mwc-tab-bar/mwc-tab-bar';
import '@material/mwc-tab/mwc-tab';
import { css, CSSResultGroup, html } from 'lit';
import { translate as _t } from 'lit-translate';
import { customElement, property } from 'lit/decorators.js';

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
  @property({ type: String }) _status = 'inactive';

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        .tab-content {
          width: 100%;
        }
      `,
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
    (this.shadowRoot?.querySelector('#usage-list') as HTMLElement).setAttribute(
      'active',
      'true',
    );
    this._status = 'active';
  }

  /**
   * Show the contents contained in the selected tab.
   *
   * @param {EventTarget} tab - usage tab to want to show
   * */
  _showTab(tab) {
    const els = this.shadowRoot?.querySelectorAll<HTMLDivElement>(
      '.tab-content',
    ) as NodeListOf<HTMLDivElement>;

    for (const el of Array.from(els)) {
      el.style.display = 'none';
    }

    (
      this.shadowRoot?.querySelector('#' + tab.title + '-stat') as HTMLElement
    ).style.display = 'block';

    els.forEach((e) => {
      e.children[0].removeAttribute('active');
    });
    (
      this.shadowRoot?.querySelector(`#${tab.title}-list`) as HTMLElement
    ).setAttribute('active', 'true');
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/custom.css" />
      <lablup-activity-panel elevation="1" noheader narrow autowidth>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar>
              <mwc-tab
                title="usage"
                label="${_t('statistics.UsageHistory')}"
              ></mwc-tab>
            </mwc-tab-bar>
          </h3>
          <div class="horizontal wrap layout">
            <div id="usage-stat" class="tab-content">
              <backend-ai-usage-list id="usage-list"></backend-ai-usage-list>
            </div>
          </div>
        </div>
      </lablup-activity-panel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-statistics-view': BackendAIStatisticsView;
  }
}
