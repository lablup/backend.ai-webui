import {css, html, LitElement} from "lit-element";
import '@polymer/paper-icon-button/paper-icon-button';
import 'weightless/card';

import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

import '../lib/Chart.bundle.min.js';

class BackendAIChart extends LitElement {
  /**
   * @param data              {json}   Object containing the fields listed below
   * @param data.labels       {array}  Array containing x axis labels
   * @param data.axisTitles   {json}   object containing x axis title at key "x" and y axis title at key "y"
   * @param data.axisTitles.x {string} X axis title
   * @param data.axisTitles.y {string} Y axis title
   * @param data.title        {string} Title of graph
   * @param data.values       {array}  The actual data
   */
  constructor() {
    super();
    this.title = '';
    this.elevation = 1;
    this.message = '';
    this.data = {};
    this.width = 300;
    this.height = 300;
    this.type = 'line';
  }

  static get is() {
    return 'backend-ai-chart';
  }

  static get styles() {
    return [
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        wl-card {
          display: block;
          background: white;
          box-sizing: border-box;
          margin: 15px 0px;
          padding: 0;
          border-radius: 5px;
        }

        wl-card > div {
          padding: 10px;
          font-size: 12px;
        }
      `];
  }

  static get properties() {
    return {
      title: {
        type: String
      },
      elevation: {
        type: Number
      },
      message: {
        type: String
      },
      data: {
        type: Object
      },
      width: {
        type: Array
      },
      height: {
        type: Array
      },
      type: {
        type: String
      }
    }
  }

  render() {
    // language=HTML
    return html`
      <wl-card>
        <div class="layout vertical">
          <div class="layout horizontal around-justified">
            <h1>${this.title}</h1>
          </div>
          <div>
            <canvas id="chart-canvas" style="width: 800px; display: block; margin: auto"></canvas>
          </div>
        </div>
      </wl-card>
    `;
  }

  firstUpdated() {
    this.shadowRoot.querySelector('wl-card').style.width = `${this.width}px`;
    this.shadowRoot.querySelector('#chart-canvas').style.width = `${this.width * 0.8}px`

    const ctx = this.shadowRoot.querySelector('#chart-canvas');
    new Chart(ctx, {
      type: this.type,
      data: {
        labels: this.data.labels,
        datasets: [{
          label: this.data.title,
          data: this.data.values,
          backgroundColor:'rgba(75,192,192,0.7)'
        }]
      },
      options: {
        responsive: false,
        aspectRatio: 4,
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: this.data.axisTitles.x
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: this.data.axisTitles.y
            }
          }],
        }
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _removePanel() {

  }
}

customElements.define(BackendAIChart.is, BackendAIChart);
