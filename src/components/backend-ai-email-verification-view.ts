/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";

import '@material/mwc-textfield/mwc-textfield';
import 'weightless/card';
import 'weightless/dialog';

import * as aiSDK from '../lib/backend.ai-client-es6';
declare global {
  const ai: typeof aiSDK;
}

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
  // @property({type: Object}) client = Object();

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
      `;
    ];
  }

  _initClient(apiEndpoint: string) {
    const consoleShell = document.querySelector('#console-shell');
    consoleShell.appBody.style.visibility = 'visible';
    this.notification = consoleShell.notification;
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

    let dialog;
    if (token) {
      try {
        const resp = await this.client.cloud.verify_email(token);
        console.log('- ', resp)
        resp.success ? this.successDialog.show() : this.failDialog.show();
      } catch (e) {
        console.error(e);
        this.notification.text = e.message || 'Verification Error';
        this.notification.show();
        window.setTimeout(() => this.failDialog.show(), 1000);
      }
    } else {
      this.failDialog.show();
    }
  }

  async sendVerificationCode() {
    const emailEl = this.shadowRoot.querySelector('#email');
    console.log('email:', emailEl.value)
    console.log('validity:', emailEl.validity)
    if (!emailEl.value || !emailEl.validity.valid) return;

    const resp = await this.client.cloud.send_verification_email(emailEl.value);
    console.log('- resp:', resp);
  }

  render() {
    // language=HTML
    return html `
      <wl-dialog id="verification-success-dialog" fixed backdrop blockscrolling persistent style="padding:0;">
        <wl-card class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Email verified!</span>
          </h3>
          <div class="horizontal layout center" style="margin:10px;">
            <p style="width:256px;">Your email is verified! Now you can login with your account.</p>
          </div>
          <div class="horizontal layout center" style="margin:20px;">
            <wl-button outlined flat class="fg green mini flex" type="button" @click="${(e) => this._redirectToLoginPage(e)}">${_t("login.Login")}</wl-button>
          </div>
        </wl-card>
      </wl-dialog>

      <wl-dialog id="verification-fail-dialog" fixed backdrop blockscrolling persistent style="padding:0;">
        <wl-card class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Email verification failed!</span>
          </h3>
          <div class="horizontal layout center" style="margin:10px;">
            <p style="width:256px;">
              We're unable to verify your email. Your token may be invalid or expired.<br /><br />
              Write your email address and click send button to get new verification code.
            </p>
          </div>
          <div style="margin:20px;">
            <mwc-textfield id="email" label="${_t('data.explorer.EnterEmailAddress')}"
                autofocus auto-validate validationMessage="Invalid email address"
                pattern="^[A-Z0-9a-z#-_]+@.+\\..+$"></mwc-textfield>
            <div style="height:1em"></div>
            <wl-button outlined flat class="fg red mini flex" type="button" @click="${(e) => this.sendVerificationCode(e)}">Send verification email</wl-button>
          </div>
        </wl-card>
      </wl-dialog>
    `;
  }
}
