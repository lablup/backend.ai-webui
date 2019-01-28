/**
 * Backend.AI-job-view
 */

import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/paper-material/paper-material';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-image/iron-image';
import '@polymer/iron-flex-layout/iron-flex-layout';
import './backend-ai-styles.js';
import './backend-ai-agent-list.js';

class BackendAIAgentView extends PolymerElement {
  static get properties() {
    return {
      visible: {
        type: Boolean,
        value: false
      }
    };
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
  }

  ready() {
    super.ready();
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
      this.$['running-agents'].visible = false;
      this.$['finished-agents'].visible = false;
      return;
    }
    this.$['running-agents'].visible = true;
    this.$['finished-agents'].visible = true;
  }

  static get template() {
    // language=HTML
    return html`
      <style is="custom-style" include="backend-ai-styles">
      </style>
      <paper-material class="item" elevation="1">
        <h3 class="paper-material-title">Registered nodes</h3>
        <h4>Connected</h4>
        <div>
          <backend-ai-agent-list id="running-agents" condition="running"></backend-ai-agent-list>
        </div>
        <h4>Terminated</h4>
        <div>
          <backend-ai-agent-list id="finished-agents" condition="finished"></backend-ai-agent-list>
        </div>
      </paper-material>
    `;
  }
}

customElements.define('backend-ai-agent-view', BackendAIAgentView);
