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
    };

    this._map = {
      "num_sessions": "Sessions",
      "cpu_allocated": "CPU",
      "mem_allocated": "Memory",
      "gpu_allocated": "GPU",
      "io_read_bytes": "IO-Read",
      "io_write_bytes": "IO-Write"
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
      template: Object,
      _map: Object
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
      this.shadowRoot.querySelectorAll("backend-ai-chart").forEach(e => { e.wipe(); });
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
        this.shadowRoot.querySelectorAll('backend-ai-chart').forEach(chart => {chart.init()});
      })
    }
  }

  init() {
    return window.backendaiclient.resources.user_stats()
    .then(res => {
      const { period, template } = this;
      this.data = res;

      this.collection[period] = {};
      Object.keys(this._map).forEach(key => {
        this.collection[period][key] = {
          data: [
            res
              .filter((e, i) => res.length - template[period].length <= i)
              .map(e => ({x: new Date(1000 * e["date"]), y: e[key]})),
          ],
          axisTitle: {
            x: "Date",
            y: this._map[key]
          },
          period
        }
      });

      return this.updateComplete;
    })
  }

  pulldownChange(e) {
    this.period = e.target.value;

    const { data, period, collection, _map, template } = this;

    if (!(period in collection)) {
      collection[period] = {}
      Object.keys(_map).forEach(key => {
        collection[period][key] = {
          data: [
            data
              .filter((e, i) => data.length - template[period].length <= i)
              .map(e => ({x: new Date(1000 * e["date"]), y: e[key]})),
          ],
          axisTitle: {
            x: "Date",
            y: _map[key]
          },
          period
        }
      })
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
      <wl-card class="layout vertical center">
      ${
        Object.keys(this._map).map(key =>
          html`
            <h3>${this._map[key]}</h3>
            <backend-ai-chart
              width="1000"
              height="150"
              elevation="1"
              type="line"
              .collection=${this.collection[this.period][key]}
            ></backend-ai-chart>
          `)
      }
      </wl-card>
    `;
  }
}

customElements.define(BackendAIUsageList.is, BackendAIUsageList);
