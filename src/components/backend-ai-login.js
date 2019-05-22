/**
 * Login implementation of Backend.AI-console
 */

import {css, html, LitElement} from "lit-element";
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '../plastics/plastic-material/plastic-material';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-toast/paper-toast';

import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';

import '@polymer/neon-animation/animations/scale-up-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';

import '@polymer/app-storage/app-localstorage/app-localstorage-document';
import '@material/mwc-button';

import '../backend.ai-client-es6.js';

import {BackendAiStyles} from "../backend-ai-console-styles";

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
      console_server: {
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

  _getStoredKeys(key) {
    return '';
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.api_key = '';
    this.secret_key = '';
    this.api_endpoint = '';
    this.proxy_url = 'http://127.0.0.1:5050/';
    this.console_server = '';
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
    if (typeof config.general === "undefined" || typeof config.general.consoleServer === "undefined" || config.general.consoleServer === '') {
      this.console_server = '';
    } else {
      this.console_server = config.general.consoleServer;
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
    this.api_endpoint = JSON.parse(localStorage.getItem('backendaiconsole.api_endpoint'));

    if (this._validate_data(this.api_key) && this._validate_data(this.secret_key) && this._validate_data(this.api_endpoint)) {
      this._connect();
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
    this._connect();
  }

  _connect() {
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
    let fields = ["user_id", "is_admin", "resource_policy"];
    let q = `query { keypair { ${fields.join(" ")} } }`;
    let v = {};

    this.client.gql(q, v).then(response => {
      window.backendaiclient = this.client;
      let email = response['keypair'].user_id;
      let is_admin = response['keypair'].is_admin;
      let resource_policy = response['keypair'].resource_policy;
      if (this.email != email) {
        this.email = email;
      }
      window.backendaiclient.email = this.email;
      window.backendaiclient.is_admin = is_admin;
      window.backendaiclient.resource_policy = resource_policy;
      window.backendaiclient._config._proxyURL = this.proxy_url;
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

        mwc-button {
          width: 100%;
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
              <mwc-button class="fg red" id="login-button" outlined label="Login" icon="check" type="submit"
                          dialog-confirm></mwc-button>
            </fieldset>
          </form>
        </plastic-material>
      </paper-dialog>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
    `;
  }
}

customElements.define(BackendAiLogin.is, BackendAiLogin);
