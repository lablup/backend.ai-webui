/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, LitElement, property} from "lit-element";
import 'weightless/snackbar';
import 'weightless/button';

@customElement("lablup-notification")
export default class LablupNotification extends LitElement {
  public shadowRoot: any;
  public updateComplete: any;

  @property({type: String}) text = '';
  @property({type: String}) message = '';
  @property({type: Object}) indicator;
  @property({type: Array}) notifications = Array();
  @property({type: Boolean}) active = true;
  @property({type: Boolean}) supportDesktopNotification = false;
  @property({type: Number}) step = 0;
  @property({type: Object}) newDesktopNotification = Object();

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
          z-index: 12345678;
        }

        wl-button {
            --button-font-size: 12px;
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
    if ("Notification" in window) {
      console.log(Notification.permission);
      if (Notification.permission === "granted") {
        this.supportDesktopNotification = true;
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(() => {
          this.supportDesktopNotification = true;
        });
      } else {
        Notification.requestPermission().then(() => {
          this.supportDesktopNotification = true;
        });
      }
    }
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

  _hideNotification(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-snackbar');
    dialog.hide();
  }

  async show(persistent: boolean = false, message: string = '') {
    this.gc();
    let notification = document.createElement('wl-snackbar');
    if (message === '') {
      notification.innerHTML = this.text;
    } else {
      notification.innerHTML = message;
      this.text = message;
    }
    if (persistent === false) {
      notification.setAttribute('hideDelay', '3000');
    } else {
      notification.setAttribute('hideDelay', '86400');
      let button = document.createElement('wl-button');
      button.setAttribute('slot', "action");
      button.setAttribute('flat', "");
      button.addEventListener('click', this._hideNotification.bind(this));
      button.innerHTML = "Close";
      notification.appendChild(button);
    }
    notification.setAttribute('backdrop', '');
    notification.style.bottom = (20 + 45 * this.step) + 'px';
    notification.style.position = 'fixed';
    notification.style.right = '20px';
    notification.style.fontSize = '16px';
    notification.style.fontWeight = '400';
    notification.style.fontFamily = "'Quicksand', Roboto, sans-serif";
    notification.style.zIndex = "12345678";
    document.body.appendChild(notification);
    this.notifications.push(notification);
    await this.updateComplete;
    notification.show();
    this._spawnDesktopNotification(notification.innerHTML, '', '');
  }

  _spawnDesktopNotification(title, body, icon) {
    if (this.supportDesktopNotification === false) {
      return;
    }
    let options = {
      body: body,
      icon: icon
    };
    this.newDesktopNotification = new Notification(title, options);
  }
  gc() {
    if (this.notifications.length > 0) {
      let opened_notifications = this.notifications.filter(noti => noti.open === true);
      this.notifications = opened_notifications;
    }
    this.step = this.notifications.length;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "lablup-notification": LablupNotification;
  }
}
