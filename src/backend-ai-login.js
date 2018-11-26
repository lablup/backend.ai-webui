/**
 * Login implementation of Backend.AI-admin-console
 */

import {
  PolymerElement,
  html
} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import {
  setPassiveTouchGestures
} from '@polymer/polymer/lib/utils/settings';

import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/paper-material/paper-material';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-toast/paper-toast';

import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
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
        //value: ''
        //value: 'AKIAIOSFODNN7EXAMPLE'
      },
      secret_key: {
        type: String
        //value:  ''
        //value: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
      },
      api_endpoint: {
        type: String
        //value:  ''
        //value: 'http://127.0.0.1:8082'
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
    //this.$['id_api_key'].value = 'AKIAIOSFODNN7EXAMPLE';
    //this.$['id_secret_key'].value = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
    //this.$['id_api_endpoint'].value = 'http://127.0.0.1:8082';
    this.$['login-button'].addEventListener('tap', this._login.bind(this));
  }

  open() {
    this.$['login-panel'].open();
  }

  close() {
    this.$['login-panel'].close();
  }

  login() {
    if (this._validate_data(this.api_key) && this._validate_data(this.secret_key) && this._validate_data(this.api_endpoint)) {
      console.log('trying to connect to server.');
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
    this._connect();
  }
  _connect() {
    console.log(ai);
    this.clientConfig = new ai.backend.ClientConfig(
      this.api_key,
      this.secret_key,
      this.api_endpoint
      ///'AKIAIOSFODNN7EXAMPLE',
      ///'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      ///'http://127.0.0.1:8082'
    );
    this.client = new ai.backend.Client(
      this.clientConfig,
      `Backend.AI Admin App.`,
    );
    // Test connection
    let status = 'RUNNING';

    let fields = ["sess_id","lang","created_at", "terminated_at", "status", "mem_slot", "cpu_slot", "gpu_slot", "cpu_used", "io_read_bytes", "io_write_bytes"];
    let q = `query($ak:String, $status:String) {`+
    `  compute_sessions(access_key:$ak, status:$status) { ${fields.join(" ")} }`+
    '}';
    let v = {'status': status, 'ak': this.client._config.accessKey};
    this.client.gql(q, v).then(response => {
      window.backendaiclient = this.client;
      var event = new CustomEvent("backend-ai-connected", { "detail": this.client });
      document.dispatchEvent(event);
      this.close();
    }).catch(err => {   // Connection failed
      if (this.$['login-panel'].opened != true) {
        this.$.notification.text = 'Login information mismatch. If the information is correct, logout and login again.';
        this.$.notification.show();
        this.open();
      } else {
        this.$.notification.text = 'Login failed. Check login information.';
        this.$.notification.show();
      }
    });
  }
  static get template() {
    return html `
<style is="custom-style" include="backend-ai-styles">
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
paper-button {
  width: 100%;
}
</style>

<paper-dialog id="login-panel"
              entry-animation="scale-up-animation" exit-animation="fade-out-animation" with-backdrop>
<app-localstorage-document id="storage" key="backendaiconsole.api_key" data="{{api_key}}"></app-localstorage-document>
<app-localstorage-document key="backendaiconsole.secret_key" data="{{secret_key}}"></app-localstorage-document>
<app-localstorage-document key="backendaiconsole.api_endpoint" data="{{api_endpoint}}"></app-localstorage-document>
  <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
  <h3>Console login</h3>
  <form id="login-form" onSubmit="this._login()">
  <fieldset>
    <input type="text" name="api_key" id="id_api_key" maxlength="30" autofocus
           placeholder="API Key" value="{{api_key}}" />
    <input type="password" name="secret_key" id="id_secret_key"
           placeholder="Secret Key" value="{{secret_key}}" />
    <input type="text" name="api_endpoint" id="id_api_endpoint"
    placeholder="API Endpoint"  value="{{api_endpoint}}"/>
    <br /><br />
    <paper-button class="blue" type="submit" id="login-button">
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
