/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import '@material/mwc-slider';
import '@material/mwc-textfield/mwc-textfield';

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import {BackendAiStyles} from './backend-ai-general-styles';

/**
 Lablup Slider

 `lablup-slider` is slider of session launcher and resource monitor.

 Example:

 <lablup-slider></lablup-slider>

@group Backend.AI Web UI
 @element lablup-slider
 */

@customElement('lablup-slider')
export default class LablupSlider extends LitElement {
  public shadowRoot: any; // ShadowRoot

  @property({type: Number}) step;
  @property({type: Number}) value;
  @property({type: Number}) max;
  @property({type: Number}) min;
  @property({type: String}) prefix;
  @property({type: String}) suffix;
  @property({type: Boolean}) editable = false;
  @property({type: Boolean}) pin = false;
  @property({type: Boolean}) markers = false;
  @property({type: Number}) marker_limit = 30;
  @property({type: Boolean}) disabled = false;
  @property({type: Object}) textfield;
  @query('#slider', true) slider;

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        mwc-textfield {
          width: var(--textfield-min-width, 65px);
          height: 40px;
          margin-left: 10px;
          // --mdc-theme-primary: transparent;
          --mdc-text-field-hover-line-color: transparent;
          --mdc-text-field-idle-line-color: transparent;
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
                    @change="${() => this.syncToText()}">
        </mwc-slider>
        <mwc-textfield id="textfield" class="${this.id}" type="number"
                      value="${this.value}" min="${this.min}" max="${this.max}" step="${this.step}"
                      prefix="${this.prefix}" suffix="${this.suffix}"
                      ?disabled="${this.disabled}">
        </mwc-textfield>
      </div>
    `;
  }

  firstUpdated() {
    if (this.editable) {
      this.textfield = this.shadowRoot.querySelector('#textfield');
      this.textfield.style.display = 'flex';
      this.textfield.addEventListener('change', (e) => {
        // FIX ME: the value itself doesn't change.
        this.syncToSlider();
      });
    }
    this.checkMarkerDisplay();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  update(changedProperties: Map<any, any>) {
    if (Array.from(changedProperties.keys()).some((item) => ['value', 'min', 'max'].includes(item))) {
      // this.min = (this.min >= this.max) ? 0 : this.min;
      if (this.min == this.max) {
        this.max = this.max + 1;
        this.value = this.min;
        this.disabled = true;
      }
    }
    // this.min = (this.min > this.max) ? this.max : this.min;
    super.update(changedProperties);
  }

  updated(changedProperties) {
    changedProperties.forEach((oldVal, propName) => {
      if (propName === 'value') {
        setTimeout(() => {
          if (this.editable) {
            // FIX ME: if you enable this code, knob moves but it will cause overflow.
            // if (!this.textfield.focused && oldVal && oldVal !== 0 && oldVal > this.min) {
            //   this.syncToText();
            //   console.log('called!')
            // }
            this.syncToSlider();
          }
          this.slider.layout();
        }, 100);
        const event = new CustomEvent('value-changed', {'detail': {}});
        this.dispatchEvent(event);
      }
      if (['min', 'max', 'step'].includes(propName)) {
        this.checkMarkerDisplay();
      }
    });
    const event = new CustomEvent('changed', {'detail': ''});
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
    this.textfield.step = this.step;
    const rounded = Math.round(this.textfield.value / this.step) * this.step;
    this.textfield.value = rounded.toFixed(((decimal_places: number) => {
      if (Math.floor(decimal_places) === decimal_places) {
        return 0;
      }
      return decimal_places.toString().split('.')[1].length || 0;
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
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lablup-slider': LablupSlider;
  }
}
