/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";
import {IronFlex, IronFlexAlignment} from '../layout/iron-flex-layout-classes';

/**
 `<lablup-piechart>` is a convenient svg-format pie chart.

 Example:
 <lablup-piechart url="" number="50" maxnumber="100"
 chartcolor="#cddc39" unit="%" size="40"></lablup-piechart>

 @group Lablup Elements
 @element lablup-piechart
 */
@customElement("lablup-piechart")
export default class LablupPiechart extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: Number}) currentNumber = 50;
  @property({type: Number}) maxNumber = 100;
  @property({type: String}) unit = '%';
  @property({type: String}) url = '';
  @property({type: String}) textcolor = '#888888';
  @property({type: String}) chartcolor = '#ff2222';
  @property({type: Number}) size = 200;
  @property({type: Number}) fontsize = 60;
  @property({type: String}) chartFontSize = '0';
  @property({type: String}) indicatorPath = '';
  @property({type: String}) prefix = '';
  @property({type: String}) sizeParam = '';

  constructor() {
    super();
  }

  static get is() {
    return 'lablup-piechart';
  }

  static get styles() {
    return [
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        #chart {
          cursor: pointer;
        }
      `];
  }

  firstUpdated() {
    this.sizeParam = this.size + "px";
    let chartFontSize = this.fontsize / this.size;
    if (chartFontSize >= 0.5) {
      chartFontSize = 0.3;
    }
    this.chartFontSize = chartFontSize.toString();
    let chart: HTMLElement = this.shadowRoot.querySelector("#chart");
    let chartText: HTMLElement = this.shadowRoot.querySelector("#chart-text");
    let unitText: HTMLElement = this.shadowRoot.querySelector("#unit-text");
    let unitFontSize: string = (0.3 - this.unit.length * 0.05).toString();
    chart.setAttribute("fill", this.chartcolor);
    chartText.setAttribute("fill", this.textcolor);
    chartText.setAttribute("font-size", this.chartFontSize);
    unitText.setAttribute("font-size", unitFontSize);
    chart.setAttribute("width", this.sizeParam);
    chart.setAttribute("height", this.sizeParam);

    this.indicatorPath = "M 0.5 0.5 L0.5 0 ";
    var number = 100 * (this.maxNumber - this.currentNumber) / this.maxNumber;
    if (number > 12.5) {
      this.indicatorPath = this.indicatorPath + "L1 0 ";
    }
    if (number > 37.5) {
      this.indicatorPath = this.indicatorPath + "L1 1 ";
    }
    if (number > 62.5) {
      this.indicatorPath = this.indicatorPath + "L0 1 ";
    }
    if (number > 87.5) {
      this.indicatorPath = this.indicatorPath + "L0 0 ";
    }
    let th = (number / 100) * 2 * Math.PI;
    let angle = Math.sin(th) / Math.cos(th);
    let x = 0;
    let y = 0;
    if (number <= 12.5 || number > 87.5) {
      y = 0.5;
      x = y * angle;
    } else if (number > 12.5 && number <= 37.5) {
      x = 0.5;
      y = x / angle;
    } else if (number > 37.5 && number <= 62.5) {
      y = -0.5;
      x = y * angle;
    } else if (number > 62.5 && number <= 87.5) {
      x = -0.5;
      y = x / angle;
    }
    x = x + 0.5;
    y = -y + 0.5;
    this.indicatorPath = this.indicatorPath + "L" + x + " " + y + " z";
    this.shadowRoot.querySelector('#pievalue').setAttribute("d", this.indicatorPath);
    if (this.url !== undefined && this.url !== "") {
      this.shadowRoot.querySelector("#chart").addEventListener('tap', this._moveTo.bind(this));
    }
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _moveTo() {
    window.location.href = this.url;
  }

  render() {
    // language=HTML
    return html`
      <svg id="chart"
           xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
           viewBox="0 0 1 1" style="background-color:transparent;">
        <g id="piechart">
          <circle cx="0.5" cy="0.5" r="0.5" />
          <circle cx="0.5" cy="0.5" r="0.40" fill="rgba(255,255,255,0.9)"/>
          <path id="pievalue" stroke="none" fill="rgba(255, 255, 255, 0.75)"/>
          <text id="chart-text" x="0.5" y="0.5" font-family="Roboto" text-anchor="middle"
                dy="0.1">
            <tspan>${this.prefix}</tspan>
            <tspan>${this.currentNumber}</tspan>
            <tspan id="unit-text" font-size="0.2" dy="-0.07">${this.unit}</tspan>
          </text>
        </g>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lablup-piechart": LablupPiechart;
  }
}
