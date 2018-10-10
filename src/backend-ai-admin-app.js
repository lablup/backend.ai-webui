/**
 */

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings';

class BackendAiAdminApp extends PolymerElement {
  static get properties () {
    return {
    };
  }

  constructor() {
    super();
    // Resolve warning about scroll performance 
    // See https://developers.google.com/web/updates/2016/06/passive-event-listeners
    setPassiveTouchGestures(true);
  }

  ready(){
    super.ready();
  }
  
  static get template () {
    return html`
      <h1>Backend.AI admin App</h1>
    `;
  }
}

customElements.define('backend-ai-admin-app', BackendAiAdminApp);
