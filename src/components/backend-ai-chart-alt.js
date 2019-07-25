import * as d3  from 'd3';

import {css, html, LitElement} from "lit-element";
import '@polymer/paper-icon-button/paper-icon-button';
import 'weightless/card';

import {BackendAiStyles} from './backend-ai-console-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

class BackendAIChartAlt extends LitElement {
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
    return 'backend-ai-chart-alt';
  }

  static get styles() {
    return [
      BackendAiStyles,
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
          font-size: 12px;
        }

        #chart-canvas {
          margin: auto 10px;
        }

        @media screen and (max-width: 899px) {
          #chart-canvas {
            width: 90%;
          }
        }

        @media screen and (min-width: 900px) {
          #chart-canvas {
            width: calc(100vw - 400px);
            height: 450px;
          }
        }

        .line {
          fill: none;
          stroke: #ffab00;
          stroke-width: 3;
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
      <div>
        <h3>${this.title}</h3>
        <div class="layout vertical">
          <div id="d3"></div>
        </div>
      </div>
    `;
  }

  responsiveHelper(svg) {
    const container = d3.select(svg.node().parentNode),
          width     = parseInt(svg.node().getAttribute('width')),
          height    = parseInt(svg.node().getAttribute('height')),
          aspect    = width / height;

    const resize = () => {
      const { offsetWidth } = this.shadowRoot.host.parentNode;
      const targetWidth = offsetWidth > 2800 ? 0.2 * offsetWidth :
                          offsetWidth > 2000 ? 0.4 * offsetWdith : 500;
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
    }

    svg.attr("viewBox", `0 0 ${width} ${height}`)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    d3.select(window).on(`resize.${container.attr('id')}`, resize);
  }

  firstUpdated() {
    const xScale = d3.scaleLinear()
          .domain([0, this.data.length - 1])
          .range([0, this.width]);

    const yScale = d3.scaleLinear()
          .domain([0, d3.max(this.data)])
          .range([this.height, 0]);

    const line = d3.line()
          .x((d, i) => xScale(i))
          .y(d => yScale(d))
          .curve(d3.curveMonotoneX);

    const svg = d3.select(this.shadowRoot.querySelector('#d3')).append('svg')
          .attr('width', this.width)
          .attr('height', this.height)
          .call(svg => this.responsiveHelper(svg));

    svg.append('g')
       .attr('class', 'x axis')
       .attr('transform', `translate(0, ${this.height - 20})`)
       .call(d3.axisBottom(xScale));

    svg.append('g')
       .attr('class', 'y axis')
       .attr('transform', `translate(30, 0)`)
       .call(d3.axisLeft(yScale));

    svg.append('path')
       .datum(this.data)
       .attr('class', 'line')
       .attr('d', line);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _removePanel() {

  }
}

customElements.define(BackendAIChartAlt.is, BackendAIChartAlt);
