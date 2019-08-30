/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";

import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import '@polymer/app-storage/app-localstorage/app-localstorage-document';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/dialog';
import 'weightless/card';
import 'weightless/textfield';

import './lablup-notification';
import '../plastics/lablup-shields/lablup-shields';

import './backend-ai-signup';
import {default as PainKiller} from './backend-ai-painkiller';

import * as aiSDK from '../lib/backend.ai-client-es6';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from "../plastics/layout/iron-flex-layout-classes";
import {BackendAiStyles} from "./backend-ai-console-styles";

declare global {
  const ai: typeof aiSDK;
}


/**
 Backend.AI Login for GUI Console

 `backend-ai-login` is a login UI / Model to provide both API and session-based login.

 Example:

 <backend-ai-login>
 ... content ...
 </backend-ai-login>

 @group Backend.AI Console
 */

class BackendAiLogin extends LitElement {
  public api_key: any;
  public secret_key: any;
  public user_id: any;
  public password: any;
  public api_endpoint: any;
  public domain_name: any;
  public proxy_url: any;
  public connection_mode: any;
  public default_session_environment: any;
  public blockMessage: any;
  public blockType: any;
  public config: any;
  public loginPanel: any;
  public shadowRoot: any;
  public blockPanel: any;
  public notification: any;
  public clientConfig: any;
  public client: any;
  public user: any;
  public email: any;
  public signup_support: any;
  public change_signin_support: any;

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.api_key = '';
    this.secret_key = '';
    this.user_id = '';
    this.password = '';
    this.api_endpoint = '';
    this.domain_name = '';
    this.proxy_url = 'http://127.0.0.1:5050/';
    this.connection_mode = 'API';
    this.default_session_environment = '';
    this.blockMessage = '';
    this.blockType = '';
    this.config = null;
    this.signup_support = false;
    this.change_signin_support = false;
    window.backendaiconsole = {};
  }

  static get is() {
    return 'backend-ai-login';
  }

  static get properties() {
    return {
      api_key: {
        type: String
      },
      secret_key: {
        type: String
      },
      user_id: {
        type: String
      },
      password: {
        type: String
      },
      proxy_url: {
        type: String
      },
      api_endpoint: {
        type: String
      },
      domain_name: {
        type: String
      },
      default_session_environment: {
        type: String
      },
      config: {
        type: Object
      },
      notification: {
        type: Object
      },
      loginPanel: {
        type: Object
      },
      blockPanel: {
        type: Object
      },
      blockMessage: {
        type: String
      },
      blockType: {
        type: String
      },
      signup_support: {
        type: Boolean
      },
      change_signin_support: {
        type: Boolean
      }
    };
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

        app-drawer-layout:not([narrow]) [drawer-toggle] {
          display: none;
        }

        fieldset input {
          width: 100%;
          border: 0;
          margin: 15px 0 0 0;
          font: inherit;
          font-size: 16px;
          outline: none;
        }

        wl-textfield {
          --input-font-family: 'Quicksand', sans-serif;
        }

        #login-panel {
          --dialog-width: 400px;
        }

        h3 small {
          --button-font-size: 12px;
        }

        wl-button {
          --button-bg: transparent;
        }

        wl-button.mini {
          font-size: 12px;
        }

        wl-button.full {
          width: 335px;
        }

        wl-button.login-button,
        wl-button.login-cancel-button {
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-600);
        }

        wl-button.signup-button {
          --button-bg-hover: var(--paper-green-100);
          --button-bg-active: var(--paper-green-600);
        }

        wl-button > wl-icon {
          --icon-size: 24px;
          padding: 0;
        }

        wl-icon {
          --icon-size: 16px;
          padding: 0;
        }
      `];
  }

  firstUpdated() {
    this.loginPanel = this.shadowRoot.querySelector('#login-panel');
    this.blockPanel = this.shadowRoot.querySelector('#block-panel');

    this.shadowRoot.querySelector('#login-button').addEventListener('tap', this._login.bind(this));
    this.notification = window.lablupNotification;
  }

  _changeSigninMode() {
    if (this.change_signin_support === true) {
      if (this.connection_mode == 'SESSION') {
        this.connection_mode = 'API';
      } else {
        this.connection_mode = 'SESSION';
      }
      this.refreshPanel();
      this.requestUpdate();
    }
  }

  refreshPanel() {
    // TODO : use lit-element dynamic assignment
    if (this.connection_mode == 'SESSION') {
      this.shadowRoot.querySelector('#id_api_key').style.display = 'none';
      this.shadowRoot.querySelector('#id_secret_key').style.display = 'none';
      this.shadowRoot.querySelector('#id_user_id').style.display = 'block';
      this.shadowRoot.querySelector('#id_password').style.display = 'block';
    } else {
      this.shadowRoot.querySelector('#id_api_key').style.display = 'block';
      this.shadowRoot.querySelector('#id_secret_key').style.display = 'block';
      this.shadowRoot.querySelector('#id_user_id').style.display = 'none';
      this.shadowRoot.querySelector('#id_password').style.display = 'none';
    }
  }

  refreshWithConfig(config) {
    if (typeof config.plugin === "undefined" || typeof config.plugin.login === "undefined" || config.plugin.login === '') {
    } else {
      import('../plugins/' + config.plugin.login).then(() => {
        console.log("Plugin loaded.");
      }).catch((err) => {   // Connection failed
        if (this.loginPanel.open !== true) {
          if (err.message !== undefined) {
            this.notification.text = PainKiller.relieve(err.message);
          } else {
            this.notification.text = PainKiller.relieve('Plugin loading failed.');
          }
          this.notification.show(true);
          this.open();
        } else {
          this.notification.text = PainKiller.relieve('Login failed. Check login information.');
          this.notification.show(true);
        }
      });
    }
    if (typeof config.general === "undefined" || typeof config.general.debug === "undefined" || config.general.debug === '') {
      window.backendaiconsole.debug = false;
    } else if (config.general.debug === true) {
      window.backendaiconsole.debug = true;
      console.log('Debug flag is set to true');
    }
    if (typeof config.general === "undefined" || typeof config.general.signupSupport === "undefined" || config.general.signupSupport === '' || config.general.signupSupport == false) {
      this.signup_support = false;
    } else {
      this.signup_support = true;
    }
    if (typeof config.general === "undefined" || typeof config.general.allowChangeSigninMode === "undefined" || config.general.allowChangeSigninMode === '' || config.general.allowChangeSigninMode == false) {
      this.change_signin_support = false;
    } else {
      this.change_signin_support = true;
    }

    if (typeof config.wsproxy === "undefined" || typeof config.wsproxy.proxyURL === "undefined" || config.wsproxy.proxyURL === '') {
      this.proxy_url = 'http://127.0.0.1:5050/';
    } else {
      this.proxy_url = config.wsproxy.proxyURL;
    }
    if (typeof config.general === "undefined" || typeof config.general.apiEndpoint === "undefined" || config.general.apiEndpoint === '') {
      this.shadowRoot.querySelector('#id_api_endpoint').style.display = 'block';
      this.shadowRoot.querySelector('#id_api_endpoint_humanized').style.display = 'none';
    } else {
      this.api_endpoint = config.general.apiEndpoint;
      if (typeof config.general === "undefined" || typeof config.general.apiEndpointText === "undefined" || config.general.apiEndpointText === '') {
        this.shadowRoot.querySelector('#id_api_endpoint').style.display = 'block';
        this.shadowRoot.querySelector('#id_api_endpoint_humanized').style.display = 'none';
      } else {
        this.shadowRoot.querySelector('#id_api_endpoint').style.display = 'none';
        this.shadowRoot.querySelector('#id_api_endpoint_humanized').style.display = 'block';
        this.shadowRoot.querySelector('#id_api_endpoint_humanized').value = config.general.apiEndpointText;
      }
      this.shadowRoot.querySelector('#id_api_endpoint').disabled = true;
      this.shadowRoot.querySelector('#id_api_endpoint_humanized').disabled = true;
    }

    if (typeof config.general === "undefined" || typeof config.general.defaultSessionEnvironment === "undefined" || config.general.defaultSessionEnvironment === '') {
      this.default_session_environment = '';
    } else {
      this.default_session_environment = config.general.defaultSessionEnvironment;
    }
    if (typeof config.general === "undefined" || typeof config.general.connectionMode === "undefined" || config.general.connectionMode === '') {
      this.connection_mode = 'API';
    } else {
      if (config.general.connectionMode.toUpperCase() === 'SESSION') {
        this.connection_mode = 'SESSION';
      } else {
        this.connection_mode = 'API';
      }
    }
    this.refreshPanel();
  }

  open() {
    if (this.loginPanel.open !== true) {
      this.loginPanel.show();
    }
    if (this.blockPanel.open === true) {
      this.blockPanel.hide();
    }
  }

  close() {
    if (this.loginPanel.open === true) {
      this.loginPanel.hide();
    }
    if (this.blockPanel.open === true) {
      this.blockPanel.hide();
    }
  }

  block(message = '', type = '') {
    this.blockMessage = message;
    this.blockType = type;
    this.shadowRoot.querySelector('#block-panel').show();
  }

  free() {
    this.shadowRoot.querySelector('#block-panel').hide();
  }

  login() {
    this.api_key = JSON.parse(localStorage.getItem('backendaiconsole.api_key'));
    this.secret_key = JSON.parse(localStorage.getItem('backendaiconsole.secret_key'));
    this.user_id = JSON.parse(localStorage.getItem('backendaiconsole.user_id'));
    this.password = JSON.parse(localStorage.getItem('backendaiconsole.password'));
    if (this.api_key === null) {
      this.api_key = '';
    }
    if (this.secret_key === null) {
      this.secret_key = '';
    }
    if (this.user_id === null) {
      this.user_id = '';
    }
    if (this.password === null) {
      this.password = '';
    }
    if (this.api_endpoint === '') {
      this.api_endpoint = JSON.parse(localStorage.getItem('backendaiconsole.api_endpoint'));
    }
    this.api_endpoint = this.api_endpoint.trim();
    if (this.connection_mode === 'SESSION' && this._validate_data(this.user_id) && this._validate_data(this.password) && this._validate_data(this.api_endpoint)) {
      this.block('Please wait to login.', 'Connecting to Backend.AI Cluster...');
      this.notification.text = 'Please wait to login...';
      this.notification.show();
      this._connectUsingSession();
    } else if (this.connection_mode === 'API' && this._validate_data(this.api_key) && this._validate_data(this.secret_key) && this._validate_data(this.api_endpoint)) {
      this.block('Please wait to login.', 'Connecting to Backend.AI Cluster...');
      this.notification.text = 'Please wait to login...';
      this.notification.show();
      this._connectUsingAPI();
    } else {
      this.open();
    }
  }

  _showSignupDialog() {
    this.shadowRoot.querySelector('#signup-dialog').endpoint = this.api_endpoint;
    //this.shadowRoot.querySelector('#signup-dialog').receiveAgreement();
    this.shadowRoot.querySelector('#signup-dialog').open();
  }

  _hideDialog(e) {
    let hideButton = e.target;
    let dialog = hideButton.closest('wl-dialog');
    dialog.hide();
  }

  _cancelLogin(e) {
    this._hideDialog(e);
    this.open();
  }

  _validate_data(value) {
    if (value != undefined && value != null && value != '') {
      return true;
    }
    return false;
  }

  _submitIfEnter(e) {
    if (e.keyCode == 13) this._login();
  }

  _login() {
    this.api_endpoint = this.shadowRoot.querySelector('#id_api_endpoint').value;
    this.api_endpoint = this.api_endpoint.replace(/\/+$/, "");
    this.notification.text = 'Please wait to login...';
    this.notification.show();
    if (this.connection_mode === 'SESSION') {
      this.user_id = this.shadowRoot.querySelector('#id_user_id').value;
      this.password = this.shadowRoot.querySelector('#id_password').value;
      this._connectUsingSession();
    } else {
      this.api_key = this.shadowRoot.querySelector('#id_api_key').value;
      this.secret_key = this.shadowRoot.querySelector('#id_secret_key').value;
      this._connectUsingAPI();
    }
  }

  async _connectUsingSession() {
    this.clientConfig = new ai.backend.ClientConfig(
      this.user_id,
      this.password,
      this.api_endpoint,
      'SESSION'
    );
    this.client = new ai.backend.Client(
      this.clientConfig,
      `Backend.AI Console.`,
    );
    let isLogon = await this.client.check_login();
    if (isLogon === false) {
      this.client.login().then(response => {
        if (response === false) {
          throw {"message": "Authentication failed. Check information and manager status."};
        } else {
          return this._connectGQL();
        }
      }).catch((err) => {   // Connection failed
        this.free();
        if (this.loginPanel.open !== true) {
          if (err.message !== undefined) {
            this.notification.text = PainKiller.relieve(err.message);
          } else {
            this.notification.text = PainKiller.relieve('Login information mismatch. If the information is correct, logout and login again.');
          }
          this.notification.show(true);
          this.open();
        } else {
          this.notification.text = PainKiller.relieve('Login failed. Check login information.');
          this.notification.show(true);
        }
        this.open();
      });
    } else {
      return this._connectGQL();
    }
  }

  _connectUsingAPI() {
    this.clientConfig = new ai.backend.ClientConfig(
      this.api_key,
      this.secret_key,
      this.api_endpoint
    );
    this.client = new ai.backend.Client(
      this.clientConfig,
      `Backend.AI Console.`,
    );
    this.client.ready = false;
    this._connectGQL();
  }

  _connectGQL() {
    // Test connection
    this.block();
    this.client.getManagerVersion().then(response => {
      return this.client.isAPIVersionCompatibleWith('v4.20190601');
    }).then(response => {
      if (response === false) {// Legacy code to support 19.03
        this._connectViaGQLLegacy();
      } else {
        this._connectViaGQL();
      }
    }).catch((err) => {   // Connection failed
      console.log(err);
      if (this.loginPanel.open !== true) {
        if (err.message !== undefined) {
          this.notification.text = PainKiller.relieve(err.message);
        } else {
          this.notification.text = PainKiller.relieve('Login information mismatch. If the information is correct, logout and login again.');
        }
        this.notification.show(true);
        this.open();
      } else {
        this.notification.text = PainKiller.relieve('Login failed. Check login information.');
        this.notification.show(true);
      }
      this.free();
      this.open();
    });
  }

  _connectViaGQL() {
    let fields = ["user_id", "resource_policy", "user"];
    let q = `query { keypair { ${fields.join(" ")} } }`;
    let v = {};
    return this.client.gql(q, v).then(response => {
      window.backendaiclient = this.client;
      let resource_policy = response['keypair'].resource_policy;
      window.backendaiclient.resource_policy = resource_policy;
      this.user = response['keypair'].user;
      let fields = ["username", "email", "full_name", "is_active", "role", "domain_name", "groups {name}"];
      let q = `query { user { ${fields.join(" ")} } }`;
      let v = {'uuid': this.user};
      return window.backendaiclient.gql(q, v);
    }).then(response => {
      let email = response['user'].email;
      if (this.email !== email) {
        this.email = email;
      }
      let groups = response['user'].groups;
      if (groups !== null) {
        window.backendaiclient.groups = groups.map((item) => {
          return item.name;
        });
      } else {
        window.backendaiclient.groups = ['default'];
      }
      let role = response['user'].role;
      this.domain_name = response['user'].domain_name;
      window.backendaiclient.email = this.email;
      window.backendaiclient.current_group = window.backendaiclient.groups[0];
      window.backendaiclient.is_admin = false;
      window.backendaiclient.is_superadmin = false;

      if (["superadmin", "admin"].includes(role)) {
        window.backendaiclient.is_admin = true;
      }
      if (["superadmin"].includes((role))) {
        window.backendaiclient.is_superadmin = true;
      }
      window.backendaiclient._config._proxyURL = this.proxy_url;
      window.backendaiclient._config.domainName = this.domain_name;
      window.backendaiclient._config.default_session_environment = this.default_session_environment;
      window.backendaiclient.ready = true;
      let event = new CustomEvent("backend-ai-connected", {"detail": this.client});
      document.dispatchEvent(event);
      this.close();
      this.notification.text = 'Connected.';
      this.notification.show();
    }).catch((err) => {   // Connection failed
      if (this.loginPanel.open !== true) {
        if (err.message !== undefined) {
          this.notification.text = PainKiller.relieve(err.message);
        } else {
          this.notification.text = PainKiller.relieve('Login information mismatch. If the information is correct, logout and login again.');
        }
        this.notification.show(true);
        this.open();
      } else {
        this.notification.text = PainKiller.relieve('Login failed. Check login information.');
        this.notification.show(true);
      }
    });
  }

  _connectViaGQLLegacy() {
    let fields = ["user_id", "is_admin", "resource_policy"];
    let q = `query { keypair { ${fields.join(" ")} } }`;
    let v = {};
    return this.client.gql(q, v).then(response => {
      window.backendaiclient = this.client;
      let email = response['keypair'].user_id;
      let is_admin = response['keypair'].is_admin;
      let resource_policy = response['keypair'].resource_policy;
      if (this.email != email) {
        this.email = email;
      }
      window.backendaiclient.groups = ['default'];
      window.backendaiclient.email = this.email;
      window.backendaiclient.current_group = 'default';
      window.backendaiclient.is_admin = is_admin;
      window.backendaiclient.is_superadmin = is_admin;
      window.backendaiclient.resource_policy = resource_policy;
      window.backendaiclient._config._proxyURL = this.proxy_url;
      window.backendaiclient._config.domainName = 'default';
      window.backendaiclient._config.default_session_environment = this.default_session_environment;
      return window.backendaiclient.getManagerVersion();
    }).then(response => {
      window.backendaiclient.ready = true;
      let event = new CustomEvent("backend-ai-connected", {"detail": this.client});
      document.dispatchEvent(event);
      this.close();
      this.notification.text = 'Connected.';
      this.notification.show();
    }).catch((err) => {   // Connection failed
      if (this.loginPanel.open !== true) {
        if (err.message !== undefined) {
          this.notification.text = PainKiller.relieve(err.message);
        } else {
          this.notification.text = PainKiller.relieve('Login information mismatch. If the information is correct, logout and login again.');
        }
        this.notification.show(true);
        this.open();
      } else {
        this.notification.text = PainKiller.relieve('Login failed. Check login information.');
        this.notification.show(true);
      }
      this.open();
    });
  }

  render() {
    // language=HTML
    return html`
      <app-localstorage-document key="backendaiconsole.email" data="${this.email}"></app-localstorage-document>
      <app-localstorage-document id="storage" key="backendaiconsole.api_key"
                                 data="${this.api_key}"></app-localstorage-document>
      <app-localstorage-document key="backendaiconsole.secret_key" data="${this.secret_key}"></app-localstorage-document>
      <app-localstorage-document id="storage" key="backendaiconsole.user_id"
                                 data="${this.user_id}"></app-localstorage-document>
      <app-localstorage-document key="backendaiconsole.password" data="${this.password}"></app-localstorage-document>
      <app-localstorage-document key="backendaiconsole.api_endpoint"
                                 data="${this.api_endpoint}"></app-localstorage-document>
      <wl-dialog id="login-panel" fixed backdrop blockscrolling persistent disablefocustrap>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <div>Login with ${this.connection_mode == 'SESSION' ? html`ID/password` : html`IAM`}</div>
            <div class="flex"></div>
            ${this.change_signin_support ? html`
                <small><a style="margin-left:15px;" @click="${() => this._changeSigninMode()}">${this.connection_mode == 'SESSION' ? html`Use IAM` : html`Use ID/password`}</a></small>
            ` : html``}
            ${this.signup_support ? html`
            <div class="vertical center-justified layout">
              <div style="font-size:12px;margin:0 10px;text-align:center;">Not a user?</div>
              <wl-button style="width:80px;font-weight:500;" class="signup-button fg green mini signup" outlined type="button" @click="${() => this._showSignupDialog()}">Sign up</wl-button>
            </div>
            ` : html``}
          </h3>
          <form id="login-form">
            <fieldset>
              <wl-textfield type="text" name="api_key" id="id_api_key" maxlength="30" style="display:none;"
                           label="API Key" value="${this.api_key}" @keyup="${this._submitIfEnter}"></wl-textfield>
              <wl-textfield type="password" name="secret_key" id="id_secret_key" style="display:none;"
                           label="Secret Key" value="${this.secret_key}" @keyup="${this._submitIfEnter}"></wl-textfield>
              <wl-textfield type="email" name="user_id" id="id_user_id" maxlength="30" style="display:none;"
                           label="ID" value="${this.user_id}" @keyup="${this._submitIfEnter}"></wl-textfield>
              <wl-textfield type="password" name="password" id="id_password" style="display:none;"
                           label="Password" value="${this.password}" @keyup="${this._submitIfEnter}"></wl-textfield>
              <wl-textfield type="text" name="api_endpoint" id="id_api_endpoint" style="display:none;"
                           label="API Endpoint" value="${this.api_endpoint}" @keyup="${this._submitIfEnter}"></wl-textfield>
              <wl-textfield type="text" name="api_endpoint_humanized" id="id_api_endpoint_humanized"
                           style="display:none;"
                           label="API Endpoint" value=""></wl-textfield>
              <br/><br/>
              <wl-button class="fg red full login-button" id="login-button" outlined type="button"
                          @click="${() => this._login()}">
                          <wl-icon>check</wl-icon>
                          Login</wl-button>
            </fieldset>
          </form>
        </wl-card>
      </wl-dialog>
      <wl-dialog id="block-panel" fixed backdrop blockscrolling persistent>
        ${this.blockMessage != '' ? html`
        <wl-card>
          ${this.blockType !== '' ? html`
          <h3 class="horizontal center layout" style="font-weight:bold">
            <span id="work-title">${this.blockType}</span>
            <div class="flex"></div>
          </h3>
          ` : html``}
          <div style="text-align:center;padding-top:15px;">
          ${this.blockMessage}
          </div>
          <div style="text-align:right;padding-top:15px;">
            <wl-button outlined class="fg red mini login-cancel-button" type="button" @click="${(e) => this._cancelLogin(e)}">Cancel login</wl-button>
          </div>
        </wl-card>
        ` : html``}
      </wl-dialog>
      <lablup-notification id="notification"></lablup-notification>
      <backend-ai-signup id="signup-dialog"></backend-ai-signup>
    `;
  }
}

customElements.define(BackendAiLogin.is, BackendAiLogin);
