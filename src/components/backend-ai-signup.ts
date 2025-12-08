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
import './backend-ai-dialog';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './lablup-terms-of-service';
import { Button } from '@material/mwc-button';
import '@material/mwc-checkbox';
import '@material/mwc-icon-button-toggle';
import { TextField } from '@material/mwc-textfield';
import { css, CSSResultGroup, html } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAIDialog = HTMLElementTagNameMap['backend-ai-dialog'];
type LablupTermsOfService = HTMLElementTagNameMap['lablup-terms-of-service'];

/**
 Backend.AI Signup feature for GUI Console

 `backend-ai-signup` is a login UI / Model to provide both API and session-based login.

 Example:

 <backend-ai-signup>
 ... content ...
 </backend-ai-signup>

@group Backend.AI Web UI
 */
@customElement('backend-ai-signup')
export default class BackendAiSignup extends BackendAIPage {
  @property({ type: String }) company_name = '';
  @property({ type: String }) company_id = '';
  @property({ type: String }) user_name = '';
  @property({ type: String }) user_email = '';
  @property({ type: String }) errorMsg = '';
  @property({ type: String }) endpoint = '';
  @property({ type: Object }) notification = Object();
  @property({ type: Object }) client;
  @property({ type: String }) TOSlanguage = 'en';
  @property({ type: String }) preloadedToken;
  @property({ type: Boolean }) allowSignupWithoutConfirmation;
  @property({ type: HTMLSpanElement }) signupButtonMessage = html`
    <span id="signup-button-message">${_text('signUp.SignUp')}</span>
  `;
  @query('#signup-button') signupButton!: Button;
  @query('#id_user_email') userEmailInput!: TextField;
  @query('#id_user_name') userNameInput!: TextField;
  @query('#id_token') tokenInput!: TextField;
  @query('#id_password1') passwordInput!: TextField;
  @query('#id_password2') passwordConfirmInput!: TextField;
  @query('#signup-panel') signupPanel!: BackendAIDialog;
  @query('#block-panel') blockPanel!: BackendAIDialog;
  @query('#email-sent-dialog') emailSentDialog!: BackendAIDialog;
  @query('#terms-of-service') TOSdialog!: LablupTermsOfService;

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        fieldset input {
          width: 100%;
          border: 0;
          border-bottom: 1px solid var(--token-colorBorder, #ccc);
          margin: 15px 0;
          font: inherit;
          font-size: 16px;
          outline: none;
        }

        fieldset input:focus {
          border-bottom: 1.5px solid var(--token-colorLink, #0d47a1);
        }

        #signup-panel {
          --dialog-width: 400px;
          --dialog-elevation: 0px 0px 5px 5px rgba(0, 0, 0, 0.1);
        }

        mwc-textfield {
          width: 100%;
          --mdc-text-field-fill-color: transparent;
          --mdc-theme-primary: var(--general-textfield-selected-color);
          --mdc-typography-font-family: var(--token-fontFamily);
        }

        mwc-textfield#id_user_name {
          margin-bottom: 18px;
        }

        mwc-button.full {
          width: 70%;
        }

        mwc-button {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-theme-on-primary: var(--general-button-color);
        }

