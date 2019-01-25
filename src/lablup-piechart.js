import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';

/**
 `<lablup-piechart>` is a convenient svg-format pie chart.

 Example:
 <lablup-piechart url="" number="50" maxnumber="100"
 chartcolor="#cddc39" unit="%" size="40"></lablup-piechart>

 @group Lablup Elements
 @element lablup-piechart
 */

class LablupPiechart extends PolymerElement {
  static get is() {
    return 'lablup-piechart';
  }

  static get properties() {
    return {
      number: {
        type: Number,
        value: 50
      },
      maxnumber: {
        type: Number,
        value: 100
      },
      unit: {
        type: String,
        value: '%'
      },
      url: {
        type: String
      },
      textcolor: {
        type: String,
        value: '#888'
      },
      chartcolor: {
        type: String,
        value: '#F22'
      },
      size: {
        type: Number,
        value: 200
      },
      fontsize: {
        type: Number,
        value: 60
      },
      prefix: {
        type: String,
        value: ''
      },
      sizeParam: String
    }
  }

  constructor() {
    super();
  }

  ready() {
    super.ready();
    this.sizeParam = this.size + "px";
    this.chartFontSize = this.fontsize / this.size;
    if (this.chartFontSize >= 0.5) {
      this.chartFontSize = 0.3;
    }
    this.shadowRoot.querySelector("#chart").setAttribute("fill", this.chartcolor);
    this.shadowRoot.querySelector("#chart-text").setAttribute("fill", this.textcolor);
    this.shadowRoot.querySelector("#chart-text").setAttribute("font-size", this.chartFontSize);
    this.shadowRoot.querySelector("#unit-text").setAttribute("font-size", 0.3 - this.unit.length * 0.05);
    this.shadowRoot.querySelector("#chart").setAttribute("width", this.sizeParam);
    this.shadowRoot.querySelector("#chart").setAttribute("height", this.sizeParam);

    this.indicatorPath = "M 0.5 0.5 L0.5 0 ";
    var number = 100 * (this.maxnumber - this.number) / this.maxnumber;
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
    var th = (number / 100) * 2 * Math.PI;
    var angle = Math.sin(th) / Math.cos(th);
    var x = 0;
    var y = 0;
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
    this.$.pievalue.setAttribute("d", this.indicatorPath);
    if (this.url != undefined && this.url != "") {
      this.shadowRoot.querySelector("#chart").addEventListener('tap', this._moveTo.bind(this));
    }
    this.updateStyles();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _moveTo() {
    window.location.href = this.url;
  }

  static get template() {
    // language=HTML
    return html`
      <style is="custom-style" include="iron-flex iron-flex-alignment">
        :host {
          @apply(--layout-vertical)
        }

        #chart {
          cursor: pointer;
        }
      </style>
      <svg id="chart"
           xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
           viewBox="0 0 1 1" style="background-color:transparent;">
        <g id="piechart">
          <circle cx=0.5 cy=0.5 r=0.5/>
          <circle cx=0.5 cy=0.5 r=0.40 fill="rgba(255,255,255,0.9)"/>
          <path id="pievalue" stroke="none" fill="rgba(255, 255, 255, 0.75)"/>
          <text id="chart-text" x="0.5" y="0.5" font-family="Roboto" text-anchor="middle"
                dy="0.1">
            <tspan>{{ prefix }}</tspan>
            <tspan>{{ number }}</tspan>
            <tspan id="unit-text" font-size="0.2" dy="-0.07">{{ unit }}</tspan>
          </text>
        </g>
      </svg>
    `;
  }
}

customElements.define(LablupPiechart.is, LablupPiechart);
