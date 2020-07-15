/*
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.

 This file uses some code of chartjs-web-components (https://github.com/fsx950223/chartjs-web-components)
 */
import Chart from 'chart.js/dist/Chart.esm.min';
import {html, LitElement, property, TemplateResult} from 'lit-element';

/**
 * Base Chart of chartjs-web-components
 */
export default class BaseChart extends LitElement {
  public chart: Chart.ChartConfiguration & Chart;
  @property({type: Chart.ChartType}) type = 'line';
  @property({type: Chart.ChartData}) data = {};
  @property({type: Chart.ChartOptions}) options = {};


  update() {
    super.update();
    if (this.chart) {
      this.chart.type = this.type;
      this.chart.data = this.data;
      this.chart.options = this.options;
      this.updateChart();
    } else {
      this._initializeChart();
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

  /**
   * Called when the dom first time updated. init chart.js data, add observe, and add resize listener
   */
  public firstUpdated(): void {
    const data: Chart.ChartData = this.data || {};
    const options: Chart.ChartOptions = this.options || {};
    //console.log(data);
    //console.log(options);
    if (!this.chart) {
      const ctx: CanvasRenderingContext2D = (this.shadowRoot as any)
        .querySelector('canvas')
        .getContext('2d');
      this.chart = new Chart(ctx, {
        type: this.type,
        data,
        options
      });
    } else {
      this.chart.type = this.type;
      this.chart.data = data;
      this.chart.options = options;
      this.chart.update();
    }
    /*this.chart.data = this.observe(this.chart.data);
    for (const prop of Object.keys(this.chart.data)) {
      this.chart.data[prop] = this.observe(this.chart.data[prop]);
    }
    this.chart.data.datasets = this.chart.data.datasets.map((dataset: Chart.ChartDataSets) => {
      dataset.data = this.observe(dataset.data);

      return this.observe(dataset);
    });*/
    window.addEventListener('resize', () => {
      if (this.chart) {
        this.chart.resize();
      }
    });
  }

  attributeChangedCallback(name, oldval, newval) {
    console.log('attribute changed:', name, newval);
  }

  /**
   * Use Proxy to watch object props change
   * @params obj
   */
  public observe<T extends object>(obj: T): T {
    const updateChart: () => void = this.updateChart;
    console.log("changed object:", obj);

    return new Proxy(obj, {
      set: (target: T, prop: string, val: unknown): boolean => {
        target[prop] = val;
        console.log('updated:', val);
        Promise.resolve()
          .then(updateChart);
        return true;
      }
    });
  }

  /**
   * Use lit-html render Elements
   */
  public render(): void | TemplateResult {
    return html`
            <style>
                .chart-size{
                    position: relative;
                }
                canvas{
                    width:400px;
                    height:400px;
                }
            </style>
            <div class="chart-size">
                <canvas></canvas>
            </div>
        `;
  }

  /**
   * Get update state,when element update completed will return true
   */
  get updateComplete(): Promise<unknown> {
    return (async (): Promise<unknown> => {
      return super.updateComplete;
    })();
  }

  /**
   * Manually update chart
   */
  public updateChart = (): void => {
    if (this.chart) {
      console.log('calling update');
      console.log(this.chart.data);
      this.chart.update();
    }
  }
}
if (!customElements.get('base-chart')) {
  customElements.define('base-chart', BaseChart);
}
