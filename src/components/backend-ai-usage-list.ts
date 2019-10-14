/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import 'weightless/card';
import 'weightless/tab-group';
import 'weightless/tab';
import 'weightless/select';

import {BackendAiStyles} from './backend-ai-console-styles';
import './backend-ai-chart.js'
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

@customElement("backend-ai-usage-list")
export default class BackendAIUsageList extends BackendAIPage {
  @property({type: Object}) _map = {
    "num_sessions": "Sessions",
    "cpu_allocated": "CPU",
    "mem_allocated": "Memory",
    "gpu_allocated": "GPU",
    "io_read_bytes": "IO-Read",
    "io_write_bytes": "IO-Write"
  };
  @property({type: Object}) templates = {
    "1D": {
      "interval": 15 / 15,
      "length": 4 * 24
    },
    "1W": {
      "interval": 15 / 15,
      "length": 4 * 24 * 7
    }
  };
  @property({type: Object}) collection = {};
  @property({type: String}) period = '1D';
  public data: any;

  constructor() {
    super();
    this.data = [];
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

        h3 {
            display: block;
            font-weight: 100;
            width: 100%;
            padding: 5px 15px;
            text-align: left;
            border-top: 1px solid #ccc;
        }
      `
    ]
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name === "active" && newval !== null) {
      if (!this.active) this._menuChanged(true);
      this.active = true;
    } else {
      this.active = false;
      this._menuChanged(false);
      this.shadowRoot.querySelectorAll("backend-ai-chart").forEach(e => {
        e.wipe();
      });
    }

    super.attributeChangedCallback(name, oldval, newval);
  }

  async _menuChanged(active) {
    await this.updateComplete;

    if (active === false) {
      this.shadowRoot.querySelectorAll("backend-ai-chart").forEach(e => {
        e.wipe();
      });
      return;
    }

    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener("backend-ai-connected", () => {
        this.init();
      }, true);
    } else {
      this.init()
        .then(res => {
          this.shadowRoot.querySelectorAll('backend-ai-chart').forEach(chart => {
            chart.init()
          });
        })
    }
  }

  firstUpdated() {
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener("backend-ai-connected", () => {
        this.init()
          .then(res => {
            this.shadowRoot.querySelectorAll('backend-ai-chart').forEach(chart => {
              chart.init()
            });
          })
      }, true);
    } else {
      this.init()
        .then(res => {
          this.shadowRoot.querySelectorAll('backend-ai-chart').forEach(chart => {
            chart.init()
          });
        })
    }
  }

  init() {
    return window.backendaiclient.resources.user_stats()
      .then(res => {
        const {period, templates} = this;
        this.data = res;
        let collection = {};
        collection[period] = {};
        Object.keys(this._map).forEach(key => {
          collection[period][key] = {
            data: [
              res
                .filter((e, i) => res.length - templates[period].length <= i)
                .map(e => ({x: new Date(1000 * e["date"]), y: e[key]["value"]})),
            ],
            axisTitle: {
              x: "Date",
              y: this._map[key]
            },
            period,
            unit_hint: res[0][key].unit_hint
          }

        });
        this.collection = collection;
        return this.updateComplete;
      })
  }

  pulldownChange(e) {
    this.period = e.target.value;

    const {data, period, collection, _map, templates} = this;

    if (!(period in collection)) {
      collection[period] = {};
      Object.keys(_map).forEach(key => {
        collection[period][key] = {
          data: [
            data
              .filter((e, i) => data.length - templates[period].length <= i)
              .map(e => ({x: new Date(1000 * e["date"]), y: e[key]["value"]})),
          ],
          axisTitle: {
            x: "Date",
            y: _map[key]
          },
          period,
          unit_hint: data[data.length - 1][key].unit_hint
        }
      })
    }
  }

  render() {
    // language=HTML
    return html`
      <div class="layout horizontal end-justified flex">
      <div class="flex"></div>
        <wl-select label="Select Period" style="width: 130px" @input=${this.pulldownChange}>
          <option value disabled>Select Period</option>
          <option value="1D" selected>1 Day</option>
          <option value="1W">1 Week</option>
        </wl-select>
      </div>
      <div class="layout vertical center flex wrap">
      ${this.collection != {} ?
      Object.keys(this._map).map((key, idx) =>
        html`
          <div class="layout horizontal center flex" style="width:100%;">
              <h3>${this._map[key]}</h3>
              <span></span>
              <span class="flex"></span>
          </div>
          <backend-ai-chart
            width="1000"
            height="180"
            elevation="1"
            type="line"
            idx=${idx}
            .collection=${this.collection[this.period][key]}
          ></backend-ai-chart>
          `) : html``}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-usage-list": BackendAIUsageList;
  }
}
