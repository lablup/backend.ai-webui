/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { Client, ClientConfig } from '../lib/backend.ai-client-esm';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import BackendAiCommonUtils from './backend-ai-common-utils';
import BackendAIDialog from './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import '@material/mwc-button/mwc-button';
import { TextField } from '@material/mwc-textfield/mwc-textfield';
import { css, CSSResultGroup, html } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property } from 'lit/decorators.js';

/**
 Backend.AI Change Forgot Password View

 Example:

 <backend-ai-change-forgot-password-view class="page" name="change-forgot-password" ?active="${0}">
 ... content ...
 </backend-ai-change-forgot-password-view>

@group Backend.AI Web UI
 @element backend-ai-change-forgot-password-view
 */

@customElement('backend-ai-change-forgot-password-view')
export default class BackendAIChangeForgotPasswordView extends BackendAIPage {
  @property({ type: Object }) webUIShell = Object();
  @property({ type: Object }) clientConfig = Object();
  @property({ type: Object }) client = Object();
  @property({ type: Object }) notification = Object();
  @property({ type: Object }) passwordChangeDialog = Object();
  @property({ type: Object }) failDialog = Object();
  @property({ type: String }) token = '';

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
        }

        mwc-button,
        mwc-button[unelevated] {
          margin: auto 10px;
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-theme-on-primary: var(--general-button-color);
        }
      `,
    ];
  }

  /**
   * Initialize the client.
   *
   * @param {string} apiEndpoint - Endpoint api of Backend.AI manager.
   */
  _initClient(apiEndpoint: string) {
    this.webUIShell = document.querySelector('#webui-shell');
    this.notification = globalThis.lablupNotification;
    this.passwordChangeDialog = this.shadowRoot?.querySelector(
      '#update-password-dialog',
    );
    this.failDialog = this.shadowRoot?.querySelector(
      '#verification-fail-dialog',
    );

    this.clientConfig = new ClientConfig('', '', apiEndpoint, 'SESSION');
    this.client = new Client(this.clientConfig, 'Backend.AI Web UI.');
    this.passwordChangeDialog.addEventListener('didHide', () => {
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
   * Open the upadate password dialog.
   *
   * @param {string} apiEndpoint - Endpoint api of Backend.AI manager.
   */
  open(apiEndpoint: string) {
    const queryParams = new URLSearchParams(window.location.search);
    this.token = queryParams.get('token') || '';

    this._initClient(apiEndpoint);

    if (this.token) {
      (
        this.shadowRoot?.querySelector(
          '#update-password-dialog',
        ) as BackendAIDialog
      ).show();
    } else {
      this.failDialog.show();
    }
  }

  /**
   * Update a password.
   */
  async _updatePassword() {
    const emailEl = this.shadowRoot?.querySelector('#email') as TextField;
    const passwordEl1 = this.shadowRoot?.querySelector(
      '#password1',
    ) as TextField;
    const passwordEl2 = this.shadowRoot?.querySelector(
      '#password2',
    ) as TextField;
    if (!emailEl.value || !emailEl.validity.valid) return;
    if (!passwordEl1.value || !passwordEl1.validity.valid) return;
    if (passwordEl1.value !== passwordEl2.value) {
      this.notification.text = _text('webui.menu.PasswordMismatch');
      this.notification.show();
      return;
    }
    try {
      await this.client.cloud.change_password(
        emailEl.value,
        passwordEl1.value,
        this.token,
      );
      this.notification.text = _text('login.PasswordChanged');
      this.notification.show();
      setTimeout(() => {
        this._redirectToLoginPage();
      }, 2000);
    } catch (e) {
      this.notification.text = e.message || _text('error.UpdateError');
      this.notification.show();
      this.failDialog.show();
    }
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-dialog
        id="update-password-dialog"
        fixed
        backdrop
        blockscrolling
        persistent
        style="padding:0;"
      >
        <span slot="title">${_t('webui.menu.ChangePassword')}</span>

        <div slot="content" class="login-panel intro centered">
          <div class="horizontal layout center" style="margin:10px;">
            <p style="width:350px;">${_t('login.UpdatePasswordMessage')}</p>
          </div>
          <div style="margin:20px;">
            <mwc-textfield
              id="email"
              label="${_t('data.explorer.EnterEmailAddress')}"
              autofocus
              auto-validate
              validationMessage="${_t('signUp.InvalidEmail')}"
              pattern="^[A-Z0-9a-z#-_]+@.+\\..+$"
              maxLength="64"
              placeholder="${_t('maxLength.64chars')}"
            ></mwc-textfield>
            <mwc-textfield
              id="password1"
              label="${_t('webui.menu.NewPassword')}"
              type="password"
              auto-validate
              validationMessage="${_t('webui.menu.InvalidPasswordMessage')}"
              pattern=${BackendAiCommonUtils.passwordRegex}
              maxLength="64"
            ></mwc-textfield>
            <mwc-textfield
              id="password2"
              label="${_t('webui.menu.NewPasswordAgain')}"
              type="password"
              auto-validate
              validationMessage="${_t('webui.menu.InvalidPasswordMessage')}"
              pattern=${BackendAiCommonUtils.passwordRegex}
              maxLength="64"
            ></mwc-textfield>
            <div style="height:1em"></div>
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            unelevated
            fullwidth
            label="${_t('webui.menu.Update')}"
            @click="${() => this._updatePassword()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>

      <backend-ai-dialog
        id="verification-fail-dialog"
        fixed
        backdrop
        blockscrolling
        persistent
        style="padding:0;"
      >
        <span slot="title">${_t('login.InvalidChangePasswordToken')}</span>

        <div slot="content" class="login-panel intro centered">
          <h3 class="horizontal center layout">
            <span>${_t('login.InvalidChangePasswordToken')}</span>
          </h3>
          <div class="horizontal layout center" style="margin:10px;">
            <p style="width:350px;">
              ${_t('login.InvalidChangePasswordTokenMessage')}
            </p>
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
            unelevated
            label="${_t('button.Close')}"
            @click="${() => this._redirectToLoginPage()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-change-forgot-password-view': BackendAIChangeForgotPasswordView;
  }
}
