/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import { css, html, LitElement } from "lit-element";

import 'weightless/card';

import { BackendAiStyles } from './backend-ai-console-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

class BackendAIStatisticsView extends LitElement {
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
        `
      ]
    }

    render() {
        // language=HTML
        return html`
          <wl-card class="item">
            <h3 class="tab horizontal center layout">
              <wl-tab-group>
                <wl-tab value="statistics" checked>Statistics</wl-tab>
              </wl-tab-group>
            </h3>
          </wl-card>
        `;
    }
}

customElements.define(BackendAIStatisticsView.is, BackendAIStatisticsView);
