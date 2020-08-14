/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';
import '@material/mwc-textfield';
import './lablup-terms-of-service';
import './backend-ai-dialog';

import '../lib/backend.ai-client-es6';
import './backend-ai-dialog';
import {BackendAiStyles} from "./backend-ai-general-styles";
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";
import {BackendAIPage} from "./backend-ai-page";

/**
 Backend.AI Signup feature for GUI Console

 `backend-ai-signup` is a login UI / Model to provide both API and session-based login.

 Example:

 <backend-ai-signup>
 ... content ...
 </backend-ai-signup>

 @group Backend.AI Console
 */
@customElement("backend-ai-signup")
export default class BackendAiSignup extends BackendAIPage {
  @property({type: String}) company_name = '';
  @property({type: String}) company_id = '';
  @property({type: String}) user_name = '';
  @property({type: String}) user_email = '';
  @property({type: String}) errorMsg = '';
  @property({type: String}) endpoint = '';
  @property({type: Object}) notification = Object();
  @property({type: Object}) signupPanel = Object();
  @property({type: Object}) blockPanel = Object();
  @property({type: Object}) client;
  @property({type: String}) TOSlanguage = 'en';
  @property({type: Object}) TOSdialog = Object();

  constructor() {
    super();
  }

  static get styles() {
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
              border-bottom: 1px solid #aaa;
              margin: 15px 0;
            font: inherit;
            font-size: 16px;
            outline: none;
          }

          fieldset input:focus {
            border-bottom: 1.5px solid #0d47a1;
          }

