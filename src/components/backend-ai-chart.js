import {css, html, LitElement} from "lit-element";
import '@polymer/paper-icon-button/paper-icon-button';
import 'weightless/card';

import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

import * as d3 from 'd3';

class BackendAIChart extends LitElement {
  constructor() {
    super();
    this.title = '';
    this.elevation = 1;
    this.message = '';
    this.data = [];
    this.width = 300;
    this.height = 300;
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
          margin: 16px;
          padding: 0;
          border-radius: 5px;
        }

        wl-card > h4 {
          border-left: 3px solid var(--paper-green-900);
          background-color: var(--paper-green-500);
          color: #eee;
          font-size: 14px;
          font-weight: 400;
          height: 32px;
          padding: 5px 15px 5px 20px;
          margin: 0 0 10px 0;
          border-bottom: 1px solid #DDD;
          @apply --layout-justified;
          display: flex;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        wl-card > div {
          padding: 10px;
          font-size: 12px;
        }

        wl-card > h4 > paper-icon-button {
          display: flex;
        }

        wl-card > h4 > paper-icon-button,
        wl-card > h4 > paper-icon-button #icon {
          width: 15px;
          height: 15px;
          padding: 0;
        }

        ul {
          padding-inline-start: 0;
        }

        #button {
          display: none;
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
        type: Array
      },
      width: {
        type: Array
      },
      height: {
        type: Array
      }
    }
  }

  render() {
    // language=HTML
    return html`
      <wl-card id="activity" elevation="${this.elevation}">
        <h4 class="layout flex justified center">${this.title}</h4>
        <div id="d3">
        </div>
      </wl-card>
    `;
  }

  firstUpdated() {
    const svg = d3.select(this.shadowRoot.querySelector('#d3'))
        .append('svg')
        .attr("width", this.width)
        .attr("height", this.height);

    const barWidth = (this.width / this.data.length);

    const barChart = svg.selectAll('rect')
        .data(this.data)
        .enter()
        .append('rect')
        .attr('y', d => this.height - d)
        .attr('height', d => d)
        .attr('width', barWidth - 5)
        .attr('transform', (d, i) => `translate(${[barWidth * i, 0]})`);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _removePanel() {
  }
}

customElements.define(BackendAIChart.is, BackendAIChart);
