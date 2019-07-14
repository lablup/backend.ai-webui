/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import '@polymer/paper-input/paper-input';
import '@polymer/app-storage/app-localstorage/app-localstorage-document';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/dialog';
import 'weightless/card';
import './lablup-notification.js';

import '../lib/backend.ai-client-es6.js';

import {BackendAiStyles} from "./backend-ai-console-styles";
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";

/**
 Backend.AI Signup feature for GUI Console

 `backend-ai-signup` is a login UI / Model to provide both API and session-based login.

 Example:

 <backend-ai-signup>
 ... content ...
 </backend-ai-signup>

 @group Backend.AI Console
 */
class BackendAiSignup extends LitElement {
  static get is() {
    return 'backend-ai-signup';
  }

  static get properties() {
    return {
      company_name: {
        type: String
      },
      company_id: {
        type: String
      },
      user_name: {
        type: String
      },
      user_email: {
        type: String
      },
      notification: {
        type: Object
      },
      errorMsg: {
        type: String
      },
      signupPanel: {
        type: Object
      },
      client: {
        type: Object
      },
      endpoint: {
        type: String
      }
    };
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.company_name = '';
    this.company_id = '';
    this.user_name= '';
    this.user_email = '';
    this.errorMsg = '';
    this.config = null;
    this.endpoint = '';
    this.client = {};
  }

  firstUpdated() {
    this.signupPanel = this.shadowRoot.querySelector('#signup-panel');
    this.notification = this.shadowRoot.querySelector('#notification');
  }

  refreshPanel(config) {
  }

  open() {
    console.log(this.endpoint);
    if (this.endpoint !== '' && this.client !== {}) {
      let clientConfig = {
        connectionMode: 'SESSION',
        apiVersionMajor: 'v4',
        apiVersion:'v4.20190615',
        endpoint: this.endpoint
      };
      this.client = new ai.backend.Client(
        clientConfig,
        `Backend.AI Console.`,
      );
    }
    if (this.signupPanel.open !== true) {
      this.signupPanel.show();
    }
  }

  close() {
    if (this.signupPanel.open === true) {
      this.signupPanel.hide();
    }
  }
  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name == 'active' && newval !== null) {
      this.active = true;
      this._menuChanged(true);
    } else {
      this.active = false;
      this._menuChanged(false);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }

  block(message = '') {
    this.errorMsg = message;
    this.shadowRoot.querySelector('#block-panel').show();
  }

  _validate_data(value) {
    if (value != undefined && value != null && value != '') {
      return true;
    }
    return false;
  }

  _check_info() {
    this.user_email = this.shadowRoot.querySelector('#id_user_email').value;
    let rqst = this.client.newPublicRequest('GET', `/hanati/user?email=${this.user_email}`, null, '');
    this.client._wrapWithPromise(rqst).then((response)=>{
      console.log(response);
      // If user exists:
      let data = response;
      if (data.id) {
        let company = data.company;
        this.company_name = company.name;
        this.user_name = data.name;
        this.shadowRoot.querySelector('#signup-button').removeAttribute('disabled');
      } else {
        this.notification.text = 'Found no user in the system. Make sure you entered a correct E-mail.';
        this.notification.show();
      }
    }).catch((e)=>{
      if (e.message) {
        this.notification.text = e.message;
        this.notification.show();
      }
      console.log(e);
    });
  }

  _clear_info() {
    this.company_name = '';
    this.user_name = '';
    this.shadowRoot.querySelector('#signup-button').setAttribute('disabled', true);
  }

  _signup() {
    let password1 = this.shadowRoot.querySelector('#id_password1').value;
    let password2 = this.shadowRoot.querySelector('#id_password2').value;
    if (password1 !== password2) {
      this.notification.text = 'Password mismatch. Please check your password.';
      this.notification.show();
      return;
    }
    this.notification.text = 'Processing...';
    this.notification.show();
    // TODO : send signup request.
    let body = {
      'email': this.email,
      'password': password1
    };
    let rqst = this.client.newSignedRequest('POST', `/auth/signup`, body);
    this.client._wrapWithPromise(rqst).then((response) => {
      this.shadowRoot.querySelector('#id_user_name').setAttribute('disabled', true);
      this.shadowRoot.querySelector('#signup-button').setAttribute('disabled', true);
      this.shadowRoot.querySelector('#signup-button-message').textContent = 'Signup succeed';
      this.notification.text = 'Signup succeed.';
      this.notification.show();
    }).catch((e) => {
      if (e.message) {
        this.notification.text = e.message;
        this.notification.show();
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

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        paper-icon-button {
          --paper-icon-button-ink-color: white;
        }

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
      `];
  }

  render() {
    // language=HTML
    return html`
      <wl-dialog id="signup-panel" fixed blockscrolling persistent>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <div>Signup</div> 
            <div class="flex"></div>
            <wl-button class="fab"  style="width:40px;" fab flat inverted @click="${(e) => this._hideDialog(e)}">
              <wl-icon>close</wl-icon>
            </wl-button>
          </h3>
          <form id="signup-form">
            <fieldset>
              <div class="horizontal center layout">
                <paper-input type="text" name="user_email" id="id_user_email" maxlength="50" autofocus
                             style="width:260px;" label="E-mail" value="${this.user_email}"
                             @change="${() => this._clear_info()}"></paper-input>
                <wl-button class="fg red" id="check-info-button" outlined type="button"
                            @click="${(e) => this._check_info(e)}">
                            <wl-icon>check</wl-icon>
                            Check</wl-button>
              </div>
              <paper-input type="text" name="user_name" id="id_user_name" maxlength="30" disabled
                           label="User Name" .value="${this.user_name}"></paper-input>
              <paper-input type="text" name="company_name" id="id_company_name" maxlength="30" disabled
                           label="Company" .value="${this.company_name}"></paper-input>
              <paper-input type="password" name="password1" id="id_password1"
                           label="Password" value=""></paper-input>
              <paper-input type="password" name="password2" id="id_password2"
                           label="Password (again)" value=""></paper-input>
              <br/><br/>
              <wl-button class="full" id="signup-button" disabled outlined type="button"
                          @click="${(e) => this._signup(e)}">
                          <wl-icon>check</wl-icon>
                          <span id="signup-button-message">Signup</span></wl-button>
            </fieldset>
          </form>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="block-panel" fixed backdrop blockscrolling persistent>
        <wl-card>
          <h3>Error</h3>
          <div style="text-align:center;">
          ${this.errorMsg}
          </div>
        </wl-card>
      </wl-dialog>
      <lablup-notification id="notification"></lablup-notification>
    `;
  }
}

customElements.define(BackendAiSignup.is, BackendAiSignup);
