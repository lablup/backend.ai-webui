/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@material/mwc-textfield/mwc-textfield';
import '@material/mwc-button/mwc-button';

import './backend-ai-dialog';
import {BackendAIPage} from './backend-ai-page';
import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

/**
 Backend.AI Email Verification View

 Example:

 <backend-ai-email-verification-view class="page" name="email-verification" ?active="${0}">
 ... content ...
 </backend-ai-email-verification-view>

@group Backend.AI Web UI
 @element backend-ai-email-verification-view
 */

@customElement('backend-ai-email-verification-view')
export default class BackendAIEmailVerificationView extends BackendAIPage {
  @property({type: Object}) webUIShell = Object();
  @property({type: Object}) clientConfig = Object();
  @property({type: Object}) client = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) successDialog = Object();
  @property({type: Object}) failDialog = Object();

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        mwc-textfield {
          width: 100%;
          --mdc-text-field-fill-color: var(--general-menu-color);
          --mdc-theme-primary: var(--general-textfield-selected-color);
          --mdc-typography-font-family: var(--general-font-family);
        }
      `
    ];
  }

  /**
   * Initialize the client.
   *
   * @param {string} apiEndpoint - Endpoint api of Backend.AI manager.
   */
  _initClient(apiEndpoint: string) {
    this.webUIShell = document.querySelector('#webui-shell');
    this.webUIShell.appBody.style.visibility = 'visible';
    this.notification = globalThis.lablupNotification;
    this.successDialog = this.shadowRoot.querySelector('#verification-success-dialog');
    this.failDialog = this.shadowRoot.querySelector('#verification-fail-dialog');

    this.clientConfig = new ai.backend.ClientConfig('', '', apiEndpoint, 'SESSION');
    this.client = new ai.backend.Client(
      this.clientConfig,
      'Backend.AI Web UI.',
    );
    this.successDialog.addEventListener('didHide', () => {
      this._redirectToLoginPage();
    });
    this.failDialog.addEventListener('didHide', () => {
      this._redirectToLoginPage();
    });
  }

  /**
   * Redirect to login page.
   */
  _redirectToLoginPage() {
    window.location.href = '/';
  }

  /**
   * Verify the client.
   *
   * @param {string} apiEndpoint - Endpoint api of Backend.AI manager.
   */
  async verify(apiEndpoint: string) {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('verification_code');

    this._initClient(apiEndpoint);

    if (token) {
      try {
        await this.client.cloud.verify_email(token);
        this.successDialog.show();
      } catch (e) {
        console.error(e);
        this.notification.text = _text('signup.VerificationError');
        this.notification.show();
        window.setTimeout(() => this.failDialog.show(), 100);
      }
    } else {
      this.failDialog.show();
    }
  }

  /**
   * Send verification code to use email.
   */
  async sendVerificationCode() {
    const emailEl = this.shadowRoot.querySelector('#email');
    if (!emailEl.value || !emailEl.validity.valid) return;
    try {
      await this.client.cloud.send_verification_email(emailEl.value);
      this.notification.text = _text('signup.EmailSent');
      this.notification.show();
    } catch (e) {
      console.error(e);
      this.notification.text = e.message || _text('signup.SendError');
      this.notification.show();
    }
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-dialog id="verification-success-dialog" fixed backdrop blockscrolling persistent style="padding:0;">
        <span slot="title">${_t('signup.EmailVerified')}</span>

        <div slot="content">
          <div class="horizontal layout center">
            <p style="width:256px;">${_t('signup.EmailVerifiedMessage')}</p>
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
              unelevated
              label="${_t('login.Login')}"
              @click="${() => this._redirectToLoginPage()}"></mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog id="verification-fail-dialog" fixed backdrop blockscrolling persistent style="padding:0;">
        <span slot="title">${_t('signup.EmailVerificationFailed')}</span>

        <div slot="content">
          <div class="horizontal layout center">
            <p style="width:256px;">${_t('signup.EmailVerificationFailedMessage')}</p>
          </div>
          <div style="margin:20px;">
            <mwc-textfield id="email" label="${_t('data.explorer.EnterEmailAddress')}"
                autofocus auto-validate validationMessage="${_t('signup.InvalidEmail')}"
                pattern="^[A-Z0-9a-z#-_]+@.+\\..+$"
                maxLength="64" placeholder="${_t('maxLength.64chars')}"></mwc-textfield>
            <div style="height:1em"></div>
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
              unelevated
              label="${_t('signup.SendEmail')}"
              @click="${() => this.sendVerificationCode()}"></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }
}
