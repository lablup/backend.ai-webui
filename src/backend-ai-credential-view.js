/**
 * Backend.AI-job-view 
 */

import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/paper-material/paper-material';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-image/iron-image';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';

import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-item/paper-item';
import '@polymer/neon-animation/animations/scale-up-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';

import './backend-ai-styles.js';
import './backend-ai-credential-list.js';

import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';


class BackendAICredentialView extends PolymerElement {
  static get properties() {
    return {
    };
  }
  static get is() {
      return 'backend-ai-credential-view';
  }

  constructor() {
    super();
    // Resolve warning about scroll performance 
    // See https://developers.google.com/web/updates/2016/06/passive-event-listeners
    setPassiveTouchGestures(true);
  }

  ready() {
    super.ready();
    this.$['add-keypair'].addEventListener('tap', this._addKeyPair.bind(this));
  }

  connectedCallback() {
    super.connectedCallback();
    afterNextRender(this, function () {
    });
  }

  static get observers() {
    return [
      '_routeChanged(route.*)',
      '_viewChanged(routeData.view)'
    ]
  }
  
  _routeChanged(changeRecord) {
    if (changeRecord.path === 'path') {
      console.log('Path changed!');
    }
  }
  _viewChanged(view) {
    // load data for view
  }
  _newSession() {
    this.$['new-session-dialog'].open();
  }

  _addKeyPair() {
    let is_active = true;
    let is_admin = false;
    let resource_policy = null;
    let rate_limit = null;
    let concurrency_limit = null;
    let user_id = 'admin@lablup.com';
    let fields = ["access_key", "secret_key"]
    let q = `mutation($user_id: String!, $input: KeyPairInput!) {` +
        `  create_keypair(user_id: $user_id, props: $input) {` +
        `    ok msg keypair { ${fields.join(" ")} }` +
        `  }` +
        `}`;
    let v = { 'user_id': user_id,
        'input': {
            'is_active': is_active,
            'is_admin': is_admin,
            'resource_policy': resource_policy,
            'rate_limit': rate_limit,
            'concurrency_limit': concurrency_limit,
        },
    };

    window.backendaiclient.gql(q, v).then(response => {
        this.test = response;
        //setTimeout(() => { this._refreshJobData(status) }, 5000);
        console.log(this.test);
    }).catch(err => {
        console.log(err);
        if (err && err.message) {
            this.$.notification.text = err.message;
            this.$.notification.show();
        }
    });
}

  static get template() {
    return html`
    <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
      paper-button.launch-button {
        width: 100%;
      }
    </style>
    <paper-material class="item" elevation="1">
        <h3 class="paper-material-title">Credentials</h3>
        <h4 class="horizontal flex center-justified layout">
            <span>Active</span>
            <span class="flex"></span>
            <paper-button id="add-keypair" class="fg red">
                <iron-icon icon="add"></iron-icon>
                Add
            </paper-button>
        </h4>
        <div>
            <backend-ai-credential-list condition="active"></backend-ai-job-list>
        </div>
        <h4>Inactive</h4>
        <div>
            <backend-ai-credential-list condition="inactive"></backend-ai-job-list>
        </div>
    
    </paper-material>
    <paper-dialog id="new-session-dialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
            <h3>Start a new session</h3>
            <form id="login-form" onSubmit="this._launchSession()">
                <fieldset>
                    <div class="horizontal center layout">
                    <paper-dropdown-menu label="Environments">
                        <paper-listbox slot="dropdown-content" selected="0">
                            <paper-item>TensorFlow</paper-item>
                            <paper-item>PyTorch</paper-item>
                            <paper-item>Python</paper-item>
                        </paper-listbox>
                    </paper-dropdown-menu>
                    <paper-dropdown-menu label="Version">
                        <paper-listbox slot="dropdown-content" selected="0">
                            <paper-item>Latest</paper-item>
                            <paper-item>2</paper-item>
                            <paper-item>1</paper-item>
                        </paper-listbox>
                    </paper-dropdown-menu>
                    </div>
                    <br /><br />
                    <paper-button class="blue launch-button" type="submit" id="launch-button">
                        <iron-icon icon="rowing"></iron-icon>
                        Launch
                    </paper-button>
                </fieldset>
            </form>
        </paper-material>
    </paper-dialog>
    `;
  }
}

customElements.define(BackendAICredentialView.is, BackendAICredentialView);
