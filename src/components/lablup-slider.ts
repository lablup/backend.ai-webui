/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */


import {css, customElement, html, LitElement, property} from "lit-element";
import '@material/mwc-slider';

@customElement("lablup-slider")
export default class LablupSlider extends LitElement {
  @property({type: Number}) step = 0;
  @property({type: Number}) value = 0;
  @property({type: Number}) max = 0;
  @property({type: Number}) min = 0;
  @property({type: Boolean}) editable = false;

  static get styles() {
    return [
      // language=CSS
      css`
      `];
  }

  render() {
    // language=HTML
    return html`
      <mwc-slider></mwc-slider>
      ${this.editable ? html`` : html``}
    `;
  }

  firstUpdated() {
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

}
