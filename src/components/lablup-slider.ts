/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, LitElement, property, query} from "lit-element";
import '@material/mwc-slider';
import 'weightless/textfield';

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";
import {BackendAiStyles} from "./backend-ai-general-styles";

/**
 Lablup Slider

 `lablup-slider` is slider of session launcher and resource monitor.

 Example:

 <lablup-slider></lablup-slider>

 @group Backend.AI Console
 @element lablup-slider
 */

@customElement("lablup-slider")
export default class LablupSlider extends LitElement {
  public shadowRoot: any; // ShadowRoot

  @property({type: Number}) step;
  @property({type: Number}) value;
  @property({type: Number}) max;
  @property({type: Number}) min;
  @property({type: Boolean}) editable = null;
  @property({type: Boolean}) pin = null;
  @property({type: Boolean}) markers = null;
  @property({type: Number}) marker_limit = 30;
  @property({type: Boolean}) disabled = null;
  @property({type: Object}) textfield;
  @query('#slider') slider;

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
          --input-state-color-invalid :  var(--input-state-color-inactive,hsl(var(--shade-400,var(--shade-hue,200),var(--shade-saturation,4%),var(--shade-lightness,65%))));
          width: var(--textfield-min-width, 65px);
          margin-left: 10px;
        }

        mwc-slider {
          width: var(--slider-width, 100px);
          --mdc-theme-secondary: var(--slider-color, '#018786');
          color: var(--paper-grey-700);
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <div class="horizontal center layout">
      <mwc-slider id="slider" class="${this.id}" value="${this.value}"
          min="${this.min}" max="${this.max}"
          ?pin="${this.pin}"
          ?disabled="${this.disabled}"
          ?markers="${this.markers}"
          @change="${this.syncToText}">
      </mwc-slider>
      <wl-textfield style="display:none" id="textfield" class="${this.id}" type="number"
        value="${this.value}" min="${this.min}" max="${this.max}" step="${this.step}"
        @change="${this.syncToSlider}">
      </wl-textfield>
      </div>
    `;
  }

  firstUpdated() {
    if (this.editable) {
      this.textfield = this.shadowRoot.querySelector('#textfield');
      this.textfield.style.display = 'flex';
    }

    // wl-textfield does not provide step property. The default step for number input
    // is 1, so float numbers will invalidate the wl-textfield, which is a problem.
    // So, we manually set the step property of wl-textfield's input field here.
    const textfields = this.shadowRoot.querySelectorAll('wl-textfield');
    setTimeout(() => {
      textfields.forEach((el) => {
        const step = el.getAttribute('step');
        el.$formElement.step = step;
      });
    }, 100);
    if (this.step) {
    } else {
      this.step = 1.0;
    }
    this.checkMarkerDisplay();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  updated(changedProperties) {
    changedProperties.forEach((oldVal, propName) => {
      if (propName === 'value') {
        setTimeout(()=>{
          if (this.editable) {
            this.syncToSlider();
          }
          this.slider.layout();
        }, 500);
        const event = new CustomEvent('value-changed', {'detail': {}});
        this.dispatchEvent(event);
      }
      if (['min', 'max'].includes(propName)) {
        this.checkMarkerDisplay();
      }
    });
    let event = new CustomEvent('changed', {"detail": ''});
    this.dispatchEvent(event);
  }

  /**
   * Synchronize value with slider value.
   * */
  syncToText() {
    this.value = this.slider.value;
    // updated function will be automatically called.
  }

  /**
   * Setting value, slider value, and slider step to synchronize with slider.
   * */
  syncToSlider() {
    let rounded = Math.round(this.textfield.value / this.step) * this.step;
    this.textfield.value = rounded.toFixed(((decimal_places: number) => {
      if (Math.floor(decimal_places) === decimal_places) {
        return 0;
      }
      return decimal_places.toString().split(".")[1].length || 0;
      })(this.step));
    if (this.textfield.value > this.max) {
      this.textfield.value = this.max;
    }
    if (this.textfield.value < this.min) {
      this.textfield.value = this.min;
    }
    this.value = this.textfield.value;
    this.slider.value = this.textfield.value;
    this.slider.step = this.step;
    // updated function will be automatically called.
  }

  /**
   * Check marker display or not.
   * */
  checkMarkerDisplay() {
    if (this.markers) {
      if (((this.max - this.min) / this.step) > this.marker_limit) {
        this.slider.removeAttribute('markers');
      }
    }
    this.slider.setAttribute('step', this.step);
    this.slider.step = this.step;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lablup-slider": LablupSlider;
  }
}
