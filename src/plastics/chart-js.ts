/*
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import Chart from 'chart.js';
import {html, LitElement, property, TemplateResult} from 'lit-element';

export default class ChartJs extends LitElement {
  @property({type: Chart}) chart;
  @property({type: Chart.ChartType}) type = '';
  @property({type: Chart.ChartData}) data = {};
  @property({type: Chart.ChartOptions}) options = {};
  @property({type: String}) width = '80vw';
  @property({type: String}) height = '15vh';

  update(prop) {
    super.update(prop);
    if (this.chart) {
      this.chart.type = this.type;
      this.chart.data = this.data;
      this.chart.options = this.options;
      if (this.type != '' && this.data != {} && this.options != {}) {
        this.updateChart();
      }
    } else {
      if (this.type != '' && this.data != {} && this.options != {}) {
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
      <div class="chart-shell" style="position:relative;width:${this.width};height:${this.height}">
        <canvas></canvas>
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
