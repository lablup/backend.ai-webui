/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {get as _text} from 'lit-translate';
import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@material/mwc-snackbar';
import '@material/mwc-icon-button';
import '@material/mwc-button';

import {navigate} from '../backend-ai-app';
import {store} from '../store';
import {BackendAIWebUIStyles} from './backend-ai-webui-styles';

/**
 Lablup Notification

 `lablup-notification` notifies backend.ai web UI logs.

 Example:

 <lablup-notification></lablup-notification>

 @group Backend.AI Web UI
 @element lablup-notification
 */

@customElement('lablup-notification')
export default class LablupNotification extends LitElement {
  @property({type: String}) text = '';
  @property({type: String}) detail = '';
  @property({type: String}) url = '';
  @property({type: String}) message = '';
  @property({type: String}) requestUrl = '';
  @property({type: String}) status = '';
  @property({type: String}) timestamp = '';
  @property({type: Object}) indicator;
  @property({type: Array}) notifications;
  @property({type: Boolean}) active = true;
  @property({type: Boolean}) supportDesktopNotification = false;
  @property({type: Number}) step = 0;
  @property({type: Object}) newDesktopNotification = Object();
  @property({type: Object}) options = Object();

  constructor() {
    super();
    this.options = {
      desktop_notification: true
    };
    this.notifications = [];
  }

  static get is() {
    return 'lablup-notification';
  }

