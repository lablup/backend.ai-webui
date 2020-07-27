/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {customElement, html, LitElement, property} from "lit-element";

import "weightless/card";
import "../plastics/chart-js";
import format from 'date-fns/format';

import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment} from "../plastics/layout/iron-flex-layout-classes";

const ByteConverter = {
  toB: bytes => bytes,
  toKB: bytes => bytes / 1024,
  toMB: bytes => bytes / (1024 * 1024),
  toGB: bytes => bytes / (1024 * 1024 * 1024),
  toTB: bytes => bytes / (1024 * 1024 * 1024 * 1024),
  log1024: n => n <= 0 ? 0 : Math.log(n) / Math.log(1024),

  readableUnit: function (bytes) {
    return ["B", "KB", "MB", "GB", "TB"][Math.floor(this.log1024(bytes))];
  },

  scale: function (data, targetUnit = '') {
    let minUnit;
    if (targetUnit === '') {
      minUnit = this.readableUnit(Math.min.apply(null, data.map(d => d.y)))
    } else {
      minUnit = 'MB';
    }
    return {
      data: data.map(e => ({
        ...e,
        y: this[`to${minUnit}`](e.y)
      })),
      unit: minUnit
    };
  }
};

const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1)
};

/**
 Backend.AI Chart

 @group Backend.AI Console
 @element backend-ai-chart
 */

@customElement("backend-ai-chart")
export default class BackendAIChart extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: Number}) idx;
  @property({type: Object}) collection;
  @property({type: Object}) chartData;
  @property({type: Object}) options;
  @property({type: Object}) chart;
  @property({type: String}) type;

  /**
   * @param collection              {object}   Object containing the fields listed below
   * @param collection.data         {Array}    Array containing objects of x y values
   * @param collection.axisTitle    {object}   Object containing x axis title at key "x" and y axis title at key "y"
   * @param collection.axisTitle.x  {string} X axis title
   * @param collection.axisTitle.y  {string} Y axis title
   */
  constructor() {
    super();
  }

  firstUpdated() {
    this.chart = this.shadowRoot.querySelector('#chart');
    if (this.collection.axisTitle['y']) {
      this.type = (this.collection.axisTitle['y'] == 'Sessions' || this.collection.axisTitle['y'] == 'CPU') ? 'bar' : 'line';
    }
    this._updateChartData();
  }

  _updateChartData() {
    if (this.collection.unit_hint === "bytes") this.scaleData();

    let temp = this.collection.data[0]
      .map(e => (format(e.x, 'MMM dd HH:mm')));
    let colors = {
      'Sessions': '#ec407a', 'CPU': '#9ccc65', 'Memory': '#ffa726',
      'GPU': '#26c6da', 'IO-Read': '#3677eb', 'IO-Write': '#003f5c'
    };
    let maxTicksLimit = (this.collection.period == '1D') ? 8 : 14;
    let maxRotation = (this.collection.period == '1D') ? 0 : 50;

    this.chartData = {
      labels: temp,
      datasets: [{
        label: this.collection.axisTitle['y'] + ' (' + this.collection.unit_hint + ')',
        data: this.collection.data[0],
        barThickness: 6,
        borderWidth: 1,
        borderColor: colors[this.collection.axisTitle['y']],
        backgroundColor: colors[this.collection.axisTitle['y']],
        parsing: {
          xAxisKey: 'x',
          yAxisKey: 'y'
        }
      }],
    };

    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: true
      },
      tooltips: {
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          ticks: {
            major: {
              enabled: true
            },
            source: 'data',
            autoSkip: true,
            sampleSize: 100,
            maxTicksLimit: maxTicksLimit,
            maxRotation: maxRotation,
            callback: function (value) {
              return value.slice(0, -2) + '00';
            },
            font: function (context) {
              let width = context.chart.width;
              let size = Math.round(width / 64) < 12 ? Math.round(width / 64) : 12;
              return {
                size: size,
              };
            },
          },
          scaleLabel: {
            display: true,
            align: 'end',
            labelString: this.collection.axisTitle.x
          }
        },
        y: {
          responsive: true,
          beginAtZero: true,
          display: true,
          ticks: {
            maxTicksLimit: 5,
            callback: function (value) {
              return Math.round(value);
            },
            font: function (context) {
              let height = context.chart.height;
              let size = Math.round(height / 16) < 12 ? Math.round(height / 16) : 12;
              return {
                size: size,
              };
            },
          },
          scaleLabel: {
            display: true,
            labelString: capitalize(this.collection.unit_hint)
          }
        }
      }
    };
  }

  render() {
    // language=HTML
    return html`
      <div class="layout vertical center">
        <div id="ctn-chartjs${this.idx}">
        ${this.type == 'bar' ?
      html`<chart-js id="chart" type="bar" .data="${this.chartData}" .options="${this.options}"></chart-js>` :
      html`<chart-js id="chart" type="line" .data="${this.chartData}" .options="${this.options}"></chart-js>`}
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
      collection: {
        type: Object,
        hasChanged(newval, oldval) {
          if (oldval === undefined) return true;
          if (newval.period !== oldval.period) return true;
          return false;
        }
      }
    };
  }

  static get is() {
    return "backend-ai-chart";
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
    ];
  }

  updated(changedProps) {
    if (changedProps.has('collection') && changedProps.get("collection") !== undefined) {
      this._updateChartData();
    }
  }

  /*
   * There's a flaw in this code that could potentially lead to problems
   *
   * This chart component allows multiple line graphs to be displayed in a single chart,
   * that is, this.collection.data is an array of arrays.
   *
   * This file also has a ByteConverter that scales the data based on their size.
   * This converter adjusts the scale for each array in this.collection.data, meaning that
   * if their scales are different, the chart will be messed up
   *
   * To resolve this issue, the code must follow the lowest unit among the arrays.
   */
  scaleData() {
    const converted = this.collection.data.map(e => ByteConverter.scale(e, 'MB'));
    this.collection.data = converted.map(e => e.data);
    this.collection.unit_hint = {"B": 'Bytes', "KB": 'KBytes', "MB": 'MB', "GB": 'GB', "TB": 'TB'}[converted[0].unit];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-chart": BackendAIChart;
  }
}
