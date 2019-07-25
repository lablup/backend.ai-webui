/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import { css, html, LitElement } from "lit-element";

import 'weightless/card';
import 'weightless/tab-group';
import 'weightless/tab';
import 'weightless/select';

import { BackendAiStyles } from './backend-ai-console-styles';
import './backend-ai-chart.js'
import './backend-ai-chart-alt.js'
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
          wl-select {
            --input-font-family: Roboto, Noto, sans-serif;
            --input-color-disabled: #222;
            --input-label-color-disabled: #222;
            --input-label-font-size: 12px;
            --input-border-style-disabled: 1px solid #ccc;
          }
        `
      ]
    }

    render() {
        // language=HTML
        return html`
          <div class="layout horizontal end-justified" style="padding: 20px 0px; margin: 0px 20px;">
            <wl-select label="Select Something">
              <option value disabled selected>Select something</option>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
              <option value="4">Option 4</option>
            </wl-select>
          </div>
          <div class="layout vertical center">
            <backend-ai-chart-alt
              title="CPU"
              width="800"
              height="300"
              elevation="1"
              type="line"
              .data=${
                {
                  values: [...Array(12)].map(e => Math.floor(Math.random() * 101)),
                  axisTitle: {
                    x: 'Month',
                    y: 'Percentage'
                  },
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  title: 'CPU Usage (%)'
                }
              }
            ></backend-ai-chart-alt>
            <!-- <backend-ai-chart
              title="CPU"
              width="250"
              height="300"
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
            ></backend-ai-chart> -->
            <!-- <backend-ai-chart
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
            ></backend-ai-chart> -->
          </div>
        `;
    }
}

customElements.define(BackendAIUsageList.is, BackendAIUsageList);
