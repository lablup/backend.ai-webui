/**
@license
Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
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
import '@polymer/paper-toast/paper-toast';

import './backend-ai-styles.js';
import './lablup-activity-panel.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';

class BackendAISummary extends PolymerElement {
  static get properties() {
    return {
      condition: {
        type: String,
        default: 'running'  // finished, running, archived
      },
      jobs: {
          type: Object,
          value: {}
      },
      is_admin: {
        type: Boolean,
        value: false
      },
      visible: {
        type: Boolean,
        value: false
      }
    };
  }

  constructor() {
    super();
    // Resolve warning about scroll performance 
    // See https://developers.google.com/web/updates/2016/06/passive-event-listeners
    setPassiveTouchGestures(true);
  }

  ready() {
    super.ready();
    document.addEventListener('backend-ai-connected', () => {
      this.is_admin = window.backendaiclient.is_admin;
      this._refreshHealthPanel();
    }, true);
  }
  static get observers() {
    return [
      '_routeChanged(route.*)',
      '_viewChanged(routeData.view)',
      '_refreshHealthPanel(window.backendaiclient)',
      '_menuChanged(visible)'
    ]
  }
  connectedCallback() {
    super.connectedCallback();
    afterNextRender(this, function () {
    });
  }

  _refreshHealthPanel() {
    let status = 'RUNNING';
    switch (this.condition) {
        case 'running':
            status = 'RUNNING';
            break;
        case 'finished':
            status = 'TERMINATED';
            break;
        case 'archived':
        default:
            status = 'RUNNING';
    };

    let fields = ["sess_id"];
    let q = `query($status:String) {`+
    `  compute_sessions(status:$status) { ${fields.join(" ")} }`+
    '}';
    let v = {'status': status};

    window.backendaiclient.gql(q, v).then(response => {
      this.jobs = response;
      console.log(this.jobs);
    }).catch(err => {
      this.jobs = [];
      this.$.notification.text = 'Couldn\'t connect to manager.';
      this.$.notification.show();
    });
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
    if(!visible) { return; }
  }
  _countObject(obj) {
    return Object.keys(obj).length;    
  }

  static get template() {
    return html`
    <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
    ul {
      padding-left: 0;
    }
    ul li {
      list-style:none;
      font-size:13px;
    }
    </style>
    <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
    <paper-material class="item" elevation="1" style="padding-bottom:20px;">
        <h3 class="paper-material-title">Statistics</h3>
        <div class="horizontal wrap layout">
          <lablup-activity-panel title="Health" elevation="1">
            <div slot="message">
            <ul>
              <li>Connected agents: [[_countObject(jobs)]]</li>
            </ul>
            </div>
          </lablup-activity-panel>

          <lablup-activity-panel title="Loads" elevation="1">
            <div slot="message">
              DISCONNECTED
            </div>
          </lablup-activity-panel>

        </div>
        <h3 class="paper-material-title">Actions</h3>
        <div class="horizontal wrap layout">
        <template is="dom-if" if="{{is_admin}}">
          <lablup-activity-panel title="Keypair" elevation="1">
          <div slot="message">
            <ul>
              <li><a href="/credential">Create a new key pair</a></li>
              <li><a href="/credential">Maintain keypairs</a></li>
            </ul>
          </div>
        </lablup-activity-panel>
        </template>
        <template is="dom-if" if="{{!is_admin}}">
        <lablup-activity-panel title="No action" elevation="1">
        <div slot="message">
        No action on user mode yet.
        </div>
      </lablup-activity-panel>
        </template>
      </div>
      </paper-material>
    `;
  }
}

customElements.define('backend-ai-summary-view', BackendAISummary);
