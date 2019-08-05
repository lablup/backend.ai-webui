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
import {default as PainKiller} from './backend-ai-painkiller';

import '../lib/backend.ai-client-es6.js';

import {BackendAiStyles} from "./backend-ai-console-styles";


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
      }
    };
  }

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
  }

  firstUpdated() {
    this.loginPanel = this.shadowRoot.querySelector('#login-panel');
    this.blockPanel = this.shadowRoot.querySelector('#block-panel');

    this.shadowRoot.querySelector('#login-button').addEventListener('tap', this._login.bind(this));
    this.notification = this.shadowRoot.querySelector('#notification');
  }

  refreshPanel(config) {
    if (typeof config.plugin === "undefined" || typeof config.plugin.login === "undefined" || config.plugin.login === '') {
    } else {
      import('../plugins/' + config.plugin.login).then(()=>{
        console.log("Plugin loaded.");
      }).catch((err) => {   // Connection failed
        if (this.loginPanel.open !== true) {
          if (err.message !== undefined) {
            this.notification.text = PainKiller.relieve(err.message);
          } else {
            this.notification.text = PainKiller.relieve('Plugin loading failed.');
          }
          this.notification.show();
          this.open();
        } else {
          this.notification.text = PainKiller.relieve('Login failed. Check login information.');
          this.notification.show();
        }
      });
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
      // TODO : use lit-element dynamic assignment
      if (config.general.connectionMode.toUpperCase() === 'SESSION') {
        this.connection_mode = 'SESSION';
        this.shadowRoot.querySelector('#id_api_key').style.display = 'none';
        this.shadowRoot.querySelector('#id_secret_key').style.display = 'none';
        this.shadowRoot.querySelector('#id_user_id').style.display = 'block';
        this.shadowRoot.querySelector('#id_password').style.display = 'block';
      } else {
        this.connection_mode = 'API';
        this.shadowRoot.querySelector('#id_api_key').style.display = 'block';
        this.shadowRoot.querySelector('#id_secret_key').style.display = 'block';
        this.shadowRoot.querySelector('#id_user_id').style.display = 'none';
        this.shadowRoot.querySelector('#id_password').style.display = 'none';
      }
    }
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

  _validate_data(value) {
    if (value != undefined && value != null && value != '') {
      return true;
    }
    return false;
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
          this.notification.show();
          this.open();
        } else {
          this.notification.text = PainKiller.relieve('Login failed. Check login information.');
          this.notification.show();
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
      if (this.loginPanel.open !== true) {
        if (err.message !== undefined) {
          this.notification.text = PainKiller.relieve(err.message);
        } else {
          this.notification.text = PainKiller.relieve('Login information mismatch. If the information is correct, logout and login again.');
        }
        this.notification.show();
        this.open();
      } else {
        this.notification.text = PainKiller.relieve('Login failed. Check login information.');
        this.notification.show();
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
      window.backendaiclient.groups = groups.map((item) => {
        return item.name;
      });
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
        this.notification.show();
        this.open();
      } else {
        this.notification.text = PainKiller.relieve('Login failed. Check login information.');
        this.notification.show();
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
        this.notification.show();
        this.open();
      } else {
        this.notification.text = PainKiller.relieve('Login failed. Check login information.');
        this.notification.show();
      }
      this.open();
    });
  }

  static get styles() {
    return [
      BackendAiStyles,
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
          border-bottom: 1px solid #aaa;
          margin: 15px 0;
          font: inherit;
          font-size: 16px;
          outline: none;
        }

        fieldset input:focus {
          border-bottom: 1.5px solid #0d47a1;
        }

        #login-panel {
          --dialog-width: 400px;
        }

        wl-button {
          width: 335px;
          --button-bg: transparent;
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-600);
        }
      `];
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
      <wl-dialog id="login-panel" fixed backdrop blockscrolling persistent>
        <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center-justified flex layout">
            <div>Login</div>
            <div class="flex"></div>
          </h3>
          <form id="login-form">
            <fieldset>
              <paper-input type="text" name="api_key" id="id_api_key" maxlength="30" style="display:none;"
                           label="API Key" value="${this.api_key}"></paper-input>
              <paper-input type="password" name="secret_key" id="id_secret_key" style="display:none;"
                           label="Secret Key" value="${this.secret_key}"></paper-input>
              <paper-input type="text" name="user_id" id="id_user_id" maxlength="30" style="display:none;"
                           label="ID" value="${this.user_id}"></paper-input>
              <paper-input type="password" name="password" id="id_password" style="display:none;"
                           label="Password" value="${this.password}"></paper-input>
              <paper-input type="text" name="api_endpoint" id="id_api_endpoint" style="display:none;"
                           label="API Endpoint" value="${this.api_endpoint}"></paper-input>
              <paper-input type="text" name="api_endpoint_humanized" id="id_api_endpoint_humanized"
                           style="display:none;"
                           label="API Endpoint" value=""></paper-input>
              <br/><br/>
              <wl-button class="fg red" id="login-button" outlined type="button"
                          @click="${(e) => this._login(e)}">
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
          <h3>${this.blockType}</h3>
          ` : html``}
          <div style="text-align:center;padding-top:15px;">
          ${this.blockMessage}
          </div>
        </wl-card>
        ` : html``}
      </wl-dialog>
      <lablup-notification id="notification"></lablup-notification>
    `;
  }
}

customElements.define(BackendAiLogin.is, BackendAiLogin);
