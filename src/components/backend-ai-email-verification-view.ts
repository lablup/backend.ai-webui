/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";

import '@material/mwc-textfield/mwc-textfield';
import 'weightless/card';
import 'weightless/dialog';

import {BackendAIPage} from './backend-ai-page';
import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';


@customElement("backend-ai-email-verification-view")
export default class BackendAIEmailVerificationView extends BackendAIPage {
  @property({type: Object}) consoleShell = Object();
  @property({type: Object}) clientConfig = Object();
  @property({type: Object}) client = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) successDialog = Object();
  @property({type: Object}) failDialog = Object();

  static get styles() {
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
        }
      `
    ];
  }

  _initClient(apiEndpoint: string) {
    this.consoleShell = document.querySelector('#console-shell');
    this.consoleShell.appBody.style.visibility = 'visible';
    this.notification = globalThis.lablupNotification;
    this.successDialog = this.shadowRoot.querySelector('#verification-success-dialog');
    this.failDialog = this.shadowRoot.querySelector('#verification-fail-dialog');

    this.clientConfig = new ai.backend.ClientConfig('', '', apiEndpoint, 'SESSION');
    this.client = new ai.backend.Client(
      this.clientConfig,
      'Backend.AI Console.',
    );
  }

  _redirectToLoginPage() {
    window.location.href = '/';
  }

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
        this.notification.text = e.message || 'Verification Error';
        this.notification.show();
        window.setTimeout(() => this.failDialog.show(), 100);
      }
    } else {
      this.failDialog.show();
    }
  }

  async sendVerificationCode() {
    const emailEl = this.shadowRoot.querySelector('#email');
    if (!emailEl.value || !emailEl.validity.valid) return;
    try {
      const resp = await this.client.cloud.send_verification_email(emailEl.value);
      const text = resp.verification_email_sent ? _text('signup.EmailSent') : _text('signup.EmailNotSent');
      this.notification.text = text;
      this.notification.show();
    } catch (e) {
      console.error(e);
      this.notification.text = e.message || 'Send error';
      this.notification.show();
    }
  }

  render() {
    // language=HTML
    return html`
      <wl-dialog id="verification-success-dialog" fixed backdrop blockscrolling persistent style="padding:0;">
        <wl-card class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>${_t("signup.EmailVerified")}</span>
          </h3>
          <div class="horizontal layout center" style="margin:10px;">
            <p style="width:256px;">${_t("signup.EmailVerifiedMessage")}</p>
          </div>
          <div class="horizontal layout center" style="margin:20px;">
            <wl-button outlined flat class="fg green mini flex" type="button"
                @click="${() => this._redirectToLoginPage()}">
              ${_t("login.Login")}
            </wl-button>
          </div>
        </wl-card>
      </wl-dialog>

      <wl-dialog id="verification-fail-dialog" fixed backdrop blockscrolling persistent style="padding:0;">
        <wl-card class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>${_t("signup.EmailVerificationFailed")}</span>
          </h3>
          <div class="horizontal layout center" style="margin:10px;">
            <p style="width:256px;">${_t("signup.EmailVerificationFailedMessage")}</p>
          </div>
          <div style="margin:20px;">
            <mwc-textfield id="email" label="${_t('data.explorer.EnterEmailAddress')}"
                autofocus auto-validate validationMessage="${_t('signup.InvalidEmail')}"
                pattern="^[A-Z0-9a-z#-_]+@.+\\..+$"></mwc-textfield>
            <div style="height:1em"></div>
            <wl-button outlined flat class="fg red mini flex" type="button"
                @click="${() => this.sendVerificationCode()}">
              ${_t("signup.SendEmail")}
            </wl-button>
          </div>
        </wl-card>
      </wl-dialog>
    `;
  }
}
