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
    // this.collection = {
    //   "1H": {
    //     data: [
    //       {
    //         x: [...Array(7)].map((e, i) => new Date(i * 1e12)),
    //         y: [...Array(7)].map(e => Math.floor(Math.random() * 101))
    //       },
    //       {
    //         x: [...Array(7)].map((e, i) => new Date(i * 1e12)),
    //         y: [...Array(7)].map(e => Math.floor(Math.random() * 101))
    //       }
    //     ],
    //     axisTitle: {
    //       x: "Time",
    //       y: "Percentage"
    //     },
    //     title: "CPU Usage (%)"
    //   },
    //   "6H": {
    //     data: [
    //       {
    //         x: [...Array(24)].map((e, i) => new Date(i * 1e12)),
    //         y: [...Array(24)].map(e => Math.floor(Math.random() * 101))
    //       },
    //       {
    //         x: [...Array(24)].map((e, i) => new Date(i * 1e12)),
    //         y: [...Array(24)].map(e => Math.floor(Math.random() * 101))
    //       },
    //       {
    //         x: [...Array(24)].map((e, i) => new Date(i * 1e12)),
    //         y: [...Array(24)].map(e => Math.floor(Math.random() * 101))
    //       }
    //     ],
    //     axisTitle: {
    //       x: "Time",
    //       y: "Percentage"
    //     },
    //     title: "CPU Usage (%)"
    //   },
    //   "12H": {
    //     data: [
    //       {
    //         x: [...Array(48)].map((e, i) => new Date(i * 1e12)),
    //         y: [...Array(48)].map(e => Math.floor(Math.random() * 101))
    //       },
    //       {
    //         x: [...Array(48)].map((e, i) => new Date(i * 1e12)),
    //         y: [...Array(48)].map(e => Math.floor(Math.random() * 101))
    //       }
    //     ],
    //     axisTitle: {
    //       x: "Time",
    //       y: "Percentage"
    //     },
    //     title: "CPU Usage (%)"
    //   }
    // };
    this.collection = {};
    this.data = [];
    this.period = '1D';
    this.active = false;
    this.template = {
      "1D": {
        "interval": 15 / 15,
        "length": 4 * 24
      }
    }
  }

  static get properties() {
    return {
      active: {
        type: Boolean,
        reflect: true
      },
      collection: {
        type: Object
      },
      data: {
        type: Array
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

  firstUpdated() {

  }

  shouldUpdate() {
    return this.active;
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name === "active" && newval !== null) {
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
      return;
    }

    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener("backend-ai-connected", () => {
        this.init();
      }, true);
    } else {
      this.init();
    }
  }

  init() {
    window.backendaiclient.resources.user_stats()
    .then(res => {
      const { period, template } = this;
      this.data = res;

      this.collection[this.period] = {
        data: [ res.filter((e, i) => res.length - template[period].length <= i).map(e => ({x: new Date(1000 * e[0]), y: e[2]})) ],
        axisTitle: {
          x: "Date",
          y: "Percentage"
        },
        title: "CPU Usage (%)"
      }
    })
  }

  pulldownChange(e) {
    this.period = e.target.value;
  }

  render() {
    // language=HTML
    return html`
      <div
        class="layout horizontal end-justified"
        style="width: 80%;"
      >
        <wl-select label="Select Period" style="width: 130px" @input=${this.pulldownChange}>
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
          .collection=${this.collection[this.period]}
        ></backend-ai-chart-alt>
      </div>
    `;
  }
}

customElements.define(BackendAIUsageList.is, BackendAIUsageList);
