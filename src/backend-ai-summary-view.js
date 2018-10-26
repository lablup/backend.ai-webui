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
import './backend-ai-styles.js';
import './lablup-activity-panel.js';

class BackendAISummary extends PolymerElement {
  static get properties() {
    return {
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

  static get template() {
    return html`
    <style is="custom-style" include="backend-ai-styles">
    ul li {
      list-style:none;
      font-size:13px;
    }
    </style>

    <paper-material class="item" elevation="1" style="padding-bottom:20px;">
        <h3 class="paper-material-title">Statistics</h3>
        <div>
          <lablup-activity-panel title="Health" elevation="1">
          <div slot="message">
            <ul>
              <li>Create a new key pair</li>
              <li>Maintain keypairs</li>
            </ul>
          </div>
          </lablup-activity-panel>
        </div>
        <h3 class="paper-material-title">Actions</h3>
        <div>
          <lablup-activity-panel title="Keypair" elevation="1">
          <div slot="message">
            <ul>
              <li>Create a new key pair</li>
              <li>Maintain keypairs</li>
            </ul>
          </div>
        </lablup-activity-panel>
      </div>
      </paper-material>
    `;
  }
}

customElements.define('backend-ai-summary-view', BackendAISummary);