          #signup-panel {
            --dialog-width: 400px;
            --dialog-elevation: 0px 0px 5px 5px rgba(0, 0, 0, 0.1);
          }

          wl-button {
            --button-bg: transparent;
            --button-bg-hover: var(--paper-red-100);
            --button-bg-active: var(--paper-red-600);
            --button-bg-disabled: #ddd;
            --button-color: var(--paper-red-600);
            --button-color-disabled: #222;
          }

          wl-button.full {
              width: 335px;
          }

          wl-button.fab {
              --button-bg: var(--paper-light-green-600);
              --button-bg-hover: var(--paper-green-600);
              --button-bg-active: var(--paper-green-900);
          }

          wl-button.signup {
              --button-bg: transparent;
              --button-bg-hover: var(--paper-green-300);
              --button-bg-active: var(--paper-green-300);
          }
          mwc-textfield {
            width: 100%;
            --mdc-text-field-fill-color: transparent;
          }

      `];
  }

  firstUpdated() {
    this.signupPanel = this.shadowRoot.querySelector('#signup-panel');
    this.blockPanel = this.shadowRoot.querySelector('#block-panel');
    this.notification = globalThis.lablupNotification;
    this.TOSdialog = this.shadowRoot.querySelector('#terms-of-service');
    let textfields = this.shadowRoot.querySelectorAll('mwc-textfield');
    for (const textfield of textfields) {
      this._addInputValidator(textfield);
    }
  }

  /**
   * Change state to 'ALIVE' when backend.ai client connected.
   *
   * @param {Booelan} active - The component will work if active is true.
   */
  async _viewStateChanged(active: Boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
    // If disconnected
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
      }, true);
    } else { // already connected
    }
  }

  receiveTOSAgreement() {
    if (this.TOSdialog.show === false) {
      this.TOSdialog.tosContent = "";
      this.TOSdialog.tosLanguage = globalThis.backendaioptions.get("language");
      this.TOSdialog.title = _t("console.menu.TermsOfService");
      this.TOSdialog.tosEntry = 'terms-of-service';
      this.TOSdialog.open();
    }
  }

  receivePPAgreement() {
    if (this.TOSdialog.show === false) {
      this.TOSdialog.tosContent = "";
      this.TOSdialog.tosLanguage = globalThis.backendaioptions.get("language");
      this.TOSdialog.title = _t("console.menu.PrivacyPolicy");
      this.TOSdialog.tosEntry = 'privacy-policy';
      this.TOSdialog.open();
    }
  }

  open() {
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
    if (typeof this.client === 'undefined') {
      if (this.endpoint !== '' && this.client !== {}) {
        let clientConfig = {
          connectionMode: 'SESSION',
          apiVersionMajor: 'v4',
          apiVersion: 'v4.20190615',
          _apiVersion: 'v4.20190615',
          endpoint: this.endpoint
        };
        this.client = new ai.backend.Client(
          clientConfig,
          `Backend.AI Console.`,
        );
      }
    }
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('backend-ai-dialog');
    dialog.hide();
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
    //this.shadowRoot.querySelector('#signup-button').setAttribute('disabled', 'true');
  }

  _clearUserInput() {
    this._toggleInputField(true);
    const inputFields: Array<string> = ['#id_user_email', '#id_user_name', '#id_token', '#id_password1', '#id_password2'];
    inputFields.map((el: string) => {
      this.shadowRoot.querySelector(el).value = "";
    });
    this.shadowRoot.querySelector('#signup-button-message').textContent = 'Signup';
  }

  _toggleInputField(isActive: boolean) {
    if (isActive) {
      this.shadowRoot.querySelector('#id_user_name').removeAttribute('disabled');
      this.shadowRoot.querySelector('#id_token').removeAttribute('disabled');
      this.shadowRoot.querySelector('#signup-button').removeAttribute('disabled');
    } else {
      this.shadowRoot.querySelector('#id_user_name').setAttribute('disabled', 'true');
      this.shadowRoot.querySelector('#id_token').setAttribute('disabled', 'true');
      this.shadowRoot.querySelector('#signup-button').setAttribute('disabled', 'true');
    }
  }

  _signup() {
    const inputFields: Array<string> = ['#id_user_email', '#id_user_name', '#id_token', '#id_password1', '#id_password2'];
    let inputFieldsValidity: Array<boolean> = inputFields.map((el: string) => {
      this.shadowRoot.querySelector(el).reportValidity();
      return this.shadowRoot.querySelector(el).checkValidity();
    })

    let approved = (this.shadowRoot.querySelector('#approve-terms-of-service') as HTMLInputElement).checked;
    if (approved === false) {
      this.notification.text = _text("signup.RequestAgreementTermsOfService");
      this.notification.show();
      return;
    }

    // if any input is invalid, signup fails.
    if (inputFieldsValidity.map((el: boolean) => {
      if (!el) {
        return !el;
      }
    })) {
      return;
    }

    const token = (this.shadowRoot.querySelector('#id_token') as HTMLInputElement).value;
    const user_email = (this.shadowRoot.querySelector('#id_user_email') as HTMLInputElement).value;
    const user_name = (this.shadowRoot.querySelector('#id_user_name') as HTMLInputElement).value;
    const password = (this.shadowRoot.querySelector('#id_password1') as HTMLInputElement).value;
    this.notification.text = 'Processing...';
    this.notification.show();
    let body = {
      'email': user_email,
      'user_name': user_name,
      'password': password,
      'token': token
    };
    this.init_client();
    let rqst = this.client.newSignedRequest('POST', `/auth/signup`, body);
    this.client._wrapWithPromise(rqst).then((response) => {
      console.log(response);
      this._toggleInputField(false);
      this.shadowRoot.querySelector('#signup-button-message').textContent = 'Signup succeed';
      this.notification.text = 'Signup succeed.';
      this.notification.show();
      setTimeout(() => {
        this.signupPanel.hide();
        this._clearUserInput();
        this.shadowRoot.querySelector('#email-sent-dialog').show();
      }, 1000);
    }).catch((e) => {
      if (e.message) {
        this.notification.text = e.message;
        this.notification.show(true, e);
      }
      console.log(e);
    });
  }

  // TODO: global error message patcher
  _politeErrorMessage(err) {
    const errorMsgSet = {
      "Cannot read property 'map' of null": "User has no group. Please contact administrator to fix it.",
      "Cannot read property 'split' of undefined": 'Wrong API server address.'
    };
    console.log(err);
    if (err in errorMsgSet) {
      return errorMsgSet[err];
    }
    return err;
  }

  _validateEmail() {
    const emailInput = this.shadowRoot.querySelector('#id_user_email');
    emailInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity) {
        let isValid: boolean = nativeValidity;
        return {
          valid: !isValid,
          customError: isValid
        }
      }
      if (!nativeValidity.valid) {
        if (nativeValidity.patternMismatch) {
          emailInput.validationMessage = _text('signup.InvalidEmail');
          return {
            valid: nativeValidity.valid,
            patternMismatch: !nativeValidity.valid
          };
        } else {
          emailInput.validationMessage = _text('signup.EmailInputRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        }
      }
    }
  }

  _validatePassword1() {
    const passwordInput = this.shadowRoot.querySelector('#id_password1');
    const password2Input = this.shadowRoot.querySelector('#id_password2');
    password2Input.reportValidity();
    passwordInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity) {
        let isValid: boolean = nativeValidity;
        return {
          valid: !isValid,
          customError: isValid
        }
      }
      if (!nativeValidity.valid) {
        if (nativeValidity.tooShort) {
          passwordInput.validationMessage = _text('signup.PasswordInvalid');
          return {
            valid: nativeValidity.valid,
            tooShort: !nativeValidity.valid
          }
        } else if (nativeValidity.patternMismatch){
          passwordInput.validationMessage = _text('signup.PasswordInvalid');
          return {
            valid: nativeValidity.valid,
            patternMismatch: !nativeValidity.valid
          }
        } else {
          passwordInput.validationMessage = _text('signup.PasswordInputRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          }
        }
      }
    }
  }

  _validatePassword2() {
    const password2Input = this.shadowRoot.querySelector('#id_password2');
    password2Input.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity) {
        let isValid: boolean = nativeValidity;
        return {
          valid: !isValid,
          customError: isValid
        }
      }
      if (!nativeValidity.valid) {
        if (nativeValidity.tooShort) {
          password2Input.validationMessage = _text('signup.PasswordInvalid');
          return {
            valid: nativeValidity.valid,
            tooShort: !nativeValidity.valid
          } 
        } else if (nativeValidity.patternMismatch) {
          password2Input.validationMessage = _text('signup.PasswordInvalid');
          return {
            valid: nativeValidity.valid,
            patternMismatch: !nativeValidity.valid
          }
        }
      } else {
        // custom validation for password input match
        const passwordInput = this.shadowRoot.querySelector('#id_password1');
        let isMatched = (passwordInput.value === password2Input.value);
        if (!isMatched) {
          password2Input.validationMessage = _text('signup.PasswordNotMatched');         
        }
        return {
          valid: isMatched,
          customError: !isMatched
        }
      }
    }
  }

  _validatePassword() {
    this._validatePassword1();
    this._validatePassword2();
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-dialog id="signup-panel" fixed blockscrolling persistent disablefocustrap>
        <span slot="title">${_t("signup.SignupBETA")}</span>
        <div slot="content">
          <mwc-textfield type="text" name="user_email" id="id_user_email" maxlength="50" autofocus
                       label="${_t("signup.E-mail")}" value="${this.user_email}" required
                       pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                       @change="${this._validateEmail}"></mwc-textfield>
          <mwc-textfield type="text" name="user_name" id="id_user_name" maxlength="30"
                       label="${_t("signup.UserName")}" value="${this.user_name}"
                       validationMessage="${_t("signup.UserNameInputRequired")}" required></mwc-textfield>
          <mwc-textfield type="text" name="token" id="id_token" maxlength="50"
                       label="${_t("signup.InvitationToken")}"
                       validationMessage="${_t("signup.TokenInputRequired")}" required></mwc-textfield>
          <mwc-textfield type="password" name="password1" id="id_password1"
                       label="${_t("signup.Password")}" minlength="8"
                       pattern="^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$"
                       validationMessage="${_t("signup.PasswordInputRequired")}"
                       @change="${this._validatePassword}"
                       value="" required></mwc-textfield>
          <mwc-textfield type="password" name="password2" id="id_password2"
                       label="${_t("signup.PasswordAgain")}" minlength="8"
                       pattern="^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$"
                       validationMessage="${_t("signup.PasswordInputRequired")}"
                       @change="${this._validatePassword}"
                       value="" required></mwc-textfield>
          <div style="margin-top:10px;">
            <wl-checkbox id="approve-terms-of-service">
            </wl-checkbox>
             I have read and agree to the <a style="color:forestgreen;" @click="${() => this.receiveTOSAgreement()}">${_t("signup.TermsOfService")}</a> and <a style="color:forestgreen;" @click="${() => this.receivePPAgreement()}">${_t("signup.PrivacyPolicy")}</a>.
          </div>
        </div>
        <div slot="footer" class="horizontal center-justified flex layout">
          <wl-button class="full" id="signup-button" outlined type="button"
                      @click="${() => this._signup()}">
                      <wl-icon>check</wl-icon>
                      <span id="signup-button-message">${_t("signup.Signup")}</span></wl-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="block-panel" fixed type="error" backdrop blockscrolling persistent>
        <span slot="title">${_t('dialog.error.Error')}</span>
        <div slot="content" style="text-align:center;">
          ${this.errorMsg}
        </div>
      </backend-ai-dialog>
      <backend-ai-dialog id="email-sent-dialog" noclosebutton fixed backdrop blockscrolling persistent>
        <span slot="title">${_t("signup.ThankYou")}</span>
        <div slot="content">
          <p style="max-width:350px">${_t("signup.VerificationMessage")}</p>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <wl-button class="ok" @click="${(e) => {
      e.target.closest('backend-ai-dialog').hide()
    }}">${_t("button.Okay")}</wl-button>
        </div>
      </backend-ai-dialog>
      <lablup-terms-of-service id="terms-of-service"></lablup-terms-of-service>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-signup": BackendAiSignup;
  }
}
