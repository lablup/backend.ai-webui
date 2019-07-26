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
  constructor() {
    super();
    this.collection = {
      "1H": {
        values: [...Array(7)].map(e => Math.floor(Math.random() * 101)),
        axisTitle: {
          x: "Minutes",
          y: "Percentage"
        },
        labels: ["0", "10", "20", "30", "40", "50", "60"],
        title: "CPU Usage (%)"
      },
      "6H": {
        values: [...Array(24)].map(e => Math.floor(Math.random() * 101)),
        axisTitle: {
          x: "Minutes",
          y: "Percentage"
        },
        labels: [...Array(24)].map((e, i) => `${i * 15}`),
        title: "CPU Usage (%)"
      },
      "12H": {
        values: [...Array(48)].map(e => Math.floor(Math.random() * 101)),
        axisTitle: {
          x: "Minutes",
          y: "Percentage"
        },
        labels: [...Array(48)].map((e, i) => `${i * 15}`),
        title: "CPU Usage (%)"
      }
    };
    this.period = '1H';
  }

  static get properties() {
    return {
      collection: {
        type: Object
      },
      period: {
        type: String
      }
    }
  }

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
      <div
        class="layout horizontal end-justified"
        style="width: 80%;"
      >
        <wl-select label="Select Period" style="width: 130px" @input=${e => {this.period = e.target.value}}>
          <option value disabled selected>Select Period</option>
          <option value="1H">1 Hour</option>
          <option value="6H">6 Hours</option>
          <option value="12H">12 Hours</option>
          <!-- <option value="1D">1 Day</option>
          <option value="2D">2 Days</option> -->
        </wl-select>
      </div>
      <div class="layout vertical center">
        <backend-ai-chart-alt
          title="CPU"
          width="800"
          height="300"
          elevation="1"
          type="line"
          .data=${this.collection[this.period]}
        ></backend-ai-chart-alt>
      </div>
    `;
  }
}

customElements.define(BackendAIUsageList.is, BackendAIUsageList);
