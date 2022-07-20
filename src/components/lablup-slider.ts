/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import '@material/mwc-slider';
import '@material/mwc-textfield';

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
  @query('#slider', true) slider;
  @query('#textfield', true) textfield;

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
        <mwc-slider
          id="slider" class="${this.id}"
          value="${this.value}" min="${this.min}" max="${this.max}" step="${this.step}"
          ?pin="${this.pin}"
          ?disabled="${this.disabled}"
          ?markers="${this.markers}"
          @change="${() => this.syncToText()}"
        ></mwc-slider>
        <mwc-textfield
          id="textfield" class="${this.id}"
          type="number"
          value="${this.value}" min="${this.min}" max="${this.max}" step="${this.step}"
          prefix="${this.prefix}" suffix="${this.suffix}"
          ?disabled="${this.disabled}"
          @change="${() => this.syncToSlider()}"
        ></mwc-textfield>
      </div>
    `;
  }

  constructor() {
    super();

    // Note: Update the `mwc-slider`'s layout when the element is visible.
    //       Without this, the slider's knob doesn't move.
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          if (this.value !== this.slider.value) {
            // NOTE: Some `mwc-slider`s have a different value than `lablup-slider`.
            //       We don't know why, so just manually set the `mwc-slider`'s value.
            this.slider.value = this.value;
          }
          this.slider.layout();
        }
      });
    }, {});
    observer.observe(this);
  }

  firstUpdated() {
    if (this.editable) {
      this.textfield.style.display = 'flex';
    }
    this.checkMarkerDisplay();
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

  updated(changedProperties: Map<any, any>) {
    changedProperties.forEach((oldVal, propName) => {
      if (['min', 'max', 'step'].includes(propName)) {
        this.checkMarkerDisplay();
      }
    });
  }

  /**
   * Synchronize value with slider value.
   * */
  syncToText() {
    this.value = this.slider.value;
    // NOTE: `mwc-slider` fires the `change` event, which bubbles up to the
    //       `lablup-slider`, so we don't need to dispatch the event explicitly
    //       for `lablup-slider` when `mwc-slider` is changed by user interaction.
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
    // NOTE: `mwc-textfield` does not fire the `change` event, so we need to
    //       explicitly fire it for the `lablup-slider`.
    const event = new CustomEvent('change', {detail: {}});
    this.dispatchEvent(event);
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
