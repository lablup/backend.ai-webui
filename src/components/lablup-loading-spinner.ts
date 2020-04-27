/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, LitElement, property} from "lit-element";
import 'weightless/progress-spinner';

@customElement("lablup-loading-spinner")
export default class LablupLoadingSpinner extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({type: Object}) spinner;
  @property({type: Boolean}) active = false;

  constructor() {
    super();
  }

  static get styles() {
    return [
      // language=CSS
      css`
        wl-progress-spinner {
          --progress-spinner-size: 48px;
          --progress-spinner-stroke-width: 12px;
          width: 48px;
          height: 48px;
          position: fixed;
          bottom: 60px;
          right: 60px;
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <wl-progress-spinner id="spinner"></wl-progress-spinner>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#spinner');
    this.active = true;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async getMoreState() {

  }

  async show() {
    this.active = true;
    await this.updateComplete;
    this.spinner.style.display = 'block';
  }

  async hide() {
    this.active = true;
    await this.updateComplete;
    this.spinner.style.display = 'none';
    this.active = false;
  }

  async toggle() {
    await this.updateComplete;
    if (this.spinner.active === true) {
      this.active = true;
      this.spinner.style.display = 'none';
      this.active = false;
    } else {
      this.active = true;
      this.spinner.style.display = 'block';
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lablup-loading-spinner": LablupLoadingSpinner;
  }
}
