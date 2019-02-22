/**
 * Login implementation of Backend.AI-console
 */

import {html, PolymerElement} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/paper-material/paper-material';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-toast/paper-toast';

import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';

import '@polymer/neon-animation/animations/scale-up-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';

import '@polymer/app-storage/app-localstorage/app-localstorage-document';

import './backend.ai-client-es6.js';

import './backend-ai-styles.js';

class BackendAiLogin extends PolymerElement {
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
      api_endpoint: {
        type: String
      },
      proxyURL: {
        type: String,
        value: ''
      }
    };
  }

  _getStoredKeys(key) {
    return '';
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
  }

  ready() {
    super.ready();
    this.$['login-button'].addEventListener('tap', this._login.bind(this));
    import( '../../config.js').then((config) => { // from config.js
      if (typeof config.proxyURL === "undefined" || config.proxyURL === '') {
        this.proxyURL = 'http://127.0.0.1:5050/';
      } else {
        this.proxyURL = config.proxyURL;
      }
      if (typeof config.apiEndpoint === "undefined" || config.apiEndpoint === '') {
      } else {
        this.api_endpoint = config.apiEndpoint;
        this.$['id_api_endpoint'].disabled = true;
      }
    }).catch((err) => {   // No file
      this.proxyURL = 'http://127.0.0.1:5050/';
    });
  }

  open() {
    this.$['login-panel'].open();
  }

  close() {
    this.$['login-panel'].close();
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
    this.api_key = this.$['id_api_key'].value;
    this.secret_key = this.$['id_secret_key'].value;
    this.api_endpoint = this.$['id_api_endpoint'].value;
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
    let v = {}

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
      window.backendaiclient.proxyURL = this.proxyURL;
      var event = new CustomEvent("backend-ai-connected", {"detail": this.client});
      document.dispatchEvent(event);
      this.close();
    }).catch((err) => {   // Connection failed
      if (this.$['login-panel'].opened != true) {
        if (err.message != undefined) {
          this.$.notification.text = err.message;
        } else {
          this.$.notification.text = 'Login information mismatch. If the information is correct, logout and login again.';
        }
        this.$.notification.show();
        this.open();
      } else {
        this.$.notification.text = 'Login failed. Check login information.';
        this.$.notification.show();
      }
    });
  }

  static get template() {
    // language=HTML
    return html`
      <style is="custom-style" include="backend-ai-styles">
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

        paper-button {
          width: 100%;
        }
      </style>
      <app-localstorage-document key="backendaiconsole.email" data="{{email}}"></app-localstorage-document>
      <app-localstorage-document id="storage" key="backendaiconsole.api_key"
                                 data="{{api_key}}"></app-localstorage-document>
      <app-localstorage-document key="backendaiconsole.secret_key" data="{{secret_key}}"></app-localstorage-document>
      <app-localstorage-document key="backendaiconsole.api_endpoint"
                                 data="{{api_endpoint}}"></app-localstorage-document>

      <paper-dialog id="login-panel"
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation" modal>
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3>Console login</h3>
          <form id="login-form" onSubmit="this._login()">
            <fieldset>
              <paper-input type="text" name="api_key" id="id_api_key" maxlength="30" autofocus
                           label="API Key" value="{{api_key}}"></paper-input>
              <paper-input type="password" name="secret_key" id="id_secret_key"
                           label="Secret Key" value="{{secret_key}}"></paper-input>
              <paper-input type="text" name="api_endpoint" id="id_api_endpoint"
                           label="API Endpoint" value="{{api_endpoint}}"></paper-input>
              <br/><br/>
              <paper-button dialog-confirm class="blue" type="submit" id="login-button">
                <iron-icon icon="check"></iron-icon>
                Login
              </paper-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
    `;
  }
}

customElements.define(BackendAiLogin.is, BackendAiLogin);
