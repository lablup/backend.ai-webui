/**
 * Backend.AI-agent-view
 */

import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-image/iron-image';
import '@polymer/iron-flex-layout/iron-flex-layout';
import 'weightless/card';

import '../backend-ai-styles.js';
import '../backend-ai-agent-list.js';

class BackendAIAgentView extends PolymerElement {
  static get properties() {
    return {
      active: {
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

  shouldUpdate() {
    return this.active;
  }

  static get observers() {
    return [
      '_routeChanged(route.*)',
      '_viewChanged(routeData.view)',
      '_menuChanged(active)'
    ]
  }
  _menuChanged(active) {
    if (!active) {
      this.$['running-agents'].active = false;
      this.$['finished-agents'].active = false;
      return;
    }
    this.$['running-agents'].active = true;
    this.$['finished-agents'].active = true;
  }

  static get template() {
    // language=HTML
    return html`
      <style is="custom-style" include="backend-ai-styles">
      </style>
      <wl-card class="item" elevation="1">
        <h3 class="wl-card-title">Registered nodes</h3>
        <h4>Connected</h4>
        <div>
          <backend-ai-agent-list id="running-agents" condition="running"></backend-ai-agent-list>
        </div>
        <h4>Terminated</h4>
        <div>
          <backend-ai-agent-list id="finished-agents" condition="finished"></backend-ai-agent-list>
        </div>
      </wl-card>
    `;
  }
}

customElements.define('backend-ai-agent-view', BackendAIAgentView);
