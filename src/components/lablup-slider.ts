/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, LitElement, property} from "lit-element";
import '@material/mwc-slider';
import '@material/mwc-textfield';
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
  @property({type: Object}) slider;

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
      `];
  }

  render() {
    // language=HTML
    return html`
      <mwc-slider id="slider" value="${this.value}" min="${this.min}" max="${this.max}"
        step="${this.step}"
        ?pin="${this.pin}"
        ?markers="${this.markers}"
      ></mwc-slider>
      ${this.editable ? html`<mwc-textfield>${this.value}</mwc-textfield>` : html``}
    `;
  }

  firstUpdated() {
    this.slider = this.shadowRoot.querySelector('#slider');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

}

declare global {
  interface HTMLElementTagNameMap {
    "lablup-slider": LablupSlider;
  }
}
