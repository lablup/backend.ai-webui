/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property, LitElement} from "lit-element";
import 'weightless/snackbar';
import LablupTermsOfService from "./lablup-terms-of-service";

@customElement("lablup-notification")
export default class LablupNotification extends LitElement {
  public shadowRoot: any;
  public updateComplete: any;

  @property({type: String}) text = '';
  @property({type: String}) message = '';
  @property({type: Object}) indicator;
  @property({type: Object}) notification;
  @property({type: Boolean}) active = false;
  @property({type: Number}) step = 0;

  constructor() {
    super();
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
          right: 20px;
          font-size: 16px;
          font-weight: 400;
          font-family: 'Quicksand', Roboto, sans-serif;
          z-index: 10000;
        }
      `];
  }

  render() {
    // language=HTML
    return html`
        <wl-snackbar id="notification" backdrop hideDelay="4000"></wl-snackbar>
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    this.notification = this.shadowRoot.querySelector('wl-snackbar');
    this.step = window.__snackbars;
    (this.notification as HTMLElement).style.bottom = (20 + 20 * this.step) + 'px';
    document.addEventListener('lablup-notification-hide', this.ladder.bind(this));
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async getMoreState() {

  }

  async ladder() {

  }
  async show(message: string = '') {
    this.active = true;
    this.step = window.__snackbars;
    await this.updateComplete;
    if (message === '') {
      this.notification.innerHTML = this.text;
    } else {
      this.notification.innerHTML = message;
      this.text = message;
    }
    this.notification.show();
    window.__snackbars = window.__snackbars + 1;
  }

  async hide() {
    await this.updateComplete;
    this.notification.hide();
    window.__snackbars = window.__snackbars - 1;
    this.active = false;
    let event = new CustomEvent("lablup-notification-hide", {"detail": window.__snackbars});
    document.dispatchEvent(event);
  }

  async toggle() {
    await this.updateComplete;
    if (this.notification.open === true) {
      this.hide();
      //this.indicator.open = false;
    } else {
      this.show();
      //this.indicator.open = true;
    }
  }

}
declare global {
  interface HTMLElementTagNameMap {
    "lablup-notification": LablupNotification;
  }
}
