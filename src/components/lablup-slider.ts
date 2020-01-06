/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, LitElement, property} from "lit-element";
import '@material/mwc-slider';
import '@material/mwc-textfield';
import 'weightless/textfield';

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";
import {BackendAiStyles} from "./backend-ai-console-styles";

@customElement("lablup-slider")
export default class LablupSlider extends LitElement {
  public shadowRoot: any; // ShadowRoot

  @property({type: Number}) step = 1;
  @property({type: Number}) value = 0;
  @property({type: Number}) max = 0;
  @property({type: Number}) min = 0;
  @property({type: Boolean}) editable = null;
  @property({type: Boolean}) pin = null;
  @property({type: Boolean}) markers = null;
  @property({type: Boolean}) disabled = null;
  @property({type: Object}) slider;
  @property({type: Object}) textfield;

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        .mdc-text-field {
          height: 25px;
        }

        wl-textfield {
          width: var(--textfield-min-width, 65px);
          margin-left: 10px;
        }

        mwc-slider {
          width: var(--slider-width, 100px);
          --mdc-theme-secondary: var(--slider-color, '#018786');
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <div class="horizontal center layout">
      <mwc-slider id="slider" class="${this.id}" value="${this.value}" min="${this.min}" max="${this.max}" step="${this.step}"
        ?pin="${this.pin}"
        ?markers="${this.markers}"
        @change="${this.syncToText}"
      ></mwc-slider>
      ${this.editable ? html`<wl-textfield id="textfield" class="${this.id}" type="number"
          value="${this.value}" min="${this.min}" max="${this.max}" step="${this.step}"
          @change="${this.syncToSlider}">

        </wl-textfield>` : html``}
      </div>
    `;
  }

  firstUpdated() {
    this.slider = this.shadowRoot.querySelector('#slider');
    if (this.editable) {
      this.textfield = this.shadowRoot.querySelector('#textfield');
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  syncToText() {
    this.textfield.value = this.slider.value;
    this.syncValue();
  }

  syncToSlider() {
    if (this.textfield.value > this.max) {
      this.textfield.value = this.max;
    }
    if (this.textfield.value < this.min) {
      this.textfield.value = this.min;
    }
    this.slider.value = this.textfield.value;
    this.syncValue();
  }

  syncValue() {
    this.value = this.textfield.value;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lablup-slider": LablupSlider;
  }
}
