/**
 * Backend.AI-job-view
 */

import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/paper-material/paper-material';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-image/iron-image';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';

import '@polymer/paper-input/paper-input';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-item/paper-item';
import '@polymer/neon-animation/animations/scale-up-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';
import '@vaadin/vaadin-icons/vaadin-icons.js';

import './backend-ai-styles.js';
import './backend-ai-credential-list.js';

import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';


class BackendAICredentialView extends PolymerElement {
  static get properties() {
    return {
      visible: {
        type: Boolean,
        value: false
      },
      cpu_metric: {
        type: Array,
        value: [1, 2, 3, 4, 8, 16]
      },
      ram_metric: {
        type: Array,
        value: [1, 2, 4, 8, 16]
      },
      gpu_metric: {
        type: Array,
        value: [0, 0.3, 0.6, 1, 1.5, 2]
      },
      rate_metric: {
        type: Array,
        value: [1000, 2000, 3000, 4000, 5000, 10000]
      },
      concurrency_metric: {
        type: Array,
        value: [1, 2, 3, 4, 5, 10]
      },
    }
  }

  static get is() {
    return 'backend-ai-credential-view';
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
  }

  ready() {
    super.ready();
    this.$['add-keypair'].addEventListener('tap', this._launchKeyPairDialog.bind(this));
    this.$['create-button'].addEventListener('tap', this._addKeyPair.bind(this));

    document.addEventListener('backend-ai-credential-refresh', () => {
      this.$['active-credential-list'].refresh();
      this.$['inactive-credential-list'].refresh();
    }, true);
  }

  connectedCallback() {
    super.connectedCallback();
    afterNextRender(this, function () {
    });
  }

  static get observers() {
    return [
      '_routeChanged(route.*)',
      '_viewChanged(routeData.view)',
      '_menuChanged(visible)'
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

  _menuChanged(visible) {
    if (!visible) {
      this.$['active-credential-list'].visible = false;
      this.$['inactive-credential-list'].visible = false;
      return;
    } else {
      this.$['active-credential-list'].visible = true;
      this.$['inactive-credential-list'].visible = true;
    }
  }

  _launchKeyPairDialog() {
    this.$['new-keypair-dialog'].open();
  }

  _addKeyPair() {
    let is_active = true;
    let is_admin = false;
    let resource_policy = null;
    let rate_limit = 5000;
    let concurrency_limit = 1;
    let user_id;
    if (this.$['id_new_user_id'].value != '') {
      if (this.$['id_new_user_id'].invalid == true) {
        return;
      }
      user_id = this.$['id_new_user_id'].value;
    } else {
      user_id = window.backendaiclient.email;
    }
    console.log(user_id);
    // Read resources
    let cpu_resource = this.$['cpu-resource'].value;
    let ram_resource = this.$['ram-resource'].value;
    let gpu_resource = this.$['gpu-resource'].value;

    concurrency_limit = this.$['concurrency-limit'].value;
    rate_limit = this.$['rate-limit'].value;

    //user_id = window.backendaiclient.email;
    let fields = ["access_key", "secret_key"]
    let q = `mutation($user_id: String!, $input: KeyPairInput!) {` +
      `  create_keypair(user_id: $user_id, props: $input) {` +
      `    ok msg keypair { ${fields.join(" ")} }` +
      `  }` +
      `}`;
    let v = {
      'user_id': user_id,
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
      this.$['active-credential-list'].refresh();
      this.$['inactive-credential-list'].refresh();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  static get template() {
    // language=HTML

    return html`
      <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
        paper-button.create-button {
          width: 100%;
        }
      </style>
      <paper-material class="item" elevation="1">
        <h4 class="horizontal flex center center-justified layout">
          <span>Active</span>
          <span class="flex"></span>
          <paper-button id="add-keypair" slot="suffix" class="fg red">
            <iron-icon icon="add" class="fg red"></iron-icon>
            Add
          </paper-button>
        </h4>
        <div>
          <backend-ai-credential-list id="active-credential-list" condition="active"></backend-ai-job-list>
        </div>
        <h4>Inactive</h4>
        <div>
          <backend-ai-credential-list id="inactive-credential-list" condition="inactive"></backend-ai-job-list>
        </div>
      </paper-material>
      <paper-dialog id="new-keypair-dialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3>Create</h3>
          <form id="login-form" onSubmit="this._addKeyPair()">
            <fieldset>
              <paper-input type="email" name="new_user_id" id="id_new_user_id" label="User ID as E-mail (optional)"
                           auto-validate></paper-input>
              <h4>Resource Policy</h4>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="cpu-resource" label="CPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ cpu_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="ram-resource" label="RAM (GB)">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ ram_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="gpu-resource" label="GPU">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ gpu_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="concurrency-limit" label="Concurrent Jobs">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ concurrency_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="rate-limit" label="Rate Limit (for 15 min.)">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="{{ rate_metric }}">
                      <paper-item label="{{item}}">{{ item }}</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <br/><br/>
              <paper-button class="blue create-button" type="submit" id="create-button">
                <iron-icon icon="vaadin:key-o"></iron-icon>
                Create credential
              </paper-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
    `;
  }
}

customElements.define(BackendAICredentialView.is, BackendAICredentialView);