        mwc-button[unelevated] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
        }

        mwc-button[outlined] {
          background-image: none;
          --mdc-button-outline-width: 2px;
          --mdc-button-disabled-outline-color: var(
            --general-button-background-color
          );
          --mdc-button-disabled-ink-color: var(
            --general-button-background-color
          );
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-theme-on-primary: var(--general-button-color);
        }

        mwc-checkbox {
          --mdc-theme-secondary: var(--general-checkbox-color);
        }
      `,
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    const textfields = Array.from(
      this.shadowRoot?.querySelectorAll(
        'mwc-textfield',
      ) as NodeListOf<TextField>,
    );
    for (const textfield of textfields) {
      this._addInputValidator(textfield);
    }
  }

  /**
   * Change state to 'ALIVE' when backend.ai client connected.
   *
   * @param {Booelan} active - The component will work if active is true.
   */
  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          return true;
        },
        true,
      );
    } else {
      // already connected
    }
  }

  receiveTOSAgreement() {
    if (this.TOSdialog.show === false) {
      this.TOSdialog.tosContent = '';
      this.TOSdialog.tosLanguage = globalThis.backendaioptions.get(
        'language',
        'default',
        'general',
      );
      this.TOSdialog.title = _t('webui.menu.TermsOfService') as string;
      this.TOSdialog.tosEntry = 'terms-of-service';
      this.TOSdialog.open();
    }
  }

  receivePPAgreement() {
    if (this.TOSdialog.show === false) {
      this.TOSdialog.tosContent = '';
      this.TOSdialog.tosLanguage = globalThis.backendaioptions.get(
        'language',
        'default',
        'general',
      );
      this.TOSdialog.title = _t('webui.menu.PrivacyPolicy') as string;
      this.TOSdialog.tosEntry = 'privacy-policy';
      this.TOSdialog.open();
    }
  }

  async open(preloadedToken?: string) {
    await this.updateComplete;
    this.preloadedToken = preloadedToken;
    if (this.signupPanel.open !== true) {
      this._clearUserInput();
      this.signupPanel.show();
    }
  }

  close() {
    if (this.signupPanel.open === true) {
      this.signupPanel.hide();
    }
  }

  init_client() {
    if (typeof this.client === 'undefined' && this.endpoint !== '') {
      const clientConfig = new ClientConfig('', '', this.endpoint, 'SESSION');
      this.client = new Client(clientConfig, `Backend.AI WebUI.`);
    }
  }

  block(message = '') {
    this.errorMsg = message;
    this.blockPanel.show();
  }

  _validate_data(value) {
    if (value != undefined && value != null && value != '') {
      return true;
    }
    return false;
  }

  _clear_info() {
    this.company_name = '';
    this.user_name = '';
    // this.shadowRoot.querySelector('#signup-button').setAttribute('disabled', 'true');
  }

  _clearUserInput() {
    this._toggleInputField(true);
    let inputFields = [
      this.userEmailInput,
      this.userNameInput,
      this.tokenInput,
      this.passwordInput,
      this.passwordConfirmInput,
    ];
    if (this.allowSignupWithoutConfirmation) {
      inputFields = inputFields.filter((el) => el !== this.tokenInput);
    }
    inputFields.forEach((el) => {
      el.value = '';
    });
    if (this.preloadedToken !== undefined) {
      this.tokenInput.value = this.preloadedToken;
    }
    this.signupButtonMessage = html`
      <span id="signup-button-message">${_text('signUp.SignUp')}</span>
    `;
  }

  _toggleInputField(isActive: boolean) {
    let inputFields = [
      this.userEmailInput,
      this.userNameInput,
      this.tokenInput,
      this.passwordInput,
      this.passwordConfirmInput,
      this.signupButton,
    ];
    if (this.allowSignupWithoutConfirmation) {
      inputFields = inputFields.filter((el) => el !== this.tokenInput);
    }
    inputFields.forEach((el) => {
      if (isActive) {
        el.removeAttribute('disabled');
      } else {
        el.setAttribute('disabled', 'true');
      }
    });
  }

  _signup() {
    let inputFields = [
      this.userEmailInput,
      this.tokenInput,
      this.passwordInput,
      this.passwordConfirmInput,
    ];
    if (this.allowSignupWithoutConfirmation) {
      inputFields = inputFields.filter((el) => el !== this.tokenInput);
    }
    const inputFieldsValidity = inputFields.map((el) => {
      el.reportValidity();
      return el.checkValidity();
    });

    const approved = (
      this.shadowRoot?.querySelector(
        '#approve-terms-of-service',
      ) as HTMLInputElement
    ).checked;
    if (approved === false) {
      this.notification.text = _text('signUp.RequestAgreementTermsOfService');
      this.notification.show();
      return;
    }

    // if any input is invalid, signup fails.
    if (inputFieldsValidity.includes(false)) {
      return;
    }
    const user_email = this.userEmailInput.value;
    const user_name = this.userNameInput.value;
    const password = this.passwordInput.value;
    this.notification.text = _text('signUp.Processing');
    this.notification.show();
    const body = {
      email: user_email,
      user_name: user_name,
      password: password,
    };
    if (!this.allowSignupWithoutConfirmation) {
      body['token'] = this.tokenInput.value;
    }
    this.init_client();
    const rqst = this.client.newSignedRequest('POST', `/auth/signup`, body);
    this.client
      ._wrapWithPromise(rqst)
      .then((response) => {
        this._toggleInputField(false);
        this.signupButtonMessage = html`
          <span id="signup-button-message">
            ${_text('signUp.SignUpSucceeded')}
          </span>
        `;
        this.notification.text = _text('signUp.SignUpSucceeded');
        this.notification.show();
        setTimeout(() => {
          this.signupPanel.hide();
          this._clearUserInput();
          if (!this.allowSignupWithoutConfirmation) {
            this.emailSentDialog.show();
          }
        }, 1000);
      })
      .catch((e) => {
        if (e.message) {
          this.notification.text = PainKiller.relieve(e.message);
          this.notification.show(true, e);
        }
        // console.log(e);
      });
  }

  // TODO: global error message patcher
  _politeErrorMessage(err) {
    const errorMsgSet = {
      "Cannot read property 'map' of null":
        'User has no group. Please contact administrator to fix it.',
      "Cannot read property 'split' of undefined": 'Wrong API server address.',
    };
    // console.log(err);
    if (err in errorMsgSet) {
      return errorMsgSet[err];
    }
    return err;
  }

  _togglePasswordVisibility(element) {
    const isVisible = element.__on;
    const password = element.closest('div').querySelector('mwc-textfield');
    isVisible
      ? password.setAttribute('type', 'text')
      : password.setAttribute('type', 'password');
  }

  _validateEmail() {
    this.userEmailInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.userEmailInput.validationMessage = _text(
            'signUp.EmailInputRequired',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        } else {
          this.userEmailInput.validationMessage = _text('signUp.InvalidEmail');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
      } else {
        // custom validation for email address using regex
        const regex =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const isValid = regex.exec(this.userEmailInput.value);
        if (!isValid) {
          this.userEmailInput.validationMessage = _text('signUp.InvalidEmail');
        }
        return {
          // TODO clear return required
          valid: !!isValid,
          customError: !isValid,
        };
      }
    };
  }

  _validatePassword1() {
    this.passwordConfirmInput.reportValidity();
    this.passwordInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.passwordInput.validationMessage = _text(
            'signUp.PasswordInputRequired',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        } else {
          this.passwordInput.validationMessage = _text(
            'signUp.PasswordInvalid',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
      } else {
        return {
          valid: nativeValidity.valid,
          customError: !nativeValidity.valid,
        };
      }
    };
  }

  _validatePassword2() {
    this.passwordConfirmInput.validityTransform = (
      newValue,
      nativeValidity,
    ) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          this.passwordConfirmInput.validationMessage = _text(
            'signUp.PasswordInputRequired',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        } else {
          this.passwordConfirmInput.validationMessage = _text(
            'signUp.PasswordInvalid',
          );
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid,
          };
        }
      } else {
        // custom validation for password input match
        const isMatched =
          this.passwordInput.value === this.passwordConfirmInput.value;
        if (!isMatched) {
          this.passwordConfirmInput.validationMessage = _text(
            'signUp.PasswordNotMatched',
          );
        }
        return {
          valid: isMatched,
          customError: !isMatched,
        };
      }
    };
  }

  _validatePassword() {
    this._validatePassword1();
    this._validatePassword2();
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-dialog
        id="signup-panel"
        fixed
        blockscrolling
        persistent
        disablefocustrap
      >
        <span slot="title">
          ${this.allowSignupWithoutConfirmation
            ? html`
                ${_t('signUp.SignUp')}
              `
            : html`
                ${_t('signUp.SignUpBETA')}
              `}
        </span>
        <div slot="content" class="vertical flex layout">
          <mwc-textfield
            type="email"
            name="user_email"
            id="id_user_email"
            autofocus
            maxlength="64"
            placeholder="${_text('maxLength.64chars')}"
            label="${_t('signUp.E-mail')}"
            validateOnInitialRender
            @change="${this._validateEmail}"
            validationMessage="${_t('signUp.EmailInputRequired')}"
            value="${this.user_email}"
            required
          ></mwc-textfield>
          <mwc-textfield
            type="text"
            name="user_name"
            id="id_user_name"
            maxlength="64"
            placeholder="${_text('maxLength.64chars')}"
            label="${_t('signUp.UserName')}"
            value="${this.user_name}"
          ></mwc-textfield>
          ${this.allowSignupWithoutConfirmation
            ? html``
            : html`
                <mwc-textfield
                  type="text"
                  name="token"
                  id="id_token"
                  maxlength="50"
                  label="${_t('signUp.InvitationToken')}"
                  validationMessage="${_t('signUp.TokenInputRequired')}"
                  required
                ></mwc-textfield>
              `}
          <div class="horizontal flex layout">
            <mwc-textfield
              type="password"
              name="password1"
              id="id_password1"
              label="${_t('signUp.Password')}"
              maxLength="64"
              pattern=${BackendAiCommonUtils.passwordRegex}
              validationMessage="${_t('signUp.PasswordInputRequired')}"
              @change="${this._validatePassword}"
              value=""
              required
            ></mwc-textfield>
            <mwc-icon-button-toggle
              off
              onIcon="visibility"
              offIcon="visibility_off"
              @click="${(e) => this._togglePasswordVisibility(e.target)}"
            ></mwc-icon-button-toggle>
          </div>
          <div class="horizontal flex layout">
            <mwc-textfield
              type="password"
              name="password2"
              id="id_password2"
              label="${_t('signUp.PasswordAgain')}"
              maxLength="64"
              pattern=${BackendAiCommonUtils.passwordRegex}
              validationMessage="${_t('signUp.PasswordInputRequired')}"
              @change="${this._validatePassword}"
              value=""
              required
            ></mwc-textfield>
            <mwc-icon-button-toggle
              off
              onIcon="visibility"
              offIcon="visibility_off"
              @click="${(e) => this._togglePasswordVisibility(e.target)}"
            ></mwc-icon-button-toggle>
          </div>
          <div
            style="margin-top:10px;"
            class="horizontal layout center center-justified"
          >
            <mwc-checkbox id="approve-terms-of-service"></mwc-checkbox>
            <p style="font-size:12px;">
              ${_text('signUp.PolicyAgreement_1')}
              <a
                style="color:var(--token-colorPrimary);"
                @click="${() => this.receiveTOSAgreement()}"
              >
                ${_t('signUp.TermsOfService')}
              </a>
              ${_text('signUp.PolicyAgreement_2')}
              <a
                style="color:var(--token-colorPrimary);"
                @click="${() => this.receivePPAgreement()}"
              >
                ${_t('signUp.PrivacyPolicy')}
              </a>
              ${_text('signUp.PolicyAgreement_3')}
            </p>
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <mwc-button
            id="signup-button"
            raised
            class="full"
            icon="check"
            @click="${() => this._signup()}"
          >
            ${this.signupButtonMessage}
          </mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="block-panel"
        fixed
        type="error"
        backdrop
        blockscrolling
        persistent
      >
        <span slot="title">${_t('dialog.error.Error')}</span>
        <div slot="content" style="text-align:center;">${this.errorMsg}</div>
      </backend-ai-dialog>
      <backend-ai-dialog
        id="email-sent-dialog"
        noclosebutton
        fixed
        backdrop
        blockscrolling
        persistent
      >
        <span slot="title">${_t('signUp.ThankYou')}</span>
        <div slot="content">
          <p style="max-width:350px">${_t('signUp.VerificationMessage')}</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <mwc-button
            unelevated
            label="${_t('button.Okay')}"
            @click="${(e) => e.target.closest('backend-ai-dialog').hide()}"
          ></mwc-button>
        </div>
      </backend-ai-dialog>
      <lablup-terms-of-service id="terms-of-service"></lablup-terms-of-service>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-signup': BackendAiSignup;
  }
}
