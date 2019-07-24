/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import { css, html, LitElement } from "lit-element";

import 'weightless/card';
import 'weightless/tab-group';
import 'weightless/tab';

import { BackendAiStyles } from './backend-ai-console-styles';
import './backend-ai-chart.js'
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';


class BackendAIUsageList extends LitElement {
    static get is() {
        return 'backend-ai-usage-list';
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
        `
      ]
    }

    render() {
        // language=HTML
        return html`
          <div class="layout vertical center">
            <backend-ai-chart
              width="1600"
              title="CPU"
              elevation="1"
              type="line"
              .data=${
                {
                  values: [...Array(12)].map(e => Math.floor(Math.random() * 101)),
                  axisTitles: {
                    x: 'Month',
                    y: 'Percentage'
                  },
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  title: 'CPU Usage (%)'
                }
              }
            ></backend-ai-chart>
            <backend-ai-chart
              width="1600"
              title="Network Byte"
              elevation="1"
              type="line"
              .data=${
                {
                  values: [...Array(12)].map(e => Math.floor(Math.random() * 101)),
                  axisTitles: {
                    x: 'Month',
                    y: 'MB/s'
                  },
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  title: 'MegaBytes per Second'
                }
              }
            ></backend-ai-chart>
          </div>
        `;
    }
}

customElements.define(BackendAIUsageList.is, BackendAIUsageList);
