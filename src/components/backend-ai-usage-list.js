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
    this.collection = {};
    this.data = [];
    this.period = '1D';
    this.active = false;
    this.template = {
      "1D": {
        "interval": 15 / 15,
        "length": 4 * 24
      },
      "1W": {
        "interval": 15 / 15,
        "length": 4 * 24 * 7
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
        type: Object,

        hasChanged(newval, oldval) {
          if (newval === undefined || oldval === undefined) return false;

          return false;
        }
      },
      data: {
        type: Array
      },
      period: {
        type: String
      },
      template: Object
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
      if (!this.active) this._menuChanged(true);
      this.active = true;
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
      this.init()
      .then(res => {
        this.shadowRoot.querySelector('backend-ai-chart-alt').init();
      })
    }
  }

  init() {
    return window.backendaiclient.resources.user_stats()
    .then(res => {
      const { period, template } = this;
      this.data = res;

      this.collection[period] = {
        data: [ res.filter((e, i) => res.length - template[period].length <= i).map(e => ({x: new Date(1000 * e[0]), y: e[2]})) ],
        axisTitle: {
          x: "Date",
          y: "Percentage"
        },
        title: "CPU Usage (%)",
        period
      }

      return this.updateComplete;
    })
  }

  pulldownChange(e) {
    this.period = e.target.value;

    if (!(this.period in this.collection)) {
      this.collection[this.period] = {
        data: [ this.data.filter((e, i) => this.data.length - this.template[this.period].length <= i).map(e => ({x: new Date(1000 * e[0]), y: e[2]})) ],
        axisTitle: {
          x: "Date",
          y: "Percentage"
        },
        title: "CPU Usage (%)",
        period: this.period
      }
    }
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
          <option value="1D">1 Day</option>
          <option value="1W">1 Week</option>
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
