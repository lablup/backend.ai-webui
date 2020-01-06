/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */


import {css, customElement, html, LitElement, property} from "lit-element";
import '@material/mwc-slider';
import '@material/mwc-textfield';

@customElement("lablup-slider")
export default class LablupSlider extends LitElement {
  public shadowRoot: any; // ShadowRoot

  @property({type: Number}) step = 0;
  @property({type: Number}) value = 0;
  @property({type: Number}) max = 0;
  @property({type: Number}) min = 0;
  @property({type: Boolean}) editable = false;
  @property({type: Boolean}) pin = false;
  @property({type: Boolean}) markers = false;
  @property({type: Object}) slider;

  static get styles() {
    return [
      // language=CSS
      css`
      `];
  }

  render() {
    // language=HTML
    return html`
      <mwc-slider id="slider" value="${this.value}" min="${this.min}" max="${this.max}" ${this.step != 0 ? html`step="${this.step}"` : html``}
        ${this.pin ? `pin` : ``}
        ${this.markers ? `markers` : ``}
      ></mwc-slider>
      ${this.editable ? html`<mwc-textfield></mwc-textfield>` : html``}
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
