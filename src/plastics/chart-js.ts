/*
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {Chart} from 'chart.js';
import {css, html, LitElement, property, TemplateResult} from 'lit-element';

export default class ChartJs extends LitElement {
  @property({type: Chart}) chart;
  @property({type: Chart.ChartType}) type = '';
  @property({type: Chart.ChartData}) data = {};
  @property({type: Chart.ChartOptions}) options = {};

  update(prop) {
    super.update(prop);
    if (this.chart) {
      this.chart.type = this.type;
      this.chart.data = this.data;
      this.chart.options = this.options;
      if (typeof this.data !== 'undefined' && typeof this.options !== 'undefined' && this.type != '' && this.data != {} && this.options != {}) {
        this.updateChart();
      }
    } else {
      if (typeof this.data !== 'undefined' && typeof this.options !== 'undefined' && this.type != '' && this.data != {} && this.options != {}) {
        this._initializeChart();
      }
    }
  }

  _initializeChart() {
    const ctx: CanvasRenderingContext2D = (this.shadowRoot as any)
      .querySelector('canvas')
      .getContext('2d');
    this.chart = new Chart(ctx, {
      type: this.type,
      data: this.data,
      options: this.options
    });
  }

  static get styles() {
    return [
      // language=CSS
      css`
        .chart-top-container {
          margin: 0px auto;
          padding: 5px;
          overflow: hidden;
          width: 70vw;
          height: 25vh;
        }

        .chart-sub-container {
          position:relative;
          width: 100%;
          height: 100%
        }
      `
    ];
  }

  public firstUpdated(): void {
    if (this.type != '' && this.data != {} && this.options != {}) {
      this._initializeChart();
    } else {
    }
    window.addEventListener('resize', () => {
      if (this.chart) {
        this.chart.resize();
      }
    });
  }

  public render(): void | TemplateResult {
    return html`
      <div class="chart-top-container">
        <div class="chart-shell chart-sub-container">
          <canvas></canvas>
        </div>
      </div>
  `;
  }

  public updateChart = (): void => {
    if (this.chart) {
      this.chart.update();
    }
  }
}
if (!customElements.get('chart-js')) {
  customElements.define('chart-js', ChartJs);
}
