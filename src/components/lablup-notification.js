/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from 'lit-element';
import 'weightless/snackbar';

class LablupNotification extends LitElement {
  constructor() {
    super();
    this.active = true;
    this.message = '';
  }

  static get is() {
    return 'lablup-notification';
  }

  static get styles() {
    return [
      // language=CSS
      css`
        wl-snackbar {
          position: fixed;
          bottom: 20px;
          right: 20px;
          font-size: 16px;
          font-weight: 400;
          font-family: "Montserrat", Roboto, sans-serif;
          z-index: 10000;
        }
      `];
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      text: {
        type: String
      }
    };
  }

  render() {
    // language=HTML
    return html`
      <wl-snackbar id="notification" backdrop hideDelay="3000"></wl-snackbar>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    this.notification = this.shadowRoot.querySelector('wl-snackbar');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async getMoreState() {

  }

  async show(message = false) {
    await this.updateComplete;
    if (message === false) {
      this.notification.innerHTML = this.text;
    } else {
      this.notification.innerHTML = message;
    }
    this.notification.show();
  }

  async hide() {
    await this.updateComplete;
    this.notification.hide();
  }

  async toggle() {
    await this.updateComplete;
    if (this.notification.open === true) {
      this.indicator.open = false;
    } else {
      this.indicator.open = true;
    }
  }

}

customElements.define(LablupNotification.is, LablupNotification);
