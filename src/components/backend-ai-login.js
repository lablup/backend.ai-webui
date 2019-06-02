/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import '../plastics/plastic-material/plastic-material';
import '@polymer/paper-toast/paper-toast';
import '@polymer/paper-dialog/paper-dialog';

import '@polymer/paper-input/paper-input';
import '@polymer/neon-animation/animations/scale-up-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';
import '@polymer/app-storage/app-localstorage/app-localstorage-document';
import 'weightless/button';
import 'weightless/icon';

import '../backend.ai-client-es6.js';

import {BackendAiStyles} from "../backend-ai-console-styles";

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
      }
    };
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.api_key = '';
    this.secret_key = '';
    this.api_endpoint = '';
    this.domain_name = '';
    this.proxy_url = 'http://127.0.0.1:5050/';
    this.connection_mode = 'API';
    this.default_session_environment = '';
    this.config = null;
  }

  firstUpdated() {
    this.shadowRoot.querySelector('#login-button').addEventListener('tap', this._login.bind(this));
  }

  refreshPanel(config) {
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
        this.shadowRoot.querySelector('#id_api_key').label = 'ID';
        this.shadowRoot.querySelector('#id_secret_key').label = 'Password';
      } else {
        this.connection_mode = 'API';
      }
    }
  }

  open() {
    this.shadowRoot.querySelector('#login-panel').open();
  }

  close() {
    this.shadowRoot.querySelector('#login-panel').close();
  }

  login() {
    this.api_key = JSON.parse(localStorage.getItem('backendaiconsole.api_key'));
    this.secret_key = JSON.parse(localStorage.getItem('backendaiconsole.secret_key'));
    if (this.api_endpoint === '') {
      this.api_endpoint = JSON.parse(localStorage.getItem('backendaiconsole.api_endpoint'));
    }
    if (this._validate_data(this.api_key) && this._validate_data(this.secret_key) && this._validate_data(this.api_endpoint)) {
      if (this.connection_mode === 'SESSION') {
        this._connectUsingSession();
      } else {
        this._connectUsingAPI();
      }
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
    this.api_key = this.shadowRoot.querySelector('#id_api_key').value;
    this.secret_key = this.shadowRoot.querySelector('#id_secret_key').value;
    this.api_endpoint = this.shadowRoot.querySelector('#id_api_endpoint').value;
    this.api_endpoint = this.api_endpoint.replace(/\/+$/, "");
    if (this.connection_mode === 'SESSION') {
      this._connectUsingSession();
    } else {
      this._connectUsingAPI();
    }
  }

  async _connectUsingSession() {
    this.clientConfig = new ai.backend.ClientConfig(
      this.api_key,
      this.secret_key,
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
        window.backendaiclient = this.client;
        window.backendaiclient._config.accessKey = response.access_key;
        let resource_policy = response['keypair'].resource_policy;
        window.backendaiclient.resource_policy = resource_policy;
        let fields = ["username", "email", "full_name", "is_active", "role", "domain_name", "groups"];
        let q = `query { user { ${fields.join(" ")} } }`;
        let v = {'uuid': response['keypair'].user};
        return this.client.gql(q, v);
      }).then(response => {
        let email = response['user'].email;
        if (this.email != email) {
          this.email = email;
        }
        let groups = response['user'].groups;
        window.backendaiclient.groups = groups.map((item) => {
          item = item.replace(/\'/g, '"');
          const parsedItem = JSON.parse(item);
          return parsedItem.name;
        });
        let role = response['user'].role;
        let domain_name = response['user'].domain_name;
        this.domain_name = domain_name;
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
        let event = new CustomEvent("backend-ai-connected", {"detail": this.client});
        document.dispatchEvent(event);
        this.close();
      }).catch((err) => {   // Connection failed
        if (this.shadowRoot.querySelector('#login-panel').opened != true) {
          if (err.message != undefined) {
            this.shadowRoot.querySelector('#notification').text = err.message;
          } else {
            this.shadowRoot.querySelector('#notification').text = 'Login information mismatch. If the information is correct, logout and login again.';
          }
          this.shadowRoot.querySelector('#notification').show();
          this.open();
        } else {
          this.shadowRoot.querySelector('#notification').text = 'Login failed. Check login information.';
          this.shadowRoot.querySelector('#notification').show();
        }
        this.open();
      });
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

    // Test connection
    let fields = ["user_id", "resource_policy", "user"];
    let q = `query { keypair { ${fields.join(" ")} } }`;
    let v = {};

    this.client.gql(q, v).then(response => {
      window.backendaiclient = this.client;
      let resource_policy = response['keypair'].resource_policy;
      window.backendaiclient.resource_policy = resource_policy;
      let fields = ["username", "email", "full_name", "is_active", "role", "domain_name", "groups"];
      let q = `query { user { ${fields.join(" ")} } }`;
      let v = {'uuid': response['keypair'].user};
      return this.client.gql(q, v);
    }).then(response => {
      let email = response['user'].email;
      if (this.email != email) {
        this.email = email;
      }
      let groups = response['user'].groups;
      window.backendaiclient.groups = groups.map((item) => {
        item = item.replace(/\'/g, '"');
        const parsedItem = JSON.parse(item);
        return parsedItem.name;
      });
      let role = response['user'].role;
      let domain_name = response['user'].domain_name;
      this.domain_name = domain_name;
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
      var event = new CustomEvent("backend-ai-connected", {"detail": this.client});
      document.dispatchEvent(event);
      this.close();
    }).catch((err) => {   // Connection failed
      if (this.shadowRoot.querySelector('#login-panel').opened != true) {
        if (err.message != undefined) {
          this.shadowRoot.querySelector('#notification').text = err.message;
        } else {
          this.shadowRoot.querySelector('#notification').text = 'Login information mismatch. If the information is correct, logout and login again.';
        }
        this.shadowRoot.querySelector('#notification').show();
        this.open();
      } else {
        this.shadowRoot.querySelector('#notification').text = 'Login failed. Check login information.';
        this.shadowRoot.querySelector('#notification').show();
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

        #login-panel {
          width: 400px;
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
      <app-localstorage-document key="backendaiconsole.email" data="{{email}}"></app-localstorage-document>
      <app-localstorage-document id="storage" key="backendaiconsole.api_key"
                                 data="${this.api_key}"></app-localstorage-document>
      <app-localstorage-document key="backendaiconsole.secret_key" data="${this.secret_key}"></app-localstorage-document>
      <app-localstorage-document key="backendaiconsole.api_endpoint"
                                 data="${this.api_endpoint}"></app-localstorage-document>

      <paper-dialog id="login-panel"
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation" modal>
        <plastic-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3>Console login</h3>
          <form id="login-form" onSubmit="this._login()">
            <fieldset>
              <paper-input type="text" name="api_key" id="id_api_key" maxlength="30" autofocus
                           label="API Key" value="${this.api_key}"></paper-input>
              <paper-input type="password" name="secret_key" id="id_secret_key"
                           label="Secret Key" value="${this.secret_key}"></paper-input>
              <paper-input type="text" name="api_endpoint" id="id_api_endpoint" style="display:none;"
                           label="API Endpoint" value="${this.api_endpoint}"></paper-input>
              <paper-input type="text" name="api_endpoint_humanized" id="id_api_endpoint_humanized"
                           style="display:none;"
                           label="API Endpoint" value=""></paper-input>
              <br/><br/>
              <wl-button class="fg red" id="login-button" outlined type="button"
                          dialog-confirm>
                          <wl-icon>check</wl-icon>
                          Login</wl-button>
            </fieldset>
          </form>
        </plastic-material>
      </paper-dialog>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
    `;
  }
}

customElements.define(BackendAiLogin.is, BackendAiLogin);