  static get styles(): CSSResultGroup {
    return [
      // language=CSS
      BackendAIWebUIStyles,
      css`
        mwc-snackbar {
          --mdc-typography-body2-font-family: var(--general-font-family);
          --mdc-snackbar-action-color: #64dc17;
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
    if ('Notification' in window) {
      // console.log(Notification.permission);

      // works on all browsers without promise error including Safari
      Promise.resolve(Notification.requestPermission()).then((permission) => {
        if (['default', 'granted', 'denied'].includes(permission)) {
          this.supportDesktopNotification = true;
        }
      });
    }
    this._readUserSetting('desktop_notification', true);
    if (this.options['desktop_notification'] === false) {
      this.supportDesktopNotification = false;
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /**
   * Get user settings and set options according to user settings.
   *
   * @param {string} name - name of user setting
   * @param {string | boolean} default_value - Default value if setting does not exist
   * */
  _readUserSetting(name, default_value = true) {
    const value: string | null = localStorage.getItem('backendaiwebui.usersetting.' + name);
    if (value !== null && value != '' && value != '""') {
      if (value === 'false') {
        this.options[name] = false;
      } else if (value === 'true') {
        this.options[name] = true;
      } else {
        this.options[name] = value;
      }
    } else {
      this.options[name] = default_value;
    }
  }

  /**
   * When click the close_button, hide dialog(mwc-snackbar).
   *
   * @param {Event} e - Click the close_button
   * */
  _hideNotification(e) {
    const hideButton = e.target;
    const dialog = hideButton.closest('mwc-snackbar');
    dialog.close();
  }

  /**
   * When click the more_button, dispatch 'backend-ai-usersettings-logs' event.
   *
   * @param {Event} e - Click the more_button
   * */
  _moreNotification(e) {
    // const notification = e.target.closest('wl-snackbar');
    // const button = e.target.closest('wl-button');
    // notification.setAttribute('persistent', 'true');
    // if (notification.querySelector('div') !== null) {
    //   notification.querySelector('div').style.display = 'block';
    // }
    // button.parentNode.removeChild(button);
    // if (notification.querySelector('wl-button') === null) {
    //   this._createCloseButton(notification);
    // }
    this._hideNotification(e);
    const currentPage = globalThis.location.toString().split(/[/]+/).pop();
    globalThis.history.pushState({}, '', '/usersettings');
    store.dispatch(navigate(decodeURIComponent('/usersettings'), {tab: 'logs'}));
    if (currentPage && currentPage === 'usersettings') {
      const event = new CustomEvent('backend-ai-usersettings-logs', {});
      document.dispatchEvent(event);
    }
  }

  /**
   * Create close_button that bind with function '_hideNotification(e)'
   *
   * @param{HTMLElement} notification - Notification webcomponent
   * */
  _createCloseButton(notification) {
    const button = document.createElement('mwc-icon-button');
    button.setAttribute('slot', 'dismiss');
    button.setAttribute('icon', 'close');
    notification.appendChild(button);
  }

  /**
   * Show notifications
   *
   * @param {boolean} persistent - if persistent is false, the snackbar is hidden automatically after 3000ms
   * @param {object} log - Log object that contains detail information
   * */
  async show(persistent = false, log: Record<string, unknown> = Object()) {
    const snackbar = document.querySelector('mwc-snackbar[timeoutMs=\'-1\']');
    if (snackbar) {
      this.notifications = [] as any; // Reset notifications
      document.body.removeChild(snackbar);
    }
    this.gc();
    const notification = document.createElement('mwc-snackbar');
    notification.labelText = this.text;
    /*if (this.detail != '') {
      notification.labelText = this.text;// + '<div style="display:none;"> : ' + this.detail + '</div>';
    }*/
    if (Object.keys(log).length !== 0) {
      console.log(log);
      this._saveToLocalStorage('backendaiwebui.logs', log);
    }

    if (this.detail !== '') {
      const more_button = document.createElement('mwc-button');
      more_button.style.fontSize = 12 + 'px';
      more_button.setAttribute('slot', 'action');
      if (this.url != '') {
        more_button.innerHTML = _text('notification.Visit');
        more_button.addEventListener('click', this._openURL.bind(this, this.url));
      } else {
        more_button.innerHTML = _text('notification.SeeDetail');
        more_button.addEventListener('click', this._moreNotification.bind(this));
      }
      notification.appendChild(more_button);
    }
    this.detail = ''; // Reset the temporary detail scripts
    this.url = '';
    notification.setAttribute('leading', '');
    notification.setAttribute('stacked', '');

    if (persistent === false) {
      notification.setAttribute('timeoutMs', '3000');
    } else {
      notification.setAttribute('timeoutMs', '-1');
      this._createCloseButton(notification);
    }
    notification.setAttribute('backdrop', '');
    notification.style.bottom = (20 + 55 * this.step) + 'px';
    notification.style.position = 'fixed';
    //(notification.querySelector('span') as any).style.overflowX = 'hidden';
    //(notification.querySelector('span') as any).style.maxWidth = '70vw';
    notification.style.right = '20px';
    notification.style.fontSize = '16px';
    notification.style.fontWeight = '400';
    notification.style.fontFamily = '\'Ubuntu\', Roboto, sans-serif';
    notification.style.zIndex = '12345678';
    const d = new Date();
    notification.setAttribute('created', d.toLocaleString());
    document.body.appendChild(notification);
    this.notifications.push(notification);
    await this.updateComplete;
    notification.show();
    const event = new CustomEvent('backend-ai-notification-changed', {});
    document.dispatchEvent(event);
    this._spawnDesktopNotification('Backend.AI', this.text, '');
  }

  /**
   * Spawn new desktop notification that is used to configure and display desktop notifications to the user.
   *
   * @param {string} title - Title of Notification
   * @param {string} body  - Body of Notification
   * @param {string} icon  - Icon of Notification
   * */
  _spawnDesktopNotification(title, body, icon) {
    if (this.supportDesktopNotification === false) {
      return;
    }
    const options = {
      body: body,
      icon: icon
    };
    this.newDesktopNotification = new Notification(title, options);
  }

  /**
   * Open a blank page with url.
   *
   * @param {string} url - Address of open page
   * */
  _openURL(url) {
    window.open(url, '_blank');
  }

  /**
   * Save data to localStorage with given key.
   *
   * @param {string} key - Key to save
   * @param {string} logMessages - Message to save
   * */
  _saveToLocalStorage(key, logMessages) {
    console.log(logMessages);
    const previous_log = JSON.parse(localStorage.getItem(key) || '{}');
    let current_log: Array<any> = [];

    current_log.push(logMessages);
    current_log = current_log.concat(previous_log);
    localStorage.setItem(key, JSON.stringify(current_log));
  }

  /**
   * Collect only the open notification and slice the log so that it does not exceed a certain length.
   * And, set step as the length of notification.
   * */
  gc() {
    if (this.notifications.length > 0) {
      const opened_notifications = this.notifications.filter((noti: any) => noti.open === true);
      this.notifications = opened_notifications;
      const event = new CustomEvent('backend-ai-notification-changed', {});
      document.dispatchEvent(event);
    }
    let logs = JSON.parse(localStorage.getItem('backendaiwebui.logs') || '{}');
    if (logs.length > 3000) {
      logs = logs.slice(0, 2999);
    }
    this.step = this.notifications.length;
    localStorage.setItem('backendaiwebui.logs', JSON.stringify(logs));
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'lablup-notification': LablupNotification;
  }
}
