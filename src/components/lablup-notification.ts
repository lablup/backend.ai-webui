/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { BackendAiStyles } from './backend-ai-general-styles';
import '@material/mwc-icon-button';
import '@material/mwc-snackbar';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { get as _text } from 'lit-translate';
import { customElement, property } from 'lit/decorators.js';

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
  @property({ type: String }) text = '';
  @property({ type: String }) detail = '';
  @property({ type: String }) url = '';
  @property({ type: String }) message = '';
  @property({ type: String }) requestUrl = '';
  @property({ type: String }) status = '';
  @property({ type: String }) timestamp = '';
  @property({ type: Object }) backgroundTask = Object();
  @property({ type: Object }) indicator;
  @property({ type: Array }) notifications;
  @property({ type: Array }) notificationstore;
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Boolean }) supportDesktopNotification = false;
  @property({ type: Number }) step = 0;
  @property({ type: Object }) newDesktopNotification = Object();
  @property({ type: Object }) options = Object();

  constructor() {
    super();
    this.options = {
      desktop_notification: true,
    };
    this.notifications = [];
    this.notificationstore = [];
  }

  static get is() {
    return 'lablup-notification';
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      // language=CSS
      css`
        mwc-snackbar {
          --mdc-snackbar-label-color: yellow;
          --mdc-snackbar-action-color: var(
            --general-sidebar-selected-color,
            #38bd73
          );
          --mdc-typography-body2-font-family: var(--token-fontFamily);
          position: fixed;
          right: 20px;
        }
        mwc-button {
          --mdc-theme-primary: var(--general-sidebar-selected-color, #38bd73);
        }
      `,
    ];
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
    const value: string | null = localStorage.getItem(
      'backendaiwebui.usersetting.' + name,
    );
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

  // /**
  //  * When click the close_button, hide dialog(mwc-snackbar).
  //  *
  //  * @param {Event} e - Click the close_button
  //  * */
  // _hideNotification(e) {
  //   const hideButton = e.target;
  //   const dialog = hideButton.closest('mwc-snackbar');
  //   dialog.close();
  // }

  // /**
  //  * When click the more_button, dispatch 'backend-ai-usersettings-logs' event.
  //  *
  //  * @param {Event} e - Click the more_button
  //  * */
  // _moreNotification(e) {
  //   this._hideNotification(e);
  //   const currentPage = globalThis.location.toString().split(/[/]+/).pop();
  //   globalThis.history.pushState({}, '', '/usersettings');
  //   store.dispatch(navigate(decodeURIComponent('/usersettings?tab=logs')));
  //   if (currentPage && currentPage === 'usersettings') {
  //     const event = new CustomEvent('backend-ai-usersettings-logs', {});
  //     document.dispatchEvent(event);
  //   }
  // }

  // /**
  //  * Create close_button that bind with function '_hideNotification(e)'
  //  *
  //  * @param{HTMLElement} notification - Notification webcomponent
  //  * */
  // _createCloseButton(notification) {
  //   const button = document.createElement('mwc-icon-button');
  //   button.setAttribute('icon', 'close');
  //   button.setAttribute('slot', 'dismiss');
  //   button.addEventListener('click', this._hideNotification.bind(this));
  //   notification.appendChild(button);
  // }

  /**
   * Dispatch 'show-bai-notification' event that handled by `BAINotificationButton` component.
   *
   * @param {boolean} persistent - if persistent is false, the snackbar is hidden automatically after 3000ms
   * @param {object} log - Log object that contains detail information
   * @param {string} key - notification key. If it already exists, the notification will be updated.
   * */
  show(
    persistent = false,
    log: Record<string, unknown> = Object(),
    key: string,
  ) {
    if (this.text === '_DISCONNECTED') {
      return;
    }
    const shouldSaveLog = Object.keys(log).length !== 0;
    if (shouldSaveLog) {
      this._saveToLocalStorage('backendaiwebui.logs', log);
    }

    const messageDetail = {
      open: true,
      type: shouldSaveLog ? 'error' : null,
      message: this.text ? this.text : undefined,
      description: this.text === this.detail ? undefined : this.detail,
      to: shouldSaveLog ? '/usersettings?tab=logs' : this.url,
      duration: persistent ? 0 : undefined,
      backgroundTask: this.backgroundTask ? this.backgroundTask : undefined,
      // closeIcon: persistent,
    };

    const event: CustomEvent = new CustomEvent('add-bai-notification', {
      detail: {
        key:
          typeof key === 'undefined' && messageDetail.type === 'error'
            ? `_no_key_from_lablup_notification:${JSON.stringify(messageDetail)}`
            : key,
        ...messageDetail,
      },
    });

    // Ignore the event if the message is 'Network disconnected because it is handled by `NetworkStatusBanner` component.
    if (messageDetail.message !== 'Network disconnected.') {
      document.dispatchEvent(event);
      this._spawnDesktopNotification('Backend.AI', this.text, '');
    }
    this.detail = ''; // Reset the temporary detail scripts
  }

  /**
   * Dispatch event to clear single notification item in BAINotificationDrawer.
   *
   * @param key
   */
  clear(key: string) {
    const event: CustomEvent = new CustomEvent('clear-bai-notification', {
      detail: {
        key,
      },
    });

    document.dispatchEvent(event);
  }

  // /**
  //  * Show notifications
  //  *
  //  * @param {boolean} persistent - if persistent is false, the snackbar is hidden automatically after 3000ms
  //  * @param {object} log - Log object that contains detail information
  //  * */
  // async show(persistent = false, log: Record<string, unknown> = Object()) {
  //   if (this.text === '_DISCONNECTED') {
  //     return;
  //   }
  //   const snackbar = document.querySelector("mwc-snackbar[persistent='true']");
  //   if (snackbar) {
  //     this.notifications = []; // Reset notifications
  //     document.body.removeChild(snackbar);
  //   }
  //   this.gc();
  //   const notification = document.createElement('mwc-snackbar');
  //   notification.labelText = this.text;
  //   if (this.detail != '') {
  //     notification.innerHTML =
  //       notification.innerHTML +
  //       '<div style="display:none;"> : ' +
  //       this.detail +
  //       '</div>';
  //   }
  //   if (Object.keys(log).length !== 0) {
  //     console.log(log);
  //     this._saveToLocalStorage('backendaiwebui.logs', log);
  //   }

  //   if (this.detail !== '') {
  //     const more_button = document.createElement('mwc-button');
  //     // more_button.style.fontSize = 12 + 'px';
  //     more_button.setAttribute('slot', 'action');
  //     more_button.setAttribute(
  //       'style',
  //       '--mdc-theme-primary: var(--general-sidebar-selected-color, #38bd73);',
  //     );
  //     if (this.url != '') {
  //       more_button.label = _text('notification.Visit');
  //       //more_button.innerHTML = _text('notification.Visit');
  //       more_button.addEventListener(
  //         'click',
  //         this._openURL.bind(this, this.url),
  //       );
  //     } else {
  //       more_button.label = _text('notification.SeeDetail');
  //       // more_button.textContent = _text('notification.SeeDetail');
  //       more_button.addEventListener(
  //         'click',
  //         this._moreNotification.bind(this),
  //       );
  //     }
  //     notification.appendChild(more_button);
  //   }
  //   this.detail = ''; // Reset the temporary detail scripts
  //   this.url = '';
  //   if (persistent === false) {
  //     notification.setAttribute('timeoutMs', '4000');
  //   } else {
  //     notification.setAttribute('timeoutMs', '-1');
  //     notification.setAttribute('persistent', 'true');
  //     this._createCloseButton(notification);
  //   }
  //   // notification.setAttribute('backdrop', '');
  //   notification.style.setProperty(
  //     '--mdc-snackbar-bottom',
  //     20 + 55 * this.step + 'px',
  //   );
  //   //notification.style.position = 'fixed';
  //   //(notification.querySelector('span') as HTMLElement).style.overflowX = 'hidden';
  //   //(notification.querySelector('span') as HTMLElement).style.maxWidth = '70vw';
  //   notification.style.right = '20px';
  //   notification.style.fontSize = '16px';
  //   notification.style.fontWeight = '400';
  //   notification.style.fontFamily = "'Ubuntu', Roboto, sans-serif";
  //   notification.style.zIndex = '12345678';
  //   const d = new Date();
  //   notification.setAttribute('created', d.toLocaleString());
  //   document.body.appendChild(notification);
  //   this.notifications.push(notification);
  //   await this.updateComplete;
  //   notification.show();
  //   const event = new CustomEvent('backend-ai-notification-changed', {});
  //   document.dispatchEvent(event);
  //   this._spawnDesktopNotification('Backend.AI', this.text, '');
  // }

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
      icon: icon,
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
      const opened_notifications = this.notifications.filter(
        (noti: any) => noti.open === true,
      );
      this.notifications = opened_notifications;
      const event = new CustomEvent('backend-ai-notification-changed', {});
      document.dispatchEvent(event);
    }
    // if (this.notificationstore.length > 5000) {
    //   this.notificationstore = this.notificationstore.slice(1, 5000);
    // }
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
