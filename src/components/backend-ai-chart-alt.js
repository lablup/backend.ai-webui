import * as d3 from "d3";

import {css, html, LitElement} from "lit-element";
import "@polymer/paper-icon-button/paper-icon-button";
import "weightless/card";

import {BackendAiStyles} from "./backend-ai-console-styles";
import {IronFlex, IronFlexAlignment} from "../plastics/layout/iron-flex-layout-classes";

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
          stroke: #4bc0c0;
          stroke-width: 2;
        }

        .dot {
          fill: #4bc0c0;
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
          font-size: 11px;
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
    const {
      margin,
      graphWidth,
      graphHeight,
      data,
      xScale,
      xAxis,
      yScale,
      line
    } = this.toolbox();

    // queryselector() was used for rect and focus because using d3's select function somehow doesn't work
    const g = d3.select(this.shadowRoot.querySelector("#d3-container")),
          dots = g.selectAll(".dot").data(data),
          rect = d3.select(this.shadowRoot.querySelector("#mouse-rect")),
          focus = d3.select(this.shadowRoot.querySelector("#focus"));

    g
      .select(".line")
      .attr("d", line(data));

    g
      .select(".x.axis")
      .call(xAxis);

    g
      .select(".y.axis")
      .call(d3.axisLeft(yScale));

    dots
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))

    dots
      .exit()
      .remove()

    dots
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 3)

    rect
      .on("mousemove", function() {
        // due to the use of "this", this must be a function, and not an arrow function!
        const x0 = d3.mouse(this)[0] * d3.max(data, d => +d.x) / graphWidth,
              range = xScale.range(),
              bsct = d3.bisect(d3.range(range[0], range[1], xScale.step()), d3.mouse(this)[0]),
              d = x0 - data[bsct - 1].x < data[bsct].x - x0 ? data[bsct - 1] : data[bsct];

        focus
          .select("circle.y")
          .attr("transform", `translate(${xScale(d.x)}, ${yScale(d.y)})`);

        focus
          .select("line.y")
          .attr("transform", `translate(${xScale(d.x)}, 0)`);

        focus
          .select("text.tooltip-y")
          .attr("transform", `translate(${xScale(d.x)}, ${yScale(d.y)})`)
          .text(d.y);

        focus
          .select("text.tooltip-x")
          .attr("transform", `translate(${xScale(d.x)}, ${yScale(d.y)})`)
          .text(d.x);
      })
  }

  toolbox() {
    const margin      = { top: 50, right: 50, bottom: 50, left: 50 },
          graphWidth  = this.width - margin.left - margin.right,
          graphHeight = this.height - margin.top - margin.bottom;

    const data = d3
      .zip(this.collection.data.x, this.collection.data.y)
      .map(e => ({x: +e[0], y: e[1]}));

    const xScale = d3
      .scalePoint()
      .domain(data.map(e => e.x))
      .range([0, graphWidth]);

    let xAxis = d3
      .axisBottom(xScale);

    if (data.length > 24) {
      const step = Math.ceil(data.length / 24);
      xAxis = xAxis.tickValues(data.map(e => e.x).filter((val, idx) => idx % step === 0));
    }

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.y)])
      .range([graphHeight, 0]);

    const line = d3
      .line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    const rectWidth = 40, rectHeight = 40;

    return { margin, graphWidth, graphHeight, data, xScale, xAxis, yScale, line, rectWidth, rectHeight };
  }

  firstUpdated() {
    const {
      margin,
      graphWidth,
      graphHeight,
      data,
      xScale,
      xAxis,
      yScale,
      line,
      rectWidth,
      rectHeight
    } = this.toolbox();

    // outermost "g" element in <svg>
    const g = d3
      .select(this.shadowRoot.querySelector("#d3"))
      .attr("width", this.width)
      .attr("height", this.height)
      .call(svg => this.responsiveHelper(svg))
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .attr('id', 'd3-container');

    // add x axis
    g
      .append("g")
      .attr("class", "x axis axisGray")
      .attr("transform", `translate(0, ${graphHeight})`)
      .call(xAxis);

    // text label for the x axis
    g
      .append("text")
      .attr(
        "transform",
        `translate(${graphWidth / 2}, ${graphHeight + margin.bottom - 15})`
      )
      .style("text-anchor", "middle")
      .attr("class", "normalize")
      .text(this.collection.axisTitle.x);

    // add y axis
    g
      .append("g")
      .attr("class", "y axis axisGray")
      .call(d3.axisLeft(yScale));

    // text label for the x axis
    g
      .append("text")
      .attr(
        "transform",
        `translate(${20 - margin.left}, ${graphHeight / 2}) rotate(-90)`
      )
      .style("text-anchor", "middle")
      .attr("class", "normalize")
      .text(this.collection.axisTitle.y);

    // actual line graph
    g
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

    // dots in data points
    g
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 3);

    // "g" element to render vertical tooltip
    const focus = g
      .append("g")
      .attr("id", "focus")
      .style("display", "none");

    focus
      .append("circle")
      .attr("class", "y")
      .style("fill", "none")
      .style("stroke", "#4bc0c0")
      .attr("r", 4);

    focus
      .append("line")
      .attr("class", "y")
      .style("stroke", "#4bc0c0")
      .attr("y1", 0)
      .attr("y2", graphHeight);

    const tooltip = focus
      .append("g")
      .attr("id", "tooltip");

    tooltip
      .append("rect")
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "rgba(255, 255, 255, 0.49)")
      .style("stroke", "rgba(74, 191, 191)")

    tooltip
      .append("text")
      .attr("class", "tooltip-x")
      .style("font-size", "11px")
      .style("fill", "#37474f")
      .attr("transform", `translate(0, ${rectHeight / 2})`)
      .attr("dx", rectWidth / 2 - 10)
      .attr("dy", "-.3em");

    tooltip
      .append("text")
      .attr("class", "tooltip-y")
      .style("font-size", "11px")
      .style("fill", "#37474f")
      .attr("transform", `translate(0, ${rectHeight / 2})`)
      .attr("dx", rectWidth / 2 - 10)
      .attr("dy", "1em");

    g
      .append("rect")
      .attr("id", "mouse-rect")
      .attr("width", graphWidth)
      .attr("height", graphHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", () => {focus.style("display", "inline")})
      .on("mouseout", () => {focus.style("display", "none")})
      .on("mousemove", function() {
        // due to the use of "this", this must be a function, and not an arrow function!
        const x0 = d3.mouse(this)[0] * d3.max(data, d => +d.x) / graphWidth,
              range = xScale.range(),
              bsct = d3.bisect(d3.range(range[0], range[1], xScale.step()), d3.mouse(this)[0]),
              d = x0 - data[bsct - 1].x < data[bsct].x - x0 ? data[bsct - 1] : data[bsct];

        focus
          .select("circle.y")
          .attr("transform", `translate(${xScale(d.x)}, ${yScale(d.y)})`);

        focus
          .select("line.y")
          .attr("transform", `translate(${xScale(d.x)}, 0)`);

        tooltip
          .attr("transform", `translate(${xScale(d.x) + 5}, ${yScale(d.y) - rectHeight / 2})`)

        tooltip
          .select("text.tooltip-y")
          .text(d.y);

        tooltip
          .select("text.tooltip-x")
          .text(d.x);
      })
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _removePanel() {}
}

customElements.define(BackendAIChartAlt.is, BackendAIChartAlt);
