/**
 */

import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings';
import '@polymer/app-layout/app-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-styles/default-theme.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-styles/color.js';
import '@polymer/paper-material/paper-material.js';


class BackendAiAdminApp extends PolymerElement {
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

  static get template() {
    return html`
    <style is="custom-style" include="paper-material-styles"> 
      app-header {
        background-color: #00897B;
        color: #fff;
      }
      paper-icon-button {
        --paper-icon-button-ink-color: white;
      }
      app-drawer-layout:not([narrow]) [drawer-toggle] {
        display: none;
      }
      :host {
        --app-drawer-width: 150px;
      }
      </style>
    <app-drawer-layout>
      <app-drawer slot="drawer">
        drawer menus
      </app-drawer>
      <app-header-layout>
        <app-header slot="header">
          <app-toolbar>
            <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
            <div main-title>Backend.AI</div>
          </app-toolbar>
        </app-header>
        <paper-material elevation="2">TEST</paper-material>
      </app-header-layout>
    </app-drawer-layout>

    `;
  }
}

customElements.define('backend-ai-admin-app', BackendAiAdminApp);
