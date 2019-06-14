/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

//import {PolymerElement, html} from '@polymer/polymer';
import {css, html, LitElement} from "lit-element";
//import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-progress/paper-progress';
//import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';
import 'weightless/dialog';

class BackendAIIndicator extends LitElement {
  static get is() {
    return 'backend-ai-indicator';
  }

  static get properties() {
    return {
      value: {
        type: Number
      },
      text: {
        type: String
      },
      dialog: {
        type: Object
      }
    };
  }

  constructor() {
    super();
    this.value = 0;
    this.text = '';
  }

  firstUpdated() {
    this.dialog = this.shadowRoot.querySelector('#app-progress-dialog');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  start() {
    this.value = 0;
    this.text = 'Initializing...';
    this.dialog.show();
  }

  set(value, text = '') {
    this.value = value;
    this.text = text;
  }

  end() {
    this.dialog.hide();
  }

  render() {
    // language=HTML
    return html`
      <wl-dialog id="app-progress-dialog" fixed backdrop blockscrolling>
        <div id="app-progress-text">${this.text}</div>
        <paper-progress id="app-progress" .value="${this.value}"></paper-progress>
      </wl-dialog>
    `;
  }
}

customElements.define(BackendAIIndicator.is, BackendAIIndicator);
