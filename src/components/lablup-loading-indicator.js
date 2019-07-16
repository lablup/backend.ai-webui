/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from 'lit-element';
import '@polymer/paper-spinner/paper-spinner-lite';
import 'weightless/progress-spinner';

class LablupLoadingIndicator extends LitElement {
  constructor() {
    super();
  }

  static get is() {
    return 'lablup-loading-indicator';
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

  static get properties() {
    return {
      active: {
        type: Boolean
      }
    };
  }

  render() {
    // language=HTML
    return html`
      <wl-progress-spinner></wl-progress-spinner>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    this.indicator = this.shadowRoot.querySelector('wl-progress-spinner');
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
    await this.updateComplete;
    this.indicator.style.display = 'block';
  }

  async hide() {
    await this.updateComplete;
    this.indicator.style.display = 'none';
  }

  async toggle() {
    await this.updateComplete;
    if (this.indicator.active === true) {
      this.indicator.style.display = 'none';
    } else {
      this.indicator.style.display = 'block';
    }
  }

}

customElements.define(LablupLoadingIndicator.is, LablupLoadingIndicator);
