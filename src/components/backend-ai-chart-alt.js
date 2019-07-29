import * as d3  from 'd3';

import {css, html, LitElement} from "lit-element";
import '@polymer/paper-icon-button/paper-icon-button';
import 'weightless/card';

import {BackendAiStyles} from './backend-ai-console-styles';
import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

class BackendAIChartAlt extends LitElement {
  /**
   * @param collection              {json}   Object containing the fields listed below
   * @param collection.labels       {array}  Array containing x axis labels
   * @param collection.axisTitle   {json}   object containing x axis title at key "x" and y axis title at key "y"
   * @param collection.axisTitle.x {string} X axis title
   * @param collection.axisTitle.y {string} Y axis title
   * @param collection.title        {string} Title of graph
   * @param collection.values       {array}  The actual data
   */
  constructor() {
    super();
    this.title = "";
    this.elevation = 1;
    this.message = "";
    this.collection = {};
    this.width = 300;
    this.height = 300;
    this.type = "line";
  }

  static get is() {
    return "backend-ai-chart-alt";
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

        .line {
          fill: none;
          stroke: rgb(75, 192, 192);
          stroke-width: 2;
        }

        .dot {
          fill: rgb(75, 192, 192);
          stroke: #fff;
        }

        .axisGray line {
          stroke: #646464;
        }

        .axisGray path {
          stroke: #646464;
        }

        .textGray text {
          fill: #8c8c8c;
        }

        text.normalize {
          font-size: 13px;
        }
      `
    ];
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
      collection: {
        type: Object
      },
      width: {
        type: Number
      },
      height: {
        type: Number
      },
      type: {
        type: String
      }
    };
  }

  updated(changedProps) {
    if (changedProps.has('collection') && changedProps.get('collection') !== undefined) {
      this.draw();
    }
  }

  render() {
    // language=HTML
    return html`
      <div class="layout vertical center">
        <h3>${this.title}</h3>
        <div class="layout vertical">
          <div>
            <svg id="d3"></svg>
          </div>
        </div>
      </div>
    `;
  }

  _scaledSVGWidth(offsetWidth) {
    return offsetWidth > 1700 ? 1600:
           offsetWidth > 1400 ? 1300:
           offsetWidth > 1200 ? 1000:
           offsetWidth >  900 ?  800:
           offsetWidth >  700 ?  600:
                                 400;
  }

  responsiveHelper(svg) {
    const container = d3.select(svg.node().parentNode),
          width     = parseInt(svg.node().getAttribute("width")),
          height    = parseInt(svg.node().getAttribute("height")),
          aspect    = width / height;

    const resize = () => {
      const { offsetWidth } = this.shadowRoot.host.parentNode;
      const targetWidth = this._scaledSVGWidth(offsetWidth);
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
    };

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("perserveAspectRatio", "xMinYMid")
      .call(resize);

    d3.select(window).on(`resize.${container.attr("id")}`, resize);
  }

  draw() {
    const margin      = { top: 50, right: 10, bottom: 50, left: 50 },
          graphWidth  = this.width - margin.left - margin.right,
          graphHeight = this.height - margin.top - margin.bottom;

    const data = d3
      .zip(this.collection.data.x, this.collection.data.y)
      .map(e => ({
        x: e[0],
        y: e[1]
      }))

    const g = d3.select(this.shadowRoot.querySelector('#d3-container'));

    const xScale = d3
      .scalePoint()
      .domain(data.map(e => e.x))
      .range([0, graphWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.y)])
      .range([graphHeight, 0]);

    const line = d3
      .line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    g
      .select('.line')
      .attr('d', line(data));

    g
      .select('.x.axis')
      .call(d3.axisBottom(xScale));

    g
      .select('.y.axis')
      .call(d3.axisLeft(yScale));

    const dots = g.selectAll('.dot').data(data);

    dots
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))

    dots
      .exit()
      .remove()

    dots
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 3)
  }

  firstUpdated() {
    // https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89
    const margin      = { top: 50, right: 10, bottom: 50, left: 50 },
          graphWidth  = this.width - margin.left - margin.right,
          graphHeight = this.height - margin.top - margin.bottom;

    const data = d3
      .zip(this.collection.data.x, this.collection.data.y)
      .map(e => ({
        x: e[0],
        y: e[1]
      }))

    const xScale = d3
      .scalePoint()
      .domain(data.map(e => e.x))
      .range([0, graphWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.y)])
      .range([graphHeight, 0]);

    const line = d3
      .line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    const svg = d3
      .select(this.shadowRoot.querySelector("#d3"))
      .attr("width", this.width)
      .attr("height", this.height)
      .call(svg => this.responsiveHelper(svg))
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .attr('id', 'd3-container');

    // add x axis
    svg
      .append("g")
      .attr("class", "x axis axisGray")
      .attr("transform", `translate(0, ${graphHeight})`)
      .call(d3.axisBottom(xScale));

    // text label for the x axis
    svg
      .append("text")
      .attr(
        "transform",
        `translate(${graphWidth / 2}, ${graphHeight + margin.bottom - 15})`
      )
      .style("text-anchor", "middle")
      .attr("class", "normalize")
      .text(this.collection.axisTitle.x);

    // add y axis
    svg
      .append("g")
      .attr("class", "y axis axisGray")
      .call(d3.axisLeft(yScale));

    // text label for the x axis
    svg
      .append("text")
      .attr(
        "transform",
        `translate(${20 - margin.left}, ${graphHeight / 2}) rotate(-90)`
      )
      .style("text-anchor", "middle")
      .attr("class", "normalize")
      .text(this.collection.axisTitle.y);

    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 3);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _removePanel() {}
}

customElements.define(BackendAIChartAlt.is, BackendAIChartAlt);
