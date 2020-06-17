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


@customElement("backend-ai-change-forgot-password-view")
export default class BackendAIChangeForgotPasswordView extends BackendAIPage {
  @property({type: Object}) consoleShell = Object();
  @property({type: Object}) clientConfig = Object();
  @property({type: Object}) client = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) passwordChangeDialog = Object();
  @property({type: Object}) failDialog = Object();
  @property({type: String}) token = '';

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
    this.passwordChangeDialog = this.shadowRoot.querySelector('#verification-success-dialog');
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

  open(apiEndpoint: string) {
    const queryParams = new URLSearchParams(window.location.search);
    this.token = queryParams.get('token') || '';

    this._initClient(apiEndpoint);

    if (this.token) { this.shadowRoot.querySelector('#update-password-dialog').show();
    } else {
      this.failDialog.show();
    }
  }

  async _updatePassword() {
    const emailEl = this.shadowRoot.querySelector('#email');
    const passwordEl1 = this.shadowRoot.querySelector('#password1')
    const passwordEl2 = this.shadowRoot.querySelector('#password2')
    if (!emailEl.value || !emailEl.validity.valid) return;
    if (!passwordEl1.value || !passwordEl1.validity.valid) return;
    if (passwordEl1.value !== passwordEl2.value) {
      this.notification.text = _text('console.menu.PasswordMismatch');
      this.notification.show();
      return;
    }
    try {
      await this.client.cloud.change_password(emailEl.value, passwordEl1.value, this.token);
      this.notification.text = _text('login.PasswordChanged');
      this.notification.show();
      setTimeout(() => {
        this._redirectToLoginPage();
      }, 2000);
    } catch (e) {
      console.error(e);
      this.notification.text = e.message || 'Update error';
      this.notification.show();
      this.failDialog.show();
    }
  }

  render() {
    // language=HTML
    return html`
      <wl-dialog id="update-password-dialog" fixed backdrop blockscrolling persistent style="padding:0;">
        <wl-card class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>${_t("console.menu.ChangePassword")}</span>
          </h3>
          <div class="horizontal layout center" style="margin:10px;">
            <p style="width:350px;">${_t("login.UpdatePasswordMessage")}</p>
          </div>
          <div style="margin:20px;">
            <mwc-textfield id="email" label="${_t('data.explorer.EnterEmailAddress')}"
                autofocus auto-validate validationMessage="${_t('signup.InvalidEmail')}"
                pattern="^[A-Z0-9a-z#-_]+@.+\\..+$">
            </mwc-textfield>
            <mwc-textfield id="password1" label="${_t('console.menu.NewPassword')}" type="password"
                auto-validate validationMessage="${_t('console.menu.InvalidPasswordMessage')}"
                pattern="^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$"
                min-length="8">
            </mwc-textfield>
            <mwc-textfield id="password2" label="${_t('console.menu.NewPasswordAgain')}" type="password"
                auto-validate validationMessage="${_t('console.menu.InvalidPasswordMessage')}"
                pattern="^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$"
                min-length="8">
            </mwc-textfield>
            <div style="height:1em"></div>
            <wl-button outlined flat class="fg red mini flex" type="button"
                @click="${() => this._updatePassword()}">
              ${_t("console.menu.Update")}
            </wl-button>
          </div>
        </wl-card>
      </wl-dialog>

      <wl-dialog id="verification-fail-dialog" fixed backdrop blockscrolling persistent style="padding:0;">
        <wl-card class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>${_t("login.InvalidChangePasswordToken")}</span>
          </h3>
          <div class="horizontal layout center" style="margin:10px;">
            <p style="width:350;">${_t("login.InvalidChangePasswordTokenMessage")}</p>
          </div>
          <div style="margin:20px;">
            <div style="height:1em"></div>
            <wl-button outlined flat class="fg mini flex red" type="button"
                @click="${() => this._redirectToLoginPage()}">
              ${_t("button.Close")}
            </wl-button>
          </div>
        </wl-card>
      </wl-dialog>
    `;
  }
}
