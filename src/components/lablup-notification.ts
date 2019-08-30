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
  @property({type: Array}) notifications = Array();
  @property({type: Object}) notificationPool = Object();
  @property({type: Boolean}) active = true;
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
    return html``;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
    this.notification = this.shadowRoot.querySelector('wl-snackbar');
    this.notificationPool = this.shadowRoot.querySelector('#notification-pool');
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
    let notification = document.createElement('wl-snackbar');
    notification.setAttribute('backdrop', '');
    notification.setAttribute('hideDelay', '4000');
    notification.style.bottom = (20 + 45 * this.step) + 'px';
    this.step = this.step + 1;
    notification.style.position = 'fixed';
    notification.style.right = '20px';
    notification.style.fontSize = '16px';
    notification.style.fontWeight = '400';
    notification.style.fontFamily = "'Quicksand', Roboto, sans-serif";
    notification.style.zIndex = "10000";
    document.body.appendChild(notification);
    this.notifications.push(notification);
    await this.updateComplete;
    if (message === '') {
      notification.innerHTML = this.text;
    } else {
      notification.innerHTML = message;
      this.text = message;
    }
    notification.show();
  }

  async hide() {
    await this.updateComplete;
    this.notification.hide();
    this.step = this.step - 1;
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
